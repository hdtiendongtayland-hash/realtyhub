/**
 * Type-safe translation declaration cho next-intl 4.x.
 *
 * next-intl đọc messages được load trong `request.ts` (`src/i18n/request.ts`)
 * và suy ra type tự động từ file JSON. Khai báo shape này ở đây cho phép
 * `useTranslations('namespace')` và `getTranslations('namespace')` có
 * autocomplete + check lỗi typo key.
 *
 * Doc: https://next-intl.dev/docs/usage/typescript
 *
 * Chỉ khai báo những namespace THỰC SỰ load trong `request.ts`. Thêm
 * namespace mới -> thêm key vào đây (typescript sẽ complain để quên).
 */
import type vi from './messages/vi/common.json';
import type viNav from './messages/vi/navigation.json';
import type viMeta from './messages/vi/metadata.json';
import type viHome from './messages/vi/home.json';
import type viAbout from './messages/vi/about.json';
import type viProjects from './messages/vi/projects.json';

type Messages = {
  common: typeof vi;
  navigation: typeof viNav;
  metadata: typeof viMeta;
  home: typeof viHome;
  about: typeof viAbout;
  projects: typeof viProjects;
};

declare module 'next-intl' {
  interface AppConfig {
    Messages: Messages;
  }
}

export {};
