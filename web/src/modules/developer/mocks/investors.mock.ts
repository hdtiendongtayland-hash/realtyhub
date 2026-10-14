/**
 * SINGLE SOURCE OF TRUTH cho 25 chu dau tu chinh thuc.
 *
 * Section "CAC CHU DAU TU" tren trang chu (Doitac.tsx) va trang /chu-dau-tu
 * (list + detail) deu dung mang nay. Khi backend co module `investors`, chi
 * can sua investor.service.ts - khong component nao phai doc file nay truc
 * tiep ngoai service.
 *
 * QUAN TRONG:
 *   - Khong duplicate o day (dung 25 entries duy nhat).
 *   - Logo URL absolute tu https://realtyhub.com.vn/assets/brand/logos/.
 *   - Slug duoc suy ra tu `name` bang toSlug() de khop route hien co.
 */

import type { Investor } from '../models/investor.model';

const BASE_LOGO_URL = 'https://realtyhub.com.vn/assets/brand/logos/';

/** Tao slug URL tu ten tieng Viet (chua dau) - xoa diacritics, viet thuong,
    gop cac ky tu khong phai chu-so thanh dau '-', trim dau '-'. Dung chung
    voi logic da co trong developers.mock.ts de cac slug luon khop nhau. */
const toSlug = (name: string) =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** 25 chu dau tu. Thu tu trong mang nay la thu tu hien thi (co dinh). */
const INVESTOR_NAMES: ReadonlyArray<{ name: string; logoFile: string; localLogo?: string; website?: string }> = [
  { name: 'Azure', logoFile: 'azure.png', localLogo: '/images/azure.png', website: 'https://azure.vn' },
  { name: 'BIM Group', logoFile: 'bimgroup.webp', website: 'https://bimgroup.com' },
  { name: 'CapitaLand', logoFile: 'capitaland.png', website: 'https://www.capitaland.com' },
  { name: 'Đất Xanh Group', logoFile: 'datxanhgroup.webp', website: 'https://datxanh.group' },
  { name: 'Ecopark', logoFile: 'ecopark.webp', website: 'https://ecopark.com.vn' },
  { name: 'Gamuda Land', logoFile: 'gamudaland.png', website: 'https://gamudaland.com.vn' },
  { name: 'Gladia', logoFile: 'gladia.png', website: 'https://gladia.com.vn/en' },
  { name: 'Hoa Lâm', logoFile: 'hoalam.png', website: 'http://hoalam.com' },
  { name: 'Hongkong Land', logoFile: 'hongkongland.png', website: 'https://www.hkland.com' },
  { name: 'HVH', logoFile: 'hvh.png', website: 'https://huongvietholdings.com/vi' },
  { name: 'Keppel Land', logoFile: 'keppelland.png', website: 'https://www.keppelland.com' },
  { name: 'Khang Điền', logoFile: 'khangdien.png', website: 'https://khangdien.vn' },
  { name: 'Mapletree', logoFile: 'mapletree.png', website: 'https://www.mapletree.com.sg/vn/' },
  { name: 'Masterise', logoFile: 'masterise.png', website: 'https://masterisehomes.com' },
  { name: 'Meyland', logoFile: 'meyland.png', website: 'https://meylandvn.com/' },
  { name: 'MIK Group', logoFile: 'mikgroup.webp', website: 'https://mikgroup.vn' },
  { name: 'Nam Group', logoFile: 'namgroup.png', website: 'https://namgroup.vn' },
  { name: 'Nam Long', logoFile: 'namlong.webp', website: 'https://namlong.vn' },
  { name: 'STC Golden Land', logoFile: 'stcgoldenland.png', website: 'https://stcgoldenland.com.vn/' },
  { name: 'Sun Group', logoFile: 'sungroup.png', website: 'https://sungroup.com.vn' },
  { name: 'Tây Hồ', logoFile: 'tayho.png', website: 'https://tayho.com.vn/' },
  { name: 'TBS Group', logoFile: 'tbsgroup.webp', website: 'https://tbsgroup.vn' },
  { name: 'The Grand Hồ Tràm', logoFile: 'thegrandhotram.png', website: 'https://thegrandhotram.com/vi' },
  { name: 'Thuận Việt', logoFile: 'thuanviet.png', website: 'https://thuanviet.vn' },
  { name: 'Vinhomes', logoFile: 'vinhomes.webp', website: 'https://vinhomes.vn' },
];

/** 25 Investor records - data goc duy nhat, khong duplicate. */
export const INVESTORS: Investor[] = INVESTOR_NAMES.map(({ name, logoFile, localLogo, website }) => ({
  name,
  logo: localLogo ?? `${BASE_LOGO_URL}${logoFile}`,
  slug: toSlug(name),
  website,
}));

/** Lookup theo slug - dung cho /chu-dau-tu/[slug]. */
export const findInvestorBySlug = (slug: string): Investor | undefined =>
  INVESTORS.find((entry) => entry.slug === slug);

/** Lookup theo ten (case-insensitive, khong dau) - dung de match voi
    developerId tu project mock (vi cac mock project co developerId nhu
    "cdt-vingroup" nen ta match theo ten "Vingroup" qua bang mapping). */
export const findInvestorByName = (name: string): Investor | undefined => {
  const norm = toSlug(name);
  return INVESTORS.find((entry) => entry.slug === norm);
};
