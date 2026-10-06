import Link from "next/link";
import {
  FiArrowRight,
  FiClock,
  FiMessageCircle,
  FiSearch,
} from "react-icons/fi";

import PageBanner from "@/common/components/PageBanner";
import PlaceholderThumb from "@/common/components/PlaceholderThumb";
import { guideGroupIcon } from "@/modules/help/helpIcons";
import AudienceSelect from "./AudienceSelect";

import type { Metadata } from "next";

import {
  AUDIENCES,
  GUIDE_ARTICLES,
  GUIDE_GROUPS,
  type Audience,
} from "@/modules/help/mocks/help.mock";

/**
 * Trang /huong-dan - Trung tam ho tro cua RealtyHub.
 *
 * Layout (server component):
 *   01 Hero (gradient navy -> cyan, search bar + 4 audience tabs)
 *   02 Getting started (5 buoc nhanh cho moi doi tuong, ko filter)
 *   03 Guide groups (sidebar TOC 1 col + articles 3 col, filter theo audience)
 *   04 Videos (5 tutorial embed)
 *   05 FAQ (8 cau hoi, native <details> de a11y)
 *   06 Quick links CTA (4 kenh ho tro)
 *   07 Final CTA (lien he / gop y)
 *
 * Tone chinh: cyan (info / learn / docs) - phan biet brand/jade/orange.
 */
export const metadata: Metadata = {
  title: "Hướng dẫn sử dụng",
  description:
    "Trung tâm hỗ trợ RealtyHub — hướng dẫn chi tiết cho người mua, môi giới, chủ đầu tư và đối tác. Video tutorial, FAQ và liên hệ support.",
};

// ============================================================================
// Route types
// ============================================================================

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

// ============================================================================
// Helpers
// ============================================================================

// ============================================================================
// Page
// ============================================================================

