import Image from 'next/image';
import { FiPhone, FiMessageSquare } from 'react-icons/fi';

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
  onMessage
}: UnitModalAdvisorProps) => {
  // Giới hạn tối đa 3 advisors
  const displayAdvisors = advisors.slice(0, 3);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {displayAdvisors.map((advisor) => (
        <div
          key={advisor.id}
          className="bg-gradient-to-b from-blue-50/40 to-slate-50/80 border border-blue-100/80 rounded-2xl p-3 flex items-center gap-3 shadow-2xs hover:shadow-xs transition-shadow"
        >
          {/* Avatar + Name */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex flex-col items-center gap-1">
              <h4 className="font-bold text-slate-900 text-xs" title={advisor.name}>
                {advisor.name}
              </h4>
              {advisor.role && (
                <span className="text-[10px] text-blue-600 font-medium">
                  {advisor.role}
                </span>
              )}
              <div className="flex items-center gap-2">
                <img
                  src={advisor.avatar}
                  alt={advisor.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-2xs"
                />
                {/* Nút Gọi thoại */}
                <button
                  type="button"
                  onClick={() => onCall ? onCall(advisor) : window.open(`tel:${advisor.phone}`)}
                  className="w-9 h-9 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white flex items-center justify-center transition-all shadow-xs"
                  title="Gọi điện"
                >
                  <FiPhone className="w-4 h-4 fill-white" />
                </button>

                {/* Nút Nhắn tin */}
                <button
                  type="button"
                  onClick={() => onMessage && onMessage(advisor)}
                  className="w-12 h-12 left-[-5px] rounded-lg active:scale-95 text-white flex items-center justify-center transition-all"
                  title="Nhắn tin"
                >
                  <Image src="/images/logo-zalo.webp" alt="Zalo" width={32} height={32} />
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