'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QRCode from 'qrcode';
import {
  FiArrowRight,
  FiCheck,
  FiChevronDown,
  FiChevronRight,
  FiCopy,
  FiDownload,
  FiGitMerge,
  FiList,
  FiMaximize2,
  FiMinimize2,
  FiMinus,
  FiPlus,
  FiSearch,
  FiShare2,
  FiUsers,
} from 'react-icons/fi';
import { flattenReferralTree, formatMoney, MOCK_REFERRAL, type ReferralMember } from '../mocks/referral.mock';

/** Mau theo tang - cung bo mau thuong hieu, khac nhau ro tung tang */
export const LEVEL_TONES = [
  'bg-brand-500 text-white',
  'bg-jade-500 text-white',
  'bg-accent-500 text-white',
  'bg-purple-500 text-white',
  'bg-pink-500 text-white',
  'bg-cyan-600 text-white',
  'bg-navy-700 text-white',
];


const initialsOf = (name: string) =>
  name
    .split(' ')
    .slice(-2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();

/** Anh dai dien tron; khong co anh thi hien chu viet tat. Dat trong mot khung relative. */
const MemberPhoto = ({ member, size }: { member: ReferralMember; size: string }) =>
  member.avatarUrl ? (
    <span className="absolute inset-0 overflow-hidden rounded-full bg-gray-100">
      <Image src={member.avatarUrl} alt={member.name} fill sizes={size} className="object-cover" />
    </span>
  ) : (
    <>{initialsOf(member.name)}</>
  );

const dateFormatter = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').toLowerCase();

/** Nhanh con co chua ten can tim khong (de mo san nhanh do khi tim) */
const branchMatches = (member: ReferralMember, term: string): boolean =>
  normalize(member.name).includes(term) || member.children.some((child) => branchMatches(child, term));

// ── Cay ──────────────────────────────────────────────────────────────────

/** Mot dong trong cay + cac nhanh con, co duong noi doc ben trai */
const TreeNode = ({
  member,
  expanded,
  onToggle,
  term,
}: {
  member: ReferralMember;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  term: string;
}) => {
  const hasChildren = member.children.length > 0;
  const isOpen = term ? branchMatches(member, term) : expanded.has(member.publicId);
  const visibleChildren = term ? member.children.filter((child) => branchMatches(child, term)) : member.children;
  const isHit = term && normalize(member.name).includes(term);
  const total = flattenReferralTree(member.children).length;

  return (
    <li className="relative">
      <div
        className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
          isHit ? 'border-brand-300 bg-brand-50' : 'border-gray-100 bg-white hover:border-brand-200'
        }`}
      >
        <button
          type="button"
          onClick={() => onToggle(member.publicId)}
          disabled={!hasChildren || Boolean(term)}
          aria-expanded={hasChildren ? isOpen : undefined}
          aria-label={isOpen ? `Thu gọn nhánh ${member.name}` : `Mở nhánh ${member.name}`}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-gray-500 transition enabled:hover:bg-gray-100 disabled:opacity-0"
        >
          {isOpen ? <FiChevronDown aria-hidden /> : <FiChevronRight aria-hidden />}
        </button>
        <span
          className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-theme-xs font-bold ${
            member.hasLeft ? 'bg-gray-400 text-white opacity-60 grayscale' : LEVEL_TONES[member.level - 1]
          }`}
        >
          <MemberPhoto member={member} size="36px" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2 text-theme-sm font-semibold text-gray-900">
            <span className="truncate">{member.name}</span>
            {member.hasLeft && (
              <span className="rounded bg-gray-100 px-1.5 text-[10px] font-bold text-gray-500">Đã nghỉ</span>
            )}
          </p>
          <p className="text-theme-xs text-gray-500">
            Tham gia {dateFormatter.format(new Date(member.joinedAt))}
            {hasChildren && ` · ${total} người bên dưới`}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-theme-sm font-bold text-brand-700">{formatMoney(member.commission)}</p>
          <p className="text-[10px] text-gray-400">Hoa hồng</p>
        </div>
      </div>

      {hasChildren && isOpen && visibleChildren.length > 0 && (
        <ul className="mt-2 ml-5 space-y-2 border-l-2 border-dashed border-gray-200 pl-4 sm:ml-7">
          {visibleChildren.map((child) => (
            <TreeNode key={child.publicId} member={child} expanded={expanded} onToggle={onToggle} term={term} />
          ))}
        </ul>
      )}
    </li>
  );
};

