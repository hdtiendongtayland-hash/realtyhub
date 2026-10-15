'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FiArrowLeft,
  FiArrowRight,
  FiHome,
  FiCalendar,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiImage,
  FiMapPin,
  FiMessageSquare,
  FiStar,
  FiUsers,
  FiVideo,
  FiX,
  FiXCircle,
} from 'react-icons/fi';
import { TbCalendarPlus } from 'react-icons/tb';

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
    <main className="bg-gray-25 pb-16">
      {/* ── 1. DAU TRANG: the sang, chu trai + anh 16:9 phai ─────────── */}
      <section className="site-container pt-6">
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex flex-wrap items-center gap-1.5 text-theme-xs text-gray-500">
            <li>
              <Link href="/" className="inline-flex items-center gap-1 transition hover:text-brand-600">
                <FiHome aria-hidden className="h-3.5 w-3.5" />
                Trang chủ
              </Link>
            </li>
            <li aria-hidden>
              <FiChevronRight className="h-3.5 w-3.5 text-gray-300" />
            </li>
            <li>
              <Link href="/su-kien" className="transition hover:text-brand-600">
                Sự kiện
              </Link>
            </li>
            <li aria-hidden>
              <FiChevronRight className="h-3.5 w-3.5 text-gray-300" />
            </li>
            <li className="line-clamp-1 font-medium text-gray-700">{event.title}</li>
          </ol>
        </nav>

        <div className="relative isolate overflow-hidden rounded-3xl border border-white bg-gradient-to-br from-white via-[#f3f7ff] to-[#e6efff] shadow-[0_24px_60px_-30px_rgba(30,64,175,0.45)]">
          <span aria-hidden className="absolute -right-20 -bottom-24 -z-10 h-72 w-72 rounded-full bg-sky-200/60 blur-3xl" />
          <span aria-hidden className="absolute -top-20 left-1/3 -z-10 h-56 w-56 rounded-full bg-violet-200/40 blur-3xl" />

          <div className="grid items-center gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10 lg:p-8">
            {/* Chu */}
            <div className="order-2 lg:order-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-[11px] font-bold tracking-wide uppercase ${tone.chip}`}>
                  {EVENT_TYPE_LABELS[event.type]}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold tracking-wide uppercase ${STATUS_TONES[status]}`}
                >
                  {status === 'ongoing' ? (
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
                  ) : isPast ? (
                    <FiCheckCircle aria-hidden />
                  ) : null}
                  {EVENT_STATUS_LABELS[status]}
                </span>
                {!isPast && days > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1 text-[11px] font-bold text-white">
                    <FiClock aria-hidden className="h-3.5 w-3.5" />
                    Còn {days} ngày
                  </span>
                )}
              </div>

              <h1 className="mt-4 text-2xl leading-tight font-bold text-navy-800 md:text-3xl xl:text-4xl">{event.title}</h1>
              <p className="mt-3 text-theme-sm leading-relaxed text-gray-600 md:text-base">{event.excerpt}</p>

              <ul className="mt-5 space-y-3">
                <li className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <FiCalendar aria-hidden className="h-5 w-5" />
                  </span>
                  <span className="text-theme-sm">
                    <span className="block font-semibold text-gray-900 capitalize">
                      {weekdayFormatter.format(new Date(event.startAt))}, {dayFormatter.format(new Date(event.startAt))}
                    </span>
                    <span className="block text-gray-500">
                      {timeFormatter.format(new Date(event.startAt))}
                      {event.endAt && ` – ${timeFormatter.format(new Date(event.endAt))}`}
                    </span>
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    {event.location.isOnline ? (
                      <FiVideo aria-hidden className="h-5 w-5" />
                    ) : (
                      <FiMapPin aria-hidden className="h-5 w-5" />
                    )}
                  </span>
                  <span className="text-theme-sm">
                    <span className="block font-semibold text-gray-900">{event.location.name}</span>
                    {!event.location.isOnline && event.location.address && (
                      <span className="block text-gray-500">{event.location.address}</span>
                    )}
                  </span>
                </li>
              </ul>

              <div className="mt-6 flex flex-wrap gap-3">
                {!isPast && !isFull && (
                  <a
                    href="#dang-ky"
                    className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-brand-500 to-brand-700 py-2.5 pr-5 pl-2.5 text-theme-sm font-semibold text-white shadow-[0_12px_28px_-12px_rgba(15,111,209,0.85)] transition hover:brightness-110"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                      <FiArrowRight aria-hidden className="h-4 w-4" />
                    </span>
                    Đăng ký tham dự
                  </a>
                )}
                {!isPast && (
                  <a
                    href={toIcsDataUri(event)}
                    download={`${event.slug}.ics`}
                    className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-5 py-2.5 text-theme-sm font-semibold text-brand-700 transition hover:border-brand-400"
                  >
                    <TbCalendarPlus aria-hidden className="h-4 w-4" />
                    Thêm vào lịch
                  </a>
                )}
              </div>
            </div>

            {/* Anh 16:9 */}
            <div className="order-1 lg:order-2">
              <div className="relative aspect-video overflow-hidden rounded-2xl shadow-[0_20px_44px_-20px_rgba(15,23,42,0.55)]">
                <PlaceholderThumb seed={event.slug} src={event.coverImage} label={event.title} alt={event.title} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. NOI DUNG + THE DANG KY ─────────────────────────────────── */}
      <section className="site-container mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-8">
        <div className="min-w-0">
          {/* Tab dang vien thuoc */}
          <div
            role="tablist"
            aria-label="Nội dung sự kiện"
            className="no-scrollbar inline-flex max-w-full gap-1 overflow-x-auto rounded-2xl border border-white bg-white p-1.5 shadow-[0_10px_30px_-18px_rgba(30,64,175,0.35)]"
          >
            {TABS.map(({ key, label, icon: Icon }) => {
              const isActive = tab === key;
              const count = key === 'thu-vien' ? gallery.length : key === 'danh-gia' ? getEventReviews(event).length : null;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setTab(key)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-theme-sm font-semibold transition ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-500 to-brand-700 text-white shadow-theme-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-brand-600'
                  }`}
                >
                  <Icon aria-hidden className="h-4 w-4" />
                  {label}
                  {count !== null && count > 0 && (
                    <span
                      className={`rounded-full px-1.5 text-[11px] font-bold ${isActive ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-5">
            {tab === 'tong-quan' && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-white bg-white p-6 shadow-[0_10px_30px_-18px_rgba(30,64,175,0.35)]">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-navy-800">
                    <span className="h-5 w-1 rounded-full bg-gradient-to-b from-sky-400 to-violet-500" />
                    Giới thiệu sự kiện
                  </h2>
                  <p className="mt-3 text-base leading-relaxed text-gray-700">{event.description ?? event.excerpt}</p>
                  {event.tags && event.tags.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
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

                {event.speakers && event.speakers.length > 0 && (
                  <div className="rounded-2xl border border-white bg-white p-6 shadow-[0_10px_30px_-18px_rgba(30,64,175,0.35)]">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-navy-800">
                      <span className="h-5 w-1 rounded-full bg-gradient-to-b from-sky-400 to-violet-500" />
                      Diễn giả
                    </h2>
                    <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                      {event.speakers.map((speaker, index) => (
                        <li
                          key={speaker.publicId}
                          className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gradient-to-br from-white to-sky-50/60 p-4"
                        >
                          <span
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-base font-bold text-white shadow-theme-sm ring-4 ring-white ${
                              index % 2 === 0 ? 'from-sky-400 to-brand-600' : 'from-violet-400 to-purple-600'
                            }`}
                          >
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
              </div>
            )}

            {tab === 'thu-vien' && (
              <div className="rounded-2xl border border-white bg-white p-4 shadow-[0_10px_30px_-18px_rgba(30,64,175,0.35)] sm:p-5">
                <Gallery images={gallery} title={event.title} />
              </div>
            )}

            {tab === 'danh-gia' && <Reviews event={event} isPast={isPast || status === 'ongoing'} />}
          </div>
        </div>

        {/* ── The dang ky (dinh khi cuon) ─────────────────────────────── */}
        <aside id="dang-ky" className="scroll-mt-24 lg:self-start">
          <div className="overflow-hidden rounded-3xl border border-white bg-white shadow-[0_20px_50px_-26px_rgba(30,64,175,0.5)] lg:sticky lg:top-24">
            {/* Phi tham du */}
            <div className="relative isolate overflow-hidden bg-gradient-to-br from-brand-600 via-indigo-600 to-violet-600 px-6 py-5 text-white">
              <span aria-hidden className="absolute -top-10 -right-8 -z-10 h-32 w-32 rounded-full bg-white/15 blur-xl" />
              <p className="text-theme-xs font-medium text-white/75">Phí tham dự</p>
              <p className="mt-0.5 text-3xl font-bold">{formatPrice(event)}</p>
            </div>

            <div className="p-5 sm:p-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-gray-100 bg-gray-25 p-3.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <FiUsers aria-hidden className="h-4 w-4" />
                  </span>
                  <p className="mt-2 text-2xl font-bold text-navy-800">{formatNumber(event.registered)}</p>
                  <p className="text-theme-xs text-gray-500">Người đăng ký</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-25 p-3.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <FiCheckCircle aria-hidden className="h-4 w-4" />
                  </span>
                  <p className="mt-2 text-2xl font-bold text-navy-800">{formatNumber(checkedIn)}</p>
                  <p className="text-theme-xs text-gray-500">Đã check-in</p>
                </div>
              </div>

              {event.capacity !== undefined && !isPast && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-theme-xs">
                    <span className="text-gray-500">
                      {formatNumber(event.registered)}/{formatNumber(event.capacity)} chỗ
                    </span>
                    {seatsLeft !== null && seatsLeft > 0 && (
                      <span className={`font-semibold ${seatsLeft <= 10 ? 'text-error-600' : 'text-emerald-600'}`}>
                        Còn {seatsLeft} chỗ
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
                    <span
                      className="block h-full rounded-full bg-gradient-to-r from-sky-400 via-brand-500 to-violet-500"
                      style={{ width: `${Math.min(100, (event.registered / event.capacity) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="mt-5 space-y-3 border-t border-gray-100 pt-5">
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
                <Link
                  href="/su-kien"
                  className="flex w-full items-center justify-center gap-2 text-theme-sm font-medium text-gray-500 transition hover:text-brand-600"
                >
                  <FiArrowLeft aria-hidden />
                  Danh sách sự kiện
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
};

export default EventDetailPage;
