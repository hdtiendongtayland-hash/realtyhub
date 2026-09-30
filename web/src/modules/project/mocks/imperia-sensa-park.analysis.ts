/**
 * Bai phan tich du an Imperia Sensa Park - tab "Phan tich".
 *
 * Noi dung lay tu tai lieu ban hang cua doi kinh doanh (anh trong
 * public/images/analysis/imperia-sensa-park, dat ten theo phan: p1 = key ban
 * hang, p2 = thi truong, p3 = so sanh, p4 = huong view). Gia la gia tham khao
 * Q3/2026, khong phai bang gia chinh thuc cua chu dau tu.
 */
import type { AnalysisImage, ProjectAnalysis } from '../models/project-detail.model';

export const IMPERIA_SENSA_PARK_SLUG = 'imperia-sensa-park';

const IMG = '/images/analysis/imperia-sensa-park';

const img = (file: string, caption: string, ratio?: string): AnalysisImage => ({
  src: `${IMG}/${file}`,
  caption,
  ratio,
});

export const IMPERIA_SENSA_PARK_ANALYSIS: ProjectAnalysis = {
  headline: 'Imperia Sensa Park - 6 đặc quyền khẳng định giá trị cao cấp tại khu Đông',
  summary:
    'Dự án căn hộ của MIK Group trên trục Võ Chí Công, bên sông Rạch Chiếc. Điểm khác biệt nằm ở những thứ người ở cảm nhận mỗi ngày: hành lang rộng, căn hộ thông thoáng – đối lưu, 100% căn có view mở và một mức giá đang đứng ở vùng thấp của nguồn cung mới khu Đông.',
  heroImage: img('p1-01-6-dac-quyen.jpg', '6 đặc quyền của Imperia Sensa Park', 'aspect-[1290/1706]'),
  highlights: [
    'Vị thế chiến lược, tâm điểm kết nối',
    'Không gian sống tối ưu, 100% view thoáng',
    'Đặc quyền tiện ích như resort 5 sao',
    'Thiết kế hành lang & thang máy ưu việt',
    'Chất lượng bàn giao cao cấp',
    'Bảo chứng bền vững từ MIK Group',
  ],

  // ── Phan 1: Key ban hang ────────────────────────────────────────────────
  selling: {
    corridor: {
      title: '4 điểm cộng hành lang Sensa Park',
      description:
        'Hành lang là không gian chung mà cư dân đi qua nhiều lần mỗi ngày, nhưng thường bị các dự án thu hẹp để tăng diện tích bán. Sensa Park làm ngược lại: hành lang thang rộng 2,65 m, hành lang căn hộ 1,6 m, kết hợp giải pháp thông thoáng – đối lưu – lấy sáng tự nhiên và thang tải riêng.',
      stats: [
        { value: '2,65 m', label: 'Hành lang thang máy' },
        { value: '1,6 m', label: 'Hành lang căn hộ' },
        { value: '6 thang', label: 'Mỗi tầng, có thang tải riêng' },
      ],
      points: [
        '6 thang máy mỗi tầng, giảm thời gian chờ giờ cao điểm.',
        'Thang tải riêng - vận chuyển đồ đạc, rác thải tách khỏi luồng đi của cư dân.',
        'Cửa căn hộ không đặt trực diện nhau, giữ riêng tư cho từng nhà.',
        'Hành lang thông thoáng, lấy gió và ánh sáng tự nhiên - không bí, không phụ thuộc hoàn toàn vào điều hòa.',
      ],
      images: [
        img('p1-02-hanh-lang-mat-bang.jpg', 'Mặt bằng tầng - hành lang thang máy 2,65 m và hành lang căn hộ 1,6 m'),
        img('p1-04-sanh-hanh-lang.jpg', 'Phối cảnh sảnh và hành lang thang máy'),
      ],
    },
    design: {
      title: 'Thiết kế căn hộ “Thông thoáng – Đối lưu”',
      description:
        'Mỗi căn được tổ chức để gió đi xuyên căn và ánh sáng vào được mọi phòng - thay vì chỉ phòng khách có mặt thoáng như nhiều dự án cùng phân khúc.',
      points: [
        '100% căn hộ đều có view thoáng ra bên ngoài.',
        'Tất cả các phòng đều có ánh sáng tự nhiên, hạn chế phòng ngủ/phòng chức năng bị bí.',
        'Tạo dòng đối lưu không khí xuyên căn, tăng khả năng thông gió tự nhiên.',
        'Ban công rộng, sâu 1,2 m - một khoảng đệm ngoài trời thực sự cho căn hộ.',
        'Logia giặt phơi riêng, tách hoạt động sinh hoạt khỏi ban công chính.',
        'Mặt bằng tối ưu, hạn chế diện tích giao thông và góc chết.',
      ],
      philosophy:
        'Triết lý này áp dụng xuyên suốt từ 1PN → 2PN → 3PN, không chỉ dành cho căn lớn: nhà vuông → tối ưu công năng → view thoáng → đối lưu, thông mát.',
      images: [
        img('p1-05-can-ho-doi-luu.jpg', 'Căn hộ thông thoáng, đối lưu - dòng gió xuyên căn'),
        img('p1-06-thiet-ke-1-2-3pn.jpg', 'Cùng một triết lý thiết kế cho 1PN, 2PN và 3PN'),
      ],
    },
    unitTypes: [
      {
        key: '1pn',
        label: '1PN',
        title: 'Căn 1 phòng ngủ',
        areaLabel: 'Khoảng 52 m² · DTXD 53 m² / DTSD 49 m²',
        layouts: [
          { code: 'A1', area: '52,2 m²' },
          { code: 'A2', area: '52,6 m²' },
        ],
        strengths: [
          'Có logia riêng - điều hiếm gặp ở căn 1PN cùng phân khúc.',
          'Layout tương đối vuông, chiều ngang căn 7,75 m giúp tối ưu diện tích.',
          'Phòng ngủ tách khỏi cửa chính và phòng khách, tăng tính riêng tư.',
          'Phòng khách và phòng ngủ đều có mặt thoáng.',
          'Layout có khả năng tùy biến: mở rộng phòng master hoặc làm khu chức năng linh hoạt.',
        ],
        images: [
          img('p1-07-1pn-phan-tich.jpg', 'Phân tích căn 1PN - có lô gia và chiều ngang 7,75 m'),
          img('p1-08-1pn-a1-a2.jpg', 'Layout A1 52,2 m² và A2 52,6 m²'),
        ],
      },
      {
        key: '2pn',
        label: '2PN',
        title: 'Căn 2 phòng ngủ',
        areaLabel: 'Tiêu chuẩn 70–70,4 m² · 2PN lớn 82,4–94,9 m²',
        layouts: [
          { code: 'B1', area: '70,4 m²' },
          { code: 'B2', area: '70,0 m²' },
          { code: 'B3', area: '70,1 m²' },
          { code: 'B4', area: '70,2 m²' },
          { code: 'C7', area: '82,4 m²', note: '2PN lớn' },
          { code: 'C1', area: '94,9 m²', note: '2PN lớn' },
        ],
        strengths: [
          'Mặt ngang rộng khoảng 10,5 m, tối ưu không gian và di chuyển.',
          '2 phòng ngủ đều bố trí về mặt ngoài, có cửa sổ và ánh sáng tự nhiên.',
          'Phòng khách ở trung tâm, kết nối ban công; bếp – bàn ăn liên thông.',
          'Không gian chung – riêng rõ ràng, tăng sự riêng tư cho các phòng ngủ.',
          '2PN lớn C7, C1: sinh hoạt chung rộng, dễ bố trí sofa lớn, bàn ăn 4–6 người - phù hợp gia đình ở lâu dài.',
        ],
        images: [
          img('p1-09-2pn-phan-tich.jpg', 'Phân tích căn 2PN - chiều ngang 10,5 m, DTXD 70 m² / DTSD 64 m²'),
          img('p1-12-2pn-b1-b2.jpg', '2PN tiêu chuẩn B1 70,4 m² và B2 70,0 m²'),
          img('p1-11-2pn-b3-b4.jpg', '2PN tiêu chuẩn B3 70,1 m² và B4 70,2 m²'),
          img('p1-10-2pn-lon-c1-c7.jpg', '2PN lớn C1 94,9 m² và C7 82,4 m²'),
        ],
      },
      {
        key: '3pn',
        label: '3PN',
        title: 'Căn 3 phòng ngủ',
        areaLabel: 'Tiêu chuẩn 92–104 m² · Đặc biệt 104,4–120,3 m²',
        layouts: [
          { code: 'D1', area: '92,0 m²' },
          { code: 'D4', area: '104,0 m²' },
          { code: 'D2', area: '104,4 m²', note: 'Căn góc panorama' },
          { code: 'E2', area: '120,3 m²', note: 'Khan hiếm' },
        ],
        strengths: [
          'Không gian sinh hoạt chung rộng, tối ưu cho gia đình nhiều thế hệ.',
          'Các phòng ngủ ưu tiên mặt thoáng, ánh sáng tự nhiên; phòng ngủ riêng biệt và kín đáo.',
          'Bếp và logia dịch vụ tách tương đối khỏi phòng khách, thuận tiện nấu nướng – giặt phơi, dễ thoát mùi.',
          'D2 nổi bật: căn góc, ban công và phòng khách panorama, nhiều mặt thoáng (DTXD 104,4 m² / DTSD 95,8 m²).',
          'E2: diện tích lớn 120,3 m², 3 phòng ngủ riêng tư, số lượng căn khan hiếm.',
        ],
        images: [
          img('p1-13-3pn-phan-tich.jpg', 'Phân tích căn 3PN D2 - ban công và phòng khách panorama'),
          img('p1-15-3pn-d1-d4.jpg', '3PN tiêu chuẩn D1 92,0 m² và D4 104,0 m²'),
          img('p1-14-3pn-d2-e2.jpg', '3PN đặc biệt D2 104,4 m² và E2 120,3 m²'),
        ],
      },
      {
        key: 'duplex',
        label: 'Duplex',
        title: 'Căn Duplex',
        areaLabel: 'F1 92,4 m² – G1 104 m² · Điển hình DTXD 191,3 m² / DTSD 173,9 m²',
        layouts: [
          { code: 'F1', area: '92,4 m²', note: 'Diện tích sàn mỗi tầng' },
          { code: 'G1', area: '104,0 m²', note: 'Diện tích sàn mỗi tầng' },
        ],
        strengths: [
          'Thiết kế 2 tầng, cảm giác như “nhà phố trên không”.',
          'Không gian rộng, mặt thoáng lớn, nhiều ánh sáng.',
          'Điểm nhấn thông tầng với trần cao 6,6 m.',
          'Ban công/sân hiên rộng, phù hợp gia đình đông thành viên.',
          'Số lượng căn khan hiếm - dòng sản phẩm khác biệt của dự án.',
        ],
        images: [
          img('p1-16-duplex-phan-tich.jpg', 'Phân tích căn Duplex - thông tầng, trần cao 6,6 m'),
          img('p1-17-duplex-f1-g1.jpg', 'Duplex F1 92,4 m² và G1 104,0 m²'),
        ],
      },
    ],
    partners: {
      title: 'Bảo chứng vàng từ tứ trụ danh tiếng',
      description:
        'Sự ra đời của một dự án chất lượng không thể thiếu những đơn vị kiến tạo đủ tầm. Imperia Sensa Park quy tụ 4 đối tác mang tầm vóc quốc tế:',
      items: [
        {
          name: 'Ricons',
          role: 'Tổng thầu xây dựng',
          description:
            'Hơn 2 thập kỷ kiến tạo công trình từ cao tầng, khách sạn, khu nghỉ dưỡng đến hạ tầng; đối tác chiến lược của dòng căn hộ Imperia.',
        },
        {
          name: 'CORE',
          role: 'Tư vấn giám sát',
          description:
            'Đơn vị giám sát khắt khe cho The Opus K, The Metropole Thủ Thiêm, The River Thủ Thiêm, The Rivus, Sheraton Hạ Long…',
        },
        {
          name: 'ONG & ONG',
          role: 'Thiết kế nội thất',
          description:
            'Đơn vị thiết kế hàng đầu Đông Nam Á, trụ sở tại Singapore; đứng sau KĐT Sala, Empire City, The Global City…',
        },
        {
          name: 'STUDIOMILOU',
          role: 'Kiến trúc & cảnh quan',
          description:
            'Studio kiến trúc có trụ sở tại Pháp; dấu ấn tại Lumi Hà Nội, Trung tâm Hội nghị Bình Định, Nhà hát Opera Thủ Thiêm…',
        },
      ],
      closing:
        'Sự kết hợp này là bảo chứng rõ ràng nhất cho chất lượng thi công, tính thẩm mỹ và chuẩn sống cao cấp của dự án.',
      image: img('p1-18-bao-chung-vang.jpg', 'Bảo chứng vàng từ những thương hiệu hàng đầu', 'aspect-[1836/2560]'),
    },
  },

  // ── Phan 2: Thi truong ──────────────────────────────────────────────────
  market: {
    title: 'Mặt bằng giá các dự án lân cận',
    description:
      'Gửi Anh/Chị mặt bằng giá các dự án căn hộ đang mở bán quanh khu vực để tham khảo và nắm thông tin thị trường. Imperia Sensa Park là dự án có quy mô gọn nhưng mức giá thấp nhất trong nhóm nguồn cung mới đang chào bán tại khu Đông.',
    points: [
      'Nằm trên trục Võ Chí Công (Vành đai 2), cạnh sông Rạch Chiếc.',
      'Kết nối vòng xoay Liên Phường, trục Đỗ Xuân Hợp - Liên Phường về The Global City.',
      'Gần Khu Công nghệ cao - nguồn cầu thuê ổn định từ chuyên gia, kỹ sư.',
      'Liên thông Metro số 1, cao tốc TP.HCM – Long Thành – Dầu Giây và tuyến đường sắt Thủ Thiêm – Long Thành (quy hoạch).',
    ],
    nearby: [
      { name: 'Imperia Sensa Park', scale: '5 ha', price: '88 tr/m²', isSubject: true },
      { name: 'The Global City', scale: '117,4 ha', price: '120–160 tr/m²' },
      { name: 'The Privé', scale: '6,7 ha', price: '120–150 tr/m²' },
      { name: 'Eaton Park', scale: '3,76 ha', price: '125–180 tr/m²' },
      { name: 'Palm City', scale: '30,6 ha', price: '168 tr/m²' },
    ],
    images: [
      img('p2-01-vi-tri-du-an.jpg', 'Vị trí dự án trên trục Võ Chí Công, bên sông Rạch Chiếc', 'aspect-[2560/1632]'),
      img('p2-02-du-an-dang-mo-ban.jpg', 'Các dự án căn hộ đang mở bán tại khu Đông TP.HCM', 'aspect-[1545/1018]'),
    ],
  },

  // ── Phan 3: So sanh ─────────────────────────────────────────────────────
  comparison: {
    title: 'Imperia Sensa Park 88 triệu/m²: phải đặt đúng hệ quy chiếu',
    lead: 'Nếu chỉ nhìn các dự án đã bàn giao quanh khu vực, mức giá của Imperia Sensa Park sẽ thấy khá cao. Nhưng đặt vào đúng hệ quy chiếu, câu chuyện lại khác.',
    paragraphs: [
      'Phần lớn dự án thứ cấp quanh khu vực đã bàn giao từ 5–10 năm trở lên. Imperia Sensa Park là thế hệ sản phẩm mới với thiết kế, concept, hệ tiện ích và tiêu chuẩn bàn giao mới, cộng thêm bài toán thanh toán được kéo giãn đến thời điểm nhận nhà.',
      'Vì vậy, nếu lấy những dự án thứ cấp tốt trong khu vực làm nền, mức chênh khoảng 15–20% cho một sản phẩm mới là khoảng chênh hợp lý có thể cân nhắc.',
      'Còn khi đổi hệ quy chiếu sang nguồn cung sơ cấp khu Đông: khoảng cách từ Imperia Sensa Park về khu Nam Rạch Chiếc chỉ tầm 3 km, nhưng biên độ giá tăng thêm 20–50%.',
    ],
    groups: [
      {
        title: 'Giá thứ cấp tham khảo Q3/2026',
        description: 'Các dự án đã bàn giao 5–10 năm quanh khu vực',
        rows: [
          { name: 'Flora Anh Đào', min: 52, max: 60 },
          { name: 'Flora Fuji', min: 54, max: 60 },
          { name: 'Sky 9', min: 52, max: 58 },
          { name: 'The Art', min: 56, max: 65 },
          { name: 'Hausneo', min: 58, max: 65 },
          { name: 'Safira', min: 62, max: 70 },
          { name: 'Jamila', min: 68, max: 80 },
        ],
      },
      {
        title: 'Nguồn cung sơ cấp khu Đông',
        description: 'Dự án mới đang chào bán',
        rows: [
          { name: 'Imperia Sensa Park', min: 88, max: 88, note: 'căn hoàn thiện', isSubject: true },
          { name: 'Gladia Heights', min: 83, max: 92 },
          { name: 'The Privé – Nam Rạch Chiếc', min: 118, max: 135 },
          { name: 'Palm River – Nam Rạch Chiếc', min: 168, max: 168, note: 'giá thông thủy' },
        ],
      },
    ],
    layers: [
      { label: 'Nhà cũ 5–10 năm', value: '52–80 tr/m²' },
      { label: 'Imperia Sensa Park', value: '~88 tr/m²', isSubject: true },
      { label: 'Nguồn cung mới Nam Rạch Chiếc', value: '118–168 tr/m²' },
    ],
    conclusion: [
      'Sensa Park đang đứng ở một vùng giá khá thú vị: cao hơn thế hệ căn hộ cũ một nhịp, nhưng vẫn nằm ở vùng thấp của mặt bằng nguồn cung mới.',
      'Vì vậy không nên chỉ hỏi “88 triệu/m² có đắt không?”, mà nên nhìn vào 3 lớp giá: nhà cũ 5–10 năm → Sensa Park → nguồn cung mới Nam Rạch Chiếc.',
      'Đến thời điểm bàn giao, nếu mặt bằng thứ cấp tiếp tục đi lên trong khi nguồn cung mới khu Đông duy trì vùng giá cao, khoảng chênh hiện tại có thể chính là phần đáng nghiên cứu nhất của bài toán.',
      'Tất nhiên, giá/m² chỉ là bước đầu. Cuối cùng vẫn phải quy về tổng giá căn, số vốn thực bỏ ra từng giai đoạn và giá trị nhận được khi bàn giao mới biết một sản phẩm thực sự đắt hay rẻ.',
    ],
    disclaimer:
      'Giá mang tính tham khảo Q3/2026; từng dự án có cách tính diện tích, VAT, phí bảo trì và tiêu chuẩn bàn giao khác nhau.',
    image: img('p3-01-ban-do-quy-hoach.jpg', 'Bản đồ quy hoạch khu vực quanh dự án', 'aspect-[1379/819]'),
  },

  // ── Phan 4: Huong view ──────────────────────────────────────────────────
  views: {
    title: 'Hướng view 2 tòa Sensa A & Sensa B',
    description:
      'Anh/Chị tham khảo nhanh hướng view theo mặt bằng tổng thể. Mỗi tòa có một mặt nhìn ra ngoài đô thị và một mặt nhìn vào hồ bơi, cảnh quan nội khu.',
    towers: [
      { tower: 'Tòa Sensa A', outside: 'Bắc – Đông Bắc', inside: 'Nam – Tây Nam' },
      { tower: 'Tòa Sensa B', wing: 'Cánh 1', outside: 'Đông Nam', inside: 'Tây Bắc' },
      { tower: 'Tòa Sensa B', wing: 'Cánh 2', outside: 'Tây Nam', inside: 'Đông Bắc' },
    ],
    directions: [
      {
        direction: 'Bắc – Đông Bắc',
        description: 'View sông Rạch Chiếc, khu biệt thự, Khu Công nghệ cao và cầu Phú Hữu - tầm nhìn thoáng, nhiều mảng xanh.',
        landmarks: ['Sông Rạch Chiếc', 'Khu biệt thự', 'Khu Công nghệ cao', 'Cầu Phú Hữu', 'Đường Võ Chí Công'],
        image: img('p4-03-view-bac-dong-bac.jpg', 'Hướng view Bắc – Đông Bắc'),
      },
      {
        direction: 'Tây Nam',
        description: 'View về The Global City, trục Liên Phường và các khu dân cư - không gian đô thị năng động.',
        landmarks: ['The Global City', 'Đường Liên Phường', 'Vòng xoay Liên Phường', 'KDC Hưng Phú', 'Wynnley Venue & Retreats'],
        image: img('p4-04-view-tay-nam.jpg', 'Hướng view Tây Nam'),
      },
      {
        direction: 'Tây Bắc',
        description: 'View Rạch Chiếc, khu biệt thự, Riviera Cove và Gia Hòa - nhiều mảng xanh, tầm nhìn về trung tâm.',
        landmarks: ['Rạch Chiếc', 'Riviera Cove', 'KDC Gia Hòa', 'Khu biệt thự', 'The Global City'],
        image: img('p4-05-view-tay-bac.jpg', 'Hướng view Tây Bắc'),
      },
      {
        direction: 'View nội khu',
        description: 'Trực diện hồ bơi, cảnh quan và hệ tiện ích nội khu - yên tĩnh, riêng tư, phù hợp gia đình có trẻ nhỏ.',
        landmarks: ['Hồ bơi', 'Cảnh quan nội khu', 'Tiện ích nội khu'],
        image: img('p4-02-view-noi-khu.jpg', 'View nội khu - hồ bơi và cảnh quan'),
      },
    ],
    note: 'Khi chọn căn, ngoài tầng và diện tích thì hướng view là yếu tố rất quan trọng để so sánh từng vị trí căn.',
    images: [img('p4-01-mat-bang-huong-view.jpg', 'Mặt bằng tổng thể 2 tòa Sensa A và Sensa B', 'aspect-[2560/1256]')],
  },
};
