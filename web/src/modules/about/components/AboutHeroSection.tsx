/**
 * HERO cho trang /gioi-thieu - phien ban viet lai ngay 05/09/2026.
 *
 * Truoc day hero thuoc MOCK_ABOUT_CONTENT (anh that, navbar gradient, stats
 * row ben duoi) - phu hop cho gioi thieu doanh nghiep truyen thong.
 *
 * Phien ban moi: nhan manh "NEN TANG CONG NGHE DANH CHO MOI GIOI" voi
 * phong cach hien dai - nen gradient dam, cac chip promise, CTA chinh +
 * CTA phu, va bang stats (placeholder khong tu tao so lieu khong nguon).
 *
 * Sau migration:
 *  - Section là Server Component (loại bỏ `'use client'` vì không cần
 *    state/effect) -> dùng `getTranslations` thay vì `useTranslations`.
 *  - Text lấy từ namespace `about.hero` thay vì từ mock data. Mock data
 *    vẫn giữ nguyên cho các section khác (intro/values/highlights) - khi
 *    từng cái được migrate, comment sẽ được cập nhật.
 *  - `Link` từ `@/i18n/navigation` để preserve locale prefix.
 */

import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { FiArrowRight } from 'react-icons/fi';

const AboutHeroSection = async () => {
  // Server Component -> dùng `getTranslations` thay cho `useTranslations`.
  // Cùng namespace nhưng resolve đồng bộ trong quá trình render SSR.
  const t = await getTranslations('about.hero');

  return (
    <section
      className="relative isolate overflow-hidden bg-navy-900 pb-44 pt-20 text-white md:pb-52 md:pt-28"
      aria-labelledby="about-hero-heading"
    >
      {/* Lop phu nen gradient - giu phong cach dark, khong can anh that */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-linear-to-br from-navy-900 via-navy-900 to-brand-900" />
        {/* Grid cong nghe mo phong - hinh vuong nho, opacity thap */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />
        {/* 2 vong sang lon - cam giac tech, hien dai */}
        <div className="absolute -left-24 top-1/4 h-96 w-96 rounded-full bg-brand-500/15 blur-3xl" />
        <div className="absolute -right-32 bottom-1/4 h-80 w-80 rounded-full bg-jade-500/10 blur-3xl" />
      </div>

      <div className="site-container">
        <div className="max-w-3xl">
          <h1
            id="about-hero-heading"
            className="mt-6 text-3xl font-bold uppercase leading-[1.1] tracking-tight md:text-5xl lg:text-6xl"
          >
            {t('headline')}
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
            {t('lead')}
          </p>

          {/* CTA chinh + CTA phu */}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/tro-thanh-moi-gioi"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 px-7 py-3.5 text-theme-sm font-bold uppercase tracking-wide shadow-card-hover transition hover:bg-brand-600 sm:w-auto"
            >
              {t('primaryCta')}
              <FiArrowRight aria-hidden className="transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/quy-can"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/5 px-7 py-3.5 text-theme-sm font-semibold text-white backdrop-blur-sm transition hover:border-white hover:bg-white/10 sm:w-auto"
            >
              {t('secondaryCta')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHeroSection;
