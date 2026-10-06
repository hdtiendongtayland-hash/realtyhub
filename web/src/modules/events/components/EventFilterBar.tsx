'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FiCalendar, FiChevronDown, FiSearch, FiX } from 'react-icons/fi';
import { EVENT_TYPE_FILTERS, EVENT_TYPE_LABELS } from '../models/event.model';

const STATUS_OPTIONS = [
  { value: 'upcoming', label: 'Sắp diễn ra' },
  { value: 'ongoing', label: 'Đang diễn ra' },
  { value: 'full', label: 'Đã đầy' },
  { value: 'past', label: 'Đã kết thúc' },
];

const FILTER_KEYS = ['q', 'type', 'status', 'from', 'to'] as const;

/**
 * Thanh loc trang Su kien: tim kiem, loai, trang thai, khoang ngay.
 *
 * Gia tri nam tren URL (?q=&type=&status=&from=&to=) - trang server doc lai va
 * loc; tai lai trang / chia se link van giu bo loc. O tim kiem doi 350ms sau
 * khi ngung go moi cap nhat URL.
 */
const EventFilterBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get('q') ?? '');

  const update = (patch: Partial<Record<(typeof FILTER_KEYS)[number], string>>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  // Go xong 350ms moi loc - tranh doi URL tung phim
  useEffect(() => {
    if (keyword === (searchParams.get('q') ?? '')) return undefined;
    const timer = setTimeout(() => update({ q: keyword.trim() }), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chi theo chu dang go
  }, [keyword]);

  const hasFilter = FILTER_KEYS.some((key) => searchParams.get(key));

  // Cung kieu khung loc o trang du an: nhan in hoa nho tren, o cao 48px bo goc
  const field =
    'h-11 w-full rounded-lg border bg-white text-theme-sm outline-none transition placeholder:text-gray-400 focus:border-brand-400 focus:shadow-focus-ring';

  const labelOf = (text: string) => (
    <span className="mb-1.5 block text-[11px] font-semibold tracking-wide text-gray-600 uppercase">{text}</span>
  );

  const select = (
    key: 'type' | 'status',
    label: string,
    placeholder: string,
    options: { value: string; label: string }[],
  ) => (
    <label className="block">
      {labelOf(label)}
      <span className="relative block">
        <select
          value={searchParams.get(key) ?? ''}
          onChange={(change) => update({ [key]: change.target.value })}
          className={`${field} appearance-none truncate pr-9 pl-3 ${searchParams.get(key) ? 'border-brand-300 text-gray-900' : 'border-gray-200 text-gray-400'}`}
        >
          <option value="">{placeholder}</option>
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

  const dateField = (key: 'from' | 'to', label: string) => (
    <label className="block">
      {labelOf(label)}
      <input
        type="date"
        value={searchParams.get(key) ?? ''}
        onChange={(change) => update({ [key]: change.target.value })}
        className={`${field} px-3 ${searchParams.get(key) ? 'border-brand-300 text-gray-900' : 'border-gray-200 text-gray-400'}`}
      />
    </label>
  );

  return (
    <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs md:mb-10 md:p-6">
      <div className="grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_repeat(4,minmax(0,1fr))_auto] lg:items-end">
        <label className="block sm:col-span-2 lg:col-span-1">
          {labelOf('Tìm kiếm')}
          <span className="relative block">
            <FiSearch
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              value={keyword}
              onChange={(change) => setKeyword(change.target.value)}
              placeholder="Tên sự kiện"
              aria-label="Tìm kiếm sự kiện"
              className={`${field} pr-3 pl-9 text-gray-900 ${keyword ? 'border-brand-300' : 'border-gray-200'}`}
            />
          </span>
        </label>
        {select(
          'type',
          'Loại sự kiện',
          'Loại sự kiện',
          EVENT_TYPE_FILTERS.map((type) => ({ value: type, label: EVENT_TYPE_LABELS[type] })),
        )}
        {select('status', 'Trạng thái', 'Trạng thái', STATUS_OPTIONS)}
        {dateField('from', 'Từ ngày')}
        {dateField('to', 'Đến ngày')}
        <button
          type="button"
          onClick={() => {
            setKeyword('');
            router.replace(pathname, { scroll: false });
          }}
          disabled={!hasFilter}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-5 text-theme-sm font-medium text-gray-600 transition hover:border-brand-300 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40 sm:col-span-2 lg:col-span-1"
        >
          <FiX aria-hidden />
          Xóa lọc
        </button>
      </div>
    </div>
  );
};

export default EventFilterBar;
