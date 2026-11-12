import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  FiArrowLeft,
  FiArrowRight,
  FiCalendar,
  FiCheck,
  FiChevronRight,
  FiClock,
  FiHome,
  FiList,
  FiPhoneCall,
  FiTag,
  FiUser,
} from 'react-icons/fi';

import PlaceholderThumb from '@/common/components/PlaceholderThumb';
import { SectionEyebrow } from '@/common/components/SoftPageHero';
import NewsShareButtons from '@/modules/news/components/NewsShareButtons';
import { MOCK_NEWS } from '@/modules/news/mocks/news.mock';
import { NEWS_CATEGORY_LABELS, type NewsArticle } from '@/modules/news/models/news.model';
import {
  NEWS_CATEGORY_TONE,
  buildArticleBody,
  getAdjacentNews,
  getLatestNews,
  getNewsBySlug,
  getRelatedNews,
  newsReadingTime,
} from '@/modules/news/newsArticle';

import type { Metadata } from 'next';

/**
 * Trang /tin-tuc/[slug] - chi tiet mot bai tin tuc, cung phong cach cac trang
 * thong tin (khoi bo tron lon, nen xanh nhat pha tim):
 *   1. Dau bai: duong dan, chuyen muc, tieu de, ngay / thoi gian doc, anh bia
 *   2. Than bai (doan mo dau + cac muc + trich dan + diem chinh) | cot ben
 *      dinh khi cuon: muc luc, tin moi nhat, the tu van
 *   3. Bai moi hon / cu hon
 *   4. Tin cung chuyen muc
 *   5. CTA cuoi trang
 */
type Props = { params: Promise<{ slug: string }> };

