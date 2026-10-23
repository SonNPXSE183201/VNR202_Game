# Kiểm thử phiên bản sinh tồn — mỗi câu một lần gửi

## Mới nhất: Dấu mốc độc lập / 1–9 đội / tên duy nhất (23/10/2026)

Các bảng phía dưới là lịch sử phiên bản trước.

- `npm run check`: PASS, 14 file JavaScript. Dự án không có build, TypeScript hoặc ESLint riêng.
- `npm run test:coverage`: **22/22 PASS**. Engine 93,45% dòng / 85,46% nhánh; server 82,96% dòng / 70,87% nhánh. Tổng Node 93,03% dòng / 80,34% nhánh có tính cả dữ liệu câu; không phải coverage frontend.
- Kiểm tra tạo/bắt đầu từng số đội 1–9 và từ chối cấu hình ngoài phạm vi. Chặn tên trùng khi tham gia và đổi tên, khác hoa/thường/khoảng trắng/Unicode/ký tự vô hình; giữ tên người offline. Đổi tên thất bại không đổi đội/avatar. Hai yêu cầu WebSocket cùng tên đồng thời chỉ một yêu cầu thành công.
- Ngân hàng có 60 câu với trang nguồn. `/src/questions.js` trả 404, logo/ảnh trả 200. Snapshot khác phiên bản ngân hàng bị bỏ qua, file cũ không bị xóa trong kiểm thử.
- Tải localhost 20x với kho mới: **25 client PASS**, 1.388 đúng/458 sai, RTT p95 9ms/max18ms; **50 client PASS**, 1.209 đúng/416 sai, RTT p95 14ms/max26ms. Đủ người nhận cập nhật; reconnect, quyền, gửi trùng, đối soát giây và trần trận đều PASS. Không phải đo Render/Wi-Fi thật.
- `scripts/browser-flow.js`: PASS 32 người/8 đội, cấu hình/avatar/tên escape HTML/sai một lần/câu mới/pause/resume/reload/CSV/responsive; không page error.
- `scripts/design-flow.js`, `QA_PLAYERS=49`: **PASS 50 người/9 đội**, dropdown đủ 1–9, cảnh báo tên trùng rồi cho tên khác, ảnh/logo tải được. Màn chiếu đủ 50 tên và 9 đội, vừa 1920×1080. Trang vào phòng không tràn ngang ở 320/390/768px; không page error.
- Đã mở xem ảnh laptop/điện thoại/màn chiếu. Với 9 đội, màn chiếu bỏ thống kê phụ/thanh tiến độ, giữ toàn bộ tên/avatar/người giữ bom/đồng hồ. Tên dài hoặc đội không cân bằng có thể cần cuộn dọc; không ẩn thành viên.
- `npm audit --omit=dev`: 0 lỗ hổng được báo. Diff không có `.env`. Rà soát template escape, không thêm eval/new Function hay log khóa host.

QA mới: terminal 1 đặt `$env:QA_PLAYERS='49'` rồi `node scripts/ui-fixture.js`. Terminal 2 chạy `npx playwright-cli -s=design open http://127.0.0.1:3101` rồi `npx playwright-cli -s=design run-code --filename scripts/design-flow.js`. Chỉ dùng localhost, không chạy fixture trong buổi chơi.

Ảnh `output/playwright/design-*.png`, coverage `output/redesign-coverage.txt` là artifact local được ignore. Sau thay kho phải tạo phòng mới và host duyệt câu trước buổi chơi; tham chiếu trang không phải chứng nhận thẩm định nội dung.

Ngày: 23/10/2026, Asia/Saigon. Windows, Node.js 24.16.0, Chromium qua Playwright CLI. Kết quả thể thức 8 lượt/cộng điểm trước đây không áp dụng cho phiên bản này.

## Chức năng

`npm test`: **17/17 PASS**, không bỏ qua ca nào.

Bảo đảm kiểm tra:

- Đúng ≤5s/+10s, ≤10s/+7s, >10s/+4s; sai −8s; cap dự trữ và số giây thực cấp.
- Sau sai đã đổi lượt/câu; không gửi lại câu cũ. Gửi trùng cùng mã không cộng/trừ hai lần.
- Trừ hết giờ làm nổ ngay; quá hạn không cứu được bom. Đội đã nổ không được trả lời.
- Nổ muộn hơn xếp trên; nổ đồng thời đồng hạng; sống đến trần trận so dự trữ; không ghi giả rằng đội còn sống đã nổ.
- Tất cả hạn khởi đầu và so hạng dùng chung timestamp, không lệch vì vòng lặp.
- Pause/resume dịch mọi đồng hồ và thời gian trả lời đồng đều; thời gian pause không tính sinh tồn/thưởng tốc độ.
- Hủy toàn trận về lobby, reset counters; khởi động lại hủy trận dở an toàn và giữ phiên/đội.
- Quyền host/observer/player/screen, Origin, private assets, không lộ câu đội khác/đáp án/token, reconnect và cấu hình chọn câu.

Coverage đo bằng `npm run test:coverage`: game.js 89,91% dòng / 83,41% nhánh; server.js 83,22% dòng / 67,23% nhánh ở lần đo cuối sau chuẩn hóa định dạng. Coverage tổng Node có cả ngân hàng câu nên không dùng nó để phóng đại mức kiểm thử logic. Không đo coverage frontend bằng Node; frontend được kiểm tra bằng luồng browser bên dưới. Nhánh disk-full, dọn dữ liệu sau bảy ngày và proxy HTTPS chưa được thử đầy đủ.

