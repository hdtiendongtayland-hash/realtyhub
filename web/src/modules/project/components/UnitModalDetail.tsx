"use client";

import { UnitModalHeader, UnitModalHeaderBottom } from "./modal";
import UnitModalGallery from "./modal/UnitModalGallery";
import UnitModalAdvisor from "./modal/UnitModalAdvisor";
import UnitModalInfo from "./modal/UnitModalInfo";
import UnitModalChat from "./modal/UnitModalChat";
import UnitModalDetailDesktop from "./UnitModalDetailDesktop";
import UnitModalBottom from "./modal/UnitModalBottom";

export type UnitModalDetailProps = {
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
  /** Thời gian cập nhật */
  time?: string;
  /** Loại hình (VD: "Song Lập", "Liền Kề", "Biệt Thự") */
  propertyTypeLabel: string;
  /** Hướng (VD: "Tây", "Đông", "Nam") */
  direction: string;
  /** Diện tích đất / xây dựng (m²) */
  landArea: number;
  /** Danh sách URL ảnh */
  images: string[];
  /** Alt cho ảnh lớn */
  imageAlt?: string;
  /** Thông tin advisors */
  advisors?: Array<{
    id: string | number;
    name: string;
    avatar: string;
    views: number;
    phone?: string;
  }>;
  /** Đóng modal */
  onClose: () => void;
  /** Toggle yêu thích */
  onToggleFavorite?: () => void;
  /** Mở so sánh căn */
  onCompareUnit?: () => void;
  /** Mở phiếu tính giá */
  onPriceSheet?: () => void;
  /** Mở bảng tính lãi vay */
  onLoanCalculator?: () => void;
  /** Mở bảng tạo yêu cầu lock căn */
  onBookingLock?: () => void;
  /** Chia sẻ */
  onShare?: () => void;
  /** Mở menu thêm */
  onMore?: () => void;
  /** Copy ảnh */
  onCopyImage?: () => void;
  /** Download ảnh */
  onDownloadImage?: () => void;
  /** Gọi advisor */
  onCallAdvisor?: (advisor: {
    id: string | number;
    name: string;
    avatar: string;
    views: number;
    phone?: string;
  }) => void;
  /** Nhắn tin advisor */
  onMessageAdvisor?: (advisor: {
    id: string | number;
    name: string;
    avatar: string;
    views: number;
    phone?: string;
  }) => void;
};

