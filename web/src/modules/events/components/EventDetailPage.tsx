'use client';

import Link from 'next/link';
import {
  FiArrowLeft,
  FiArrowRight,
  FiCalendar,
  FiClock,
  FiDownload,
  FiMapPin,
  FiUsers,
  FiVideo,
  FiXCircle,
} from 'react-icons/fi';

import PlaceholderThumb from '@/common/components/PlaceholderThumb';
import { formatNumber } from '@/common/utils/format';
import { useEventDetail } from '../hooks/useEvents';
import {
  EVENT_STATUS_LABELS,
  EVENT_TYPE_LABELS,
  EVENT_TYPE_TONE,
  type EventItem,
} from '../models/event.model';

/**
 * Trang /su-kien/[slug] - chi tiet mot su kien.
 *
 * Single source of truth: EventService (8 mock records, dong bo voi
 * trang /su-kien list va section "Sự kiện sắp diễn ra" tren trang chu).
 *
 * Server component route doc data roi truyen xuong qua `initialEvent` de
 * tranh hydration mismatch. Client chi refetch khi can.
 *
 * Cac section:
 *   01 Hero (gradient theo event.type, breadcrumb + type chip + status)
 *   02 Thumbnail + meta block (date, location, capacity)
 *   03 Description + speakers
 *   04 Tags + CTAs (Dang ky tham du / Them vao lich / Xem lai neu past)
 *   05 Other events (su kien khac dang dien ra)
 */

const TIMEZONE = 'Asia/Ho_Chi_Minh';

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  timeZone: TIMEZONE,
});

const timeFormatter = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: TIMEZONE,
});

const formatDateLong = (iso: string) => dateFormatter.format(new Date(iso));
const formatTime = (iso: string) => timeFormatter.format(new Date(iso));

const formatPrice = (event: EventItem): string =>
  event.isFree
    ? 'Miễn phí'
    : new Intl.NumberFormat('vi-VN').format(event.price ?? 0) + 'đ';

