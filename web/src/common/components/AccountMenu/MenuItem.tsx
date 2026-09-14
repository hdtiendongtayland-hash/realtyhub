'use client';

import Link from 'next/link';

import type { IconType } from 'react-icons';

export type MenuItemProps = {
  href?: string;
  onClick?: () => void;
  icon: IconType;
  children: React.ReactNode;
  badge?: string;
  danger?: boolean;
};

const MenuItem = ({
  href,
  onClick,
  icon: Icon,
  children,
  badge,
  danger,
}: MenuItemProps) => {
  const className = `flex w-full items-center gap-3 px-4 py-2.5 text-theme-sm transition ${
    danger
      ? 'text-error-600 hover:bg-error-50'
      : 'text-gray-700 hover:bg-brand-50 hover:text-brand-700'
  }`;

  const inner = (
    <>
      <Icon aria-hidden className="h-4 w-4 shrink-0" />
      <span className="flex-1 text-left font-medium">{children}</span>
      {badge && (
        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-700">
          {badge}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={className} role="menuitem">
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className} role="menuitem">
      {inner}
    </button>
  );
};

export default MenuItem;