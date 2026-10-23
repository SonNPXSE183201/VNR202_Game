# Luật trợ giúp và hạn câu

- Mỗi câu có **15 giây** từ lúc máy chủ giao lượt. Bom đội vẫn đếm tự nhiên. Hết hạn câu: trừ **8 giây**, ngắt chuỗi đúng, chuyển người và câu mới. Bom hết trước thì đội dừng ngay. Các sự kiện hết hạn được xử lý theo mốc thời gian, không theo độ trễ tick.
- Đúng ≤5s/+10s, ≤10s/+7s, sau đó/+4s. Sai một lần/−8s. Không thử lại. Giới hạn trận mặc định 330s và dự trữ thời gian đầu +60s không đổi.
- Mỗi đội có một lần **50/50**, một lần **Ngôi sao hy vọng**, một lần **Chuyển thời gian**; dùng hoặc không tùy đội. Chỉ người giữ bom được kích hoạt. Mỗi câu tối đa một quyền, không gia hạn câu, không đặt lại hạn bom.
- **50/50:** máy chủ loại hai phương án sai, chỉ còn một đúng/một sai; phương án bị loại cũng bị máy chủ từ chối nếu client cố gửi.
- **Ngôi sao:** bật trước khi gửi, đúng thêm 15s ngoài thưởng tốc độ; vẫn chịu trần dự trữ. Sai hoặc hết hạn: mất quyền, không cộng thêm, phạt như bình thường.
- **Chuyển thời gian:** 3 câu đúng liên tiếp mở khóa vĩnh viễn cho trận đó. Sai/hết hạn ngắt chuỗi nhưng không thu hồi quyền đã mở. Chọn đội khác chưa nổ; chuyển 50% thời gian còn lại, tối đa 20s và không vượt chỗ trống dự trữ của đội dùng. Đội bị chọn chỉ mất đúng số đội dùng thực nhận. Không có chuyển âm/nhân đôi, không chọn chính mình. Một lần trong trận.
- Pause đóng băng cả bom và hạn câu, không nhận đáp án/quyền. Reconnect không phục hồi quyền đã dùng. Hủy toàn trận đặt lại mọi quyền/chuỗi. Dùng quyền có log host và trạng thái công khai trên thẻ đội. Không tự phạt chỉ vì mất focus.

Tên ngắn trong mã: `fifty`, `star`, `transfer`. Máy chủ giữ trạng thái, hạn và phương án loại; client không tự cộng/trừ thời gian. Snapshot khác phiên bản ngân hàng mới bị bỏ qua; tạo phòng mới sau triển khai.

## Nội dung câu hỏi

Kho `src/questions.js`, phiên bản `group01-1945-1946-v2-powers`. Câu 11/13 phân biệt khái quát của slide với sáu nhiệm vụ tại phiên họp 3/9/1945. Câu 25 gọi đúng Chính phủ Liên hiệp kháng chiến; câu 46 hỏi rõ đại diện phía Pháp; câu 48 bổ sung Liên bang Đông Dương/Liên hiệp Pháp. Các phương án nhiễu phủ định mạnh về độc lập, chính quyền và vai trò lãnh đạo được thay bằng nhiệm vụ/sự kiện khác trong nội dung học. Không sửa PDF hoặc dựng trích dẫn. Metadata câu có trang PDF và URL đối chiếu khi bổ sung. Host vẫn cần duyệt trước trận; đây không phải chứng nhận pháp lý hay thẩm định lịch sử độc lập toàn bộ kho.

## Kiểm thử

**PASS**, ngày 23/10/2026:

