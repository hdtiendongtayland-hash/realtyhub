/**
 * Parse tu khoa dang ngon ngu tu nhien thanh mot patch ProjectQuery.
 *
 * Vi du:
 *   "nha duoi 4 ty"        -> { propertyType: 'nha-pho', priceMax: 4_000_000_000 }
 *   "can ho quan 2 view ho"-> { propertyType: 'can-ho', viewpoints: ['view-ho'] }
 *   "shophouse 500 trieu"  -> { propertyType: 'shophouse', priceMax: 500_000_000 }
 *
 * Nguyen tac:
 * - Pure function, khong phu thuoc React/Next.
 * - Bo dau tieng Viet truoc khi khop (vinhomes == Vinhomes).
 * - Khong parse duoc = parsed rong, leftover giu nguyen (de match ten du an).
 * - "4 ty" khong kem tu khoa range (duoi/tren) mac dinh la tran (priceMax) vi
 *   nguoi dung hay noi "nha 4 ty" nghia la toi da 4 ty.
 */

import type { ProjectQuery } from '@/modules/project/models/project.model';

/** Patch tren ProjectQuery - cac field null/undefined nghia la "khong loc" */
/** Patch tren ProjectQuery - cac field optional, "khong co" nghia la
 *  key khong ton tai tren object (khong phai null). Mot so field
 *  ProjectQuery la nhung union rat hep nen tao alias cho de doc. */
type PropertyType = NonNullable<ProjectQuery['propertyType']>;
type Segment = NonNullable<ProjectQuery['segment']>;
type Legal = NonNullable<ProjectQuery['legal']>;
type Viewpoint = ProjectQuery['viewpoints'][number];

export type ParsedQuery = {
  priceMin?: number;
  priceMax?: number;
  areaMax?: number;
  bedrooms?: number;
  propertyType?: PropertyType;
  segment?: Segment;
  legal?: Legal;
  viewpoints?: Viewpoint[];
};

// ── Helpers ──────────────────────────────────────────────────────────────

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd');

/** Bo tat ca khoang trang thua, trim, lowercase, bo dau */
// const clean = (value: string) => normalize(value.trim()).replace(/\s+/g, ' ');

/**
 * Match mot cum keyword trong text. Tra ve vi tri [start, end) neu tim thay
 * (theo text goc, khong phai normalized) de co the cat ra khoi leftover.
 *
 * Word-boundary: keyword chi match neu dung vi tri nay la ranh gioi tu trong
 * text. Tranh "ho" khop vao giua "phong ngu".
 */
const findKeyword = (text: string, keyword: string): { start: number; end: number } | null => {
  const normText = normalize(text).toLowerCase();
  const normKeyword = normalize(keyword).toLowerCase();
  if (normKeyword.length === 0) return null;
  // Duyet qua tat ca vi tri xuat hien, lay vi tri dau tien co word-boundary
  let from = 0;
  while (from <= normText.length - normKeyword.length) {
    const idx = normText.indexOf(normKeyword, from);
    if (idx === -1) return null;
    const before = idx === 0 ? ' ' : normText[idx - 1];
    const after = idx + normKeyword.length === normText.length ? ' ' : normText[idx + normKeyword.length];
    const isBoundary = !/[a-z0-9]/.test(before) && !/[a-z0-9]/.test(after);
    if (isBoundary) return { start: idx, end: idx + normKeyword.length };
    from = idx + 1;
  }
  return null;
};

/** Match mot trong nhieu keyword, tra ve vi tri DAU TIEN xuat hien.
 *  Vong lap ben ngoai (matchViewpoints) se goi lai de lay match tiep theo. */
const findAnyKeyword = (
  text: string,
  keywords: readonly string[],
): { keyword: string; start: number; end: number } | null => {
  let first: { keyword: string; start: number; end: number } | null = null;
  for (const keyword of keywords) {
    const match = findKeyword(text, keyword);
    if (match && (first === null || match.start < first.start)) {
      first = { keyword, ...match };
    }
  }
  return first;
};

