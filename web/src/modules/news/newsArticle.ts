/**
 * Du lieu + noi dung cho trang chi tiet tin tuc /tin-tuc/[slug].
 *
 * Model hien chi co tieu de + doan mo dau (chua co than bai). Than bai duoi
 * day la noi dung MAU dung theo chuyen muc, ghep voi doan mo dau that cua bai
 * - khi co backend `blog`, thay `buildArticleBody` bang noi dung bai tra ve.
 */
import { MOCK_NEWS } from './mocks/news.mock';
import type { NewsArticle, NewsCategory } from './models/news.model';

export type ArticleSection = {
  id: string;
  heading: string;
  paragraphs: string[];
};

export type ArticlePhoto = { src: string; caption: string };

export type ArticleBody = {
  sections: ArticleSection[];
  /** Anh lon chen sau muc 1 */
  feature: ArticlePhoto;
  /** Cap 2 anh canh nhau chen sau muc 3 */
  gallery: [ArticlePhoto, ArticlePhoto];
  /** Trich dan noi bat chen giua bai */
  quote: string;
  /** Diem chinh cuoi bai */
  takeaways: string[];
  tags: string[];
};

/** Mau nhan / nut theo chuyen muc - cung bang mau trang danh sach /tin-tuc */
export const NEWS_CATEGORY_TONE: Record<NewsCategory, { chip: string; button: string; soft: string }> = {
  'tin-tuc-du-an': {
    chip: 'border-sky-200 text-sky-600',
    button: 'from-sky-500 to-brand-600',
    soft: 'bg-sky-50 text-sky-700',
  },
  'phan-tich-nhan-dinh': {
    chip: 'border-violet-200 text-violet-600',
    button: 'from-indigo-500 to-violet-600',
    soft: 'bg-violet-50 text-violet-700',
  },
};

/** Thoi gian doc uoc tinh - cung cach tinh voi trang danh sach */
export const newsReadingTime = (article: NewsArticle): number => {
  const len = article.excerpt.length + article.title.length;
  if (len < 120) return 3;
  if (len < 200) return 5;
  return 7;
};

const byDateDesc = (a: NewsArticle, b: NewsArticle) =>
  new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();

export const getNewsBySlug = (slug: string) => MOCK_NEWS.find((article) => article.slug === slug);

/** Bai moi hon / cu hon theo ngay dang (dieu huong cuoi bai) */
export const getAdjacentNews = (slug: string) => {
  const sorted = [...MOCK_NEWS].sort(byDateDesc);
  const index = sorted.findIndex((article) => article.slug === slug);
  return {
    newer: index > 0 ? sorted[index - 1] : undefined,
    older: index >= 0 && index < sorted.length - 1 ? sorted[index + 1] : undefined,
  };
};

/** Tin cung chuyen muc (khong gom bai dang doc), moi nhat truoc */
export const getRelatedNews = (article: NewsArticle, limit = 3) =>
  MOCK_NEWS.filter((item) => item.category === article.category && item.slug !== article.slug)
    .sort(byDateDesc)
    .slice(0, limit);

/** Tin moi nhat (cot ben) */
export const getLatestNews = (exceptSlug: string, limit = 4) =>
  [...MOCK_NEWS]
    .filter((item) => item.slug !== exceptSlug)
    .sort(byDateDesc)
    .slice(0, limit);

const VOP = '/images/projects/vinhomes-ocean-park-gia-lam';

