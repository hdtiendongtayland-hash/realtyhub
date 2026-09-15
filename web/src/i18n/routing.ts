/**
 * Routing config cho next-intl.
 *
 * Tương thích với next-intl 4.x và Next.js 16 App Router. Dùng bởi:
 *  - `createNavigation()` trong `./navigation.ts`
 *  - `proxy.ts` (Next 16 thay thế `middleware.ts`)
 *  - File `request.ts` để load messages
 *
 * Doc chính thức:
 *  https://next-intl.dev/docs/routing
 */
import { defineRouting } from 'next-intl/routing';
import { defaultLocale, locales, localePrefix } from './config';

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale,
  localePrefix,
  localeDetection: true,
});
