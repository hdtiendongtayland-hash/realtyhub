'use client';

import Link from 'next/link';
import { FaHeart } from 'react-icons/fa';

import { useFavorites } from '@/common/hooks/useFavorites';

type FavoriteButtonProps = {
  /** Color classes cho icon khi header o trang thai transparent / solid. */
  iconClass: string;
  /**
   * Extra classes cho wrapper <Link>. Dung de cac layout khac (Header,
   * Drawer) co the an nut trong Clean Mode ma khong phai sua component.
   */
  wrapperClassName?: string;
};

const FavoriteButton = ({ iconClass, wrapperClassName }: FavoriteButtonProps) => {
  const { favorites, isHydrated } = useFavorites();
  const count = favorites.length;

  const showBadge = isHydrated && count > 0;
  const badgeText = count > 99 ? '99+' : String(count);

  return (
    <Link
      href="/yeu-thich"
      aria-label={
        showBadge
          ? `Yêu thích - ${count} dự án đã lưu`
          : 'Yêu thích'
      }
      data-clean-hide="utility-link"
      className={`relative flex h-9 w-9 items-center justify-center rounded-full transition ${iconClass} ${wrapperClassName ?? ''}`.trim()}
    >
      <FaHeart aria-hidden className="h-[18px] w-[18px]" />
      {showBadge && (
        <span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white"
        >
          {badgeText}
        </span>
      )}
    </Link>
  );
};

export default FavoriteButton;