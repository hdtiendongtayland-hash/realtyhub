import Image from "next/image";
import Link from "next/link";
import {
  FiArrowRight,
  FiCheck,
  FiClock,
  FiHeadphones,
  FiMail,
  FiMapPin,
  FiPhone,
  FiPhoneCall,
} from "react-icons/fi";

import SoftPageHero, {
  Highlight,
  SectionEyebrow,
} from "@/common/components/SoftPageHero";
import ContactForm from "@/modules/contact/components/ContactForm";

import type { Metadata } from "next";

/**
 * Trang /lien-he-chung-toi - cung phong cach trang /gioi-thieu (khoi bo tron
 * lon, nen xanh nhat pha tim, anh mo dan, chu viet tay), bo cuc rieng:
 *   1. Dau trang: chu ben trai, anh mo dan ben phai + 4 kenh lien he nhanh
 *   2. Gui yeu cau: the cam ket (trai) | form (phai)
 *   3. Ban do tru so
 *   4. CTA cong tac vien co anh nen mo
 */
export const metadata: Metadata = {
  title: "Liên hệ chúng tôi",
  description:
    "Liên hệ với đội ngũ RealtyHub — Email, hotline, trụ sở chính tại Đông Tây Building, 192 Trần Não, TP. Thủ Đức, TP. Hồ Chí Minh. Phản hồi trong 24 giờ làm việc.",
};

const HOTLINE = { display: "024 7100 0000", tel: "+842471000000" };

const QUICK_CONTACTS = [
  {
    icon: FiPhone,
    label: "Hotline 24/7",
    value: HOTLINE.display,
    href: `tel:${HOTLINE.tel}`,
    tone: "bg-brand-50 text-brand-600",
  },
  {
    icon: FiMail,
    label: "Email hỗ trợ",
    value: "support@realtyhub.vn",
    href: "mailto:support@realtyhub.vn",
    tone: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: FiMapPin,
    label: "Trụ sở chính",
    value: "192 Trần Não, An Khánh, TP. Thủ Đức",
    href: "#van-phong",
    tone: "bg-violet-50 text-violet-600",
  },
  {
    icon: FiClock,
    label: "Giờ làm việc",
    value: "T2 - T7: 8:00 - 21:00",
    tone: "bg-amber-50 text-amber-600",
  },
];

const COMMITMENTS = [
  {
    title: "Phản hồi trong 24 giờ",
    description:
      "Mọi yêu cầu đều được chuyên viên phụ trách liên hệ lại trong giờ làm việc.",
  },
  {
    title: "Đúng người, đúng việc",
    description:
      "Yêu cầu được chuyển thẳng tới bộ phận tư vấn dự án, hợp tác hoặc kỹ thuật.",
  },
  {
    title: "Bảo mật thông tin",
    description:
      "Thông tin của bạn chỉ dùng để tư vấn, không chia sẻ cho bên thứ ba.",
  },
];

const HEAD_OFFICE_ADDRESS =
  "Đông Tây Building, 192 Trần Não, Phường An Khánh, Thành phố Thủ Đức (Quận 2 cũ), TP. Hồ Chí Minh";

/** Ban do tru so chinh: Google Maps ghim theo dia chi (OSM chua co so nha 192 Tran Nao) */
const HEAD_OFFICE_MAP = `https://www.google.com/maps?q=${encodeURIComponent("Đông Tây Building, 192 Trần Não, An Khánh, Thủ Đức, Hồ Chí Minh")}&z=16&output=embed`;

