'use client';

import { FiSearch } from 'react-icons/fi';

export type SearchBoxProps = {
  query: string;
  label: string;
  listboxId: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
};

const SearchBox = ({
  query,
  label,
  listboxId,
  inputRef,
  onChange,
  onKeyDown,
}: SearchBoxProps) => (
  <div className="relative border-b border-gray-100 p-2">
    <FiSearch
      aria-hidden
      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
    />
    <input
      ref={inputRef}
      type="text"
      value={query}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={onKeyDown}
      placeholder="Tìm kiếm..."
      aria-label={`Tìm trong ${label}`}
      aria-controls={listboxId}
      className="h-9 w-full rounded-md bg-gray-50 pl-8 pr-3 text-theme-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:bg-white focus:shadow-focus-ring"
    />
  </div>
);

export default SearchBox;