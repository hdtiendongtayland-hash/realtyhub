/**
 * Locale-aware wrappers around Next.js navigation APIs.
 *
 * Use these instead of `next/link`, `next/navigation` directly so the
 * current locale is honored automatically. For example, calling
 * `<Link href="/products">` while on `/en` will produce `/en/products`.
 */
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);