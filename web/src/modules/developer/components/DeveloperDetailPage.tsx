'use client';

import Link from 'next/link';
import type { IconType } from 'react-icons';
import { FiArrowRight, FiBriefcase, FiCalendar, FiExternalLink, FiFileText, FiGlobe, FiHome, FiTrendingUp } from 'react-icons/fi';
import { formatNumber } from '@/common/utils/format';
import { STATUS_LABELS } from '@/modules/project/models/project.model';
import type { Project, ProjectStatus } from '@/modules/project/models/project.model';
import { useInvestorDetail } from '../hooks/useInvestors';
import { InvestorService } from '../services/investor.service';
import type { Investor, InvestorSummary } from '../models/investor.model';

/**
 * Trang /chu-dau-tu/[slug] - chi tiet mot chu dau tu.
 *
 * Single source of truth: InvestorService (25 records, dong bo voi
 * section "CAC CHU DAU TU" tren trang chu va trang /chu-dau-tu list).
 *
 * Server component route doc data roi truyen xuong qua props de tranh
 * hydration mismatch. Client chi refetch khi can.
 *
 * Cac section:
 *   1. Hero: logo that (URL tu realtyhub.com.vn) + ten + 3 stats
 *   2. Thong tin chinh (so du an, tong so can/san pham)
 *   3. CTA sang /quy-can loc theo chu dau tu
 *   4. Danh sach cac du an thuoc chu dau tu
 */

type InvestorDetailPageProps = {
  slug: string;
  initialInvestor?: Investor | null;
  initialSummary?: InvestorSummary | null;
};

