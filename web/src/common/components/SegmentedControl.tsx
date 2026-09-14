'use client';

export type SegmentedOption = {
  /** null la o "Tat ca" - bo chon nhom nay */
  value: string | null;
  label: string;
};

type SegmentedControlProps = {
  /** Nhan cho trinh doc man hinh - nhom nut khong tu no noi len dang loc gi */
  label: string;
  options: SegmentedOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  wrap?: boolean;
  className?: string;
};

const SegmentedControl = ({
  label,
  options,
  value,
  onChange,
  wrap = false,
  className = '',
}: SegmentedControlProps) => (
  <div
    role="radiogroup"
    aria-label={label}
    className={`flex ${
      wrap ? 'flex-wrap gap-2' : 'overflow-hidden rounded-lg border border-gray-300'
    } ${className}`}
  >
    {options.map((option, index) => {
      const isActive = value === option.value;

      return (
        <button
          key={option.value ?? '__all__'}
          type="button"
          role="radio"
          aria-checked={isActive}
          onClick={() => onChange(option.value)}
          className={`h-10 min-w-0 whitespace-nowrap px-3 text-theme-sm transition ${
            wrap
              ? 'rounded-lg border px-4'
              : `flex-1 ${index > 0 ? 'border-l border-gray-300' : ''}`
          } ${
            isActive
              ? `bg-brand-50 font-semibold text-brand-700 ${
                  wrap ? 'border-brand-500' : ''
                }`
              : `text-gray-600 hover:bg-gray-50 ${
                  wrap ? 'border-gray-300 bg-white hover:border-gray-400' : 'bg-white'
                }`
          }`}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

export default SegmentedControl;
