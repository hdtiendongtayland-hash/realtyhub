'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiBell,
  FiCheck,
  FiChevronRight,
  FiInbox,
} from 'react-icons/fi';

import {
  CATEGORY_ICONS,
  CATEGORY_TONE,
  MOCK_NOTIFICATIONS,
  PRIORITY_LABELS,
  PRIORITY_TONE,
  type NotificationItem,
} from '@/modules/notifications/mocks/notifications.mock';

/**
 * Popover thong bao tren header.
 *
 * Mo bang ca hover (desktop) lan click (mobile/touch) - giong pattern cua
 * dropdown "Muc Khac" trong SiteHeader de nguoi dung khong phai hoc them
 * cach dung moi. Click se KHOA panel (mouseLeave khong dong) de user co
 * the di chuyen chot xuong doc noi dung ma khong bi mat popup. Click lan
 * nua / click ra ngoai / Esc / chuyen trang se mo khoa.
 *
 * Doc du lieu qua `useNotifications()` (hook useSyncExternalStore, giong
 * `useFavorites`). Service la "kho dung chung" nen khi co backend that,
 * chi can doi file nay - component khong biet du lieu den tu dau.
 *
 * SSR-safe: server va client render CUNG so badge (0) o lan dau -> hydration
 * khop. Sau khi mount moi load MOCK_NOTIFICATIONS va cap nhat badge that.
 */

type Variant = 'solid' | 'transparent';

type NotificationsPopoverProps = {
  /** 'solid' (nen trang) hoac 'transparent' (header trong suot o trang chu). */
  variant: Variant;
  /** Class cho icon bell - truyen tu SiteHeader de giong cac icon khac. */
  iconClass: string;
};

/** Kho luu trữ chung, giong pattern cua `useFavorites`. Khi co backend that
 *  chi can doi ham doc/ghi o day, component va hook deu khong doi. */
const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedValue: NotificationItem[] = MOCK_NOTIFICATIONS;

const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onChange);
  }
  return () => {
    listeners.delete(onChange);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onChange);
    }
  };
};

const readSnapshot = (): NotificationItem[] => {
  // Hien tai khong luu localStorage (trang /thong-bao chua co) - luon tra ve
  // snapshot cung tham chieu de React khong render lai vo han. Khi noi backend,
  // doi thanh read tu localStorage / API va notify listeners o day.
  if (cachedRaw === null) {
    cachedRaw = 'mock';
    cachedValue = MOCK_NOTIFICATIONS;
  }
  return cachedValue;
};

/** Server khong co localStorage - tra cung 1 mock de SSR/CSR khop nhau o lan dau. */
const getServerSnapshot = (): NotificationItem[] => MOCK_NOTIFICATIONS;

/** Hook doc danh sach thong bao + danh dau da doc (local-only cho mock). */
export const useNotifications = () => {
  const items = useSyncExternalStore(subscribe, readSnapshot, getServerSnapshot);
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  const itemsWithRead = useMemo(
    () => items.map((item) => (overrides[item.publicId] === undefined ? item : { ...item, isRead: overrides[item.publicId] })),
    [items, overrides],
  );

  const unreadCount = useMemo(
    () => itemsWithRead.filter((item) => !item.isRead).length,
    [itemsWithRead],
  );

  const markAsRead = useCallback((id: string) => {
    setOverrides((prev) => ({ ...prev, [id]: true }));
  }, []);

  const markAllAsRead = useCallback(() => {
    setOverrides((prev) => {
      const next = { ...prev };
      items.forEach((item) => {
        if (!item.isRead) next[item.publicId] = true;
      });
      return next;
    });
  }, [items]);

  return { items: itemsWithRead, unreadCount, markAsRead, markAllAsRead };
};

