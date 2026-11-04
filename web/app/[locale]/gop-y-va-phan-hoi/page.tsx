import Image from "next/image";
import Link from "next/link";
import {
  FiArrowRight,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiEdit3,
  FiEye,
  FiInbox,
  FiMessageSquare,
  FiThumbsUp,
  FiMessageCircle,
} from "react-icons/fi";

import SoftPageHero, {
  Highlight,
  SectionEyebrow,
} from "@/common/components/SoftPageHero";
import { FEEDBACK_CATEGORY_ICON } from "@/modules/feedback/feedbackIcons";
import FeedbackForm from "@/modules/feedback/components/FeedbackForm";
import {
  FEEDBACK_CATEGORY_LABELS,
  FEEDBACK_STATS,
} from "@/modules/feedback/mocks/feedback.mock";

import type { Metadata } from "next";

/**
 * Trang /gop-y-va-phan-hoi - cung phong cach trang /gioi-thieu:
 *   1. Dau trang: chu + anh mo dan, 2 nut va 4 so lieu
 *   2. Gui gop y: form (trai) | meo gop y, chuyen muc, cam ket minh bach (phai)
 *   3. Quy trinh xu ly 3 buoc
 *   4. CTA sang huong dan / lien he
 */
export const metadata: Metadata = {
  title: "Góp ý & phản hồi",
  description:
    "Chia sẻ góp ý, báo lỗi hoặc đề xuất tính năng cho RealtyHub. Mọi phản hồi đều được đội ngũ xem xét và phản hồi.",
};

const STATS = [
  {
    icon: FiInbox,
    value: FEEDBACK_STATS.totalReceived.toLocaleString("vi-VN"),
    label: "Góp ý đã nhận",
    tone: "bg-brand-50 text-brand-600",
  },
  {
    icon: FiCheckCircle,
    value: String(FEEDBACK_STATS.totalShipped),
    label: "Đã triển khai",
    tone: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: FiClock,
    value: `${FEEDBACK_STATS.avgResponseHours} giờ`,
    label: "Phản hồi trung bình",
    tone: "bg-amber-50 text-amber-600",
  },
  {
    icon: FiMessageCircle,
    value: `${FEEDBACK_STATS.respondedRate}%`,
    label: "Góp ý được phản hồi",
    tone: "bg-violet-50 text-violet-600",
  },
];

const TIPS = [
  "Mô tả rõ vấn đề hoặc đề xuất",
  "Kèm ảnh chụp màn hình nếu là lỗi",
  "Ghi rõ trình duyệt / thiết bị gặp lỗi",
  "Tôn trọng cộng đồng — không spam, quảng cáo",
];

const POPULAR_CATEGORIES = [
  "tinh-nang",
  "ui-ux",
  "hieu-nang",
  "noi-dung",
  "dich-vu",
] as const;

/** Quy trinh xu ly mot gop y */
const PROCESS = [
  {
    icon: FiEdit3,
    title: "Gửi góp ý",
    description:
      "Bạn mô tả vấn đề hoặc đề xuất, có thể kèm ảnh hoặc gửi ẩn danh.",
  },
  {
    icon: FiEye,
    title: "Đội ngũ xem xét",
    description:
      "Góp ý được phân loại và chuyển đến đúng nhóm phụ trách trong ngày.",
  },
  {
    icon: FiCheckCircle,
    title: "Triển khai",
    description: "Đề xuất được đồng thuận cao sẽ đưa vào lộ trình phát triển.",
  },
];

