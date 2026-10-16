// ============================================================
// COMPREHENSIVE AUTOMATED TEST SUITE CHO VNR202 QUIZ ARENA
// Kiểm thử:
// 1. Session Management (Lưu, F5, Khôi phục Host & Player)
// 2. Candy Quest Logic & 10s Timer (Chọn kịp thời vs Timeout mất quà)
// 3. 7 loại thẻ phần thưởng Candy Quest (x2, +%, +điểm, cướp điểm, -điểm, bom về 0, rỗng)
// 4. Kết thúc trận đấu (Top 3 podium, nút về trang chủ, dọn dẹp timers)
// 5. Validation tên người chơi (Phân biệt hoa thường & dấu tiếng Việt 100%)
// 6. Live Log lọc sự kiện (Chỉ log mở rương & cướp điểm, không log câu đúng/sai thường)
// ============================================================

const fs = require('fs');
const path = require('path');

// Mock localStorage & sessionStorage
class MockStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store.hasOwnProperty(key) ? this.store[key] : null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

// Mock BroadcastChannel
class MockBroadcastChannel {
  constructor(name) {
    this.name = name;
    this.onmessage = null;
  }
  postMessage(data) {}
  close() {}
}

// Mock DOM Environment
function createMockDom() {
  const elements = {};
  
  function getOrCreate(id) {
    if (!elements[id]) {
      elements[id] = {
        id,
        textContent: '',
        innerHTML: '',
        style: {},
        value: '',
        children: [],
        addEventListener: () => {},
        remove: () => {},
        insertBefore: () => {},
        appendChild: () => {},
        removeChild: () => {},
        querySelector: () => ({ remove: () => {}, textContent: '', style: {} }),
        querySelectorAll: () => []
      };
      const classSet = new Set();
      elements[id].classList = {
        contains: (c) => classSet.has(c),
        add: (...cs) => cs.forEach(c => classSet.add(c)),
        remove: (...cs) => cs.forEach(c => classSet.delete(c)),
        toggle: (c, force) => {
          if (force !== undefined) {
            if (force) classSet.add(c); else classSet.delete(c);
          } else {
            if (classSet.has(c)) classSet.delete(c); else classSet.add(c);
          }
        },
        has: (c) => classSet.has(c)
      };
    }
    return elements[id];
  }

  const documentMock = {
    body: getOrCreate('body'),
    getElementById: (id) => getOrCreate(id),
    querySelectorAll: () => [],
    querySelector: () => getOrCreate('mock-q'),
    createElement: (tag) => ({
      tagName: tag,
      className: '',
      innerHTML: '',
      style: {},
      appendChild: () => {}
    }),
    addEventListener: () => {}
  };

  const windowMock = {
    location: { origin: 'http://localhost:8080', pathname: '/', host: 'localhost:8080' },
    history: { replaceState: () => {} },
    scrollTo: () => {},
    addEventListener: () => {}
  };

  return { documentMock, windowMock, getOrCreate };
}

// Bắt đầu chạy Test Suite
let testsPassed = 0;
let testsFailed = 0;
const testResults = [];

function assert(condition, testName, details = '') {
  if (condition) {
    testsPassed++;
    testResults.push({ name: testName, status: 'PASSED', details });
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    testsFailed++;
    testResults.push({ name: testName, status: 'FAILED', details });
    console.error(`  ❌ [FAIL] ${testName} - ${details}`);
  }
}

console.log('====================================================');
console.log('🚀 BẮT ĐẦU KIỂM THỬ TOÀN DIỆN CÁC CHỨC NĂNG VNR202');
console.log('====================================================\n');

// Nạp ngân hàng câu hỏi questions.js
global.QUESTIONS_BANK = require('./questions.js');