const UnitModalDetail = ({
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
  const props = {
    code,
    phaseName,
    price,
    isStock,
    isHot,
    isFavorite,
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
  };

  return (
    <>
      {/* Tu 1024px tro len: bo cuc may tinh (xem UnitModalDetailDesktop) */}
      <div className="hidden h-full min-h-0 lg:block">
        <UnitModalDetailDesktop {...props} />
      </div>

      {/* Duoi 1024px: bo cuc dien thoai/iPad giu nguyen nhu cu */}
      <div className="flex h-full min-h-0 flex-col overflow-hidden lg:hidden md:max-lg:h-auto md:max-lg:min-h-full md:max-lg:overflow-visible max-md:h-auto max-md:min-h-full max-md:overflow-visible">
        {/* ── Header (cố định phía trên) ─────────────────────────── */}
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

        {/* ── Header Bottom (cố định phía trên) ──────────────────── */}
        <div className="shrink-0">
          <UnitModalHeaderBottom
            propertyTypeLabel={propertyTypeLabel}
            direction={direction}
            landArea={landArea}
            onCompareUnit={onCompareUnit}
            onShare={onShare}
            onMore={onMore}
          />
        </div>

        {/* ── Content: iPad/desktop 2 cot nhu cu, mobile xep 1 cot ──
            max-md:flex-none: o dien thoai khoi nay phai cao DUNG BANG noi dung.
            "flex-1 min-h-0" cua bo cuc 2 cot cho phep no co ngan hon noi dung -
            luc do the thong tin tran ra ngoai hop, chui xuong duoi ca thanh nut
            va keo mai khong het. */}
        <div className="no-scrollbar flex min-h-0 flex-1 overflow-hidden md:max-lg:min-h-fit md:max-lg:flex-none md:max-lg:overflow-visible max-md:min-h-fit max-md:flex-none max-md:flex-col max-md:overflow-visible">
          {/* Desktop: cot anh hep hon cot thong tin (khung nam ngang nen thua be
              ngang, thieu be doc) - nho vay cot phai du cho hien het thong tin. */}
          <div className="flex w-1/2 shrink-0 flex-col overflow-hidden border-r border-gray-200 md:max-lg:overflow-visible max-md:w-full max-md:overflow-visible max-md:border-r-0 lg:w-[42%]">
            {/* Cot trai CUON duoc thay vi ep anh vua chieu cao: anh giu dang dung
                tron ven, man hinh thap thi nguoi dung keo xuong xem tiep.
                Desktop thi anh tu co lai theo cho con lai de ca cot vua khung -
                nhung khong bao gio cat mat tu van vien va o nhan tin ben duoi. */}
            <div className="no-scrollbar flex flex-1 flex-col overflow-y-auto pt-2 pr-1 md:max-lg:overflow-visible max-md:overflow-visible max-md:pr-0 max-md:pt-3 lg:min-h-0">
              <div className="lg:flex lg:min-h-[200px] lg:flex-1">
                <UnitModalGallery
                  images={images}
                  alt={imageAlt}
                  onCopy={onCopyImage}
                  onDownload={onDownloadImage}
                />
              </div>
              <div className="mt-2 laptop:mt-1.5 lg:shrink-0">
                <UnitModalAdvisor
                  advisors={advisors}
                  onCall={onCallAdvisor}
                  onMessage={onMessageAdvisor}
                />
              </div>

              {/* O nhan tin nam ngay duoi ba the tu van vien: nguoi nhan tin va
                  o go tin o canh nhau. Ap dung tu iPad tro len - rieng dien thoai
                  (1 cot) no van o cuoi cot thong tin (xem UnitModalInfo). */}
              <UnitModalChat className="mt-2 max-md:hidden lg:shrink-0" />
            </div>
          </div>

          <div className="no-scrollbar w-1/2 overflow-y-auto pt-2 pl-1 md:max-lg:overflow-visible md:max-lg:pb-4 max-md:w-full max-md:overflow-visible max-md:pl-0 max-md:pb-6 lg:flex lg:w-[58%] lg:min-h-0 lg:pl-3">
            <UnitModalInfo
              onPriceSheet={onPriceSheet}
              onLoanCalculator={onLoanCalculator}
            />
          </div>
        </div>

        {/* ── Footer (cố định phía dưới) ─────────────────────────── */}
        {/* Dien thoai: ca popup la MOT vung cuon duy nhat (khong cuon long
            nhau nua), nen thanh nut phai dinh day de luon bam duoc.
            -mx-3 de thanh TRAN het be ngang: khung ngoai co le px-3, neu khong
            bu lai thi hai ben ho 12px va noi dung dang cuon lo ra sau thanh.
            Bong do tren canh cho thay ro phan noi dung dang truot ben duoi. */}
        <div className="md:max-lg:sticky md:max-lg:bottom-0 md:max-lg:z-10 md:max-lg:-mx-4 md:max-lg:bg-white md:max-lg:px-4 md:max-lg:shadow-[0_-6px_16px_rgba(15,23,42,0.08)] max-md:sticky max-md:bottom-0 max-md:z-10 max-md:-mx-3 max-md:bg-white max-md:px-3 max-md:shadow-[0_-6px_16px_rgba(15,23,42,0.08)]">
          <UnitModalBottom onShare={onShare} onBookingLock={onBookingLock} />
        </div>
      </div>
    </>
  );
};

export default UnitModalDetail;
