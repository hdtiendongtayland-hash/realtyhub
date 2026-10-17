'use client';

import type { IconType } from 'react-icons';
import { FiCheck, FiStar } from 'react-icons/fi';
import {
  TbBuildingCottage,
  TbBuildingEstate,
  TbBuildingSkyscraper,
  TbBuildingStore,
  TbHome2,
} from 'react-icons/tb';

/**
 * Mo ta du an (HTML tu CMS) dung lai thanh khoi co cau truc:
 *  - `<p><strong>Nhan:</strong> gia tri</p>`  -> luoi "thong tin chinh"
 *  - `<h3>Nhom</h3><ul><li>..</li></ul>`      -> the theo nhom (Can ho, Shophouse...)
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

const GROUP_ICONS: [RegExp, IconType][] = [
  [/căn hộ|chung cư/i, TbBuildingSkyscraper],
  [/shophouse|thương mại/i, TbBuildingStore],
  [/nhà phố/i, TbHome2],
  [/biệt thự/i, TbBuildingCottage],
];
const groupIcon = (title: string) => GROUP_ICONS.find(([pattern]) => pattern.test(title))?.[1] ?? TbBuildingEstate;

/** Tong mau cho tung the nhom (xoay vong) - lop viet day du de Tailwind quet duoc */
const GROUP_TONES = [
  { border: 'border-brand-100', header: 'from-brand-50', icon: 'from-sky-400 to-brand-600', chip: 'bg-brand-50 text-brand-600', value: 'text-brand-700', mark: 'text-sky-500' },
  { border: 'border-cyan-100', header: 'from-cyan-50', icon: 'from-cyan-400 to-sky-600', chip: 'bg-cyan-50 text-cyan-700', value: 'text-cyan-700', mark: 'text-cyan-500' },
  { border: 'border-blue-100', header: 'from-blue-50', icon: 'from-blue-400 to-blue-700', chip: 'bg-blue-50 text-blue-700', value: 'text-blue-700', mark: 'text-blue-500' },
  { border: 'border-sky-100', header: 'from-sky-50', icon: 'from-sky-400 to-navy-600', chip: 'bg-sky-50 text-sky-700', value: 'text-navy-600', mark: 'text-sky-500' },
];

const GROUP_COLS: Record<number, string> = {
  1: '',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-2 xl:grid-cols-3',
};

const PROSE_CLASS =
  'space-y-4 text-base leading-relaxed text-gray-600 [&_figure]:mx-0 [&_figure_img]:rounded-lg [&_figure_img]:shadow-card [&_ul]:list-inside [&_ul]:list-disc [&_li]:my-1 [&_p]:my-2 [&_strong]:font-semibold [&_strong]:text-navy-800';

const ProjectDescription = ({ html }: { html: string }) => {
  const parsed = parseDescription(html);
  if (!parsed) {
    return <div className={`max-w-5xl ${PROSE_CLASS}`} dangerouslySetInnerHTML={{ __html: html }} />;
  }

  const { facts, groups } = parsed;

  return (
    <div className="space-y-7">
      {facts.length > 0 && (
        <dl className="grid gap-x-8 gap-y-1 md:grid-cols-2">
          {facts.map((fact) => (
            <div key={fact.label} className="flex items-start gap-3 border-b border-dashed border-sky-100 py-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <FiCheck aria-hidden className="h-3 w-3" />
              </span>
              <div className="min-w-0 flex-1 sm:flex sm:gap-3">
                <dt className="text-theme-sm font-semibold text-gray-500 sm:w-28 sm:shrink-0">{fact.label}</dt>
                <dd className="min-w-0 flex-1 text-theme-sm leading-relaxed font-semibold text-navy-800">{fact.value}</dd>
              </div>
            </div>
          ))}
        </dl>
      )}

      {groups.length > 0 && (
        <div className={`grid gap-4 ${GROUP_COLS[groups.length] ?? 'sm:grid-cols-2 xl:grid-cols-4'}`}>
          {groups.map((group, groupIndex) => {
            const Icon = groupIcon(group.title);
            const tone = GROUP_TONES[groupIndex % GROUP_TONES.length];
            const isTable = group.items.some((item) => item.name);
            return (
              <section
                key={group.title}
                className={`flex flex-col overflow-hidden rounded-2xl border bg-white shadow-[0_14px_30px_-24px_rgba(15,23,42,0.45)] transition hover:-translate-y-0.5 ${tone.border}`}
              >
                <header className={`flex items-center gap-3 border-b bg-gradient-to-r to-white px-4 py-3 ${tone.border} ${tone.header}`}>
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-theme-xs ${tone.icon}`}>
                    <Icon aria-hidden className="h-5 w-5" />
                  </span>
                  <h3 className="min-w-0 flex-1 text-base font-bold text-navy-800">{group.title}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-theme-xs font-semibold ${tone.chip}`}>
                    {group.items.length}
                  </span>
                </header>

                <ul className="flex-1 divide-y divide-dashed divide-gray-100 px-4 py-1.5">
                  {group.items.map((item) =>
                    isTable && item.name && item.value.length < 20 ? (
                      <li key={item.name} className="flex items-baseline justify-between gap-3 py-2.5 text-theme-sm">
                        <span className="text-gray-600">{item.name}</span>
                        <span className={`text-right font-semibold whitespace-nowrap ${tone.value}`}>{item.value}</span>
                      </li>
                    ) : item.name ? (
                      // Gia tri dai (vd. "Cao 3 tang, dien tich dat tu ..."): ten tren, mo ta duoi
                      <li key={item.name} className="py-2.5 text-theme-sm">
                        <span className={`inline-block rounded-md px-2 py-0.5 text-theme-xs font-bold ${tone.chip}`}>
                          {item.name}
                        </span>
                        <p className="mt-1.5 leading-relaxed text-gray-700">{item.value}</p>
                      </li>
                    ) : (
                      <li key={item.value} className="flex gap-2.5 py-2.5 text-theme-sm leading-relaxed text-gray-700">
                        <FiStar aria-hidden className={`mt-1 h-3.5 w-3.5 shrink-0 ${tone.mark}`} />
                        {item.value}
                      </li>
                    ),
                  )}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectDescription;
