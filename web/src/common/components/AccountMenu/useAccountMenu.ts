'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

import { neverChanges } from './types';

export type AccountMenuState = {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  isMounted: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
};

/**
 * Hook quan ly state cho AccountMenu:
 * - open/close
 * - click outside + Esc de dong menu
 * - track mounted (SSR-safe)
 */
export const useAccountMenu = (): AccountMenuState => {
  const [isOpen, setIsOpen] = useState(false);
  const isMounted = useSyncExternalStore(neverChanges, () => true, () => false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen]);

  return {
    isOpen,
    toggle: () => setIsOpen((o) => !o),
    close: () => setIsOpen(false),
    isMounted,
    containerRef: containerRef as React.RefObject<HTMLDivElement>,
  };
};