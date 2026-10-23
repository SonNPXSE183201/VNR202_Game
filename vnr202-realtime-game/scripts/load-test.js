// Real WebSocket clients. --speed 1 uses wall time; default 20 accelerates only the server game clock.
const { randomBytes } = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { createApp } = require("../server");
const { Peer, waitFor } = require("../test/helpers");
const bank = require("../src/questions");
const percentile = (list, p) =>
  [...list].sort((a, b) => a - b)[
    Math.min(list.length - 1, Math.floor(list.length * p))
  ] || 0;

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const at = args.indexOf(name);
  return at >= 0 ? Number(args[at + 1]) : fallback;
};
const duration = 240,
  matchLimit = 330,
  speed = option("--speed", 20);
if (!Number.isFinite(speed) || speed < 1 || speed > 100)
  throw new Error("speed must be 1..100");
async function run(count) {
  const hostKey = randomBytes(24).toString("hex");
  const app = createApp({
    hostKey,
    persist: true,
    dataDir: path.join(__dirname, "../output/load-data"),
  });
  await new Promise((resolve) => app.server.listen(0, "127.0.0.1", resolve));
  const peers = [],
    timers = new Set(),
    errors = [],
    answerTimes = [],
    received = new Set(),
    deadlines = new Map();
  let answerCount = 0,
    wrongCount = 0,
    duplicateChecks = 0;
  const epoch = Date.now();
  app.game.now = () => epoch + (Date.now() - epoch) * speed;
  const start = Date.now(),
    startMem = process.memoryUsage().heapUsed;
  const url = `ws://127.0.0.1:${app.server.address().port}/ws`;
  const host = new Peer(url);
  peers.push(host);
  try {
    const created = await host.call("create", {
      hostKey,
      name: `Host ${count} người`,
      config: {
        teams: 8,
        duration,
        matchLimit,
        questionIds: bank.map((q) => q.id),
        reviewed: true,
      },
    });
    const room = app.game.room(created.code);
    const players = await Promise.all(
      Array.from({ length: count }, async (_, i) => {
        const peer = new Peer(url);
        peers.push(peer);
        peer.identity = await peer.call("join", {
          code: created.code,
          name: `Người chơi ${i + 1}`,
          avatar: i % 12,
          teamId: i % 8,
        });
        await peer.call("ready");
        return peer;
      }),
    );
    const screen = new Peer(url);
    peers.push(screen);
    await screen.call("watch", { code: created.code });
    function observe(peer, s) {
      if (s.phase === "playing") {
        received.add(peer.identity.state.me.id);
        if (deadlines.has(1)) assert.equal(deadlines.get(1), s.deadline);
        else deadlines.set(1, s.deadline);
      }
      const team = s.teams[s.me.teamId],
        q = team.question;
      if (
        !q ||
        team.holder !== s.me.id ||
        s.phase !== "playing" ||
        peer.scheduled === q.id ||
        app.game.now() >= Math.min(team.deadline, s.deadline) - 250
      )
        return;
      peer.scheduled = q.id;
      const timer = setTimeout(
        async () => {
          timers.delete(timer);
          try {
            const current = peer.state?.teams[s.me.teamId]?.question;
            if (
              !current ||
              current.id !== q.id ||
              peer.ws.readyState !== 1 ||
              app.game.now() >= Math.min(team.deadline, s.deadline) - 100
            )
              return;
            const original = bank.find((row) => row.id === q.number),
              text = original.options[original.correct];
            const forceWrong = q.number % 4 === 0 && !q.wrong;
            const option = q.options.find(
              (o) =>
                !o.rejected && (forceWrong ? o.text !== text : o.text === text),
            );
            if (app.game.now() < current.lockedUntil) {
              peer.scheduled = null;
              return;
            }
            const before = Date.now(),
              requestId = `answer-${q.id}-${q.wrong}`;
            const response = await peer.call(
              "answer",
              { turnId: q.id, option: option.id },
              requestId,
            );
            answerTimes.push(Date.now() - before);
            if (response.correct) {
              answerCount++;
              if (duplicateChecks < 8) {
                const repeat = await peer.call(
                  "answer",
                  { turnId: q.id, option: option.id },
                  requestId,
                );
                assert.deepEqual(repeat, response);
                duplicateChecks++;
              }
            } else {
              wrongCount++;
              peer.scheduled = null;
            }
          } catch (error) {
            if (
              !/hết giờ|không còn đến lượt|Chờ hết 2 giây|Mất kết nối|Bom đã nổ/.test(
                error.message,
              )
            )
              errors.push(error.message);
            peer.scheduled = null;
          }
        },
        (400 + (s.me.avatar % 4) * 100) / speed,
      );
      timers.add(timer);
    }
    for (const peer of players) peer.onState = (s) => observe(peer, s);
    const poll = setInterval(
      () =>
        players.forEach((p) => {
          if (p.state && p.ws.readyState === 1) observe(p, p.state);
        }),
      Math.max(10, 250 / speed),
    );
    timers.add(poll);
    await host.call("start");
    await waitFor(() => host.state?.phase === "playing", 5000);
    await assert.rejects(players[1].call("config", { duration: 99 }));
    await assert.rejects(screen.call("export"));
    const invalid = players.find(
      (p) =>
        p.state && p.state.teams[p.state.me.teamId].holder !== p.state.me.id,
    );
    if (invalid) {
      const q = invalid.state.teams[invalid.state.me.teamId].question;
      await assert.rejects(
        invalid.call("answer", { turnId: q.id, option: q.options[0].id }),
      );
    }
    const old = players[count - 1];
    old.close();
    await new Promise((resolve) => setTimeout(resolve, 200));
    const restored = new Peer(url);
    peers.push(restored);
    restored.identity = old.identity;
    const result = await restored.call("resume", {
      code: created.code,
      token: old.identity.token,
    });
    assert.equal(result.state.me.id, old.identity.state.me.id);
    restored.onState = (s) => observe(restored, s);
    players[count - 1] = restored;
    await waitFor(
      () => host.state?.phase === "finished",
      (matchLimit * 1000) / speed + 15000,
    );
    assert.equal(received.size, count);
    assert.equal(deadlines.size, 1);
    const totals = room.teams.map((team) => ({
      team: team.id + 1,
      deadline: team.deadline,
      computed:
        room.startedAt +
        duration * 1000 +
        room.history
          .filter((h) => h.teamId === team.id)
          .reduce((sum, h) => sum + (h.deltaMs || 0), 0),
      survivedMs: team.survivedMs,
      reserveMs: team.remainingAtEndMs,
      eliminated: team.eliminated,
    }));
    totals.forEach((row) => assert.equal(row.deadline, row.computed));
    assert.ok(answerCount >= 40);
    assert.equal(errors.length, 0);
    const allTimes = peers.flatMap((p) => p.latencies);
    const distribution = room.teams.map((t) =>
      room.players.filter((p) => p.teamId === t.id).map((p) => p.turns),
    );
    const resultReport = {
      players: count,
      teams: 8,
      initialSeconds: duration,
      matchLimitSeconds: matchLimit,
      clockSpeed: speed,
      elapsedMs: Date.now() - start,
      connectedPlayersReceivingLiveState: received.size,
      correctAnswers: answerCount,
      wrongAnswers: wrongCount,
      duplicateChecks,
      reconnect: "PASS",
      authorization: "PASS",
      fixedMatchLimit: "PASS",
      timeReconciliation: "PASS",
      requestRttMs: {
        p50: percentile(allTimes, 0.5),
        p95: percentile(allTimes, 0.95),
        max: Math.max(...allTimes),
      },
      answerRttMs: {
        p95: percentile(answerTimes, 0.95),
        max: Math.max(...answerTimes),
      },
      heapDeltaMB:
        Math.round(
          ((process.memoryUsage().heapUsed - startMem) / 1048576) * 10,
        ) / 10,
      errors,
      totals,
      turnsByTeam: distribution,
      scope: `Local simulated WebSocket clients; server game clock ${speed}x. Includes snapshot writes, not physical phones or classroom Wi-Fi.`,
    };
    console.log(JSON.stringify(resultReport));
    return resultReport;
  } finally {
    for (const timer of timers) {
      clearTimeout(timer);
      clearInterval(timer);
    }
    peers.forEach((p) => p.close());
    await app.close();
  }
}
(async () => {
  const reports = [];
  const players = option("--players", 0);
  for (const count of players ? [players] : [25, 50])
    reports.push(await run(count));
  fs.mkdirSync(path.join(__dirname, "../output"), { recursive: true });
  const filename = players
    ? `survival-load-${players}-speed${speed}.json`
    : "survival-load-results.json";
  fs.writeFileSync(
    path.join(__dirname, "../output", filename),
    JSON.stringify({ testedAt: new Date().toISOString(), reports }, null, 2),
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
