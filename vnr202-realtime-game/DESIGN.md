# Dấu mốc độc lập · VNR202

Mục tiêu: người mới vào đúng đội nhanh; người giữ bom nhìn rõ câu và hạn chót; máy chiếu nhận diện thành viên của 1–9 đội. Nội dung bám phần xây dựng và bảo vệ chính quyền cách mạng 1945–1946 của thuyết trình Nhóm 01.

Palette: nền xám sáng `#f5f6f8`, mực xanh đậm `#203549`, đỏ trầm chủ đạo `#962f35`, nền nội dung trắng, chữ phụ `#536273`, viền `#dce0e5`. Đỏ cảnh báo `#bf3345`, xanh thành công `#16704a`. Màu đội luôn đi cùng số/tên, không dùng màu đơn độc.

Typography: Segoe UI/Tahoma/Arial hỗ trợ tiếng Việt, không tải font ngoài. Tiêu đề gọn, không dùng font tương phản để trang trí. Đồng hồ dùng tabular-nums. Nội dung câu hỏi từ 18px, đoạn văn không quá 72ch. Khoảng cách theo nhịp 4/8px, nút tối thiểu 44px.

Trang vào phòng: laptop chia phần giới thiệu/tư liệu và form; điện thoại đưa form lên trước. Bỏ bom hoạt hình lớn, slogan, nhãn nổi và hiệu ứng lặp. Logo SVG sách mở và dải đánh dấu trang màu vàng thể hiện học tập lịch sử; không phải huy hiệu cơ quan. Ảnh TTXVN nguyên bản có chú thích và nguồn; không phủ chữ hoặc cắt watermark, không tạo ảnh AI nhân vật/sự kiện. Xem `CONTENT.md`.

Host có sidebar điều khiển và log riêng. Màn chiếu chỉ có dữ liệu công khai. Lưới thích nghi số đội: 1/2/3 cột với 1/2/3 đội; 4 cột với 4–8 đội; 3×3 với 9 đội ở màn rộng. Với 9 đội, bỏ thanh trang trí và thống kê phụ trên màn chiếu, giữ đồng hồ, người giữ bom và toàn bộ tên/avatar. Thống kê chi tiết vẫn ở host. Điện thoại xuống 2 hoặc 1 cột và cho cuộn dọc.

Dropdown dùng select gốc để giữ bàn phím, trình đọc màn hình và xác thực form. Trình duyệt hỗ trợ `appearance: base-select` có danh sách `::picker(select)` cùng nền trắng, bo góc 12px, bóng nhẹ, mục cao tối thiểu 44px, màu đỏ trầm và dấu chọn. Danh sách dài cuộn trong khung tối đa 340px/60dvh, không bị cắt bởi panel. Trình duyệt chưa hỗ trợ giữ bộ chọn gốc và kiểu ô chọn có mũi tên SVG. Forced-colors trở về giao diện hệ điều hành. Không tự dựng menu bằng div. Tham khảo [MDN Customizable select](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Customizable_select).

Tên trùng được cảnh báo ngay khi danh sách đã tải, rồi kiểm tra lại trên máy chủ. Chuẩn hóa Unicode NFC, bỏ ký tự vô hình, gộp khoảng trắng, không phân biệt hoa/thường. Giữ dấu tiếng Việt để An và Ân vẫn khác nhau. Người mất mạng vẫn giữ tên để kết nối lại. Đổi sang tên người khác bị từ chối mà không thay đổi đội/avatar.

Avatar emoji trung tính có nền màu cố định, không tải ảnh riêng, không nhập vai nhân vật lịch sử. Giảm chuyển động tuân prefers-reduced-motion. Focus bàn phím rõ, label gắn input, lỗi có role=alert, trạng thái mạng luôn nhìn thấy. Đồng hồ không dùng aria-live liên tục để tránh đọc mỗi giây.

Đánh giá trước xây dựng: tránh dashboard giống trang quản trị doanh nghiệp, giữ sân đội và người giữ bom là điểm nhấn. Không dùng màu đỏ hoặc âm thanh để gây áp lực xuyên suốt; chỉ đổi trạng thái trong 5 giây cuối. Màn host riêng và màn chiếu dùng quyền khác nhau, không chỉ ẩn thông tin bằng CSS.
