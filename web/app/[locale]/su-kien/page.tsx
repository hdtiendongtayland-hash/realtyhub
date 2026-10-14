import Image from "next/image";
import Link from "next/link";

import {
  FiArrowRight,
  FiCalendar,
  FiClock,
  FiDownload,
  FiUsers,
  FiMapPin,
  FiVideo,
  FiXCircle,
} from "react-icons/fi";

import PlaceholderThumb from "@/common/components/PlaceholderThumb";

import type { Metadata } from "next";

import {
  EVENT_TYPE_FILTERS,
  EVENT_TYPE_LABELS,
  EVENT_TYPE_TONE,
  type EventItem,
  type EventType,
} from "@/modules/events/models/event.model";
import { MOCK_EVENTS } from "@/modules/events/mocks/events.mock";
import EventFilterBar from "@/modules/events/components/EventFilterBar";
import EventQrScanner from "@/modules/events/components/EventQrScanner";
import FeaturedEventCarousel, { type FeaturedSlide } from "@/modules/events/components/FeaturedEventCarousel";
import { computeEventStatus } from "@/modules/events/utils/event-extras";

/**
 * Trang /su-kien - Lịch sự kiện BĐS (workshop, hội thảo, networking, open house, webinar).
 *
 * Layout (server component, searchParams cho filter):
 *   01 Hero (gradient navy -> purple, breadcrumb + 5 filter chips)
 *   02 Featured event (1 su kien sap dien ra gan nhat, full-width card co countdown)
 *   03 Upcoming events (grid 3 col, co CTA dang ky + Add to Calendar)
 *   04 Past events (grid 3 col, xem lai, chi hien thi khi co data)
 *   05 Submit-event CTA (to chuc su kien cua ban)
 *
 * SearchParams:
 *   - type: EventType | undefined (filter)
 *   - status: 'upcoming' | 'past' | 'all' | undefined (tab)
 *
 * Khac tin-tuc:
 *   - Khong co pagination (event it, hien thi full)
 *   - Co CTA "Dang ky tham du" + "Them vao lich" (.ics file generate inline)
 *   - Past events co nut "Xem lai" thay "Dang ky"
 */
export const metadata: Metadata = {
  title: "Sự kiện",
  description:
    "Workshop, hội thảo, webinar và networking về bất động sản — cập nhật lịch sự kiện RealtyHub mới nhất.",
};

// ============================================================================
// Route types
// ============================================================================

type PageSearchParams = {
  type?: string;
  status?: string;
  /** Tu khoa tim kiem */
  q?: string;
  /** Khoang ngay dien ra: yyyy-mm-dd */
  from?: string;
  to?: string;
};

const TYPE_ALL = "all" as const;
type TypeFilter = EventType | typeof TYPE_ALL;
type StatusFilter = "upcoming" | "ongoing" | "full" | "past" | "all";

const parseType = (raw: string | undefined): TypeFilter => {
  if (
    raw === "workshop" ||
    raw === "seminar" ||
    raw === "networking" ||
    raw === "open-house" ||
    raw === "webinar"
  ) {
    return raw;
  }
  return TYPE_ALL;
};

const parseStatus = (raw: string | undefined): StatusFilter => {
  if (raw === "upcoming" || raw === "ongoing" || raw === "full" || raw === "past")
    return raw;
  return "all";
};

const buildHref = (
  next: Partial<PageSearchParams>,
  current: PageSearchParams,
): string => {
  const params = new URLSearchParams();
  const merged = { ...current, ...next };
  if (merged.type && merged.type !== TYPE_ALL) params.set("type", merged.type);
  if (merged.status && merged.status !== "all")
    params.set("status", merged.status);
  const qs = params.toString();
  return qs ? `/su-kien?${qs}` : "/su-kien";
};

// ============================================================================
// Helpers
// ============================================================================

const NOW = new Date("2026-08-09T15:00:00.000+07:00");

/** Tinh status thuc te theo NOW (override status trong mock neu qua han) */
const computeStatus = computeEventStatus;

/** Bo dau + chu thuong de tim kiem khong phan biet dau */
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();

