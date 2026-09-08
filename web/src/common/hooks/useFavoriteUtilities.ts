'use client';

import { useCallback, useSyncExternalStore } from 'react';
import type { ComponentType } from 'react';

import type { UtilityAction, UtilityTone } from '@/modules/utilities/models/utility.model';

/**
 * Hook luu tru "tien ich yeu thich" cua moi gioi / khach hang vao localStorage.
 *
 * Muc dich: user click vao icon trai tim tren moi nut tien ich (trang chu
 * + trang /tien-ich) de danh dau nhung cong cu ho muon "pin" hoac "chia se
 * voi khach hang" sau nay. Sau khi co tinh nang custom, danh sach nay se
 * duoc dung de hien thi o trang chu / trang ca nhan / chia se Zalo.
 *
 * Phan biet voi useFavorites (danh cho du an):
 *   - useFavorites: luu project publicId, hien thi badge o header.
 *   - useFavoriteUtilities: luu FULL object tien ich (label, href, section,
 *     tone, icon, description) de khong can lookup lai tu mock.
 *   - Storage key khac ('realtyhub:favorite-utilities') de tranh lan nhau.
 *
 * SSR-safe giong useFavorites: server snapshot = EMPTY, client re-render
 * sau khi mount. Component tieu thu dung isHydrated de phan biet.
 */

const STORAGE_KEY = 'realtyhub:favorite-utilities';

/**
 * Mot entry luu FULL thong tin cua tien ich yeu thich (de khi render o
 * trang khac - trang ca nhan, trang chia se, v.v. - khong can lookup lai
 * tu mocks/utilities.mock.ts).
 *
 * Icon duoc luu thanh ten component string (vi React component khong the
 * serialize qua JSON). Khi render, tien ich icon registry se anh xa lai.
 */
export type FavoriteUtilityEntry = {
  publicId: string;
  label: string;
  description: string;
  /** Section ma tien ich thuoc (vi du: "consulting", "feng-shui") */
  sectionPublicId: string;
  /** Ten section (vi du: "Tu van & Giao dich") */
  sectionTitle: string;
  /** Tone section (de render dung mau khi khong can lookup) */
  sectionTone: UtilityTone;
  /** href tien ich (vi du: "/so-sanh-san-pham") */
  href: string;
  /** Icon key - ten component trong registry, dung de anh xa ra Icon */
  iconKey: string;
  /** Keywords (de search filter khi can) */
  keywords?: string[];
  /** Unix ms khi user bookmark */
  savedAt: number;
};

const EMPTY: FavoriteUtilityEntry[] = [];

/**
 * Kho dung chung cho MOI noi goi useFavoriteUtilities.
 *
 * Cung pattern voi useFavorites: dung useSyncExternalStore + listeners +
 * 'storage' event de dong bo giua cac tab. Doc them tai useFavorites.ts.
 */
const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cachedValue: FavoriteUtilityEntry[] = EMPTY;

const readFromStorage = (): FavoriteUtilityEntry[] => {
  if (typeof window === 'undefined') return EMPTY;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedValue;

  cachedRaw = raw;
  if (!raw) {
    cachedValue = EMPTY;
    return cachedValue;
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      cachedValue = EMPTY;
      return cachedValue;
    }
    const cleaned: FavoriteUtilityEntry[] = [];
    for (const item of parsed) {
      if (item && typeof item === 'object' && typeof (item as FavoriteUtilityEntry).publicId === 'string') {
        cleaned.push(item as FavoriteUtilityEntry);
      }
    }
    cachedValue = cleaned;
    return cachedValue;
  } catch {
    cachedValue = EMPTY;
    return cachedValue;
  }
};

const getServerSnapshot = () => EMPTY;

const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  window.addEventListener('storage', onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener('storage', onChange);
  };
};

const writeToStorage = (next: FavoriteUtilityEntry[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  cachedRaw = JSON.stringify(next);
  cachedValue = next;
  listeners.forEach((listener) => listener());
};

/**
 * Chuyen UtilityAction + thong tin section thanh FavoriteUtilityEntry de luu.
 * Icon component duoc chuyen thanh string (ten) vi khong the serialize.
 */
export const buildFavoriteEntry = (
  action: UtilityAction,
  section: { publicId: string; title: string; tone: UtilityTone },
  iconKey: string,
): FavoriteUtilityEntry => ({
  publicId: action.publicId,
  label: action.label,
  description: action.description,
  sectionPublicId: section.publicId,
  sectionTitle: section.title,
  sectionTone: section.tone,
  href: resolveUtilityHref(action),
  iconKey,
  keywords: action.keywords,
  savedAt: Date.now(),
});

/**
 * Map tu publicId cua action sang href URL. Trang /tien-ich chi hien thi
 * cac nut (chua co route that cho tung nut) nen mac dinh tra ve /tien-ich
 * de user co the mo trang tong hop. Sau khi co backend, ham nay se duoc
 * thay bang lookup tu backend.
 */
const resolveUtilityHref = (action: UtilityAction): string => {
  // Mot vai nut pho bien tren trang chu (QuickUtilities) da co URL that:
  // cac publicId nay giong voi QuickUtilities labels nen tao URL giong.
  const knownHrefs: Record<string, string> = {
    'consult-loan': '/tinh-lai-vay',
    'consult-compare': '/so-sanh-san-pham',
    'feng-direction': '/la-ban',
    'misc-qr': '/tien-ich',
    'mgmt-crm': '/crm',
  };
  return knownHrefs[action.publicId] ?? '/tien-ich';
};

export const useFavoriteUtilities = () => {
  const favorites = useSyncExternalStore(subscribe, readFromStorage, getServerSnapshot);
  const isHydrated = useSyncExternalStore(subscribe, () => true, () => false);

  const toggle = useCallback((entry: FavoriteUtilityEntry) => {
    const latest = readFromStorage();
    const exists = latest.some((e) => e.publicId === entry.publicId);
    writeToStorage(
      exists
        ? latest.filter((e) => e.publicId !== entry.publicId)
        : [...latest, entry],
    );
  }, []);

  const isFavorite = useCallback(
    (publicId: string) => favorites.some((e) => e.publicId === publicId),
    [favorites],
  );

  const remove = useCallback((publicId: string) => {
    const latest = readFromStorage();
    writeToStorage(latest.filter((e) => e.publicId !== publicId));
  }, []);

  const clearAll = useCallback(() => writeToStorage([]), []);

  return { favorites, isFavorite, toggle, remove, clearAll, isHydrated };
};

/**
 * Registry anh xa iconKey (ten component string) -> Icon Component.
 * Dung de render FavoriteUtilityEntry o trang khac ma khong can import
 * toan bo icon tu react-icons (vi khi serialize, chi con ten string).
 *
 * Key cua registry giong voi ten export cua react-icons (vi du
 * HiOutlineBanknotes -> 'HiOutlineBanknotes').
 */
export type FavoriteUtilityIcon = ComponentType<{ 'aria-hidden'?: boolean; className?: string }>;

/**
 * Lay icon Component tu ten (string). Neu khong tim thay -> tra ve
 * icon fallback (Sparkles). Caller nen truyen mot registry mapping
 * day du neu muon hien thi icon that.
 */
export const renderFavoriteIcon = (
  iconKey: string,
  registry: Record<string, FavoriteUtilityIcon>,
): FavoriteUtilityIcon => registry[iconKey] ?? registry['HiOutlineSparkles'];