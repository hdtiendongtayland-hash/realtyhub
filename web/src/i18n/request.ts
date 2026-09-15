/**
 * Server-side translation loader.
 *
 * Được gọi trong `app/[locale]/layout.tsx` thông qua `setRequestLocale`,
 * trả về messages tương ứng với locale của request.
 *
 * next-intl 4.x cung cấp `getRequestConfig` để load messages động theo
 * `requestLocale` (Next 16 thay `locale` cũ bằng `getLocale` / `requestLocale`).
 *
 * Doc: https://next-intl.dev/docs/usage/localization
 */
import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

import viCommon from '../../messages/vi/common.json';
import viNavigation from '../../messages/vi/navigation.json';
import viMetadata from '../../messages/vi/metadata.json';
import viHome from '../../messages/vi/home.json';
import viAbout from '../../messages/vi/about.json';
import viProjects from '../../messages/vi/projects.json';

import enCommon from '../../messages/en/common.json';
import enNavigation from '../../messages/en/navigation.json';
import enMetadata from '../../messages/en/metadata.json';
import enHome from '../../messages/en/home.json';
import enAbout from '../../messages/en/about.json';
import enProjects from '../../messages/en/projects.json';

/**
 * Bảng messages theo locale. Thêm namespace mới -> thêm entry ở cả 2 locale
 * và đăng ký key vào `Messages` interface trong `global.d.ts`.
 */
const MESSAGES = {
  vi: {
    common: viCommon,
    navigation: viNavigation,
    metadata: viMetadata,
    home: viHome,
    about: viAbout,
    projects: viProjects,
  },
  en: {
    common: enCommon,
    navigation: enNavigation,
    metadata: enMetadata,
    home: enHome,
    about: enAbout,
    projects: enProjects,
  },
} as const;

export default getRequestConfig(async ({ requestLocale }) => {
  // Next 16 + next-intl 4: `requestLocale` là Promise<string | undefined>.
  // Phải await và fallback về default locale nếu không hợp lệ.
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: MESSAGES[locale],
  };
});
