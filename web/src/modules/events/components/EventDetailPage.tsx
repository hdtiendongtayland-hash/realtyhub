'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FiArrowLeft,
  FiCalendar,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiDownload,
  FiImage,
  FiMapPin,
  FiMessageSquare,
  FiStar,
  FiUsers,
  FiVideo,
  FiX,
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
  type EventStatus,
} from '../models/event.model';
import {
  computeEventStatus,
  EVENT_NOW,
  getCheckedIn,
  getEventGallery,
  getEventReviews,
} from '../utils/event-extras';
import EventRegisterForm from './EventRegisterForm';

/**
 * Trang /su-kien/[slug] - chi tiet mot su kien.
 *
 * Bo cuc:
 *   - Anh bia rong + breadcrumb
 *   - Cot trai: tieu de, 3 tab Tong quan / Thu vien / Danh gia
 *   - Cot phai (dinh khi cuon): "Thong tin su kien" - loai + trang thai, thoi
 *     gian, dia diem, so nguoi dang ky / da check-in, phi, form dang ky inline
 *     (khong mo popup), nut them vao lich.
 */

const TIMEZONE = 'Asia/Ho_Chi_Minh';

const timeFormatter = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: TIMEZONE,
});
const dayFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: TIMEZONE,
});
const weekdayFormatter = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', timeZone: TIMEZONE });

/** "09:00 10/09/2026" */
const formatMoment = (iso: string) =>
  `${timeFormatter.format(new Date(iso))} ${dayFormatter.format(new Date(iso))}`;

const formatPrice = (event: EventItem) =>
  event.isFree ? 'Miễn phí' : `${new Intl.NumberFormat('vi-VN').format(event.price ?? 0)}đ`;

const daysUntil = (iso: string) =>
  Math.max(0, Math.ceil((new Date(iso).getTime() - EVENT_NOW.getTime()) / 86_400_000));

const STATUS_TONES: Record<EventStatus, string> = {
  upcoming: 'border-brand-200 bg-brand-50 text-brand-700',
  ongoing: 'border-rose-200 bg-rose-50 text-rose-700',
  full: 'border-amber-200 bg-amber-50 text-amber-700',
  past: 'border-gray-200 bg-gray-100 text-gray-600',
};

