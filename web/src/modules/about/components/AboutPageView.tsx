import Image from 'next/image';
import Link from 'next/link';
import { FaRegHandshake } from 'react-icons/fa';
import { FiArrowRight, FiCheckCircle, FiChevronRight, FiGrid, FiHome, FiMapPin, FiMessageSquare, FiPlayCircle, FiSearch, FiStar, FiUser, FiUsers } from 'react-icons/fi';

import { MOCK_DEVELOPER_RECORDS } from '@/modules/developer/mocks/developers.mock';
import { INVESTORS } from '@/modules/developer/mocks/investors.mock';
import { MOCK_PROJECTS } from '@/modules/project/mocks/projects.mock';
import { resolveAboutIcon } from './iconRegistry';
import type { AboutPageContent } from '../models/about.model';

/** "MOT NEN TANG – DU MOI CONG CU" -> "Một nền tảng – đủ mọi công cụ" */
const sentenceCase = (text: string) => {
  const lower = text.toLocaleLowerCase('vi');
  return (lower.charAt(0).toLocaleUpperCase('vi') + lower.slice(1))
    .replace(/realty ?hub/g, 'RealtyHub')
    .replace(/miền nam/g, 'miền Nam');
};

/** Mau cho 4 the cong cu (AI, tim quy can, so sanh, theo doi) */
const TOOL_CARD_TONES = [
  { card: 'from-white to-sky-50', icon: 'from-sky-400 to-brand-600', arrow: 'bg-brand-600 text-white' },
  { card: 'from-white to-emerald-50', icon: 'from-emerald-400 to-teal-600', arrow: 'bg-emerald-100 text-emerald-700' },
  { card: 'from-white to-orange-50', icon: 'from-amber-300 to-orange-500', arrow: 'bg-orange-100 text-orange-600' },
  { card: 'from-white to-violet-50', icon: 'from-violet-400 to-purple-600', arrow: 'bg-violet-100 text-violet-700' },
];

/** Cong cu noi bat (trong 8 cong cu): AI, tim quy can, so sanh, theo doi giao dich */
const FEATURED_TOOLS = [0, 1, 3, 7];
/** Hanh trinh rut gon: tim kiem, tim quy can, tu van, ho tro giao dich */
const FEATURED_STEPS = [0, 2, 4, 6];
/** Icon cho 4 buoc: tim kiem, tim quy can, tu van, ho tro giao dich */
const STEP_ICONS = [FiSearch, FiMapPin, FiMessageSquare, FaRegHandshake];


/**
 * Trang /gioi-thieu - ban gon, nen sang, anh mo dan:
 *  1. Dau trang: chu ben trai, anh ben phai mo dan sang trai, hang so lieu
 *  2. 4 cong cu noi bat
 *  3. Khoi "Quy can mien Nam" co anh nen mo
 *  4. Hanh trinh 4 buoc
 *  5. CTA cong tac vien co anh nen mo
 */
