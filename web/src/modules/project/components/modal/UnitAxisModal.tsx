'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiChevronUp,
  FiExternalLink,
  FiX,
} from 'react-icons/fi';
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2';
import { formatBillion, formatNumber } from '@/common/utils/format';
import {
  MAX_UNIT_SELECTION,
  UNIT_STATUS_LABELS,
  type ProjectUnit,
  type UnitStatus,
} from '../../models/project-detail.model';

/**
 * Bang "Thong tin truc can": moi can cung TRUC (cung cot can, cung toa) voi
 * can vua bam dup tren ban do mat bang - khac nhau o tang, gia va tinh trang.
 * Moi gioi dung de so gia cac tang cua cung mot truc.
 *
 * Chi co y nghia voi du an cao tang; noi goi tu quyet dinh co mo hay khong.
 * Nam o z-40, duoi popup chi tiet can (z-50): bam ma can trong bang thi popup
 * mo de len tren, dong popup la quay lai dung bang nay.
 */

const PAGE_SIZE = 20;

type SortKey =
  | 'code'
  | 'listedPrice'
  | 'netPrice'
  | 'fullPrice'
  | 'propertyTypeLabel'
  | 'landArea'
  | 'floor'
  | 'direction'
  | 'phaseName'
  | 'status';

const floorNumber = (unit: ProjectUnit) => Number(unit.floor?.match(/\d+/)?.[0] ?? 0);

/** Gia thanh toan du: gia full VAT, du lieu thieu thi lay gia niem yet */
const fullPrice = (unit: ProjectUnit) => unit.fullVatPrice ?? unit.listedPrice;

const SORT_VALUE: Record<SortKey, (unit: ProjectUnit) => string | number> = {
  code: (unit) => unit.code,
  listedPrice: (unit) => unit.listedPrice,
  netPrice: (unit) => unit.netPrice,
  fullPrice,
  propertyTypeLabel: (unit) => unit.propertyTypeLabel,
  landArea: (unit) => unit.landArea,
  floor: floorNumber,
  direction: (unit) => unit.direction,
  phaseName: (unit) => unit.phaseName,
  status: (unit) => unit.status,
};

const COLUMNS: { key: SortKey; label: string; className?: string }[] = [
  { key: 'code', label: 'Mã căn' },
  { key: 'listedPrice', label: 'Giá bán' },
  { key: 'netPrice', label: 'Giá TTS' },
  { key: 'fullPrice', label: 'Giá TTĐ' },
  { key: 'propertyTypeLabel', label: 'Loại hình' },
  { key: 'landArea', label: 'DT thông thủy' },
  { key: 'floor', label: 'Tầng' },
  { key: 'direction', label: 'Hướng' },
  { key: 'phaseName', label: 'Toà nhà' },
];

/** Cham mau tinh trang - trung STATUS_TONES cua Bang hang (UnitsTab) */
const STATUS_TONES: Record<UnitStatus, string> = {
  'con-hang': 'bg-success-500',
  'giu-cho': 'bg-gold-400',
  'da-ban': 'bg-gray-400',
};

type UnitAxisModalProps = {
  /** Can vua bam dup - null la dong */
  unit: ProjectUnit | null;
  /** Moi can cung truc voi `unit`, ke ca chinh no */
  units: ProjectUnit[];
  onClose: () => void;
  /** Bam ma can / phieu tinh gia: mo popup chi tiet can do */
  onOpenUnit: (unit: ProjectUnit) => void;
  /**
   * Popup chi tiet can dang mo de len tren: nhuong phim Escape cho no, va
   * khoa cuon trang lai sau khi no dong (no tra `overflow` ve rong).
   */
  suspended?: boolean;
};