- **31/31 test Node**: luật cũ còn áp dụng, hạn câu, timeout/idle, quyền người giữ bom, 50/50 giữ một đúng/một sai và chặn phương án loại, ngôi sao đúng/sai/hết hạn, chuỗi đúng, chuyển 50%/trần 20s/trần dự trữ, hai đội cùng chọn mục tiêu, pause/cancel, idempotency và reconnect qua WebSocket, cấu trúc và chỉnh sửa kho câu.
- Coverage engine 94,44% dòng / 87,87% nhánh; server 88,14% dòng / 76,80% nhánh. Tổng Node 95,59% dòng / 84,42% nhánh bao gồm dữ liệu câu hỏi, không phải coverage frontend.
- **50 trang người chơi thật, 8 đội**, phân bố 7–7–6–6–6–6–6–6; đủ 50 người vào form/chọn avatar/đội/sẵn sàng. Lượt cuối chạy thời gian thực **337.342ms** (gồm countdown, pause/reload và thu kết quả), trần chơi active 330s.
- **515 đáp án qua UI**, 514 đúng/1 sai có chủ đích, cả 50 người có trả lời (9–11 lần/người); **50/50 nhận kết quả**, không page error. Ba đội 1–3 dùng cả ba quyền (9 lần dùng), năm đội 4–8 không dùng quyền.
- Đội 8 cố ý bỏ câu 35s đầu: log lượt cuối ghi **hai timeout, mỗi lần −8s**, rồi đội tiếp tục chơi. Bom vẫn đếm tự nhiên. Không phải thử trên Render hoặc 50 điện thoại vật lý.
- Log lượt cuối xác nhận đội 1/2 nhận **+22s** khi bật ngôi sao và trả lời trong ngưỡng +7s; đội 3 bật ngôi sao rồi sai không có +15s. Ba lần chuyển **20s** từ đội 7 được ghi nhận; năm đội không dùng có dấu trạng thái chưa dùng. Pause/resume, reload giữ quyền, 50/50 còn hai lựa chọn và màn chiếu 1080p đều PASS.
- Độ trễ thao tác QA (chọn/gửi/đợi chuyển): p50 876ms, p95 4.041ms, max 6.261ms, bao gồm tải Playwright/52 tab cùng máy, không phải RTT mạng.
- Tải WebSocket localhost 20x: 25 phiên PASS, RTT p95 13ms/max24ms; 50 phiên PASS, p95 19ms/max31ms. Đối soát thời gian, reconnect, quyền và gửi trùng PASS; bài tải này không dùng quyền, được bổ sung bởi bài browser ở trên.
- `npm run check`: 24 file JS PASS; không có build/TypeScript/ESLint riêng. `npm audit --omit=dev`: 0 lỗ hổng được báo. Diff không có .env, token thật hoặc endpoint đáp án công khai.

Artifact local: `output/powers-setup.txt`, `output/powers-play.txt`, `output/fifty-ui-powers-log.csv`, `output/powers-tests.txt`, `output/powers-coverage.txt`, `output/powers-load.txt`, `output/playwright/powers-player.png`. CSV giữ cả các lượt hủy để truy vết; số liệu trên chỉ tính từ sự kiện `match` cuối đến `finish` cuối. Các lượt lỗi không tính vào PASS.

Kịch bản tái hiện: khởi động `node scripts/ui-browser-server.js`; mở Playwright CLI và chạy `scripts/fifty-ui-setup.js` để 50 người nhập tên/avatar/đội/sẵn sàng qua form. Chạy `node scripts/prepare-fifty-ui.js --powers`, rồi Playwright `run-code --filename output/fifty-ui-powers.js`. Kịch bản cho 3 đội dùng cả ba quyền, 5 đội không dùng, đội 8 bỏ câu đầu 35 giây rồi chơi tiếp; có ngôi sao trả lời sai, pause/resume và reload. Chỉ sinh đáp án QA vào `output/` được ignore; game không công khai endpoint đáp án.

Lượt UI đầu phát hiện bảng chọn mục tiêu chuyển thời gian bị đóng khi nhận cập nhật từ đội khác. Đã sửa giữ trạng thái bảng chọn/mục tiêu theo lượt câu; lượt lỗi không được tính PASS. Mọi thao tác quyền/đáp án trong kịch bản dùng nút/select trên giao diện, không gọi socket trực tiếp.
