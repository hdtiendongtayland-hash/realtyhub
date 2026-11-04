import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { FiChevronRight, FiHome } from "react-icons/fi";

/**
 * Dau trang kieu trang /gioi-thieu: the trang bo tron lon, anh ben phai mo dan
 * sang trai, song xanh trang tri, chu viet tay goc phai. Dung cho cac trang
 * thong tin (lien he, gop y, huong dan...).
 *
 * `id` phai khac nhau giua cac trang (dung lam id gradient cua SVG song).
 */
type SoftPageHeroProps = {
  id: string;
  crumb: string;
  eyebrow: { icon: IconType; label: string };
  title: ReactNode;
  lead: ReactNode;
  image: { src: string; width: number; height: number; position?: string };
  /** Chu viet tay goc phai (man lon) */
  script?: { main: string; sub?: string };
  /** Noi dung duoi doan dan: nut, so lieu, o tim kiem... */
  children?: ReactNode;
};

const SoftPageHero = ({
  id,
  crumb,
  eyebrow: { icon: EyebrowIcon, label },
  title,
  lead,
  image,
  script,
  children,
}: SoftPageHeroProps) => (
  <section className="site-container pt-6">
    <div className="relative isolate overflow-hidden rounded-3xl border border-white bg-white shadow-[0_24px_60px_-30px_rgba(30,64,175,0.45)]">
      {/* Anh ben phai, mo dan sang trai */}
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 -z-20 w-full bg-gradient-to-b from-[#a9d3f5] via-[#c8e2f6] to-[#dbe8f2] [mask-image:linear-gradient(to_left,black_0%,black_40%,rgba(0,0,0,0.55)_68%,transparent_100%)] max-md:opacity-30 md:w-[64%]"
      >
        <div
          className="absolute inset-x-0 bottom-0 min-h-full [mask-image:linear-gradient(to_bottom,transparent_0%,black_30%)]"
          style={{ aspectRatio: `${image.width} / ${image.height}` }}
        >
          <Image
            src={image.src}
            alt=""
            fill
            priority
            sizes="64vw"
            className="object-cover brightness-105 saturate-125"
            style={{ objectPosition: image.position ?? "70% bottom" }}
          />
        </div>
        <span className="absolute inset-0 bg-gradient-to-b from-sky-400/20 via-transparent to-sky-200/20" />
      </div>

      {/* Song xanh trang tri goc tren va day */}
      <svg
        aria-hidden
        viewBox="0 0 1440 600"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
      >
        <defs>
          <linearGradient id={`${id}-wave-top`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#bfe0ff" stopOpacity="0.9" />
            <stop offset="1" stopColor="#8b7cf6" stopOpacity="0.45" />
          </linearGradient>
          <linearGradient id={`${id}-wave-bottom`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#9ccdff" stopOpacity="0.85" />
            <stop offset="0.6" stopColor="#dbeeff" stopOpacity="0.9" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="1" />
          </linearGradient>
        </defs>
        <path
          d="M620 0 C 700 110, 820 140, 960 110 L 1040 0 Z"
          fill={`url(#${id}-wave-top)`}
        />
        <path
          d="M0 480 C 280 560, 540 515, 780 540 C 1020 565, 1250 520, 1440 555 L 1440 600 L 0 600 Z"
          fill={`url(#${id}-wave-bottom)`}
        />
      </svg>

      {script && (
        <div
          aria-hidden
          className="absolute top-10 right-10 hidden text-right text-white drop-shadow-[0_2px_8px_rgba(15,23,42,0.35)] lg:block"
        >
          <p className="font-[family-name:var(--font-handwriting)] text-4xl font-semibold">
            {script.main}
          </p>
          {script.sub && (
            <p className="mt-1 text-theme-sm font-medium">{script.sub}</p>
          )}
        </div>
      )}

      <div className="relative px-6 pt-10 pb-12 md:px-12 md:pt-14 md:pb-16">
        <nav
          aria-label="Breadcrumb"
          className="mb-5 flex items-center gap-1.5 text-theme-xs text-gray-500"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-1 transition hover:text-brand-600"
          >
            <FiHome aria-hidden className="h-3.5 w-3.5" />
            Trang chủ
          </Link>
          <FiChevronRight aria-hidden className="h-3.5 w-3.5 text-gray-300" />
          <span className="font-semibold text-gray-800">{crumb}</span>
        </nav>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3.5 py-1.5 text-theme-xs font-bold tracking-[0.12em] text-brand-700 uppercase">
          <EyebrowIcon aria-hidden className="h-3.5 w-3.5" />
          {label}
        </span>
        <h1 className="mt-4 max-w-3xl text-3xl leading-tight font-bold text-navy-800 md:text-5xl">
          {title}
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-gray-600 md:text-lg">
          {lead}
        </p>

        {children}
      </div>
    </div>
  </section>
);

/** Nhan tieu de giua muc: chu cach rong, vach mo hai ben */
export const SectionEyebrow = ({ children }: { children: string }) => (
  <div className="flex items-center justify-center gap-4">
    <span aria-hidden className="h-px w-16 bg-sky-300" />
    <span className="text-theme-xs font-bold tracking-[0.35em] text-brand-600 uppercase">
      {children}
    </span>
    <span aria-hidden className="h-px w-16 bg-sky-300" />
  </div>
);

/** Chu nhan manh mau xanh trong tieu de */
export const Highlight = ({ children }: { children: ReactNode }) => (
  <span className="text-[#3b9bf5]">{children}</span>
);

export default SoftPageHero;
