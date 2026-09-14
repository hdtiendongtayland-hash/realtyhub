'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { matchesVi } from '@/common/utils/text';
import {
  MENU_GAP,
  MENU_MAX_HEIGHT,
  MENU_MIN_WIDTH,
  MIN_MENU_HEIGHT,
  SEARCH_THRESHOLD,
  VIEWPORT_PADDING,
} from './constants';
import { RESET_VALUE } from './types';
import type { MenuPosition, SelectOption } from './types';

export type UseFilterSelectOptions = {
  options: SelectOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  resetLabel: string;
};

export type UseFilterSelectReturn = {
  // State
  isOpen: boolean;
  query: string;
  setQuery: (query: string) => void;
  activeIndex: number;
  position: MenuPosition | null;
  filteredOptions: SelectOption[];
  rows: SelectOption[];
  selected: SelectOption | null;
  hasSearch: boolean;

  // Actions
  open: () => void;
  close: (refocus?: boolean) => void;
  select: (option: SelectOption) => void;
  clearSelection: () => void;
  setActiveIndex: (index: number) => void;

  // Refs
  triggerRef: React.RefObject<HTMLButtonElement>;
  menuRef: React.RefObject<HTMLDivElement>;
  searchRef: React.RefObject<HTMLInputElement | null>;
  optionRefs: React.MutableRefObject<(HTMLLIElement | null)[]>;
};

export const useFilterSelect = ({
  options,
  value,
  onChange,
  resetLabel,
}: UseFilterSelectOptions): UseFilterSelectReturn => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [position, setPosition] = useState<MenuPosition | null>(null);

  const selected = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  const hasSearch = options.length >= SEARCH_THRESHOLD;

  const filteredOptions = useMemo(
    () =>
      query.trim()
        ? options.filter((option) => matchesVi(option.label, query))
        : options,
    [options, query],
  );

  const rows = useMemo<SelectOption[]>(
    () =>
      query.trim() ? filteredOptions : [{ value: RESET_VALUE, label: resetLabel }, ...filteredOptions],
    [filteredOptions, query, resetLabel],
  );

  // ── Position calculation ────────────────────────────────────────────────
  const reposition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - MENU_GAP - VIEWPORT_PADDING;
    const spaceAbove = rect.top - MENU_GAP - VIEWPORT_PADDING;
    const flipUp = spaceBelow < 200 && spaceAbove > spaceBelow;
    const available = flipUp ? spaceAbove : spaceBelow;

    const width = Math.max(rect.width, MENU_MIN_WIDTH);
    const maxLeft = window.innerWidth - width - VIEWPORT_PADDING;

    setPosition({
      left: Math.max(VIEWPORT_PADDING, Math.min(rect.left, maxLeft)),
      width,
      maxHeight: Math.max(MIN_MENU_HEIGHT, Math.min(MENU_MAX_HEIGHT, available)),
      top: flipUp ? null : rect.bottom + MENU_GAP,
      bottom: flipUp ? window.innerHeight - rect.top + MENU_GAP : null,
    });
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) return;

    reposition();
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);

    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [isOpen, reposition]);

  // ── Menu open/close ───────────────────────────────────────────────────
  const close = useCallback((refocusTrigger = true) => {
    setIsOpen(false);
    setQuery('');
    setActiveIndex(0);
    if (refocusTrigger) triggerRef.current?.focus();
  }, []);

  const setQueryAndReset = useCallback((q: string) => {
    setQuery(q);
    setActiveIndex(0);
  }, []);

  const open = useCallback(() => {
    setQuery('');
    const index = value ? options.findIndex((option) => option.value === value) : -1;
    setActiveIndex(index >= 0 ? index + 1 : 0);
    setIsOpen(true);
  }, [options, value]);

  const select = useCallback(
    (option: SelectOption) => {
      onChange(option.value === RESET_VALUE ? null : option.value);
      close();
    },
    [close, onChange],
  );

  const clearSelection = useCallback(() => {
    onChange(null);
  }, [onChange]);

  // ── Click outside handler ─────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      close(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [isOpen, close]);

  // ── Escape key handler ────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      close();
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [isOpen, close]);

  // ── Scroll active option into view ────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    optionRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [isOpen, activeIndex]);

  return {
    isOpen,
    query,
    setQuery: setQueryAndReset,
    activeIndex,
    position,
    filteredOptions,
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
  };
};