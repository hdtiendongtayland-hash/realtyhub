"use client";

import { useState } from 'react';
import Image from 'next/image';
import { FiChevronDown, FiPhone } from 'react-icons/fi';

interface Advisor {
  id: string | number;
  name: string;
  avatar: string;
  views: number;
  phone?: string;
  role?: string;
}

interface UnitModalAdvisorProps {
  advisors?: Advisor[];
  onCall?: (advisor: Advisor) => void;
  onMessage?: (advisor: Advisor) => void;
  /**
   * "band": ba the nam ngang mot hang, avatar ben trai - ten/chuc danh ben
   * phai, hai nut goi & Zalo o duoi. Dung cho dai "Lien he tu van" chay ngang
   * day popup o bo cuc desktop.
   */
  variant?: "column" | "band";
}

const DEFAULT_ADVISORS: Advisor[] = [
  {
    id: 1,
    name: 'Lân Thị Ngọc Anh',
    // role: 'Giám đốc dự án',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
    views: 0,
    phone: '0901234567',
  },
  {
    id: 2,
    name: 'Nguyễn Văn Tuấn',
    // role: 'Chuyên viên kinh doanh',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop',
    views: 0,
    phone: '0908765432',
  },
  {
    id: 3,
    name: 'Trần Minh Hoàng',
    // role: 'Tư vấn khách hàng',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    views: 0,
    phone: '0909998888',
  },
];

const UnitModalAdvisor = ({
  advisors = DEFAULT_ADVISORS,
  onCall,
  onMessage,
  variant = "column",
}: UnitModalAdvisorProps) => {
  // Giới hạn tối đa 3 advisors
  const displayAdvisors = advisors.slice(0, 3);
  // Bien the "band" chi hien hai nguoi dau cho gon, bam "Xem them" moi mo het
  const [expanded, setExpanded] = useState(false);

  if (variant === "band") {
    const visible = expanded ? displayAdvisors : displayAdvisors.slice(0, 2);
    const hiddenCount = displayAdvisors.length - visible.length;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {visible.map((advisor) => (
          <div
            key={advisor.id}
            className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50/60 px-2 py-1.5"
          >
            <img
              src={advisor.avatar}
              alt={advisor.name}
              className="h-9 w-9 shrink-0 rounded-full border-2 border-white object-cover shadow-2xs"
            />
            {/* Ten + chuc danh o tren, hai nut goi/Zalo o duoi: cot nay chi
                rong ~205px, xep tat ca tren mot hang thi ten bi cat ("Lan Thi
                ..."), xuong dong thi phan chu duoc gan gap doi be ngang. */}
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="min-w-0">
                <h4 className="truncate text-xs font-bold leading-tight text-slate-900" title={advisor.name}>
                  {advisor.name}
                </h4>
                {advisor.role && (
                  <p className="truncate text-xs font-medium leading-tight text-blue-600">
                    {advisor.role}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => (onCall ? onCall(advisor) : window.open(`tel:${advisor.phone}`))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-xs transition-all hover:bg-emerald-600 active:scale-95"
                  title="Gọi điện"
                >
                  <FiPhone className="h-3.5 w-3.5 fill-white" />
                </button>
                <button
                  type="button"
                  onClick={() => onMessage && onMessage(advisor)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg transition-all active:scale-95"
                  title="Nhắn tin"
                >
                  <Image src="/images/logo-zalo.webp" alt="Zalo" width={28} height={28} className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Chi hien nut khi that su con nguoi bi an - hai nguoi dau da du
            thong tin lien he, cat bot cho khoi trang mot the nua bi cat doi */}
        {(hiddenCount > 0 || expanded) && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="flex items-center justify-center gap-1 rounded-lg py-1 text-[11px] font-medium text-blue-600 transition-colors hover:bg-blue-50/60"
          >
            {expanded ? "Thu gọn" : `Xem thêm ${hiddenCount} người`}
            <FiChevronDown
              className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="no-scrollbar grid grid-cols-1 gap-3 lg:grid-cols-3 max-lg:flex max-lg:overflow-x-auto max-lg:pb-1 laptop:gap-1.5">
      {displayAdvisors.map((advisor) => (
        <div
          key={advisor.id}
          className="flex items-center gap-3 rounded-2xl border border-blue-100/80 bg-gradient-to-b from-blue-50/40 to-slate-50/80 p-3 shadow-2xs transition-shadow hover:shadow-xs max-lg:min-w-[210px] md:max-lg:min-w-0 md:max-lg:w-[calc(50%-6px)] md:max-lg:shrink-0 laptop:min-w-0 laptop:gap-2 laptop:rounded-xl laptop:p-1.5"
        >
          <div className="flex min-w-0 shrink-0 items-center gap-3 laptop:w-full laptop:shrink">
            <div className="flex flex-col items-center gap-1 max-lg:items-start laptop:w-full laptop:items-start laptop:gap-0.5">
              <h4 className="max-w-full truncate text-sm font-bold text-slate-900" title={advisor.name}>
                {advisor.name}
              </h4>
              {advisor.role && (
                <span className="text-xs font-medium text-blue-600">
                  {advisor.role}
                </span>
              )}
              <div className="flex items-center gap-2 laptop:gap-1">
                <img
                  src={advisor.avatar}
                  alt={advisor.name}
                  className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-2xs laptop:h-8 laptop:w-8"
                />
                <button
                  type="button"
                  onClick={() => onCall ? onCall(advisor) : window.open(`tel:${advisor.phone}`)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-xs transition-all hover:bg-emerald-600 active:scale-95 laptop:h-7 laptop:w-7"
                  title="Gọi điện"
                >
                  <FiPhone className="h-4 w-4 fill-white laptop:h-3.5 laptop:w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onMessage && onMessage(advisor)}
                  className="flex h-12 w-12 items-center justify-center rounded-lg transition-all active:scale-95 laptop:h-8 laptop:w-8"
                  title="Nhắn tin"
                >
                  <Image src="/images/logo-zalo.webp" alt="Zalo" width={32} height={32} className="laptop:h-6 laptop:w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UnitModalAdvisor;