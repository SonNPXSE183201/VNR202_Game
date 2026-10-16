/**
 * NGÂN HÀNG 60 CÂU HỎI LỊCH SỬ ĐẢNG - VNR202 (GIAI ĐOẠN 1945 - 1950)
 * Bám sát 100% nội dung thuyết trình: Xây dựng, bảo vệ chính quyền và kháng chiến chống Pháp.
 * Đảm bảo tính chính xác lịch sử, tính tôn nghiêm, chuẩn mực sư phạm.
 */
const QUESTIONS_BANK = [
  // --- PHẦN 1: TÌNH HÌNH VIỆT NAM SAU CÁCH MẠNG THÁNG TÁM 1945 (CÂU 1 - 12) ---
  {
    id: 1,
    question: "Sau ngày Tuyên bố độc lập 2-9-1945, tình thế đất nước ta được ví hiểm nghèo như thế nào?",
    options: ["Nước sôi lửa bỏng", "Trứng để đầu đẳng", "\"Ngàn cân treo sợi tóc\"", "Thập tử nhất sinh"],
    correct: 2,
    explain: "Vận mệnh dân tộc lúc này cùng lúc phải đối phó với nạn đói, nạn dốt và thù trong, giặc ngoài."
  },
  {
    id: 2,
    question: "Sau Chiến tranh thế giới thứ II, quốc gia nào trở thành thành trì vững chắc của chủ nghĩa xã hội trên thế giới?",
    options: ["Trung Quốc", "Liên Xô", "Ba Lan", "Tiệp Khắc"],
    correct: 1,
    explain: "Liên Xô là chỗ dựa vững chắc cho phong trào cách mạng thế giới và phong trào giải phóng dân tộc."
  },
  {
    id: 3,
    question: "Thuận lợi cơ bản nhất về mặt đối nội của nước ta sau Cách mạng Tháng Tám năm 1945 là gì?",
    options: [
      "Kho bạc nhà nước dồi dào tài chính",
      "Quân đội được trang bị vũ khí hiện đại",
      "Nhân dân giành quyền làm chủ, tin tưởng tuyệt đối vào Đảng và Chủ tịch Hồ Chí Minh",
      "Được nhiều nước phương Tây công nhận độc lập"
    ],
    correct: 2,
    explain: "Nhân dân từ thân phận nô lệ trở thành chủ nhân đất nước, khối đại đoàn kết toàn dân được phát huy cao độ."
  },
  {
    id: 4,
    question: "Thách thức lớn nhất đe dọa trực tiếp đến nền độc lập non trẻ của Việt Nam cuối năm 1945 là gì?",
    options: [
      "Nạn mù chữ chưa được xóa bỏ",
      "Lũ lụt làm vỡ đê ở Bắc Bộ",
      "Âm mưu quay lại thống trị Việt Nam của thực dân Pháp",
      "Mâu thuẫn bè phái nội bộ nhân dân"
    ],
    correct: 2,
    explain: "Thực dân Pháp dã tâm dùng vũ lực để tái lập nền thống trị thực dân tại Đông Dương."
  },
  {
    id: 5,
    question: "Nạn đói cuối năm 1944 đầu năm 1945 do hậu quả bóc lột của Nhật - Pháp đã cướp đi sinh mạng của bao nhiêu đồng bào ta?",
    options: ["Khoảng 1 triệu người", "Hơn 2 triệu người", "Khoảng 500 nghìn người", "Gần 3 triệu người"],
    correct: 1,
    explain: "Đây là thảm họa nhân đạo khủng khiếp do chính sách vơ vét lúa gạo của phát xít Nhật và thực dân Pháp."
  },
  {
    id: 6,
    question: "Sau ngày 2-9-1945, tỷ lệ dân số nước ta bị mù chữ là khoảng bao nhiêu phần trăm?",
    options: ["75%", "80%", "90%", "95%"],
    correct: 3,
    explain: "Chính sách ngu dân của thực dân Pháp đã để lại hậu quả nặng nề với 95% dân số không biết chữ."
  },
  {
    id: 7,
    question: "Ngày 2-9-1945, thực dân Pháp đã có hành động khiêu khích trắng trợn nào tại miền Nam?",
    options: [
      "Ném bom cảng Hải Phòng",
      "Đánh chiếm thị xã Lạng Sơn",
      "Bắn vào cuộc mít tinh mừng độc lập của nhân dân ở Sài Gòn - Chợ Lớn",
      "Cho máy bay đổ quân xuống Nam Định"
    ],
    correct: 2,
    explain: "Pháp nổ súng vào đoàn người tuần hành mừng độc lập tại Sài Gòn làm nhiều đồng bào thương vong."
  },
  {
    id: 8,
    question: "Từ tháng 9-1945, lực lượng quân đội nào dưới danh nghĩa Đồng minh đổ bộ vào miền Nam để giải giáp quân Nhật nhưng thực chất bảo trợ cho Pháp?",
    options: ["Quân đội Mỹ", "Quân Anh - Ấn", "Quân Tưởng Giới Thạch", "Quân đội Úc"],
    correct: 1,
    explain: "2 vạn quân Anh - Ấn đã tiếp tay, trang bị vũ khí cho tàn quân Pháp nổ súng gây hấn ở Nam Bộ."
  },
  {
    id: 9,
    question: "Ở phía Bắc vĩ tuyến 16, lực lượng nào đã kéo vào nước ta với danh nghĩa Đồng minh giải giáp quân Nhật?",
    options: ["10 vạn quân Pháp", "15 vạn quân Anh", "Hơn 20 vạn quân Tưởng Giới Thạch", "5 vạn quân tình nguyện"],
    correct: 2,
    explain: "Quân Tưởng kéo vào dưới sự hậu thuẫn của Mỹ nhằm lật đổ chính quyền cách mạng non trẻ."
  },
  {
    id: 10,
    question: "Đi theo sau 20 vạn quân Tưởng vào miền Bắc là lực lượng tay sai phản động nào mang âm mưu \"diệt Cộng, cầm Hồ\"?",
    options: [
      "Đảng Dân chủ và Đảng Xã hội",
      "Việt Quốc (Việt Nam Quốc dân Đảng) và Việt Cách (Việt Nam Cách mệnh Đồng minh Hội)",
      "Đảng Đại Việt và Cần lao Nhân vị",
      "Mặt trận Quốc gia Liên hiệp"
    ],
    correct: 1,
    explain: "Bọn tay sai Việt Quốc, Việt Cách dựa bóng quân Tưởng để quấy phá chính quyền cách mạng."
  },
  {
    id: 11,
    question: "Sau khi Thế chiến II kết thúc, trên lãnh thổ Việt Nam còn lại bao nhiêu quân Nhật bại trận chờ giải giáp?",
    options: ["Khoảng 2 vạn quân", "Khoảng 4 vạn quân", "Khoảng 6 vạn quân", "Khoảng 10 vạn quân"],
    correct: 2,
    explain: "6 vạn quân Nhật bại trận tại Việt Nam là một trong những mối lo ngại an ninh lớn thời điểm đó."
  },
  {
    id: 12,
    question: "Khó khăn lớn nhất về mặt ngoại giao của Nhà nước Việt Nam Dân chủ Cộng hòa ngay sau ngày Tuyên ngôn Độc lập là gì?",
    options: [
      "Bị Liên Hợp Quốc cấm vận kinh tế",
      "Chưa có bất kỳ quốc gia nào công nhận địa vị pháp lý và đặt quan hệ ngoại giao",
      "Bị cô lập hoàn toàn về đường hàng không",
      "Bị các nước láng giềng Đông Nam Á phản đối"
    ],
    correct: 1,
    explain: "Việt Nam khi đó nằm trong vòng vây của chủ nghĩa đế quốc và chưa nước lớn nào công nhận."
  },

  // --- PHẦN 2: CHỦ TRƯƠNG DIỆT GIẶC ĐÓI, GIẶC DỐT, XÂY DỰNG CHÍNH QUYỀN (CÂU 13 - 26) ---
  {
    id: 13,
    question: "Trong phiên họp đầu tiên của Chính phủ lâm thời ngày 3-9-1945, Chủ tịch Hồ Chí Minh đã xác định ba nhiệm vụ cấp bách trước mắt là gì?",
    options: [
      "Diệt nội gián, chống hạn hán, cải cách ruộng đất",
      "Diệt giặc đói, diệt giặc dốt, diệt giặc ngoại xâm",
      "Chống lạm phát, xây dựng công nghiệp, tuyển quân",
      "Phát hành tiền, thành lập tòa án, mở rộng ngoại giao"
    ],
    correct: 1,
    explain: "Ba thứ giặc nguy hiểm được Chủ tịch Hồ Chí Minh xác định cần phải giải quyết ngay lập tức."
  },
  {
    id: 14,
    question: "Chỉ thị lịch sử mang tính định hướng con đường phát triển của cách mạng sau Cách mạng Tháng Tám ra ngày 25-11-1945 có tên gọi là gì?",
    options: [
      "Chỉ thị Hòa để tiến",
      "Chỉ thị Toàn dân kháng chiến",
      "Chỉ thị Kháng chiến kiến quốc",
      "Chỉ thị Tình hình và chủ trương"
    ],
    correct: 2,
    explain: "Chỉ thị Kháng chiến kiến quốc là kim chỉ nam soi đường cho đất nước trong giai đoạn hiểm nghèo."
  },
  {
    id: 15,
    question: "Trong Chỉ thị Kháng chiến kiến quốc (25-11-1945), Đảng ta xác định kẻ thù chính lúc này là ai?",
    options: [
      "Quân Tưởng Giới Thạch",
      "Bọn tay sai phản động Việt Quốc, Việt Cách",
      "Thực dân Pháp xâm lược",
      "Tàn quân phát xít Nhật"
    ],
    correct: 2,
    explain: "Đảng chỉ rõ phải tập trung ngọn lửa đấu tranh vào kẻ thù nguy hiểm và trực tiếp nhất là thực dân Pháp."
  },
  {
    id: 16,
    question: "Khẩu hiệu đấu tranh xuyên suốt được nêu ra trong Chỉ thị Kháng chiến kiến quốc (25-11-1945) là gì?",
    options: [
      "\"Độc lập hay là chết\"",
      "\"Tất cả cho tiền tuyến\"",
      "\"Dân tộc trên hết, Tổ quốc trên hết\"",
      "\"Tấc đất tấc vàng\""
    ],
    correct: 2,
    explain: "Khẩu hiệu này đặt lợi ích tối cao của dân tộc lên trên mọi bất đồng và mâu thuẫn giai cấp thời điểm đó."
  },
  {
    id: 17,
    question: "Biện pháp căn cơ, lâu dài và quan trọng nhất để giải quyết nạn đói được Đảng và Chính phủ phát động là gì?",
    options: [
      "Xin viện trợ lương thực từ quốc tế",
      "Đẩy mạnh tăng gia sản xuất (\"tăng gia sản xuất ngay, tăng gia sản xuất nữa\")",
      "Cấm buôn bán thóc gạo trên toàn quốc",
      "Độc quyền phân phối lương thực"
    ],
    correct: 1,
    explain: "Tăng gia sản xuất là kế sách then chốt giúp nhân dân tự chủ nguồn lương thực bền vững."
  },
  {
    id: 18,
    question: "Phong trào quyên góp vàng, tiền bạc để ủng hộ ngân khố quốc gia non trẻ được phát động vào tháng 9-1945 có tên gọi là gì?",
    options: ["Quỹ Đảm phụ quốc phòng", "Hũ gạo cứu đói", "Tuần lễ vàng", "Quỹ Nam Bộ kháng chiến"],
    correct: 2,
    explain: "Tuần lễ vàng đã thu nhận được 370 kg vàng và 20 triệu đồng Đông Dương ủng hộ cho Chính phủ."
  },
  {
    id: 19,
    question: "Chính sách kinh tế nào đã được Chính phủ cách mạng ban hành ngay nhằm giảm gánh nặng cho người nông dân nghèo năm 1945?",
    options: [
      "Bãi bỏ thuế thân và giảm tô 25%",
      "Thu hồi toàn bộ đất đai tư hữu của nhân dân",
      "Miễn thuế tuyệt đối cho các công ty ngoại quốc",
      "Tịch thu ruộng đất của toàn bộ địa chủ"
    ],
    correct: 0,
    explain: "Bãi bỏ thứ thuế thân vô lý của chế độ thực dân và giảm tô 25% đem lại lợi ích thiết thực cho nông dân."
  },
  {
    id: 20,
    question: "Cơ quan chuyên trách phong trào xóa nạn mù chữ được thành lập ngày 8-9-1945 mang tên là gì?",
    options: [
      "Vụ Học vụ Phổ thông",
      "Ban Chấn hưng Giáo dục",
      "Nha Bình dân học vụ",
      "Hội Truyền bá Quốc ngữ"
    ],
    correct: 2,
    explain: "Nha Bình dân học vụ phụ trách tổ chức mạng lưới lớp học chữ quốc ngữ trên toàn quốc."
  },
  {
    id: 21,
    question: "Kết quả ấn tượng của phong trào Bình dân học vụ đến cuối năm 1946 là bao nhiêu người dân đã biết đọc, biết viết?",
    options: ["Hơn 1 triệu người", "Gần 2 triệu người", "Hơn 2,5 triệu người", "Hơn 4 triệu người"],
    correct: 2,
    explain: "Chỉ sau hơn 1 năm, hơn 2,5 triệu đồng bào đã thoát khỏi nạn mù chữ nhờ phong trào Bình dân học vụ."
  },
  {
    id: 22,
    question: "Cuộc Tổng tuyển cử đầu tiên bầu Quốc hội nước Việt Nam Dân chủ Cộng hòa diễn ra vào ngày lịch sử nào?",
    options: ["Ngày 2-9-1945", "Ngày 6-1-1946", "Ngày 2-3-1946", "Ngày 9-11-1946"],
    correct: 1,
    explain: "Hơn 89% cử tri cả nước đã hăng hái đi bỏ phiếu bầu Quốc hội đầu tiên của nước Việt Nam mới."
  },
  {
    id: 23,
    question: "Cuộc Tổng tuyển cử đầu tiên ngày 6-1-1946 đã bầu ra bao nhiêu đại biểu Quốc hội khóa I?",
    options: ["250 đại biểu", "300 đại biểu", "333 đại biểu", "400 đại biểu"],
    correct: 2,
    explain: "333 đại biểu đại diện cho khối đại đoàn kết toàn dân tộc được bầu vào Quốc hội khóa I."
  },
  {
    id: 24,
    question: "Ai là Trưởng ban soạn thảo bản Hiến pháp đầu tiên (năm 1946) của nước Việt Nam Dân chủ Cộng hòa?",
    options: [
      "Đồng chí Trường Chinh",
      "Cụ Huỳnh Thúc Kháng",
      "Chủ tịch Hồ Chí Minh",
      "Đồng chí Phạm Văn Đồng"
    ],
    correct: 2,
    explain: "Chủ tịch Hồ Chí Minh trực tiếp làm Trưởng ban soạn thảo bản Hiến pháp lịch sử năm 1946."
  },
  {
    id: 25,
    question: "Bản Hiến pháp đầu tiên của nước Việt Nam Dân chủ Cộng hòa được Quốc hội thông qua vào ngày nào?",
    options: ["Ngày 6-1-1946", "Ngày 2-3-1946", "Ngày 9-11-1946", "Ngày 19-12-1946"],
    correct: 2,
    explain: "Hiến pháp năm 1946 được thông qua tại kỳ họp thứ 2 của Quốc hội khóa I ngày 9-11-1946."
  },
  {
    id: 26,
    question: "Mặt trận mở rộng đoàn kết dân tộc thành lập tháng 5-1946 do cụ Huỳnh Thúc Kháng làm Hội trưởng có tên là gì?",
    options: [
      "Mặt trận Việt Minh",
      "Hội Liên hiệp quốc dân Việt Nam (Hội Liên Việt)",
      "Mặt trận Tổ quốc Việt Nam",
      "Mặt trận Dân tộc Giải phóng"
    ],
    correct: 1,
    explain: "Hội Liên Việt mở rộng thêm các tầng lớp nhân sĩ, trí thức yêu nước tham gia kháng chiến kiến quốc."
  },

  // --- PHẦN 3: NAM BỘ KHÁNG CHIẾN & ĐỐI PHÓ QUÂN TƯỞNG (CÂU 27 - 36) ---
  {
    id: 27,
    question: "Thực dân Pháp nổ súng đánh chiếm Sài Gòn - Chợ Lớn vào thời điểm nào, mở đầu cuộc xâm lược Việt Nam lần thứ hai?",
    options: ["Đêm 2-9-1945", "Rạng sáng 23-9-1945", "Ngày 25-10-1945", "Ngày 19-12-1946"],
    correct: 1,
    explain: "Rạng sáng 23-9-1945, Pháp núp bóng quân Anh nổ súng đánh chiếm trụ sở chính quyền ta tại Sài Gòn."
  },
  {
    id: 28,
    question: "Tinh thần quật khởi của quân và dân Nam Bộ đứng lên kháng chiến chống Pháp từ tháng 9-1945 được thể hiện qua khẩu hiệu nổi tiếng nào?",
    options: [
      "\"Không có gì quý hơn độc lập tự do\"",
      "\"Thà chết tự do còn hơn sống nô lệ\"",
      "\"Quyết tử để Tổ quốc quyết sinh\"",
      "\"Dân tộc trên hết\""
    ],
    correct: 1,
    explain: "Khẩu hiệu thể hiện ý chí quật cường, bất khuất của nhân dân miền Nam ngay những ngày đầu khói lửa."
  },
  {
    id: 29,
    question: "Vũ khí thô sơ gắn liền với hình ảnh người chiến sĩ Nam Bộ những ngày đầu kháng chiến chống Pháp là gì?",
    options: ["Cung tên tre", "Súng kíp tự chế", "Gậy tầm vông vạt nhọn", "Mã tấu"],
    correct: 2,
    explain: "Gậy tầm vông Nam Bộ đã đi vào thi ca và lịch sử như biểu tượng của tinh thần yêu nước quật khởi."
  },
  {
    id: 30,
    question: "Danh hiệu cao quý mà Chủ tịch Hồ Chí Minh thay mặt Chính phủ phong tặng cho đồng bào, chiến sĩ Nam Bộ vào tháng 2-1946 là gì?",
    options: ["\"Lũy thép miền Nam\"", "\"Căn cứ địa kiên cường\"", "\"Thành đồng Tổ quốc\"", "\"Ngọn đuốc cách mạng\""],
    correct: 2,
    explain: "Nam Bộ xứng đáng là \"Thành đồng Tổ quốc\", đi trước về sau trong sự nghiệp giải phóng dân tộc."
  },
  {
    id: 31,
    question: "Sách lược ngoại giao cơ bản của Đảng ta đối với quân Tưởng ở miền Bắc từ tháng 9-1945 đến trước tháng 3-1946 là gì?",
    options: [
      "Đánh phủ đầu quân Tưởng ngay tại biên giới",
      "\"Hoa - Việt thân thiện\", hòa hoãn, nhân nhượng có nguyên tắc",
      "Cầu viện Pháp để cùng đánh Tưởng",
      "Chấp nhận giải tán quân đội cách mạng"
    ],
    correct: 1,
    explain: "Chủ trương tránh đối đầu trực diện, giữ yên miền Bắc để dồn sức kháng chiến chống Pháp ở miền Nam."
  },
  {
    id: 32,
    question: "Ngày 11-11-1945, Đảng Cộng sản Đông Dương đã ra thông cáo tuyên bố hành động gì nhằm tránh mũi nhọn tiến công của kẻ thù?",
    options: [
      "Sáp nhập vào Mặt trận Việt Minh",
      "Tự ý tự giải tán, rút vào hoạt động bí mật",
      "Chuyển toàn bộ căn cứ sang Lào",
      "Đổi tên thành Đảng Lao động Việt Nam"
    ],
    correct: 1,
    explain: "Đảng chủ động rút vào bí mật để bảo toàn lực lượng và tước bỏ cớ khiêu khích của kẻ thù."
  },
  {
    id: 33,
    question: "Khi rút vào hoạt động bí mật cuối năm 1945, một bộ phận Đảng hoạt động công khai dưới danh nghĩa tổ chức nào?",
    options: [
      "Hội Chấn hưng văn hóa dân tộc",
      "Ban Dân tộc giải phóng",
      "Hội nghiên cứu chủ nghĩa Mác ở Đông Dương",
      "Viện Khoa học Xã hội"
    ],
    correct: 2,
    explain: "Tổ chức này công khai nghiên cứu lý luận để duy trì sự lãnh đạo tư tưởng của Đảng."
  },
  {
    id: 34,
    question: "Để hòa hoãn với quân Tưởng, Quốc hội khóa I đã chấp nhận nhượng bộ đặc cách bao nhiêu ghế không qua bầu cử cho tay sai Việt Quốc, Việt Cách?",
    options: ["50 ghế", "70 ghế", "80 ghế", "100 ghế"],
    correct: 1,
    explain: "Chính phủ ta nhượng bộ 70 ghế nhằm phân hóa kẻ thù, vô hiệu hóa âm mưu lật đổ chính quyền của chúng."
  },
  {
    id: 35,
    question: "Về mặt kinh tế đối ngoại với quân Tưởng, Chính phủ ta đã chấp nhận điều kiện nhượng bộ nào?",
    options: [
      "Nộp toàn bộ tiền vàng quyên góp từ Tuần lễ vàng",
      "Cung cấp lương thực và cho phép lưu hành tiền Quan kim, Quốc tệ",
      "Nhượng quyền khai thác than đá Quảng Ninh cho Tưởng",
      "Cho quân Tưởng độc quyền kiểm soát thuế hải quan"
    ],
    correct: 1,
    explain: "Cung cấp gạo và cho dùng tiền mất giá của Tưởng để giữ hòa khí, tránh xung đột quân sự lớn."
  },
  {
    id: 36,
    question: "Phương châm ứng xử chỉ đạo nổi tiếng của Bác Hồ dặn cụ Huỳnh Thúc Kháng trước khi Người sang thăm nước Pháp năm 1946 là gì?",
    options: ["Tự lực cánh sinh", "Kháng chiến trường kỳ", "\"Dĩ bất biến, ứng vạn biến\"", "Nhẫn nhục chờ thời"],
    correct: 2,
    explain: "\"Dĩ bất biến\" là giữ vững độc lập chủ quyền, \"ứng vạn biến\" là linh hoạt sách lược với mọi biến đổi."
  },

  // --- PHẦN 4: HIỆP ĐỊNH SƠ BỘ, TẠM ƯỚC & VỤ ÁN PHỐ ÔN NHƯ HẦU (CÂU 37 - 46) ---
  {
    id: 37,
    question: "Hiệp ước Trùng Khánh (Hiệp ước Hoa - Pháp) được ký kết giữa Pháp và Trung Hoa Dân quốc vào ngày nào?",
    options: ["Ngày 25-11-1945", "Ngày 28-2-1946", "Ngày 6-3-1946", "Ngày 14-9-1946"],
    correct: 1,
    explain: "Hiệp ước Trùng Khánh là sự dàn xếp đê hèn giữa Pháp và Tưởng trên lưng dân tộc Việt Nam."
  },
  {
    id: 38,
    question: "Nội dung chính của Hiệp ước Trùng Khánh (28-2-1946) giữa Pháp và Tưởng là gì?",
    options: [
      "Pháp và Tưởng cùng chia đôi quyền cai trị Việt Nam",
      "Pháp đem quân ra Bắc thay thế quân Tưởng để Tưởng rút quân về nước",
      "Tưởng giúp Pháp đánh chiếm toàn bộ Nam Bộ",
      "Tưởng nhượng quyền kiểm soát miền Bắc cho Mỹ"
    ],
    correct: 1,
    explain: "Pháp nhượng nhiều quyền lợi kinh tế ở Trung Quốc để Tưởng cho Pháp đưa quân ra Bắc thay thế."
  },
  {
    id: 39,
    question: "Đứng trước nguy cơ đối đầu cùng lúc với cả Pháp và Tưởng sau Hiệp ước Trùng Khánh, Trung ương Đảng đã ra bản chỉ thị nào ngày 3-3-1946?",
    options: [
      "Chỉ thị Toàn dân kháng chiến",
      "Chỉ thị \"Tình hình và chủ trương\"",
      "Chỉ thị Hòa để tiến",
      "Chỉ thị Kháng chiến kiến quốc"
    ],
    correct: 1,
    explain: "Chỉ thị ngày 3-3-1946 chủ trương tạm thời dàn hòa với Pháp nhằm đẩy 20 vạn quân Tưởng về nước."
  },
  {
    id: 40,
    question: "Hiệp định Sơ bộ được ký giữa Chủ tịch Hồ Chí Minh và đại diện Chính phủ Pháp Jean Sainteny diễn ra vào ngày nào?",
    options: ["Ngày 28-2-1946", "Ngày 6-3-1946", "Ngày 9-3-1946", "Ngày 14-9-1946"],
    correct: 1,
    explain: "Hiệp định Sơ bộ 6-3-1946 là nước cờ ngoại giao tài tình, tránh cho ta tình thế phải đánh cùng lúc 2 kẻ thù."
  },
  {
    id: 41,
    question: "Trong Hiệp định Sơ bộ (6-3-1946), Chính phủ Pháp đã công nhận nước Việt Nam Dân chủ Cộng hòa là một quốc gia như thế nào?",
    options: [
      "Quốc gia hoàn toàn độc lập và có chủ quyền",
      "Quốc gia tự do có chính phủ, nghị viện, quân đội và tài chính riêng",
      "Lãnh thổ tự trị thuộc địa hạt của khối Liên hiệp Pháp",
      "Thuộc địa bảo hộ của Pháp"
    ],
    correct: 1,
    explain: "Pháp buộc phải công nhận Việt Nam là một quốc gia tự do nằm trong Liên bang Đông Dương."
  },
  {
    id: 42,
    question: "Theo Hiệp định Sơ bộ (6-3-1946), ta chấp nhận cho bao nhiêu quân Pháp ra miền Bắc thay thế quân Tưởng và rút dần trong 5 năm?",
    options: ["10.000 quân", "15.000 quân", "20.000 quân", "30.000 quân"],
    correct: 1,
    explain: "15.000 quân Pháp ra Bắc thay thế hơn 20 vạn quân Tưởng, bớt đi một kẻ thù nguy hiểm tột độ."
  },
  {
    id: 43,
    question: "Chỉ thị của Ban Thường vụ Trung ương Đảng ra ngày 9-3-1946 nhằm giải thích chủ trương hòa hoãn với Pháp để chuẩn bị lực lượng có tên là gì?",
    options: [
      "Chỉ thị Kháng chiến toàn diện",
      "Chỉ thị \"Hòa để tiến\"",
      "Chỉ thị Toàn dân kháng chiến",
      "Chỉ thị Phải phá tan cuộc tấn công mùa đông"
    ],
    correct: 1,
    explain: "\"Hòa để tiến\" chỉ rõ hòa hoãn là sách lược tạm thời để chuẩn bị mọi mặt cho kháng chiến trường kỳ."
  },
  {
    id: 44,
    question: "Trưởng phái đoàn đại biểu nước ta tham dự đàm phán chính thức tại Hội nghị Fontainebleau (Pháp) giữa năm 1946 là ai?",
    options: [
      "Cụ Huỳnh Thúc Kháng",
      "Đồng chí Võ Nguyên Giáp",
      "Đồng chí Phạm Văn Đồng",
      "Đồng chí Trường Chinh"
    ],
    correct: 2,
    explain: "Đồng chí Phạm Văn Đồng kiên quyết đấu tranh bảo vệ lập trường độc lập và thống nhất của Việt Nam."
  },
  {
    id: 45,
    question: "Để có thêm thời gian hòa bình củng cố thực lực, ngày 14-9-1946 tại Pháp, Chủ tịch Hồ Chí Minh đã ký với Marius Moutet văn bản ngoại giao nào?",
    options: [
      "Hiệp ước Hữu nghị Việt - Pháp",
      "Bản Tạm ước 14-9",
      "Hiệp ước Trùng Khánh",
      "Công ước Đình chiến Paris"
    ],
    correct: 1,
    explain: "Tạm ước 14-9-1946 giúp ta kéo dài thời gian hòa bình thêm vài tháng quý báu để chuẩn bị toàn quốc kháng chiến."
  },
  {
    id: 46,
    question: "Vụ án lịch sử ngày 12-7-1946 do lực lượng Công an phá vỡ âm mưu đảo chính lật đổ Chính phủ của bọn phản động diễn ra tại địa điểm nào?",
    options: [
      "Số 132 phố Hàng Bông",
      "Pháo đài Láng",
      "Số 7 phố Ôn Như Hầu (nay là phố Nguyễn Gia Thiều, Hà Nội)",
      "Bắc Bộ phủ"
    ],
    correct: 2,
    explain: "Vụ án phố Ôn Như Hầu đã đập tan âm mưu đảo chính của bọn phản động Đại Việt - Quốc dân Đảng câu kết với Pháp."
  },

  // --- PHẦN 5: TOÀN QUỐC KHÁNG CHIẾN & ĐƯỜNG LỐI KHÁNG CHIẾN (CÂU 47 - 53) ---
  {
    id: 47,
    question: "Hành động khiêu khích trắng trợn nhất của thực dân Pháp tại Hà Nội vào ngày 18-12-1946 là gì?",
    options: [
      "Đánh chiếm sân bay Gia Lâm",
      "Gửi liên tiếp ba tối hậu thư đòi ta giải giáp Tự vệ và giao quyền kiểm soát Thủ đô",
      "Phong tỏa toàn bộ sông Hồng",
      "Bắt giữ các bộ trưởng của Chính phủ ta"
    ],
    correct: 1,
    explain: "Tối hậu thư ngang ngược của Pháp đã đẩy nhân dân ta vào lựa chọn duy nhất: cầm súng đứng lên chiến đấu!"
  },
  {
    id: 48,
    question: "Hội nghị Ban Thường vụ Trung ương Đảng quyết định phát động toàn quốc kháng chiến họp đêm 18-12-1946 tại địa điểm nào?",
    options: [
      "Tân Trào (Tuyên Quang)",
      "Định Hóa (Thái Nguyên)",
      "Làng Vạn Phúc (Hà Đông, Hà Nội)",
      "Cổ Loa (Đông Anh)"
    ],
    correct: 2,
    explain: "Hội nghị họp tại nhà ông Nguyễn Văn Dương ở làng Vạn Phúc, quyết định phát động toàn quốc kháng chiến."
  },
  {
    id: 49,
    question: "Lời kêu gọi toàn quốc kháng chiến bất hủ của Chủ tịch Hồ Chí Minh mở đầu bằng câu nói nào?",
    options: [
      "\"Hỡi đồng bào cả nước!\"",
      "\"Chúng ta muốn hòa bình, chúng ta phải nhân nhượng...\"",
      "\"Không có gì quý hơn độc lập tự do\"",
      "\"Tất cả mọi người đều sinh ra có quyền bình đẳng\""
    ],
    correct: 1,
    explain: "\"Chúng ta càng nhân nhượng, thực dân Pháp càng lấn tới, vì chúng quyết tâm cướp nước ta một lần nữa!\""
  },
  {
    id: 50,
    question: "Tín hiệu nổ súng mở đầu cuộc Toàn quốc kháng chiến tại Hà Nội lúc 20 giờ 3 phút ngày 19-12-1946 phát ra từ địa điểm nào?",
    options: ["Cột cờ Hà Nội", "Nhà hát Lớn", "Pháo đài Láng", "Chợ Đồng Xuân"],
    correct: 2,
    explain: "Pháo đài Láng bắn loạt đạn pháo lệnh đầu tiên, đèn điện thành phố vụt tắt, toàn thành phố nổ súng đánh giặc."
  },
  {
    id: 51,
    question: "Cuộc chiến đấu giam chân địch trong lòng Thủ đô Hà Nội của quân dân ta những ngày đầu Toàn quốc kháng chiến diễn ra trong bao nhiêu ngày đêm?",
    options: ["30 ngày đêm", "45 ngày đêm", "60 ngày đêm", "75 ngày đêm"],
    correct: 2,
    explain: "60 ngày đêm giam chân địch đã bảo vệ an toàn cho cơ quan đầu não và đồng bào rút lên chiến khu an toàn."
  },
  {
    id: 52,
    question: "Đơn vị vũ trang được thành lập ngay trong khói lửa bảo vệ Thủ đô Hà Nội với tinh thần \"Quyết tử để Tổ quốc quyết sinh\" mang tên là gì?",
    options: [
      "Đội Việt Nam Tuyên truyền Giải phóng quân",
      "Trung đoàn Thủ đô",
      "Đại đoàn Quân Tiên phong",
      "Sư đoàn Sao Vàng"
    ],
    correct: 1,
    explain: "Trung đoàn Thủ đô chiến đấu anh dũng kiên cường suốt 60 ngày đêm rồi bí mật vượt vòng vây an toàn."
  },
  {
    id: 53,
    question: "Tác phẩm lý luận quân sự kiệt xuất của Tổng Bí thư Trường Chinh viết tháng 8-1947 nhằm giải thích sâu sắc đường lối kháng chiến có tên là gì?",
    options: [
      "Con đường giải phóng",
      "Bàn về chiến tranh cách mạng",
      "Kháng chiến nhất định thắng lợi",
      "Chiến tranh nhân dân Việt Nam"
    ],
    correct: 2,
    explain: "Tác phẩm \"Kháng chiến nhất định thắng lợi\" hoàn chỉnh đường lối kháng chiến toàn diện của Đảng ta."
  },

  // --- PHẦN 6: CHIẾN DỊCH VIỆT BẮC 1947 & BIÊN GIỚI 1950 (CÂU 54 - 60) ---
  {
    id: 54,
    question: "Nội dung cốt lõi của đường lối kháng chiến chống thực dân Pháp do Đảng ta vạch ra bao gồm 4 yếu tố nào?",
    options: [
      "Thần tốc, táo bạo, bất ngờ, chắc thắng",
      "Toàn dân, toàn diện, lâu dài, dựa vào sức mình là chính",
      "Đánh nhanh, thắng nhanh, cơ động, quyết liệt",
      "Vừa đánh, vừa đàm, tự lực cánh sinh, bao vây tiêu diệt"
    ],
    correct: 1,
    explain: "Bốn trụ cột chiến lược xuyên suốt đưa cuộc kháng chiến chống thực dân Pháp đến thắng lợi vẻ vang."
  },
  {
    id: 55,
    question: "Âm mưu thâm độc nhất của thực dân Pháp khi mở cuộc tấn công lên căn cứ địa Việt Bắc Thu - Đông 1947 là gì?",
    options: [
      "Phong tỏa biên giới Việt - Trung",
      "Tiêu diệt cơ quan đầu não kháng chiến và bộ đội chủ lực, kết thúc nhanh chiến tranh",
      "Khai thác tài nguyên khoáng sản tại Cao Bằng",
      "Chiếm giữ các đồn điền chè và đường sông"
    ],
    correct: 1,
    explain: "Pháp mở 3 gọng kìm hòng \"chụp bắt\" Chính phủ Bác Hồ, tiêu diệt bộ đội chủ lực trong chớp nhoáng."
  },
  {
    id: 56,
    question: "Chiến dịch phản công Việt Bắc Thu - Đông 1947 của quân dân ta diễn ra liên tục trong bao nhiêu ngày đêm?",
    options: ["30 ngày đêm", "60 ngày đêm", "75 ngày đêm", "90 ngày đêm"],
    correct: 2,
    explain: "Sau 75 ngày đêm kiên cường bẻ gãy 3 gọng kìm của Pháp, ta bảo vệ vững chắc căn cứ địa cách mạng."
  },
  {
    id: 57,
    question: "Đầu năm 1948, Chủ tịch Hồ Chí Minh đã ký sắc lệnh thụ phong quân hàm Đại tướng đầu tiên của Quân đội nhân dân Việt Nam cho ai?",
    options: [
      "Đồng chí Nguyễn Chí Thanh",
      "Đồng chí Văn Tiến Dũng",
      "Đồng chí Võ Nguyên Giáp",
      "Đồng chí Chu Văn Tấn"
    ],
    correct: 2,
    explain: "Đồng chí Võ Nguyên Giáp được thụ phong Đại tướng Tổng Tư lệnh Quân đội ở tuổi 37."
  },
  {
    id: 58,
    question: "Ngày 11-6-1948, Chủ tịch Hồ Chí Minh đã ra văn kiện lịch sử nào nhằm hiệu triệu toàn thể nhân dân phát huy lòng yêu nước thi đua kháng chiến?",
    options: [
      "Tuyên ngôn Độc lập",
      "Lời kêu gọi Thi đua ái quốc",
      "Lời kêu gọi Toàn quốc kháng chiến",
      "Sắc lệnh Tổng động viên quốc dân"
    ],
    correct: 1,
    explain: "\"Thi đua là yêu nước, yêu nước thì phải thi đua, những người thi đua là những người yêu nước nhất!\""
  },
  {
    id: 59,
    question: "Hai quốc gia lớn đầu tiên trên thế giới chính thức công nhận và thiết lập quan hệ ngoại giao với Việt Nam Dân chủ Cộng hòa vào đầu năm 1950 là ai?",
    options: [
      "Ấn Độ và Miến Điện",
      "Trung Quốc và Liên Xô",
      "Triều Tiên và Cuba",
      "Pháp và Anh"
    ],
    correct: 1,
    explain: "Trung Quốc (18-1-1950) và Liên Xô (30-1-1950) công nhận giúp ta chấm dứt tình trạng cô lập ngoại giao."
  },
  {
    id: 60,
    question: "Ý nghĩa chiến lược quan trọng hàng đầu của thắng lợi Chiến dịch Biên giới Thu - Đông 1950 là gì?",
    options: [
      "Đánh bại hoàn toàn ý chí xâm lược của thực dân Pháp",
      "Buộc Mỹ phải chấm dứt viện trợ quân sự cho Pháp",
      "Kết thúc thời kỳ chiến đấu trong vòng vây, khai thông đường liên lạc quốc tế, đưa kháng chiến sang giai đoạn chủ động phản công",
      "Giải phóng hoàn toàn đồng bằng Bắc Bộ"
    ],
    correct: 2,
    explain: "Chiến dịch đầu tiên ta chủ động mở đã mở toang cánh cửa nối liền nước ta với phe Xã hội chủ nghĩa!"
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = QUESTIONS_BANK;
}
