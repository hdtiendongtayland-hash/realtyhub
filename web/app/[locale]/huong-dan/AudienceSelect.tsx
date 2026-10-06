'use client';

import { FiChevronDown } from 'react-icons/fi';

const AudienceSelect = ({
  value,
  options,
}: {
  value: string | null;
  options: { id: string; emoji: string; label: string }[];
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) {
      window.location.href = '/huong-dan';
    } else {
      window.location.href = `/huong-dan?audience=${val}`;
    }
  };

  return (
    <div className="relative inline-flex">
      <select
        value={value ?? ''}
        onChange={handleChange}
        aria-label="Lọc theo đối tượng"
        className="h-12 cursor-pointer appearance-none rounded-full border border-gray-200 bg-white px-5 pr-10 text-theme-sm font-semibold text-gray-700 shadow-card hover:border-brand-300 focus:border-brand-400 focus:outline-none"
      >
        <option value="">Tất cả đối tượng</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      <FiChevronDown
        aria-hidden
        className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
      />
    </div>
  );
};

export default AudienceSelect;
