const { test } = require("node:test");
const assert = require("node:assert/strict");
const { randomBytes } = require("node:crypto");
const { WebSocket } = require("ws");
const { createApp } = require("../server");
const { Peer, waitFor } = require("./helpers");
const bank = require("../../questions");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const config = {
  teams: 8,
  duration: 240,
  matchLimit: 330,
  questionIds: bank.map((q) => q.id),
  reviewed: true,
};

test("HTTP serves only public assets and rejects cross-origin WebSockets", async (t) => {
  const app = createApp({
    hostKey: randomBytes(24).toString("hex"),
    persist: false,
  });
  await new Promise((resolve) => app.server.listen(0, "127.0.0.1", resolve));
  t.after(() => app.close());
  const base = `http://127.0.0.1:${app.server.address().port}`;
  for (const url of [
    "/",
    "/app.js",
    "/style.css",
    "/avatars.js",
    "/favicon.svg",
    "/api/network",
    "/api/health",
    "/api/qr?value=http%3A%2F%2Flocalhost%2F",
  ])
    assert.equal((await fetch(base + url)).status, 200);
  for (const url of [
    "/questions.js",
    "/../questions.js",
    "/.env",
    "/data/123456.json",
  ])
    assert.equal((await fetch(base + url)).status, 404);
  assert.equal((await fetch(base, { method: "POST" })).status, 405);
  assert.equal(
    (await fetch(base + "/api/qr?value=javascript:alert(1)")).status,
    400,
  );
  const response = await fetch(base);
  assert.ok(
    response.headers
      .get("content-security-policy")
      .includes("frame-ancestors 'none'"),
  );
  await new Promise((resolve) => {
    const ws = new WebSocket(base.replace("http", "ws") + "/ws", {
      origin: "https://evil.example",
    });
    ws.on("error", (error) => {
      assert.match(error.message, /403/);
      resolve();
    });
  });
});

test("real sockets: permissions, idempotency, reconnect, privacy, observer and configuration", async (t) => {
  const hostKey = randomBytes(24).toString("hex");
  const app = createApp({ hostKey, persist: false });
  await new Promise((resolve) => app.server.listen(0, "127.0.0.1", resolve));
  t.after(() => app.close());
  const url = `ws://127.0.0.1:${app.server.address().port}/ws`,
    host = new Peer(url);
  const peers = [host];
  t.after(() => peers.forEach((p) => p.close()));
  await assert.rejects(host.call("catalog", { hostKey: "incorrect" }));
  const catalog = await host.call("catalog", { hostKey });
  assert.equal(catalog.questions.length, 60);
  const created = await host.call("create", {
    hostKey,
    name: "Host kiểm thử",
    config,
  });
  const players = await Promise.all(
    Array.from({ length: 8 }, async (_, i) => {
      const peer = new Peer(url);
      peers.push(peer);
      const joined = await peer.call("join", {
        code: created.code,
        name: `Người ${i}`,
        avatar: i,
        teamId: i,
      });
      peer.identity = joined;
      await peer.call("ready");
      return peer;
    }),
  );
  const screen = new Peer(url);
  peers.push(screen);
  await screen.call("watch", { code: created.code });
  await assert.rejects(players[0].call("start", { force: true }));
  await assert.rejects(screen.call("export"));
  await host.call("config", { ...config, questionIds: [1, 2, 3, 4] });
  await host.call("start");
  await waitFor(() => host.state?.phase === "playing", 5000);
  await waitFor(() => players[0].state?.teams[0].question);
  const first = players[0],
    q = first.state.teams[0].question;
  assert.equal(first.state.teams[1].question, undefined);
  assert.equal(screen.state.logs, undefined);
  assert.equal(screen.state.teams[0].question, undefined);
  assert.ok([1, 2, 3, 4].includes(q.number));
  const correctText = bank.find((row) => row.id === q.number);
  const option = q.options.find(
    (o) => o.text === correctText.options[correctText.correct],
  );
  const result = await first.call(
    "answer",
    { turnId: q.id, option: option.id },
    "same-answer",
  );
  const duplicate = await first.call(
    "answer",
    { turnId: q.id, option: option.id },
    "same-answer",
  );
  assert.deepEqual(result, duplicate);
  const expectedDeadline = app.game.room(created.code).teams[0].deadline;
  assert.equal(result.deltaSeconds, 10);
  first.close();
  await waitFor(() => !app.game.room(created.code).players[0].connected);
  const restored = new Peer(url);
  peers.push(restored);
  const session = await restored.call("resume", {
    code: created.code,
    token: first.identity.token,
  });
  assert.equal(session.state.me.id, first.identity.state.me.id);
  assert.equal(session.state.teams[0].deadline, expectedDeadline);
  const observerKey = await host.call("observer");
  const observer = new Peer(url);
  peers.push(observer);
  const obs = await observer.call("resume", observerKey);
  assert.equal(obs.role, "observer");
  await assert.rejects(observer.call("pause"));
  assert.ok((await observer.call("export")).logs.length > 0);
  await restored.call("signal", { kind: "hidden" });
  await assert.rejects(restored.call("config", config));
  await host.call("pause");
  await host.call("resume");
  assert.equal(app.game.room(created.code).phase, "playing");
  await host.call("cancel", { reason: "Hoàn tác thử nghiệm tích hợp" });
  assert.equal(app.game.room(created.code).phase, "lobby");
});

test("snapshots recover players and cancel active survival match safely on restart", async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "vnr-game-"));
  const hostKey = randomBytes(24).toString("hex");
  let app = createApp({ hostKey, dataDir: dir });
  await new Promise((resolve) => app.server.listen(0, "127.0.0.1", resolve));
  const result = app.game.create("Host lưu trữ", config);
  for (let i = 0; i < 8; i++) app.game.join(result.room.code, `Bạn ${i}`, i, i);
  app.game.command(result.room, result.session, "start", { force: true });
  app.game.startMatch(result.room);
  app.game.save(result.room);
  await app.close();
  app = createApp({ hostKey, dataDir: dir });
  await new Promise((resolve) => app.server.listen(0, "127.0.0.1", resolve));
  t.after(async () => {
    await app.close();
    for (const file of fs.readdirSync(dir)) fs.unlinkSync(path.join(dir, file));
    fs.rmdirSync(dir);
  });
  const recovered = app.game.room(result.room.code);
  assert.equal(recovered.phase, "lobby");
  assert.equal(recovered.startedAt, null);
  assert.equal(recovered.players.length, 8);
  assert.ok(recovered.players.every((p) => !p.connected));
  assert.equal(
    app.game.resume(recovered.code, result.session.token).session.role,
    "host",
  );
});
