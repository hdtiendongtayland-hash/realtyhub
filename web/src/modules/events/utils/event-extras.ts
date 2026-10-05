/**
 * Du lieu phu cua su kien - ban demo, sinh on dinh tu chinh su kien (khong
 * random moi lan render): trang thai theo NOW, so check-in, thu vien anh,
 * danh gia, ma ve QR.
 *
 * Khi co backend: thay bang cac truong that tu GET /events/:slug.
 */
import type { EventItem, EventStatus } from '../models/event.model';

/** "Hom nay" cua ban demo - khop voi mock (2026-08-09 15:00) */
export const EVENT_NOW = new Date('2026-08-09T15:00:00.000+07:00');

export const computeEventStatus = (event: EventItem): EventStatus => {
  const start = new Date(event.startAt).getTime();
  const end = event.endAt ? new Date(event.endAt).getTime() : start + 2 * 60 * 60 * 1000;
  const nowMs = EVENT_NOW.getTime();

  if (nowMs > end) return 'past';
  if (nowMs >= start) return 'ongoing';
  if (event.capacity && event.registered >= event.capacity) return 'full';
  return 'upcoming';
};

/** So nguyen on dinh tu chuoi - de cung su kien luon ra cung so lieu */
const hashOf = (value: string) =>
  [...value].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7);

/** So nguoi da check-in: chi co khi su kien dang / da dien ra */
export const getCheckedIn = (event: EventItem): number => {
  const status = computeEventStatus(event);
  if (status === 'upcoming' || status === 'full') return 0;
  const ratio = 0.45 + (hashOf(event.slug) % 30) / 100; // 45% - 74%
  return Math.round(event.registered * ratio);
};

const GALLERY_POOL = [
  '/images/projects/vinhomes-ocean-park-gia-lam/tien-ich-vincom-mega-mall-dem.jpg',
  '/images/projects/vinhomes-ocean-park-gia-lam/tien-ich-dai-hoc-vinuni.jpg',
  '/images/projects/vinhomes-ocean-park-gia-lam/hero-1-hoang-hon-ho-trung-tam.jpg',
  '/images/projects/vinhomes-ocean-park-gia-lam/hero-3-phoi-canh-tong-the.jpg',
  '/images/projects/vinhomes-ocean-park-gia-lam/tien-ich-vincom-mega-mall.jpg',
  '/images/projects/vinhomes-ocean-park-gia-lam/hero-6-hoang-hon-toa-kinh.jpg',
  '/images/projects/vinhomes-ocean-park-gia-lam/tien-ich-vinuni-chinh-dien.jpg',
  '/images/projects/vinhomes-ocean-park-gia-lam/hero-2-bien-ho-nuoc-man.jpg',
  '/images/heroes/su-kien.jpg',
];

/** Thu vien anh: anh bia + 5 anh khac lay vong tu kho anh */
export const getEventGallery = (event: EventItem): string[] => {
  const start = hashOf(event.slug) % GALLERY_POOL.length;
  const picked = Array.from({ length: 5 }, (_, index) => GALLERY_POOL[(start + index) % GALLERY_POOL.length]);
  return [...new Set([event.coverImage, ...picked].filter((src): src is string => Boolean(src)))];
};

export type EventReview = {
  publicId: string;
  name: string;
  role: string;
  rating: number;
  content: string;
  date: string;
};

const REVIEW_POOL: Omit<EventReview, 'publicId' | 'date'>[] = [
  { name: 'Lê Hoàng Nam', role: 'Môi giới tự do', rating: 5, content: 'Nội dung thực tế, diễn giả chia sẻ nhiều số liệu thị trường mới. Phần hỏi đáp rất giá trị.' },
  { name: 'Phạm Thu Trang', role: 'Trưởng nhóm kinh doanh', rating: 5, content: 'Tổ chức chuyên nghiệp, check-in nhanh bằng QR. Mình sẽ đưa cả team đến các buổi sau.' },
  { name: 'Võ Minh Tuấn', role: 'Nhà đầu tư cá nhân', rating: 4, content: 'Góc nhìn vĩ mô rõ ràng, giúp mình định hướng danh mục cho năm tới. Mong thời lượng dài hơn.' },
  { name: 'Đặng Ngọc Hân', role: 'Chuyên viên tư vấn', rating: 4, content: 'Tài liệu gửi sau sự kiện đầy đủ, slide dễ hiểu. Địa điểm thuận tiện, hơi đông vào giờ nghỉ.' },
  { name: 'Trịnh Quốc Bảo', role: 'Môi giới dự án', rating: 5, content: 'Nhiều case study chốt deal thực tế, áp dụng được ngay. Rất đáng thời gian.' },
];

/** Danh gia: chi su kien dang / da dien ra moi co */
export const getEventReviews = (event: EventItem): EventReview[] => {
  const status = computeEventStatus(event);
  if (status === 'upcoming' || status === 'full') return [];
  const start = hashOf(event.slug) % REVIEW_POOL.length;
  return Array.from({ length: 4 }, (_, index) => ({
    ...REVIEW_POOL[(start + index) % REVIEW_POOL.length],
    publicId: `${event.publicId}-review-${index + 1}`,
    date: event.endAt ?? event.startAt,
  }));
};

// ── Ma ve QR ──────────────────────────────────────────────────────────────

const TICKET_PREFIX = 'RH-EVENT';

/** Noi dung ma QR tren ve: RH-EVENT|<slug>|<ma ve> */
export const buildTicketPayload = (slug: string, ticketId: string) =>
  `${TICKET_PREFIX}|${slug}|${ticketId}`;

export const parseTicketPayload = (raw: string): { slug: string; ticketId: string } | null => {
  const [prefix, slug, ticketId] = raw.trim().split('|');
  if (prefix !== TICKET_PREFIX || !slug || !ticketId) return null;
  return { slug, ticketId };
};

/** Ma ve ngan, de doc: VD "RH-7K2QXM" */
export const createTicketId = () =>
  `RH-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
