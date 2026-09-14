'use client';

import { FiX } from 'react-icons/fi';

import type { FilterSelectVariant } from './types';

export type ClearButtonProps = {
  selected: boolean;
  label: string;
  variant: FilterSelectVariant;
  onClear: () => void;
};

const ClearButton = ({ selected, label, variant, onClear }: ClearButtonProps) => {
  if (!selected) return null;

  const isChip = variant === 'chip';

  return (
    <button
      type="button"
      onClick={onClear}
      aria-label={`Bỏ chọn ${label}`}
      className={
        isChip
          ? 'absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-brand-500 transition hover:bg-brand-100 hover:text-brand-700'
          : 'absolute right-8 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-error-500'
      }
    >
      <FiX aria-hidden className="text-[13px]" />
    </button>
  );
};

export default ClearButton;