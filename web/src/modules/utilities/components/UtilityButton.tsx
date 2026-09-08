'use client';

import type { UtilityAction, UtilityTone } from '../models/utility.model';
import { TONE_CLASSES } from './tones';
import { buildFavoriteEntry } from '@/common/hooks/useFavoriteUtilities';
import FavoriteHeartButton from './FavoriteHeartButton';

type UtilityButtonProps = {
  action: UtilityAction;
  tone: UtilityTone;
  /** Search keyword de highlight border khi match */
  highlight?: boolean;
  /** Section chua action (de build FavoriteUtilityEntry day du) */
  section: {
    publicId: string;
    title: string;
    tone: UtilityTone;
  };
  /** Ten icon Component (de luu vao entry vi React component khong the JSON.stringify) */
  iconKey: string;
  onClick: (action: UtilityAction) => void;
};

/**
 * Mot nut tinh nang nho ben trong 1 khoi.
 *
 * UI theo yeu cau:
 *   - Card trang, rounded-xl, shadow nhe, border
 *   - Icon flat (h-8 w-8) cung tone voi khoi
 *   - Label text-theme-xs font-semibold text-gray-800
 *   - Hover: lift -translate-y-0.5, border tone, icon bg + text trang
 *   - Nut trai tim goc phai-tren: click de luu/xoa khoi bo suu tap.
 *     Click trai tim KHONG mo modal "Sap ra mat".
 *
 * Luu y HTML: card la <div role="button"> (KHONG phai <button>) vi ben
 * trong chua nut trai tim cung la <button> - long nested <button> se gay
 * hydration error. role="button" + tabIndex + keyboard handler van giu
 * accessibility day du.
 *
 * Accessibility:
 *   - role=button
 *   - aria-label gom label + description de screen reader biet tinh nang
 *   - Enter/Space kich hoat nhu nut that
 */
const UtilityButton = ({ action, tone, highlight, section, iconKey, onClick }: UtilityButtonProps) => {
  const toneCls = TONE_CLASSES[tone];

  // Build entry moi lan render - cheap vi chi serialize khi click.
  // Luu y: entry.publicId dung de danh dau, entry co day du metadata de
  // render o trang khac ma khong can lookup lai tu mocks.
  const entry = buildFavoriteEntry(action, section, iconKey);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick(action);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(action)}
      onKeyDown={handleKeyDown}
      aria-label={`${action.label}: ${action.description}`}
      title={action.description}
      className={`group relative flex flex-col items-center gap-2 rounded-xl border bg-white px-3 py-4 text-center shadow-theme-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-theme-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer ${toneCls.border} ${toneCls.buttonHoverBg} ${toneCls.buttonHoverText} ${highlight ? `${toneCls.highlightRing} ring-2` : ''}`}
    >
      {/* Nut trai tim - position absolute goc phai-tren.
          stopPropagation ben trong FavoriteHeartButton dam bao khong bubble len. */}
      <span className="absolute right-1.5 top-1.5">
        <FavoriteHeartButton entry={entry} size="sm" />
      </span>
      <span
        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-xl transition-colors ${toneCls.buttonBg} ${toneCls.buttonIcon} group-hover:bg-white/20 group-hover:text-white`}
      >
        <action.icon aria-hidden />
      </span>
      <span className={`text-theme-xs font-semibold leading-tight ${toneCls.buttonText} group-hover:text-white`}>
        {action.label}
      </span>
    </div>
  );
};

export default UtilityButton;