"use client";

import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import {
  FiCheck,
  FiChevronDown,
  FiEye,
  FiEyeOff,
  FiFilter,
  FiLayers,
  FiMaximize,
  FiMinimize,
  FiMinus,
  FiPlus,
  FiSearch,
  FiX,
} from "react-icons/fi";
import { formatBillion, formatBillionShort } from "@/common/utils/format";
import MapFilterPanel from "./MapFilterPanel";
import {
  FLOOR_RANGE_OPTIONS,
  DIRECTION_FILTER_OPTIONS,
  matchesDirection,
  matchesFloorRange,
  UNIT_FUND_LABELS,
  UNIT_STATUS_LABELS,
  type MasterPlanMap,
  type PlanMarker,
  type UnitFundType,
} from "../../../models/project-detail.model";

const FUND_TYPES = Object.keys(UNIT_FUND_LABELS) as UnitFundType[];

/** Mau cham trong chu thich - phai khop bien --pin cua .plan-pin--* */
const FUND_DOT_TONES: Record<UnitFundType, string> = {
  "doc-quyen": "text-error-600",
  "an-cheo": "text-[#b45309]",
  thuong: "text-success-500",
};

/** Chuoi tu mock la an toan, nhung popup ghep bang HTML tho nen van phai thoat */
const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ] ?? char,
  );

/** Icon "tim kiem bang AI": kinh lup kem tia sang */
const AiSearchIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" className={className}>
    <path
      fillRule="evenodd"
      d="m17.998 11.181-.243.445c-.759 1.387-2.751 1.387-3.51 0l-.75-1.371-1.37-.75c-1.388-.759-1.388-2.751 0-3.51l1.37-.75.75-1.37c.759-1.388 2.751-1.388 3.51 0l.75 1.37 1.37.75c1.388.759 1.388 2.75.001 3.51l-1.371.75zM16 4.834l-.459.839-.572 1.046-1.885 1.031 1.885 1.031L16 10.666l1.031-1.885 1.885-1.03-1.885-1.032z"
    />
    <path d="M11 18a7 7 0 0 0 6.046-3.47 3.94 3.94 0 0 0 2.463-1.944l.46-.842a8.96 8.96 0 0 1-1.937 4.874l3.675 3.675a1 1 0 0 1-1.414 1.414l-3.675-3.675A9 9 0 1 1 12.97 2.217q-.27.313-.48.698l-.47.857-.457.25A7 7 0 1 0 11 18m9.125-15.486a.4.4 0 0 1 .75 0l.101.273a.4.4 0 0 0 .237.237l.273.1a.4.4 0 0 1 0 .751l-.273.101a.4.4 0 0 0-.237.237l-.1.273a.4.4 0 0 1-.751 0l-.101-.273a.4.4 0 0 0-.237-.237l-.273-.1a.4.4 0 0 1 0-.751l.273-.101a.4.4 0 0 0 .237-.237l.1-.273Z" />
  </svg>
);

