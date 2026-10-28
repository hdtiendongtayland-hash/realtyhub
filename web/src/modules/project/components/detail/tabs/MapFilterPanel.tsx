"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import type { IconType } from "react-icons";
import {
  FiAward,
  FiBarChart2,
  FiCheck,
  FiChevronDown,
  FiColumns,
  FiCompass,
  FiDollarSign,
  FiKey,
  FiLayers,
  FiMap,
  FiMaximize,
  FiMaximize2,
  FiRefreshCw,
  FiSearch,
  FiSliders,
  FiX,
  FiArrowRight,
} from "react-icons/fi";
import { TbBuildingSkyscraper, TbRuler2 } from "react-icons/tb";
import RangeSliderField from "@/common/components/RangeSliderField";
import { UNIT_FUND_LABELS } from "../../../models/project-detail.model";

/**
 * Bang loc trong khung ban do (khi toan man hinh), du cac truong cua bo loc
 * ben ngoai nhung xep kieu "danh sach tieu chi":
 *  - Dau bang: tim ma can, thanh chon tinh trang, khoi gia & dien tich.
 *  - Moi tieu chi con lai la MOT dong (icon - ten - gia tri dang chon); bam
 *    vao dong thi sổ ra cac lua chon ngay ben duoi, mot luc chi mo mot dong.
 *  - Cac tieu chi dang loc hien thanh the nho co nut x de bo nhanh.
 * Keo thanh tieu de de di chuyen bang tren ban do.
 */

type Option = { value: string; label: string };

type FilterKey =
  | "code"
  | "status"
  | "phaseName"
  | "block"
  | "propertyType"
  | "direction"
  | "fund"
  | "unitPrice"
  | "buildHigh"
  | "buildLow"
  | "frontage"
  | "floorRange"
  | "unitLine"
  | "handover"
  | "floor";

type Range = [number | null, number | null];

type MapFilterPanelProps = {
  filters: Record<FilterKey, string>;
  onField: (key: FilterKey) => (value: string) => void;
  mode: "cao-tang" | "thap-tang" | "hon-hop";
  options: {
    phaseName: Option[];
    propertyType: Option[];
    direction: Option[];
    block: Option[];
    handover: Option[];
    unitLine: Option[];
    floorRange: Option[];
  };
  statusOptions: Option[];
  statusDotTones: Record<string, string>;
  ranges: { unitPrice: Option[]; build: Option[]; frontage: Option[] };
  lockedPhaseName?: string;
  /** Co thi dong "Phan khu" doi phan khu cua ban do (luon hien) */
  phaseSwitch?: { options: { value: string; label: string }[]; value: string; onChange: (value: string) => void; cards?: { value: string; label: string; image?: string }[]; onCardPick?: (value: string) => void };
  priceRange: Range;
  onPriceRange: (range: Range) => void;
  areaRange: Range;
  onAreaRange: (range: Range) => void;
  limits: { price: number; area: number };
  priceStep: number;
  priceScale: number;
  visibleCount: number;
  totalCount: number;
  activeCount: number;
  onClear: () => void;
  onClose: () => void;
  /**
   * "map" (mac dinh): the noi trong khung ban do (toan man hinh), keo di
   * chuyen duoc, co nut an. "sheet": ngan keo cap trang tu day man hinh len -
   * dung cho nut loc ben ngoai tren iPad / dien thoai.
   */
  variant?: "map" | "sheet";
  /** Dien thoai, ban do chua toan man hinh: thu nho toan bo noi dung bang loc */
  compact?: boolean;
};

type Row = { key: FilterKey; label: string; icon: IconType; options: Option[] };

const FUND_OPTIONS: Option[] = Object.entries(UNIT_FUND_LABELS).map(([value, label]) => ({ value, label }));

const formatNumber = (value: number, scale: number) =>
  (value / scale).toLocaleString("vi-VN", { maximumFractionDigits: 1 });

