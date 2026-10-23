const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { randomBytes, createHash, timingSafeEqual } = require("node:crypto");
const { WebSocketServer, WebSocket } = require("ws");
const QRCode = require("qrcode");
const { Game, categories } = require("./src/game");
const bank = require("../questions");

function createApp({
  hostKey = process.env.HOST_KEY,
  dataDir = path.join(__dirname, "data"),
  publicOrigin = process.env.PUBLIC_ORIGIN,
  persist = true,
} = {}) {
  if (!hostKey || hostKey.length < 16 || hostKey.includes("replace-with"))
    throw new Error(
      "Chạy npm run setup rồi cấu hình HOST_KEY trong .env (ít nhất 16 ký tự).",
    );
  const pending = new Set(),
    peers = new Set(),
    connections = new Map(),
    recentCreates = new Map();
  let storageFailed = false;
  const game = new Game(bank, { changed: (room) => pending.add(room.code) });
  const digest = (s) =>
    createHash("sha256")
      .update(String(s || ""))
      .digest();
  const checkKey = (key) => timingSafeEqual(digest(key), digest(hostKey));
  if (persist) {
    fs.mkdirSync(dataDir, { recursive: true, mode: 0o700 });
    for (const filename of fs
      .readdirSync(dataDir)
      .filter((f) => /^\d{6}\.json$/.test(f))) {
      try {
        const room = JSON.parse(
          fs.readFileSync(path.join(dataDir, filename), "utf8"),
        );
        if (Date.now() - room.created > 7 * 86400000) {
          fs.unlinkSync(path.join(dataDir, filename));
          continue;
        }
        if (
          !room.code ||
          !room.config ||
          !Array.isArray(room.sessions) ||
          room.schema !== 2
        )
          continue;
        room.players.forEach((p) => (p.connected = false));
        room.hostConnected = false;
        if (["playing", "paused", "countdown"].includes(room.phase)) {
          game.command(room, { role: "host" }, "cancel", {
            reason:
              "Khởi động lại máy chủ: hủy trận dở để không sai thời gian.",
          });
          game.log(
            room,
            "recovery",
            "Trận sinh tồn dở đã hủy, host kiểm tra và bắt đầu lại từ phòng chờ.",
          );
        }
        game.rooms.set(room.code, room);
      } catch {
        console.error(
          `Không thể khôi phục snapshot ${filename}. Giữ file để kiểm tra, không tạo kết quả giả.`,
        );
      }
    }
  }
  const assets = {
    "/": ["public/index.html", "text/html; charset=utf-8"],
    "/app.js": ["public/app.js", "text/javascript; charset=utf-8"],
    "/style.css": ["public/style.css", "text/css; charset=utf-8"],
    "/avatars.js": ["public/avatars.js", "text/javascript; charset=utf-8"],
    "/favicon.svg": ["public/favicon.svg", "image/svg+xml"],
  };
  const server = http.createServer(async (req, res) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()",
    );
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
    );
    let url;
    try {
      url = new URL(req.url, "http://localhost");
    } catch {
      res.writeHead(400).end();
      return;
    }
    if (req.method !== "GET") {
      res.writeHead(405).end();
      return;
    }
    if (url.pathname === "/api/health") {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ ok: !storageFailed, rooms: game.rooms.size }));
      return;
    }
    if (url.pathname === "/api/network") {
      const addresses = Object.values(os.networkInterfaces())
        .flat()
        .filter((n) => n.family === "IPv4" && !n.internal)
        .map((n) => n.address);
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          addresses: publicOrigin
            ? [publicOrigin]
            : addresses.map((a) => `http://${a}:${server.address()?.port}`),
        }),
      );
      return;
    }
    if (url.pathname === "/api/qr") {
      const value = url.searchParams.get("value") || "";
      if (value.length > 400 || !/^https?:\/\//.test(value)) {
        res.writeHead(400).end();
        return;
      }
      try {
        const svg = await QRCode.toString(value, {
          type: "svg",
          margin: 2,
          width: 200,
        });
        res.setHeader("Content-Type", "image/svg+xml");
        res.end(svg);
      } catch {
        res.writeHead(400).end();
      }
      return;
    }
    const asset = assets[url.pathname];
    if (!asset) {
      res.writeHead(404).end("Không tìm thấy tài nguyên.");
      return;
    }
    fs.readFile(path.join(__dirname, asset[0]), (error, data) => {
      if (error) res.writeHead(503).end("Giao diện chưa sẵn sàng.");
      else {
        res.setHeader("Content-Type", asset[1]);
        res.end(data);
      }
    });
  });
  const wss = new WebSocketServer({
    noServer: true,
    maxPayload: 16384,
    perMessageDeflate: false,
  });
  server.on("upgrade", (req, socket, head) => {
    const origin = req.headers.origin;
    const expected =
      publicOrigin ||
      `${req.socket.encrypted ? "https" : "http"}://${req.headers.host}`;
    if (req.url !== "/ws" || (origin && origin !== expected)) {
      socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
      socket.destroy();
      return;
    }
    if (peers.size >= 300) {
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws) =>
      wss.emit("connection", ws, req),
    );
  });
  function send(ws, value) {
    if (ws.readyState !== WebSocket.OPEN) return;
    if (ws.bufferedAmount >= 2_000_000) {
      ws.close(4000, "Kết nối chậm, cần đồng bộ lại.");
      return;
    }
    ws.send(JSON.stringify(value));
  }
  function bind(ws, result) {
    ws.room = result.room;
    ws.session = result.session;
    if (result.session.token) {
      const old = connections.get(result.session.token);
      connections.set(result.session.token, ws);
      if (old && old !== ws) {
        old.replaced = true;
        old.close(4001, "Phiên đang mở trên kết nối khác.");
      }
    }
    game.presence(result.room, result.session, true);
    return {
      code: result.room.code,
      token: result.session.token,
      role: result.session.role,
      state: game.view(result.room, result.session),
    };
  }
  wss.on("connection", (ws, req) => {
    peers.add(ws);
    ws.alive = true;
    ws.windowStart = Date.now();
    ws.messages = 0;
    ws.cache = new Map();
    ws.keyFailures = 0;
    const authTimer = setTimeout(() => {
      if (!ws.room) ws.close(4000, "Hết thời gian đăng ký phiên.");
    }, 120000);
    authTimer.unref();
    ws.on("pong", () => (ws.alive = true));
    ws.on("error", () => {});
    ws.on("message", (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw.toString());
        if (
          !msg ||
          typeof msg !== "object" ||
          typeof msg.id !== "string" ||
          msg.id.length > 80 ||
          typeof msg.op !== "string"
        )
          throw new Error("Thông điệp không hợp lệ.");
        if (Date.now() - ws.windowStart > 10000) {
          ws.windowStart = Date.now();
          ws.messages = 0;
        }
        if (++ws.messages > 100)
          throw new Error("Thao tác quá nhanh. Vui lòng chờ vài giây.");
        if (ws.cache.has(msg.id)) {
          send(ws, ws.cache.get(msg.id));
          return;
        }
        const data = msg.data || {};
        let result;
        if (msg.op === "ping") result = { serverNow: Date.now() };
        else if (msg.op === "catalog" || msg.op === "create") {
          if (ws.room && msg.op === "create")
            throw new Error("Kết nối này đã vào phòng.");
          const authenticated = ws.room && ws.session?.role === "host";
          if (!authenticated && !checkKey(data.hostKey)) {
            if (++ws.keyFailures >= 5)
              ws.close(4003, "Quá nhiều lần nhập sai khóa host.");
            throw new Error(
              "Khóa host không đúng. Xem HOST_KEY trong .env trên máy chủ.",
            );
          }
          if (msg.op === "catalog")
            result = { questions: game.catalog(), categories };
          else {
            if (storageFailed)
              throw new Error("Lưu trữ đang lỗi, chưa thể tạo phòng.");
            const ip = req.socket.remoteAddress;
            const recent = recentCreates.get(ip) || [];
            const times = recent.filter((t) => Date.now() - t < 60000);
            if (times.length >= 10 || game.rooms.size >= 100)
              throw new Error("Đã đạt giới hạn tạo phòng.");
            times.push(Date.now());
            recentCreates.set(ip, times);
            result = bind(ws, game.create(data.name, data.config));
          }
        } else if (msg.op === "join") {
          if (ws.room) throw new Error("Kết nối đã tham gia phòng.");
          result = bind(
            ws,
            game.join(data.code, data.name, data.avatar, data.teamId),
          );
        } else if (msg.op === "resume" && !ws.room) {
          result = bind(ws, game.resume(data.code, data.token));
        } else if (msg.op === "watch") {
          if (ws.room) throw new Error("Kết nối đã có phiên.");
          result = bind(ws, {
            room: game.room(data.code),
            session: { role: "screen" },
          });
        } else {
          if (!ws.room || !ws.session)
            throw new Error("Vui lòng vào phòng trước.");
          const { room, session } = ws;
          if (
            session.token &&
            (!room.sessions.includes(session) ||
              connections.get(session.token) !== ws)
          )
            throw new Error("Phiên đã bị thu hồi hoặc thay thế.");
          if (storageFailed && !["export", "ping"].includes(msg.op))
            throw new Error(
              "Lưu trữ đang lỗi. Host kiểm tra máy chủ trước khi tiếp tục.",
            );
          game.tick();
          if (msg.op === "answer") result = game.answer(room, session, data);
          else if (["ready", "profile", "signal"].includes(msg.op))
            result = game.playerCommand(room, session, msg.op, data);
          else if (msg.op === "export") {
            if (!["host", "observer"].includes(session.role))
              throw new Error("Không có quyền xuất log.");
            result = { logs: room.logs };
          } else if (msg.op === "observer") {
            if (session.role !== "host")
              throw new Error("Chỉ host chính cấp quyền giám sát.");
            const observer = {
              role: "observer",
              token: randomBytes(24).toString("base64url"),
            };
            room.sessions.push(observer);
            game.save(room);
            result = { token: observer.token, code: room.code };
          } else result = game.command(room, session, msg.op, data);
        }
        const response = { id: msg.id, ok: true, result };
        if (msg.op !== "catalog" && msg.op !== "ping") {
          ws.cache.set(msg.id, response);
          if (ws.cache.size > 100)
            ws.cache.delete(ws.cache.keys().next().value);
        }
        send(ws, response);
      } catch (error) {
        send(ws, {
          id: msg?.id,
          ok: false,
          error: error.message || "Không thể thực hiện thao tác.",
        });
      }
    });
    ws.on("close", () => {
      clearTimeout(authTimer);
      peers.delete(ws);
      if (!ws.replaced && ws.room && ws.session) {
        if (ws.session.token) connections.delete(ws.session.token);
        game.presence(ws.room, ws.session, false);
      }
    });
  });
  function flush() {
    for (const code of pending) {
      const room = game.rooms.get(code);
      if (!room) continue;
      if (persist) {
        try {
          const dest = path.join(dataDir, `${code}.json`);
          fs.writeFileSync(`${dest}.tmp`, JSON.stringify(room), {
            mode: 0o600,
          });
          fs.renameSync(`${dest}.tmp`, dest);
        } catch {
          storageFailed = true;
          if (room.phase === "playing") {
            room.phase = "paused";
            room.pausedAt = Date.now();
          }
          console.error(
            "Không lưu được snapshot; dừng trước lượt tiếp theo. Kiểm tra dung lượng/quyền thư mục data.",
          );
        }
      }
      for (const ws of peers)
        if (ws.room === room && ws.session)
          send(ws, { event: "state", state: game.view(room, ws.session) });
    }
    pending.clear();
  }
  const tick = setInterval(() => {
    game.tick();
    flush();
  }, 40);
  const heartbeat = setInterval(() => {
    for (const ws of peers) {
      if (!ws.alive) ws.terminate();
      else {
        ws.alive = false;
        ws.ping();
      }
    }
  }, 10000);
  const cleanup = setInterval(() => {
    for (const [code, room] of game.rooms)
      if (Date.now() - room.created > 7 * 86400000) {
        for (const ws of peers)
          if (ws.room === room) ws.close(4004, "Phòng đã hết hạn lưu trữ.");
        game.rooms.delete(code);
        if (persist)
          try {
            fs.unlinkSync(path.join(dataDir, `${code}.json`));
          } catch {
            /* no snapshot is safe to ignore */
          }
      }
  }, 60000);
  tick.unref();
  heartbeat.unref();
  cleanup.unref();
  return {
    server,
    game,
    close: async () => {
      clearInterval(tick);
      clearInterval(heartbeat);
      clearInterval(cleanup);
      flush();
      for (const ws of peers) ws.terminate();
      await new Promise((resolve) => wss.close(resolve));
      await new Promise((resolve) => server.close(resolve));
    },
  };
}

if (require.main === module) {
  try {
    const app = createApp();
    const port = Number(process.env.PORT || 3100);
    app.server.listen(port, "0.0.0.0", () =>
      console.log(
        `VNR202 đang chạy tại http://localhost:${port}. HOST_KEY nằm trong .env; không chia sẻ khóa với người chơi.`,
      ),
    );
    for (const signal of ["SIGINT", "SIGTERM"])
      process.once(signal, () => app.close().then(() => process.exit(0)));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
module.exports = { createApp };