/** Kho anh minh hoa giua bai theo chuyen muc (anh du an / anh toan canh do thi) */
const PHOTOS: Record<NewsCategory, ArticlePhoto[]> = {
  'tin-tuc-du-an': [
    { src: `${VOP}/hero-3-phoi-canh-tong-the.jpg`, caption: 'Phối cảnh tổng thể khu đô thị với hệ thống cảnh quan và tiện ích nội khu.' },
    { src: `${VOP}/sp-cao-tang-ven-kenh.jpg`, caption: 'Khu căn hộ cao tầng ven kênh, kết nối trực tiếp với trục giao thông chính.' },
    { src: `${VOP}/hero-5-phan-khu-thap-tang.jpg`, caption: 'Phân khu thấp tầng với mật độ xây dựng thấp và nhiều mảng xanh.' },
    { src: `${VOP}/tien-ich-vincom-mega-mall.jpg`, caption: 'Trung tâm thương mại phục vụ nhu cầu mua sắm, giải trí của cư dân.' },
    { src: `${VOP}/hero-2-bien-ho-nuoc-man.jpg`, caption: 'Biển hồ nước mặn - điểm nhấn cảnh quan của dự án.' },
    { src: `${VOP}/tien-ich-vinschool.jpg`, caption: 'Hệ thống trường học liên cấp ngay trong khu đô thị.' },
    { src: `${VOP}/hero-1-hoang-hon-ho-trung-tam.jpg`, caption: 'Hồ trung tâm lúc hoàng hôn nhìn từ khu căn hộ.' },
  ],
  'phan-tich-nhan-dinh': [
    { src: '/images/about/landmark-81-river.jpg', caption: 'Quỹ đất ven sông ngày càng khan hiếm tại các đô thị lớn.' },
    { src: '/images/dao-tao/hero.jpg', caption: 'Khu trung tâm tài chính - nơi tập trung nhu cầu thuê và mua ở thực.' },
    { src: '/images/about/landmark-81-hd.jpg', caption: 'Các dự án cao tầng mới định hình lại đường chân trời thành phố.' },
    { src: '/images/about/hero.jpg', caption: 'Hạ tầng kết nối là động lực chính nâng giá trị bất động sản khu vực.' },
    { src: `${VOP}/hero-6-hoang-hon-toa-kinh.jpg`, caption: 'Phân khúc căn hộ cao cấp tiếp tục thu hút người mua ở thực.' },
    { src: `${VOP}/mat-bang-tien-ich-tong-the.jpg`, caption: 'Quy hoạch tiện ích đồng bộ là tiêu chí được người mua ưu tiên.' },
  ],
};

/** Chon 3 anh khac nhau cho moi bai, co dinh theo slug (bai nao cung mot bo) */
const pickPhotos = (article: NewsArticle): [ArticlePhoto, ArticlePhoto, ArticlePhoto] => {
  const pool = PHOTOS[article.category];
  let seed = 0;
  for (const char of article.slug) seed = (seed * 31 + char.charCodeAt(0)) >>> 0;
  const at = (offset: number) => pool[(seed + offset) % pool.length];
  return [at(0), at(1), at(2)];
};

const PROJECT_BODY: Omit<ArticleBody, 'tags' | 'feature' | 'gallery'> = {
  sections: [
    {
      id: 'thong-tin-chinh',
      heading: 'Thông tin chính',
      paragraphs: [
        'Theo thông tin từ chủ đầu tư, cột mốc lần này được triển khai đúng kế hoạch đã công bố, với sự tham gia của các đơn vị tư vấn, thi công và phân phối chính thức.',
        'Toàn bộ hồ sơ pháp lý liên quan đã được cập nhật trên hệ thống RealtyHub, môi giới có thể tra cứu và gửi cho khách hàng ngay trong trang dự án.',
      ],
    },
    {
      id: 'tien-do',
      heading: 'Tiến độ và các cột mốc tiếp theo',
      paragraphs: [
        'Chủ đầu tư cho biết các hạng mục hạ tầng nội khu và tiện ích đi kèm sẽ được hoàn thiện song song, bảo đảm khi bàn giao cư dân có thể sử dụng ngay.',
        'Lịch mở bán, bàn giao và các chính sách đi kèm sẽ được thông báo chi tiết trên kênh chính thức trong thời gian tới.',
      ],
    },
    {
      id: 'y-nghia',
      heading: 'Ý nghĩa với khách hàng và nhà đầu tư',
      paragraphs: [
        'Tiến độ minh bạch giúp người mua yên tâm về khả năng bàn giao đúng hạn, đồng thời là cơ sở để nhà đầu tư đánh giá tiềm năng tăng giá theo từng giai đoạn.',
        'Với khách hàng ở thực, đây là thời điểm phù hợp để tìm hiểu kỹ mặt bằng, chọn căn và tận dụng các chính sách thanh toán ưu đãi.',
      ],
    },
    {
      id: 'khuyen-nghi',
      heading: 'RealtyHub khuyến nghị',
      paragraphs: [
        'Khách hàng nên đối chiếu thông tin quỹ căn, giá bán và tiến độ thanh toán trực tiếp trên trang dự án, hoặc liên hệ chuyên viên để được tư vấn theo nhu cầu cụ thể.',
      ],
    },
  ],
  quote: 'Tiến độ đúng cam kết là yếu tố quan trọng nhất để xây dựng niềm tin với khách hàng.',
  takeaways: [
    'Cột mốc được triển khai đúng kế hoạch đã công bố',
    'Hồ sơ pháp lý và quỹ căn cập nhật trên RealtyHub',
    'Chính sách bán hàng chi tiết sẽ được thông báo trên kênh chính thức',
  ],
};

