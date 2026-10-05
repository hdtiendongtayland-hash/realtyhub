'use client';

import { useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiCheckCircle, FiEye, FiEyeOff, FiGift, FiLock, FiMail, FiPhone, FiUser } from 'react-icons/fi';

import { type CurrentUser } from '@/common/auth/userStore';

const STORAGE_KEY = 'user';
/** Ma gioi thieu da nhap luc dang ky - backend se gan nguoi nay vao cay cua nguoi gioi thieu */
const REFERRER_KEY = 'rh-referrer';

/** Ma gioi thieu = so dien thoai cua nguoi gioi thieu (10 so, bat dau bang 0) */
const isPhone = (value: string) => /^0\d{9}$/.test(value);

const field =
  'w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-theme-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100';

const iconClass = 'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400';

/**
 * Form dang ky mock: ho ten, SDT, email, mat khau + ma gioi thieu (SDT nguoi
 * gioi thieu). Mo tu link gioi thieu (/dang-ky?ref=09...) thi o ma tu dien san.
 *
 * Khi noi backend: doi submit thanh POST /auth/register { ..., referralCode }.
 */
const RegisterForm = ({ initialReferral = '' }: { initialReferral?: string }) => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [referral, setReferral] = useState(initialReferral.replace(/\D/g, ''));
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const referralValid = isPhone(referral);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const trimmedEmail = email.trim();
    if (name.trim().length < 2) return setError('Vui lòng nhập họ tên.');
    if (!isPhone(phone)) return setError('Số điện thoại phải gồm 10 số, bắt đầu bằng 0.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) return setError('Email không hợp lệ.');
    if (password.length < 6) return setError('Mật khẩu phải có ít nhất 6 ký tự.');
    if (referral && !referralValid) return setError('Mã giới thiệu là số điện thoại 10 số của người giới thiệu.');
    if (referral && referral === phone) return setError('Không thể dùng số điện thoại của chính bạn làm mã giới thiệu.');

    setPending(true);
    const user: CurrentUser = { name: name.trim(), email: trimmedEmail, role: 'USER' };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    if (referral) window.localStorage.setItem(REFERRER_KEY, referral);
    else window.localStorage.removeItem(REFERRER_KEY);
    window.dispatchEvent(new Event('user:change'));
    router.push('/');
    router.refresh();
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="register-name" className="mb-1.5 block text-theme-xs font-semibold text-gray-700">
            Họ và tên
          </label>
          <div className="relative">
            <FiUser aria-hidden className={iconClass} />
            <input
              id="register-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              autoComplete="name"
              required
              className={field}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="register-phone" className="mb-1.5 block text-theme-xs font-semibold text-gray-700">
              Số điện thoại
            </label>
            <div className="relative">
              <FiPhone aria-hidden className={iconClass} />
              <input
                id="register-phone"
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="09xx xxx xxx"
                autoComplete="tel"
                required
                className={field}
              />
            </div>
          </div>
          <div>
            <label htmlFor="register-email" className="mb-1.5 block text-theme-xs font-semibold text-gray-700">
              Email
            </label>
            <div className="relative">
              <FiMail aria-hidden className={iconClass} />
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ban@example.com"
                autoComplete="email"
                required
                className={field}
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="register-password" className="mb-1.5 block text-theme-xs font-semibold text-gray-700">
            Mật khẩu
          </label>
          <div className="relative">
            <FiLock aria-hidden className={iconClass} />
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ít nhất 6 ký tự"
              autoComplete="new-password"
              required
              className={`${field} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              {showPassword ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
            </button>
          </div>
        </div>

        {/* Ma gioi thieu */}
        <div className="rounded-xl border border-dashed border-accent-400 bg-accent-50/40 p-3">
          <label htmlFor="register-referral" className="mb-1.5 flex items-center gap-1.5 text-theme-xs font-semibold text-gray-700">
            <FiGift aria-hidden className="text-accent-500" />
            Mã giới thiệu <span className="font-normal text-gray-400">(SĐT người giới thiệu – không bắt buộc)</span>
          </label>
          <div className="relative">
            <FiPhone aria-hidden className={iconClass} />
            <input
              id="register-referral"
              type="tel"
              inputMode="numeric"
              value={referral}
              onChange={(e) => setReferral(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="VD: 0912345678"
              className={`${field} pr-10 font-semibold tracking-wider`}
            />
            {referralValid && (
              <FiCheckCircle aria-hidden className="absolute right-3 top-1/2 -translate-y-1/2 text-success-500" />
            )}
          </div>
          <p className="mt-1.5 text-[11px] text-gray-500">
            {referralValid
              ? 'Bạn sẽ trở thành F1 của người giới thiệu sau khi đăng ký.'
              : 'Nhập số điện thoại của người đã giới thiệu bạn tham gia RealtyHub.'}
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-error-500/30 bg-error-50 px-3 py-2 text-theme-xs font-medium text-error-600"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-theme-sm font-semibold text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? 'Đang tạo tài khoản...' : 'Đăng ký'}
        </button>
      </form>

      <p className="mt-5 text-center text-theme-xs text-gray-500">
        Đã có tài khoản?{' '}
        <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
};

export default RegisterForm;
