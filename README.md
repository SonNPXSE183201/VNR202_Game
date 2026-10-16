# HƯỚNG DẪN SỬ DỤNG & DEPLOY WEB GAME VNR202
### ĐẤU TRƯỜNG LỊCH SỬ ĐẢNG (1945 - 1950) - BLOOKET STYLE

Ứng dụng web được xây dựng hoàn toàn bằng **HTML5, Vanilla CSS (Material Design 3), JavaScript hiện đại** và cơ chế đồng bộ thời gian thực qua **MQTT WebSocket / BroadcastChannel** (hoàn toàn miễn phí, không cần đăng ký tài khoản server, chạy được trên mọi thiết bị di động và máy tính).

---

## 1. CÁC TÍNH NĂNG CHÍNH

1. **Ngân hàng 60 câu hỏi lịch sử chuẩn xác 100%:**
   - Bám sát toàn bộ nội dung thuyết trình: Thuận lợi & khó khăn sau Cách mạng Tháng Tám, Diệt giặc đói - giặc dốt, Xây dựng chính quyền, Kháng chiến Nam Bộ, Ngoại giao hòa hoãn quân Tưởng, Hiệp định Sơ bộ 6-3, Toàn quốc kháng chiến 19-12-1946, Chiến dịch Việt Bắc 1947, Chiến dịch Biên giới 1950.
   - Mỗi người chơi nhận ngẫu nhiên câu hỏi và hoán đổi vị trí A-B-C-D chống nhìn bài.
2. **Quyền lực của Host (Ban Chỉ Huy):**
   - Thiết lập thời gian thi đấu: 3 phút, 5 phút, 7 phút, 10 phút.
   - Nút **"KẾT THÚC TRẬN ĐẤU"** (Force End Game): Bấm bất kỳ lúc nào để dừng trận đấu và trao giải ngay.
   - Nút **"Thêm 5 Bot Test"**: Tạo người chơi giả lập để nhóm thuyết trình kiểm tra máy chiếu và bảng xếp hạng trước giờ G.
3. **Màn hình máy chiếu (Live Leaderboard & 3D Podium):**
   - Bảng xếp hạng Top 10 nhảy bậc liên tục theo điểm số.
   - Dải tin tức chiến sự chạy real-time.
   - Bục vinh danh 3D: Trao **Giải Nhất (Quán Quân)**, **Giải Nhì**, **Giải Ba** kèm hiệu ứng pháo hoa rực rỡ.
   - Bảng tổng sắp chi tiết cả lớp kèm nút sao chép vào Clipboard.
4. **Trải nghiệm sinh viên:**
   - Chơi mượt mà trên cả **Điện thoại** và **Laptop**.
   - Phản hồi đúng/sai tức thì kèm lời giải thích lịch sử ngắn gọn.
   - Hệ thống tính điểm: Điểm chuẩn 1.000 + Chuỗi thắng Streak (x200 điểm/câu).

---

## 2. CHẠY THỬ NGHIỆM TRÊN MÁY LOCAL

Web server cục bộ đang chạy tại cổng 8080:
* **Mở trình duyệt trên máy tính:** Truy cập `http://localhost:8080`
* Bấm vào **"Ban Chỉ Huy (Máy Chiếu)"** để tạo phòng.
* Bấm **"Thêm 5 Bot Test"** -> Bấm **"PHÁT LỆNH TIẾN CÔNG"** để xem trận đấu diễn ra trực tiếp!
* Bấm **"KẾT THÚC TRẬN ĐẤU"** để chiêm ngưỡng Bục vinh danh Top 3!

---

## 3. CÁCH DEPLOY LÊN INTERNET ĐỂ CẢ LỚP QUÉT QR (TRONG 1 PHÚT)

### Cách 1: Kéo thả lên Vercel hoặc Netlify (Khuyên dùng - Nhanh nhất)
1. Đăng nhập vào [https://vercel.com](https://vercel.com) hoặc [https://netlify.com](https://netlify.com) (dùng tài khoản GitHub hoặc Google).
2. Chọn **"Add New Project"** -> Chọn **"Deploy from Folder"** (hoặc import từ Git repository của thư mục `d:\VNR202`).
3. Bấm **"Deploy"**. Trong 30 giây bạn sẽ có đường link dạng `https://vnr202-history.vercel.app`.
4. Ngày 24/10 lên lớp thuyết trình, bạn chỉ cần mở link đó trên laptop cắm máy chiếu, mã QR sẽ tự động hiển thị để cả lớp quét bằng điện thoại!

### Cách 2: Dùng GitHub Pages
1. Đẩy thư mục `d:\VNR202` lên GitHub.
2. Vào tab **Settings** -> **Pages** -> Chọn nhánh `main` và thư mục `/ (root)` -> Bấm **Save**.
3. Link web sẽ có dạng: `https://<ten-user>.github.io/<ten-repo>/`.
