import type { ReactNode } from 'react';
import Link from 'next/link';
import { FiChevronRight, FiHome } from 'react-icons/fi';

type ListingHeaderProps = {
  /** Ten trang tren duong dan */
  crumb: string;
  title: string;
  /** Dong mo ta ngan / so luong ket qua */
  subtitle?: ReactNode;
  /** Nut phu goc phai (VD: Quet QR, che do xem) */
  actions?: ReactNode;
  /** Thanh cong cu (tim kiem + loc) - nam trong the trang trai het be ngang */
  toolbar?: ReactNode;
  className?: string;
};

/**
 * Dau trang dung chung cho cac trang danh sach (Du an, Quy can, Chu dau tu,
 * Su kien, Tin tuc, Dao tao): duong dan + tieu de can trai + so luong, nut phu
 * ben phai, ben duoi la the cong cu trai het be ngang. Thay cho kieu cu
 * "tieu de in hoa o giua + o tim kiem ngan lech trai" bi trong ca khoang giua
 * khi trang mo rong tren man hinh lon.
 */
const ListingHeader = ({ crumb, title, subtitle, actions, toolbar, className = '' }: ListingHeaderProps) => (
  <div className={`mb-6 ${className}`}>
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

    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-navy-800 md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-theme-sm text-gray-500 md:text-base">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>

    {toolbar && (
      <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs md:p-5">{toolbar}</div>
    )}
  </div>
);

export default ListingHeader;
