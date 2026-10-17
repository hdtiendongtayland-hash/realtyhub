'use client';

import type { IconType } from 'react-icons';
import {
  FiAward,
  FiBriefcase,
  FiCalendar,
  FiClipboard,
  FiFileText,
  FiGrid,
  FiHome,
  FiInfo,
  FiKey,
  FiLayers,
  FiMap,
  FiMapPin,
  FiMaximize,
  FiSettings,
  FiTool,
  FiTrendingUp,
  FiUsers,
} from 'react-icons/fi';
import type { ProjectDetail } from '../../models/project-detail.model';
import { STATUS_LABELS } from '../../models/project.model';

/**
 * Icon theo nhan thong so. Thu tu quan trong: nhan cu the dat truoc nhan
 * chung ("Tieu chuan ban giao" truoc "Giao nha", "Quy mo dan so" truoc "Quy mo").
 */
const SPEC_ICONS: [RegExp, IconType][] = [
  [/khu vực/i, FiMap],
  [/tên/i, FiHome],
  [/vị trí|địa chỉ/i, FiMapPin],
  [/mật độ/i, FiGrid],
  [/dân số|cư dân/i, FiUsers],
  [/quy mô|diện tích/i, FiMaximize],
  [/loại hình|sản phẩm/i, FiLayers],
  [/chủ đầu tư/i, FiBriefcase],
  [/phát triển/i, FiTrendingUp],
  [/vận hành|quản lý/i, FiSettings],
  [/nhà thầu|thi công/i, FiTool],
  [/tiêu chuẩn/i, FiAward],
  [/khởi công/i, FiCalendar],
  [/giao nhà|bàn giao/i, FiKey],
  [/sở hữu|pháp lý/i, FiFileText],
];

/** Bang mau icon xoay vong: cac sac xanh khac nhau cho cac dong */
const ICON_TONES = [
  'bg-brand-50 text-brand-600',
  'bg-sky-50 text-sky-600',
  'bg-blue-50 text-blue-700',
  'bg-cyan-50 text-cyan-700',
];

const iconFor = (label: string) => SPEC_ICONS.find(([pattern]) => pattern.test(label))?.[1] ?? FiInfo;

/**
 * Thong so trong muc "Tong quan du an": mot the duy nhat, trang thai dua len
 * dau the, cac dong con lai xep danh sach hai cot co duong ke - so dong le/
 * chan, gia tri dai/ngan deu khong lam vo luoi nhu kieu o vuong rieng le.
 */
const ProjectSpecs = ({ project }: { project: ProjectDetail }) => {
  const rows = [
    { label: 'Khu vực', value: project.regionName },
    ...project.specs.map((spec) => ({ label: spec.label, value: spec.value })),
  ];

  return (
    <div className="mt-8 overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-[0_18px_44px_-30px_rgba(15,111,209,0.55)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-100 bg-gradient-to-r from-[#e3efff] via-[#eef6ff] to-white px-5 py-4 sm:px-7">
        <h3 className="flex items-center gap-2.5 text-base font-bold text-navy-800 sm:text-lg">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-brand-600 text-white shadow-theme-xs">
            <FiClipboard aria-hidden className="h-[18px] w-[18px]" />
          </span>
          Thông tin dự án
        </h3>
        <span className="inline-flex items-center gap-2 rounded-full border border-success-500/25 bg-success-50 px-3.5 py-1.5 text-theme-sm font-semibold text-success-600">
          <span aria-hidden className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-500 opacity-50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success-500" />
          </span>
          {STATUS_LABELS[project.status]}
        </span>
      </div>

      <dl className="grid grid-cols-1 gap-x-10 px-5 py-2 sm:px-7 md:grid-cols-2">
        {rows.map((row, index) => {
          const Icon = iconFor(row.label);
          return (
            <div key={row.label} className="flex items-start gap-3 border-b border-dashed border-gray-200 py-3.5">
              <span
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${ICON_TONES[index % ICON_TONES.length]}`}
              >
                <Icon aria-hidden className="h-4 w-4" />
              </span>
              {/* Dien thoai: nhan tren, gia tri duoi; tu sm: nhan cot trai co dinh */}
              <div className="min-w-0 flex-1 sm:flex sm:gap-3">
                <dt className="text-theme-xs font-semibold tracking-wide text-gray-500 uppercase sm:w-40 sm:shrink-0 sm:pt-1.5">
                  {row.label}
                </dt>
                <dd className="min-w-0 flex-1 text-theme-sm leading-relaxed font-semibold text-navy-800 sm:pt-1">
                  {row.value}
                </dd>
              </div>
            </div>
          );
        })}
      </dl>
    </div>
  );
};

export default ProjectSpecs;
