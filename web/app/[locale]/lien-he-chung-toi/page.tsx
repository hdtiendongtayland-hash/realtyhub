import { FiClock, FiMail, FiMapPin, FiMessageCircle, FiPhone } from 'react-icons/fi';
import { FaFacebookF, FaTiktok, FaYoutube } from 'react-icons/fa';

import PageBanner from '@/common/components/PageBanner';
import ContactForm from '@/modules/contact/components/ContactForm';

import type { Metadata } from 'next';

/**
 * Trang /lien-he-chung-toi:
 *   1. Banner anh + 4 the lien he nhanh noi len mep duoi
 *   2. Form (trai) | ban do tru so + 3 van phong + mang xa hoi (phai)
 */
export const metadata: Metadata = {
  title: 'Liên hệ chúng tôi',
  description:
    'Liên hệ với đội ngũ RealtyHub — Email, hotline, chi nhánh Hà Nội, TP.HCM, Đà Nẵng. Phản hồi trong 24 giờ làm việc.',
};

const BRANCHES = [
  {
    city: 'Hà Nội',
    role: 'Trụ sở chính',
    address: 'Tầng 12, Tòa nhà Capital Place, 29 Liễu Giai, Ba Đình',
    phone: '024 7100 0000',
    email: 'hanoi@realtyhub.vn',
    hours: 'T2 - T7: 8:00 - 21:00',
  },
  {
    city: 'TP. Hồ Chí Minh',
    role: 'Chi nhánh phía Nam',
    address: 'Tầng 8, Tòa nhà Bitexco Financial, 2 Hải Triều, Quận 1',
    phone: '028 7100 0000',
    email: 'hcm@realtyhub.vn',
    hours: 'T2 - T7: 8:00 - 21:00',
  },
  {
    city: 'Đà Nẵng',
    role: 'Chi nhánh miền Trung',
    address: 'Tầng 5, Tòa nhà Indochina Riverside, 74 Bạch Đằng',
    phone: '023 6710 0000',
    email: 'danang@realtyhub.vn',
    hours: 'T2 - T7: 8:00 - 18:00',
  },
];

/** Ban do tru so chinh (Ha Noi) */
const HEAD_OFFICE_MAP =
  'https://www.openstreetmap.org/export/embed.html?bbox=105.8100%2C21.0250%2C105.8250%2C21.0400&layer=mapnik&marker=21.0325%2C105.8175';

const QUICK_CONTACTS = [
  {
    icon: FiPhone,
    label: 'Hotline 24/7',
    value: '024 7100 0000',
    href: 'tel:+842471000000',
    tone: 'bg-jade-50 text-jade-600',
  },
  {
    icon: FiMail,
    label: 'Email',
    value: 'support@realtyhub.vn',
    href: 'mailto:support@realtyhub.vn',
    tone: 'bg-brand-50 text-brand-600',
  },
  {
    icon: FiMapPin,
    label: 'Trụ sở chính',
    value: '29 Liễu Giai, Ba Đình, Hà Nội',
    href: '#van-phong',
    tone: 'bg-accent-50 text-accent-600',
  },
  {
    icon: FiClock,
    label: 'Giờ làm việc',
    value: 'T2 - T7: 8:00 - 21:00',
    tone: 'bg-purple-50 text-purple-600',
  },
];

const SOCIAL_LINKS = [
  { label: 'Facebook', href: '#', icon: FaFacebookF, color: 'bg-blue-600' },
  { label: 'YouTube', href: '#', icon: FaYoutube, color: 'bg-red-600' },
  { label: 'TikTok', href: '#', icon: FaTiktok, color: 'bg-gray-900' },
  { label: 'Zalo', href: '#', icon: FiMessageCircle, color: 'bg-blue-500' },
];

const LienHeChungToiPage = () => (
  <main className="bg-gray-25 pb-12 md:pb-16">
    <PageBanner
      crumb="Liên hệ chúng tôi"
      eyebrow="Hỗ trợ 24/7"
      imageUrl="/images/heroes/lien-he-chung-toi.jpg"
      title="Liên hệ với RealtyHub"
      description="Đội ngũ RealtyHub phản hồi trong vòng 24 giờ làm việc. Câu hỏi gấp, vui lòng gọi hotline."
      overlap={
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_CONTACTS.map(({ icon: Icon, label, value, href, tone }) => {
            const inner = (
              <>
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-theme-xs text-gray-500">{label}</span>
                  <span className="block truncate text-theme-sm font-semibold text-gray-900">{value}</span>
                </span>
              </>
            );
            const cardClass =
              'flex h-full items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-theme-lg transition';
            return (
              <li key={label}>
                {href ? (
                  <a href={href} className={`${cardClass} hover:-translate-y-0.5 hover:border-brand-200`}>
                    {inner}
                  </a>
                ) : (
                  <div className={cardClass}>{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      }
    />

    <section className="site-container pt-10 md:pt-12">
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Form */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-theme-sm md:p-8 lg:col-span-3">
          <span className="text-theme-xs font-bold tracking-[0.2em] text-brand-600 uppercase">Gửi yêu cầu</span>
          <h2 className="mt-2 text-2xl font-bold text-navy-800">Để lại lời nhắn, chúng tôi gọi lại ngay</h2>
          <p className="mt-2 mb-6 text-theme-sm leading-relaxed text-gray-600">
            Mô tả ngắn nhu cầu của bạn — chuyên viên phụ trách sẽ liên hệ trong giờ làm việc.
          </p>
          <ContactForm />
        </div>

        {/* Ban do + van phong + mang xa hoi */}
        <aside id="van-phong" className="scroll-mt-24 space-y-6 lg:col-span-2">
          <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-theme-sm">
            <div className="relative aspect-[16/9] bg-gray-100">
              <iframe
                src={HEAD_OFFICE_MAP}
                title="Bản đồ trụ sở chính"
                loading="lazy"
                className="absolute inset-0 h-full w-full border-0"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <ul className="divide-y divide-gray-100">
              {BRANCHES.map((branch) => (
                <li key={branch.city} className="flex gap-3 p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <FiMapPin aria-hidden className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 text-theme-sm">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-gray-900">{branch.city}</span>
                      <span className="rounded-full bg-jade-50 px-2 py-0.5 text-[11px] font-semibold text-jade-700">
                        {branch.role}
                      </span>
                    </p>
                    <p className="mt-1 text-theme-xs leading-relaxed text-gray-500">{branch.address}</p>
                    <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-theme-xs">
                      <a
                        href={`tel:${branch.phone.replace(/\s/g, '')}`}
                        className="inline-flex items-center gap-1 font-medium text-gray-700 hover:text-brand-600"
                      >
                        <FiPhone aria-hidden className="text-gray-400" />
                        {branch.phone}
                      </a>
                      <a
                        href={`mailto:${branch.email}`}
                        className="inline-flex items-center gap-1 font-medium text-gray-700 hover:text-brand-600"
                      >
                        <FiMail aria-hidden className="text-gray-400" />
                        {branch.email}
                      </a>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-theme-sm">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Kết nối với chúng tôi</h3>
              <p className="text-theme-xs text-gray-500">Tin tức và sự kiện mới nhất</p>
            </div>
            <ul className="flex items-center gap-2">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    aria-label={social.label}
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-white shadow-theme-sm transition hover:-translate-y-0.5 ${social.color}`}
                  >
                    <social.icon aria-hidden className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  </main>
);

export default LienHeChungToiPage;
