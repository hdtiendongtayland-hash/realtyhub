import Image from 'next/image';
import Link from 'next/link';
import { FiArrowRight, FiCheckCircle, FiMapPin } from 'react-icons/fi';

import PageBanner from '@/common/components/PageBanner';
import { MOCK_DEVELOPER_RECORDS } from '@/modules/developer/mocks/developers.mock';
import { MOCK_PROJECTS } from '@/modules/project/mocks/projects.mock';
import { resolveAboutIcon } from './iconRegistry';
import type { AboutPageContent } from '../models/about.model';

/** "MOT NEN TANG – DU MOI CONG CU" -> "Một nền tảng – đủ mọi công cụ" */
const sentenceCase = (text: string) => {
  const lower = text.toLocaleLowerCase('vi');
  // Giu dung ten thuong hieu
  return (lower.charAt(0).toLocaleUpperCase('vi') + lower.slice(1)).replace(/realty ?hub/g, 'RealtyHub').replace(/miền nam/g, 'miền Nam');
};

/** Mau nen icon xoay vong cho 8 cong cu - nhin sinh dong hon mot mau */
const TINTS = [
  'bg-brand-50 text-brand-600',
  'bg-jade-50 text-jade-600',
  'bg-accent-50 text-accent-600',
  'bg-purple-50 text-purple-600',
];

