/**
 * View modes that the public site can render in.
 *
 * `clean` is a presentation-only mode for sales presentations: distractions
 * (secondary nav, announcement bar, marketing widgets, decorative animations)
 * are reduced at the layout level via CSS, but routing, auth and business
 * logic stay intact.
 */
export type ViewMode = 'normal' | 'clean';

export const VIEW_MODE_VALUES: readonly ViewMode[] = ['normal', 'clean'];

export const isViewMode = (value: unknown): value is ViewMode =>
  typeof value === 'string' && (VIEW_MODE_VALUES as readonly string[]).includes(value);
