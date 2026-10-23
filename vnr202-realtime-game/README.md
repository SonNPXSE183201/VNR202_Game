# Dấu mốc độc lập · VNR202 — sinh tồn theo đội

**Luật cập nhật:** mỗi câu 15 giây; hết hạn trừ 8 giây và tự chuyển lượt. Có ba quyền tự chọn theo đội: 50/50, ngôi sao +15s khi đúng và chuyển 50% thời gian đối thủ (tối đa 20s) mở sau chuỗi 3 câu đúng. Mỗi quyền một lần/trận, mỗi câu một quyền. Xem **[POWERS.md](POWERS.md)** cho luật ưu tiên hiện tại và kiểm thử; mô tả bản trước phía dưới cần đọc cùng cập nhật này.

Bản hiện tại thay thế hoàn toàn luật 8 lượt bom và cộng điểm trước đây. Mỗi đội có một đồng hồ riêng, **đúng cộng giây, sai trừ giây, sống lâu hơn xếp trên**. Mỗi câu chỉ gửi **một đáp án duy nhất**.

## 1. Luật mặc định

- Khoảng 30–50 người, host chọn **1–9 đội** theo nhóm đang ngồi (1 đội để luyện tập). Mỗi người nhập tên duy nhất trong phòng, chọn avatar hoạt hình và chọn đội, không cần tài khoản.
- Tên trùng bị từ chối, không tự thêm hậu tố. So sánh không phân biệt hoa/thường, chuẩn hóa Unicode và khoảng trắng; tên của người mất mạng vẫn được giữ. Áp dụng khi vào phòng và khi người chơi/host đổi tên. Có thể thêm mã sinh viên để phân biệt.
- Tất cả đội bắt đầu cùng lúc với **240 giây (4 phút)**. Đây là thời gian khởi đầu cố định và bằng nhau, không phải hạn nổ bất biến.
- Cả đội cùng thấy câu hỏi; chỉ người được hệ thống chọn giữ bom có quyền gửi. Đồng đội được góp ý trực tiếp.
- Người chơi chọn phương án rồi bấm Trả lời. Trước khi gửi được sửa lựa chọn để tránh chạm nhầm; **sau khi máy chủ nhận thì không được đổi hoặc thử lại**.
- Đúng hoặc sai đều kết thúc câu đó, chuyển sang người khác và câu mới. Hệ thống ưu tiên thành viên có ít lượt nhất rồi chọn ngẫu nhiên; tránh chọn ngay người vừa trả lời khi còn đồng đội kết nối.
- Đúng: được cộng thời gian theo tốc độ. Sai: bị trừ thời gian ngay. Đồng hồ vẫn đếm trong lúc đọc câu, thảo luận và chuyển lượt.
- Hết giờ: bom đội đó nổ, toàn đội dừng trả lời và chuyển sang theo dõi. Không hồi sinh, không reset bom, không có lượt thi thứ hai trong trận.

## 2. Thưởng và phạt

| Kết quả | Thay đổi đồng hồ đội |
|---|---:|
| Đúng trong tối đa 5 giây | +10 giây |
| Đúng trên 5 đến tối đa 10 giây | +7 giây |
| Đúng sau hơn 10 giây | +4 giây |
| Sai ở lần gửi duy nhất | −8 giây |
| Chưa gửi và đồng hồ về 0 | Bom nổ, đội dừng |

Không còn điểm số, thử lại, khóa 2 giây hoặc thưởng +2 giây sau khi sai. Thời gian trả lời do máy chủ tính từ lúc mở câu cho người giữ bom đến lúc nhận đáp án, bao gồm độ trễ kết nối. Chọn sai hoặc refresh không cho làm lại cùng câu; gửi trùng cùng yêu cầu không trừ/cộng hai lần.

**Giới hạn dự trữ:** tối đa thời gian khởi đầu +60 giây, tức **300 giây** theo mặc định. Ví dụ còn 298 giây, trả lời đúng nhanh đáng lẽ +10 thì thực tế chỉ +2, vừa đủ 300. Log và giao diện hiển thị số giây thực sự được cộng.

**Phạt hết giờ:** còn 3 giây mà chọn sai thì về 0 và nổ ngay; chỉ ghi giảm 3 giây thực tế, không cho đồng hồ âm hoặc ghi nổ về một thời điểm trong quá khứ.

Ví dụ đội còn 100 giây lúc mở câu:

