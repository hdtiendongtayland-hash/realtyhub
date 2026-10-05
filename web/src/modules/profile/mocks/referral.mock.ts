/**
 * Chuong trinh gioi thieu ban be - ma gioi thieu + cay gioi thieu nhieu tang.
 *
 * Tang F1 = nguoi minh truc tiep gioi thieu, F2 = nguoi do F1 gioi thieu...
 * Ban demo: cay sinh on dinh tu mot hat giong co dinh (khong random moi lan).
 * Khi co backend: GET /me/referrals?depth=7.
 */
export type ReferralMember = {
  publicId: string;
  name: string;
  /** Anh dai dien; rong => hien chu viet tat */
  avatarUrl: string;
  /** Tang so voi minh: 1 = F1 */
  level: number;
  joinedAt: string;
  /** Da giao dich thanh cong it nhat 1 can */
  isActive: boolean;
  /** Da nghi - khong con lam viec, hien xam mo tren cay */
  hasLeft: boolean;
  /** Hoa hong minh nhan duoc tu nguoi nay (VND) */
  commission: number;
  children: ReferralMember[];
};

export type ReferralInfo = {
  referrer: string | null;
  code: string;
  link: string;
  /** Ti le hoa hong theo tang: F1 5%, F2 2%... */
  levelRates: { level: number; rate: string }[];
  tree: ReferralMember[];
};

const FIRST_NAMES = ['Minh', 'Lan', 'Hùng', 'Thảo', 'Quân', 'Ngọc', 'Tuấn', 'Hà', 'Phúc', 'Vy', 'Long', 'Trang', 'Khôi', 'Mai', 'Bảo', 'Linh'];
const LAST_NAMES = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Huỳnh'];
const MIDDLE_NAMES = ['Văn', 'Thị', 'Minh', 'Ngọc', 'Quốc', 'Thanh', 'Hoàng', 'Gia'];

/** Thanh vien that trong cay: ten + anh dai dien (public/images/referral/avatars) */
const REFERRAL_PEOPLE: { name: string; avatarUrl: string }[] = [
  { name: 'Bành Ngọc Tường Vi', avatarUrl: '/images/referral/avatars/ref-01.webp' },
  { name: 'Bùi Tấn Hồng', avatarUrl: '/images/referral/avatars/ref-02.webp' },
  { name: 'Bùi Trung Hiếu', avatarUrl: '/images/referral/avatars/ref-03.webp' },
  { name: 'Chau Thi Huong Thao', avatarUrl: '/images/referral/avatars/ref-04.webp' },
  { name: 'Doãn Đặng Thái Phương', avatarUrl: '/images/referral/avatars/ref-05.webp' },
  { name: 'Đàm Thị Bích Ngọc', avatarUrl: '/images/referral/avatars/ref-06.webp' },
  { name: 'Đặng Ngọc Bích', avatarUrl: '/images/referral/avatars/ref-07.webp' },
  { name: 'Đặng Thị Yến', avatarUrl: '/images/referral/avatars/ref-08.webp' },
  { name: 'Đinh Thị Phương Liên', avatarUrl: '/images/referral/avatars/ref-09.webp' },
  { name: 'Đoàn Thị Hạ Vy', avatarUrl: '/images/referral/avatars/ref-10.webp' },
  { name: 'Đỗ Hoàng Chi Mai', avatarUrl: '/images/referral/avatars/ref-11.webp' },
  { name: 'Đỗ Văn Bộ', avatarUrl: '/images/referral/avatars/ref-12.webp' },
  { name: 'Huỳnh Nguyên Khang', avatarUrl: '/images/referral/avatars/ref-13.webp' },
  { name: 'Ngô Duy Thành', avatarUrl: '/images/referral/avatars/ref-14.webp' },
  { name: 'Ngô Văn Quyền', avatarUrl: '/images/referral/avatars/ref-15.webp' },
  { name: 'Nguyễn Hồ Phương Loan', avatarUrl: '/images/referral/avatars/ref-16.webp' },
  { name: 'Nguyễn Quốc Tín', avatarUrl: '/images/referral/avatars/ref-17.webp' },
  { name: 'Nguyễn Thị Quế Hương', avatarUrl: '/images/referral/avatars/ref-18.webp' },
  { name: 'Nguyễn Tuyết Nhi', avatarUrl: '/images/referral/avatars/ref-19.webp' },
  { name: 'Phạm Hồng Tấn', avatarUrl: '/images/referral/avatars/ref-20.webp' },
  { name: 'Phạm Ngọc Tuấn', avatarUrl: '/images/referral/avatars/ref-21.webp' },
  { name: 'Phạm Thành Sơn', avatarUrl: '/images/referral/avatars/ref-22.webp' },
  { name: 'Phạm Thị Ngọc Ánh', avatarUrl: '/images/referral/avatars/ref-23.webp' },
  { name: 'Phạm Trọng Tiến', avatarUrl: '/images/referral/avatars/ref-24.webp' },
  { name: 'Phan Minh Hải', avatarUrl: '/images/referral/avatars/ref-25.webp' },
  { name: 'Tạ Nguyễn Mai Quỳnh', avatarUrl: '/images/referral/avatars/ref-26.webp' },
  { name: 'Thới Thị Hồng Nhiểu', avatarUrl: '/images/referral/avatars/ref-27.webp' },
  { name: 'Trần Anh Tuấn', avatarUrl: '/images/referral/avatars/ref-28.webp' },
  { name: 'Trần Hoàng Duy Ân', avatarUrl: '/images/referral/avatars/ref-29.webp' },
  { name: 'Trần Phạm Thiên Quang', avatarUrl: '/images/referral/avatars/ref-30.webp' },
  { name: 'Trần Thanh Tòng', avatarUrl: '/images/referral/avatars/ref-31.webp' },
  { name: 'Trần Thị Kim Ngân', avatarUrl: '/images/referral/avatars/ref-32.webp' },
  { name: 'Trần Thị Thắm', avatarUrl: '/images/referral/avatars/ref-33.webp' },
  { name: 'Trần Thị Vân Anh', avatarUrl: '/images/referral/avatars/ref-34.webp' },
  { name: 'Trần Văn Quốc', avatarUrl: '/images/referral/avatars/ref-35.webp' },
  { name: 'Văn Hậu', avatarUrl: '/images/referral/avatars/ref-36.webp' },
  { name: 'Võ Nhật Đông', avatarUrl: '/images/referral/avatars/ref-37.webp' },
  { name: 'Võ Thị Song Hương', avatarUrl: '/images/referral/avatars/ref-38.webp' },
  { name: 'Vũ Huy Hoàng', avatarUrl: '/images/referral/avatars/ref-39.webp' },
];

