"use client";

import React, { useRef, useState } from "react";
import {
  FiDollarSign,
  FiMessageSquare,
  FiSend,
  FiShield,
  FiZap,
} from "react-icons/fi";

/**
 * Cac cau hoi hay gap. Bam mot the la cau do duoc dien san vao o nhan tin de
 * nguoi dung sua tiep hoac gui luon - nhanh hon go lai tu dau.
 */
const QUICK_SUGGESTIONS = [
  { icon: FiDollarSign, text: "Chính sách bán hàng hiện tại" },
  { icon: FiZap, text: "Giá/m² và giá sau chiết khấu" },
  { icon: FiShield, text: "Pháp lý dự án" },
];

type UnitModalChatProps = {
  /** Lop ngoai - dung de chon hien o breakpoint nao */
  className?: string;
  /**
   * - "stacked" (mac dinh): o nhap tren, goi y duoi.
   * - "bar": o nhap va ba goi y cung mot hang.
   * - "input": chi rieng o nhap.
   * - "chips": chi rieng ba goi y.
   *
   * Bo cuc may tinh dat o nhap o day cot anh, con ba goi y o day cot thong tin
   * (hai cot khac nhau) nen can tach lam hai manh. Luc do cha giu chu dang go
   * va truyen xuong qua `value`/`onValueChange` de bam goi y van dien duoc vao
   * o nhap dang nam o cot ben kia.
   */
  variant?: "stacked" | "bar" | "input" | "chips";
  /** Chu dang go - truyen vao khi cha muon tu giu (hai manh dung chung) */
  value?: string;
  /** Bao cho cha khi chu thay doi */
  onValueChange?: (value: string) => void;
};

/**
 * O nhan tin voi admin + thanh goi y nhanh.
 *
 * Tu 1024px tro len khoi nay nam duoi ba the tu van vien o cot trai (nhan tin
 * va nguoi nhan tin dung canh nhau), con duoi 1024px no van o cuoi cot thong
 * tin nhu cu. Vi vay no duoc goi o hai cho, moi cho an/hien theo breakpoint.
 */
