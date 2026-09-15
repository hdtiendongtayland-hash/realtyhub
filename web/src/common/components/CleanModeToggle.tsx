'use client';

import { useCleanMode } from '@/common/providers/CleanModeProvider';
import { FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import type { CSSProperties, ReactElement } from 'react';

type Size = 'compact' | 'regular';

type CleanModeToggleProps = {
  /**
   * Visual size. `compact` shows only the icon (used in the mobile drawer
   * row); `regular` shows icon + label (used in the desktop header).
   */
  size?: Size;
  /** Extra classes appended to the button. */
  className?: string;
};

/**
 * The Clean Mode toggle.
 *
 * Lives wherever it's instantiated — the provider owns the state. The
 * button intentionally doesn't render any text on `compact` so the mobile
 * drawer row stays a single icon column; on `regular` we show "Clean" /
 * "Normal View" depending on the current state.
 *
 * Accessibility
 *   • `type="button"` so it never submits a form
 *   • `aria-pressed` mirrors the toggle state (spec §20)
 *   • `aria-label` flips between "Enable clean view" and "Exit clean view"
 *   • `title` provides the hover tooltip without re-implementing one
 */
const CleanModeToggle = ({
  size = 'regular',
  className = '',
}: CleanModeToggleProps): ReactElement => {
  const { isCleanMode, toggleCleanMode } = useCleanMode();
  const compact = size === 'compact';

  // Style mirror of the other header icon buttons so the row looks balanced.
  // We keep the styles inline-ish (Tailwind class string) so the component
  // remains drop-in: callers only need to override the wrapper class.
  const baseClass =
    'inline-flex items-center justify-center gap-1.5 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-0';

  const sizeClass = compact
    // mobile: touch target phai >= 44px theo spec #19. Dung 44px cho compact
    // (icon-only trong drawer) - to hon so voi desktop h-9 nhung can thiet
    // cho accessibility tren thiet bi cam ung.
    ? 'h-11 w-11 min-h-[44px] min-w-[44px] text-base'
    // regular: desktop giu h-9 (can voi row icon khac), nhung mobile phai
    // dat 44px cho touch target. xl: tra ve 36px khi desktop theo row icon.
    : 'h-11 min-h-[44px] px-3 text-theme-sm font-semibold uppercase tracking-wide xl:h-9 xl:min-h-0';

  const variantClass = isCleanMode
    ? // Active state: solid brand so users see the mode is on at a glance.
      'bg-brand-500 text-white shadow-card hover:bg-brand-600'
    : // Idle state: matches the other header icons.
      'text-gray-500 hover:bg-gray-100 hover:text-brand-600';

  const Icon = isCleanMode ? FiMinimize2 : FiMaximize2;
  const label = isCleanMode ? 'Normal View' : '';
  const ariaLabel = isCleanMode
    ? 'Exit clean view'
    : 'Enable clean view – focus on products';
  const tooltip = isCleanMode ? 'Exit clean view' : 'Clean view – focus on products';

  return (
    <button
      type="button"
      onClick={toggleCleanMode}
      aria-pressed={isCleanMode}
      aria-label={ariaLabel}
      title={tooltip}
      data-clean-toggle="true"
      // Make sure the toggle never shows the browser's default focus ring
      // colour — we override with brand-300 above.
      style={{ '--tw-ring-color': 'var(--color-brand-300)' } as CSSProperties}
      className={`${baseClass} ${sizeClass} ${variantClass} ${className}`.trim()}
    >
      <Icon aria-hidden className={compact ? 'h-5 w-5' : 'h-4 w-4'} />
      {!compact && <span className="leading-none">{label}</span>}
    </button>
  );
};

export default CleanModeToggle;
