'use client';

import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { FiChevronRight } from 'react-icons/fi';
import { useInvestorList } from '@/modules/developer/hooks/useInvestors';
import type { Investor, InvestorSummary } from '@/modules/developer/models/investor.model';

/**
 * Section "CAC CHU DAU TU" tren trang chu.
 *
 * Hien thi dang carousel ngang tu chay (autoplay), responsive:
 *   - Mobile (<640px):   2 logo / viewport (~45%/slide)
 *   - sm  (>=640px):    3 logo / viewport (~30%/slide)
 *   - md  (>=768px):    4 logo / viewport (~22%/slide)
 *   - lg  (>=1024px):   6 logo / viewport (~16.5%/slide)
 *
 * Autoplay 4s/slide, dung khi hover/focus, tat hoan toan neu
 * `prefers-reduced-motion: reduce`. KHONG co dot, KHONG co nut prev/next
 * (mobile dung swipe, desktop dung hover de dung).
 *
 * Source data tu useInvestorList() (InvestorService - single source of truth
 * cho cac investor). Server component route doc data qua HomeService.content()
 * roi truyen xuong qua `initialInvestors` de HTML tra ve co ngay cac logo
 * (SEO + first paint). Client chi refetch khi stale (5 phut).
 *
 * Click logo hoac ten -> /chu-dau-tu/[slug].
 */
type DoitacProps = {
  initialInvestors?: InvestorSummary[];
};

const AUTOPLAY_INTERVAL_MS = 4000;

const Doitac = ({ initialInvestors }: DoitacProps) => {
  const { data, isLoading, isError, refetch } = useInvestorList();

  // Lay data tu hook; initialData (staleTime 5 phut) se co san tu query,
  // nen khong can truyen prop xuong hook. Nhung van fallback neu hook chua
  // co data (trang thai ngay sau SSR).
  const investors = useMemo<Investor[]>(
    () => data?.investors ?? initialInvestors ?? [],
    [data, initialInvestors],
  );

  // Embla carousel - `loop: true` de logo chay vô hanh. Canh theo slide de
  // moi lan cuon nhay nguyen mot slide (khong nhay nua slide).
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: investors.length > 4,
    slidesToScroll: 1,
    skipSnaps: false,
  });

  // Autoplay tat ca breakpoint. Pause khi hover/focus ben trong carousel,
  // resume khi roi di. Tang-thich `prefers-reduced-motion: reduce` thi tat.
  useEffect(() => {
    if (!emblaApi || investors.length < 2) return;

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduceMotion) return;

    let paused = false;
    const container = emblaApi.containerNode();

    const pause = () => {
      paused = true;
    };
    const resume = () => {
      paused = false;
    };

    const timer = window.setInterval(() => {
      if (paused) return;
      emblaApi.scrollNext();
    }, AUTOPLAY_INTERVAL_MS);

    // Pause khi hover/focus ben trong carousel.
    container.addEventListener('mouseenter', pause);
    container.addEventListener('mouseleave', resume);
    container.addEventListener('focusin', pause);
    container.addEventListener('focusout', resume);

    return () => {
      window.clearInterval(timer);
      container.removeEventListener('mouseenter', pause);
      container.removeEventListener('mouseleave', resume);
      container.removeEventListener('focusin', pause);
      container.removeEventListener('focusout', resume);
    };
  }, [emblaApi, investors.length]);

  const showSkeleton = isLoading && investors.length === 0;

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="site-container">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wide text-gray-900 md:text-2xl">
              Đối tác chiến lược của Realty Hub
            </h2>
          </div>

          <Link
            href="/chu-dau-tu"
            className="inline-flex items-center gap-1 text-theme-sm font-medium text-brand-600 transition hover:text-brand-700"
          >
            Xem tất cả
            <FiChevronRight aria-hidden />
          </Link>
        </div>

        {/* ── Error/Skeleton fallback ───────────────────────────────────── */}
        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : showSkeleton ? (
          <LogoSkeletonStrip />
        ) : (
          // Embla viewport - carousel ngang, responsive slide width.
          // KHONG co nut prev/next, KHONG co dot. Tu chay (autoplay), nguoi
          // dung dung bang hover (desktop) hoac swipe (touch).
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex gap-4">
              {investors.map((investor) => (
                <div
                  key={investor.slug}
                  className="flex-[0_0_45%] min-w-0 sm:flex-[0_0_30%] md:flex-[0_0_22%] lg:flex-[0_0_calc((100%-5*1rem)/6)]"
                >
                  <InvestorLogoCard investor={investor} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

/** Card logo + ten. Click chuyen den /chu-dau-tu/[slug]. */
const InvestorLogoCard = ({ investor }: { investor: Investor }) => (
  <Link
    href={`/chu-dau-tu/${investor.slug}`}
    aria-label={`Xem chi tiết chủ đầu tư ${investor.name}`}
    className="group flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-5 transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card"
  >
    {/* Logo khung co dinh (aspect-square) de cac logo PNG/WebP kich thuoc
        khac nhau deu render can doi. object-contain giup khong crop. */}
    <span className="relative flex h-16 w-full items-center justify-center overflow-hidden">
      <img
        src={investor.logo}
        alt={investor.name}
        loading="lazy"
        width={128}
        height={128}
        className="max-h-16 w-auto max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
      />
    </span>

    <span className="line-clamp-1 text-center text-theme-xs font-semibold uppercase tracking-wide text-gray-700 transition group-hover:text-brand-600">
      {investor.name}
    </span>
  </Link>
);

/** Skeleton cho luc loading - 6 the logo de giu layout carousel on dinh. */
const LogoSkeletonStrip = () => (
  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
    {Array.from({ length: 6 }).map((_, idx) => (
      <div
        key={idx}
        className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-5"
      >
        <div className="h-16 w-full animate-pulse rounded bg-gray-100" />
        <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
      </div>
    ))}
  </div>
);

const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <div className="rounded-xl border border-error-500/30 bg-error-50 p-6 text-center">
    <p className="mb-3 text-theme-sm text-error-600">
      Không tải được danh sách chủ đầu tư.
    </p>
    <button
      type="button"
      onClick={onRetry}
      className="rounded-md bg-brand-500 px-4 py-2 text-theme-sm font-semibold text-white transition hover:bg-brand-600"
    >
      Thử lại
    </button>
  </div>
);

export default Doitac;
