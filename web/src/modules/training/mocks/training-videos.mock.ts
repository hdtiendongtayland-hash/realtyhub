/**
 * Thu vien video bai giang - trang /dao-tao.
 *
 * Ban demo: anh bia lay tu kho anh du an, moi video phat cung mot video gioi
 * thieu YouTube. Khi co backend: GET /training/videos.
 */
export type TrainingVideoTopic = 'nhap-mon' | 'ban-hang' | 'phap-ly' | 'marketing' | 'quan-ly' | 'livestream';

export const TRAINING_VIDEO_TOPICS: { key: TrainingVideoTopic; label: string }[] = [
  { key: 'nhap-mon', label: 'Nhập môn' },
  { key: 'ban-hang', label: 'Bán hàng' },
  { key: 'phap-ly', label: 'Pháp lý' },
  { key: 'marketing', label: 'Marketing' },
  { key: 'quan-ly', label: 'Quản lý đội nhóm' },
  { key: 'livestream', label: 'Livestream' },
];

export type TrainingVideo = {
  publicId: string;
  title: string;
  topic: TrainingVideoTopic;
  instructor: string;
  instructorAvatar: string;
  thumbnailUrl: string;
  /** "mm:ss" hoac "h:mm:ss" */
  duration: string;
  views: number;
  /** "3 ngay truoc" */
  publishedAgo: string;
  /** ID video YouTube de nhung */
  youtubeId: string;
  /** Tien do da xem (0-100) - co thi hien o muc "Tiep tuc hoc" */
  progress?: number;
  isNew?: boolean;
};

const IMG = '/images/projects/vinhomes-ocean-park-gia-lam';
const YOUTUBE_ID = '_z_RRlyhS74';

const INSTRUCTORS = {
  khoa: { instructor: 'Nguyễn Minh Khoa', instructorAvatar: '/images/dao-tao/avatar-1.jpg' },
  hai: { instructor: 'Trần Thanh Hải', instructorAvatar: '/images/dao-tao/avatar-2.jpg' },
  thinh: { instructor: 'LS. Phạm Đức Thịnh', instructorAvatar: '/images/dao-tao/avatar-3.jpg' },
  bao: { instructor: 'Lê Quốc Bảo', instructorAvatar: '/images/dao-tao/avatar-4.jpg' },
};