const UnitAxisModal = ({ unit, units, onClose, onOpenUnit, suspended = false }: UnitAxisModalProps) => {
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({
    key: 'floor',
    dir: 'desc',
  });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [lastUnitId, setLastUnitId] = useState(unit?.publicId);

  // Mo truc khac: ve trang dau, bo cac o da chon
  if (lastUnitId !== unit?.publicId) {
    setLastUnitId(unit?.publicId);
    setPage(1);
    setSelected([]);
  }

  const isOpen = unit !== null;

  useEffect(() => {
    if (!isOpen || suspended) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, suspended, onClose]);

  const sorted = useMemo(() => {
    const getValue = SORT_VALUE[sort.key];
    const factor = sort.dir === 'asc' ? 1 : -1;
    return [...units].sort((a, b) => {
      const left = getValue(a);
      const right = getValue(b);
      const result =
        typeof left === 'number' && typeof right === 'number'
          ? left - right
          : String(left).localeCompare(String(right), 'vi', { numeric: true });
      return result * factor;
    });
  }, [units, sort]);

  if (!unit) return null;

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const rows = sorted.slice(start, start + PAGE_SIZE);
  const isAtLimit = selected.length >= MAX_UNIT_SELECTION;

  const toggleSort = (key: SortKey) =>
    setSort((current) =>
      current.key === key
        ? { key, dir: current.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' },
    );

  const toggleSelected = (publicId: string) =>
    setSelected((current) =>
      current.includes(publicId)
        ? current.filter((id) => id !== publicId)
        : current.length >= MAX_UNIT_SELECTION
          ? current
          : [...current, publicId],
    );

  const pageButton = 'flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition enabled:hover:bg-gray-200 enabled:hover:text-gray-800 disabled:text-gray-300';

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 max-md:items-end max-md:p-0"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unit-axis-title"
    >
      <button
        type="button"
        aria-label="Đóng"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      <div className="relative flex max-h-[85vh] w-full max-w-6xl flex-col xl:max-h-[92vh] xl:max-w-[1270px] overflow-hidden rounded-2xl bg-white shadow-2xl max-md:max-h-[90dvh] max-md:rounded-b-none">
        {/* Dau bang: nen xanh, icon toa nha, ten truc */}
        <div className="flex shrink-0 items-center gap-3 brand-gradient px-4 py-3.5 text-white sm:px-6 sm:py-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
            <HiOutlineBuildingOffice2 className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="unit-axis-title" className="truncate text-base font-bold sm:text-lg">
              Thông tin trục căn {unit.code}
            </h2>
            <p className="text-theme-xs text-white/80">
              {unit.phaseName} · Trục {unit.unitLine ?? '--'} · {total} căn
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng bảng trục căn"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 transition hover:bg-white/30"
          >
            <FiX className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {/* Bang: cuon ngang + doc trong khung, dau cot dinh khi cuon doc */}
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full min-w-[1000px] border-collapse text-left">
            <thead className="sticky top-0 z-20 bg-gray-50 text-theme-xs font-semibold tracking-wide text-gray-500 uppercase">
              <tr>
                <th scope="col" className="border-b border-gray-200 px-3 py-3 text-center">
                  STT
                </th>
                <th scope="col" className="border-b border-gray-200 px-3 py-3 text-center">
                  So sánh
                </th>
                {COLUMNS.map((column) => {
                  const isSorted = sort.key === column.key;
                  const SortIcon = isSorted && sort.dir === 'asc' ? FiChevronUp : FiChevronDown;
                  return (
                    <th
                      key={column.key}
                      scope="col"
                      aria-sort={
                        isSorted ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'
                      }
                      className={`border-b border-gray-200 px-3 py-3 whitespace-nowrap ${
                        column.key === 'code'
                          ? 'sticky left-0 z-10 bg-gray-50 shadow-[1px_0_0_var(--color-gray-200)]'
                          : ''
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleSort(column.key)}
                        className={`inline-flex items-center gap-1 transition hover:text-brand-600 ${
                          isSorted ? 'text-brand-600' : ''
                        }`}
                      >
                        {column.label}
                        <SortIcon
                          className={`h-3.5 w-3.5 ${isSorted ? '' : 'text-gray-400'}`}
                          aria-hidden
                        />
                      </button>
                    </th>
                  );
                })}
                <th scope="col" className="border-b border-gray-200 px-3 py-3 text-center">
                  PTG
                </th>
                <th scope="col" className="border-b border-gray-200 px-3 py-3 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => toggleSort('status')}
                    className={`inline-flex items-center gap-1 transition hover:text-brand-600 ${
                      sort.key === 'status' ? 'text-brand-600' : ''
                    }`}
                  >
                    Tình trạng
                    <FiChevronDown className="h-3.5 w-3.5 text-gray-400" aria-hidden />
                  </button>
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, index) => {
                const isCurrent = row.publicId === unit.publicId;
                const isChecked = selected.includes(row.publicId);
                return (
                  <tr
                    key={row.publicId}
                    className={`border-b border-gray-100 transition last:border-0 ${
                      // Mau dac (khong trong suot): o Ma can dinh trai ke thua
                      // nen nay, trong suot thi chu cot ben duoi lo qua khi cuon
                      isCurrent || isChecked ? 'bg-brand-25' : 'bg-white hover:bg-gray-25'
                    }`}
                  >
                    <td className="px-3 py-2.5 text-center text-theme-sm text-gray-500">{start + index + 1}</td>
                    <td className="px-3 py-2.5 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={!isChecked && isAtLimit}
                        onChange={() => toggleSelected(row.publicId)}
                        aria-label={`Chọn so sánh căn ${row.code}`}
                        className="h-4 w-4 cursor-pointer rounded-full border-gray-300 accent-brand-500 disabled:cursor-not-allowed disabled:opacity-40"
                      />
                    </td>
                    {/* Dinh trai khi cuon ngang: nen ke thua mau hang */}
                    <td className="sticky left-0 z-[1] bg-inherit px-3 py-2.5 shadow-[1px_0_0_var(--color-gray-100)]">
                      <button
                        type="button"
                        onClick={() => onOpenUnit(row)}
                        className="rounded bg-error-50 px-2 py-1 text-theme-xs font-bold whitespace-nowrap text-error-600 transition hover:bg-error-100 hover:text-error-700"
                      >
                        {row.code}
                      </button>
                    </td>
                    {[row.listedPrice, row.netPrice, fullPrice(row)].map((price, priceIndex) => (
                      <td
                        key={priceIndex}
                        className={`px-3 py-2.5 text-theme-sm whitespace-nowrap ${
                          priceIndex === 0 ? 'font-bold text-gray-900' : 'text-gray-600'
                        }`}
                      >
                        {price > 0 ? formatBillion(price) : 'Liên hệ'}
                      </td>
                    ))}
                    <td className="px-3 py-2.5 text-theme-sm whitespace-nowrap text-gray-600">
                      {row.propertyTypeLabel}
                    </td>
                    <td className="px-3 py-2.5 text-theme-sm whitespace-nowrap text-gray-600">
                      {formatNumber(row.landArea)} <span className="text-theme-xs text-gray-400">m²</span>
                    </td>
                    <td className="px-3 py-2.5 text-theme-sm text-gray-600">{row.floor ?? '--'}</td>
                    <td className="px-3 py-2.5 text-theme-sm whitespace-nowrap text-gray-600">{row.direction}</td>
                    <td className="px-3 py-2.5 text-theme-sm whitespace-nowrap text-gray-600 uppercase">{row.phaseName}</td>
                    <td className="px-3 py-2.5 text-center">
                      {/* Phieu tinh gia chi co voi can con giao dich duoc */}
                      {row.status !== 'da-ban' && (
                        <button
                          type="button"
                          onClick={() => onOpenUnit(row)}
                          aria-label={`Phiếu tính giá căn ${row.code}`}
                          title="Phiếu tính giá"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition hover:bg-brand-50 hover:text-brand-600"
                        >
                          <FiExternalLink className="h-4 w-4" aria-hidden />
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="flex items-center gap-1.5 text-theme-sm whitespace-nowrap text-gray-600">
                        <span
                          aria-hidden
                          className={`h-2 w-2 rounded-full ${STATUS_TONES[row.status]}`}
                        />
                        {UNIT_STATUS_LABELS[row.status]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Chan bang: so can da chon + phan trang */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-gray-50 px-4 py-2.5 text-theme-sm text-gray-600 max-md:text-xs sm:px-6">
          <span aria-live="polite">
            Đã chọn so sánh: <strong className="text-gray-800">{selected.length}</strong>/
            {MAX_UNIT_SELECTION}
            {selected.length > 0 && (
              <button
                type="button"
                onClick={() => setSelected([])}
                className="ml-3 font-medium text-brand-600 transition hover:text-brand-700"
              >
                Bỏ chọn
              </button>
            )}
          </span>

          <div className="flex items-center gap-1">
            <span className="mr-2">
              {total === 0 ? 0 : start + 1}–{Math.min(start + PAGE_SIZE, total)} trong tổng số{' '}
              {total}
            </span>
            <button
              type="button"
              onClick={() => setPage(1)}
              disabled={currentPage === 1}
              aria-label="Trang đầu"
              className={pageButton}
            >
              <FiChevronsLeft aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Trang trước"
              className={pageButton}
            >
              <FiChevronLeft aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Trang sau"
              className={pageButton}
            >
              <FiChevronRight aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setPage(totalPages)}
              disabled={currentPage === totalPages}
              aria-label="Trang cuối"
              className={pageButton}
            >
              <FiChevronsRight aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitAxisModal;
