import Link from 'next/link';
import {
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiInbox,
  FiPaperclip,
  FiThumbsUp,
  FiTrendingUp,
} from 'react-icons/fi';

import PageBanner from '@/common/components/PageBanner';
import { FEEDBACK_CATEGORY_ICON, FEEDBACK_RATING_ICON } from '@/modules/feedback/feedbackIcons';
import FeedbackForm from '@/modules/feedback/components/FeedbackForm';
import {
  FEEDBACK_CATEGORY_LABELS,
  FEEDBACK_STATS,
  FEEDBACK_STATUS_LABELS,
  FEEDBACK_STATUS_TONE,
  MOCK_RECENT_FEEDBACKS,
  type FeedbackItem,
} from '@/modules/feedback/mocks/feedback.mock';

import type { Metadata } from 'next';

/**
 * Trang /gop-y-va-phan-hoi:
 *   1. Banner anh + 4 so lieu noi len mep duoi
 *   2. Form (trai) | huong dan gop y + chuyen muc (phai)
 *   3. Bang tin gop y gan day
 */
export const metadata: Metadata = {
  title: 'Góp ý & phản hồi',
  description:
    'Chia sẻ góp ý, báo lỗi hoặc đề xuất tính năng cho RealtyHub. Mọi phản hồi đều được đội ngũ xem xét và phản hồi công khai.',
};