/** Xoa nhieu khoang text trong source, giu lai phan con lai */
const sliceOut = (source: string, ranges: Array<{ start: number; end: number }>): string => {
  if (ranges.length === 0) return source;
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  let result = '';
  let cursor = 0;
  for (const range of sorted) {
    result += source.slice(cursor, range.start);
    cursor = range.end;
  }
  result += source.slice(cursor);
  return result.replace(/\s+/g, ' ').trim();
};

// ── So + don vi ──────────────────────────────────────────────────────────

/**
 * Parse "4 ty" / "500 trieu" / "1.2 ty" / "4,5 ty" thanh VND.
 * Don vi ho tro: ty/tỷ, trieu/triệu, tr (trieu), k (1k VND), ty dong.
 * Neu khong co don vi ma so co 9 chu so tro len -> hieu la VND.
 */
const parsePriceValue = (raw: string): number | null => {
  const norm = normalize(raw).replace(/,/g, '.').toLowerCase();
  // Bat "so don vi" tuy y voi so thap phan
  const match = norm.match(/(\d+(?:\.\d+)?)\s*(ty|tri(?:eu)?|tr|k|dong|d)?/);
  if (!match) return null;
  const num = Number(match[1]);
  if (!Number.isFinite(num)) return null;
  const unit = match[2] ?? '';
  if (unit.startsWith('ty')) return Math.round(num * 1_000_000_000);
  if (unit.startsWith('tr') || unit === 'k') return Math.round(num * 1_000_000);
  // Khong co don vi: so 9 chu so tro len -> VND, nho hon -> ty (heuristic)
  if (num >= 100_000_000) return Math.round(num);
  return Math.round(num * 1_000_000_000);
};

/** Match cum gia kem tu khoa range trong text */
const matchPrice = (
  text: string,
): { value: number; min: boolean; ranges: Array<{ start: number; end: number }> } | null => {
  // Thu pattern "range ... so don vi" truoc (de biet day la min hay max)
  // VD: "duoi 4 ty", "tren 500 trieu"
  const rangeKeywordsMin = ['tren', 'tu ', 'lon hon', 'it nhat', 'toi thieu', '>=', '>'];

  const isRangeMin = (s: string) => rangeKeywordsMin.some((k) => s.includes(k));

  // Tim cum "tu khoa range + so + don vi"
  const rangeWithUnit = text.match(
    /(tren|duoi|tu |lon hon|nho hon|it nhat|toi thieu|toi da|>=|<=|>|<)\s*(\d+(?:[.,]\d+)?)\s*(ty|tri(?:eu)?|tr|k|dong)?/gi,
  );
  if (rangeWithUnit) {
    const m = rangeWithUnit[0];
    const rangeWord = m.split(/\s+/)[0];
    const value = parsePriceValue(m);
    if (value !== null) {
      const start = text.indexOf(m);
      return {
        value,
        min: isRangeMin(rangeWord),
        ranges: [{ start, end: start + m.length }],
      };
    }
  }

  // Pattern "so + don vi" khong kem range: mac dinh la priceMax
  // Dung regex co index de biet vi tri
  const priceRegex = /(\d+(?:[.,]\d+)?)\s*(ty|tỷ|tri(?:eu)?|tr|k|dong|đ)\b/gi;
  const match = priceRegex.exec(text);
  // Bo qua: "x phong ngu", "x m2" khong phai gia
  if (match) {
    const value = parsePriceValue(match[0]);
    if (value !== null && value >= 100_000_000) {
      // Dam bao khong phai dien tich (m2) hay phong ngu
      const afterUnit = text.slice(match.index + match[0].length, match.index + match[0].length + 5);
      if (!/^\s*m2?/i.test(afterUnit) && !/^\s*(phong|pn|br)/i.test(afterUnit)) {
        return {
          value,
          min: false,
          ranges: [{ start: match.index, end: match.index + match[0].length }],
        };
      }
    }
  }
  return null;
};

