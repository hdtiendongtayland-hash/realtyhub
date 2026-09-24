"use client";

import { useState } from "react";
import { FiCalendar, FiShare2, FiUsers } from "react-icons/fi";
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
 * Ba cot: anh - so lieu - hanh dong.
 *
 * ```
 * ┌──────────────────────────────────────────────────────────────┐
 * │ [HOT][CÒN HÀNG] 15/09 09:43                          [♡] [✕] │
 * │ BT-3214                                             1.80 tỷ  │
 * │ 📍 Beacon Tower                        (Giá FULL VAT và KPBT) │
 * ├────────────┬──────────────────────────────┬──────────────────┤
 * │            │ [Loại hình][Hướng][Diện tích]│ [So sánh căn]    │
 * │   ảnh lớn  │ ┌────────── Giá ───────────┐ │ ┌ Liên hệ tư vấn┐│
 * │            │ ├─────────────┬────────────┤ │ │ [TVV 1]       ││
 * │ [dải ảnh] ›│ │ Diện tích   │ CSBH       │ │ │ [TVV 2]       ││
 * │            │ ├─────────────┼────────────┤ │ │ [TVV 3]       ││
 * │ [💬 Nhắn…] │ │ Bàn giao    │ Pháp lý    │ │ [BOOKING LOCK]   │
 * │            │ [gợi ý][gợi ý][gợi ý]        │ [Chia sẻ]        │
 * └────────────┴──────────────────────────────┴──────────────────┘
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
  onCallAdvisor,
  onMessageAdvisor,
}: UnitModalDetailProps) => {
  // O nhap tin nam o cot anh, ba goi y nam o cot so lieu - hai cho khac nhau
  // nen chu dang go phai do day giu, khong the de trong UnitModalChat.
  const [chatMessage, setChatMessage] = useState("");

  return (
    <div className="flex h-full min-h-0 flex-col gap-1.5 pb-2">
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

      <div className="flex min-h-0 flex-1 gap-1.5">
        {/* ── Cột 1: ảnh + dải ảnh nhỏ + ô nhắn tin ────────────── */}
        <div className="flex w-[30%] min-w-0 shrink-0 flex-col gap-1.5">
          {/* Khong truyen badge/onCopy/onDownload/onToggleFavorite: mockup de
              anh sach, khong co nhan va cum nut noi tren anh. Muon xem to thi
              bam thang vao anh. */}
          <div className="flex min-h-0 flex-1">
            <UnitModalGallery images={images} alt={imageAlt} withThumbnails />
          </div>

          <UnitModalChat
            variant="input"
            className="shrink-0"
            value={chatMessage}
            onValueChange={setChatMessage}
          />

        </div>

        {/* ── Khu bên phải: thanh 4 ô trải ngang, dưới là số liệu + hành
            động. Thanh nay phai nam NGOAI cot so lieu thi bon o moi chia deu
            be rong voi nhau. ───────────────────────────────────────── */}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <UnitModalHeaderBottom
            variant="bar"
            propertyTypeLabel={propertyTypeLabel}
            direction={direction}
            landArea={landArea}
            onCompareUnit={onCompareUnit}
            onShare={onShare}
            onMore={onMore}
          />

          <div className="flex min-h-0 flex-1 gap-1.5">
            {/* Cột số liệu
                auto-rows minmax(min-content, 1fr): con du cho thi ba hang giai
                deu nhau, het cho thi hang dung o dung chieu cao noi dung.
                KHONG dung auto-rows-fr (minmax(0,1fr)) vi no cho hang co nho
                hon noi dung -> chu tran ra de len the ben duoi. */}
            <div className="no-scrollbar grid min-w-0 flex-1 auto-rows-[minmax(min-content,1fr)] grid-cols-2 gap-1.5 overflow-y-auto">
              <PriceCard
                className="col-span-2"
                onPriceSheet={onPriceSheet}
                onLoanCalculator={onLoanCalculator}
              />
              <AreaCard />
              <PolicyCard />
              <HandoverCard />
              {/* "Phap ly" chi co mot gia tri nen khong keo dan bang cac the
                  kia: self-start cho no dung o nua o tren. h-12 khoa cung
                  chieu cao, bang dung nut nam ngang no. */}
              <LegalCard className="h-12 self-start" />
            </div>

            {/* Cột tư vấn viên + hành động - GOM TRONG MOT THE:
                tieu de, danh sach tu van vien va hai nut nam chung mot khung
                vien, thay vi the tu van vien roi hai nut tha noi ben ngoai. */}
            {/* Be rong dung bang MOT o cua thanh tren: thanh do co 4 o va 3
                khoang cach 6px, nen moi o = 25% tru 4.5px. Dat 25% chan se
                thua mat 4.5px va lech khoi o "So sanh can" phia tren. */}
            <div className="flex w-[calc(25%-4.5px)] min-h-0 shrink-0 flex-col gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs">
              <div className="flex shrink-0 items-center gap-2">
                <span className="shrink-0 rounded-md bg-blue-50 p-0.5 text-blue-600">
                  <FiUsers className="h-3.5 w-3.5" />
                </span>
                <p className="min-w-0 truncate text-[10px] font-bold leading-tight text-slate-900">
                  Liên hệ tư vấn
                </p>
              </div>

              {/* Van cuon duoc (lan chuot / vuot) nhung KHONG ve thanh truot:
                  cot nay chi rong ~25% khung, mot vach cuon dung o day lam
                  phan chu hep them va nhin roi. */}
              <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
                <UnitModalAdvisor
                  variant="band"
                  advisors={advisors}
                  onCall={onCallAdvisor}
                  onMessage={onMessageAdvisor}
                />
              </div>

              {/* Hai nut: "Chia se" o tren, "BOOKING LOCK" (nen xanh dac) o
                  duoi - nut xanh dat sat day khung cho de bam */}
              {/* mb-px: cum nut dinh day khung nen khi nut "Chia se" thap di
                  1px thi ca cum bi tut xuong, tuc la no ngan lai tu TREN.
                  Them 1px lot duoi de cum giu nguyen mep tren - phan ngan lai
                  roi vao mep DUOI dung nhu y. */}
              <div className="mb-px flex shrink-0 flex-col gap-1.5">
                <button
                  type="button"
                  onClick={onShare}
                  className="flex h-[47px] items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-2 text-xs font-medium text-blue-600 transition-all hover:bg-blue-50/50 active:scale-95"
                >
                  <FiShare2 className="h-4 w-4 shrink-0" />
                  <span className="truncate">Chia sẻ</span>
                </button>
                <button
                  type="button"
                  onClick={onBookingLock}
                  className="relative flex h-12 animate-cta-glow items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-2 text-[13px] font-bold uppercase tracking-wider text-white transition-all hover:from-blue-700 hover:to-blue-600 hover:brightness-110 active:scale-[0.98]"
                >
                  {/* Vet sang quet qua mat nut - nam duoi chu nho z-index */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 left-0 w-1/4 animate-cta-shine bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  />
                  <FiCalendar className="relative z-10 h-4 w-4 shrink-0" />
                  <span className="relative z-10 truncate">BOOKING LOCK</span>
                </button>
              </div>
            </div>
          </div>

          {/* Thanh goi y trai ngang CA hai cot ben phai. Truoc no nam trong
              cot so lieu nen cot do cao hon cot hanh dong dung mot thanh, keo
              hai nut BOOKING LOCK / Chia se tut xuong khong thang hang voi
              the "Phap ly". */}
          <UnitModalChat
            variant="chips"
            className="shrink-0"
            value={chatMessage}
            onValueChange={setChatMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default UnitModalDetailDesktop;
