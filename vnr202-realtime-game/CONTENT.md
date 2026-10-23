# Nội dung Dấu mốc độc lập · VNR202

Ngân hàng đang dùng: `src/questions.js`, phiên bản `group01-1945-1946-v1`, 60 câu. File `../questions.js` của trò chơi cũ được giữ nguyên, không còn là đầu vào của bản mới.

Nguồn biên soạn: PDF **VNR202_Group01_SE1819_Chương 2 Đảng lãnh đạo hai cuộc kháng chiến, hoàn thành giải phóng dân tộc, thống nhất đất nước.pdf** trong thư mục này. Tài liệu có 34 trang. Dù tiêu đề chương bao quát 1945–1975, phần trình bày thực tế tập trung vào xây dựng và bảo vệ chính quyền cách mạng 1945–1946. Không đưa câu 1947–1950 của kho cũ vào bản mới.

Mỗi câu có `source.document`, `source.page` và lời giải chỉ rõ trang. Số trang là vị trí trang trong PDF, tính từ 1, không phải số chân slide. Không chép dài nguyên văn; các câu là bản biên soạn để ôn tập, không phải trích dẫn giáo trình hay chứng nhận thẩm định lịch sử.

| Câu | Chủ đề | Trang PDF đối chiếu |
|---|---|---|
| 1–10 | Bối cảnh sau độc lập | 3–9 |
| 11–20 | Nhiệm vụ cấp bách | 11–15 |
| 21–30 | Xây dựng chính quyền | 16–17 |
| 31–40 | Bảo vệ chính quyền | 17, 19–23 |
| 41–50 | Sách lược ngoại giao | 23–26 |
| 51–60 | Chuẩn bị và kinh nghiệm | 27, 30, 32–33 |

Chủ động không sử dụng số liệu nạn đói, tỷ lệ mù chữ, chi tiết ngày/địa điểm vụ án ở trang 29 và địa điểm ký Tạm ước ở trang 27 vì cần đối chiếu thêm. Câu về Tạm ước chỉ dùng mốc 14/9/1946. Các phương án sai là lựa chọn trong bài trắc nghiệm, không phải khẳng định lịch sử. Host phải đọc lời giải và xác nhận duyệt trước trận; khi phát hiện sai, hủy trận có lý do và chỉnh bộ câu trước buổi tiếp theo.

## Ảnh và logo

- Ảnh thật ở trang vào phòng: **Khu vực bỏ phiếu trong ngày Tổng tuyển cử 6/1/1946**, ảnh tư liệu TTXVN. Nguồn: [Nhân vật – Sự kiện, Thông tấn xã Việt Nam](https://nvsk.vnanet.vn/ngay-tong-tuyen-cu-bau-quoc-hoi-viet-nam-6-1-1946-1-138647.vna). Tệp gốc: [45-17-22-54.jpg](https://imgnvsk.vnanet.vn/mediaupload/content/2024/01/05/45-17-22-54.jpg). Bản tải giữ nguyên nội dung và watermark, không tô màu, phục dựng hay tạo nhân vật bằng AI. Chú thích và liên kết nguồn có ngay bên dưới ảnh trong ứng dụng. Quyền ảnh thuộc chủ sở hữu nguồn; không gán giấy phép mở.
- `public/logo.svg` và favicon là biểu tượng vector sách mở và mốc đánh dấu, tự thiết kế bằng SVG. Không phải ảnh lãnh tụ, tư liệu lịch sử hay huy hiệu chính thức của cơ quan nào.
- Avatar hoạt hình trung tính chỉ đại diện người chơi; không nhập vai nhân vật lịch sử.

Khi cập nhật từ kho cũ, tạo phòng mới. Máy chủ bỏ qua snapshot khác phiên bản ngân hàng để không diễn giải ID câu cũ thành câu mới; không xóa file snapshot cũ.