const SectionTitle = ({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) => (
  <div className="mx-auto mb-8 max-w-2xl text-center">
    <span className="text-theme-xs font-bold tracking-[0.2em] text-brand-600 uppercase">{eyebrow}</span>
    <h2 className="mt-2 text-2xl font-bold text-navy-800 md:text-[28px]">{title}</h2>
    {body && <p className="mt-3 text-theme-sm leading-relaxed text-gray-600 md:text-base">{body}</p>}
  </div>
);

/**
 * Trang /gioi-thieu:
 *  1. Banner anh + 2 nut, hang so lieu noi len mep duoi (so lieu that tu du lieu)
 *  2. 8 cong cu (the icon nhieu mau)
 *  3. Anh + the "Mien Nam" + gia tri
 *  4. Hanh trinh 7 buoc (duong noi giua cac buoc)
 *  5. The dang ky cong tac vien co anh
 */
const AboutPageView = ({ content }: { content: AboutPageContent }) => {
  const { hero, intro, inventory, trusted, journey, cta } = content;

  const stats = [
    { value: MOCK_PROJECTS.length, label: 'Dự án đang phân phối' },
    { value: MOCK_DEVELOPER_RECORDS.length, label: 'Chủ đầu tư đối tác' },
    { value: new Set(MOCK_PROJECTS.map((project) => project.regionName)).size, label: 'Tỉnh / thành có dự án' },
    { value: intro.pillars.length, label: 'Công cụ cho môi giới', exact: true },
  ];

  return (
    <main className="bg-gray-25 pb-12 md:pb-16">
      <PageBanner
        crumb="Giới thiệu"
        eyebrow="Về RealtyHub"
        imageUrl="/images/about/hero.jpg"
        title={
          <>
            Nền tảng công nghệ dành riêng cho <span className="text-brand-300">môi giới bất động sản</span>
          </>
        }
        description={hero.lead}
        overlap={
          <ul className="grid grid-cols-2 gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-theme-lg md:grid-cols-4 md:gap-0 md:divide-x md:divide-gray-100 md:p-5">
            {stats.map((stat) => (
              <li key={stat.label} className="text-center md:px-4">
                <p className="text-2xl font-bold text-brand-600 md:text-3xl">{stat.value}
                  {'exact' in stat ? '' : '+'}
                </p>
                <p className="mt-1 text-theme-xs text-gray-500 md:text-theme-sm">{stat.label}</p>
              </li>
            ))}
          </ul>
        }
      >
        <div className="flex flex-wrap gap-3">
          <Link
            href={hero.primaryCta.href}
            className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-3 text-theme-sm font-semibold text-white transition hover:bg-brand-600"
          >
            Đăng ký cộng tác viên
            <FiArrowRight aria-hidden />
          </Link>
          {hero.secondaryCta && (
            <Link
              href={hero.secondaryCta.href}
              className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-5 py-3 text-theme-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              {hero.secondaryCta.label}
            </Link>
          )}
        </div>
      </PageBanner>

      {/* ── 2. Cong cu ───────────────────────────────────────────────── */}
      <section className="site-container pt-14 md:pt-16">
        <SectionTitle eyebrow="Công cụ" title={sentenceCase(intro.title)} body={intro.body} />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {intro.pillars.map((pillar, index) => {
            const Icon = resolveAboutIcon(pillar.iconKey);
            return (
              <li
                key={pillar.title}
                className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-theme-xs transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-theme-md"
              >
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${TINTS[index % TINTS.length]}`}>
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-gray-900">{pillar.title}</h3>
                <p className="mt-1.5 text-theme-sm leading-relaxed text-gray-500">{pillar.description}</p>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ── 3. Mien Nam ──────────────────────────────────────────────── */}
      <section className="site-container pt-14 md:pt-16">
        <div className="grid items-stretch gap-6 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-theme-sm lg:grid-cols-2">
          <div className="relative min-h-64">
            <Image src="/images/about/mission.jpg" alt="Dự án tại miền Nam" fill sizes="(max-width: 1024px) 100vw, 640px" className="object-cover" />
            <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-theme-xs font-bold text-navy-800 shadow">
              <FiMapPin aria-hidden className="text-brand-600" />
              Trọng tâm: {inventory.regionCallout.region}
            </span>
          </div>
          <div className="p-6 md:p-10">
            <span className="text-theme-xs font-bold tracking-[0.2em] text-brand-600 uppercase">Quỹ căn</span>
            <h2 className="mt-2 text-2xl font-bold text-navy-800">{sentenceCase(inventory.title)}</h2>
            <p className="mt-3 text-theme-sm leading-relaxed text-gray-600 md:text-base">
              {inventory.regionCallout.description}
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {trusted.values.map((value) => (
                <li key={value.title} className="flex items-start gap-2.5">
                  <FiCheckCircle aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-jade-500" />
                  <span>
                    <span className="block text-theme-sm font-semibold text-gray-900">{value.title}</span>
                    <span className="block text-theme-xs text-gray-500">{value.description}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── 4. Hanh trinh ────────────────────────────────────────────── */}
      <section className="site-container pt-14 md:pt-16">
        <SectionTitle eyebrow="Đồng hành" title={sentenceCase(journey.title)} body={journey.subtitle} />
        <ol className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-7 lg:gap-3">
          {/* Duong noi cac buoc tren may tinh */}
          <span aria-hidden className="absolute top-5 right-[7%] left-[7%] hidden h-0.5 bg-brand-100 lg:block" />
          {journey.steps.map((step, index) => (
            <li key={step.title} className="relative flex gap-3 lg:flex-col lg:items-center lg:text-center">
              <span className="brand-gradient relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-theme-sm font-bold text-white ring-4 ring-gray-25">
                {index + 1}
              </span>
              <div>
                <h3 className="text-theme-sm font-semibold text-gray-900 lg:mt-3">{step.title}</h3>
                <p className="mt-1 text-theme-xs leading-relaxed text-gray-500">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── 5. Dang ky cong tac vien ─────────────────────────────────── */}
      <section className="site-container pt-14 md:pt-16">
        <div className="relative isolate overflow-hidden rounded-3xl bg-navy-800 p-6 text-white md:p-10">
          <Image src="/images/projects/the-global-city.jpg" alt="" fill sizes="1280px" className="-z-20 object-cover" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-800 via-navy-800/90 to-brand-600/60" />
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold md:text-[28px]">{sentenceCase(cta.title)}</h2>
              <p className="mt-2 text-theme-sm leading-relaxed text-white/80 md:text-base">{cta.body}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link
                href={cta.primaryCta.href}
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-theme-sm font-semibold text-white transition hover:bg-brand-600"
              >
                Đăng ký ngay
                <FiArrowRight aria-hidden />
              </Link>
              {cta.secondaryCta && (
                <Link
                  href={cta.secondaryCta.href}
                  className="inline-flex items-center rounded-full border border-white/30 px-6 py-3 text-theme-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {sentenceCase(cta.secondaryCta.label)}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutPageView;
