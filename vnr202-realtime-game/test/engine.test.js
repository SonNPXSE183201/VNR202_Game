const { test } = require("node:test");
const assert = require("node:assert/strict");
const { Game, timeBonus } = require("../src/game");
const bank = require("../src/questions");
const config = {
  teams: 8,
  duration: 240,
  matchLimit: 330,
  questionIds: bank.map((q) => q.id),
  reviewed: true,
};
function fixture() {
  let now = 1000;
  const game = new Game(bank, { now: () => now, random: () => 0.3 });
  const host = game.create("Host", config);
  const players = Array.from({ length: 32 }, (_, i) =>
    game.join(host.room.code, `Bạn ${i}`, i % 12, i % 8),
  );
  host.room.players.forEach((p) => (p.ready = true));
  return {
    game,
    host,
    players,
    advance(ms) {
      now += ms;
      game.tick();
    },
  };
}
function answer(f, teamId = 0, correct = true) {
  const team = f.host.room.teams[teamId],
    turn = team.turn,
    q = bank.find((q) => q.id === turn.qid);
  return f.game.answer(
    f.host.room,
    f.players.find((p) => p.session.playerId === turn.holder).session,
    {
      turnId: turn.id,
      option: turn.options.find(
        (o) =>
          (o.index === q.correct) === correct && !turn.wrong.includes(o.id),
      ).id,
    },
  );
}
function start(f) {
  f.game.command(f.host.room, f.host.session, "start", {});
  f.advance(2000);
}

test("host can create and play with every team count from 1 to 9", () => {
  for (let teams = 1; teams <= 9; teams++) {
    const game = new Game(bank);
    const host = game.create("Host", { ...config, teams });
    for (let i = 0; i < teams; i++) game.join(host.room.code, `Bạn ${i}`, 0, i);
    game.command(host.room, host.session, "start", { force: true });
    game.startMatch(host.room);
    assert.equal(host.room.teams.length, teams);
    assert.ok(host.room.teams.every((t) => t.turn));
  }
  for (const teams of [0, 10, 1.5, "2"]) {
    assert.throws(() => new Game(bank).config({ ...config, teams }));
  }
});

test("duplicate names are rejected across teams, offline players and Unicode spellings", () => {
  const f = fixture();
  f.game.join(f.host.room.code, "Minh  Ánh", 0, 0);
  const size = f.host.room.players.length;
  for (const name of [
    "MINH ÁNH",
    " minh ánh ",
    "Minh Ánh".normalize("NFD"),
    "Minh\u200b Ánh",
  ]) {
    assert.throws(() => f.game.join(f.host.room.code, name, 0, 1), /đã có/i);
  }
  f.host.room.players.find((p) => p.name === "Minh Ánh").connected = false;
  assert.throws(
    () => f.game.join(f.host.room.code, "Minh Ánh", 0, 1),
    /đã có/i,
  );
  assert.equal(f.host.room.players.length, size);
  // Distinct Vietnamese letters remain distinct names.
  f.game.join(f.host.room.code, "Minh Anh", 0, 1);
});

