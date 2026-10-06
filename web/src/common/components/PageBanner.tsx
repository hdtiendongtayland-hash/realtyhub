import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronRight, FiHome } from 'react-icons/fi';

type PageBannerProps = {
  /** Ten trang tren duong dan */
  crumb: string;
  /** Nhan nho tren tieu de */
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  imageUrl: string;
  /** Nut / o tim kiem ben duoi mo ta */
  children?: ReactNode;
  /** Hang the noi de len mep duoi banner (thong tin nhanh) */
  overlap?: ReactNode;
};

/**
 * Dau trang dung chung cho Gioi thieu / Lien he / Huong dan: banner anh bo
 * tron NAM TRONG khung trang (khong tran het man hinh), lop phu xanh thuong
 * hieu, chu trang ben trai. `overlap` la hang the noi len mep duoi banner.
 */
const PageBanner = ({ crumb, eyebrow, title, description, imageUrl, children, overlap }: PageBannerProps) => (
  <section className="site-container pt-5 md:pt-6">
    <nav aria-label="Breadcrumb" className="mb-3">
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
        <li className="font-medium text-gray-700" aria-current="page">
          {crumb}
        </li>
      </ol>
    </nav>

    <div className="relative isolate overflow-hidden rounded-3xl bg-navy-800 text-white shadow-theme-lg">
      <Image src={imageUrl} alt="" fill priority sizes="(max-width: 1280px) 100vw, 1280px" className="-z-20 object-cover" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-800/95 via-navy-800/80 to-brand-600/40" />

      <div className={`px-6 pt-8 md:px-12 md:pt-12 ${overlap ? 'pb-20 md:pb-24' : 'pb-8 md:pb-12'}`}>
        <div className="max-w-2xl">
          {eyebrow && (
            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-theme-xs font-semibold tracking-wide backdrop-blur-sm">
              {eyebrow}
            </span>
          )}
          <h1 className="mt-3 text-3xl leading-tight font-bold md:text-[40px]">{title}</h1>
          {description && <p className="mt-3 text-base leading-relaxed text-white/80">{description}</p>}
          {children && <div className="mt-6">{children}</div>}
        </div>
      </div>
    </div>

    {overlap && <div className="relative z-10 -mt-12 px-3 md:-mt-14 md:px-8">{overlap}</div>}
  </section>
);

export default PageBanner;