// ── So do cay kieu kim tu thap ──────────────────────────────────────────

/**
 * Mot nguoi tren so do: avatar tron (xanh = da giao dich / dang hoat dong, do
 * = chua hoat dong), ten, nhan tang + hoa hong; ro chuot hien the chi tiet.
 * Nut nho duoi avatar thu / mo nhanh con.
 */
const ChartNode = ({
  member,
  collapsed,
  onToggle,
  term,
}: {
  member: ReferralMember;
  collapsed: Set<string>;
  onToggle: (id: string) => void;
  term: string;
}) => {
  const isCollapsed = collapsed.has(member.publicId);
  const hasChildren = member.children.length > 0;
  const isHit = Boolean(term) && normalize(member.name).includes(term);
  const below = flattenReferralTree(member.children).length;
  const tone = member.hasLeft
    ? { ring: 'ring-gray-300', bg: 'from-gray-400 to-gray-500 opacity-60 grayscale', dot: 'bg-gray-400', text: 'text-gray-400' }
    : member.isActive
    ? { ring: 'ring-success-500', bg: 'from-success-500 to-success-600', dot: 'bg-success-500', text: 'text-success-600' }
    : { ring: 'ring-error-500', bg: 'from-error-500 to-error-600', dot: 'bg-error-500', text: 'text-error-600' };

  return (
    <li>
      <div className="group/node relative flex w-28 flex-col items-center text-center sm:w-32">
        <span
          className={`relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-md ring-4 ring-offset-2 transition group-hover/node:scale-110 ${tone.bg} ${tone.ring} ${
            isHit ? 'outline-4 outline-offset-4 outline-brand-400 outline-dashed' : ''
          }`}
        >
          <MemberPhoto member={member} size="56px" />
        </span>
        <p className={`mt-2 line-clamp-2 text-[12px] leading-tight font-semibold ${member.hasLeft ? 'text-gray-400' : 'text-gray-900'}`}>{member.name}</p>

        {hasChildren && (
          <button
            type="button"
            onClick={() => onToggle(member.publicId)}
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? `Mở nhánh ${member.name}` : `Thu gọn nhánh ${member.name}`}
            className="relative z-10 mt-1.5 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-gray-600 shadow-sm transition hover:border-brand-300 hover:text-brand-600"
          >
            {isCollapsed ? `+${below}` : '−'}
          </button>
        )}

        {/* The chi tiet khi ro chuot */}
        <div className="pointer-events-none absolute top-full z-20 mt-2 w-52 rounded-xl border border-gray-100 bg-white p-3 text-left opacity-0 shadow-theme-lg transition group-hover/node:opacity-100">
          <p className="text-theme-sm font-bold text-gray-900">{member.name}</p>
          <dl className="mt-1.5 space-y-0.5 text-[11px] text-gray-600">
            <div className="flex justify-between"><dt>Trạng thái</dt><dd className={`font-semibold ${tone.text}`}>{member.hasLeft ? 'Đã nghỉ' : member.isActive ? 'Hoạt động' : 'Chưa hoạt động'}</dd></div>
            <div className="flex justify-between"><dt>Tham gia</dt><dd className="font-semibold">{dateFormatter.format(new Date(member.joinedAt))}</dd></div>
            <div className="flex justify-between"><dt>Bên dưới</dt><dd className="font-semibold">{below} người</dd></div>
            <div className="flex justify-between"><dt>Hoa hồng</dt><dd className="font-semibold text-brand-700">{formatMoney(member.commission)}</dd></div>
          </dl>
        </div>
      </div>

      {hasChildren && !isCollapsed && (
        <ul>
          {member.children.map((child) => (
            <ChartNode key={child.publicId} member={child} collapsed={collapsed} onToggle={onToggle} term={term} />
          ))}
        </ul>
      )}
    </li>
  );
};

/** Anh dai dien cua chinh minh (goc cay) - sau nay lay tu tai khoan dang nhap */
const MY_AVATAR = '/images/referral/avatars/ref-me.webp';

const ZOOM_LEVELS = [0.4, 0.5, 0.6, 0.75, 0.9, 1, 1.15];
/** Mac dinh 60% - thay tron he thong trong mot man hinh */
const DEFAULT_ZOOM = 2;

