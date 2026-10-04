'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FiExternalLink } from 'react-icons/fi';
import type { SalesPolicy } from '../../../models/project-detail.model';
import { SALES_POLICY_MONTHS } from '../../../mocks/sales-policy-months.mock';
import { TabEmptyState } from '../shared';

type SalesPolicyTabProps = {
  /**
   * Chinh sach dang bang so lieu (ban cu). Bo cuc theo thang hien KHONG doc
   * toi - giu lai de cac noi goi khong phai doi, va de dung lai khi can.
   */
  salesPolicy?: SalesPolicy;
  /** Luon la ten DU AN, ke ca khi xem tu trang phan khu */
  projectName: string;
};

/**
 * Tab "Chinh sach ban hang" - cung bo cuc voi tab "Tien do": cot trai la
 * danh sach THANG (dang timeline), cot phai la anh chinh sach cua thang dang
 * chon. Thang moi nhat mo san.
 *
 * Ban demo: moi du an dung chung danh sach SALES_POLICY_MONTHS.
 */
const SalesPolicyTab = ({ projectName }: SalesPolicyTabProps) => {
  const months = SALES_POLICY_MONTHS;
  const [index, setIndex] = useState(0);

  if (months.length === 0) {
    return <TabEmptyState message="Dự án chưa cập nhật chính sách bán hàng." />;
  }

  const month = months[Math.min(index, months.length - 1)];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
      <aside>
        <h2 className="mb-4 text-base font-bold uppercase tracking-wide text-gray-900">
          Chính sách bán hàng
        </h2>

        {/* Duong doc cua timeline ve bang border trai cua <ol> */}
        <ol className="space-y-2 border-l-2 border-gray-200 pl-4">
          {months.map((item, itemIndex) => {
            const isActive = itemIndex === index;
            return (
              <li key={item.publicId} className="relative">
                <span
                  aria-hidden
                  className={`absolute top-3.5 -left-5.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                    isActive ? 'bg-accent-500' : 'bg-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setIndex(itemIndex)}
                  aria-current={isActive ? 'true' : undefined}
                  className={`w-full rounded-md border px-3 py-2.5 text-left text-base transition ${
                    isActive
                      ? 'border-accent-400 bg-accent-50 font-semibold text-accent-600'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-brand-300 hover:text-brand-600'
                  }`}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ol>
      </aside>

      {/* Anh chinh sach la anh doc (infographic): giu nguyen ti le, gioi han
          be ngang de khong dai qua man hinh; bam de mo anh goc xem chu nho */}
      <figure className="min-w-0">
        <a
          href={month.imageUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`Xem ảnh gốc chính sách bán hàng ${month.label}`}
          className="group relative mx-auto block max-w-2xl overflow-hidden rounded-lg border border-gray-200 bg-white shadow-card"
        >
          <Image
            key={month.publicId}
            src={month.imageUrl}
            alt={`Chính sách bán hàng ${month.label} - ${projectName}`}
            width={month.width}
            height={month.height}
            sizes="(min-width: 1024px) 672px, 100vw"
            className="h-auto w-full bg-gray-100"
            // Anh infographic PNG ~2MB: bo qua bo toi uu anh cua Next (lan dau
            // xu ly rat cham, khung trang tron) - tai thang file goc
            unoptimized
            priority={index === 0}
          />
          <span className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-theme-xs font-medium text-white opacity-90 transition group-hover:opacity-100">
            <FiExternalLink aria-hidden />
            Xem ảnh gốc
          </span>
        </a>
        <figcaption className="mt-2 text-center text-theme-xs text-gray-500">
          Chính sách bán hàng {month.label}
        </figcaption>
      </figure>
    </div>
  );
};

export default SalesPolicyTab;
