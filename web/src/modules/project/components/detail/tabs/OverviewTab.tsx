'use client';

import { useState } from 'react';
import { FiArrowUpRight, FiPhone } from 'react-icons/fi';
import type { ProjectDetail } from '../../../models/project-detail.model';
import ProjectDescription from '../ProjectDescription';
import ProjectSpecs from '../ProjectSpecs';
import {
  CarouselDots,
  MediaFrame,
  PlayOverlay,
  SectionHeading,
} from '../shared';

const PRODUCTS_PER_PAGE = 3;
const AMENITIES_PER_PAGE = 4;

/** Chia mot mang thanh cac trang co do dai `size` */
const paginate = <T,>(items: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, page) =>
    items.slice(page * size, page * size + size),
  );

/** Tieu de muc trong tab: nhan nho + tieu de + mo ta, can giua */
const BlockHeading = ({
  eyebrow,
  title,
  subtitle,
  tone = 'light',
  eyebrowClass = 'bg-brand-50 text-brand-600',
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  tone?: 'light' | 'dark';
  /** Mau nhan nho phia tren tieu de (che do sang) */
  eyebrowClass?: string;
}) => (
  <div className="mx-auto mb-7 max-w-2xl text-center">
    <span
      className={`inline-block rounded-full px-3.5 py-1 text-theme-xs font-bold tracking-[0.14em] uppercase ${
        tone === 'dark' ? 'bg-white/15 text-sky-100' : eyebrowClass
      }`}
    >
      {eyebrow}
    </span>
    <h2
      className={`mt-3 text-2xl font-bold tracking-tight sm:text-3xl ${
        tone === 'dark' ? 'text-white' : 'text-navy-800'
      }`}
    >
      {title}
    </h2>
    {subtitle && (
      <p className={`mt-2 text-theme-sm sm:text-base ${tone === 'dark' ? 'text-sky-100/85' : 'text-gray-500'}`}>
        {subtitle}
      </p>
    )}
  </div>
);

/**
 * Khoi ke chuyen: video tran chieu rong, the chu nam ngay ben duoi (khong de
 * len video - de len thi che mat phan duoi anh/video).
 */
const StoryPanel = ({
  title,
  body,
  thumbnailUrl,
  seed,
}: {
  title: string;
  body: string;
  thumbnailUrl: string;
  seed: string;
}) => (
  <section>
    <button
      type="button"
      className="group relative block w-full overflow-hidden rounded-3xl text-left shadow-[0_24px_60px_-30px_rgba(11,33,67,0.6)]"
    >
      <MediaFrame
        seed={seed}
        src={thumbnailUrl}
        alt={`Video giới thiệu: ${title}`}
        ratio="aspect-21/9"
        className="rounded-none"
      />
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy-900/55 via-transparent to-transparent" />
      <PlayOverlay label={`Phát video: ${title}`} />
    </button>

    <div className="mx-auto mt-5 max-w-5xl rounded-2xl border border-sky-100 bg-gradient-to-b from-[#eef6ff] to-white px-5 py-6 text-center shadow-[0_16px_40px_-28px_rgba(15,111,209,0.5)] sm:px-10">
      <h2 className="text-xl font-bold tracking-tight text-navy-800 sm:text-2xl">{title}</h2>
      <span aria-hidden className="brand-gradient mx-auto mt-3 block h-1 w-14 rounded-full" />
      <p className="mx-auto mt-3 max-w-3xl text-theme-sm leading-relaxed text-gray-600 sm:text-base">{body}</p>
    </div>
  </section>
);