/** Ngay dien ra theo gio Viet Nam, dang yyyy-mm-dd de so voi o loc ngay */
const eventDay = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(
    new Date(iso),
  );

const formatTime = (iso: string): string =>
  new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

const formatDateLong = (iso: string): string =>
  new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));

const formatPrice = (event: EventItem): string =>
  event.isFree
    ? "Miễn phí"
    : new Intl.NumberFormat("vi-VN").format(event.price ?? 0) + "đ";

/** So ngay con lai (lam tron xuong) */
const daysUntil = (iso: string): number => {
  const diff = new Date(iso).getTime() - NOW.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

/** Gen file .ics de user download "Add to Calendar" */
const generateIcs = (event: EventItem): string => {
  const fmt = (isoStr: string) =>
    new Date(isoStr)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//RealtyHub//Events//VI",
    "BEGIN:VEVENT",
    `UID:${event.publicId}@realtyhub.vn`,
    `DTSTAMP:${fmt(NOW.toISOString())}`,
    `DTSTART:${fmt(event.startAt)}`,
    event.endAt ? `DTEND:${fmt(event.endAt)}` : `DTEND:${fmt(event.startAt)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.excerpt.replace(/\n/g, "\\n")}`,
    `LOCATION:${event.location.isOnline ? event.location.name : `${event.location.name}, ${event.location.address ?? ""}`}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
};

/** Data URI cho <a download="event.ics" href={...}> */
const toIcsDataUri = (event: EventItem): string => {
  const ics = generateIcs(event);
  // base64 an toan cho UTF-8
  const b64 =
    typeof window === "undefined"
      ? Buffer.from(ics, "utf-8").toString("base64")
      : btoa(unescape(encodeURIComponent(ics)));
  return `data:text/calendar;charset=utf-8;base64,${b64}`;
};

// ============================================================================
// Page
// ============================================================================

const SuKienPage = async ({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) => {
  const params = await searchParams;
  const type = parseType(params.type);
  const status = parseStatus(params.status);

  // Compute status + filter
  const withStatus = MOCK_EVENTS.map((e) => ({
    ...e,
    status: computeStatus(e),
  }));
  const keyword = normalize(params.q?.trim() ?? "");
  const from = params.from ?? "";
  const to = params.to ?? "";
  const hasFilter = Boolean(
    keyword || from || to || type !== TYPE_ALL || status !== "all",
  );

  const filteredByType = withStatus.filter((e) => {
    if (type !== TYPE_ALL && e.type !== type) return false;
    if (status !== "all" && e.status !== status) return false;
    if (keyword) {
      const haystack = normalize(
        [e.title, e.excerpt, e.location.name, e.location.address ?? "", ...(e.tags ?? [])].join(" "),
      );
      if (!haystack.includes(keyword)) return false;
    }
    const day = eventDay(e.startAt);
    if (from && day < from) return false;
    if (to && day > to) return false;
    return true;
  });

  const upcomingEvents = filteredByType
    .filter(
      (e) =>
        e.status === "upcoming" ||
        e.status === "ongoing" ||
        e.status === "full",
    )
    .sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
    );

  const pastEvents = filteredByType
    .filter((e) => e.status === "past")
    .sort(
      (a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime(),
    );

  // Featured = upcoming event som nhat, co speakers (uu tien)
  const featured =
    upcomingEvents.find((e) => e.speakers && e.speakers.length > 0) ??
    upcomingEvents[0];

  // Slide noi bat: toi da 4 su kien sap dien ra, su kien noi bat len dau
  const featuredSlides: FeaturedSlide[] = (featured
    ? [featured, ...upcomingEvents.filter((e) => e.publicId !== featured.publicId)]
    : upcomingEvents
  )
    .slice(0, 4)
    .map((e) => ({
      slug: e.slug,
      title: e.title,
      excerpt: e.excerpt,
      coverImage: e.coverImage,
      typeLabel: EVENT_TYPE_LABELS[e.type],
      dateLabel: `${formatDateLong(e.startAt)}${e.endAt ? ` · ${formatTime(e.startAt)} - ${formatTime(e.endAt)}` : ''}`,
      locationLabel: `${e.location.name}${e.location.address ? ` · ${e.location.address}` : ''}`,
      isOnline: Boolean(e.location.isOnline),
      registeredLabel: e.capacity
        ? `${e.registered}/${e.capacity} đã đăng ký · còn ${Math.max(0, e.capacity - e.registered)} chỗ`
        : undefined,
      priceLabel: formatPrice(e),
      isFree: Boolean(e.isFree),
      daysLeft: daysUntil(e.startAt),
      isFull: e.status === 'full',
      icsHref: toIcsDataUri(e),
    }));

  // Counts
  const countByType = (t: TypeFilter): number =>
    t === TYPE_ALL
      ? withStatus.filter((e) => e.status !== "past").length
      : withStatus.filter((e) => e.type === t && e.status !== "past").length;

  return (
    <main className="bg-gray-25">
      {/* ============ 01 HERO ============ */}
      {/* <section className="relative isolate overflow-hidden bg-gray-900 py-16 text-white md:py-20">
        <div aria-hidden className="absolute inset-0 -z-10">
          <Image
            src="/images/heroes/su-kien.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/92 via-brand-950/88 to-purple-950/92" />
        </div>
        <div
          aria-hidden
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="site-container relative">
          <div className="mx-auto max-w-3xl text-center">
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex items-center justify-center gap-2 text-theme-xs text-white/60">
                <li>
                  <Link href="/" className="transition hover:text-white">
                    Trang chủ
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li className="text-white/90">Sự kiện</li>
              </ol>
            </nav>

            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-theme-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
              Lịch sự kiện RealtyHub
            </span>

            <h1 className="mt-6 font-serif text-4xl font-light leading-tight md:text-5xl lg:text-6xl">
              Gặp gỡ, học hỏi,
              <br />
              <span className="font-bold text-purple-400">cùng phát triển</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
              Workshop, hội thảo, open house và networking — tất cả được tổ chức
              bởi đội ngũ RealtyHub và các đối tác trong ngành.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-6">
              <StatItem
                value={String(MOCK_EVENTS.length)}
                label="Tổng sự kiện"
              />
              <StatItem
                value={String(
                  MOCK_EVENTS.filter((e) => computeStatus(e) !== "past").length,
                )}
                label="Sắp diễn ra"
                accent="text-purple-300"
              />
              <StatItem
                value={String(
                  MOCK_EVENTS.reduce((sum, e) => sum + e.registered, 0),
                )}
                label="Lượt đăng ký"
              />
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
              <FilterChip
                href={buildHref({ type: TYPE_ALL, status: "all" }, params)}
                label="Tất cả"
                isActive={type === TYPE_ALL}
                count={countByType(TYPE_ALL)}
              />
              {EVENT_TYPE_FILTERS.map((t) => (
                <FilterChip
                  key={t}
                  href={buildHref({ type: t, status: "all" }, params)}
                  label={EVENT_TYPE_LABELS[t]}
                  isActive={type === t}
                  count={countByType(t)}
                />
              ))}
            </div>
          </div>
        </div>
      </section> */}

      {/* ── Banner ──────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-navy-900 pt-5 pb-20 text-white sm:pt-6 md:pb-28">
        <Image src="/images/heroes/su-kien.jpg" alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-900/95 via-navy-900/80 to-purple-900/60" />
        <div className="site-container">
          <nav aria-label="Breadcrumb" className="mb-5 text-theme-xs text-white/60">
            <Link href="/" className="transition hover:text-white">Trang chủ</Link>
            <span className="mx-2">/</span>
            <span className="text-white/90">Sự kiện</span>
          </nav>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl">Sự kiện bất động sản</h1>
              <p className="mt-2 line-clamp-2 text-theme-sm leading-relaxed text-white/75 sm:line-clamp-none sm:text-base">
                Trải nghiệm những workshop, hội thảo, webinar và hoạt động networking đặc sắc — đăng ký tham dự và nhận nhắc lịch ngay trên RealtyHub.
              </p>
            </div>
            <EventQrScanner events={MOCK_EVENTS.map(({ slug, title }) => ({ slug, title }))} />
          </div>
        </div>
      </section>

      <div className="site-container relative z-10 -mt-12 md:-mt-16">
        <EventFilterBar variant="hero" />
      </div>

      {hasFilter && upcomingEvents.length === 0 && pastEvents.length === 0 && (
        <section className="site-container py-16 text-center">
          <p className="text-theme-sm text-gray-500">Không có sự kiện nào khớp bộ lọc.</p>
        </section>
      )}

      {/* ── Su kien noi bat (trinh chieu) ─────────────────────────── */}
      {featuredSlides.length > 0 && !hasFilter && (
        <section className="site-container pt-8 md:pt-10">
          <FeaturedEventCarousel slides={featuredSlides} />
        </section>
      )}

      {/* Nen xanh nhat cho hai muc danh sach */}
      <div className="relative isolate mt-8 overflow-hidden bg-gradient-to-b from-[#eaf2ff] via-[#f2f6ff] to-gray-25">
        <span aria-hidden className="absolute -top-24 -left-24 -z-10 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl" />
        <span aria-hidden className="absolute top-1/3 -right-24 -z-10 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl" />
      {/* ============ 03 UPCOMING EVENTS ============ */}
      {upcomingEvents.length > 0 && (
          <EventsSection
            title="Sự kiện sắp diễn ra"
            subtitle="Đừng bỏ lỡ những sự kiện thú vị đang chờ bạn!"
            moreHref="/su-kien?status=upcoming"
            events={upcomingEvents}
            mode="upcoming"
          />
        )}

      {/* ============ 04 PAST EVENTS ============ */}
      {pastEvents.length > 0 && (
        <EventsSection
          title="Sự kiện đã diễn ra"
          subtitle="Xem lại tư liệu và tài liệu của các sự kiện đã qua"
          moreHref="/su-kien?status=past"
          events={pastEvents}
          mode="past"
          variant="muted"
        />
      )}

      </div>

      {/* ============ 05 SUBMIT EVENT CTA ============ */}
      <SubmitEventCTA />
    </main>
  );
};

// ============================================================================
// StatItem - 1 so lieu trong hero
// ============================================================================

const StatItem = ({
  value,
  label,
  accent = "text-white",
}: {
  value: string;
  label: string;
  accent?: string;
}) => (
  <div className="text-center">
    <div
      className={`font-serif text-3xl font-bold leading-none md:text-4xl ${accent}`}
    >
      {value}
    </div>
    <div className="mt-2 text-theme-xs uppercase tracking-[0.15em] text-white/70">
      {label}
    </div>
  </div>
);

// ============================================================================
// FilterChip
// ============================================================================

const FilterChip = ({
  href,
  label,
  isActive,
  count,
}: {
  href: string;
  label: string;
  isActive: boolean;
  count: number;
}) => (
  <Link
    href={href}
    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-theme-sm font-semibold transition ${
      isActive
        ? "border-purple-400 bg-purple-500 text-white shadow-theme-sm"
        : "border-white/20 bg-white/5 text-white/80 hover:border-white/40 hover:bg-white/10"
    }`}
  >
    {label}
    <span
      className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-theme-xs font-bold ${
        isActive ? "bg-white/20 text-white" : "bg-white/10 text-white/70"
      }`}
    >
      {count}
    </span>
  </Link>
);

// ============================================================================
// FeaturedEventCard - bai noi bat, full-width, co countdown
// ============================================================================

const FeaturedEventCard = ({ event }: { event: EventItem }) => {
  const tone = EVENT_TYPE_TONE[event.type];
  const days = daysUntil(event.startAt);
  const seatsLeft = event.capacity ? event.capacity - event.registered : null;
  const isFull = event.status === "full";

  return (
    <article className="group grid overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-theme-md transition hover:shadow-theme-lg md:grid-cols-2">
      {/* Thumbnail */}
      <Link
        href={`/su-kien/${event.slug}`}
        className="relative block aspect-[16/9] overflow-hidden md:aspect-auto"
        aria-label={event.title}
      >
        <PlaceholderThumb
          seed={event.slug}
          src={event.coverImage}
          label={event.title}
          alt={event.title}
          className="transition-transform duration-500 group-hover:scale-105"
        />
        {/* Countdown overlay */}
        {days > 0 && (
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 shadow-theme-md backdrop-blur-sm">
            <FiClock aria-hidden className="h-4 w-4 text-purple-600" />
            <span className="text-theme-xs font-bold uppercase tracking-[0.15em] text-purple-700">
              Còn {days} ngày
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col gap-6 p-6 md:p-10">
        {/* Type + status */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-theme-xs font-bold uppercase tracking-[0.15em] ${tone.chip}`}
          >
            {EVENT_TYPE_LABELS[event.type]}
          </span>
          {event.status === "ongoing" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-theme-xs font-bold uppercase tracking-[0.15em] text-rose-700">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
              Đang diễn ra
            </span>
          )}
        </div>

        <h3 className="font-serif text-2xl font-bold leading-tight text-gray-900 md:text-3xl">
          <Link
            href={`/su-kien/${event.slug}`}
            className="transition hover:text-brand-600"
          >
            {event.title}
          </Link>
        </h3>

        <p className="text-base leading-relaxed text-gray-600 md:text-lg">
          {event.excerpt}
        </p>

        {/* Meta */}
        <ul className="space-y-2.5 border-y border-gray-100 py-5 text-theme-sm text-gray-700">
          <li className="flex items-start gap-2.5">
            <FiCalendar
              aria-hidden
              className="mt-0.5 h-4 w-4 shrink-0 text-gray-400"
            />
            <span className="font-semibold">
              {formatDateLong(event.startAt)}
              {event.endAt &&
                ` · ${formatTime(event.startAt)} - ${formatTime(event.endAt)}`}
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            {event.location.isOnline ? (
              <FiVideo
                aria-hidden
                className="mt-0.5 h-4 w-4 shrink-0 text-gray-400"
              />
            ) : (
              <FiMapPin
                aria-hidden
                className="mt-0.5 h-4 w-4 shrink-0 text-gray-400"
              />
            )}
            <span>
              {event.location.name}
              {event.location.address && ` · ${event.location.address}`}
            </span>
          </li>
          {event.capacity && (
            <li className="flex items-center gap-2.5">
              <FiUsers aria-hidden className="h-4 w-4 shrink-0 text-gray-400" />
              <span>
                <span className="font-semibold">
                  {event.registered}/{event.capacity}
                </span>{" "}
                đã đăng ký
                {seatsLeft !== null && seatsLeft > 0 && (
                  <span className="ml-1 text-gray-500">
                    · còn {seatsLeft} chỗ
                  </span>
                )}
              </span>
            </li>
          )}
        </ul>

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-3">
          {isFull ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-5 py-2.5 text-theme-sm font-semibold text-gray-500">
              <FiXCircle aria-hidden className="h-4 w-4" />
              Đã đầy
            </span>
          ) : (
            <Link
              href={`/su-kien/${event.slug}`}
              className="group/btn inline-flex items-center gap-2 rounded-full bg-purple-500 px-5 py-2.5 text-theme-sm font-semibold text-white shadow-theme-sm transition hover:bg-purple-600"
            >
              Đăng ký tham dự
              <FiArrowRight
                aria-hidden
                className="h-4 w-4 transition-transform group-hover/btn:translate-x-1"
              />
            </Link>
          )}
          <a
            href={toIcsDataUri(event)}
            download={`${event.slug}.ics`}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-theme-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
          >
            <FiDownload aria-hidden className="h-4 w-4" />
            Thêm vào lịch
          </a>
          <span
            className={`ml-auto font-serif text-lg font-bold md:text-xl ${tone.accent}`}
          >
            {formatPrice(event)}
          </span>
        </div>
      </div>
    </article>
  );
};

