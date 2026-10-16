/**
 * ĐẤU TRƯỜNG LỊCH SỬ VNR202 - MAIN LOGIC
 * Tự do thi đấu (Blooket-Style) + Host Live Leaderboard + Bục vinh danh Top 3
 */

// ============================================================
// 1. ÂM THANH TRANG TRỌNG & SÔI NỔI (WEB AUDIO API TỰ ĐỘNG)
// ============================================================
class SoundEffects {
  constructor() {
    this.ctx = null;
    this.enabled = localStorage.getItem('vnr202_sound') !== 'false';
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.ctx = new AudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('vnr202_sound', this.enabled);
    return this.enabled;
  }

  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  click() {
    this.playTone(600, 'triangle', 0.08, 0.08);
  }

  correct() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    // Hợp âm vang tươi sáng (Do - Mi - Sol - Do cao)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.25, 0.12), idx * 70);
    });
  }

  wrong() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    // Âm trầm êm dịu (không gay gắt)
    this.playTone(220, 'sawtooth', 0.25, 0.08);
    setTimeout(() => this.playTone(185, 'sawtooth', 0.35, 0.08), 120);
  }

  countdownTick() {
    this.playTone(880, 'sine', 0.05, 0.04);
  }

  victory() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    // Khúc khải hoàn ca chiến thắng
    const fanfare = [
      { f: 523.25, d: 0.15, w: 0 },
      { f: 659.25, d: 0.15, w: 140 },
      { f: 783.99, d: 0.2, w: 280 },
      { f: 1046.50, d: 0.6, w: 460 }
    ];
    fanfare.forEach(item => {
      setTimeout(() => this.playTone(item.f, 'triangle', item.d, 0.2), item.w);
    });
  }

  // ÂM THANH CANDY QUEST (BLOOKET STYLE)
  chestOpen() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    // Hợp âm ríu rít mở rương thần kỳ (sparkle ascending)
    const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.15, 0.09), idx * 40);
    });
  }

  jackpot() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    // Hoan ca bùng nổ khi trúng lớn (+5,000 / x2 / +50%)
    const fanfare = [
      { f: 523.25, d: 0.12, w: 0 },
      { f: 659.25, d: 0.12, w: 90 },
      { f: 783.99, d: 0.15, w: 180 },
      { f: 1046.50, d: 0.22, w: 280 },
      { f: 1318.51, d: 0.45, w: 410 }
    ];
    fanfare.forEach(item => {
      setTimeout(() => this.playTone(item.f, 'triangle', item.d, 0.18), item.w);
    });
  }

  steal() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    // Âm kiếm chém vút nhanh cướp điểm (swoosh steal)
    this.playTone(750, 'sawtooth', 0.1, 0.12);
    setTimeout(() => this.playTone(1100, 'sine', 0.18, 0.14), 70);
    setTimeout(() => this.playTone(550, 'triangle', 0.22, 0.1), 160);
  }

  bomb() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    // Tiếng nổ trầm rung chuyển màn hình (low boom)
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.6);
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.6);
    } catch (e) { }
  }

  pointLoss() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    // Âm điệu đi xuống buồn rầu (-điểm, -%)
    this.playTone(392, 'sine', 0.18, 0.09);
    setTimeout(() => this.playTone(329.63, 'sine', 0.22, 0.09), 120);
    setTimeout(() => this.playTone(261.63, 'sine', 0.32, 0.09), 260);
  }
}

const sound = new SoundEffects();

// ============================================================
// 2. MẠNG ĐỒNG BỘ THỜI GIAN THỰC (MQTT OVER WSS + BROADCAST CHANNEL)
// ============================================================
class RealtimeSync {
  constructor(roomCode, isHost = false) {
    this.roomCode = String(roomCode).trim();
    this.isHost = isHost;
    this.mqttClient = null;
    this.listeners = [];
    this.outboxQueue = [];
    this.isSubscribed = false;
    this.clientId = 'vnr202_' + (isHost ? 'h_' : 'p_') + Math.random().toString(36).substring(2, 8);
    this.brokerIndex = 0;
    this.brokers = [
      'wss://broker.emqx.io:8084/mqtt',
      'wss://broker.hivemq.com:8884/mqtt'
    ];

    // Kênh đồng bộ nội bộ giữa các tab trên cùng máy
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.bc = new BroadcastChannel('vnr202_room_' + this.roomCode);
        this.bc.onmessage = (event) => {
          this.emitMessage(event.data);
        };
      } catch (e) { }
    }

    this.connectMqtt();
  }

  connectMqtt() {
    if (typeof mqtt === 'undefined') {
      console.warn("MQTT library not loaded, using Local BroadcastChannel fallback.");
      return;
    }

    const brokerUrl = this.brokers[this.brokerIndex];
    console.log(`[MQTT] Connecting to ${brokerUrl} (Room ${this.roomCode}, ${this.isHost ? 'Host' : 'Player'})...`);

    try {
      this.mqttClient = mqtt.connect(brokerUrl, {
        clientId: this.clientId,
        clean: true,
        connectTimeout: 6000,
        reconnectPeriod: 2500,
        keepalive: 30
      });

      this.mqttClient.on('connect', () => {
        console.log(`[MQTT] ✅ Connected to ${brokerUrl} as ${this.isHost ? 'Host' : 'Player'}`);
        // Lắng nghe tất cả các tin nhắn trong phòng
        const topic = `vnr202/rooms/${this.roomCode}/#`;
        this.mqttClient.subscribe(topic, { qos: 0 }, (err) => {
          if (err) {
            console.error("[MQTT] Subscribe error:", err);
            return;
          }
          this.isSubscribed = true;
          console.log(`[MQTT] Subscribed to topic: ${topic}`);
          // Xả ngay lập tức mọi tin nhắn đang xếp hàng chờ gửi!
          this.flushOutbox();
        });
      });

      this.mqttClient.on('message', (topic, payload) => {
        try {
          const data = JSON.parse(payload.toString());
          // Bỏ qua tin nhắn do chính mình gửi
          if (data._sender === this.clientId) return;
          this.emitMessage(data);
        } catch (e) {
          console.error("[MQTT] Parse error:", e);
        }
      });

      this.mqttClient.on('error', (err) => {
        console.warn(`[MQTT] Connection warning on ${brokerUrl}:`, err);
        this.tryNextBroker();
      });

      this.mqttClient.on('offline', () => {
        this.isSubscribed = false;
      });
    } catch (e) {
      console.warn("[MQTT] Init exception:", e);
      this.tryNextBroker();
    }
  }

  tryNextBroker() {
    if (this.isSubscribed || this.brokers.length <= 1) return;
    this.isSubscribed = false;
    if (this.mqttClient) {
      try { this.mqttClient.end(true); } catch (e) { }
    }
    this.brokerIndex = (this.brokerIndex + 1) % this.brokers.length;
    console.log(`[MQTT] Failover switching to: ${this.brokers[this.brokerIndex]}`);
    setTimeout(() => this.connectMqtt(), 800);
  }

  flushOutbox() {
    if (!this.mqttClient || !this.mqttClient.connected || !this.isSubscribed) return;
    while (this.outboxQueue.length > 0) {
      const payload = this.outboxQueue.shift();
      const topic = `vnr202/rooms/${this.roomCode}/${this.isHost ? 'host' : 'player'}`;
      try {
        this.mqttClient.publish(topic, JSON.stringify(payload), { qos: 0 });
      } catch (e) {
        console.warn("[MQTT] Publish failed:", e);
      }
    }
  }

  onMessage(cb) {
    this.listeners.push(cb);
  }

  emitMessage(data) {
    this.listeners.forEach(cb => {
      try { cb(data); } catch (e) { console.error("Listener error:", e); }
    });
  }

  send(data) {
    const payload = { ...data, _sender: this.clientId, _time: Date.now() };

    // Gửi qua BroadcastChannel (nội bộ tab trên cùng máy)
    if (this.bc) {
      try { this.bc.postMessage(payload); } catch (e) { }
    }

    // Gửi qua MQTT Broker ra Internet
    if (this.mqttClient && this.mqttClient.connected && this.isSubscribed) {
      const topic = `vnr202/rooms/${this.roomCode}/${this.isHost ? 'host' : 'player'}`;
      try {
        this.mqttClient.publish(topic, JSON.stringify(payload), { qos: 0 });
      } catch (e) {
        this.outboxQueue.push(payload);
      }
    } else {
      // Đưa vào hàng đợi để gửi ngay khi vừa kết nối xong!
      this.outboxQueue.push(payload);
    }
  }

  destroy() {
    if (this.bc) {
      try { this.bc.close(); } catch (e) { }
    }
    if (this.mqttClient) {
      try { this.mqttClient.end(true); } catch (e) { }
    }
    this.isSubscribed = false;
    this.outboxQueue = [];
  }
}

// ============================================================
// 3. QUẢN LÝ ỨNG DỤNG (APPLICATION CONTROLLER)
// ============================================================
// Danh sách Avatar nhân vật Blooket phong phú kèm tên gọi cho người chơi
const BLOOK_AVATARS = [
  { icon: '🦁', name: 'Sư Tử' },
  { icon: '🐯', name: 'Hổ Vàng' },
  { icon: '🦅', name: 'Đại Bàng' },
  { icon: '🐺', name: 'Sói Xám' },
  { icon: '🦊', name: 'Hồ Ly' },
  { icon: '🐻', name: 'Gấu Nâu' },
  { icon: '🐼', name: 'Gấu Trúc' },
  { icon: '🦉', name: 'Cú Mèo' },
  { icon: '🦄', name: 'Kỳ Lân' },
  { icon: '🐲', name: 'Rồng Thần' },
  { icon: '⚡', name: 'Tia Chớp' },
  { icon: '🎖️', name: 'Huy Chương' },
  { icon: '🚀', name: 'Tên Lửa' },
  { icon: '🛡️', name: 'Khiên Thần' },
  { icon: '⚔️', name: 'Gươm Chiến' },
  { icon: '🎯', name: 'Bách Trúng' },
  { icon: '👑', name: 'Vương Miện' },
  { icon: '🔥', name: 'Ngọn Lửa' },
  { icon: '💎', name: 'Kim Cương' },
  { icon: '🌟', name: 'Ngôi Sao' },
  { icon: '🏆', name: 'Cúp Vàng' },
  { icon: '🥇', name: 'Huy Chương Vàng' },
  { icon: '🚩', name: 'Cờ Đỏ' },
  { icon: '🤖', name: 'Robot' },
  { icon: '🛸', name: 'Phi Thuyền' },
  { icon: '🐱', name: 'Mèo Mun' },
  { icon: '🐶', name: 'Cún Cưng' },
  { icon: '🐵', name: 'Ngộ Không' },
  { icon: '🐸', name: 'Ếch Xanh' },
  { icon: '🐢', name: 'Rùa Vàng' },
  { icon: '🐙', name: 'Bạch Tuộc' },
  { icon: '🐬', name: 'Cá Heo' }
];

function getPlayerAvatar(name, seed = 0) {
  if (!name) return BLOOK_AVATARS[0].icon;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff;
  }
  const idx = Math.abs(hash + seed) % BLOOK_AVATARS.length;
  return BLOOK_AVATARS[idx].icon;
}

