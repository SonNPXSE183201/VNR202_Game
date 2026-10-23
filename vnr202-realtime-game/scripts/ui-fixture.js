// LOCAL QA ONLY. Isolated memory server bound to loopback; never used by npm start.
const { createApp } = require("../server");
const { Peer } = require("../test/helpers");
const bank = require("../../questions");
const app = createApp({
  hostKey: "local-browser-fixture-only",
  persist: false,
});
const filled = new Set(),
  bots = [];
app.server.listen(3101, "127.0.0.1", () =>
  console.log(
    "Isolated UI fixture: http://127.0.0.1:3101 — QA key: local-browser-fixture-only",
  ),
);
const timer = setInterval(async () => {
  for (const room of app.game.rooms.values()) {
    if (filled.has(room.code)) continue;
    filled.add(room.code);
    const names = [
      "Minh Anh",
      "Hoàng Nam",
      "Ngọc Hà",
      "Đức Huy",
      "Thanh Trúc",
      "Gia Bảo",
      "Phương Linh",
      "Quốc Việt",
      "Khánh An",
      "Tuấn Kiệt",
      "Bảo Ngọc",
      "Hải Đăng",
      "Thu Thảo",
      "Nhật Minh",
      "Quỳnh Anh",
      "Thiên Phúc",
      "Hồng Nhung",
      "Văn Khang",
      "Yến Nhi",
      "Đình Phong",
      "Mai Chi",
      "Trọng Tín",
      "Hà My",
      "Duy Khánh",
      "Kim Ngân",
      "Đức Anh",
      "Thanh Vy",
      "Hữu Phước",
      "Ngọc Hân",
      "Anh Tú",
      "Thảo Nguyên",
    ];
    for (let i = 0; i < 31; i++) {
      const peer = new Peer("ws://127.0.0.1:3101/ws");
      bots.push(peer);
      const result = await peer.call("join", {
        code: room.code,
        name: names[i],
        avatar: i % 12,
        teamId: i % room.config.teams,
      });
      peer.identity = result;
      await peer.call("ready");
      peer.onState = (state) => {
        const team = state.teams[state.me.teamId],
          q = team.question;
        if (state.phase === "paused") {
          peer.scheduled = null;
          return;
        }
        if (
          state.phase !== "playing" ||
          !q ||
          team.holder !== state.me.id ||
          peer.scheduled === q.id
        )
          return;
        peer.scheduled = q.id;
        setTimeout(() => {
          if (
            peer.state?.phase !== "playing" ||
            peer.state.teams[state.me.teamId].question?.id !== q.id
          )
            return;
          const original = bank.find((row) => row.id === q.number),
            correct = original.options[original.correct];
          const option = q.options.find((o) => o.text === correct);
          peer
            .call("answer", { turnId: q.id, option: option.id })
            .catch(() => {});
        }, 2500);
      };
    }
  }
}, 250);
for (const sig of ["SIGINT", "SIGTERM"])
  process.once(sig, async () => {
    clearInterval(timer);
    bots.forEach((p) => p.close());
    await app.close();
    process.exit(0);
  });
