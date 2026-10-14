'use client';

import { useEffect, useRef, useState } from 'react';
import type { IconType } from 'react-icons';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FiCalendar, FiCheck, FiChevronDown, FiRotateCcw, FiSearch, FiSliders } from 'react-icons/fi';

export type HeroFilterSelect = {
  /** Ten tham so tren URL */
  param: string;
  label: string;
  icon: IconType;
  options: { value: string; label: string }[];
  /** Nhan cua lua chon rong */
  allLabel?: string;
};

type HeroFilterBarProps = {
  searchPlaceholder: string;
  selects: HeroFilterSelect[];
  /** Them hai o Tu ngay / Den ngay (?from=&to=) */
  withDateRange?: boolean;
  /** Tham so bi xoa khi doi bo loc (VD ?page) */
  resetParams?: string[];
};

/**
 * Bo loc dung chung cho cac trang danh sach co banner (Su kien, Tin tuc...):
 * the trang noi tren banner, moi o co icon + nhan nho, nut "Xoa loc".
 * Duoi 1024px gap lai: o tim kiem + nut "Loc" (hien so o dang loc), bam moi
 * mo cac o con lai thanh luoi 2 cot.
 *
 * Gia tri nam tren URL (?q=&...) - trang server doc lai va loc. O tim kiem doi
 * 350ms sau khi ngung go moi cap nhat URL.
 */
const HeroFilterBar = ({ searchPlaceholder, selects, withDateRange = false, resetParams = [] }: HeroFilterBarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get('q') ?? '');
  const [isExpanded, setIsExpanded] = useState(false);

  const filterKeys = [...selects.map((select) => select.param), ...(withDateRange ? ['from', 'to'] : [])];

  const update = (patch: Record<string, string>) => {
    const next = new URLSearchParams(searchParams.toString());
    resetParams.forEach((key) => next.delete(key));
    Object.entries(patch).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  useEffect(() => {
    if (keyword === (searchParams.get('q') ?? '')) return undefined;
    const timer = setTimeout(() => update({ q: keyword.trim() }), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chi theo chu dang go
  }, [keyword]);

  const activeFilterCount = filterKeys.filter((key) => searchParams.get(key)).length;
  const hasFilter = activeFilterCount > 0 || Boolean(searchParams.get('q'));

  const clearAll = () => {
    setKeyword('');
    router.replace(pathname, { scroll: false });
  };

  const box =
    'flex h-14 min-w-0 items-center gap-2.5 rounded-xl border bg-white px-3 transition focus-within:border-brand-400 focus-within:shadow-focus-ring sm:gap-3 sm:px-3.5';
  const boxTone = (active: boolean) => (active ? 'border-brand-300' : 'border-gray-200');

  const searchBox = (className: string) => (
    <label className={`${box} ${boxTone(Boolean(keyword))} ${className}`}>
      <FiSearch aria-hidden className="h-5 w-5 shrink-0 text-gray-400" />
      <input
        type="search"
        value={keyword}
        onChange={(change) => setKeyword(change.target.value)}
        placeholder={searchPlaceholder}
        aria-label={searchPlaceholder}
        className="min-w-0 flex-1 bg-transparent text-theme-sm text-gray-800 outline-none placeholder:text-gray-400"
      />
    </label>
  );

  const dateBox = (key: 'from' | 'to', label: string) => (
    <label key={key} className={`${box} ${boxTone(Boolean(searchParams.get(key)))}`}>
      <FiCalendar aria-hidden className="h-5 w-5 shrink-0 text-brand-500" />
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] leading-tight text-gray-500">{label}</span>
        <input
          type="date"
          value={searchParams.get(key) ?? ''}
          onChange={(change) => update({ [key]: change.target.value })}
          className={`w-full bg-transparent text-theme-xs font-semibold outline-none sm:text-theme-sm ${
            searchParams.get(key) ? 'text-gray-800' : 'text-gray-400'
          }`}
        />
      </span>
    </label>
  );

  const fieldCount = selects.length + (withDateRange ? 2 : 0);

  return (
    <div className="rounded-2xl border border-white/70 bg-white/95 p-3 shadow-theme-lg backdrop-blur md:p-4">
      {/* Duoi 1024px: o tim + nut Loc */}
      <div className="flex gap-2 lg:hidden">
        {searchBox('flex-1')}
        <button
          type="button"
          onClick={() => setIsExpanded((open) => !open)}
          aria-expanded={isExpanded}
          className={`relative inline-flex h-14 shrink-0 items-center gap-2 rounded-xl border px-4 text-theme-sm font-semibold transition ${
            isExpanded || activeFilterCount > 0
              ? 'border-brand-400 bg-brand-50 text-brand-700'
              : 'border-gray-200 bg-white text-gray-700'
          }`}
        >
          <FiSliders aria-hidden className="h-4 w-4" />
          Lọc
          {activeFilterCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[11px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
          <FiChevronDown aria-hidden className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div
        className={`${isExpanded ? 'grid' : 'hidden'} mt-3 grid-cols-2 gap-2.5 sm:gap-3 lg:mt-0 lg:grid lg:grid-cols-[var(--hero-cols)]`}
        style={{ ['--hero-cols' as string]: `minmax(0,1.4fr) repeat(${fieldCount}, minmax(0,1fr)) auto` }}
      >
        {searchBox('hidden lg:flex')}
        {selects.map(({ param, label, icon: Icon, options, allLabel = 'Tất cả' }) => (
          <DropdownSelect
            key={param}
            label={label}
            icon={Icon}
            value={searchParams.get(param) ?? ''}
            options={[{ value: '', label: allLabel }, ...options]}
            onChange={(value) => update({ [param]: value })}
            className={`${box} ${boxTone(Boolean(searchParams.get(param)))}`}
          />
        ))}
        {withDateRange && dateBox('from', 'Từ ngày')}
        {withDateRange && dateBox('to', 'Đến ngày')}
        <button
          type="button"
          onClick={clearAll}
          disabled={!hasFilter}
          className="col-span-2 inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 text-theme-sm font-semibold text-gray-700 transition hover:border-brand-300 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-50 lg:col-span-1 lg:h-14"
        >
          <FiRotateCcw aria-hidden className="h-4 w-4" />
          Xóa lọc
        </button>
      </div>
    </div>
  );
};

/**
 * O chon tu ve (thay <select> mac dinh cua trinh duyet): bang tha xuong bo
 * goc, co dau tich o muc dang chon. Bam ra ngoai / Esc thi dong.
 */
const DropdownSelect = ({
  label,
  icon: Icon,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  icon: IconType;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  className: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!isOpen) return undefined;
    const onPointer = (event: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('touchstart', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('touchstart', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`${className} w-full text-left ${isOpen ? 'border-brand-400 shadow-focus-ring' : ''}`}
      >
        <Icon aria-hidden className="h-5 w-5 shrink-0 text-brand-500" />
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] leading-tight text-gray-500">{label}</span>
          <span className="block truncate text-theme-sm font-semibold text-gray-800">{current.label}</span>
        </span>
        <FiChevronDown
          aria-hidden
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${isOpen ? 'rotate-180 text-brand-500' : ''}`}
        />
      </button>

      {isOpen && (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute top-full right-0 left-0 z-30 mt-2 max-h-72 min-w-48 overflow-y-auto rounded-xl border border-gray-100 bg-white p-1.5 shadow-theme-lg"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li key={option.value || 'all'}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-theme-sm transition ${
                    isSelected ? 'bg-brand-50 font-semibold text-brand-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                  {isSelected && <FiCheck aria-hidden className="h-4 w-4 shrink-0 text-brand-600" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default HeroFilterBar;
