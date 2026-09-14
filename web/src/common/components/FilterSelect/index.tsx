'use client';

import { useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { FiChevronDown } from 'react-icons/fi';

import { useFilterSelect } from './useFilterSelect';
import type { FilterSelectProps } from './types';
import ClearButton from './ClearButton';
import OptionsList from './OptionsList';
import SearchBox from './SearchBox';
import Trigger from './Trigger';

const FilterSelect = ({
  label,
  value,
  options,
  isLoading = false,
  icon,
  resetLabel = 'Tất cả',
  variant = 'field',
  onChange,
  className = '',
}: FilterSelectProps) => {
  const reactId = useId();
  const listboxId = `${reactId}-listbox`;

  const {
    isOpen,
    query,
    setQuery,
    activeIndex,
    position,
    rows,
    selected,
    hasSearch,
    open,
    close,
    select,
    clearSelection,
    setActiveIndex,
    triggerRef,
    menuRef,
    searchRef,
    optionRefs,
  } = useFilterSelect({
    options,
    value,
    onChange,
    resetLabel,
  });

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!isOpen) {
        if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
          event.preventDefault();
          open();
        }
        return;
      }

      const count = rows.length;

      switch (event.key) {
        case 'Tab':
          close(false);
          break;
        case 'ArrowDown':
          event.preventDefault();
          if (count) setActiveIndex((index) => (index + 1) % count);
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (count) setActiveIndex((index) => (index - 1 + count) % count);
          break;
        case 'Home':
          event.preventDefault();
          setActiveIndex(0);
          break;
        case 'End':
          event.preventDefault();
          setActiveIndex(Math.max(0, count - 1));
          break;
        case 'Enter': {
          event.preventDefault();
          const row = rows[activeIndex];
          if (row) select(row);
          break;
        }
        default:
          break;
      }
    },
    [isOpen, open, close, rows, activeIndex, setActiveIndex, select],
  );

  // Loading skeleton
  if (isLoading) {
    return (
      <div
        className={
          variant === 'chip'
            ? `h-9 w-28 shrink-0 animate-pulse rounded-full border border-gray-200 bg-gray-50 ${className}`
            : `h-11 animate-pulse rounded-md border border-gray-200 bg-gray-50 ${className}`
        }
        aria-hidden
      />
    );
  }

  const isChip = variant === 'chip';

  return (
    <div className={`relative ${isChip ? 'shrink-0' : ''} ${className}`}>
      <Trigger
        label={label}
        selected={selected}
        icon={icon}
        isOpen={isOpen}
        variant={variant}
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={handleKeyDown}
        buttonRef={triggerRef}
      />

      {/* Chevron for field variant */}
      {!isChip && (
        <FiChevronDown
          aria-hidden
          className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      )}

      {/* Clear button */}
      <ClearButton
        selected={!!selected}
        label={label}
        variant={variant}
        onClear={clearSelection}
      />

      {/* Portal menu */}
      {isOpen &&
        position &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              left: position.left,
              width: position.width,
              maxHeight: position.maxHeight,
              top: position.top ?? undefined,
              bottom: position.bottom ?? undefined,
            }}
            className="fixed z-[1100] flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-panel"
          >
            {hasSearch && (
              <SearchBox
                query={query}
                label={label}
                listboxId={listboxId}
                inputRef={searchRef}
                onChange={setQuery}
                onKeyDown={handleKeyDown}
              />
            )}

            <OptionsList
              rows={rows}
              value={value}
              label={label}
              listboxId={listboxId}
              activeIndex={activeIndex}
              optionRefs={optionRefs}
              onSelect={select}
              onHover={setActiveIndex}
            />
          </div>,
          document.body,
        )}
    </div>
  );
};

export default FilterSelect;