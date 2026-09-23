"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFavoriteUnits } from "@/common/hooks/useFavoriteUnits";
import { useBookings } from "@/common/hooks/useBookings";
import UnitModalDetail from "./UnitModalDetail";
import UnitBookingLockModal from "./modal/UnitBookingLockModal";
import UnitShareModal from "./modal/UnitShareModal";
import UnitLoanCalculatorModal from "./modal/UnitLoanCalculatorModal";
import { UNIT_STATUS_LABELS } from "../models/project-detail.model";
import type { UnitWithProject } from "../models/project-detail.model";

type UnitModalProps = {
  unit: UnitWithProject | null;
  onClose: () => void;
};

const UnitModal = ({ unit, onClose }: UnitModalProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const { isFavorite, toggle } = useFavoriteUnits();
  const { create: createBooking } = useBookings();

  // Cac bang phu cua popup: lock can, chia se, tinh lai vay. Doi sang can
  // khac thi dong het - so sanh voi can dang xem ngay trong than render, re
  // hon mot vong useEffect va khong nhap nhay mot khung hinh.
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isLoanOpen, setIsLoanOpen] = useState(false);
  const [lastUnitId, setLastUnitId] = useState(unit?.publicId);

  if (lastUnitId !== unit?.publicId) {
    setLastUnitId(unit?.publicId);
    if (isBookingOpen) setIsBookingOpen(false);
    if (isShareOpen) setIsShareOpen(false);
    if (isLoanOpen) setIsLoanOpen(false);
  }

  // Phím Escape đóng modal + focus trap đơn giản
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!unit) return undefined;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    // Focus vào modal sau 1 frame để hoàn thành transition
    const id = requestAnimationFrame(() => {
      dialogRef.current?.focus();
    });

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      cancelAnimationFrame(id);
      previousFocusRef.current?.focus?.();
    };
  }, [unit, handleKeyDown]);

  if (!unit) return null;

  // Mock advisors cho demo
  const advisors = [
    {
      id: 1,
      name: "Lân Thị Ngọc Anh",
      role: "Giám đốc dự án",
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
      views: 0,
      phone: "0901234567",
    },
    {
      id: 2,
      name: "Nguyễn Văn Tuấn",
      role: "Phó giám đốc dự án",
      avatar:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop",
      views: 0,
      phone: "0908765432",
    },

    {
      id: 3,
      name: "Trần Minh Hoàng",
      role: "Admin",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
      views: 0,
      phone: "0909998888",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 max-md:items-end max-md:p-0"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unit-modal-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Đóng"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      />

      {/* Dialog. Tu 1024px tro len: khung ngang chia BA COT (anh - so lieu -
          hanh dong), mot cu bam la thay het, khong phai cuon.

          Kich thuoc dat bang PX CO DINH (1000x540), vh/vw chi la cai chan tren
          cho man hinh nho.

          540px chon co y: man hinh laptop pho bien (768px, he dieu hanh scale
          125%) chi con ~590px CSS chieu cao, nen moi con so lon hon se bi
          `max-h` cat bot o zoom 100% roi lai nha ra o zoom 90% -> cac hang ben
          trong xe dich, nhin nhu bo cuc bi "be". De 540px thi khong muc zoom
          nao cham vao chan tren, bo cuc y het nhau, zoom chi lam to/nho deu.
          Nen xanh rat nhat de cac the trang noi len. Duoi 1024px giu nhu cu. */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative z-10 flex h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl focus:outline-none max-md:h-[var(--app-vh,100dvh)] max-md:rounded-none lg:h-[540px] lg:max-h-[94vh] lg:w-[1000px] lg:max-w-[92vw] lg:bg-[#f3f7fd]"
      >
        {/* Content */}
        <div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-hidden px-4 pt-2 md:max-lg:overflow-y-auto lg:px-3 lg:pt-1.5 max-md:overflow-y-auto max-md:px-3 max-md:pb-[env(safe-area-inset-bottom)]">
          <UnitModalDetail
            code={unit.code}
            phaseName={unit.phaseName ?? "Phân khu mặc định"}
            price={unit.listedPrice ?? 0}
            isStock={unit.status === "con-hang"}
            isHot={true}
            isFavorite={isFavorite(unit.publicId)}
            onToggleFavorite={() => toggle(unit.publicId)}
            time="15/09/2026 09:43"
            propertyTypeLabel={unit.propertyTypeLabel ?? "Liền kề"}
            direction={unit.direction ?? "Đông"}
            landArea={unit.landArea ?? 0}
            images={unit.thumbnailUrls?.length ? unit.thumbnailUrls : []}
            imageAlt={unit.publicId}
            advisors={advisors}
            onClose={onClose}
            onCompareUnit={() => console.log("So sánh căn")}
            onPriceSheet={() => console.log("Phiếu tính giá")}
            onLoanCalculator={() => setIsLoanOpen(true)}
            onBookingLock={() => setIsBookingOpen(true)}
            onShare={() => setIsShareOpen(true)}
            onMore={() => console.log("Menu thêm")}
            onCopyImage={() => console.log("Copy ảnh")}
            onDownloadImage={() => console.log("Download ảnh")}
            onCallAdvisor={(advisor) => console.log("Gọi advisor:", advisor)}
            onMessageAdvisor={(advisor) =>
              console.log("Nhắn tin advisor:", advisor)
            }
          />
        </div>
      </div>

      {isBookingOpen && (
        <UnitBookingLockModal
          code={unit.code}
          projectName={unit.projectName}
          statusLabel={UNIT_STATUS_LABELS[unit.status]}
          isAvailable={unit.status === "con-hang"}
          direction={unit.direction ?? "Đang cập nhật"}
          propertyTypeLabel={unit.propertyTypeLabel ?? "Đang cập nhật"}
          landArea={unit.landArea ?? 0}
          // Bang nay ghi ro "gia chua bao gom VAT + KPBT" nen phai la gia niem
          // yet, khong phai fullVatPrice nhu o cho chia se
          price={unit.listedPrice ?? 0}
          onClose={() => setIsBookingOpen(false)}
          onConfirm={() => {
            // Ghi vao danh sach "Don hang cua toi". KHONG dong bang o day:
            // bang tu doi sang man hinh bao thanh cong, nguoi dung dong no
            // bang nut "Chuc ban may man!".
            createBooking({
              unitId: unit.publicId,
              unitCode: unit.code,
              projectName: unit.projectName,
              assignee: advisors[0]?.name,
            });
          }}
        />
      )}

      {isLoanOpen && (
        <UnitLoanCalculatorModal
          code={unit.code}
          // Lay gia FULL (da gom VAT + KPBT) lam gia tri bat dong san: do moi
          // la so tien nguoi mua thuc su phai lo, cung la so ngan hang dinh gia
          price={unit.fullVatPrice ?? unit.listedPrice ?? 0}
          onClose={() => setIsLoanOpen(false)}
        />
      )}

      {isShareOpen && (
        <UnitShareModal
        code={unit.code}
        projectName={unit.projectName}
        phaseName={unit.phaseName ?? "Đang cập nhật"}
        propertyTypeLabel={unit.propertyTypeLabel ?? "Đang cập nhật"}
        direction={unit.direction ?? "Đang cập nhật"}
        landArea={unit.landArea ?? 0}
        price={unit.fullVatPrice ?? unit.listedPrice ?? 0}
        image={unit.thumbnailUrls?.[0]}
        onClose={() => setIsShareOpen(false)}
        />
      )}
    </div>
  );
};

export default UnitModal;