const LienHeChungToiPage = () => (
  <main className="bg-gray-25 pb-14 md:pb-20">
    {/* ── 1. DAU TRANG ──────────────────────────────────────────── */}
    <SoftPageHero
      id="contact"
      crumb="Liên hệ"
      eyebrow={{ icon: FiHeadphones, label: "Hỗ trợ 24/7" }}
      title={
        <>
          Kết nối với RealtyHub, <Highlight>chúng tôi luôn sẵn sàng</Highlight>
        </>
      }
      lead="Đội ngũ RealtyHub phản hồi trong vòng 24 giờ làm việc. Câu hỏi gấp về dự án, hợp tác hay hỗ trợ kỹ thuật — vui lòng gọi hotline để được tư vấn ngay."
      image={{
        src: "/images/heroes/lien-he-chung-toi.jpg",
        width: 2400,
        height: 900,
      }}
      script={{ main: "Luôn lắng nghe", sub: "Phản hồi trong 24 giờ" }}
    >
      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={`tel:${HOTLINE.tel}`}
          className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-brand-700 px-6 py-3.5 text-theme-sm font-semibold text-white shadow-[0_12px_28px_-12px_rgba(15,111,209,0.85)] transition hover:brightness-110"
        >
          <FiPhoneCall aria-hidden className="h-4 w-4" />
          Gọi {HOTLINE.display}
        </a>
        <a
          href="#gui-yeu-cau"
          className="group inline-flex items-center gap-2 rounded-full border border-brand-300 bg-white/90 px-6 py-3.5 text-theme-sm font-semibold text-brand-700 backdrop-blur transition hover:border-brand-500"
        >
          Gửi yêu cầu tư vấn
          <FiArrowRight
            aria-hidden
            className="transition-transform group-hover:translate-x-1"
          />
        </a>
      </div>

      {/* 4 kenh lien he nhanh */}
      <ul className="mt-10 grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_CONTACTS.map(({ icon: Icon, label, value, href, tone }) => {
          const inner = (
            <>
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${tone}`}
              >
                <Icon aria-hidden className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-theme-xs text-gray-500">
                  {label}
                </span>
                <span className="block truncate text-theme-sm font-bold text-navy-800">
                  {value}
                </span>
              </span>
            </>
          );
          const cardClass =
            "flex h-full items-center gap-3 rounded-2xl border border-white bg-white/85 p-4 shadow-[0_12px_28px_-18px_rgba(30,64,175,0.45)] backdrop-blur transition";
          return (
            <li key={label}>
              {href ? (
                <a
                  href={href}
                  className={`${cardClass} hover:-translate-y-0.5 hover:shadow-[0_18px_34px_-18px_rgba(30,64,175,0.55)]`}
                >
                  {inner}
                </a>
              ) : (
                <div className={cardClass}>{inner}</div>
              )}
            </li>
          );
        })}
      </ul>
    </SoftPageHero>

    {/* ── 2. GUI YEU CAU: cam ket | form ─────────────────────────── */}
    <section
      id="gui-yeu-cau"
      className="site-container scroll-mt-24 pt-14 md:pt-16"
    >
      <div className="relative isolate overflow-hidden rounded-3xl border border-white bg-gradient-to-b from-[#f2f8ff] via-[#f7fbff] to-[#eef5ff] px-3 py-10 shadow-[0_24px_60px_-34px_rgba(30,64,175,0.45)] sm:px-5 md:px-10 md:py-14">
        {/* Mang cong trang tri */}
        <span
          aria-hidden
          className="absolute -top-28 -right-28 -z-10 h-72 w-72 rounded-full bg-gradient-to-br from-sky-300/60 to-violet-300/40"
        />
        <span
          aria-hidden
          className="absolute -top-10 -left-10 -z-10 h-40 w-40 rounded-full bg-sky-100"
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
          <SectionEyebrow>Gửi yêu cầu</SectionEyebrow>
          <h2 className="mt-4 text-2xl leading-tight font-bold text-navy-800 md:text-4xl">
            Để lại lời nhắn,{" "}
            <span className="text-[#3b9bf5]">chúng tôi gọi lại ngay</span>
          </h2>
          <p className="mt-4 text-theme-sm leading-relaxed text-gray-600 md:text-base">
            Mô tả ngắn nhu cầu của bạn — chuyên viên phụ trách sẽ liên hệ trong
            giờ làm việc.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* The cam ket: nen toi, anh mo */}
          <aside className="relative isolate flex flex-col overflow-hidden rounded-3xl bg-navy-800 p-6 text-white shadow-[0_24px_50px_-24px_rgba(15,23,42,0.7)] md:p-8 lg:col-span-2">
            <Image
              src="/images/about/landmark-81-river.jpg"
              alt=""
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="-z-20 object-cover opacity-30"
            />
            <div
              aria-hidden
              className="absolute inset-0 -z-10 bg-gradient-to-br from-navy-800/95 via-brand-700/85 to-violet-700/85"
            />

            <p className="font-[family-name:var(--font-handwriting)] text-3xl font-semibold text-sky-200">
              Tận tâm
            </p>
            <h3 className="mt-1 text-xl leading-snug font-bold md:text-2xl">
              Cam kết của RealtyHub khi bạn liên hệ
            </h3>

            <ul className="mt-6 space-y-3">
              {COMMITMENTS.map((item) => (
                <li
                  key={item.title}
                  className="flex items-start gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-300 to-brand-500 text-white">
                    <FiCheck aria-hidden className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-theme-sm">
                    <strong className="block font-semibold">
                      {item.title}
                    </strong>
                    <span className="text-white/75">{item.description}</span>
                  </span>
                </li>
              ))}
            </ul>

            <a
              href={`tel:${HOTLINE.tel}`}
              className="group mt-6 flex items-center gap-4 rounded-2xl bg-white p-4 text-navy-800 transition hover:-translate-y-0.5 lg:mt-auto"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 via-brand-500 to-violet-600 text-white shadow-[0_10px_24px_-8px_rgba(79,70,229,0.7)]">
                <FiPhoneCall aria-hidden className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-theme-xs text-gray-500">
                  Cần gấp? Gọi ngay
                </span>
                <span className="block text-xl font-bold">
                  {HOTLINE.display}
                </span>
              </span>
              <FiArrowRight
                aria-hidden
                className="text-brand-600 transition-transform group-hover:translate-x-1"
              />
            </a>
          </aside>

          {/* Form */}
          <div className="rounded-3xl border border-white bg-white p-5 shadow-[0_18px_40px_-20px_rgba(15,23,42,0.35)] sm:p-6 md:p-8 lg:col-span-3">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>

    {/* ── 3. BAN DO TRU SO ──────────────────────────────────────────── */}
    <section
      id="van-phong"
      className="site-container scroll-mt-24 pt-14 md:pt-16"
    >
      {/* Ban do tru so */}
      <div className="relative overflow-hidden rounded-3xl border border-white bg-white p-2 shadow-[0_24px_60px_-34px_rgba(30,64,175,0.45)]">
        <div className="relative isolate aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-gray-100 [clip-path:inset(0_round_1.25rem)] sm:aspect-[16/9] md:aspect-[21/9]">
          {/* Hien du ban do Google: nut di chuyen / phong to va dong ghi nguon
              ngan cua Google nam o day, khong cat bot */}
          <iframe
            src={HEAD_OFFICE_MAP}
            title="Bản đồ trụ sở chính"
            loading="lazy"
            className="absolute inset-0 h-full w-full border-0"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="pointer-events-none absolute top-4 right-4 max-w-xs rounded-2xl border border-white bg-white/90 p-4 shadow-theme-lg backdrop-blur max-sm:hidden">
            <p className="text-theme-xs font-bold tracking-wide text-brand-600 uppercase">
              Trụ sở chính
            </p>
            <p className="mt-1 text-theme-sm font-semibold text-navy-800">
              {HEAD_OFFICE_ADDRESS}
            </p>
          </div>
        </div>
        {/* Vien trang bo goc ve DE LEN ban do: mot so trinh duyet bo qua bo goc /
            clip-path voi iframe nen goc ban do bi vuong - lop nay luon che goc */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-2 z-10 rounded-[1.25rem] shadow-[0_0_0_1.5rem_#fff]"
        />
      </div>
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
          Bạn là môi giới bất động sản?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-theme-sm leading-relaxed text-white/80 md:text-base">
          Trở thành cộng tác viên RealtyHub để nhận quỹ căn, công cụ tư vấn trực
          quan và hoa hồng minh bạch.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/tro-thanh-moi-gioi"
            className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-theme-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            Đăng ký cộng tác viên
            <FiArrowRight
              aria-hidden
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
          <Link
            href="/gioi-thieu"
            className="inline-flex items-center rounded-full border border-white/40 px-6 py-3 text-theme-sm font-semibold text-white transition hover:bg-white/10"
          >
            Tìm hiểu về RealtyHub
          </Link>
        </div>
      </div>
    </section>
  </main>
);

export default LienHeChungToiPage;
