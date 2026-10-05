"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  FiCopy,
  FiDownload,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiMaximize,
  FiHeart,
  FiHome,
  FiZoomIn,
  FiZoomOut,
} from "react-icons/fi";

type UnitModalGalleryProps = {
  /** Danh sách URL ảnh. Có 1 ảnh -> chi hiển thị, có nhiều -> có dot + prev/next */
  images: string[];
  /** Alt cho ảnh lớn */
  alt?: string;
  /** Callback copy */
  onCopy?: () => void;
  /** Callback download */
  onDownload?: () => void;
  /** Nhan goc trai anh (VD: "STUDIO") - dung o bo cuc desktop */
  badge?: string;
  /** Anh lap day chieu cao cot thay vi giu ti le 4:5 (bo cuc desktop) */
  withThumbnails?: boolean;
  /** Da yeu thich - chi hien nut tim tren anh khi co onToggleFavorite */
  isFavorite?: boolean;
  /** Toggle yeu thich */
  onToggleFavorite?: () => void;
};

/**
 * Gallery ảnh của popup chi tiết căn.
 *
 * Layout theo mockup:
 * ```
 * ┌────────────────────────────────────────┐
 * │ [📋] [⬇]  ← top-right                    │
 * │                                          │
 * │            <ảnh lớn 4:5>                 │
 * │                                          │
 * │  < • • • • • • • > 3/5  ← bottom-center  │
 * └────────────────────────────────────────┘
 * ```
 */
/** Bao lau doi mot anh khi chay tu dong */
const AUTOPLAY_MS = 4000;

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 1.25;
const clampZoom = (value: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));

/**
 * Anh trong khung xem lon, phong to / thu nho duoc:
 * - Lan chuot, nut + / -, bam dup (1x <-> 2.5x).
 * - Da phong to thi keo de di chuyen; ve 1x thi tu can giua lai.
 * Doi anh thi noi goi dat lai `key` nen muc zoom ve 1x.
 */
const ZoomableImage = ({ src, alt }: { src: string; alt: string }) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: number; x: number; y: number; ox: number; oy: number } | null>(null);

  const applyZoom = useCallback((next: number) => {
    const value = clampZoom(next);
    setZoom(value);
    if (value === 1) setOffset({ x: 0, y: 0 });
  }, []);

  // Lan chuot: phai gan bang addEventListener passive:false moi chan duoc cuon trang
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return undefined;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      setZoom((current) => {
        const value = clampZoom(event.deltaY < 0 ? current * 1.15 : current / 1.15);
        if (value === 1) setOffset({ x: 0, y: 0 });
        return value;
      });
    };
    frame.addEventListener('wheel', onWheel, { passive: false });
    return () => frame.removeEventListener('wheel', onWheel);
  }, []);

  const onPointerDown = (event: React.PointerEvent) => {
    if (zoom <= 1) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY, ox: offset.x, oy: offset.y };
    setIsDragging(true);
  };
  const onPointerMove = (event: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    setOffset({ x: drag.ox + event.clientX - drag.x, y: drag.oy + event.clientY - drag.y });
  };
  const endDrag = () => {
    dragRef.current = null;
    setIsDragging(false);
  };

  const zoomButton =
    'flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-transparent';

  return (
    <>
      <div
        ref={frameRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={() => applyZoom(zoom > 1 ? 1 : 2.5)}
        className={`relative z-10 flex h-[86vh] w-[92vw] touch-none items-center justify-center select-none ${
          zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
        }`}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}
          className={`max-h-full max-w-full rounded-lg object-contain shadow-2xl ${
            isDragging ? '' : 'transition-transform duration-150 ease-out'
          }`}
        />
      </div>

      {/* Thanh zoom */}
      <div className="absolute bottom-16 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/20 bg-black/40 px-1.5 py-1 backdrop-blur max-md:bottom-20">
        <button
          type="button"
          onClick={() => applyZoom(zoom / ZOOM_STEP)}
          disabled={zoom <= MIN_ZOOM}
          aria-label="Thu nhỏ"
          title="Thu nhỏ"
          className={zoomButton}
        >
          <FiZoomOut className="h-4.5 w-4.5" />
        </button>
        <button
          type="button"
          onClick={() => applyZoom(1)}
          title="Về kích thước ban đầu"
          className="min-w-14 rounded-full px-2 py-1 text-center text-sm font-semibold text-white transition hover:bg-white/20"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          type="button"
          onClick={() => applyZoom(zoom * ZOOM_STEP)}
          disabled={zoom >= MAX_ZOOM}
          aria-label="Phóng to"
          title="Phóng to"
          className={zoomButton}
        >
          <FiZoomIn className="h-4.5 w-4.5" />
        </button>
      </div>
    </>
  );
};

