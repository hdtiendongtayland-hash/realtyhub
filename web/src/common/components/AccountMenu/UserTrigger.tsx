'use client';

import Link from 'next/link';

import { FiChevronDown } from 'react-icons/fi';

import type { CurrentUser } from '@/common/auth/userStore';
import UserAvatar from '../UserAvatar';

export type UserTriggerProps = {
  user: CurrentUser;
  isOpen: boolean;
  onToggle: () => void;
};

const UserTrigger = ({ user, isOpen, onToggle }: UserTriggerProps) => (
  <>
    <Link
      href="/tai-khoan"
      aria-label="Mở trang tài khoản"
      className="rounded-full p-0.5 transition hover:bg-brand-50"
    >
      <UserAvatar name={user.name} src={user.avatar} size={40} />
    </Link>
    <button
      type="button"
      onClick={onToggle}
      aria-haspopup="menu"
      aria-expanded={isOpen}
      aria-label="Mở menu tài khoản"
      className="flex h-9 w-7 items-center justify-center rounded-full text-gray-500 transition hover:bg-brand-50 hover:text-brand-700"
    >
      <FiChevronDown
        aria-hidden
        className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
      />
    </button>
  </>
);

export default UserTrigger;