/** File .ics de them vao lich */
const toIcsDataUri = (event: EventItem): string => {
  const fmt = (isoStr: string) =>
    new Date(isoStr).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//RealtyHub//Events//VI',
    'BEGIN:VEVENT',
    `UID:${event.publicId}@realtyhub.vn`,
    `DTSTAMP:${fmt(EVENT_NOW.toISOString())}`,
    `DTSTART:${fmt(event.startAt)}`,
    `DTEND:${fmt(event.endAt ?? event.startAt)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.excerpt.replace(/\n/g, '\\n')}`,
    `LOCATION:${event.location.isOnline ? event.location.name : `${event.location.name}, ${event.location.address ?? ''}`}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const b64 =
    typeof window === 'undefined'
      ? Buffer.from(ics, 'utf-8').toString('base64')
      : btoa(unescape(encodeURIComponent(ics)));
  return `data:text/calendar;charset=utf-8;base64,${b64}`;
};

const initialsOf = (name: string) =>
  name
    .split(' ')
    .map((part) => part.charAt(0))
    .filter(Boolean)
    .slice(-2)
    .join('')
    .toUpperCase();

const TABS = [
  { key: 'tong-quan', label: 'Tổng quan', icon: FiCalendar },
  { key: 'thu-vien', label: 'Thư viện', icon: FiImage },
  { key: 'danh-gia', label: 'Đánh giá', icon: FiMessageSquare },
] as const;

type TabKey = (typeof TABS)[number]['key'];

// ── Thu vien: luoi anh + xem lon ────────────────────────────────────────

const Gallery = ({ images, title }: { images: string[]; title: string }) => {
  const [index, setIndex] = useState<number | null>(null);

  useEffect(() => {
    if (index === null) return undefined;
    const onKeyDown = (keyEvent: KeyboardEvent) => {
      if (keyEvent.key === 'Escape') setIndex(null);
      if (keyEvent.key === 'ArrowRight') setIndex((value) => ((value ?? 0) + 1) % images.length);
      if (keyEvent.key === 'ArrowLeft')
        setIndex((value) => ((value ?? 0) - 1 + images.length) % images.length);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [index, images.length]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {images.map((src, imageIndex) => (
          <button
            key={src}
            type="button"
            onClick={() => setIndex(imageIndex)}
            aria-label={`Xem ảnh ${imageIndex + 1}`}
            className={`group overflow-hidden rounded-xl border border-gray-100 ${
              imageIndex === 0 ? 'col-span-2 row-span-2' : ''
            }`}
          >
            <PlaceholderThumb
              seed={`${title}-${imageIndex}`}
              src={src}
              alt={`${title} - ảnh ${imageIndex + 1}`}
              className="aspect-[4/3] h-full w-full transition duration-500 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {index !== null && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- nen mo tu chinh anh */}
          <img src={images[index]} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl" />
          <button type="button" aria-label="Đóng" onClick={() => setIndex(null)} className="absolute inset-0 bg-black/60" />
          {/* eslint-disable-next-line @next/next/no-img-element -- anh tinh trong public */}
          <img
            src={images[index]}
            alt={`${title} - ảnh ${index + 1}`}
            className="relative z-10 max-h-[88vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
          />
          <button
            type="button"
            onClick={() => setIndex(null)}
            aria-label="Đóng"
            className="absolute top-4 right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25"
          >
            <FiX className="h-5 w-5" />
          </button>
          {[
            { icon: FiChevronLeft, step: -1, side: 'left-4', label: 'Ảnh trước' },
            { icon: FiChevronRight, step: 1, side: 'right-4', label: 'Ảnh tiếp' },
          ].map(({ icon: Icon, step, side, label }) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              onClick={() => setIndex((index + step + images.length) % images.length)}
              className={`absolute ${side} z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25`}
            >
              <Icon className="h-6 w-6" />
            </button>
          ))}
          <span className="absolute bottom-6 z-20 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur">
            {index + 1}/{images.length}
          </span>
        </div>
      )}
    </>
  );
};

// ── Danh gia ─────────────────────────────────────────────────────────────

const Stars = ({ value, className = 'h-4 w-4' }: { value: number; className?: string }) => (
  <span className="inline-flex gap-0.5" aria-label={`${value} sao`}>
    {Array.from({ length: 5 }, (_, index) => (
      <FiStar
        key={index}
        aria-hidden
        className={`${className} ${index < Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
      />
    ))}
  </span>
);

