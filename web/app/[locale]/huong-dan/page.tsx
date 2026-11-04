import Image from "next/image";
import Link from "next/link";
import {
  FiArrowRight,
  FiBookOpen,
  FiClock,
  FiLifeBuoy,
  FiMessageCircle,
  FiSearch,
} from "react-icons/fi";

import PlaceholderThumb from "@/common/components/PlaceholderThumb";
import SoftPageHero, {
  Highlight,
  SectionEyebrow,
} from "@/common/components/SoftPageHero";
import { guideGroupIcon } from "@/modules/help/helpIcons";

import type { Metadata } from "next";

import {
  AUDIENCES,
  GUIDE_ARTICLES,
  GUIDE_GROUPS,
  type Audience,
} from "@/modules/help/mocks/help.mock";

/**
 * Trang /huong-dan - Trung tam ho tro, cung phong cach trang /gioi-thieu:
 *   1. Dau trang: chu + anh mo dan, o tim + loc doi tuong, the nhom huong dan
 *   2. Bat dau nhanh: 5 buoc noi nhau
 *   3. Bai viet theo nhom (loc theo doi tuong qua ?audience=)
 *   4. CTA lien he / gop y
 */
export const metadata: Metadata = {
  title: "Hướng dẫn sử dụng",
  description:
    "Trung tâm hỗ trợ RealtyHub — hướng dẫn chi tiết cho người mua, môi giới, chủ đầu tư và đối tác. Video tutorial, FAQ và liên hệ support.",
};

type PageSearchParams = {
  audience?: string;
};

const parseAudience = (raw: string | undefined): Audience | null => {
  if (
    raw === "buyer" ||
    raw === "agent" ||
    raw === "developer" ||
    raw === "partner"
  ) {
    return raw;
  }
  return null;
};

const GETTING_STARTED_STEPS = [
  {
    title: "Tạo tài khoản miễn phí",
    desc: "Đăng ký bằng email, Google hoặc Zalo trong vòng 60 giây.",
  },
  {
    title: "Hoàn thiện hồ sơ cá nhân",
    desc: "Thêm avatar, sở thích và khu vực quan tâm để nhận đề xuất phù hợp.",
  },
  {
    title: "Khám phá tính năng chính",
    desc: "Tìm kiếm dự án, lưu yêu thích, so sánh — tất cả đều miễn phí.",
  },
  {
    title: "Kết nối với môi giới",
    desc: "Nhắn tin trực tiếp qua hệ thống — bảo mật và an toàn.",
  },
  {
    title: "Đăng ký nhận thông báo",
    desc: "Nhận email khi có BĐS mới phù hợp với tiêu chí của bạn.",
  },
];

