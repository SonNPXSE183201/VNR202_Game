const { test } = require("node:test");
const assert = require("node:assert/strict");
const { Game } = require("../src/game");
const bank = require("../src/questions");
function setup() {
  let now = 1000;
  const game = new Game(bank, { now: () => now });
  const h = game.create("Host", {
    teams: 8,
    duration: 240,
    matchLimit: 330,
    reviewed: true,
    questionIds: bank.map((q) => q.id),
  });
  const ps = Array.from({ length: 50 }, (_, i) =>
    game.join(h.room.code, `Bạn ${i}`, i % 12, i % 8),
  );
  game.startMatch(h.room);
  return {
    game,
    h,
    ps,
    advance(ms) {
      now += ms;
      game.tick();
    },
    holder(t = 0) {
      return ps.find((p) => p.session.playerId === h.room.teams[t].turn.holder)
        .session;
    },
    answer(t = 0, correct = true) {
      const turn = h.room.teams[t].turn,
        q = game.bank.get(turn.qid);
      return game.answer(h.room, this.holder(t), {
        turnId: turn.id,
        option: turn.options.find((o) => (o.index === q.correct) === correct)
          .id,
      });
    },
  };
}
test("idle teams lose real time and timeout every 15 seconds", () => {
  const f = setup(),
    t = f.h.room.teams[0],
    old = t.turn.id;
  f.advance(15000);
  assert.equal(t.wrongCount, 1);
  assert.equal(t.streak, 0);
  assert.notEqual(t.turn.id, old);
  assert.equal(t.deadline - f.game.now(), 217000);
  f.advance(30000);
  assert.equal(t.wrongCount, 3);
});
test("50/50 keeps one correct and one wrong, enforces holder and once per turn/team", () => {
  const f = setup(),
    t = f.h.room.teams[0];
  assert.throws(() =>
    f.game.power(
      f.h.room,
      f.ps.find((p) => p.session.playerId !== t.turn.holder).session,
      { kind: "fifty", turnId: t.turn.id },
    ),
  );
  f.game.power(f.h.room, f.holder(), { kind: "fifty", turnId: t.turn.id });
  const q = f.game.view(f.h.room, f.holder()).teams[0].question;
  assert.equal(q.options.filter((o) => !o.rejected).length, 2);
  assert.throws(() =>
    f.game.power(f.h.room, f.holder(), { kind: "star", turnId: t.turn.id }),
  );
  const hidden = t.turn.options.find((o) => t.turn.hidden.includes(o.id));
  assert.throws(() =>
    f.game.answer(f.h.room, f.holder(), {
      turnId: t.turn.id,
      option: hidden.id,
    }),
  );
  f.answer();
  assert.throws(() =>
    f.game.power(f.h.room, f.holder(), { kind: "fifty", turnId: t.turn.id }),
  );
});
test("star adds 15 on correct only and respects reserve cap", () => {
  const f = setup(),
    t = f.h.room.teams[0];
  f.game.power(f.h.room, f.holder(), { kind: "star", turnId: t.turn.id });
  assert.equal(f.answer().deltaSeconds, 25);
  const g = setup(),
    u = g.h.room.teams[0];
  g.game.power(g.h.room, g.holder(), { kind: "star", turnId: u.turn.id });
  assert.equal(g.answer(0, false).deltaSeconds, -8);
  assert.equal(u.powers.star, true);
});
test("three consecutive correct unlock transfer: half capped at20, once, no self, atomic", () => {
  const f = setup(),
    a = f.h.room.teams[0],
    b = f.h.room.teams[1];
  assert.throws(() =>
    f.game.power(f.h.room, f.holder(), {
      kind: "transfer",
      turnId: a.turn.id,
      targetId: 1,
    }),
  );
  f.answer();
  f.answer();
  f.answer();
  assert.equal(a.transferUnlocked, true);
  assert.throws(() =>
    f.game.power(f.h.room, f.holder(), {
      kind: "transfer",
      turnId: a.turn.id,
      targetId: 0,
    }),
  );
  a.deadline = f.game.now() + 100000;
  b.deadline = f.game.now() + 30000;
  f.game.power(f.h.room, f.holder(), {
    kind: "transfer",
    turnId: a.turn.id,
    targetId: 1,
  });
  assert.equal(a.deadline - f.game.now(), 115000);
  assert.equal(b.deadline - f.game.now(), 15000);
  assert.equal(a.powers.transfer, true);
  f.answer();
  assert.throws(() =>
    f.game.power(f.h.room, f.holder(), {
      kind: "transfer",
      turnId: a.turn.id,
      targetId: 1,
    }),
  );
});
test("pause freezes question deadline and forbids powers; wrong resets streak", () => {
  const f = setup(),
    t = f.h.room.teams[0];
  f.answer();
  assert.equal(t.streak, 1);
  f.answer(0, false);
  assert.equal(t.streak, 0);
  const end = t.turn.deadline;
  f.game.command(f.h.room, f.h.session, "pause", {});
  f.advance(60000);
  assert.throws(() =>
    f.game.power(f.h.room, f.holder(), { kind: "star", turnId: t.turn.id }),
  );
  f.game.command(f.h.room, f.h.session, "resume", {});
  assert.equal(t.turn.deadline, end + 60000);
});

