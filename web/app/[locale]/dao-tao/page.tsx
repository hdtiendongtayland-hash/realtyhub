import { Suspense } from 'react';

import type { Metadata } from 'next';

import TrainingVideoLibrary from '@/modules/training/components/TrainingVideoLibrary';

/**
 * Trang /dao-tao - RealtyHub Academy.
 *
 * Bo cuc:
 *   01 Thu vien video bai giang (component rieng co 3 tab + loc + tim kiem)
 *
 * Component TrainingVideoLibrary da co san 3 tab:
 *   - Video bai giang: 12 video, co chip loc chu de + o tim kiem
 *   - Danh sach phat: 4 playlist
 *   - Dang hoc: cac video dang xem duoc
 */

export const metadata: Metadata = {
  title: 'Đào tạo môi giới',
  description:
    'Khóa học thực chiến cho môi giới bất động sản — từ nền tảng đến quản lý team.',
};

const DaoTaoPage = () => (
  <main className="bg-white">
    {/* ============ 01 THƯ VIỆN VIDEO BÀI GIẢNG ============ */}
    <Suspense
      fallback={
        <div className="site-container py-16 text-center text-gray-500">
          Đang tải thư viện video…
        </div>
      }
    >
      <TrainingVideoLibrary />
    </Suspense>
  </main>
);

export default DaoTaoPage;