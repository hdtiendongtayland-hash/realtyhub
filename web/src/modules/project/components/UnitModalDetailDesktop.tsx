"use client";

import { useState } from "react";
import { FiArrowRight, FiCalendar, FiShare2, FiUsers } from "react-icons/fi";
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
                  kia: self-start cho no dung o nua o tren. h-11 khoa cung
                  chieu cao, bang dung nut BOOKING LOCK nam ngang no. */}
              <LegalCard className="h-11 self-start" />
            </div>

            {/* Cột tư vấn viên + hành động.
                Dung LUOI 3 HANG y het luoi so lieu ben trai (cung so hang,
                cung gap) thay vi chia flex 2:1 - hai cach tinh khac nhau thi
                duong ke ngang o "nga tu" lech nhau vai px. */}
            <div className="grid w-[30%] min-h-0 shrink-0 grid-rows-3 gap-1.5">
              {/* Tu van vien an tron hai hang dau -> day no trung voi day o
                  "CSBH & Qua tang" ben trai */}
              <div className="row-span-2 flex min-h-0 flex-col gap-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs">
                <div className="flex shrink-0 items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <FiUsers className="h-4 w-4" />
                  </span>
                  <p className="min-w-0 truncate text-sm font-bold leading-tight text-slate-900">
                    Liên hệ tư vấn
                  </p>
                </div>

                {/* Chi vua khoang hai nguoi - con lai keo thanh truot xuong
                    xem tiep. slim-scrollbar: thanh cuon manh 5px thay vi thanh
                    ~17px mac dinh cua he dieu hanh (van hien, chi nho lai). */}
                <div className="slim-scrollbar min-h-0 flex-1 overflow-y-auto pr-1">
                  <UnitModalAdvisor
                    variant="band"
                    advisors={advisors}
                    onCall={onCallAdvisor}
                    onMessage={onMessageAdvisor}
                  />
                </div>
              </div>

              {/* BOOKING LOCK la hanh dong chinh nen to va noi bat hon */}
              <div className="flex min-h-0 flex-col justify-start gap-1.5">
                <button
                  type="button"
                  onClick={onBookingLock}
                  className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-[0.98]"
                >
                  <FiCalendar className="h-4 w-4 shrink-0" />
                  <span className="truncate">BOOKING LOCK</span>
                  <FiArrowRight className="h-4 w-4 shrink-0" />
                </button>
                <button
                  type="button"
                  onClick={onShare}
                  className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-3 text-sm font-medium text-blue-600 transition-all hover:bg-blue-50/50 active:scale-95"
                >
                  <FiShare2 className="h-4 w-4 shrink-0" />
                  <span className="truncate">Chia sẻ</span>
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