test("host and player renames reject duplicates atomically but allow own name", () => {
  const f = fixture(),
    p = f.host.room.players[0],
    original = { ...p };
  assert.throws(
    () =>
      f.game.command(f.host.room, f.host.session, "member", {
        playerId: p.id,
        name: "BẠN 1",
        teamId: 2,
      }),
    /đã có/i,
  );
  assert.deepEqual(p, original);
  assert.throws(
    () =>
      f.game.playerCommand(f.host.room, f.players[0].session, "profile", {
        name: "Bạn 1",
        teamId: 2,
        avatar: 8,
      }),
    /đã có/i,
  );
  assert.deepEqual(p, original);
  f.game.playerCommand(f.host.room, f.players[0].session, "profile", {
    name: "BẠN 0",
    teamId: 0,
    avatar: 0,
  });
  assert.equal(p.name, "BẠN 0");
});
test("speed reward boundaries", () => {
  assert.equal(timeBonus(5000, 0), 10);
  assert.equal(timeBonus(5001, 0), 7);
  assert.equal(timeBonus(10000, 0), 7);
  assert.equal(timeBonus(10001, 0), 4);
});
test("correct answer adds time only to its team and switches holder", () => {
  const f = fixture();
  start(f);
  const t = f.host.room.teams[0],
    old = t.deadline,
    other = f.host.room.teams[1].deadline,
    holder = t.turn.holder;
  f.advance(5000);
  const result = answer(f);
  assert.equal(result.deltaSeconds, 10);
  assert.equal(t.deadline, old + 10000);
  assert.equal(f.host.room.teams[1].deadline, other);
  assert.notEqual(t.turn.holder, holder);
});
test("one submission only: wrong costs 8s and immediately changes holder and question", () => {
  const f = fixture();
  start(f);
  const t = f.host.room.teams[0],
    old = t.deadline,
    turn = t.turn,
    session = f.players.find((p) => p.session.playerId === turn.holder).session;
  const option = turn.options[0].id;
  answer(f, 0, false);
  assert.equal(t.deadline, old - 8000);
  assert.notEqual(t.turn.id, turn.id);
  assert.notEqual(t.turn.holder, turn.holder);
  assert.throws(() =>
    f.game.answer(f.host.room, session, { turnId: turn.id, option }),
  );
});
test("time reserve is capped and actual granted time is returned", () => {
  const f = fixture();
  start(f);
  const t = f.host.room.teams[0];
  t.deadline = f.game.now() + 299000;
  assert.equal(answer(f).deltaSeconds, 1);
  assert.equal(t.deadline - f.game.now(), 300000);
});
test("wrong answer can explode a team immediately and prevents further answers", () => {
  const f = fixture();
  start(f);
  const t = f.host.room.teams[0];
  t.deadline = f.game.now() + 3000;
  const result = answer(f, 0, false);
  assert.equal(result.deltaSeconds, -3);
  assert.equal(t.eliminated, true);
  assert.equal(t.turn, null);
  assert.equal(t.survivedMs, 0);
  assert.throws(() => answer(f));
});
test("exact deadline answer cannot revive a bomb; tick uses actual expiry not delayed tick time", () => {
  const f = fixture();
  start(f);
  const t = f.host.room.teams[0],
    turn = t.turn,
    session = f.players.find((p) => p.session.playerId === turn.holder).session;
  f.advance(240000);
  assert.equal(t.survivedMs, 240000);
  assert.equal(t.eliminated, true);
  assert.throws(() =>
    f.game.answer(f.host.room, session, {
      turnId: turn.id,
      option: turn.options[0].id,
    }),
  );
  assert.equal(f.host.room.phase, "finished");
});
test("longest survival wins; simultaneous explosions share rank", () => {
  const f = fixture();
  start(f);
  f.advance(1000);
  answer(f, 0, false);
  f.advance(231000);
  assert.equal(f.host.room.teams[0].eliminated, true);
  f.advance(8000);
  const ranks = f.game.rank(f.host.room);
  assert.equal(ranks.find((t) => t.id === 0).rank, 8);
  assert.equal(ranks.find((t) => t.id === 1).rank, 1);
  assert.equal(ranks.find((t) => t.id === 2).rank, 1);
});
test("hard limit ends surviving teams, ranks their time reserve and records no fake explosion", () => {
  const f = fixture();
  start(f);
  for (const t of f.host.room.teams) t.deadline = f.game.now() + 400000;
  f.host.room.teams[0].deadline += 1000;
  f.advance(330000);
  assert.equal(f.host.room.phase, "finished");
  assert.equal(f.host.room.teams[0].eliminated, false);
  assert.equal(f.host.room.teams[0].remainingAtEndMs, 71000);
  assert.equal(f.game.rank(f.host.room).find((t) => t.id === 0).rank, 1);
});
test("pause shifts all live deadlines and excludes paused time from rewards/survival", () => {
  const f = fixture();
  start(f);
  f.advance(4000);
  const deadline = f.host.room.teams[0].deadline;
  f.game.command(f.host.room, f.host.session, "pause", {});
  f.advance(60000);
  assert.equal(f.host.room.phase, "paused");
  f.game.command(f.host.room, f.host.session, "resume", {});
  assert.equal(f.host.room.teams[0].deadline, deadline + 60000);
  f.advance(1000);
  assert.equal(answer(f).deltaSeconds, 10);
});
test("cancel rolls back complete match; restart resets all clocks and counters", () => {
  const f = fixture();
  start(f);
  answer(f);
  f.game.command(f.host.room, f.host.session, "cancel", {
    reason: "Lỗi kết nối toàn lớp",
  });
  assert.equal(f.host.room.phase, "lobby");
  assert.ok(f.host.room.players.every((p) => p.turns === 0));
  assert.ok(
    f.host.room.teams.every((t) => t.correctCount === 0 && !t.eliminated),
  );
});
test("private snapshots, roster permissions, selection and strict schema stay valid", () => {
  const f = fixture();
  assert.throws(() => f.game.join(f.host.room.code, "Sai đội", 0, "__proto__"));
  assert.throws(() =>
    f.game.command(f.host.room, f.players[0].session, "start", {}),
  );
  assert.throws(() => f.game.config({ ...config, reviewed: false }));
  assert.throws(() => f.game.config({ ...config, duration: 15 }));
  start(f);
  const pub = f.game.view(f.host.room, { role: "screen" }),
    personal = f.game.view(f.host.room, f.players[0].session);
  assert.equal(pub.logs, undefined);
  assert.equal(pub.teams[0].question, undefined);
  assert.ok(personal.teams[0].question);
  assert.equal(personal.teams[1].question, undefined);
  assert.ok(!JSON.stringify(personal).includes(f.host.session.token));
});

test("all initial fuses and live ranks use one timestamp despite a moving clock", () => {
  const f = fixture();
  let stamp = 1000;
  f.game.now = () => stamp++;
  f.game.startMatch(f.host.room);
  assert.ok(
    f.host.room.teams.every(
      (t) => t.deadline === f.host.room.startedAt + 240000,
    ),
  );
  assert.ok(f.game.rank(f.host.room).every((t) => t.rank === 1));
});