const FeedbackPage = () => (
  <main className="bg-gray-25 pb-14 md:pb-20">
    {/* ── 1. DAU TRANG ──────────────────────────────────────────── */}
    <SoftPageHero
      id="feedback"
      crumb="Góp ý & phản hồi"
      eyebrow={{ icon: FiMessageSquare, label: "Góp ý & phản hồi" }}
      title={
        <>
          Giúp RealtyHub <Highlight>tốt hơn mỗi ngày</Highlight>
        </>
      }
      lead="Gửi lỗi, đề xuất tính năng hoặc đánh giá trải nghiệm — mỗi góp ý đều được đội ngũ đọc và phản hồi."
      image={{
        src: "/images/projects/vinhomes-ocean-park-gia-lam/hero-2-bien-ho-nuoc-man.jpg",
        width: 1422,
        height: 800,
        position: "65% 60%",
      }}
      script={{ main: "Lắng nghe bạn", sub: "Mỗi góp ý đều có giá trị" }}
    >
      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href="#gui-gop-y"
          className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-brand-700 px-6 py-3.5 text-theme-sm font-semibold text-white shadow-[0_12px_28px_-12px_rgba(15,111,209,0.85)] transition hover:brightness-110"
        >
          <FiEdit3 aria-hidden className="h-4 w-4" />
          Gửi góp ý ngay
        </a>
        <a
          href="#quy-trinh"
          className="group inline-flex items-center gap-2 rounded-full border border-brand-300 bg-white/90 px-6 py-3.5 text-theme-sm font-semibold text-brand-700 backdrop-blur transition hover:border-brand-500"
        >
          Xem quy trình xử lý
          <FiArrowRight
            aria-hidden
            className="transition-transform group-hover:translate-x-1"
          />
        </a>
      </div>

      <dl className="mt-10 grid max-w-4xl grid-cols-2 gap-3 lg:grid-cols-4">
        {STATS.map(({ icon: Icon, value, label, tone }) => (
          <div
            key={label}
            className="flex items-center gap-2.5 rounded-2xl border border-white bg-white/85 p-3 sm:gap-3 sm:p-4 shadow-[0_12px_28px_-18px_rgba(30,64,175,0.45)] backdrop-blur"
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-11 sm:w-11 ${tone}`}
            >
              <Icon aria-hidden className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <dd className="text-lg leading-none font-bold whitespace-nowrap text-navy-800 sm:text-xl md:text-2xl">
                {value}
              </dd>
              <dt className="mt-1 text-theme-xs leading-snug text-gray-500">
                {label}
              </dt>
            </div>
          </div>
        ))}
      </dl>
    </SoftPageHero>

    {/* ── 2. GUI GOP Y ──────────────────────────────────────────── */}
    <section
      id="gui-gop-y"
      className="site-container scroll-mt-24 pt-14 md:pt-16"
    >
      <div className="relative isolate overflow-hidden rounded-3xl border border-white bg-gradient-to-b from-[#f2f8ff] via-[#f7fbff] to-[#eef5ff] px-3 py-10 shadow-[0_24px_60px_-34px_rgba(30,64,175,0.45)] sm:px-5 md:px-10 md:py-14">
        <span
          aria-hidden
          className="absolute -top-28 -left-28 -z-10 h-72 w-72 rounded-full bg-gradient-to-br from-sky-300/60 to-brand-400/40"
        />
        <span
          aria-hidden
          className="absolute -top-10 -right-10 -z-10 h-40 w-40 rounded-full bg-sky-100"
        />
        <span
          aria-hidden
          className="absolute -bottom-32 -left-10 -z-10 h-64 w-[38rem] rounded-[50%] bg-sky-200/50 blur-2xl"
        />
        <span
          aria-hidden
          className="absolute -right-20 -bottom-28 -z-10 h-64 w-96 rounded-[50%] bg-violet-200/50 blur-2xl"
        />

        <div className="mx-auto mb-10 max-w-3xl text-center">
          <SectionEyebrow>Gửi góp ý</SectionEyebrow>
          <h2 className="mt-4 text-2xl leading-tight font-bold text-navy-800 md:text-4xl">
            Chia sẻ của bạn, <Highlight>chúng tôi lắng nghe</Highlight>
          </h2>
          <p className="mt-4 text-theme-sm leading-relaxed text-gray-600 md:text-base">
            Càng chi tiết, đội ngũ càng xử lý nhanh. Có thể đính kèm ảnh hoặc
            gửi ẩn danh.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Form */}
          <div className="rounded-3xl border border-white bg-white p-5 shadow-[0_18px_40px_-20px_rgba(15,23,42,0.35)] sm:p-6 md:p-8 lg:col-span-3">
            <FeedbackForm />
          </div>

          <aside className="flex flex-col gap-6 lg:col-span-2">
            {/* Meo gop y */}
            <div className="rounded-3xl border border-white bg-white/85 p-6 shadow-[0_14px_34px_-20px_rgba(30,64,175,0.4)] backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-50 to-violet-100 text-brand-600">
                  <FiThumbsUp aria-hidden className="h-5 w-5" />
                </span>
                <h3 className="text-lg font-bold text-navy-800">
                  Góp ý hiệu quả
                </h3>
              </div>
              <ul className="mt-5 space-y-3">
                {TIPS.map((tip) => (
                  <li
                    key={tip}
                    className="flex items-start gap-3 text-theme-sm text-gray-700"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-brand-600 text-white">
                      <FiCheck aria-hidden className="h-3 w-3" />
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Chuyen muc */}
            <div className="rounded-3xl border border-white bg-white/85 p-6 shadow-[0_14px_34px_-20px_rgba(30,64,175,0.4)] backdrop-blur">
              <h3 className="text-lg font-bold text-navy-800">
                Chuyên mục phổ biến
              </h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {POPULAR_CATEGORIES.map((cat) => {
                  const Icon = FEEDBACK_CATEGORY_ICON[cat];
                  return (
                    <li
                      key={cat}
                      className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50/70 px-3.5 py-2 text-theme-sm font-medium text-brand-700"
                    >
                      <Icon aria-hidden className="h-4 w-4" />
                      {FEEDBACK_CATEGORY_LABELS[cat]}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Minh bach: the anh, chu don xuong day tren nen toi dan */}
            <div className="relative isolate flex min-h-60 flex-1 flex-col justify-end overflow-hidden rounded-3xl bg-navy-800 p-6 text-white shadow-[0_24px_50px_-24px_rgba(15,23,42,0.7)]">
              <Image
                src="/images/about/landmark-81-river.jpg"
                alt=""
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="-z-20 object-cover object-[50%_40%]"
              />
              <div
                aria-hidden
                className="absolute inset-0 -z-10 bg-gradient-to-b from-navy-800/10 via-brand-800/60 to-navy-900/95"
              />
              <p className="font-[family-name:var(--font-handwriting)] text-3xl font-semibold text-sky-200">
                Minh bạch
              </p>
              <h3 className="mt-1 text-lg font-bold">Theo dõi từng góp ý</h3>
              <p className="mt-2 text-theme-sm leading-relaxed text-white/80">
                Mỗi góp ý đều được ghi nhận, theo dõi trạng thái xử lý và đội
                ngũ phản hồi lại cho bạn.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>

    {/* ── 3. QUY TRINH XU LY ────────────────────────────────────── */}
    <section
      id="quy-trinh"
      className="site-container scroll-mt-24 pt-14 md:pt-16"
    >
      <div className="mx-auto mb-12 max-w-3xl text-center">
        <SectionEyebrow>Quy trình</SectionEyebrow>
        <h2 className="mt-4 text-2xl leading-tight font-bold text-navy-800 md:text-4xl">
          Góp ý của bạn{" "}
          <span className="bg-gradient-to-r from-sky-500 to-violet-600 bg-clip-text text-transparent">
            đi đến đâu?
          </span>
        </h2>
        <span
          aria-hidden
          className="mx-auto mt-5 block h-1 w-16 rounded-full bg-gradient-to-r from-sky-400 to-violet-500"
        />
      </div>

      <ol className="relative grid gap-x-5 gap-y-10 pt-6 md:grid-cols-3">
        <span
          aria-hidden
          className="absolute top-6 right-[16%] left-[16%] hidden h-px bg-gradient-to-r from-sky-300 via-brand-400 to-violet-400 md:block"
        />
        {PROCESS.map((step, index) => (
          <li
            key={step.title}
            className="relative flex flex-col items-center rounded-2xl border border-sky-100 bg-white px-5 pt-10 pb-6 text-center shadow-[0_14px_34px_-20px_rgba(30,64,175,0.4)] transition hover:-translate-y-1 hover:shadow-[0_22px_44px_-20px_rgba(30,64,175,0.5)]"
          >
            <span className="absolute -top-6 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 via-brand-500 to-violet-600 text-lg font-bold text-white shadow-[0_10px_24px_-8px_rgba(79,70,229,0.7)] ring-4 ring-white">
              {index + 1}
            </span>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-50 to-violet-100 text-brand-600">
              <step.icon aria-hidden className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-base font-bold text-navy-800">
              {step.title}
            </h3>
            <p className="mt-2 text-theme-sm leading-relaxed text-gray-600">
              {step.description}
            </p>
          </li>
        ))}
      </ol>
    </section>

    {/* ── 4. CTA (anh nen mo) ───────────────────────────────────── */}
    <section className="site-container pt-14 md:pt-16">
      <div className="relative isolate overflow-hidden rounded-3xl bg-navy-800 px-6 py-12 text-center text-white md:py-14">
        <Image
          src="/images/projects/the-global-city.jpg"
          alt=""
          fill
          sizes="1280px"
          className="-z-20 object-cover opacity-35"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-800/95 via-brand-700/80 to-violet-700/85"
        />
        <h2 className="mx-auto max-w-2xl text-2xl leading-tight font-bold md:text-3xl">
          Cần trợ giúp ngay?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-theme-sm leading-relaxed text-white/80 md:text-base">
          Xem hướng dẫn sử dụng từng bước, hoặc liên hệ trực tiếp đội ngũ hỗ trợ
          RealtyHub.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/huong-dan"
            className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-theme-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            Hướng dẫn sử dụng
            <FiArrowRight
              aria-hidden
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
          <Link
            href="/lien-he-chung-toi"
            className="inline-flex items-center rounded-full border border-white/40 px-6 py-3 text-theme-sm font-semibold text-white transition hover:bg-white/10"
          >
            Liên hệ hỗ trợ
          </Link>
        </div>
      </div>
    </section>
  </main>
);

export default FeedbackPage;
