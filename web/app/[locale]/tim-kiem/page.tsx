import { Suspense } from 'react';
import type { Metadata } from 'next';
import SiteSearchPage from '@/modules/search/SiteSearchPage';

export const metadata: Metadata = {
  title: 'Tìm kiếm',
  description: 'Tìm dự án, quỹ căn, chủ đầu tư, sự kiện, tin tức và khóa đào tạo trên RealtyHub.',
};

export default function TimKiemRoutePage() {
  // SiteSearchPage doc ?q=&tab= qua useSearchParams nen phai boc Suspense
  return (
    <Suspense fallback={<div className="site-container h-96 animate-pulse py-10" />}>
      <SiteSearchPage />
    </Suspense>
  );
}
