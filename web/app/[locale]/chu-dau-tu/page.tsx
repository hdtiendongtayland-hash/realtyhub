import { Suspense } from 'react';
import type { Metadata } from 'next';
import InvestorListPage from '@/modules/developer/components/DeveloperListPage';
import { DEFAULT_INVESTOR_QUERY } from '@/modules/developer/models/investor.model';
import { InvestorService } from '@/modules/developer/services/investor.service';

export const metadata: Metadata = {
  title: 'Chủ đầu tư',
  description:
    'Danh sách các chủ đầu tư đang có dự án trên RealtyHub. Mỗi chủ đầu tư hiển thị số dự án, số căn còn hàng và liên kết tới chi tiết.',
};

/**
 * Trang chu dau tu - server component doc 25 Investor (dong bo voi section
 * "CAC CHU DAU TU" tren trang chu) roi truyen xuong client de HTML SSR co
 * noi dung ngay.
 *
 * Source data: InvestorService (single source of truth).
 */
export default async function ChuDauTuRoutePage() {
  const data = await InvestorService.list(DEFAULT_INVESTOR_QUERY);
  return (
    <Suspense
      fallback={
        <div className="site-container py-8">
          <div className="mx-auto mb-6 h-8 w-64 animate-pulse rounded bg-gray-200" />
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-11 animate-pulse rounded-md bg-gray-100" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-72 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        </div>
      }
    >
      <InvestorListPage initialInvestors={data.investors} />
    </Suspense>
  );
}
