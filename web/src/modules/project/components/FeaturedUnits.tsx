'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import UnitCard from './UnitCard';
import type { UnitWithProject } from '../models/project-detail.model';

/**
 * Section "SAN PHAM NOI BAT" tren trang chu - redesigned voi slide carousel.
 *
 * Gom can tu TAT CA du an (khong phai mot du an cu the), chon theo thu tu:
 *   con hang -> du an HOT -> da dang du an (round-robin, toi da 3 can/du an).
 *
 * Layout moi:
 *   - Slide cuon ngang (horizontal scroll) voi cac nut prev/next
 *   - Responsive: mobile hien 1 card, tablet 2, desktop 3-4
 *   - Smooth scroll behavior
 */
type FeaturedUnitsProps = {
  /** SSR seed: route page goi service server-side roi truyen xuong */
  initialUnits: UnitWithProject[];
  /** So can lay (mac dinh 12). Gioi han de trang chu khong bi qua nang. */
  limit?: number;
  /** Gioi han so can toi da cua moi du an (mac dinh 3). */
  perProjectLimit?: number;
};

const FeaturedUnits = ({ initialUnits }: FeaturedUnitsProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const cardWidth = container.querySelector('article')?.offsetWidth || 300;
    const gap = 20; // gap-5 = 20px
    const scrollAmount = cardWidth + gap;
    
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="bg-gray-50 py-8 md:py-12">
      <div className="site-container">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wide text-gray-900 md:text-2xl">
              Sản phẩm nổi bật
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Căn hộ/biệt thự đang mở bán từ nhiều dự án trên toàn hệ thống
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Nut dieu huong carousel */}
            {initialUnits.length > 4 && (
              <div className="hidden items-center gap-2 md:flex">
                <button
                  type="button"
                  onClick={() => scroll('left')}
                  aria-label="Xem sản phẩm trước"
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-gray-300 bg-white text-gray-700 transition hover:border-brand-500 hover:bg-brand-50 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <FiChevronLeft aria-hidden className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => scroll('right')}
                  aria-label="Xem sản phẩm tiếp theo"
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-gray-300 bg-white text-gray-700 transition hover:border-brand-500 hover:bg-brand-50 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <FiChevronRight aria-hidden className="h-5 w-5" />
                </button>
              </div>
            )}

            <Link
              href="/du-an"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 transition hover:text-brand-700 hover:gap-2"
            >
              Xem tất cả
              <FiChevronRight aria-hidden className="transition-all" />
            </Link>
          </div>
        </div>

        {initialUnits.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
            <p className="text-sm text-gray-500">Chưa có sản phẩm nổi bật.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Container cuon ngang */}
            <div
              ref={scrollContainerRef}
              className="flex gap-5 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory md:overflow-x-hidden"
            >
              {initialUnits.map((unit) => (
                <div
                  key={unit.publicId}
                  className="w-[85%] flex-shrink-0 snap-start sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] xl:w-[calc(25%-15px)]"
                >
                  <UnitCard unit={unit} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedUnits;
