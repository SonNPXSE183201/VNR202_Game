import { avatars } from "./avatars.js";

const $ = (selector) => document.querySelector(selector);
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const clock = (ms) => {
  const n = Math.max(0, Math.ceil((ms || 0) / 1000));
  return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;
};
const matchNow = (s) =>
  s.phase === "paused"
    ? s.pausedAt
    : s.phase === "finished"
      ? s.finishedAt
      : Date.now() + serverOffset;
const avatar = (index, large = false) =>
  `<span class="avatar${large ? " large" : ""}" data-avatar="${Number(index)}" role="img" aria-label="${esc(avatars[index]?.name || "Avatar")}">${avatars[index]?.icon || "🤖"}</span>`;
const params = new URLSearchParams(location.search);
let mode = params.get("mode") || "join";
let state = null,
  catalog = null,
  preview = null,
  previewClient = null,
  rpc = null;
let selectedAvatar = 0,
  selectedOption = null,
  optionTurn = null,
  requestBusy = false,
  serverOffset = 0;
let draft = {
  teams: 8,
  duration: 240,
  matchLimit: 330,
  questionIds: Array.from({ length: 60 }, (_, i) => i + 1),
  reviewed: false,
};
let joinBase =
  params.get("joinOrigin") ||
  sessionStorage.getItem("vnr-join-origin") ||
  location.origin;
let logTeam = "",
  logType = "",
  toastTimer;
const storageKey = `vnr-session-${mode}`;
let saved;
try {
  saved = JSON.parse(sessionStorage.getItem(storageKey));
} catch {
  saved = null;
}
if (params.get("room") && saved?.code !== params.get("room")) saved = null;
let observerToken = location.hash.startsWith("#observer=")
  ? location.hash.slice(10)
  : null;
if (observerToken)
  history.replaceState(null, "", location.pathname + location.search);
if (sessionStorage.getItem("vnr-reduce-motion") === "true")
  document.body.classList.add("reduce-motion");
$("#motion").setAttribute(
  "aria-pressed",
  String(document.body.classList.contains("reduce-motion")),
);
$("#motion").onclick = () => {
  const on = document.body.classList.toggle("reduce-motion");
  sessionStorage.setItem("vnr-reduce-motion", on);
  $("#motion").setAttribute("aria-pressed", String(on));
};