const MapButton = ({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 shadow-card transition hover:border-brand-400 hover:text-brand-600 sm:h-9 sm:w-9"
  >
    {children}
  </button>
);

type FloorPlanTabProps = {
  planMap: MasterPlanMap;
  lockedPhaseName?: string;
  /**
   * Co truyen thi bam pin goi ham nay (VD mo popup chi tiet can) thay cho
   * bong thong tin nho; thong tin tom tat chuyen sang hien khi ro chuot.
   */
  onMarkerClick?: (marker: PlanMarker) => void;
  /**
   * Co truyen thi bam dup pin goi ham nay (VD bang truc can) va tat zoom khi
   * bam dup ban do. Bam don duoc hoan 250ms de phan biet voi bam dup.
   */
  onMarkerDoubleClick?: (marker: PlanMarker) => void;
  /** false: an dong tieu de "Vi tri quy can" (noi goi da co thanh chon rieng) */
  showTitle?: boolean;
  /**
   * Nut them dat TRONG khung ban do, tren cung cot dieu khien goc PHAI (VD
   * nut gat 3D / 2D) - de khong de len cac nut co san.
   */
  controlsSlot?: React.ReactNode;
  /**
   * Phan tu de dat nut "Bo loc" vao (VD cuoi hang nut phan khu). Bo trong
   * thi nut nam tren dau ban do.
   */
  filterSlot?: HTMLElement | null;
  /**
   * Khoa (publicId hoac slug) cua phan khu / du an dang xem - de nut "Yeu
   * thich" trong khung ban do biet dang like cai gi. Khi khong co, nut an.
   */
  favoritesKey?: string;
  /** Doi phan khu ngay trong bang loc (value "" = tong the du an) */
  phaseSwitch?: { options: { value: string; label: string }[]; value: string; onChange: (value: string) => void; cards?: { value: string; label: string; image?: string }[]; onCardPick?: (value: string) => void };
  /** Co thi phu trang nay (VD tham quan 360) len khung ban do - giu nguyen cac nut */
  overlayUrl?: string;
};

/** Mot khoang lua chon cho bo loc: [min, max) */
type RangeOption = { value: string; label: string; min: number; max: number };

const BILLION = 1_000_000_000;
const MILLION = 1_000_000;

const PRICE_RANGES: RangeOption[] = [
  { value: 'duoi-3', label: 'Dưới 3 tỷ', min: 0, max: 3 * BILLION },
  { value: '3-5', label: '3 - 5 tỷ', min: 3 * BILLION, max: 5 * BILLION },
  { value: '5-10', label: '5 - 10 tỷ', min: 5 * BILLION, max: 10 * BILLION },
  { value: '10-20', label: '10 - 20 tỷ', min: 10 * BILLION, max: 20 * BILLION },
  { value: 'tren-20', label: 'Trên 20 tỷ', min: 20 * BILLION, max: Infinity },
];

const UNIT_PRICE_RANGES: RangeOption[] = [
  { value: 'duoi-50', label: 'Dưới 50 triệu/m²', min: 0, max: 50 * MILLION },
  { value: '50-80', label: '50 - 80 triệu/m²', min: 50 * MILLION, max: 80 * MILLION },
  { value: '80-120', label: '80 - 120 triệu/m²', min: 80 * MILLION, max: 120 * MILLION },
  { value: 'tren-120', label: 'Trên 120 triệu/m²', min: 120 * MILLION, max: Infinity },
];

/** DT tim tuong (can ho) / DT xay dung (nha thap tang - san nhieu tang nen lon hon) */
const BUILD_AREA_RANGES: RangeOption[] = [
  { value: 'duoi-80', label: 'Dưới 80 m²', min: 0, max: 80 },
  { value: '80-120', label: '80 - 120 m²', min: 80, max: 120 },
  { value: '120-200', label: '120 - 200 m²', min: 120, max: 200 },
  { value: '200-350', label: '200 - 350 m²', min: 200, max: 350 },
  { value: 'tren-350', label: 'Trên 350 m²', min: 350, max: Infinity },
];

const AREA_RANGES: RangeOption[] = [
  { value: 'duoi-50', label: 'Dưới 50 m²', min: 0, max: 50 },
  { value: '50-80', label: '50 - 80 m²', min: 50, max: 80 },
  { value: '80-120', label: '80 - 120 m²', min: 80, max: 120 },
  { value: '120-200', label: '120 - 200 m²', min: 120, max: 200 },
  { value: 'tren-200', label: 'Trên 200 m²', min: 200, max: Infinity },
];

/** Gia tri nam trong khoang dang chon? Khong chon / thieu so lieu xu ly rieng */
const inRange = (value: number | undefined, ranges: RangeOption[], selected: string) => {
  if (!selected) return true;
  const range = ranges.find((item) => item.value === selected);
  if (!range || value === undefined) return false;
  return value >= range.min && value < range.max;
};

/** Mat tien (m) - chi nha thap tang */
const FRONTAGE_RANGES: RangeOption[] = [
  { value: 'duoi-5', label: 'Dưới 5 m', min: 0, max: 5 },
  { value: '5-7', label: '5 - 7 m', min: 5, max: 7 },
  { value: '7-10', label: '7 - 10 m', min: 7, max: 10 },
  { value: 'tren-10', label: 'Trên 10 m', min: 10, max: Infinity },
];

type MapFilters = {
  code: string;
  status: string;
  phaseName: string;
  block: string;
  propertyType: string;
  direction: string;
  fund: string;
  price: string;
  unitPrice: string;
  /** DT thong thuy - can ho */
  areaHigh: string;
  /** DT tim tuong - can ho */
  buildHigh: string;
  /** DT dat - nha thap tang */
  areaLow: string;
  /** DT xay dung - nha thap tang */
  buildLow: string;
  frontage: string;
  floorRange: string;
  unitLine: string;
  handover: string;
  /** So tang cu the (go tay), vd "15" */
  floor: string;
};

const EMPTY_FILTERS: MapFilters = {
  code: '',
  status: '',
  phaseName: '',
  block: '',
  propertyType: '',
  direction: '',
  fund: '',
  price: '',
  unitPrice: '',
  areaHigh: '',
  buildHigh: '',
  areaLow: '',
  buildLow: '',
  frontage: '',
  floorRange: '',
  unitLine: '',
  handover: '',
  floor: '',
};

/**
 * Loai bo loc theo du lieu tren ban do:
 * - 'cao-tang': chi can ho  -> bo loc kieu bang hang can ho (tang, truc...)
 * - 'thap-tang': chi nha dat -> bo loc nha dat (mat tien, ban giao...)
 * - 'hon-hop': co ca hai    -> gop ca hai, o trung nhau chi hien mot lan
 */
type FilterMode = 'cao-tang' | 'thap-tang' | 'hon-hop';

/** Cac gia tri co that tren pin (bo trong / trung), sap theo tieng Viet */
const facet = (values: (string | undefined)[]) =>
  [...new Set(values.filter((value): value is string => Boolean(value)))].sort((a, b) =>
    a.localeCompare(b, 'vi', { numeric: true }),
  );

/** O chon trong bang loc: nhan in hoa nho tren, o chon bo goc duoi */
const FilterField = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) => (
  <label className="block min-w-0">
    <span className="mb-1.5 block text-[11px] font-semibold tracking-wide text-gray-600 uppercase">
      {label}
    </span>
    <span className="relative block">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`h-11 w-full appearance-none truncate rounded-lg border bg-white pr-9 pl-3 text-theme-sm outline-none transition focus:border-brand-400 focus:shadow-focus-ring ${
          value ? 'border-brand-300 text-gray-900' : 'border-gray-200 text-gray-400'
        }`}
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="text-gray-900">
            {option.label}
          </option>
        ))}
      </select>
      <FiChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400"
      />
    </span>
  </label>
);

/** O go ma can - cung kieu voi FilterField */
const FilterTextField = ({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <label className="block min-w-0">
    <span className="mb-1.5 block text-[11px] font-semibold tracking-wide text-gray-600 uppercase">
      {label}
    </span>
    <span className="relative block">
      <FiSearch
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`h-11 w-full rounded-lg border bg-white pr-3 pl-9 text-theme-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-brand-400 focus:shadow-focus-ring ${
          value ? 'border-brand-300' : 'border-gray-200'
        }`}
      />
    </span>
  </label>
);

/** Mau cham cua tung tinh trang trong bang loc nhanh */
const STATUS_DOT_TONES: Record<string, string> = {
  "con-hang": "bg-success-500",
  "giu-cho": "bg-amber-400",
  "da-ban": "bg-gray-400",
};

/** Cho bam lan hai trong khoang nay thi tinh la bam dup */
const DOUBLE_CLICK_WINDOW_MS = 250;