/** So do cay kieu kim tu thap: goc "Ban" o tren, cac tang toa xuong */
const ReferralOrgChart = ({
  tree,
  collapsed,
  onToggle,
  term,
}: {
  tree: ReferralMember[];
  collapsed: Set<string>;
  onToggle: (id: string) => void;
  term: string;
}) => {
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-4">
        <div className="flex items-center gap-4 text-theme-xs text-gray-600">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-success-500 ring-2 ring-success-50" />Đang hoạt động</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-error-500 ring-2 ring-error-50" />Chưa hoạt động</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-gray-400 opacity-60 ring-2 ring-gray-100" />Đã nghỉ</span>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-0.5">
          <button type="button" aria-label="Thu nhỏ sơ đồ" onClick={() => setZoomIndex((value) => Math.max(0, value - 1))} disabled={zoomIndex === 0} className="flex h-8 w-8 items-center justify-center rounded-md text-gray-600 transition hover:bg-gray-100 disabled:opacity-40">
            <FiMinus aria-hidden />
          </button>
          <span className="w-12 text-center text-theme-xs font-semibold text-gray-600">{Math.round(ZOOM_LEVELS[zoomIndex] * 100)}%</span>
          <button type="button" aria-label="Phóng to sơ đồ" onClick={() => setZoomIndex((value) => Math.min(ZOOM_LEVELS.length - 1, value + 1))} disabled={zoomIndex === ZOOM_LEVELS.length - 1} className="flex h-8 w-8 items-center justify-center rounded-md text-gray-600 transition hover:bg-gray-100 disabled:opacity-40">
            <FiPlus aria-hidden />
          </button>
        </div>
      </div>

      {/* Nen cham bi nhe + cuon ngang khi so do rong hon khung */}
      <div
        className="overflow-x-auto rounded-xl border border-gray-100 bg-gray-25 py-6"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(15 111 209 / 0.08) 1px, transparent 0)',
          backgroundSize: '22px 22px',
        }}
      >
        <div className="ref-tree mx-auto w-max px-6 pb-28" style={{ zoom: ZOOM_LEVELS[zoomIndex] }}>
          <ul>
            <li>
              {/* Goc: chinh minh - anh dai dien lon hon, vien cam noi bat */}
              <div className="flex flex-col items-center pb-2 text-center">
                <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-accent-400 to-accent-600 text-white shadow-lg ring-4 ring-accent-500 ring-offset-4">
                  <span className="absolute inset-0 overflow-hidden rounded-full">
                    <Image src={MY_AVATAR} alt="Ảnh đại diện của bạn" fill sizes="80px" className="object-cover" />
                  </span>
                  <span className="absolute -bottom-2 z-10 rounded-full bg-white px-2 text-[11px] font-extrabold text-accent-600 shadow">BẠN</span>
                </span>
              </div>
              {tree.length > 0 && (
                <ul>
                  {tree.map((member) => (
                    <ChartNode key={member.publicId} member={member} collapsed={collapsed} onToggle={onToggle} term={term} />
                  ))}
                </ul>
              )}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