export const TRAINING_VIDEOS: TrainingVideo[] = [
  { publicId: 'tv-01', title: 'Môi giới BĐS là gì? 5 tố chất để trụ lại năm đầu tiên', topic: 'nhap-mon', ...INSTRUCTORS.khoa, thumbnailUrl: `${IMG}/hero-1-hoang-hon-ho-trung-tam.jpg`, duration: '18:42', views: 128_000, publishedAgo: '2 tuần trước', youtubeId: YOUTUBE_ID, progress: 65 },
  { publicId: 'tv-02', title: 'Đọc bảng giá & chính sách bán hàng dự án trong 10 phút', topic: 'ban-hang', ...INSTRUCTORS.hai, thumbnailUrl: `${IMG}/mat-bang-tong-the-du-an.jpg`, duration: '10:05', views: 86_400, publishedAgo: '5 ngày trước', youtubeId: YOUTUBE_ID, progress: 30, isNew: true },
  { publicId: 'tv-03', title: 'Kiểm tra pháp lý căn hộ trước khi đặt cọc - checklist 12 bước', topic: 'phap-ly', ...INSTRUCTORS.thinh, thumbnailUrl: `${IMG}/tien-ich-vinuni-chinh-dien.jpg`, duration: '24:16', views: 54_300, publishedAgo: '1 tháng trước', youtubeId: YOUTUBE_ID, progress: 90 },
  { publicId: 'tv-04', title: 'Chạy quảng cáo Facebook cho dự án: từ 0 đến 100 leads/tháng', topic: 'marketing', ...INSTRUCTORS.bao, thumbnailUrl: `${IMG}/tien-ich-vincom-mega-mall-dem.jpg`, duration: '32:58', views: 210_000, publishedAgo: '3 tuần trước', youtubeId: YOUTUBE_ID, isNew: true },
  { publicId: 'tv-05', title: 'Kịch bản gọi điện lần đầu: mở lời, khai thác nhu cầu, hẹn gặp', topic: 'ban-hang', ...INSTRUCTORS.hai, thumbnailUrl: `${IMG}/hero-6-hoang-hon-toa-kinh.jpg`, duration: '15:21', views: 97_800, publishedAgo: '1 tuần trước', youtubeId: YOUTUBE_ID },
  { publicId: 'tv-06', title: 'Xử lý 7 lời từ chối phổ biến nhất của khách mua căn hộ', topic: 'ban-hang', ...INSTRUCTORS.hai, thumbnailUrl: `${IMG}/sp-cao-tang-ven-kenh.jpg`, duration: '21:47', views: 143_000, publishedAgo: '2 tháng trước', youtubeId: YOUTUBE_ID },
  { publicId: 'tv-07', title: 'Hợp đồng mua bán & thỏa thuận đặt cọc: điều khoản phải đọc kỹ', topic: 'phap-ly', ...INSTRUCTORS.thinh, thumbnailUrl: `${IMG}/mat-bang-phan-lo-tong-the.jpg`, duration: '28:30', views: 41_200, publishedAgo: '3 tuần trước', youtubeId: YOUTUBE_ID },
  { publicId: 'tv-08', title: 'Xây Zalo OA & TikTok cá nhân cho môi giới - lịch đăng 30 ngày', topic: 'marketing', ...INSTRUCTORS.bao, thumbnailUrl: `${IMG}/hero-2-bien-ho-nuoc-man.jpg`, duration: '19:12', views: 76_500, publishedAgo: '6 ngày trước', youtubeId: YOUTUBE_ID, isNew: true },
  { publicId: 'tv-09', title: 'Quản trị pipeline trên CRM: không bỏ sót khách nào', topic: 'quan-ly', ...INSTRUCTORS.khoa, thumbnailUrl: `${IMG}/tien-ich-vinschool.jpg`, duration: '26:03', views: 38_900, publishedAgo: '1 tháng trước', youtubeId: YOUTUBE_ID },
  { publicId: 'tv-10', title: 'Tuyển & giữ chân team môi giới 5-15 người', topic: 'quan-ly', ...INSTRUCTORS.khoa, thumbnailUrl: `${IMG}/hero-4-cong-chao-bieu-tuong.jpg`, duration: '41:20', views: 22_700, publishedAgo: '2 tháng trước', youtubeId: YOUTUBE_ID },
  { publicId: 'tv-11', title: 'Livestream: Phân tích thị trường BĐS khu Đông TP.HCM quý III', topic: 'livestream', ...INSTRUCTORS.khoa, thumbnailUrl: `${IMG}/hero-3-phoi-canh-tong-the.jpg`, duration: '1:32:05', views: 18_400, publishedAgo: 'Phát trực tiếp 4 ngày trước', youtubeId: YOUTUBE_ID },
  { publicId: 'tv-12', title: 'Livestream hỏi đáp pháp lý: sổ hồng, công chứng, sang tên', topic: 'livestream', ...INSTRUCTORS.thinh, thumbnailUrl: `${IMG}/tien-ich-dai-hoc-vinuni.jpg`, duration: '58:44', views: 12_900, publishedAgo: 'Phát trực tiếp 1 tuần trước', youtubeId: YOUTUBE_ID },
];

/** Danh sach phat theo lo trinh */
export const TRAINING_PLAYLISTS = [
  { publicId: 'pl-1', title: 'Lộ trình 30 ngày cho môi giới mới', videoIds: ['tv-01', 'tv-02', 'tv-05', 'tv-06', 'tv-03'], thumbnailUrl: `${IMG}/hero-5-phan-khu-thap-tang.jpg` },
  { publicId: 'pl-2', title: 'Pháp lý BĐS ứng dụng', videoIds: ['tv-03', 'tv-07', 'tv-12'], thumbnailUrl: `${IMG}/mat-bang-khu-cao-tang.jpg` },
  { publicId: 'pl-3', title: 'Marketing số cho môi giới', videoIds: ['tv-04', 'tv-08'], thumbnailUrl: `${IMG}/tien-ich-vincom-mega-mall.jpg` },
  { publicId: 'pl-4', title: 'Trưởng nhóm & quản lý', videoIds: ['tv-09', 'tv-10', 'tv-11'], thumbnailUrl: `${IMG}/ban-do-ket-noi-giao-thong.jpg` },
];
