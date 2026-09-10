/**
 * Hop dong cho "Chu dau tu" (Investor).
 *
 * Day la single source of truth cho 25 chu dau tu chinh thuc cua RealtyHub,
 * dung chung cho:
 *   - Section "CAC CHU DAU TU" tren trang chu (components/Doitac.tsx)
 *   - Trang /chu-dau-tu (list + detail)
 *
 * Moi field deu duoc suy ra tu ten hien thi (name) de tranh sai lech giua
 * cac noi dung hien thi. Slug duoc tinh bang ham toSlug() de khop voi route
 * /chu-dau-tu/[slug] dang co.
 *
 * Khi backend co module `investors`, chi can sua investor.service.ts de goi
 * API - cac component, hook, route deu khong can doi.
 */

/** Mot chu dau tu tren RealityHub. */
export type Investor = {
  /** Ten hien thi - dung cho title, aria-label, va cac the <img alt>. */
  name: string;
  /** URL logo absolute tu realtyhub.com.vn. */
  logo: string;
  /** Slug URL, dung cho /chu-dau-tu/[slug]. */
  slug: string;
};

/** Tom tat them de hien thi card list (so du an, so can con hang, ...). */
export type InvestorSummary = Investor & {
  /** So du an dang co tren he thong thuoc chu dau tu nay. */
  projectCount: number;
  /** So du an dang mo ban. */
  openingProjectCount: number;
  /** So can/san pham con hang cua cac du an thuoc chu dau tu. */
  availableUnitCount: number;
  /** Slug cac du an thuoc chu dau tu (gom ngan de hien thi thumbnail). */
  projectSlugs: string[];
};

/** Phan hoi tu InvestorService.list(). */
export type PaginatedInvestors = {
  investors: InvestorSummary[];
  total: number;
  page: number;
  limit: number;
};

/**
 * Tham so loc/sap xep cho trang /chu-dau-tu.
 *
 * Service tu loc + sap xep + phan trang theo cac tham so nay, nen cung
 * la HOP DONG voi backend sau nay: khi InvestorService.list nhan query,
 * controller chi can forward sang query string va aggregate theo cac field.
 */
export type InvestorQuery = {
  page: number;
  limit: number;
  /** Ten chu dau tu can tim (khong phan biet dau) */
  search: string;
  /** Loc theo khu vuc co du an - regionId cua MOCK_REGIONS */
  regionId: string | null;
  /** So du an toi thieu (chip 1+ / 3+ / 5+) - null = khong dat tran */
  minProjectCount: number | null;
  /** Chi hien thi chu dau tu co it nhat 1 du an dang mo ban */
  hasOpening: boolean;
  /** Chi hien thi chu dau tu co it nhat 1 can con hang */
  hasAvailableUnits: boolean;
  /** Thuat toan sap xep - service se map sang truong tuong ung */
  sort: InvestorSort;
};

/** Thu tu mac dinh cua service: giu nguyen thu tu 25 Investor trong INVESTORS */
export type InvestorSort = 'mac-dinh' | 'ten-az' | 'du-an-giam' | 'can-con-hang-giam';

/** Danh sach cac lua chon cho o "Sap xep" - dung chung cho filter bar va metadata. */
export const INVESTOR_SORT_LABELS: Record<InvestorSort, string> = {
  'mac-dinh': 'Mặc định',
  'ten-az': 'Tên A → Z',
  'du-an-giam': 'Số dự án giảm dần',
  'can-con-hang-giam': 'Số căn còn hàng giảm dần',
};

/**
 * Toan bo lua chon cho bang loc. Cac mang deu danh sach that (khong bao
 * gom 0 ket qua) vi `regions` duoc quy ra tu cac du an thuoc chu dau tu
 * nen chi chua khu vuc co it nhat 1 du an dang mo ban/giao.
 */
export type InvestorFilterOptions = {
  regions: { value: string; label: string }[];
  minProjectCounts: { value: string; label: string }[];
};

/**
 * Query rong - dung de khoi tao state lan dau va reset ve trang thai mac dinh.
 * Giong `DEFAULT_PROJECT_QUERY`: service se khop tat ca 25 Investor.
 */
export const DEFAULT_INVESTOR_QUERY: InvestorQuery = {
  page: 1,
  limit: 12,
  search: '',
  regionId: null,
  minProjectCount: null,
  hasOpening: false,
  hasAvailableUnits: false,
  sort: 'mac-dinh',
};

/** Truong projectCount toi thieu cho chip loc "Co 1+/3+/5+ du an" */
export const INVESTOR_MIN_PROJECT_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: 'Có dự án' },
  { value: 3, label: 'Từ 3 dự án' },
  { value: 5, label: 'Từ 5 dự án' },
];

/**
 * Trang thai bo loc duoi dang phang - dung chung cho filter bar va list page.
 * Khop voi InvestorQuery nhung mang hieu `hasOpening` / `hasAvailableUnits`
 * thay vi `minProjectCount` de nguoi dung doc nhanh.
 */
export type InvestorFilterValues = {
  search: string;
  regionId: string | null;
  minProjectCount: number | null;
  hasOpening: boolean;
  hasAvailableUnits: boolean;
};
