'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from 'react';
import type { IconType } from 'react-icons';
import { FiChevronDown } from 'react-icons/fi';
import { HiOutlineBuildingOffice2, HiOutlineFire, HiOutlineMap } from 'react-icons/hi2';
import { formatNumber } from '@/common/utils/format';
import { useProjectUnits } from '../../../hooks/useProjects';
import {
  DEFAULT_UNIT_QUERY,
  type FundGroup,
  UNIT_STATUS_LABELS,
  type MasterPlanMap,
  type PlanMarker,
  type ProjectDetail,
  type ProjectPhase,
  type ProjectUnit,
  type UnitStatus,
  type UnitWithProject,
} from '../../../models/project-detail.model';
import UnitModal from '../../UnitModal';
import UnitAxisModal from '../../modal/UnitAxisModal';
import { MediaFrame, TabEmptyState } from '../shared';
import FloorPlanTab from './FloorPlanTab';
import SalesPolicyTab from './SalesPolicyTab';

/**
 * Tab "Vi tri quy can": cac phan khu xep thanh mot hang the nam ngang, bam
 * mot the thi ngay duoi hang so ra mot bo tab con (Tong quan, Vi tri, Quy hang, Vi tri quy hang, Mat
 * bang, Chinh sach ban hang). Ban do pin gia truoc day chiem ca tab nay nay
 * nam trong tab con "Vi tri quy hang", da loc san theo phan khu.
 *
 * Du an chua co phan khu thi van hien ban do chung nhu cu.
 */

const INNER_TABS = [
  { key: 'tong-quan', label: 'Tổng quan' },
  { key: 'vi-tri', label: 'Vị trí' },
  { key: 'quy-hang', label: 'Quỹ hàng' },
  { key: 'vi-tri-quy-hang', label: 'Vị trí quỹ hàng' },
  { key: 'mat-bang', label: 'Mặt bằng' },
  { key: 'chinh-sach-ban-hang', label: 'Chính sách bán hàng' },
] as const;

type InnerTabKey = (typeof INNER_TABS)[number]['key'];

/** Tab con can noi bat (nhap nhay) - cung vai tro voi HOT_TAB o ProjectTabNav */
const HOT_INNER_TAB: InnerTabKey = 'vi-tri-quy-hang';

const SEGMENT_SHORT_LABELS: Record<ProjectDetail['segment'], string> = {
  'cao-tang': 'Cao tầng',
  'thap-tang': 'Thấp tầng',
};

const STATUS_TONES: Record<UnitStatus, string> = {
  'con-hang': 'bg-success-50 text-success-600',
  'giu-cho': 'bg-amber-50 text-amber-700',
  'da-ban': 'bg-gray-100 text-gray-500',
};

