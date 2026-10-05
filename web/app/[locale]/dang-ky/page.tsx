import type { Metadata } from 'next';
import Image from 'next/image';
import RegisterForm from '@/modules/auth/components/RegisterForm';

export const metadata: Metadata = {
  title: 'Đăng ký',
  description: 'Tạo tài khoản RealtyHub, nhập mã giới thiệu để tham gia mạng lưới giới thiệu.',
};

type PageSearchParams = { ref?: string | string[] };

/**
 * Trang dang ky /dang-ky - cung bo cuc voi /login (form trai, panel brand phai).
 * Link gioi thieu dang /dang-ky?ref=<SDT nguoi gioi thieu> -> o ma tu dien.
 */
const RegisterPage = async ({ searchParams }: { searchParams: Promise<PageSearchParams> }) => {
  const { ref } = await searchParams;
  const referral = Array.isArray(ref) ? ref[0] : ref;

  return (
    <section className="flex min-h-[calc(100vh-8rem)] items-stretch">
      <div className="flex w-full flex-col justify-center px-6 py-10 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Image src="/images/home/logo_realtyhub.png" alt="RealtyHub" width={140} height={40} className="h-8 w-auto" />
          </div>

          <h1 className="text-2xl font-extrabold text-navy-800 md:text-3xl">Tạo tài khoản RealtyHub</h1>
          <p className="mt-2 text-theme-sm text-gray-600">
            Đăng ký miễn phí để lưu dự án, nhận tư vấn và tham gia chương trình giới thiệu bạn bè.
          </p>

          <div className="mt-8">
            <RegisterForm initialReferral={referral ?? ''} />
          </div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-gradient-to-br from-navy-700 via-navy-800 to-brand-600 lg:flex lg:w-1/2">
        <div
          aria-hidden
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />
        <div aria-hidden className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-400/30 blur-3xl" />
        <div aria-hidden className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10 flex w-full flex-col justify-between p-12 text-white">
          <Image
            src="/images/home/logo_realtyhub.png"
            alt="RealtyHub"
            width={160}
            height={48}
            className="h-10 w-auto self-start brightness-0 invert"
          />

          <div>
            <h2 className="text-3xl leading-tight font-extrabold xl:text-4xl">
              Giới thiệu bạn bè,
              <br />
              <span className="bg-gradient-to-r from-brand-200 to-white bg-clip-text text-transparent">
                nhận hoa hồng
              </span>{' '}
              nhiều tầng
            </h2>
            <ul className="mt-8 space-y-3 text-theme-sm">
              {[
                'Nhập SĐT người giới thiệu để trở thành F1 của họ',
                'Số điện thoại của bạn là mã giới thiệu của bạn',
                'Theo dõi cây giới thiệu F1 → F7 trong tài khoản',
              ].map((text) => (
                <li key={text} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-[10px] font-bold">
                    ✓
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-theme-xs text-white/60">
            © {new Date().getFullYear()} RealtyHub. Nền tảng công nghệ bất động sản.
          </p>
        </div>
      </div>
    </section>
  );
};

export default RegisterPage;
