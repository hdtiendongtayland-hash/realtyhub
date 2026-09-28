'use client';

import {
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from 'react';
import type { IconType } from 'react-icons';
import { FiChevronDown } from 'react-icons/fi';
import { HiOutlineBuildingOffice2, HiOutlineMap } from 'react-icons/hi2';
import { formatBillion, formatNumber } from '@/common/utils/format';
import { useProjectUnits } from '../../../hooks/useProjects';
import {
  DEFAULT_UNIT_QUERY,
  type FundGroup,
  UNIT_STATUS_LABELS,
  type ProjectDetail,
  type ProjectPhase,
  type UnitStatus,
} from '../../../models/project-detail.model';
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
              {['STT', 'Mã căn', 'Giá bán', 'Hướng', 'Diện tích (m²)', 'Loại SP', 'Trạng thái'].map(
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
                <td className="px-4 py-3 whitespace-nowrap">
                  {unit.listedPrice > 0 ? formatBillion(unit.listedPrice) : 'Liên hệ'}
                </td>
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

/** Bo tab con cua mot phan khu / toa */
const PhaseTabs = ({ project, phase }: { project: ProjectDetail; phase: ProjectPhase }) => {
  const [tab, setTab] = useState<InnerTabKey>('tong-quan');
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

  // Ban do rieng cua phan khu: chi giu pin thuoc phan khu nay
  const phasePlanMap = useMemo(
    () => ({
      ...project.planMap,
      markers: project.planMap.markers.filter((marker) => marker.phaseName === phase.name),
    }),
    [project.planMap, phase.name],
  );

  return (
    <div ref={rootRef} className="scroll-mt-[calc(4rem+var(--project-tabnav-h,57px))]">
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
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => changeTab(item.key)}
                className={`shrink-0 rounded-lg px-4 py-2.5 text-theme-sm whitespace-nowrap transition sm:flex-auto lg:flex-1 ${
                  isActive
                    ? 'bg-white font-semibold text-brand-600 shadow-sm'
                    : 'text-gray-700 hover:text-brand-600'
                }`}
              >
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
        <FloorPlanTab planMap={phasePlanMap} lockedPhaseName={phase.name} />
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
}: {
  project: ProjectDetail;
  group: FundGroup & { towers: NonNullable<FundGroup['towers']> };
}) => {
  // Mo nhom thi toa dau tien so san - thay noi dung ngay, khong phai bam them
  const [towerId, setTowerId] = useState<string | null>(group.towers[0]?.publicId ?? null);
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
        panel={tower && <PhaseTabs key={tower.publicId} project={project} phase={tower} />}
      />
    </>
  );
};

const PhaseFundTab = ({ project }: { project: ProjectDetail }) => {
  // Vao tab la the dau tien so san, nguoi xem thay noi dung ngay
  const [selectedId, setSelectedId] = useState<string | null>(
    () => project.fundGroups?.[0]?.publicId ?? project.phases[0]?.publicId ?? null,
  );

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
              />
            ) : (
              group.phase && (
                <PhaseTabs key={group.publicId} project={project} phase={group.phase} />
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
        panel={phase && <PhaseTabs key={phase.publicId} project={project} phase={phase} />}
      />
    </div>
  );
};

export default PhaseFundTab;
