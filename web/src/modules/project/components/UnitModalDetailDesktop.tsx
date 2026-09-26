"use client";

import { useRef, useState } from "react";
import { FaHandPointer } from "react-icons/fa6";
import { FiCalendar, FiShare2 } from "react-icons/fi";
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
  // Ba goi y nam o mot component khac voi o nhap, nen ref phai do CHA giu:
  // bam goi y -> con tro nhay thang vao o nhap o duoi, go tiep duoc ngay.
  const chatInputRef = useRef<HTMLInputElement>(null);

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
        {/* ── Cột 1: ảnh (chiem tron chieu cao cot) ───────────── */}
        <div className="flex w-[30%] min-w-0 shrink-0 flex-col gap-1.5">
          {/* Khong truyen badge/onToggleFavorite: nhan loai hinh va nut tim
              da co o dau trang roi, lap lai tren anh chi lam roi. Rieng hai
              nut sao chep / tai ve thi giu - do la viec nguoi dung lam ngay
              tren anh, khong co cho nao khac thay the. */}
          {/* Thanh hai nut da nam ngoai hang nen anh va luoi so lieu cung
              ket thuc o day hang - khong phai chua cho gi them. */}
          <div className="flex min-h-0 flex-1">
            <UnitModalGallery
              images={images}
              alt={imageAlt}
              onCopy={onCopyImage}
              onDownload={onDownloadImage}
              withThumbnails
            />
          </div>

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
              {/* "Phap ly" cao BANG the "Thong tin ban giao" ben canh: no
                  chi co mot gia tri nen truoc day bi khoa h-12 va day len
                  nua o tren, nhin ngang qua thi thap hon han the kia. De no
                  keo dan theo hang, noi dung tu can giua. */}
              <LegalCard />
            </div>

            {/* Cột tư vấn viên: tieu de + ba the, gom trong mot khung vien.
                Hai nut hanh dong da chuyen xuong thanh ngang duoi cung. */}
            {/* Be rong dung bang o "So sanh can" phia tren: mot phan tu cua
                thanh (25% - 4.5px) cong 40px ma ba o thong tin nhuong lai.
                Hai cai phai cung mot cong thuc, lech mot chut la thay ngay.

                Chieu cao bam theo luoi ben trai: 3 hang deu nhau, 2 khoang
                ho 6px (hang = (100%-12px)/3). Truoc the nay cao den day the
                "Phap ly" ((200%-24px)/3 + 60px); nay bo dong tieu de "Lien
                he tu van" (18px chu + 6px khoang ho) nen thap di 24px -
                phan do nhuong cho o nhan tin ngay duoi. */}
            {/* Cot phai: the "Lien he tu van" o tren, o nhan tin + goi y
                nhanh ngay duoi. Truoc chung nam duoi cot anh; dat canh danh
                sach tu van vien thi nguoi nhan va o go tin o sat nhau, ma
                phan trong duoi the tu van cung duoc dung den. */}
            <div className="flex w-[calc(25%+35.5px)] min-h-0 shrink-0 flex-col gap-1.5">
              <div className="flex h-[calc((200%-24px)/3+36px)] min-h-0 shrink-0 flex-col gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs">
                {/* Van cuon duoc (lan chuot / vuot) nhung KHONG ve thanh
                    truot: cot nay chi rong ~25% khung, mot vach cuon dung o
                    day lam phan chu hep them va nhin roi. */}
                <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
                  <UnitModalAdvisor
                    variant="band"
                    advisors={advisors}
                    onCall={onCallAdvisor}
                    onMessage={onMessageAdvisor}
                  />
                </div>
              </div>

              <UnitModalChat
                variant="input"
                className="shrink-0"
                value={chatMessage}
                onValueChange={setChatMessage}
                inputRef={chatInputRef}
              />

              {/* Ba goi y nam NGAY DUOI o nhan tin: bam mot cai la cau hoi
                  do duoc dien vao o ngay tren, hai thu di lien nhau thi moi
                  lien he do nhin la hieu. */}
              {/* -mt-0.5: hang goi y nhich len 2px */}
              <UnitModalChat
                variant="chips"
                className="-mt-0.5 shrink-0"
                value={chatMessage}
                onValueChange={setChatMessage}
                inputRef={chatInputRef}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Hai nút hành động: một hàng ngang dưới cùng ────────
          Truoc day chung xep doc trong the "Lien he tu van" - cot do chi
          rong 25% nen nut bi bop hep, con chu "BOOKING LOCK" thi gan cham
          hai mep. Dua xuong day thanh mot hang ngang: nut rong rai, de
          thay, va giong het bo cuc iPad/dien thoai.
          Nam NGOAI hang ba cot nen can giua theo CA KHUNG popup, tinh
          ca cot anh ben trai. Hang ba cot phia tren la flex-1 nen tu co
          lai nhuong cho cho thanh nay - do la dung phan cho ma thanh nut
          chiem khi con nam trong khu ben phai, nen khong o nao xe dich.
          */}
      {/* px-[calc(30%+6px)]: chua trong hai ben dung bang be ngang cot anh
          (30%) cong khoang ho 6px, nen canh trai nut "Chia se" thang hang voi
          canh trai the "Thong tin ban giao" ngay tren, va canh phai nut xanh
          doi xung qua tim khung.
          Hai nut deu `grow` (grow:1, basis giu nguyen be rong noi dung) nen
          cho thua chia DEU: moi nut no ra dung bang nhau, giu nguyen chenh
          lech von co giua chung. */}
      <div className="flex shrink-0 items-center gap-2 px-[calc(30%+6px)]">
        <button
          type="button"
          onClick={onShare}
          className="flex h-12 grow items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-6 text-sm font-medium text-blue-600 transition-all hover:bg-blue-50/50 active:scale-95"
        >
          <FiShare2 className="h-4 w-4 shrink-0" />
          <span>Chia sẻ</span>
        </button>
        <button
          type="button"
          onClick={onBookingLock}
          className="relative flex h-12 grow animate-cta-glow items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 pl-6 pr-12 text-[13px] font-bold uppercase tracking-wider text-white transition-all hover:from-blue-700 hover:to-blue-600 hover:brightness-110 active:scale-[0.98]"
        >
          {/* Ban tay bam bam vao nut: nhac len roi an xuong mat nut,
              ngon tay hoi thu lai luc cham cho ra dong tac bam. Vong song
              bung ra dung diem cham. pr-12 chua san cho cho no, neu khong
              ban tay se de trum len chu. Ca cum aria-hidden +
              pointer-events-none: chi de nhin, khong chan cu bam. */}
          <span
            aria-hidden
            className="pointer-events-none absolute right-1.5 top-1/2 z-10 h-8 w-8 -translate-y-1/2"
          >
            <span className="absolute bottom-0.5 left-0.5 h-5 w-5 animate-cta-knock rounded-full border-2 border-white/80" />
            <FaHandPointer className="absolute bottom-0.5 right-0.5 h-4 w-4 origin-bottom animate-cta-tap text-white drop-shadow-md" />
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
  );
};

export default UnitModalDetailDesktop;
