import { Metadata } from 'next';
import UnitCard from '@/modules/project/components/UnitCard';
import type { UnitWithProject } from '@/modules/project/models/project-detail.model';

export const metadata: Metadata = {
  title: 'Demo Popup Chi Tiết Căn Hộ | RealtyHub',
  description: 'Trang demo popup chi tiết căn hộ',
};

/**
 * Trang demo popup chi tiết căn hộ
 *
 * Truy cập: http://localhost:3000/demo-popup
 *
 * Hiển thị một card mẫu với đầy đủ thông tin để test popup
 */
export default function DemoPopupPage() {
  // Dữ liệu mẫu để test popup - với ảnh thật từ placeholder service
  const sampleUnit: UnitWithProject = {
    publicId: 'unit-demo-001',
    code: 'BT-A-01',
    fundType: 'doc-quyen',
    listedPrice: 12_500_000_000,
    netPrice: 11_800_000_000,
    fullVatPrice: 13_500_000_000,
    unitPrice: 125_000_000,
    propertyTypeLabel: 'Biệt thự',
    direction: 'Đông Nam',
    landArea: 120,
    buildArea: 250,
    phaseName: 'Phân khu The Phoenix',
    status: 'con-hang',
    projectSlug: 'vinhomes-ocean-park-gia-lam',
    projectName: 'Vinhomes Ocean Park Gia Lâm',
    developerName: 'Vingroup',
    segment: 'thap-tang',
    propertyType: 'biet-thu',
    projectIsHot: true,
    // Thông tin bổ sung
    floor: 'Trệt + 2 lầu',
    bedrooms: 4,
    toilets: 5,
    floors: 3,
    loanRate: '0% năm đầu',
    loanTerm: 'Lên đến 25 năm',
    discount: 'Chiết khấu 3% khi thanh toán sớm 95%',
    gift: 'Tặng gói nội thất cao cấp trị giá 500 triệu',
    handoverDate: 'Q4/2025',
    handoverStatus: 'Hoàn thiện nội thất cao cấp',
  };

  const sampleUnit2: UnitWithProject = {
    publicId: 'unit-demo-002',
    code: 'LK-B-15',
    fundType: 'an-cheo',
    listedPrice: 8_200_000_000,
    netPrice: 7_900_000_000,
    fullVatPrice: 8_856_000_000,
    unitPrice: 98_500_000,
    propertyTypeLabel: 'Liền kề',
    direction: 'Tây Nam',
    landArea: 90,
    buildArea: 180,
    phaseName: 'Phân khu The Dragon',
    status: 'giu-cho',
    projectSlug: 'starlake-tay-ho-tay',
    projectName: 'Starlake - Tây Hồ Tây',
    developerName: 'Daewoo E&C',
    segment: 'thap-tang',
    propertyType: 'nha-pho',
    projectIsHot: false,
    // Thông tin bổ sung
    floor: 'Trệt + 3 lầu',
    bedrooms: 5,
    toilets: 6,
    floors: 4,
    loanRate: 'Ưu đãi 0% lãi suất 2 năm đầu',
    loanTerm: 'Lên đến 20 năm',
    discount: 'Chiết khấu 5% thanh toán nhanh trong 30 ngày',
    gift: 'Tặng 2 năm phí quản lý',
    handoverDate: 'Q2/2026',
    handoverStatus: 'Bàn giao thô',
  };

  const sampleUnit3: UnitWithProject = {
    publicId: 'unit-demo-003',
    code: 'CH-C-305',
    fundType: 'thuong',
    listedPrice: 4_500_000_000,
    netPrice: 4_300_000_000,
    fullVatPrice: 4_860_000_000,
    unitPrice: 52_000_000,
    propertyTypeLabel: 'Căn hộ',
    direction: 'Nam',
    landArea: 85,
    buildArea: 85,
    phaseName: 'Tòa S3',
    status: 'con-hang',
    projectSlug: 'the-manor-central-park',
    projectName: 'The Manor Central Park',
    developerName: 'Bitexco Group',
    segment: 'cao-tang',
    propertyType: 'can-ho',
    projectIsHot: true,
    // Thông tin bổ sung
    floor: '15',
    bedrooms: 2,
    toilets: 2,
    loanRate: 'Lãi suất ưu đãi 6.9%/năm',
    loanTerm: '15 năm',
    discount: 'Chiết khấu 2% cho khách hàng đặt cọc sớm',
    handoverDate: 'Q1/2025',
    handoverStatus: 'Hoàn thiện cơ bản',
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="site-container">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Demo Popup Chi Tiết Căn Hộ
          </h1>
          <p className="mt-2 text-theme-sm text-gray-600">
            Click vào nút &ldquo;Xem chi tiết&rdquo; trên mỗi card để mở popup
          </p>
        </div>

        {/* Grid cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <UnitCard unit={sampleUnit} />
          <UnitCard unit={sampleUnit2} />
          <UnitCard unit={sampleUnit3} />
        </div>

        {/* Hướng dẫn */}
        <div className="mt-12 rounded-xl border border-brand-200 bg-brand-25 p-6">
          <h2 className="mb-4 text-xl font-bold text-brand-900">
            📋 Hướng dẫn sử dụng
          </h2>
          <ul className="space-y-2 text-theme-sm text-brand-800">
            <li className="flex items-start gap-2">
              <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                1
              </span>
              <span>
                <strong>Click &ldquo;Xem chi tiết&rdquo;</strong> trên card để mở popup chi tiết căn hộ
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                2
              </span>
              <span>
                <strong>Popup hiển thị đầy đủ thông tin:</strong> ảnh căn hộ, mã căn, phân khu, loại hình,
                diện tích đất/xây dựng, hướng, tầng, số phòng, bảng giá chi tiết (NY/TTS/Đơn giá),
                thông tin vay ngân hàng, chính sách bán hàng (chiết khấu, quà tặng), thông tin bàn giao,
                và thông tin tư vấn viên
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                3
              </span>
              <span>
                <strong>Đóng popup:</strong> Click nút X góc trên bên phải, nhấn phím ESC, hoặc click
                vùng tối bên ngoài popup
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                4
              </span>
              <span>
                <strong>Các nút hành động:</strong> &ldquo;Gọi ngay&rdquo; và &ldquo;Đặt lịch tư vấn&rdquo; ở cuối popup
              </span>
            </li>
          </ul>
        </div>

        {/* Thông tin kỹ thuật */}
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            🔧 Thông tin kỹ thuật
          </h2>
          <div className="space-y-3 text-theme-sm text-gray-700">
            <div>
              <strong className="font-semibold text-gray-900">Component Modal:</strong>{' '}
              <code className="rounded bg-gray-100 px-2 py-1 font-mono text-xs">
                src/modules/project/components/UnitDetailModal.tsx
              </code>
            </div>
            <div>
              <strong className="font-semibold text-gray-900">Component Card:</strong>{' '}
              <code className="rounded bg-gray-100 px-2 py-1 font-mono text-xs">
                src/modules/project/components/UnitCard.tsx
              </code>
            </div>
            <div>
              <strong className="font-semibold text-gray-900">Props:</strong>{' '}
              <code className="rounded bg-gray-100 px-2 py-1 font-mono text-xs">
                {'{ open: boolean, onClose: () => void, unit: UnitWithProject }'}
              </code>
            </div>
            <div>
              <strong className="font-semibold text-gray-900">Features:</strong>
              <ul className="mt-1 ml-6 list-disc space-y-1">
                <li>Responsive design (mobile-first)</li>
                <li>Keyboard navigation (ESC để đóng)</li>
                <li>Focus trap khi modal mở</li>
                <li>Backdrop blur effect</li>
                <li>Scroll lock khi modal mở</li>
                <li>Hiển thị đầy đủ: thông tin căn, giá, vay, CSBH, bàn giao</li>
                <li>Layout 2 cột (ảnh 40%, thông tin 60%)</li>
                <li>Các trường thông tin optional (chỉ hiện khi có data)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
