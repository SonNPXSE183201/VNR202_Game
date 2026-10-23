const { randomBytes, randomInt } = require("node:crypto");

const token = () => randomBytes(24).toString("base64url");
const id = () => randomBytes(9).toString("base64url");
const fail = (message) => {
  throw new Error(message);
};
const text = (value, min = 2, max = 30) => {
  if (typeof value !== "string") fail("Nội dung không hợp lệ.");
  const clean = value
    .normalize("NFC")
    .replace(/[\u0000-\u001f\u007f\p{Cf}]/gu, "")
    .trim()
    .replace(/\s+/gu, " ");
  if (clean.length < min || clean.length > max)
    fail(`Vui lòng nhập từ ${min} đến ${max} ký tự.`);
  return clean;
};
const timeBonus = (ms) => (ms <= 5000 ? 10 : ms <= 10000 ? 7 : 4);
const newTeam = (i) => ({
  id: i,
  name: `Đội ${i + 1}`,
  correctCount: 0,
  firstCorrect: 0,
  wrongCount: 0,
  grantedMs: 0,
  penaltyMs: 0,
  deadline: null,
  eliminated: false,
  survivedMs: null,
  remainingAtEndMs: null,
  deck: [],
  lastQid: null,
  turn: null,
  feedback: null,
});
const categories = [
  { id: "context", name: "Bối cảnh sau độc lập", from: 1, to: 10 },
  { id: "tasks", name: "Nhiệm vụ cấp bách", from: 11, to: 20 },
  { id: "government", name: "Xây dựng chính quyền", from: 21, to: 30 },
  { id: "protect", name: "Bảo vệ chính quyền", from: 31, to: 40 },
  { id: "diplomacy", name: "Sách lược ngoại giao", from: 41, to: 50 },
  { id: "lessons", name: "Chuẩn bị và kinh nghiệm", from: 51, to: 60 },
];

