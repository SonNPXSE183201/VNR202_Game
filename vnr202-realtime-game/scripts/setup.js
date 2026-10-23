const fs = require('node:fs');
const { randomBytes } = require('node:crypto');
if (!fs.existsSync('.env')) {
  fs.writeFileSync('.env', `PORT=3100\nHOST_KEY=${randomBytes(24).toString('base64url')}\n`, { mode: 0o600 });
}
console.log('Đã chuẩn bị .env (không đưa vào Git). Mở file trên máy chủ để lấy HOST_KEY dùng khi tạo phòng.');
