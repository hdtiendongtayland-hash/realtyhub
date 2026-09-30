'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import {
  FiArrowRight,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiCompass,
  FiInfo,
  FiMapPin,
  FiMaximize2,
  FiX,
} from 'react-icons/fi';
import type {
  AnalysisImage,
  AnalysisPriceGroup,
  AnalysisUnitType,
  ProjectAnalysis,
} from '../../../models/project-detail.model';
import { TabEmptyState } from '../shared';

/**
 * Tab "Phan tich": bai phan tich du an chia 4 phan co dinh (Key ban hang, Thi
 * truong, So sanh, Huong view). Thanh muc luc dinh ngay duoi thanh tab du an,
 * to dam phan dang doc. Moi anh bam duoc de xem lon - mat bang can ho co chu
 * nho, xem trong khung nho khong doc noi.
 */

const SECTIONS = [
  { id: 'phan-tich-key-ban-hang', label: 'Key bán hàng' },
  { id: 'phan-tich-thi-truong', label: 'Thị trường' },
  { id: 'phan-tich-so-sanh', label: 'So sánh' },
  { id: 'phan-tich-huong-view', label: 'Hướng view' },
] as const;

/** Dinh ngay duoi SiteHeader (4rem) + thanh tab du an (do o ProjectTabNav) */
const STICKY_TOP = 'top-[calc(4rem+var(--project-tabnav-h,57px))]';
/** Cuon toi mot phan: chua cho hai thanh tren va thanh muc luc (~60px) */
const SECTION_SCROLL_MARGIN = 'scroll-mt-[calc(4rem+var(--project-tabnav-h,57px)+72px)]';

// ── Xem anh lon ───────────────────────────────────────────────────────────

type LightboxState = { images: AnalysisImage[]; index: number } | null;

const Lightbox = ({
  state,
  onClose,
  onMove,
}: {
  state: LightboxState;
  onClose: () => void;
  onMove: (step: number) => void;
}) => {
  const isOpen = state !== null;

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') onMove(1);
      if (event.key === 'ArrowLeft') onMove(-1);
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, onMove]);

  if (!state) return null;
  const image = state.images[state.index];
  const hasMany = state.images.length > 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={image.caption}
      className="fixed inset-0 z-50 flex flex-col bg-black/90 p-3 sm:p-6"
    >
      <div className="flex shrink-0 items-center justify-between gap-3 pb-3 text-white">
        <p className="min-w-0 truncate text-theme-sm">
          {image.caption}
          {hasMany && (
            <span className="ml-2 text-white/60">
              {state.index + 1}/{state.images.length}
            </span>
          )}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng ảnh"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
        >
          <FiX className="h-5 w-5" aria-hidden />
        </button>
      </div>

      <div className="relative min-h-0 flex-1">
        <Image src={image.src} alt={image.caption} fill sizes="100vw" className="object-contain" />
        {hasMany && (
          <>
            <button
              type="button"
              onClick={() => onMove(-1)}
              aria-label="Ảnh trước"
              className="absolute top-1/2 left-0 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30"
            >
              <FiChevronLeft className="h-6 w-6" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => onMove(1)}
              aria-label="Ảnh sau"
              className="absolute top-1/2 right-0 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30"
            >
              <FiChevronRight className="h-6 w-6" aria-hidden />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

/** Mot anh trong bai: bam de xem lon, chu thich ben duoi */
const Figure = ({
  image,
  onOpen,
  sizes = '(min-width: 1024px) 50vw, 100vw',
  className = '',
}: {
  image: AnalysisImage;
  onOpen: () => void;
  sizes?: string;
  className?: string;
}) => (
  <figure className={className}>
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Xem lớn: ${image.caption}`}
      className={`group relative block w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 ${
        image.ratio ?? 'aspect-16/9'
      }`}
    >
      <Image
        src={image.src}
        alt={image.caption}
        fill
        sizes={sizes}
        className="object-cover transition duration-500 group-hover:scale-[1.02]"
      />
      <span className="absolute right-2.5 bottom-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white opacity-80 transition group-hover:opacity-100">
        <FiMaximize2 className="h-4 w-4" aria-hidden />
      </span>
    </button>
    <figcaption className="mt-2 text-center text-theme-xs text-gray-500">{image.caption}</figcaption>
  </figure>
);

// ── Khung chung ───────────────────────────────────────────────────────────

const SectionHeader = ({
  index,
  eyebrow,
  title,
  description,
}: {
  index: number;
  eyebrow: string;
  title: string;
  description?: string;
}) => (
  <header className="mb-6 max-w-3xl">
    <p className="mb-2 flex items-center gap-2 text-theme-xs font-bold tracking-wide text-brand-600 uppercase">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-[11px] text-white">
        {index}
      </span>
      {eyebrow}
    </p>
    <h2 className="text-xl leading-snug font-bold text-gray-900 sm:text-2xl">{title}</h2>
    {description && (
      <p className="mt-3 text-theme-sm leading-relaxed text-gray-600">{description}</p>
    )}
  </header>
);

const SubHeading = ({ children }: { children: ReactNode }) => (
  <h3 className="mb-4 border-l-4 border-brand-500 pl-3 text-lg font-bold text-gray-900">
    {children}
  </h3>
);

const CheckList = ({ items, className = '' }: { items: string[]; className?: string }) => (
  <ul className={`space-y-2.5 ${className}`}>
    {items.map((item) => (
      <li key={item} className="flex gap-2.5 text-theme-sm leading-relaxed text-gray-700">
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-50 text-success-600">
          <FiCheck className="h-3.5 w-3.5" aria-hidden />
        </span>
        {item}
      </li>
    ))}
  </ul>
);

const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-card sm:p-6 ${className}`}>
    {children}
  </div>
);

