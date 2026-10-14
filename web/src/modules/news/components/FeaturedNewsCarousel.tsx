'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiArrowRight, FiCalendar, FiChevronLeft, FiChevronRight, FiClock, FiStar } from 'react-icons/fi';

import PlaceholderThumb from '@/common/components/PlaceholderThumb';

/** Du lieu da tinh san o server - client chi ve */
export type NewsSlide = {
  slug: string;
  title: string;
  excerpt: string;
  thumbnailUrl?: string;
  categoryLabel: string;
  dateLabel: string;
  readMinutes: number;
};

const AUTOPLAY_MS = 6000;

/**
 * Trinh chieu bai noi bat tren /tin-tuc - cung kieu slide trang Su kien: nen
 * xanh chuyen tim, anh hoa vao nen, mui ten + cham, tu chuyen 6s, ro chuot
 * thi dung. Chieu cao co dinh tren may tinh nen doi slide khong nhay bo cuc.
 */
const FeaturedNewsCarousel = ({ slides }: { slides: NewsSlide[] }) => {
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
      className="relative isolate grid overflow-hidden rounded-3xl bg-[linear-gradient(110deg,#0a1a4f_0%,#1a2a80_40%,#3a2c9c_75%,#5a3cc0_100%)] text-white shadow-theme-lg md:grid-cols-2 lg:h-[380px] lg:grid-cols-[1.1fr_1fr]"
    >
      <span aria-hidden className="pointer-events-none absolute -right-24 -bottom-28 -z-10 h-80 w-80 rounded-full bg-[#8b5cf6]/35 blur-3xl" />

      {/* Anh */}
      <div className="relative aspect-video overflow-hidden md:aspect-auto md:h-full md:min-h-[280px] md:[mask-image:linear-gradient(to_right,black_65%,transparent)]">
        {slides.map((item, i) => (
          <Link
            key={item.slug}
            href={`/tin-tuc/${item.slug}`}
            aria-hidden={i !== index}
            tabIndex={i === index ? 0 : -1}
            className={`absolute inset-0 transition-opacity duration-700 ${i === index ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          >
            <PlaceholderThumb seed={item.slug} src={item.thumbnailUrl} alt={item.title} />
          </Link>
        ))}
        <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-theme-xs font-bold tracking-wide text-brand-700 uppercase shadow-theme-md">
          <FiStar aria-hidden className="h-3.5 w-3.5" />
          Nổi bật
        </span>

        {count > 1 && (
          <div className="absolute bottom-4 left-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Bài trước"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur transition hover:bg-black/55"
            >
              <FiChevronLeft aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Bài sau"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur transition hover:bg-black/55"
            >
              <FiChevronRight aria-hidden />
            </button>
            <div className="ml-1 flex items-center gap-1.5">
              {slides.map((item, i) => (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Bài ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Noi dung */}
      <div className="flex min-h-0 flex-col justify-center gap-3.5 overflow-hidden p-5 sm:p-6 lg:p-8 [&>*]:shrink-0">
        <span className="w-fit rounded-full border border-sky-300 bg-sky-50 px-3 py-0.5 text-[11px] font-bold tracking-wide text-sky-700 uppercase">
          {slide.categoryLabel}
        </span>
        <h2 className="line-clamp-2 text-xl leading-tight font-bold md:text-2xl xl:text-[28px]">
          <Link href={`/tin-tuc/${slide.slug}`} className="transition hover:text-sky-200">
            {slide.title}
          </Link>
        </h2>
        <p className="line-clamp-3 text-theme-sm leading-relaxed text-white/75 md:text-base">{slide.excerpt}</p>
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-theme-xs text-white/70">
          <li className="flex items-center gap-1.5">
            <FiCalendar aria-hidden className="h-3.5 w-3.5" />
            {slide.dateLabel}
          </li>
          <li className="flex items-center gap-1.5">
            <FiClock aria-hidden className="h-3.5 w-3.5" />
            {slide.readMinutes} phút đọc
          </li>
        </ul>
        <Link
          href={`/tin-tuc/${slide.slug}`}
          className="mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-[#a855f7] to-[#6366f1] px-5 py-2.5 text-theme-sm font-semibold text-white shadow-theme-md transition hover:brightness-110"
        >
          Đọc bài viết
          <FiArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
};

export default FeaturedNewsCarousel;