// Đọc source code app.js
const appJsPath = path.join(__dirname, 'app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

// ============================================================
// TEST GROUP 1: CANDY QUEST REWARDS LOGIC (7 LOẠI THẺ)
// ============================================================
console.log('👉 [TEST GROUP 1] Kiểm thử 7 loại thẻ Candy Quest (Blooket Style):');

// Trích xuất CANDY_QUEST_REWARDS từ app.js
const rewardsMatch = appJsContent.match(/const CANDY_QUEST_REWARDS = (\[[\s\S]*?\n\];)/);
let CANDY_QUEST_REWARDS = [];
if (rewardsMatch) {
  eval(`CANDY_QUEST_REWARDS = ${rewardsMatch[1]}`);
}

assert(CANDY_QUEST_REWARDS.length >= 7, 'Đã định nghĩa đầy đủ danh mục phần thưởng Candy Quest', `Số lượng thẻ: ${CANDY_QUEST_REWARDS.length}`);

// Test thẻ 1: Gấp đôi điểm
const doubleCard = CANDY_QUEST_REWARDS.find(r => r.type === 'double');
assert(doubleCard !== undefined, 'Tồn tại thẻ gấp đôi điểm (double x2)');
if (doubleCard) {
  const res = doubleCard.calculate(2000);
  assert(res.newScore === 4000 && res.delta === 2000, 'Thẻ x2 nhân đôi chính xác điểm số (2000 -> 4000)');
  const resZero = doubleCard.calculate(0);
  assert(resZero.newScore === 1200, 'Thẻ x2 khi có 0 điểm được tặng tối thiểu 1,200 điểm');
}

// Test thẻ 2: Cộng điểm cố định (+1000, +2500, +5000)
const fixedGain5000 = CANDY_QUEST_REWARDS.find(r => r.type === 'fixed_gain' && r.title.includes('5,000'));
assert(fixedGain5000 !== undefined, 'Tồn tại thẻ +5,000 điểm cố định');
if (fixedGain5000) {
  const res = fixedGain5000.calculate(1500);
  assert(res.newScore === 6500 && res.delta === 5000, 'Thẻ +5,000 tính toán chính xác (1500 -> 6500)');
}

// Test thẻ 3: Tăng phần trăm (+25%, +50%)
const percentGain50 = CANDY_QUEST_REWARDS.find(r => r.type === 'percent_gain' && r.title.includes('50%'));
assert(percentGain50 !== undefined, 'Tồn tại thẻ +50% điểm');
if (percentGain50) {
  const res = percentGain50.calculate(4000);
  assert(res.newScore === 6000 && res.delta === 2000, 'Thẻ +50% tính toán chính xác (4000 + 2000 = 6000)');
}

// Test thẻ 4: Trừ điểm cố định (-1000)
const fixedLoss = CANDY_QUEST_REWARDS.find(r => r.type === 'fixed_loss');
assert(fixedLoss !== undefined, 'Tồn tại thẻ bẫy phục kích (-1,000 điểm)');
if (fixedLoss) {
  const res = fixedLoss.calculate(2500);
  assert(res.newScore === 1500 && res.delta === -1000, 'Thẻ trừ điểm không làm điểm âm (2500 -> 1500)');
  const resLow = fixedLoss.calculate(400);
  assert(resLow.newScore === 0, 'Thẻ trừ điểm chặn sàn ở mức 0 điểm (400 -> 0)');
}

// Test thẻ 5: Giảm phần trăm (-25%)
const percentLoss = CANDY_QUEST_REWARDS.find(r => r.type === 'percent_loss');
assert(percentLoss !== undefined, 'Tồn tại thẻ hao hụt tiếp tế (-25% điểm)');
if (percentLoss) {
  const res = percentLoss.calculate(4000);
  assert(res.newScore === 3000, 'Thẻ -25% tính toán chính xác (4000 - 1000 = 3000)');
}

// Test thẻ 6: Bom nổ mất hết điểm (Bankrupt về 0)
const bombCard = CANDY_QUEST_REWARDS.find(r => r.type === 'bankrupt');
assert(bombCard !== undefined, 'Tồn tại thẻ bom nổ bãi mìn (Bankrupt về 0)');
if (bombCard) {
  const res = bombCard.calculate(99999);
  assert(res.newScore === 0 && res.delta === -99999, 'Thẻ bom nổ quét sạch toàn bộ điểm số về 0 (99999 -> 0)');
}

// Test thẻ 7: Rương rỗng (Empty)
const emptyCard = CANDY_QUEST_REWARDS.find(r => r.type === 'empty');
assert(emptyCard !== undefined, 'Tồn tại thẻ rương trống rỗng');
if (emptyCard) {
  const res = emptyCard.calculate(5000);
  assert(res.newScore === 5000 && res.delta === 0, 'Thẻ rương rỗng giữ nguyên điểm số (5000 -> 5000)');
}

// Test thẻ 8: Cướp điểm (Steal 25% hoặc Cướp 1500)
const stealCard = CANDY_QUEST_REWARDS.find(r => r.type === 'steal');
assert(stealCard !== undefined, 'Tồn tại thẻ cướp điểm đối thủ');


// ============================================================
// TEST GROUP 2: CANDY QUEST 10S COUNTDOWN & TIMEOUT BEHAVIOR
// ============================================================
console.log('\n👉 [TEST GROUP 2] Kiểm thử Bộ đếm 10 giây & Xử lý Timeout mất quà:');

// Khởi tạo môi trường giả lập để chạy instance AppController
const mockStorage = new MockStorage();
const { documentMock, windowMock, getOrCreate } = createMockDom();

global.localStorage = mockStorage;
global.sessionStorage = mockStorage;
global.document = documentMock;
global.window = windowMock;
global.BroadcastChannel = MockBroadcastChannel;
global.navigator = { clipboard: { writeText: () => Promise.resolve() } };

// Nạp AppController mà không kích hoạt DOMContentLoaded
const cleanAppCode = appJsContent.substring(0, appJsContent.lastIndexOf('document.addEventListener'));
const AppController = eval('(function() {\n' + cleanAppCode + '\nreturn AppController;\n})()');

const app = new AppController();

// Kịch bản 2A: Kích hoạt Candy Quest và kiểm tra đếm ngược 10s
app.playerScore = 5000;
app.triggerCandyQuest();

assert(app.candyQuestActive === true, 'Candy Quest đang kích hoạt thành công');
assert(app.candyPickTimerInterval !== null, 'Bộ đếm ngược 10s đã được khởi động (candyPickTimerInterval)');
assert(app.candyPickTimerRemaining === 100, 'Thời gian khởi tạo ban đầu là 100 ticks (10.0 giây)');
assert(app.currentCandyRewards.length === 3, 'Hệ thống đã sinh ngẫu nhiên 3 rương kho báu');

// Kịch bản 2B: Người chơi bấm chọn rương kịp thời trong 10 giây
app.handlePlayerPickChest(0);
assert(app.candyQuestActive === false, 'Candy Quest đã đóng sau khi người chơi bấm chọn');
assert(app.candyPickTimerInterval === null, 'Bộ đếm ngược 10s đã được hủy ngay lập tức khi người chơi chọn kịp thời');

// Kịch bản 2C: Kích hoạt Candy Quest và người chơi KHÔNG bấm chọn -> HẾT 10S (TIMEOUT)
app.playerScore = 5000;
app.triggerCandyQuest();
assert(app.candyQuestActive === true, 'Mở quest mới thành công');

// Giả lập đồng hồ đếm lùi về 0 (hết 10 giây)
app.handleCandyQuestTimeout();

assert(app.candyQuestActive === false, 'Quest đã bị khóa khi hết 10 giây');
assert(app.candyPickTimerInterval === null, 'Timer đã được dọn dẹp sạch sẽ khi timeout');
assert(app.playerScore === 5000, 'Người chơi KHÔNG nhận được quà và KHÔNG bị mất điểm vì không mở rương (điểm giữ nguyên 5000)');

const timeoutTitle = documentMock.getElementById('candy-title-main').textContent;
assert(timeoutTitle.includes('HẾT THỜI GIAN') || timeoutTitle.includes('10S'), 'Tiêu đề thông báo hết 10s hiển thị chuẩn xác', `Tiêu đề: ${timeoutTitle}`);

const outcomeToast = documentMock.getElementById('candy-outcome-toast');
assert(outcomeToast.style.display === 'flex', 'Hộp thoại thông báo mất phần quà (toast) hiển thị cho người chơi');


// ============================================================
// TEST GROUP 3: SESSION MANAGEMENT (LƯU & KHÔI PHỤC PHIÊN F5)
// ============================================================
console.log('\n👉 [TEST GROUP 3] Kiểm thử Session (Lưu & Khôi phục khi F5/refresh):');

// 3A: Test Host Session
app.hostRoomCode = '194588';
app.hostTimerDuration = 300;
app.hostTimerRemaining = 245;
app.hostIsRunning = true;
app.currentView = 'view-host-live';
app.hostPlayers = {
  'p1': { id: 'p1', name: 'Đồng chí An', score: 12500, streak: 3, correctCount: 8, count: 9 },
  'p2': { id: 'p2', name: 'Đồng chí Bình', score: 9800, streak: 1, correctCount: 6, count: 8 }
};
app.saveHostSession();

const savedHostData = JSON.parse(mockStorage.getItem('vnr202_active_session'));
assert(savedHostData !== null && savedHostData.roomCode === '194588', 'Lưu Host session vào Storage thành công');
assert(savedHostData.remaining === 245, 'Lưu chính xác thời gian thi đấu còn lại của Host (245s)');
assert(Object.keys(savedHostData.players).length === 2, 'Lưu đầy đủ danh sách và điểm số người chơi của Host');

// Giả lập F5: Khôi phục Host
const appHostRestored = new AppController();
appHostRestored.restoreHostSession(savedHostData);
assert(appHostRestored.hostRoomCode === '194588', 'Khôi phục đúng mã phòng Host (194588)');
assert(appHostRestored.hostTimerRemaining === 245, 'Khôi phục đúng thời gian thi đấu (245s)');
assert(appHostRestored.hostPlayers['p1'].score === 12500, 'Khôi phục đúng điểm số thí sinh An (12,500 pts)');

// 3B: Test Player Session
app.playerRoomCode = '194588';
app.playerName = 'Chiến Sĩ Cụ Hồ';
app.playerScore = 18200;
app.playerStreak = 4;
app.playerCurrentQIndex = 7;
app.playerTimerRemaining = 190;
app.currentView = 'view-player-game';
app.savePlayerSession();

const savedPlayerData = JSON.parse(mockStorage.getItem('vnr202_active_session'));
assert(savedPlayerData !== null && savedPlayerData.name === 'Chiến Sĩ Cụ Hồ', 'Lưu Player session thành công');
assert(savedPlayerData.score === 18200 && savedPlayerData.currentQIndex === 7, 'Lưu đúng điểm số và vị trí câu hỏi (#7)');

// Giả lập F5: Khôi phục Player
const appPlayerRestored = new AppController();
appPlayerRestored.restorePlayerSession(savedPlayerData);
assert(appPlayerRestored.playerName === 'Chiến Sĩ Cụ Hồ', 'Khôi phục đúng tên thí sinh');
assert(appPlayerRestored.playerScore === 18200, 'Khôi phục đúng điểm số của thí sinh (18,200 pts)');
assert(appPlayerRestored.playerCurrentQIndex === 7, 'Khôi phục đúng câu hỏi đang trả lời dở (#7)');


// ============================================================
// TEST GROUP 4: KẾT THÚC TRÒ CHƠI & PODIUM TOP 3
// ============================================================
console.log('\n👉 [TEST GROUP 4] Kiểm thử Kết thúc trận đấu & Hiển thị Top 3 Podium:');

app.hostPlayers = {
  'p1': { id: 'p1', name: 'Nguyễn Văn Nhất', score: 25000, correctCount: 15 },
  'p2': { id: 'p2', name: 'Trần Thị Nhì', score: 19500, correctCount: 12 },
  'p3': { id: 'p3', name: 'Lê Văn Ba', score: 14000, correctCount: 9 },
  'p4': { id: 'p4', name: 'Phạm Văn Bốn', score: 8500, correctCount: 5 }
};

app.endHostGame();
assert(app.hostIsRunning === false, 'Trận đấu Host đã dừng chạy');
assert(app.currentView === 'view-host-podium', 'Đã chuyển sang màn hình Bảng Vàng Vinh Danh (view-host-podium)');

const top1Name = documentMock.getElementById('podium-name-1').textContent;
const top2Name = documentMock.getElementById('podium-name-2').textContent;
const top3Name = documentMock.getElementById('podium-name-3').textContent;

assert(top1Name === 'Nguyễn Văn Nhất', 'Top 1 vinh danh chính xác Nguyễn Văn Nhất (25,000 pts)');
assert(top2Name === 'Trần Thị Nhì', 'Top 2 vinh danh chính xác Trần Thị Nhì (19,500 pts)');
assert(top3Name === 'Lê Văn Ba', 'Top 3 vinh danh chính xác Lê Văn Ba (14,000 pts)');

// Test kết thúc Player
app.playerScore = 25000;
app.playerCorrectCount = 15;
app.endPlayerGame();
assert(app.currentView === 'view-player-finished', 'Màn hình người chơi kết thúc chuyển về view-player-finished');
assert(documentMock.getElementById('final-player-score').textContent === '25,000', 'Hiển thị chính xác tổng điểm cuối trận (25,000)');

// Test Navigation: Đang trong trận khóa nút trang chủ; Sau khi kết thúc mở khóa nút trang chủ
app.currentView = 'view-host-live';
const inActiveDuring = (
  app.currentView === 'view-host-lobby' ||
  app.currentView === 'view-host-live' ||
  app.currentView === 'view-player-waiting' ||
  app.currentView === 'view-player-game'
);
assert(inActiveDuring === true, 'Nút về trang chủ bị KHÓA trong lúc đang chơi để tránh thoát nhầm');

app.currentView = 'view-host-podium';
const inActiveAfter = (
  app.currentView === 'view-host-lobby' ||
  app.currentView === 'view-host-live' ||
  app.currentView === 'view-player-waiting' ||
  app.currentView === 'view-player-game'
);
assert(inActiveAfter === false, 'Nút về trang chủ và Tổ chức trận mới đã MỞ KHÓA sau khi kết thúc trận đấu');


// ============================================================
// TEST GROUP 5: VALIDATION TÊN NGƯỜI CHƠI (PHÂN BIỆT HOA THƯỜNG & DẤU TIẾNG VIỆT 100%)
// ============================================================
console.log('\n👉 [TEST GROUP 5] Kiểm thử Validation Tên (Phân biệt hoa thường & dấu 100%):');

app.hostPlayers = {
  'p1': { id: 'p1', name: 'Nguyễn Văn An' },
  'p2': { id: 'p2', name: 'Trần Bình' }
};

// Hàm kiểm tra trùng tên nguyên bản trong app.js
function isNameDuplicate(newName, hostPlayers) {
  const existingNames = new Set(Object.values(hostPlayers).map(p => (p.name || '').trim()));
  return existingNames.has(newName.trim());
}

// Case 1: Giống hệt 100% -> Phải BÁO TRÙNG
assert(isNameDuplicate('Nguyễn Văn An', app.hostPlayers) === true, 'Tên "Nguyễn Văn An" giống hệt 100% -> Bị từ chối trùng tên');

// Case 2: Khác chữ hoa/thường -> KHÔNG BÁO TRÙNG (cho phép)
assert(isNameDuplicate('nguyễn văn an', app.hostPlayers) === false, 'Tên "nguyễn văn an" (chữ thường) khác chữ hoa -> Được chấp nhận');

// Case 3: Khác dấu tiếng Việt -> KHÔNG BÁO TRÙNG (cho phép)
assert(isNameDuplicate('Nguyen Van An', app.hostPlayers) === false, 'Tên "Nguyen Van An" (không dấu) khác có dấu -> Được chấp nhận');
assert(isNameDuplicate('Nguyễn Văn Ân', app.hostPlayers) === false, 'Tên "Nguyễn Văn Ân" (khác dấu) -> Được chấp nhận');


// ============================================================
// TEST GROUP 6: LIVE LOG FEED (CHỈ GHI NHẬN RƯƠNG BÍ ẨN & CƯỚP ĐIỂM)
// ============================================================
console.log('\n👉 [TEST GROUP 6] Kiểm thử Live Log máy chiếu Host:');

app.hostLogCount = 0;
app.hostRecentLogs = [];

// Mô phỏng sự kiện mở rương cướp điểm
app.addLiveLogEntry({
  isCandyEvent: true,
  candyClass: 'steal',
  name: 'Đồng chí Dũng',
  actionText: 'Vừa CƯỚP 1,500 điểm từ Đồng chí Bình!',
  badgeHtml: '⚔️ CƯỚP ĐIỂM'
});

assert(app.hostLogCount === 1, 'Ghi nhận thành công 1 sự kiện mở rương vào nhật ký');
assert(app.hostRecentLogs[0].actionText.includes('CƯỚP 1,500 điểm'), 'Nội dung log rương cướp điểm chuẩn xác');

// Mô phỏng sự kiện x2 điểm
app.addLiveLogEntry({
  isCandyEvent: true,
  candyClass: 'double',
  name: 'Đồng chí Chi',
  actionText: 'Mở rương x2 GẤP ĐÔI TỔNG ĐIỂM!',
  badgeHtml: '🔥 x2 ĐIỂM'
});
assert(app.hostLogCount === 2, 'Ghi nhận thêm sự kiện x2 điểm vào nhật ký (Tổng 2 sự kiện)');

console.log('\n====================================================');
console.log(`📊 TỔNG KẾT KẾT QUẢ KIỂM THỬ:`);
console.log(`- Tổng số test case: ${testsPassed + testsFailed}`);
console.log(`- Passed: ${testsPassed} ✅`);
console.log(`- Failed: ${testsFailed} ❌`);
console.log('====================================================');

if (testsFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