const ANALYSIS_BODY: Omit<ArticleBody, 'tags' | 'feature' | 'gallery'> = {
  sections: [
    {
      id: 'boi-canh',
      heading: 'Bối cảnh thị trường',
      paragraphs: [
        'Thị trường bất động sản đang bước vào giai đoạn phục hồi có chọn lọc: nguồn cung mới tập trung ở các dự án có pháp lý rõ ràng và hạ tầng kết nối tốt.',
        'Người mua ngày càng thận trọng, ưu tiên sản phẩm phục vụ nhu cầu ở thực và có khả năng khai thác dòng tiền ổn định.',
      ],
    },
    {
      id: 'phan-tich',
      heading: 'Phân tích chi tiết',
      paragraphs: [
        'Số liệu từ các sàn giao dịch cho thấy lượng quan tâm tăng đều qua từng quý, đặc biệt ở phân khúc có giá phù hợp với thu nhập của người mua lần đầu.',
        'Những dự án sở hữu tiện ích nội khu hoàn chỉnh và tiến độ minh bạch tiếp tục dẫn dắt thanh khoản, trong khi sản phẩm thiếu kết nối hạ tầng chững lại.',
      ],
    },
    {
      id: 'rui-ro',
      heading: 'Rủi ro cần lưu ý',
      paragraphs: [
        'Biến động lãi suất và chính sách tín dụng vẫn là yếu tố ảnh hưởng lớn tới sức mua. Nhà đầu tư nên tính toán kỹ khả năng chi trả trong kịch bản lãi suất tăng.',
        'Cần kiểm tra pháp lý, tiến độ và năng lực chủ đầu tư trước khi xuống tiền, tránh chạy theo kỳ vọng tăng giá ngắn hạn.',
      ],
    },
    {
      id: 'goc-nhin',
      heading: 'Góc nhìn của RealtyHub',
      paragraphs: [
        'Giai đoạn tới phù hợp với chiến lược đầu tư trung và dài hạn, ưu tiên sản phẩm có giá trị sử dụng thực và vị trí gắn với các dự án hạ tầng trọng điểm.',
      ],
    },
  ],
  quote: 'Giá trị bền vững đến từ chất lượng sống và hạ tầng kết nối, không chỉ từ kỳ vọng tăng giá.',
  takeaways: [
    'Thị trường phục hồi có chọn lọc, ưu tiên pháp lý rõ ràng',
    'Sản phẩm ở thực và có dòng tiền dẫn dắt thanh khoản',
    'Nên đầu tư trung - dài hạn, tính kỹ kịch bản lãi suất',
  ],
};

export const buildArticleBody = (article: NewsArticle): ArticleBody => {
  const base = article.category === 'tin-tuc-du-an' ? PROJECT_BODY : ANALYSIS_BODY;
  const tags =
    article.category === 'tin-tuc-du-an'
      ? ['Tin dự án', 'Tiến độ', 'Mở bán']
      : ['Thị trường', 'Phân tích', 'Đầu tư'];
  const [feature, first, second] = pickPhotos(article);
  return { ...base, feature, gallery: [first, second], tags };
};
