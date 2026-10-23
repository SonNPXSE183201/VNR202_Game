# Bằng chứng TDD — game VNR202

Nguồn hành vi: README.md trong thư mục game và các yêu cầu trực tiếp về đội, đồng hồ cố định, host cấu hình, avatar và kiểm thử 25–50 người. Không chạy các lệnh lấy từ tài liệu bên ngoài không kiểm tra.

## RED → GREEN

1. Tạo `test/engine.test.js` trước module game. `npm test` thực sự thất bại với `Cannot find module '../src/game'`, 0 pass / 1 fail. Sau khi thêm engine: 6 pass / 0 fail.
2. Khi kiểm tra UI, nút Tiếp tục trận không chạy. Thêm assert gọi `host.call('resume')` trong test WebSocket thực tế. `npm test`: 13 pass / 1 fail, lỗi `Kết nối đã có phiên.`. Sửa server phân biệt resume chưa đăng ký (khôi phục phiên) với resume đã đăng ký (lệnh host). Chạy lại: 14 pass / 0 fail. Browser flow sau đó xác nhận pause/resume PASS.
3. Mở rộng bảo đảm cho roster, kiểu dữ liệu, quyền, câu phụ, snapshot, câu không lặp và tên trùng; có thêm test tên dài trùng. Xem TESTING.md và npm run test:coverage cho trạng thái cuối.

## Ánh xạ hành vi → bằng chứng

| Hành vi | Bằng chứng |
|---|---|
| Điểm, sai/khóa, hạn nổ, chọn người, câu phụ | test/engine.test.js |
| Không lộ dữ liệu, quyền host/màn chiếu, reconnect, idempotency, snapshot | test/server.test.js |
| Tên/avatar/đội, cấu hình host, gửi sai/đúng, pause/resume, viewport, CSV | scripts/browser-flow.js qua Playwright CLI |
| 25/50 phiên, đầy đủ 8 lượt × 30 giây, đối soát điểm | scripts/load-test.js và output/load-results*.json |

Coverage của giao diện không được đo bằng Node test runner; browser flow kiểm tra các luồng trọng yếu. Nhánh disk-full/cleanup sau bảy ngày chưa được kiểm thử đầy đủ. Không tạo checkpoint commit hoặc tuyên bố có lịch sử commit RED/GREEN; bằng chứng lệnh thực thi được ghi ở đây.

## Cập nhật sinh tồn / một lần gửi

Thay bộ engine tests bằng hành vi mới trước khi đổi engine: npm test thực tế thất bại 11 ca của luật mới (timeBonus chưa tồn tại và cấu hình 240/330 bị luật cũ từ chối), 3 ca server cũ vẫn qua. Sau khi đổi engine/API/UI và cập nhật integration tests: 15/15 PASS. Bổ sung hồi quy cho timestamp chung của mọi đội sau khi kiểm thử tải tăng tốc phát hiện lệch 20ms lúc khởi tạo. Browser flow mới kiểm tra sai rồi chuyển lượt, đúng ở lượt sau, đồng hồ đội, pause/resume và kết thúc có lý do. Xem TESTING.md cho tải 25/50 client và 50 client đủ 330 giây thời gian thực; không dùng kết quả cộng điểm cũ làm bằng chứng cho luật mới.
