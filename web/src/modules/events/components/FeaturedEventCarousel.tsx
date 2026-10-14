'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FiArrowLeft,
  FiArrowRight,
  FiAward,
  FiCalendar,
  FiDownload,
  FiFileText,
  FiMapPin,
  FiTag,
  FiUser,
  FiUsers,
  FiVideo,
} from 'react-icons/fi';
import { HiOutlineAcademicCap } from 'react-icons/hi2';

import PlaceholderThumb from '@/common/components/PlaceholderThumb';

/** Du lieu da tinh san o server (gio, gia, file lich) - client chi ve */
export type FeaturedSlide = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  typeLabel: string;
  dateLabel: string;
  locationLabel: string;
  isOnline: boolean;
  registeredLabel?: string;
  priceLabel: string;
  isFree: boolean;
  daysLeft: number;
  isFull: boolean;
  icsHref: string;
};

const AUTOPLAY_MS = 6000;

/** Diem noi bat o cot phai */
const HIGHLIGHTS = [
  { icon: FiUser, label: 'Chuyên gia hàng đầu' },
  { icon: FiFileText, label: 'Nội dung thực tiễn' },
  { icon: FiAward, label: 'Chứng nhận tham dự' },
];

/**
 * Bang trinh chieu "su kien noi bat" tren /su-kien - nen sang xanh nhat:
 *  - Trai: anh cat cheo mep phai, nhan "Con X ngay", mui ten + cham
 *  - Giua: loai, tieu de, mo ta, ngay / dia diem / so cho, 2 nut
 *  - Phai (man rong): the chi phi + 3 diem noi bat
 * Tu chuyen 6s, ro chuot thi dung. Chieu cao co dinh tren may tinh.
 */
