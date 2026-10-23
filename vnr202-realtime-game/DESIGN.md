# Thiết kế giao diện

Mục tiêu: người mới vào đúng đội nhanh; người giữ bom nhìn rõ câu và hạn chót; máy chiếu nhận diện đủ thành viên của 8 đội. Không có hiệu ứng cản đọc câu hỏi.

Palette: giấy trắng xanh `#f4f7fb`, mực xanh `#183149`, xanh chủ đạo `#1659b7`, đỏ cảnh báo `#bf3345`, vàng sáng `#ffd469`, xanh thành công `#16704a`. Màu đội luôn đi cùng số/tên, không dùng màu đơn độc.

Typography: Segoe UI/system cho tiếng Việt và điều khiển, Georgia chỉ dùng ở tiêu đề chào. Đồng hồ dùng tabular-nums. Nội dung câu hỏi từ 18px, đoạn văn không quá 72ch. Khoảng cách theo nhịp 4/8px, nút tối thiểu 44px.

Trang vào phòng là một vé tham gia cạnh sân khấu bom hoạt hình CSS. Laptop chia 2 cột, điện thoại giữ form trước và thu gọn minh họa. Dashboard host dùng sidebar điều khiển và sân đội rộng. Máy chiếu dùng lưới 4×2 khi đủ rộng, xuống 2 và 1 cột theo áp lực nội dung. Màn người chơi chỉ có một nhiệm vụ chính; thông tin đội gọn phía trên, câu hỏi và phương án ở giữa.

Avatar emoji trung tính có nền màu cố định, không tải ảnh riêng. Chuyển động chỉ ở bom và phản hồi sự kiện; giảm chuyển động tuân prefers-reduced-motion. Focus bàn phím rõ, label gắn input, lỗi có role=alert, trạng thái mạng luôn nhìn thấy. Đồng hồ không dùng aria-live liên tục để tránh đọc mỗi giây.

Đánh giá trước xây dựng: tránh dashboard giống trang quản trị doanh nghiệp, giữ sân đội và người giữ bom là điểm nhấn. Không dùng màu đỏ hoặc âm thanh để gây áp lực xuyên suốt; chỉ đổi trạng thái trong 5 giây cuối. Màn host riêng và màn chiếu dùng quyền khác nhau, không chỉ ẩn thông tin bằng CSS.
