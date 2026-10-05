'use client';

import { useMemo, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import type { ProjectDetail } from '../../../models/project-detail.model';
import { buildProjectFaq, type FaqItem } from '../../../mocks/project-faq.mock';

const FaqCard = ({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) => (
  <div
    className={`rounded-xl border bg-white transition ${
      isOpen ? 'border-navy-800 shadow-theme-sm' : 'border-gray-100 shadow-theme-xs hover:border-gray-200'
    }`}
  >
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      className="flex w-full items-start gap-3 px-4 py-4 text-left sm:px-5"
    >
      <span
        className={`mt-0.5 flex h-7 min-w-7 shrink-0 items-center justify-center rounded-lg px-1 text-theme-xs font-bold ${
          isOpen ? 'bg-navy-800 text-white' : 'bg-brand-50 text-navy-800'
        }`}
      >
        {index + 1}
      </span>
      <span className="flex-1 pt-0.5 text-theme-sm font-semibold text-gray-900 sm:text-base">{item.question}</span>
      <FiChevronDown
        aria-hidden
        className={`mt-1 h-4 w-4 shrink-0 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
      />
    </button>

    {isOpen && (
      <div className="space-y-3 border-t border-gray-100 px-4 py-4 text-theme-sm leading-relaxed text-gray-500 sm:px-5">
        {item.answer.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        {item.links?.map((link) => (
          <p key={link.label}>
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="text-brand-600 underline underline-offset-2 transition hover:text-brand-700"
            >
              {link.label}
            </a>
          </p>
        ))}
      </div>
    )}
  </div>
);

/**
 * Tab "Hoi dap": cau hoi thuong gap chia theo danh muc.
 *
 * Desktop: cot danh muc dinh ben trai, cau hoi chia 2 cot dang xo xuong.
 * Mobile: danh muc thanh hang chip cuon ngang, cau hoi 1 cot.
 */
const FaqTab = ({ project }: { project: ProjectDetail }) => {
  const categories = useMemo(() => buildProjectFaq(project), [project]);
  const [activeKey, setActiveKey] = useState(categories[0].key);
  const active = categories.find((category) => category.key === activeKey) ?? categories[0];
  // Vao tab / doi danh muc: moi cau deu dong, bam moi mo
  const [open, setOpen] = useState<Set<number>>(() => new Set());

  const selectCategory = (key: string) => {
    const next = categories.find((category) => category.key === key);
    if (!next) return;
    setActiveKey(key);
    setOpen(new Set());
  };

  const toggle = (index: number) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  const half = Math.ceil(active.items.length / 2);
  const columns = [active.items.slice(0, half), active.items.slice(half)];

  return (
    <section>
      <div className="mb-8 text-center md:mb-10">
        <h2 className="text-2xl font-extrabold tracking-tight text-navy-800 uppercase md:text-3xl">
          Câu hỏi thường gặp
        </h2>
        <span className="mx-auto mt-3 block h-1 w-20 rounded-full bg-navy-800" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        {/* Danh muc */}
        <nav aria-label="Danh mục câu hỏi" className="lg:sticky lg:top-36 lg:self-start">
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:block lg:overflow-hidden lg:rounded-xl lg:bg-white lg:px-0 lg:shadow-theme-sm">
            <p className="hidden px-4 pt-4 pb-3 text-theme-xs font-bold tracking-wider text-navy-800 uppercase lg:block">
              Danh mục
            </p>
            {categories.map((category) => {
              const isActive = category.key === active.key;
              return (
                <button
                  key={category.key}
                  type="button"
                  onClick={() => selectCategory(category.key)}
                  aria-current={isActive}
                  className={`flex shrink-0 items-center justify-between gap-3 rounded-full border px-4 py-2 text-theme-sm font-medium uppercase transition lg:w-full lg:rounded-none lg:border-0 lg:border-t lg:border-l-4 lg:border-t-gray-100 lg:py-3.5 ${
                    isActive
                      ? 'border-navy-800 bg-brand-50 text-navy-800 lg:border-l-navy-800'
                      : 'border-gray-200 bg-white text-gray-500 hover:text-navy-800 lg:border-l-transparent'
                  }`}
                >
                  <span className="whitespace-nowrap lg:truncate">{category.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      isActive ? 'bg-navy-800 text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {category.items.length}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Cau hoi */}
        <div>
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-800 text-lg font-bold text-white">
              ?
            </span>
            <div>
              <h3 className="text-base font-bold text-navy-800 uppercase md:text-lg">{active.label}</h3>
              <p className="text-theme-xs text-gray-400">{active.items.length} câu hỏi</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
            {columns.map((column, columnIndex) => (
              <div key={columnIndex} className="space-y-3 md:space-y-4">
                {column.map((item, rowIndex) => {
                  const index = columnIndex * half + rowIndex;
                  return (
                    <FaqCard
                      key={item.question}
                      item={item}
                      index={index}
                      isOpen={open.has(index)}
                      onToggle={() => toggle(index)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqTab;