const formatPriceVnd = (price: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

/** Status tinh theo NOW - fix cung 2026-08-09 (khop voi NOW o list page). */
const FIXED_NOW = new Date('2026-08-09T15:00:00.000+07:00');

const computeStatus = (event: EventItem): EventItem['status'] => {
  const start = new Date(event.startAt).getTime();
  const end = event.endAt ? new Date(event.endAt).getTime() : start + 2 * 60 * 60 * 1000;
  const nowMs = FIXED_NOW.getTime();

  if (event.capacity && event.registered >= event.capacity) return 'full';
  if (nowMs < start) return 'upcoming';
  if (nowMs >= start && nowMs <= end) return 'ongoing';
  return 'past';
};

/** So ngay con lai (lam tron xuong) */
const daysUntil = (iso: string): number => {
  const diff = new Date(iso).getTime() - FIXED_NOW.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

/** Gen file .ics de user download "Add to Calendar" */
const generateIcs = (event: EventItem): string => {
  const fmt = (isoStr: string) =>
    new Date(isoStr)
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}Z$/, 'Z');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//RealtyHub//Events//VI',
    'BEGIN:VEVENT',
    `UID:${event.publicId}@realtyhub.vn`,
    `DTSTAMP:${fmt(FIXED_NOW.toISOString())}`,
    `DTSTART:${fmt(event.startAt)}`,
    event.endAt ? `DTEND:${fmt(event.endAt)}` : `DTEND:${fmt(event.startAt)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.excerpt.replace(/\n/g, '\\n')}`,
    `LOCATION:${event.location.isOnline ? event.location.name : `${event.location.name}, ${event.location.address ?? ''}`}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
};

const toIcsDataUri = (event: EventItem): string => {
  const ics = generateIcs(event);
  const b64 = typeof window === 'undefined'
    ? Buffer.from(ics, 'utf-8').toString('base64')
    : btoa(unescape(encodeURIComponent(ics)));
  return `data:text/calendar;charset=utf-8;base64,${b64}`;
};

type EventDetailPageProps = {
  slug: string;
  /** Du lieu route da doc san tren server - dung lam initialData cho query */
  initialEvent?: EventItem | null;
};

const EventDetailPage = ({ slug, initialEvent }: EventDetailPageProps) => {
  const detailQuery = useEventDetail(slug, initialEvent);
  const event = detailQuery.data ?? initialEvent;

  if (!event) {
    return (
      <div className="site-container py-16 text-center">
        <p className="text-theme-sm text-gray-500">Đang tải...</p>
      </div>
    );
  }

  // Tinh status + seatsLeft theo NOW (mock data set status co dinh nen override)
  const status = computeStatus(event);
  const seatsLeft = event.capacity ? event.capacity - event.registered : null;
  const isFull = status === 'full';
  const isPast = status === 'past';
  const isOngoing = status === 'ongoing';
  const tone = EVENT_TYPE_TONE[event.type];
  const days = daysUntil(event.startAt);

  return (
    <main className="bg-white">
      {/* ============ 01 HERO ============ */}
      <section
        className={`relative isolate overflow-hidden bg-gradient-to-br ${tone.hero} py-12 text-white md:py-16`}
      >
        <div aria-hidden className="absolute inset-0 -z-10 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="site-container relative">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-theme-xs text-white/70">
              <li>
                <Link href="/" className="transition hover:text-white">
                  Trang chủ
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href="/su-kien" className="transition hover:text-white">
                  Sự kiện
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="line-clamp-1 text-white/90">{event.title}</li>
            </ol>
          </nav>

          <div className="grid gap-8 md:grid-cols-12 md:items-end">
            <div className="md:col-span-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-1.5 text-theme-xs font-bold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
                  {EVENT_TYPE_LABELS[event.type]}
                </span>
                {isOngoing && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 px-3 py-1 text-theme-xs font-bold uppercase tracking-[0.15em] text-white">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                    Đang diễn ra
                  </span>
                )}
                {isFull && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-900/80 px-3 py-1 text-theme-xs font-bold uppercase tracking-[0.15em] text-white">
                    Đã đầy
                  </span>
                )}
                {isPast && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-900/80 px-3 py-1 text-theme-xs font-bold uppercase tracking-[0.15em] text-white">
                    Đã kết thúc
                  </span>
                )}
              </div>

              <h1 className="mt-4 font-serif text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
                {event.title}
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/90 md:text-lg">
                {event.excerpt}
              </p>
            </div>

            {/* Countdown / status badge */}
            {!isPast && days > 0 && (
              <div className="md:col-span-4">
                <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-sm">
                  <FiClock aria-hidden className="h-7 w-7 text-white" />
                  <div>
                    <div className="text-theme-xs uppercase tracking-[0.18em] text-white/70">
                      Còn
                    </div>
                    <div className="font-serif text-2xl font-bold leading-none">
                      {days} ngày
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============ 02 THUMBNAIL + META ============ */}
      <section className="site-container pt-10 md:pt-14">
        <Link
          href="/su-kien"
          className="group mb-6 inline-flex items-center gap-2 text-theme-sm font-semibold text-gray-600 transition hover:text-purple-600"
        >
          <FiArrowLeft aria-hidden className="transition-transform group-hover:-translate-x-1" />
          Quay lại danh sách sự kiện
        </Link>

        <div className="grid gap-8 md:grid-cols-12">
          {/* Thumbnail */}
          <div className="md:col-span-7">
            <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-theme-md">
              <PlaceholderThumb
                seed={event.slug}
                src={event.coverImage}
                label={event.title}
                alt={event.title}
                className="aspect-[16/10] w-full"
              />
            </div>

            {/* Description (chi tiet) */}
            {event.description && (
              <div className="mt-8">
                <h2 className="font-serif text-2xl font-bold text-gray-900 md:text-3xl">
                  Về sự kiện này
                </h2>
                <p className="mt-4 text-base leading-relaxed text-gray-700 md:text-lg">
                  {event.description}
                </p>
              </div>
            )}

            {/* Speakers */}
            {event.speakers && event.speakers.length > 0 && (
              <div className="mt-10">
                <h2 className="font-serif text-2xl font-bold text-gray-900 md:text-3xl">
                  Diễn giả
                </h2>
                <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                  {event.speakers.map((speaker) => {
                    const initials = speaker.initials
                      ?? speaker.name
                        .split(' ')
                        .map((part) => part.charAt(0))
                        .filter(Boolean)
                        .slice(0, 2)
                        .join('')
                        .toUpperCase();

                    return (
                      <li
                        key={speaker.publicId}
                        className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-theme-xs"
                      >
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-brand-600 text-base font-bold text-white">
                          {initials}
                        </span>
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900">{speaker.name}</div>
                          <div className="text-theme-xs text-gray-500">{speaker.role}</div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center gap-2">
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-theme-xs font-semibold text-gray-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Meta sidebar */}
          <aside className="md:col-span-5">
            <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-6 shadow-theme-md md:p-8">
              <h3 className="font-serif text-lg font-bold text-gray-900">Thông tin sự kiện</h3>

              <ul className="mt-5 space-y-5 text-theme-sm text-gray-700">
                {/* Date */}
                <li className="flex items-start gap-3">
                  <FiCalendar aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-purple-500" />
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900">
                      {formatDateLong(event.startAt)}
                    </div>
                    {event.endAt && (
                      <div className="mt-0.5 text-theme-xs text-gray-500">
                        {formatTime(event.startAt)} - {formatTime(event.endAt)}
                      </div>
                    )}
                  </div>
                </li>

                {/* Location */}
                <li className="flex items-start gap-3">
                  {event.location.isOnline ? (
                    <FiVideo aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-cyan-500" />
                  ) : (
                    <FiMapPin aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
                  )}
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900">{event.location.name}</div>
                    {!event.location.isOnline && event.location.address && (
                      <div className="mt-0.5 text-theme-xs text-gray-500">
                        {event.location.address}
                      </div>
                    )}
                    {event.location.isOnline && event.location.onlineUrl && (
                      <a
                        href={event.location.onlineUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-0.5 inline-block text-theme-xs font-medium text-brand-600 underline-offset-2 hover:underline"
                      >
                        Mở link Online
                      </a>
                    )}
                  </div>
                </li>

                {/* Capacity */}
                {event.capacity !== undefined && (
                  <li className="flex items-start gap-3">
                    <FiUsers aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                    <div className="min-w-0">
                      <div>
                        <span className="font-semibold text-gray-900">
                          {formatNumber(event.registered)}/{formatNumber(event.capacity)}
                        </span>{' '}
                        đã đăng ký
                      </div>
                      {seatsLeft !== null && seatsLeft > 0 && !isFull && (
                        <div className="mt-0.5 text-theme-xs text-gray-500">
                          Còn {seatsLeft} chỗ
                        </div>
                      )}
                      {isFull && (
                        <div className="mt-0.5 text-theme-xs font-semibold text-rose-600">
                          Đã hết chỗ
                        </div>
                      )}
                    </div>
                  </li>
                )}

                {/* Price */}
                <li className="flex items-start gap-3 border-t border-gray-100 pt-5">
                  <div className="min-w-0">
                    <div className="text-theme-xs uppercase tracking-[0.15em] text-gray-500">
                      Phí tham dự
                    </div>
                    <div className={`mt-1 font-serif text-2xl font-bold ${tone.accent}`}>
                      {event.isFree
                        ? 'Miễn phí'
                        : event.price
                          ? formatPriceVnd(event.price)
                          : 'Liên hệ'}
                    </div>
                  </div>
                </li>
              </ul>

              {/* CTAs */}
              <div className="mt-6 space-y-3">
                {isPast ? (
                  <div className="flex w-full items-center justify-center gap-2 rounded-full bg-gray-100 px-5 py-3 text-theme-sm font-semibold text-gray-500">
                    <FiXCircle aria-hidden className="h-4 w-4" />
                    Sự kiện đã kết thúc
                  </div>
                ) : isFull ? (
                  <div className="flex w-full items-center justify-center gap-2 rounded-full bg-gray-100 px-5 py-3 text-theme-sm font-semibold text-gray-500">
                    <FiXCircle aria-hidden className="h-4 w-4" />
                    Đã đầy
                  </div>
                ) : (
                  <button
                    type="button"
                    className="group/btn flex w-full items-center justify-center gap-2 rounded-full bg-purple-500 px-5 py-3 text-theme-sm font-semibold text-white shadow-theme-sm transition hover:bg-purple-600"
                  >
                    Đăng ký tham dự
                    <FiArrowRight
                      aria-hidden
                      className="h-4 w-4 transition-transform group-hover/btn:translate-x-1"
                    />
                  </button>
                )}

                {!isPast && (
                  <a
                    href={toIcsDataUri(event)}
                    download={`${event.slug}.ics`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-theme-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                  >
                    <FiDownload aria-hidden className="h-4 w-4" />
                    Thêm vào lịch (.ics)
                  </a>
                )}

                {isPast && (
                  <Link
                    href="/su-kien"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-theme-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                  >
                    Xem các sự kiện khác
                  </Link>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default EventDetailPage;