const OverviewTab = ({ project }: { project: ProjectDetail }) => {
  const [sheetKey, setSheetKey] = useState(project.masterPlan[0]?.key ?? '');
  const [productPage, setProductPage] = useState(0);
  const [amenityPage, setAmenityPage] = useState(0);

  const activeSheet =
    project.masterPlan.find((sheet) => sheet.key === sheetKey) ?? project.masterPlan[0];

  const productPages = paginate(project.products, PRODUCTS_PER_PAGE);
  const amenityPages = paginate(project.amenities, AMENITIES_PER_PAGE);

  return (
    <div className="space-y-14">
      {/* Bang anh hero va dai chi so da chuyen len ProjectHero o dau trang -
          chung thuoc ve ca trang chu khong rieng tab nay. */}

      {/* Tong quan du an: phoi canh -> mo ta -> luoi thong so */}
      <section>
        {/* Muc duy nhat can trai: ben duoi la doan mo ta dai chay theo le trai */}
        <SectionHeading title="Tổng quan dự án" subtitle={project.tagline} align="left" />

        <div className="relative overflow-hidden rounded-3xl shadow-[0_24px_60px_-30px_rgba(11,33,67,0.55)]">
          <MediaFrame
            seed={`${project.publicId}-overview`}
            src={project.overviewImageUrl}
            alt={`Phối cảnh tổng thể ${project.name}`}
            ratio="aspect-21/9"
            className="rounded-none"
          />
          <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-900/45 via-transparent to-transparent" />
          <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-1.5 text-theme-sm font-semibold text-navy-800 shadow-theme-md backdrop-blur sm:bottom-6 sm:left-6">
            <span aria-hidden className="h-2 w-2 rounded-full bg-brand-500" />
            Phối cảnh tổng thể {project.name}
          </span>
        </div>

        <div className="relative mt-6 overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-[#eaf3ff] via-white to-[#e6f1ff] p-5 sm:p-8">
          <span aria-hidden className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-brand-200/40 blur-3xl" />
          <span aria-hidden className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-sky-200/50 blur-3xl" />
          <p className="relative mb-3 flex items-center gap-2 text-theme-xs font-bold tracking-[0.14em] text-brand-600 uppercase">
            <span aria-hidden className="brand-gradient h-1 w-6 rounded-full" />
            Giới thiệu dự án
          </p>
          <div className="relative">
            <ProjectDescription html={project.description} />
          </div>
        </div>

        <ProjectSpecs project={project} />
      </section>

      {/* Mat bang: panel nen xanh nhat, ban ve nam trong the trang */}
      {activeSheet && (
        <section className="relative overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-[#d9ebff] via-[#eef5ff] to-[#e2edff] px-4 py-8 sm:px-8 sm:py-10">
          <span aria-hidden className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-sky-300/40 blur-3xl" />
          <span aria-hidden className="absolute -right-16 -bottom-24 h-72 w-72 rounded-full bg-brand-200/50 blur-3xl" />

          <div className="relative">
            <BlockHeading
              eyebrow="Quy hoạch"
              title="Mặt bằng"
              subtitle="Thiết kế chi tiết các phân khu"
              eyebrowClass="bg-white text-brand-600 shadow-theme-xs"
            />

            <div className="mb-6 flex justify-center">
              <div className="no-scrollbar inline-flex max-w-full gap-1 overflow-x-auto rounded-full border border-sky-100 bg-white p-1 shadow-theme-xs">
                {project.masterPlan.map((sheet) => {
                  const isActive = sheet.key === activeSheet.key;
                  return (
                    <button
                      key={sheet.key}
                      type="button"
                      onClick={() => setSheetKey(sheet.key)}
                      aria-pressed={isActive}
                      className={`shrink-0 rounded-full px-4 py-2 text-theme-sm font-semibold whitespace-nowrap transition ${
                        isActive
                          ? 'brand-gradient text-white shadow-md'
                          : 'text-gray-600 hover:bg-brand-50 hover:text-brand-600'
                      }`}
                    >
                      {sheet.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-white bg-white p-2 shadow-[0_20px_50px_-28px_rgba(15,111,209,0.45)] sm:p-4">
              <MediaFrame
                seed={`${project.publicId}-plan-${activeSheet.key}`}
                src={activeSheet.imageUrl}
                alt={`Mặt bằng ${activeSheet.label} - ${project.name}`}
                label={`Mặt bằng ${activeSheet.label}`}
                ratio="aspect-3/2"
                fit="contain"
                className="bg-white"
              />
            </div>
          </div>
        </section>
      )}

      {/* San pham */}
      {productPages.length > 0 && (
        <section className="relative overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-[#e6f2ff] via-[#f6faff] to-[#e9f0ff] px-4 py-8 sm:px-8 sm:py-10">
          <span aria-hidden className="absolute -top-24 -right-20 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl" />
          <span aria-hidden className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl" />
          <div className="relative">
          <BlockHeading
            eyebrow="Dòng sản phẩm"
            title="Sản phẩm"
            subtitle="Đa dạng lựa chọn cho mọi nhu cầu"
            eyebrowClass="bg-white text-brand-600 shadow-theme-xs"
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {productPages[Math.min(productPage, productPages.length - 1)].map((product, index) => (
              <article
                key={product.publicId}
                className="group overflow-hidden rounded-2xl border border-white bg-white shadow-[0_14px_34px_-24px_rgba(11,33,67,0.5)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_44px_-24px_rgba(15,111,209,0.55)]"
              >
                <div className="relative overflow-hidden">
                  <MediaFrame
                    seed={product.publicId}
                    src={product.imageUrl}
                    alt={product.name}
                    ratio="aspect-4/3"
                    className="rounded-none transition duration-700 group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-brand-600 text-theme-xs font-bold text-white shadow-theme-md ring-2 ring-white/70">
                    {String(productPage * PRODUCTS_PER_PAGE + index + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="flex items-center gap-3 p-4 sm:p-5">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold tracking-wide text-navy-800 uppercase">{product.name}</h3>
                    <p className="mt-1 text-theme-sm text-gray-500">{product.areaLabel}</p>
                  </div>
                  <span
                    aria-hidden
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white"
                  >
                    <FiArrowUpRight />
                  </span>
                </div>
              </article>
            ))}
          </div>

          <CarouselDots
            count={productPages.length}
            current={productPage}
            onSelect={setProductPage}
            label="Trang sản phẩm"
          />
          </div>
        </section>
      )}

      {/* Tien ich */}
      {amenityPages.length > 0 && (
        <section className="relative overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-[#dff0ff] via-[#f2f8ff] to-[#e4eeff] px-4 py-8 sm:px-8 sm:py-10">
          <span aria-hidden className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-sky-300/40 blur-3xl" />
          <span aria-hidden className="absolute -right-20 -bottom-24 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl" />
          <div className="relative">
          <BlockHeading
            eyebrow="Nội khu"
            title="Tiện ích"
            subtitle="Hệ thống tiện ích nội khu đồng bộ"
            eyebrowClass="bg-white text-brand-600 shadow-theme-xs"
          />

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {amenityPages[Math.min(amenityPage, amenityPages.length - 1)].map((amenity) => (
              <figure
                key={amenity.publicId}
                className="group relative overflow-hidden rounded-2xl shadow-[0_14px_34px_-22px_rgba(11,33,67,0.6)]"
              >
                <MediaFrame
                  seed={amenity.publicId}
                  src={amenity.imageUrl}
                  alt={amenity.name}
                  ratio="aspect-16/9"
                  className="rounded-none transition duration-700 group-hover:scale-105"
                />
                <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy-900/85 via-navy-900/10 to-transparent" />
                <figcaption className="absolute inset-x-0 bottom-0 p-4">
                  <span aria-hidden className="amenity-bar mb-2.5 w-14 group-hover:w-24" />
                  <span className="block text-theme-sm leading-snug font-semibold text-white sm:text-base">
                    {amenity.name}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>

          <CarouselDots
            count={amenityPages.length}
            current={amenityPage}
            onSelect={setAmenityPage}
            label="Trang tiện ích"
          />
          </div>
        </section>
      )}

      <StoryPanel
        title={project.closing.title}
        body={project.closing.body}
        thumbnailUrl={project.closing.videoThumbnailUrl}
        seed={`${project.publicId}-closing`}
      />

      {/* Lien he tu van: dai nen xanh thuong hieu, the trang ben trong */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-800 via-brand-700 to-sky-500 px-4 py-10 sm:px-8 sm:py-12">
        <span aria-hidden className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-sky-400/25 blur-3xl" />
        <span aria-hidden className="absolute -right-16 -bottom-28 h-80 w-80 rounded-full bg-white/10 blur-2xl" />

        <div className="relative">
          <BlockHeading
            tone="dark"
            eyebrow="Hỗ trợ 24/7"
            title="Liên hệ tư vấn"
            subtitle="Đội ngũ chuyên viên sẵn sàng hỗ trợ bạn 24/7"
          />

          {/* Laptop tro len: tat ca chuyen vien tren mot hang */}
          <div
            className={`mx-auto grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5 ${
              project.consultants.length >= 3 ? 'max-w-6xl lg:grid-cols-3' : 'max-w-3xl'
            }`}
          >
            {project.consultants.map((consultant) => (
              <div
                key={consultant.publicId}
                className="flex flex-col items-center rounded-2xl border border-white/60 bg-white px-6 pt-7 pb-6 text-center shadow-[0_20px_44px_-22px_rgba(8,24,50,0.7)] transition hover:-translate-y-0.5"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-brand-600 text-2xl text-white ring-4 ring-brand-50">
                  <FiPhone aria-hidden />
                </span>

                <p className="mt-4 text-theme-xs font-bold tracking-[0.15em] text-brand-600 uppercase">{consultant.role}</p>
                <p className="mt-1 text-base font-medium text-gray-700">{consultant.name}</p>

                <a
                  href={`tel:${consultant.phone.replace(/\s/g, '')}`}
                  className="mt-2 text-2xl font-bold tracking-wide text-navy-800 transition hover:text-brand-600"
                >
                  {consultant.phone}
                </a>

                <a
                  href={`tel:${consultant.phone.replace(/\s/g, '')}`}
                  className="mt-5 inline-flex w-full max-w-[220px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-brand-600 px-5 py-2.5 text-theme-sm font-bold tracking-wide text-white uppercase shadow-[0_10px_22px_-10px_rgba(15,111,209,0.8)] transition hover:brightness-110"
                >
                  <FiPhone aria-hidden />
                  Liên hệ ngay
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default OverviewTab;