/** Popover noi dung - dung chung cho ca hover-locked va hover-only. */
const PopoverPanel = ({
  items,
  unreadCount,
  transparent,
  close,
  onMarkAllAsRead,
}: {
  items: NotificationItem[];
  unreadCount: number;
  transparent: boolean;
  close: () => void;
  onMarkAllAsRead: () => void;
}) => {
  // Chi lay 5 muc gan nhat de vua popup (380px chieu cao toi da). Nguon du
  // lieu day du o trang /thong-bao (link "Xem tat ca" ben duoi).
  const preview = useMemo(() => items.slice(0, 5), [items]);

  const panelClass = transparent
    ? 'border border-white/20 bg-black/85 backdrop-blur-md text-white'
    : 'border border-gray-200 bg-white shadow-theme-lg';
  const itemClass = transparent
    ? 'border-white/10 hover:bg-white/10'
    : 'border-gray-100 hover:bg-gray-50';
  const mutedClass = transparent ? 'text-white/70' : 'text-gray-500';
  const titleClass = transparent ? 'text-white' : 'text-gray-900';
  const subtleClass = transparent ? 'text-white/65' : 'text-gray-600';
  const footerClass = transparent
    ? 'border-white/15 text-white/80 hover:bg-white/10 hover:text-white'
    : 'border-gray-100 text-gray-600 hover:bg-brand-50 hover:text-brand-700';

  return (
    <div
      role="dialog"
      aria-label="Thông báo"
      className={`absolute right-0 top-full z-50 mt-3 w-[380px] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl ${panelClass}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <div className={`text-theme-sm font-bold ${titleClass}`}>Thông báo</div>
          <div className={`mt-0.5 text-theme-xs ${mutedClass}`}>
            {unreadCount > 0
              ? `${unreadCount} mục chưa đọc`
              : 'Bạn đã đọc hết thông báo'}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMarkAllAsRead}
            disabled={unreadCount === 0}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-theme-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
              transparent
                ? 'text-white/85 hover:bg-white/15 hover:text-white'
                : 'text-gray-600 hover:bg-brand-50 hover:text-brand-700'
            }`}
            aria-label="Đánh dấu tất cả đã đọc"
          >
            <FiCheck aria-hidden className="h-3.5 w-3.5" />
            Đọc tất cả
          </button>
        </div>
      </div>

      {/* List */}
      {preview.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-10 text-center">
          <span
            className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${
              transparent ? 'bg-white/10 text-white/70' : 'bg-gray-100 text-gray-400'
            }`}
          >
            <FiInbox aria-hidden className="h-6 w-6" />
          </span>
          <div className={`mt-3 text-theme-sm font-semibold ${titleClass}`}>
            Chưa có thông báo
          </div>
          <div className={`mt-1 text-theme-xs ${mutedClass}`}>
            Mọi cập nhật sẽ xuất hiện ở đây.
          </div>
        </div>
      ) : (
        <ul className="max-h-[60vh] divide-y divide-white/10 overflow-y-auto">
          {preview.map((item) => (
            <NotificationRow
              key={item.publicId}
              item={item}
              transparent={transparent}
              itemClass={itemClass}
              titleClass={titleClass}
              subtleClass={subtleClass}
              mutedClass={mutedClass}
              onActivate={() => close()}
            />
          ))}
        </ul>
      )}

      {/* Footer */}
      <Link
        href="#"
        onClick={close}
        className={`flex items-center justify-between border-t px-4 py-3 text-theme-xs font-semibold transition ${footerClass}`}
      >
        <span>Xem tất cả thông báo</span>
        <FiChevronRight aria-hidden className="h-4 w-4" />
      </Link>
    </div>
  );
};

/** Mot dong thong bao trong popup. Click vao se mo link dich va dong popup. */
const NotificationRow = ({
  item,
  transparent,
  itemClass,
  titleClass,
  subtleClass,
  mutedClass,
  onActivate,
}: {
  item: NotificationItem;
  transparent: boolean;
  itemClass: string;
  titleClass: string;
  subtleClass: string;
  mutedClass: string;
  onActivate: () => void;
}) => {
  const toneClass = transparent
    ? 'bg-white/15 text-white'
    : CATEGORY_TONE[item.category];
  const priorityClass = transparent
    ? 'bg-white/15 text-white'
    : PRIORITY_TONE[item.priority];

  return (
    <li>
      <Link
        href={item.href}
        onClick={onActivate}
        className={`group flex items-start gap-3 border-l-2 px-4 py-3 transition ${
          item.isRead ? 'border-transparent' : 'border-brand-500'
        } ${itemClass}`}
      >
        {/* Icon theo category */}
        <span
          aria-hidden
          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base ${toneClass}`}
        >
          {item.icon || CATEGORY_ICONS[item.category]}
        </span>

        {/* Noi dung */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide">
            <span className={mutedClass}>{item.source}</span>
            {item.priority !== 'normal' && (
              <span
                className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wider ${priorityClass}`}
              >
                {PRIORITY_LABELS[item.priority]}
              </span>
            )}
          </div>

          <div
            className={`mt-0.5 line-clamp-1 text-theme-sm font-semibold transition group-hover:underline ${
              item.isRead ? subtleClass : titleClass
            }`}
          >
            {item.title}
          </div>
          <p className={`mt-0.5 line-clamp-2 text-theme-xs leading-relaxed ${mutedClass}`}>
            {item.excerpt}
          </p>
        </div>

        {/* Chevron nho o ben phai */}
        <FiChevronRight
          aria-hidden
          className={`mt-2 h-4 w-4 shrink-0 self-start transition ${
            transparent ? 'text-white/50 group-hover:text-white' : 'text-gray-300 group-hover:text-brand-500'
          }`}
        />
      </Link>
    </li>
  );
};

const NotificationsPopover = ({ variant, iconClass }: NotificationsPopoverProps) => {
  const pathname = usePathname();
  const { items, unreadCount, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const isClickLocked = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // Timer de mo/dong co delay - tranh popup nhap nhay khi user chi luot
  // chuot ngang icon, va cho user kip di chuyen tu icon xuong panel qua
  // khoang gap giua button va dropdown.
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transparent = variant === 'transparent';

  const cancelTimers = useCallback(() => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const close = useCallback(() => {
    cancelTimers();
    setIsOpen(false);
    isClickLocked.current = false;
  }, [cancelTimers]);

  // Hover: sau 100ms moi mo - dam bao user that su muon xem, khong phai
  // luot chuot ngang. Neu user bo di truoc khi timer chay thi huy.
  const onMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (!isOpen && !openTimerRef.current) {
      openTimerRef.current = setTimeout(() => {
        openTimerRef.current = null;
        setIsOpen(true);
      }, 100);
    }
  };
  // Mouse leave: sau 200ms moi dong - du thoi gian di chuyen chuot tu icon
  // xuong panel (qua khoang gap `mt-3` giua button va dropdown). Khi da
  // khoa (user da click) thi dong ngay, khong can doi.
  const onMouseLeave = () => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (isClickLocked.current) {
      setIsOpen(false);
      isClickLocked.current = false;
      return;
    }
    if (isOpen && !closeTimerRef.current) {
      closeTimerRef.current = setTimeout(() => {
        closeTimerRef.current = null;
        setIsOpen(false);
      }, 200);
    }
  };

  // Click vao nut chuong de mo/khoa. Click khi dang mo -> mo khoa + dong.
  const onToggleClick = () => {
    cancelTimers();
    setIsOpen((open) => {
      isClickLocked.current = !open;
      return !open;
    });
  };

  // Dong popup khi click ra ngoai, nhan Esc hoac chuyen trang (pathname).
  useEffect(() => {
    if (!isOpen) return undefined;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, close]);

  // Dong popup + reset lock khi user chuyen trang (pathname thay doi). Set
  // state trong effect la can thiet cho UX "popup dong theo route" - pattern
  // nay cung xuat hien o userStore.ts (line 85) va FavoriteList.tsx trong
  // cung codebase.
  useEffect(() => {
    isClickLocked.current = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false);
  }, [pathname]);

  // Cleanup timers khi unmount de tranh setState tren component da bi thao.
  useEffect(() => cancelTimers, [cancelTimers]);

  // Badge "99+" neu qua nhieu. An badge khi chua co unread de giu gon icon.
  const badgeText = unreadCount > 99 ? '99+' : String(unreadCount);
  const showBadge = unreadCount > 0;

  return (
    <div
      ref={containerRef}
      className="relative hidden items-center lg:flex"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <button
        type="button"
        onClick={onToggleClick}
        aria-label={
          showBadge ? `Thông báo - ${unreadCount} mục chưa đọc` : 'Thông báo'
        }
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={`relative flex h-9 w-9 items-center justify-center rounded-full transition ${iconClass}`}
      >
        <FiBell aria-hidden className="text-xl" />
        {showBadge && (
          <span
            aria-hidden
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white"
          >
            {badgeText}
          </span>
        )}
      </button>

      {isOpen && (
        <PopoverPanel
          items={items}
          unreadCount={unreadCount}
          transparent={transparent}
          close={close}
          onMarkAllAsRead={markAllAsRead}
        />
      )}
    </div>
  );
};

export default NotificationsPopover;