class Game {
  constructor(
    bank,
    { now = Date.now, random = Math.random, changed = () => {} } = {},
  ) {
    this.bank = new Map(bank.map((q) => [q.id, q]));
    this.bankVersion = bank.version;
    this.now = now;
    this.random = random;
    this.changed = changed;
    this.rooms = new Map();
  }
  shuffle(list) {
    const result = [...list];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  config(input) {
    if (
      !Number.isInteger(input.teams) ||
      input.teams < 1 ||
      input.teams > 9 ||
      ![180, 210, 240, 270].includes(input.duration) ||
      ![300, 330, 360].includes(input.matchLimit) ||
      input.duration >= input.matchLimit
    )
      fail(
        "Chọn 1–9 đội, thời gian đầu 180–270 giây và giới hạn trận 300–360 giây.",
      );
    if (input.reviewed !== true)
      fail("Host cần xác nhận đã duyệt nội dung các câu được chọn.");
    if (
      !Array.isArray(input.questionIds) ||
      !input.questionIds.length ||
      input.questionIds.length > this.bank.size ||
      input.questionIds.some((n) => !Number.isInteger(n) || !this.bank.has(n))
    )
      fail("Chọn ít nhất một câu trong ngân hàng.");
    return {
      teams: input.teams,
      duration: input.duration,
      matchLimit: input.matchLimit,
      questionIds: [...new Set(input.questionIds)],
      reviewed: true,
    };
  }
  log(room, type, message, extra = {}) {
    room.logs.push({
      seq: ++room.seq,
      at: this.now(),
      type,
      message,
      ...extra,
    });
    if (room.logs.length > 2000) room.logs.shift();
  }
  save(room) {
    room.version++;
    room.updated = this.now();
    this.changed(room);
  }
  create(name, config) {
    config = this.config(config);
    let code;
    do {
      code = String(randomInt(100000, 1000000));
    } while (this.rooms.has(code));
    const session = { token: token(), role: "host" };
    const room = {
      schema: 2,
      bankVersion: this.bankVersion,
      code,
      hostName: text(name),
      config,
      created: this.now(),
      updated: this.now(),
      version: 0,
      phase: "lobby",
      startedAt: null,
      finishedAt: null,
      pausedAt: null,
      deadline: null,
      nextAt: null,
      locked: false,
      hostConnected: true,
      players: [],
      teams: Array.from({ length: config.teams }, (_, i) => newTeam(i)),
      sessions: [session],
      logs: [],
      seq: 0,
      history: [],
    };
    this.rooms.set(code, room);
    this.log(room, "room", "Host đã tạo phòng.");
    this.save(room);
    return { room, session };
  }
  room(code) {
    const r = this.rooms.get(String(code));
    if (!r) fail("Không tìm thấy phòng. Kiểm tra lại mã 6 số.");
    return r;
  }
  playerName(room, value, exceptId = null) {
    const name = text(value);
    const key = name.toLocaleLowerCase("vi");
    if (
      room.players.some(
        (p) =>
          p.id !== exceptId && text(p.name).toLocaleLowerCase("vi") === key,
      )
    )
      fail(
        "Tên này đã có trong phòng. Vui lòng chọn tên khác hoặc thêm mã sinh viên.",
      );
    return name;
  }
  join(code, name, avatar, teamId) {
    const room = this.room(code);
    if (room.locked || room.phase !== "lobby")
      fail("Phòng đã khóa. Bạn có thể xem màn chiếu và tham gia trận sau.");
    if (room.players.length >= 60) fail("Phòng đã đủ 60 người.");
    if (
      !Number.isInteger(avatar) ||
      avatar < 0 ||
      avatar > 11 ||
      !Number.isInteger(teamId) ||
      !room.teams[teamId]
    )
      fail("Chọn avatar và đội hợp lệ.");
    name = this.playerName(room, name);
    const player = {
      id: id(),
      name,
      avatar,
      teamId,
      connected: true,
      ready: false,
      turns: 0,
    };
    const session = { token: token(), role: "player", playerId: player.id };
    room.players.push(player);
    room.sessions.push(session);
    this.log(room, "join", `${name} vào ${room.teams[teamId].name}.`, {
      playerId: player.id,
      teamId,
    });
    this.save(room);
    return { room, session };
  }
  resume(code, secret) {
    const room = this.room(code),
      session = room.sessions.find((s) => s.token === secret);
    if (!session) fail("Phiên không còn hợp lệ. Vui lòng vào lại phòng.");
    return { room, session };
  }
  presence(room, session, online) {
    if (session.role === "host") {
      room.hostConnected = online;
      room.hostOfflineSince = online ? null : this.now();
    }
    const p = room.players.find((p) => p.id === session.playerId);
    if (p && p.connected !== online) {
      p.connected = online;
      this.log(
        room,
        "connection",
        `${p.name} ${online ? "đã kết nối lại" : "mất kết nối"}.`,
        { playerId: p.id, teamId: p.teamId },
      );
    }
    this.save(room);
  }
  choose(room, team, exclude) {
    let eligible = room.players.filter(
      (p) => p.teamId === team.id && p.connected,
    );
    if (eligible.length > 1)
      eligible = eligible.filter((p) => p.id !== exclude);
    if (!eligible.length) return null;
    const min = Math.min(...eligible.map((p) => p.turns));
    const p = this.shuffle(eligible.filter((p) => p.turns === min))[0];
    p.turns++;
    return p;
  }
  nextQuestion(room, team) {
    if (!team.deck.length) {
      // Mix topics throughout the queue, not difficulty labels invented by the application.
      const buckets = categories.map((c) =>
        this.shuffle(
          room.config.questionIds.filter((qid) => qid >= c.from && qid <= c.to),
        ),
      );
      team.deck = [];
      while (buckets.some((b) => b.length))
        for (const b of this.shuffle(buckets))
          if (b.length) team.deck.push(b.pop());
      if (team.deck.length > 1 && team.deck[0] === team.lastQid)
        [team.deck[0], team.deck[1]] = [team.deck[1], team.deck[0]];
    }
    team.lastQid = team.deck.shift();
    return team.lastQid;
  }
  openTurn(room, team, exclude, qid) {
    const p = this.choose(room, team, exclude);
    if (!p) {
      team.turn = null;
      team.feedback = {
        text: "Đội chưa có người kết nối.",
        kind: "error",
        at: this.now(),
      };
      return;
    }
    qid ??= this.nextQuestion(room, team);
    team.turn = {
      id: id(),
      holder: p.id,
      qid,
      options: this.shuffle([0, 1, 2, 3]).map((index) => ({ id: id(), index })),
      openedAt: this.now(),
      wrong: [],
      lockedUntil: 0,
      answered: false,
    };
    this.log(room, "turn", `${team.name}: đến lượt ${p.name}.`, {
      teamId: team.id,
      playerId: p.id,
      qid,
    });
  }
  startMatch(room) {
    const now = this.now();
    room.phase = "playing";
    room.startedAt = now;
    room.finishedAt = null;
    room.deadline = now + room.config.matchLimit * 1000;
    room.nextAt = null;
    for (const team of room.teams) {
      team.deadline = now + room.config.duration * 1000;
      team.feedback = null;
      this.openTurn(room, team);
    }
    this.log(
      room,
      "match",
      `Bắt đầu sinh tồn: ${room.config.duration}s/đội, trần trận ${room.config.matchLimit}s.`,
    );
  }
  explode(room, team, at) {
    if (team.eliminated) return;
    if (team.turn)
      room.history.push({
        teamId: team.id,
        qid: team.turn.qid,
        playerId: team.turn.holder,
        correct: false,
        unfinished: true,
        deltaMs: 0,
      });
    team.eliminated = true;
    team.survivedMs = Math.max(0, at - room.startedAt);
    team.remainingAtEndMs = 0;
    team.turn = null;
    team.feedback = {
      text: "Bom đã nổ. Đội dừng chơi và theo dõi các đội còn lại.",
      kind: "boom",
      at,
    };
    this.log(
      room,
      "boom",
      `${team.name} nổ sau ${(team.survivedMs / 1000).toFixed(1)} giây.`,
      { teamId: team.id, survivedMs: team.survivedMs },
    );
  }
  finish(room, at, reason) {
    for (const team of room.teams)
      if (!team.eliminated) {
        team.survivedMs = Math.max(0, at - room.startedAt);
        team.remainingAtEndMs = Math.max(0, team.deadline - at);
        team.turn = null;
      }
    room.phase = "finished";
    room.finishedAt = at;
    room.nextAt = null;
    this.log(room, "finish", reason);
  }
  settle(room) {
    if (room.phase !== "playing") return;
    const before = room.teams.filter((t) => t.eliminated).length;
    const at = Math.min(this.now(), room.deadline);
    for (const team of room.teams)
      if (!team.eliminated && team.deadline <= at)
        this.explode(room, team, team.deadline);
    if (room.teams.every((t) => t.eliminated))
      this.finish(
        room,
        Math.max(...room.teams.map((t) => room.startedAt + t.survivedMs)),
        "Tất cả bom đã nổ.",
      );
    else if (this.now() >= room.deadline)
      this.finish(
        room,
        room.deadline,
        "Hết giới hạn trận. Đội sống sót được so thời gian còn lại.",
      );
    if (
      room.phase === "finished" ||
      before !== room.teams.filter((t) => t.eliminated).length
    )
      this.save(room);
  }
  answer(room, session, input) {
    this.settle(room);
    if (room.phase !== "playing") fail("Trận đã hết giờ hoặc đang tạm dừng.");
    const p = room.players.find((p) => p.id === session.playerId);
    if (!p || session.role !== "player")
      fail("Chỉ người giữ bom được trả lời.");
    const team = room.teams[p.teamId],
      turn = team.turn;
    if (
      team.eliminated ||
      !turn ||
      turn.id !== input.turnId ||
      turn.holder !== p.id
    )
      fail("Bom đã nổ hoặc câu này không còn đến lượt bạn.");

    const option = turn.options.find((o) => o.id === input.option);
    if (!option || turn.wrong.includes(option.id))
      fail("Phương án không hợp lệ hoặc đã chọn sai.");
    const q = this.bank.get(turn.qid),
      correct = option.index === q.correct,
      elapsed = this.now() - turn.openedAt;
    const before = team.deadline;
    const requestedSeconds = correct ? timeBonus(elapsed) : -8;
    team.deadline = correct
      ? Math.min(
          team.deadline + requestedSeconds * 1000,
          this.now() + (room.config.duration + 60) * 1000,
        )
      : Math.max(this.now(), team.deadline - 8000);
    const deltaMs = team.deadline - before;
    if (correct) {
      team.correctCount++;
      if (!turn.wrong.length) team.firstCorrect++;
      team.grantedMs += deltaMs;
      team.feedback = {
        text: `${p.name} đúng! +${(deltaMs / 1000).toFixed(1)} giây`,
        kind: "success",
        at: this.now(),
      };
    } else {
      team.wrongCount++;
      team.penaltyMs -= deltaMs;
      team.feedback = {
        text: `${p.name} chọn sai: ${(deltaMs / 1000).toFixed(1)} giây. Chuyển người và câu mới.`,
        kind: "error",
        at: this.now(),
      };
    }
    room.history.push({
      teamId: team.id,
      qid: q.id,
      playerId: p.id,
      correct,
      elapsed,
      deltaMs,
      wrong: turn.wrong.length,
    });
    this.log(
      room,
      "answer",
      `${team.name} — ${p.name}: ${correct ? "đúng" : "sai"}, ${deltaMs >= 0 ? "+" : ""}${(deltaMs / 1000).toFixed(1)} giây.`,
      { teamId: team.id, playerId: p.id, qid: q.id, correct, elapsed, deltaMs },
    );
    if (team.deadline <= this.now()) this.explode(room, team, this.now());
    else this.openTurn(room, team, p.id);
    this.settle(room);
    this.save(room);
    return {
      correct,
      deltaSeconds: deltaMs / 1000,
      eliminated: team.eliminated,
    };
  }
  rankingValue(room, team, observedAt = this.now()) {
    const at =
      room.phase === "paused"
        ? room.pausedAt
        : room.phase === "finished"
          ? room.finishedAt
          : observedAt;
    return [
      team.survivedMs ?? Math.max(0, (at || 0) - (room.startedAt || at || 0)),
      team.eliminated
        ? 0
        : (team.remainingAtEndMs ??
          Math.max(0, (team.deadline || 0) - (at || 0))),
    ];
  }
  rank(room, observedAt = this.now()) {
    const values = room.teams.map((t) => ({
      id: t.id,
      value: this.rankingValue(room, t, observedAt),
    }));
    values.sort(
      (a, b) =>
        b.value[0] - a.value[0] || b.value[1] - a.value[1] || a.id - b.id,
    );
    let rank = 1;
    return values.map((item, i) => {
      if (
        i &&
        (item.value[0] !== values[i - 1].value[0] ||
          item.value[1] !== values[i - 1].value[1])
      )
        rank = i + 1;
      return { id: item.id, rank };
    });
  }
  command(room, session, op, data) {
    if (session.role !== "host") fail("Bạn không có quyền điều khiển phòng.");
    if (op === "config") {
      if (room.phase !== "lobby") fail("Chỉ cấu hình trước trận.");
      const config = this.config(data);
      if (room.players.some((p) => p.teamId >= config.teams))
        fail("Chuyển thành viên khỏi đội cuối trước khi giảm số đội.");
      while (room.teams.length < config.teams)
        room.teams.push(newTeam(room.teams.length));
      room.teams.length = config.teams;
      room.config = config;
    } else if (op === "lock") {
      if (room.phase !== "lobby") fail("Trận đã bắt đầu.");
      room.locked = !room.locked;
    } else if (op === "team") {
      if (
        room.phase !== "lobby" ||
        !Number.isInteger(data.teamId) ||
        !room.teams[data.teamId]
      )
        fail("Không thể đổi đội lúc này.");
      room.teams[data.teamId].name = text(data.name);
    } else if (op === "member") {
      if (room.phase !== "lobby") fail("Danh sách đã chốt.");
      const p = room.players.find((p) => p.id === data.playerId);
      if (!p || !Number.isInteger(data.teamId) || !room.teams[data.teamId])
        fail("Không tìm thấy người hoặc đội.");
      p.name = this.playerName(room, data.name, p.id);
      p.teamId = data.teamId;
      p.ready = false;
    } else if (op === "remove") {
      if (room.phase !== "lobby") fail("Chỉ xóa thành viên trước trận.");
      room.players = room.players.filter((p) => p.id !== data.playerId);
      room.sessions = room.sessions.filter((s) => s.playerId !== data.playerId);
    } else if (op === "start") {
      if (
        room.phase !== "lobby" ||
        room.players.length < room.config.teams ||
        room.teams.some(
          (t) => !room.players.some((p) => p.teamId === t.id && p.connected),
        )
      )
        fail("Mỗi đội cần ít nhất một người kết nối trước khi bắt đầu.");
      if (room.players.some((p) => !p.ready) && !data.force)
        fail(
          "Có người chưa sẵn sàng. Nhắc người chơi bấm Sẵn sàng hoặc dùng Bắt đầu ngay.",
        );
      room.locked = true;
      room.phase = "countdown";
      room.nextAt = this.now() + 2000;
    } else if (op === "pause") {
      this.settle(room);
      if (room.phase !== "playing") fail("Chỉ tạm dừng trận đang chơi.");
      room.phase = "paused";
      room.pausedAt = this.now();
    } else if (op === "resume") {
      if (room.phase !== "paused") fail("Phòng chưa tạm dừng.");
      const shift = this.now() - room.pausedAt;
      room.startedAt += shift;
      room.deadline += shift;
      for (const team of room.teams)
        if (!team.eliminated) {
          team.deadline += shift;
          if (team.turn) {
            team.turn.openedAt += shift;
            team.turn.lockedUntil += shift;
          }
        }
      room.phase = "playing";
      room.pausedAt = null;
    } else if (op === "cancel") {
      text(data.reason, 5, 200);
      if (!["playing", "paused", "finished"].includes(room.phase))
        fail("Chưa có trận để hủy.");
      room.teams = room.teams.map((t) => ({ ...newTeam(t.id), name: t.name }));
      room.players.forEach((p) => {
        p.turns = 0;
        p.ready = false;
      });
      room.history = [];
      room.phase = "lobby";
      room.locked = false;
      room.startedAt =
        room.finishedAt =
        room.deadline =
        room.pausedAt =
        room.nextAt =
          null;
      this.log(room, "cancel", `Hủy toàn trận: ${data.reason}`);
    } else if (op === "end") {
      this.settle(room);
      if (!["playing", "paused"].includes(room.phase))
        fail("Chưa có trận đang chạy để kết thúc.");
      text(data.reason, 5, 200);
      this.finish(
        room,
        room.phase === "paused" ? room.pausedAt : this.now(),
        `Host kết thúc sớm: ${data.reason}`,
      );
    } else fail("Lệnh không hợp lệ.");
    this.log(room, "host", `Host: ${op}.`);
    this.save(room);
    return { ok: true };
  }
  playerCommand(room, session, op, data) {
    const p = room.players.find((p) => p.id === session.playerId);
    if (!p) fail("Phiên người chơi không hợp lệ.");
    if (op === "ready") {
      if (room.phase !== "lobby") fail("Trận đã bắt đầu.");
      p.ready = !p.ready;
    } else if (op === "profile") {
      if (
        room.locked ||
        room.phase !== "lobby" ||
        !Number.isInteger(data.teamId) ||
        !room.teams[data.teamId] ||
        !Number.isInteger(data.avatar) ||
        data.avatar < 0 ||
        data.avatar > 11
      )
        fail("Không thể sửa hồ sơ khi phòng khóa hoặc dữ liệu không hợp lệ.");
      p.name = this.playerName(room, data.name, p.id);
      p.avatar = data.avatar;
      p.teamId = data.teamId;
      p.ready = false;
    } else if (op === "signal") {
      if (!["hidden", "visible", "blur", "fullscreen-exit"].includes(data.kind))
        fail("Tín hiệu không hợp lệ.");
      this.log(
        room,
        "signal",
        `${p.name}: client báo ${data.kind} (cần xem xét).`,
        { playerId: p.id, teamId: p.teamId, reportedByClient: true },
      );
    } else fail("Lệnh không hợp lệ.");
    this.save(room);
    return { ok: true };
  }
  tick() {
    for (const room of this.rooms.values()) {
      if (room.phase === "playing") {
        this.settle(room);
      } else if (room.phase === "countdown" && this.now() >= room.nextAt) {
        this.startMatch(room);
        this.save(room);
      }
    }
  }
  view(room, session) {
    const me = room.players.find((p) => p.id === session.playerId);
    const observedAt = this.now(),
      ranks = this.rank(room, observedAt);
    const result = {
      code: room.code,
      hostName: room.hostName,
      version: room.version,
      serverNow: observedAt,
      phase: room.phase,
      startedAt: room.startedAt,
      finishedAt: room.finishedAt,
      pausedAt: room.pausedAt,
      aliveCount: room.teams.filter((t) => !t.eliminated).length,
      deadline: room.deadline,
      nextAt: room.nextAt,
      locked: room.locked,
      hostConnected: room.hostConnected,
      config: {
        teams: room.config.teams,
        duration: room.config.duration,
        matchLimit: room.config.matchLimit,
        maxReserve: room.config.duration + 60,
        questionCount: room.config.questionIds.length,
      },
      me: me || null,
      role: session.role,
      players: room.players,
      teams: room.teams.map((t) => {
        const turn = t.turn;
        const publicTeam = {
          id: t.id,
          name: t.name,
          deadline: t.deadline,
          eliminated: t.eliminated,
          survivedMs: this.rankingValue(room, t, observedAt)[0],
          remainingMs: this.rankingValue(room, t, observedAt)[1],
          grantedMs: t.grantedMs,
          penaltyMs: t.penaltyMs,
          wrongCount: t.wrongCount,
          firstCorrect: t.firstCorrect,
          correctCount: t.correctCount,
          rank: ranks.find((r) => r.id === t.id).rank,
          holder: turn?.holder || null,
          feedback: t.feedback,
        };
        if (
          turn &&
          (session.role === "host" ||
            session.role === "observer" ||
            me?.teamId === t.id)
        ) {
          const q = this.bank.get(turn.qid);
          publicTeam.question = {
            id: turn.id,
            number: q.id,
            text: q.question,
            options: turn.options.map((o) => ({
              id: o.id,
              text: q.options[o.index],
              rejected: turn.wrong.includes(o.id),
            })),
            wrong: turn.wrong.length,
            lockedUntil: turn.lockedUntil,
            openedAt: turn.openedAt,
            answered: turn.answered,
          };
        }
        return publicTeam;
      }),
    };
    if (["host", "observer"].includes(session.role)) {
      result.logs = room.logs.slice(-150);
      result.questionIds = room.config.questionIds;
    }
    if (room.phase === "finished" && session.role !== "screen") {
      const history = room.history.filter(
        (h) =>
          ["host", "observer"].includes(session.role) ||
          h.teamId === me?.teamId,
      );
      result.review = [...new Set(history.map((h) => h.qid))].map((qid) => {
        const q = this.bank.get(qid);
        return {
          id: q.id,
          question: q.question,
          answer: q.options[q.correct],
          explain: q.explain,
        };
      });
    }
    return result;
  }
  catalog() {
    return [...this.bank.values()].map((q) => ({
      ...q,
      category: categories.find((c) => q.id >= c.from && q.id <= c.to)?.id,
    }));
  }
}
module.exports = { Game, timeBonus, categories, text };
