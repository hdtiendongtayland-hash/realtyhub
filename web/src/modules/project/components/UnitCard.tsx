"use client";

import { useState } from "react";
import Link from "next/link";
import { FiMapPin, FiHome, FiMaximize, FiDollarSign, FiPhone, FiHeart } from "react-icons/fi";
import PlaceholderThumb from "@/common/components/PlaceholderThumb";
import { formatBillion, formatMillionPerSqm } from "@/common/utils/format";
import {
  UNIT_STATUS_LABELS,
  type UnitWithProject,
} from "@/modules/project/models/project-detail.model";
import UnitDetailModal from "./UnitDetailModal";

/**
 * Card san pham/căn - redesigned theo mau UX/UI don gian.
 *
 * Layout moi:
 *   - Anh bia voi badge HOT o goc tren trai
 *   - Nhan trang thai (Còn hàng/Giữ chỗ/Đã bán) overlay tren anh
 *   - Thong tin chinh: ten du an, ma can, loai hinh
 *   - Divider ngang
 *   - Danh sach thong tin: dien tich, gia, phan khu (dung icon)
 *   - Divider ngang
 *   - Nut lien he + xem chi tiet
 */
type UnitCardProps = {
  unit: UnitWithProject;
};

const UnitCard = ({ unit }: UnitCardProps) => {
  const detailHref = `/du-an/${unit.projectSlug}?tab=quy-can`;

  // Chi hien thi badge HOT cho quy doc quyen
  const isHot = unit.fundType === 'doc-quyen';

  return (
    <>
      <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md hover:border-brand-400">
        {/* ── Anh bia ────────────────────────────────────────────────── */}
        <Link
          href={detailHref}
          aria-label={`Xem căn ${unit.code}`}
          className="relative block aspect-[4/3] w-full overflow-hidden"
        >
          <PlaceholderThumb
            seed={unit.publicId}
            src={`/images/projects/${unit.projectSlug}.jpg`}
            alt={`Ảnh dự án ${unit.projectName}`}
            label={unit.code}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />

          {/* Badge HOT (goc tren trai) */}
          {isHot && (
            <span className="absolute left-2 top-2 z-10 rounded bg-error-500 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-sm">
              HOT
            </span>
          )}

          {/* Icon trai tim (goc tren phai) */}
          <button 
            aria-label="Yêu thích"
            className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-2 shadow-sm transition hover:bg-white hover:scale-110"
          >
            <FiHeart className="h-5 w-5 text-error-500" />
          </button>
        </Link>

        {/* ── Noi dung ────────────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col p-4">
          {/* Ten du an + ma can */}
          <div className="mb-2 flex flex-row items-center justify-between gap-3">
            <Link
              href={`/du-an/${unit.projectSlug}`}
              className="group/link block flex-1 truncate"
            >
              <p className="text-sm font-medium text-gray-600 truncate">
                <span className="font-semibold text-gray-900">{unit.code}</span>
              </p>
            </Link>
            <p className="text-sm font-medium text-gray-600 flex-shrink-0 whitespace-nowrap">{formatBillion(unit.netPrice)}</p>
          </div>

          {/* Divider */}
          <hr className="my-3 border-gray-200" />

          {/* Danh sach thong tin */}
          <dl className="space-y-2.5 text-sm">
            {/* Dien tich */}
            <div className="flex items-start gap-2">
              <FiMaximize aria-hidden className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
              <div className="flex-1">
                <dt className="inline font-medium text-gray-600">Diện tích: </dt>
                <dd className="inline font-semibold text-gray-900">{unit.landArea} m²</dd>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <FiMaximize aria-hidden className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
              <div className="flex-1">
                <dt className="inline font-medium text-gray-600">Hướng: </dt>
                <dd className="inline font-semibold text-gray-900">{unit.direction}</dd>
              </div>
            </div>

            {/* Gia */}
            <div className="flex items-start gap-2">
              <FiDollarSign aria-hidden className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
              <div className="flex-1">
                <dt className="inline font-medium text-gray-600">Giá: </dt>
                <dd className="inline font-bold text-brand-600">{formatBillion(unit.netPrice)}</dd>
                <span className="ml-1 text-xs text-gray-500">({formatMillionPerSqm(unit.unitPrice)})</span>
              </div>
            </div>

            {/* Phan khu */}
            <div className="flex items-start gap-2">
              <FiMapPin aria-hidden className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
              <div className="flex-1">
                <dt className="inline font-medium text-gray-600">Phân khu: </dt>
                <dd className="inline font-semibold text-gray-900">{unit.phaseName}</dd>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <FiMaximize aria-hidden className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
              <div className="flex-1">
                <dt className="inline font-medium text-gray-600">Loại hình: </dt>
                <dd className="inline font-semibold text-gray-900">Liền Kề</dd>
              </div>
            </div>
          </dl>
        </div>
      </article>

      {/* Modal chi tiết căn hộ */}
    </>
  );
};

export default UnitCard;