// ── Dien tich ────────────────────────────────────────────────────────────

const matchArea = (
  text: string,
): { value: number; min: boolean; ranges: Array<{ start: number; end: number }> } | null => {
  // Pattern: "tren 100 m2", "duoi 80 m²"
  const rangeWithUnit = text.match(
    /(tren|duoi|lon hon|nho hon|it nhat|toi da|>=|<=|>|<)\s*(\d+)\s*(m2|m²)/gi,
  );
  if (rangeWithUnit) {
    const m = rangeWithUnit[0];
    const rangeWord = m.split(/\s+/)[0];
    const numMatch = m.match(/(\d+)/);
    if (numMatch) {
      const start = text.indexOf(m);
      return {
        value: Number(numMatch[1]),
        min: ['tren', 'lon hon', 'it nhat', '>=', '>'].includes(rangeWord),
        ranges: [{ start, end: start + m.length }],
      };
    }
  }

  // Pattern "100 m2" khong kem range: mac dinh la areaMax
  const plainMatch = text.match(/(\d+)\s*(m2|m²)/i);
  if (plainMatch) {
    const numMatch = plainMatch[0].match(/(\d+)/);
    if (numMatch) {
      const start = text.indexOf(plainMatch[0]);
      return {
        value: Number(numMatch[1]),
        min: false,
        ranges: [{ start, end: start + plainMatch[0].length }],
      };
    }
  }
  return null;
};

// ── So phong ngu ─────────────────────────────────────────────────────────

const matchBedrooms = (
  text: string,
): { value: number; ranges: Array<{ start: number; end: number }> } | null => {
  const m = text.match(/(\d+)\s*(phong ngu|phong|pn|br|bedroom)/i);
  if (!m) return null;
  const num = Number(m[1]);
  if (!Number.isFinite(num)) return null;
  const start = text.indexOf(m[0]);
  return { value: num, ranges: [{ start, end: start + m[0].length }] };
};

// ── Loai hinh / Phan khuc / Phap ly / View ───────────────────────────────

const TYPE_RULES: Array<{ keys: readonly string[]; value: PropertyType }> = [
  // Order: cu the truoc, "nha" chung cuoi (uu tien biet thu/nha pho)
  { keys: ['shophouse', 'shop house'], value: 'shophouse' },
  { keys: ['can ho', 'chung cu', 'apartment', 'condo'], value: 'can-ho' },
  { keys: ['biet thu', 'villa'], value: 'biet-thu' },
  { keys: ['nha pho', 'townhouse', 'lien ke'], value: 'nha-pho' },
  { keys: ['shop'], value: 'shophouse' },
  { keys: ['dat nen', 'dat'], value: 'dat-nen' },
  // "nha" mot minh sau cung de khong an cac tu khac
  { keys: ['nha'], value: 'nha-pho' },
];

const SEGMENT_RULES: Array<{ keys: readonly string[]; value: Segment }> = [
  { keys: ['cao tang', 'high-rise'], value: 'cao-tang' },
  { keys: ['thap tang', 'low-rise'], value: 'thap-tang' },
];

const LEGAL_RULES: Array<{ keys: readonly string[]; value: Legal }> = [
  { keys: ['so do', 'so hong', 'lau dai', 'so lau dai', 'long term'], value: 'so-lau-dai' },
  { keys: ['50 nam', 'so 50 nam'], value: 'so-50-nam' },
  { keys: ['dang hoan thien', 'hoan thien phap ly'], value: 'dang-hoan-thien' },
];