- Trả lời đúng sau 4 giây: còn `100 − 4 + 10 = 106 giây`.
- Đúng sau 8 giây: còn `100 − 8 + 7 = 99 giây`.
- Sai sau 8 giây: còn `100 − 8 − 8 = 84 giây`, chuyển người và câu mới.

Bộ số này khuyến khích đúng nhanh để tích lũy, trả lời chậm vẫn cứu được một phần thời gian, còn chọn bừa làm bom nổ nhanh hơn. Đây là cấu hình thiết kế cần tổng duyệt với lớp, không phải kết quả nghiên cứu độ khó của ngân hàng.

## 3. Thời lượng trận và xếp hạng

**Giới hạn mặc định: 330 giây (5 phút 30 giây) chơi thực tế**, kể từ lúc bom bắt đầu. Thời gian cộng chỉ cứu bom đội, **không kéo dài giới hạn chung**.

- Đội đã nổ: xếp theo thời gian sống sót, từ lúc bắt đầu đến lúc nổ. Nổ muộn hơn đứng trên.
- Đội còn sống khi hết 330 giây: sống sót đủ 330 giây, đứng trên đội đã nổ trước đó. Trong nhóm này, đội còn nhiều thời gian dự trữ hơn đứng trên.
- Nếu cả thời gian sống sót và dự trữ bằng nhau: đồng hạng. Không dùng số câu, số lần sai, thứ tự vào phòng hoặc bốc thăm để phá hòa. Không có câu phụ làm lệch tiêu chí thời gian.
- Nếu tất cả đội đã nổ thì kết thúc sớm. Nếu chỉ còn một đội, đội đó tiếp tục chơi đến khi nổ hoặc chạm giới hạn chung, để ghi đúng thời gian sống sót của đội.
- Máy chủ so sánh thời gian bằng mili giây, không theo thứ tự vòng lặp xử lý hay đồng hồ tự khai. Giao diện đếm giây là số hiển thị làm tròn; các chênh lệch dưới một giây vẫn có thể phân hạng.

Khung tổ chức: hướng dẫn khoảng 30–40 giây + thi đấu tối đa 5 phút 30 giây + trao giải khoảng 30 giây = **khoảng 6 phút 30–40 giây**. Quét QR và chia đội trước khi bấm bắt đầu. Nếu tất cả đội trả lời sai nhiều và nổ sớm, trận có thể ngắn hơn 5 phút; không hồi sinh hoặc kéo dài giả tạo. Tạm dừng vì sự cố cũng có thể làm thời gian thực tế dài hơn lịch.

Host cấu hình trước trận: **1–9 đội**, thời gian đầu **180/210/240/270 giây**, giới hạn chung **300/330/360 giây**; thời gian đầu phải nhỏ hơn giới hạn. Khuyến nghị giữ mặc định 240/330 cho buổi 5–7 phút. Thưởng/phạt 10/7/4/−8 cố định để dễ giải thích, không tùy chỉnh giữa trận.

## 4. Giao diện

### Người chơi

- Vào phòng: QR/link → tên → avatar có sẵn → đội → đồng ý hiển thị dữ liệu → Sẵn sàng.
- Luôn thấy avatar/tên/đội của mình, người giữ bom, câu và bốn phương án.
- Đồng hồ lớn là **thời gian còn lại của đội mình**, không phải thời gian chung.
- Gửi đúng: thông báo +giây và chuyển lượt. Gửi sai: −giây và chuyển lượt; không có nút thử lại.
- Khi đội nổ: ẩn điều khiển trả lời, hiện thời gian sống sót và bảng theo dõi các đội. Tải lại không hồi sinh.

### Máy chiếu công khai

- QR, mã phòng, tên host, danh sách avatar/tên thành viên từng đội.
- Đồng hồ phía trên: **thời gian còn lại trước giới hạn trận**.
- Mỗi đội có đồng hồ bom riêng, người giữ bom, số câu đúng/sai, giây đã được cộng/trừ, trạng thái còn sống/đã nổ và hạng.
- Bom đội này có thể nổ trước đội khác. Không hiển thị câu hỏi riêng hoặc log giám sát trên màn chiếu.
- Kết thúc: Nhất/Nhì/Ba theo đội, avatar/tên các thành viên, thời gian sống sót và dự trữ. Hỗ trợ đồng hạng.

### Host riêng

