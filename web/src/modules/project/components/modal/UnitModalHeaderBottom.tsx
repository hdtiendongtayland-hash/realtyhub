"use client";

import { FiHome, FiCompass, FiMaximize, FiCopy } from "react-icons/fi";

type UnitModalHeaderBottomProps = {
  /** Loại hình (VD: "Song Lập", "Liền Kề", "Biệt Thự") */
  propertyTypeLabel: string;
  /** Hướng (VD: "Tây", "Đông", "Nam") */
  direction: string;
  /** Diện tích đất / xây dựng (m²) */
  landArea: number;
  /** Mở so sánh căn */
  onCompareUnit?: () => void;
  /** Chia sẻ */
  onShare?: () => void;
  /** Mở menu thêm */
  onMore?: () => void;
  /**
   * "bar": bon o roi nhau, be ngang bang nhau - dung o bo cuc desktop, noi
   * thanh nay nam dau cot thong tin chu khong trai ngang ca popup.
   */
  variant?: "default" | "bar";
  /**
   * false: khong ve nut "So sanh can" trong thanh nay - dung khi bo cuc dat
   * nut do o cho khac (bo cuc may tinh dat no o dau cot hanh dong ben phai).
   */
  showCompare?: boolean;
};

/**
 * Footer thanh hành động nhanh của popup chi tiết căn.
 *
 * Layout theo mockup:
 * ```
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ [🏠 Song Lập] [🧭 Tây] [▭ 228 m²] │ [So sánh căn] │
 * └──────────────────────────────────────────────────────────────────────┘
 * ```
 *
 * - 3 ô đầu là thông tin tóm tắt của căn (không click, chỉ hiển thị).
 * - Ô cuối là hành động so sánh căn. "Phiếu tính giá" va "Tính lãi vay" nằm
 *   ngang dòng "Giá" trong cột thông tin, không ở hàng này.
 *
 * Sử dụng CSS Grid để đảm bảo:
 * - Các cột có width đều nhau
 * - Các ô có height đều nhau (align-items: stretch)
 */
const UnitModalHeaderBottom = ({
  propertyTypeLabel,
  direction,
  landArea,
  onCompareUnit,
  onShare,
  onMore,
  variant = "default",
  showCompare = true,
}: UnitModalHeaderBottomProps) => {
  if (variant === "bar") {
    // Kieu dang chung cua bon o - KHONG chua lop chia be ngang (flex-1 /
    // w-[...]), cho nao dung thi tu them, tranh hai lop da nhau.
    const boxLook =
      "flex items-center gap-2 rounded-xl border border-brand-200 bg-white px-2.5 py-1.5 shadow-2xs";
    const box = `${boxLook} min-w-0 flex-1`;

    return (
      <div className="flex min-w-0 items-stretch gap-1.5">
        {/* Ba o thong tin gom mot nhom, an het be rong con lai sau khi tru
            o "So sanh can" - khoang ho deu 6px, khong chua trong. */}
        <div className="flex min-w-0 flex-1 items-stretch gap-1.5">
        <div className={box}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-white">
            <FiHome className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Loại hình</p>
            <p className="truncate text-sm font-bold uppercase text-gray-900">
              {propertyTypeLabel}
            </p>
          </div>
        </div>

        <div className={box}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white">
            <FiCompass className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Hướng</p>
            <p className="truncate text-sm font-bold uppercase text-gray-900">
              {direction}
            </p>
          </div>
        </div>

        <div className={box}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-500 text-white">
            <FiMaximize className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Diện tích</p>
            <p className="truncate text-sm font-bold uppercase text-gray-900">
              {landArea} m²
            </p>
          </div>
        </div>

        </div>

        {/* "So sanh can" sat mep phai va rong bang mot phan tu CONG them
            40px vua lay duoc tu ba o kia: 25% - 4.5px + 40px. Cot "Lien he
            tu van" ngay duoi dung dung con so nay - hai cai thang mot duong
            doc. */}
        {showCompare && (
          <button
            type="button"
            onClick={onCompareUnit}
            className="flex w-[calc(25%+35.5px)] min-w-0 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-500 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 active:scale-[0.98]"
          >
            <FiCopy className="h-4 w-4 shrink-0" />
            <span className="truncate">So sánh căn</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="border-b border-gray-200 py-2 laptop:py-1.5">
      <div className="flex flex-wrap items-stretch gap-2 max-md:grid max-md:grid-cols-2">
        <div className="flex min-w-[120px] flex-1 items-center gap-2 rounded-lg border border-brand-200 bg-white px-3 py-2 max-md:min-w-0">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-500 text-white">
            <FiHome className="h-4 w-4" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <p className="text-xs font-medium text-gray-600 min-[800px]:max-xl:text-sm">Loại hình</p>
            <p className="truncate text-sm font-bold uppercase leading-tight text-gray-900">
              {propertyTypeLabel}
            </p>
          </div>
        </div>

        <div className="flex min-w-[120px] flex-1 items-center gap-2 rounded-lg border border-brand-200 bg-white px-3 py-2 max-md:min-w-0">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white">
            <FiCompass className="h-4 w-4" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <p className="text-xs font-medium text-gray-600 min-[800px]:max-xl:text-sm">Hướng</p>
            <p className="truncate text-sm font-bold uppercase leading-tight text-gray-900">
              {direction}
            </p>
          </div>
        </div>

        <div className="flex min-w-[120px] flex-1 items-center gap-2 rounded-lg border border-brand-200 bg-white px-3 py-2 max-md:min-w-0">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-brand-500 bg-white text-brand-500">
            <FiMaximize className="h-4 w-4" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <p className="text-xs font-medium text-gray-600 min-[800px]:max-xl:text-sm">Diện tích</p>
            <p className="truncate text-sm font-bold uppercase leading-tight text-gray-900">
              {landArea} m²
            </p>
          </div>
        </div>

        {/* Dien thoai: o thu TU cua luoi 2x2, khoac dung kieu the nhu ba o
            thong tin ben canh (nen sang, vien brand, icon vuong) - de nguyen
            thanh xanh trai ngang hai cot thi no lech han ra khoi bo luoi.
            Tu iPad tro len van la nut xanh nam cung hang nhu cu. */}
        <button
          type="button"
          onClick={onCompareUnit}
          className="flex min-w-[130px] flex-1 items-center justify-center gap-2 rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-600 max-md:min-w-0 max-md:justify-start max-md:border max-md:border-brand-200 max-md:bg-brand-50 max-md:text-brand-700 max-md:shadow-none"
        >
          <span className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-500 text-white max-md:flex">
            <FiCopy className="h-4 w-4" />
          </span>
          <FiCopy className="h-4 w-4 shrink-0 max-md:hidden" />
          <span className="max-md:truncate max-md:text-sm max-md:font-bold max-md:uppercase max-md:leading-tight">
            So sánh căn
          </span>
        </button>
      </div>
    </div>
  );
};

export default UnitModalHeaderBottom;