const InvestorDetailPage = ({
  slug,
  initialInvestor,
  initialSummary,
}: InvestorDetailPageProps) => {
  // Hook tra ve investor ngay tu query cache (initialData), chi refetch
  // khi stale. Server truyen initialInvestor roi nen luon co data.
  const detailQuery = useInvestorDetail(slug, initialInvestor);
  const investor = detailQuery.data ?? initialInvestor;

  if (!investor) {
    return (
      <div className="site-container py-16 text-center">
        <p className="text-theme-sm text-gray-500">Đang tải...</p>
      </div>
    );
  }

  // Lay project list dong bo (projectsSync) - khong can them query.
  const projects: Project[] = InvestorService.projectsSync(slug);

  // Anh nen hero: anh du an dau tien cua chu dau tu, khong co thi anh mac dinh
  const heroImage = projects.find((p) => p.thumbnailUrl)?.thumbnailUrl || '/images/projects/vinhomes-grand-park.jpg';

  const sortedProjects: Project[] = [...projects].sort((a, b) => {
    // Sap xep: dang-mo-ban -> sap-mo-ban -> moi-mo-ban -> da-ban-giao -> cac status khac
    const order: Record<ProjectStatus, number> = {
      'dang-mo-ban': 0,
      'sap-mo-ban': 1,
      'moi-mo-ban': 2,
      'da-ban-giao': 3,
      'da-ban-het': 4,
      'ban-chay': 5,
      'tat-ca': 6,
    };
    return order[a.status] - order[b.status];
  });

  return (
    <div className="bg-gray-25">
      {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
      <section className="site-container pt-6 pb-4 md:pt-8">
        <div className="relative isolate overflow-hidden rounded-3xl border border-white bg-gradient-to-br from-white via-[#f3f7ff] to-[#e4eeff] p-5 shadow-[0_20px_50px_-25px_rgba(30,64,175,0.35)] sm:p-8 lg:p-10">
          {/* Anh thanh pho hoa vao nen ben phai */}
          <div
            aria-hidden
            className="absolute inset-y-0 right-0 -z-10 hidden w-[42%] md:block xl:w-[40%] [mask-image:linear-gradient(to_right,transparent,black_40%)]"
          >
            <img src={heroImage} alt="" className="h-full w-full object-cover" />
          </div>
          <span aria-hidden className="absolute -bottom-24 -left-20 -z-10 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl" />

          <div className="grid items-center gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[340px_minmax(0,1fr)]">
            {/* Logo */}
            <div className="relative mx-auto flex aspect-square w-full max-w-[220px] items-center justify-center overflow-hidden rounded-2xl border border-white bg-white p-6 shadow-[0_18px_40px_-20px_rgba(30,64,175,0.45)] sm:max-w-[260px] lg:max-w-none">
              <img
                src={investor.logo}
                alt={investor.name}
                width={256}
                height={256}
                className="relative max-h-full w-auto max-w-full object-contain"
              />
            </div>

            {/* Thong tin */}
            <div className="min-w-0 lg:max-w-[680px] xl:max-w-[720px]">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/80 px-3.5 py-1 text-theme-xs font-bold tracking-[0.12em] text-brand-700 uppercase">
                <FiBriefcase aria-hidden className="h-3.5 w-3.5" />
                Chủ đầu tư
              </span>

              <h1 className="mt-3 text-2xl leading-tight font-bold text-navy-800 uppercase sm:text-3xl md:text-4xl">
                {investor.name}
              </h1>

              <p className="mt-3 max-w-xl text-theme-sm leading-relaxed text-gray-800 md:text-base">
                {investor.name} là một trong những chủ đầu tư hàng đầu tại Việt Nam, đang có dự án trên RealtyHub.
                Xem các dự án đang mở bán, bảng giá và thông tin pháp lý bên dưới.
              </p>

              {/* 3 chi so */}
              <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Stat
                  icon={FiCalendar}
                  tone="bg-brand-50 text-brand-600"
                  arrowTone="bg-brand-50 text-brand-600"
                  href="#du-an"
                  label="Dự án"
                  value={formatNumber(initialSummary?.projectCount ?? projects.length)}
                  suffix="dự án"
                />
                <Stat
                  icon={FiTrendingUp}
                  tone="bg-emerald-50 text-emerald-600"
                  arrowTone="bg-emerald-50 text-emerald-600"
                  href="#du-an"
                  label="Đang mở bán"
                  value={formatNumber(
                    initialSummary?.openingProjectCount ?? projects.filter((p) => p.status === 'dang-mo-ban').length,
                  )}
                  suffix="mở bán"
                />
                <Stat
                  icon={FiFileText}
                  tone="bg-violet-50 text-violet-600"
                  arrowTone="bg-violet-50 text-violet-600"
                  href={`/quy-can?cdt=${encodeURIComponent(slug)}`}
                  label="Căn còn hàng"
                  value={formatNumber(initialSummary?.availableUnitCount ?? 0)}
                  suffix="căn"
                />
              </dl>

              <Link
                href={`/quy-can?cdt=${encodeURIComponent(slug)}`}
                className="group mt-6 inline-flex max-w-full items-center gap-2.5 rounded-full bg-gradient-to-r from-brand-500 to-navy-800 px-5 py-3 text-theme-sm font-semibold text-white shadow-[0_12px_30px_-12px_rgba(15,111,209,0.8)] transition hover:brightness-110 sm:px-6"
              >
                <FiHome aria-hidden className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  Xem sản phẩm đang bán của <strong className="uppercase">{investor.name}</strong>
                </span>
                <FiArrowRight aria-hidden className="shrink-0 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. DU AN THUOC CHU DAU TU ──────────────────────────────────── */}
      <section id="du-an" className="site-container scroll-mt-24 py-10 md:py-14">
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-theme-xs font-bold uppercase tracking-[0.22em] text-brand-600">
              <span aria-hidden className="h-px w-8 bg-current opacity-60" />
              Danh mục
            </span>
            <h2 className="mt-4 text-2xl font-bold uppercase leading-tight tracking-tight text-navy-800 md:text-3xl">
              Dự án thuộc {investor.name}
              <span className="ml-2 align-middle text-lg font-bold text-gray-400">
                ({projects.length})
              </span>
            </h2>
            <p className="mt-3 text-base leading-relaxed text-gray-600">
              Toàn bộ dự án của {investor.name} đang được giới thiệu trên
              RealtyHub. Click vào từng thẻ để xem chi tiết, bảng giá và pháp lý.
            </p>
          </div>

          {projects.length > 0 && (
            <Link
              href={`/du-an?cdt=${encodeURIComponent(slug)}`}
              className="group inline-flex shrink-0 items-center gap-2 text-theme-sm font-semibold text-brand-600 transition hover:text-brand-700"
            >
              Lọc dự án của {investor.name} trong trang /du-an
              <FiArrowRight
                aria-hidden
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <p className="text-theme-sm text-gray-500">
              Hiện chưa có dự án nào của {investor.name} trên hệ thống.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {sortedProjects.map((project) => (
              <article
                key={project.publicId}
                className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-card transition hover:border-brand-200 hover:shadow-card-hover overflow-hidden"
              >
                {/* Ảnh cover 16:9 */}
                <Link
                  href={`/du-an/${project.slug}`}
                  className="group relative block aspect-video w-full overflow-hidden bg-gray-100"
                >
                  <img
                    src={project.thumbnailUrl || '/images/projects/vinhomes-grand-park.jpg'}
                    alt={project.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  {/* Status badge trên ảnh */}
                  <span
                    className={`absolute bottom-3 left-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide backdrop-blur-sm ${
                      project.status === 'dang-mo-ban'
                        ? 'bg-success-500/90 text-white'
                        : project.status === 'sap-mo-ban'
                          ? 'bg-warning-500/90 text-white'
                          : 'bg-gray-500/90 text-white'
                    }`}
                  >
                    {STATUS_LABELS[project.status]}
                  </span>
                </Link>

                {/* Nội dung */}
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/du-an/${project.slug}`}
                      className="line-clamp-2 text-base font-bold uppercase tracking-wide text-gray-900 transition hover:text-brand-600"
                    >
                      {project.name}
                    </Link>
                  </div>

                  <p className="line-clamp-2 text-theme-xs leading-relaxed text-gray-600">
                    {project.tagline}
                  </p>

                  <Link
                    href={`/du-an/${project.slug}`}
                    className="group/more mt-2 inline-flex items-center gap-1.5 self-start text-theme-sm font-semibold text-brand-600 transition hover:text-brand-700"
                  >
                    Xem chi tiết
                    <FiArrowRight
                      aria-hidden
                      className="transition-transform group-hover/more:translate-x-1"
                    />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

/** The chi so trong hero: icon tron mau, so lon, mui ten */
const Stat = ({
  icon: Icon,
  tone,
  arrowTone,
  href,
  label,
  value,
  suffix,
}: {
  icon: IconType;
  tone: string;
  arrowTone: string;
  href: string;
  label: string;
  value: string;
  suffix?: string;
}) => (
  <Link
    href={href}
    className="group flex items-center gap-3 rounded-2xl border border-white bg-white/85 p-4 shadow-[0_10px_30px_-16px_rgba(30,64,175,0.35)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-white"
  >
    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${tone}`}>
      <Icon aria-hidden className="h-5 w-5" />
    </span>
    <div className="min-w-0 flex-1">
      <dt className="truncate text-[11px] font-semibold tracking-wide whitespace-nowrap text-gray-500 uppercase">{label}</dt>
      <dd className="mt-0.5 flex items-baseline gap-1">
        <span className="text-2xl leading-none font-bold text-navy-800">{value}</span>
        {suffix && <span className="text-theme-xs text-gray-500">{suffix}</span>}
      </dd>
    </div>
    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition group-hover:translate-x-0.5 ${arrowTone}`}>
      <FiArrowRight aria-hidden className="h-3.5 w-3.5" />
    </span>
  </Link>
);

export default InvestorDetailPage;