/** Sinh so gia ngau nhien on dinh (mulberry32) */
const createRng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
};

const MAX_DEPTH = 7;
/** So nguoi moi tang gioi thieu (toi da) - giam dan theo do sau */
const BRANCHING = [5, 2, 2, 2, 2, 2, 2];

const buildTree = (): ReferralMember[] => {
  const rng = createRng(20262882);
  const pick = <T,>(items: T[]) => items[Math.floor(rng() * items.length)];
  let counter = 0;

  const build = (level: number): ReferralMember[] => {
    if (level > MAX_DEPTH) return [];
    // F1 du so; tang duoi 1..toi da nguoi (it nhanh rong de cay di du sau)
    const count =
      level === 1
        ? BRANCHING[0]
        : rng() < 0.2
          ? 0
          : 1 + Math.floor(rng() * BRANCHING[level - 1]);
    return Array.from({ length: count }, () => {
      counter += 1;
      const id = counter;
      const isActive = rng() > 0.35;
      const month = 1 + Math.floor(rng() * 9);
      // Luon goi pick() de chuoi ngau nhien (hinh dang cay) giu nguyen
      const fallbackName = `${pick(LAST_NAMES)} ${pick(MIDDLE_NAMES)} ${pick(FIRST_NAMES)}`;
      // Xao thu tu (8 nguyen to cung nhau voi 39) de ten tren cay khong xep theo A-Z
      const person = REFERRAL_PEOPLE[((id - 1) * 8) % REFERRAL_PEOPLE.length];
      return {
        publicId: `ref-${id}`,
        name: person?.name ?? fallbackName,
        avatarUrl: person?.avatarUrl ?? '',
        level,
        joinedAt: `2026-${String(month).padStart(2, '0')}-${String(1 + Math.floor(rng() * 27)).padStart(2, '0')}`,
        isActive,
        // Khong goi rng() de cay giu nguyen hinh dang
        hasLeft: id % 7 === 5,
        commission: isActive ? Math.round((rng() * 40 + 5) / level) * 1_000_000 : 0,
        children: build(level + 1),
      };
    });
  };

  return build(1);
};

export const MOCK_REFERRAL: ReferralInfo = {
  referrer: null,
  /** Ma gioi thieu chinh la so dien thoai cua minh */
  code: '0912345678',
  link: 'https://realtyhub.com.vn/dang-ky?ref=0912345678',
  levelRates: [
    { level: 1, rate: '5%' },
    { level: 2, rate: '2%' },
    { level: 3, rate: '1%' },
    { level: 4, rate: '0,5%' },
    { level: 5, rate: '0,3%' },
    { level: 6, rate: '0,2%' },
    { level: 7, rate: '0,1%' },
  ],
  tree: buildTree(),
};

/** 12_000_000 -> "12 tr" (dung ca o server lan client) */
export const formatMoney = (vnd: number) =>
  vnd >= 1_000_000 ? `${new Intl.NumberFormat('vi-VN').format(vnd / 1_000_000)} tr` : '0';

/** Duyet moi thanh vien trong cay */
export const flattenReferralTree = (members: ReferralMember[]): ReferralMember[] =>
  members.flatMap((member) => [member, ...flattenReferralTree(member.children)]);