const HuongDanPage = async ({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) => {
  const params = await searchParams;
  const activeAudience = parseAudience(params.audience);

  // Filter articles + faqs + videos theo audience
  const filteredArticles = activeAudience
    ? GUIDE_ARTICLES.filter((a) => a.audience === activeAudience)
    : GUIDE_ARTICLES;

  // Article IDs visible sau khi filter -> suy ra groups con hien thi
  const visibleArticleIds = new Set(filteredArticles.map((a) => a.publicId));
  const visibleGroups = activeAudience
    ? GUIDE_GROUPS.filter((g) =>
        g.articleIds.some((id) => visibleArticleIds.has(id)),
      )
    : GUIDE_GROUPS;

  return (
    <main className="bg-gray-25 pb-12 md:pb-16">
      <PageBanner
        crumb="Hướng dẫn sử dụng"
        eyebrow="Trung tâm hỗ trợ"
        imageUrl="/images/heroes/huong-dan.jpg"
        title="Chúng tôi có thể giúp gì cho bạn?"
        description="Bài viết hướng dẫn từng bước cho người mua, môi giới, chủ đầu tư và đối tác."
        overlap={
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {visibleGroups.map((group) => {
              const { icon: GroupIcon, tone } = guideGroupIcon(group.publicId);
              return (
                <li key={group.publicId}>
                  <a
                    href={`#group-${group.publicId}`}
                    className="flex h-full flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-theme-lg transition hover:-translate-y-0.5 hover:border-brand-200"
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}
                    >
                      <GroupIcon aria-hidden className="h-5 w-5" />
                    </span>
                    <span className="text-theme-sm font-semibold text-gray-900">
                      {group.title}
                    </span>
                    <span className="text-theme-xs text-gray-500">
                      {
                        group.articleIds.filter((id) =>
                          visibleArticleIds.has(id),
                        ).length
                      }{" "}
                      bài viết
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        }
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="#guides"
            className="flex min-w-0 flex-1 items-center gap-3 rounded-full bg-white py-3 pr-4 pl-5 text-left shadow-theme-md transition hover:shadow-theme-lg"
          >
            <FiSearch aria-hidden className="h-5 w-5 shrink-0 text-gray-400" />
            <span className="flex-1 truncate text-base text-gray-400">
              Tìm kiếm bài viết, video, FAQ...
            </span>
          </Link>
          <AudienceSelect value={activeAudience} options={AUDIENCES} />
        </div>
      </PageBanner>

      {/* Bat dau nhanh - 5 buoc */}
      <section className="site-container pt-10 md:pt-12">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-theme-sm md:p-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="text-theme-xs font-bold tracking-[0.2em] text-brand-600 uppercase">
                Bắt đầu nhanh
              </span>
              <h2 className="mt-2 text-2xl font-bold text-navy-800">
                Sẵn sàng trong 5 phút
              </h2>
            </div>
            <Link
              href="/dang-ky"
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-theme-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Tạo tài khoản
              <FiArrowRight aria-hidden />
            </Link>
          </div>
          <ol className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <span
              aria-hidden
              className="absolute top-5 right-[10%] left-[10%] hidden h-0.5 bg-brand-100 lg:block"
            />
            {GETTING_STARTED_STEPS.map((step, idx) => (
              <li
                key={step.title}
                className="relative flex gap-3 lg:flex-col lg:items-center lg:text-center"
              >
                <span className="brand-gradient relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-theme-sm font-bold text-white ring-4 ring-white">
                  {idx + 1}
                </span>
                <div>
                  <h3 className="text-theme-sm font-semibold text-gray-900 lg:mt-3">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-theme-xs leading-relaxed text-gray-500">
                    {step.desc}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Bai viet theo nhom */}
      <section
        id="guides"
        className="site-container scroll-mt-24 pt-10 md:pt-12"
      >
        <div className="mb-6">
          <span className="text-theme-xs font-bold tracking-[0.2em] text-brand-600 uppercase">
            {activeAudience
              ? AUDIENCES.find((a) => a.id === activeAudience)?.label
              : "Tất cả hướng dẫn"}
          </span>
          <h2 className="mt-2 text-2xl font-bold text-navy-800">
            {filteredArticles.length} bài viết hướng dẫn
          </h2>
        </div>

        {visibleGroups.length === 0 ? (
          <EmptyState audience={activeAudience} />
        ) : (
          <div className="space-y-10">
            {visibleGroups.map((group) => {
              const groupArticles = filteredArticles.filter(
                (a) => a.groupId === group.publicId,
              );
              if (groupArticles.length === 0) return null;
              const { icon: GroupIcon, tone } = guideGroupIcon(group.publicId);
              return (
                <div
                  key={group.publicId}
                  id={`group-${group.publicId}`}
                  className="scroll-mt-24"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}
                    >
                      <GroupIcon aria-hidden className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {group.title}
                      </h3>
                      <p className="text-theme-xs text-gray-500">
                        {group.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {groupArticles.map((article) => (
                      <article
                        key={article.publicId}
                        className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-theme-xs transition hover:-translate-y-1 hover:shadow-theme-md"
                      >
                        <Link
                          href={`#article-${article.publicId}`}
                          className="relative block aspect-[2/1] overflow-hidden"
                          aria-label={article.title}
                        >
                          <PlaceholderThumb
                            seed={article.publicId}
                            src={article.coverImage}
                            label={article.title}
                            alt={article.title}
                            className="transition-transform duration-500 group-hover:scale-105"
                          />
                          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-theme-xs font-bold text-gray-700">
                            <FiClock aria-hidden className="h-3 w-3" />
                            {article.readMinutes} phút
                          </span>
                        </Link>
                        <div className="flex flex-1 flex-col p-5">
                          <h4 className="text-base font-semibold text-gray-900">
                            <Link
                              href={`#article-${article.publicId}`}
                              className="transition hover:text-brand-600"
                            >
                              {article.title}
                            </Link>
                          </h4>
                          <p className="mt-1.5 line-clamp-2 text-theme-sm leading-relaxed text-gray-500">
                            {article.excerpt}
                          </p>
                          <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-theme-xs text-gray-500">
                            <span>
                              {article.steps.length} bước
                              {article.tips && ` · ${article.tips.length} mẹo`}
                            </span>
                            <span className="inline-flex items-center gap-1 font-semibold text-brand-600">
                              Đọc tiếp
                              <FiArrowRight
                                aria-hidden
                                className="h-3.5 w-3.5"
                              />
                            </span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Can them tro giup */}
      <section className="site-container pt-10 md:pt-12">
        <div className="brand-gradient flex flex-col gap-5 rounded-3xl p-6 text-white md:flex-row md:items-center md:justify-between md:p-8">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <FiMessageCircle aria-hidden className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-xl font-bold">Không tìm thấy câu trả lời?</h2>
              <p className="text-theme-sm text-white/80">
                Đội ngũ hỗ trợ luôn sẵn sàng giúp bạn.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/lien-he-chung-toi"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-theme-sm font-semibold text-brand-700 transition hover:bg-brand-50"
            >
              Liên hệ hỗ trợ
              <FiArrowRight aria-hidden />
            </Link>
            <Link
              href="/gop-y-va-phan-hoi"
              className="inline-flex items-center rounded-full border border-white/40 px-5 py-2.5 text-theme-sm font-semibold text-white transition hover:bg-white/10"
            >
              Gửi câu hỏi
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

// ============================================================================
// Static content
// ============================================================================

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

// ============================================================================
// Sub-components
// ============================================================================

const EmptyState = ({ audience: _audience }: { audience: Audience | null }) => (
  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-10 text-center">
    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
      <FiSearch aria-hidden className="h-6 w-6" />
    </span>
    <h3 className="mt-4 text-lg font-bold text-gray-900">
      Chưa có hướng dẫn cho đối tượng này
    </h3>
    <p className="mt-2 text-theme-sm text-gray-600">
      Bạn có thể gửi yêu cầu để đội ngũ bổ sung nội dung phù hợp.
    </p>
    <Link
      href="/gop-y-va-phan-hoi"
      className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-theme-sm font-semibold text-white shadow-theme-sm transition hover:bg-brand-700"
    >
      Gửi yêu cầu
      <FiArrowRight aria-hidden className="h-4 w-4" />
    </Link>
  </div>
);

export default HuongDanPage;