const VIEW_RULES: Array<{ keys: readonly string[]; value: Viewpoint }> = [
  // Cum "view X" tieng Viet
  { keys: ['view bien'], value: 'view-bien' },
  { keys: ['view song'], value: 'view-song' },
  { keys: ['view ho'], value: 'view-ho' },
  { keys: ['view cong vien'], value: 'view-cong-vien' },
  { keys: ['view nui'], value: 'view-nui' },
  { keys: ['view thanh pho'], value: 'view-thanh-pho' },
  // Tu khoa tieng Anh
  { keys: ['sea', 'ocean'], value: 'view-bien' },
  { keys: ['river'], value: 'view-song' },
  { keys: ['lake'], value: 'view-ho' },
  { keys: ['park'], value: 'view-cong-vien' },
  { keys: ['mountain'], value: 'view-nui' },
  { keys: ['city'], value: 'view-thanh-pho' },
  // Key don le tieng Viet - CHI match khi co "view" lien truoc no trong
  // cung cum. Tranh "can ho" bi hieu nham thanh "view ho".
  // (xu ly rieng trong matchViewpoint)
];

const matchByRules = <T extends string>(
  text: string,
  rules: Array<{ keys: readonly string[]; value: T }>,
): { value: T; ranges: Array<{ start: number; end: number }> } | null => {
  for (const { keys, value } of rules) {
    const match = findAnyKeyword(text, keys);
    if (match) {
      return { value, ranges: [{ start: match.start, end: match.end }] };
    }
  }
  return null;
};

// ── Main ─────────────────────────────────────────────────────────────────

/** Key view don le tieng Viet - CHI match khi co "view" lien truoc trong
 *  cung cum (vd "view ho", "view bien"). Tranh "can ho" bi hieu thanh view-ho. */
const SINGLE_VIEW_KEYS: Array<{ keys: readonly string[]; value: Viewpoint }> = [
  { keys: ['bien'], value: 'view-bien' },
  { keys: ['song'], value: 'view-song' },
  { keys: ['ho'], value: 'view-ho' },
  { keys: ['cong vien'], value: 'view-cong-vien' },
  { keys: ['nui'], value: 'view-nui' },
  { keys: ['thanh pho'], value: 'view-thanh-pho' },
];

/** Match view dau tien trong text. Tra ve { value, range } neu thay. */
const matchFirstView = (
  text: string,
): { value: Viewpoint; range: { start: number; end: number } } | null => {
  // 1) Thu cum "view X" truoc (uu tien)
  const cumMatch = findAnyKeyword(text, [
    'view bien',
    'view song',
    'view ho',
    'view cong vien',
    'view nui',
    'view thanh pho',
    'sea',
    'ocean',
    'river',
    'lake',
    'park',
    'mountain',
    'city',
  ]);
  if (cumMatch) {
    const rule = VIEW_RULES.find((r) => r.keys.includes(cumMatch.keyword));
    if (rule) return { value: rule.value, range: { start: cumMatch.start, end: cumMatch.end } };
  }

  // 2) Thu key don le, chi match khi co "view" lien truoc (cach nhau boi
  //    1-3 ky tu whitespace)
  for (const { keys, value } of SINGLE_VIEW_KEYS) {
    const match = findAnyKeyword(text, keys);
    if (!match) continue;
    // Kiem tra text[match.start - 4 .. match.start] co chua "view"
    // (cho phep khoang trang giua "view" va key).
    const beforeText = text.slice(Math.max(0, match.start - 10), match.start);
    if (/\bview\s*$/i.test(beforeText)) {
      return { value, range: { start: match.start, end: match.end } };
    }
  }
  return null;
};

/**
 * Mot token match duoc trong text goc. UI dung `originalText` de hien chip
 * va de xoa chip (cat originalText khoi input roi re-parse).
 */
export type ParsedToken = {
  /** Group de UI render icon + mau */
  group: 'price' | 'area' | 'bedrooms' | 'type' | 'segment' | 'legal' | 'view';
  /** ID on dinh de dung lam React key */
  id: string;
  /** Phan text trong input da match - cat khoi input se xoa token */
  originalText: string;
};

/** Ket qua parse */
export type ParseResult = {
  /** Patch cho ProjectQuery - chi chua cac field parser nhan dien duoc */
  parsed: ParsedQuery;
  /** Phan text con lai sau khi cat cac token filter, de match ten du an */
  leftover: string;
  /** Danh sach token da match (co the rong) - UI dung de hien chip */
  tokens: ParsedToken[];
};

