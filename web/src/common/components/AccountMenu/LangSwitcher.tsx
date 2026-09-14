'use client';

import { LANG_OPTIONS, type Lang } from './types';

export type LangSwitcherProps = {
  current: Lang;
  onChange: (lang: Lang) => void;
};

const LangSwitcher = ({ current, onChange }: LangSwitcherProps) => (
  <div className="px-4 py-2">
    <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
      Ngôn ngữ
    </div>
    <div
      role="radiogroup"
      aria-label="Ngôn ngữ"
      className="inline-flex rounded-full border border-gray-200 bg-gray-50 p-0.5"
    >
      {LANG_OPTIONS.map((opt) => {
        const active = opt.code === current;
        return (
          <button
            key={opt.code}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.code)}
            className={`rounded-full px-3 py-1 text-theme-xs font-semibold transition ${
              active
                ? 'bg-white text-brand-700 shadow-theme-xs'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {opt.code.toUpperCase()}
          </button>
        );
      })}
    </div>
  </div>
);

export default LangSwitcher;