// ============================================================================
// EventsSection - section header + grid
// ============================================================================

type EventsSectionProps = {
  title: string;
  subtitle: string;
  events: EventItem[];
  mode: "upcoming" | "past";
  variant?: "default" | "muted";
  moreHref?: string;
};

const EventsSection = ({
  title,
  subtitle,
  events,
  mode,
  variant = "default",
  moreHref,
}: EventsSectionProps) => {
  const isMuted = variant === "muted";

  return (
    <section
      className={`site-container ${isMuted ? "pt-4 pb-12 md:pb-14" : "pt-10 pb-8 md:pt-12"}`}
    >
      <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6 sm:items-end sm:gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white sm:h-12 sm:w-12 shadow-[0_8px_20px_-8px_rgba(79,70,229,0.6)] ring-4 ring-white ${
              isMuted ? "from-brand-500 to-brand-700" : "from-brand-500 to-violet-500"
            }`}
          >
            {isMuted ? <FiClock aria-hidden className="h-5 w-5" /> : <FiCalendar aria-hidden className="h-5 w-5" />}
          </span>
          <div>
            <h2 className="text-lg font-bold text-navy-800 sm:text-xl md:text-2xl">{title}</h2>
            <p className="hidden text-theme-sm text-gray-500 sm:block">{subtitle}</p>
          </div>
        </div>
        {moreHref && (
          <Link
            href={moreHref}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-brand-200 bg-white px-3 py-1.5 text-theme-xs font-semibold sm:gap-1.5 sm:px-5 sm:py-2 sm:text-theme-sm text-brand-700 shadow-theme-xs transition hover:border-brand-400 hover:bg-brand-25"
          >
            Xem tất cả
            <FiArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {events.map((event) => (
          <EventCard key={event.publicId} event={event} mode={mode} />
        ))}
      </div>
    </section>
  );
};

// ============================================================================
// EventCard - 1 su kien trong grid
// ============================================================================

type EventCardProps = {
  event: EventItem;
  mode: "upcoming" | "past";
};

/** Mau theo loai: nhan vien mau, nut chuyen sac, mau gia co phi */
const CARD_TONE: Record<EventType, { chip: string; button: string; price: string }> = {
  workshop: {
    chip: "border-orange-200 text-orange-600",
    button: "from-brand-500 to-navy-800",
    price: "text-orange-500",
  },
  seminar: {
    chip: "border-sky-200 text-sky-600",
    button: "from-sky-500 to-brand-600",
    price: "text-navy-800",
  },
  "open-house": {
    chip: "border-emerald-200 text-emerald-600",
    button: "from-emerald-500 to-teal-600",
    price: "text-navy-800",
  },
  webinar: {
    chip: "border-violet-200 text-violet-600",
    button: "from-indigo-500 to-violet-600",
    price: "text-navy-800",
  },
  networking: {
    chip: "border-rose-200 text-rose-600",
    button: "from-rose-500 to-pink-600",
    price: "text-navy-800",
  },
};

const EventCard = ({ event, mode }: EventCardProps) => {
  const tone = CARD_TONE[event.type];
  const seatsLeft = event.capacity ? event.capacity - event.registered : null;
  const isFull = event.status === "full";
  const isOngoing = event.status === "ongoing";
  const isPast = mode === "past";
  const start = new Date(event.startAt);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white bg-white shadow-[0_10px_30px_-14px_rgba(30,64,175,0.28)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-14px_rgba(30,64,175,0.4)]">
      {/* Anh */}
      <Link
        href={`/su-kien/${event.slug}`}
        className="relative block aspect-video overflow-hidden bg-gray-100"
        aria-label={event.title}
      >
        <PlaceholderThumb
          seed={event.slug}
          src={event.coverImage}
          label={event.title}
          alt={event.title}
          className={`transition-transform duration-500 group-hover:scale-[1.03] ${isPast ? "opacity-90 grayscale-[30%]" : ""}`}
        />

        {/* Ngay */}
        <div className="absolute top-3 left-3 flex w-12 flex-col items-center rounded-lg bg-white py-1.5 text-center shadow-theme-sm">
          <span className="text-lg leading-none font-bold text-navy-800">{start.getDate()}</span>
          <span className="mt-0.5 text-[10px] font-semibold tracking-wide text-gray-500 uppercase">
            Th{start.getMonth() + 1}
          </span>
        </div>

        {/* Loai su kien */}
        <span className={`absolute top-3 right-3 rounded-full border bg-white/95 px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase shadow-theme-xs ${tone.chip}`}>
          {EVENT_TYPE_LABELS[event.type]}
        </span>

        {isOngoing && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-error-600">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-error-500" />
            Đang diễn ra
          </span>
        )}
      </Link>

      {/* Noi dung */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-base leading-snug font-bold text-navy-800">
          <Link href={`/su-kien/${event.slug}`} className="transition hover:text-brand-600">
            {event.title}
          </Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-theme-xs leading-relaxed text-gray-500">{event.excerpt}</p>

        <ul className="mt-3 space-y-1.5 text-theme-xs text-gray-600">
          <li className="flex items-center gap-2">
            <FiClock aria-hidden className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            {formatTime(event.startAt)}
            {event.endAt && ` - ${formatTime(event.endAt)}`}
          </li>
          <li className="flex items-center gap-2">
            {event.location.isOnline ? (
              <FiVideo aria-hidden className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            ) : (
              <FiMapPin aria-hidden className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            )}
            <span className="truncate">{event.location.name}</span>
          </li>
        </ul>

        {/* Gia + nut */}
        <div className="mt-auto flex items-end justify-between gap-3 pt-3.5">
          <div>
            {!isPast && !isFull && seatsLeft !== null && seatsLeft <= 10 && (
              <span className="block text-[11px] font-medium text-error-600">Còn {seatsLeft} chỗ</span>
            )}
            <span className={`text-lg font-bold ${event.isFree ? "text-emerald-600" : tone.price}`}>
              {formatPrice(event)}
            </span>
          </div>

          {isPast ? (
            <Link
              href={`/su-kien/${event.slug}`}
              className="inline-flex items-center gap-1 text-theme-xs font-semibold text-brand-600 transition hover:text-brand-700"
            >
              Xem lại
              <FiArrowRight aria-hidden className="h-3.5 w-3.5" />
            </Link>
          ) : isFull ? (
            <span className="rounded-full bg-gray-100 px-3.5 py-1.5 text-theme-xs font-semibold text-gray-400">Đã đầy</span>
          ) : (
            <Link
              href={`/su-kien/${event.slug}`}
              className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r px-4 py-2 text-theme-xs font-semibold text-white shadow-theme-xs transition hover:brightness-110 ${tone.button}`}
            >
              Đăng ký ngay
              <FiArrowRight aria-hidden className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
};

