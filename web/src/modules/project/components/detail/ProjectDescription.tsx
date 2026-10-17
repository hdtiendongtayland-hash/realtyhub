'use client';

import type { IconType } from 'react-icons';
import {
  FiBriefcase,
  FiCalendar,
  FiFileText,
  FiHome,
  FiInfo,
  FiKey,
  FiLayers,
  FiMapPin,
  FiMaximize,
  FiStar,
  FiAward,
} from 'react-icons/fi';
import {
  TbBuildingCottage,
  TbBuildingEstate,
  TbBuildingSkyscraper,
  TbBuildingStore,
  TbHome2,
} from 'react-icons/tb';
import { MediaFrame } from './shared';

/**
 * Mo ta du an (HTML tu CMS) dung lai thanh khoi co cau truc:
 *  - `<p><strong>Nhan:</strong> gia tri</p>`  -> luoi o "thong tin chinh"
 *  - `<h3>Nhom</h3><ul><li>..</li></ul>`      -> bang "Thong tin chi tiet",
 *    moi nhom mot hang, cac muc la the nho xep ngang (khong con the cot cao
 *    thap le nhau, nhom it muc khong de lai khoang trong lon)
 * Mo ta khong theo mau nay (van xuoi) thi hien nguyen HTML nhu cu.
 * Chi dung regex tren chuoi nen ket qua giong nhau o server va client.
 */

type Fact = { label: string; value: string };
type Group = { title: string; items: { name?: string; value: string }[] };

const FACT_RE = /^<p>\s*<strong>([\s\S]+?)<\/strong>\s*([\s\S]*?)<\/p>/;
const GROUP_RE = /^<h3>([\s\S]+?)<\/h3>\s*<ul>([\s\S]*?)<\/ul>/;

const stripTags = (html: string) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

const parseDescription = (html: string): { facts: Fact[]; groups: Group[] } | null => {
  const facts: Fact[] = [];
  const groups: Group[] = [];
  let rest = html.trim();

  while (rest) {
    const fact = FACT_RE.exec(rest);
    const group = fact ? null : GROUP_RE.exec(rest);
    if (fact) {
      facts.push({ label: stripTags(fact[1]).replace(/:$/, ''), value: stripTags(fact[2]).replace(/^:\s*/, '') });
      rest = rest.slice(fact[0].length).trim();
    } else if (group) {
      const items = [...group[2].matchAll(/<li>([\s\S]*?)<\/li>/g)].map((match) => {
        const text = stripTags(match[1]);
        const colon = text.indexOf(': ');
        // "Studio: Dien tich 35,8m²" -> ten + gia tri; cau khong co ":" giu nguyen
        return colon > 0 && colon < 24
          ? { name: text.slice(0, colon), value: text.slice(colon + 2).replace(/^Diện tích\s*/i, '') }
          : { value: text };
      });
      groups.push({ title: stripTags(group[1]), items });
      rest = rest.slice(group[0].length).trim();
    } else {
      return null;
    }
  }

  return facts.length + groups.length > 0 ? { facts, groups } : null;
};

/** Icon cho o thong tin chinh theo nhan - nhan cu the dat truoc nhan chung */
const FACT_ICONS: [RegExp, IconType][] = [
  [/tên/i, FiHome],
  [/địa chỉ|vị trí/i, FiMapPin],
  [/chủ đầu tư/i, FiBriefcase],
  [/quy mô|diện tích/i, FiMaximize],
  [/loại hình/i, FiLayers],
  [/tiện ích/i, FiStar],
  [/khởi công/i, FiCalendar],
  [/giao nhà/i, FiKey],
  [/bàn giao/i, FiAward],
  [/sở hữu|pháp lý/i, FiFileText],
];
const factIcon = (label: string) => FACT_ICONS.find(([pattern]) => pattern.test(label))?.[1] ?? FiInfo;

const GROUP_ICONS: [RegExp, IconType][] = [
  [/căn hộ|chung cư/i, TbBuildingSkyscraper],
  [/shophouse|thương mại/i, TbBuildingStore],
  [/nhà phố/i, TbHome2],
  [/biệt thự/i, TbBuildingCottage],
];
const groupIcon = (title: string) => GROUP_ICONS.find(([pattern]) => pattern.test(title))?.[1] ?? TbBuildingEstate;

