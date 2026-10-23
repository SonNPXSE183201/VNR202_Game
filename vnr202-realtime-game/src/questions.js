// Server-only bank. PDF pages count from 1. Host review remains mandatory.
const bank = [
  {
    id: 1,
    question:
      "Sau Cách mạng Tháng Tám, nhân dân Việt Nam có thuận lợi cơ bản nào?",
    options: [
      "Trở thành người làm chủ đất nước",
      "Tổ chức các lớp bình dân học vụ",
      "Đã hoàn thành công nghiệp hóa",
      "Vận động tăng gia sản xuất",
    ],
    correct: 0,
    explain:
      "Nền độc lập tạo điều kiện để nhân dân làm chủ và xây dựng chính quyền mới. Đối chiếu: PDF thuyết trình Nhóm 01, trang 4.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 4,
    },
  },
  {
    id: 2,
    question: "Nhà nước nào được thành lập sau Cách mạng Tháng Tám năm 1945?",
    options: [
      "Việt Nam Dân chủ Cộng hòa",
      "Chính phủ Cách mạng lâm thời Cộng hòa miền Nam Việt Nam",
      "Cộng hòa xã hội chủ nghĩa Việt Nam",
      "Mặt trận Liên Việt",
    ],
    correct: 0,
    explain:
      "Phần mở đầu trình bày sự ra đời của Nhà nước Việt Nam Dân chủ Cộng hòa. Đối chiếu: PDF thuyết trình Nhóm 01, trang 3.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 3,
    },
  },
  {
    id: 3,
    question: "Thuận lợi quốc tế nào được nêu trong bài thuyết trình?",
    options: [
      "Phong trào giải phóng dân tộc dâng cao",
      "Chủ nghĩa thực dân đã biến mất hoàn toàn",
      "Mọi quốc gia đều công nhận Việt Nam ngay lập tức",
      "Thế giới không còn xung đột",
    ],
    correct: 0,
    explain:
      "Phong trào giải phóng dân tộc dâng cao là một thuận lợi quốc tế được nêu. Đối chiếu: PDF thuyết trình Nhóm 01, trang 4.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 4,
    },
  },
  {
    id: 4,
    question: "Khó khăn về địa vị pháp lý của Nhà nước mới là gì?",
    options: [
      "Chưa được quốc tế công nhận",
      "Thiếu đội ngũ cán bộ chuyên môn",
      "Khó khăn về nguồn thu ngân sách",
      "Thiếu cơ sở vật chất hành chính",
    ],
    correct: 0,
    explain:
      "Slide nêu khó khăn về việc chưa được công nhận và bị cách biệt với bên ngoài. Đối chiếu: PDF thuyết trình Nhóm 01, trang 6.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 6,
    },
  },
  {
    id: 5,
    question: "Nhóm khó khăn trong nước nào được bài thuyết trình đề cập?",
    options: [
      "Nạn đói, nạn mù chữ và ngân khố kiệt quệ",
      "Dư thừa ngân sách và lương thực",
      "Thiếu thị trường xuất khẩu công nghệ cao",
      "Dân số già và tự động hóa sản xuất",
    ],
    correct: 0,
    explain:
      "Kinh tế, tài chính, đời sống và trình độ dân trí đều đặt ra nhiệm vụ cấp bách. Đối chiếu: PDF thuyết trình Nhóm 01, trang 7.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 7,
    },
  },
  {
    id: 6,
    question: "Chính quyền cách mạng sau năm 1945 được mô tả như thế nào?",
    options: [
      "Còn non trẻ và thiếu thốn",
      "Đã có nền kinh tế phát triển hoàn chỉnh",
      "Tổ chức các lớp bình dân học vụ",
      "Vận động tăng gia sản xuất",
    ],
    correct: 0,
    explain:
      "Chính quyền mới phải giải quyết nhiều khó khăn trong điều kiện thiếu thốn. Đối chiếu: PDF thuyết trình Nhóm 01, trang 7.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 7,
    },
  },
  {
    id: 7,
    question:
      "Ngày nào đánh dấu Nam Bộ kháng chiến chống thực dân Pháp trở lại xâm lược?",
    options: ["23/9/1945", "6/1/1946", "9/11/1946", "25/11/1945"],
    correct: 0,
    explain:
      "Bài thuyết trình xác định ngày 23/9/1945 là mốc mở đầu cuộc chiến tranh xâm lược lần thứ hai của thực dân Pháp. Đối chiếu: PDF thuyết trình Nhóm 01, trang 8.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 8,
    },
  },
  {
    id: 8,
    question:
      "Quân Trung Hoa Dân quốc kéo vào khu vực nào để giải giáp quân Nhật?",
    options: [
      "Phía Bắc vĩ tuyến 16",
      "Chỉ khu vực Nam Bộ",
      "Chỉ khu vực Tây Nguyên",
      "Phía Nam vĩ tuyến 16",
    ],
    correct: 0,
    explain:
      "Slide mô tả quân Trung Hoa Dân quốc vào phía Bắc vĩ tuyến 16. Đối chiếu: PDF thuyết trình Nhóm 01, trang 9.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 9,
    },
  },
  {
    id: 9,
    question:
      "Cụm từ nào khái quát tình thế chính quyền cách mạng cuối năm 1945?",
    options: [
      "Ngàn cân treo sợi tóc",
      "Mưa thuận gió hòa",
      "Thuận buồm xuôi gió",
      "An cư lạc nghiệp",
    ],
    correct: 0,
    explain:
      "Nền độc lập và chính quyền mới phải đối diện đồng thời nhiều nguy cơ. Đối chiếu: PDF thuyết trình Nhóm 01, trang 9.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 9,
    },
  },
  {
    id: 10,
    question:
      "Thách thức lớn về ngoại xâm được nêu ở phần khó khăn trong nước là gì?",
    options: [
      "Thực dân Pháp âm mưu quay lại thống trị Việt Nam",
      "Tổ chức các lớp bình dân học vụ",
      "Việt Nam đã chấm dứt mọi hoạt động ngoại giao",
      "Các nước đều rút quân ngay sau ngày độc lập",
    ],
    correct: 0,
    explain:
      "Bài trình bày nhấn mạnh nguy cơ thực dân Pháp trở lại xâm lược. Đối chiếu: PDF thuyết trình Nhóm 01, trang 7.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 7,
    },
  },
  {
    id: 11,
    question:
      "Trong phần khái quát của bài thuyết trình, ba nhóm nhiệm vụ cấp bách là gì?",
    options: [
      "Diệt giặc đói, giặc dốt, giặc ngoại xâm",
      "Chỉ phát triển công nghiệp nặng",
      "Chỉ xây dựng giao thông",
      "Chỉ mở rộng thương mại",
    ],
    correct: 0,
    explain:
      "Bài thuyết trình khái quát thành giặc đói, giặc dốt và giặc ngoại xâm. Đây không phải danh mục nguyên văn sáu vấn đề cấp bách được nêu tại phiên họp Chính phủ ngày 3/9/1945. Đối chiếu PDF trang 11 và tư liệu Chính phủ.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 11,
      url: "https://chinhphu.vn/giai-doan-1945-1954-khang-chien-va-kien-quoc/i-tu-uy-ban-dan-toc-giai-phong-den-chinh-phu-lam-thoi-nuoc-viet-nam-dan-chu-cong-hoa-10001588",
    },
  },
  {
    id: 12,
    question: "Chỉ thị Kháng chiến kiến quốc được ban hành ngày nào?",
    options: ["25/11/1945", "6/3/1946", "9/3/1946", "9/11/1946"],
    correct: 0,
    explain:
      "Ngày 25/11/1945 là mốc của Chỉ thị Kháng chiến kiến quốc. Đối chiếu: PDF thuyết trình Nhóm 01, trang 11.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 11,
    },
  },
  {
    id: 13,
    question: "Ngày 3/9/1945 gắn với nội dung nào trong bài?",
    options: [
      "Xác định các nhiệm vụ cấp bách của chính quyền mới",
      "Thông qua Hiến pháp năm 1946",
      "Ký Hiệp định Sơ bộ",
      "Tổ chức Tổng tuyển cử đầu tiên",
    ],
    correct: 0,
    explain:
      "Ngày 3/9/1945, phiên họp đầu tiên của Chính phủ lâm thời bàn các nhiệm vụ cấp bách. Cần phân biệt sáu vấn đề được nêu trong phiên họp với cách slide khái quát ba nhóm nhiệm vụ. Đối chiếu PDF trang 11 và tư liệu Chính phủ.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 11,
      url: "https://chinhphu.vn/giai-doan-1945-1954-khang-chien-va-kien-quoc/i-tu-uy-ban-dan-toc-giai-phong-den-chinh-phu-lam-thoi-nuoc-viet-nam-dan-chu-cong-hoa-10001588",
    },
  },
  {
    id: 14,
    question: "Chỉ thị Kháng chiến kiến quốc đề cập nhóm vấn đề nào?",
    options: [
      "Tình hình, kẻ thù chính, nhiệm vụ và biện pháp",
      "Chỉ nội dung thi đua thể thao",
      "Chỉ kế hoạch du lịch",
      "Chỉ công tác xuất bản sách",
    ],
    correct: 0,
    explain:
      "Sơ đồ nội dung chỉ thị gồm nhận định tình hình và xác định hướng hành động. Đối chiếu: PDF thuyết trình Nhóm 01, trang 12.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 12,
    },
  },
  {
    id: 15,
    question: "Biện pháp nào thuộc xây dựng thể chế của chính quyền mới?",
    options: [
      "Bầu Quốc hội, lập Chính phủ chính thức, lập Hiến pháp",
      "Tổ chức các lớp bình dân học vụ",
      "Chỉ tập trung vào hoạt động lễ hội",
      "Vận động tăng gia sản xuất",
    ],
    correct: 0,
    explain:
      "Các biện pháp này góp phần củng cố chính quyền cách mạng. Đối chiếu: PDF thuyết trình Nhóm 01, trang 13.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 13,
    },
  },
  {
    id: 16,
    question: "Nguyên tắc chính trị được nhấn mạnh trong các biện pháp là gì?",
    options: [
      "Kiên định độc lập về chính trị",
      "Tăng diện tích gieo trồng",
      "Mở thêm lớp xóa mù chữ",
      "Vận động đóng góp tài chính",
    ],
    correct: 0,
    explain:
      "Độc lập về chính trị là nguyên tắc cần giữ vững khi thực hiện sách lược. Đối chiếu: PDF thuyết trình Nhóm 01, trang 13.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 13,
    },
  },
  {
    id: 17,
    question:
      "Định hướng ngoại giao trong Chỉ thị Kháng chiến kiến quốc nhằm điều gì?",
    options: [
      "Thêm bạn, bớt thù",
      "Tăng gia sản xuất lương thực",
      "Tổ chức lớp bình dân học vụ",
      "Kiện toàn cơ quan hành chính địa phương",
    ],
    correct: 0,
    explain:
      "Bài trình bày nêu định hướng mở rộng đồng minh và giảm đối đầu bất lợi. Đối chiếu: PDF thuyết trình Nhóm 01, trang 13.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 13,
    },
  },
  {
    id: 18,
    question: "Trong chuẩn bị kháng chiến, tinh thần nào được nêu?",
    options: [
      "Động viên toàn dân và chuẩn bị lâu dài",
      "Chỉ dựa vào một nhóm nhỏ",
      "Tổ chức các lớp bình dân học vụ",
      "Vận động tăng gia sản xuất",
    ],
    correct: 0,
    explain:
      "Động viên toàn dân, kiên trì kháng chiến và chuẩn bị lâu dài là các biện pháp được nêu. Đối chiếu: PDF thuyết trình Nhóm 01, trang 13.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 13,
    },
  },
  {
    id: 19,
    question: "Phong trào cứu đói trực tiếp hướng tới nhiệm vụ nào?",
    options: [
      "Chống giặc đói",
      "Bầu cử Quốc hội",
      "Đàm phán ngoại giao",
      "Soạn thảo Hiến pháp",
    ],
    correct: 0,
    explain:
      "Cứu đói là hoạt động giải quyết khó khăn cấp bách về đời sống nhân dân. Đối chiếu: PDF thuyết trình Nhóm 01, trang 14.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 14,
    },
  },
  {
    id: 20,
    question: "Chống giặc dốt gắn với lĩnh vực nào?",
    options: [
      "Giáo dục và nâng cao dân trí",
      "Thay thế hoạt động bầu cử",
      "Giải giáp quân đội nước ngoài",
      "Đàm phán về quân sự",
    ],
    correct: 0,
    explain:
      "Phần chống giặc dốt gắn với xây dựng đời sống văn hóa và khắc phục lạc hậu. Đối chiếu: PDF thuyết trình Nhóm 01, trang 15.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 15,
    },
  },
  {
    id: 21,
    question: "Tổng tuyển cử đầu tiên diễn ra ngày nào?",
    options: ["6/1/1946", "2/3/1946", "6/3/1946", "9/11/1946"],
    correct: 0,
    explain:
      "Ngày 6/1/1946 là mốc Tổng tuyển cử đầu tiên bầu Quốc hội. Đối chiếu: PDF thuyết trình Nhóm 01, trang 16.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 16,
    },
  },
  {
    id: 22,
    question: "Tổng tuyển cử đầu tiên bầu cơ quan nào?",
    options: [
      "Quốc hội khóa I",
      "Mặt trận Liên Việt",
      "Ủy ban hành chính của một địa phương",
      "Một phái đoàn ngoại giao",
    ],
    correct: 0,
    explain:
      "Cuộc Tổng tuyển cử bầu đại biểu Quốc hội khóa I. Đối chiếu: PDF thuyết trình Nhóm 01, trang 16.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 16,
    },
  },
  {
    id: 23,
    question:
      "Theo slide, có bao nhiêu đại biểu được bầu vào Quốc hội khóa I trong Tổng tuyển cử?",
    options: ["333 đại biểu", "70 đại biểu", "150 đại biểu", "500 đại biểu"],
    correct: 0,
    explain:
      "Slide ghi 333 đại biểu được bầu; cần phân biệt số được bầu với số bổ sung sau đó. Đối chiếu: PDF thuyết trình Nhóm 01, trang 16.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 16,
    },
  },
  {
    id: 24,
    question: "Kỳ họp đầu tiên của Quốc hội khóa I diễn ra ngày nào?",
    options: ["2/3/1946", "6/1/1946", "25/11/1945", "14/9/1946"],
    correct: 0,
    explain:
      "Ngày 2/3/1946 là mốc Quốc hội họp phiên đầu được ghi trong bài. Đối chiếu: PDF thuyết trình Nhóm 01, trang 16.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 16,
    },
  },
  {
    id: 25,
    question:
      "Ai đứng đầu Chính phủ Liên hiệp kháng chiến được Quốc hội khóa I thông qua tại kỳ họp đầu tiên ngày 2/3/1946?",
    options: [
      "Chủ tịch Hồ Chí Minh",
      "Chủ tịch Tôn Đức Thắng",
      "Đại tướng Võ Nguyên Giáp",
      "Tổng Bí thư Trường Chinh",
    ],
    correct: 0,
    explain:
      "Chính phủ Liên hiệp kháng chiến do Chủ tịch Hồ Chí Minh đứng đầu. Đối chiếu PDF trang 16 và tài liệu Quốc hội về kỳ họp ngày 2/3/1946.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 16,
      url: "https://quochoi.vn/tintuc/Pages/su-kien-noi-bat.aspx?ItemID=98525",
    },
  },
  {
    id: 26,
    question:
      "Hiến pháp đầu tiên của nước Việt Nam Dân chủ Cộng hòa được thông qua ngày nào?",
    options: ["9/11/1946", "2/9/1945", "6/1/1946", "3/9/1945"],
    correct: 0,
    explain:
      "Quốc hội thông qua Hiến pháp năm 1946 vào ngày 9/11/1946. Đối chiếu: PDF thuyết trình Nhóm 01, trang 16.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 16,
    },
  },
  {
    id: 27,
    question: "Cơ quan nào thông qua Hiến pháp năm 1946?",
    options: [
      "Quốc hội",
      "Một hội nghị ngoại giao",
      "Một ủy ban địa phương",
      "Một đoàn thể văn hóa",
    ],
    correct: 0,
    explain:
      "Việc Quốc hội thông qua Hiến pháp là một mốc củng cố thể chế. Đối chiếu: PDF thuyết trình Nhóm 01, trang 16.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 16,
    },
  },
  {
    id: 28,
    question: "Ở địa phương, hoạt động nào góp phần kiện toàn chính quyền?",
    options: [
      "Bầu Hội đồng nhân dân, kiện toàn Ủy ban hành chính",
      "Tổ chức các lớp bình dân học vụ",
      "Chỉ tổ chức hội thi văn nghệ",
      "Vận động tăng gia sản xuất",
    ],
    correct: 0,
    explain:
      "Bài nêu việc xây dựng chính quyền diễn ra cả ở trung ương và địa phương. Đối chiếu: PDF thuyết trình Nhóm 01, trang 16.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 16,
    },
  },
  {
    id: 29,
    question: "Tinh thần phục vụ của chính quyền được khái quát bằng ý nào?",
    options: [
      "Chính quyền là công bộc của dân",
      "Tổ chức Tổng tuyển cử",
      "Xây dựng căn cứ địa",
      "Chuẩn bị lương thực và thuốc men",
    ],
    correct: 0,
    explain:
      "Slide nhấn mạnh vai trò phục vụ nhân dân của chính quyền. Đối chiếu: PDF thuyết trình Nhóm 01, trang 16.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 16,
    },
  },
  {
    id: 30,
    question: "Mở rộng Mặt trận và các đoàn thể nhằm củng cố yếu tố nào?",
    options: [
      "Khối đoàn kết và lực lượng cách mạng",
      "Nguồn thu từ tiền tệ",
      "Hệ thống giao thông vận tải",
      "Quy trình tổ chức Tổng tuyển cử",
    ],
    correct: 0,
    explain:
      "Mở rộng Mặt trận và đoàn thể giúp tập hợp, củng cố lực lượng cách mạng. Đối chiếu: PDF thuyết trình Nhóm 01, trang 17.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 17,
    },
  },
  {
    id: 31,
    question:
      "Khi Pháp đánh chiếm Sài Gòn – Chợ Lớn tháng 9/1945, quân dân Nam Bộ đã làm gì?",
    options: [
      "Đứng lên kháng chiến",
      "Tổ chức Tổng tuyển cử đầu tiên",
      "Thông qua Hiến pháp năm 1946",
      "Ký Hiệp định Sơ bộ",
    ],
    correct: 0,
    explain:
      "Quân dân Nam Bộ đứng lên kháng chiến ngay khi thực dân Pháp trở lại xâm lược. Đối chiếu: PDF thuyết trình Nhóm 01, trang 19.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 19,
    },
  },
  {
    id: 32,
    question: "Các chi đội Nam tiến có nhiệm vụ gì?",
    options: [
      "Chi viện cho cuộc kháng chiến ở phía Nam",
      "Thay thế Quốc hội",
      "Soạn thảo Hiến pháp",
      "Tổ chức Tổng tuyển cử ở nước ngoài",
    ],
    correct: 0,
    explain:
      "Nam tiến thể hiện sự chi viện đối với cuộc kháng chiến ở phía Nam. Đối chiếu: PDF thuyết trình Nhóm 01, trang 19.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 19,
    },
  },
  {
    id: 33,
    question:
      "Hội nghị cán bộ Đảng bộ Nam Bộ ngày 25/10/1945 tập trung vào nội dung nào?",
    options: [
      "Củng cố lực lượng và phát động toàn dân kháng chiến",
      "Kết thúc mọi hoạt động kháng chiến",
      "Tổ chức các lớp bình dân học vụ",
      "Chỉ thảo luận về công nghiệp hóa",
    ],
    correct: 0,
    explain:
      "Bài nêu nhiệm vụ củng cố lực lượng, xây dựng cơ sở bí mật và phát động toàn dân kháng chiến. Đối chiếu: PDF thuyết trình Nhóm 01, trang 19.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 19,
    },
  },
  {
    id: 34,
    question:
      "Sách lược đối với quân Trung Hoa Dân quốc được bài khái quát như thế nào?",
    options: [
      "Hòa hoãn, nhân nhượng có nguyên tắc",
      "Tăng gia sản xuất và cứu đói",
      "Tổ chức bầu cử ở địa phương",
      "Phát động phong trào xóa mù chữ",
    ],
    correct: 0,
    explain:
      "Sách lược nhằm tận dụng mâu thuẫn và giảm sức ép trong tình thế khó khăn. Đối chiếu: PDF thuyết trình Nhóm 01, trang 20.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 20,
    },
  },
  {
    id: 35,
    question:
      "Việc Đảng tuyên bố tự giải tán ngày 11/11/1945 thực chất gắn với chuyển hướng nào?",
    options: [
      "Rút vào hoạt động bí mật",
      "Tổ chức Tổng tuyển cử",
      "Phát hành giấy bạc Việt Nam",
      "Thành lập Hội Liên hiệp quốc dân Việt Nam",
    ],
    correct: 0,
    explain:
      "Theo bài, đây là một biện pháp sách lược, Đảng rút vào hoạt động bí mật. Đối chiếu: PDF thuyết trình Nhóm 01, trang 20.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 20,
    },
  },
  {
    id: 36,
    question:
      "Sự nhân nhượng đối với Việt Quốc, Việt Cách được nêu ở lĩnh vực nào?",
    options: [
      "Ghế Quốc hội và vị trí trong Chính phủ",
      "Phong trào bình dân học vụ",
      "Chương trình tăng gia sản xuất",
      "Việc di chuyển máy móc và vật liệu",
    ],
    correct: 0,
    explain:
      "Bài đề cập các nhân nhượng về tổ chức trong hoàn cảnh cụ thể năm 1946. Đối chiếu: PDF thuyết trình Nhóm 01, trang 20.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 20,
    },
  },
  {
    id: 37,
    question:
      "Biện pháp kinh tế nào được nêu trong sách lược với quân Trung Hoa Dân quốc?",
    options: [
      "Cung cấp lương thực, thực phẩm",
      "Tổ chức các lớp bình dân học vụ",
      "Bãi bỏ mọi hoạt động lưu thông",
      "Vận động tăng gia sản xuất",
    ],
    correct: 0,
    explain:
      "Cung cấp lương thực, thực phẩm là một nhân nhượng kinh tế được đề cập. Đối chiếu: PDF thuyết trình Nhóm 01, trang 21.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 21,
    },
  },
  {
    id: 38,
    question: "Hai loại tiền nào được cho phép lưu hành theo nội dung slide?",
    options: [
      "Quan kim và Quốc tệ",
      "Euro và đô la Mỹ",
      "Yên và bảng Anh",
      "Rúp và euro",
    ],
    correct: 0,
    explain:
      "Slide nêu Quan kim và Quốc tệ lưu hành cùng đồng bạc Đông Dương trong bối cảnh lúc đó. Đối chiếu: PDF thuyết trình Nhóm 01, trang 21.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 21,
    },
  },
  {
    id: 39,
    question: "Vì sao cần tránh cùng lúc đối đầu nhiều lực lượng đối địch?",
    options: [
      "Vì lực lượng cách mạng còn non yếu",
      "Để triển khai Tổng tuyển cử ở địa phương",
      "Để phát động Tuần lễ vàng",
      "Để tổ chức các lớp bình dân học vụ",
    ],
    correct: 0,
    explain:
      "Tránh thế đối đầu cùng lúc giúp bảo toàn và xây dựng lực lượng. Đối chiếu: PDF thuyết trình Nhóm 01, trang 23.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 23,
    },
  },
  {
    id: 40,
    question: "Nội dung nào thuộc củng cố lực lượng vũ trang trong bài?",
    options: [
      "Chuẩn bị vũ khí, lương thực và thuốc men",
      "Tổ chức các lớp bình dân học vụ",
      "Vận động tăng gia sản xuất",
      "Chỉ dựa vào nguồn lực bên ngoài",
    ],
    correct: 0,
    explain:
      "Củng cố lực lượng đi cùng chuẩn bị vật chất và hậu cần. Đối chiếu: PDF thuyết trình Nhóm 01, trang 17.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 17,
    },
  },
  {
    id: 41,
    question: "Hiệp ước Trùng Khánh được ký ngày nào?",
    options: ["28/2/1946", "6/3/1946", "9/3/1946", "14/9/1946"],
    correct: 0,
    explain:
      "Hiệp ước Trùng Khánh là một diễn biến ngoại giao đặt ra yêu cầu điều chỉnh sách lược. Đối chiếu: PDF thuyết trình Nhóm 01, trang 23.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 23,
    },
  },
  {
    id: 42,
    question: "Hai bên ký Hiệp ước Trùng Khánh năm 1946 là những bên nào?",
    options: [
      "Pháp và Trung Hoa Dân quốc",
      "Việt Nam và Nhật Bản",
      "Việt Nam và Liên Xô",
      "Anh và Hoa Kỳ",
    ],
    correct: 0,
    explain:
      "Bài trình bày hiệp ước giữa Pháp và Trung Hoa Dân quốc trong bối cảnh năm 1946. Đối chiếu: PDF thuyết trình Nhóm 01, trang 23.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 23,
    },
  },
  {
    id: 43,
    question: "Chỉ thị Tình hình và chủ trương được ban hành ngày nào?",
    options: ["3/3/1946", "25/11/1945", "9/11/1946", "6/1/1946"],
    correct: 0,
    explain:
      "Ngày 3/3/1946 là mốc của Chỉ thị Tình hình và chủ trương. Đối chiếu: PDF thuyết trình Nhóm 01, trang 24.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 24,
    },
  },
  {
    id: 44,
    question: "Chủ trương tạm hòa với Pháp phải giữ điều gì?",
    options: [
      "Quyền dân tộc tự quyết",
      "Lịch tổ chức Tổng tuyển cử",
      "Kế hoạch cứu đói",
      "Nội dung phong trào bình dân học vụ",
    ],
    correct: 0,
    explain:
      "Bài nhấn mạnh nhân nhượng về kinh tế nhưng giữ quyền dân tộc tự quyết. Đối chiếu: PDF thuyết trình Nhóm 01, trang 24.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 24,
    },
  },
  {
    id: 45,
    question: "Hiệp định Sơ bộ được ký ngày nào?",
    options: ["6/3/1946", "3/3/1946", "9/3/1946", "28/2/1946"],
    correct: 0,
    explain:
      "Ngày 6/3/1946 là mốc ký Hiệp định Sơ bộ. Đối chiếu: PDF thuyết trình Nhóm 01, trang 25.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 25,
    },
  },
  {
    id: 46,
    question: "Đại diện phía Pháp ký Hiệp định Sơ bộ ngày 6/3/1946 là ai?",
    options: [
      "Jean Sainteny",
      "Jean Monnet",
      "Charles de Gaulle",
      "Georges Clemenceau",
    ],
    correct: 0,
    explain:
      "Bài ghi người ký phía Pháp là Jean Sainteny. Đối chiếu: PDF thuyết trình Nhóm 01, trang 25.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 25,
    },
  },
  {
    id: 47,
    question: "Hiệp định Sơ bộ được ký tại đâu theo bài thuyết trình?",
    options: ["Hà Nội", "Đà Lạt", "Huế", "Hải Phòng"],
    correct: 0,
    explain:
      "Slide xác định địa điểm ký là Hà Nội. Đối chiếu: PDF thuyết trình Nhóm 01, trang 25.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 25,
    },
  },
  {
    id: 48,
    question: "Theo Hiệp định Sơ bộ, Pháp công nhận Việt Nam là gì?",
    options: [
      "Một quốc gia tự do, có Chính phủ, nghị viện, quân đội và tài chính riêng, trong Liên bang Đông Dương và Liên hiệp Pháp",
      "Một thành viên Liên hợp quốc ngay trong tháng 3/1946",
      "Một bên tham gia Hiệp định Genève năm 1954",
      "Một bên tham gia Hiệp định Paris năm 1973",
    ],
    correct: 0,
    explain:
      "Hiệp định Sơ bộ ghi nhận Việt Nam là quốc gia tự do có Chính phủ, nghị viện, quân đội và tài chính riêng, trong Liên bang Đông Dương và Liên hiệp Pháp; không đồng nghĩa công nhận độc lập hoàn toàn. Đối chiếu PDF trang 25 và Lịch sử Việt Nam, tập 10.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 25,
      url: "https://www.tqsqk7.edu.vn/upload/16/144/L%E1%BB%8Bch%20s%E1%BB%AD%20Vi%E1%BB%87t%20Nam%20t%E1%BA%ADp%2010%20%20%20T%E1%BB%AB%20n%C4%83m%201945%20%C4%91%E1%BA%BFn%20n%C4%83m%201950%20Dinh%20Thu%20Thu%20Cuc%202017.pdf",
    },
  },
  {
    id: 49,
    question: "Chỉ thị Hòa để tiến được ban hành ngày nào?",
    options: ["9/3/1946", "6/3/1946", "6/1/1946", "9/11/1946"],
    correct: 0,
    explain:
      "Chỉ thị Hòa để tiến được ban hành sau Hiệp định Sơ bộ. Đối chiếu: PDF thuyết trình Nhóm 01, trang 26.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 26,
    },
  },
  {
    id: 50,
    question: "Ý nghĩa sách lược của Hòa để tiến là gì?",
    options: [
      "Tranh thủ thời gian chuẩn bị lực lượng, giữ vững độc lập",
      "Tổ chức Tổng tuyển cử đầu tiên",
      "Phát động Tuần lễ vàng",
      "Thông qua Hiến pháp năm 1946",
    ],
    correct: 0,
    explain:
      "Hòa hoãn đi cùng cảnh giác và tiếp tục chuẩn bị kháng chiến. Đối chiếu: PDF thuyết trình Nhóm 01, trang 26.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 26,
    },
  },
  {
    id: 51,
    question:
      "Hội nghị trù bị trong hoạt động ngoại giao năm 1946 diễn ra ở đâu?",
    options: ["Đà Lạt", "Huế", "Vinh", "Cần Thơ"],
    correct: 0,
    explain:
      "Bài đề cập Hội nghị trù bị Đà Lạt trong hoạt động ngoại giao năm 1946. Đối chiếu: PDF thuyết trình Nhóm 01, trang 27.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 27,
    },
  },
  {
    id: 52,
    question:
      "Hội nghị nào ở Pháp được bài thuyết trình đề cập trong năm 1946?",
    options: ["Fontainebleau", "Genève", "Paris năm 1973", "San Francisco"],
    correct: 0,
    explain:
      "Hội nghị Fontainebleau thuộc chuỗi hoạt động đàm phán năm 1946. Đối chiếu: PDF thuyết trình Nhóm 01, trang 27.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 27,
    },
  },
  {
    id: 53,
    question: "Tạm ước năm 1946 được ký ngày nào?",
    options: ["14/9/1946", "6/3/1946", "28/2/1946", "9/11/1946"],
    correct: 0,
    explain:
      "Bộ câu hỏi chỉ sử dụng ngày ký; chi tiết địa điểm ghi trên slide cần được đối chiếu riêng. Đối chiếu: PDF thuyết trình Nhóm 01, trang 27.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 27,
    },
  },
  {
    id: 54,
    question: "Chuẩn bị kháng chiến lâu dài bao gồm hoạt động nào?",
    options: [
      "Di chuyển cơ quan, xây dựng căn cứ và bảo toàn vật chất",
      "Tổ chức các lớp bình dân học vụ",
      "Vận động tăng gia sản xuất",
      "Chuẩn bị lương thực và thuốc men",
    ],
    correct: 0,
    explain:
      "Việc di chuyển và xây dựng căn cứ giúp chuẩn bị cho kháng chiến lâu dài. Đối chiếu: PDF thuyết trình Nhóm 01, trang 30.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 30,
    },
  },
  {
    id: 55,
    question: "ATK trong nội dung chuẩn bị kháng chiến là viết tắt của gì?",
    options: ["An toàn khu", "Ấp tập kết", "An toàn kho", "Ải tiền khu"],
    correct: 0,
    explain:
      "Bài nhắc đến căn cứ địa, chiến khu và an toàn khu (ATK). Đối chiếu: PDF thuyết trình Nhóm 01, trang 30.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 30,
    },
  },
  {
    id: 56,
    question:
      "Di chuyển máy móc, vật liệu nhằm mục đích gì trong chuẩn bị kháng chiến?",
    options: [
      "Bảo toàn nguồn lực phục vụ kháng chiến lâu dài",
      "Tổ chức các lớp bình dân học vụ",
      "Vận động tăng gia sản xuất",
      "Thay thế việc xây dựng chính quyền",
    ],
    correct: 0,
    explain:
      "Bảo toàn phương tiện và vật chất là một phần chuẩn bị thực lực. Đối chiếu: PDF thuyết trình Nhóm 01, trang 30.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 30,
    },
  },
  {
    id: 57,
    question:
      "Kết quả nào được nêu cho giai đoạn xây dựng và bảo vệ chính quyền?",
    options: [
      "Củng cố chính quyền và thành quả Cách mạng Tháng Tám",
      "Hoàn thành thống nhất đất nước ngay năm 1946",
      "Tổ chức các lớp bình dân học vụ",
      "Hoàn thành kháng chiến chống Pháp năm 1946",
    ],
    correct: 0,
    explain:
      "Giai đoạn này củng cố chính quyền và tạo thời gian chuẩn bị cho kháng chiến lâu dài. Đối chiếu: PDF thuyết trình Nhóm 01, trang 32.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 32,
    },
  },
  {
    id: 58,
    question: "Kinh nghiệm về nội lực được bài thuyết trình nhấn mạnh là gì?",
    options: [
      "Tự lực, tự cường",
      "Thời điểm tổ chức Tổng tuyển cử",
      "Thể lệ lưu hành tiền tệ",
      "Địa điểm Hội nghị trù bị Đà Lạt",
    ],
    correct: 0,
    explain:
      "Tự lực, tự cường đi cùng kiên quyết bảo vệ độc lập, tự do. Đối chiếu: PDF thuyết trình Nhóm 01, trang 33.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 33,
    },
  },
  {
    id: 59,
    question: "Nhân nhượng có nguyên tắc phải gắn với yêu cầu nào?",
    options: [
      "Giữ vững độc lập và lợi ích dân tộc",
      "Lịch tổ chức các kỳ họp Quốc hội",
      "Kế hoạch di chuyển máy móc",
      "Danh sách các lớp bình dân học vụ",
    ],
    correct: 0,
    explain:
      "Sách lược linh hoạt không có nghĩa từ bỏ nguyên tắc độc lập dân tộc. Đối chiếu: PDF thuyết trình Nhóm 01, trang 33.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 33,
    },
  },
  {
    id: 60,
    question:
      "Kinh nghiệm nào liên quan trực tiếp đến việc tập hợp sức mạnh nhân dân?",
    options: [
      "Củng cố đại đoàn kết toàn dân",
      "Phát hành giấy bạc Việt Nam",
      "Di chuyển máy móc và vật liệu",
      "Ấn định ngày bầu cử Quốc hội",
    ],
    correct: 0,
    explain:
      "Đại đoàn kết toàn dân và phát triển thực lực cách mạng là những kinh nghiệm được nêu. Đối chiếu: PDF thuyết trình Nhóm 01, trang 33.",
    source: {
      document: "Thuyết trình VNR202 Nhóm 01 – Chương 2",
      page: 33,
    },
  },
];
bank.version = "group01-1945-1946-v2-powers";
module.exports = bank;
