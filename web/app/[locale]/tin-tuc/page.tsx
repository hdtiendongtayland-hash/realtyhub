import Image from 'next/image';
import Link from 'next/link';

import {
  FiArrowLeft,
  FiArrowRight,
  FiCalendar,
  FiClock,
  FiFileText,
  FiSearch,
  FiTrendingUp,
} from 'react-icons/fi';

import PlaceholderThumb from '@/common/components/PlaceholderThumb';
import FeaturedNewsCarousel from '@/modules/news/components/FeaturedNewsCarousel';
import NewsFilterBar from '@/modules/news/components/NewsFilterBar';

import type { Metadata } from 'next';

import { MOCK_NEWS } from '@/modules/news/mocks/news.mock';
import {
  NEWS_CATEGORY_LABELS,
  type NewsArticle,
  type NewsCategory,
} from '@/modules/news/models/news.model';

/**
 * Trang /tin-tuc - Trang tin tuc & phan tich thi truong BĐS.
 *
 * Layout (server component, searchParams cho filter + phan trang):
 *   01 Hero (gradient brand, eyebrow + search bar + 3 chips filter)
 *   02 Featured article (1 bai moi nhat, full-width hero card)
 *   03 Grid articles (6 bai moi/trang, 3 col, hover lift)
 *   04 Pagination (server-side, ?page=N&category=...)
 *   05 Newsletter CTA (dark, subscribe email)
 *
 * Filter/pagination dung query string thay vi client state de:
 *   - SEO-index duoc moi state (Bing/Google crawl tung category)
 *   - Khong can 'use client' => JS bundle nho
 *   - Khi co backend: thay MOCK_NEWS bang service call, giu nguyen pattern
 *
 * Mock data: 12 bai (8 cu + 4 moi them) -> 1 featured + 6 grid + 5 con lai
 * = 2 trang (page 1: 6 grid, page 2: 5 grid).
 */
export const metadata: Metadata = {
  title: 'Tin tức & Phân tích',
  description:
    'Tin tức dự án, phân tích thị trường và nhận định chuyên gia về bất động sản Việt Nam — cập nhật hàng ngày bởi đội ngũ RealtyHub.',
};

// ============================================================================
// Route types
// ============================================================================

type PageSearchParams = {
  category?: string;
  page?: string;
  /** Tu khoa tim kiem */
  q?: string;
  /** 'cu-nhat' = cu nhat truoc; mac dinh moi nhat */
  sort?: string;
  /** Khoang ngay dang: yyyy-mm-dd */
  from?: string;
  to?: string;
};

/** 12: tron hang o ca 2, 3 va 4 cot */
const PAGE_SIZE = 12;
const CATEGORY_ALL = 'all' as const;
type CategoryFilter = NewsCategory | typeof CATEGORY_ALL;

// ============================================================================
// Helpers
// ============================================================================

const formatDate = (iso: string): string =>
  new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso));

const formatDateLong = (iso: string): string =>
  new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));

const readingTime = (article: NewsArticle): number => {
  // Tier-based: excerpt ngan -> 3ph, trung binh -> 5ph, dai -> 7ph
  const len = article.excerpt.length + article.title.length;
  if (len < 120) return 3;
  if (len < 200) return 5;
  return 7;
};

/** Sort theo publishedAt DESC (fake trigger neu ngay bang nhau) */
/** Bo dau + chu thuong de tim kiem khong phan biet dau */
const normalize = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();

const sortByDateDesc = (a: NewsArticle, b: NewsArticle) =>
  new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();

const parseCategory = (raw: string | undefined): CategoryFilter => {
  if (raw === 'tin-tuc-du-an' || raw === 'phan-tich-nhan-dinh') return raw;
  return CATEGORY_ALL;
};

