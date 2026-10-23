# Kiểm thử 50 người chơi bằng giao diện web

Ngày 23/10/2026, Chromium trên Windows. Máy chủ QA riêng tại `127.0.0.1:3102`, cùng mã ứng dụng hiện tại, không ảnh hưởng phòng Render. Đây là 50 trang trình duyệt thật trong cùng một browser context; không phải 50 điện thoại, 50 bản cài trình duyệt độc lập hay phép đo Render Free.

## Tham gia phòng

`scripts/ui-browser-server.js` không tạo bot hoặc người chơi sẵn. `scripts/fifty-ui-setup.js` mở từng trang, nhập tên Người QA 01–50, bấm chọn avatar, chọn đội, đồng ý và bấm Tham gia/Sẵn sàng bằng Playwright. Không gọi trực tiếp WebSocket/API join, ready hay answer trong bộ điều khiển QA.

Kết quả setup: **50/50 vào và sẵn sàng qua UI**, 8 nhóm phân bố **7–7–6–6–6–6–6–6**, 52 tab tính cả host và màn chiếu, thời gian setup 82.092ms. 45 người dùng viewport 390×844, 5 người dùng 1366×844; đây là kích thước hiển thị, không mô phỏng đầy đủ phần cứng điện thoại. Màn chiếu có đủ 50 tên và avatar.

## Lỗi phát hiện và sửa

Lượt chơi đầu thất bại ở kiểm tra bố cục: màn chiếu 1920×1080 có nội dung cao **1180px**, do 8 đội có 6–7 thành viên kèm khối người giữ bom, thanh tiến độ và phản hồi. Đây là phát hiện bằng UI thật; bài tải socket trước đó không kiểm tra điều này.

Sửa CSS màn chiếu 8 đội: giảm khoảng đệm, gom nhãn/người giữ bom trên một hàng, bỏ thanh tiến độ và phản hồi trùng lặp, giữ toàn bộ tên/avatar, đồng hồ và số câu đúng/sai. Host/người chơi vẫn có phản hồi chi tiết. Không thu nhỏ hoặc giấu danh sách người chơi.

Hủy lượt QA lỗi với lý do qua UI, giữ nguyên 50 phiên, bấm sẵn sàng lại cho toàn bộ và chạy trận mới. Ảnh màn chiếu sau sửa và kiểm tra không tràn được lưu trong `output/playwright/fifty-ui-playing.png`. Không lấy lượt thất bại làm kết quả PASS.

Theo yêu cầu tiếp theo, bỏ nhãn “Sinh tồn · Câu [ID]” khỏi khung trả lời của người chơi. Vẫn giữ mã câu trong host/catalog/log phục vụ đối chiếu nội dung. Kịch bản kiểm tra DOM hiển thị của người giữ lượt để xác nhận số câu không xuất hiện trong `.question-meta`.

Một lượt QA trung gian đã chạm mốc kết thúc khi bộ tự động vừa chuẩn bị bấm phương án, làm locator timeout vì giao diện đã chuyển sang kết quả. Đây là lỗi đồng bộ của kịch bản QA tại ranh giới kết thúc. Sửa bộ QA ngừng phát thao tác mới trong 12 giây cuối và đợi kết quả; không thay hạn giờ hay cơ chế nhận đáp án của game. Không tuyên bố lượt timeout là PASS.

## Kết quả trận chạy lại

**PASS**, trận tự kết thúc theo trần 330 giây active. Tổng thời gian bộ QA đo **336.658ms**, gồm countdown, thao tác pause/resume và thu kết quả. Không dùng tăng tốc thời gian.

- **50/50 người thực sự gửi đáp án qua nút UI**, mỗi người 7–9 lượt trong trận.
- **400 lượt trả lời**: 397 đúng, 3 sai có chủ đích. Mỗi đội 50 câu, không phải mỗi người 50 câu.
- **50/50 trang nhận kết quả cuối trận**, vẫn kết nối; không có page error.
- Tạm dừng/tiếp tục, tải lại một phiên giữ người/đội, nhãn số câu đã bỏ, bảng máy chiếu lúc đang chơi vừa 1920×1080 đều PASS.
- Đã xuất CSV qua nút host, mở xem ảnh màn chơi và kết quả. Kết thúc bình thường có podium, bảng đội và bảng hạng đầy đủ; trang kết quả cho cuộn dọc.
- Thời gian thao tác tự động từ chọn đến thấy chuyển lượt: p50 **1.384ms**, p95 **3.527ms**, lớn nhất **6.004ms**. Số này bao gồm thao tác Playwright, render 52 tab và máy QA; không phải RTT mạng. Không suy ra cam kết độ trễ cho 50 thiết bị thật.
- Sau thay đổi: `npm test` **22/22 PASS**, `npm run check` **21 file JS PASS**. Không đổi luật, ngân hàng câu hay chấm thời gian.

## Cách chạy lại

1. Terminal 1: `node scripts/ui-browser-server.js`.
2. Terminal 2: `npx playwright-cli -s=fifty-ui open http://127.0.0.1:3102/?mode=host`.
3. `npx playwright-cli -s=fifty-ui run-code --filename scripts/fifty-ui-setup.js`.
4. `node scripts/prepare-fifty-ui.js`.
5. `npx playwright-cli -s=fifty-ui run-code --filename output/fifty-ui-play.js`.
6. Nếu cần chạy lại trên cùng 50 phiên sau một lượt lỗi, dùng `scripts/fifty-ui-reset.js` trước bước 5. Reset yêu cầu phòng đã bắt đầu, có thể đang chơi/tạm dừng/kết thúc.

Bộ QA đọc đáp án tham chiếu từ file máy chủ để quyết định bấm phương án đúng/sai có chủ đích, chỉ sinh mã QA vào `output/` được ignore. Không thêm endpoint đáp án, không đọc token hoặc trạng thái JS ẩn của client, không sửa đồng hồ/điểm của ứng dụng. Tất cả thao tác chơi dùng các nút trên trang; chỉ đọc DOM hiển thị để xác nhận.

Artifacts local: `output/fifty-ui-setup.txt`, `output/fifty-ui-reset.txt`, `output/fifty-ui-play.txt`, `output/fifty-ui-log.csv`, `output/playwright/fifty-ui-*.png`. Không đưa thông tin người thật hoặc khóa host production vào kiểm thử. Tải 52 tab cùng máy làm độ trễ UI bao gồm cả chi phí Chromium/tự động hóa, không phải độ trễ riêng máy chủ hoặc mạng lớp.
