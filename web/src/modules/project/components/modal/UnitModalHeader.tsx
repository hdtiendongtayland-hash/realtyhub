"use client";

import {
  FiX,
  FiClock,
  FiStar,
  FiLayers,
  FiMapPin,
  FiHeart,
} from "react-icons/fi";
import { formatBillion } from "@/common/utils/format";
import Image from "next/image";

type UnitModalHeaderProps = {
  /** Mã căn - hiển thị lớn ở đầu header */
  code: string;
  /** Tên phân khu */
  phaseName: string;
  /** Giá niêm yết / giá bán */
  price: number;
  /** Trạng thái còn hàng */
  isStock?: boolean;
  /** Căn độc quyền / HOT */
  isHot?: boolean;
  /** Đã yêu thích */
  isFavorite?: boolean;
  /** Thời gian cập nhật (VD: "2 giờ trước", "Hôm nay") */
  time?: string;
  /** Đóng modal */
  onClose: () => void;
  /** Toggle yêu thích */
  onToggleFavorite?: () => void;
};

/**
 * Header của popup chi tiết căn hộ.
 *
 * Chứa các thông tin cốt lõi: mã căn, phân khu, giá, badge trạng thái,
 * nút đóng và yêu thích — layout theo mockup:
 *
 * ```
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ [HOT] [CÒN HÀNG]     Căn A-12.03     [♡] [✕]                    │
 * │ Phân Khu Alpha          4.2 tỷ                               │
 * └─────────────────────────────────────────────────────────────────┘
 * ```
 */
const UnitModalHeader = ({
  code,
  phaseName,
  price,
  isStock = false,
  isHot = false,
  isFavorite = false,
  time,
  onToggleFavorite,
}: UnitModalHeaderProps) => {
  return (
    <div className="border-b border-gray-200 bg-white pb-4">
      <div className="flex items-start justify-between gap-4">
        {/* ── Thông tin bên trái ─────────────────────────────────────── */}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {/* Hàng 1: badges + mã căn */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Badge HOT */}
            {isHot && (
              <span className="inline-flex animate-hot-pulse items-center gap-1 rounded-md pr-2 pl-1 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
                <Image src="/images/hot.png" alt="HOT" width={60} height={20} />
              </span>
            )}

            {/* Badge CÒN HÀNG */}
            {isStock && (
              <span className="inline-flex items-center gap-1 rounded-md bg-jade-500 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
                <FiLayers className="h-3 w-3" />
                Còn hàng
              </span>
            )}

            {/* Hàng 3: thời gian cập nhật */}
            {time && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <FiClock className="h-3.5 w-3.5 shrink-0" />
                <span>{time}</span>
              </div>
            )}

            {/* Mã căn */}
          </div>

          {/* Hàng 2: phân khu + giá */}
          <div className="flex items-start justify-between gap-4">
            {/* Cột trái: code + phaseName */}
            <div className="flex flex-col gap-1">
              {/* Mã căn */}
              <div className="flex items-center gap-1.5">
                <h2 className="text-3xl font-bold text-gray-900">{code}</h2>
              </div>

              {/* Phân khu */}
              <div className="flex items-center gap-1.5">
                <FiMapPin className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">
                  {phaseName}
                </span>
              </div>
            </div>

            {/* Cột phải: giá */}
            <div className="flex flex-col items-end">
              <p className="text-3xl font-semibold text-brand-600">
                {formatBillion(price)}
              </p>
              <span className="text-xs font-medium text-gray-600 mt-1">
                (Giá FULL đã bao gồm VAT và KPBT)
              </span>
            </div>
          </div>
        </div>

        {/* ── Nút hành động bên phải ───────────────────────────────── */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Nút yêu thích */}
          {onToggleFavorite && (
            <button
              type="button"
              onClick={onToggleFavorite}
              aria-label={isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
              title={isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
              className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all ${
                isFavorite
                  ? "border-error-500 bg-error-50 text-error-500 hover:bg-error-100"
                  : "border-gray-200 bg-white text-gray-400 hover:border-error-300 hover:text-error-500"
              }`}
            >
              <FiHeart
                className={`h-4 w-4 ${isFavorite ? "animate-heart-pop fill-current" : ""}`}
              />
            </button>
          )}

          {/* Nút đóng modal */}
          {/* <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            title="Đóng (Esc)"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
          >
            <FiX className="h-4 w-4" />
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default UnitModalHeader;
