'use client';

import type { ReactNode } from 'react';

import { FiChevronDown } from 'react-icons/fi';

import type { SelectOption } from './types';
import type { FilterSelectVariant } from './types';

export type TriggerProps = {
  label: string;
  selected: SelectOption | null;
  icon?: ReactNode;
  isOpen: boolean;
  variant: FilterSelectVariant;
  onClick: () => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  buttonRef: React.RefObject<HTMLButtonElement>;
};

const Trigger = ({
  label,
  selected,
  icon,
  isOpen,
  variant,
  onClick,
  onKeyDown,
  buttonRef,
}: TriggerProps) => {
  const isChip = variant === 'chip';

  const baseClass = isChip
    ? `flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full border pl-3.5 text-left text-theme-sm font-medium transition outline-none ${
        selected ? 'pr-8' : 'pr-3'
      } ${
        selected
          ? 'border-brand-500 bg-brand-50 text-brand-700'
          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
      } ${isOpen ? 'shadow-focus-ring' : ''}`
    : `flex h-11 w-full items-center gap-2 rounded-md border bg-white pl-3 text-left text-theme-sm transition outline-none ${
        selected ? 'pr-14' : 'pr-9'
      } ${
        isOpen
          ? 'border-brand-400 shadow-focus-ring'
          : selected
            ? 'border-brand-300 hover:border-brand-400'
            : 'border-gray-300 hover:border-brand-300'
      }`;

  return (
    <button
      ref={buttonRef}
      type="button"
      role="combobox"
      aria-label={label}
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={baseClass}
    >
      {icon && (
        <span
          aria-hidden
          className={`shrink-0 ${isChip ? 'opacity-70' : 'text-gray-400'}`}
        >
          {icon}
        </span>
      )}
      <span
        className={
          isChip
            ? 'truncate'
            : `truncate ${selected ? 'font-medium text-gray-800' : 'text-gray-400'}`
        }
      >
        {selected ? selected.label : label}
      </span>

      {isChip && !selected && (
        <FiChevronDown
          aria-hidden
          className={`shrink-0 opacity-60 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      )}
    </button>
  );
};

export default Trigger;