- Cấu hình thời gian, chọn câu theo chủ đề/từng câu, xem đáp án/giải thích để duyệt trước trận.
- Đổi tên đội, chuyển người chọn nhầm, duyệt tên, khóa danh sách, bắt đầu; mỗi đội cần người kết nối.
- Xem câu đang mở và log có giờ máy chủ, đội/người, đúng/sai, số giây cộng/trừ thực tế, thời điểm nổ.
- Host giám sát chỉ đọc; host chính cấp link riêng, không dùng mã phòng làm quyền quản trị.

## 5. Tạm dừng, sự cố và khôi phục

- **Tạm dừng mọi đồng hồ** chỉ dùng khi có sự cố: đóng băng cả đồng hồ đội, giới hạn trận và thời gian trả lời của mọi đội. Không nhận đáp án trong pause. Tiếp tục giữ nguyên thời gian còn lại, không coi thời gian nghỉ là chơi hay tăng thưởng tốc độ.
- Người giữ bom mất mạng vẫn giữ lượt; đồng hồ đội tiếp tục chạy. Host có thể pause toàn trận nếu có sự cố chung. Không tự chuyển vì ngắt mạng để tránh lạm dụng.
- Host mất mạng không tự dừng: máy chủ tiếp tục điều hành, người chơi vẫn trả lời, host có thể khôi phục phiên. Hết giới hạn hoặc hết bom thì tự kết thúc.
- **Hủy toàn trận có lỗi** cần lý do, xóa toàn bộ kết quả và đồng hồ của các đội, về phòng chờ để chơi lại công bằng. Không cho riêng một đội thêm giờ ngoài luật.
- Host kết thúc sớm cần lý do; chốt sống sót/dự trữ tại thời điểm dừng. Đây là thao tác sự cố, không dùng thay cho kết thúc thường lệ.
- Khởi động lại máy chủ giữa trận sẽ hủy trận dở và về phòng chờ, không cố khôi phục một đồng hồ dở thiếu chính xác. Giữ phiên, đội và log để host kiểm tra.
- Snapshot phiên bản luật cũ không được tự chuyển sang sinh tồn. Sau khi cập nhật cần tạo phòng mới; file cũ không bị xóa hoặc đổi nghĩa kết quả.

## 6. Câu hỏi và công bằng

Ngân hàng **`src/questions.js`** gồm 60 câu được biên soạn theo PDF thuyết trình Nhóm 01 trong thư mục này, phạm vi **1945–1946**. Mỗi câu có tham chiếu trang PDF trong metadata và lời giải. Các file game cũ ở thư mục cha đã được xóa; bản này chỉ dùng ngân hàng trong thư mục game. Xem [CONTENT.md](CONTENT.md) về phạm vi, chi tiết cần đối chiếu và nguồn ảnh tư liệu.

Tên mới **Dấu mốc độc lập · VNR202**, logo sách và mốc đánh dấu, giao diện đỏ trầm/xanh đậm. Ảnh Tổng tuyển cử 1946 có nguồn TTXVN, giữ nguyên watermark; không tạo ảnh AI lãnh tụ/sự kiện. Sau cập nhật ngân hàng phải tạo phòng mới; snapshot khác phiên bản câu bị bỏ qua để không lẫn ID câu.

- Chỉ dùng câu người phụ trách đã duyệt; cần nguồn giáo trình/tài liệu, trang/mục, người duyệt và ngày duyệt. Checkbox host không phải thẩm định lịch sử tự động.
- Không tạo câu/trích dẫn/bằng chứng giả; không xuyên tạc lịch sử, bôi nhọ lãnh tụ, kích động thù hằn hoặc suy diễn ngoại giao hiện nay. Bom/avatar là hình hoạt hình trung tính, không mô phỏng thương vong.
- Mỗi đội nhận câu ngẫu nhiên xen kẽ chủ đề; tránh lặp trong đội trước khi hết kho. Có thể lặp khi kho hữu hạn; không khẳng định độ khó các câu đã cân bằng thực nghiệm.
- Mỗi đội chỉ một người gửi nhưng được thảo luận; đội đông và mạng tốt có lợi thế. Cân bằng số người và dùng cùng Wi-Fi. Mạng ảnh hưởng ngưỡng thưởng 5/10 giây; không tin giờ client để bù mạng.
- Đáp án chỉ ở máy chủ, frontend chỉ nhận câu hiện tại và phương án. Chọn câu chính thức trước trận; chưa hỗ trợ tải ngân hàng tùy ý.