// ============================================================
// DANH MỤC PHẦN THƯỞNG CANDY QUEST (MỞ RƯƠNG BÍ ẨN BLOOKET)
// ============================================================
const CANDY_QUEST_REWARDS = [
  // 1. TĂNG ĐIỂM CỐ ĐỊNH (Flat Points)
  {
    type: 'fixed_gain',
    title: '+1,000 ĐIỂM',
    sub: 'Túi vàng tiếp tế quân lương!',
    icon: '💰',
    sound: 'correct',
    calculate: (score) => ({ delta: 1000, newScore: score + 1000, desc: 'Tuyệt vời! Bạn nhận thêm +1,000 điểm!' })
  },
  {
    type: 'fixed_gain',
    title: '+2,500 ĐIỂM',
    sub: 'Rương báu chiến công rực rỡ!',
    icon: '💎',
    sound: 'jackpot',
    calculate: (score) => ({ delta: 2500, newScore: score + 2500, desc: 'Chiến công hiển hách! Bạn nhận +2,500 điểm!' })
  },
  {
    type: 'fixed_gain',
    title: '+5,000 ĐIỂM',
    sub: 'KHO BÁU HUYỀN THOẠI ĐẠI THẮNG!',
    icon: '👑',
    sound: 'jackpot',
    calculate: (score) => ({ delta: 5000, newScore: score + 5000, desc: 'JACKPOT ĐẠI THẮNG! Bạn nhận được +5,000 điểm!' })
  },
  {
    type: 'fixed_gain',
    title: '+500 ĐIỂM',
    sub: 'Thỏi bạc động viên tinh thần chiến đấu',
    icon: '🪙',
    sound: 'correct',
    calculate: (score) => ({ delta: 500, newScore: score + 500, desc: 'Bạn nhận thêm +500 điểm!' })
  },

  // 2. TĂNG PHẦN TRĂM ĐIỂM SỐ (% Boost)
  {
    type: 'percent_gain',
    title: '+25% ĐIỂM SỐ',
    sub: 'Khí thế dâng cao, tăng 25% tổng điểm!',
    icon: '📈',
    sound: 'jackpot',
    calculate: (score) => {
      const delta = Math.max(300, Math.round(score * 0.25));
      return { delta, newScore: score + delta, desc: `Khí thế ngút trời! Tăng 25% (+${delta.toLocaleString()} điểm)!` };
    }
  },
  {
    type: 'percent_gain',
    title: '+50% ĐIỂM SỐ',
    sub: 'Chi viện thần tốc, tăng 50% tổng điểm!',
    icon: '🚀',
    sound: 'jackpot',
    calculate: (score) => {
      const delta = Math.max(600, Math.round(score * 0.5));
      return { delta, newScore: score + delta, desc: `Tăng vọt 50% (+${delta.toLocaleString()} điểm)!` };
    }
  },

  // 3. GẤP ĐÔI ĐIỂM SỐ (x2 Double)
  {
    type: 'double',
    title: 'x2 GẤP ĐÔI ĐIỂM!',
    sub: 'VẬN MAY BÙNG NỔ! NHÂN ĐÔI TỔNG ĐIỂM SỐ!',
    icon: '🔥',
    sound: 'jackpot',
    calculate: (score) => {
      const delta = Math.max(1200, score);
      return { delta, newScore: score + delta, desc: `GẤP ĐÔI ĐIỂM SỐ! Nhận thêm +${delta.toLocaleString()} điểm!` };
    }
  },

  // 4. CƯỚP ĐIỂM ĐỐI THỦ (Steal)
  {
    type: 'steal',
    stealType: 'percent',
    stealPercent: 0.25,
    title: 'CƯỚP 25% ĐIỂM',
    sub: 'Đột kích chớp nhoáng! Cướp 25% điểm của 1 đối thủ!',
    icon: '🥷',
    sound: 'steal'
  },
  {
    type: 'steal',
    stealType: 'fixed',
    stealAmount: 1500,
    title: 'CƯỚP 1,500 ĐIỂM',
    sub: 'Chiến thuật vu hồi! Cướp 1,500 điểm của 1 đối thủ!',
    icon: '⚔️',
    sound: 'steal'
  },

  // 5. MẤT ĐIỂM / GIẢM % (Penalties)
  {
    type: 'fixed_loss',
    title: '-1,000 ĐIỂM',
    sub: 'Rơi vào bẫy phục kích, hao hụt 1,000 điểm!',
    icon: '🪤',
    sound: 'pointLoss',
    calculate: (score) => {
      const delta = -Math.min(1000, score);
      return { delta, newScore: Math.max(0, score - 1000), desc: 'Tiếc quá! Bạn rơi vào bẫy phục kích và bị trừ 1,000 điểm!' };
    }
  },
  {
    type: 'percent_loss',
    title: '-25% ĐIỂM SỐ',
    sub: 'Hao hụt tiếp tế, giảm 25% tổng điểm!',
    icon: '📉',
    sound: 'pointLoss',
    calculate: (score) => {
      const delta = -Math.round(score * 0.25);
      return { delta, newScore: Math.max(0, score + delta), desc: `Hao hụt tiếp tế! Bị trừ 25% (${delta.toLocaleString()} điểm)!` };
    }
  },

  // 6. MẤT HẾT ĐIỂM (BOM NỔ)
  {
    type: 'bankrupt',
    title: '💥 BOM NỔ - MẤT HẾT ĐIỂM!',
    sub: 'Dẫm phải bãi mìn! Điểm số trở về con số 0!',
    icon: '💣',
    sound: 'bomb',
    calculate: (score) => {
      return { delta: -score, newScore: 0, desc: '💥 BÙM! Dẫm phải bãi mìn, toàn bộ điểm số bị quét sạch về 0!' };
    }
  },

  // 7. RƯƠNG TRỐNG
  {
    type: 'empty',
    title: 'RƯƠNG TRỐNG RỖNG',
    sub: 'Chỉ có không khí bên trong... Không có gì cả!',
    icon: '💨',
    sound: 'wrong',
    calculate: (score) => {
      return { delta: 0, newScore: score, desc: 'Rương trống rỗng không có gì! Chúc bạn may mắn ở câu tiếp theo.' };
    }
  }
];

class AppController {
  constructor() {
    this.currentView = 'view-role-select';
    this.sync = null;

    // Trạng thái Host
    this.hostRoomCode = '';
    this.hostPlayers = {}; // id -> { id, name, avatar, score, streak, correctCount, count, isBot }
    this.hostTimerDuration = 300; // 5 phút mặc định
    this.hostTimerRemaining = 300;
    this.hostTimerInterval = null;
    this.hostIsRunning = false;
    this.botInterval = null;
    this.hostRecentLogs = [];

    // Trạng thái Player (lưu playerId cố định vào localStorage để không bị cấp ID mới khi F5)
    let savedPlayerId = localStorage.getItem('vnr202_player_id');
    if (!savedPlayerId) {
      savedPlayerId = 'p_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('vnr202_player_id', savedPlayerId);
    }
    this.playerId = savedPlayerId;
    this.playerName = '';
    this.playerAvatar = BLOOK_AVATARS[0].icon;
    this.playerRoomCode = '';
    this.playerScore = 0;
    this.playerStreak = 0;
    this.playerCorrectCount = 0;
    this.playerAnsweredCount = 0;
    this.playerQuestions = [];
    this.playerCurrentQIndex = 0;
    this.playerTimerInterval = null;
    this.playerTimerRemaining = 300;

    // Trạng thái Candy Quest (3 Rương Bí Ẩn Blooket)
    this.candyQuestActive = false;
    this.currentCandyRewards = [];
    this.candyAutoTimer = null;
    this.candyPickTimerInterval = null;
    this.candyPickTimerRemaining = 100; // 10 giây (100 ticks x 100ms)
    this.roomCompetitors = [];

    // Bộ định thời heartbeat đồng bộ mạng giữa Host & Player
    this.playerJoinHeartbeat = null;
    this.hostLobbySyncInterval = null;

    this.initDom();
    this.checkUrlParams();
  }

