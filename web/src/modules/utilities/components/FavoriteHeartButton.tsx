'use client';

import { useCallback } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

import type { FavoriteUtilityEntry } from '@/common/hooks/useFavoriteUtilities';
import { useFavoriteUtilities } from '@/common/hooks/useFavoriteUtilities';

type FavoriteHeartButtonProps = {
  /** Entry tien ich (full object) de luu vao localStorage */
  entry: FavoriteUtilityEntry;
  /**
   * Handler khi click vao phan "card" (khi user click ngoai trai tim).
   * Dung de mo modal "Sap ra mat" o trang /tien-ich, hoac dieu huong
   * o trang chu.
   *
   * Khi click VAO trai tim: handler nay KHONG duoc goi (se stopPropagation).
   */
  onActivate?: () => void;
  /** Neu true: khong toggle (chi hien thi trang thai, dung khi read-only) */
  readOnly?: boolean;
  /** Variant style - 'sm' (nho gon) hoac 'md' (mac dinh) */
  size?: 'sm' | 'md';
};

/**
 * Nut trai tim de danh dau "tien ich yeu thich" - luu full entry vao
 * localStorage de sau nay custom cho khach hang.
 *
 * Dung chung giua:
 *   - Trang chu (QuickUtilities): hien thi 7 nut co dinh, click trai tim de
 *     bookmark. Click vao card -> navigate sang trang tuong ung.
 *   - Trang /tien-ich (UtilityButton): click card -> mo modal "Sap ra mat",
 *     click trai tim -> chi bookmark ma KHONG mo modal.
 *
 * Luu y:
 *   - SSR-safe: luc dau hien thi outline heart (khop ca server lan client).
 *     Sau khi hydrate, se re-render thanh filled neu entry da ton tai.
 *   - stopPropagation + preventDefault de click tim KHONG bubble len card
 *     (tranh mo modal "Sap ra mat" hoac navigate khong mong muon).
 *   - aria-pressed de screen reader biet toggle state.
 */
const FavoriteHeartButton = ({
  entry,
  onActivate,
  readOnly = false,
  size = 'md',
}: FavoriteHeartButtonProps) => {
  const { isFavorite, toggle, isHydrated } = useFavoriteUtilities();
  const isActive = isFavorite(entry.publicId);

  const sizeClass = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';
  const iconClass = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      // Quan trong: click trai tim KHONG duoc bubble len card parent
      // (trang /tien-ich se mo modal khi click card, trang chu se navigate).
      event.stopPropagation();
      event.preventDefault();
      if (readOnly) return;

      toggle(entry);
      onActivate?.();
    },
    [entry, toggle, onActivate, readOnly],
  );

  // Trang thai "active" chi hien thi khi da hydrate - tranh mismatch SSR
  const showActive = isHydrated && isActive;
  const labelText = showActive
    ? `Bỏ lưu "${entry.label}" khỏi bộ sưu tập`
    : `Lưu "${entry.label}" vào bộ sưu tập`;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={showActive}
      aria-label={labelText}
      title={labelText}
      className={`inline-flex ${sizeClass} shrink-0 items-center justify-center rounded-full bg-white/95 text-gray-500 shadow-theme-xs ring-1 ring-gray-200 backdrop-blur-sm transition hover:bg-white hover:text-error-500 hover:ring-error-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-error-400 ${
        showActive ? 'text-error-500 ring-error-200' : ''
      }`}
    >
      {showActive ? (
        <FaHeart aria-hidden className={`${iconClass} text-error-500`} />
      ) : (
        <FaRegHeart aria-hidden className={iconClass} />
      )}
    </button>
  );
};

export default FavoriteHeartButton;