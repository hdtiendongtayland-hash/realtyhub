import { FiShare2, FiCalendar } from 'react-icons/fi';

interface UnitModalBottomProps {
  onShare?: () => void;
  onBookingLock?: () => void;
}

const UnitModalBottom = ({
  onShare,
  onBookingLock,
}: UnitModalBottomProps) => {
  return (
    <div className="bg-white border-t border-slate-100 pb-2 pt-2">
      <div className="flex items-center justify-center gap-2">
        {/* Nút Chia sẻ */}
        <button
          type="button"
          onClick={onShare}
          className="flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg border border-blue-200 bg-white hover:bg-blue-50/50 active:scale-95 text-blue-600 font-medium text-xs transition-all"
        >
          <FiShare2 className="w-3.5 h-3.5 text-blue-600" />
          <span>Chia sẻ</span>
        </button>

        {/* Nút BOOKING LOCK */}
        <button
          type="button"
          onClick={onBookingLock}
          className="flex items-center justify-center gap-1.5 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-xs transition-all shadow-md shadow-blue-500/20"
        >
          <FiCalendar className="w-3.5 h-3.5 text-white" />
          <span>BOOKING LOCK</span>
        </button>
      </div>
    </div>
  );
};

export default UnitModalBottom;