## 7. Chạy local/LAN

Node.js 24 trở lên, terminal trong `D:\VNR202\vnr202-realtime-game`:

```powershell
npm ci
npm run setup
npm start
```

Mở `http://localhost:3100`, chọn Dành cho host. Lấy `HOST_KEY` trong `.env` trên máy chủ; không chia sẻ khóa này cho người chơi. Setup tạo khóa ngẫu nhiên nếu chưa có, không ghi đè cấu hình cũ.

Điện thoại dùng cùng Wi-Fi. Host kiểm tra **Địa chỉ cho điện thoại**, chọn IP LAN hoặc tên miền đúng rồi cập nhật QR; không dùng localhost trên điện thoại. Máy nhiều card mạng/VPN có thể cần sửa IP. Nếu Windows Firewall chặn TCP 3100, người vận hành cho phép trên mạng lớp; app không tự sửa firewall.

Bấm Mở màn chiếu để chiếu tab công khai; giữ tab điều khiển riêng. Cấu hình và luật khóa sau khi bắt đầu. Dùng Tạo phòng mới khi muốn mở trận khác.

Phiên lưu trong sessionStorage của tab; tải lại giữ phiên, đóng tab có thể mất phiên. Một phiên chỉ một kết nối được gửi. Màn chiếu chỉ đọc dữ liệu công khai; link host giám sát là thông tin riêng tư.

Qua Internet cần Node chạy liên tục, reverse proxy hỗ trợ WebSocket, HTTPS/WSS. Trên Render, server tự nhận `RENDER_EXTERNAL_URL` khi chưa đặt `PUBLIC_ORIGIN`; nếu dùng tên miền riêng thì đặt `PUBLIC_ORIGIN` bằng đúng URL HTTPS công khai. Không tự suy luận HTTPS từ kết nối HTTP nội bộ sau proxy. Không chạy bằng Live Server, file index.html hoặc hosting tĩnh. Chưa triển khai Internet.

## 8. Dữ liệu và bảo mật

- Máy chủ quyết định người giữ bom, đúng/sai, thưởng/phạt, hạn nổ và hạng. Đáp án trùng/cũ/quá hạn/sai quyền không thay thời gian hai lần.
- Tên và avatar render an toàn; avatar dùng bộ có sẵn, không tải ảnh hay URL tùy ý. HTTP chỉ phục vụ allowlist tài nguyên public; không phục vụ questions.js, .env, data hoặc mã máy chủ.
- Kiểm tra Origin, kích thước/tần suất thông điệp, quyền theo phòng và giới hạn phiên. Mã phòng không cấp quyền host.
- Website không thể cấm tuyệt đối đổi tab/extension/thiết bị thứ hai. Tín hiệu rời trang chỉ để host xem xét, không tự kết luận gian lận hoặc phạt ngoài luật.
- Có thông báo tên/avatar/đội được chiếu công khai và lưu log. Không thu camera, microphone hoặc lịch sử duyệt web.
- Snapshot/phiên trong data chứa token, không đưa vào Git hoặc phục vụ HTTP. Ghi nguyên tử theo nhịp khoảng 40ms; không bảo đảm giao dịch lưu đĩa đồng bộ trước xác nhận.
- Log giao diện: 150 sự kiện gần nhất; CSV tối đa 2.000 sự kiện được giữ, không chứa token. Phòng hết hạn sau 7 ngày, dọn khi khởi động và theo chu kỳ khoảng một phút.
- Chạy một tiến trình Node; chưa có multi-instance hoặc cơ sở dữ liệu giao dịch. Cần tổng duyệt thiết bị và Wi-Fi thật trước giờ học.

## 9. Kiểm thử

```powershell
npm test
npm run test:coverage
npm run check
# 25 và 50 client WebSocket, đồng hồ máy chủ tăng tốc 20x:
npm run test:load
# 50 client, trận sinh tồn đủ 330 giây theo đồng hồ thực:
npm run test:load -- --players 50 --speed 1
```

Kết quả và giới hạn ở TESTING.md. Kết quả 8 lượt/cộng điểm trước đây không dùng để chứng minh luật hiện tại. QA giao diện riêng ở `scripts/ui-fixture.js` (loopback 3101, khóa thử công khai); không dùng server này cho buổi chơi. Browser flow chạy bằng Playwright CLI theo TESTING.md.
