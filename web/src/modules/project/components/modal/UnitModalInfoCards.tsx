import {
  FiDollarSign,
  FiMaximize2,
  FiGift,
  FiFileText,
  FiShield,
  FiPercent,
  FiGrid,
} from "react-icons/fi";

/**
 * Nam the thong tin cua popup chi tiet can, moi the mot component.
 *
 * Tach rieng vi hai bo cuc xep chung o hai cho khac nhau: dien thoai/iPad xep
 * doc trong UnitModalInfo, con may tinh (UnitModalDetailDesktop) rai chung ra
 * luoi va dai duoi. Neu de chung trong mot file thi moi lan doi cho mot the o
 * may tinh lai phai nhan doi markup.
 *
 * `className` la cho dat the tren luoi (col-span, row-span...), noi dung the
 * khong doi.
 */

type CardProps = { className?: string };

export const PriceCard = ({
  className = "",
  onPriceSheet,
  onLoanCalculator,
}: CardProps & {
  /** Mo phieu tinh gia */
  onPriceSheet?: () => void;
  /** Mo bang tinh lai vay */
  onLoanCalculator?: () => void;
}) => (
  <div className={`bg-white p-3 rounded-xl border border-slate-100 shadow-2xs lg:flex lg:flex-col lg:p-2 ${className}`}>
    <div className="flex flex-wrap items-center justify-between gap-2 mb-2 lg:mb-1">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg lg:p-1">
          <FiDollarSign className="w-5 h-5 lg:w-4 lg:h-4" />
        </div>
        <span className="font-bold text-base text-slate-900 lg:text-xs lg:leading-tight">Giá</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPriceSheet}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 lg:px-2 lg:py-1 lg:text-[11px] transition-colors hover:border-blue-200 hover:bg-blue-50/60 hover:text-blue-700"
        >
          Phiếu tính giá
          <FiFileText className="w-3.5 h-3.5 text-blue-500" />
        </button>
        <button
          type="button"
          onClick={onLoanCalculator}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 lg:px-2 lg:py-1 lg:text-[11px] transition-colors hover:border-blue-200 hover:bg-blue-50/60 hover:text-blue-700"
        >
          Tính lãi vay
          <FiPercent className="w-3.5 h-3.5 text-blue-500" />
        </button>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 rounded-lg bg-slate-50/80 p-2.5 text-sm lg:content-center lg:text-[11px] lg:flex-1 lg:gap-y-1 lg:p-2 max-md:grid-cols-1 max-md:gap-2 md:max-lg:gap-x-1 md:max-lg:p-2 md:max-lg:text-xs">
      <div className="flex items-center justify-between gap-2 border-r border-slate-200 pr-2 max-md:border-r-0 max-md:pr-0 md:max-lg:gap-1 md:max-lg:pr-1.5">
        <span className="shrink-0 text-slate-600">Giá TTTĐ</span>
        <span className="whitespace-nowrap text-right font-bold text-slate-900 lg:text-xs">2.97 tỷ</span>
      </div>
      <div className="flex items-center justify-between gap-2 pl-1 max-md:pl-0 md:max-lg:gap-1 md:max-lg:pl-0.5">
        <span className="shrink-0 text-slate-600">Giá vay</span>
        <span className="whitespace-nowrap text-right font-semibold text-slate-800 lg:text-xs">Đang cập nhật</span>
      </div>
      <div className="flex items-center justify-between gap-2 border-r border-slate-200 pr-2 max-md:border-r-0 max-md:pr-0 md:max-lg:gap-1 md:max-lg:pr-1.5">
        <span className="shrink-0 text-slate-600">Đơn giá</span>
        <span className="whitespace-nowrap text-right font-bold text-slate-900 lg:text-xs">54.92 triệu/m²</span>
      </div>
      <div className="flex items-center justify-between gap-2 pl-1 max-md:pl-0 md:max-lg:gap-1 md:max-lg:pl-0.5">
        <span className="shrink-0 text-slate-600">Giá TTS</span>
        <span className="whitespace-nowrap text-right font-semibold text-slate-800 lg:text-xs">Đang cập nhật</span>
      </div>
    </div>
  </div>
);

