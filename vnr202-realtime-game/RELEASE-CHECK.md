# Kiểm tra trước bàn giao — 23/10/2026

Kết quả: **PASS** cho các luồng tự động bên dưới, chạy lại sau bản dropdown `d1dbc4a`. Môi trường Windows, Node.js 24.16.0, Chromium/Playwright CLI. Không thay đổi luật hoặc mã chạy production trong lượt này; bổ sung kịch bản QA và báo cáo để tái hiện.

## Chức năng và phân quyền

`npm run test:coverage`: **22/22 PASS**, không skip.

- Tạo/bắt đầu với 1–9 đội; cấu hình sai và chưa duyệt nội dung bị từ chối.
- Cộng thời gian theo các ngưỡng 5/10 giây, giới hạn dự trữ, sai trừ giây, một lần gửi, chuyển người/câu.
- Nổ bom, không nhận đáp án quá hạn, kết thúc khi tất cả nổ hoặc chạm giới hạn chung; xếp hạng/đồng hạng.
- Pause/resume, hủy trận và timestamp chung cho các đội.
- Tên duy nhất, Unicode/hoa thường/khoảng trắng, giữ tên offline, rename không thay đổi một phần khi thất bại; hai join cùng tên đồng thời chỉ một thành công.
- Quyền host/player/màn chiếu/giám sát, gửi trùng, reconnect, không lộ đáp án/câu riêng/token qua view công khai.
- Origin HTTPS sau proxy Render, chặn Origin khác, tài nguyên công khai theo allowlist.
- Snapshot phục hồi phiên, hủy trận dở khi restart và không diễn giải lại kho câu khác phiên bản.

Coverage engine: 93,45% dòng / 85,46% nhánh. Server: 82,96% dòng / 70,87% nhánh. Tổng Node 93,03% dòng / 80,34% nhánh có cả file dữ liệu câu hỏi, không phải coverage giao diện. Nhánh lỗi đĩa đầy và mọi tình huống mạng/hệ điều hành chưa được bao phủ hoàn toàn.

## Giao diện thực trên Chromium

| Kịch bản | Kết quả và phạm vi |
|---|---|
| `scripts/browser-flow.js` | PASS: 32 người/8 đội, cấu hình và chọn câu, avatar/đội/sẵn sàng, escape tên HTML, sai một lần rồi chuyển lượt, đúng ở lượt mới, pause/resume, reload giữ phiên, kết thúc có lý do, CSV, responsive và màn chiếu riêng tư |
| `scripts/management-flow.js` | PASS: khóa host sai/đúng, sửa hồ sơ và avatar/đội, host đổi tên/chuyển đội, từ chối tên trùng, xóa người chơi, khóa phòng chặn join/sửa hồ sơ, mở khóa, lọc log, link giám sát chỉ đọc và xóa fragment, hủy trận/reset sẵn sàng, bắt đầu cưỡng bức có xác nhận, kết thúc và tạo phòng mới |
| `scripts/design-flow.js` | PASS: đủ lựa chọn 1–9, cảnh báo tên trùng, ảnh/logo tải được, 50 người/9 đội đủ tên/avatar trong 1920×1080, trang vào phòng 320/390/768px không tràn ngang |
| `scripts/dropdown-flow.js` | PASS: popup có style, màu/bo góc đúng, ArrowDown/Enter chọn 8→9, Escape không đổi giá trị, 320/390/768/1440px không tràn ngang khi mở, forced-colors có fallback |

Browser và management không có page error. Các kịch bản browser kết thúc sớm để kiểm tra hành vi điều khiển; thời gian trận đầy đủ được đo riêng ở bài tải dưới đây.

## Tải WebSocket

| Người | Đồng hồ | Thời gian thật | Đúng / sai | RTT yêu cầu p95 / max |
|---|---|---:|---:|---:|
| 25 | 20x, mô phỏng 330s | 16.707 ms | 1.370 / 461 | 9 / 20 ms |
| 50 | 20x, mô phỏng 330s | 16.733 ms | 1.194 / 421 | 15 / 24 ms |
| 50 | **1x, đủ 330s thực** | **332.178 ms**, gồm countdown | **3.428 / 1.146** | **12 / 29 ms** |

Cả ba đều đủ client nhận cập nhật, không lỗi, reconnect/phân quyền/trần trận/đối soát giây PASS. Bài 1x kiểm tra 8 lần gửi trùng, RTT đáp án p95 4ms/max29ms. Client, máy chủ và các tác vụ QA khác cùng máy: kết quả localhost không chứng minh năng lực Render Free, 50 điện thoại vật lý hoặc Wi-Fi lớp học.

Lệnh: `npm run test:load` và `npm run test:load -- --players 50 --speed 1`. Artifact local trong `output/survival-load-results.json`, `output/survival-load-50-speed1.json`, `output/recheck-*.txt` và `output/playwright/`, được ignore có chủ ý; báo cáo này giữ kết quả review được trong Git.

## Kiểm tra bàn giao

- `npm run check`: PASS, 16 file JS. Không có build/bundler, TypeScript hoặc ESLint riêng; không coi syntax check là lint/typecheck.
- `npm audit --omit=dev`: 0 lỗ hổng được báo tại thời điểm chạy.
- Render hiện tại: `/api/health`, `/logo.svg`, `/style.css` đều HTTP 200; WSS với Origin HTTPS đúng nhận ping ack thành công. Chỉ kiểm tra đọc/ping, không tạo phòng hay dùng khóa host production.
- `.env`, token thật, output và node_modules không đưa vào Git. Các khóa trong script QA là khóa giả, chỉ dùng fixture localhost.
- Chưa kiểm tra Safari/Firefox, thiết bị thật, QR qua camera, fullscreen của từng hệ điều hành, phục hồi sau mọi dạng sự cố hạ tầng hoặc thẩm định độc lập nội dung lịch sử. Cần tổng duyệt Wi-Fi lớp và người phụ trách duyệt câu trước buổi chơi.

## Chạy lại QA giao diện

Terminal 1: `node scripts/ui-fixture.js` (mặc định 31 bot). Terminal 2 mở `npx playwright-cli -s=qa open http://127.0.0.1:3101`, rồi dùng `run-code --filename` với browser-flow, management-flow hoặc dropdown-flow. Với design-flow: khởi động lại fixture bằng `$env:QA_PLAYERS='49'` trước khi chạy. Không chạy fixture trong buổi chơi; chỉ bind loopback và không được npm start nạp.