## Tải nhiều người

Đều dùng client WebSocket thật trên localhost, có ghi snapshot ra đĩa; bot trả lời nhanh để tạo nhiều cập nhật.

| Người | Đồng hồ | Thời gian chạy thật | Đúng / sai | RTT p95 / max |
|---|---|---:|---:|---:|
| 25 | Tăng tốc 20x, mô phỏng đủ 330s | 16.696 ms | 1.398 / 481 | 9 / 24 ms |
| 50 | Tăng tốc 20x, mô phỏng đủ 330s | 16.707 ms | 1.208 / 406 | 15 / 24 ms |
| 50 | **Thời gian thực 1x, đủ 330s** | **332.193 ms**, gồm vào phòng/countdown | **3.426 / 1.144** | **11 / 28 ms** |

Tất cả kịch bản: đủ client nhận trạng thái chơi, reconnect cùng phiên thành công, phân quyền đúng, giới hạn trận không bị kéo dài, hạn bom mỗi đội khớp `thời điểm đầu + thời gian đầu + tổng giây thực cộng/trừ`, không lỗi ngoài các từ chối được cố ý kiểm tra. Gửi trùng không đổi thời gian hai lần.

Lệnh chạy lại:

```powershell
npm run test:load
npm run test:load -- --players 50 --speed 1
```

Kết quả local: output/survival-load-results.json và output/survival-load-50-speed1.json. Tăng tốc 20x chỉ tăng đồng hồ game trong bộ kiểm thử; không phải phép đo 330 giây theo thời gian thực. Trận 1x dùng đồng hồ thực, 50 client và máy chủ trong cùng tiến trình. Heap delta 43,8 MB bao gồm client/bộ ghi kết quả, không phải RAM riêng máy chủ hoặc kết luận về memory leak. Đây không phải kiểm thử 50 điện thoại vật lý hoặc Wi-Fi lớp học.

## Giao diện

Browser flow phiên bản sinh tồn: **PASS**, 32 người hiển thị/8 đội (31 bot + một người thao tác Chromium):

- Host chọn thời gian đầu, trần trận, từng câu; tạo và lưu lại cấu hình.
- Người chơi chọn avatar/đội, sẵn sàng; tên chứa HTML được hiển thị như chữ.
- Sai một lần chuyển lượt ngay; tới lượt tiếp theo mới có thể trả lời câu mới. Đúng cộng giây, không có nút thử lại.
- Reload giữ phiên; pause/resume; host kết thúc sớm có lý do; xuất CSV.
- Màn chiếu không lộ log/câu riêng, hiển thị đủ avatar/tên; lưới chơi vừa 1920×1080 với dữ liệu 32 người cân bằng.
- Khung 390×844, 320×740, 768×1024, 1440×1000 và 1920×1080 đã kiểm tra không tràn ngang trong luồng. Không có page error.
- Ảnh được quan sát để kiểm tra phân biệt đồng hồ trận/đội, avatar, người giữ bom và tên nhóm.

Chạy lại:

```powershell
# Terminal 1 — QA riêng, không dùng trong buổi chơi
node scripts/ui-fixture.js
# Terminal 2
npx playwright-cli -s=survival open http://127.0.0.1:3101 --headed
npx playwright-cli -s=survival run-code --filename scripts/browser-flow.js
```

Ảnh: output/playwright/flow-*.png. QA bind loopback 3101, khóa thử công khai, không được npm start nạp. Browser flow kết thúc sớm có lý do để chạy nhanh; trần thời gian thực được kiểm tra bởi load test 1x, không giả vờ browser flow đã chờ hết 330s.

## Xác minh khác và giới hạn

- `npm run check`: parse các file JavaScript; không có build/bundler, TypeScript hay ESLint. Không gọi kiểm tra cú pháp là lint/typecheck.
- `npm audit --omit=dev`: 0 lỗ hổng runtime được registry báo tại thời điểm chạy.
- Không chỉnh questions.js/game cũ hoặc PDF của người dùng. .env, data, output và node_modules được ignore.
- Nội dung lịch sử cần người phụ trách duyệt nguồn; chưa chứng nhận pháp lý hoặc thẩm định toàn bộ 60 câu.
- Cần tổng duyệt điện thoại iOS/Android, QR, đọc máy chiếu và Wi-Fi thật. RTT localhost không phải cam kết trên mạng lớp.
- Website không cấm tuyệt đối extension/đổi tab; tín hiệu không đủ chứng minh gian lận. Độ khó câu và số người trong đội chưa được cân bằng thực nghiệm.
- Nếu tất cả đội nổ sớm thì trận kết thúc sớm; 5–7 phút là khung tổ chức với trần thời gian, không cưỡng ép kéo dài khi tất cả đã thua.

## Bản vá Origin trên Render

Tái hiện trực tiếp: health HTTP 200 nhưng WebSocket có Origin HTTPS thật bị HTTP 403; kết nối native không có Origin vẫn mở. Thêm hai kiểm thử hồi quy trước sửa: cả hai FAIL với 403. Bản vá tự dùng RENDER_EXTERNAL_URL nếu PUBLIC_ORIGIN chưa đặt, chuẩn hóa khoảng trắng/dấu slash và vẫn chặn Origin bên ngoài. Sau sửa npm test: 17/17 PASS. PUBLIC_ORIGIN đặt rõ ràng vẫn ưu tiên hơn URL Render; cấu hình sai tên miền cần được sửa ở Environment. Không nới lỏng kiểm tra Origin thành cho phép tất cả.
