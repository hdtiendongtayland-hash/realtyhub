'use client';

import { useCallback, useEffect, useRef } from 'react';
import {
  FiX,
  FiMapPin,
  FiHome,
  FiMaximize,
  FiCompass,
  FiPhone,
  FiMail,
  FiCalendar,
  FiLayers,
  FiDollarSign,
  FiGift,
  FiTrendingUp,
  FiUser,
  FiBriefcase,
} from 'react-icons/fi';
import PlaceholderThumb from '@/common/components/PlaceholderThumb';
import { formatBillion, formatMillionPerSqm, formatNumber } from '@/common/utils/format';
import {
  UNIT_STATUS_LABELS,
  type UnitWithProject,
} from '@/modules/project/models/project-detail.model';

/**
 * Modal chi tiết căn hộ - hiển thị toàn bộ thông tin một căn.
 *
 * Mở từ UnitCard khi người dùng click "Xem chi tiết". Thay vì chuyển
 * hướng sang tab Quỹ căn, modal này cho phép xem nhanh thông tin mà không
 * rời khỏi trang hiện tại.
 *
 * Thiết kế dựa trên ảnh mẫu: ảnh lớn bên trái, thông tin chi tiết bên phải,
 * các nút hành động ở cuối.
 */
type UnitDetailModalProps = {
  open: boolean;
  onClose: () => void;
  unit: UnitWithProject;
};

