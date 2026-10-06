import type { IconType } from 'react-icons';
import { FiBookOpen, FiBriefcase, FiHeart, FiSearch, FiShield, FiZap } from 'react-icons/fi';

/**
 * Icon net manh + mau nen cho tung nhom huong dan - thay cho emoji trong
 * du lieu (🚀🔍❤️💼🔒) vi emoji hien khac nhau tren moi may va khong hop giao dien.
 */
export const GUIDE_GROUP_ICONS: Record<string, { icon: IconType; tone: string }> = {
  'getting-started': { icon: FiZap, tone: 'bg-brand-50 text-brand-600' },
  search: { icon: FiSearch, tone: 'bg-jade-50 text-jade-600' },
  favorites: { icon: FiHeart, tone: 'bg-error-50 text-error-500' },
  'agent-tools': { icon: FiBriefcase, tone: 'bg-accent-50 text-accent-600' },
  security: { icon: FiShield, tone: 'bg-purple-50 text-purple-600' },
};

export const guideGroupIcon = (groupId: string) =>
  GUIDE_GROUP_ICONS[groupId] ?? { icon: FiBookOpen, tone: 'bg-gray-100 text-gray-600' };
