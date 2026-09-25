"use client";

import { useState } from "react";
import { FaHammer } from "react-icons/fa6";
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
 * │ [💬 Nhắn…] │ │ Bàn giao    │ Pháp lý    │ │ [TVV 3]       ││
 * │ (gợi ý)(gợi…│      [Chia sẻ] [BOOKING LOCK]                   │
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
  onCopyImage,
  onDownloadImage,
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

      {/* ── Thanh 4 ô (loại hình / hướng / diện tích / so sánh) ─────
          Nam RIENG mot hang, chua san o trong ben trai dung bang be ngang cot
          anh. Truoc no nam trong khu ben phai nen day anh bat dau cao hon
          the "Gia" dung mot thanh - nhin ngang qua la thay lech. Chua cho
          bang mot o trong thay vi day anh xuong bang px: bao nhieu px thi
          cung sai khi thanh doi chieu cao, con o trong thi luon bang. */}
      <div className="flex shrink-0 gap-1.5">
        <div aria-hidden className="w-[30%] shrink-0" />
        <div className="min-w-0 flex-1">
          <UnitModalHeaderBottom
            variant="bar"
            propertyTypeLabel={propertyTypeLabel}
            direction={direction}
            landArea={landArea}
            onCompareUnit={onCompareUnit}
            onShare={onShare}
            onMore={onMore}
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-1.5">
        {/* ── Cột 1: ảnh + ô nhắn tin + gợi ý nhanh ────────────── */}
        <div className="flex w-[30%] min-w-0 shrink-0 flex-col gap-1.5">
          {/* Khong truyen badge/onToggleFavorite: nhan loai hinh va nut tim
              da co o dau trang roi, lap lai tren anh chi lam roi. Rieng hai
              nut sao chep / tai ve thi giu - do la viec nguoi dung lam ngay
              tren anh, khong co cho nao khac thay the. */}
          <div className="flex min-h-0 flex-1">
            <UnitModalGallery
              images={images}
              alt={imageAlt}
              onCopy={onCopyImage}
              onDownload={onDownloadImage}
              withThumbnails
            />
          </div>

          <UnitModalChat
            variant="input"
            className="shrink-0"
            value={chatMessage}
            onValueChange={setChatMessage}
          />

          {/* Ba goi y nam NGAY DUOI o nhan tin: bam mot cai la cau hoi do
              duoc dien vao o ngay tren, hai thu di lien nhau thi moi lien he
              do nhin la hieu. Truoc day chung nam o day cot ben phai - xa o
              nhan tin ca khung, nguoi dung khong doan ra bam vao thi chu chay
              di dau. */}
          <UnitModalChat
            variant="chips"
            className="shrink-0"
            value={chatMessage}
            onValueChange={setChatMessage}
          />
        </div>

        {/* ── Khu bên phải: số liệu + cột tư vấn, dưới cùng là hai nút ── */}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
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
                  kia: self-start cho no dung o nua o tren, h-12 khoa cung
                  chieu cao. */}
              <LegalCard className="h-12 self-start" />
            </div>

            {/* Cột tư vấn viên: tieu de + ba the, gom trong mot khung vien.
                Hai nut hanh dong da chuyen xuong thanh ngang duoi cung. */}
            {/* Be rong dung bang MOT o cua thanh tren: thanh do co 4 o va 3
                khoang cach 6px, nen moi o = 25% tru 4.5px. Dat 25% chan se
                thua mat 4.5px va lech khoi o "So sanh can" phia tren.

                Chieu cao dung bang DAY THE "Phap ly" ben canh chu khong keo
                het hang: luoi ben trai co 3 hang deu nhau va 2 khoang ho 6px
                (hang = (100%-12px)/3), the "Phap ly" cao 48px nam dau hang 3
                -> day no o (200%-24px)/3 + 60px. Viet bang calc de hang co
                gian the nao no cung bam theo, khong phai do tay. */}
            <div className="flex h-[calc((200%-24px)/3+60px)] w-[calc(25%-4.5px)] min-h-0 shrink-0 flex-col gap-1.5 self-start rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs">
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
            </div>
          </div>

          {/* ── Hai nút hành động: một hàng ngang dưới cùng ────────
              Truoc day chung xep doc trong the "Lien he tu van" - cot do chi
              rong 25% nen nut bi bop hep, con chu "BOOKING LOCK" thi gan cham
              hai mep. Dua xuong day thanh mot hang ngang can giua: nut rong
              rai, de thay, va giong het bo cuc iPad/dien thoai.
              Hang the thong tin phia tren la flex-1 nen tu co lai nhuong cho
              cho thanh nay. */}
          <div className="flex shrink-0 items-center gap-2">
            {/* O nay rong dung bang NUA luoi so lieu, nut nam sat mep phai no
                -> canh phai nut "Chia se" thang hang voi mep phai the "Thong
                tin ban giao" ngay tren. Cach tinh: cot tu van chiem 25%-4.5px
                cua hang, con lai 6px khoang ho, nen nua luoi = 37.5%-0.75px;
                tru tiep 3px (nua khoang ho giua hai cot the) ra 37.5%-3.75px.
                Khoa theo mep the nhu vay thi khung co gian the nao cung thang,
                khong phai do tay bang padding. */}
            <div className="flex w-[calc(37.5%-3.75px)] shrink-0 justify-end">
              <button
                type="button"
                onClick={onShare}
                className="flex h-10 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-6 text-sm font-medium text-blue-600 transition-all hover:bg-blue-50/50 active:scale-95"
              >
                <FiShare2 className="h-4 w-4 shrink-0" />
                <span>Chia sẻ</span>
              </button>
            </div>
            <button
              type="button"
              onClick={onBookingLock}
              className="relative flex h-10 animate-cta-glow items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 pl-6 pr-12 text-[13px] font-bold uppercase tracking-wider text-white transition-all hover:from-blue-700 hover:to-blue-600 hover:brightness-110 active:scale-[0.98]"
            >
              {/* Cai bua go go vao nut: dat o goc phai, quay quanh DUOI GOC
                  PHAI (chuoi bua) nen dau bua vung len roi bo xuong mat nut.
                  Vong song bung ra dung diem cham. pr-12 chua san cho cho no,
                  neu khong bua se go trum len chu. Ca cum aria-hidden +
                  pointer-events-none: chi de nhin, khong chan cu bam. */}
              <span
                aria-hidden
                className="pointer-events-none absolute right-1.5 top-1/2 z-10 h-8 w-8 -translate-y-1/2"
              >
                <span className="absolute bottom-0.5 left-0.5 h-5 w-5 animate-cta-knock rounded-full border-2 border-white/80" />
                <FaHammer className="absolute bottom-1 right-0 h-4 w-4 origin-bottom-right animate-cta-hammer text-white drop-shadow-md" />
              </span>

              {/* Vet sang quet qua mat nut - nam duoi chu nho z-index */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 w-1/4 animate-cta-shine bg-gradient-to-r from-transparent via-white/40 to-transparent"
              />
              <FiCalendar className="relative z-10 h-4 w-4 shrink-0" />
              <span className="relative z-10">BOOKING LOCK</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitModalDetailDesktop;