const formatTimeAgo = (iso: string): string => {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} giờ trước`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return `${diffD} ngày trước`;
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(new Date(iso));
};

const STATS = [
  { icon: FiInbox, value: FEEDBACK_STATS.totalReceived.toLocaleString('vi-VN'), label: 'Góp ý đã nhận', tone: 'bg-brand-50 text-brand-600' },
  { icon: FiCheckCircle, value: String(FEEDBACK_STATS.totalShipped), label: 'Đã triển khai', tone: 'bg-jade-50 text-jade-600' },
  { icon: FiClock, value: `${FEEDBACK_STATS.avgResponseHours} giờ`, label: 'Phản hồi trung bình', tone: 'bg-accent-50 text-accent-600' },
  { icon: FiTrendingUp, value: `${FEEDBACK_STATS.upvoteRate}%`, label: 'Được cộng đồng đồng thuận', tone: 'bg-purple-50 text-purple-600' },
];

const TIPS = [
  'Mô tả rõ vấn đề hoặc đề xuất',
  'Kèm ảnh chụp màn hình nếu là lỗi',
  'Ghi rõ trình duyệt / thiết bị gặp lỗi',
  'Tôn trọng cộng đồng — không spam, quảng cáo',
];

const POPULAR_CATEGORIES = ['tinh-nang', 'ui-ux', 'hieu-nang', 'noi-dung', 'dich-vu'] as const;

const FeedbackPage = () => (
  <main className="bg-gray-25 pb-12 md:pb-16">
    <PageBanner
      crumb="Góp ý & phản hồi"
      eyebrow="Bảng tin công khai"
      imageUrl="/images/heroes/gop-y-va-phan-hoi.jpg"
      title="Giúp RealtyHub tốt hơn mỗi ngày"
      description="Gửi lỗi, đề xuất tính năng hoặc đánh giá trải nghiệm — mỗi góp ý đều được đội ngũ đọc và phản hồi công khai."
      overlap={
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {STATS.map(({ icon: Icon, value, label, tone }) => (
            <li key={label} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-theme-lg">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                <Icon aria-hidden className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-lg font-bold text-gray-900">{value}</span>
                <span className="block truncate text-theme-xs text-gray-500">{label}</span>
              </span>
            </li>
          ))}
        </ul>
      }
    />

    {/* Form + huong dan */}
    <section className="site-container pt-10 md:pt-12">
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-theme-sm md:p-8 lg:col-span-3">
          <span className="text-theme-xs font-bold tracking-[0.2em] text-brand-600 uppercase">Gửi góp ý</span>
          <h2 className="mt-2 text-2xl font-bold text-navy-800">Chia sẻ của bạn</h2>
          <p className="mt-2 mb-6 text-theme-sm leading-relaxed text-gray-600">
            Càng chi tiết, đội ngũ càng xử lý nhanh. Có thể đính kèm ảnh hoặc gửi ẩn danh.
          </p>
          <FeedbackForm />
        </div>

        <aside className="space-y-6 lg:col-span-2">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-theme-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <FiThumbsUp aria-hidden className="h-5 w-5" />
              </span>
              <h3 className="text-base font-semibold text-gray-900">Góp ý hiệu quả</h3>
            </div>
            <ul className="mt-4 space-y-2.5">
              {TIPS.map((tip) => (
                <li key={tip} className="flex gap-2.5 text-theme-sm text-gray-700">
                  <FiCheckCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-jade-500" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-theme-sm">
            <h3 className="text-base font-semibold text-gray-900">Chuyên mục phổ biến</h3>
            <ul className="mt-4 grid gap-2">
              {POPULAR_CATEGORIES.map((cat) => {
                const Icon = FEEDBACK_CATEGORY_ICON[cat];
                return (
                  <li key={cat} className="flex items-center gap-3 rounded-xl bg-gray-25 px-3 py-2.5 text-theme-sm text-gray-700">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-brand-600 shadow-theme-xs">
                      <Icon aria-hidden className="h-4 w-4" />
                    </span>
                    {FEEDBACK_CATEGORY_LABELS[cat]}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="brand-gradient rounded-3xl p-6 text-white">
            <h3 className="text-base font-semibold">Minh bạch & công khai</h3>
            <p className="mt-2 text-theme-sm leading-relaxed text-white/80">
              Mọi góp ý (trừ ẩn danh) đều hiện ở bảng tin bên dưới, kèm trạng thái xử lý và phản hồi từ đội ngũ.
            </p>
          </div>
        </aside>
      </div>
    </section>

    {/* Bang tin gop y */}
    <section className="site-container pt-12 md:pt-14">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="text-theme-xs font-bold tracking-[0.2em] text-brand-600 uppercase">Bảng tin công khai</span>
          <h2 className="mt-2 text-2xl font-bold text-navy-800">Góp ý gần đây</h2>
        </div>
        <Link
          href="#"
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-theme-sm font-semibold text-gray-700 transition hover:border-brand-300 hover:text-brand-600"
        >
          Xem tất cả
          <FiArrowRight aria-hidden />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_RECENT_FEEDBACKS.map((fb) => (
          <FeedbackCard key={fb.publicId} feedback={fb} />
        ))}
      </div>
    </section>
  </main>
);

const FeedbackCard = ({ feedback }: { feedback: FeedbackItem }) => {
  const { icon: RatingIcon, tone } = FEEDBACK_RATING_ICON[feedback.rating];
  const CategoryIcon = FEEDBACK_CATEGORY_ICON[feedback.category];

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-theme-xs transition hover:shadow-theme-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
            <RatingIcon aria-hidden className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-theme-sm font-semibold text-gray-900">{feedback.title}</h3>
            <p className="text-theme-xs text-gray-500">
              {feedback.isAnonymous ? 'Ẩn danh' : feedback.authorName} · {formatTimeAgo(feedback.submittedAt)}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${FEEDBACK_STATUS_TONE[feedback.status]}`}
        >
          {FEEDBACK_STATUS_LABELS[feedback.status]}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-theme-xs text-gray-600">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-0.5">
          <CategoryIcon aria-hidden className="h-3.5 w-3.5" />
          {FEEDBACK_CATEGORY_LABELS[feedback.category]}
        </span>
        {feedback.hasScreenshot && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5">
            <FiPaperclip aria-hidden className="h-3.5 w-3.5" />
            Có ảnh
          </span>
        )}
        <span className="ml-auto text-gray-400">{feedback.displayId}</span>
      </div>

      <p className="line-clamp-3 text-theme-sm leading-relaxed text-gray-600">{feedback.content}</p>

      {feedback.adminReply && (
        <div className="rounded-xl border-l-4 border-brand-500 bg-brand-25 px-4 py-3 text-theme-sm">
          <p className="text-theme-xs font-semibold text-brand-700">Phản hồi từ RealtyHub</p>
          <p className="mt-1 text-gray-700">{feedback.adminReply}</p>
        </div>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5 text-theme-xs font-semibold text-gray-700 transition hover:bg-brand-50 hover:text-brand-600"
        >
          <FiThumbsUp aria-hidden className="h-3.5 w-3.5" />
          {feedback.upvotes} đồng thuận
        </button>
        <span className="text-theme-xs font-medium text-brand-600">Xem chi tiết →</span>
      </div>
    </article>
  );
};

export default FeedbackPage;
