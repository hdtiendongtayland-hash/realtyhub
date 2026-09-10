import { redirect } from 'next/navigation';

// Trang cu /gio-hang da duoc doi thanh /du-an. File nay redirect nguoi dung
// dang o URL cu sang URL moi (giu nguyen query string). Cac route con
// ([slug], [slug]/phan-khu/[phaseSlug]) khong redirect vi mot du an cu the
// van truy cap duoc qua slug tuy y, khong anh huong den redirect nay.
export default async function GioHangLegacyPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Giu nguyen query string neu co (vi du khi user search "nha duoi 4 ty"
  // o hero -> /gio-hang?q=...&priceMax=4e9, ta redirect giu nguyen de
  // /du-an nhan dung filter).
  const params = (await searchParams) ?? {};
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') qs.set(key, value);
    else if (Array.isArray(value)) qs.set(key, value.join(','));
  }
  const queryString = qs.toString();
  redirect(queryString ? `/du-an?${queryString}` : '/du-an');
}

export async function generateMetadata() {
  return {
    title: 'Đã chuyển sang /du-an',
    robots: { index: false, follow: false },
  };
}
