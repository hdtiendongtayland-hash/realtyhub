/**
 * Central locale config.
 *
 * Single source of truth for supported locales + default locale.
 * Imported by `routing.ts`, `proxy.ts`, language switcher và mọi nơi cần
 * biết danh sách locale. Không hard-code `['vi', 'en']` ở nhiều chỗ.
 */
export const locales = ['vi', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'vi';

/**
 * localePrefix 'as-needed':
 *   /          -> vi (prefix bị ẩn)
 *   /products  -> vi (prefix bị ẩn)
 *   /en        -> en (prefix xuất hiện)
 *   /en/products -> en (prefix xuất hiện)
 *
 * Không bao giờ generate `/vi/...` cho default locale.
 */
export const localePrefix = 'as-needed' as const;

/**
 * Locale-specific formatting hints. next-intl không ép locale vào
 * number/date format, ta để component tự resolve.
 */
export const localeLabels: Record<Locale, string> = {
  vi: 'Tiếng Việt',
  en: 'English',
};