function toast(message, error = false) {
  const el = $("#toast");
  el.textContent = message;
  el.hidden = false;
  el.classList.toggle("error", error);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), 5500);
}
function connection(online, label) {
  const el = $("#connection");
  el.textContent = label || (online ? "● Đã kết nối" : "○ Đang kết nối lại");
  el.classList.toggle("offline", !online);
}
class Client {
  constructor(onState, onOpen, quiet = false) {
    this.onState = onState;
    this.onOpen = onOpen;
    this.quiet = quiet;
    this.pending = new Map();
    this.stopped = false;
    this.connect();
  }
  connect() {
    this.socket = new WebSocket(
      `${location.protocol === "https:" ? "wss:" : "ws:"}//${location.host}/ws`,
    );
    this.socket.onopen = async () => {
      if (!this.quiet) connection(true);
      try {
        await this.onOpen?.();
      } catch (error) {
        if (!this.quiet) toast(error.message, true);
      }
    };
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.event === "state") this.onState?.(data.state);
      else if (this.pending.has(data.id)) {
        const request = this.pending.get(data.id);
        clearTimeout(request.timer);
        this.pending.delete(data.id);
        if (data.ok) request.resolve(data.result);
        else request.reject(new Error(data.error));
      }
    };
    this.socket.onerror = () => {};
    this.socket.onclose = (event) => {
      this.pending.forEach((p) => {
        clearTimeout(p.timer);
        p.reject(
          new Error(
            "Mất kết nối. Trạng thái sẽ được kiểm tra lại khi kết nối lại.",
          ),
        );
      });
      this.pending.clear();
      if (this.stopped) return;
      if (event.code === 4001 || event.code === 4004) {
        this.stopped = true;
        if (!this.quiet)
          connection(
            false,
            event.code === 4001 ? "Phiên đã mở ở nơi khác" : "Phòng đã hết hạn",
          );
        return;
      }
      if (!this.quiet) {
        connection(false);
        renderTimers();
      }
      setTimeout(() => {
        if (!this.stopped) this.connect();
      }, 1500);
    };
  }
  call(op, data = {}) {
    return new Promise((resolve, reject) => {
      if (this.socket.readyState !== WebSocket.OPEN)
        return reject(new Error("Chưa kết nối máy chủ. Vui lòng chờ."));
      // getRandomValues also works on HTTP LAN origins (randomUUID requires a secure context).
      const id = [...crypto.getRandomValues(new Uint32Array(4))]
        .map((n) => n.toString(16))
        .join("-");
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(
          new Error("Chưa nhận xác nhận. Kiểm tra kết nối trước khi thử lại."),
        );
      }, 10000);
      this.pending.set(id, { resolve, reject, timer });
      this.socket.send(JSON.stringify({ id, op, data }));
    });
  }
  stop() {
    this.stopped = true;
    this.socket.close();
  }
}
function saveSession(result) {
  saved = { code: result.code, token: result.token, role: result.role };
  if (result.token) sessionStorage.setItem(storageKey, JSON.stringify(saved));
  receive(result.state);
}
function receive(next) {
  state = next;
  serverOffset = next.serverNow - Date.now();
  if (next.me && next.me.avatar !== selectedAvatar)
    selectedAvatar = next.me.avatar;
  if (next.role === "host" && next.phase === "lobby" && !$("#room-config"))
    draft = {
      ...draft,
      teams: next.config.teams,
      duration: next.config.duration,
      matchLimit: next.config.matchLimit,
      questionIds: next.questionIds,
      reviewed: true,
    };
  render();
}
async function act(op, data = {}) {
  try {
    return await rpc.call(op, data);
  } catch (error) {
    toast(error.message, true);
    return null;
  }
}
function member(p, holder = null, full = false) {
  return `<div class="member${p.connected ? "" : " offline"}${p.id === holder ? " is-holder" : ""}">${avatar(p.avatar)}<span class="member-name">${esc(p.name)}${full ? `<small>${p.connected ? (p.ready ? "Sẵn sàng" : "Đang chờ") : "Mất kết nối"}</small>` : !p.connected ? "<small>Mất kết nối</small>" : ""}</span>${full && p.ready ? '<span class="ready-dot" aria-label="Sẵn sàng">✓</span>' : ""}</div>`;
}
function leaderboard(s) {
  return `<div class="leaderboard">${[...s.teams]
    .sort((a, b) => a.rank - b.rank)
    .map(
      (t) =>
        `<div class="leader-row"><span class="rank-number">${t.rank}</span><strong>${esc(t.name)}<small class="muted"> ${t.eliminated ? "Đã nổ" : "Còn sống"}</small></strong><span>${clock(t.survivedMs)} sống sót<br><small>Còn ${clock(t.remainingMs)}</small></span></div>`,
    )
    .join("")}</div>`;
}
function podium(s) {
  return `<div class="podium">${[...s.teams]
    .filter((t) => t.rank <= 3)
    .sort((a, b) => a.rank - b.rank)
    .map(
      (t) =>
        `<section class="podium-card"><div class="medal" aria-hidden="true">${["🥇", "🥈", "🥉"][t.rank - 1]}</div><p class="fine">Hạng ${t.rank}</p><h2>${esc(t.name)}</h2><strong class="player-score">${clock(t.survivedMs)}</strong><p>Sống sót · dự trữ ${clock(t.remainingMs)}</p><p class="fine">${t.correctCount} câu đúng · ${t.wrongCount} lần sai</p><div class="podium-members">${s.players
          .filter((p) => p.teamId === t.id)
          .map((p) => member(p))
          .join("")}</div></section>`,
    )
    .join("")}</div>`;
}
function review(s) {
  if (!s.review?.length) return "";
  return `<section><h2>Kiến thức vừa ôn</h2><div class="review-list">${s.review.map((q) => `<details><summary>Câu ${q.id}: ${esc(q.question)}</summary><p class="good"><strong>${esc(q.answer)}</strong></p><p>${esc(q.explain)}</p></details>`).join("")}</div></section>`;
}
function phaseLabel(s) {
  return {
    lobby: "Cùng vào đội nào!",
    countdown: "Sẵn sàng sinh tồn",
    playing: `${s.aliveCount}/${s.teams.length} đội còn sống`,
    paused: "Tạm dừng công bằng cho mọi đội",
    finished: "Kết quả sinh tồn",
  }[s.phase];
}
function timerBlock(s) {
  const own = s.me ? s.teams.find((t) => t.id === s.me.teamId) : null;
  const label =
    s.phase === "countdown"
      ? "Bắt đầu sau"
      : own
        ? own.eliminated
          ? "Đã sống sót"
          : "Bom đội bạn còn"
        : s.phase === "lobby"
          ? "Giới hạn trận"
          : "Còn lại của trận";
  return `<div class="round-timer"><div><small>${label}</small><span class="timer" data-timer>${clock(s.config.duration * 1000)}</span></div><span aria-hidden="true">${s.phase === "finished" ? "🏁" : "💣"}</span></div>`;
}
function teamCard(t, s, privateView = false) {
  const players = s.players.filter((p) => p.teamId === t.id),
    holder = players.find((p) => p.id === t.holder);
  return `<section class="team-card ${t.eliminated ? "team-eliminated" : ""}" data-team="${t.id}"><div class="team-top"><div><h2>${esc(t.name)}</h2><span class="fine">${s.phase === "lobby" ? `${players.length} thành viên` : `Hạng ${t.rank} · ${t.eliminated ? "Đã nổ" : "Còn sống"}`}</span></div><div class="team-points"><span data-team-clock="${t.id}">${clock(s.phase === "finished" ? t.survivedMs : t.remainingMs)}</span><small>${s.phase === "finished" ? "sống sót" : "bom còn"}</small></div></div>${s.phase === "playing" && !t.eliminated ? `<div class="holder">${holder ? avatar(holder.avatar) : "💣"}<div><small>Đang giữ bom</small><strong>${esc(holder?.name || "Chờ kết nối")}</strong></div></div><div class="fuse"><span data-fuse="${t.id}"></span></div>` : ""}<div class="member-list">${players.map((p) => member(p, t.holder, s.phase === "lobby")).join("") || '<span class="fine">Chưa có thành viên</span>'}</div><p class="fine">${t.correctCount} câu đúng · ${t.wrongCount} lần sai · +${(t.grantedMs / 1000).toFixed(1)}s / −${(t.penaltyMs / 1000).toFixed(1)}s</p>${t.feedback ? `<p class="feedback ${esc(t.feedback.kind)}">${esc(t.feedback.text)}</p>` : ""}${privateView && t.question ? `<details class="team-detail" data-keep="question-${t.id}"><summary>Câu ${t.question.number} · xem nội dung</summary><p>${esc(t.question.text)}</p><ol class="host-question-options">${t.question.options.map((o) => `<li>${esc(o.text)}${o.rejected ? " — đã chọn sai" : ""}</li>`).join("")}</ol></details>` : ""}</section>`;
}
function joinUrl() {
  const url = new URL("/", joinBase);
  url.searchParams.set("room", state?.code || "");
  return url.href;
}
function shareBlock(s, compact = false) {
  const url = joinUrl();
  return compact
    ? `<div class="screen-bar"><img src="/api/qr?value=${encodeURIComponent(url)}" alt="QR tham gia phòng ${esc(s.code)}"><div><small>Mã phòng</small><div class="room-code">${esc(s.code)}</div><p>Host: ${esc(s.hostName)} · ${s.players.length} người · ${s.teams.length} đội</p></div><div class="spacer"></div>${timerBlock(s)}</div>`
    : `<section class="panel"><h2>Mời cả lớp vào chơi</h2><div class="qr-block"><img src="/api/qr?value=${encodeURIComponent(url)}" alt="QR tham gia phòng"><div><small>Mã phòng</small><div class="room-code">${esc(s.code)}</div></div></div><p class="join-link">${esc(url)}</p><button class="secondary full" data-action="copy-join">Sao chép link tham gia</button><details class="share-address" data-keep="share"><summary>Địa chỉ cho điện thoại</summary><p class="fine">Điện thoại dùng cùng Wi-Fi. Không dùng localhost trên điện thoại. Chọn IP LAN của máy chủ hoặc tên miền đã cấu hình.</p><label>Địa chỉ máy chủ<input id="join-origin" type="url" value="${esc(joinBase)}"></label><button class="quiet full" data-action="apply-origin">Cập nhật QR</button><div id="network-options"></div></details><button class="quiet full" data-action="screen">Mở màn chiếu</button></section>`;
}
function configFields(prefix = "") {
  return `<div class="field-pair"><label>Số đội<select id="${prefix}teams">${[7, 8].map((n) => `<option value="${n}" ${draft.teams === n ? "selected" : ""}>${n} đội</option>`).join("")}</select></label><label>Thời gian khởi đầu<select id="${prefix}duration">${[180, 210, 240, 270].map((n) => `<option value="${n}" ${draft.duration === n ? "selected" : ""}>${n} giây</option>`).join("")}</select></label><label>Giới hạn trận<select id="${prefix}matchLimit">${[300, 330, 360].map((n) => `<option value="${n}" ${draft.matchLimit === n ? "selected" : ""}>${n} giây</option>`).join("")}</select></label></div><p class="fine">Đúng ≤5s: +10s; ≤10s: +7s; chậm hơn: +4s. Sai −8s. Mỗi câu chỉ gửi một lần; đúng hoặc sai đều chuyển người và câu mới. Dự trữ tối đa thời gian đầu +60s.</p>`;
}
function catalogHTML() {
  if (!catalog) return '<p class="fine">Xác thực host để chọn bộ câu hỏi.</p>';
  return `<h3>Bộ câu hỏi <span id="question-count" class="badge">${draft.questionIds.length}/60</span></h3><div class="catalog-toolbar"><button type="button" class="quiet" data-pick="all">Chọn tất cả</button><button type="button" class="quiet" data-pick="none">Bỏ chọn</button>${catalog.categories.map((c) => `<button type="button" class="quiet" data-pick="${esc(c.id)}">${esc(c.name)}</button>`).join("")}</div><div class="question-catalog">${catalog.questions.map((q) => `<div class="catalog-row"><label><input type="checkbox" data-qid="${q.id}" ${draft.questionIds.includes(q.id) ? "checked" : ""}><span><strong>Câu ${q.id}.</strong> ${esc(q.question)}</span></label><details><summary>Xem đáp án và giải thích</summary><p class="good">${esc(q.options[q.correct])}</p><p>${esc(q.explain)}</p></details></div>`).join("")}</div><label class="consent"><input id="reviewed" type="checkbox" ${draft.reviewed ? "checked" : ""} required><span>Tôi đã kiểm tra nội dung và cho phép dùng những câu đã chọn trong buổi chơi này. Việc chọn câu không thay thế thẩm định nguồn lịch sử.</span></label>`;
}
function avatarPicker() {
  return `<fieldset><legend>Avatar của bạn</legend><div class="avatar-picker">${avatars.map((a, i) => `<button type="button" class="avatar-choice" data-avatar-choice="${i}" aria-label="${esc(a.name)}" aria-pressed="${selectedAvatar === i}">${a.icon}</button>`).join("")}</div></fieldset>`;
}
function entry() {
  const host = mode === "host";
  $("#main").innerHTML =
    `<div class="entry"><section class="entry-story"><span class="pill">Một lớp học. Nhiều đồng đội.</span><h1>Giữ bình tĩnh.<br>Gỡ bom tri thức.</h1><p>Cùng nhóm ôn lại những dấu mốc 1945–1950. Mỗi câu đúng là một lần đưa cả đội tiến lên.</p><div class="story-steps"><span>💣 Khởi đầu ${draft.duration} giây</span><span>🤝 7–8 đội cùng chơi</span><span>🏆 Thi đấu 5–7 phút</span></div><div class="bomb-stage" aria-hidden="true"><div class="bomb"><span class="bomb-eyes"></span><span class="bomb-smile"></span></div><span class="orbit-label">Trả lời đúng, giữ bom lâu hơn!</span></div><details><summary>Cách chơi trong 30 giây</summary><p class="fine">Cả đội cùng xem câu hỏi, chỉ người giữ bom gửi đáp án. Đúng được cộng giây và chuyển người; sai bị trừ 8 giây. Mỗi câu chỉ gửi một lần; đúng hoặc sai đều chuyển người và câu mới. Hết giờ đội dừng chơi. Đội sống lâu hơn xếp trên.</p></details></section><section class="entry-panel"><nav class="mode-tabs" aria-label="Vai trò"><a href="/?room=${esc(params.get("room") || "")}" class="${host ? "" : "active"}">Tham gia chơi</a><a href="/?mode=host" class="${host ? "active" : ""}">Dành cho host</a></nav>${host ? hostEntry() : playerEntry()}</section>${host ? "" : '<section class="join-roster"><h2>Các đội trong phòng</h2><div id="entry-roster" class="mini-roster"><p class="fine">Nhập mã phòng để xem các đội và bạn cùng nhóm.</p></div></section>'}</div>`;
  bindEntry();
}
function playerEntry() {
  return `<h2>Vào đội của bạn</h2><p class="fine">Không cần tài khoản. Chọn nhóm bạn đang ngồi cùng.</p><form id="join-form" class="form-stack"><div class="field-pair"><label>Mã phòng<input id="room-code" name="room" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" minlength="6" value="${esc(params.get("room") || "")}" placeholder="6 chữ số" required autocomplete="off"></label><label>Tên của bạn<input id="player-name" name="name" minlength="2" maxlength="30" placeholder="Ví dụ: Minh Anh" required autocomplete="nickname"></label></div>${avatarPicker()}<label>Đội tham gia<select id="join-team" required><option value="">Nhập mã phòng trước</option></select></label><div class="personal-preview" id="personal-preview">${avatar(selectedAvatar, true)}<div><strong>Tên của bạn</strong><small>Chưa chọn đội</small></div></div><label class="consent"><input id="consent" type="checkbox" required><span>Tôi đồng ý hiển thị tên/avatar/đội trên máy chiếu và lưu log chơi, kết nối, tín hiệu rời trang trong phiên này. Dữ liệu được lưu tối đa 7 ngày; không thu camera hoặc lịch sử duyệt web.</span></label><button type="submit" id="join-submit">Tham gia đội</button><p id="join-error" class="error-inline" role="alert"></p></form>`;
}
function hostEntry() {
  return `<h2>Tạo sân chơi cho lớp</h2><p class="fine">Khóa host nằm trong file .env trên máy chủ. Không chia sẻ khóa này với người chơi.</p><form id="host-auth" class="form-stack"><label>Tên host<input id="host-name" minlength="2" maxlength="30" placeholder="Nhóm thuyết trình" required></label><label>Khóa host<input id="host-key" type="password" required autocomplete="current-password" minlength="16"></label><button type="submit">Mở cấu hình phòng</button><p id="host-error" class="error-inline" role="alert"></p></form><div id="create-config" hidden><h3>Thiết lập trận</h3><div class="form-stack">${configFields("create-")}<div id="create-catalog"></div><button id="create-room">Tạo phòng</button><p id="create-error" class="error-inline" role="alert"></p></div></div>`;
}
function bindCatalog() {
  document.querySelectorAll("[data-qid]").forEach(
    (input) =>
      (input.onchange = () => {
        const qid = Number(input.dataset.qid);
        draft.questionIds = input.checked
          ? [...new Set([...draft.questionIds, qid])]
          : draft.questionIds.filter((id) => id !== qid);
        draft.reviewed = false;
        if ($("#reviewed")) $("#reviewed").checked = false;
        $("#question-count").textContent = `${draft.questionIds.length}/60`;
      }),
  );
  document.querySelectorAll("[data-pick]").forEach(
    (button) =>
      (button.onclick = () => {
        const pick = button.dataset.pick;
        draft.questionIds =
          pick === "none"
            ? []
            : catalog.questions
                .filter((q) => pick === "all" || q.category === pick)
                .map((q) => q.id);
        draft.reviewed = false;
        document
          .querySelectorAll("[data-qid]")
          .forEach(
            (input) =>
              (input.checked = draft.questionIds.includes(
                Number(input.dataset.qid),
              )),
          );
        $("#reviewed").checked = false;
        $("#question-count").textContent = `${draft.questionIds.length}/60`;
      }),
  );
  if ($("#reviewed"))
    $("#reviewed").onchange = (event) =>
      (draft.reviewed = event.target.checked);
  for (const prefix of ["", "create-"])
    for (const field of ["teams", "duration", "matchLimit"])
      if ($(`#${prefix}${field}`))
        $(`#${prefix}${field}`).onchange = (event) =>
          (draft[field] = Number(event.target.value));
}
let previewTimer;
function bindEntry() {
  if (mode === "host") {
    let hostKey, hostName;
    $("#host-auth").onsubmit = async (event) => {
      event.preventDefault();
      hostKey = $("#host-key").value;
      hostName = $("#host-name").value;
      try {
        catalog = await rpc.call("catalog", { hostKey });
        $("#host-auth").hidden = true;
        $("#create-config").hidden = false;
        $("#create-catalog").innerHTML = catalogHTML();
        bindCatalog();
      } catch (error) {
        $("#host-error").textContent = error.message;
      }
    };
    $("#create-room").onclick = async () => {
      $("#create-room").disabled = true;
      try {
        const result = await rpc.call("create", {
          hostKey,
          name: hostName,
          config: draft,
        });
        hostKey = null;
        saveSession(result);
      } catch (error) {
        $("#create-error").textContent = error.message;
        if ($("#create-room")) $("#create-room").disabled = false;
      }
    };
  } else {
    $("#room-code").oninput = () => {
      clearTimeout(previewTimer);
      previewTimer = setTimeout(loadPreview, 300);
    };
    $("#player-name").oninput = updatePersonal;
    $("#join-team").onchange = updatePersonal;
    document.querySelectorAll("[data-avatar-choice]").forEach(
      (button) =>
        (button.onclick = () => {
          selectedAvatar = Number(button.dataset.avatarChoice);
          document
            .querySelectorAll("[data-avatar-choice]")
            .forEach((b) =>
              b.setAttribute(
                "aria-pressed",
                String(Number(b.dataset.avatarChoice) === selectedAvatar),
              ),
            );
          updatePersonal();
        }),
    );
    $("#join-form").onsubmit = async (event) => {
      event.preventDefault();
      const button = $("#join-submit");
      button.disabled = true;
      try {
        const result = await rpc.call("join", {
          code: $("#room-code").value,
          name: $("#player-name").value,
          avatar: selectedAvatar,
          teamId: Number($("#join-team").value),
        });
        previewClient?.stop();
        saveSession(result);
      } catch (error) {
        $("#join-error").textContent = error.message;
        button.disabled = false;
      }
    };
    if ($("#room-code").value.length === 6) loadPreview();
  }
}
function updatePersonal() {
  const name = $("#player-name")?.value || "Tên của bạn",
    selected =
      $("#join-team")?.selectedOptions[0]?.textContent || "Chưa chọn đội";
  if ($("#personal-preview"))
    $("#personal-preview").innerHTML =
      `${avatar(selectedAvatar, true)}<div><strong>${esc(name)}</strong><small>${esc(selected)}</small></div>`;
}
function loadPreview() {
  const code = $("#room-code")?.value;
  if (!/^\d{6}$/.test(code || "")) return;
  previewClient?.stop();
  preview = null;
  previewClient = new Client(
    (s) => {
      preview = s;
      renderPreview();
    },
    async () => {
      try {
        const result = await previewClient.call("watch", { code });
        preview = result.state;
        renderPreview();
      } catch (error) {
        if ($("#join-error")) $("#join-error").textContent = error.message;
      }
    },
    true,
  );
}
function renderPreview() {
  if (!$("#entry-roster") || !preview) return;
  const old = $("#join-team").value;
  $("#join-team").innerHTML =
    `<option value="">Chọn nhóm của bạn</option>${preview.teams.map((t) => `<option value="${t.id}" ${old === String(t.id) ? "selected" : ""}>${esc(t.name)} · ${preview.players.filter((p) => p.teamId === t.id).length} người</option>`).join("")}`;
  $("#entry-roster").innerHTML = preview.teams
    .map(
      (t) =>
        `<section class="mini-team"><strong>${esc(t.name)}</strong><div class="member-list">${
          preview.players
            .filter((p) => p.teamId === t.id)
            .map((p) => member(p))
            .join("") || '<span class="fine">Chưa có ai</span>'
        }</div></section>`,
    )
    .join("");
  $("#join-submit").disabled = preview.locked || preview.phase !== "lobby";
  if ($("#join-error"))
    $("#join-error").textContent =
      preview.locked || preview.phase !== "lobby"
        ? "Phòng đã khóa. Bạn có thể tham gia trận sau."
        : "";
  updatePersonal();
}
function preserveRender(html) {
  const focusId = document.activeElement?.id;
  const edits = [...document.querySelectorAll('[data-dirty="true"][id]')].map(
    (el) => ({
      id: el.id,
      value: el.value,
      start: el.selectionStart,
      end: el.selectionEnd,
    }),
  );
  const openDetails = [...document.querySelectorAll("details[open]")]
    .map((d) => d.dataset.keep)
    .filter(Boolean);
  $("#main").innerHTML = html;
  for (const edit of edits) {
    const el = document.getElementById(edit.id);
    if (el) {
      el.value = edit.value;
      el.dataset.dirty = "true";
      if (
        edit.start !== null &&
        typeof el.setSelectionRange === "function" &&
        !["number", "email", "url"].includes(el.type)
      )
        el.setSelectionRange(edit.start, edit.end);
    }
  }
  for (const name of openDetails)
    document
      .querySelector(`details[data-keep="${name}"]`)
      ?.setAttribute("open", "");
  if (focusId) document.getElementById(focusId)?.focus({ preventScroll: true });
}
function render() {
  if (!state) return;
  if (mode === "screen" || state.role === "screen") renderScreen();
  else if (["host", "observer"].includes(state.role)) renderHost();
  else renderPlayer();
  renderTimers();
}
function renderScreen() {
  const s = state;
  preserveRender(
    `<div class="screen">${shareBlock(s, true)}<div class="stage-heading"><div><h1>${phaseLabel(s)}</h1><p>${s.phase === "lobby" ? "Tìm avatar và tên của bạn trong đúng đội. Sẵn sàng rồi cùng bắt đầu!" : s.phase === "finished" ? "Cảm ơn cả lớp đã cùng ôn tập VNR202." : "Cùng đội suy nghĩ. Đến lượt ai, người đó trả lời."}</p></div><button class="quiet" data-action="fullscreen">Toàn màn hình</button></div>${s.phase === "finished" ? podium(s) : ""}<div class="teams-grid">${s.teams.map((t) => teamCard(t, s)).join("")}</div>${s.phase === "finished" ? leaderboard(s) : ""}</div>`,
  );
  bindActions();
}
function hostControls(s) {
  if (s.role === "observer")
    return '<p class="notice">Quyền giám sát: xem diễn biến và log, không điều khiển trận.</p>';
  return `<div class="control-stack">${s.phase === "lobby" ? `<button data-action="start">Bắt đầu trận</button><button class="secondary" data-action="force-start">Bắt đầu ngay (bỏ qua sẵn sàng)</button><button class="quiet" data-action="lock">${s.locked ? "Mở khóa danh sách" : "Khóa danh sách"}</button>` : ""}${s.phase === "playing" ? '<button class="secondary" data-action="pause">Tạm dừng mọi đồng hồ</button>' : ""}${s.phase === "paused" ? '<button data-action="resume">Tiếp tục trận</button>' : ""}${["playing", "paused", "finished"].includes(s.phase) ? '<button class="quiet" data-action="cancel">Hủy toàn trận có lỗi</button>' : ""}${["playing", "paused"].includes(s.phase) ? '<button class="danger" data-action="end">Kết thúc sớm</button>' : ""}</div>`;
}
function renderHost() {
  const s = state,
    host = s.role === "host";
  const oldConfig = $("#room-config");
  const configNode = oldConfig && s.phase === "lobby" ? oldConfig : null;
  const configHTML =
    host && s.phase === "lobby"
      ? '<section id="room-config" class="panel host-config"></section>'
      : "";
  preserveRender(
    `<div class="workspace"><aside class="sidebar">${shareBlock(s)}<section class="panel"><h2>Điều khiển trận</h2><p class="fine">${esc(s.hostName)} · ${s.config.questionCount} câu đã chọn<br>Khởi đầu ${s.config.duration}s · giới hạn ${s.config.matchLimit}s</p>${hostControls(s)}${host && s.phase === "finished" ? '<button class="secondary full" data-action="new-room">Tạo phòng mới</button>' : ""}${host ? '<hr><button class="quiet full" data-action="observer">Mời host giám sát</button>' : ""}<button class="quiet full" data-action="leave">Rời giao diện</button></section></aside><div class="stage"><div class="stage-heading"><div><h1>${phaseLabel(s)}</h1><p>${s.players.length} người · ${s.players.filter((p) => p.ready).length} sẵn sàng · ${s.teams.length} đội</p></div>${timerBlock(s)}</div>${s.teams.some((t) => !s.players.some((p) => p.teamId === t.id && p.connected)) && s.phase === "lobby" ? '<p class="notice warning">Mỗi đội cần ít nhất một người kết nối. Kiểm tra nhóm trống trước khi bắt đầu.</p>' : ""}${s.phase === "finished" ? podium(s) : ""}<div class="teams-grid">${s.teams.map((t) => teamCard(t, s, true)).join("")}</div>${configHTML}${host && s.phase === "lobby" ? memberEditor(s) : ""}${logPanel(s)}${s.phase === "finished" ? review(s) : ""}</div></div>`,
  );
  if (configNode && $("#room-config"))
    $("#room-config").replaceWith(configNode);
  else if ($("#room-config")) {
    $("#room-config").innerHTML =
      `<h2>Cấu hình trước trận</h2><p class="fine">Cùng thời gian đầu; mỗi đội có hạn nổ riêng thay đổi theo câu trả lời.</p><div class="form-stack">${configFields()}<div id="room-catalog">${catalogHTML()}</div><button data-action="save-config">Lưu cấu hình và bộ câu hỏi</button></div>`;
  }
  if (!catalog && host)
    rpc
      .call("catalog")
      .then((data) => {
        catalog = data;
        if ($("#room-catalog")) {
          $("#room-catalog").innerHTML = catalogHTML();
          bindCatalog();
        }
      })
      .catch((error) => toast(error.message, true));
  bindCatalog();
  bindActions();
  bindMemberEditor();
  bindLogFilters();
  const address = $("#join-origin");
  if (address)
    address.onkeydown = (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        applyOrigin();
      }
    };
}
function memberEditor(s) {
  return `<details class="panel team-edit" data-keep="members"><summary>Quản lý đội và thành viên</summary><h3>Tên đội</h3>${s.teams.map((t) => `<div class="edit-member"><label>Đội ${t.id + 1}<input id="team-name-${t.id}" value="${esc(t.name)}" maxlength="30" minlength="2"></label><span></span><button class="quiet" data-rename="${t.id}">Đổi tên đội</button></div>`).join("")}<h3>Người chơi</h3>${s.players.map((p) => `<div class="edit-member"><label>${avatars[p.avatar]?.icon || ""} Tên<input id="name-${p.id}" value="${esc(p.name)}" minlength="2" maxlength="30"></label><label>Đội<select id="team-${p.id}">${s.teams.map((t) => `<option value="${t.id}" ${p.teamId === t.id ? "selected" : ""}>${esc(t.name)}</option>`).join("")}</select></label><button class="quiet" data-member="${p.id}">Lưu</button><button class="quiet" data-remove="${p.id}">Xóa khỏi phòng</button></div>`).join("")}</details>`;
}
function logPanel(s) {
  return `<section class="panel log-panel"><div class="log-toolbar"><h2>Nhật ký phòng</h2><button class="quiet" data-action="export">Xuất log CSV</button></div><div class="filter-row"><select id="log-team" aria-label="Lọc log theo đội"><option value="">Tất cả đội</option>${s.teams.map((t) => `<option value="${t.id}" ${logTeam === String(t.id) ? "selected" : ""}>${esc(t.name)}</option>`).join("")}</select><select id="log-type" aria-label="Lọc loại log"><option value="">Tất cả sự kiện</option><option value="answer" ${logType === "answer" ? "selected" : ""}>Trả lời</option><option value="signal" ${logType === "signal" ? "selected" : ""}>Tín hiệu rời trang</option><option value="connection" ${logType === "connection" ? "selected" : ""}>Kết nối</option></select></div><p class="fine">150 sự kiện gần nhất; xuất CSV để xem lịch sử được lưu (tối đa 2.000 sự kiện). Tín hiệu rời trang do client báo, không phải bằng chứng chắc chắn về gian lận.</p><div class="log-list" id="log-list">${logItems(s)}</div></section>`;
}
function logItems(s) {
  const logs = (s.logs || []).filter(
    (l) =>
      (logTeam === "" || String(l.teamId) === logTeam) &&
      (!logType || l.type === logType),
  );
  return (
    logs
      .slice()
      .reverse()
      .map(
        (l) =>
          `<div class="log-item ${l.type === "signal" ? "signal" : ""}"><time>${new Date(l.at).toLocaleTimeString("vi-VN")}</time><span>${esc(l.message)}</span></div>`,
      )
      .join("") || '<p class="fine">Chưa có sự kiện phù hợp.</p>'
  );
}
function bindLogFilters() {
  for (const type of ["team", "type"])
    if ($(`#log-${type}`))
      $(`#log-${type}`).onchange = (event) => {
        if (type === "team") logTeam = event.target.value;
        else logType = event.target.value;
        $("#log-list").innerHTML = logItems(state);
      };
}
function bindMemberEditor() {
  document.querySelectorAll("[data-rename]").forEach(
    (button) =>
      (button.onclick = async () => {
        const field = $(`#team-name-${button.dataset.rename}`);
        if (
          await act("team", {
            teamId: Number(button.dataset.rename),
            name: field.value,
          })
        )
          delete field.dataset.dirty;
      }),
  );
  document.querySelectorAll("[data-member]").forEach(
    (button) =>
      (button.onclick = async () => {
        const name = $(`#name-${button.dataset.member}`),
          team = $(`#team-${button.dataset.member}`);
        if (
          await act("member", {
            playerId: button.dataset.member,
            name: name.value,
            teamId: Number(team.value),
          })
        ) {
          delete name.dataset.dirty;
          delete team.dataset.dirty;
        }
      }),
  );
  document.querySelectorAll("[data-remove]").forEach(
    (button) =>
      (button.onclick = async () => {
        if (
          await confirmAction(
            "Xóa người chơi?",
            "Phiên của người chơi sẽ bị thu hồi. Chỉ dùng để xử lý người vào nhầm hoặc tên không phù hợp.",
          )
        )
          act("remove", { playerId: button.dataset.remove });
      }),
  );
}
function renderPlayer() {
  const s = state,
    me = s.me;
  if (!me) {
    sessionStorage.removeItem(storageKey);
    saved = null;
    state = null;
    toast("Host đã xóa phiên của bạn khỏi phòng.", true);
    rpc.stop();
    location.assign("/");
    return;
  }
  const team = s.teams.find((t) => t.id === me.teamId),
    holder = s.players.find((p) => p.id === team.holder),
    q = team.question;
  if (optionTurn !== q?.id) {
    selectedOption = null;
    optionTurn = q?.id;
  }
  let content;
  if (s.phase === "lobby")
    content = `<section class="panel waiting-panel"><div class="waiting-illustration" aria-hidden="true">${avatars[me.avatar].icon}</div><h1>Chào ${esc(me.name)}!</h1><p>Bạn đã vào <strong>${esc(team.name)}</strong>. Cùng đội thảo luận; đến lượt bạn mới cần gửi đáp án.</p><p class="fine">Khởi đầu ${s.config.duration}s · tối đa ${s.config.matchLimit}s · ${s.config.questionCount} câu</p><button class="full" data-action="ready">${me.ready ? "✓ Đã sẵn sàng — bấm để hủy" : "Tôi đã sẵn sàng"}</button>${!s.locked ? profileEditor(s) : '<p class="fine">Host đã khóa danh sách đội.</p>'}</section>`;
  else if (s.phase === "finished")
    content = `<section><h1>Kết quả của ${esc(team.name)}</h1><p class="player-score">Hạng ${team.rank} · ${clock(team.remainingMs)} dự trữ</p>${podium(s)}${leaderboard(s)}${review(s)}</section>`;
  else if (q && s.phase === "playing") {
    const mine = me.id === team.holder;
    content = `<div class="player-banner ${mine ? "" : "support"}">${holder ? avatar(holder.avatar) : ""}<div><strong>${mine ? "Đến lượt bạn giữ bom!" : `${esc(holder?.name || "Đồng đội")} đang giữ bom`}</strong><p>${mine ? "Đúng nhanh được cộng giây; sai bị trừ 8 giây." : "Bạn có thể góp ý; chỉ người giữ bom gửi đáp án."}</p></div></div><section class="question-panel"><div class="question-meta"><span>Sinh tồn · Câu ${q.number}</span><span>Chỉ gửi một lần</span></div><h1>${esc(q.text)}</h1><div class="options">${q.options.map((o, index) => `<button class="option${selectedOption === o.id ? " selected" : ""}${o.rejected ? " rejected" : ""}" data-option="${esc(o.id)}" aria-pressed="${selectedOption === o.id}" ${!mine || o.rejected || q.answered || requestBusy ? "disabled" : ""}><span class="letter">${"ABCD"[index]}</span><span>${esc(o.text)}</span></button>`).join("")}</div>${mine ? `<button id="answer-submit" class="question-submit" ${!selectedOption || requestBusy || q.answered ? "disabled" : ""}>${q.answered ? "Đã gửi — chờ kết quả" : requestBusy ? "Đang gửi…" : "Trả lời"}</button><p class="fine" id="answer-lock" role="status"></p>` : '<p class="notice">Bạn đang hỗ trợ đồng đội. Chờ đến lượt mình nhé!</p>'}${team.feedback ? `<p class="feedback ${esc(team.feedback.kind)}" role="status">${esc(team.feedback.text)}</p>` : ""}</section>`;
  } else
    content = `<section class="panel waiting-panel"><div class="waiting-illustration" aria-hidden="true">${team.eliminated ? "💥" : "💣"}</div><h1>${team.eliminated ? "Bom đội bạn đã nổ" : phaseLabel(s)}</h1><p>${team.eliminated ? "Đội đã dừng chơi. Cùng theo dõi cuộc đua của những đội còn lại." : s.phase === "paused" ? "Tất cả đồng hồ đều dừng; không ai được gửi đáp án." : "Chuẩn bị cùng đội trả lời để tích lũy thời gian."}</p><p class="player-score">Sống sót ${clock(team.survivedMs)} · Hạng ${team.rank}</p></section>${team.eliminated ? leaderboard(s) : ""}`;
  preserveRender(
    `<div class="player"><div class="player-heading"><div class="member">${avatar(me.avatar, true)}<span class="member-name">${esc(me.name)}<small>${esc(team.name)} · Phòng ${esc(s.code)}</small></span></div>${timerBlock(s)}</div>${!s.hostConnected ? '<p class="notice warning">Host đang mất kết nối. Các đội vẫn chơi; giờ trên máy chủ tiếp tục chạy.</p>' : ""}${content}<section class="panel player-team"><div class="team-top"><h2>${esc(team.name)}</h2><span class="badge">${clock(team.remainingMs)} dự trữ</span></div><div class="member-list">${s.players
      .filter((p) => p.teamId === me.teamId)
      .map((p) => member(p, team.holder, s.phase === "lobby"))
      .join("")}</div></section></div>`,
  );
  bindActions();
  bindProfile();
  document.querySelectorAll("[data-option]").forEach(
    (button) =>
      (button.onclick = () => {
        selectedOption = button.dataset.option;
        document.querySelectorAll("[data-option]").forEach((b) => {
          b.classList.toggle("selected", b.dataset.option === selectedOption);
          b.setAttribute(
            "aria-pressed",
            String(b.dataset.option === selectedOption),
          );
        });
        renderTimers();
      }),
  );
  if ($("#answer-submit"))
    $("#answer-submit").onclick = async () => {
      if (requestBusy || !selectedOption) return;
      const currentTurn = q.id,
        option = selectedOption;
      requestBusy = true;
      renderTimers();
      try {
        const result = await rpc.call("answer", {
          turnId: currentTurn,
          option,
        });
        selectedOption = null;
        if (result.correct === false)
          toast("Chưa đúng: −8 giây. Đã chuyển lượt và câu mới.");
      } catch (error) {
        toast(error.message, true);
      } finally {
        requestBusy = false;
        if (state) render();
      }
    };
}
function profileEditor(s) {
  return `<details data-keep="profile"><summary>Sửa avatar, tên hoặc đội</summary><form id="profile-form" class="form-stack"><label>Tên hiển thị<input id="profile-name" value="${esc(s.me.name)}" minlength="2" maxlength="30" required></label><label>Avatar<select id="profile-avatar">${avatars.map((a, i) => `<option value="${i}" ${s.me.avatar === i ? "selected" : ""}>${a.icon} ${esc(a.name)}</option>`).join("")}</select></label><label>Đội<select id="profile-team">${s.teams.map((t) => `<option value="${t.id}" ${t.id === s.me.teamId ? "selected" : ""}>${esc(t.name)}</option>`).join("")}</select></label><button type="submit" class="secondary">Lưu hồ sơ</button></form></details>`;
}
function bindProfile() {
  if ($("#profile-form"))
    $("#profile-form").onsubmit = async (event) => {
      event.preventDefault();
      if (
        await act("profile", {
          name: $("#profile-name").value,
          avatar: Number($("#profile-avatar").value),
          teamId: Number($("#profile-team").value),
        })
      )
        document
          .querySelectorAll('[id^="profile-"]')
          .forEach((el) => delete el.dataset.dirty);
    };
}
function renderTimers() {
  if (!state) return;
  const now = matchNow(state),
    active = state.phase === "playing";
  const own = state.me
    ? state.teams.find((t) => t.id === state.me.teamId)
    : null;
  const remaining = (t) =>
    state.phase === "lobby"
      ? state.config.duration * 1000
      : state.phase === "finished" || t.eliminated
        ? t.remainingMs
        : Math.max(0, t.deadline - now);
  const value =
    state.phase === "countdown"
      ? Math.max(0, state.nextAt - (Date.now() + serverOffset))
      : own
        ? own.eliminated
          ? own.survivedMs
          : remaining(own)
        : state.phase === "lobby"
          ? state.config.matchLimit * 1000
          : Math.max(0, state.deadline - now);
  document.querySelectorAll("[data-timer]").forEach((el) => {
    el.textContent = clock(value);
    el.classList.toggle("urgent", active && value <= 15000);
  });
  document.querySelectorAll("[data-team-clock]").forEach((el) => {
    const t = state.teams[Number(el.dataset.teamClock)];
    el.textContent = clock(
      state.phase === "finished" ? t.survivedMs : remaining(t),
    );
  });
  document.querySelectorAll("[data-fuse]").forEach((el) => {
    const t = state.teams[Number(el.dataset.fuse)];
    el.style.width = `${Math.max(0, Math.min(100, (remaining(t) / (state.config.maxReserve * 1000)) * 100))}%`;
  });
  if ($("#answer-submit")) {
    const q = own?.question,
      expired =
        !active ||
        own.eliminated ||
        now >= own.deadline ||
        now >= state.deadline;
    $("#answer-submit").disabled =
      !selectedOption ||
      requestBusy ||
      expired ||
      rpc.socket.readyState !== WebSocket.OPEN;
    if ($("#answer-lock"))
      $("#answer-lock").textContent = "Mỗi câu chỉ gửi một đáp án.";
    document.querySelectorAll("[data-option]").forEach((button) => {
      if (q)
        button.disabled =
          state.me.id !== own.holder ||
          q.options.find((o) => o.id === button.dataset.option)?.rejected ||
          requestBusy ||
          expired;
    });
  }
}
function confirmAction(title, message, reason = false) {
  return new Promise((resolve) => {
    const dialog = $("#confirm-dialog");
    $("#dialog-title").textContent = title;
    $("#dialog-text").textContent = message;
    $("#reason-label").hidden = !reason;
    $("#dialog-reason").required = reason;
    $("#dialog-reason").value = "";
    const handler = () => {
      dialog.removeEventListener("close", handler);
      resolve(
        dialog.returnValue === "confirm"
          ? reason
            ? $("#dialog-reason").value
            : true
          : false,
      );
    };
    dialog.addEventListener("close", handler);
    dialog.showModal();
  });
}
async function applyOrigin() {
  try {
    const url = new URL($("#join-origin").value);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password
    )
      throw new Error();
    joinBase = url.origin;
    sessionStorage.setItem("vnr-join-origin", joinBase);
    render();
  } catch {
    toast(
      "Nhập địa chỉ http:// hoặc https:// hợp lệ, không chứa mật khẩu.",
      true,
    );
  }
}
function bindActions() {
  document.querySelectorAll("[data-action]").forEach(
    (button) =>
      (button.onclick = async () => {
        const action = button.dataset.action;
        if (["start", "pause", "resume", "lock", "ready"].includes(action))
          await act(action);
        else if (action === "force-start") {
          if (
            await confirmAction(
              "Bắt đầu ngay?",
              "Một số người có thể chưa bấm Sẵn sàng. Mỗi đội vẫn cần ít nhất một người kết nối.",
            )
          )
            await act("start", { force: true });
        } else if (action === "save-config") {
          if (await act("config", draft))
            toast("Đã lưu thời gian bom và bộ câu hỏi.");
        } else if (action === "cancel") {
          const reason = await confirmAction(
            "Hủy toàn bộ trận?",
            "Mọi thời gian, kết quả và lượt giữ bom được xóa. Quay về phòng chờ để bắt đầu trận mới công bằng.",
            true,
          );
          if (reason) await act("cancel", { reason });
        } else if (action === "end") {
          const reason = await confirmAction(
            "Kết thúc sớm?",
            "Chốt theo thời gian sống sót và dự trữ tại thời điểm dừng.",
            true,
          );
          if (reason) await act("end", { reason });
        } else if (action === "copy-join") copy(joinUrl());
        else if (action === "apply-origin") applyOrigin();
        else if (action === "screen")
          window.open(
            `/?mode=screen&room=${state.code}&joinOrigin=${encodeURIComponent(joinBase)}`,
            "_blank",
            "noopener",
          );
        else if (action === "fullscreen") {
          try {
            if (document.fullscreenElement) await document.exitFullscreen();
            else await document.documentElement.requestFullscreen();
          } catch {
            toast("Trình duyệt này chưa hỗ trợ toàn màn hình.", true);
          }
        } else if (action === "observer") {
          const result = await act("observer");
          if (result) {
            const url = `${location.origin}/?mode=observer&room=${state.code}#observer=${result.token}`;
            await copy(
              url,
              "Đã sao chép link giám sát riêng. Chỉ gửi cho người được phép xem log.",
            );
          }
        } else if (action === "leave") {
          if (
            await confirmAction(
              "Rời giao diện?",
              "Giữ phiên đã lưu để có thể mở lại vai trò này trên cùng tab. Không xóa kết quả hoặc phòng.",
            )
          ) {
            rpc.stop();
            state = null;
            location.assign("/");
          }
        } else if (action === "new-room") {
          if (
            await confirmAction(
              "Tạo phòng mới?",
              "Kết quả phòng cũ vẫn được lưu. Bạn cần nhập lại khóa host để tạo phòng mới.",
            )
          ) {
            sessionStorage.removeItem(storageKey);
            rpc.stop();
            location.assign("/?mode=host");
          }
        } else if (action === "export") {
          const result = await act("export");
          if (!result) return;
          const cell = (value) =>
            `"${String(value ?? "")
              .replace(/^[=+\-@\t\r]/, (c) => `'${c}`)
              .replace(/"/g, '""')}"`;
          const csv =
            "\ufeff" +
            [
              ["Thời gian", "Sự kiện", "Nội dung", "Đội", "Người chơi"],
              ...result.logs.map((l) => [
                new Date(l.at).toISOString(),
                l.type,
                l.message,
                l.teamId ?? "",
                l.playerId || "",
              ]),
            ]
              .map((row) => row.map(cell).join(","))
              .join("\r\n");
          const url = URL.createObjectURL(
            new Blob([csv], { type: "text/csv;charset=utf-8" }),
          );
          const a = document.createElement("a");
          a.href = url;
          a.download = `vnr202-${state.code}-log.csv`;
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
      }),
  );
}
async function copy(value, message = "Đã sao chép link tham gia.") {
  try {
    await navigator.clipboard.writeText(value);
    toast(message);
  } catch {
    const dialog = $("#confirm-dialog");
    $("#dialog-title").textContent = "Sao chép thủ công";
    $("#dialog-text").textContent = value;
    $("#reason-label").hidden = true;
    $("#dialog-reason").required = false;
    dialog.showModal();
  }
}
async function initialize() {
  entry();
  rpc = new Client(receive, async () => {
    const sent = Date.now();
    const ping = await rpc.call("ping");
    serverOffset = ping.serverNow - (sent + Date.now()) / 2;
    if (mode === "screen") {
      try {
        const result = await rpc.call("watch", { code: params.get("room") });
        receive(result.state);
      } catch (error) {
        $("#main").innerHTML =
          `<div class="player panel"><h1>Không mở được màn chiếu</h1><p>${esc(error.message)}</p><a href="/">Về trang tham gia</a></div>`;
      }
    } else if (saved?.token || observerToken) {
      try {
        const result = await rpc.call("resume", {
          code: saved?.code || params.get("room"),
          token: saved?.token || observerToken,
        });
        observerToken = null;
        saveSession(result);
      } catch (error) {
        saved = null;
        sessionStorage.removeItem(storageKey);
        state = null;
        toast(error.message, true);
        entry();
      }
    }
  });
  if (
    ["localhost", "127.0.0.1"].includes(location.hostname) &&
    !sessionStorage.getItem("vnr-join-origin")
  ) {
    try {
      const network = await fetch("/api/network").then((r) => r.json());
      if (network.addresses.length) {
        joinBase = network.addresses[0];
        if (state) render();
      }
    } catch {
      /* current origin remains usable on this machine */
    }
  }
}
let lastSignal = 0;
document.addEventListener("input", (event) => {
  if (/^(name-|team-|profile-|join-origin)/.test(event.target.id))
    event.target.dataset.dirty = "true";
});
function signal(kind) {
  if (!state?.me || Date.now() - lastSignal < 1200) return;
  lastSignal = Date.now();
  rpc.call("signal", { kind }).catch(() => {});
}
document.addEventListener("visibilitychange", () =>
  signal(document.hidden ? "hidden" : "visible"),
);
window.addEventListener("blur", () => signal("blur"));
document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement) signal("fullscreen-exit");
});
setInterval(renderTimers, 200);
initialize();
