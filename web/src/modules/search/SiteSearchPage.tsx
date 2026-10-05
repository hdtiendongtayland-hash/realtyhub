'use client';

import { useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FiArrowRight, FiSearch } from 'react-icons/fi';
import PlaceholderThumb from '@/common/components/PlaceholderThumb';
import { SEARCH_GROUPS, searchSite, type SearchGroupKey, type SearchHit } from './site-search';

type TabKey = 'tat-ca' | SearchGroupKey;

/** Moi nhom hien bao nhieu dong o tab "Tat ca" */
const PREVIEW_COUNT = 4;

const HitRow = ({ hit }: { hit: SearchHit }) => (
  <li>
    <Link
      href={hit.href}
      className="group flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-3 shadow-theme-xs transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-theme-md"
    >
      <span className="relative block aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:w-32">
        <PlaceholderThumb seed={hit.id} src={hit.imageUrl} alt={hit.title} label={hit.title} />
      </span>
      <span className="min-w-0 flex-1">
        {hit.badge && (
          <span className="mb-1 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
            {hit.badge}
          </span>
        )}
        <span className="line-clamp-1 block font-semibold text-gray-900 transition group-hover:text-brand-600">
          {hit.title}
        </span>
        <span className="mt-0.5 line-clamp-2 block text-theme-xs leading-relaxed text-gray-500">
          {hit.subtitle}
        </span>
      </span>
      <FiArrowRight
        aria-hidden
        className="h-4 w-4 shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-brand-500"
      />
    </Link>
  </li>
);

/**
 * Trang /tim-kiem?q=&tab= - ket qua tim kiem toan trang, chia tab theo tung
 * muc tren thanh dieu huong (Du an, Quy can, Chu dau tu, Su kien, Tin tuc,
 * Dao tao). Tab "Tat ca" xem nhanh vai ket qua moi muc.
 */
const SiteSearchPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const rawTab = searchParams.get('tab');
  const tab: TabKey = SEARCH_GROUPS.some((group) => group.key === rawTab) ? (rawTab as SearchGroupKey) : 'tat-ca';
  const [draft, setDraft] = useState(query);

  const results = useMemo(() => searchSite(query), [query]);

  const navigate = (next: { q?: string; tab?: TabKey }) => {
    const params = new URLSearchParams();
    const q = next.q ?? query;
    const t = next.tab ?? tab;
    if (q) params.set('q', q);
    if (t !== 'tat-ca') params.set('tab', t);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const submit = (submitEvent: FormEvent) => {
    submitEvent.preventDefault();
    navigate({ q: draft.trim(), tab: 'tat-ca' });
  };

  const groupsWithHits = SEARCH_GROUPS.filter((group) => results[group.key].length > 0);

  return (
    <main className="bg-gray-25 pb-16">
      <section className="brand-gradient py-10 text-white">
        <div className="site-container">
          <h1 className="text-center text-2xl font-bold uppercase md:text-3xl">Tìm kiếm</h1>
          <form onSubmit={submit} className="mx-auto mt-5 flex max-w-2xl items-center gap-2 rounded-full bg-white p-1.5 shadow-lg">
            <FiSearch aria-hidden className="ml-3 h-5 w-5 shrink-0 text-gray-400" />
            <input
              type="search"
              value={draft}
              onChange={(change) => setDraft(change.target.value)}
              placeholder="Tìm dự án, mã căn, chủ đầu tư, sự kiện, tin tức..."
              aria-label="Từ khóa tìm kiếm"
              className="h-11 min-w-0 flex-1 bg-transparent text-theme-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
            <button
              type="submit"
              className="h-11 shrink-0 rounded-full bg-brand-500 px-6 text-theme-sm font-semibold text-white transition hover:bg-brand-600"
            >
              Tìm kiếm
            </button>
          </form>
          {query && (
            <p className="mt-3 text-center text-theme-sm text-white/85">
              Có <strong className="text-white">{results.total}</strong> kết quả cho “{query}”
            </p>
          )}
        </div>
      </section>

      <div className="site-container">
        {/* Tab theo muc */}
        <div
          role="tablist"
          aria-label="Lọc kết quả theo mục"
          className="no-scrollbar -mt-5 flex gap-1 overflow-x-auto rounded-2xl border border-gray-200 bg-white p-1.5 shadow-card"
        >
          {[{ key: 'tat-ca' as const, label: 'Tất cả', count: results.total }, ...SEARCH_GROUPS.map((group) => ({ ...group, count: results.counts[group.key] }))].map(
            (item) => {
              const isActive = item.key === tab;
              return (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => navigate({ tab: item.key })}
                  className={`flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2.5 text-theme-sm whitespace-nowrap transition lg:flex-1 lg:justify-center ${
                    isActive ? 'brand-gradient font-semibold text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                  <span
                    className={`rounded-full px-1.5 text-[11px] font-bold ${
                      isActive ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {item.count}
                  </span>
                </button>
              );
            },
          )}
        </div>

        <div className="mt-8">
          {!query ? (
            <p className="py-16 text-center text-theme-sm text-gray-500">
              Nhập từ khóa để tìm trên toàn bộ RealtyHub.
            </p>
          ) : results.total === 0 ? (
            <p className="py-16 text-center text-theme-sm text-gray-500">
              Không tìm thấy kết quả nào cho “{query}”. Thử từ khóa ngắn hơn hoặc không dấu.
            </p>
          ) : tab === 'tat-ca' ? (
            <div className="space-y-10">
              {groupsWithHits.map((group) => {
                const hits = results[group.key];
                return (
                  <section key={group.key}>
                    <div className="mb-4 flex items-end justify-between gap-3">
                      <h2 className="border-l-4 border-brand-500 pl-3 text-lg font-bold text-gray-900">
                        {group.label}
                        <span className="ml-2 text-theme-sm font-medium text-gray-400">
                          ({results.counts[group.key]})
                        </span>
                      </h2>
                      {hits.length > PREVIEW_COUNT && (
                        <button
                          type="button"
                          onClick={() => navigate({ tab: group.key })}
                          className="inline-flex items-center gap-1 text-theme-sm font-semibold text-brand-600 hover:underline"
                        >
                          Xem tất cả
                          <FiArrowRight aria-hidden />
                        </button>
                      )}
                    </div>
                    <ul className="grid gap-3 md:grid-cols-2">
                      {hits.slice(0, PREVIEW_COUNT).map((hit) => (
                        <HitRow key={hit.id} hit={hit} />
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          ) : results[tab].length === 0 ? (
            <p className="py-16 text-center text-theme-sm text-gray-500">
              Không có kết quả trong mục này.
            </p>
          ) : (
            <>
              <ul className="grid gap-3 md:grid-cols-2">
                {results[tab].map((hit) => (
                  <HitRow key={hit.id} hit={hit} />
                ))}
              </ul>
              {results.counts[tab] > results[tab].length && (
                <p className="mt-4 text-center text-theme-sm text-gray-500">
                  Đang hiện {results[tab].length}/{results.counts[tab]} kết quả - thêm từ khóa để thu hẹp.
                  {tab === 'quy-can' && (
                    <>
                      {' '}
                      <Link href="/quy-can" className="font-semibold text-brand-600 hover:underline">
                        Mở trang Quỹ căn để lọc chi tiết
                      </Link>
                    </>
                  )}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default SiteSearchPage;
