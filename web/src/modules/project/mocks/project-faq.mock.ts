/**
 * Bo cau hoi thuong gap cho tab "Hoi dap" cua trang chi tiet du an.
 *
 * Ban demo: cau tra loi ghep tu du lieu cua chinh du an (chu dau tu, vi tri,
 * phan khu, tien ich, tien do, gia...) nen du an nao cung co bo hoi dap
 * dung ten. Khi co backend: GET /projects/:slug/faq.
 */
import { formatBillion, formatShortDate } from '@/common/utils/format';
import type { ProjectDetail } from '../models/project-detail.model';

export type FaqLink = { label: string; href: string };

export type FaqItem = {
  question: string;
  /** Moi phan tu la mot doan */
  answer: string[];
  links?: FaqLink[];
};

export type FaqCategory = {
  key: string;
  label: string;
  items: FaqItem[];
};

export const buildProjectFaq = (project: ProjectDetail): FaqCategory[] => {
  const { name, developerName, address } = project;
  const spec = (pattern: RegExp, fallback: string) =>
    project.specs.find((item) => pattern.test(item.label))?.value ?? fallback;

  const area = spec(/tổng diện tích|quy mô|diện tích/i, 'đang cập nhật');
  const density = spec(/mật độ/i, 'khoảng 20–30%, dành phần lớn quỹ đất cho cây xanh và tiện ích');
  const phases = project.phases.map((phase) => phase.name);
  const totalUnits = project.phases.reduce((sum, phase) => sum + phase.totalUnits, 0);
  const amenities = project.amenities.slice(0, 8).map((amenity) => amenity.name);
  const firstMilestone = project.progress[0];
  const lastMilestone = project.progress[project.progress.length - 1];
  const highRise = project.segment === 'cao-tang';
  const product = project.isMixed ? 'căn hộ và nhà thấp tầng' : highRise ? 'căn hộ' : 'nhà thấp tầng';
  const price = project.priceFrom > 0 ? formatBillion(project.priceFrom) : 'đang cập nhật';
  const slugSite = `https://realtyhub.com.vn/du-an/${project.slug}`;

  return [
    {
      key: 'thong-tin-du-an',
      label: 'Thông tin dự án',
      items: [
        {
          question: 'Chủ đầu tư dự án là ai? Là đơn vị như thế nào?',
          answer: [
            `Chủ đầu tư là ${developerName}.`,
            'Đơn vị có kinh nghiệm phát triển nhiều khu đô thị, khu căn hộ quy mô lớn; năng lực tài chính và uy tín bàn giao đã được thị trường kiểm chứng.',
          ],
        },
        {
          question: 'Vị trí dự án? Đặc điểm của vị trí có gì nổi bật',
          answer: [
            `Vị trí: ${address}.`,
            `Nổi bật: ${project.location.headline || 'kết nối thuận tiện tới các trục giao thông chính và trung tâm khu vực'}. ${project.location.intro}`.trim(),
          ],
        },
        {
          question: 'Ý tưởng thiết kế của dự án là gì?',
          answer: [
            `${name} được quy hoạch theo mô hình đô thị xanh, lấy cảnh quan và tiện ích làm trung tâm: các dãy ${product} bao quanh công viên, hồ cảnh quan và trục đi bộ nội khu.`,
          ],
        },
        {
          question: 'Mật độ xây dựng?',
          answer: [`Mật độ xây dựng: ${density}.`],
        },
        {
          question: 'Đơn vị tư vấn thiết kế là ai?',
          answer: [
            'Quy hoạch và kiến trúc do liên danh tư vấn thiết kế trong nước và quốc tế thực hiện, cảnh quan do đơn vị chuyên cảnh quan đảm nhận. Danh sách chi tiết có trong mục "Tài liệu".',
          ],
        },
        {
          question: 'Đơn vị thi công là ai?',
          answer: [
            'Tổng thầu thi công là các nhà thầu hạng A trong nước, có kinh nghiệm thi công nhiều dự án quy mô lớn, giám sát bởi đơn vị tư vấn giám sát độc lập.',
          ],
        },
        {
          question: 'Tổng diện tích dự án?',
          answer: [`Quy mô dự án: ${area}.`],
        },
        {
          question: 'Dự án có bao nhiêu phân khu?',
          answer: [
            phases.length > 0
              ? `Dự án gồm ${phases.length} phân khu: ${phases.join(', ')}.`
              : 'Thông tin phân khu đang được chủ đầu tư cập nhật.',
          ],
        },
        {
          question: 'Các loại hình sản phẩm của dự án?',
          answer: [
            `Sản phẩm chính: ${product}${project.isMixed ? '' : highRise ? ' (studio, 1PN, 2PN, 3PN, duplex)' : ' (liền kề, shophouse, biệt thự)'}, diện tích từ ${project.areaFrom} đến ${project.areaTo} m².`,
          ],
        },
        {
          question: 'Địa chỉ website CĐT, website và fanpage chính thức dự án?',
          answer: [],
          links: [
            { label: `Website CĐT: ${developerName}`, href: slugSite },
            {
              label: `Website & Fanpage dự án: Thông tin chính thức được đăng tải tại trang dự án ${name} trên RealtyHub.`,
              href: slugSite,
            },
          ],
        },
        {
          question: 'Tên đầy đủ của dự án? Ý nghĩa tên dự án',
          answer: [
            `Tên đầy đủ: ${name}${project.tagline ? ` – ${project.tagline}` : ''}.`,
            'Ý nghĩa: Tạo dựng một không gian sống trọn vẹn – nơi an cư, nghỉ dưỡng và kinh doanh trong cùng một cộng đồng văn minh.',
          ],
        },
        {
          question: 'Quy mô dự án: Diện tích xây dựng, Chiều cao, Số lượng căn hộ?',
          answer: [
            `Quy mô: ${area}.`,
            totalUnits > 0
              ? `Tổng số sản phẩm trên các phân khu đang mở bán: khoảng ${totalUnits.toLocaleString('vi-VN')} căn.`
              : 'Số lượng sản phẩm đang được chủ đầu tư cập nhật.',
          ],
        },
        {
          question: 'Định vị và điểm nhấn của dự án?',
          answer: [
            `${name} định vị là khu đô thị đáng sống cho gia đình trẻ và nhà đầu tư dài hạn. Điểm nhấn: hệ tiện ích nội khu đồng bộ, cảnh quan xanh và pháp lý rõ ràng.`,
          ],
        },
        {
          question: 'Tiện ích nội khu nổi bật?',
          answer: [
            amenities.length > 0
              ? `Tiện ích nội khu: ${amenities.join(', ')}…`
              : 'Công viên, hồ bơi, khu thể thao, vườn trẻ em, trường học và trung tâm thương mại nội khu.',
          ],
        },
        {
          question: 'Tiện ích ngoại khu xung quanh dự án?',
          answer: [
            project.location.highlights.length > 0
              ? project.location.highlights
                  .slice(0, 5)
                  .map((item) => item.title)
                  .join('; ') + '.'
              : 'Gần trường học, bệnh viện, siêu thị và các trục giao thông chính của khu vực.',
          ],
        },
        {
          question: 'Thời gian khởi công và dự kiến bàn giao?',
          answer: [
            firstMilestone
              ? `Khởi công: ${formatShortDate(firstMilestone.date)}. Mốc gần nhất: ${lastMilestone.label} (${formatShortDate(lastMilestone.date)}). Xem chi tiết ở tab "Tiến độ".`
              : 'Tiến độ chi tiết được cập nhật tại tab "Tiến độ".',
          ],
        },
        {
          question: 'Tiêu chuẩn bàn giao?',
          answer: [
            highRise
              ? 'Căn hộ bàn giao hoàn thiện cơ bản: sàn gỗ/gạch, thiết bị vệ sinh, tủ bếp, điều hòa (theo từng phân khu).'
              : 'Nhà thấp tầng bàn giao thô hoàn thiện mặt ngoài; một số dòng sản phẩm có gói hoàn thiện nội thất tùy chọn.',
          ],
        },
        {
          question: 'Dự án có chỗ đỗ xe cho cư dân không?',
          answer: [
            highRise
              ? 'Có. Mỗi tòa có hầm đỗ xe ô tô và xe máy, cư dân đăng ký vé tháng với ban quản lý.'
              : 'Có. Mỗi căn có chỗ đỗ xe riêng trong nhà, ngoài ra có bãi đỗ xe tập trung cho khách.',
          ],
        },
      ],
    },
    {
      key: 'phap-ly',
      label: 'Thông tin pháp lý',
      items: [
        {
          question: 'Pháp lý dự án đã hoàn thiện chưa?',
          answer: [
            'Dự án đã có quyết định chủ trương đầu tư, quy hoạch chi tiết 1/500, giấy phép xây dựng và đủ điều kiện mở bán theo quy định. Bản sao các văn bản có trong tab "Tài liệu".',
          ],
        },
        {
          question: 'Thời hạn sở hữu sản phẩm?',
          answer: [
            highRise
              ? 'Căn hộ: sở hữu lâu dài đối với người Việt Nam.'
              : 'Nhà thấp tầng: sở hữu lâu dài; shophouse thương mại theo thời hạn của dự án.',
          ],
        },
        {
          question: 'Người nước ngoài có được mua không?',
          answer: [
            'Có, theo Luật Nhà ở: người nước ngoài được sở hữu tối đa 30% số căn hộ mỗi tòa, thời hạn 50 năm và được gia hạn.',
          ],
        },
        {
          question: 'Khi nào khách hàng nhận sổ hồng?',
          answer: [
            'Chủ đầu tư làm thủ tục cấp Giấy chứng nhận sau khi bàn giao và khách hàng thanh toán đủ theo hợp đồng, thông thường trong vòng 6–12 tháng.',
          ],
        },
      ],
    },
    {
      key: 'quan-ly',
      label: 'Thông tin quản lý vận hành',
      items: [
        {
          question: 'Đơn vị quản lý vận hành là ai?',
          answer: [`Dự án do đơn vị quản lý vận hành thuộc hệ sinh thái ${developerName} hoặc đối tác chuyên nghiệp được chỉ định quản lý.`],
        },
        {
          question: 'Phí dịch vụ quản lý là bao nhiêu?',
          answer: [
            highRise
              ? 'Phí quản lý dự kiến khoảng 12.000–18.000 đ/m²/tháng tùy tòa.'
              : 'Phí quản lý dự kiến khoảng 6.000–10.000 đ/m² đất/tháng.',
          ],
        },
        {
          question: 'An ninh trong dự án được đảm bảo như thế nào?',
          answer: ['Bảo vệ 24/7, camera giám sát toàn khu, kiểm soát ra vào bằng thẻ từ, hệ thống PCCC đạt chuẩn.'],
        },
      ],
    },
    {
      key: 'giao-dich',
      label: 'Thông tin giao dịch',
      items: [
        { question: 'Giá bán dự án từ bao nhiêu?', answer: [`Giá tham khảo từ ${price}. Bảng giá chi tiết từng căn xem ở tab "Quỹ căn".`] },
        {
          question: 'Phương thức thanh toán thế nào?',
          answer: ['Thanh toán theo tiến độ (chia nhiều đợt) hoặc thanh toán sớm để nhận chiết khấu. Chi tiết tại tab "Chính sách bán hàng".'],
        },
        {
          question: 'Có hỗ trợ vay ngân hàng không?',
          answer: ['Có. Ngân hàng đối tác cho vay tới 70% giá trị căn, hỗ trợ lãi suất 0% trong thời gian ân hạn theo chính sách từng đợt.'],
        },
        { question: 'Chính sách chiết khấu hiện tại?', answer: ['Chiết khấu thanh toán sớm, chiết khấu khách hàng thân thiết… cập nhật theo từng tháng ở tab "Chính sách bán hàng".'] },
        { question: 'Đặt cọc bao nhiêu để giữ căn?', answer: ['Đặt cọc giữ chỗ từ 50–100 triệu/căn tùy dòng sản phẩm, hoàn lại nếu không ký thỏa thuận.'] },
        { question: 'Thủ tục ký hợp đồng mua bán gồm những gì?', answer: ['CCCD/hộ chiếu, giấy đăng ký kết hôn (nếu có), phiếu đặt cọc. Ký thỏa thuận đặt cọc → hợp đồng mua bán trong khoảng 30 ngày.'] },
        { question: 'Có được chuyển nhượng hợp đồng trước khi nhận nhà?', answer: ['Được, thông qua văn bản chuyển nhượng hợp đồng có xác nhận của chủ đầu tư.'] },
        { question: 'Phí bảo trì là bao nhiêu?', answer: ['Phí bảo trì 2% giá trị căn (trước VAT), nộp trước khi nhận bàn giao.'] },
        { question: 'Bao lâu sau khi thanh toán thì nhận nhà?', answer: ['Nhận bàn giao theo tiến độ trong hợp đồng sau khi thanh toán tới đợt bàn giao (thường 95%).'] },
      ],
    },
    {
      key: 'shop-thuong-mai',
      label: 'Shop thương mại',
      items: [
        { question: 'Dự án có những loại shop nào?', answer: ['Shop khối đế chung cư, shophouse mặt đường và kiot trong trung tâm thương mại nội khu.'] },
        { question: 'Diện tích shop khoảng bao nhiêu?', answer: ['Shop khối đế từ 40–200 m², shophouse từ 75–150 m² đất, xây 4–5 tầng.'] },
        { question: 'Giá shop thương mại từ bao nhiêu?', answer: ['Giá shop phụ thuộc vị trí, mặt tiền và tầng; liên hệ chuyên viên tư vấn để nhận bảng giá mới nhất.'] },
        { question: 'Thời hạn sở hữu shop?', answer: ['Shop khối đế sở hữu theo thời hạn dự án; shophouse sở hữu lâu dài phần đất ở (theo từng sản phẩm).'] },
        { question: 'Có được kinh doanh ngay khi nhận bàn giao?', answer: ['Được. Shop bàn giao thô, khách hàng hoàn thiện và kinh doanh ngay theo quy định của ban quản lý.'] },
        { question: 'Ngành hàng nào phù hợp kinh doanh?', answer: ['F&B, siêu thị mini, nhà thuốc, giáo dục, spa – làm đẹp, ngân hàng, văn phòng giao dịch…'] },
        { question: 'Lượng khách tiềm năng ra sao?', answer: [`Tệp khách chính là cư dân ${name} và các khu dân cư lân cận, cộng thêm khách vãng lai trên các trục đường chính.`] },
        { question: 'Lợi suất cho thuê dự kiến?', answer: ['Lợi suất cho thuê tham khảo khoảng 5–8%/năm tùy vị trí và ngành hàng.'] },
        { question: 'Có hỗ trợ lãi suất khi mua shop?', answer: ['Có, theo chính sách từng đợt: hỗ trợ lãi suất 0% trong 12–24 tháng hoặc ân hạn nợ gốc.'] },
        { question: 'Chiều cao tầng 1 của shop?', answer: ['Tầng 1 thông thủy khoảng 4,5–5,5 m, phù hợp làm tầng lửng.'] },
        { question: 'Shop có chỗ đỗ xe cho khách không?', answer: ['Có bãi đỗ xe tập trung và vỉa hè rộng phía trước các dãy shop.'] },
        { question: 'Có được cải tạo, thay đổi mặt tiền shop?', answer: ['Được cải tạo nội thất; thay đổi mặt tiền, biển hiệu phải theo bộ quy chuẩn thiết kế của ban quản lý.'] },
        { question: 'Phí quản lý shop là bao nhiêu?', answer: ['Phí quản lý shop thường cao hơn căn hộ, khoảng 20.000–30.000 đ/m²/tháng.'] },
        { question: 'Có chính sách cam kết thuê không?', answer: ['Một số đợt mở bán có chính sách cam kết thuê/chia sẻ lợi nhuận; xem chi tiết tại tab "Chính sách bán hàng".'] },
      ],
    },
  ];
};