test("transfer cap, receiver reserve limit and two teams targeting same opponent conserve time", () => {
  const f = setup(),
    r = f.h.room,
    a = r.teams[0],
    b = r.teams[1],
    c = r.teams[2];
  a.transferUnlocked = true;
  c.transferUnlocked = true;
  a.deadline = f.game.now() + 295000;
  b.deadline = f.game.now() + 100000;
  const total = a.deadline + b.deadline;
  f.game.power(r, f.holder(0), {
    kind: "transfer",
    turnId: a.turn.id,
    targetId: 1,
  });
  assert.equal(a.deadline - f.game.now(), 300000);
  assert.equal(b.deadline - f.game.now(), 95000);
  assert.equal(a.deadline + b.deadline, total);
  c.deadline = f.game.now() + 100000;
  f.game.power(r, f.holder(2), {
    kind: "transfer",
    turnId: c.turn.id,
    targetId: 1,
  });
  assert.equal(b.deadline - f.game.now(), 75000);
  assert.equal(c.deadline - f.game.now(), 120000);
});

test("star timeout consumes power, resets streak and cannot be retried; cancel resets all powers", () => {
  const f = setup(),
    t = f.h.room.teams[0];
  f.game.power(f.h.room, f.holder(), { kind: "star", turnId: t.turn.id });
  f.advance(15000);
  assert.equal(t.powers.star, true);
  assert.equal(t.wrongCount, 1);
  assert.equal(t.grantedMs, 0);
  f.game.command(f.h.room, f.h.session, "cancel", {
    reason: "Kiểm tra đặt lại quyền",
  });
  assert.deepEqual(f.h.room.teams[0].powers, {
    fifty: false,
    star: false,
    transfer: false,
  });
});

test("WebSocket powers retain idempotency, room scope and reconnect state", async (t) => {
  const { createApp } = require("../server"),
    { Peer, waitFor } = require("./helpers");
  const app = createApp({
    hostKey: "isolated-power-integration",
    persist: false,
  });
  await new Promise((resolve) => app.server.listen(0, "127.0.0.1", resolve));
  t.after(() => app.close());
  const url = `ws://127.0.0.1:${app.server.address().port}/ws`,
    host = new Peer(url),
    p = new Peer(url),
    viewer = new Peer(url);
  t.after(() => [host, p, viewer].forEach((p) => p.close()));
  const created = await host.call("create", {
    hostKey: "isolated-power-integration",
    name: "Host",
    config: {
      teams: 1,
      duration: 240,
      matchLimit: 330,
      reviewed: true,
      questionIds: [1, 2, 3],
    },
  });
  const joined = await p.call("join", {
    code: created.code,
    name: "Người dùng",
    avatar: 0,
    teamId: 0,
  });
  await viewer.call("watch", { code: created.code });
  await p.call("ready");
  await host.call("start");
  await waitFor(() => p.state?.phase === "playing", 5000);
  const turn = p.state.teams[0].question.id;
  const first = await p.call(
    "power",
    { kind: "star", turnId: turn },
    "repeat-star",
  );
  assert.deepEqual(
    await p.call("power", { kind: "star", turnId: turn }, "repeat-star"),
    first,
  );
  await assert.rejects(viewer.call("power", { kind: "fifty", turnId: turn }));
  await assert.rejects(host.call("power", { kind: "fifty", turnId: turn }));
  await assert.rejects(p.call("power", { kind: "fifty", turnId: turn }));
  const restored = new Peer(url);
  t.after(() => restored.close());
  const result = await restored.call("resume", {
    code: created.code,
    token: joined.token,
  });
  assert.equal(result.state.teams[0].powers.star, true);
  assert.equal(result.state.teams[0].question.power, "star");
  await host.call("pause");
  await assert.rejects(restored.call("power", { kind: "fifty", turnId: turn }));
});
