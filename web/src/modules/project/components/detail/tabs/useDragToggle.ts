import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";

/** Keo it hon nguong nay (px) thi van tinh la bam */
const DRAG_THRESHOLD = 3;

/**
 * Cong tac nhieu nac (VD Ma / Cham / Gia, 3D / 2D): ngoai bam tung nac con cho
 * an giu nut tron va keo qua lai. `dragPos` (0..1) la vi tri nut tron khi dang
 * keo, null khi khong keo; tha tay thi chon nac gan nhat.
 */
export const useDragToggle = (count: number, onPick: (index: number) => void) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragPos, setDragPos] = useState<number | null>(null);
  const dragRef = useRef({ pointerId: -1, startX: 0, moved: false, pos: 0, suppressClick: false });

  // iPad / iPhone: Safari khong tin hoan toan touch-action, ngon tay keo tren
  // cong tac van lam cuon trang (ngoai che do toan man hinh) -> chan cuon tai day
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    const onTouchMove = (event: TouchEvent) => {
      if (event.cancelable) event.preventDefault();
    };
    track.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => track.removeEventListener("touchmove", onTouchMove);
  }, []);

  const posAt = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return 0;
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  };

  const finish = (event: PointerEvent<HTMLDivElement>, commit: boolean) => {
    const drag = dragRef.current;
    if (drag.pointerId !== event.pointerId) return;
    drag.pointerId = -1;
    if (!drag.moved) return;
    // Click sinh ra ngay sau khi tha tay khong duoc chon lai nac duoi ngon tay
    drag.suppressClick = true;
    window.setTimeout(() => (drag.suppressClick = false), 0);
    setDragPos(null);
    if (commit) onPick(Math.round(drag.pos * (count - 1)));
  };

  const handlers = {
    onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;
      event.stopPropagation();
      dragRef.current = { ...dragRef.current, pointerId: event.pointerId, startX: event.clientX, moved: false };
    },
    onPointerMove: (event: PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (drag.pointerId !== event.pointerId) return;
      if (!drag.moved) {
        if (Math.abs(event.clientX - drag.startX) < DRAG_THRESHOLD) return;
        drag.moved = true;
        event.currentTarget.setPointerCapture(event.pointerId);
      }
      drag.pos = posAt(event.clientX);
      setDragPos(drag.pos);
    },
    onPointerUp: (event: PointerEvent<HTMLDivElement>) => finish(event, true),
    onPointerCancel: (event: PointerEvent<HTMLDivElement>) => finish(event, false),
    onClickCapture: (event: MouseEvent<HTMLDivElement>) => {
      if (!dragRef.current.suppressClick) return;
      event.preventDefault();
      event.stopPropagation();
    },
  };

  return { trackRef, dragPos, handlers };
};