/** The khoang gia / dien tich: icon + ten, khoang dang chon ben phai, ray, moc hai dau */
const RangeLine = ({
  title,
  icon: Icon,
  unit,
  range,
  onRange,
  limit,
  step,
  scale,
  compact = false,
}: {
  title: string;
  icon: IconType;
  unit: string;
  range: Range;
  onRange: (range: Range) => void;
  limit: number;
  step: number;
  scale: number;
  /** Bo khung the va moc hai dau (dat chung mot the voi the khac) */
  compact?: boolean;
}) => (
  <div
    className={
      compact
        ? ""
        : "rounded-xl bg-white px-3 pt-2.5 pb-2 shadow-[0_6px_16px_-12px_rgba(15,111,209,0.45)] ring-1 ring-sky-100"
    }
  >
    <div className="mb-1.5 flex items-center gap-2">
      <Icon aria-hidden className="h-4 w-4 shrink-0 text-brand-600" />
      <span className="min-w-0 flex-1 text-theme-sm font-semibold text-navy-800">{title}</span>
      <span className="text-theme-sm font-bold text-brand-600">
        {formatNumber(range[0] ?? 0, scale)} - {formatNumber(range[1] ?? limit, scale)} {unit}
      </span>
    </div>
    <RangeSliderField
      label={title}
      variant="track"
      limit={limit}
      step={step}
      scale={scale}
      unit={unit}
      min={range[0]}
      max={range[1]}
      onChange={(min, max) => onRange([min, max])}
      format={(value) => `${formatNumber(value, scale)} ${unit}`}
    />
    <div className={`mt-0.5 flex justify-between text-[11px] text-gray-500 ${compact ? "hidden" : ""}`}>
      <span>0 {unit}</span>
      <span>
        {formatNumber(limit, scale)} {unit}
      </span>
    </div>
  </div>
);

/** Danh sach tren muc nay thi chuyen sang kieu gon (nhom ma + o so + tim) */
const LONG_LIST = 12;

/** "HÂ10" -> { prefix: "HÂ", rest: "10" }; "Trục 01" -> { prefix: "Trục", rest: "01" } */
const splitCode = (label: string) => {
  const match = label.match(/^(\D*?)\s*(\d[\w.,/-]*)$/);
  return match ? { prefix: match[1].trim(), rest: match[2] } : null;
};

/**
 * Bang lua chon cua mot tieu chi.
 * - Danh sach ngan: luoi 3 cot nhu thuong.
 * - Danh sach dai co dang "chu + so" (toa HÂ10, NT7, truc 01...): gom theo
 *   tien to thanh cac tab nho kem so luong, o chi ghi phan so -> 6 o mot hang.
 * - Danh sach dai khac: o tim + danh sach 2 cot, gioi han chieu cao, cuon.
 */