// ── Phan 1: loai can ──────────────────────────────────────────────────────

const UnitTypeTabs = ({
  unitTypes,
  onOpenImage,
}: {
  unitTypes: AnalysisUnitType[];
  onOpenImage: (images: AnalysisImage[], index: number) => void;
}) => {
  const [activeKey, setActiveKey] = useState(unitTypes[0]?.key);
  const [imageIndex, setImageIndex] = useState(0);
  const unit = unitTypes.find((item) => item.key === activeKey) ?? unitTypes[0];
  if (!unit) return null;

  const image = unit.images[Math.min(imageIndex, unit.images.length - 1)];

  return (
    <Card>
      <div
        role="tablist"
        aria-label="Loại căn"
        className="no-scrollbar mb-5 flex gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1"
      >
        {unitTypes.map((item) => {
          const isActive = item.key === unit.key;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                setActiveKey(item.key);
                setImageIndex(0);
              }}
              className={`flex-1 shrink-0 rounded-lg px-4 py-2.5 text-theme-sm whitespace-nowrap transition ${
                isActive
                  ? 'bg-white font-semibold text-brand-600 shadow-sm'
                  : 'text-gray-600 hover:text-brand-600'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="min-w-0 lg:col-span-2">
          <h4 className="text-lg font-bold text-gray-900">{unit.title}</h4>
          <p className="mt-1 text-theme-sm text-gray-500">{unit.areaLabel}</p>

          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Các layout">
            {unit.layouts.map((layout) => (
              <li
                key={layout.code}
                className="rounded-lg border border-brand-100 bg-brand-50 px-3 py-1.5 text-theme-xs text-gray-700"
              >
                <strong className="font-bold text-brand-600">{layout.code}</strong> · {layout.area}
                {layout.note && <span className="text-gray-500"> · {layout.note}</span>}
              </li>
            ))}
          </ul>

          <p className="mt-5 mb-3 text-theme-xs font-bold tracking-wide text-gray-500 uppercase">
            Điểm mạnh layout
          </p>
          <CheckList items={unit.strengths} />
        </div>

        <div className="min-w-0 lg:col-span-3">
          <Figure
            image={image}
            onOpen={() => onOpenImage(unit.images, unit.images.indexOf(image))}
            sizes="(min-width: 1024px) 60vw, 100vw"
          />
          {unit.images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {unit.images.map((item, index) => (
                <button
                  key={item.src}
                  type="button"
                  onClick={() => setImageIndex(index)}
                  aria-label={item.caption}
                  aria-pressed={item === image}
                  className={`relative aspect-16/9 overflow-hidden rounded-lg border-2 transition ${
                    item === image ? 'border-brand-500' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={item.src} alt="" fill sizes="160px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// ── Phan 3: bieu do khoang gia ────────────────────────────────────────────

const PRICE_MIN = 40;
const PRICE_MAX = 180;
const PRICE_TICKS = [50, 75, 100, 125, 150, 175];
const toPercent = (value: number) => ((value - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
const formatRange = (min: number, max: number) => (min === max ? `${min}` : `${min}–${max}`);

/**
 * Khoang gia moi du an tren CUNG mot truc (trieu/m²). Du an dang xem to mau
 * thuong hieu, con lai xam; so lieu ghi thang canh thanh nen khong phu thuoc
 * vao mau. Du an mot muc gia ve thanh cham tron.
 */
const PriceRangeChart = ({ groups }: { groups: AnalysisPriceGroup[] }) => {
  /**
   * Dien thoai: ten + gia mot dong, thanh gia rong het khung ben duoi.
   * Tu sm: ba cot ten | thanh | gia - gia co cot RIENG nen khong bao gio tran
   * ra ngoai khung (truoc day nhan gia dat sau dau thanh, thanh gan mep phai
   * la nhan day ca trang rong ra tren iPad / dien thoai).
   */
  const rowGrid = 'sm:grid sm:grid-cols-[11rem_1fr_8.5rem] sm:items-center sm:gap-3 lg:grid-cols-[13rem_1fr_9rem]';

  const valueLabel = (row: AnalysisPriceGroup['rows'][number]) => (
    <span
      className={`text-theme-xs whitespace-nowrap ${
        row.isSubject ? 'font-bold text-brand-700' : 'text-gray-600'
      }`}
    >
      {formatRange(row.min, row.max)}
      {row.note && <span className="font-normal text-gray-400"> · {row.note}</span>}
    </span>
  );

  return (
    <Card className="overflow-hidden">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-3">
        <SubHeading>Khoảng giá trên cùng một thước đo</SubHeading>
        <p className="mb-4 text-theme-xs text-gray-500">Đơn vị: triệu/m²</p>
      </div>

      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="text-theme-sm font-semibold text-gray-800">{group.title}</p>
            <p className="mb-3 text-theme-xs text-gray-500">{group.description}</p>

            <ul className="space-y-1.5">
              {group.rows.map((row) => {
                const left = toPercent(row.min);
                const width = Math.max(toPercent(row.max) - left, 0);
                const tooltip = `${row.name}: ${formatRange(row.min, row.max)} triệu/m²${
                  row.note ? ` (${row.note})` : ''
                }`;
                return (
                  <li
                    key={row.name}
                    title={tooltip}
                    className={`rounded-lg px-2 py-1.5 transition hover:bg-gray-50 ${rowGrid} ${
                      row.isSubject ? 'bg-brand-25' : ''
                    }`}
                  >
                    {/* Dien thoai: ten trai, gia phai tren cung mot dong */}
                    <span className="flex min-w-0 items-baseline justify-between gap-2 sm:block">
                      <span
                        className={`truncate text-theme-xs sm:text-theme-sm ${
                          row.isSubject ? 'font-bold text-brand-700' : 'text-gray-700'
                        }`}
                      >
                        {row.name}
                      </span>
                      <span className="shrink-0 sm:hidden">{valueLabel(row)}</span>
                    </span>

                    <span className="relative mt-1.5 block h-5 sm:mt-0 sm:h-7">
                      {/* Luoi doc nhat theo cac moc gia */}
                      {PRICE_TICKS.map((tick) => (
                        <span
                          key={tick}
                          aria-hidden
                          className="absolute inset-y-0 w-px bg-gray-100"
                          style={{ left: `${toPercent(tick)}%` }}
                        />
                      ))}
                      <span
                        aria-hidden
                        className={`absolute top-1/2 h-3 min-w-3 -translate-y-1/2 rounded-full ${
                          row.isSubject ? 'bg-brand-500' : 'bg-gray-400'
                        }`}
                        style={{ left: `${left}%`, width: `${width}%` }}
                      />
                    </span>

                    <span className="hidden sm:block">{valueLabel(row)}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {/* Truc gia chung. Dien thoai chi ghi 50 / 100 / 150 cho khoi dinh chu */}
        <div className={`px-2 ${rowGrid}`}>
          <span className="hidden sm:block" />
          <span className="relative block h-5 border-t border-gray-200">
            {PRICE_TICKS.map((tick) => (
              <span
                key={tick}
                className={`absolute top-1 -translate-x-1/2 text-[11px] text-gray-400 ${
                  tick % 50 === 0 ? '' : 'hidden sm:block'
                }`}
                style={{ left: `${toPercent(tick)}%` }}
              >
                {tick}
              </span>
            ))}
          </span>
          <span className="hidden sm:block" />
        </div>
      </div>
    </Card>
  );
};

// ── Tab ───────────────────────────────────────────────────────────────────

const AnalysisTab = ({ analysis }: { analysis?: ProjectAnalysis }) => {
  const [lightbox, setLightbox] = useState<LightboxState>(null);
  const [activeSection, setActiveSection] = useState<string>(SECTIONS[0].id);

  const openImage = useCallback(
    (images: AnalysisImage[], index = 0) => setLightbox({ images, index }),
    [],
  );
  const closeImage = useCallback(() => setLightbox(null), []);
  const moveImage = useCallback(
    (step: number) =>
      setLightbox((current) =>
        current
          ? {
              ...current,
              index: (current.index + step + current.images.length) % current.images.length,
            }
          : current,
      ),
    [],
  );

  // To dam muc luc theo phan dang nam giua man hinh
  useEffect(() => {
    if (!analysis) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: '-35% 0px -60% 0px' },
    );
    SECTIONS.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [analysis]);

  if (!analysis) {
    return <TabEmptyState message="Dự án chưa có bài phân tích." />;
  }

  const { selling, market, comparison, views } = analysis;

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-w-0 space-y-12 overflow-x-clip sm:space-y-16">
      {/* ── Mo dau: tieu de + 6 dac quyen ─────────────────────────────── */}
      <section className="grid items-center gap-8 rounded-3xl bg-linear-to-br from-brand-50 via-white to-success-50 p-5 sm:p-8 lg:grid-cols-5">
        <div className="min-w-0 lg:col-span-3">
          <p className="mb-2 text-theme-xs font-bold tracking-wide text-brand-600 uppercase">
            Phân tích dự án
          </p>
          <h2 className="text-2xl leading-snug font-bold text-gray-900 sm:text-3xl">
            {analysis.headline}
          </h2>
          <p className="mt-4 text-theme-sm leading-relaxed text-gray-600 sm:text-base">
            {analysis.summary}
          </p>
          <ol className="mt-6 grid gap-3 sm:grid-cols-2">
            {analysis.highlights.map((item, index) => (
              <li
                key={item}
                className="flex items-center gap-3 rounded-xl border border-white bg-white/80 px-3 py-2.5 shadow-sm"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-theme-sm font-bold text-white">
                  {index + 1}
                </span>
                <span className="text-theme-sm font-medium text-gray-800">{item}</span>
              </li>
            ))}
          </ol>
        </div>
        <Figure
          image={analysis.heroImage}
          onOpen={() => openImage([analysis.heroImage])}
          sizes="(min-width: 1024px) 35vw, 100vw"
          className="mx-auto w-full max-w-sm lg:col-span-2"
        />
      </section>

      {/* ── Muc luc dinh ──────────────────────────────────────────────── */}
      <div
        className={`sticky ${STICKY_TOP} z-20 bg-white/90 py-2 backdrop-blur-lg sm:rounded-2xl sm:px-2`}
      >
        <nav aria-label="Mục lục phân tích" className="no-scrollbar flex gap-2 overflow-x-auto">
          {SECTIONS.map((section, index) => {
            const isActive = section.id === activeSection;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => scrollTo(section.id)}
                aria-current={isActive ? 'true' : undefined}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-theme-sm whitespace-nowrap transition sm:flex-1 sm:justify-center ${
                  isActive
                    ? 'brand-gradient font-semibold text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                    isActive ? 'bg-white/25' : 'bg-white text-gray-500'
                  }`}
                >
                  {index + 1}
                </span>
                {section.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Phan 1: Key ban hang ───────────────────────────────────────── */}
      <section id={SECTIONS[0].id} className={`space-y-8 ${SECTION_SCROLL_MARGIN}`}>
        <SectionHeader
          index={1}
          eyebrow="Key bán hàng"
          title="Những điểm cộng khách hàng cảm nhận được mỗi ngày"
          description="Từ hành lang, thang máy đến cách tổ chức từng căn - đây là các luận điểm chính khi tư vấn Imperia Sensa Park."
        />

        <Card>
          <SubHeading>{selling.corridor.title}</SubHeading>
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="min-w-0 lg:col-span-2">
              <p className="text-theme-sm leading-relaxed text-gray-600">
                {selling.corridor.description}
              </p>
              <dl className="my-5 grid grid-cols-3 gap-2">
                {selling.corridor.stats.map((stat) => (
                  <div key={stat.label} className="flex flex-col-reverse rounded-xl bg-brand-50 px-2 py-3 text-center">
                    <dt className="mt-1 text-[11px] leading-tight text-gray-600">
                      {stat.label}
                    </dt>
                    <dd className="text-lg font-bold text-brand-600 sm:text-xl">{stat.value}</dd>
                  </div>
                ))}
              </dl>
              <CheckList items={selling.corridor.points} />
            </div>
            <div className="grid min-w-0 gap-4 lg:col-span-3">
              {selling.corridor.images.map((image, index) => (
                <Figure
                  key={image.src}
                  image={image}
                  onOpen={() => openImage(selling.corridor.images, index)}
                />
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <SubHeading>{selling.design.title}</SubHeading>
          <p className="max-w-3xl text-theme-sm leading-relaxed text-gray-600">
            {selling.design.description}
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {selling.design.points.map((point) => (
              <li
                key={point}
                className="flex gap-2.5 rounded-xl border border-gray-100 bg-gray-50 p-3 text-theme-sm leading-relaxed text-gray-700"
              >
                <FiCheck className="mt-0.5 h-4 w-4 shrink-0 text-success-600" aria-hidden />
                {point}
              </li>
            ))}
          </ul>
          <blockquote className="my-6 rounded-xl border-l-4 border-brand-500 bg-brand-50 px-4 py-3 text-theme-sm leading-relaxed font-medium text-brand-800">
            {selling.design.philosophy}
          </blockquote>
          <div className="grid gap-4 md:grid-cols-2">
            {selling.design.images.map((image, index) => (
              <Figure
                key={image.src}
                image={image}
                onOpen={() => openImage(selling.design.images, index)}
              />
            ))}
          </div>
        </Card>

        <div>
          <SubHeading>Phân tích căn điển hình</SubHeading>
          <UnitTypeTabs unitTypes={selling.unitTypes} onOpenImage={openImage} />
        </div>

        <Card>
          <SubHeading>{selling.partners.title}</SubHeading>
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="min-w-0 lg:col-span-3">
              <p className="text-theme-sm leading-relaxed text-gray-600">
                {selling.partners.description}
              </p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {selling.partners.items.map((partner) => (
                  <li key={partner.name} className="rounded-xl border border-gray-200 p-4">
                    <p className="text-theme-xs font-bold tracking-wide text-brand-600 uppercase">
                      {partner.role}
                    </p>
                    <p className="mt-1 text-lg font-bold text-gray-900">{partner.name}</p>
                    <p className="mt-1.5 text-theme-sm leading-relaxed text-gray-600">
                      {partner.description}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-theme-sm leading-relaxed font-medium text-gray-800">
                {selling.partners.closing}
              </p>
            </div>
            <Figure
              image={selling.partners.image}
              onOpen={() => openImage([selling.partners.image])}
              sizes="(min-width: 1024px) 35vw, 100vw"
              className="mx-auto w-full max-w-sm lg:col-span-2"
            />
          </div>
        </Card>
      </section>

      {/* ── Phan 2: Thi truong ─────────────────────────────────────────── */}
      <section id={SECTIONS[1].id} className={`space-y-6 ${SECTION_SCROLL_MARGIN}`}>
        <SectionHeader
          index={2}
          eyebrow="Thị trường"
          title={market.title}
          description={market.description}
        />

        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-2">
            <SubHeading>Vị trí & kết nối</SubHeading>
            <ul className="space-y-3">
              {market.points.map((point) => (
                <li key={point} className="flex gap-2.5 text-theme-sm leading-relaxed text-gray-700">
                  <FiMapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden />
                  {point}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="lg:col-span-3">
            <SubHeading>Dự án căn hộ đang mở bán lân cận</SubHeading>
            <div className="overflow-x-auto">
              <table className="w-full min-w-110 text-left text-theme-sm">
                <thead className="text-theme-xs font-semibold tracking-wide text-gray-500 uppercase">
                  <tr className="border-b border-gray-200">
                    <th scope="col" className="py-2.5 pr-3">Dự án</th>
                    <th scope="col" className="px-3 py-2.5">Quy mô</th>
                    <th scope="col" className="py-2.5 pl-3 text-right">Giá tham khảo</th>
                  </tr>
                </thead>
                <tbody>
                  {market.nearby.map((item) => (
                    <tr
                      key={item.name}
                      className={`border-b border-gray-100 last:border-0 ${
                        item.isSubject ? 'bg-brand-25' : ''
                      }`}
                    >
                      <th
                        scope="row"
                        className={`py-3 pr-3 ${
                          item.isSubject ? 'font-bold text-brand-700' : 'font-medium text-gray-800'
                        }`}
                      >
                        {item.name}
                      </th>
                      <td className="px-3 py-3 text-gray-600">{item.scale}</td>
                      <td
                        className={`py-3 pl-3 text-right whitespace-nowrap ${
                          item.isSubject ? 'font-bold text-brand-700' : 'text-gray-700'
                        }`}
                      >
                        {item.price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {market.images.map((image, index) => (
            <Figure key={image.src} image={image} onOpen={() => openImage(market.images, index)} />
          ))}
        </div>
      </section>

      {/* ── Phan 3: So sanh ────────────────────────────────────────────── */}
      <section id={SECTIONS[2].id} className={`space-y-6 ${SECTION_SCROLL_MARGIN}`}>
        <SectionHeader index={3} eyebrow="So sánh" title={comparison.title} description={comparison.lead} />

        <div className="max-w-3xl space-y-3">
          {comparison.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-theme-sm leading-relaxed text-gray-700 sm:text-base">
              {paragraph}
            </p>
          ))}
        </div>

        <PriceRangeChart groups={comparison.groups} />

        <Card>
          <SubHeading>Nhìn vào 3 lớp giá</SubHeading>
          <ol className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
            {comparison.layers.map((layer, index) => (
              <li key={layer.label} className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
                <div
                  className={`flex-1 rounded-xl px-4 py-4 text-center ${
                    layer.isSubject
                      ? 'brand-gradient text-white shadow-md'
                      : 'border border-gray-200 bg-gray-50 text-gray-800'
                  }`}
                >
                  <p className={`text-theme-xs ${layer.isSubject ? 'text-white/80' : 'text-gray-500'}`}>
                    {layer.label}
                  </p>
                  <p className="mt-1 text-xl font-bold">{layer.value}</p>
                </div>
                {index < comparison.layers.length - 1 && (
                  <FiArrowRight
                    className="mx-auto h-5 w-5 shrink-0 rotate-90 text-gray-400 md:rotate-0"
                    aria-hidden
                  />
                )}
              </li>
            ))}
          </ol>
          <div className="mt-6 space-y-3">
            {comparison.conclusion.map((paragraph) => (
              <p key={paragraph} className="text-theme-sm leading-relaxed text-gray-700">
                {paragraph}
              </p>
            ))}
          </div>
          <p className="mt-5 flex gap-2 rounded-lg bg-gray-50 px-3 py-2.5 text-theme-xs leading-relaxed text-gray-500 italic">
            <FiInfo className="mt-0.5 h-4 w-4 shrink-0 not-italic" aria-hidden />
            {comparison.disclaimer}
          </p>
        </Card>

        <Figure image={comparison.image} onOpen={() => openImage([comparison.image])} sizes="100vw" />
      </section>

      {/* ── Phan 4: Huong view ─────────────────────────────────────────── */}
      <section id={SECTIONS[3].id} className={`space-y-6 ${SECTION_SCROLL_MARGIN}`}>
        <SectionHeader index={4} eyebrow="Hướng view" title={views.title} description={views.description} />

        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-2">
            <SubHeading>Hướng view theo tòa</SubHeading>
            <table className="w-full text-left text-theme-sm">
              <thead className="text-theme-xs font-semibold tracking-wide text-gray-500 uppercase">
                <tr className="border-b border-gray-200">
                  <th scope="col" className="py-2.5 pr-2">Tòa / cánh</th>
                  <th scope="col" className="px-2 py-2.5">Mặt ngoài</th>
                  <th scope="col" className="py-2.5 pl-2">Hồ bơi & nội khu</th>
                </tr>
              </thead>
              <tbody>
                {views.towers.map((tower) => (
                  <tr key={`${tower.tower}-${tower.wing ?? ''}`} className="border-b border-gray-100 last:border-0">
                    <th scope="row" className="py-3 pr-2 font-semibold text-gray-800">
                      {tower.tower}
                      {tower.wing && (
                        <span className="block text-theme-xs font-normal text-gray-500">{tower.wing}</span>
                      )}
                    </th>
                    <td className="px-2 py-3 text-gray-700">{tower.outside}</td>
                    <td className="py-3 pl-2 text-gray-700">{tower.inside}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <div className="min-w-0 lg:col-span-3">
            {views.images.map((image, index) => (
              <Figure key={image.src} image={image} onOpen={() => openImage(views.images, index)} sizes="(min-width: 1024px) 60vw, 100vw" />
            ))}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {views.directions.map((direction, index) => {
            const directionImages = views.directions.flatMap((item) => (item.image ? [item.image] : []));
            return (
              <Card key={direction.direction} className="flex flex-col">
                {direction.image && (
                  <Figure
                    image={direction.image}
                    onOpen={() => openImage(directionImages, directionImages.indexOf(direction.image!))}
                    className="mb-4"
                  />
                )}
                <p className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <FiCompass className="h-5 w-5 text-brand-500" aria-hidden />
                  {direction.direction}
                </p>
                <p className="mt-2 text-theme-sm leading-relaxed text-gray-600">{direction.description}</p>
                <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={`Điểm nhìn hướng ${direction.direction}`}>
                  {direction.landmarks.map((landmark) => (
                    <li key={`${index}-${landmark}`} className="rounded-full bg-gray-100 px-2.5 py-1 text-theme-xs text-gray-600">
                      {landmark}
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>

        <p className="flex gap-2.5 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-theme-sm font-medium text-brand-800">
          <FiInfo className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {views.note}
        </p>
      </section>

      <Lightbox state={lightbox} onClose={closeImage} onMove={moveImage} />
    </div>
  );
};

export default AnalysisTab;
