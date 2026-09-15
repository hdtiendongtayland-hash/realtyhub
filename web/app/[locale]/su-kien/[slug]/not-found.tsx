import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export default function SuKienNotFound() {
  return (
    <main className="site-container flex flex-col items-center justify-center py-24 text-center">
      <span className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-4 py-1.5 text-theme-xs font-bold uppercase tracking-[0.22em] text-purple-600">
        404
      </span>

      <h1 className="mt-6 text-3xl font-bold uppercase tracking-tight text-gray-900 md:text-4xl">
        Không tìm thấy sự kiện
      </h1>

      <p className="mt-3 max-w-md text-theme-sm leading-relaxed text-gray-600">
        Sự kiện bạn tìm không còn trên hệ thống hoặc đã kết thúc. Vui lòng quay lại danh sách
        và chọn một sự kiện khác.
      </p>

      <Link
        href="/su-kien"
        className="group mt-8 inline-flex items-center gap-2 rounded-full bg-purple-500 px-6 py-3 text-theme-sm font-semibold text-white shadow-card-hover transition hover:bg-purple-600"
      >
        <FiArrowLeft aria-hidden className="transition-transform group-hover:-translate-x-1" />
        Về danh sách sự kiện
      </Link>
    </main>
  );
}