const FloorPlanTab = ({
  planMap,
  lockedPhaseName,
  onMarkerClick,
  onMarkerDoubleClick,
  showTitle = true,
  controlsSlot,
  filterSlot,
  phaseSwitch,
  overlayUrl,
}: FloorPlanTabProps) => {
  // Ham cua cha doi moi lan render: giu qua ref de khoi ve lai toan bo pin
  const markerClickRef = useRef(onMarkerClick);
  const markerDoubleClickRef = useRef(onMarkerDoubleClick);
  useEffect(() => {
    markerClickRef.current = onMarkerClick;
    markerDoubleClickRef.current = onMarkerDoubleClick;
  });
  const hasMarkerClick = Boolean(onMarkerClick);
  const hasMarkerDoubleClick = Boolean(onMarkerDoubleClick);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const [isMapReady, setIsMapReady] = useState(false);
  const [canFullscreen, setCanFullscreen] = useState(false);
  // Nut loc + bang loc nhanh trong khung ban do CHI hien khi toan man hinh -
  // luc do nut "Bo loc" ben ngoai bi che; binh thuong da co nut ben ngoai
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isQuickFilterOpen, setIsQuickFilterOpen] = useState(false);
  // Nut "^" giua tren: an moi nut dieu khien, chi chua nut toan man hinh
  const [areControlsHidden, setAreControlsHidden] = useState(false);
  // Nut "v" tren dai the phan khu o day ban do: an / hien dai the
  const [isPhaseStripOpen, setIsPhaseStripOpen] = useState(true);
  // iPad / dien thoai: nut loc ben ngoai mo ngan keo gon tu day man hinh thay
  // cho form 13 o day ban do xuong duoi
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  // Ngan keo mo: khoa cuon trang phia sau, Esc de dong
  useEffect(() => {
    if (!isFilterSheetOpen) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsFilterSheetOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isFilterSheetOpen]);
  // Khoang gia (VND) / dien tich (m²) keo tren thanh truot; null = khong chan
  const [priceRange, setPriceRange] = useState<[number | null, number | null]>([null, null]);
  const [areaRange, setAreaRange] = useState<[number | null, number | null]>([null, null]);
  const [funds, setFunds] = useState<UnitFundType[]>(FUND_TYPES);
  const [isFundLegendOpen, setIsFundLegendOpen] = useState(false);
  const [displayMode, setDisplayMode] = useState<"code" | "name" | "price">(
    "price",
  );
  const [displayOpen, setDisplayOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // `filters` dang ap len ban do; `draft` la cac o dang chinh trong bang -
  // chi ap khi bam "Ap dung bo loc"
  const [filters, setFilters] = useState<MapFilters>(EMPTY_FILTERS);
  const [draft, setDraft] = useState<MapFilters>(EMPTY_FILTERS);
  // Doi phan khu (ban do khong dung lai) thi bo loc cu khong con dung - dat lai
  const [filtersPhase, setFiltersPhase] = useState(lockedPhaseName);
  if (filtersPhase !== lockedPhaseName) {
    setFiltersPhase(lockedPhaseName);
    setFilters(EMPTY_FILTERS);
    setDraft(EMPTY_FILTERS);
  }

  const displayOptions = useMemo(
    () => [
      { value: "code" as const, label: "Mã" },
      { value: "name" as const, label: "Không tên" },
      { value: "price" as const, label: "Giá" },
    ],
    [],
  );

  // Lua chon cua tung o lay tu chinh cac pin dang co - khong co gia tri nao
  // (VD du lieu chua co huong) thi o do tu an
  const options = useMemo(() => {
    const markers = planMap.markers;
    const toOptions = (values: string[]) => values.map((value) => ({ value, label: value }));
    const hasHigh = markers.some((marker) => marker.kind === 'cao-tang');
    const hasLow = markers.some((marker) => marker.kind !== 'cao-tang');
    const mode: FilterMode = hasHigh && hasLow ? 'hon-hop' : hasHigh ? 'cao-tang' : 'thap-tang';
    return {
      mode,
      phaseName: toOptions(facet(markers.map((marker) => marker.phaseName))),
      propertyType: toOptions(facet(markers.map((marker) => marker.propertyTypeLabel))),
      // Du cac huong nhu bo loc tab Quy can (8 huong + Dong / Tay tu trach)
      direction: DIRECTION_FILTER_OPTIONS,
      block: toOptions(facet(markers.map((marker) => marker.block))),
      handover: toOptions(facet(markers.map((marker) => marker.handoverStandard))),
      unitLine: facet(markers.map((marker) => marker.unitLine)).map((value) => ({
        value,
        label: `Trục ${value}`,
      })),
      // Chi cac khoang tang thuc su co can
      floorRange: FLOOR_RANGE_OPTIONS.filter((range) =>
        markers.some((marker) => marker.floor && matchesFloorRange(marker.floor, range.value)),
      ),
    };
  }, [planMap.markers]);

  // Moc cuoi duong ray: lam tron len tu gia / dien tich lon nhat dang co
  const sliderLimits = useMemo(() => {
    const maxPrice = Math.max(0, ...planMap.markers.map((marker) => marker.price || 0));
    const maxArea = Math.max(0, ...planMap.markers.map((marker) => marker.landArea || 0));
    return {
      price: Math.max(BILLION, Math.ceil(maxPrice / BILLION) * BILLION),
      area: Math.max(50, Math.ceil(maxArea / 10) * 10),
    };
  }, [planMap.markers]);

  const visibleMarkers = useMemo(
    () =>
      planMap.markers.filter((marker) => {
        const [priceMin, priceMax] = priceRange;
        if (priceMin !== null && marker.price < priceMin) return false;
        if (priceMax !== null && marker.price > priceMax) return false;
        const [areaMin, areaMax] = areaRange;
        if (areaMin !== null && marker.landArea < areaMin) return false;
        if (areaMax !== null && marker.landArea > areaMax) return false;
        if (!funds.includes(marker.fundType)) return false;
        const code = filters.code.trim().toLowerCase();
        // O tim: khop ma can, loai hinh, toa / day, phan khu hoac huong
        if (
          code &&
          ![marker.code, marker.propertyTypeLabel, marker.block, marker.phaseName, marker.direction]
            .filter(Boolean)
            .some((text) => String(text).toLowerCase().includes(code))
        )
          return false;
        if (filters.status && marker.status !== filters.status) return false;
        if (filters.phaseName && marker.phaseName !== filters.phaseName) return false;
        if (filters.block && marker.block !== filters.block) return false;
        if (filters.propertyType && marker.propertyTypeLabel !== filters.propertyType)
          return false;
        if (filters.direction && !matchesDirection(marker.direction ?? '', filters.direction)) return false;
        // Mot tang cu the: "15" khop can o tang 15
        if (filters.floor && !matchesFloorRange(marker.floor, `${filters.floor}-${filters.floor}`)) return false;
        if (filters.fund && marker.fundType !== filters.fund) return false;
        if (!inRange(marker.price, PRICE_RANGES, filters.price)) return false;
        if (!inRange(marker.unitPrice, UNIT_PRICE_RANGES, filters.unitPrice)) return false;
        // O dien tich cua loai nao thi chi giu can loai do nam trong khoang
        const isHighUnit = marker.kind === 'cao-tang';
        const areaChecks: [string, boolean, number | undefined, RangeOption[]][] = [
          [filters.areaHigh, isHighUnit, marker.landArea, AREA_RANGES],
          [filters.buildHigh, isHighUnit, marker.buildArea, BUILD_AREA_RANGES],
          [filters.areaLow, !isHighUnit, marker.landArea, AREA_RANGES],
          [filters.buildLow, !isHighUnit, marker.buildArea, BUILD_AREA_RANGES],
        ];
        for (const [selected, matchesKind, value, ranges] of areaChecks) {
          if (selected && (!matchesKind || !inRange(value, ranges, selected))) return false;
        }
        if (!inRange(marker.frontage, FRONTAGE_RANGES, filters.frontage)) return false;
        if (filters.floorRange && !matchesFloorRange(marker.floor, filters.floorRange))
          return false;
        if (filters.unitLine && marker.unitLine !== filters.unitLine) return false;
        if (filters.handover && marker.handoverStandard !== filters.handover) return false;
        return true;
      }),
    [planMap.markers, funds, filters, priceRange, areaRange],
  );

  /** % tren anh -> toa do CRS.Simple (truc y cua Leaflet huong len tren) */
  const toLatLng = useCallback(
    (marker: PlanMarker): [number, number] => [
      planMap.height * (1 - marker.y / 100),
      planMap.width * (marker.x / 100),
    ],
    [planMap.height, planMap.width],
  );

  // ── Khoi tao ban do mot lan ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    let map: LeafletMap | null = null;

    // Leaflet doc `window` ngay khi nap nen phai import dong trong effect,
    // khong duoc import tinh o dau file (se vo khi Next render tren server).
    void (async () => {
      const leaflet = await import("leaflet");
      if (cancelled || !containerRef.current) return;

      const L = leaflet.default ?? leaflet;
      leafletRef.current = L;

      const bounds: [[number, number], [number, number]] = [
        [0, 0],
        [planMap.height, planMap.width],
      ];

      map = L.map(containerRef.current, {
        crs: L.CRS.Simple,
        zoomControl: false,
        minZoom: -3,
        maxZoom: 2,
        // Phai la 0: moi bac zoom deu lam tron XUONG, nen voi bac 0.25 thi
        // fitBounds co the thu anh mat bang nho hon khung toi ~16% chieu dai
        // (con lai la hai dai xam hai ben). Zoom le cho anh vua khit khung.
        zoomSnap: 0,
        maxBoundsViscosity: 0.9,
        // Bam dup pin da co viec rieng (bang truc can) - khong de ban do zoom
        doubleClickZoom: !hasMarkerDoubleClick,
      });

      L.imageOverlay(planMap.imageUrl, bounds, {
        attribution: "RealtyHub",
      }).addTo(map);

      // Mo len: anh phu kin khung (kieu cover); thu nho het co thi thay tron anh
      const fillFrame = () => {
        if (!map) return;
        const coverZoom = map.getBoundsZoom(bounds, true);
        // Thu nho toi da = thay tron anh (contain); mo len thi phu kin khung
        map.setMinZoom(Math.min(coverZoom, map.getBoundsZoom(bounds, false)));
        map.setView([planMap.height / 2, planMap.width / 2], coverZoom, { animate: false });
      };
      fillFrame();
      map.setMaxBounds(bounds);

      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      setIsMapReady(true);

      const observer = new ResizeObserver(() => {
        map?.invalidateSize({ animate: false });
        fillFrame();
      });
      observer.observe(containerRef.current);
      resizeObserverRef.current = observer;
    })();

    return () => {
      cancelled = true;
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      map?.remove();
      mapRef.current = null;
      layerRef.current = null;
      setIsMapReady(false);
    };
  }, [planMap.imageUrl, planMap.height, planMap.width, hasMarkerDoubleClick]);

  // ── Ve lai pin moi khi bo loc hoac cong tac Gia doi ──────────────────────
  useEffect(() => {
    const L = leafletRef.current;
    const layer = layerRef.current;
    if (!isMapReady || !L || !layer) return;

    layer.clearLayers();

    visibleMarkers.forEach((marker) => {
      // Ghim la diem neo 0x0 nam dung toa do, o gia nam trong <span>: xem
      // .plan-pin trong globals.css. Nho vay o gia rong theo do dai tung muc
      // gia, va Leaflet khong giat mat transform cua hieu ung phong to.
      // - "Gia": hien gia (4.27, 2.07...).
      // - "Ma": hien ma can.
      // - "Khong ten": chi con cham tron.
      const isDot = displayMode === "name";
      const priceLabel = escapeHtml(formatBillionShort(marker.price));
      const html = isDot
        ? "<span></span>"
        : displayMode === "code"
          ? `<span>${escapeHtml(marker.code)}</span>`
          : `<span>${priceLabel}</span>`;
      const icon = L.divIcon({
        className: `plan-pin plan-pin--${marker.fundType}${isDot ? " plan-pin--dot" : ""}`,
        html,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const markerInstance = L.marker(toLatLng(marker), {
        icon,
        title: marker.code,
      });

      const summaryHtml = `<div style="min-width:180px">
            <p style="font-weight:700;color:#101828;margin-bottom:6px">${escapeHtml(marker.code)}</p>
            <p style="color:#475467;font-size:12px;line-height:1.7;margin:0">
              Phân khu: <strong>${escapeHtml(marker.phaseName)}</strong><br/>
              Loại hình: <strong>${escapeHtml(marker.propertyTypeLabel)}</strong><br/>
              Diện tích: <strong>${marker.landArea} m²</strong><br/>
              Giá: <strong>${escapeHtml(formatBillion(marker.price))}</strong><br/>
              Tình trạng: <strong>${escapeHtml(UNIT_STATUS_LABELS[marker.status])}</strong>
            </p>`;

      if (hasMarkerClick) {
        // Bam = mo chi tiet can; tom tat chi hien khi ro chuot, kem goi y
        const hint = hasMarkerDoubleClick
          ? "Bấm: chi tiết căn · Bấm đúp: trục căn"
          : "Bấm để xem chi tiết căn";
        markerInstance.bindTooltip(
          `${summaryHtml}<p style="margin:6px 0 0;color:#0f6fd1;font-size:11px;font-weight:600">${hint}</p></div>`,
          { direction: "top", offset: [0, -12] },
        );

        let clickTimer: number | undefined;
        markerInstance.on("click", () => {
          if (!markerDoubleClickRef.current) {
            markerClickRef.current?.(marker);
            return;
          }
          window.clearTimeout(clickTimer);
          clickTimer = window.setTimeout(
            () => markerClickRef.current?.(marker),
            DOUBLE_CLICK_WINDOW_MS,
          );
        });
        markerInstance.on("dblclick", (event) => {
          window.clearTimeout(clickTimer);
          L.DomEvent.stop(event);
          markerDoubleClickRef.current?.(marker);
        });
      } else if (displayMode !== "name") {
        // displayMode === 'name' → không hiện popup khi click
        markerInstance.bindPopup(`${summaryHtml}</div>`);
      }

      markerInstance.addTo(layer);
    });
  }, [isMapReady, visibleMarkers, displayMode, toLatLng, hasMarkerClick, hasMarkerDoubleClick]);

  // ── Ban do chiem man hinh (dien thoai): an nut chat / Zalo / len dau ─────
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => document.body.classList.toggle("map-in-view", entry.isIntersecting),
      { threshold: 0.35 },
    );
    observer.observe(wrapper);
    return () => {
      observer.disconnect();
      document.body.classList.remove("map-in-view");
    };
  }, []);

  // ── Vao/ra toan man hinh: Leaflet phai do lai kich thuoc khung ───────────
  useEffect(() => {
    const onFullscreenChange = () => {
      const isOn = document.fullscreenElement === wrapperRef.current;
      setIsFullscreen(isOn);
      if (!isOn) setAreControlsHidden(false);
      if (!isOn) setIsQuickFilterOpen(false);
      window.setTimeout(() => mapRef.current?.invalidateSize(), 120);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  // Safari tren iPhone khong cho <div> vao toan man hinh - an nut di thay vi de
  // no bam khong len gi. Phai do o effect vi server khong co `document`.
  useEffect(() => {
    setCanFullscreen(
      document.fullscreenEnabled &&
        typeof wrapperRef.current?.requestFullscreen === "function",
    );
  }, []);

  const toggleFund = (fund: UnitFundType) =>
    setFunds((current) =>
      current.includes(fund)
        ? current.filter((item) => item !== fund)
        : [...current, fund],
    );

  /**
   * Ca hai ham deu tra ve Promise co the bi tu choi (trinh duyet chan, khong
   * phai thao tac cua nguoi dung...). `void` khong nuot duoc loi do - thieu
   * `catch` la co mot TypeError chua bat van ra console.
   */
  const toggleFullscreen = () => {
    if (document.fullscreenElement)
      void document.exitFullscreen().catch(() => {});
    else void wrapperRef.current?.requestFullscreen().catch(() => {});
  };

  const activeFilterCount =
    Object.values(filters).filter(Boolean).length +
    (priceRange.some((value) => value !== null) ? 1 : 0) +
    (areaRange.some((value) => value !== null) ? 1 : 0);

  const toggleFilterPanel = () => {
    // Mo bang: cac o hien dung bo loc dang ap
    if (!isFilterOpen) setDraft(filters);
    setIsFilterOpen((open) => !open);
  };

  const setDraftField = (key: keyof MapFilters) => (value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const applyFilters = () => {
    setFilters(draft);
    setIsFilterOpen(false);
  };

  const clearFilters = () => {
    setDraft(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
    setPriceRange([null, null]);
    setAreaRange([null, null]);
  };

  const statusOptions = Object.entries(UNIT_STATUS_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  // Bang loc nhanh (toan man hinh) ap ngay khi chon - khong qua `draft`
  const setFilterField = (key: keyof MapFilters) => (value: string) =>
    setFilters((current) => ({ ...current, [key]: value }));


  // Nut loc chi con icon phieu; dang loc thi co so dem nho o goc
  const filterButton = (
    <button
      type="button"
      onClick={() => {
        if (window.matchMedia("(max-width: 1023.98px)").matches) setIsFilterSheetOpen(true);
        else toggleFilterPanel();
      }}
      aria-expanded={isFilterOpen || isFilterSheetOpen}
      aria-label={activeFilterCount > 0 ? `Bộ lọc (${activeFilterCount} đang lọc)` : 'Bộ lọc'}
      title="Bộ lọc"
      // May tinh: o icon vuong nhu cu. iPad / dien thoai: nut co chu "Lọc" de
      // de nhan ra trong hang nut phan khu
      className={`relative flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg border px-3.5 text-theme-sm font-semibold shadow-sm transition lg:w-10 lg:px-0 ${
        isFilterOpen || activeFilterCount > 0
          ? "border-transparent bg-gradient-to-r from-brand-600 to-sky-500 text-white lg:border-brand-400 lg:bg-none lg:bg-brand-50 lg:text-brand-600"
          : "border-brand-200 bg-white text-brand-700 hover:border-brand-400 lg:border-gray-300 lg:text-gray-700 lg:hover:text-brand-600"
      }`}
    >
      <FiFilter className="h-4.5 w-4.5" aria-hidden />
      <span className="lg:hidden">Lọc</span>
      {activeFilterCount > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[11px] font-bold text-brand-600 lg:absolute lg:-top-1.5 lg:-right-1.5 lg:bg-brand-500 lg:text-white lg:ring-2 lg:ring-white">
          {activeFilterCount}
        </span>
      )}
    </button>
  );

  return (
    <div>
      {/* Noi goi co cho rieng cho nut loc (hang nut phan khu) thi dua nut len
          do; khong thi nut nam tren dau ban do nhu cu */}
      {filterSlot ? (
        createPortal(filterButton, filterSlot)
      ) : (
        <div
          className={`mb-4 flex flex-wrap items-center gap-3 ${
            showTitle ? 'justify-between' : 'justify-end'
          }`}
        >
          {showTitle && (
            <h2 className="text-xl font-bold uppercase tracking-wide text-gray-900">
              Vị trí quỹ căn
            </h2>
          )}
          {filterButton}
        </div>
      )}
      {filterSlot && showTitle && (
        <h2 className="mb-4 text-xl font-bold uppercase tracking-wide text-gray-900">
          Vị trí quỹ căn
        </h2>
      )}

      {isFilterOpen && (
        <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-card sm:p-5">
          {/* Luoi 5 cot tren may tinh, 2 cot iPad, 1 cot dien thoai. O nao
              khong co du lieu thi an (VD pin chua co huong). */}
          <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-5">
            {(() => {
              const { mode } = options;
              const isHigh = mode !== 'thap-tang';
              const isLow = mode !== 'cao-tang';
              // O trung giua hai kieu chi hien mot lan, nhan theo kieu du an
              const labels = {
                code: mode === 'cao-tang' ? 'Căn hộ' : 'Mã căn',
                status: mode === 'thap-tang' ? 'Tình trạng' : 'Trạng thái',
                block:
                  mode === 'cao-tang'
                    ? 'Tòa nhà'
                    : mode === 'thap-tang'
                      ? 'Tiểu khu/Dãy'
                      : 'Tòa nhà/Dãy',
                propertyType: mode === 'cao-tang' ? 'Loại căn' : 'Loại hình',
              };
              const select = (
                key: keyof MapFilters,
                label: string,
                fieldOptions: { value: string; label: string }[],
              ) =>
                fieldOptions.length > 0 ? (
                  <FilterField
                    key={key}
                    label={label}
                    value={draft[key]}
                    options={fieldOptions}
                    onChange={setDraftField(key)}
                  />
                ) : null;

              return [
                isHigh && (
                  <FilterTextField
                    key="code"
                    label={labels.code}
                    placeholder="Mã căn hộ"
                    value={draft.code}
                    onChange={setDraftField('code')}
                  />
                ),
                select('status', labels.status, statusOptions),
                !lockedPhaseName &&
                  options.phaseName.length > 1 &&
                  select('phaseName', 'Phân khu', options.phaseName),
                select('block', labels.block, options.block),
                select('propertyType', labels.propertyType, options.propertyType),
                select('direction', 'Hướng', options.direction),
                isHigh &&
                  select(
                    'fund',
                    'Quỹ bán',
                    Object.entries(UNIT_FUND_LABELS).map(([value, label]) => ({ value, label })),
                  ),
                select('price', 'Khoảng giá', PRICE_RANGES),
                select('unitPrice', 'Đơn giá', UNIT_PRICE_RANGES),
                // Bon loai dien tich, moi loai mot o rieng: can ho (thong
                // thuy, tim tuong) chi loc can ho; nha dat (dat, xay dung)
                // chi loc nha thap tang
                isLow && select('areaLow', 'Diện tích đất', AREA_RANGES),
                isLow && select('buildLow', 'DT xây dựng', BUILD_AREA_RANGES),
                isHigh && select('areaHigh', 'DT thông thuỷ', AREA_RANGES),
                isHigh && select('buildHigh', 'DT tim tường', BUILD_AREA_RANGES),
                // Mat tien: luon co o du an / phan khu thap tang
                isLow && select('frontage', 'Mặt tiền', FRONTAGE_RANGES),
                isHigh && select('floorRange', 'Khoảng tầng', options.floorRange),
                isHigh && (
                  <FilterTextField
                    key="floor"
                    label="Số tầng"
                    placeholder="Nhập số tầng"
                    value={draft.floor}
                    onChange={(value) => setDraftField('floor')(value.replace(/\D/g, ''))}
                  />
                ),
                isHigh && select('unitLine', 'Trục', options.unitLine),
                isLow && select('handover', 'Tiêu chuẩn bàn giao', options.handover),
              ];
            })()}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex h-11 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-5 text-theme-sm font-medium text-gray-600 transition hover:border-brand-300 hover:text-brand-600"
            >
              <FiX aria-hidden />
              Xóa bộ lọc
            </button>
            <button
              type="button"
              onClick={applyFilters}
              className="brand-gradient inline-flex h-11 items-center gap-2 rounded-lg px-6 text-theme-sm font-semibold text-white shadow-md transition hover:brightness-110"
            >
              Áp dụng bộ lọc
              <FiCheck aria-hidden />
            </button>
          </div>
        </div>
      )}

      <div
        ref={wrapperRef}
        className="plan-map-shell relative isolate overflow-hidden rounded-lg border border-gray-200 bg-gray-100 shadow-card"
      >
        <div
          ref={containerRef}
          className="plan-map-canvas min-h-[24rem] w-full max-sm:max-h-[calc(100dvh-12rem)] sm:h-[calc(100dvh-9rem)] sm:min-h-[32rem]"
          // Dien thoai khong dat chieu cao: aspect-ratio lay theo anh. Tu sm da co
          // chieu cao co dinh nen ti le nay bi bo qua.
          style={{ aspectRatio: `${planMap.width} / ${planMap.height}` }}
        />

        {/* Che do 3D: trang tham quan 360 phu len ban do, cac nut van nam tren */}
        {overlayUrl && (
          <iframe
            src={overlayUrl}
            title="Tham quan 360°"
            allow="fullscreen; gyroscope; accelerometer; xr-spatial-tracking"
            allowFullScreen
            className="absolute inset-0 z-[800] h-full w-full border-0 bg-gray-900"
          />
        )}

        {/* Dieu khien tu ve de bam dung thiet ke; Leaflet control mac dinh da tat */}
        <div className="absolute left-3 top-3 z-900 flex flex-col items-start gap-2">
          <div
            className={`${areControlsHidden ? "!hidden" : ""} group/display relative mt-2 inline-flex h-8 w-20 items-center rounded-full border border-gray-300 bg-white shadow-card mb-2`}
            title={
              displayOptions.find((option) => option.value === displayMode)
                ?.label
            }
          >
            <span
              aria-hidden
              className={`pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-brand-500 shadow-card transition-[left] duration-300 ease-out ${
                displayMode === "code"
                  ? ""
                  : displayMode === "name"
                    ? "-translate-x-1/2"
                    : "-translate-x-full"
              }`}
              style={{
                left:
                  displayMode === "code"
                    ? "7%"
                    : displayMode === "name"
                      ? "50%"
                      : "93%",
              }}
            />
            {displayOptions.map((option) => {
              const isActive = option.value === displayMode;
              const isNameMode = option.value === "name";
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDisplayMode(option.value)}
                  aria-label={isNameMode ? undefined : option.label}
                  title={isNameMode ? undefined : option.label}
                  aria-pressed={isActive}
                  className="relative z-10 inline-flex h-full w-1/3 items-center justify-center transition"
                >
                  {!isNameMode && (
                    <span
                      className={`pointer-events-none absolute top-full left-1/2 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-1.5 py-0.5 text-[10px] font-medium text-white opacity-0 shadow-card transition-opacity duration-150 group-hover/display:opacity-100 ${
                        isActive ? "" : "delay-150"
                      }`}
                    >
                      {option.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {!areControlsHidden && (
            <>
              <MapButton label="Phóng to" onClick={() => mapRef.current?.zoomIn()}>
                <FiPlus aria-hidden />
              </MapButton>
              <MapButton label="Thu nhỏ" onClick={() => mapRef.current?.zoomOut()}>
                <FiMinus aria-hidden />
              </MapButton>
            </>
          )}
          {canFullscreen && (
            <MapButton label={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"} onClick={toggleFullscreen}>
              {isFullscreen ? <FiMinimize aria-hidden /> : <FiMaximize aria-hidden />}
            </MapButton>
          )}
        </div>

        <div className="absolute right-3 top-3 z-900 flex flex-col items-end gap-2">
          {!areControlsHidden && controlsSlot}
          {/* Toan man hinh: nut con mat an / hien moi nut (ke ca dai phan khu),
              chi chua nut thoat toan man hinh */}
          {isFullscreen && (
            <MapButton
              label={areControlsHidden ? "Hiện các nút" : "Ẩn các nút"}
              onClick={() => setAreControlsHidden((hidden) => !hidden)}
            >
              {areControlsHidden ? <FiEye aria-hidden /> : <FiEyeOff aria-hidden />}
            </MapButton>
          )}
          {/* Toan man hinh: nut bo loc */}
          {isFullscreen && !areControlsHidden && (
            <button
              type="button"
              onClick={() => setIsQuickFilterOpen((open) => !open)}
              aria-expanded={isQuickFilterOpen}
              aria-label={activeFilterCount > 0 ? `Bộ lọc (${activeFilterCount} đang lọc)` : "Bộ lọc"}
              title="Bộ lọc"
              className={`relative flex h-8 w-8 items-center justify-center rounded-md border shadow-card transition sm:h-9 sm:w-9 ${
                isQuickFilterOpen || activeFilterCount > 0
                  ? "border-transparent bg-gradient-to-br from-sky-500 to-brand-600 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:border-brand-400 hover:text-brand-600"
              }`}
            >
              <FiFilter aria-hidden />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-brand-600 shadow ring-1 ring-brand-200">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}
          {!areControlsHidden && (
          <MapButton
            label={
              isFundLegendOpen ? "Đóng chú thích quỹ căn" : "Chú thích quỹ căn"
            }
            onClick={() => setIsFundLegendOpen((open) => !open)}
          >
            <FiLayers aria-hidden />
          </MapButton>
          )}
          {!areControlsHidden && (
          <>

          {/* Popover chu thich loai quy - flex cot doc, nam ngay sat duoi nut FiLayers */}
          {isFundLegendOpen && (
            <div className="flex w-28 flex-col items-stretch gap-1.5 rounded-md border border-gray-200 p-2 shadow-card backdrop-blur">
              {FUND_TYPES.map((fund) => {
                const isOn = funds.includes(fund);

                return (
                  <button
                    key={fund}
                    type="button"
                    onClick={() => toggleFund(fund)}
                    aria-pressed={isOn}
                    className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-theme-sm font-medium transition ${
                      isOn
                        ? "border-gray-300 bg-white text-gray-700 shadow-card"
                        : "border-gray-200 bg-gray-50 text-gray-400"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`text-base leading-none ${isOn ? FUND_DOT_TONES[fund] : "text-gray-300"}`}
                    >
                      ●
                    </span>
                    {UNIT_FUND_LABELS[fund]}
                  </button>
                );
              })}
            </div>
          )}
          </>
          )}
        </div>

        {/* ── Giua tren (chi khi toan man hinh): thanh tim ma can ── */}
        {isFullscreen && (
        <div className="pointer-events-none absolute top-4 left-1/2 z-[950] flex w-[min(26rem,calc(100%-13rem))] -translate-x-1/2 flex-col items-center gap-1.5 max-sm:top-5 max-sm:right-[4.75rem] max-sm:left-[6.25rem] max-sm:w-auto max-sm:translate-x-0">
          {!areControlsHidden && (
            <div className="pointer-events-auto flex h-10 w-full items-center gap-1.5 rounded-full bg-white/95 pr-3.5 pl-3.5 max-sm:h-8 max-sm:gap-1 max-sm:pr-2.5 max-sm:pl-3 shadow-card ring-1 ring-gray-200 backdrop-blur focus-within:ring-brand-300">
              <input
                type="search"
                value={filters.code}
                onChange={(event) => setFilterField("code")(event.target.value)}
                placeholder="Tìm mã căn, loại hình, tòa, hướng..."
                aria-label="Tìm mã căn trên bản đồ"
                className="h-full min-w-0 flex-1 bg-transparent text-theme-sm text-gray-800 outline-none placeholder:text-gray-400 max-sm:text-theme-xs"
              />
              <AiSearchIcon className="h-4.5 w-4.5 shrink-0 text-brand-600 max-sm:h-4 max-sm:w-4" />
            </div>
          )}
        </div>
        )}

        {/* ── Day ban do (chi khi toan man hinh): dai the phan khu co anh, nut "v" an / hien ── */}
        {isFullscreen && !areControlsHidden && phaseSwitch?.cards && phaseSwitch.cards.length > 1 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[950] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setIsPhaseStripOpen((open) => !open)}
              aria-expanded={isPhaseStripOpen}
              aria-label={isPhaseStripOpen ? "Ẩn phân khu" : "Hiện phân khu"}
              title={isPhaseStripOpen ? "Ẩn phân khu" : "Hiện phân khu"}
              className={`pointer-events-auto flex h-7 items-center gap-1 rounded-t-xl bg-navy-900/70 px-3 text-[11px] font-semibold text-white backdrop-blur transition hover:bg-navy-900/85 ${
                isPhaseStripOpen ? "" : "mb-0"
              }`}
            >
              <FiChevronDown aria-hidden className={`h-4 w-4 transition-transform ${isPhaseStripOpen ? "" : "rotate-180"}`} />
              Phân khu
            </button>
            {isPhaseStripOpen && (
              <div className="pointer-events-auto w-full bg-gradient-to-t from-navy-900/80 via-navy-900/55 to-navy-900/20 px-3 pt-2.5 pb-3 backdrop-blur-[2px]">
                <div className="no-scrollbar mx-auto flex w-fit max-w-full gap-2.5 overflow-x-auto">
                  {phaseSwitch.cards.map((card) => {
                    const isActive = card.value === phaseSwitch.value;
                    return (
                      <button
                        key={card.value || "tong-the"}
                        type="button"
                        onClick={() => (phaseSwitch.onCardPick ?? phaseSwitch.onChange)(card.value)}
                        aria-pressed={isActive}
                        className={`group relative aspect-[16/10] w-32 shrink-0 overflow-hidden rounded-xl text-left shadow-card transition sm:w-40 lg:w-44 ${
                          isActive ? "ring-[3px] ring-sky-400" : "ring-1 ring-white/40 hover:ring-white"
                        }`}
                      >
                        {card.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={card.image}
                            alt=""
                            loading="lazy"
                            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <span aria-hidden className="absolute inset-0 bg-gradient-to-br from-sky-400 to-brand-700" />
                        )}
                        <span aria-hidden className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/75 to-transparent" />
                        <span className="absolute inset-x-0 bottom-0 truncate px-2 pb-1.5 text-center text-theme-xs font-bold text-white sm:text-theme-sm">
                          {card.label}
                        </span>
                        {isActive && (
                          <span className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-sky-400 text-white shadow">
                            <FiCheck aria-hidden className="h-3 w-3" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bang loc - chi khi toan man hinh (nam trong wrapper fullscreen);
            keo tieu de de di chuyen */}
        {isFullscreen && isQuickFilterOpen && (
          <MapFilterPanel
            filters={filters}
            onField={setFilterField}
            mode={options.mode}
            options={options}
            statusOptions={statusOptions}
            statusDotTones={STATUS_DOT_TONES}
            ranges={{ unitPrice: UNIT_PRICE_RANGES, build: BUILD_AREA_RANGES, frontage: FRONTAGE_RANGES }}
            lockedPhaseName={lockedPhaseName}
            phaseSwitch={phaseSwitch}
            priceRange={priceRange}
            onPriceRange={setPriceRange}
            areaRange={areaRange}
            onAreaRange={setAreaRange}
            limits={sliderLimits}
            priceStep={BILLION / 2}
            priceScale={BILLION}
            visibleCount={visibleMarkers.length}
            totalCount={planMap.markers.length}
            activeCount={activeFilterCount}
            onClear={clearFilters}
            onClose={() => setIsQuickFilterOpen(false)}
          />
        )}
      </div>

      {/* Ngan keo loc cap trang (iPad / dien thoai) - dua ra body de nam tren
          thanh tab dinh va thanh dieu huong duoi */}
      {isFilterSheetOpen &&
        createPortal(
          <>
            <div
              aria-hidden
              onClick={() => setIsFilterSheetOpen(false)}
              className="animate-fade-in fixed inset-0 z-[1000] bg-navy-900/45 backdrop-blur-[2px]"
            />
            <MapFilterPanel
              variant="sheet"
              filters={filters}
              onField={setFilterField}
              mode={options.mode}
              options={options}
              statusOptions={statusOptions}
              statusDotTones={STATUS_DOT_TONES}
              ranges={{ unitPrice: UNIT_PRICE_RANGES, build: BUILD_AREA_RANGES, frontage: FRONTAGE_RANGES }}
              lockedPhaseName={lockedPhaseName}
              phaseSwitch={phaseSwitch}
              priceRange={priceRange}
              onPriceRange={setPriceRange}
              areaRange={areaRange}
              onAreaRange={setAreaRange}
              limits={sliderLimits}
              priceStep={BILLION / 2}
              priceScale={BILLION}
              visibleCount={visibleMarkers.length}
              totalCount={planMap.markers.length}
              activeCount={activeFilterCount}
              onClear={clearFilters}
              onClose={() => {
                setIsFilterSheetOpen(false);
                // Dua ban do vao giua man hinh de thay ngay ket qua loc
                wrapperRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
            />
          </>,
          document.body,
        )}
    </div>
  );
};

export default FloorPlanTab;