const UnitDetailModal = ({ open, onClose, unit }: UnitDetailModalProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Phím Escape đóng modal
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    },
    [onClose],
  );

  // Backdrop click đóng modal
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return undefined;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    // Focus vào modal sau 1 frame
    const id = requestAnimationFrame(() => {
      dialogRef.current?.focus();
    });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      cancelAnimationFrame(id);
      previousFocusRef.current?.focus?.();
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const statusColorMap = {
    'con-hang': 'bg-success-500',
    'giu-cho': 'bg-accent-500',
    'da-ban': 'bg-gray-400',
  };

  // Ảnh demo từ Unsplash theo loại hình
  const getImageUrl = () => {
    const baseUrl = 'https://images.unsplash.com/';

    // Dựa vào propertyType hoặc propertyTypeLabel
    if (unit.propertyType === 'biet-thu' || unit.propertyTypeLabel?.includes('Biệt thự')) {
      return `${baseUrl}photo-1600596542815-ffad4c1539a9?w=800&h=1000&fit=crop&auto=format&q=80`; // Villa
    }

    if (unit.propertyType === 'nha-pho' || unit.propertyTypeLabel?.includes('Nhà phố')) {
      return `${baseUrl}photo-1600585154340-be6161a56a0c?w=800&h=1000&fit=crop&auto=format&q=80`; // Townhouse
    }

    if (unit.propertyType === 'can-ho' || unit.propertyTypeLabel?.includes('Căn hộ')) {
      return `${baseUrl}photo-1545324418-cc1a3fa10c00?w=800&h=1000&fit=crop&auto=format&q=80`; // Apartment
    }

    // Default: Modern house
    return `${baseUrl}photo-1600566753190-17f0baa2a6c3?w=800&h=1000&fit=crop&auto=format&q=80`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unit-detail-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity cursor-pointer"
        onClick={handleBackdropClick}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative z-10 w-full max-w-6xl max-h-[90vh] rounded-2xl bg-white shadow-2xl focus:outline-none"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-gray-700 shadow-lg transition hover:bg-white hover:text-gray-900"
        >
          <FiX aria-hidden className="h-5 w-5" />
        </button>

        {/* Layout: ảnh bên trái (fixed) + thông tin bên phải (scroll) */}
        <div className="flex max-h-[90vh] flex-col lg:flex-row">
          {/* Cột trái: Ảnh cố định (sticky) */}
          <div className="relative lg:hidden">
            {/* Mobile: aspect ratio + scrollable info */}
            <div className="relative aspect-video w-full bg-gray-100">
              <PlaceholderThumb
                seed={unit.publicId}
                src={getImageUrl()}
                alt={`Căn ${unit.code} - ${unit.projectName}`}
                label=""
                className="h-full w-full object-cover"
              />

              {/* Nhãn trạng thái */}
              <span
                className={`absolute left-4 top-4 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-lg ${statusColorMap[unit.status]}`}
              >
                {UNIT_STATUS_LABELS[unit.status]}
              </span>

              {/* Nhãn HOT nếu là quỹ độc quyền */}
              {unit.fundType === 'doc-quyen' && (
                <span className="absolute right-4 top-4 rounded-lg bg-error-500 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-lg">
                  HOT
                </span>
              )}
            </div>
          </div>

          {/* Desktop: Ảnh cố định bên trái */}
          <div className="relative hidden lg:block lg:w-[40%] lg:flex-shrink-0">
            <div className="sticky top-0 h-[90vh] bg-gray-100">
              <PlaceholderThumb
                seed={unit.publicId}
                src={getImageUrl()}
                alt={`Căn ${unit.code} - ${unit.projectName}`}
                label=""
                className="h-full w-full object-cover"
              />

              {/* Nhãn trạng thái */}
              <span
                className={`absolute left-4 top-4 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-lg ${statusColorMap[unit.status]}`}
              >
                {UNIT_STATUS_LABELS[unit.status]}
              </span>

              {/* Nhãn HOT nếu là quỹ độc quyền */}
              {unit.fundType === 'doc-quyen' && (
                <span className="absolute right-4 top-4 rounded-lg bg-error-500 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-lg">
                  HOT
                </span>
              )}
            </div>
          </div>

          {/* Cột phải: Thông tin chi tiết (scroll) */}
          <div className="flex flex-col overflow-y-auto p-6 lg:w-[60%] lg:p-8">
            {/* Header */}
            <div className="mb-6 border-b border-gray-200 pb-4">
              <h2
                id="unit-detail-title"
                className="text-2xl font-bold uppercase tracking-wide text-gray-900 lg:text-3xl"
              >
                {unit.code}
              </h2>
              <p className="mt-2 flex items-center gap-2 text-theme-sm text-gray-600">
                <FiMapPin aria-hidden className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium text-brand-600">{unit.projectName}</span>
                <span aria-hidden className="h-3.5 w-px bg-gray-200" />
                <span>{unit.developerName}</span>
              </p>
            </div>

            {/* Bảng giá nổi bật */}
            <div className="mb-6">
              <div className="rounded-xl border-2 border-brand-200 bg-gradient-to-br from-brand-50 to-white p-5 shadow-sm">
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {/* Giá Vay */}
                  <div>
                    <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-500">
                      <FiDollarSign aria-hidden className="h-3.5 w-3.5" />
                      Giá Vay
                    </dt>
                    <dd className="mt-2 text-xl font-bold text-error-600">
                      {formatBillion(unit.listedPrice)}
                    </dd>
                  </div>

                  {/* Giá TTS */}
                  <div className="lg:border-l lg:border-brand-100 lg:pl-4">
                    <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-500">
                      <FiTrendingUp aria-hidden className="h-3.5 w-3.5" />
                      Giá TTS
                    </dt>
                    <dd className="mt-2 text-xl font-bold text-brand-600">
                      {formatBillion(unit.netPrice)}
                    </dd>
                  </div>

                  {/* Giá Full VAT */}
                  <div className="lg:border-l lg:border-brand-100 lg:pl-4">
                    <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-500">
                      <FiDollarSign aria-hidden className="h-3.5 w-3.5" />
                      Giá Full VAT
                    </dt>
                    <dd className="mt-2 text-xl font-bold text-success-600">
                      {unit.fullVatPrice ? formatBillion(unit.fullVatPrice) : '—'}
                    </dd>
                  </div>

                  {/* Giá TTTĐ */}
                  <div className="lg:border-l lg:border-brand-100 lg:pl-4">
                    <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-500">
                      <FiMaximize aria-hidden className="h-3.5 w-3.5" />
                      Giá TTTĐ
                    </dt>
                    <dd className="mt-2 text-xl font-bold text-gray-700">
                      {formatMillionPerSqm(unit.unitPrice)}
                    </dd>
                  </div>
                </div>
              </div>
            </div>

            {/* Thông tin căn hộ - Grid 2 cột */}
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700">
                Thông tin căn hộ
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-25 p-3">
                  <FiHome aria-hidden className="h-5 w-5 flex-shrink-0 text-brand-500" />
                  <div className="min-w-0 flex-1">
                    <dt className="text-xs font-medium text-gray-500">Phân khu</dt>
                    <dd className="mt-0.5 truncate text-sm font-semibold text-gray-900">
                      {unit.phaseName}
                    </dd>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-25 p-3">
                  <FiLayers aria-hidden className="h-5 w-5 flex-shrink-0 text-brand-500" />
                  <div className="min-w-0 flex-1">
                    <dt className="text-xs font-medium text-gray-500">Loại hình</dt>
                    <dd className="mt-0.5 truncate text-sm font-semibold text-gray-900">
                      {unit.propertyTypeLabel}
                    </dd>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-25 p-3">
                  <FiMaximize aria-hidden className="h-5 w-5 flex-shrink-0 text-brand-500" />
                  <div className="min-w-0 flex-1">
                    <dt className="text-xs font-medium text-gray-500">DT Đất</dt>
                    <dd className="mt-0.5 text-sm font-semibold text-gray-900">
                      {formatNumber(unit.landArea)} m²
                    </dd>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-25 p-3">
                  <FiMaximize aria-hidden className="h-5 w-5 flex-shrink-0 text-brand-500" />
                  <div className="min-w-0 flex-1">
                    <dt className="text-xs font-medium text-gray-500">DT Xây dựng</dt>
                    <dd className="mt-0.5 text-sm font-semibold text-gray-900">
                      {formatNumber(unit.buildArea)} m²
                    </dd>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-25 p-3">
                  <FiCompass aria-hidden className="h-5 w-5 flex-shrink-0 text-brand-500" />
                  <div className="min-w-0 flex-1">
                    <dt className="text-xs font-medium text-gray-500">Hướng</dt>
                    <dd className="mt-0.5 text-sm font-semibold text-gray-900">{unit.direction}</dd>
                  </div>
                </div>

                {unit.floor && (
                  <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-25 p-3">
                    <FiLayers aria-hidden className="h-5 w-5 flex-shrink-0 text-brand-500" />
                    <div className="min-w-0 flex-1">
                      <dt className="text-xs font-medium text-gray-500">Tầng</dt>
                      <dd className="mt-0.5 text-sm font-semibold text-gray-900">{unit.floor}</dd>
                    </div>
                  </div>
                )}

                {(unit.bedrooms || unit.toilets) && (
                  <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-25 p-3">
                    <FiHome aria-hidden className="h-5 w-5 flex-shrink-0 text-brand-500" />
                    <div className="min-w-0 flex-1">
                      <dt className="text-xs font-medium text-gray-500">Số phòng</dt>
                      <dd className="mt-0.5 text-sm font-semibold text-gray-900">
                        {unit.bedrooms && `${unit.bedrooms} PN`}
                        {unit.bedrooms && unit.toilets && ' / '}
                        {unit.toilets && `${unit.toilets} WC`}
                      </dd>
                    </div>
                  </div>
                )}

                {unit.floors && (
                  <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-25 p-3">
                    <FiLayers aria-hidden className="h-5 w-5 flex-shrink-0 text-brand-500" />
                    <div className="min-w-0 flex-1">
                      <dt className="text-xs font-medium text-gray-500">Tổng số tầng</dt>
                      <dd className="mt-0.5 text-sm font-semibold text-gray-900">
                        {unit.floors} tầng
                      </dd>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Thông tin vay ngân hàng */}
            {(unit.loanRate || unit.loanTerm) && (
              <div className="mb-6">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-700">
                  <FiTrendingUp aria-hidden className="h-4 w-4 text-brand-500" />
                  Thông tin vay
                </h3>
                <div className="rounded-lg border border-jade-200 bg-jade-25 p-4">
                  <div className="grid grid-cols-2 gap-4">
                    {unit.loanRate && (
                      <div>
                        <dt className="text-xs font-medium text-jade-700">Lãi suất ưu đãi</dt>
                        <dd className="mt-1 text-lg font-bold text-jade-900">{unit.loanRate}</dd>
                      </div>
                    )}
                    {unit.loanTerm && (
                      <div>
                        <dt className="text-xs font-medium text-jade-700">Thời hạn vay</dt>
                        <dd className="mt-1 text-lg font-bold text-jade-900">{unit.loanTerm}</dd>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Chính sách bán hàng */}
            {(unit.discount || unit.gift) && (
              <div className="mb-6">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-700">
                  <FiGift aria-hidden className="h-4 w-4 text-accent-500" />
                  Chính sách bán hàng
                </h3>
                <div className="space-y-2">
                  {unit.discount && (
                    <div className="flex items-start gap-2 rounded-lg border border-accent-200 bg-accent-50 p-3">
                      <FiDollarSign aria-hidden className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-600" />
                      <div>
                        <dt className="text-xs font-medium text-accent-700">Chiết khấu</dt>
                        <dd className="mt-0.5 text-sm font-semibold text-accent-900">
                          {unit.discount}
                        </dd>
                      </div>
                    </div>
                  )}
                  {unit.gift && (
                    <div className="flex items-start gap-2 rounded-lg border border-accent-200 bg-accent-50 p-3">
                      <FiGift aria-hidden className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-600" />
                      <div>
                        <dt className="text-xs font-medium text-accent-700">Quà tặng</dt>
                        <dd className="mt-0.5 text-sm font-semibold text-accent-900">{unit.gift}</dd>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Thông tin bàn giao */}
            {(unit.handoverDate || unit.handoverStatus) && (
              <div className="mb-6">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-700">
                  <FiCalendar aria-hidden className="h-4 w-4 text-gray-500" />
                  Thông tin bàn giao
                </h3>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="space-y-2 text-sm">
                    {unit.handoverDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Dự kiến bàn giao:</span>
                        <span className="font-semibold text-gray-900">{unit.handoverDate}</span>
                      </div>
                    )}
                    {unit.handoverStatus && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Tình trạng:</span>
                        <span className="font-semibold text-gray-900">{unit.handoverStatus}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Lưu ý */}
            <div className="mb-6 rounded-lg border border-brand-100 bg-brand-25 p-4">
              <p className="flex items-start gap-2 text-xs text-brand-800">
                <FiCalendar aria-hidden className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>
                  <strong className="font-semibold">Lưu ý:</strong> Giá trên đã bao gồm VAT. Chính
                  sách ưu đãi áp dụng theo từng thời điểm. Vui lòng liên hệ tư vấn viên để biết
                  thêm chi tiết và cập nhật mới nhất.
                </span>
              </p>
            </div>

            {/* Thông tin tư vấn viên */}
            <div className="mb-6 rounded-lg border-2 border-gold-300 bg-gradient-to-br from-gold-50 to-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gold-200">
                  <FiUser aria-hidden className="h-6 w-6 text-gold-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-gray-900">Tư vấn viên</h4>
                  <p className="mt-0.5 flex items-center gap-2 text-xs text-gray-600">
                    <FiBriefcase aria-hidden className="h-3 w-3" />
                    <span>Chuyên viên tư vấn bất động sản</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="mt-auto grid grid-cols-2 gap-3">
              <a
                href="tel:+84901234567"
                className="flex items-center justify-center gap-2 rounded-lg border-2 border-brand-500 bg-white px-4 py-3 text-theme-sm font-semibold text-brand-600 transition hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                <FiPhone aria-hidden className="h-4 w-4" />
                Gọi ngay
              </a>
              <div
                className="flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-theme-sm font-semibold text-white transition hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                <img src="/images/logo-zalo.webp" alt="Zalo" className="h-6 w-6" />
                Đặt lịch tư vấn
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitDetailModal;
