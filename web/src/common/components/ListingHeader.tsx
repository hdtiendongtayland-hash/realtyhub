import type { ReactNode } from 'react';

type ListingHeaderProps = {
  /** Giu lai cho tuong thich - khong con hien duong dan */
  crumb?: string;
  title: string;
  /** Dong so luong ket qua, hien duoi thanh cong cu (VD "Co 45 du an") */
  subtitle?: ReactNode;
  /** Thanh cong cu (tim kiem + loc) */
  toolbar?: ReactNode;
  className?: string;
};

/**
 * Dau trang dung chung cho cac trang danh sach Du an / Quy can / Chu dau tu,
 * cung kieu ban goc: tieu de in hoa can giua, thanh cong cu ben duoi (khong
 * boc the), dong so luong ket qua o duoi cung.
 */
const ListingHeader = ({ title, subtitle, toolbar, className = '' }: ListingHeaderProps) => (
  <div className={`mb-4 ${className}`}>
    <h1 className="mb-6 text-center text-3xl font-bold tracking-wide text-gray-900 uppercase">{title}</h1>
    {toolbar}
    {subtitle && <p className="mt-4 flex min-h-5 items-center text-theme-sm text-gray-500">{subtitle}</p>}
  </div>
);

export default ListingHeader;
