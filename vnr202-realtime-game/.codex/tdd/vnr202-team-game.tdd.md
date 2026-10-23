# Bằng chứng TDD — game VNR202

## 23/10/2026: 1–9 đội và tên duy nhất

Nguồn: yêu cầu trực tiếp mới của người dùng. Hành trình: host chọn từ 1–9 đội; người chơi phải nhập tên khác người trong phòng; đổi tên qua host/profile cũng tuân cùng quy tắc; tên offline được giữ.

RED: `node --test --test-name-pattern='team count|duplicate names|renames' test/engine.test.js` thực chạy, 0/3 pass: cấu hình từ chối 1 đội, hai test tên không ném lỗi như mong đợi. Checkpoint `b9c061c`.

GREEN: chạy lại cùng lệnh, 3/3 pass sau thêm validation tên và mở cấu hình. Checkpoint `c2cd5ce`. Test xác nhận Unicode NFC, ký tự vô hình, chữ hoa/thường, khoảng trắng, không làm thay đổi một phần khi rename thất bại và giữ tên của chính mình.

Kiểm thử bổ sung sau triển khai: integration hai socket cùng tên chỉ một join thành công; snapshot khác ngân hàng không được diễn giải lại; browser flow có cảnh báo tên trùng và chọn 9 đội. Bộ nội dung/giao diện dùng kiểm tra tích hợp và trình duyệt, không tuyên bố đã có RED riêng cho từng thay đổi hình thức.

Lượt cuối `npm run test:coverage`: 22/22 PASS; engine 93,45% dòng / 85,46% nhánh, server 82,96% dòng / 70,87% nhánh. Xem TESTING.md cho tải 25/50 và màn chiếu 50 người/9 đội. Tổng Node có dữ liệu câu hỏi, không phải coverage giao diện. Các phần phía dưới là lịch sử.

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