// ============================================================================
// SubmitEventCTA - to chuc su kien
// ============================================================================

const SubmitEventCTA = () => (
  <section className="site-container pb-14 md:pb-16">
    <div className="relative isolate flex flex-col gap-5 overflow-hidden rounded-3xl bg-navy-800 p-6 text-white md:flex-row md:items-center md:justify-between md:p-10">
      <span aria-hidden className="absolute -top-20 -right-16 -z-10 h-64 w-64 rounded-full bg-brand-500/25 blur-3xl" />
      <div className="max-w-2xl">
        <p className="text-theme-xs font-semibold tracking-[0.2em] text-brand-300 uppercase">Đối tác tổ chức</p>
        <h2 className="mt-2 text-2xl font-bold md:text-[28px]">Bạn muốn tổ chức sự kiện BĐS?</h2>
        <p className="mt-2 text-theme-sm leading-relaxed text-white/75 md:text-base">
          RealtyHub hỗ trợ truyền thông, đăng ký, nhắc lịch và check-in QR — miễn phí cho workshop và networking cộng đồng.
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-3">
        <Link
          href="/lien-he-chung-toi"
          className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-theme-sm font-semibold text-white transition hover:bg-brand-600"
        >
          Đăng ký tổ chức
          <FiArrowRight aria-hidden className="h-4 w-4" />
        </Link>
        <Link
          href="/dao-tao"
          className="inline-flex items-center rounded-full border border-white/25 px-6 py-3 text-theme-sm font-semibold text-white transition hover:bg-white/10"
        >
          Xem khóa học
        </Link>
      </div>
    </div>
  </section>
);

export default SuKienPage;