/** He thong gioi thieu nhieu tang: so do / danh sach, tim kiem */
export const ReferralTree = () => {
  const { tree, levelRates, code } = MOCK_REFERRAL;
  const allMembers = useMemo(() => flattenReferralTree(tree), [tree]);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(tree.map((member) => member.publicId)));
  // So do: mac dinh mo het, luu cac nhanh bi thu
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [view, setView] = useState<'so-do' | 'danh-sach'>('so-do');
  const [keyword, setKeyword] = useState('');
  const term = normalize(keyword.trim());

  const toggleCollapsed = (id: string) =>
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggle = (id: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <FiGitMerge aria-hidden className="text-brand-500" />
          Hệ thống giới thiệu
        </h2>
        <p className="mt-1 text-theme-xs text-gray-500">
          Mỗi giao dịch thành công trong hệ thống đều mang lại hoa hồng cho bạn.
        </p>
        <div className="flex items-center gap-3">
          <span className="text-theme-xs text-gray-500 max-sm:hidden">
            {allMembers.length} thành viên
          </span>
          <div role="tablist" aria-label="Kiểu hiển thị" className="flex rounded-lg bg-gray-100 p-0.5">
            {[
              { key: 'so-do' as const, label: 'Sơ đồ', icon: FiGitMerge },
              { key: 'danh-sach' as const, label: 'Danh sách', icon: FiList },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={view === key}
                onClick={() => setView(key)}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-theme-xs font-semibold transition ${
                  view === key ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Icon aria-hidden />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-4 pt-4">
        <label className="relative min-w-0 flex-1">
          <FiSearch aria-hidden className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={keyword}
            onChange={(change) => setKeyword(change.target.value)}
            placeholder="Tìm thành viên trong hệ thống..."
            className="h-10 w-full rounded-lg border border-gray-200 pr-3 pl-9 text-theme-sm outline-none transition focus:border-brand-400 focus:shadow-focus-ring"
          />
        </label>
        <button
          type="button"
          onClick={() => {
            setExpanded(new Set(allMembers.map((member) => member.publicId)));
            setCollapsed(new Set());
          }}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-theme-sm text-gray-600 transition hover:border-brand-300 hover:text-brand-600"
        >
          <FiMaximize2 aria-hidden />
          Mở hết
        </button>
        <button
          type="button"
          onClick={() => {
            setExpanded(new Set());
            // So do: thu ve nhanh goc
            setCollapsed(new Set(tree.map((member) => member.publicId)));
          }}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-theme-sm text-gray-600 transition hover:border-brand-300 hover:text-brand-600"
        >
          <FiMinimize2 aria-hidden />
          Thu gọn
        </button>
      </div>

      {view === 'so-do' ? (
        <div className="py-4">
          <ReferralOrgChart tree={tree} collapsed={collapsed} onToggle={toggleCollapsed} term={term} />
        </div>
      ) : (
      <div className="p-4">
        {/* Goc cay: chinh minh */}
        <div className="mb-2 flex items-center gap-3 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2.5">
          <span className="brand-gradient flex h-10 w-10 items-center justify-center rounded-full text-theme-xs font-bold text-white">
            Bạn
          </span>
          <div>
            <p className="text-theme-sm font-bold text-gray-900">Bạn (mã {code})</p>
            <p className="text-theme-xs text-gray-500">Trung tâm hệ thống</p>
          </div>
        </div>
        <ul className="ml-5 space-y-2 border-l-2 border-dashed border-brand-200 pl-4 sm:ml-7">
          {tree
            .filter((member) => !term || branchMatches(member, term))
            .map((member) => (
              <TreeNode key={member.publicId} member={member} expanded={expanded} onToggle={toggle} term={term} />
            ))}
        </ul>
        {term && !tree.some((member) => branchMatches(member, term)) && (
          <p className="py-8 text-center text-theme-sm text-gray-500">Không tìm thấy thành viên nào.</p>
        )}
      </div>
      )}
    </section>
  );
};

// ── Thong tin gioi thieu ─────────────────────────────────────────────────

/** Nguoi gioi thieu, ma gioi thieu, link gioi thieu + sao chep / chia se */
export const ReferralInfoPanel = () => {
  const { referrer, code, link } = MOCK_REFERRAL;
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);

  const copy = async (value: string, what: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(what);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      /* trinh duyet chan clipboard - bo qua */
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Tham gia RealtyHub', text: `Dùng mã ${code} khi đăng ký`, url: link });
      } catch {
        /* nguoi dung huy chia se */
      }
    } else {
      void copy(link, 'link');
    }
  };

  const field = 'flex h-11 min-w-0 flex-1 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-theme-sm text-gray-700';

  return (
    <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm sm:p-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Giới thiệu bạn bè</h2>
        <p className="mt-1 text-theme-xs text-gray-500">Giới thiệu trực tiếp.</p>
      </div>

      <div>
        <p className="mb-1.5 text-theme-sm font-semibold text-gray-700">Người giới thiệu</p>
        <p className={`${field} ${referrer ? '' : 'text-gray-400'}`}>{referrer ?? 'Không có'}</p>
      </div>

      <div>
        <p className="mb-1.5 text-theme-sm font-semibold text-gray-700">Mã giới thiệu (số điện thoại)</p>
        <div className="flex gap-2">
          <p className={`${field} font-bold tracking-widest text-gray-900`}>{code}</p>
          <button
            type="button"
            onClick={() => copy(code, 'code')}
            aria-label="Sao chép mã giới thiệu"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-brand-300 hover:text-brand-600"
          >
            {copied === 'code' ? <FiCheck aria-hidden className="text-success-600" /> : <FiCopy aria-hidden />}
          </button>
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-theme-sm font-semibold text-gray-700">Link giới thiệu</p>
        <div className="flex gap-2">
          <p className={`${field} truncate`}>
            <span className="truncate">{link}</span>
          </p>
          <button
            type="button"
            onClick={() => copy(link, 'link')}
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-lg bg-navy-800 px-4 text-theme-sm font-semibold text-white transition hover:bg-navy-700"
          >
            {copied === 'link' ? <FiCheck aria-hidden /> : <FiCopy aria-hidden />}
            {copied === 'link' ? 'Đã chép' : 'Sao chép'}
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={share}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-gray-200 text-theme-sm font-semibold text-gray-700 transition hover:border-brand-300 hover:text-brand-600"
      >
        <FiShare2 aria-hidden />
        Chia sẻ link giới thiệu
      </button>

      {/* QR Code với logo Đông Tây Land */}
      <ReferralQRCode link={link} code={code} />
    </section>
  );
};

