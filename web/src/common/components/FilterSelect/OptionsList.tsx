'use client';

import { FiCheck } from 'react-icons/fi';

import { RESET_VALUE } from './types';
import type { SelectOption } from './types';

export type OptionsListProps = {
  rows: SelectOption[];
  value: string | null;
  label: string;
  listboxId: string;
  activeIndex: number;
  optionRefs: React.MutableRefObject<(HTMLLIElement | null)[]>;
  onSelect: (option: SelectOption) => void;
  onHover: (index: number) => void;
};

const OptionsList = ({
  rows,
  value,
  label,
  listboxId,
  activeIndex,
  optionRefs,
  onSelect,
  onHover,
}: OptionsListProps) => {
  if (rows.length === 0) {
    return (
      <p className="px-4 py-6 text-center text-theme-sm text-gray-400">
        Không tìm thấy kết quả
      </p>
    );
  }

  return (
    <ul
      id={listboxId}
      role="listbox"
      aria-label={label}
      className="flex-1 overflow-y-auto py-1"
    >
      {rows.map((row, index) => {
        const isReset = row.value === RESET_VALUE;
        const isSelected = isReset ? !value : row.value === value;
        const isActive = index === activeIndex;

        return (
          <li
            key={row.value}
            id={`${listboxId}-option-${index}`}
            ref={(node) => {
              optionRefs.current[index] = node;
            }}
            role="option"
            aria-selected={isSelected}
            onClick={() => onSelect(row)}
            onMouseEnter={() => onHover(index)}
            className={`flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-theme-sm transition ${
              isActive ? 'bg-brand-50' : ''
            } ${
              isSelected
                ? 'font-medium text-brand-700'
                : isReset
                  ? 'text-gray-500'
                  : 'text-gray-700'
            }`}
          >
            <span className="truncate">{row.label}</span>
            {isSelected && (
              <FiCheck aria-hidden className="shrink-0 text-brand-500" />
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default OptionsList;