const Reviews = ({ event, isPast }: { event: EventItem; isPast: boolean }) => {
  const reviews = getEventReviews(event);

  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
        <FiMessageSquare aria-hidden className="mx-auto h-8 w-8 text-gray-300" />
        <p className="mt-3 text-theme-sm text-gray-500">
          {isPast ? 'Chưa có đánh giá cho sự kiện này.' : 'Đánh giá sẽ mở sau khi sự kiện diễn ra.'}
        </p>
      </div>
    );
  }

  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((review) => review.rating === star).length,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-6 rounded-2xl border border-gray-100 bg-gray-50 p-5 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="text-center sm:pr-6 sm:border-r sm:border-gray-200">
          <p className="text-4xl font-bold text-gray-900">{average.toFixed(1)}</p>
          <Stars value={average} />
          <p className="mt-1 text-theme-xs text-gray-500">{reviews.length} đánh giá</p>
        </div>
        <ul className="space-y-1.5">
          {counts.map(({ star, count }) => (
            <li key={star} className="flex items-center gap-2 text-theme-xs text-gray-600">
              <span className="w-8 shrink-0">{star} sao</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                <span
                  className="block h-full rounded-full bg-amber-400"
                  style={{ width: `${(count / reviews.length) * 100}%` }}
                />
              </span>
              <span className="w-4 shrink-0 text-right">{count}</span>
            </li>
          ))}
        </ul>
      </div>

      <ul className="space-y-4">
        {reviews.map((review) => (
          <li key={review.publicId} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-theme-xs">
            <div className="flex items-center gap-3">
              <span className="brand-gradient flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-theme-sm font-bold text-white">
                {initialsOf(review.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">{review.name}</p>
                <p className="text-theme-xs text-gray-500">{review.role}</p>
              </div>
              <Stars value={review.rating} />
            </div>
            <p className="mt-3 text-theme-sm leading-relaxed text-gray-700">{review.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ── Trang ────────────────────────────────────────────────────────────────

type EventDetailPageProps = {
  slug: string;
  /** Du lieu route da doc san tren server - dung lam initialData cho query */
  initialEvent?: EventItem | null;
};

const EventDetailPage = ({ slug, initialEvent }: EventDetailPageProps) => {
  const detailQuery = useEventDetail(slug, initialEvent);
  const event = detailQuery.data ?? initialEvent;
  const [tab, setTab] = useState<TabKey>('tong-quan');

  if (!event) {
    return (
      <div className="site-container py-16 text-center">
        <p className="text-theme-sm text-gray-500">Đang tải...</p>
      </div>
    );
  }

  const status = computeEventStatus(event);
  const isPast = status === 'past';
  const isFull = status === 'full';
  const seatsLeft = event.capacity ? event.capacity - event.registered : null;
  const checkedIn = getCheckedIn(event);
  const gallery = getEventGallery(event);
  const tone = EVENT_TYPE_TONE[event.type];
  const days = daysUntil(event.startAt);

  return (
    <main className="bg-white pb-16">
      {/* ── Anh bia + breadcrumb ─────────────────────────────────────── */}
      <section className="site-container pt-6">
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex items-center gap-2 text-theme-xs text-gray-500">
            <li>
              <Link href="/" className="transition hover:text-brand-600">
                Trang chủ
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/su-kien" className="transition hover:text-brand-600">
                Sự kiện
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="line-clamp-1 text-gray-800">{event.title}</li>
          </ol>
        </nav>

        <div className="relative overflow-hidden rounded-2xl shadow-theme-md">
          <PlaceholderThumb
            seed={event.slug}
            src={event.coverImage}
            label={event.title}
            alt={event.title}
            className="aspect-[16/9] w-full md:aspect-[21/8]"
          />
          {!isPast && days > 0 && (
            <span className="absolute right-4 bottom-4 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-theme-sm font-semibold text-gray-900 shadow-theme-md backdrop-blur">
              <FiClock aria-hidden className="text-brand-500" />
              Còn {days} ngày
            </span>
          )}
        </div>
      </section>

      <section className="site-container mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* ── Cot trai: tieu de + tab ───────────────────────────────── */}
        <div className="min-w-0">
          <h1 className="text-2xl leading-tight font-extrabold text-navy-800 uppercase md:text-3xl lg:text-4xl">
            {event.title}
          </h1>

          <div role="tablist" aria-label="Nội dung sự kiện" className="mt-6 flex gap-1 border-b border-gray-200">
            {TABS.map(({ key, label, icon: Icon }) => {
              const isActive = tab === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setTab(key)}
                  className={`relative inline-flex items-center gap-2 px-4 py-3 text-theme-sm font-semibold uppercase transition ${
                    isActive ? 'text-brand-600' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Icon aria-hidden className="h-4 w-4" />
                  {label}
                  {key === 'thu-vien' && <span className="text-theme-xs text-gray-400">({gallery.length})</span>}
                  <span
                    aria-hidden
                    className={`absolute inset-x-2 -bottom-px h-0.5 rounded-full brand-gradient transition-opacity ${
                      isActive ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <div className="pt-6">
            {tab === 'tong-quan' && (
              <div className="space-y-8">
                <p className="text-base leading-relaxed font-semibold text-gray-800">{event.excerpt}</p>
                {event.description && (
                  <p className="text-base leading-loose text-gray-700">{event.description}</p>
                )}

                {event.speakers && event.speakers.length > 0 && (
                  <div>
                    <h2 className="mb-4 text-lg font-bold text-gray-900 uppercase">
                      Sự kiện hội tụ những chuyên gia
                    </h2>
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {event.speakers.map((speaker) => (
                        <li
                          key={speaker.publicId}
                          className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4"
                        >
                          <span className="brand-gradient flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold text-white">
                            {speaker.initials ?? initialsOf(speaker.name)}
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900">{speaker.name}</p>
                            <p className="text-theme-xs text-gray-500">{speaker.role}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {event.tags && event.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-theme-xs font-semibold text-brand-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'thu-vien' && <Gallery images={gallery} title={event.title} />}

            {tab === 'danh-gia' && <Reviews event={event} isPast={isPast || status === 'ongoing'} />}
          </div>
        </div>

        {/* ── Cot phai: thong tin su kien ───────────────────────────── */}
        <aside>
          <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-5 shadow-theme-md sm:p-6">
            <h2 className="text-lg font-bold text-navy-800 uppercase">Thông tin sự kiện</h2>
            <span aria-hidden className="brand-gradient mt-2 block h-1 w-16 rounded-full" />

            <div className="mt-5 flex flex-wrap gap-2">
              <span className={`rounded-full px-3 py-1 text-theme-xs font-bold tracking-wide uppercase ${tone.chip}`}>
                {EVENT_TYPE_LABELS[event.type]}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-theme-xs font-bold tracking-wide uppercase ${STATUS_TONES[status]}`}
              >
                {status === 'ongoing' ? (
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
                ) : isPast ? (
                  <FiCheckCircle aria-hidden />
                ) : null}
                {EVENT_STATUS_LABELS[status]}
              </span>
            </div>

            <dl className="mt-5 space-y-4 text-theme-sm">
              <div className="flex gap-3">
                <FiCalendar aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
                <div>
                  <dt className="font-semibold text-gray-900">Thời gian</dt>
                  <dd className="mt-0.5 text-gray-600">
                    {formatMoment(event.startAt)}
                    {event.endAt && ` – ${formatMoment(event.endAt)}`}
                  </dd>
                  <dd className="text-theme-xs text-gray-400 capitalize">
                    {weekdayFormatter.format(new Date(event.startAt))}
                  </dd>
                </div>
              </div>
              <div className="flex gap-3">
                {event.location.isOnline ? (
                  <FiVideo aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
                ) : (
                  <FiMapPin aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-error-500" />
                )}
                <div>
                  <dt className="font-semibold text-gray-900">Địa điểm</dt>
                  <dd className="mt-0.5 text-gray-600">
                    {event.location.name}
                    {!event.location.isOnline && event.location.address && ` – ${event.location.address}`}
                  </dd>
                </div>
              </div>
            </dl>

            {/* Hai o so lieu */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-4 text-center">
                <p className="text-3xl font-extrabold text-brand-600">{formatNumber(event.registered)}</p>
                <p className="mt-1 flex items-center justify-center gap-1 text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                  <FiUsers aria-hidden />
                  Người đăng ký
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-4 text-center">
                <p className="text-3xl font-extrabold text-success-600">{formatNumber(checkedIn)}</p>
                <p className="mt-1 flex items-center justify-center gap-1 text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                  <FiCheckCircle aria-hidden />
                  Đã check-in
                </p>
              </div>
            </div>
            {event.capacity !== undefined && !isPast && (
              <div className="mt-3">
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <span
                    className="brand-gradient block h-full rounded-full"
                    style={{ width: `${Math.min(100, (event.registered / event.capacity) * 100)}%` }}
                  />
                </div>
                <p className="mt-1.5 text-theme-xs text-gray-500">
                  {formatNumber(event.registered)}/{formatNumber(event.capacity)} chỗ
                  {seatsLeft !== null && seatsLeft > 0 && ` · còn ${seatsLeft} chỗ`}
                </p>
              </div>
            )}

            <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-5">
              <span className="text-theme-xs font-semibold tracking-wide text-gray-500 uppercase">Phí tham dự</span>
              <span className="text-xl font-bold text-brand-700">{formatPrice(event)}</span>
            </div>

            <div className="mt-5 space-y-3">
              {isPast || isFull ? (
                <p className="flex w-full items-center justify-center gap-2 rounded-full bg-gray-100 px-5 py-3 text-theme-sm font-semibold text-gray-500">
                  <FiXCircle aria-hidden />
                  {isPast ? 'Sự kiện đã kết thúc' : 'Đã hết chỗ'}
                </p>
              ) : (
                <EventRegisterForm
                  event={{
                    slug: event.slug,
                    title: event.title,
                    startAt: event.startAt,
                    locationName: event.location.name,
                  }}
                />
              )}
              {!isPast && (
                <a
                  href={toIcsDataUri(event)}
                  download={`${event.slug}.ics`}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 px-5 py-3 text-theme-sm font-semibold text-gray-700 transition hover:border-brand-300 hover:text-brand-600"
                >
                  <FiDownload aria-hidden />
                  Thêm vào lịch (.ics)
                </a>
              )}
              <Link
                href="/su-kien"
                className="flex w-full items-center justify-center gap-2 text-theme-sm font-medium text-gray-500 transition hover:text-brand-600"
              >
                <FiArrowLeft aria-hidden />
                Danh sách sự kiện
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
};

export default EventDetailPage;
