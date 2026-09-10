'use client';

import { type FormEvent } from 'react';
import { FiMapPin, FiSearch, FiTag, FiX } from 'react-icons/fi';
import FilterSelect from '@/common/components/FilterSelect';
import {
  INVESTOR_SORT_LABELS,
  INVESTOR_MIN_PROJECT_OPTIONS,
  type InvestorFilterOptions,
  type InvestorFilterValues,
  type InvestorSort,
} from '../models/investor.model';

const SORT_OPTIONS = Object.entries(INVESTOR_SORT_LABELS).map(
  ([value, label]) => ({ value, label } as { value: InvestorSort; label: string }),
);

type InvestorFilterBarProps = {
  values: InvestorFilterValues;
  options: InvestorFilterOptions;
  isLoadingOptions: boolean;
  /** So o loc dang bat - hien tren nut Xoa tat ca */
  activeCount: number;
  onClearAll: () => void;
  /** Ap tu khoa ngay lap tuc, bo qua do tre go phim */
  onSubmitSearch: () => void;
  /**
   * Nhan mot lan nhieu cap nhat cung luc.
   *
   * Khong tach thanh onChange(key, value) goi lien tiep: moi lan goi deu dung
   * URL hien tai lam goc, nen hai lan goi trong cung mot su kien se de lan
   * sau ghi de lan truoc.
   */
  onChange: (updates: Partial<InvestorFilterValues>) => void;
  /** Sort value va onChange cho sap xep */
  sort: InvestorSort;
  onSortChange: (sort: InvestorSort) => void;
};

/** Goi onChange cho dung mot o loc - phan lon truong hop la the nay */
export const setOne = <K extends keyof InvestorFilterValues>(
  onChange: (updates: Partial<InvestorFilterValues>) => void,
  key: K,
  value: InvestorFilterValues[K],
) => onChange({ [key]: value } as Partial<InvestorFilterValues>);

const InvestorFilterBar = ({
  values,
  options,
  isLoadingOptions,
  activeCount,
  onClearAll,
  onSubmitSearch,
  onChange,
  sort,
  onSortChange,
}: InvestorFilterBarProps) => {
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmitSearch();
  };

  const hasActiveFilter = activeCount > 0;

  return (
    <div>
      {/* ── Hang 1: tim kiem + sap xep ─────────────────────────────────── */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
        <form
          onSubmit={submit}
          role="search"
          className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-gray-200 bg-white py-2 pl-5 pr-2 shadow-card transition focus-within:border-brand-300 focus-within:shadow-panel lg:max-w-2xl"
        >
          <input
            type="search"
            value={values.search}
            onChange={(event) => setOne(onChange, 'search', event.target.value)}
            placeholder="Tìm theo tên chủ đầu tư..."
            aria-label="Tìm kiếm chủ đầu tư"
            className="h-9 min-w-0 flex-1 bg-transparent text-base text-gray-800 outline-none placeholder:text-gray-400"
          />
          <button
            type="submit"
            aria-label="Tìm kiếm"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-brand-50 hover:text-brand-600"
          >
            <FiSearch aria-hidden className="text-lg" />
          </button>
        </form>

        <div className="flex items-center gap-2 lg:ml-auto">
          <span className="text-theme-sm font-semibold uppercase tracking-wide text-gray-500">
            Sắp xếp
          </span>
          <FilterSelect
            variant="chip"
            label="Sắp xếp"
            icon={<FiTag />}
            value={sort}
            options={SORT_OPTIONS}
            isLoading={false}
            onChange={(next) =>
              onSortChange((next as InvestorSort) ?? 'mac-dinh')
            }
          />
        </div>
      </div>

      {/* ── Hang 2: chip loc ────────────────────────────────────────────── */}
      <div className="no-scrollbar -mx-4 mt-3 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {/* Khu vuc */}
        <FilterSelect
          key="regionId"
          variant="chip"
          label="Khu vực"
          icon={<FiMapPin />}
          value={values.regionId}
          options={options.regions}
          isLoading={isLoadingOptions}
          onChange={(next) => setOne(onChange, 'regionId', next)}
        />

        {/* So du an toi thieu */}
        <FilterSelect
          key="minProjectCount"
          variant="chip"
          label="Quy mô"
          icon={<FiTag />}
          value={
            values.minProjectCount !== null
              ? String(values.minProjectCount)
              : null
          }
          options={INVESTOR_MIN_PROJECT_OPTIONS.map((opt) => ({
            value: String(opt.value),
            label: opt.label,
          }))}
          isLoading={isLoadingOptions}
          onChange={(next) =>
            setOne(
              onChange,
              'minProjectCount',
              next !== null ? Number(next) : null,
            )
          }
        />

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="shrink-0 whitespace-nowrap px-2 text-theme-sm font-medium text-gray-500 underline underline-offset-2 transition hover:text-error-600"
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {/* ── Hang 3: bo loc hau can ─────────────────────────────────────── */}
      <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-gray-25 px-4 py-3">
        {/* Dang mo ban */}
        <label className="flex cursor-pointer items-center gap-2 text-theme-sm text-gray-700">
          <input
            type="checkbox"
            checked={values.hasOpening}
            onChange={(event) =>
              setOne(onChange, 'hasOpening', event.target.checked)
            }
            className="h-4.5 w-4.5 shrink-0 accent-brand-500"
          />
          Có dự án đang mở bán
        </label>

        {/* Con hang */}
        <label className="flex cursor-pointer items-center gap-2 text-theme-sm text-gray-700">
          <input
            type="checkbox"
            checked={values.hasAvailableUnits}
            onChange={(event) =>
              setOne(onChange, 'hasAvailableUnits', event.target.checked)
            }
            className="h-4.5 w-4.5 shrink-0 accent-brand-500"
          />
          Có căn còn hàng
        </label>

        {hasActiveFilter && (
          <button
            type="button"
            onClick={onClearAll}
            className="ml-auto flex items-center gap-1 text-theme-sm font-medium text-gray-500 underline underline-offset-2 transition hover:text-error-600"
          >
            <FiX aria-hidden className="text-base" />
            Xóa hết
          </button>
        )}
      </div>
    </div>
  );
};

export default InvestorFilterBar;
