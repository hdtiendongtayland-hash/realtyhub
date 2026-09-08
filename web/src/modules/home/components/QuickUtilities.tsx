import Link from 'next/link';
import {
  FiBarChart2,
  FiCalendar,
  FiCompass,
  FiDollarSign,
  FiColumns,
  FiGrid,
  FiSun,
  FiUsers,
} from 'react-icons/fi';

type QuickUtility = {
  label: string;
  href: string;
  icon: React.ComponentType<{ 'aria-hidden'?: boolean; className?: string }>;
  /** Mau toa nen icon - xoay vong giua brand/jade/accent/gold de tao nhip cho grid */
  tone: 'brand' | 'jade' | 'accent' | 'gold';
  /** Mo ta ngan hien o sr-only cho screen reader (hover tooltip neu can sau) */
  description?: string;
};

const UTILITIES: QuickUtility[] = [
  {
    label: 'So sánh sản phẩm',
    href: '/so-sanh-san-pham',
    icon: FiBarChart2,
    tone: 'brand',
    description: 'So sánh sản phẩm và căn hộ cạnh nhau',
  },
  {
    label: 'So sánh chính sách',
    href: '/so-sanh-chinh-sach',
    icon: FiColumns,
    tone: 'jade',
    description: 'So sánh chính sách vay và các tính năng khác',
  },
  {
    label: 'Tính lãi vay',
    href: '/tinh-lai-vay',
    icon: FiDollarSign,
    tone: 'gold',
    description: 'Tính lãi vay trên số tiền vay và thời gian vay',
  },
  {
    label: 'Tính thuế',
    href: '/lich-am',
    icon: FiCalendar,
    tone: 'accent',
    description: 'Lịch âm Việt Nam, can chi, ngày tốt xấu',
  },
  {
    label: 'CRM',
    href: '/crm',
    icon: FiUsers,
    tone: 'brand',
    description: 'Quản lý khách hàng cho môi giới',
  },
  {
    label: 'La bàn phong thủy',
    href: '/la-ban',
    icon: FiCompass,
    tone: 'jade',
    description: 'La bàn + hướng nhà theo tuổi',
  },
  {
    label: 'Lịch Việt Nam',
    href: '/lich-viet-nam',
    icon: FiSun,
    tone: 'gold',
    description: 'Lịch âm, can chi, ngày tốt xấu',
  },
  {
    label: 'Xem thêm',
    href: '/tien-ich',
    icon: FiGrid,
    tone: 'accent',
    description: 'Tất cả tiện ích của RealtyHub',
  },
];

const TONE_CLASSES: Record<QuickUtility['tone'], string> = {
  brand: 'bg-brand-50 text-brand-600 group-hover:bg-brand-500 group-hover:text-white',
  jade: 'bg-jade-50 text-jade-600 group-hover:bg-jade-500 group-hover:text-white',
  accent: 'bg-accent-50 text-accent-600 group-hover:bg-accent-500 group-hover:text-white',
  gold: 'bg-gold-200 text-gold-500 group-hover:bg-gold-500 group-hover:text-white',
};

const QuickUtilities = () => (
  <section className="site-container -mt-10 md:-mt-14 lg:-mt-16">
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-card md:p-6">
      <h2 className="sr-only">Tiện ích nhanh</h2>
      <ul className="grid grid-cols-4 gap-3 md:gap-4 lg:grid-cols-8">
        {UTILITIES.map(({ label, href, icon: Icon, tone, description }) => (
          <li key={href}>
            <Link
              href={href}
              aria-label={description ?? label}
              title={description}
              className="group flex flex-col items-center gap-2 rounded-xl px-2 py-3 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 md:gap-3 md:py-4"
            >
              <span
                className={`inline-flex h-12 w-12 items-center justify-center rounded-xl text-xl transition md:h-14 md:w-14 md:text-2xl ${TONE_CLASSES[tone]}`}
              >
                <Icon aria-hidden />
              </span>
              <span className="text-center text-theme-xs font-semibold leading-tight text-gray-700 group-hover:text-brand-600 md:text-theme-sm">
                {label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default QuickUtilities;