export const AreaCard = ({
  className = "",
  layout,
}: CardProps & {
  /** Ma layout/mat bang cua can - hien ngang dong "Dien tich" */
  layout?: string;
}) => (
  <div className={`bg-white p-3 rounded-xl border border-slate-100 shadow-2xs lg:flex lg:flex-col lg:p-2 ${className}`}>
    <div className="flex flex-wrap items-center justify-between gap-2 mb-2 lg:mb-1">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg lg:p-1">
          <FiMaximize2 className="w-5 h-5 lg:w-4 lg:h-4" />
        </div>
        <span className="font-bold text-base text-slate-900 lg:text-xs lg:leading-tight">Diện tích</span>
      </div>

      {/* Dung y het kieu nut "Phieu tinh gia" ben khoi Gia: cung o mot cot,
          hai nhan nay canh nhau nen lech kieu la thay ngay */}
      <span className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 lg:px-2 lg:py-1 lg:text-[11px]">
        Layout
        {layout && <span className="text-slate-500">{layout}</span>}
        <FiGrid className="w-3.5 h-3.5 text-blue-500" />
      </span>
    </div>

    <div className="bg-slate-50/80 p-2.5 rounded-lg lg:p-2 lg:flex-1 grid grid-cols-2 text-sm lg:text-[11px] divide-x divide-slate-200 lg:flex lg:flex-col lg:justify-center lg:gap-1 lg:divide-x-0">
      <div className="pr-2 lg:flex lg:items-center lg:justify-between lg:gap-2 lg:pr-0">
        <p className="text-slate-600 mb-0.5 lg:mb-0 lg:shrink-0">DT đất</p>
        <p className="font-bold text-base text-slate-900 lg:whitespace-nowrap lg:text-right lg:text-xs lg:leading-tight">237.7 m²</p>
      </div>
      <div className="pl-3 lg:flex lg:items-center lg:justify-between lg:gap-2 lg:pl-0">
        <p className="text-slate-600 mb-0.5 lg:mb-0 lg:shrink-0">DT xây dựng</p>
        <p className="font-bold text-base text-slate-900 lg:whitespace-nowrap lg:text-right lg:text-xs lg:leading-tight">377.3 m²</p>
      </div>
    </div>
  </div>
);

export const PolicyCard = ({ className = "" }: CardProps) => (
  <div className={`bg-white p-3 rounded-xl border border-slate-100 shadow-2xs lg:flex lg:flex-col lg:p-2 ${className}`}>
    <div className="flex items-center mb-2 lg:mb-1">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg lg:p-1">
          <FiGift className="w-5 h-5 lg:w-4 lg:h-4" />
        </div>
        <span className="font-bold text-base text-slate-900 lg:text-xs lg:leading-tight">CSBH & Quà tặng</span>
      </div>
    </div>

    <div className="bg-slate-50/80 p-2.5 rounded-lg lg:p-2 lg:flex-1 grid grid-cols-2 text-sm lg:text-[11px] divide-x divide-slate-200 lg:flex lg:flex-col lg:justify-center lg:gap-1 lg:divide-x-0">
      <div className="pr-2 lg:flex lg:items-center lg:justify-between lg:gap-2 lg:pr-0">
        <p className="text-slate-600 mb-0.5 lg:mb-0 lg:shrink-0">CSBH áp dụng</p>
        <p className="font-bold text-sm text-slate-900 lg:truncate lg:text-right lg:text-xs">13/08/2026</p>
      </div>
      <div className="pl-3 lg:flex lg:items-center lg:justify-between lg:gap-2 lg:pl-0">
        <p className="text-slate-600 mb-0.5 lg:mb-0 lg:shrink-0">Ưu đãi đặc biệt</p>
        <p className="font-bold text-sm text-slate-900 lg:truncate lg:text-right lg:text-xs">3 chỉ vàng - 45tr</p>
      </div>
    </div>
  </div>
);

export const HandoverCard = ({ className = "" }: CardProps) => (
  <div className={`bg-white p-3 rounded-xl border border-slate-100 shadow-2xs lg:flex lg:flex-col lg:p-2 ${className}`}>
    <div className="flex items-center gap-2 mb-2 lg:mb-1">
      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg lg:p-1">
        <FiFileText className="w-5 h-5 lg:w-4 lg:h-4" />
      </div>
      <span className="font-bold text-base text-slate-900 lg:text-xs lg:leading-tight">Thông tin bàn giao</span>
    </div>

    <div className="bg-slate-50/80 p-2.5 rounded-lg lg:p-2 lg:flex lg:flex-1 lg:flex-col lg:justify-center space-y-1.5 text-sm lg:text-[11px]">
      <div className="flex justify-between items-center">
        <span className="text-slate-600">Tiêu chuẩn bàn giao</span>
        <span className="font-medium text-slate-900">Giản xây</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-slate-600">Loại giỏ hàng</span>
        <span className="font-medium text-slate-900">Thứ cấp</span>
      </div>
    </div>
  </div>
);

export const LegalCard = ({ className = "" }: CardProps) => (
  <div className={`bg-white p-3 rounded-xl border border-slate-100 shadow-2xs flex justify-between items-center lg:p-2 ${className}`}>
    <div className="flex items-center gap-2">
      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg lg:p-1">
        <FiShield className="w-5 h-5 lg:w-4 lg:h-4" />
      </div>
      <span className="font-bold text-base text-slate-900 lg:text-xs lg:leading-tight">Pháp lý</span>
    </div>
    <div className="flex items-center gap-1.5 bg-blue-50/60 text-blue-700 px-3 py-1 rounded-lg border border-blue-100 text-sm font-semibold lg:px-2.5 lg:text-[11px]">
      <FiShield className="w-3.5 h-3.5 text-blue-600" />
      Sở hữu lâu dài
    </div>
  </div>
);