/**
 * Parse tu khoa ngon ngu tu nhien. Tra ve:
 *   - parsed: patch cho ProjectQuery (chi chua cac field parser nhan dien)
 *   - leftover: phan text con lai sau khi cat cac token filter, de match ten du an
 *   - tokens: danh sach cac cum da match (co originalText) - UI dung de render chip
 *
 * Neu khong parse duoc gi, parsed/tokens rong va leftover = input goc.
 */
export const parseSearchQuery = (rawText: string): ParseResult => {
  if (!rawText || !rawText.trim()) return { parsed: {}, leftover: '', tokens: [] };

  const text = rawText.trim();
  const parsed: ParsedQuery = {};
  const tokens: ParsedToken[] = [];
  const cutRanges: Array<{ start: number; end: number }> = [];

  // Gia
  const price = matchPrice(text);
  if (price) {
    if (price.min) parsed.priceMin = price.value;
    else parsed.priceMax = price.value;
    tokens.push({
      id: price.min ? 'priceMin' : 'priceMax',
      group: 'price',
      originalText: text.slice(price.ranges[0].start, price.ranges[0].end),
    });
    cutRanges.push(...price.ranges);
  }

  // Dien tich
  const area = matchArea(text);
  if (area) {
    parsed.areaMax = area.value;
    tokens.push({
      id: 'areaMax',
      group: 'area',
      originalText: text.slice(area.ranges[0].start, area.ranges[0].end),
    });
    cutRanges.push(...area.ranges);
  }

  // So phong
  const bedrooms = matchBedrooms(text);
  if (bedrooms) {
    parsed.bedrooms = bedrooms.value;
    tokens.push({
      id: 'bedrooms',
      group: 'bedrooms',
      originalText: text.slice(bedrooms.ranges[0].start, bedrooms.ranges[0].end),
    });
    cutRanges.push(...bedrooms.ranges);
  }

  // Loai hinh
  const type = matchByRules(text, TYPE_RULES);
  if (type) {
    parsed.propertyType = type.value;
    tokens.push({
      id: 'propertyType',
      group: 'type',
      originalText: text.slice(type.ranges[0].start, type.ranges[0].end),
    });
    cutRanges.push(...type.ranges);
  }

  // Phan khuc
  const segment = matchByRules(text, SEGMENT_RULES);
  if (segment) {
    parsed.segment = segment.value;
    tokens.push({
      id: 'segment',
      group: 'segment',
      originalText: text.slice(segment.ranges[0].start, segment.ranges[0].end),
    });
    cutRanges.push(...segment.ranges);
  }

  // Phap ly
  const legal = matchByRules(text, LEGAL_RULES);
  if (legal) {
    parsed.legal = legal.value;
    tokens.push({
      id: 'legal',
      group: 'legal',
      originalText: text.slice(legal.ranges[0].start, legal.ranges[0].end),
    });
    cutRanges.push(...legal.ranges);
  }

  // View - co the nhieu view cung luc (vd "view ho va view song").
  // Moi luot chi match 1 view, lap lai toi da 5 lan.
  // Key don le (vd "ho") CHI match khi co tu "view" lien truoc - tranh
  // "can ho" bi hieu thanh view-ho.
  const viewpoints: Viewpoint[] = [];
  let viewCursor = 0;
  for (let i = 0; i < 5; i += 1) {
    const remaining = text.slice(viewCursor);
    const view = matchFirstView(remaining);
    if (!view) break;
    viewpoints.push(view.value);
    tokens.push({
      id: `view:${view.value}`,
      group: 'view',
      originalText: text.slice(viewCursor + view.range.start, viewCursor + view.range.end),
    });
    cutRanges.push({
      start: viewCursor + view.range.start,
      end: viewCursor + view.range.end,
    });
    viewCursor += view.range.end;
  }
  if (viewpoints.length > 0) parsed.viewpoints = viewpoints;

  const leftover = sliceOut(text, cutRanges);

  return { parsed, leftover, tokens };
};