  initDom() {
    // Tự động lưu phiên trước khi reload/refresh (KHÔNG hiện hộp thoại native phiền toái, tự khôi phục sau khi tải lại)
    window.addEventListener('beforeunload', () => {
      if (this.hostRoomCode) this.saveHostSession();
      if (this.playerRoomCode) this.savePlayerSession();
    });

    // Header Buttons - Khóa logo khi đang trong trận đấu hoặc sảnh chờ; Cho phép quay về khi đã kết thúc game
    document.getElementById('brand-home-btn').addEventListener('click', (e) => {
      e.preventDefault();
      const inActiveMatch = (
        this.currentView === 'view-host-lobby' ||
        this.currentView === 'view-host-live' ||
        this.currentView === 'view-player-waiting' ||
        this.currentView === 'view-player-game'
      );
      if (inActiveMatch) {
        // Đang trong trận đấu hoặc sảnh chờ: không cho thoát về trang chủ để tránh bấm nhầm
        return;
      }
      this.confirmGoHome();
    });
    document.getElementById('header-home-btn').addEventListener('click', () => {
      this.confirmGoHome();
    });
    document.getElementById('audio-toggle-btn').addEventListener('click', () => {
      const isEnabled = sound.toggle();
      document.getElementById('audio-icon').textContent = isEnabled ? 'volume_up' : 'volume_off';
    });

    // View 1: Role Selection
    document.getElementById('btn-select-player').addEventListener('click', () => {
      sound.click();
      this.switchView('view-player-join');
    });
    document.getElementById('btn-select-host').addEventListener('click', () => {
      sound.click();
      this.setupHostRoom();
    });

    // View 2: Player Join Form
    document.getElementById('btn-player-submit-join').addEventListener('click', () => {
      this.handlePlayerJoinSubmit();
    });

    // Khởi tạo bộ chọn Avatar tại màn hình Đăng ký
    this.renderAvatarPickerGrid('join-avatar-grid', this.playerAvatar, (chosen) => {
      sound.click();
      this.playerAvatar = chosen.icon;
      const previewIcon = document.getElementById('join-avatar-preview-icon');
      const previewName = document.getElementById('join-avatar-preview-name');
      if (previewIcon) previewIcon.textContent = chosen.icon;
      if (previewName) previewName.textContent = chosen.name;
    });

    // Cài đặt đổi Avatar tại phòng chờ (Waiting room) qua POPUP MODAL TIỆN DỤNG
    const toggleAvatarBtn = document.getElementById('btn-toggle-waiting-avatar-modal');
    if (toggleAvatarBtn) {
      toggleAvatarBtn.addEventListener('click', () => {
        sound.click();
        this.openAvatarModal();
      });
    }

    const closeAvatarModalBtn = document.getElementById('btn-close-avatar-modal');
    if (closeAvatarModalBtn) {
      closeAvatarModalBtn.addEventListener('click', () => {
        sound.click();
        this.closeAvatarModal();
      });
    }

    const confirmAvatarModalBtn = document.getElementById('btn-confirm-avatar-modal');
    if (confirmAvatarModalBtn) {
      confirmAvatarModalBtn.addEventListener('click', () => {
        sound.click();
        this.confirmAvatarChoice();
      });
    }

    const avatarOverlay = document.getElementById('avatar-modal-overlay');
    if (avatarOverlay) {
      avatarOverlay.addEventListener('click', (e) => {
        if (e.target === avatarOverlay) {
          this.closeAvatarModal();
        }
      });
    }

    // Enter key triggers submit
    const inputs = ['player-room-pin-input', 'player-name-input'];
    inputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') this.handlePlayerJoinSubmit();
        });
      }
    });

    // View 4: Player Answer Buttons (A, B, C, D)
    const ansButtons = document.querySelectorAll('.answer-btn');
    ansButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.getAttribute('data-index'));
        this.handlePlayerSelectAnswer(index);
      });
    });

    // View 4: Candy Quest: 3 Rương Bí Ẩn (Blooket Style)
    for (let i = 0; i < 3; i++) {
      const chestEl = document.getElementById(`candy-chest-${i}`);
      if (chestEl) {
        chestEl.addEventListener('click', () => {
          this.handlePlayerPickChest(i);
        });
      }
    }

    const candyNextBtn = document.getElementById('btn-candy-continue');
    if (candyNextBtn) {
      candyNextBtn.addEventListener('click', () => {
        sound.click();
        this.closeCandyQuestAndNextQuestion();
      });
    }

    // View 6: Host Lobby Actions
    const timerSelect = document.getElementById('host-timer-select');
    if (timerSelect) {
      timerSelect.addEventListener('change', (e) => {
        this.hostTimerDuration = parseInt(e.target.value);
        this.hostTimerRemaining = this.hostTimerDuration;
      });
    }

    document.getElementById('btn-host-add-bots').addEventListener('click', () => {
      sound.click();
      this.addSimulatedBots(30);
    });

    document.getElementById('btn-host-start-game').addEventListener('click', () => {
      sound.click();
      this.startHostGame();
    });

    const copyBtn = document.getElementById('btn-copy-join-link');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        sound.click();
        const currentOrigin = window.location.origin + window.location.pathname;
        const joinUrl = `${currentOrigin}?room=${this.hostRoomCode}`;
        navigator.clipboard.writeText(joinUrl).then(() => {
          alert("Đã sao chép liên kết vào phòng thi đấu: " + joinUrl);
        }).catch(() => { });
      });
    }

    // View 7: Host Live Leaderboard - MỞ POPUP MODAL XÁC NHẬN KẾT THÚC
    const forceEndBtn = document.getElementById('btn-host-force-end');
    if (forceEndBtn) {
      forceEndBtn.addEventListener('click', () => {
        sound.click();
        this.openEndGameModal();
      });
    }

    const cancelEndBtn = document.getElementById('btn-modal-cancel-end');
    if (cancelEndBtn) {
      cancelEndBtn.addEventListener('click', () => {
        sound.click();
        this.closeEndGameModal();
      });
    }

    const confirmEndBtn = document.getElementById('btn-modal-confirm-end');
    if (confirmEndBtn) {
      confirmEndBtn.addEventListener('click', () => {
        sound.click();
        this.closeEndGameModal();
        this.endHostGame();
      });
    }

    const endOverlay = document.getElementById('end-game-modal-overlay');
    if (endOverlay) {
      endOverlay.addEventListener('click', (e) => {
        if (e.target === endOverlay) {
          this.closeEndGameModal();
        }
      });
    }

    // View 8: Host Podium Actions - Quay lại trang chủ hoặc tổ chức trận mới
    const hostGoHomeBtn = document.getElementById('btn-host-go-home');
    if (hostGoHomeBtn) {
      hostGoHomeBtn.addEventListener('click', () => {
        sound.click();
        this.confirmGoHome();
      });
    }

    document.getElementById('btn-host-play-again').addEventListener('click', () => {
      sound.click();
      this.setupHostRoom();
    });

    const exportScoresBtn = document.getElementById('btn-export-scores');
    if (exportScoresBtn) {
      exportScoresBtn.addEventListener('click', () => {
        sound.click();
        this.exportScoreboardToClipboard();
      });
    }

    // View 5: Player Finished Actions - Nút về trang chủ cho sinh viên
    const playerGoHomeBtn = document.getElementById('btn-player-go-home');
    if (playerGoHomeBtn) {
      playerGoHomeBtn.addEventListener('click', () => {
        sound.click();
        this.confirmGoHome();
      });
    }
  }

  openAvatarModal() {
    this.tempModalAvatar = this.playerAvatar || BLOOK_AVATARS[0].icon;
    const currentMeta = BLOOK_AVATARS.find(a => a.icon === this.tempModalAvatar) || BLOOK_AVATARS[0];

    const previewIcon = document.getElementById('modal-avatar-preview-icon');
    const previewName = document.getElementById('modal-avatar-preview-name');
    if (previewIcon) previewIcon.textContent = currentMeta.icon;
    if (previewName) previewName.textContent = currentMeta.name;

    this.renderAvatarPickerGrid('modal-avatar-grid', this.tempModalAvatar, (chosen) => {
      sound.click();
      this.tempModalAvatar = chosen.icon;
      if (previewIcon) previewIcon.textContent = chosen.icon;
      if (previewName) previewName.textContent = chosen.name;
    });

    const overlay = document.getElementById('avatar-modal-overlay');
    if (overlay) overlay.style.display = 'flex';
  }

  closeAvatarModal() {
    const overlay = document.getElementById('avatar-modal-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  confirmAvatarChoice() {
    if (this.tempModalAvatar) {
      this.playerAvatar = this.tempModalAvatar;
      const displayElem = document.getElementById('display-player-avatar');
      if (displayElem) displayElem.textContent = this.playerAvatar;

      if (this.sync) {
        this.sync.send({
          type: 'PLAYER_AVATAR_CHANGE',
          player: {
            id: this.playerId,
            avatar: this.playerAvatar
          }
        });
      }
      this.savePlayerSession();
      this.showToast(`✨ Đã đổi Linh Vật chiến sĩ: <strong>${this.playerAvatar}</strong>`);
    }
    this.closeAvatarModal();
  }

  openEndGameModal() {
    const overlay = document.getElementById('end-game-modal-overlay');
    if (overlay) overlay.style.display = 'flex';
  }

  closeEndGameModal() {
    const overlay = document.getElementById('end-game-modal-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  renderAvatarPickerGrid(containerId, currentSelectedIcon, onSelectCallback) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = BLOOK_AVATARS.map(item => `
      <div class="avatar-choice-item ${item.icon === currentSelectedIcon ? 'selected' : ''}" 
           data-icon="${item.icon}" 
           data-name="${item.name}" 
           title="${item.name}">
        ${item.icon}
      </div>
    `).join('');

    container.querySelectorAll('.avatar-choice-item').forEach(el => {
      el.addEventListener('click', () => {
        container.querySelectorAll('.avatar-choice-item').forEach(c => c.classList.remove('selected'));
        el.classList.add('selected');
        const icon = el.getAttribute('data-icon');
        const name = el.getAttribute('data-name');
        if (onSelectCallback) onSelectCallback({ icon, name });
      });
    });
  }

  showToast(message) {
    let toast = document.getElementById('vnr202-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'vnr202-toast';
      toast.className = 'vnr202-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = message;
    toast.classList.add('show');
    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }

  checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    const hostRoomParam = urlParams.get('host_room');
    const hostParam = urlParams.get('host');

    // 1. Kiểm tra session từ sessionStorage trước (chính xác nhất cho tab hiện tại)
    let activeSession = null;
    try {
      const s = sessionStorage.getItem('vnr202_active_session');
      if (s) activeSession = JSON.parse(s);
    } catch (e) { }

    // 2. Nếu sessionStorage trống, kiểm tra localStorage dự phòng
    if (!activeSession) {
      try {
        if (hostRoomParam) {
          const s = localStorage.getItem(`vnr202_host_${hostRoomParam}`);
          if (s) activeSession = JSON.parse(s);
        } else if (roomParam) {
          const s = localStorage.getItem(`vnr202_player_${roomParam}`);
          if (s) activeSession = JSON.parse(s);
        } else {
          // Thử khôi phục từ phòng host gần nhất
          const lastHost = localStorage.getItem('vnr202_last_host_room');
          if (lastHost) {
            const s = localStorage.getItem(`vnr202_host_${lastHost}`);
            if (s) activeSession = JSON.parse(s);
          }
        }
      } catch (e) { }
    }

    // 3. Khôi phục nếu tìm thấy phiên còn hiệu lực
    if (activeSession) {
      if (activeSession.role === 'host' && activeSession.roomCode) {
        console.log("[Auto-Recovery] Khôi phục phiên Host phòng", activeSession.roomCode);
        this.restoreHostSession(activeSession);
        this.showToast(`🛡️ Đã khôi phục phòng chiếu: <strong>${activeSession.roomCode}</strong>`);
        return;
      } else if (activeSession.role === 'player' && activeSession.roomCode) {
        console.log("[Auto-Recovery] Khôi phục phiên Player phòng", activeSession.roomCode);
        this.restorePlayerSession(activeSession);
        this.showToast(`🛡️ Đã khôi phục trận đấu của: <strong>${this.escapeHtml(activeSession.name)}</strong>`);
        return;
      }
    }

    // 4. Các trường hợp truy cập mới bình thường
    if (hostParam === '1' || hostRoomParam) {
      this.setupHostRoom(hostRoomParam);
    } else if (roomParam) {
      document.getElementById('player-room-pin-input').value = roomParam;
      this.switchView('view-player-join');
      const savedName = localStorage.getItem('vnr202_name');
      if (savedName) document.getElementById('player-name-input').value = savedName;
    } else {
      const savedName = localStorage.getItem('vnr202_name');
      if (savedName) document.getElementById('player-name-input').value = savedName;
    }
  }

  saveHostSession() {
    if (!this.hostRoomCode) return;
    try {
      const state = {
        role: 'host',
        roomCode: this.hostRoomCode,
        players: this.hostPlayers,
        duration: this.hostTimerDuration,
        remaining: this.hostTimerRemaining,
        isRunning: this.hostIsRunning,
        view: this.currentView,
        logs: this.hostRecentLogs || []
      };
      sessionStorage.setItem('vnr202_active_session', JSON.stringify(state));
      localStorage.setItem(`vnr202_host_${this.hostRoomCode}`, JSON.stringify(state));
      localStorage.setItem('vnr202_last_host_room', this.hostRoomCode);
    } catch (e) { }
  }

  savePlayerSession() {
    if (!this.playerRoomCode || !this.playerName) return;
    try {
      const state = {
        role: 'player',
        id: this.playerId,
        name: this.playerName,
        avatar: this.playerAvatar,
        roomCode: this.playerRoomCode,
        score: this.playerScore,
        streak: this.playerStreak,
        correctCount: this.playerCorrectCount,
        answeredCount: this.playerAnsweredCount,
        questions: this.playerQuestions,
        currentQIndex: this.playerCurrentQIndex,
        timerRemaining: this.playerTimerRemaining,
        view: this.currentView
      };
      sessionStorage.setItem('vnr202_active_session', JSON.stringify(state));
      localStorage.setItem(`vnr202_player_${this.playerRoomCode}`, JSON.stringify(state));
      localStorage.setItem('vnr202_last_player_room', this.playerRoomCode);
    } catch (e) { }
  }

  clearActiveSession() {
    try {
      sessionStorage.removeItem('vnr202_active_session');
      if (this.hostRoomCode) {
        localStorage.removeItem(`vnr202_host_${this.hostRoomCode}`);
      }
      if (this.playerRoomCode) {
        localStorage.removeItem(`vnr202_player_${this.playerRoomCode}`);
      }
      localStorage.removeItem('vnr202_last_host_room');
      localStorage.removeItem('vnr202_last_player_room');
    } catch (e) { }
  }

  restoreHostSession(state) {
    this.hostRoomCode = state.roomCode;
    this.hostPlayers = state.players || {};
    this.hostTimerDuration = state.duration || 300;
    this.hostTimerRemaining = (typeof state.remaining === 'number') ? state.remaining : 300;
    this.hostIsRunning = !!state.isRunning;
    this.hostRecentLogs = state.logs || [];

    // Cập nhật URL đồng bộ phòng
    try {
      window.history.replaceState(null, '', `?host_room=${this.hostRoomCode}`);
    } catch (e) { }

    document.getElementById('host-room-pin-text').textContent = this.hostRoomCode;
    const timerSelect = document.getElementById('host-timer-select');
    if (timerSelect) timerSelect.value = this.hostTimerDuration;

    // Tạo mã QR Code
    const qrContainer = document.getElementById('host-qr-container');
    if (qrContainer) {
      qrContainer.innerHTML = '';
      const currentOrigin = window.location.origin + window.location.pathname;
      const joinUrl = `${currentOrigin}?room=${this.hostRoomCode}`;

      const urlDisplay = document.getElementById('host-join-url-text');
      if (urlDisplay) {
        urlDisplay.textContent = (window.location.host + window.location.pathname).replace(/\/$/, '');
      }

      if (typeof QRCode !== 'undefined') {
        new QRCode(qrContainer, {
          text: joinUrl,
          width: 78,
          height: 78,
          colorDark: "#0E0E12",
          colorLight: "#FFFFFF",
          correctLevel: QRCode.CorrectLevel.M
        });
      }
    }

    // Kết nối lại Realtime
    if (this.sync) this.sync.destroy();
    this.sync = new RealtimeSync(this.hostRoomCode, true);
    this.sync.onMessage((msg) => this.handleHostIncomingMessage(msg));

    this.renderHostLobbyPlayers();
    this.syncHostPlayersToStorage();

    // Khôi phục nhật ký chiến trường nếu có
    if (this.hostRecentLogs.length > 0) {
      const feed = document.getElementById('host-live-log-feed');
      const countBadge = document.getElementById('host-log-count');
      if (feed) {
        feed.innerHTML = '';
        this.hostRecentLogs.forEach(entry => this.renderLogDomItem(entry, false));
      }
      if (countBadge) countBadge.textContent = `${this.hostRecentLogs.length} sự kiện`;
    }

    if (state.view === 'view-host-podium') {
      this.renderHostPodium();
      this.switchView('view-host-podium');
    } else if (state.view === 'view-host-live') {
      this.hostIsRunning = true;
      this.switchView('view-host-live');
      this.renderHostLiveLeaderboard();
      this.updateHostTimerDisplay();
      clearInterval(this.hostTimerInterval);
      this.hostTimerInterval = setInterval(() => {
        this.hostTimerRemaining--;
        this.updateHostTimerDisplay();
        if (this.hostTimerRemaining <= 0) {
          clearInterval(this.hostTimerInterval);
          this.endHostGame();
        }
      }, 1000);
      this.startBotSimulation();
    } else {
      this.switchView('view-host-lobby');
    }
  }

  restorePlayerSession(state) {
    this.playerId = state.id || this.playerId;
    this.playerName = state.name;
    this.playerAvatar = state.avatar || getPlayerAvatar(this.playerName);
    this.playerRoomCode = state.roomCode;
    this.playerScore = state.score || 0;
    this.playerStreak = state.streak || 0;
    this.playerCorrectCount = state.correctCount || 0;
    this.playerAnsweredCount = state.answeredCount || 0;
    this.playerQuestions = (state.questions && state.questions.length > 0) ? state.questions : this.shuffleArray([...QUESTIONS_BANK]);
    this.playerCurrentQIndex = state.currentQIndex || 0;
    this.playerTimerRemaining = (typeof state.timerRemaining === 'number') ? state.timerRemaining : 300;

    // Cập nhật URL đồng bộ phòng
    try {
      window.history.replaceState(null, '', `?room=${this.playerRoomCode}`);
    } catch (e) { }

    document.getElementById('display-player-name').textContent = this.playerName;
    const heroAvatar = document.getElementById('display-player-avatar');
    if (heroAvatar) heroAvatar.textContent = this.playerAvatar;
    document.getElementById('display-waiting-room').textContent = this.playerRoomCode;

    // Kết nối lại Realtime
    if (this.sync) this.sync.destroy();
    this.sync = new RealtimeSync(this.playerRoomCode, false);
    this.sync.onMessage((msg) => this.handlePlayerIncomingMessage(msg));

    // Bắn tin nhắn lại để Host biết mình vẫn online
    this.sync.send({
      type: 'PLAYER_JOIN',
      player: {
        id: this.playerId,
        name: this.playerName,
        avatar: this.playerAvatar
      }
    });

    if (state.view === 'view-player-game') {
      this.switchView('view-player-game');
      document.getElementById('game-player-score').textContent = this.playerScore.toLocaleString();
      const streakBadge = document.getElementById('game-player-streak-badge');
      const streakCount = document.getElementById('game-player-streak-count');
      if (this.playerStreak >= 2) {
        if (streakBadge) streakBadge.style.display = 'inline-flex';
        if (streakCount) streakCount.textContent = `Streak x${this.playerStreak}`;
      } else {
        if (streakBadge) streakBadge.style.display = 'none';
      }
      this.updatePlayerTimerDisplay();
      clearInterval(this.playerTimerInterval);
      this.playerTimerInterval = setInterval(() => {
        this.playerTimerRemaining--;
        this.updatePlayerTimerDisplay();
        if (this.playerTimerRemaining <= 0) {
          clearInterval(this.playerTimerInterval);
          this.endPlayerGame();
        }
      }, 1000);
      this.renderCurrentQuestion();
    } else if (state.view === 'view-player-finished') {
      this.endPlayerGame();
    } else {
      this.switchView('view-player-waiting');
    }
  }

  confirmGoHome() {
    const inActiveGame = (
      this.currentView === 'view-host-lobby' ||
      this.currentView === 'view-host-live' ||
      this.currentView === 'view-player-waiting' ||
      this.currentView === 'view-player-game'
    );
    if (inActiveGame) {
      if (!confirm("Bạn đang ở trong phòng thi đấu. Bạn có chắc chắn muốn rời về trang chủ không?")) return;
    }
    this.clearActiveSession();
    this.cleanup();
    try {
      window.history.replaceState(null, '', window.location.pathname);
    } catch (e) { }
    this.switchView('view-role-select');
  }

  updatePlayerConnStatus(isConnected, text) {
    // Không hiển thị log trạng thái kết nối trên UI theo yêu cầu
  }

  sendPlayerJoinRequest() {
    if (!this.sync || !this.playerRoomCode) return;
    this.sync.send({
      type: 'PLAYER_JOIN',
      player: {
        id: this.playerId,
        name: this.playerName,
        avatar: this.playerAvatar
      }
    });
  }

  cleanup() {
    clearInterval(this.hostTimerInterval);
    clearInterval(this.playerTimerInterval);
    clearInterval(this.botInterval);
    clearInterval(this.playerJoinHeartbeat);
    clearInterval(this.hostLobbySyncInterval);
    this.playerJoinHeartbeat = null;
    this.hostLobbySyncInterval = null;
    this.hostIsRunning = false;
    if (this.sync) {
      this.sync.destroy();
      this.sync = null;
    }
  }

  switchView(viewId) {
    const views = [
      'view-role-select',
      'view-player-join',
      'view-player-waiting',
      'view-player-game',
      'view-player-finished',
      'view-host-lobby',
      'view-host-live',
      'view-host-podium'
    ];
    views.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        if (id === viewId) {
          el.style.display = (id === 'view-host-lobby' || id === 'view-host-live') ? 'flex' : 'block';
        } else {
          el.style.display = 'none';
        }
      }
    });
    this.currentView = viewId;

    // Kích hoạt chế độ khóa cuộn màn hình ngoài khi ở sảnh hoặc đấu trường Host
    const isHostScreen = (viewId === 'view-host-lobby' || viewId === 'view-host-live');
    document.body.classList.toggle('host-view-active', isHostScreen);

    // Ẩn nút "Trang chủ" & Khóa nút Logo khi TRẬN ĐẤU ĐANG DIỄN RA hoặc ĐANG Ở SẢNH CHỜ
    // Khi trận đấu đã KẾT THÚC (view-host-podium hoặc view-player-finished), Host và Người chơi hoàn toàn có thể bấm Logo hoặc nút Trang chủ để quay lại tạo host mới
    const isGameActive = (
      viewId === 'view-host-lobby' ||
      viewId === 'view-host-live' ||
      viewId === 'view-player-waiting' ||
      viewId === 'view-player-game'
    );

    const homeBtn = document.getElementById('header-home-btn');
    if (homeBtn) {
      homeBtn.style.display = isGameActive ? 'none' : 'inline-flex';
    }

    const brandBtn = document.getElementById('brand-home-btn');
    if (brandBtn) {
      brandBtn.style.pointerEvents = isGameActive ? 'none' : 'auto';
      brandBtn.style.cursor = isGameActive ? 'default' : 'pointer';
    }

    // Tự động lưu phiên sau mỗi lần chuyển view
    if (this.hostRoomCode) this.saveHostSession();
    if (this.playerRoomCode) this.savePlayerSession();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  syncHostPlayersToStorage() {
    if (!this.hostRoomCode) return;
    try {
      const names = Object.values(this.hostPlayers).map(p => (p.name || '').trim());
      localStorage.setItem(`vnr202_room_${this.hostRoomCode}_players`, JSON.stringify(names));
    } catch (e) { }
  }

  // ============================================================
  // LOGIC DÀNH CHO HOST (MÁY CHIẾU LỚP HỌC)
  // ============================================================
  setupHostRoom(customRoomCode = null) {
    this.cleanup();
    this.clearActiveSession();
    // Sinh mã phòng 6 số ngẫu nhiên dễ nhớ (ví dụ: 1945 + 2 số) hoặc dùng mã được chỉ định
    if (customRoomCode && customRoomCode.length >= 4) {
      this.hostRoomCode = customRoomCode;
    } else {
      const suffix = Math.floor(10 + Math.random() * 90);
      this.hostRoomCode = `1945${suffix}`;
    }
    this.hostPlayers = {};
    this.hostLogCount = 0;
    this.hostRecentLogs = [];
    this.syncHostPlayersToStorage();

    try {
      window.history.replaceState(null, '', `?host_room=${this.hostRoomCode}`);
    } catch (e) { }

    this.saveHostSession();

    document.getElementById('host-room-pin-text').textContent = this.hostRoomCode;
    const countNum = document.getElementById('host-lobby-player-count-num');
    if (countNum) countNum.textContent = '0';

    const countContainer = document.getElementById('host-lobby-player-count');
    if (countContainer) {
      const numSpan = countContainer.querySelector('.count-num');
      if (numSpan) numSpan.textContent = '0';
    }

    const grid = document.getElementById('host-lobby-players-grid');
    if (grid) {
      grid.innerHTML = `
        <div class="blooket-empty-arena">
          <div class="empty-icon-pulse">
            <span class="material-symbols-outlined" style="font-size:64px;color:var(--md-sys-color-primary);">groups</span>
          </div>
          <div class="empty-text-title">Đang Chờ Chiến Sĩ Gia Nhập...</div>
          <div class="empty-text-sub">Hãy quét mã QR trên màn hình hoặc truy cập đường link để bắt đầu!</div>
        </div>
      `;
    }

    const logFeed = document.getElementById('host-live-log-feed');
    if (logFeed) {
      logFeed.innerHTML = `
        <div class="log-empty-state">
          <span class="material-symbols-outlined" style="font-size:36px;opacity:0.4;">stars</span>
          <div>Đang chờ sự kiện... Nhật ký sẽ hiển thị khi các chiến sĩ mở Rương bí ẩn & Cướp điểm!</div>
        </div>
      `;
    }
    const logBadge = document.getElementById('host-log-count');
    if (logBadge) logBadge.textContent = '0 sự kiện';

    // Tạo mã QR Code cho khung Blooket Top Banner
    const qrContainer = document.getElementById('host-qr-container');
    qrContainer.innerHTML = '';
    const currentOrigin = window.location.origin + window.location.pathname;
    const joinUrl = `${currentOrigin}?room=${this.hostRoomCode}`;

    const urlDisplay = document.getElementById('host-join-url-text');
    if (urlDisplay) {
      urlDisplay.textContent = (window.location.host + window.location.pathname).replace(/\/$/, '');
    }

    if (typeof QRCode !== 'undefined') {
      new QRCode(qrContainer, {
        text: joinUrl,
        width: 78,
        height: 78,
        colorDark: "#0E0E12",
        colorLight: "#FFFFFF",
        correctLevel: QRCode.CorrectLevel.M
      });
    }

    // Kết nối Realtime
    this.sync = new RealtimeSync(this.hostRoomCode, true);
    this.sync.onMessage((msg) => this.handleHostIncomingMessage(msg));

    // Phát beacon định kỳ mỗi 2.5s để người chơi mới vào nhận diện ngay
    if (this.hostLobbySyncInterval) clearInterval(this.hostLobbySyncInterval);
    this.hostLobbySyncInterval = setInterval(() => {
      if (this.currentView !== 'view-host-lobby') {
        clearInterval(this.hostLobbySyncInterval);
        this.hostLobbySyncInterval = null;
        return;
      }
      if (this.sync) {
        this.sync.send({
          type: 'HOST_LOBBY_BEACON',
          roomCode: this.hostRoomCode
        });
      }
    }, 2500);

    this.switchView('view-host-lobby');
  }

  handleHostIncomingMessage(msg) {
    if (msg.type === 'PLAYER_JOIN') {
      const p = msg.player;
      const rawName = (p.name || '').trim();
      if (!rawName) return;

      // Kiểm tra trùng tên: Phân biệt hoa thường và có dấu, phải giống 100% thì mới coi là trùng
      const isDuplicate = Object.values(this.hostPlayers).some(
        existing => existing.name.trim() === rawName && existing.id !== p.id
      );

      if (isDuplicate) {
        // Gửi thông báo từ chối về người chơi
        this.sync.send({
          type: 'PLAYER_JOIN_REJECTED',
          playerId: p.id,
          name: rawName,
          reason: `Tên "${rawName}" đã có người trong phòng sử dụng!\nVui lòng chọn tên khác hoặc thêm số/ký tự để phân biệt.`
        });
        return;
      }

      if (this.hostPlayers[p.id]) {
        // Người chơi đã tham gia từ trước bị F5/reload kết nối lại
        this.hostPlayers[p.id].name = rawName;
        if (p.avatar) this.hostPlayers[p.id].avatar = p.avatar;
        this.renderHostLobbyPlayers();
        this.syncHostPlayersToStorage();
        this.saveHostSession();

        this.sync.send({
          type: 'PLAYER_JOIN_ACCEPTED',
          playerId: p.id
        });

        // Nếu trận đấu của Host đang chạy, gửi tín hiệu tiếp tục cho người chơi
        if (this.hostIsRunning) {
          this.sync.send({
            type: 'GAME_START',
            duration: this.hostTimerRemaining,
            startTime: Date.now()
          });
        }
      } else {
        this.hostPlayers[p.id] = {
          id: p.id,
          name: rawName,
          avatar: p.avatar || getPlayerAvatar(rawName),
          score: 0,
          streak: 0,
          correctCount: 0,
          count: 0,
          isBot: false
        };
        sound.click();
        this.renderHostLobbyPlayers();
        this.syncHostPlayersToStorage();
        this.saveHostSession();

        // Gửi phản hồi chấp thuận cho người chơi
        this.sync.send({
          type: 'PLAYER_JOIN_ACCEPTED',
          playerId: p.id
        });
      }
    } else if (msg.type === 'PLAYER_AVATAR_CHANGE') {
      const p = msg.player;
      if (this.hostPlayers[p.id]) {
        this.hostPlayers[p.id].avatar = p.avatar;
        sound.click();
        this.renderHostLobbyPlayers();
        this.saveHostSession();
      }
    } else if (msg.type === 'SCORE_UPDATE') {
      const p = msg.player;
      if (this.hostPlayers[p.id]) {
        this.hostPlayers[p.id].score = p.score;
        this.hostPlayers[p.id].streak = p.streak;
        this.hostPlayers[p.id].correctCount = p.correctCount;
        this.hostPlayers[p.id].count = p.count;

        // Chỉ cập nhật bảng xếp hạng tức thì, KHÔNG ghi log đúng/sai thông thường
        if (this.hostIsRunning) {
          this.renderHostLiveLeaderboard();
        }
        this.saveHostSession();
      }
    } else if (msg.type === 'CANDY_QUEST_EVENT') {
      const p = msg.player;
      const ev = msg.event;
      if (this.hostPlayers[p.id]) {
        this.hostPlayers[p.id].score = p.score;
        this.hostPlayers[p.id].streak = p.streak;
        this.hostPlayers[p.id].correctCount = p.correctCount;
        this.hostPlayers[p.id].count = p.count;

        // Ghi nhận nhật ký chiến trường cho các sự kiện mở rương (Ai cướp điểm, ai được nhân điểm, ai bị trừ điểm/bom)
        if (ev.type === 'steal') {
          const victim = this.hostPlayers[ev.targetId];
          if (victim) {
            victim.score = Math.max(0, victim.score - ev.stolen);
            // Gửi cảnh báo tức thì cho máy người chơi bị cướp
            this.sync.send({
              type: 'CANDY_STEAL_NOTICE',
              victimId: victim.id,
              stealerName: p.name,
              stolenPoints: ev.stolen
            });
          }
          this.addLiveLogEntry({
            isCandyEvent: true,
            candyClass: 'steal',
            candyIcon: 'swords',
            name: p.name,
            actionText: `Vừa <strong style="color:#FF5252;">CƯỚP ${ev.stolen.toLocaleString()} điểm</strong> từ <strong>${this.escapeHtml(ev.targetName || (victim ? victim.name : 'Đối thủ'))}</strong>!`,
            badgeHtml: `<span class="log-badge" style="background:rgba(229,57,53,0.2);color:#FF5252;font-weight:900;">⚔️ CƯỚP ĐIỂM</span>`
          });
        } else if (ev.type === 'double') {
          this.addLiveLogEntry({
            isCandyEvent: true,
            candyClass: 'double',
            candyIcon: 'local_fire_department',
            name: p.name,
            actionText: `Mở rương thần kỳ: <strong style="color:var(--gold-color);">x2 GẤP ĐÔI TỔNG ĐIỂM</strong> (+${(ev.delta || 0).toLocaleString()} pts)!`,
            badgeHtml: `<span class="log-badge" style="background:rgba(255,215,0,0.2);color:var(--gold-color);font-weight:900;">🔥 x2 ĐIỂM</span>`
          });
        } else if (ev.type === 'bankrupt') {
          this.addLiveLogEntry({
            isCandyEvent: true,
            candyClass: 'bankrupt',
            candyIcon: 'bomb',
            name: p.name,
            actionText: `Dẫm phải <strong style="color:#FF80AB;">BOM NỔ - MẤT HẾT ĐIỂM (Về 0)</strong>!`,
            badgeHtml: `<span class="log-badge" style="background:rgba(136,14,79,0.3);color:#FF80AB;font-weight:900;">💣 BOM NỔ VỀ 0</span>`
          });
        } else if (ev.type === 'percent_gain') {
          this.addLiveLogEntry({
            isCandyEvent: true,
            candyClass: 'correct',
            candyIcon: 'rocket_launch',
            name: p.name,
            actionText: `Mở rương bứt phá: <strong style="color:#81C784;">TĂNG ${ev.title}</strong> (+${(ev.delta || 0).toLocaleString()} pts)!`,
            badgeHtml: `<span class="log-badge pts-gain">+${(ev.delta || 0).toLocaleString()} pts</span>`
          });
        } else if (ev.type === 'fixed_gain') {
          this.addLiveLogEntry({
            isCandyEvent: true,
            candyClass: 'correct',
            candyIcon: 'stars',
            name: p.name,
            actionText: `Mở rương báu nhận: <strong style="color:#81C784;">${ev.title}</strong>!`,
            badgeHtml: `<span class="log-badge pts-gain">+${(ev.delta || 0).toLocaleString()} pts</span>`
          });
        } else if (ev.type === 'percent_loss') {
          this.addLiveLogEntry({
            isCandyEvent: true,
            candyClass: 'wrong',
            candyIcon: 'trending_down',
            name: p.name,
            actionText: `Sự cố tiếp tế: <strong style="color:#E57373;">BỊ GIẢM ${ev.title}</strong> (${(ev.delta || 0).toLocaleString()} pts)!`,
            badgeHtml: `<span class="log-badge" style="background:rgba(229,57,53,0.15);color:#E57373;">${ev.title}</span>`
          });
        } else if (ev.type === 'fixed_loss') {
          this.addLiveLogEntry({
            isCandyEvent: true,
            candyClass: 'wrong',
            candyIcon: 'warning',
            name: p.name,
            actionText: `Dính bẫy phục kích: <strong style="color:#E57373;">BỊ TRỪ ${ev.title}</strong>!`,
            badgeHtml: `<span class="log-badge" style="background:rgba(229,57,53,0.15);color:#E57373;">${ev.title}</span>`
          });
        } else if (ev.type === 'empty') {
          this.addLiveLogEntry({
            isCandyEvent: true,
            candyClass: 'wrong',
            candyIcon: 'air',
            name: p.name,
            actionText: `Mở trúng <strong style="color:var(--md-sys-color-outline);">RƯƠNG TRỐNG RỖNG</strong> (0 pts)!`,
            badgeHtml: `<span class="log-badge" style="background:rgba(255,255,255,0.08);color:var(--md-sys-color-outline);">0 pts</span>`
          });
        }

        if (this.hostIsRunning) {
          this.renderHostLiveLeaderboard();
        }
        this.saveHostSession();
      }
    }
  }

  renderLogDomItem(entry, prepend = true) {
    const feed = document.getElementById('host-live-log-feed');
    if (!feed) return;

    // Xóa empty state nếu có
    const emptyState = feed.querySelector('.log-empty-state');
    if (emptyState) emptyState.remove();

    const isCorrect = entry.isCorrect;
    const streak = entry.streak || 0;
    const scoreGained = entry.scoreGained || 0;
    const timeStr = entry.timeStr || (() => {
      const now = new Date();
      return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    })();

    let itemClass = isCorrect ? 'correct' : 'wrong';
    let iconName = isCorrect ? 'check_circle' : 'cancel';
    if (streak >= 3) {
      itemClass += ' rankup';
      iconName = 'local_fire_department';
    }

    let actionText = '';
    let badgeHtml = '';

    if (entry.isCandyEvent) {
      itemClass = entry.candyClass || 'steal';
      iconName = entry.candyIcon || 'stars';
      actionText = entry.actionText;
      badgeHtml = entry.badgeHtml;
    } else if (isCorrect) {
      actionText = `Đã trả lời <strong style="color:#81C784;">chính xác</strong> câu #${entry.count || 1}`;
      badgeHtml = `<span class="log-badge pts-gain">+${scoreGained.toLocaleString()} pts</span>`;
      if (streak >= 2) {
        badgeHtml += ` <span class="log-badge streak-badge">🔥 x${streak}</span>`;
      }
    } else {
      actionText = `Trả lời chưa đúng câu #${entry.count || 1}`;
      badgeHtml = `<span class="log-badge" style="background:rgba(229,57,53,0.15);color:#E57373;">0 pts</span>`;
    }

    const item = document.createElement('div');
    item.className = `log-item ${itemClass}`;
    item.innerHTML = `
      <div class="log-icon-box">
        <span class="material-symbols-outlined" style="font-size:20px;">${iconName}</span>
      </div>
      <div class="log-content">
        <div class="log-header">
          <span class="log-player-name">${this.escapeHtml(entry.name)}</span>
          <span class="log-time">${timeStr}</span>
        </div>
        <div class="log-action-text">${actionText}</div>
      </div>
      <div style="display:flex;gap:4px;align-items:center;">
        ${badgeHtml}
      </div>
    `;

    if (prepend) {
      feed.insertBefore(item, feed.firstChild);
    } else {
      feed.appendChild(item);
    }

    while (feed.children.length > 40) {
      feed.removeChild(feed.lastChild);
    }
  }

  addLiveLogEntry(entry) {
    const feed = document.getElementById('host-live-log-feed');
    const countBadge = document.getElementById('host-log-count');
    if (!feed) return;

    this.hostLogCount = (this.hostLogCount || 0) + 1;
    if (countBadge) countBadge.textContent = `${this.hostLogCount} rương mở`;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    entry.timeStr = timeStr;

    if (!this.hostRecentLogs) this.hostRecentLogs = [];
    this.hostRecentLogs.unshift({
      name: entry.name,
      isCandyEvent: true,
      candyClass: entry.candyClass || 'steal',
      candyIcon: entry.candyIcon || 'stars',
      actionText: entry.actionText,
      badgeHtml: entry.badgeHtml,
      timeStr: timeStr
    });
    if (this.hostRecentLogs.length > 40) this.hostRecentLogs.pop();

    this.renderLogDomItem(entry, true);
  }

  renderHostLobbyPlayers() {
    const list = Object.values(this.hostPlayers);
    const countNum = document.getElementById('host-lobby-player-count-num');
    if (countNum) countNum.textContent = list.length;

    const countContainer = document.getElementById('host-lobby-player-count');
    if (countContainer) {
      const numSpan = countContainer.querySelector('.count-num');
      if (numSpan) numSpan.textContent = list.length;
    }

    const grid = document.getElementById('host-lobby-players-grid');
    if (!grid) return;

    if (list.length === 0) {
      grid.innerHTML = `
        <div class="blooket-empty-arena">
          <div class="empty-icon-pulse">
            <span class="material-symbols-outlined" style="font-size:64px;color:var(--md-sys-color-primary);">groups</span>
          </div>
          <div class="empty-text-title">Đang Chờ Chiến Sĩ Gia Nhập...</div>
          <div class="empty-text-sub">Hãy quét mã QR trên màn hình hoặc truy cập đường link để bắt đầu!</div>
        </div>
      `;
      return;
    }

    grid.innerHTML = list.map(p => `
      <div class="blooket-lobby-card">
        <div class="blooket-card-avatar">${p.avatar || getPlayerAvatar(p.name)}</div>
        <div class="blooket-card-name" title="${this.escapeHtml(p.name)}">${this.escapeHtml(p.name)}</div>
      </div>
    `).join('');
  }

  addSimulatedBots(count = 30) {
    const sampleNames = [
      "Nguyễn Thành Long", "Phạm Thu Hương", "Trần Đình Trọng", "Vũ Hoàng My",
      "Đỗ Quang Hải", "Lê Minh Trang", "Bùi Quốc Anh", "Hoàng Thảo Vy",
      "Đặng Tuấn Kiệt", "Ngô Bảo Châu", "Mai Phương Thúy", "Dương Triệu Vũ",
      "Phan Thanh Bình", "Võ Hoài Nam", "Trịnh Kim Chi", "Lâm Quốc Hùng",
      "Tạ Bích Loan", "Đinh Tiến Dũng", "Cao Bá Quát", "Hà Anh Tuấn",
      "Lương Bằng Quang", "Chu Thúy Quỳnh", "Trương Ngọc Ánh", "Đoàn Văn Hậu",
      "Quách Thị Lan", "Hồ Hoài Anh", "Lý Nhã Kỳ", "Tống Phước Hiệp",
      "Nhan Phúc Vinh", "Huỳnh Lập", "Thạch Kim Tuấn", "Khổng Tú Quỳnh"
    ];

    const existingNames = new Set(Object.values(this.hostPlayers).map(p => p.name.trim()));

    for (let i = 0; i < count; i++) {
      let baseName = sampleNames[i % sampleNames.length];
      let candidateName = baseName;
      let counter = 1;
      while (existingNames.has(candidateName)) {
        candidateName = `${baseName} (${counter})`;
        counter++;
      }
      existingNames.add(candidateName);

      const botId = 'bot_' + Math.random().toString(36).substring(2, 7);
      this.hostPlayers[botId] = {
        id: botId,
        name: candidateName,
        avatar: getPlayerAvatar(candidateName, i),
        score: 0,
        streak: 0,
        correctCount: 0,
        count: 0,
        isBot: true
      };
    }
    this.renderHostLobbyPlayers();
    this.syncHostPlayersToStorage();
    this.saveHostSession();
  }

  startHostGame() {
    const playerCount = Object.keys(this.hostPlayers).length;
    if (playerCount === 0) {
      if (confirm("Chưa có sinh viên nào tham gia. Đồng chí có muốn thêm 30 Bot giả lập để chạy thử máy chiếu không?")) {
        this.addSimulatedBots(30);
      } else {
        return;
      }
    }

    this.hostIsRunning = true;
    this.hostTimerRemaining = this.hostTimerDuration;

    // Phát lệnh BẮT ĐẦU đến toàn bộ máy sinh viên
    if (this.sync) {
      this.sync.send({
        type: 'GAME_START',
        duration: this.hostTimerDuration,
        startTime: Date.now()
      });
    }

    this.switchView('view-host-live');
    this.renderHostLiveLeaderboard();
    this.saveHostSession();

    // Bắt đầu đếm ngược thời gian
    this.updateHostTimerDisplay();
    this.hostTimerInterval = setInterval(() => {
      this.hostTimerRemaining--;
      this.updateHostTimerDisplay();

      if (this.hostTimerRemaining <= 0) {
        clearInterval(this.hostTimerInterval);
        this.endHostGame();
      }
    }, 1000);

    // Bắt đầu mô phỏng Bot (nếu có Bot)
    this.startBotSimulation();
  }

  startBotSimulation() {
    clearInterval(this.botInterval);
    this._botSaveTick = 0;
    this.botInterval = setInterval(() => {
      if (!this.hostIsRunning) return;
      const bots = Object.values(this.hostPlayers).filter(p => p.isBot);
      if (bots.length === 0) return;

      // Chọn 1-2 bot ngẫu nhiên trả lời mỗi nhịp để tạo không khí thi đấu sôi nổi
      const batchSize = Math.min(bots.length, Math.random() > 0.35 ? 2 : 1);
      for (let i = 0; i < batchSize; i++) {
        const randomBot = bots[Math.floor(Math.random() * bots.length)];
        const isCorrect = Math.random() > 0.28; // Tỷ lệ đúng ~72%
        randomBot.count++;

        let gain = 0;
        let triggeredCandy = false;

        if (isCorrect) {
          randomBot.streak++;
          randomBot.correctCount++;
          gain = 1000 + (randomBot.streak * 200);
          randomBot.score += gain;

          // Thỉnh thoảng bot mở trúng rương Candy Quest (tạo không khí thi đấu sôi động chuẩn Blooket)
          if (Math.random() < 0.28 && bots.length >= 2) {
            const candyRoll = Math.random();
            if (candyRoll < 0.28) {
              // Bot cướp điểm từ đối thủ khác
              const otherPlayers = Object.values(this.hostPlayers).filter(p => p.id !== randomBot.id && p.score > 500);
              if (otherPlayers.length > 0) {
                const victim = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
                const stolen = Math.max(300, Math.round(victim.score * 0.25));
                victim.score = Math.max(0, victim.score - stolen);
                randomBot.score += stolen;
                if (!victim.isBot && this.sync) {
                  this.sync.send({
                    type: 'CANDY_STEAL_NOTICE',
                    victimId: victim.id,
                    stealerName: randomBot.name,
                    stolenPoints: stolen
                  });
                }
                this.addLiveLogEntry({
                  isCandyEvent: true,
                  candyClass: 'steal',
                  candyIcon: 'swords',
                  name: randomBot.name,
                  actionText: `Vừa <strong style="color:#FF5252;">CƯỚP ${stolen.toLocaleString()} điểm</strong> từ <strong>${this.escapeHtml(victim.name)}</strong>!`,
                  badgeHtml: `<span class="log-badge" style="background:rgba(229,57,53,0.2);color:#FF5252;font-weight:900;">⚔️ CƯỚP ĐIỂM</span>`
                });
              }
            } else if (candyRoll < 0.48) {
              // Bot gấp đôi điểm
              const doubleGain = Math.max(1000, randomBot.score);
              randomBot.score += doubleGain;
              this.addLiveLogEntry({
                isCandyEvent: true,
                candyClass: 'double',
                candyIcon: 'local_fire_department',
                name: randomBot.name,
                actionText: `Mở rương thần kỳ: <strong style="color:var(--gold-color);">x2 GẤP ĐÔI TỔNG ĐIỂM</strong> (+${doubleGain.toLocaleString()} pts)!`,
                badgeHtml: `<span class="log-badge" style="background:rgba(255,215,0,0.2);color:var(--gold-color);font-weight:900;">🔥 x2 ĐIỂM</span>`
              });
            } else if (candyRoll < 0.68) {
              // Bot mở trúng tăng 50% điểm
              const gain50 = Math.max(600, Math.round(randomBot.score * 0.5));
              randomBot.score += gain50;
              this.addLiveLogEntry({
                isCandyEvent: true,
                candyClass: 'correct',
                candyIcon: 'rocket_launch',
                name: randomBot.name,
                actionText: `Mở rương bứt phá: <strong style="color:#81C784;">TĂNG +50% ĐIỂM</strong> (+${gain50.toLocaleString()} pts)!`,
                badgeHtml: `<span class="log-badge pts-gain">+${gain50.toLocaleString()} pts</span>`
              });
            } else if (candyRoll < 0.84) {
              // Bot mở trúng rương kho báu +2,500
              randomBot.score += 2500;
              this.addLiveLogEntry({
                isCandyEvent: true,
                candyClass: 'correct',
                candyIcon: 'diamond',
                name: randomBot.name,
                actionText: `Mở rương báu nhận: <strong style="color:#81C784;">+2,500 ĐIỂM</strong>!`,
                badgeHtml: `<span class="log-badge pts-gain">+2,500 pts</span>`
              });
            } else if (candyRoll < 0.93) {
              // Bot dính bẫy -1,000 điểm
              const lost = Math.min(1000, randomBot.score);
              randomBot.score = Math.max(0, randomBot.score - lost);
              this.addLiveLogEntry({
                isCandyEvent: true,
                candyClass: 'wrong',
                candyIcon: 'warning',
                name: randomBot.name,
                actionText: `Dính bẫy phục kích: <strong style="color:#E57373;">BỊ TRỪ -1,000 ĐIỂM</strong>!`,
                badgeHtml: `<span class="log-badge" style="background:rgba(229,57,53,0.15);color:#E57373;">-1,000 pts</span>`
              });
            } else {
              // Bot dẫm phải bom nổ về 0
              randomBot.score = 0;
              this.addLiveLogEntry({
                isCandyEvent: true,
                candyClass: 'bankrupt',
                candyIcon: 'bomb',
                name: randomBot.name,
                actionText: `Dẫm phải <strong style="color:#FF80AB;">BOM NỔ - MẤT HẾT ĐIỂM (Về 0)</strong>!`,
                badgeHtml: `<span class="log-badge" style="background:rgba(136,14,79,0.3);color:#FF80AB;font-weight:900;">💣 BOM NỔ VỀ 0</span>`
              });
            }
          }
        } else {
          randomBot.streak = 0;
        }

        // KHÔNG còn ghi log các câu hỏi đúng / sai thông thường
      }

      this.renderHostLiveLeaderboard();
      this._botSaveTick = (this._botSaveTick || 0) + 1;
      if (this._botSaveTick % 3 === 0) {
        this.saveHostSession();
      }
    }, 650);
  }

  updateHostTimerDisplay() {
    const m = Math.floor(this.hostTimerRemaining / 60);
    const s = this.hostTimerRemaining % 60;
    const str = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    const el = document.getElementById('host-live-timer');
    if (el) el.textContent = str;

    if (this.hostTimerRemaining <= 10 && this.hostTimerRemaining > 0) {
      sound.countdownTick();
    }

    // Tự động lưu phiên định kỳ mỗi 2 giây
    if (this.hostTimerRemaining % 2 === 0) {
      this.saveHostSession();
    }
  }

  renderHostLiveLeaderboard() {
    const list = Object.values(this.hostPlayers);
    // Sắp xếp theo điểm số giảm dần
    list.sort((a, b) => b.score - a.score);

    const container = document.getElementById('host-live-leaderboard-list');
    if (!container) return;

    // Hiển thị đầy đủ các chiến sĩ thi đấu để Host có thể lăn chuột theo dõi bảng vàng
    const topPlayers = list.slice(0, 30);

    container.innerHTML = topPlayers.map((p, idx) => {
      const rank = idx + 1;
      let rankClass = '';
      let rankText = `${rank}th`;
      if (rank === 1) { rankClass = 'rank-1'; rankText = '1st'; }
      else if (rank === 2) { rankClass = 'rank-2'; rankText = '2nd'; }
      else if (rank === 3) { rankClass = 'rank-3'; rankText = '3rd'; }

      return `
        <div class="lb-row ${rankClass}">
          <div class="lb-rank-badge">${rankText}</div>
          <div class="lb-avatar-box">${p.avatar || getPlayerAvatar(p.name)}</div>
          <div class="lb-player-info">
            <div class="lb-name">${this.escapeHtml(p.name)}</div>
            ${p.streak >= 2 ? `<span class="lb-streak">🔥 x${p.streak}</span>` : ''}
          </div>
          <div class="lb-score-box">
            <span class="lb-score-icon">⭐</span>
            <span class="lb-score">${p.score.toLocaleString()}</span>
          </div>
        </div>
      `;
    }).join('');

    // Phát danh sách leaderboard thời gian thực tới các máy người chơi (hỗ trợ cướp điểm)
    if (this.sync) {
      this.sync.send({
        type: 'ROOM_LEADERBOARD_SYNC',
        players: list.map(p => ({
          id: p.id,
          name: p.name,
          avatar: p.avatar,
          score: p.score,
          isBot: p.isBot
        }))
      });
    }
  }

  endHostGame() {
    this.hostIsRunning = false;
    clearInterval(this.hostTimerInterval);
    clearInterval(this.botInterval);

    // Gửi tín hiệu KẾT THÚC đến toàn bộ máy sinh viên
    if (this.sync) {
      this.sync.send({ type: 'GAME_END' });
    }

    sound.victory();
    this.renderHostPodium();
    this.switchView('view-host-podium');

    // Bắn pháo hoa rực rỡ ăn mừng
    this.fireConfetti();
  }

  renderHostPodium() {
    const list = Object.values(this.hostPlayers);
    list.sort((a, b) => b.score - a.score);

    // Top 1, Top 2, Top 3
    const top1 = list[0] || { name: "---", score: 0 };
    const top2 = list[1] || { name: "---", score: 0 };
    const top3 = list[2] || { name: "---", score: 0 };

    const name1 = document.getElementById('podium-name-1');
    if (name1) name1.textContent = top1.name;
    const score1 = document.getElementById('podium-score-1');
    if (score1) score1.textContent = `${top1.score.toLocaleString()} pts`;

    const name2 = document.getElementById('podium-name-2');
    if (name2) name2.textContent = top2.name;
    const score2 = document.getElementById('podium-score-2');
    if (score2) score2.textContent = `${top2.score.toLocaleString()} pts`;

    const name3 = document.getElementById('podium-name-3');
    if (name3) name3.textContent = top3.name;
    const score3 = document.getElementById('podium-score-3');
    if (score3) score3.textContent = `${top3.score.toLocaleString()} pts`;

    // Render bảng chi tiết nếu tồn tại trên giao diện
    const tbody = document.getElementById('podium-table-body');
    if (tbody) {
      tbody.innerHTML = list.map((p, idx) => `
        <tr>
          <td style="font-weight:800;color:${idx === 0 ? 'var(--gold-color)' : idx === 1 ? 'var(--silver-color)' : idx === 2 ? 'var(--bronze-color)' : 'inherit'}">
            #${idx + 1}
          </td>
          <td style="font-weight:700;">${this.escapeHtml(p.name)}</td>
          <td style="text-align:right;font-weight:800;color:var(--gold-color);font-family:monospace;">
            ${p.score.toLocaleString()} pts
          </td>
        </tr>
      `).join('');
    }
  }

  fireConfetti() {
    if (typeof confetti === 'function') {
      const duration = 4.5 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#E53935', '#FFD700', '#FFFFFF', '#0288D1']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#E53935', '#FFD700', '#FFFFFF', '#0288D1']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }

  exportScoreboardToClipboard() {
    const list = Object.values(this.hostPlayers);
    list.sort((a, b) => b.score - a.score);

    let text = "BẢNG VÀNG THI ĐẤU MÔN VNR202 (GIAI ĐOẠN 1945 - 1950)\n";
    text += "Thứ hạng\tHọ và Tên\tĐiểm số\tSố câu đúng\n";
    list.forEach((p, idx) => {
      text += `${idx + 1}\t${p.name}\t${p.score}\t${p.correctCount}\n`;
    });

    navigator.clipboard.writeText(text).then(() => {
      alert("Đã sao chép toàn bộ bảng điểm của lớp vào Clipboard! Nhóm có thể dán vào Excel hoặc Word để trao giải.");
    }).catch(err => {
      console.warn("Clipboard error:", err);
    });
  }

  // ============================================================
  // LOGIC DÀNH CHO SINH VIÊN (PLAYER SMARTPHONE & LAPTOP)
  // ============================================================
  handlePlayerJoinSubmit() {
    const pin = document.getElementById('player-room-pin-input').value.trim();
    const name = document.getElementById('player-name-input').value.trim();

    if (!pin || pin.length < 4) {
      alert("Vui lòng nhập đúng Mã phòng (Room PIN) hiển thị trên máy chiếu!");
      return;
    }
    if (!name) {
      alert("Vui lòng nhập Họ và Tên (hoặc Biệt danh) của bạn!");
      return;
    }

    // Kiểm tra trùng tên tức thì qua bộ nhớ phòng (phân biệt hoa thường và dấu, phải giống 100%)
    const localListStr = localStorage.getItem(`vnr202_room_${pin}_players`);
    if (localListStr) {
      try {
        const existingNames = JSON.parse(localListStr);
        if (Array.isArray(existingNames) && existingNames.some(existing => existing === name)) {
          sound.wrong();
          alert(`Tên "${name}" đã có người trong phòng sử dụng!\nVui lòng chọn tên khác hoặc thêm số/ký tự để phân biệt.`);
          return;
        }
      } catch (e) { }
    }

    sound.click();
    this.playerName = name;
    this.playerAvatar = this.playerAvatar || getPlayerAvatar(name);
    this.playerRoomCode = pin;

    // Lưu lại trong localStorage để không mất khi F5
    localStorage.setItem('vnr202_name', name);

    document.getElementById('display-player-name').textContent = name;
    const heroAvatar = document.getElementById('display-player-avatar');
    if (heroAvatar) heroAvatar.textContent = this.playerAvatar;
    document.getElementById('display-waiting-room').textContent = pin;

    // Khởi tạo Realtime
    if (!this.sync || this.sync.roomCode !== this.playerRoomCode) {
      if (this.sync) this.sync.destroy();
      this.sync = new RealtimeSync(this.playerRoomCode, false);
      this.sync.onMessage((msg) => this.handlePlayerIncomingMessage(msg));
    }

    // Bắn tin nhắn xin tham gia đến Host
    this.sendPlayerJoinRequest();

    // Bắt đầu heartbeat gửi lại liên tục mỗi 1.2s cho đến khi Host xác nhận đã thấy người chơi
    if (this.playerJoinHeartbeat) clearInterval(this.playerJoinHeartbeat);
    this.playerJoinHeartbeat = setInterval(() => {
      if (this.currentView !== 'view-player-waiting') {
        clearInterval(this.playerJoinHeartbeat);
        this.playerJoinHeartbeat = null;
        return;
      }
      this.sendPlayerJoinRequest();
    }, 1200);

    try {
      window.history.replaceState(null, '', `?room=${pin}`);
    } catch (e) { }
    this.savePlayerSession();

    this.switchView('view-player-waiting');
  }

  handlePlayerIncomingMessage(msg) {
    if (msg.type === 'PLAYER_JOIN_REJECTED' && msg.playerId === this.playerId) {
      if (this.playerJoinHeartbeat) clearInterval(this.playerJoinHeartbeat);
      sound.wrong();
      alert(msg.reason || `Tên "${this.playerName}" đã có người trong phòng sử dụng!\nVui lòng đổi tên khác.`);
      this.cleanup();
      this.switchView('view-player-join');
      const nameInput = document.getElementById('player-name-input');
      if (nameInput) {
        nameInput.focus();
        nameInput.select();
      }
      return;
    } else if (msg.type === 'PLAYER_JOIN_ACCEPTED' && msg.playerId === this.playerId) {
      // Máy chiếu Host đã xác nhận và thấy người chơi trên màn hình
      if (this.playerJoinHeartbeat) {
        clearInterval(this.playerJoinHeartbeat);
        this.playerJoinHeartbeat = null;
      }
    } else if (msg.type === 'HOST_LOBBY_BEACON') {
      // Nhận được tín hiệu beacon từ Host, gửi lại thông tin để chắc chắn Host đã lưu
      if (this.currentView === 'view-player-waiting') {
        this.sendPlayerJoinRequest();
      }
    } else if (msg.type === 'ROOM_LEADERBOARD_SYNC') {
      if (Array.isArray(msg.players)) {
        this.roomCompetitors = msg.players;
      }
    } else if (msg.type === 'CANDY_STEAL_NOTICE' && msg.victimId === this.playerId) {
      this.showVictimRobbedAlert(msg.stealerName, msg.stolenPoints);
    } else if (msg.type === 'GAME_START') {
      if (this.playerJoinHeartbeat) clearInterval(this.playerJoinHeartbeat);
      this.startPlayerGame(msg.duration);
    } else if (msg.type === 'GAME_END') {
      this.endPlayerGame();
    }
  }

  startPlayerGame(duration = 300) {
    sound.click();
    this.playerScore = 0;
    this.playerStreak = 0;
    this.playerCorrectCount = 0;
    this.playerAnsweredCount = 0;
    this.playerCurrentQIndex = 0;
    this.playerTimerRemaining = duration;

    // Xáo trộn 60 câu hỏi ngẫu nhiên cho riêng người chơi này
    this.playerQuestions = this.shuffleArray([...QUESTIONS_BANK]);

    document.getElementById('game-player-score').textContent = '0';
    document.getElementById('game-player-streak-count').textContent = 'Streak x0';

    this.switchView('view-player-game');
    this.renderCurrentQuestion();
    this.savePlayerSession();

    // Đồng hồ đếm ngược của người chơi
    clearInterval(this.playerTimerInterval);
    this.updatePlayerTimerDisplay();
    this.playerTimerInterval = setInterval(() => {
      this.playerTimerRemaining--;
      this.updatePlayerTimerDisplay();

      if (this.playerTimerRemaining <= 0) {
        clearInterval(this.playerTimerInterval);
        this.endPlayerGame();
      }
    }, 1000);
  }

  updatePlayerTimerDisplay() {
    const m = Math.floor(this.playerTimerRemaining / 60);
    const s = this.playerTimerRemaining % 60;
    const el = document.getElementById('game-player-timer');
    if (el) {
      el.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    // Tự động lưu phiên định kỳ mỗi 2 giây
    if (this.playerTimerRemaining % 2 === 0) {
      this.savePlayerSession();
    }
  }

  renderCurrentQuestion() {
    // Nếu hết 60 câu thì tự động xáo trộn lại để chơi tiếp trong thời gian còn lại
    if (this.playerCurrentQIndex >= this.playerQuestions.length) {
      this.playerQuestions = this.shuffleArray([...QUESTIONS_BANK]);
      this.playerCurrentQIndex = 0;
    }

    const q = this.playerQuestions[this.playerCurrentQIndex];
    document.getElementById('game-question-tag').textContent = `CÂU HỎI #${this.playerAnsweredCount + 1}`;
    document.getElementById('game-question-content').textContent = q.question;

    // Chuẩn bị 4 đáp án (có xáo trộn thứ tự A-B-C-D cho riêng người chơi)
    const optionsWithOrigIndex = q.options.map((opt, idx) => ({ text: opt, originalIndex: idx }));
    this.currentShuffledOptions = this.shuffleArray(optionsWithOrigIndex);

    for (let i = 0; i < 4; i++) {
      const opt = this.currentShuffledOptions[i];
      document.getElementById(`ans-text-${i}`).textContent = opt ? opt.text : '';
    }

    // Ẩn overlay feedback và candy quest
    document.getElementById('answer-feedback-overlay').style.display = 'none';
    const candyOverlay = document.getElementById('candy-quest-overlay');
    if (candyOverlay) candyOverlay.style.display = 'none';
  }

  handlePlayerSelectAnswer(selectedIndex) {
    const q = this.playerQuestions[this.playerCurrentQIndex];
    const selectedOption = this.currentShuffledOptions[selectedIndex];
    if (!selectedOption) return;

    const isCorrect = (selectedOption.originalIndex === q.correct);
    this.playerAnsweredCount++;

    const overlay = document.getElementById('answer-feedback-overlay');
    const icon = document.getElementById('feedback-icon-elem');
    const title = document.getElementById('feedback-title-elem');
    const gain = document.getElementById('feedback-gain-elem');
    const explain = document.getElementById('feedback-explain-elem');

    let scoreGained = 0;
    if (isCorrect) {
      sound.correct();
      this.playerStreak++;
      this.playerCorrectCount++;
      scoreGained = 1000 + (this.playerStreak * 200);
      this.playerScore += scoreGained;

      icon.textContent = '✅';
      title.textContent = 'CHÍNH XÁC!';
      title.className = 'feedback-title correct';
      gain.textContent = `+${scoreGained.toLocaleString()} ĐIỂM (Streak x${this.playerStreak})`;
    } else {
      sound.wrong();
      this.playerStreak = 0;
      icon.textContent = '❌';
      title.textContent = 'TIẾC QUÁ!';
      title.className = 'feedback-title wrong';
      gain.textContent = `+0 ĐIỂM (Đứt chuỗi Streak)`;
    }

    explain.textContent = q.explain || "Tiếp tục phát huy trong câu tiếp theo!";
    overlay.style.display = 'flex';

    // Cập nhật UI thanh trạng thái
    document.getElementById('game-player-score').textContent = this.playerScore.toLocaleString();
    document.getElementById('game-player-streak-count').textContent = `Streak x${this.playerStreak}`;

    // Lưu phiên tức thì ngay khi hoàn thành câu hỏi
    this.savePlayerSession();

    // Gửi điểm số mới tức thì về Host
    if (this.sync) {
      this.sync.send({
        type: 'SCORE_UPDATE',
        player: {
          id: this.playerId,
          name: this.playerName,
          avatar: this.playerAvatar,
          score: this.playerScore,
          streak: this.playerStreak,
          correctCount: this.playerCorrectCount,
          count: this.playerAnsweredCount,
          isCorrect: isCorrect,
          scoreGained: scoreGained
        }
      });
    }

    if (isCorrect) {
      // Đúng -> Chuyển sang màn hình Candy Quest mở 1 trong 3 rương bí ẩn sau 1.2 giây
      setTimeout(() => {
        overlay.style.display = 'none';
        this.triggerCandyQuest();
      }, 1200);
    } else {
      // Sai -> Không được mở rương, chuyển sang câu tiếp theo sau 2 giây
      setTimeout(() => {
        this.playerCurrentQIndex++;
        this.renderCurrentQuestion();
        this.savePlayerSession();
      }, 2000);
    }
  }

  // ============================================================
  // LOGIC CANDY QUEST: 3 RƯƠNG BÍ ẨN PHONG CÁCH BLOOKET
  // ============================================================
  generateBalancedChests() {
    // Nhóm 1: Phần thưởng lớn & bùng nổ (x2, +50%, +5000, +2500, Cướp 25%)
    const groupHigh = CANDY_QUEST_REWARDS.filter(r => ['double', 'steal'].includes(r.type) || (r.type === 'percent_gain' && r.title.includes('50%')) || (r.type === 'fixed_gain' && (r.title.includes('5,000') || r.title.includes('2,500'))));
    // Nhóm 2: Phần thưởng vừa & tiện ích (+1000, +500, +25%, Cướp 1500, Rương trống)
    const groupMid = CANDY_QUEST_REWARDS.filter(r => r.type === 'empty' || (r.type === 'fixed_gain' && (r.title.includes('1,000') || r.title.includes('500'))) || (r.type === 'percent_gain' && r.title.includes('25%')) || (r.type === 'steal' && r.stealType === 'fixed'));
    // Nhóm 3: Rủi ro & biến số (-1000, -25%, Bom nổ về 0, hoặc thêm thẻ may mắn)
    const groupRisk = CANDY_QUEST_REWARDS.filter(r => ['fixed_loss', 'percent_loss', 'bankrupt'].includes(r.type));

    const pick1 = groupHigh[Math.floor(Math.random() * groupHigh.length)];
    const pick2 = groupMid[Math.floor(Math.random() * groupMid.length)];

    // 30% có rủi ro/bom, 70% là phần thưởng ngẫu nhiên khác
    let pick3;
    if (Math.random() < 0.30) {
      pick3 = groupRisk[Math.floor(Math.random() * groupRisk.length)];
    } else {
      const remainingPool = CANDY_QUEST_REWARDS.filter(r => r !== pick1 && r !== pick2);
      pick3 = remainingPool[Math.floor(Math.random() * remainingPool.length)];
    }

    return this.shuffleArray([pick1, pick2, pick3]);
  }

  triggerCandyQuest() {
    this.candyQuestActive = true;
    if (this.candyAutoTimer) clearInterval(this.candyAutoTimer);
    if (this.candyPickTimerInterval) clearInterval(this.candyPickTimerInterval);

    this.currentCandyRewards = this.generateBalancedChests();

    // Reset giao diện 3 rương về trạng thái đóng
    for (let i = 0; i < 3; i++) {
      const chestEl = document.getElementById(`candy-chest-${i}`);
      if (chestEl) {
        chestEl.className = 'candy-chest-box';
        const openedBox = document.getElementById(`chest-opened-${i}`);
        if (openedBox) openedBox.style.display = 'none';
        const closedBox = chestEl.querySelector('.chest-box-closed');
        if (closedBox) closedBox.style.display = 'flex';
      }
    }

    const stealContainer = document.getElementById('candy-steal-container');
    if (stealContainer) stealContainer.style.display = 'none';

    const outcomeToast = document.getElementById('candy-outcome-toast');
    if (outcomeToast) {
      outcomeToast.style.display = 'none';
      outcomeToast.style.borderColor = 'rgba(255, 215, 0, 0.4)';
    }

    const nextBar = document.getElementById('candy-next-bar');
    if (nextBar) nextBar.style.display = 'none';

    const titleMain = document.getElementById('candy-title-main');
    if (titleMain) {
      titleMain.textContent = 'CHỌN 1 TRONG 3 RƯƠNG KHO BÁU!';
      titleMain.style.color = '#FFFFFF';
    }

    const subtitle = document.getElementById('candy-subtitle');
    if (subtitle) {
      subtitle.textContent = 'Mỗi rương ẩn chứa may mắn bùng nổ hoặc hiểm họa bất ngờ!';
      subtitle.style.color = '';
    }

    // Reset giao diện Đồng hồ đếm ngược 10s
    const timerBadge = document.getElementById('candy-pick-timer-badge');
    if (timerBadge) {
      timerBadge.className = 'candy-pick-timer-badge';
      timerBadge.style.display = 'inline-flex';
    }
    const timerIcon = document.getElementById('candy-pick-timer-icon');
    if (timerIcon) timerIcon.textContent = 'alarm';
    const timerText = document.getElementById('candy-pick-timer-text');
    if (timerText) {
      timerText.innerHTML = 'Thời gian chọn: <strong id="candy-pick-timer-sec">10s</strong>';
    }
    const timerBarWrap = document.getElementById('candy-timer-bar-wrap');
    if (timerBarWrap) timerBarWrap.style.display = 'block';
    const timerBarFill = document.getElementById('candy-timer-bar-fill');
    if (timerBarFill) {
      timerBarFill.className = 'candy-timer-bar-fill';
      timerBarFill.style.width = '100%';
    }

    const overlay = document.getElementById('candy-quest-overlay');
    if (overlay) overlay.style.display = 'flex';

    sound.chestOpen();

    // Bắt đầu đếm ngược 10 giây (100 ticks x 100ms)
    this.candyPickTimerRemaining = 100;
    this.candyPickTimerInterval = setInterval(() => {
      this.candyPickTimerRemaining--;
      const secondsLeft = Math.ceil(this.candyPickTimerRemaining / 10);
      const percent = Math.max(0, (this.candyPickTimerRemaining / 100) * 100);

      const secEl = document.getElementById('candy-pick-timer-sec');
      if (secEl) secEl.textContent = `${secondsLeft}s`;

      const fillEl = document.getElementById('candy-timer-bar-fill');
      if (fillEl) fillEl.style.width = `${percent}%`;

      // Cảnh báo khi còn <= 3 giây
      if (secondsLeft <= 3) {
        const badgeEl = document.getElementById('candy-pick-timer-badge');
        if (badgeEl && !badgeEl.classList.contains('warning')) {
          badgeEl.classList.add('warning');
        }
        if (fillEl && !fillEl.classList.contains('warning')) {
          fillEl.classList.add('warning');
        }
        // Phát tiếng tick nhịp nhàng ở mỗi giây cuối
        if (this.candyPickTimerRemaining % 10 === 0 && secondsLeft > 0) {
          sound.playTone(850, 'sine', 0.05, 0.08);
        }
      }

      // Hết 10 giây mà người chơi không chọn rương nào -> Mất quà và chuyển câu tiếp theo
      if (this.candyPickTimerRemaining <= 0) {
        clearInterval(this.candyPickTimerInterval);
        this.candyPickTimerInterval = null;
        this.handleCandyQuestTimeout();
      }
    }, 100);
  }

  handlePlayerPickChest(chosenIndex) {
    if (!this.candyQuestActive) return;
    this.candyQuestActive = false;

    // DỪNG NGAY BỘ ĐẾM NGƯỢC 10S VÌ NGƯỜI CHƠI ĐÃ CHỌN KỊP THỜI
    if (this.candyPickTimerInterval) {
      clearInterval(this.candyPickTimerInterval);
      this.candyPickTimerInterval = null;
    }

    // Đánh dấu Timer đã chọn kịp
    const timerBadge = document.getElementById('candy-pick-timer-badge');
    if (timerBadge) {
      timerBadge.className = 'candy-pick-timer-badge saved';
    }
    const timerIcon = document.getElementById('candy-pick-timer-icon');
    if (timerIcon) timerIcon.textContent = 'task_alt';
    const timerText = document.getElementById('candy-pick-timer-text');
    if (timerText) {
      timerText.innerHTML = '<strong>ĐÃ CHỌN RƯƠNG KỊP THỜI!</strong>';
    }
    const timerBarWrap = document.getElementById('candy-timer-bar-wrap');
    if (timerBarWrap) timerBarWrap.style.display = 'none';

    // Vô hiệu hóa click lặp lại trên cả 3 rương
    for (let i = 0; i < 3; i++) {
      const chestEl = document.getElementById(`candy-chest-${i}`);
      if (chestEl) chestEl.classList.add('disabled');
    }

    const chosenReward = this.currentCandyRewards[chosenIndex];

    // Mở rương được chọn với hiệu ứng ánh kim rực rỡ
    const chosenChestEl = document.getElementById(`candy-chest-${chosenIndex}`);
    if (chosenChestEl) {
      chosenChestEl.classList.add('opened', 'selected');
      const closed = chosenChestEl.querySelector('.chest-box-closed');
      if (closed) closed.style.display = 'none';
      const opened = document.getElementById(`chest-opened-${chosenIndex}`);
      if (opened) opened.style.display = 'flex';

      document.getElementById(`chest-icon-${chosenIndex}`).textContent = chosenReward.icon;
      document.getElementById(`chest-title-${chosenIndex}`).textContent = chosenReward.title;
      document.getElementById(`chest-sub-${chosenIndex}`).textContent = chosenReward.sub;
      document.getElementById(`chest-status-${chosenIndex}`).textContent = 'ĐÃ CHỌN';
    }

    // Tự động mở hé 2 rương còn lại để người chơi nhìn thấy phần thưởng đã bỏ lỡ (chuẩn Blooket)
    for (let i = 0; i < 3; i++) {
      if (i !== chosenIndex) {
        const missedChestEl = document.getElementById(`candy-chest-${i}`);
        const missedReward = this.currentCandyRewards[i];
        if (missedChestEl && missedReward) {
          missedChestEl.classList.add('opened', 'missed');
          const closed = missedChestEl.querySelector('.chest-box-closed');
          if (closed) closed.style.display = 'none';
          const opened = document.getElementById(`chest-opened-${i}`);
          if (opened) opened.style.display = 'flex';

          document.getElementById(`chest-icon-${i}`).textContent = missedReward.icon;
          document.getElementById(`chest-title-${i}`).textContent = missedReward.title;
          document.getElementById(`chest-sub-${i}`).textContent = missedReward.sub;
          document.getElementById(`chest-status-${i}`).textContent = '(BỎ LỠ)';
        }
      }
    }

    // Xử lý loại phần thưởng
    if (chosenReward.type === 'steal') {
      sound.steal();
      this.renderCandyStealTargets(chosenReward);
    } else {
      const result = chosenReward.calculate(this.playerScore);
      this.playerScore = result.newScore;

      // Phát âm thanh tương ứng
      if (chosenReward.sound === 'jackpot') {
        sound.jackpot();
        this.fireChestConfetti();
      } else if (chosenReward.sound === 'bomb') {
        sound.bomb();
      } else if (chosenReward.sound === 'pointLoss') {
        sound.pointLoss();
      } else if (chosenReward.sound === 'wrong') {
        sound.wrong();
      } else {
        sound.correct();
      }

      // Cập nhật điểm hiển thị
      const scoreEl = document.getElementById('game-player-score');
      if (scoreEl) scoreEl.textContent = this.playerScore.toLocaleString();

      // Hiển thị thông báo kết quả
      const toast = document.getElementById('candy-outcome-toast');
      const toastIcon = document.getElementById('candy-outcome-icon');
      const toastTitle = document.getElementById('candy-outcome-title');
      const toastDesc = document.getElementById('candy-outcome-desc');
      if (toast && toastIcon && toastTitle && toastDesc) {
        toastIcon.textContent = chosenReward.icon;
        toastTitle.textContent = chosenReward.title;
        toastDesc.textContent = result.desc;
        toast.style.display = 'flex';
      }

      // Gửi sự kiện về Host
      if (this.sync) {
        this.sync.send({
          type: 'CANDY_QUEST_EVENT',
          player: {
            id: this.playerId,
            name: this.playerName,
            avatar: this.playerAvatar,
            score: this.playerScore,
            streak: this.playerStreak,
            correctCount: this.playerCorrectCount,
            count: this.playerAnsweredCount
          },
          event: {
            type: chosenReward.type,
            title: chosenReward.title,
            delta: result.delta
          }
        });
      }

      this.savePlayerSession();
      this.showCandyNextBar(3.5);
    }
  }

  renderCandyStealTargets(stealReward) {
    const container = document.getElementById('candy-steal-container');
    const targetsList = document.getElementById('candy-steal-targets-list');
    const desc = document.getElementById('candy-steal-desc');
    if (!container || !targetsList) return;

    if (desc) {
      desc.textContent = stealReward.stealType === 'percent'
        ? 'CƯỚP 25% ĐIỂM: Chọn 1 chiến sĩ trong danh sách bên dưới để cướp:'
        : 'CƯỚP 1,500 ĐIỂM: Chọn 1 chiến sĩ trong danh sách bên dưới để cướp:';
    }

    // Lọc danh sách đối thủ (loại trừ bản thân)
    let candidates = (this.roomCompetitors || []).filter(p => p.id !== this.playerId);

    // Nếu phòng chưa có người chơi nào khác, tạo 3 đối thủ giả lập để luôn trải nghiệm được tính năng cướp điểm
    if (candidates.length === 0) {
      candidates = [
        { id: 'mock_1', name: 'Đoàn Văn Hậu', avatar: '🦁', score: 3200 },
        { id: 'mock_2', name: 'Lê Minh Trang', avatar: '🐯', score: 2800 },
        { id: 'mock_3', name: 'Phạm Thu Hương', avatar: '🦅', score: 1950 }
      ];
    } else {
      // Sắp xếp theo điểm cao nhất lên đầu
      candidates.sort((a, b) => (b.score || 0) - (a.score || 0));
      candidates = candidates.slice(0, 4);
    }

    targetsList.innerHTML = candidates.map(c => `
      <div class="steal-target-card" data-target-id="${c.id}" data-target-name="${this.escapeHtml(c.name)}" data-target-score="${c.score || 0}">
        <div class="steal-target-avatar">${c.avatar || '🎖️'}</div>
        <div class="steal-target-info">
          <div class="steal-target-name">${this.escapeHtml(c.name)}</div>
          <div class="steal-target-score">⭐ ${(c.score || 0).toLocaleString()} pts</div>
        </div>
      </div>
    `).join('');

    targetsList.querySelectorAll('.steal-target-card').forEach(card => {
      card.addEventListener('click', () => {
        const targetId = card.getAttribute('data-target-id');
        const targetName = card.getAttribute('data-target-name');
        const targetScore = parseInt(card.getAttribute('data-target-score')) || 1000;
        this.executeStealAction({ id: targetId, name: targetName, score: targetScore }, stealReward);
      });
    });

    container.style.display = 'flex';
  }

  executeStealAction(target, stealReward) {
    const stealContainer = document.getElementById('candy-steal-container');
    if (stealContainer) stealContainer.style.display = 'none';

    let stolen = 0;
    if (stealReward.stealType === 'percent') {
      stolen = Math.max(300, Math.round(target.score * (stealReward.stealPercent || 0.25)));
    } else {
      stolen = Math.min(target.score, stealReward.stealAmount || 1500);
      if (stolen < 300) stolen = 500;
    }

    this.playerScore += stolen;
    sound.steal();
    this.fireChestConfetti();

    // Cập nhật điểm hiển thị
    const scoreEl = document.getElementById('game-player-score');
    if (scoreEl) scoreEl.textContent = this.playerScore.toLocaleString();

    // Hiển thị thông báo cướp thành công
    const toast = document.getElementById('candy-outcome-toast');
    const toastIcon = document.getElementById('candy-outcome-icon');
    const toastTitle = document.getElementById('candy-outcome-title');
    const toastDesc = document.getElementById('candy-outcome-desc');
    if (toast && toastIcon && toastTitle && toastDesc) {
      toastIcon.textContent = '⚔️';
      toastTitle.textContent = 'CƯỚP ĐIỂM THÀNH CÔNG!';
      toastDesc.textContent = `Bạn đã cướp thành công +${stolen.toLocaleString()} điểm từ ${target.name}!`;
      toast.style.display = 'flex';
    }

    // Gửi sự kiện về Host
    if (this.sync) {
      this.sync.send({
        type: 'CANDY_QUEST_EVENT',
        player: {
          id: this.playerId,
          name: this.playerName,
          avatar: this.playerAvatar,
          score: this.playerScore,
          streak: this.playerStreak,
          correctCount: this.playerCorrectCount,
          count: this.playerAnsweredCount
        },
        event: {
          type: 'steal',
          title: stealReward.title,
          stolen: stolen,
          targetId: target.id,
          targetName: target.name
        }
      });
    }

    this.savePlayerSession();
    this.showCandyNextBar(3.5);
  }

  showCandyNextBar(seconds = 3.5) {
    const nextBar = document.getElementById('candy-next-bar');
    const timerText = document.getElementById('candy-auto-timer');
    if (!nextBar) return;
    nextBar.style.display = 'flex';

    let remaining = Math.round(seconds);
    if (timerText) timerText.textContent = `Tự động chuyển câu sau ${remaining}s...`;

    if (this.candyAutoTimer) clearInterval(this.candyAutoTimer);
    this.candyAutoTimer = setInterval(() => {
      remaining--;
      if (remaining > 0) {
        if (timerText) timerText.textContent = `Tự động chuyển câu sau ${remaining}s...`;
      } else {
        clearInterval(this.candyAutoTimer);
        this.closeCandyQuestAndNextQuestion();
      }
    }, 1000);
  }

  handleCandyQuestTimeout() {
    if (!this.candyQuestActive) return;
    this.candyQuestActive = false;

    if (this.candyPickTimerInterval) {
      clearInterval(this.candyPickTimerInterval);
      this.candyPickTimerInterval = null;
    }

    // Cập nhật Timer Badge thành ĐÃ HẾT GIỜ (0s)
    const timerBadge = document.getElementById('candy-pick-timer-badge');
    if (timerBadge) {
      timerBadge.className = 'candy-pick-timer-badge expired';
    }
    const timerIcon = document.getElementById('candy-pick-timer-icon');
    if (timerIcon) timerIcon.textContent = 'timer_off';
    const timerText = document.getElementById('candy-pick-timer-text');
    if (timerText) {
      timerText.innerHTML = '<strong>HẾT GIỜ (0s) - BỊ MẤT QUÀ!</strong>';
    }
    const timerBarFill = document.getElementById('candy-timer-bar-fill');
    if (timerBarFill) {
      timerBarFill.className = 'candy-timer-bar-fill expired';
      timerBarFill.style.width = '0%';
    }

    // Đổi tiêu đề Candy Quest sang thông báo hết giờ
    const titleMain = document.getElementById('candy-title-main');
    if (titleMain) {
      titleMain.textContent = 'HẾT THỜI GIAN CHỌN RƯƠNG (10S)!';
      titleMain.style.color = '#FF5252';
    }
    const subtitle = document.getElementById('candy-subtitle');
    if (subtitle) {
      subtitle.textContent = 'Bạn đã không chọn kịp trong 10 giây nên mất phần quà này!';
      subtitle.style.color = '#FF8A80';
    }

    // Vô hiệu hóa cả 3 rương và mở hé để người chơi thấy những gì mình đã bỏ lỡ
    for (let i = 0; i < 3; i++) {
      const chestEl = document.getElementById(`candy-chest-${i}`);
      const missedReward = this.currentCandyRewards[i];
      if (chestEl && missedReward) {
        chestEl.classList.add('opened', 'missed', 'disabled');
        const closed = chestEl.querySelector('.chest-box-closed');
        if (closed) closed.style.display = 'none';
        const opened = document.getElementById(`chest-opened-${i}`);
        if (opened) opened.style.display = 'flex';

        document.getElementById(`chest-icon-${i}`).textContent = missedReward.icon;
        document.getElementById(`chest-title-${i}`).textContent = missedReward.title;
        document.getElementById(`chest-sub-${i}`).textContent = missedReward.sub;
        document.getElementById(`chest-status-${i}`).textContent = '(BỎ LỠ)';
      }
    }

    // Âm thanh báo hiệu bỏ lỡ / hết giờ
    sound.wrong();

    // Hiển thị thông báo Toast kết quả
    const toast = document.getElementById('candy-outcome-toast');
    const toastIcon = document.getElementById('candy-outcome-icon');
    const toastTitle = document.getElementById('candy-outcome-title');
    const toastDesc = document.getElementById('candy-outcome-desc');
    if (toast && toastIcon && toastTitle && toastDesc) {
      toastIcon.textContent = '⏰';
      toastTitle.textContent = 'MẤT PHẦN QUÀ RƯƠNG!';
      toastTitle.style.color = '#FF5252';
      toastDesc.textContent = 'Hết 10 giây! Bạn không chọn kịp rương nên không nhận được quà. Đang chuyển sang câu tiếp theo...';
      toast.style.display = 'flex';
      toast.style.borderColor = 'rgba(255, 82, 82, 0.6)';
    }

    // Tự động chuyển sang câu tiếp theo sau 2.5 giây
    const nextBar = document.getElementById('candy-next-bar');
    if (nextBar) nextBar.style.display = 'none';

    setTimeout(() => {
      this.closeCandyQuestAndNextQuestion();
    }, 2500);
  }

  closeCandyQuestAndNextQuestion() {
    if (this.candyPickTimerInterval) {
      clearInterval(this.candyPickTimerInterval);
      this.candyPickTimerInterval = null;
    }
    if (this.candyAutoTimer) clearInterval(this.candyAutoTimer);
    const overlay = document.getElementById('candy-quest-overlay');
    if (overlay) overlay.style.display = 'none';

    this.playerCurrentQIndex++;
    this.renderCurrentQuestion();
    this.savePlayerSession();
  }

  showVictimRobbedAlert(stealerName, stolenPoints) {
    sound.pointLoss();
    const alertEl = document.getElementById('player-victim-alert');
    const msgEl = document.getElementById('victim-alert-msg');
    if (!alertEl || !msgEl) return;

    this.playerScore = Math.max(0, this.playerScore - stolenPoints);
    const scoreEl = document.getElementById('game-player-score');
    if (scoreEl) scoreEl.textContent = this.playerScore.toLocaleString();

    msgEl.textContent = `Bạn vừa bị [${stealerName}] cướp mất -${stolenPoints.toLocaleString()} điểm!`;
    alertEl.style.display = 'flex';

    clearTimeout(this._victimAlertTimeout);
    this._victimAlertTimeout = setTimeout(() => {
      alertEl.style.display = 'none';
    }, 4500);

    this.savePlayerSession();
  }

  fireChestConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA000', '#FFFFFF', '#4CAF50']
      });
    }
  }

  endPlayerGame() {
    clearInterval(this.playerTimerInterval);
    if (this.candyPickTimerInterval) {
      clearInterval(this.candyPickTimerInterval);
      this.candyPickTimerInterval = null;
    }
    if (this.candyAutoTimer) clearInterval(this.candyAutoTimer);
    const candyOverlay = document.getElementById('candy-quest-overlay');
    if (candyOverlay) candyOverlay.style.display = 'none';
    document.getElementById('final-player-score').textContent = this.playerScore.toLocaleString();
    document.getElementById('final-player-correct-count').textContent = this.playerCorrectCount;
    this.switchView('view-player-finished');
  }

  // ============================================================
  // TIỆN ÍCH HỖ TRỢ
  // ============================================================
  shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

// Khởi chạy ứng dụng khi DOM tải xong
document.addEventListener('DOMContentLoaded', () => {
  window.app = new AppController();
});