const UnitModalGallery = ({
  images,
  alt = "Hình ảnh căn",
  onCopy,
  onDownload,
  badge,
  withThumbnails = false,
  isFavorite = false,
  onToggleFavorite,
}: UnitModalGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  // Ro chuot vao anh la dung chay - nguoi dung dang xem tam do
  const [isPaused, setIsPaused] = useState(false);
  // Bam vao anh -> mo khung xem anh lon (tron ven, khong bi cat)
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  /**
   * Phim tat khi dang xem anh lon: Esc dong, mui ten trai/phai doi anh.
   *
   * Bat o pha CAPTURE roi chan lan truyen: popup chi tiet can cung nghe phim
   * Esc tren document de tu dong: neu de no chay theo thi mot cu Esc se dong
   * luon ca popup, trong khi nguoi dung chi muon thoat khung xem anh.
   */
  useEffect(() => {
    if (!isViewerOpen) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (!["Escape", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      event.stopPropagation();

      if (event.key === "Escape") setIsViewerOpen(false);
      else if (event.key === "ArrowLeft")
        setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
      else setActiveIndex((prev) => (prev + 1) % images.length);
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [isViewerOpen, images.length]);

  /**
   * Tu chay vong tron.
   *
   * activeIndex nam trong danh sach phu thuoc nen moi lan doi anh (tu dong hay
   * do nguoi dung bam) dong ho deu duoc dat lai - bam xong khong bi nhay tiep
   * mot phat nua ngay sau do.
   */
  useEffect(() => {
    if (images.length < 2 || isPaused || isViewerOpen) return;

    const timer = setTimeout(
      () => setActiveIndex((prev) => (prev + 1) % images.length),
      AUTOPLAY_MS,
    );
    return () => clearTimeout(timer);
  }, [activeIndex, images.length, isPaused, isViewerOpen]);

  // Không có ảnh: hiển thị placeholder gradient
  if (!images.length) {
    return (
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-linear-to-br from-gray-100 to-gray-200 xl:aspect-auto xl:h-full xl:min-h-0">
        <div className="flex h-full items-center justify-center text-gray-400">
          Đang cập nhật hình ảnh
        </div>
      </div>
    );
  }

  const total = images.length;
  const current = images[activeIndex];
  const canNavigate = total > 1;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % total);
  };

  // Moi khuon kho deu mot ti le dung 4/5 chiem tron be ngang cot: anh phoi
  // canh von la anh dung, ep ngang di la cat mat phan tren duoi. Man hinh thap
  // khong lam anh be lai - cot ben trai cuon duoc, nguoi dung keo xuong.
  // Rieng dien thoai gioi han 58vh de anh khong an het mot man hinh.
  return (
    <>
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className={`relative w-full overflow-hidden rounded-xl bg-gray-100 ${
          withThumbnails
            ? "h-full min-h-0"
            : "aspect-[4/5] max-md:max-h-[58vh] xl:aspect-auto xl:h-full xl:min-h-0"
        }`}
      >
        {/* ── Ảnh lớn - bấm vào để xem trọn ảnh ────────────────── */}
        <button
          type="button"
          onClick={() => setIsViewerOpen(true)}
          aria-label="Xem ảnh lớn"
          title="Xem ảnh lớn"
          className="group relative block h-full w-full cursor-zoom-in"
        >
          {/* Anh hien TRON VEN (contain) - phieu tinh gia, bang bieu khong bi
              cat. Phan trong quanh anh (anh khac ti le khung) phu bang chinh
              anh do phong to + lam mo, nen khung luon kin mau theo anh. */}
          <img
            key={`bg-${current}`}
            src={current}
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-80 blur-xl"
            loading="lazy"
          />
          <img
            src={current}
            alt={alt}
            className="relative h-full w-full object-contain transition-all duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
          {/* Vien mo nhe + bieu tuong phong to: bao cho nguoi dung biet anh bam
              duoc, chi hien khi ro chuot len nen khong lam roi khung anh. */}
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/15 group-hover:opacity-100">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-lg backdrop-blur">
              <FiMaximize className="h-5 w-5" />
            </span>
          </span>
        </button>

        {/* ── Nhãn loại hình góc trái ──────────────────────────── */}
        {badge && (
          <span className="absolute left-3 top-3 flex items-center gap-2 rounded-full border border-white/30 bg-white/90 py-1.5 pl-1.5 pr-3.5 text-xs font-bold uppercase tracking-wide text-gray-800 shadow-sm backdrop-blur">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white">
              <FiHome className="h-3.5 w-3.5" />
            </span>
            {badge}
          </span>
        )}

      {/* ── Nút top-right: copy + tải về + yêu thích ───────────
          Chi hien khi duoc truyen handler, nen moi bo cuc tu chon lay cai
          minh can. Muon xem anh to thi bam thang vao anh. */}
        {(onCopy || onDownload || onToggleFavorite) && (
        <div className="absolute right-3 top-3 flex gap-2">
          <button
            type="button"
            onClick={onCopy}
            aria-label="Sao chép"
            title="Sao chép"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/90 text-gray-700 shadow-sm backdrop-blur transition hover:bg-white hover:text-brand-500"
          >
            <FiCopy className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDownload}
            aria-label="Tải xuống"
            title="Tải xuống"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/90 text-gray-700 shadow-sm backdrop-blur transition hover:bg-white hover:text-brand-500"
          >
            <FiDownload className="h-4 w-4" />
          </button>
          {onToggleFavorite && (
            <button
              type="button"
              onClick={onToggleFavorite}
              aria-label={isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
              title={isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
              className={`flex h-9 w-9 items-center justify-center rounded-full border border-white/30 shadow-sm backdrop-blur transition ${
                isFavorite
                  ? "bg-error-50 text-error-500 hover:bg-error-100"
                  : "bg-white/90 text-gray-700 hover:bg-white hover:text-error-500"
              }`}
            >
              <FiHeart className={`h-4 w-4 ${isFavorite ? "animate-heart-pop fill-current" : ""}`} />
            </button>
          )}
        </div>
        )}

        {/* ── Điều hướng ảnh ───────────────────────────────────
            Mot cum duy nhat cho MOI bo cuc: prev - dot - so dem - next, noi
            tren day anh. Bo cuc may tinh truoc day dung dai anh nho ben duoi
            (an mat mot khuc chieu cao cot) cung hai mui ten sat canh anh; gio
            anh chiem tron cot, dieu huong noi tren anh nen khong ton them cho
            nao. */}
        {canNavigate && (
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-3 xl:bottom-2 xl:gap-2">
            {/* Prev */}
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Ảnh trước"
              title="Ảnh trước"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/90 text-gray-700 shadow-sm backdrop-blur transition hover:bg-white hover:text-brand-500 xl:h-7 xl:w-7"
            >
              <FiChevronLeft className="h-4 w-4 xl:h-3.5 xl:w-3.5" />
            </button>

            {/* Dots */}
            <div className="flex max-w-[60%] items-center gap-1.5 overflow-hidden rounded-full border border-white/30 bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur xl:gap-1 xl:px-2 xl:py-1">
              {Array.from({ length: total }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Chuyển tới ảnh ${index + 1}`}
                  className={`h-1.5 rounded-full transition-all xl:h-1 ${
                    index === activeIndex
                      ? "w-5 bg-brand-500 xl:w-4"
                      : "w-1.5 bg-gray-300 hover:bg-gray-400 xl:w-1"
                  }`}
                />
              ))}
            </div>

            {/* Counter */}
            <span className="rounded-full border border-white/30 bg-white/90 px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur xl:px-2 xl:py-0.5 xl:text-[11px]">
              {activeIndex + 1}/{total}
            </span>

            {/* Next */}
            <button
              type="button"
              onClick={handleNext}
              aria-label="Ảnh tiếp"
              title="Ảnh tiếp"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/90 text-gray-700 shadow-sm backdrop-blur transition hover:bg-white hover:text-brand-500 xl:h-7 xl:w-7"
            >
              <FiChevronRight className="h-4 w-4 xl:h-3.5 xl:w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ── Khung xem ảnh lớn ────────────────────────────────────
          Nam de o z cao hon popup chi tiet can (z-50) de khong bi popup che.
          Anh de object-contain: xem tron ven ca tam, khong cat nhu o slide. */}
      {isViewerOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Xem ảnh lớn"
        >
          {/* Nen: chinh anh dang xem phong to, lam mo - phan trong quanh anh
              (anh khong vua ti le man hinh) mang mau cua anh thay vi den trơn */}
          <img
            key={`bg-${current}`}
            src={current}
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-70 blur-2xl"
          />
          <button
            type="button"
            aria-label="Đóng"
            onClick={() => setIsViewerOpen(false)}
            className="absolute inset-0 cursor-zoom-out bg-black/45"
          />

          <ZoomableImage key={current} src={current} alt={alt} />

          {/* Đóng */}
          <button
            type="button"
            onClick={() => setIsViewerOpen(false)}
            aria-label="Đóng"
            title="Đóng (Esc)"
            className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-white/25"
          >
            <FiX className="h-5 w-5" />
          </button>

          {canNavigate && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Ảnh trước"
                title="Ảnh trước (←)"
                className="absolute left-4 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-white/25 max-md:left-2"
              >
                <FiChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Ảnh tiếp"
                title="Ảnh tiếp (→)"
                className="absolute right-4 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-white/25 max-md:right-2"
              >
                <FiChevronRight className="h-6 w-6" />
              </button>

              <span className="absolute bottom-6 z-20 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur">
                {activeIndex + 1}/{total}
              </span>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default UnitModalGallery;
