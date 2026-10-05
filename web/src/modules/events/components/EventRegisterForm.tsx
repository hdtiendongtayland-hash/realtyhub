'use client';

import { useState, type FormEvent } from 'react';
import QRCode from 'qrcode';
import { FiCheckCircle, FiDownload } from 'react-icons/fi';
import { buildTicketPayload, createTicketId } from '../utils/event-extras';

/** Toi gian - chi nhung truong can de dang ky (serialize duoc tu server) */
export type RegisterableEvent = {
  slug: string;
  title: string;
  startAt: string;
  locationName: string;
};

type Ticket = { ticketId: string; name: string; qrDataUrl: string };

const PHONE_PATTERN = /^(0|\+84)\d{9,10}$/;

/** Luu vé tren may nguoi dung (ban demo) - de may quet QR check-in doc ma vé */
const saveTicket = (slug: string, ticket: Ticket) => {
  try {
    const key = 'rh-event-tickets';
    const current = JSON.parse(localStorage.getItem(key) ?? '{}') as Record<string, string>;
    current[ticket.ticketId] = slug;
    localStorage.setItem(key, JSON.stringify(current));
  } catch {
    /* localStorage bi chan - khong anh huong luong dang ky */
  }
};

/**
 * Form dang ky tham du nhung thang trong trang chi tiet su kien - KHONG mo popup.
 *
 * Gui form (ho ten, so dien thoai, email) -> cap ma ve + ma QR check-in. Nguoi
 * tham du dua ma QR nay cho ban to chuc quet bang nut "Quet QR check-in" tren
 * trang /su-kien.
 */
const EventRegisterForm = ({ event }: { event: RegisterableEvent }) => {
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [error, setError] = useState('');
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (submitEvent: FormEvent) => {
    submitEvent.preventDefault();
    if (form.name.trim().length < 2) return setError('Vui lòng nhập họ và tên.');
    if (!PHONE_PATTERN.test(form.phone.replace(/\s/g, ''))) {
      return setError('Số điện thoại chưa đúng (VD: 0901234567).');
    }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) return setError('Email chưa đúng định dạng.');

    setError('');
    setIsSubmitting(true);
    try {
      const ticketId = createTicketId();
      const qrDataUrl = await QRCode.toDataURL(buildTicketPayload(event.slug, ticketId), {
        width: 480,
        margin: 1,
        color: { dark: '#0b3a6b', light: '#ffffff' },
      });
      const next = { ticketId, name: form.name.trim(), qrDataUrl };
      saveTicket(event.slug, next);
      setTicket(next);
    } catch {
      setError('Không tạo được mã QR, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const input =
    'h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-theme-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-brand-400 focus:shadow-focus-ring';

  // ── Da dang ky: hien ve QR ────────────────────────────────────────────
  if (ticket) {
    return (
      <div className="rounded-2xl border border-success-200 bg-success-50/60 p-5 text-center">
        <p className="flex items-center justify-center gap-2 text-theme-sm font-semibold text-success-700">
          <FiCheckCircle aria-hidden className="h-5 w-5" />
          Đăng ký thành công, {ticket.name}!
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element -- anh QR dang data URL */}
        <img
          src={ticket.qrDataUrl}
          alt={`Mã QR check-in ${ticket.ticketId}`}
          className="mx-auto mt-4 h-44 w-44 rounded-xl border border-gray-200 bg-white p-2"
        />
        <p className="mt-3 text-theme-xs text-gray-500">Mã vé</p>
        <p className="text-xl font-bold tracking-widest text-brand-700">{ticket.ticketId}</p>
        <p className="mt-3 text-theme-xs leading-relaxed text-gray-500">
          Đưa mã QR này cho ban tổ chức quét khi đến sự kiện để check-in.
        </p>
        <a
          href={ticket.qrDataUrl}
          download={`ve-${ticket.ticketId}.png`}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 text-theme-sm font-semibold text-gray-700 transition hover:border-brand-300 hover:text-brand-600"
        >
          <FiDownload aria-hidden />
          Tải vé về máy
        </a>
      </div>
    );
  }

  // ── Chua dang ky: hien form inline ────────────────────────────────────
  return (
    <form onSubmit={submit} className="rounded-2xl border border-gray-200 bg-white p-5" noValidate>
      <p className="text-theme-xs font-semibold tracking-wide text-gray-500 uppercase">
        Đăng ký tham dự
      </p>

      <div className="mt-3 space-y-3">
        <label className="block">
          <span className="mb-1 block text-theme-xs font-semibold text-gray-600">Họ và tên *</span>
          <input
            className={input}
            value={form.name}
            onChange={(change) => setForm({ ...form, name: change.target.value })}
            placeholder="Nguyễn Văn A"
            autoComplete="name"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-theme-xs font-semibold text-gray-600">Số điện thoại *</span>
          <input
            className={input}
            value={form.phone}
            onChange={(change) => setForm({ ...form, phone: change.target.value })}
            placeholder="0901 234 567"
            inputMode="tel"
            autoComplete="tel"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-theme-xs font-semibold text-gray-600">Email</span>
          <input
            className={input}
            value={form.email}
            onChange={(change) => setForm({ ...form, email: change.target.value })}
            placeholder="email@vidu.com"
            inputMode="email"
            autoComplete="email"
          />
        </label>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-theme-xs font-medium text-error-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="brand-gradient mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full text-theme-sm font-semibold text-white shadow-md transition hover:brightness-110 disabled:opacity-60"
      >
        {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đăng ký'}
      </button>
    </form>
  );
};

export default EventRegisterForm;