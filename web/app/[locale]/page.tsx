import HomePage from '@/modules/home/components/HomePage';
import { HomeService } from '@/modules/home/services/home.service';
import { setRequestLocale } from 'next-intl/server';

/**
 * Route trang chu - server component.
 *
 * Doc noi dung tu server mot lan roi truyen xuong client (initialContent) de
 * HTML tra ve da co hero + du an noi bat, khong phai doi client goi lai.
 * Client hook chi refresh khi can (staleTime 5 phut).
 *
 * Sau migration: `setRequestLocale(locale)` cho phép các Server Component
 * con dùng `getTranslations` đồng bộ với locale của request.
 */
export default async function HomeRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const content = await HomeService.content();
  return <HomePage initialContent={content} />;
}