export const generateStaticParams = () => MOCK_NEWS.map((article) => ({ slug: article.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getNewsBySlug(slug);
  if (!article) return { title: 'Không tìm thấy bài viết' };
  return {
    title: `${article.title} | Tin tức`,
    description: article.excerpt,
    openGraph: { title: article.title, description: article.excerpt, images: [article.thumbnailUrl] },
  };
}

const formatDateLong = (iso: string) =>
  new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(iso));

const formatDateShort = (iso: string) =>
  new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso));

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = getNewsBySlug(slug);
  if (!article) notFound();

  const tone = NEWS_CATEGORY_TONE[article.category];
  const body = buildArticleBody(article);
  const { newer, older } = getAdjacentNews(article.slug);
  const related = getRelatedNews(article);
  const latest = getLatestNews(article.slug);
  // Xen ke giua cac muc: anh lon sau muc 1, trich dan sau muc 2, cap anh sau muc 3
  const featureAfter = 0;
  const quoteAfter = 1;
  const galleryAfter = 2;

  return (
    <main className="bg-gray-25 pb-14 md:pb-20">
      {/* ── 1. DAU BAI ────────────────────────────────────────────── */}
      <section className="site-container pt-6">
        <div className="relative isolate overflow-hidden rounded-3xl bg-navy-900 px-6 pt-8 pb-10 text-white shadow-[0_28px_60px_-30px_rgba(15,23,42,0.75)] sm:px-10 md:px-14 md:pt-10 md:pb-14">
          {/* Anh cua bai mo dan o nua phai (thay cho anh bia lon) */}
          <div
            aria-hidden
            className="absolute inset-y-0 right-0 -z-20 w-full [mask-image:linear-gradient(to_left,black_0%,black_40%,rgba(0,0,0,0.6)_65%,transparent_95%)] md:w-[62%]"
          >
            <Image src={article.thumbnailUrl} alt="" fill priority sizes="65vw" className="object-cover brightness-110 saturate-125" />
          </div>
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-900 via-navy-900/70 to-transparent" />
          <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-navy-900/55 to-transparent" />
          <span aria-hidden className="absolute -top-28 -left-20 -z-10 h-72 w-72 rounded-full bg-sky-500/25 blur-3xl" />
          <span aria-hidden className="absolute -right-10 -bottom-32 -z-10 h-56 w-[24rem] rounded-full bg-violet-600/15 blur-3xl" />

          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-theme-xs text-white/60">
            <Link href="/" className="inline-flex items-center gap-1 transition hover:text-white">
              <FiHome aria-hidden className="h-3.5 w-3.5" />
              Trang chủ
            </Link>
            <FiChevronRight aria-hidden className="h-3.5 w-3.5 text-white/30" />
            <Link href="/tin-tuc" className="transition hover:text-white">
              Tin tức
            </Link>
            <FiChevronRight aria-hidden className="h-3.5 w-3.5 text-white/30" />
            <Link href={`/tin-tuc?category=${article.category}`} className="font-semibold text-white/90 transition hover:text-white">
              {NEWS_CATEGORY_LABELS[article.category]}
            </Link>
          </nav>

          <div className="mt-8 md:mt-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-theme-xs font-bold tracking-[0.14em] text-sky-200 uppercase ring-1 ring-white/20 backdrop-blur">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-sky-300" />
              {NEWS_CATEGORY_LABELS[article.category]}
            </span>
            <h1 className="mt-4 max-w-3xl text-[1.7rem] leading-tight font-bold sm:text-4xl md:text-[2.75rem] md:leading-[1.18]">
              {article.title}
            </h1>
            <span aria-hidden className="mt-6 block h-1 w-16 rounded-full bg-gradient-to-r from-sky-400 to-violet-500" />

            {/* Tac gia / ngay / thoi gian doc + chia se */}
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <ul className="flex flex-wrap items-center gap-2 text-theme-sm text-white/85">
                <li className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15 backdrop-blur">
                  <FiUser aria-hidden className="h-4 w-4 text-sky-300" />
                  Ban biên tập RealtyHub
                </li>
                <li className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15 backdrop-blur">
                  <FiCalendar aria-hidden className="h-4 w-4 text-sky-300" />
                  <time dateTime={article.publishedAt}>{formatDateLong(article.publishedAt)}</time>
                </li>
                <li className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15 backdrop-blur">
                  <FiClock aria-hidden className="h-4 w-4 text-sky-300" />
                  {newsReadingTime(article)} phút đọc
                </li>
              </ul>
              <NewsShareButtons title={article.title} tone="dark" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. THAN BAI | COT BEN ─────────────────────────────────── */}
      <section className="site-container pt-8 md:pt-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem] xl:grid-cols-[1fr_22rem]">
          <article className="self-start rounded-3xl border border-white bg-white p-5 shadow-[0_24px_60px_-34px_rgba(30,64,175,0.45)] sm:p-8 md:p-10">
            {/* Doan mo dau */}
            <p className="border-l-4 border-sky-400 bg-gradient-to-r from-sky-50 to-transparent py-3 pr-2 pl-5 text-lg leading-relaxed font-semibold text-navy-800 md:text-xl">
              {article.excerpt}
            </p>

            {body.sections.map((section, index) => (
              <div key={section.id}>
                <h2 id={section.id} className="mt-10 scroll-mt-28 text-xl font-bold text-navy-800 md:text-2xl">
                  {section.heading}
                </h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)} className="mt-4 text-base leading-[1.85] text-gray-700 md:text-[17px]">
                    {paragraph}
                  </p>
                ))}

                {index === featureAfter && (
                  <figure className="mt-8">
                    <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-gray-100 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.55)]">
                      <Image
                        src={body.feature.src}
                        alt={body.feature.caption}
                        fill
                        sizes="(min-width: 1024px) 760px, 100vw"
                        className="object-cover"
                      />
                    </div>
                    <figcaption className="mt-3 flex items-start gap-2 text-theme-sm leading-relaxed text-gray-500 italic">
                      <span aria-hidden className="mt-2 h-px w-6 shrink-0 bg-sky-300" />
                      {body.feature.caption}
                    </figcaption>
                  </figure>
                )}

                {index === galleryAfter && (
                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    {body.gallery.map((photo) => (
                      <figure key={photo.src}>
                        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.55)]">
                          <Image
                            src={photo.src}
                            alt={photo.caption}
                            fill
                            sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                            className="object-cover transition duration-700 hover:scale-105"
                          />
                        </div>
                        <figcaption className="mt-2 text-theme-xs leading-relaxed text-gray-500 italic">{photo.caption}</figcaption>
                      </figure>
                    ))}
                  </div>
                )}

                {index === quoteAfter && (
                  <figure className="relative mt-8 overflow-hidden rounded-2xl bg-gradient-to-br from-navy-800 via-brand-700 to-violet-700 px-6 py-7 text-white md:px-10">
                    <span aria-hidden className="absolute -top-6 left-4 font-serif text-[7rem] leading-none text-white/15">
                      &ldquo;
                    </span>
                    <blockquote className="relative text-lg leading-relaxed font-semibold md:text-xl">{body.quote}</blockquote>
                    <figcaption className="relative mt-3 text-theme-sm text-white/70">— Ban biên tập RealtyHub</figcaption>
                  </figure>
                )}
              </div>
            ))}

            {/* Diem chinh */}
            <div className="mt-10 rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50/80 via-white to-violet-50/70 p-5 md:p-6">
              <p className="text-theme-sm font-bold tracking-[0.14em] text-brand-700 uppercase">Điểm chính</p>
              <ul className="mt-4 space-y-3">
                {body.takeaways.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-theme-sm text-gray-700 md:text-base">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-brand-600 text-white">
                      <FiCheck aria-hidden className="h-3 w-3" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* The + chia se */}
            <div className="mt-8 flex flex-col gap-4 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <FiTag aria-hidden className="h-4 w-4 text-gray-400" />
                {body.tags.map((tag) => (
                  <span key={tag} className={`rounded-full px-3 py-1 text-theme-xs font-semibold ${tone.soft}`}>
                    {tag}
                  </span>
                ))}
              </div>
              <NewsShareButtons title={article.title} />
            </div>
          </article>

          {/* Cot ben: tin moi nhat cuon theo bai; muc luc + the tu van ghim
              khi cuon (gon, luon vua man hinh) */}
          <aside className="flex flex-col gap-6">
            <div className="rounded-3xl border border-white bg-white/90 p-5 shadow-[0_24px_60px_-34px_rgba(30,64,175,0.45)] backdrop-blur">
              <p className="text-theme-xs font-bold tracking-[0.2em] text-brand-600 uppercase">Tin mới nhất</p>
              <ul className="mt-3 space-y-3">
                {latest.map((item) => (
                  <li key={item.publicId}>
                    <Link href={`/tin-tuc/${item.slug}`} className="group flex gap-3">
                      <span className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl">
                        <PlaceholderThumb
                          seed={item.slug}
                          src={item.thumbnailUrl}
                          alt=""
                          className="transition-transform duration-500 group-hover:scale-110"
                        />
                      </span>
                      <span className="min-w-0">
                        <span className="line-clamp-2 text-theme-sm leading-snug font-semibold text-navy-800 transition group-hover:text-brand-600">
                          {item.title}
                        </span>
                        <span className="mt-1 block text-theme-xs text-gray-500">{formatDateShort(item.publishedAt)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-6 lg:sticky lg:top-24">
              <div className="hidden rounded-3xl border border-white bg-white/90 p-5 shadow-[0_24px_60px_-34px_rgba(30,64,175,0.45)] backdrop-blur lg:block">
                <p className="flex items-center gap-2 text-theme-xs font-bold tracking-[0.2em] text-brand-600 uppercase">
                  <FiList aria-hidden className="h-4 w-4" />
                  Nội dung bài viết
                </p>
                <ol className="mt-3 space-y-1">
                  {body.sections.map((section, index) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="group flex items-start gap-3 rounded-xl px-2 py-2 text-theme-sm text-gray-700 transition hover:bg-sky-50 hover:text-brand-700"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[11px] font-bold text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white">
                          {index + 1}
                        </span>
                        <span className="pt-0.5 leading-snug">{section.heading}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="relative isolate overflow-hidden rounded-3xl bg-navy-800 p-5 text-white shadow-[0_24px_50px_-24px_rgba(15,23,42,0.7)]">
                <Image src="/images/about/landmark-81-river.jpg" alt="" fill sizes="22rem" className="-z-20 object-cover opacity-30" />
                <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-br from-navy-800/95 via-brand-700/85 to-violet-700/85" />
                <p className="text-lg leading-snug font-bold">Cần tư vấn về dự án?</p>
                <p className="mt-1.5 text-theme-sm leading-relaxed text-white/80">
                  Chuyên viên RealtyHub giải đáp miễn phí về giá, pháp lý và chính sách bán hàng.
                </p>
                <Link
                  href="/lien-he-chung-toi"
                  className="group mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white py-2.5 text-theme-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                >
                  <FiPhoneCall aria-hidden className="h-4 w-4" />
                  Nhận tư vấn
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ── 3. BAI MOI HON / CU HON ───────────────────────────────── */}
      {(newer || older) && (
        <section className="site-container pt-8 md:pt-10">
          <div className="grid gap-4 md:grid-cols-2">
            {older ? <AdjacentLink article={older} direction="older" /> : <span className="hidden md:block" />}
            {newer && <AdjacentLink article={newer} direction="newer" />}
          </div>
        </section>
      )}

      {/* ── 4. TIN CUNG CHUYEN MUC ────────────────────────────────── */}
      {related.length > 0 && (
        <section className="site-container pt-14 md:pt-16">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <SectionEyebrow>Đọc thêm</SectionEyebrow>
            <h2 className="mt-4 text-2xl leading-tight font-bold text-navy-800 md:text-4xl">
              Tin cùng chuyên mục <span className="text-[#3b9bf5]">{NEWS_CATEGORY_LABELS[article.category]}</span>
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <RelatedCard key={item.publicId} article={item} />
            ))}
          </div>
        </section>
      )}

      {/* ── 5. CTA (anh nen mo) ───────────────────────────────────── */}
      <section className="site-container pt-14 md:pt-16">
        <div className="relative isolate overflow-hidden rounded-3xl bg-navy-800 px-6 py-12 text-center text-white md:py-14">
          <Image src="/images/projects/the-global-city.jpg" alt="" fill sizes="1280px" className="-z-20 object-cover opacity-35" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-800/95 via-brand-700/80 to-violet-700/85" />
          <h2 className="mx-auto max-w-2xl text-2xl leading-tight font-bold md:text-3xl">Theo dõi thị trường cùng RealtyHub</h2>
          <p className="mx-auto mt-3 max-w-xl text-theme-sm leading-relaxed text-white/80 md:text-base">
            Tin dự án, phân tích và nhận định thị trường bất động sản được cập nhật mỗi ngày.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/tin-tuc"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-theme-sm font-semibold text-brand-700 transition hover:bg-brand-50"
            >
              Xem tất cả tin tức
              <FiArrowRight aria-hidden className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/du-an"
              className="inline-flex items-center rounded-full border border-white/40 px-6 py-3 text-theme-sm font-semibold text-white transition hover:bg-white/10"
            >
              Khám phá dự án
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

/** The dieu huong sang bai cu hon / moi hon */
const AdjacentLink = ({ article, direction }: { article: NewsArticle; direction: 'older' | 'newer' }) => {
  const isNewer = direction === 'newer';
  return (
    <Link
      href={`/tin-tuc/${article.slug}`}
      className={`group flex items-center gap-4 rounded-3xl border border-white bg-white p-4 shadow-[0_14px_34px_-20px_rgba(30,64,175,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_44px_-20px_rgba(30,64,175,0.5)] ${
        isNewer ? 'flex-row-reverse text-right' : ''
      }`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
        {isNewer ? <FiArrowRight aria-hidden className="h-4 w-4" /> : <FiArrowLeft aria-hidden className="h-4 w-4" />}
      </span>
      <span className="relative hidden h-16 w-24 shrink-0 overflow-hidden rounded-xl sm:block">
        <PlaceholderThumb seed={article.slug} src={article.thumbnailUrl} alt="" />
      </span>
      <span className="min-w-0">
        <span className="block text-theme-xs font-semibold tracking-wide text-gray-500 uppercase">
          {isNewer ? 'Bài mới hơn' : 'Bài trước'}
        </span>
        <span className="mt-0.5 line-clamp-2 text-theme-sm font-bold text-navy-800 transition group-hover:text-brand-600">
          {article.title}
        </span>
      </span>
    </Link>
  );
};

/** The tin cung chuyen muc - cung kieu the o trang danh sach /tin-tuc */
const RelatedCard = ({ article }: { article: NewsArticle }) => {
  const tone = NEWS_CATEGORY_TONE[article.category];
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-white bg-white shadow-[0_14px_34px_-20px_rgba(30,64,175,0.4)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_44px_-20px_rgba(30,64,175,0.5)]">
      <Link href={`/tin-tuc/${article.slug}`} className="relative block aspect-video overflow-hidden bg-gray-100" aria-label={article.title}>
        <PlaceholderThumb
          seed={article.slug}
          src={article.thumbnailUrl}
          alt={article.title}
          className="transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <span className={`absolute top-3 left-3 rounded-full border bg-white/95 px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase shadow-theme-xs ${tone.chip}`}>
          {NEWS_CATEGORY_LABELS[article.category]}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-base leading-snug font-bold text-navy-800">
          <Link href={`/tin-tuc/${article.slug}`} className="transition hover:text-brand-600">
            {article.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-theme-sm leading-relaxed text-gray-500">{article.excerpt}</p>
        <div className="mt-auto flex items-center justify-between pt-4 text-theme-xs text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <FiCalendar aria-hidden className="h-3.5 w-3.5" />
            {formatDateShort(article.publishedAt)}
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
            <FiArrowRight aria-hidden className="h-4 w-4" />
          </span>
        </div>
      </div>
    </article>
  );
};
