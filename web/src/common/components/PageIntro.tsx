import type { ReactNode } from 'react';
import Link from 'next/link';
import { FiChevronRight, FiHome } from 'react-icons/fi';

type PageIntroProps = {
  /** Ten trang - hien o duong dan va lam tieu de */
  title: string;
  description?: string;
  /** Cot phai: nut / thong tin nhanh (VD hotline) */
  actions?: ReactNode;
  /** Hang duoi tieu de: o tim kiem, bo loc... */
  children?: ReactNode;
};

/**
 * Dau trang gon cho cac trang thong tin (Gioi thieu, Lien he, Gop y, Huong
 * dan): duong dan + tieu de + mo ta tren nen sang, thay cho khoi anh nen toi
 * cao gan nua man hinh truoc day.
 */
const PageIntro = ({ title, description, actions, children }: PageIntroProps) => (
  <header className="border-b border-gray-100 bg-gradient-to-b from-brand-25 to-white">
    <div className="site-container py-6 md:py-8">
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
            {title}
          </li>
        </ol>
      </nav>

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold text-navy-800 md:text-3xl">{title}</h1>
          {description && <p className="mt-1.5 text-theme-sm leading-relaxed text-gray-600 md:text-base">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>

      {children && <div className="mt-5">{children}</div>}
    </div>
  </header>
);

export default PageIntro;
