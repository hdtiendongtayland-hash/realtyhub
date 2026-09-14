'use client';

import type { CurrentUser, UserRole } from '@/common/auth/userStore';
import { hasAdminAccess } from '@/common/auth/userStore';
import UserAvatar from '../UserAvatar';

export type MenuHeaderProps = {
  user: CurrentUser;
};

const MenuHeader = ({ user }: MenuHeaderProps) => {
  const canAdmin = hasAdminAccess(user.role as UserRole);

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <UserAvatar name={user.name} src={user.avatar} size={40} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-theme-sm font-semibold text-gray-900">{user.name}</div>
        <div className="truncate text-theme-xs text-gray-500">{user.email}</div>
        <div className="mt-1">
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              canAdmin
                ? 'bg-brand-100 text-brand-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {user.role}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MenuHeader;