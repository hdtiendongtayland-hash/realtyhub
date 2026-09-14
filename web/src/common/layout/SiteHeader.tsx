'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FiBell, FiChevronDown, FiMenu, FiMessageSquare, FiX } from 'react-icons/fi';
import { FaRegHeart } from 'react-icons/fa';
import AccountMenu from '@/common/components/AccountMenu';
import FavoriteButton from '@/common/layout/FavoriteButton';
import NotificationsPopover from '@/common/layout/NotificationsPopover';

const DU_AN_HREF = '/gio-hang';

const NAV_ITEMS = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Chủ đầu tư', href: '/chu-dau-tu' },
  { label: 'Dự án', href: DU_AN_HREF, aliases: ['/du-an'] },
  { label: 'Quỹ căn', href: '/quy-can' },
  { label: 'Sự kiện', href: '/su-kien' },
];

const MORE_MENU = {
  label: 'Mục Khác',
  children: [
    { label: 'Tin tức', href: '/tin-tuc' },
    { label: 'Tiện ích', href: '/tien-ich' },
    { label: 'Đào tạo', href: '/dao-tao' },
    { label: 'Giới thiệu', href: '/gioi-thieu' },
    { label: 'Liên hệ chúng tôi', href: '/lien-he-chung-toi' },
    { label: 'Góp ý & phản hồi', href: '/gop-y-va-phan-hoi' },
    { label: 'Hướng dẫn sử dụng', href: '/huong-dan' },
  ],
};

const BrandMark = () => (
  <Link href={"/"} className="flex items-center" aria-label="Dự án">
    <Image
      src="/images/home/logo-realtyhub.svg"
      alt="RealtyHub"
      priority
      width={140}
      height={40}
      className="h-8 w-auto"
    />
  </Link>
);

/**
 * Mot quick action trong ngan keo mobile (Tin nhan / Yeu thich / Thong bao).
 *
 * Layout: icon + label ngan phia duoi - phu hop voi chieu rong ngan keo
 * (khoang 360px max-w-sm). Icon co badge neu co. Bam se auto-close drawer
 * de nguoi dung thay ngay trang dich dang load.
 */
const DrawerActionItem = ({
  href,
  icon,
  label,
  badge,
  onClose,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  onClose: () => void;
}) => (
  <li className="flex-1">
    <Link
      href={href}
      onClick={onClose}
      className="group relative flex flex-col items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-theme-xs font-semibold text-gray-700 transition hover:bg-brand-50 hover:text-brand-700"
    >
      <span className="relative flex h-9 w-9 items-center justify-center text-lg">
        {icon}
        {badge && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error-500 px-1 text-[10px] font-bold leading-none text-white">
            {badge}
          </span>
        )}
      </span>
      <span className="leading-none">{label}</span>
    </Link>
  </li>
);