/** Bang san pham cua mot phan khu - toi da 100 can, cuon doc trong khung */
const PhaseUnitsTable = ({ slug, phaseName }: { slug: string; phaseName: string }) => {
  const query = useMemo(
    () => ({ ...DEFAULT_UNIT_QUERY, phaseName, limit: 100 }),
    [phaseName],
  );
  const unitsQuery = useProjectUnits(slug, query);
  const units = unitsQuery.data?.units ?? [];

  if (unitsQuery.isLoading) {
    return <div className="h-48 w-full animate-pulse rounded-xl bg-gray-100" />;
  }

  if (units.length === 0) {
    return <TabEmptyState message="Phân khu chưa có sản phẩm trong giỏ hàng." />;
  }

  return (
    <div>
      <h3 className="mb-3 border-l-4 border-brand-500 pl-2 text-theme-sm font-bold text-gray-900">
        Danh sách sản phẩm
      </h3>
      <div className="max-h-105 overflow-auto rounded-xl border border-gray-100">
        <table className="w-full min-w-160 text-left text-theme-sm">
          <thead className="sticky top-0 z-10 bg-gray-100 text-gray-700">
            <tr>
              {['STT', 'Mã căn', 'Hướng', 'Diện tích (m²)', 'Loại SP', 'Trạng thái'].map(
                (label) => (
                  <th key={label} className="px-4 py-3 font-semibold whitespace-nowrap">
                    {label}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {units.map((unit, index) => (
              <tr key={unit.publicId} className="border-t border-gray-100 text-gray-700">
                <td className="px-4 py-3">{index + 1}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{unit.code}</td>
                <td className="px-4 py-3 whitespace-nowrap">{unit.direction}</td>
                <td className="px-4 py-3">{formatNumber(unit.landArea)}</td>
                <td className="px-4 py-3 whitespace-nowrap">{unit.propertyTypeLabel}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-theme-xs font-semibold whitespace-nowrap ${STATUS_TONES[unit.status]}`}
                  >
                    {UNIT_STATUS_LABELS[unit.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/** Ban ve / anh phoi canh xep doc, xem tron anh (contain) */
const PlanImages = ({ phase, onlyFirst = false }: { phase: ProjectPhase; onlyFirst?: boolean }) => {
  const sheets = onlyFirst ? phase.masterPlanImages.slice(0, 1) : phase.masterPlanImages;

  if (sheets.length === 0) {
    return (
      <MediaFrame
        seed={phase.publicId}
        src={phase.imageUrl}
        alt={`Phân khu ${phase.name}`}
        ratio="aspect-16/9"
      />
    );
  }

  return (
    <div className="space-y-6">
      {sheets.map((sheet) => (
        <figure key={sheet.publicId}>
          <MediaFrame
            seed={sheet.publicId}
            src={sheet.imageUrl}
            alt={sheet.caption}
            label={sheet.caption}
            ratio="aspect-3/2"
            fit="contain"
            className="bg-white"
          />
          <figcaption className="mt-2 text-center text-theme-xs text-gray-500">
            {sheet.caption}
          </figcaption>
        </figure>
      ))}
    </div>
  );
};

const PhaseOverview = ({ phase }: { phase: ProjectPhase }) => (
  <div className="space-y-5">
    <dl className="grid grid-cols-1 gap-x-6 rounded-xl border border-gray-100 px-4 py-1 sm:grid-cols-2">
      {phase.specs.map((spec) => (
        <div
          key={spec.label}
          className="flex items-baseline justify-between gap-4 border-b border-dashed border-gray-200 py-3"
        >
          <dt className="shrink-0 text-theme-sm text-gray-500">{spec.label}</dt>
          <dd className="text-right text-theme-sm font-medium text-gray-900">{spec.value}</dd>
        </div>
      ))}
    </dl>
    <MediaFrame
      seed={phase.publicId}
      src={phase.imageUrl}
      alt={`Phối cảnh phân khu ${phase.name}`}
      ratio="aspect-21/9"
    />
  </div>
);

const floorNumber = (unit: ProjectUnit) => Number(unit.floor?.match(/\d+/)?.[0] ?? 0);

/**
 * Dai tang cho nut "TANG ..." - CHI khi moi can deu la can ho cao tang: cac
 * tang co can, gop doan lien tiep: [4..19, 21..35] -> "4-19,21-35".
 * Thap tang (nha pho, biet thu) va HON HOP (co ca can ho lan nha thap tang,
 * VD tong the Blanca City) khong co mot dai tang chung: tra ve rong, an nut.
 */
const isApartmentUnit = (unit: ProjectUnit) => Boolean(unit.floor) && (unit.floors ?? 1) <= 1;

const formatFloorRanges = (units: ProjectUnit[]) => {
  if (units.length === 0 || !units.every(isApartmentUnit)) return '';
  const floors = [
    ...new Set(
      units.filter((unit) => (unit.floors ?? 1) <= 1).map(floorNumber).filter((floor) => floor > 0),
    ),
  ].sort((a, b) => a - b);
  if (floors.length === 0) return '';

  const ranges: string[] = [];
  let start = floors[0];
  let previous = floors[0];
  for (const floor of [...floors.slice(1), Number.NaN]) {
    if (floor === previous + 1) {
      previous = floor;
      continue;
    }
    ranges.push(start === previous ? String(start) : `${start}-${previous}`);
    start = floor;
    previous = floor;
  }
  return ranges.join(',');
};

/**
 * Can dung tam tu mot pin khi phan khu khong con can that nao de gan. Truc =
 * nhom so cuoi cua ma, tang = nhom so dung truoc no (VD "HA1-03": tang 1,
 * truc 03) - du de bang truc can gom dung cac pin cung cot.
 */
const unitFromMarker = (marker: PlanMarker): ProjectUnit => {
  const numbers = marker.code.match(/\d+/g) ?? [];
  const roundMillion = (value: number) => Math.round(value / 1_000_000) * 1_000_000;
  return {
    publicId: `marker-${marker.publicId}`,
    code: marker.code,
    fundType: marker.fundType,
    listedPrice: marker.price,
    netPrice: roundMillion(marker.price * 0.95),
    fullVatPrice: roundMillion(marker.price * 1.08),
    unitPrice: marker.landArea > 0 ? Math.round(marker.price / marker.landArea) : 0,
    propertyTypeLabel: marker.propertyTypeLabel,
    direction: 'Đang cập nhật',
    landArea: marker.landArea,
    buildArea: marker.landArea,
    phaseName: marker.phaseName,
    status: marker.status,
    unitLine: numbers.at(-1),
    floor: numbers.length > 1 ? numbers.at(-2) : undefined,
  };
};

/**
 * Ban do "Vi tri quy hang" cua mot phan khu / toa.
 *
 * - Bam pin: mo popup chi tiet can (cung popup voi bang hang).
 * - Bam dup pin (chi du an / toa cao tang): bang "Thong tin truc can" - moi can
 *   cung truc voi can do trong toa, sap tu tang cao xuong.
 *
 * Pin chi mang ma can, nen phai nap bang hang cua phan khu de tra ra can that.
 * Du lieu mau cua vai du an (Ocean Park, Imperia) sinh pin rieng, ma pin khong
 * trung ma can nao. Luc do pin duoc gan mot can that CHUA co pin cua cung phan
 * khu; phan khu khong co can nao thi dung tam can dung tu chinh pin. Ma, gia,
 * tinh trang tren pin deu lay theo can da gan, nen pin - popup - bang truc
 * luon noi cung mot so.
 */
const PhaseFloorPlan = ({
  project,
  phaseName,
  planMap,
  highRise,
  controlsSlot,
  filterSlot,
}: {
  project: ProjectDetail;
  /** Bo trong = tong the du an (moi phan khu) */
  phaseName?: string;
  planMap: MasterPlanMap;
  highRise: boolean;
  /** Nut dat trong khung ban do (VD gat 3D / 2D) */
  controlsSlot?: ReactNode;
  /** Cho dat nut "Bo loc" (cuoi hang nut phan khu) */
  filterSlot?: HTMLElement | null;
}) => {
  const query = useMemo(
    () => ({ ...DEFAULT_UNIT_QUERY, phaseName: phaseName ?? null, limit: 5000 }),
    [phaseName],
  );
  const unitsQuery = useProjectUnits(project.slug, query);

  // Gan moi pin voi mot can (xem chu thich tren). `pool` la moi can cua phan
  // khu, ke ca can dung tam - bang truc can loc tu day.
  const { unitByMarker, pool } = useMemo(() => {
    const units = unitsQuery.data?.units ?? [];
    const byCode = new Map(units.map((unit) => [unit.code, unit]));
    const taken = new Set(
      planMap.markers.flatMap((marker) => byCode.get(marker.code)?.publicId ?? []),
    );
    const spare = units.filter((unit) => !taken.has(unit.publicId));
    const built: ProjectUnit[] = [];
    const map = new Map<string, ProjectUnit>();

    planMap.markers.forEach((marker) => {
      let unit = byCode.get(marker.code) ?? spare.shift();
      if (!unit) {
        unit = unitFromMarker(marker);
        built.push(unit);
      }
      map.set(marker.publicId, unit);
    });

    return { unitByMarker: map, pool: [...units, ...built] };
  }, [unitsQuery.data, planMap.markers]);

  // Tieu chuan ban giao theo phan khu (bang thong tin cua phan khu)
  const handoverByPhase = useMemo(
    () =>
      new Map(
        project.phases.map((item) => [
          item.name,
          item.specs.find((spec) => spec.label === 'Tiêu chuẩn bàn giao')?.value,
        ]),
      ),
    [project.phases],
  );

  const syncedPlanMap = useMemo<MasterPlanMap>(
    () => ({
      ...planMap,
      markers: planMap.markers.map((marker) => {
        const unit = unitByMarker.get(marker.publicId);
        return unit
          ? {
              ...marker,
              code: unit.code,
              price: unit.listedPrice,
              status: unit.status,
              propertyTypeLabel: unit.propertyTypeLabel,
              landArea: unit.landArea,
              // Them cho bo loc ban do
              direction: unit.direction,
              unitPrice: unit.unitPrice,
              block: unit.code.split('-')[0],
              handoverStandard: handoverByPhase.get(unit.phaseName) ?? unit.handoverStatus,
              // Can ho: co tang va chi mot tang; con lai la nha thap tang
              kind: unit.floor && (unit.floors ?? 1) <= 1 ? 'cao-tang' : 'thap-tang',
              floor: unit.floor,
              unitLine: unit.unitLine,
              frontage: unit.frontage,
              buildArea: unit.buildArea,
            }
          : marker;
      }),
    }),
    [planMap, unitByMarker, handoverByPhase],
  );

  const [detailUnit, setDetailUnit] = useState<UnitWithProject | null>(null);
  const [axisUnit, setAxisUnit] = useState<ProjectUnit | null>(null);

  const openDetail = (unit: ProjectUnit) =>
    setDetailUnit({
      ...unit,
      projectSlug: project.slug,
      projectName: project.name,
      developerName: project.developerName,
      segment: project.segment,
      propertyType: project.propertyType,
      projectIsHot: project.isHot,
      thumbnailUrls: project.thumbnailUrls,
    });

  const handleMarkerClick = (marker: PlanMarker) => {
    const unit = unitByMarker.get(marker.publicId);
    if (unit) openDetail(unit);
  };

  const handleMarkerDoubleClick = (marker: PlanMarker) => {
    const unit = unitByMarker.get(marker.publicId);
    if (!unit) return;
    // Can khong co truc (du lieu thieu) thi mo chi tiet nhu bam don
    if (unit.unitLine) setAxisUnit(unit);
    else openDetail(unit);
  };

  const axisUnits = useMemo(
    () =>
      axisUnit
        ? pool
            .filter((unit) => unit.unitLine === axisUnit.unitLine)
            .sort((a, b) => floorNumber(b) - floorNumber(a))
        : [],
    [axisUnit, pool],
  );

  return (
    <>
      <FloorPlanTab
        planMap={syncedPlanMap}
        lockedPhaseName={phaseName}
        showTitle={false}
        controlsSlot={controlsSlot}
        filterSlot={filterSlot}
        onMarkerClick={handleMarkerClick}
        onMarkerDoubleClick={highRise ? handleMarkerDoubleClick : undefined}
      />
      <UnitAxisModal
        unit={axisUnit}
        units={axisUnits}
        onClose={() => setAxisUnit(null)}
        onOpenUnit={openDetail}
        suspended={detailUnit !== null}
      />
      <UnitModal unit={detailUnit} onClose={() => setDetailUnit(null)} />
    </>
  );
};

type MapMode = '3d' | '2d';

/** Gia tri "chon tong the du an" trong thanh chon ban do */
const WHOLE_PROJECT = 'tong-the';

const MAP_MODE_HINTS: Record<MapMode, string> = {
  '3d': 'Toàn cảnh',
  '2d': 'Mặt bằng',
};

/** Goi y hien them bao lau sau khi gat chuyen che do */
const MODE_HINT_FLASH_MS = 1500;

/**
 * Nut gat 3D <-> 2D - cung kieu cong tac "Gia" ben trai ban do: vien trang bo
 * tron, nut tron xanh truot qua lai. Moi nua la mot nut bam (trai = 3D, phai
 * = 2D). Chi MOT goi y duoi cong tac:
 * - Ro chuot nua nao thi hien ten nua do ("Toan canh" / "Mat bang").
 * - Vua bam chuyen thi hien ten che do moi ~1,5 giay.
 */
const MapModeSwitch = ({ mode, onChange }: { mode: MapMode; onChange: (mode: MapMode) => void }) => {
  const [hovered, setHovered] = useState<MapMode | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const flashTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(flashTimerRef.current), []);

  const select = (next: MapMode) => {
    if (next !== mode) onChange(next);
    setIsFlashing(true);
    window.clearTimeout(flashTimerRef.current);
    flashTimerRef.current = window.setTimeout(() => setIsFlashing(false), MODE_HINT_FLASH_MS);
  };

  // Goi y: nua dang ro chuot; khong ro chuot thi che do dang xem
  const hintMode = hovered ?? mode;
  const isHintVisible = hovered !== null || isFlashing;

  return (
    <div
      role="radiogroup"
      aria-label="Chế độ bản đồ"
      onMouseLeave={() => setHovered(null)}
      // Cung chieu cao / do cao voi cong tac "Gia" ben trai ban do (h-8, cach
      // mep tren them mt-2) nhung NGAN hon (w-14): chi co hai trang thai.
      // z-20: goi y ben duoi de len nut tim kiem ngay duoi, khong bi che.
      className="relative z-20 mt-2 mb-2 inline-flex h-8 w-14 shrink-0 items-center rounded-full border border-gray-300 bg-white shadow-card transition hover:border-brand-300"
    >
      <span
        aria-hidden
        className={`pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-brand-500 shadow-card transition-[left] duration-300 ease-out ${
          mode === '2d' ? 'left-[calc(100%-1.5rem)]' : 'left-1'
        }`}
      />
      {(['3d', '2d'] as const).map((value) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={mode === value}
          aria-label={MAP_MODE_HINTS[value]}
          onMouseEnter={() => setHovered(value)}
          onFocus={() => setHovered(value)}
          onBlur={() => setHovered(null)}
          onClick={() => select(value)}
          className="relative z-10 h-full w-1/2 rounded-full"
        />
      ))}
      <span
        aria-hidden
        className={`pointer-events-none absolute top-full mt-1.5 -translate-x-1/2 rounded bg-gray-900 px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap text-white shadow-card transition-[opacity,left] duration-150 ${
          hintMode === '3d' ? 'left-1/4' : 'left-3/4'
        } ${isHintVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        {MAP_MODE_HINTS[hintMode]}
      </span>
    </div>
  );
};

/**
 * Ban do quy can (tab "Vi tri quy can" cua du an va tab con "Vi tri quy
 * hang" cua phan khu):
 *
 * - Nut tang (VD "TANG 4-19,21-35") o tren cung, tinh tu can that cua lua
 *   chon hien tai; nha thap tang khong co tang thi an.
 * - Mot hang nut: tong the du an va tung phan khu.
 * - Nut gat 3D / 2D nam TRONG khung anh / ban do, goc tren ben trai.
 * - 3D (mac dinh): phoi canh tong the / phan khu.
 * - 2D: mat bang pin gia tuong tac (bam pin xem can, bam dup xem truc can).
 */
export const PhaseMapViews = ({
  project,
  phase,
  highRise,
}: {
  project: ProjectDetail;
  phase?: ProjectPhase;
  highRise: boolean;
}) => {
  const [mode, setMode] = useState<MapMode>('3d');
  // O cuoi hang nut phan khu - ban do dua nut "Bo loc" (chi icon) vao day
  const [filterSlot, setFilterSlot] = useState<HTMLDivElement | null>(null);
  const [targetId, setTargetId] = useState<string>(phase?.publicId ?? WHOLE_PROJECT);

  const targets = useMemo(
    () => [
      { id: WHOLE_PROJECT, label: project.name },
      ...project.phases.map((item) => ({
        id: item.publicId,
        label: `${project.name} - ${item.name}`,
      })),
    ],
    [project.name, project.phases],
  );

  const target = project.phases.find((item) => item.publicId === targetId);

  // Can cua lua chon hien tai - de tinh dai tang (cung khoa truy van voi ban
  // do 2D nen chi nap mot lan)
  const unitsQuery = useProjectUnits(
    project.slug,
    useMemo(
      () => ({ ...DEFAULT_UNIT_QUERY, phaseName: target?.name ?? null, limit: 5000 }),
      [target?.name],
    ),
  );
  const floorRanges = useMemo(
    () => formatFloorRanges(unitsQuery.data?.units ?? []),
    [unitsQuery.data],
  );

  // Anh nen 3D: phoi canh phan khu / tong the. Thieu anh thi dung luon mat
  // bang 2D de ban do khong bao gio trong.
  const image3d =
    (target ? target.imageUrl : project.overviewImageUrl || project.hero[0]?.imageUrl) ||
    project.planMap.imageUrl;

  // 3D va 2D la CUNG mot ban do tuong tac (pin gia, phong to, tim, loc) -
  // chi khac anh nen: phoi canh 3D hoac mat bang 2D.
  const planMap = useMemo<MasterPlanMap>(
    () => ({
      ...project.planMap,
      imageUrl: mode === '3d' ? image3d : project.planMap.imageUrl,
      markers: target
        ? project.planMap.markers.filter((marker) => marker.phaseName === target.name)
        : project.planMap.markers,
    }),
    [project.planMap, target, mode, image3d],
  );

  return (
    <div>
      {/* May tinh: cac nut gian ra lap day ca hang (flex-auto) - hai mep hang
          thang mep ban do ben duoi, khe giua cac nut deu 8px. Hep hon thi
          giu kich thuoc nut va vuot ngang. */}
      <div className="mb-3 flex items-center gap-2">
      <div
        role="group"
        aria-label="Chọn khu vực bản đồ"
        className="no-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto"
      >
        {targets.map((item) => {
          const isActive = targetId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => setTargetId(item.id)}
              className={`flex h-10 shrink-0 items-center justify-center rounded-lg px-4 text-[11px] font-semibold whitespace-nowrap uppercase transition sm:text-xs lg:flex-auto ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 ring-1 ring-gray-200 ring-inset hover:bg-gray-200 hover:text-gray-800'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
        <div ref={setFilterSlot} className="flex shrink-0" />
      </div>

      {/* Nut tang nam DUOI hang nut phan khu, ngay tren ban do */}
      {floorRanges && (
        <div className="mb-3 flex flex-wrap gap-2" aria-label="Mặt bằng theo tầng">
          <span className="inline-flex h-10 items-center rounded-full bg-brand-600 px-5 text-theme-sm font-bold text-white uppercase shadow-sm">
            Tầng {floorRanges}
          </span>
        </div>
      )}

      <PhaseFloorPlan
        // Doi phan khu thi dung lai ban do tu dau (khung nhin, bo loc); doi
        // 3D / 2D thi ban do tu nap lai anh nen moi
        key={targetId}
        project={project}
        phaseName={target?.name}
        planMap={planMap}
        highRise={target ? highRise : project.segment === 'cao-tang'}
        controlsSlot={<MapModeSwitch mode={mode} onChange={setMode} />}
        filterSlot={filterSlot}
      />
    </div>
  );
};

/** Bo tab con cua mot phan khu / toa */
const PhaseTabs = ({
  project,
  phase,
  highRise,
}: {
  project: ProjectDetail;
  phase: ProjectPhase;
  /** Cao tang: ban do cho bam dup pin xem truc can */
  highRise: boolean;
}) => {
  // Mo thang "Vi tri quy hang" - noi nguoi xem tim den khi bam vao phan khu
  const [tab, setTab] = useState<InnerTabKey>('vi-tri-quy-hang');
  const rootRef = useRef<HTMLDivElement>(null);

  // Doi tab khi dang cuon giua noi dung: keo ve dau khoi de tab moi bat dau
  // ngay duoi thanh tab dinh, khong mo ra o giua trang nhu tab cu. Khoi con
  // nam phia duoi man hinh (chua cuon toi) thi de yen.
  const changeTab = (next: InnerTabKey) => {
    setTab(next);
    const root = rootRef.current;
    if (!root) return;
    const stickyTop = parseFloat(getComputedStyle(root).scrollMarginTop) || 0;
    if (root.getBoundingClientRect().top < stickyTop) {
      root.scrollIntoView({ block: 'start' });
    }
  };

  return (
    <div
      ref={rootRef}
      // Tab "Phan khu" tim moc nay de cuon thang toi thanh tab con
      data-phase-tabs
      className="scroll-mt-[calc(4rem+var(--project-tabnav-h,57px))]"
    >
      {/* Thanh tab con dinh ngay duoi thanh tab du an khi cuon: SiteHeader
          (4rem) + chieu cao that cua ProjectTabNav, do ProjectTabNav do va ghi
          vao --project-tabnav-h (thanh do co the xuong hai hang). Nen trang
          phia sau de noi dung cuon qua khong lo qua khe. */}
      <div className="sticky top-[calc(4rem+var(--project-tabnav-h,57px))] z-20 -mx-1 mb-5 bg-white px-1 py-2">
        <div
          role="tablist"
          aria-label={`Thông tin ${phase.name}`}
          className="no-scrollbar flex gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1"
        >
          {INNER_TABS.map((item) => {
            const isActive = item.key === tab;
            // "Vi tri quy hang" noi bat giong tab "Vi tri quy can" cua du an:
            // icon lua dap nhip, chua chon thi ca nut nhap nhay nen hong
            const isHot = item.key === HOT_INNER_TAB;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => changeTab(item.key)}
                className={`flex shrink-0 items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-theme-sm whitespace-nowrap transition sm:flex-auto lg:flex-1 ${
                  isActive
                    ? 'bg-white font-semibold text-brand-600 shadow-sm'
                    : isHot
                      ? 'animate-tab-hot font-medium text-gray-700'
                      : 'text-gray-700 hover:text-brand-600'
                }`}
              >
                {isHot && (
                  <HiOutlineFire
                    aria-hidden
                    className="h-4 w-4 shrink-0 animate-pulse-fire text-error-500"
                  />
                )}
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {tab === 'tong-quan' && <PhaseOverview phase={phase} />}
      {tab === 'vi-tri' && <PlanImages phase={phase} onlyFirst />}
      {tab === 'quy-hang' && <PhaseUnitsTable slug={project.slug} phaseName={phase.name} />}
      {tab === 'vi-tri-quy-hang' && (
        <PhaseMapViews project={project} phase={phase} highRise={highRise} />
      )}
      {tab === 'mat-bang' && <PlanImages phase={phase} />}
      {tab === 'chinh-sach-ban-hang' && (
        <SalesPolicyTab salesPolicy={project.salesPolicy} projectName={project.name} />
      )}
    </div>
  );
};

/** Nho hon breakpoint sm (640px) cua Tailwind = dien thoai */
const PHONE_QUERY = '(max-width: 639.98px)';

const subscribePhone = (onChange: () => void) => {
  const media = window.matchMedia(PHONE_QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
};

/** Server render coi nhu khong phai dien thoai; client doc lai ngay khi hydrate */
const useIsPhone = () =>
  useSyncExternalStore(
    subscribePhone,
    () => window.matchMedia(PHONE_QUERY).matches,
    () => false,
  );

type Tile = {
  id: string;
  icon: IconType;
  title: string;
  /** Dong phu duoi tieu de: "Nhan: gia tri" */
  facts: { label: string; value: string }[];
  /**
   * Ban gon mot dong thay cho `facts` tren iPad, de the co nhieu so lieu (toa
   * nha) cao bang the chi co mot dong (nhom) nam ngay tren.
   */
  compactFact?: string;
};

/**
 * Hang the phan khu. Bam mot the thi the do sang len va noi dung cua no so
 * xuong ngay duoi (tran het be ngang); bam lai de thu gon.
 *
 * - Dien thoai: mot cot, moi the mot dong ngang, du ten + so lieu.
 * - iPad: MOT hang ngang, the thu nho (icon nho ben trai, chu nho ben
 *   phai, mui ten o goc tren phai), chia deu be ngang; moi the toi thieu
 *   10rem, khong du cho thi hang vuot ngang.
 * - May tinh: mot hang, toi da 4 cot, icon ben trai.
 *
 * `panel` la noi dung cua the dang chon. Dien thoai: chen NGAY DUOI the do
 * (kieu accordion) - neu de duoi ca danh sach thi phai cuon qua het cac the
 * con lai moi thay. iPad / may tinh: nam duoi ca hang the. Chi render mot
 * cho, khong an/hien bang CSS, de khong nap hai lan bang hang / ban do.
 */
const TileRow = ({
  tiles,
  selectedId,
  onSelect,
  label,
  panel,
}: {
  tiles: Tile[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  label: string;
  panel?: ReactNode;
}) => {
  const isPhone = useIsPhone();
  // The dang mo va co noi dung that (panel co the la false/undefined)
  const openId = panel != null && panel !== false ? selectedId : null;

  return (
    <>
      <div
        role="list"
        aria-label={label}
        style={{ '--fund-cols-desktop': Math.min(tiles.length, 4) } as CSSProperties}
        className="no-scrollbar grid grid-cols-1 gap-3 sm:flex sm:snap-x sm:overflow-x-auto sm:gap-2 lg:grid lg:snap-none lg:grid-cols-[repeat(var(--fund-cols-desktop),minmax(0,1fr))] lg:gap-4 lg:overflow-visible"
      >
        {tiles.map(({ id, icon: Icon, title, facts, compactFact }) => {
          const isActive = id === selectedId;
          return (
            <div
              key={id}
              role="listitem"
              className="flex min-w-0 sm:min-w-40 sm:flex-1 sm:basis-0 sm:snap-start lg:min-w-0"
            >
              <button
                type="button"
                onClick={() => onSelect(isActive ? null : id)}
                aria-expanded={isActive}
                aria-controls={`fund-panel-${id}`}
                title={title}
                className={`relative flex w-full min-w-0 items-center gap-3 rounded-2xl border p-3 text-left transition sm:gap-2 sm:rounded-xl sm:px-2.5 sm:py-2.5 lg:gap-3 lg:rounded-2xl lg:p-4 ${
                  isActive
                    ? 'border-brand-500 bg-brand-50/70 shadow-[0_6px_20px_-8px_rgba(15,111,209,0.45)]'
                    : 'border-dashed border-brand-300 bg-white hover:border-brand-400 hover:bg-brand-50/40'
                }`}
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:h-8 sm:w-8 sm:rounded-lg lg:h-12 lg:w-12 lg:rounded-xl ${
                    isActive ? 'bg-brand-500 text-white' : 'bg-brand-50 text-brand-500'
                  }`}
                >
                  <Icon className="h-6 w-6 sm:h-4.5 sm:w-4.5 lg:h-7 lg:w-7" aria-hidden />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-[15px] leading-snug font-semibold uppercase text-brand-600 sm:line-clamp-1 sm:pr-4 sm:text-[12.5px] lg:line-clamp-2 lg:pr-0 lg:text-base">
                    {title}
                  </span>
                  {facts.map((fact) => (
                    <span
                      key={fact.label}
                      className={`mt-0.5 block text-theme-xs leading-snug text-gray-600 sm:truncate sm:text-[10.5px] lg:whitespace-normal lg:text-theme-xs ${
                        compactFact ? 'sm:hidden lg:block' : ''
                      }`}
                    >
                      {fact.label}: <strong className="font-semibold text-gray-800">{fact.value}</strong>
                    </span>
                  ))}
                  {compactFact && (
                    <span className="mt-0.5 hidden truncate text-[10.5px] leading-snug text-gray-600 sm:block lg:hidden">
                      {compactFact}
                    </span>
                  )}
                </span>

                {/* iPad: mui ten len goc tren phai, canh dong ten (dong ten chua cho
                    bang pr-4); cac dong so lieu ben duoi dung het be ngang */}
                <FiChevronDown
                  className={`h-5 w-5 shrink-0 text-brand-500 transition-transform sm:absolute sm:right-2 sm:top-2 sm:h-3.5 sm:w-3.5 lg:static lg:h-5 lg:w-5 ${
                    isActive ? 'rotate-180' : ''
                  }`}
                  aria-hidden
                />
              </button>
            </div>
          );
        }).flatMap((item, index) =>
          isPhone && openId !== null && tiles[index].id === openId
            ? [
                item,
                <TilePanel key={`${openId}-panel`} id={openId} inline>
                  {panel}
                </TilePanel>,
              ]
            : [item],
        )}
      </div>

      {!isPhone && openId !== null && <TilePanel id={openId}>{panel}</TilePanel>}
    </>
  );
};

/** Khung noi dung so xuong (duoi hang the, hoac ngay duoi the tren dien thoai) */
const TilePanel = ({
  id,
  inline = false,
  children,
}: {
  id: string;
  /** Nam trong luoi the (dien thoai): khoang cach da co tu gap cua luoi */
  inline?: boolean;
  children: ReactNode;
}) => (
  <div
    id={`fund-panel-${id}`}
    className={`rounded-2xl border border-dashed border-brand-300 bg-white p-3 sm:p-5 lg:p-6 ${
      inline ? 'min-w-0' : 'mt-3 sm:mt-4'
    }`}
  >
    {children}
  </div>
);

const unitsFact = (phase: ProjectPhase) => ({
  label: 'Số lượng sản phẩm',
  value: formatNumber(phase.totalUnits),
});

/** Noi dung cua nhom gom nhieu toa: them mot hang the toa, chon toa -> tab con */
const TowerGroupPanel = ({
  project,
  group,
  initialTowerId,
}: {
  project: ProjectDetail;
  group: FundGroup & { towers: NonNullable<FundGroup['towers']> };
  /** Toa mo san (VD vao tu tab "Phan khu"); bo trong thi mo toa dau tien */
  initialTowerId?: string;
}) => {
  // Mo nhom thi mot toa so san - thay noi dung ngay, khong phai bam them
  const [towerId, setTowerId] = useState<string | null>(
    () =>
      group.towers.find((item) => item.publicId === initialTowerId)?.publicId ??
      group.towers[0]?.publicId ??
      null,
  );
  const tower = group.towers.find((item) => item.publicId === towerId);

  return (
    <>
      <TileRow
        label={`Các toà nhà ${group.name}`}
        selectedId={towerId}
        onSelect={setTowerId}
        tiles={group.towers.map((item) => ({
          id: item.publicId,
          icon: HiOutlineBuildingOffice2,
          title: item.name,
          facts: [
            { label: 'Phân khu', value: group.name.toUpperCase() },
            { label: 'Số tầng', value: String(item.floors) },
          ],
          compactFact: `${item.floors} tầng`,
        }))}
        panel={
          tower && <PhaseTabs key={tower.publicId} project={project} phase={tower} highRise />
        }
      />
    </>
  );
};

/** Nhom (fundGroups) chua phan khu / toa co publicId nay */
const findGroupOfPhase = (groups: FundGroup[], phaseId: string) =>
  groups.find(
    (group) =>
      group.phase?.publicId === phaseId ||
      group.towers?.some((tower) => tower.publicId === phaseId),
  );

const PhaseFundTab = ({
  project,
  initialPhaseId,
}: {
  project: ProjectDetail;
  /**
   * Phan khu mo san - VD bam the phan khu o tab "Phan khu". Du an co nhom
   * (Blanca City) thi mo nhom chua no, va neu la toa thi mo dung toa do.
   */
  initialPhaseId?: string;
}) => {
  // Vao tab la mot the so san, nguoi xem thay noi dung ngay
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    if (initialPhaseId) {
      const groupOfPhase = project.fundGroups
        ? findGroupOfPhase(project.fundGroups, initialPhaseId)
        : undefined;
      if (groupOfPhase) return groupOfPhase.publicId;
      if (project.phases.some((item) => item.publicId === initialPhaseId)) return initialPhaseId;
    }
    return project.fundGroups?.[0]?.publicId ?? project.phases[0]?.publicId ?? null;
  });

  const groups = project.fundGroups ?? [];

  if (groups.length > 0) {
    const group = groups.find((item) => item.publicId === selectedId);

    return (
      <div>
        <TileRow
          label="Phân khu dự án"
          selectedId={selectedId}
          onSelect={setSelectedId}
          tiles={groups.map((item) => ({
            id: item.publicId,
            icon: item.towers?.length || item.segment === 'thap-tang'
              ? HiOutlineMap
              : HiOutlineBuildingOffice2,
            title: item.name,
            facts: item.towers?.length
              ? [{ label: 'Tổng toà nhà', value: String(item.towers.length) }]
              : item.phase
                ? [unitsFact(item.phase)]
                : [],
          }))}
          panel={
            group &&
            (group.towers?.length ? (
              <TowerGroupPanel
                key={group.publicId}
                project={project}
                group={{ ...group, towers: group.towers }}
                initialTowerId={initialPhaseId}
              />
            ) : (
              group.phase && (
                <PhaseTabs
                  key={group.publicId}
                  project={project}
                  phase={group.phase}
                  highRise={group.segment === 'cao-tang'}
                />
              )
            ))
          }
        />
      </div>
    );
  }

  if (project.phases.length === 0) {
    return <FloorPlanTab planMap={project.planMap} />;
  }

  // Du an chua khai bao nhom: moi phan khu mot the, mot cap
  const phase = project.phases.find((item) => item.publicId === selectedId);

  return (
    <div>
      <TileRow
        label="Phân khu dự án"
        selectedId={selectedId}
        onSelect={setSelectedId}
        tiles={project.phases.map((item) => ({
          id: item.publicId,
          icon: project.segment === 'cao-tang' ? HiOutlineBuildingOffice2 : HiOutlineMap,
          title: item.name,
          facts: [
            { label: 'Loại hình', value: SEGMENT_SHORT_LABELS[project.segment] },
            unitsFact(item),
          ],
        }))}
        panel={
          phase && (
            <PhaseTabs
              key={phase.publicId}
              project={project}
              phase={phase}
              highRise={project.segment === 'cao-tang'}
            />
          )
        }
      />
    </div>
  );
};

export default PhaseFundTab;