const OptionPicker = ({
  options,
  value,
  onPick,
  header,
}: {
  options: Option[];
  value: string;
  onPick: (value: string) => void;
  /** Noi dung them o dau bang chon (vd o go so tang) */
  header?: ReactNode;
}) => {
  const parsed = options.map((option) => ({ option, code: splitCode(option.label) }));
  const isCoded = options.length > LONG_LIST && parsed.every((item) => item.code);
  const prefixes = isCoded ? [...new Set(parsed.map((item) => item.code!.prefix))] : [];
  const valuePrefix = parsed.find((item) => item.option.value === value)?.code?.prefix;

  const [group, setGroup] = useState<string | null>(valuePrefix ?? prefixes[0] ?? null);
  const [query, setQuery] = useState("");

  const isLong = options.length > LONG_LIST;
  const q = query.trim().toLowerCase();
  const shown = parsed.filter(
    (item) =>
      (q ? item.option.label.toLowerCase().includes(q) : true) &&
      // Dang tim thi tim tren moi nhom; khong tim thi chi nhom dang chon
      (!isCoded || q || prefixes.length < 2 || item.code!.prefix === group),
  );

  const chipClass = (isActive: boolean) =>
    `flex min-w-0 items-center justify-center rounded-lg text-theme-xs transition ${
      isActive
        ? "bg-gradient-to-r from-brand-700 to-brand-500 font-semibold text-white shadow-sm"
        : "bg-white text-gray-600 ring-1 ring-sky-100 hover:text-brand-600 hover:ring-brand-200"
    }`;

  return (
    <div className="space-y-2 bg-brand-25 px-3 pt-1 pb-3">
      {header}
      {isLong && (
        <div className="flex items-center gap-2">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Tìm nhanh</span>
            <FiSearch
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Tìm trong ${options.length} mục`}
              className="h-8 w-full rounded-lg bg-white pr-2 pl-8 text-theme-xs text-gray-800 ring-1 ring-sky-100 outline-none placeholder:text-gray-400 focus:ring-brand-300"
            />
          </label>
          <button
            type="button"
            onClick={() => onPick("")}
            className={`h-8 shrink-0 rounded-lg px-2.5 text-theme-xs font-semibold transition ${
              value ? "bg-white text-gray-600 ring-1 ring-sky-100 hover:text-brand-600" : "bg-brand-600 text-white"
            }`}
          >
            Tất cả
          </button>
        </div>
      )}

      {/* Tab nhom ma (HÂ / NT / SB ...) */}
      {isCoded && prefixes.length > 1 && !q && (
        <div className="no-scrollbar -mx-3 flex gap-1 overflow-x-auto px-3">
          {prefixes.map((prefix) => {
            const count = parsed.filter((item) => item.code!.prefix === prefix).length;
            const isActive = prefix === group;
            const hasValue = prefix === valuePrefix;
            return (
              <button
                key={prefix}
                type="button"
                onClick={() => setGroup(prefix)}
                className={`relative inline-flex h-7 shrink-0 items-center gap-1 rounded-full px-2.5 text-theme-xs font-bold transition ${
                  isActive ? "bg-navy-800 text-white" : "bg-white text-navy-700 ring-1 ring-sky-100 hover:ring-brand-200"
                }`}
              >
                {prefix || "#"}
                <span className={`text-[10px] font-semibold ${isActive ? "text-sky-200" : "text-gray-400"}`}>{count}</span>
                {hasValue && !isActive && (
                  <span aria-hidden className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {isCoded ? (
        <div className="thin-scroll grid max-h-40 grid-cols-6 gap-1 overflow-y-auto">
          {shown.map(({ option, code }) => {
            const isActive = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onPick(option.value)}
                title={option.label}
                className={`${chipClass(isActive)} h-8 px-1 font-semibold tabular-nums`}
              >
                {/* Dang tim (tron nhieu nhom) thi ghi du ma cho khoi nham */}
                <span className="truncate">{q && prefixes.length > 1 ? option.label : code!.rest}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className={`grid gap-1.5 ${isLong ? "thin-scroll max-h-44 grid-cols-2 overflow-y-auto" : "grid-cols-3"}`}>
          {(isLong ? shown.map((item) => item.option) : [{ value: "", label: "Tất cả" }, ...options]).map((option) => {
            const isActive = option.value === value;
            return (
              <button
                key={option.value || "all"}
                type="button"
                onClick={() => onPick(option.value)}
                title={option.label}
                className={`${chipClass(isActive)} gap-1 px-1.5 py-1.5`}
              >
                <span className="truncate">{option.label}</span>
                {isActive && <FiCheck aria-hidden className="h-3.5 w-3.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}

      {isLong && shown.length === 0 && (
        <p className="py-2 text-center text-theme-xs text-gray-400">Không có mục khớp “{query}”</p>
      )}
    </div>
  );
};

const MapFilterPanel = ({
  filters,
  onField,
  mode,
  options,
  statusOptions,
  ranges,
  lockedPhaseName,
  phaseSwitch,
  priceRange,
  onPriceRange,
  areaRange,
  onAreaRange,
  limits,
  priceStep,
  priceScale,
  visibleCount,
  totalCount,
  activeCount,
  onClear,
  onClose,
  variant = "map",
  compact = false,
}: MapFilterPanelProps) => {
  const isSheet = variant === "sheet";
  const isHigh = mode !== "thap-tang";
  const isLow = mode !== "cao-tang";
  const [openRow, setOpenRow] = useState<FilterKey | null>(null);
  // Nut "An" tren thanh tieu de: thu bang lai chi con thanh tieu de (dien
  // thoai giu them nut xem) de nhin ban do phia sau; bam lai de mo
  const [isCollapsed, setIsCollapsed] = useState(false);

  // ── Keo tieu de de di chuyen bang (khong cho ra ngoai khung ban do) ──
  const panelRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{
    startX: number;
    startY: number;
    base: { x: number; y: number };
    bounds: { minX: number; maxX: number; minY: number; maxY: number };
  } | null>(null);

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return;
    if (isSheet) return;
    if (window.matchMedia("(max-width: 639.98px)").matches) return;
    const panel = panelRef.current;
    const parent = panel?.offsetParent as HTMLElement | null;
    if (!panel || !parent) return;
    const p = parent.getBoundingClientRect();
    const r = panel.getBoundingClientRect();
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      base: offset,
      bounds: {
        minX: offset.x - (r.left - p.left) + 8,
        maxX: offset.x + (p.right - r.right) - 8,
        minY: offset.y - (r.top - p.top) + 8,
        maxY: offset.y + (p.bottom - r.bottom) - 8,
      },
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const moveDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const clamp = (value: number, low: number, high: number) => Math.min(Math.max(value, low), Math.max(low, high));
    setOffset({
      x: clamp(drag.base.x + event.clientX - drag.startX, drag.bounds.minX, drag.bounds.maxX),
      y: clamp(drag.base.y + event.clientY - drag.startY, drag.bounds.minY, drag.bounds.maxY),
    });
  };
  const endDrag = () => {
    dragRef.current = null;
  };

  // Bam ra ngoai bang (ban do, nut khac...) thi dong bang loc. Bo qua nut mo
  // bang (no tu bat / tat) va ngan keo cap trang (co nen rieng).
  useEffect(() => {
    if (isSheet || isCollapsed) return undefined;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!target || panelRef.current?.contains(target)) return;
      // Lop nen tu dong bang khi bam xong (click) - dong ngay luc cham xuong thi
      // cu click sau do roi trung nut ben duoi (VD nut loc, mo lai bang)
      if (target.closest("[data-filter-toggle], [data-filter-backdrop]")) return;
      onClose();
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [isSheet, isCollapsed, onClose]);

  // ── Dien thoai: keo vien "Bo loc" (dang an) di cho khac tren ban do ──
  const pillRef = useRef<HTMLDivElement>(null);
  const [pillOffset, setPillOffset] = useState({ x: 0, y: 0 });
  const pillMovedRef = useRef(false);
  const pillDragRef = useRef<{
    startX: number;
    startY: number;
    base: { x: number; y: number };
    bounds: { minX: number; maxX: number; minY: number; maxY: number };
  } | null>(null);

  const startPillDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const pill = pillRef.current;
    const parent = pill?.offsetParent as HTMLElement | null;
    if (!pill || !parent) return;
    const p = parent.getBoundingClientRect();
    const r = pill.getBoundingClientRect();
    pillMovedRef.current = false;
    pillDragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      base: pillOffset,
      bounds: {
        minX: pillOffset.x - (r.left - p.left) + 6,
        maxX: pillOffset.x + (p.right - r.right) - 6,
        minY: pillOffset.y - (r.top - p.top) + 6,
        maxY: pillOffset.y + (p.bottom - r.bottom) - 6,
      },
    };
    // Nghe tren window: ngon tay ra khoi vien van keo tiep (khong dung pointer
    // capture vi capture lam mat su kien click cua nut ben trong)
    const onMove = (moveEvent: PointerEvent) => movePillDrag(moveEvent);
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      endPillDrag();
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };
  const movePillDrag = (event: { clientX: number; clientY: number }) => {
    const drag = pillDragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    // Nhuc nhich duoi 6px van tinh la bam
    if (!pillMovedRef.current && Math.hypot(dx, dy) < 6) return;
    pillMovedRef.current = true;
    const clamp = (value: number, low: number, high: number) => Math.min(Math.max(value, low), Math.max(low, high));
    setPillOffset({
      x: clamp(drag.base.x + dx, drag.bounds.minX, drag.bounds.maxX),
      y: clamp(drag.base.y + dy, drag.bounds.minY, drag.bounds.maxY),
    });
  };
  const endPillDrag = () => {
    pillDragRef.current = null;
    // Cho su kien click (neu co) doc co "vua keo" truoc khi xoa
    window.setTimeout(() => {
      pillMovedRef.current = false;
    }, 0);
  };

  // Du cac truong cua bo loc ngoai (tru ma can / tinh trang / gia / dien tich
  // da nam o dau bang); truong khong co du lieu thi an
  const rows = (
    [
      phaseSwitch && phaseSwitch.options.length > 0
        ? { key: "phaseName", label: "Phân khu", icon: FiMap, options: phaseSwitch.options }
        : !lockedPhaseName && options.phaseName.length > 1 && { key: "phaseName", label: "Phân khu", icon: FiMap, options: options.phaseName },
      {
        key: "block",
        label: mode === "cao-tang" ? "Tòa nhà" : mode === "thap-tang" ? "Tiểu khu/Dãy" : "Tòa nhà/Dãy",
        icon: TbBuildingSkyscraper,
        options: options.block,
      },
      { key: "propertyType", label: mode === "cao-tang" ? "Loại căn" : "Loại hình", icon: FiLayers, options: options.propertyType },
      { key: "direction", label: "Hướng", icon: FiCompass, options: options.direction },
      isHigh && { key: "fund", label: "Quỹ bán", icon: FiAward, options: FUND_OPTIONS },
      isHigh && { key: "floorRange", label: "Khoảng tầng", icon: FiBarChart2, options: options.floorRange },
      isHigh && { key: "unitLine", label: "Trục", icon: FiColumns, options: options.unitLine },
      { key: "unitPrice", label: "Đơn giá", icon: FiDollarSign, options: ranges.unitPrice },
      isHigh && { key: "buildHigh", label: "DT tim tường", icon: FiMaximize, options: ranges.build },
      isLow && { key: "buildLow", label: "DT xây dựng", icon: FiMaximize2, options: ranges.build },
      isLow && { key: "frontage", label: "Mặt tiền", icon: TbRuler2, options: ranges.frontage },
      isLow && { key: "handover", label: "Tiêu chuẩn bàn giao", icon: FiKey, options: options.handover },
    ].filter((row) => row && row.options.length > 0) as Row[]
  );

  const labelOf = (row: Row, value: string) => row.options.find((option) => option.value === value)?.label ?? value;

  /** Chu hien cho mot dong: "Khoang tang" uu tien so tang go tay ("Tang 15") */
  /** Gia tri dang chon cua mot dong (Phan khu lay tu ban do neu doi duoc) */
  const valueOf = (row: Row) => (row.key === "phaseName" && phaseSwitch ? phaseSwitch.value : filters[row.key]);

  const shownOf = (row: Row) => {
    if (row.key === "floorRange" && filters.floor) return `Tầng ${filters.floor}`;
    const value = valueOf(row);
    return value ? labelOf(row, value) : "";
  };

  /** Chon mot lua chon; chon khoang tang thi bo so tang (chon tu dai tang) */
  const pick = (row: Row, next: string) => {
    if (row.key === "phaseName" && phaseSwitch) {
      phaseSwitch.onChange(next);
      setOpenRow(null);
      return;
    }
    onField(row.key)(next);
    if (row.key === "floorRange") onField("floor")("");
    setOpenRow(null);
  };


  // The cac tieu chi dang loc (bo nhanh bang nut x)
  const tags: { id: string; text: string; remove: () => void }[] = [
    ...(filters.code ? [{ id: "code", text: `Mã: ${filters.code}`, remove: () => onField("code")("") }] : []),
    ...(filters.status
      ? [
          {
            id: "status",
            text: statusOptions.find((option) => option.value === filters.status)?.label ?? filters.status,
            remove: () => onField("status")(""),
          },
        ]
      : []),
    ...(priceRange.some((value) => value !== null)
      ? [
          {
            id: "price",
            text: `${formatNumber(priceRange[0] ?? 0, priceScale)}–${formatNumber(priceRange[1] ?? limits.price, priceScale)} tỷ`,
            remove: () => onPriceRange([null, null]),
          },
        ]
      : []),
    ...(areaRange.some((value) => value !== null)
      ? [
          {
            id: "area",
            text: `${areaRange[0] ?? 0}–${areaRange[1] ?? limits.area} m²`,
            remove: () => onAreaRange([null, null]),
          },
        ]
      : []),
    ...(filters.floor ? [{ id: "floor", text: `Tầng ${filters.floor}`, remove: () => onField("floor")("") }] : []),
    ...rows
      .filter((row) => valueOf(row))
      .map((row) => ({ id: row.key, text: labelOf(row, valueOf(row)), remove: () => pick(row, "") })),
  ];

  return (
    <>
      {/* Cham ra ngoai bang thi dong bang loc. Lop nen nay chan ca anh toan canh
          360 (iframe trang khac - trang minh khong nhan duoc cham ben trong);
          dien thoai co nen toi, may lon trong suot */}
      {!isSheet && !isCollapsed && (
        <div aria-hidden data-filter-backdrop onClick={onClose} className="absolute inset-0 z-[999] bg-navy-900/30 sm:bg-transparent" />
      )}
      {/* Dien thoai, dang an: chi con mot vien noi nho o canh duoi ban do */}
      {!isSheet && isCollapsed && (
        <div
          ref={pillRef}
          onPointerDown={startPillDrag}
          style={{ transform: `translate(calc(-50% + ${pillOffset.x}px), ${pillOffset.y}px)` }}
          className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-[1000] flex touch-none items-center rounded-full bg-gradient-to-r from-navy-800 via-brand-700 to-brand-500 p-1 text-white shadow-[0_14px_30px_-10px_rgba(8,24,50,0.7)] ring-1 ring-white/30 select-none sm:hidden"
        >
          <button
            type="button"
            onClick={() => {
              // Vua keo vien di cho khac thi khong tinh la bam mo
              if (pillMovedRef.current) return;
              setIsCollapsed(false);
            }}
            aria-label="Hiện bộ lọc"
            className="flex items-center gap-2 rounded-full py-1.5 pr-2 pl-3 text-theme-sm font-semibold whitespace-nowrap"
          >
            <FiSliders aria-hidden className="h-4 w-4" />
            Bộ lọc
            {activeCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[11px] font-bold text-brand-700">
                {activeCount}
              </span>
            )}
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-theme-xs tabular-nums">
              {visibleCount}/{totalCount} căn
            </span>
            <FiChevronDown aria-hidden className="h-4 w-4 rotate-180" />
          </button>
          <span aria-hidden className="h-5 w-px bg-white/25" />
          <button
            type="button"
            onClick={() => {
              if (pillMovedRef.current) return;
              onClose();
            }}
            aria-label="Đóng bộ lọc"
            className="flex h-8 w-8 items-center justify-center rounded-full transition active:bg-white/15"
          >
            <FiX aria-hidden className="h-4 w-4" />
          </button>
        </div>
      )}
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Bộ lọc quỹ căn"
      aria-modal={isSheet || undefined}
      style={isSheet ? undefined : { transform: `translate(${offset.x}px, ${offset.y}px)` }}
      className={
        isSheet
          ? // Ngan keo cap trang: dien thoai rong het, iPad can giua rong toi da 560px
            "animate-sheet-up fixed inset-x-6 top-[max(4.5rem,env(safe-area-inset-top))] bottom-[max(4.5rem,env(safe-area-inset-bottom))] z-[1001] mx-auto flex flex-col overflow-hidden rounded-3xl bg-white shadow-[0_24px_60px_-18px_rgba(8,24,50,0.6)] ring-1 ring-sky-100 sm:inset-x-0 sm:top-auto sm:bottom-0 sm:max-h-[82dvh] sm:w-full sm:max-w-[560px] sm:rounded-b-none sm:bg-[#eef5ff] sm:ring-white/60"
          : `${isCollapsed ? "max-sm:hidden" : ""} ${compact ? "max-sm:[zoom:0.86]" : ""} absolute inset-x-6 inset-y-16 z-[1000] flex flex-col overflow-hidden rounded-3xl bg-white shadow-[0_24px_60px_-18px_rgba(8,24,50,0.6)] ring-1 ring-sky-100 sm:inset-x-auto sm:bg-[#eef5ff] sm:ring-white/60 sm:top-3 sm:right-15 sm:bottom-auto sm:max-h-[min(calc(100%-1.5rem),820px)] sm:w-[min(380px,calc(100%-5.5rem))] sm:rounded-2xl sm:shadow-[0_28px_60px_-22px_rgba(8,24,50,0.6)]`
      }
    >
      {/* Tieu de (tay cam keo): nen chuyen navy -> xanh */}
      <div
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={`relative flex touch-none items-center gap-2.5 bg-gradient-to-r from-navy-800 via-brand-700 to-brand-500 px-3.5 pt-4 pb-3 text-white select-none max-sm:border-b max-sm:border-sky-100 max-sm:bg-none max-sm:bg-white max-sm:px-4 max-sm:pt-3.5 max-sm:text-navy-800 ${isSheet ? "" : "sm:cursor-grab sm:pt-3 sm:active:cursor-grabbing"}`}
      >
        {/* Vach keo cua ngan keo (chi dien thoai) */}
        <span aria-hidden className={`absolute top-1.5 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-white/40 max-sm:hidden ${isSheet ? "" : "sm:hidden"}`} />
        <span className="flex shrink-0 items-center justify-center max-sm:h-8 max-sm:w-8 max-sm:rounded-lg max-sm:bg-gradient-to-br max-sm:from-sky-400 max-sm:to-brand-600 max-sm:text-white">
          <FiSliders aria-hidden className="h-4.5 w-4.5 max-sm:h-4 max-sm:w-4" />
        </span>
        <p className="min-w-0 flex-1 truncate text-base font-bold whitespace-nowrap max-sm:text-theme-sm">
          <span className="sm:hidden">Lọc</span>
          <span className="max-sm:hidden">Lọc quỹ căn</span>
        </p>
        <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-theme-xs font-semibold tabular-nums ring-1 ring-white/25 max-sm:bg-brand-50 max-sm:text-brand-700 max-sm:ring-brand-100">
          {visibleCount}/{totalCount}
        </span>
        {!isSheet && (
        <button
          type="button"
          onClick={() => setIsCollapsed((value) => !value)}
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? "Hiện bộ lọc" : "Ẩn bộ lọc"}
          title={isCollapsed ? "Hiện bộ lọc" : "Ẩn bộ lọc"}
          className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/15 max-sm:text-gray-500 max-sm:hover:bg-gray-100 sm:h-7 sm:w-7"
        >
          {/* Dien thoai (ngan keo duoi): mui ten xuong = ha xuong; may tinh /
              iPad (the tren): mui ten len = thu len */}
          <FiChevronDown
            aria-hidden
            className={`h-4.5 w-4.5 transition-transform ${isCollapsed ? "rotate-180 sm:rotate-0" : "sm:rotate-180"}`}
          />
        </button>
        )}
        <button
          type="button"
          onClick={onClear}
          disabled={activeCount === 0}
          aria-label="Đặt lại bộ lọc"
          title="Đặt lại"
          className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/15 max-sm:text-gray-500 max-sm:hover:bg-gray-100 disabled:opacity-40 sm:h-7 sm:w-7"
        >
          <FiRefreshCw aria-hidden className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng bộ lọc"
          className="-mr-1 flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/15 max-sm:text-gray-500 max-sm:hover:bg-gray-100 sm:h-7 sm:w-7"
        >
          <FiX aria-hidden className="h-4 w-4" />
        </button>
      </div>

      <div className={`thin-scroll flex-1 space-y-2.5 overflow-y-auto overscroll-contain py-3 pr-1.5 pl-3 ${isCollapsed ? "hidden" : ""}`}>
        <RangeLine
          title="Khoảng giá"
          icon={FiDollarSign}
          unit="tỷ"
          range={priceRange}
          onRange={onPriceRange}
          limit={limits.price}
          step={priceStep}
          scale={priceScale}
        />
        <RangeLine
          title={mode === "cao-tang" ? "DT thông thủy" : mode === "thap-tang" ? "Diện tích đất" : "Diện tích"}
          icon={FiMaximize}
          unit="m²"
          range={areaRange}
          onRange={onAreaRange}
          limit={limits.area}
          step={5}
          scale={1}
        />

        {/* Tieu chi dang loc */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 rounded-full bg-white py-1 pr-1 pl-2.5 text-[11px] font-semibold text-brand-700 ring-1 ring-brand-200"
              >
                {tag.text}
                <button
                  type="button"
                  onClick={tag.remove}
                  aria-label={`Bỏ lọc ${tag.text}`}
                  className="flex h-4 w-4 items-center justify-center rounded-full text-brand-400 transition hover:bg-brand-50 hover:text-brand-700"
                >
                  <FiX aria-hidden className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Danh sach tieu chi trong the trang: bam dong de so lua chon */}
        <ul className="divide-y divide-sky-50 overflow-hidden rounded-xl bg-white shadow-[0_6px_16px_-12px_rgba(15,111,209,0.45)] ring-1 ring-sky-100">
          {rows.map((row) => {
            const value = shownOf(row);
            const isOpen = openRow === row.key;
            return (
              <li key={row.key}>
                <button
                  type="button"
                  onClick={() => setOpenRow(isOpen ? null : row.key)}
                  aria-expanded={isOpen}
                  className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition hover:bg-brand-25 ${
                    isOpen ? "bg-brand-25" : ""
                  }`}
                >
                  <row.icon aria-hidden className={`h-4 w-4 shrink-0 ${value ? "text-brand-600" : "text-navy-600"}`} />
                  <span
                    className={`min-w-0 flex-1 text-theme-sm ${isOpen || value ? "font-bold text-navy-800" : "font-medium text-gray-700"}`}
                  >
                    {row.label}
                  </span>
                  <span
                    className={`max-w-[45%] truncate text-theme-xs font-semibold ${
                      value ? "rounded-full bg-brand-50 px-2 py-0.5 text-brand-700" : "text-gray-400"
                    }`}
                  >
                    {value || "Tất cả"}
                  </span>
                  <FiChevronDown
                    aria-hidden
                    className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && (
                  <OptionPicker
                    options={row.options}
                    value={valueOf(row)}
                    onPick={(next) => pick(row, next)}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className={`px-3 pt-1 pb-[max(0.75rem,env(safe-area-inset-bottom))] max-sm:border-t max-sm:border-sky-100 max-sm:pt-2.5 ${isCollapsed ? "hidden" : ""}`}>
        <button
          type="button"
          onClick={onClose}
          className="flex h-11 w-full items-center gap-2.5 rounded-xl bg-gradient-to-r from-navy-800 via-brand-700 to-brand-500 px-4 text-theme-sm font-semibold text-white shadow-[0_12px_24px_-12px_rgba(11,33,67,0.8)] transition hover:brightness-110"
        >
          <FiSearch aria-hidden className="h-4 w-4" />
          <span className="flex-1 text-left">Xem trên bản đồ</span>
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-theme-xs tabular-nums">{visibleCount} căn</span>
          <FiArrowRight aria-hidden className="h-4 w-4" />
        </button>
      </div>
    </div>
    </>
  );
};

export default MapFilterPanel;