const SiteHeader = () => {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const moreRef = useRef<HTMLLIElement>(null);
  // Track xem dropdown "Khac" duoc mo bang click (khoa) hay chi bang
  // hover (khong khoa). Khi khoa = true, mouseleave se KHONG dong panel -
  // chi click tiep theo / click ra ngoai / Esc / chuyen trang moi mo khoa.
  // Ref thay vi state vi chi can ghi nho flag, khong can re-render.
  const isMoreClickLocked = useRef(false);
  // Timer delay mo/dong dropdown "Khac" - tranh popup nhap nhay khi chi
  // luot chuot ngang, va cho user kip di chuyen tu button xuong panel qua
  // khoang gap `mt-3`. Cung pattern voi NotificationsPopover.
  const moreOpenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moreCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelMoreTimers = useCallback(() => {
    if (moreOpenTimerRef.current) {
      clearTimeout(moreOpenTimerRef.current);
      moreOpenTimerRef.current = null;
    }
    if (moreCloseTimerRef.current) {
      clearTimeout(moreCloseTimerRef.current);
      moreCloseTimerRef.current = null;
    }
  }, []);

  const closeMore = useCallback(() => {
    cancelMoreTimers();
    setIsMoreOpen(false);
    isMoreClickLocked.current = false;
  }, [cancelMoreTimers]);

  const isActive = (href: string) => {
    // Route goc ("/") phai so sanh chinh xac - moi path deu bat dau bang "/"
    // nen neu dung startsWith mac dinh se active o moi trang.
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };
  // Nav item co the co nhieu alias (vd "/gio-hang" va "/du-an" cung tro ve
  // cung trang "Danh sach du an") - active neu bat ky alias nao match.
  const isNavItemActive = (item: { href: string; aliases?: string[] }) => {
    if (isActive(item.href)) return true;
    return item.aliases?.some((alias) => isActive(alias)) ?? false;
  };
  const isMoreActive = MORE_MENU.children.some((c) => isActive(c.href));

  // Trang chu: header trong suot de banner noi bat; cuon xuong thi chuyen
  // sang solid (trang + border) de noi dung ben duoi doc duoc. Cac trang
  // khac luon solid, khong lang nghe scroll.
  useEffect(() => {
    if (pathname !== '/') return undefined;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 24);
        frame = 0;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  const onMoreToggleClick = () => {
    cancelMoreTimers();
    setIsMoreOpen((open) => {
      // Lan click tiep theo se mo khoa / khoa lai tuy trang thai hien tai.
      isMoreClickLocked.current = !open;
      return !open;
    });
  };
  const onMoreMouseEnter = () => {
    if (moreCloseTimerRef.current) {
      clearTimeout(moreCloseTimerRef.current);
      moreCloseTimerRef.current = null;
    }
    if (!isMoreOpen && !moreOpenTimerRef.current) {
      moreOpenTimerRef.current = setTimeout(() => {
        moreOpenTimerRef.current = null;
        setIsMoreOpen(true);
      }, 100);
    }
  };
  const onMoreMouseLeave = () => {

    if (moreOpenTimerRef.current) {
      clearTimeout(moreOpenTimerRef.current);
      moreOpenTimerRef.current = null;
    }

    if (isMoreClickLocked.current) {
      setIsMoreOpen(false);
      isMoreClickLocked.current = false;
      return;
    }

    if (isMoreOpen && !moreCloseTimerRef.current) {
      moreCloseTimerRef.current = setTimeout(() => {
        moreCloseTimerRef.current = null;
        setIsMoreOpen(false);
      }, 200);
    }
  };

  useEffect(() => {
    if (!isMoreOpen) return undefined;
    const onClick = (e: MouseEvent) => {
      if (!moreRef.current?.contains(e.target as Node)) closeMore();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMore();
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [isMoreOpen, closeMore]);

  // Khi pathname thay doi -> dong dropdown va reset khoa (click item con
  // cung da setIsMoreOpen(false) nhung can dam bao ref cung duoc reset).
  useEffect(() => {
    isMoreClickLocked.current = false;
    cancelMoreTimers();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMoreOpen(false);
  }, [pathname, cancelMoreTimers]);

  // Cleanup timers khi unmount de tranh setState tren component da bi thao.
  useEffect(() => cancelMoreTimers, [cancelMoreTimers]);

  // Ngan keo phu kin man hinh: khoa cuon nen va cho Escape dong lai
  useEffect(() => {
    if (!isMobileOpen) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isMobileOpen]);

  const variant: 'solid' | 'transparent' =
    pathname === '/' && !isScrolled ? 'transparent' : 'solid';
  const isTransparent = variant === 'transparent';
  const headerColor = isTransparent
    ? 'bg-transparent border-transparent'
    : 'bg-white border-gray-200';
  const navColor = isTransparent
    ? {
        active: 'text-white underline decoration-white decoration-2 underline-offset-8',
        idle: 'text-white/85 hover:text-white',
      }
    : {
        active: 'text-navy-700 underline decoration-brand-500 decoration-2 underline-offset-8',
        idle: 'text-gray-600 hover:text-brand-600',
      };
  const iconColor = isTransparent
    ? 'text-white/90 hover:bg-white/15 hover:text-white'
    : 'text-gray-500 hover:bg-gray-100 hover:text-brand-600';
  // Mau dropdown "Khac" - mo phong theo tone header (trang / den).
  const moreBtnActive = isMoreActive
    ? navColor.active
    : navColor.idle;
  const dropdownPanelClass = isTransparent
    ? 'border border-white/20 bg-black/80 backdrop-blur-md'
    : 'border border-gray-200 bg-white shadow-theme-lg';
  const dropdownItemClass = isTransparent
    ? 'text-white/85 hover:bg-white/10 hover:text-white'
    : 'text-gray-700 hover:bg-brand-50 hover:text-brand-600';
  const dropdownItemActiveClass = isTransparent
    ? 'bg-white/10 text-white'
    : 'bg-brand-50 text-brand-600';

  return (
    <header className={`sticky top-0 z-40 border-b transition-colors ${headerColor}`}>
      <div className="site-container flex h-16 items-center justify-between gap-4">
        {/* Nut menu mobile dat o goc trai, truoc BrandMark. Tren desktop
            nut nay an di boi xl:hidden (desktop co nav inline). */}
        <button
          type="button"
          onClick={() => setIsMobileOpen((open) => !open)}
          aria-label={isMobileOpen ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={isMobileOpen}
          className={`order-first flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition xl:hidden ${iconColor}`}
        >
          {isMobileOpen ? <FiX aria-hidden /> : <FiMenu aria-hidden />}
        </button>

        <BrandMark />

        <nav aria-label="Điều hướng chính" className="hidden xl:block">
          <ul className="flex items-center gap-5">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isNavItemActive(item) ? 'page' : undefined}
                  className={`whitespace-nowrap text-theme-sm font-semibold uppercase tracking-wide transition ${
                    isNavItemActive(item) ? navColor.active : navColor.idle
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}

            <li
              className="relative"
              ref={moreRef}
              onMouseEnter={onMoreMouseEnter}
              onMouseLeave={onMoreMouseLeave}
            >
              <button
                type="button"
                onClick={onMoreToggleClick}
                aria-haspopup="menu"
                aria-expanded={isMoreOpen}
                aria-current={isMoreActive ? 'page' : undefined}
                className={`inline-flex items-center gap-1 whitespace-nowrap text-theme-sm font-semibold uppercase tracking-wide transition ${moreBtnActive}`}
              >
                {MORE_MENU.label}
                <FiChevronDown
                  aria-hidden
                  className={`h-4 w-4 transition-transform ${isMoreOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isMoreOpen && (
                <div
                  role="menu"
                  aria-label={MORE_MENU.label}
                  className={`absolute right-0 top-full z-50 mt-3 min-w-56 overflow-hidden rounded-xl py-2 ${dropdownPanelClass}`}
                >
                  {MORE_MENU.children.map((child) => {
                    const active = isActive(child.href);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        role="menuitem"
                        aria-current={active ? 'page' : undefined}
                        onClick={() => setIsMoreOpen(false)}
                        className={`block px-4 py-2.5 text-theme-sm font-medium transition ${
                          active ? dropdownItemActiveClass : dropdownItemClass
                        }`}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            href="/tin-nhan"
            aria-label="Tin nhắn"
            className={`hidden xl:flex h-9 w-9 items-center justify-center rounded-full transition ${iconColor}`}
          >
            <FiMessageSquare aria-hidden />
          </Link>

          <FavoriteButton iconClass={`hidden xl:flex ${iconColor}`} />

          <NotificationsPopover variant={variant} iconClass={iconColor} />

          <AccountMenu />
        </div>
      </div>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <div
            aria-hidden
            onClick={() => setIsMobileOpen(false)}
            className="absolute inset-0 bg-gray-900/50"
          />

          <nav
            aria-label="Điều hướng di động"
            className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-white shadow-panel"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3">
              <span onClick={() => setIsMobileOpen(false)}>
                <BrandMark />
              </span>
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                aria-label="Đóng menu"
                className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100"
              >
                <FiX aria-hidden className="text-xl" />
              </button>
            </div>

            {/* Khu vuc quick actions tren mobile: 3 icon Tin nhan / Yeu
                thich / Thong bao. Dat len dau ngan keo de user mo menu
                la thay ngay, khong phai cuon xuong moi tim. */}
            <ul
              aria-label="Truy cập nhanh"
              className="flex shrink-0 items-stretch border-b border-gray-200 px-2 py-2"
            >
              <DrawerActionItem
                href="/tin-nhan"
                icon={<FiMessageSquare aria-hidden />}
                label="Tin nhắn"
                onClose={() => setIsMobileOpen(false)}
              />
              <DrawerActionItem
                href="/yeu-thich"
                icon={<FaRegHeart aria-hidden />}
                label="Yêu thích"
                onClose={() => setIsMobileOpen(false)}
              />
              <DrawerActionItem
                href="/thong-bao"
                icon={<FiBell aria-hidden />}
                label="Thông báo"
                badge="3"
                onClose={() => setIsMobileOpen(false)}
              />
            </ul>

            <ul className="flex-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => (
                <li key={item.href} className="border-b border-gray-100">
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    aria-current={isNavItemActive(item) ? 'page' : undefined}
                    className={`block px-5 py-4 text-base font-medium capitalize transition hover:bg-gray-50 ${
                      isNavItemActive(item) ? 'text-brand-600' : 'text-gray-800'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}

              {/* Nhom "Khac" - dung <details> de khong phai them state rieng.
                  Mac dinh mo neu co muc con dang active. */}
              <li className="border-b border-gray-100">
                <details open={isMoreActive} className="group">
                  <summary
                    className={`flex cursor-pointer list-none items-center justify-between px-5 py-4 text-base font-medium capitalize transition hover:bg-gray-50 ${
                      isMoreActive ? 'text-brand-600' : 'text-gray-800'
                    }`}
                  >
                    {MORE_MENU.label}
                    <FiChevronDown
                      aria-hidden
                      className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <ul className="bg-gray-50 pb-1">
                    {MORE_MENU.children.map((child) => {
                      const active = isActive(child.href);
                      return (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={() => setIsMobileOpen(false)}
                            aria-current={active ? 'page' : undefined}
                            className={`block py-3 pl-9 pr-5 text-theme-sm transition hover:text-brand-600 ${
                              active ? 'font-semibold text-brand-600' : 'text-gray-600'
                            }`}
                          >
                            {child.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </details>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default SiteHeader;