const FeaturedEventCarousel = ({ slides }: { slides: FeaturedSlide[] }) => {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const count = slides.length;

  useEffect(() => {
    if (count < 2 || isPaused) return undefined;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % count), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [count, isPaused]);

  if (count === 0) return null;
  const slide = slides[Math.min(index, count - 1)];
  const go = (step: number) => setIndex((current) => (current + step + count) % count);

  return (
    <article
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative isolate grid overflow-hidden rounded-3xl border border-white bg-gradient-to-br from-white via-[#f3f7ff] to-[#e6efff] shadow-[0_20px_50px_-25px_rgba(30,64,175,0.4)] md:grid-cols-2 lg:h-[340px] lg:grid-cols-[auto_minmax(0,1fr)] xl:grid-cols-[auto_minmax(0,1fr)_300px]"
    >
      {/* Vet sang trang tri goc phai */}
      <span aria-hidden className="absolute -right-16 -bottom-20 -z-10 h-64 w-64 rounded-full bg-sky-200/60 blur-3xl" />

      {/* ── Anh (cat cheo mep phai) ─────────────────────────── */}
      <div className="p-3 pb-0 md:pb-3 lg:h-full lg:p-4">
      <div className="relative aspect-video overflow-hidden rounded-2xl shadow-[0_12px_30px_-14px_rgba(15,23,42,0.55)] md:aspect-auto md:h-full md:min-h-[280px] lg:aspect-video lg:min-h-0">
        {slides.map((item, i) => (
          <Link
            key={item.slug}
            href={`/su-kien/${item.slug}`}
            aria-hidden={i !== index}
            tabIndex={i === index ? 0 : -1}
            className={`absolute inset-0 transition-opacity duration-700 ${i === index ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          >
            <PlaceholderThumb seed={item.slug} src={item.coverImage} label={item.title} alt={item.title} />
          </Link>
        ))}
        <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" />

        {slide.daysLeft > 0 && (
          <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3.5 py-1.5 text-theme-xs font-bold tracking-wide text-white uppercase shadow-theme-md">
            <FiCalendar aria-hidden className="h-4 w-4" />
            Còn {slide.daysLeft} ngày
          </span>
        )}

        {count > 1 && (
          <div className="absolute bottom-4 left-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Sự kiện trước"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur transition hover:bg-black/55"
            >
              <FiArrowLeft aria-hidden />
            </button>
            <div className="flex items-center gap-1.5">
              {slides.map((item, i) => (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Sự kiện ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/60'}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Sự kiện sau"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur transition hover:bg-black/55"
            >
              <FiArrowRight aria-hidden />
            </button>
          </div>
        )}
      </div>

      </div>

      {/* ── Noi dung ────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-col justify-center gap-3 overflow-hidden p-5 sm:p-6 lg:py-6 lg:pr-4 lg:pl-4 [&>*]:shrink-0">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-[11px] font-bold tracking-wide text-brand-700 uppercase">
          <HiOutlineAcademicCap aria-hidden className="h-4 w-4" />
          {slide.typeLabel}
        </span>
        <h2 className="line-clamp-2 text-xl leading-tight font-bold text-navy-800 md:text-2xl">
          <Link href={`/su-kien/${slide.slug}`} className="transition hover:text-brand-600">
            {slide.title}
          </Link>
        </h2>
        <p className="line-clamp-2 text-theme-sm leading-relaxed text-gray-600">{slide.excerpt}</p>

        <ul className="space-y-1.5 text-theme-sm text-gray-700">
          <li className="flex items-center gap-2.5">
            <FiCalendar aria-hidden className="h-4 w-4 shrink-0 text-brand-500" />
            {slide.dateLabel}
          </li>
          <li className="flex items-center gap-2.5">
            {slide.isOnline ? (
              <FiVideo aria-hidden className="h-4 w-4 shrink-0 text-brand-500" />
            ) : (
              <FiMapPin aria-hidden className="h-4 w-4 shrink-0 text-brand-500" />
            )}
            <span className="line-clamp-1">{slide.locationLabel}</span>
          </li>
          {slide.registeredLabel && (
            <li className="flex items-center gap-2.5">
              <FiUsers aria-hidden className="h-4 w-4 shrink-0 text-brand-500" />
              {slide.registeredLabel}
            </li>
          )}
        </ul>

        <div className="mt-1 flex flex-wrap items-center gap-2.5 sm:gap-3">
          {slide.isFull ? (
            <span className="rounded-xl bg-gray-100 px-5 py-2.5 text-theme-sm font-semibold text-gray-500">Đã đầy</span>
          ) : (
            <Link
              href={`/su-kien/${slide.slug}`}
              className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 py-2.5 pr-5 pl-2.5 text-theme-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(15,111,209,0.8)] transition hover:brightness-110"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                <FiArrowRight aria-hidden className="h-3.5 w-3.5" />
              </span>
              Đăng ký tham dự
            </Link>
          )}
          <a
            href={slide.icsHref}
            download={`${slide.slug}.ics`}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-white px-5 py-2.5 text-theme-sm font-semibold text-brand-700 transition hover:border-brand-400 hover:bg-brand-25"
          >
            <FiDownload aria-hidden className="h-4 w-4" />
            Thêm vào lịch
          </a>
        </div>

        {/* Gia tren man hep (cot phai an) */}
        <p className="flex items-center gap-2 text-theme-sm xl:hidden">
          <FiTag aria-hidden className="h-4 w-4 text-brand-500" />
          <span className="text-gray-500">Chi phí tham dự:</span>
          <strong className={slide.isFree ? 'text-emerald-600' : 'text-navy-800'}>{slide.priceLabel}</strong>
        </p>
      </div>

      {/* ── Cot phai: chi phi + diem noi bat (man rong) ─────── */}
      <aside className="hidden flex-col justify-center gap-3 py-6 pr-6 xl:flex">
        <div className="rounded-2xl border border-white bg-white/80 p-4 shadow-[0_10px_30px_-16px_rgba(30,64,175,0.35)] backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <FiTag aria-hidden className="h-5 w-5" />
            </span>
            <div>
              <p className="text-theme-xs text-gray-500">Chi phí tham dự</p>
              <p className={`text-2xl leading-tight font-bold ${slide.isFree ? 'text-emerald-600' : 'text-navy-800'}`}>
                {slide.priceLabel}
              </p>
            </div>
          </div>
        </div>

        <ul className="space-y-2 rounded-2xl border border-white bg-white/70 p-3 backdrop-blur">
          {HIGHLIGHTS.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3 rounded-xl px-2 py-1.5 text-theme-sm text-gray-700">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <Icon aria-hidden className="h-4 w-4" />
              </span>
              {label}
            </li>
          ))}
        </ul>
      </aside>
    </article>
  );
};

export default FeaturedEventCarousel;
