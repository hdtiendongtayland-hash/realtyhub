'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiTool } from 'react-icons/fi';
import { HiOutlineBuildingOffice2, HiOutlineHomeModern } from 'react-icons/hi2';

const TABS = [
  { label: 'Trang chủ', href: '/', icon: FiHome, exact: true },
  { label: 'Dự án', href: '/du-an', icon: HiOutlineBuildingOffice2, exact: false },
  { label: 'Quỹ căn', href: '/quy-can', icon: HiOutlineHomeModern, exact: false },
  { label: 'Tiện ích', href: '/tien-ich', icon: FiTool, exact: false },
] as const;

const MobileBottomTabs = () => {
  const pathname = usePathname();

  // An thanh tabs o 1 so trang dac biet de giao dien khong bi chen:
  //   - Trang login (form can dung het chieu cao khong bi tat ben duoi)
  //   - Trang chat widget (full-screen modal)
  if (pathname === '/login') return null;

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    // Bottom nav: fixed bottom, z-30 (thap hon drawer menu z-50 de drawer
    // phu len khi mo) + env(safe-area-inset-bottom) cho iPhone co "vu khuyet".
    //
    // Chan tren 20px: tren iPhone inset la 34px (vung thanh Home) nen chua
    // 20px la du thoang; nhung mot so trinh duyet nhung trong ung dung
    // (Zalo, Facebook tren Android) bao inset lon hon han va khong dung voi
    // thuc te -> de nguyen thi day thanh tab len, ho ra mot dai trang o day
    // man hinh. Lay so nho hon giua hai gia tri la an toan cho ca hai phia.
    <nav
      aria-label="Điều hướng nhanh"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.06)] lg:hidden"
      style={{ paddingBottom: 'min(env(safe-area-inset-bottom, 0px), 20px)' }}
    >
      <ul className="flex items-stretch justify-around">
        {TABS.map(({ label, href, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                aria-label={label}
                className={`group flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] font-semibold uppercase tracking-wide transition ${
                  active
                    ? 'text-brand-600'
                    : 'text-gray-500 active:bg-gray-100'
                }`}
              >
                <span className="relative flex h-6 w-6 items-center justify-center">
                  <Icon
                    aria-hidden
                    className={`h-[22px] w-[22px] transition-transform ${
                      active ? 'scale-110' : 'group-hover:scale-105'
                    }`}
                  />
                </span>
                <span className="leading-none">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MobileBottomTabs;
