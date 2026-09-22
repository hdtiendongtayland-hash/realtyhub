"use client";

import { FiArrowRight, FiCalendar, FiShare2 } from "react-icons/fi";
import UnitModalHeader from "./modal/UnitModalHeader";
import UnitModalHeaderBottom from "./modal/UnitModalHeaderBottom";
import UnitModalGallery from "./modal/UnitModalGallery";
import UnitModalAdvisor from "./modal/UnitModalAdvisor";
import {
  AreaCard,
  HandoverCard,
  LegalCard,
  PolicyCard,
  PriceCard,
} from "./modal/UnitModalInfoCards";
import UnitModalChat from "./modal/UnitModalChat";
import type { UnitModalDetailProps } from "./UnitModalDetail";

/**
 * Bo cuc popup chi tiet can cho MAN HINH MAY TINH (>=1024px).
 *
 * ```
 * ┌──────────────────────────────────────────────────────────────┐
 * │ [HOT] 15/09 09:43                                    [♡] [✕] │
 * │ BT-2313                                      1.80 tỷ         │
 * │ 📍 Beacon Tower                  (Giá FULL đã gồm VAT + KPBT) │
 * ├───────────────────┬──────────────────────────────────────────┤
 * │                   │ [Loại hình][Hướng][Diện tích][So sánh căn]│
 * │   ảnh lớn         │ ┌──────────── Giá ──────────────────────┐ │
 * │   + nhãn STUDIO   │ ├──────────────┬───────────────────────┤ │
 * │                   │ │ Diện tích    │ CSBH & Quà tặng       │ │
 * │  [dải ảnh nhỏ]    │ │ Bàn giao     │ Pháp lý               │ │
 * │  [dải ảnh nhỏ] ›  │ ┌─[TVV1][TVV2][TVV3]─┬─[BOOKING LOCK]─┐ │
 * │                   │ │                    │ [Chia sẻ]      │ │
 * ├───────────────────┴──────────────────────────────────────────┤
 * │ [💬 Nhắn tin với Admin...] [gợi ý 1] [gợi ý 2] [gợi ý 3]      │
 * └──────────────────────────────────────────────────────────────┘
 * ```
 *
 * Duoi 1024px (dien thoai + iPad) dung bo cuc cu trong UnitModalDetail -
 * hai cay markup tach rieng de sua ben nay khong lam hong ben kia.
 */
const UnitModalDetailDesktop = ({
  code,
  phaseName,
  price,
  isStock = false,
  isHot = false,
  isFavorite = false,
  time,
  propertyTypeLabel,
  direction,
  landArea,
  images,
  imageAlt,
  advisors,
  onClose,
  onToggleFavorite,
  onCompareUnit,
  onPriceSheet,
  onLoanCalculator,
  onBookingLock,
  onShare,
  onMore,
  onCopyImage,
  onDownloadImage,
  onCallAdvisor,
  onMessageAdvisor,
}: UnitModalDetailProps) => {
  return (
    <div className="flex h-full min-h-0 flex-col gap-2 pb-2.5">
      {/* ── Đầu trang: mã căn, phân khu, giá ───────────────────── */}
      <div className="shrink-0">
        <UnitModalHeader
          code={code}
          phaseName={phaseName}
          price={price}
          isStock={isStock}
          isHot={isHot}
          isFavorite={isFavorite}
          time={time}
          onClose={onClose}
          onToggleFavorite={onToggleFavorite}
        />
      </div>

      {/* ── Thân: ảnh bên trái, thông tin bên phải ─────────────── */}
      <div className="flex min-h-0 flex-1 gap-2.5">
        <div className="flex w-[34%] min-w-0 shrink-0 flex-col">
          {/* Khong truyen badge/onCopy/onDownload/onToggleFavorite: mockup
              de anh sach, khong co nhan va cum nut noi tren anh. Muon xem to
              thi bam thang vao anh. */}
          <UnitModalGallery images={images} alt={imageAlt} withThumbnails />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <UnitModalHeaderBottom
            variant="bar"
            propertyTypeLabel={propertyTypeLabel}
            direction={direction}
            landArea={landArea}
            onCompareUnit={onCompareUnit}
            onShare={onShare}
            onMore={onMore}
          />

          {/* MOT luoi 3 cot x 3 hang cho TAT CA: so lieu, tu van vien va hai
              nut. Truoc day dai duoi la mot hang flex rieng nen no chia cot
              theo ti le khac voi luoi tren -> cac mep doc lech nhau.

              Hang 1: [ Gia (rong 2 o) ][ tu van vien (cao 2 hang) ]
              Hang 2: [ Dien tich ][ CSBH & Qua tang ]
              Hang 3: [ Ban giao  ][ Phap ly ][ BOOKING LOCK + Chia se ]

              auto-rows minmax(min-content, 1fr): con du cho thi ba hang giai
              deu nhau, het cho thi hang dung o dung chieu cao noi dung (khong
              dung auto-rows-fr vi no cho hang co nho hon noi dung -> chu tran
              ra de len the duoi). */}
          <div className="no-scrollbar grid min-h-0 flex-1 grid-cols-3 auto-rows-[minmax(min-content,1fr)] gap-1.5 overflow-y-auto">
            <PriceCard
              className="col-span-2"
              onPriceSheet={onPriceSheet}
              onLoanCalculator={onLoanCalculator}
            />

            {/* Ba the tu van vien xep doc, chiem tron cot thu ba cua hai hang dau */}
            <div className="row-span-2 flex min-h-0">
              <UnitModalAdvisor
                variant="band"
                advisors={advisors}
                onCall={onCallAdvisor}
                onMessage={onMessageAdvisor}
              />
            </div>

            <AreaCard />
            <PolicyCard />

            <HandoverCard />
            <LegalCard />

            {/* BOOKING LOCK la hanh dong chinh nen nam tren va noi bat hon */}
            <div className="flex min-h-0 flex-col gap-1.5">
              <button
                type="button"
                onClick={onBookingLock}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-[0.98]"
              >
                <FiCalendar className="h-4 w-4" />
                <span>BOOKING LOCK</span>
                <FiArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onShare}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-600 transition-all hover:bg-blue-50/50 active:scale-95"
              >
                <FiShare2 className="h-4 w-4" />
                <span>Chia sẻ</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Thanh nhắn tin + gợi ý nhanh ───────────────────────── */}
      <UnitModalChat variant="bar" className="shrink-0" />
    </div>
  );
};

export default UnitModalDetailDesktop;