const HuongDanPage = async ({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) => {
  const params = await searchParams;
  const activeAudience = parseAudience(params.audience);

  // Loc bai viet theo doi tuong -> suy ra nhom con hien thi
  const filteredArticles = activeAudience
    ? GUIDE_ARTICLES.filter((a) => a.audience === activeAudience)
    : GUIDE_ARTICLES;
  const visibleArticleIds = new Set(filteredArticles.map((a) => a.publicId));
  const visibleGroups = activeAudience
    ? GUIDE_GROUPS.filter((g) =>
        g.articleIds.some((id) => visibleArticleIds.has(id)),
      )
    : GUIDE_GROUPS;
  // Nhom con bai viet sau khi loc
  const groupBlocks = visibleGroups
    .map((group) => ({
      group,
      articles: filteredArticles.filter((a) => a.groupId === group.publicId),
    }))
    .filter((block) => block.articles.length > 0);

  return (
    <main className="bg-gray-25 pb-14 md:pb-20">
      {/* ── 1. DAU TRANG ──────────────────────────────────────────── */}
      <SoftPageHero
        id="guide"
        crumb="Hướng dẫn sử dụng"
        eyebrow={{ icon: FiLifeBuoy, label: "Trung tâm hỗ trợ" }}
        title={
          <>
            Chúng tôi có thể <Highlight>giúp gì cho bạn?</Highlight>
          </>
        }
        lead="Bài viết hướng dẫn từng bước cho người mua, môi giới, chủ đầu tư và đối tác — dễ hiểu, có hình minh hoạ."
        image={{ src: "/images/dao-tao/hero.jpg", width: 2400, height: 900 }}
        script={{ main: "Từng bước một", sub: "Dễ hiểu, dễ làm" }}
      >
        {/* O tim */}
        <div className="mt-8 flex max-w-2xl">
          <Link
            href="#guides"
            className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-white bg-white py-1.5 pr-1.5 pl-5 text-left shadow-[0_10px_30px_-16px_rgba(30,64,175,0.5)] transition hover:shadow-[0_14px_34px_-16px_rgba(30,64,175,0.6)]"
          >
            <FiSearch aria-hidden className="h-5 w-5 shrink-0 text-gray-400" />
            <span className="flex-1 truncate text-base text-gray-400">
              Tìm kiếm bài viết, video, FAQ...
            </span>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-[0_8px_18px_-8px_rgba(79,70,229,0.8)]">
              <FiArrowRight aria-hidden className="h-4 w-4" />
            </span>
          </Link>
        </div>

        {/* The nhom huong dan */}
        <ul className="mt-10 grid max-w-5xl grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {visibleGroups.map((group) => {
            const { icon: GroupIcon, tone } = guideGroupIcon(group.publicId);
            const count = group.articleIds.filter((id) =>
              visibleArticleIds.has(id),
            ).length;
            return (
              <li key={group.publicId}>
                <a
                  href={`#group-${group.publicId}`}
                  className="flex h-full flex-col gap-2 rounded-2xl border border-white bg-white/85 p-4 shadow-[0_12px_28px_-18px_rgba(30,64,175,0.45)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_34px_-18px_rgba(30,64,175,0.55)]"
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${tone}`}
                  >
                    <GroupIcon aria-hidden className="h-5 w-5" />
                  </span>
                  <span className="text-theme-sm font-bold text-navy-800">
                    {group.title}
                  </span>
                  <span className="text-theme-xs text-gray-500">
                    {count} bài viết
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </SoftPageHero>

      {/* ── 2. BAT DAU NHANH ──────────────────────────────────────── */}
      <section className="site-container pt-14 md:pt-16">
        <div className="relative isolate overflow-hidden rounded-3xl border border-white bg-gradient-to-b from-[#f4f8ff] via-[#f8fbff] to-[#eef4ff] px-5 py-10 shadow-[0_24px_60px_-34px_rgba(30,64,175,0.45)] md:px-10 md:py-14">
          <span
            aria-hidden
            className="absolute -top-24 -left-24 -z-10 h-64 w-64 rounded-full bg-sky-100"
          />
          <span
            aria-hidden
            className="absolute -top-20 -right-16 -z-10 h-56 w-56 rounded-full bg-gradient-to-br from-sky-100 to-violet-200/70"
          />
          <span
            aria-hidden
            className="absolute -bottom-16 -left-10 -z-10 h-40 w-[40rem] rounded-[50%] bg-sky-200/60 blur-2xl"
          />
          <span
            aria-hidden
            className="absolute -right-10 -bottom-16 -z-10 h-40 w-[30rem] rounded-[50%] bg-violet-200/60 blur-2xl"
          />

          <div className="mx-auto mb-12 max-w-3xl text-center">
            <SectionEyebrow>Bắt đầu nhanh</SectionEyebrow>
            <h2 className="mt-4 text-2xl leading-tight font-bold text-navy-800 md:text-4xl">
              Sẵn sàng{" "}
              <span className="bg-gradient-to-r from-sky-500 to-violet-600 bg-clip-text text-transparent">
                trong 5 phút
              </span>
            </h2>
            <span
              aria-hidden
              className="mx-auto mt-5 block h-1 w-16 rounded-full bg-gradient-to-r from-sky-400 to-violet-500"
            />
          </div>

          <ol className="relative grid gap-x-4 gap-y-10 pt-6 sm:grid-cols-2 lg:grid-cols-5">
            <span
              aria-hidden
              className="absolute top-6 right-[10%] left-[10%] hidden h-px bg-gradient-to-r from-sky-300 via-brand-400 to-violet-400 lg:block"
            />
            {GETTING_STARTED_STEPS.map((step, index) => (
              <li
                key={step.title}
                className="relative flex flex-col items-center rounded-2xl border border-sky-100 bg-white/90 px-4 pt-10 pb-5 text-center shadow-[0_14px_34px_-20px_rgba(30,64,175,0.4)] backdrop-blur transition hover:-translate-y-1 hover:shadow-[0_22px_44px_-20px_rgba(30,64,175,0.5)]"
              >
                <span className="absolute -top-6 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 via-brand-500 to-violet-600 text-lg font-bold text-white shadow-[0_10px_24px_-8px_rgba(79,70,229,0.7)] ring-4 ring-white">
                  {index + 1}
                </span>
                <h3 className="text-theme-sm font-bold text-navy-800 md:text-base">
                  {step.title}
                </h3>
                <p className="mt-2 text-theme-xs leading-relaxed text-gray-600 md:text-theme-sm">
                  {step.desc}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-10 text-center">
            <Link
              href="/dang-ky"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-brand-700 px-6 py-3.5 text-theme-sm font-semibold text-white shadow-[0_12px_28px_-12px_rgba(15,111,209,0.85)] transition hover:brightness-110"
            >
              Tạo tài khoản miễn phí
              <FiArrowRight
                aria-hidden
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 3. BAI VIET THEO NHOM ─────────────────────────────────── */}
      <section
        id="guides"
        className="site-container scroll-mt-24 pt-14 md:pt-16"
      >
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <SectionEyebrow>
            {activeAudience
              ? (AUDIENCES.find((a) => a.id === activeAudience)?.label ??
                "Hướng dẫn")
              : "Tất cả hướng dẫn"}
          </SectionEyebrow>
          <h2 className="mt-4 text-2xl leading-tight font-bold text-navy-800 md:text-4xl">
            <Highlight>{filteredArticles.length}</Highlight> bài viết hướng dẫn
          </h2>
        </div>

        {groupBlocks.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[16rem_1fr] xl:grid-cols-[18rem_1fr]">
            {/* Muc luc ben trai: dinh khi cuon (man lon) */}
            <aside className="hidden rounded-3xl border border-white bg-white/90 p-4 shadow-[0_24px_60px_-34px_rgba(30,64,175,0.45)] backdrop-blur lg:sticky lg:top-24 lg:block">
              <p className="px-2 pt-1 pb-3 text-theme-xs font-bold tracking-[0.2em] text-brand-600 uppercase">
                Mục lục
              </p>
              <nav aria-label="Nhóm hướng dẫn" className="flex flex-col gap-1">
                {groupBlocks.map(({ group, articles }) => {
                  const { icon: GroupIcon, tone } = guideGroupIcon(
                    group.publicId,
                  );
                  return (
                    <a
                      key={group.publicId}
                      href={`#group-${group.publicId}`}
                      className="group flex items-center gap-3 rounded-2xl px-2 py-2 transition hover:bg-sky-50"
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone}`}
                      >
                        <GroupIcon aria-hidden className="h-4.5 w-4.5" />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-theme-sm font-semibold text-gray-700 transition group-hover:text-brand-700">
                        {group.title}
                      </span>
                      <span className="shrink-0 rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-brand-700">
                        {articles.length}
                      </span>
                    </a>
                  );
                })}
              </nav>
              {/* The ho tro: nen sang nhe, cung tong voi muc luc */}
              <div className="relative isolate mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-sky-50 via-white to-violet-50 p-4 text-center ring-1 ring-sky-100">
                <span
                  aria-hidden
                  className="absolute -top-10 -right-10 -z-10 h-24 w-24 rounded-full bg-violet-100/80"
                />
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 via-brand-500 to-violet-600 text-white shadow-[0_10px_22px_-10px_rgba(79,70,229,0.7)] ring-4 ring-white">
                  <FiMessageCircle aria-hidden className="h-5 w-5" />
                </span>
                <p className="mt-3 text-theme-sm font-bold text-navy-800">
                  Cần hỗ trợ thêm?
                </p>
                <p className="mt-0.5 text-theme-xs text-gray-500">
                  Đội ngũ phản hồi trong 24 giờ
                </p>
                <Link
                  href="/lien-he-chung-toi"
                  className="group mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-brand-200 bg-white py-2 text-theme-xs font-semibold text-brand-700 transition hover:border-brand-500 hover:bg-brand-600 hover:text-white"
                >
                  Liên hệ đội ngũ
                  <FiArrowRight
                    aria-hidden
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
            </aside>

            {/* Cac nhom xep doc, bai viet chia 2 cot */}
            <div className="space-y-6">
              {groupBlocks.map(({ group, articles }) => {
                const { icon: GroupIcon, tone } = guideGroupIcon(
                  group.publicId,
                );
                return (
                  <div
                    key={group.publicId}
                    id={`group-${group.publicId}`}
                    className="relative isolate flex scroll-mt-24 flex-col overflow-hidden rounded-3xl border border-white bg-white/90 p-5 shadow-[0_24px_60px_-34px_rgba(30,64,175,0.45)] backdrop-blur sm:p-6"
                  >
                    <span
                      aria-hidden
                      className="absolute -top-20 -right-20 -z-10 h-48 w-48 rounded-full bg-gradient-to-br from-sky-100 to-violet-100"
                    />

                    {/* Dau nhom */}
                    <div className="flex items-center gap-4">
                      <span
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tone} ring-4 ring-white shadow-[0_10px_24px_-14px_rgba(30,64,175,0.6)]`}
                      >
                        <GroupIcon aria-hidden className="h-6 w-6" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-navy-800 md:text-xl">
                          {group.title}
                        </h3>
                        <p className="text-theme-sm text-gray-500">
                          {group.description}
                        </p>
                      </div>
                      <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-theme-xs font-bold text-brand-700 sm:inline-flex">
                        <FiBookOpen aria-hidden className="h-3.5 w-3.5" />
                        {articles.length} bài
                      </span>
                    </div>

                    <span
                      aria-hidden
                      className="my-5 block h-px bg-gradient-to-r from-sky-200 via-violet-100 to-transparent"
                    />

                    {/* Bai viet: dong gon, anh nho ben trai */}
                    {/* Bai le cuoi cung trai ca hang de khong chua o trong */}
                    <ul className="grid gap-3 md:grid-cols-2">
                      {articles.map((article, index) => (
                        <li
                          key={article.publicId}
                          className={
                            articles.length % 2 === 1 &&
                            index === articles.length - 1
                              ? "md:col-span-2"
                              : undefined
                          }
                        >
                          <Link
                            href={`#article-${article.publicId}`}
                            className="group flex items-center gap-4 rounded-2xl border border-sky-100/80 bg-gradient-to-br from-white to-sky-50/50 p-3 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[0_14px_30px_-18px_rgba(30,64,175,0.5)]"
                          >
                            <span className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl sm:w-28">
                              <PlaceholderThumb
                                seed={article.publicId}
                                src={article.coverImage}
                                label={article.title}
                                alt=""
                                className="transition-transform duration-500 group-hover:scale-110"
                              />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="line-clamp-2 text-theme-sm font-bold text-navy-800 md:line-clamp-1 transition group-hover:text-brand-600 md:text-base">
                                {article.title}
                              </span>
                              <span className="mt-0.5 line-clamp-2 text-theme-xs leading-relaxed text-gray-500 md:text-theme-sm">
                                {article.excerpt}
                              </span>
                              <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-theme-xs text-gray-500">
                                <span className="inline-flex items-center gap-1 font-semibold text-brand-600">
                                  <FiClock
                                    aria-hidden
                                    className="h-3.5 w-3.5"
                                  />
                                  {article.readMinutes} phút
                                </span>
                                <span>
                                  {article.steps.length} bước
                                  {article.tips &&
                                    ` · ${article.tips.length} mẹo`}
                                </span>
                              </span>
                            </span>
                            <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white sm:flex">
                              <FiArrowRight aria-hidden className="h-4 w-4" />
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
            <FiMessageCircle aria-hidden className="h-7 w-7" />
          </span>
          <h2 className="mx-auto mt-4 max-w-2xl text-2xl leading-tight font-bold md:text-3xl">
            Không tìm thấy câu trả lời?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-theme-sm leading-relaxed text-white/80 md:text-base">
            Đội ngũ hỗ trợ luôn sẵn sàng giúp bạn — gọi hotline, nhắn tin hoặc
            gửi câu hỏi để được trả lời sớm nhất.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/lien-he-chung-toi"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-theme-sm font-semibold text-brand-700 transition hover:bg-brand-50"
            >
              Liên hệ hỗ trợ
              <FiArrowRight
                aria-hidden
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/gop-y-va-phan-hoi"
              className="inline-flex items-center rounded-full border border-white/40 px-6 py-3 text-theme-sm font-semibold text-white transition hover:bg-white/10"
            >
              Gửi câu hỏi
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

const EmptyState = () => (
  <div className="rounded-3xl border border-dashed border-sky-200 bg-white/70 p-10 text-center">
    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-50 to-violet-100 text-brand-600">
      <FiSearch aria-hidden className="h-6 w-6" />
    </span>
    <h3 className="mt-4 text-lg font-bold text-navy-800">
      Chưa có hướng dẫn cho đối tượng này
    </h3>
    <p className="mt-2 text-theme-sm text-gray-600">
      Bạn có thể gửi yêu cầu để đội ngũ bổ sung nội dung phù hợp.
    </p>
    <Link
      href="/gop-y-va-phan-hoi"
      className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-brand-700 px-5 py-2.5 text-theme-sm font-semibold text-white shadow-theme-sm transition hover:brightness-110"
    >
      Gửi yêu cầu
      <FiArrowRight aria-hidden className="h-4 w-4" />
    </Link>
  </div>
);

export default HuongDanPage;