const UnitModalChat = ({
  className = "",
  variant = "stacked",
  value,
  onValueChange,
}: UnitModalChatProps) => {
  const [innerMessage, setInnerMessage] = useState("");
  // Cha co truyen `value` thi nghe theo cha, khong thi tu giu lay
  const chatMessage = value ?? innerMessage;
  const setChatMessage = (next: string) => {
    if (onValueChange) onValueChange(next);
    else setInnerMessage(next);
  };
  const chatInputRef = useRef<HTMLInputElement>(null);

  /**
   * Dien cau hoi vao o nhan tin roi dua con tro ve cuoi dong: nguoi dung thay
   * ngay minh sap gui gi va co the them y rieng truoc khi bam gui.
   */
  const handleSuggestion = (text: string) => {
    setChatMessage(text);
    const input = chatInputRef.current;
    if (!input) return;
    input.focus();
    // Doi React ve xong gia tri moi roi moi dat con tro, neu khong no nhay
    // ve dau dong.
    requestAnimationFrame(() =>
      input.setSelectionRange(text.length, text.length),
    );
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    console.log("Gửi tin nhắn:", chatMessage);
    setChatMessage("");
  };

  const inputBox = (
    <form
      onSubmit={handleSendMessage}
      className="flex min-w-0 flex-1 items-center gap-2 px-3 py-1.5"
    >
      <FiMessageSquare className="h-3.5 w-3.5 shrink-0 text-blue-500" />
      <input
        ref={chatInputRef}
        type="text"
        value={chatMessage}
        onChange={(e) => setChatMessage(e.target.value)}
        placeholder="Nhắn tin với Admin..."
        className="min-w-0 flex-1 bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
      />
      {/* Nut gui chi hien khi da go chu - luc trong o thi thanh nay gon het
          muc, dung nhu mockup */}
      {chatMessage.trim() && (
        <button
          type="submit"
          aria-label="Gửi"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700"
        >
          <FiSend className="h-3.5 w-3.5" />
        </button>
      )}
    </form>
  );

  if (variant === "input") {
    return (
      <div
        className={`flex items-stretch rounded-xl border border-slate-200 bg-white shadow-2xs ${className}`}
      >
        {inputBox}
      </div>
    );
  }

  if (variant === "chips") {
    // Vien tron roi nhau, nho hon o nhan tin nam tren - giong het iPad/dien
    // thoai. Truoc day day la mot thanh dai chia ba o bang be ngang khung,
    // trong nang ngang nhu chinh o nhan tin. Ba cai deu khong vua be ngang
    // cot nen cho cuon ngang, cai thu ba lo mot nua ra mep - do cung la dau
    // hieu con the phia sau.
    return (
      <div
        className={`no-scrollbar flex items-center gap-1.5 overflow-x-auto ${className}`}
      >
        {QUICK_SUGGESTIONS.map(({ icon: Icon, text }) => (
          <button
            key={text}
            type="button"
            onClick={() => handleSuggestion(text)}
            className="flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600 shadow-2xs transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <Icon className="h-2.5 w-2.5 shrink-0 text-blue-500" />
            {text}
          </button>
        ))}
      </div>
    );
  }

  if (variant === "bar") {
    return (
      <div
        className={`flex items-stretch divide-x divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-2xs ${className}`}
      >
        <form
          onSubmit={handleSendMessage}
          className="flex min-w-0 flex-[1.4] items-center gap-2 px-3 py-1.5"
        >
          <FiMessageSquare className="h-3.5 w-3.5 shrink-0 text-blue-500" />
          <input
            ref={chatInputRef}
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Nhắn tin với Admin..."
            className="min-w-0 flex-1 bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {/* Nut gui chi hien khi da go chu - luc trong o thi thanh nay gon
              het muc, dung nhu mockup */}
          {chatMessage.trim() && (
            <button
              type="submit"
              aria-label="Gửi"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700"
            >
              <FiSend className="h-3.5 w-3.5" />
            </button>
          )}
        </form>

        {QUICK_SUGGESTIONS.map(({ icon: Icon, text }) => (
          <button
            key={text}
            type="button"
            onClick={() => handleSuggestion(text)}
            className="flex min-w-0 flex-1 items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] font-medium text-slate-600 transition-colors hover:bg-blue-50/60 hover:text-blue-700"
          >
            <Icon className="h-3.5 w-3.5 shrink-0 text-blue-500" />
            <span className="truncate">{text}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`pt-1 space-y-2 xl:space-y-1.5 xl:pt-0 ${className}`}>
      <form onSubmit={handleSendMessage} className="relative flex items-center">
        <div className="absolute left-3 text-blue-500">
          <FiMessageSquare className="w-4 h-4" />
        </div>
        <input
          ref={chatInputRef}
          type="text"
          value={chatMessage}
          onChange={(e) => setChatMessage(e.target.value)}
          placeholder="Nhắn tin với Admin..."
          className="w-full bg-white border border-slate-200 rounded-full py-4 pl-9 pr-10 xl:py-2.5 text-sm min-[800px]:max-xl:text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
        />
        <button
          type="submit"
          className="absolute right-1 p-3 xl:p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors shadow-xs"
        >
          <FiSend className="w-5 h-5 xl:w-4 xl:h-4" />
        </button>
      </form>

      {/* Thanh gợi ý nhanh phía dưới */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {QUICK_SUGGESTIONS.map(({ icon: Icon, text }) => (
          <button
            key={text}
            type="button"
            onClick={() => handleSuggestion(text)}
            className="flex items-center gap-1 bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-200 px-3 py-1.5 rounded-full shrink-0 shadow-2xs text-slate-700 transition-colors xl:px-2.5 xl:py-1"
          >
            <Icon className="w-3.5 h-3.5 text-blue-500" />
            {text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default UnitModalChat;
