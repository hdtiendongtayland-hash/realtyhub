'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

export type UserRole = 'USER' | 'STAFF' | 'ADMIN' | 'SUPER_ADMIN';

export type CurrentUser = {
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
};

const STORAGE_KEY = 'user';

/** Doc user tu localStorage. Tra ve null neu chua dang nhap hoac JSON loi. */
export const readUser = (): CurrentUser | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CurrentUser>;
    if (!parsed?.name || !parsed?.email || !parsed?.role) return null;
    return parsed as CurrentUser;
  } catch {
    return null;
  }
};

/** Xoa user (logout). An toan goi nhieu lan. */
export const clearUser = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
};

export const useCurrentUser = (): CurrentUser | null => {

  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    setUser(readUser());

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setUser(readUser());
    };
    const onLocal = () => setUser(readUser());
    window.addEventListener('storage', onStorage);
    window.addEventListener('user:change', onLocal);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('user:change', onLocal);
    };
  }, []);

  return user;
};

/** Hook logout tien ich: clear user + cookie token + redirect ve trang chu. */
export const useLogout = () => {
  const router = useRouter();
  return () => {
    clearUser();
    document.cookie = 'token=; Path=/; Max-Age=0; SameSite=Lax';
    window.dispatchEvent(new Event('user:change'));
    router.push('/');
    router.refresh();
  };
};

/** Mot so role co quyen truy cap admin panel. */
export const hasAdminAccess = (role: UserRole | undefined): boolean =>
  role === 'ADMIN' || role === 'SUPER_ADMIN';