/** Sac xanh cho icon tung nhom (xoay vong) - lop viet day du de Tailwind quet duoc */
const GROUP_TONES = [
  'from-sky-400 to-brand-600',
  'from-cyan-400 to-sky-600',
  'from-blue-400 to-blue-700',
  'from-sky-500 to-navy-600',
];

const PROSE_CLASS =
  'space-y-4 text-base leading-relaxed text-gray-600 [&_figure]:mx-0 [&_figure_img]:rounded-lg [&_figure_img]:shadow-card [&_ul]:list-inside [&_ul]:list-disc [&_li]:my-1 [&_p]:my-2 [&_strong]:font-semibold [&_strong]:text-navy-800';

/** Nhan mot o thong tin co gia tri ngan de dua len anh bia (Quy mo, Khoi cong...) */
const SHORT_FACT_RE = /quy mô|khởi công|giao nhà|bàn giao|sở hữu/i;

const ProjectDescription = ({
  html,
  projectName,
  images = [],
}: {
  html: string;
  projectName?: string;
  /** Anh phong canh / tien ich: anh dau lam bia khoi thong tin, cac anh sau
   *  lam anh dai dien cho tung nhom (Can ho, Shophouse...) */
  images?: string[];
}) => {
  const parsed = parseDescription(html);
  if (!parsed) {
    return <div className={`max-w-5xl ${PROSE_CLASS}`} dangerouslySetInnerHTML={{ __html: html }} />;
  }

  const { facts, groups } = parsed;
  const cover = images[0];
  const imageFor = (index: number) => (images.length > 1 ? images[1 + (index % (images.length - 1))] : cover);
  const nameFact = facts.find((fact) => /tên/i.test(fact.label));
  const addressFact = facts.find((fact) => /địa chỉ|vị trí/i.test(fact.label));
  const highlights = facts.filter((fact) => SHORT_FACT_RE.test(fact.label) && fact.value.length <= 24).slice(0, 3);

  return (
    <div className="space-y-6">
      {facts.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-5">
          {/* Anh bia: ten, dia chi va vai so lieu ngan noi tren anh */}
          {cover && (
            <figure className="relative isolate min-h-64 overflow-hidden sm:min-h-72 rounded-2xl shadow-[0_20px_44px_-24px_rgba(11,33,67,0.6)] lg:col-span-2">
              <div className="absolute inset-0 -z-10">
                <MediaFrame
                  seed={`${projectName ?? 'du-an'}-intro`}
                  src={cover}
                  alt={projectName ?? 'Phối cảnh dự án'}
                  ratio="h-full"
                  className="rounded-none"
                />
              </div>
              <span
                aria-hidden
                className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-900/90 via-navy-900/40 to-brand-700/10"
              />
              <figcaption className="flex h-full flex-col justify-end p-4 text-white sm:p-5">
                <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold tracking-wide uppercase backdrop-blur">
                  <TbBuildingEstate aria-hidden className="h-3.5 w-3.5" />
                  Tổng quan dự án
                </span>
                <p className="text-xl leading-tight font-bold sm:text-2xl">{nameFact?.value ?? projectName}</p>
                {addressFact && (
                  <p className="mt-2 flex items-start gap-1.5 text-theme-sm text-sky-100">
                    <FiMapPin aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                    {addressFact.value}
                  </p>
                )}
                {highlights.length > 0 && (
                  <dl className="mt-4 grid grid-cols-3 gap-2">
                    {highlights.map((fact) => (
                      <div key={fact.label} className="rounded-xl bg-white/12 px-2.5 py-2 ring-1 ring-white/20 backdrop-blur">
                        <dt className="text-[10px] font-semibold tracking-wide text-sky-100 uppercase">{fact.label}</dt>
                        <dd className="mt-0.5 text-theme-xs leading-tight font-bold sm:text-theme-sm">{fact.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </figcaption>
            </figure>
          )}

          <dl className={`grid content-start gap-2.5 sm:grid-cols-2 ${cover ? 'lg:col-span-3' : 'lg:col-span-5'}`}>
            {facts.map((fact) => {
              const Icon = factIcon(fact.label);
              // Da hien tren anh bia: dien thoai an bot cho danh sach khoi dai
              const onCover = Boolean(cover) && (fact === nameFact || fact === addressFact || highlights.includes(fact));
              return (
                <div
                  key={fact.label}
                  className={`group items-start gap-3 rounded-xl bg-white px-3.5 py-3 ${onCover ? 'hidden sm:flex' : 'flex'} shadow-[0_8px_20px_-16px_rgba(15,111,209,0.5)] ring-1 ring-sky-100 transition hover:-translate-y-0.5 hover:ring-brand-200`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-50 to-sky-100 text-brand-600 transition group-hover:from-sky-400 group-hover:to-brand-600 group-hover:text-white">
                    <Icon aria-hidden className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">{fact.label}</dt>
                    <dd className="mt-0.5 text-theme-sm leading-snug font-semibold text-navy-800">{fact.value}</dd>
                  </div>
                </div>
              );
            })}
          </dl>
        </div>
      )}

      {groups.length > 0 && (
        <section className="overflow-hidden rounded-2xl bg-white shadow-[0_16px_40px_-30px_rgba(15,111,209,0.55)] ring-1 ring-sky-100">
          <h3 className="flex items-center gap-2 bg-gradient-to-r from-navy-800 via-brand-700 to-sky-500 px-4 py-3 text-theme-sm font-bold text-white sm:px-5">
            <span aria-hidden className="h-4 w-1 rounded-full bg-sky-300" />
            Thông tin chi tiết
          </h3>

          <div className="divide-y divide-dashed divide-sky-100 px-4 sm:px-5">
            {groups.map((group, groupIndex) => {
              const Icon = groupIcon(group.title);
              const image = imageFor(groupIndex);
              return (
                <div key={group.title} className="grid gap-4 py-4 md:grid-cols-[14rem_1fr] md:items-center md:gap-5">
                  {/* Anh dai dien nhom: ten + so muc noi tren anh */}
                  <div className="relative isolate h-24 overflow-hidden rounded-xl shadow-theme-sm sm:h-28">
                    {image ? (
                      <div className="absolute inset-0 -z-10">
                        <MediaFrame
                          seed={`${group.title}-${groupIndex}`}
                          src={image}
                          alt={group.title}
                          ratio="h-full"
                          className="rounded-none"
                        />
                      </div>
                    ) : (
                      <span aria-hidden className={`absolute inset-0 -z-10 bg-gradient-to-br ${GROUP_TONES[groupIndex % GROUP_TONES.length]}`} />
                    )}
                    <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-900/85 via-navy-900/45 to-transparent" />
                    <div className="flex h-full items-end gap-2.5 p-3 text-white">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br shadow-theme-sm ${GROUP_TONES[groupIndex % GROUP_TONES.length]}`}
                      >
                        <Icon aria-hidden className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-base leading-tight font-bold">{group.title}</p>
                        <p className="text-theme-xs text-sky-100">{group.items.length} mục</p>
                      </div>
                    </div>
                  </div>

                  {/* Cac muc: the hai phan "ten | gia tri", hoac mot dong mo ta */}
                  <ul className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <li
                        key={`${item.name ?? ''}-${item.value}`}
                        className="flex max-w-full overflow-hidden rounded-lg text-theme-sm shadow-theme-xs ring-1 ring-sky-100"
                      >
                        {item.name ? (
                          <>
                            <span className="flex shrink-0 items-center bg-gradient-to-r from-brand-600 to-sky-500 px-3 py-1.5 font-semibold text-white">
                              {item.name}
                            </span>
                            <span className="flex min-w-0 items-center bg-white px-3 py-1.5 font-semibold text-navy-800">
                              {item.value}
                            </span>
                          </>
                        ) : (
                          <span className="flex items-center gap-2 bg-white px-3 py-1.5 text-gray-700">
                            <FiStar aria-hidden className="h-3.5 w-3.5 shrink-0 text-sky-500" />
                            {item.value}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProjectDescription;
