"use client";

import { useState } from "react";
import Link from "next/link";
import { FiArrowRight, FiPhone, FiUser } from "react-icons/fi";
import PlaceholderThumb from "@/common/components/PlaceholderThumb";
import { formatBillion, formatMillionPerSqm } from "@/common/utils/format";
import {
  UNIT_STATUS_LABELS,
  type UnitWithProject,
} from "@/modules/project/models/project-detail.model";
import UnitDetailModal from "./UnitDetailModal";

/**
 * Card san pham/căn - dung cho section "San pham noi bat" tren trang chu.
 *
 * Click vao the di chuyen den tab "Quy can" cua du an tuong ung (trang
 * detail co san). Khong tao route moi vi he thong chua co trang chi tiet
 * can rieng.
 *
 * Thong tin hien thi (theo mau template):
 *   - 2 hang dia diem (vi tri + phan khu) tren cung voi icon map pin
 *   - Anh bia (PlaceholderThumb sinh gradient tu publicId)
 *     + nhan trang thai xanh (trai)
 *   - Nhan HOT + Lien ke (theo propertyType) + ma can (unit.code)
 *   - Bang gia 3 cot: niem yet (do), TTS (xanh), TTTĐ (xam)
 *   - 2 nut cuoi: lien he (xam nhat) + xem chi tiet (brand)
 */
type UnitCardProps = {
  unit: UnitWithProject;
};

const UnitCard = ({ unit }: UnitCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const detailHref = `/du-an/${unit.projectSlug}?tab=quy-can`;

  return (
    <>
      <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card transition hover:shadow-card-hover hover:border-brand-300">
      <Link
        href={detailHref}
        aria-label={`Xem căn ${unit.code}`}
        className="relative block aspect-16/10 w-full overflow-hidden"
      >
        <PlaceholderThumb
          seed={unit.publicId}
          src={`/images/projects/${unit.projectSlug}.jpg`}
          alt={`Ảnh dự án ${unit.projectName}`}
          label={unit.code}
          className="transition duration-500 group-hover:scale-105"
        />

        {/* Lop phu toi tu duoi len de cac nhan tren anh luon doc duoc */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-black/15 to-transparent"
        />

        {/* Nhan trang thai (tren cung ben phai) */}
        <span className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-sm bg-success-500 px-3 py-1 text-[8px] font-bold uppercase tracking-wide text-white">
          {UNIT_STATUS_LABELS[unit.status]}
        </span>
      </Link>

      {/* ── Noi dung ────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Ma du an + nhan HOT / Lien ke */}
        <Link
          href={`/du-an/${unit.projectSlug}`}
          aria-label={`Xem dự án ${unit.projectName}`}
          className="block transition hover:text-brand-600"
        >
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <span className="text-base font-bold uppercase tracking-wide text-gray-900">
              {unit.code}
            </span>
            <span aria-hidden className="h-3.5 w-px bg-gray-200" />
            <span className="rounded-sm bg-error-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              HOT
            </span>
            <span aria-hidden className="h-3.5 w-px bg-gray-200" />
            <span className="rounded-sm bg-brand-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Liền kề
            </span>
          </div>
        </Link>

        {/* Bang gia 3 cot: niem yet, TTS, TTTĐ */}
        <div className="grid grid-cols-3 gap-2 rounded-lg border border-gray-100 bg-gray-25 p-3 text-center">
          <div>
            <dt className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
              Giá niêm yết
            </dt>
            <dd className="mt-1 text-theme-sm font-bold text-error-600">
              {formatBillion(unit.listedPrice)}
            </dd>
          </div>
          <div className="border-x border-gray-100">
            <dt className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
              Giá TTS
            </dt>
            <dd className="mt-1 text-theme-sm font-bold text-brand-600">
              {formatBillion(unit.netPrice)}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
              Giá TTTĐ
            </dt>
            <dd className="mt-1 text-theme-sm font-bold text-gray-700">
              {formatMillionPerSqm(unit.unitPrice)}
            </dd>
          </div>
        </div>

        {/* Nut bam: lien he + xem chi tiet */}
        <div className="mt-auto grid grid-cols-6 gap-2 pt-1">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            aria-label={`Xem chi tiết căn ${unit.code}`}
            className="flex items-center justify-center gap-1.5 rounded-md bg-brand-500 px-3 py-2.5 text-theme-sm font-semibold text-white transition hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 col-span-4"
          >
            <FiUser aria-hidden className="h-4 w-4" />
            Xem chi tiết
            <FiArrowRight aria-hidden className="h-4 w-4" />
          </button>
          <Link
            href={`/lien-he?du-an=${unit.projectSlug}&can=${unit.code}`}
            aria-label={`Liên hệ tư vấn căn ${unit.code}`}
            className="flex items-center justify-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5 text-theme-sm font-semibold text-gray-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 col-span-2"
          >
            <FiPhone aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </div>

      </article>

      {/* Modal chi tiết căn hộ */}
      <UnitDetailModal open={isModalOpen} onClose={() => setIsModalOpen(false)} unit={unit} />
    </>
  );
};

export default UnitCard;
