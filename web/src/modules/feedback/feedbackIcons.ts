import type { IconType } from 'react-icons';
import {
  FiFileText,
  FiHeadphones,
  FiLayout,
  FiMeh,
  FiMessageCircle,
  FiSettings,
  FiThumbsDown,
  FiThumbsUp,
  FiZap,
} from 'react-icons/fi';

import type { FeedbackCategory, FeedbackRating } from './mocks/feedback.mock';

/** Icon net manh cho chuyen muc gop y - thay cho emoji 🎨⚙️⚡📝🎧💬 */
export const FEEDBACK_CATEGORY_ICON: Record<FeedbackCategory, IconType> = {
  'ui-ux': FiLayout,
  'tinh-nang': FiSettings,
  'hieu-nang': FiZap,
  'noi-dung': FiFileText,
  'dich-vu': FiHeadphones,
  khac: FiMessageCircle,
};

/** Icon + mau cho muc do hai long - thay cho emoji 👍😐👎 */
export const FEEDBACK_RATING_ICON: Record<FeedbackRating, { icon: IconType; tone: string }> = {
  pos: { icon: FiThumbsUp, tone: 'bg-jade-50 text-jade-600' },
  neu: { icon: FiMeh, tone: 'bg-accent-50 text-accent-600' },
  neg: { icon: FiThumbsDown, tone: 'bg-error-50 text-error-500' },
};