const AboutPageView = ({ content }: { content: AboutPageContent }) => {
  const { hero, intro, inventory, trusted, journey, cta } = content;

  const stats = [
    { value: `${MOCK_PROJECTS.length}+`, label: 'Dự án đang phân phối', icon: FiUsers, tone: 'bg-brand-50 text-brand-600' },
    { value: `${MOCK_DEVELOPER_RECORDS.length}+`, label: 'Chủ đầu tư đối tác', icon: FiUser, tone: 'bg-emerald-50 text-emerald-600' },
    { value: `${new Set(MOCK_PROJECTS.map((project) => project.regionName)).size}+`, label: 'Tỉnh / thành có dự án', icon: FiGrid, tone: 'bg-violet-50 text-violet-600' },
    { value: String(intro.pillars.length), label: 'Công cụ cho môi giới', icon: FiStar, tone: 'bg-amber-50 text-amber-600' },
  ];

  // Tieu de cong cu: to xanh cum "bứt phá doanh số"
  const toolsFull = sentenceCase(intro.title);
  const cut = toolsFull.toLocaleLowerCase('vi').indexOf('bứt phá doanh số');
  const toolsTitle = cut >= 0 ? { head: toolsFull.slice(0, cut), highlight: toolsFull.slice(cut) } : { head: toolsFull, highlight: '' };

  // Tieu de hanh trinh: to mau cum "mỗi giao dịch"
  const journeyFull = sentenceCase(journey.title);
  const jcut = journeyFull.toLocaleLowerCase('vi').indexOf('mỗi giao dịch');
  const journeyTitle = jcut >= 0 ? { head: journeyFull.slice(0, jcut), highlight: journeyFull.slice(jcut) } : { head: journeyFull, highlight: '' };

  // Logo chu dau tu cho dai chay ngang
  const partners = INVESTORS.filter((investor) => investor.logo);

  const tools = FEATURED_TOOLS.map((i) => intro.pillars[i]).filter(Boolean);
  const steps = FEATURED_STEPS.map((i) => journey.steps[i]).filter(Boolean);

  return (
    <main className="bg-gray-25 pb-14 md:pb-20">
      {/* ── 1. DAU TRANG ──────────────────────────────────────────── */}
      <section className="site-container pt-6">
        <div className="relative isolate overflow-hidden rounded-3xl border border-white bg-white shadow-[0_24px_60px_-30px_rgba(30,64,175,0.45)]">
          {/* Anh thanh pho tuoi sang ben phai, mo dan sang trai */}
          <div
            aria-hidden
            className="absolute inset-y-0 right-0 -z-20 w-full md:w-[62%] [mask-image:linear-gradient(to_left,black_0%,black_45%,rgba(0,0,0,0.6)_70%,transparent_100%)] max-md:opacity-30"
          >
            <Image
              src="/images/about/hero.jpg"
              alt=""
              fill
              priority
              sizes="62vw"
              className="object-cover brightness-110 contrast-110 saturate-150"
            />
            <span className="absolute inset-0 bg-gradient-to-b from-sky-400/25 via-transparent to-sky-200/20" />
          </div>

          {/* Lop song xanh trang tri: goc tren va day */}
          <svg
            aria-hidden
            viewBox="0 0 1440 600"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
          >
            <defs>
              <linearGradient id="about-wave-top" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#bfe0ff" stopOpacity="0.9" />
                <stop offset="1" stopColor="#5aa8f5" stopOpacity="0.55" />
              </linearGradient>
              <linearGradient id="about-wave-bottom" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#9ccdff" stopOpacity="0.85" />
                <stop offset="0.6" stopColor="#dbeeff" stopOpacity="0.9" />
                <stop offset="1" stopColor="#ffffff" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path d="M560 0 C 640 120, 760 150, 900 120 L 980 0 Z" fill="url(#about-wave-top)" />
            <path d="M0 470 C 260 560, 520 520, 760 545 C 1000 570, 1240 520, 1440 560 L 1440 600 L 0 600 Z" fill="url(#about-wave-bottom)" />
          </svg>

          {/* Chu viet tay goc phai */}
          <div aria-hidden className="absolute top-10 right-10 hidden text-right text-white drop-shadow-[0_2px_8px_rgba(15,23,42,0.35)] lg:block">
            <p className="font-[family-name:var(--font-handwriting)] text-4xl font-semibold">Kết nối giá trị</p>
            <p className="mt-1 text-theme-sm font-medium">Kiến tạo thành công</p>
          </div>

          <div className="relative px-6 pt-10 pb-14 md:px-12 md:pt-14 md:pb-20">
            <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-theme-xs text-gray-500">
              <Link href="/" className="inline-flex items-center gap-1 transition hover:text-brand-600">
                <FiHome aria-hidden className="h-3.5 w-3.5" />
                Trang chủ
              </Link>
              <FiChevronRight aria-hidden className="h-3.5 w-3.5 text-gray-300" />
              <span className="font-semibold text-gray-800">Giới thiệu</span>
            </nav>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3.5 py-1.5 text-theme-xs font-bold tracking-[0.12em] text-brand-700 uppercase">
              <FiStar aria-hidden className="h-3.5 w-3.5" />
              Về RealtyHub
            </span>
            <h1 className="mt-4 max-w-3xl text-3xl leading-tight font-bold text-navy-800 md:text-5xl">
              Nền tảng công nghệ dành riêng cho{' '}
              <span className="text-[#3b9bf5]">môi giới bất động sản</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-gray-600 md:text-lg">{hero.lead}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={hero.primaryCta.href}
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-brand-700 px-6 py-3.5 text-theme-sm font-semibold text-white shadow-[0_12px_28px_-12px_rgba(15,111,209,0.85)] transition hover:brightness-110"
              >
                Đăng ký cộng tác viên
                <FiArrowRight aria-hidden className="transition-transform group-hover:translate-x-1" />
              </Link>
              {hero.secondaryCta && (
                <Link
                  href={hero.secondaryCta.href}
                  className="inline-flex items-center gap-2 rounded-full border border-brand-300 bg-white/90 px-6 py-3.5 text-theme-sm font-semibold text-brand-700 backdrop-blur transition hover:border-brand-500"
                >
                  <FiPlayCircle aria-hidden className="h-4 w-4" />
                  {hero.secondaryCta.label}
                </Link>
              )}
            </div>

            <dl className="mt-10 grid max-w-4xl grid-cols-2 gap-3 lg:grid-cols-4">
              {stats.map(({ value, label, icon: Icon, tone }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-2xl border border-white bg-white/85 p-4 shadow-[0_12px_28px_-18px_rgba(30,64,175,0.45)] backdrop-blur"
                >
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${tone}`}>
                    <Icon aria-hidden className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <dd className="text-2xl leading-none font-bold text-navy-800">{value}</dd>
                    <dt className="mt-1 truncate text-theme-xs text-gray-500">{label}</dt>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ── 2. CONG CU NOI BAT ────────────────────────────────────── */}
      <section className="site-container pt-14 md:pt-16">
        <div className="relative isolate overflow-hidden rounded-3xl border border-white bg-gradient-to-b from-[#f2f8ff] via-[#f7fbff] to-[#eef5ff] px-5 py-10 shadow-[0_24px_60px_-34px_rgba(30,64,175,0.45)] md:px-10 md:py-14">
          {/* Mang cong trang tri */}
          <span aria-hidden className="absolute -top-28 -left-28 -z-10 h-72 w-72 rounded-full bg-gradient-to-br from-sky-300/70 to-brand-400/40" />
          <span aria-hidden className="absolute -top-10 -right-10 -z-10 h-40 w-40 rounded-full bg-sky-100" />
          <span aria-hidden className="absolute -bottom-32 -left-10 -z-10 h-64 w-[38rem] rounded-[50%] bg-sky-200/50 blur-2xl" />
          <span aria-hidden className="absolute -right-20 -bottom-28 -z-10 h-64 w-96 rounded-[50%] bg-violet-200/50 blur-2xl" />

          {/* Chu viet tay hai ben (man rong) */}
          <div aria-hidden className="absolute top-24 left-10 hidden -rotate-12 text-sky-500 xl:block">
            <p className="font-[family-name:var(--font-handwriting)] text-3xl leading-snug font-semibold">Công cụ thông minh</p>
            <p className="ml-8 font-[family-name:var(--font-handwriting)] text-3xl leading-snug font-semibold">Cho hiệu quả thật</p>
            <span className="mt-1 ml-4 block h-0.5 w-40 rotate-6 rounded-full bg-sky-400/70" />
          </div>
          <div aria-hidden className="absolute top-20 right-12 hidden -rotate-12 text-sky-500 xl:block">
            <p className="font-[family-name:var(--font-handwriting)] text-3xl leading-snug font-semibold">Tăng tốc</p>
            <p className="ml-6 font-[family-name:var(--font-handwriting)] text-3xl leading-snug font-semibold">Doanh số</p>
            <span className="mt-3 flex items-end gap-1">
              <span className="h-3 w-2 rounded-sm bg-sky-300" />
              <span className="h-5 w-2 rounded-sm bg-sky-400" />
              <span className="h-7 w-2 rounded-sm bg-brand-500" />
            </span>
          </div>

          {/* Tieu de */}
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <div className="flex items-center justify-center gap-4">
              <span aria-hidden className="h-px w-16 bg-sky-300" />
              <span className="rounded-full bg-sky-100 px-5 py-1.5 text-theme-sm font-bold tracking-wide text-brand-700 uppercase">
                Công cụ
              </span>
              <span aria-hidden className="h-px w-16 bg-sky-300" />
            </div>
            <h2 className="mt-5 text-2xl leading-tight font-bold text-navy-800 md:text-4xl">
              {toolsTitle.head}
              {toolsTitle.highlight && <span className="text-[#3b9bf5]">{toolsTitle.highlight}</span>}
            </h2>
            <p className="mt-4 text-theme-sm leading-relaxed text-gray-600 md:text-base">{intro.body}</p>
          </div>

          {/* 4 the cong cu */}
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {tools.map((pillar, index) => {
              const Icon = resolveAboutIcon(pillar.iconKey);
              const tone = TOOL_CARD_TONES[index % TOOL_CARD_TONES.length];
              return (
                <li
                  key={pillar.title}
                  className={`group relative isolate flex min-h-60 flex-col overflow-hidden rounded-2xl border border-white bg-gradient-to-br p-5 shadow-[0_14px_34px_-20px_rgba(30,64,175,0.45)] transition hover:-translate-y-1 hover:shadow-[0_22px_44px_-20px_rgba(30,64,175,0.5)] ${tone.card}`}
                >
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-[0_10px_20px_-8px_rgba(15,23,42,0.35)] ${tone.icon}`}
                  >
                    <Icon aria-hidden className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-base leading-snug font-bold text-navy-800 md:text-lg">{pillar.title}</h3>
                  <p className="mt-2 text-theme-xs leading-relaxed text-gray-600 md:text-theme-sm">{pillar.description}</p>
                  <span
                    className={`mt-auto flex h-9 w-9 items-center justify-center rounded-full pt-0 transition group-hover:translate-x-1 ${tone.arrow}`}
                  >
                    <FiArrowRight aria-hidden className="h-4 w-4" />
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ── 3. QUY CAN MIEN NAM (anh nen mo) ──────────────────────── */}
      <section className="site-container pt-14 md:pt-16">
        <div className="relative isolate overflow-hidden rounded-3xl border border-white bg-white shadow-[0_24px_60px_-30px_rgba(30,64,175,0.45)]">
          <div
            aria-hidden
            className="absolute inset-y-0 right-0 -z-10 w-full md:w-[60%] [mask-image:linear-gradient(to_left,black_0%,rgba(0,0,0,0.7)_40%,transparent_100%)] max-md:opacity-20"
          >
            <Image src="/images/projects/vinhomes-grand-park.jpg" alt="" fill sizes="60vw" className="object-cover" />
          </div>
          <div className="max-w-xl px-6 py-10 md:px-12 md:py-14">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-theme-xs font-bold text-brand-700">
              <FiMapPin aria-hidden />
              Trọng tâm: {inventory.regionCallout.region}
            </span>
            <h2 className="mt-4 text-2xl leading-tight font-bold text-navy-800 md:text-3xl">{sentenceCase(inventory.title)}</h2>
            <p className="mt-3 text-theme-sm leading-relaxed text-gray-600 md:text-base">{inventory.regionCallout.description}</p>
            <ul className="mt-6 space-y-3">
              {trusted.values.slice(0, 3).map((value) => (
                <li key={value.title} className="flex items-start gap-3">
                  <FiCheckCircle aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                  <span className="text-theme-sm">
                    <strong className="font-semibold text-gray-900">{value.title}</strong>
                    <span className="text-gray-500"> — {value.description}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── 4. HANH TRINH 4 BUOC ──────────────────────────────────── */}
      <section className="site-container pt-14 md:pt-16">
        <div className="relative isolate overflow-hidden rounded-3xl border border-white bg-gradient-to-b from-[#f4f8ff] via-[#f8fbff] to-[#eef4ff] px-5 pt-10 pb-28 shadow-[0_24px_60px_-34px_rgba(30,64,175,0.45)] md:px-10 md:pt-14 md:pb-36">
          {/* Trang tri: mang tron goc + thanh pho mo o day */}
          <span aria-hidden className="absolute -top-24 -left-24 -z-10 h-64 w-64 rounded-full bg-sky-100" />
          <span aria-hidden className="absolute -top-20 -right-16 -z-10 h-56 w-56 rounded-full bg-gradient-to-br from-sky-100 to-violet-200/70" />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 -z-10 h-32 opacity-20 [mask-image:linear-gradient(to_top,black_0%,transparent_100%)] md:h-40"
          >
            <Image src="/images/dao-tao/hero.jpg" alt="" fill sizes="100vw" className="object-cover object-bottom hue-rotate-15 saturate-50" />
          </div>
          <span aria-hidden className="absolute -bottom-16 -left-10 -z-10 h-40 w-[40rem] rounded-[50%] bg-sky-200/60 blur-2xl" />
          <span aria-hidden className="absolute -right-10 -bottom-16 -z-10 h-40 w-[30rem] rounded-[50%] bg-violet-200/60 blur-2xl" />

          {/* Tieu de */}
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <div className="flex items-center justify-center gap-4">
              <span aria-hidden className="h-px w-16 bg-sky-300" />
              <span className="text-theme-xs font-bold tracking-[0.35em] text-brand-600 uppercase">Đồng hành</span>
              <span aria-hidden className="h-px w-16 bg-sky-300" />
            </div>
            <h2 className="mt-4 text-2xl leading-tight font-bold text-navy-800 md:text-4xl">
              {journeyTitle.head}
              {journeyTitle.highlight && (
                <span className="bg-gradient-to-r from-sky-500 to-violet-600 bg-clip-text text-transparent">
                  {journeyTitle.highlight}
                </span>
              )}
            </h2>
            <span aria-hidden className="mx-auto mt-5 block h-1 w-16 rounded-full bg-gradient-to-r from-sky-400 to-violet-500" />
          </div>

          {/* 4 the buoc */}
          <ol className="relative grid gap-x-5 gap-y-10 pt-6 sm:grid-cols-2 xl:grid-cols-4">
            {/* Duong noi cac so (man rong) */}
            <span
              aria-hidden
              className="absolute top-6 right-[12%] left-[12%] hidden h-px bg-gradient-to-r from-sky-300 via-brand-400 to-violet-400 xl:block"
            />
            {steps.map((step, index) => {
              const StepIcon = STEP_ICONS[index % STEP_ICONS.length];
              return (
                <li
                  key={step.title}
                  className="relative flex flex-col rounded-2xl border border-sky-100 bg-white/90 px-5 pt-10 pb-5 shadow-[0_14px_34px_-20px_rgba(30,64,175,0.4)] backdrop-blur transition hover:-translate-y-1 hover:shadow-[0_22px_44px_-20px_rgba(30,64,175,0.5)]"
                >
                  {/* So tron tren mep the */}
                  <span className="absolute -top-6 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 via-brand-500 to-violet-600 text-lg font-bold text-white shadow-[0_10px_24px_-8px_rgba(79,70,229,0.7)] ring-4 ring-white">
                    {index + 1}
                  </span>
                  {/* Mui ten noi sang the ke tiep */}
                  {index < steps.length - 1 && (
                    <span
                      aria-hidden
                      className="absolute -top-2.5 -right-[1.05rem] z-10 hidden h-5 w-5 items-center justify-center rounded-full bg-white text-brand-500 shadow-theme-xs xl:flex"
                    >
                      <FiChevronRight className="h-3.5 w-3.5" />
                    </span>
                  )}

                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-50 to-violet-100 text-brand-600 shadow-[0_8px_18px_-10px_rgba(79,70,229,0.5)]">
                    <StepIcon aria-hidden className="h-7 w-7" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-navy-800">{step.title}</h3>
                  <p className="mt-2 text-theme-sm leading-relaxed text-gray-600">{step.description}</p>
                  <span className="mt-auto pt-4">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full ${
                        index === steps.length - 1 ? 'bg-violet-100 text-violet-700' : 'bg-sky-100 text-brand-600'
                      }`}
                    >
                      <FiArrowRight aria-hidden className="h-4 w-4" />
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ── 4b. DOI TAC CHU DAU TU (logo chay ngang) ──────────────── */}
      <section className="pt-14 md:pt-16">
        <div className="site-container mb-8 text-center">
          <div className="flex items-center justify-center gap-4">
            <span aria-hidden className="h-px w-16 bg-sky-300" />
            <span className="text-theme-xs font-bold tracking-[0.35em] text-brand-600 uppercase">Đối tác</span>
            <span aria-hidden className="h-px w-16 bg-sky-300" />
          </div>
          <h2 className="mt-4 text-2xl leading-tight font-bold text-navy-800 md:text-4xl">
            Đồng hành cùng các <span className="text-[#3b9bf5]">chủ đầu tư uy tín</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-theme-sm leading-relaxed text-gray-600 md:text-base">
            RealtyHub hợp tác với các chủ đầu tư, đơn vị phân phối và đối tác công nghệ để xây dựng hệ sinh thái trải nghiệm bất
            động sản trực quan, thống nhất và hiệu quả hơn.
          </p>
        </div>

        {/* Dai logo chay lien tuc - ro chuot thi dung; hai mep mo dan */}
        <div className="group relative overflow-hidden border-y border-gray-100 bg-white [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <ul
            className="logo-marquee flex w-max"
            style={{ ['--marquee-duration' as string]: `${partners.length * 3.5}s` }}
          >
            {[...partners, ...partners].map((partner, index) => (
              <li key={`${partner.slug}-${index}`} aria-hidden={index >= partners.length} className="shrink-0">
                <Link
                  href={`/chu-dau-tu/${partner.slug}`}
                  title={partner.name}
                  tabIndex={index >= partners.length ? -1 : undefined}
                  className="flex h-28 w-48 items-center justify-center border-r border-gray-100 px-7 transition md:h-36 md:w-64 md:px-10"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    loading="lazy"
                    className="max-h-14 w-auto max-w-full object-contain opacity-80 grayscale-[35%] transition duration-300 hover:scale-105 hover:opacity-100 hover:grayscale-0 md:max-h-16"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 5. CTA (anh nen mo) ───────────────────────────────────── */}
      <section className="site-container pt-14 md:pt-16">
        <div className="relative isolate overflow-hidden rounded-3xl bg-navy-800 px-6 py-12 text-center text-white md:py-14">
          <Image src="/images/projects/the-global-city.jpg" alt="" fill sizes="1280px" className="-z-20 object-cover opacity-35" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-800/95 via-brand-700/80 to-violet-700/85" />
          <h2 className="mx-auto max-w-2xl text-2xl leading-tight font-bold md:text-3xl">{sentenceCase(cta.title)}</h2>
          <p className="mx-auto mt-3 max-w-xl text-theme-sm leading-relaxed text-white/80 md:text-base">{cta.body}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href={cta.primaryCta.href}
              className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-theme-sm font-semibold text-brand-700 transition hover:bg-brand-50"
            >
              Đăng ký ngay
              <FiArrowRight aria-hidden className="transition-transform group-hover:translate-x-1" />
            </Link>
            {cta.secondaryCta && (
              <Link
                href={cta.secondaryCta.href}
                className="inline-flex items-center rounded-full border border-white/40 px-6 py-3 text-theme-sm font-semibold text-white transition hover:bg-white/10"
              >
                {sentenceCase(cta.secondaryCta.label)}
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutPageView;
