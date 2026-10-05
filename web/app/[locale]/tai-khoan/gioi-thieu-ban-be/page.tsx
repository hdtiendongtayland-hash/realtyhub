import Link from "next/link";
import type { Metadata } from "next";
import {
  FiChevronRight,
  FiDollarSign,
  FiHome,
  FiLink,
  FiUserPlus,
} from "react-icons/fi";

import {
  ReferralInfoPanel,
  ReferralTree,
} from "@/modules/profile/components/ReferralCard";
import {
  flattenReferralTree,
  formatMoney,
  MOCK_REFERRAL,
} from "@/modules/profile/mocks/referral.mock";

export const metadata: Metadata = {
  title: "Giới thiệu bạn bè",
  description:
    "Mã giới thiệu, link giới thiệu và cây giới thiệu nhiều tầng của bạn trên RealtyHub.",
};

const STEPS = [
  {
    icon: FiLink,
    title: "Chia sẻ mã / link",
    text: "Gửi mã hoặc link giới thiệu cho bạn bè, đồng nghiệp.",
  },
  {
    icon: FiUserPlus,
    title: "Bạn bè đăng ký",
    text: "Người được giới thiệu nhập mã khi tạo tài khoản và trở thành F1 của bạn.",
  },
  {
    icon: FiDollarSign,
    title: "Nhận hoa hồng",
    text: "Mỗi giao dịch thành công trong cây (F1 → F7) đều mang lại hoa hồng cho bạn.",
  },
];

/**
 * Trang /tai-khoan/gioi-thieu-ban-be - chuong trinh gioi thieu ban be.
 *
 * Hang tren: thong tin gioi thieu (ma, link, chia se) + cach hoat dong.
 * Ben duoi: cay gioi thieu nhieu tang F1 -> F7 trai het be ngang.
 */
const GioiThieuBanBePage = () => {
  const all = flattenReferralTree(MOCK_REFERRAL.tree);
  const active = all.filter((member) => member.isActive).length;
  const commission = all.reduce((sum, member) => sum + member.commission, 0);

  const stats = [
    { label: "Thành viên trong cây", value: String(all.length) },
    {
      label: "Giới thiệu trực tiếp (F1)",
      value: String(MOCK_REFERRAL.tree.length),
    },
    { label: "Đã giao dịch", value: String(active) },
    { label: "Hoa hồng tích lũy", value: formatMoney(commission) },
  ];

  return (
    <div className="bg-gray-50/50">
      <div className="site-container py-6 md:py-10">
        <nav aria-label="Breadcrumb" className="mb-4 md:mb-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-theme-xs text-gray-500">
            <li>
              <Link
                href="/"
                className="inline-flex items-center gap-1 transition hover:text-brand-600"
              >
                <FiHome aria-hidden className="h-3.5 w-3.5" />
                Trang chủ
              </Link>
            </li>
            <li aria-hidden>
              <FiChevronRight className="h-3.5 w-3.5 text-gray-300" />
            </li>
            <li>
              <Link
                href="/tai-khoan"
                className="transition hover:text-brand-600"
              >
                Tài khoản
              </Link>
            </li>
            <li aria-hidden>
              <FiChevronRight className="h-3.5 w-3.5 text-gray-300" />
            </li>
            <li className="font-medium text-gray-700" aria-current="page">
              Giới thiệu bạn bè
            </li>
          </ol>
        </nav>

        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Giới thiệu bạn bè
          </h1>
          <p className="mt-1 text-theme-sm text-gray-600">
            Mời bạn bè tham gia RealtyHub và nhận hoa hồng từ mạng lưới giới
            thiệu của bạn.
          </p>
        </header>

        {/* So lieu tong */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs"
            >
              <p className="text-2xl font-bold text-brand-700">{stat.value}</p>
              <p className="mt-1 text-theme-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ReferralInfoPanel />

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm sm:p-6">
            <h2 className="text-lg font-bold text-gray-900">Cách hoạt động</h2>
            <ol className="mt-4 space-y-4">
              {STEPS.map(({ icon: Icon, title, text }, index) => (
                <li key={title} className="flex gap-3">
                  <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon aria-hidden className="h-5 w-5" />
                    <span className="brand-gradient absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white">
                      {index + 1}
                    </span>
                  </span>
                  <div>
                    <p className="text-theme-sm font-semibold text-gray-900">
                      {title}
                    </p>
                    <p className="text-theme-xs leading-relaxed text-gray-500">
                      {text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Cay trai het be ngang trang */}
        <ReferralTree />
      </div>
    </div>
  );
};

export default GioiThieuBanBePage;