const parsePage = (raw: string | undefined): number => {
  const n = parseInt(raw ?? '1', 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
};

/** Tao URL cho category/page da thay doi, giu lai cac param khac */
const buildHref = (next: Partial<PageSearchParams>, current: PageSearchParams): string => {
  const params = new URLSearchParams();
  const merged = { ...current, ...next };
  if (merged.category && merged.category !== CATEGORY_ALL) params.set('category', merged.category);
  if (merged.page && merged.page !== '1') params.set('page', merged.page);
  if (merged.q) params.set('q', merged.q);
  if (merged.sort) params.set('sort', merged.sort);
  if (merged.from) params.set('from', merged.from);
  if (merged.to) params.set('to', merged.to);
  const qs = params.toString();
  return qs ? `/tin-tuc?${qs}` : '/tin-tuc';
};

// ============================================================================
// Page
// ============================================================================

const TinTucPage = async ({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) => {
  const params = await searchParams;
  const category = parseCategory(params.category);
  const page = parsePage(params.page);
  const keyword = normalize(params.q?.trim() ?? '');

  // Filter + sort
  const from = params.from ?? '';
  const to = params.to ?? '';
  const isOldestFirst = params.sort === 'cu-nhat';
  const hasFilter = Boolean(keyword || from || to || category !== CATEGORY_ALL || isOldestFirst);

  const filtered = MOCK_NEWS.filter((a) => {
    if (category !== CATEGORY_ALL && a.category !== category) return false;
    if (keyword && !normalize(`${a.title} ${a.excerpt}`).includes(keyword)) return false;
    const day = a.publishedAt.slice(0, 10);
    if (from && day < from) return false;
    if (to && day > to) return false;
    return true;
  });
  const sorted = [...filtered].sort(sortByDateDesc);
  if (isOldestFirst) sorted.reverse();

  // Phan trang
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const featured = currentPage === 1 && !hasFilter ? sorted[0] : undefined;
  const sideArticles = featured ? sorted.slice(4, 7) : [];
  const startIdx = featured ? 1 : 0;
  const gridArticles = sorted.slice(startIdx, startIdx + PAGE_SIZE);

  const categories = [
    { key: CATEGORY_ALL, label: 'Tất cả', count: MOCK_NEWS.length },
    ...(Object.keys(NEWS_CATEGORY_LABELS) as NewsCategory[]).map((key) => ({
      key,
      label: NEWS_CATEGORY_LABELS[key],
      count: MOCK_NEWS.filter((a) => a.category === key).length,
    })),
  ];

  return (
    <main className="bg-gray-25">
      {/* ── Banner ──────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-navy-900 pt-5 pb-20 text-white sm:pt-6 md:pb-28">
        <Image src="/images/heroes/tin-tuc.jpg" alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-900/95 via-navy-900/80 to-brand-700/60" />
        <div className="site-container">
          <nav aria-label="Breadcrumb" className="mb-5 text-theme-xs text-white/60">
            <Link href="/" className="transition hover:text-white">Trang chủ</Link>
            <span className="mx-2">/</span>
            <span className="text-white/90">Tin tức</span>
          </nav>
          <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl">Tin tức &amp; phân tích thị trường</h1>
          <p className="mt-2 line-clamp-2 max-w-2xl text-theme-sm leading-relaxed text-white/75 sm:line-clamp-none sm:text-base">
            Tin dự án mới nhất, góc nhìn chuyên gia và nhận định xu hướng bất động sản Việt Nam — cập nhật mỗi ngày.
          </p>
        </div>
      </section>

      {/* ── Bo loc (dung chung kieu voi trang Su kien) ─────────── */}
      <div className="site-container relative z-10 -mt-12 md:-mt-16">
        <NewsFilterBar
          categoryOptions={categories
            .filter((item) => item.key !== CATEGORY_ALL)
            .map((item) => ({ value: item.key, label: `${item.label} (${item.count})` }))}
        />
      </div>

      {/* ── Bai noi bat + doc nhieu ────────────────────────────── */}
      {featured && (
        <section className="site-container pt-8 md:pt-10">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
            <FeaturedNewsCarousel
              slides={sorted.slice(0, 4).map((a) => ({
                slug: a.slug,
                title: a.title,
                excerpt: a.excerpt,
                thumbnailUrl: a.thumbnailUrl || undefined,
                categoryLabel: NEWS_CATEGORY_LABELS[a.category],
                dateLabel: formatDateLong(a.publishedAt),
                readMinutes: readingTime(a),
              }))}
            />
            {sideArticles.length > 0 && (
              <aside className="hidden rounded-3xl border border-white bg-white p-5 sm:block shadow-[0_10px_30px_-14px_rgba(30,64,175,0.28)]">
                <h2 className="flex items-center gap-2 text-base font-bold text-navy-800">
                  <FiTrendingUp aria-hidden className="h-5 w-5 text-brand-500" />
                  Đọc nhiều
                </h2>
                <ul className="mt-4 divide-y divide-gray-100">
                  {sideArticles.map((article, index) => (
                    <li key={article.publicId} className="py-3 first:pt-0 last:pb-0">
                      <Link href={`/tin-tuc/${article.slug}`} className="group flex gap-3">
                        <span className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                          <PlaceholderThumb seed={article.slug} src={article.thumbnailUrl || undefined} alt={article.title} />
                          <span className="absolute top-1 left-1 flex h-5 w-5 items-center justify-center rounded-md bg-navy-800/90 text-[11px] font-bold text-white">
                            {index + 1}
                          </span>
                        </span>
                        <span className="min-w-0">
                          <span className="line-clamp-2 text-theme-sm leading-snug font-semibold text-gray-900 group-hover:text-brand-600">
                            {article.title}
                          </span>
                          <span className="mt-1 flex items-center gap-1 text-[11px] text-gray-400">
                            <FiCalendar aria-hidden className="h-3 w-3" />
                            {formatDate(article.publishedAt)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </aside>
            )}
          </div>
        </section>
      )}

      {/* ── Luoi bai viet (nen xanh nhat) ──────────────────────── */}
      <div className="relative isolate mt-8 overflow-hidden bg-gradient-to-b from-[#eaf2ff] via-[#f2f6ff] to-gray-25">
        <span aria-hidden className="absolute -top-24 -left-24 -z-10 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl" />
        <span aria-hidden className="absolute top-1/3 -right-24 -z-10 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl" />
        <section className="site-container py-10 md:py-12">
          <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-500 text-white shadow-[0_8px_20px_-8px_rgba(79,70,229,0.6)] ring-4 ring-white sm:h-12 sm:w-12">
                <FiFileText aria-hidden className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-navy-800 sm:text-xl md:text-2xl">
                  {hasFilter
                    ? keyword
                      ? `Kết quả cho “${params.q?.trim()}”`
                      : 'Kết quả lọc'
                    : category === CATEGORY_ALL
                      ? 'Bài viết mới nhất'
                      : NEWS_CATEGORY_LABELS[category as NewsCategory]}
                </h2>
                <p className="hidden text-theme-sm text-gray-500 sm:block">
                  {sorted.length} bài viết
                  {currentPage > 1 ? ` · Trang ${currentPage}/${totalPages}` : ''}
                </p>
              </div>
            </div>
            {hasFilter && (
              <Link
                href="/tin-tuc"
                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-brand-200 bg-white px-3 py-1.5 text-theme-xs font-semibold text-brand-700 shadow-theme-xs transition hover:border-brand-400 sm:px-5 sm:py-2 sm:text-theme-sm"
              >
                Xem tất cả
                <FiArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            )}
          </div>

          {gridArticles.length === 0 ? (
            <EmptyState category={category} />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {gridArticles.map((article) => (
                <ArticleCard key={article.publicId} article={article} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} currentParams={params} />
          )}
        </section>
      </div>

      <NewsletterCTA />
    </main>
  );
};

// ============================================================================
// Mau theo chuyen muc
// ============================================================================

const CATEGORY_TONE: Record<NewsCategory, { chip: string; button: string }> = {
  'tin-tuc-du-an': { chip: 'border-sky-200 text-sky-600', button: 'from-sky-500 to-brand-600' },
  'phan-tich-nhan-dinh': { chip: 'border-violet-200 text-violet-600', button: 'from-indigo-500 to-violet-600' },
};
const toneOf = (category: NewsCategory) =>
  CATEGORY_TONE[category] ?? { chip: 'border-brand-200 text-brand-600', button: 'from-brand-500 to-navy-800' };

// ============================================================================
// ArticleCard - 1 bai trong luoi
// ============================================================================

const ArticleCard = ({ article }: { article: NewsArticle }) => {
  const tone = toneOf(article.category);
  const date = new Date(article.publishedAt);
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white bg-white shadow-[0_10px_30px_-14px_rgba(30,64,175,0.28)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-14px_rgba(30,64,175,0.4)]">
      <Link href={`/tin-tuc/${article.slug}`} className="relative block aspect-video overflow-hidden bg-gray-100" aria-label={article.title}>
        <PlaceholderThumb
          seed={article.slug}
          src={article.thumbnailUrl || undefined}
          alt={article.title}
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute top-3 left-3 flex w-12 flex-col items-center rounded-lg bg-white py-1.5 text-center shadow-theme-sm">
          <span className="text-lg leading-none font-bold text-navy-800">{date.getDate()}</span>
          <span className="mt-0.5 text-[10px] font-semibold tracking-wide text-gray-500 uppercase">Th{date.getMonth() + 1}</span>
        </div>
        <span
          className={`absolute top-3 right-3 max-w-[60%] truncate rounded-full border bg-white/95 px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase shadow-theme-xs ${tone.chip}`}
        >
          {NEWS_CATEGORY_LABELS[article.category]}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-base leading-snug font-bold text-navy-800">
          <Link href={`/tin-tuc/${article.slug}`} className="transition hover:text-brand-600">
            {article.title}
          </Link>
        </h3>
        <p className="mt-1.5 line-clamp-3 text-theme-xs leading-relaxed text-gray-500">{article.excerpt}</p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="flex items-center gap-1.5 text-theme-xs text-gray-500">
            <FiClock aria-hidden className="h-3.5 w-3.5 text-gray-400" />
            {readingTime(article)} phút đọc
          </span>
          <Link
            href={`/tin-tuc/${article.slug}`}
            className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r px-4 py-2 text-theme-xs font-semibold text-white shadow-theme-xs transition hover:brightness-110 ${tone.button}`}
          >
            Đọc tiếp
            <FiArrowRight aria-hidden className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
};

// ============================================================================
// Pagination
// ============================================================================

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  currentParams: PageSearchParams;
};

const Pagination = ({ currentPage, totalPages, currentParams }: PaginationProps) => {
  const pages: Array<number | 'ellipsis'> = [];
  for (let i = 1; i <= totalPages; i += 1) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      pages.push('ellipsis');
    }
  }

  return (
    <nav
      aria-label="Pagination"
      className="mt-12 flex items-center justify-center gap-2"
    >
      {/* Prev */}
      {currentPage > 1 ? (
        <Link
          href={buildHref({ page: String(currentPage - 1) }, currentParams)}
          className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-theme-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
        >
          <FiArrowLeft aria-hidden className="h-4 w-4" />
          Trước
        </Link>
      ) : (
        <span
          aria-disabled
          className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full border border-gray-100 bg-gray-50 px-4 py-2.5 text-theme-sm font-semibold text-gray-400"
        >
          <FiArrowLeft aria-hidden className="h-4 w-4" />
          Trước
        </span>
      )}

      {/* Page numbers */}
      <ol className="flex items-center gap-1.5">
        {pages.map((p, idx) =>
          p === 'ellipsis' ? (
            <li key={`e-${idx}`} aria-hidden className="px-2 text-gray-400">
              …
            </li>
          ) : (
            <li key={p}>
              <Link
                href={buildHref({ page: String(p) }, currentParams)}
                aria-current={p === currentPage ? 'page' : undefined}
                className={`inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-theme-sm font-semibold transition ${
                  p === currentPage
                    ? 'bg-brand-500 text-white shadow-theme-sm'
                    : 'border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {p}
              </Link>
            </li>
          )
        )}
      </ol>

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={buildHref({ page: String(currentPage + 1) }, currentParams)}
          className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-theme-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
        >
          Sau
          <FiArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      ) : (
        <span
          aria-disabled
          className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full border border-gray-100 bg-gray-50 px-4 py-2.5 text-theme-sm font-semibold text-gray-400"
        >
          Sau
          <FiArrowRight aria-hidden className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
};

// ============================================================================
// EmptyState
// ============================================================================

const EmptyState = ({ category }: { category: CategoryFilter }) => (
  <div className="mx-auto max-w-md rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center md:py-20">
    <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-theme-xs">
      <FiSearch aria-hidden className="h-6 w-6 text-gray-400" />
    </span>
    <h3 className="mt-5 text-xl font-bold text-gray-900">
      Chưa có bài viết nào
    </h3>
    <p className="mt-2 text-theme-sm text-gray-600">
      {category === CATEGORY_ALL
        ? 'Chúng tôi đang cập nhật thêm bài viết mới.'
        : `Chuyên mục "${NEWS_CATEGORY_LABELS[category as NewsCategory]}" hiện chưa có bài viết.`}
    </p>
    <Link
      href="/tin-tuc"
      className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-theme-sm font-semibold text-white shadow-theme-sm transition hover:bg-brand-600"
    >
      Xem tất cả bài viết
    </Link>
  </div>
);

// ============================================================================
// NewsletterCTA
// ============================================================================

const NewsletterCTA = () => (
  <section className="site-container pb-14 md:pb-16">
    <div className="relative isolate overflow-hidden rounded-3xl bg-navy-800 px-6 py-10 text-center text-white md:px-12 md:py-14">
      <span aria-hidden className="absolute -top-20 -right-16 -z-10 h-64 w-64 rounded-full bg-brand-500/25 blur-3xl" />
      <span aria-hidden className="absolute -bottom-24 -left-16 -z-10 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="mx-auto max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-theme-xs font-semibold uppercase tracking-[0.2em] text-white">
          Bản tin RealtyHub
        </span>
        <h2 className="mt-4 text-2xl leading-tight font-bold md:text-3xl">
          Cập nhật thị trường mỗi tuần
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-theme-sm leading-relaxed text-white/80 md:text-base">
          Nhận bản tin email với 5 bài viết nổi bật, 1 phân tích xu hướng và cơ hội đầu tư mới —
          miễn phí, hủy bất cứ lúc nào.
        </p>

        <form
          className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row"
          action="/tin-tuc"
        >
          <input
            type="email"
            name="email"
            required
            placeholder="email@example.com"
            aria-label="Email của bạn"
            className="w-full flex-1 rounded-full bg-white/10 px-5 py-3 text-sm text-white placeholder-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/40"
          />
          <button
            type="submit"
            className="rounded-full bg-white px-6 py-3 text-theme-sm font-semibold text-brand-700 shadow-theme-sm transition hover:bg-gray-100"
          >
            Đăng ký
          </button>
        </form>

        <p className="mt-4 text-theme-xs text-white/60">
          Chúng tôi tôn trọng quyền riêng tư. Email chỉ dùng cho bản tin.
        </p>
      </div>
    </div>
  </section>
);

export default TinTucPage;