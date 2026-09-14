'use client';

import Link from 'next/link';

import { FiUser } from 'react-icons/fi';

const LoginButton = () => (
  <Link
    href="/login"
    aria-label="Đăng nhập"
    className="flex h-9 items-center gap-1.5 rounded-full bg-brand-500 px-3 text-theme-sm font-semibold text-white transition hover:bg-brand-600"
  >
    <FiUser aria-hidden />
    <span className="hidden sm:inline">Đăng nhập</span>
  </Link>
);

export default LoginButton;