interface QRCodeWithLogoProps {
  link: string;
  code: string;
}

const ReferralQRCode = ({ link, code }: QRCodeWithLogoProps) => {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    QRCode.toDataURL(link, {
      width: 280,
      margin: 2,
      color: { dark: '#0E2A47', light: '#ffffff' },
    })
      .then((url) => {
        setQrDataUrl(url);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [link]);

  const downloadQR = () => {
    if (!qrDataUrl) return;
    const linkEl = document.createElement('a');
    linkEl.href = qrDataUrl;
    linkEl.download = `dongtayland-ref-${code}.png`;
    linkEl.click();
  };

  return (
    <div className="flex flex-col items-center rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-accent-50/30 p-5">
      <p className="mb-4 text-center text-theme-sm font-semibold text-gray-700">
        Quét mã QR để nhận link giới thiệu
      </p>
      <div className="relative">
        {isLoading ? (
          <div className="flex h-64 w-64 items-center justify-center rounded-xl bg-gray-100">
            <span className="text-theme-sm text-gray-400">Đang tải...</span>
          </div>
        ) : qrDataUrl ? (
          <div className="relative">
            {/* QR Code */}
            <Image src={qrDataUrl} alt="QR Code giới thiệu" width={280} height={280} className="rounded-xl" />
            {/* Logo overlay ở giữa */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg ring-4 ring-white">
                <Image
                  src="/images/home/logo-qr-new.png"
                  alt="Đông Tây Land"
                  width={48}
                  height={48}
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-64 w-64 items-center justify-center rounded-xl bg-gray-100">
            <span className="text-theme-sm text-gray-400">Không tạo được mã QR</span>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={downloadQR}
        disabled={!qrDataUrl}
        className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-navy-800 px-4 text-theme-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-50"
      >
        <FiDownload aria-hidden />
        Tải mã QR
      </button>
    </div>
  );
};

// ── The gon o trang Tai khoan ───────────────────────────────────────────

/** The "Gioi thieu ban be" o trang Tai khoan - bam vao mo trang rieng */
const ReferralCard = () => {
  const { code, tree } = MOCK_REFERRAL;
  const all = useMemo(() => flattenReferralTree(tree), [tree]);
  const commission = all.reduce((sum, member) => sum + member.commission, 0);

  return (
    <Link
      href="/tai-khoan/gioi-thieu-ban-be"
      className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm transition hover:border-brand-300 hover:shadow-theme-md sm:p-6"
    >
      <div className="flex items-start gap-4">
        <span className="brand-gradient flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-theme-xs">
          <FiUsers aria-hidden className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center justify-between gap-2 text-lg font-bold text-gray-900">
            Giới thiệu bạn bè
            <FiArrowRight aria-hidden className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1 group-hover:text-brand-500" />
          </p>
          <p className="mt-0.5 text-theme-sm text-gray-500">
            Mã của bạn: <strong className="tracking-widest text-gray-800">{code}</strong>
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-gray-50 px-3 py-2.5">
          <p className="text-lg font-bold text-gray-900">{all.length}</p>
          <p className="text-[11px] text-gray-500">Thành viên hệ thống</p>
        </div>
        <div className="rounded-xl bg-gray-50 px-3 py-2.5">
          <p className="text-lg font-bold text-brand-700">{formatMoney(commission)}</p>
          <p className="text-[11px] text-gray-500">Hoa hồng tích lũy</p>
        </div>
      </div>
    </Link>
  );
};

export default ReferralCard;
