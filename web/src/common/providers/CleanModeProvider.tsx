'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ViewMode } from '@/types/view-mode';

/**
 * Clean Mode — presentation-only toggle for sales / demo flows.
 *
 * Design notes
 *   • State lives in a single provider mounted near the root of `app/layout.tsx`.
 *     No Redux / Zustand — overkill for one boolean shared by a handful of
 *     components (Header toggle + global CSS hooks).
 *   • We intentionally do **not** persist the toggle across reloads in phase 1
 *     (per spec §17). `useState` is enough — refreshing returns to normal mode.
 *     When persistence is needed later, swap this for `localStorage` /
 *     sessionStorage behind the same `useCleanMode` API.
 *   • The provider applies `data-view-mode="<mode>"` to `<html>` rather than
 *     `<body>`. CSS rules can match either `[data-view-mode="clean"]` globally
 *     or scope it to a subtree; putting it on `<html>` keeps the matching
 *     selector the same regardless of where a component is mounted.
 *   • Toggle handlers are exposed as `enable`, `disable`, `toggle` so callers
 *     never have to read the current value to flip it — that keeps the
 *     `SiteHeader` button from re-rendering on every keystroke elsewhere.
 */

export type CleanModeContextValue = {
  isCleanMode: boolean;
  viewMode: ViewMode;
  enableCleanMode: () => void;
  disableCleanMode: () => void;
  toggleCleanMode: () => void;
};

const CleanModeContext = createContext<CleanModeContextValue | null>(null);

/**
 * Where to write the `data-view-mode` attribute. Using documentElement so
 * CSS rules don't have to care whether the toggle is mounted above or
 * below the body element.
 */
const applyAttribute = (mode: ViewMode) => {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-view-mode', mode);
};

type CleanModeProviderProps = {
  children: ReactNode;
  /**
   * Initial mode for SSR / first paint. Default `'normal'`. The provider
   * syncs the DOM attribute on mount, then takes over from state.
   */
  defaultMode?: ViewMode;
};

const CleanModeProvider = ({
  children,
  defaultMode = 'normal',
}: CleanModeProviderProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultMode);

  // Apply the attribute on mount and whenever the mode flips. Doing this in
  // an effect (rather than inline on the JSX) means the attribute is owned by
  // the document, not by React's render tree — so toggling survives HMR and
  // accidental unmounts of the provider.
  useEffect(() => {
    applyAttribute(viewMode);
  }, [viewMode]);

  const enableCleanMode = useCallback(() => {
    setViewMode('clean');
  }, []);

  const disableCleanMode = useCallback(() => {
    setViewMode('normal');
  }, []);

  const toggleCleanMode = useCallback(() => {
    setViewMode((current) => (current === 'clean' ? 'normal' : 'clean'));
  }, []);

  const value = useMemo<CleanModeContextValue>(
    () => ({
      isCleanMode: viewMode === 'clean',
      viewMode,
      enableCleanMode,
      disableCleanMode,
      toggleCleanMode,
    }),
    [viewMode, enableCleanMode, disableCleanMode, toggleCleanMode],
  );

  return (
    <CleanModeContext.Provider value={value}>
      {children}
    </CleanModeContext.Provider>
  );
};

const useCleanMode = (): CleanModeContextValue => {
  const context = useContext(CleanModeContext);
  if (!context) {
    // Fail loud in dev so we catch a missing provider early; in prod fall
    // back to a no-op so a stray import doesn't crash the page.
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(
        'useCleanMode must be used within a <CleanModeProvider>. Wrap the relevant subtree first.',
      );
    }
    return {
      isCleanMode: false,
      viewMode: 'normal',
      enableCleanMode: () => undefined,
      disableCleanMode: () => undefined,
      toggleCleanMode: () => undefined,
    };
  }
  return context;
};

export { CleanModeContext, CleanModeProvider, applyAttribute, useCleanMode };
