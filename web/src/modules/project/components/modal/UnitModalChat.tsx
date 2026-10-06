"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  FiCheckCircle,
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

/**
 * Cho mot hang cuon ngang (an thanh cuon) keo duoc bang CHUOT tren may tinh:
 * - Lan chuot doc -> cuon ngang. Da cham mep thi tra lai cho trang cuon doc.
 * - Nhan giu va keo. Keo qua 4px thi coi la keo, cu bam nha ra sau do khong
 *   tinh la bam goi y (khong dien nham cau vao o nhan tin).
 * Cam ung / trackpad van cuon ngang tu nhien nhu cu.
 */
const useMouseHorizontalScroll = (enabled: boolean) => {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ pointerId: -1, startX: 0, startLeft: 0, moved: false });

  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;

    const onWheel = (event: WheelEvent) => {
      // Trackpad vuot ngang da tu cuon - chi doi lan chuot doc
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      const atStart = el.scrollLeft <= 0 && event.deltaY < 0;
      const atEnd = el.scrollLeft >= max - 1 && event.deltaY > 0;
      if (atStart || atEnd) return;
      event.preventDefault();
      el.scrollLeft += event.deltaY;
    };

    // passive: false thi moi preventDefault duoc (React onWheel luon passive)
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [enabled]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0 || !ref.current) return;
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startLeft: ref.current.scrollLeft,
      moved: false,
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    const el = ref.current;
    if (state.pointerId !== event.pointerId || !el) return;
    const dx = event.clientX - state.startX;
    if (!state.moved && Math.abs(dx) > 4) {
      state.moved = true;
      // Giu con tro ke ca khi chuot ra ngoai hang
      el.setPointerCapture(event.pointerId);
    }
    if (state.moved) el.scrollLeft = state.startLeft - dx;
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current.pointerId !== event.pointerId) return;
    drag.current.pointerId = -1;
    if (ref.current?.hasPointerCapture(event.pointerId)) {
      ref.current.releasePointerCapture(event.pointerId);
    }
  };

  // Vua keo xong thi nuot cu click di kem
  const onClickCapture = (event: React.MouseEvent) => {
    if (!drag.current.moved) return;
    drag.current.moved = false;
    event.preventDefault();
    event.stopPropagation();
  };

  return {
    ref,
    onPointerDown,
    onPointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
    onClickCapture,
  };
};

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
  /**
   * O do chu that su nam (the input). Bo cuc may tinh tach o nhap va ba goi y
   * thanh hai manh o hai cho khac nhau, nen manh "chips" khong co input cua
   * rieng no - phai muon ref cua manh "input" thi bam goi y moi dua duoc con
   * tro ve cuoi dong o ben kia.
   */
  inputRef?: React.RefObject<HTMLInputElement | null>;
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
  inputRef,
}: UnitModalChatProps) => {
  const [innerMessage, setInnerMessage] = useState("");
  // Cha co truyen `value` thi nghe theo cha, khong thi tu giu lay
  const chatMessage = value ?? innerMessage;
  const setChatMessage = (next: string) => {
    if (onValueChange) onValueChange(next);
    else setInnerMessage(next);
  };
  const innerInputRef = useRef<HTMLInputElement>(null);
  // Cha co dua ref thi dung chung voi cha, khong thi tu giu lay
  const chatInputRef = inputRef ?? innerInputRef;
  const chipsScroll = useMouseHorizontalScroll(variant === "chips");

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
    // ve dau dong. Phai doi HAI khung hinh: khung dau React moi commit gia
    // tri, sang khung sau trinh duyet mao do lai be ngang chu - dat con tro
    // ngay khung dau thi o van dang cuon o dau cau va nguoi dung chi thay
    // doan dau, khong thay cho minh sap go tiep.
    const moveCaretToEnd = () => {
      input.setSelectionRange(text.length, text.length);
      // Cuon han sang phai: cau goi y dai hon o nhap nen phai keo den cuoi
      // moi thay con tro. Tu setSelectionRange khong phai luc nao cung cuon.
      input.scrollLeft = input.scrollWidth;
    };
    requestAnimationFrame(() => requestAnimationFrame(moveCaretToEnd));
  };

  // Thong bao nho sau khi bam gui (tu an sau 2,5s)
  const [notice, setNotice] = useState<{ text: string; ok: boolean } | null>(null);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 2500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) {
      setNotice({ text: "Vui lòng nhập nội dung tin nhắn", ok: false });
      chatInputRef.current?.focus();
      return;
    }
    console.log("Gửi tin nhắn:", chatMessage);
    setChatMessage("");
    setNotice({ text: "Đã gửi tin nhắn cho Admin", ok: true });
  };

  // Gan vao body de khong bi khung popup (overflow / transform) cat mat
  const toast =
    notice && typeof document !== "undefined"
      ? createPortal(
          <div
            role="status"
            aria-live="polite"
            className="pointer-events-none fixed inset-x-0 top-6 z-[1000] flex justify-center px-4"
          >
            <div
              className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-lg ${
                notice.ok ? "bg-success-600" : "bg-gray-800"
              }`}
            >
              <FiCheckCircle aria-hidden className={notice.ok ? "h-4 w-4" : "hidden"} />
              {notice.text}
            </div>
          </div>,
          document.body,
        )
      : null;

  const inputBox = (
    <form
      onSubmit={handleSendMessage}
      className="flex h-[46px] min-w-0 flex-1 items-center gap-2 px-3"
    >
      <FiMessageSquare className="h-4 w-4 shrink-0 text-blue-500" />
      <input
        ref={chatInputRef}
        type="text"
        value={chatMessage}
        onChange={(e) => setChatMessage(e.target.value)}
        placeholder="Nhắn tin với Admin..."
        className="min-w-0 flex-1 bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
      />
      {/* Nut gui LUON hien. Chua go chu thi van bam duoc nhung khong gui gi
          (handleSendMessage bo qua tin nhan rong) - de nguyen mau sac thay vi
          lam mo di, nhu vay o chat nhin luc nao cung day du. */}
      <button
        type="submit"
        aria-label="Gửi"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700"
      >
        <FiSend className="h-3.5 w-3.5" />
      </button>
    </form>
  );

  if (variant === "input") {
    return (
      <div
        className={`flex items-stretch rounded-xl border border-slate-200 bg-white shadow-2xs ${className}`}
      >
        {inputBox}
        {toast}
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
        {...chipsScroll}
        className={`no-scrollbar flex cursor-grab items-center gap-1.5 overflow-x-auto select-none active:cursor-grabbing ${className}`}
      >
        {QUICK_SUGGESTIONS.map(({ icon: Icon, text }) => (
          <button
            key={text}
            type="button"
            onClick={() => handleSuggestion(text)}
            className="flex h-[26px] shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-1.5 text-[9px] font-medium text-slate-600 shadow-2xs transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <Icon className="h-2 w-2 shrink-0 text-blue-500" />
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
        {toast}
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
      {toast}

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
