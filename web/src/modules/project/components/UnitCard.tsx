"use client";

import { useState } from "react";
import Link from "next/link";
import { FiMapPin, FiHome, FiMaximize, FiCompass, FiLayers, FiHeart } from "react-icons/fi";
import ThumbCarousel from "@/common/components/ThumbCarousel";
import { formatBillion } from "@/common/utils/format";
import type { UnitWithProject } from "@/modules/project/models/project-detail.model";

/**
 * Card san pham/căn - redesigned theo mau UX/UI don gian.
 *
 * Layout moi:
 *   - Anh bia voi carousel (giong ProjectCard) + badge HOT o goc tren trai
 *   - Ten du an overlay o duoi anh (gradient toi dan, giong ProjectCard) -
 *     nguoi xem quy can nhieu du an khac nhau can biet ngay can nay cua du an nao
 *   - Nhan trang thai (Còn hàng/Giữ chỗ/Đã bán) overlay tren anh
 *   - Thong tin chinh: ma can, gia
 *   - Divider ngang
 *   - Danh sach thong tin: dien tich, huong, phan khu, loai hinh (dung icon)
 *   - Nut lien he + xem chi tiet
 */
type UnitCardProps = {
  unit: UnitWithProject;
};

const UnitCard = ({ unit }: UnitCardProps) => {
  const detailHref = `/du-an/${unit.projectSlug}?tab=quy-can`;

  // Ro chuot len the thi dung chuyen anh, de con kip nhin tam dang xem
  const [isHovered, setIsHovered] = useState(false);

  // Chi hien thi badge HOT cho quy doc quyen
  const isHot = unit.fundType === 'doc-quyen';

  return (
    <article
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md hover:border-brand-400"
    >
        {/* ── Anh bia ────────────────────────────────────────────────── */}
        <Link
          href={detailHref}
          aria-label={`Xem căn ${unit.code}`}
          className="relative block aspect-[4/3] w-full overflow-hidden"
        >
          <ThumbCarousel
            seed={unit.publicId}
            images={unit.thumbnailUrls}
            alt={`Phối cảnh dự án ${unit.projectName}`}
            paused={isHovered}
            className="h-full w-full transition duration-500 group-hover:scale-105"
          />

          {/* Lop phu toi dan tu duoi len de ten du an luon doc duoc tren moi tam */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-black/15 to-transparent"
          />
          {/* Ten du an overlay - nguoi xem quy can nhieu du an can biet can nay
              thuoc du an nao ngay khi nhin card. */}
          <span className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-3 text-center text-base font-bold uppercase leading-tight tracking-wide text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            {unit.projectName}
          </span>

          {/* Tag HOT (goc tren trai) - danh dau quy doc quyen */}
          {isHot && (
            <span
              aria-label="Căn độc quyền"
              title="Căn độc quyền"
              className="absolute left-2 top-2 z-10 rounded-md bg-white px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-error-500 shadow-sm"
            >
              HOT
            </span>
          )}

          {/* Icon trai tim (goc tren phai) */}
          <button
            type="button"
            aria-label="Yêu thích"
            className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-2 shadow-sm transition hover:bg-white hover:scale-110"
            onClick={(event) => {
              // Nut nam trong <Link> bao quanh thumbnail, can chan ca mac dinh
              // (Link navigate) lan bubble de click chi toggle favorite ma
              // khong nhay trang / cuon len dau.
              event.preventDefault();
              event.stopPropagation();
            }}
          >
            <FiHeart className="h-5 w-5 text-error-500" />
          </button>
        </Link>

        {/* ── Noi dung ────────────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col p-4">
          {/* Ma can + gia */}
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
                <dt className="inline font-medium text-gray-600">Diện tích đất: </dt>
                <dd className="inline font-semibold text-gray-900">{unit.landArea} m²</dd>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <FiHome aria-hidden className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
              <div className="flex-1">
                <dt className="inline font-medium text-gray-600">Diện tích xây dựng: </dt>
                <dd className="inline font-semibold text-gray-900">{unit.buildArea} m²</dd>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <FiCompass aria-hidden className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
              <div className="flex-1">
                <dt className="inline font-medium text-gray-600">Hướng: </dt>
                <dd className="inline font-semibold text-gray-900">{unit.direction}</dd>
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
              <FiLayers aria-hidden className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
              <div className="flex-1">
                <dt className="inline font-medium text-gray-600">Loại hình: </dt>
                <dd className="inline font-semibold text-gray-900">Liền Kề</dd>
              </div>
            </div>
          </dl>
        </div>
    </article>
  );
};

export default UnitCard;
