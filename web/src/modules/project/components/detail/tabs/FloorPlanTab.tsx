"use client";

import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import {
  FiCheck,
  FiChevronDown,
  FiFilter,
  FiLayers,
  FiMaximize,
  FiMinus,
  FiPlus,
  FiSearch,
  FiX,
} from "react-icons/fi";
import { formatBillion, formatBillionShort } from "@/common/utils/format";
import {
  FLOOR_RANGE_OPTIONS,
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
    className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 shadow-card transition hover:border-brand-400 hover:text-brand-600"
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
  area: string;
  frontage: string;
  floorRange: string;
  unitLine: string;
  handover: string;
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
  area: '',
  frontage: '',
  floorRange: '',
  unitLine: '',
  handover: '',
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
  const [funds, setFunds] = useState<UnitFundType[]>(FUND_TYPES);
  const [isFundLegendOpen, setIsFundLegendOpen] = useState(false);
  const [displayMode, setDisplayMode] = useState<"code" | "name" | "price">(
    "price",
  );
  const [displayOpen, setDisplayOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // `filters` dang ap len ban do; `draft` la cac o dang chinh trong bang -
  // chi ap khi bam "Ap dung bo loc"
  const [filters, setFilters] = useState<MapFilters>(EMPTY_FILTERS);
  const [draft, setDraft] = useState<MapFilters>(EMPTY_FILTERS);

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
      direction: toOptions(facet(markers.map((marker) => marker.direction))),
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

  const visibleMarkers = useMemo(
    () =>
      planMap.markers.filter((marker) => {
        if (!funds.includes(marker.fundType)) return false;
        const code = filters.code.trim().toLowerCase();
        if (code && !marker.code.toLowerCase().includes(code)) return false;
        if (filters.status && marker.status !== filters.status) return false;
        if (filters.phaseName && marker.phaseName !== filters.phaseName) return false;
        if (filters.block && marker.block !== filters.block) return false;
        if (filters.propertyType && marker.propertyTypeLabel !== filters.propertyType)
          return false;
        if (filters.direction && marker.direction !== filters.direction) return false;
        if (filters.fund && marker.fundType !== filters.fund) return false;
        if (!inRange(marker.price, PRICE_RANGES, filters.price)) return false;
        if (!inRange(marker.unitPrice, UNIT_PRICE_RANGES, filters.unitPrice)) return false;
        if (!inRange(marker.landArea, AREA_RANGES, filters.area)) return false;
        if (!inRange(marker.frontage, FRONTAGE_RANGES, filters.frontage)) return false;
        if (filters.floorRange && !matchesFloorRange(marker.floor, filters.floorRange))
          return false;
        if (filters.unitLine && marker.unitLine !== filters.unitLine) return false;
        if (filters.handover && marker.handoverStandard !== filters.handover) return false;
        if (
          search.trim() &&
          !marker.code.toLowerCase().includes(search.trim().toLowerCase())
        )
          return false;
        return true;
      }),
    [planMap.markers, funds, filters, search],
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

      map.fitBounds(bounds);
      map.setMaxBounds(bounds);

      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      setIsMapReady(true);

      const observer = new ResizeObserver(() => {
        map?.invalidateSize({ animate: false });
        map?.fitBounds(bounds);
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
      // - "Gia": o gia.
      // - "Ma": CUNG mot o - gia dong tren, ma can nho dong duoi (truoc day
      //   la cham tron co chu ma de len, nhin roi).
      // - "Khong ten": chi con cham tron.
      const isDot = displayMode === "name";
      const priceLabel = escapeHtml(formatBillionShort(marker.price));
      const html = isDot
        ? "<span></span>"
        : displayMode === "code"
          ? `<span class="plan-pin__stack"><b>${priceLabel}</b><small>${escapeHtml(marker.code)}</small></span>`
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

  // ── Vao/ra toan man hinh: Leaflet phai do lai kich thuoc khung ───────────
  useEffect(() => {
    const onFullscreenChange = () => {
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

  /** Bay toi can dau tien khop tu khoa */
  const flyToFirstMatch = () => {
    const target = visibleMarkers[0];
    if (target) mapRef.current?.flyTo(toLatLng(target), 1, { duration: 0.6 });
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

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
  };

  const statusOptions = Object.entries(UNIT_STATUS_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  // Nut loc chi con icon phieu; dang loc thi co so dem nho o goc
  const filterButton = (
    <button
      type="button"
      onClick={toggleFilterPanel}
      aria-expanded={isFilterOpen}
      aria-label={activeFilterCount > 0 ? `Bộ lọc (${activeFilterCount} đang lọc)` : 'Bộ lọc'}
      title="Bộ lọc"
      className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border shadow-sm transition ${
        isFilterOpen || activeFilterCount > 0
          ? "border-brand-400 bg-brand-50 text-brand-600"
          : "border-gray-300 bg-white text-gray-700 hover:border-brand-400 hover:text-brand-600"
      }`}
    >
      <FiFilter className="h-4.5 w-4.5" aria-hidden />
      {activeFilterCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[11px] font-bold text-white ring-2 ring-white">
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
                area:
                  mode === 'cao-tang'
                    ? 'Diện tích thông thuỷ'
                    : mode === 'thap-tang'
                      ? 'Diện tích đất'
                      : 'Diện tích',
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
                select('area', labels.area, AREA_RANGES),
                // Mat tien: luon co o du an / phan khu thap tang
                isLow && select('frontage', 'Mặt tiền', FRONTAGE_RANGES),
                isHigh && select('floorRange', 'Khoảng tầng', options.floorRange),
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
          className="plan-map-canvas h-140 w-full sm:h-170"
        />

        {/* Dieu khien tu ve de bam dung thiet ke; Leaflet control mac dinh da tat */}
        <div className="absolute left-3 top-3 z-900 flex flex-col items-start gap-2">
          <div
            className="group/display relative mt-2 inline-flex h-8 w-20 items-center rounded-full border border-gray-300 bg-white shadow-card mb-2"
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
          <MapButton label="Phóng to" onClick={() => mapRef.current?.zoomIn()}>
            <FiPlus aria-hidden />
          </MapButton>
          <MapButton label="Thu nhỏ" onClick={() => mapRef.current?.zoomOut()}>
            <FiMinus aria-hidden />
          </MapButton>
          {canFullscreen && (
            <MapButton label="Toàn màn hình" onClick={toggleFullscreen}>
              <FiMaximize aria-hidden />
            </MapButton>
          )}
        </div>

        <div className="absolute right-3 top-3 z-900 flex flex-col items-end gap-2">
          {controlsSlot}
          {isSearchOpen && (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                flyToFirstMatch();
              }}
            >
              <input
                autoFocus
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm mã căn..."
                aria-label="Tìm mã căn trên mặt bằng"
                className="h-9 w-44 rounded-md border border-gray-300 bg-white px-3 text-theme-sm text-gray-700 shadow-card outline-none focus:border-brand-400"
              />
            </form>
          )}

          <MapButton
            label={isSearchOpen ? "Đóng tìm kiếm" : "Tìm mã căn"}
            onClick={() => {
              setIsSearchOpen((open) => !open);
              if (isSearchOpen) setSearch("");
            }}
          >
            {isSearchOpen ? <FiX aria-hidden /> : <FiSearch aria-hidden />}
          </MapButton>

          <MapButton
            label={
              isFundLegendOpen ? "Đóng chú thích quỹ căn" : "Chú thích quỹ căn"
            }
            onClick={() => setIsFundLegendOpen((open) => !open)}
          >
            <FiLayers aria-hidden />
          </MapButton>

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
        </div>
      </div>
    </div>
  );
};

export default FloorPlanTab;
