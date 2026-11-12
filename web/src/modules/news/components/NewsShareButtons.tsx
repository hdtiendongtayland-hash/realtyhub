'use client';

import { useState } from 'react';
import { FaFacebookF } from 'react-icons/fa';
import { FiCheck, FiLink } from 'react-icons/fi';

/**
 * Nut chia se bai viet: Facebook va sao chep lien ket (de dan vao Zalo...). Lay URL hien tai
 * luc bam (khong can biet ten mien khi build).
 */
const NewsShareButtons = ({ title, tone = 'light' }: { title: string; /** 'dark': dat tren nen toi */ tone?: 'light' | 'dark' }) => {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Trinh duyet chan clipboard: bo qua, nguoi dung van copy tu thanh dia chi
    }
  };

  const openShare = (base: string) => {
    const url = encodeURIComponent(window.location.href);
    window.open(`${base}${url}`, '_blank', 'noopener,noreferrer,width=640,height=560');
  };

  const isDark = tone === 'dark';
  const buttonClass = `flex h-10 w-10 items-center justify-center rounded-full transition hover:-translate-y-0.5 ${
    isDark
      ? 'bg-white/10 text-white ring-1 ring-white/25 backdrop-blur hover:bg-white hover:text-brand-700'
      : 'border border-sky-100 bg-white text-gray-600 shadow-theme-xs hover:border-brand-300 hover:text-brand-600'
  }`;

  return (
    <div className={`flex items-center gap-2 ${isDark ? "w-fit rounded-full bg-navy-900/45 py-1 pr-1 pl-3.5 ring-1 ring-white/15 backdrop-blur-md" : ""}`}>
      <span className={`mr-1 text-theme-xs font-semibold ${isDark ? 'text-white/70' : 'text-gray-500'}`}>Chia sẻ</span>
      <button
        type="button"
        onClick={() => openShare('https://www.facebook.com/sharer/sharer.php?u=')}
        aria-label={`Chia sẻ "${title}" lên Facebook`}
        className={buttonClass}
      >
        <FaFacebookF aria-hidden className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={copyLink}
        aria-label="Sao chép liên kết bài viết"
        className={`${buttonClass} ${copied ? 'border-emerald-300 text-emerald-600' : ''}`}
      >
        {copied ? <FiCheck aria-hidden className="h-4 w-4" /> : <FiLink aria-hidden className="h-4 w-4" />}
      </button>
    </div>
  );
};

export default NewsShareButtons;
