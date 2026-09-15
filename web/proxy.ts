/**
 * Next.js 16 Proxy (thay thế `middleware.ts`).
 *
 * Chạy proxy trước khi request vào App Router. Vai trò:
 *  1. Detect locale từ header `Accept-Language`, segment URL, hoặc cookie.
 *  2. Rewrite/redirect URL để luôn có locale segment (với non-default locale)
 *     và KHÔNG có `/vi` prefix (vì `vi` là default locale).
 *  3. Set header `x-locale` để Server Component đọc được.
 *
 * next-intl 4.x cung cấp `createMiddleware` wrapper, dùng nó để khỏi tự
 * viết logic phát hiện locale. `localePrefix: 'as-needed'` đã cấu hình
 * trong `routing.ts` nên default locale sẽ không có prefix.
 *
 * Doc:
 *  - https://next-intl.dev/docs/routing/middleware
 *  - https://nextjs.org/docs/app/api-reference/file-conventions/proxy
 */
import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

export default createMiddleware(routing);

export const config = {
  /*
   * Match tất cả request trừ:
   *  - api routes
   *  - _next (build output, static, image optimizer)
   *  - file tĩnh có extension (png|jpg|...)
   *  - favicon
   *
   * Giữ pattern ngắn để proxy không tốn chi phí check từng asset.
   */
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
