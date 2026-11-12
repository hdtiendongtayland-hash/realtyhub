'use client';

import 'pannellum/build/pannellum.css';
import { useEffect, useRef, useState } from 'react';
import { FiCheck, FiChevronDown, FiMaximize, FiMinimize, FiRotateCw } from 'react-icons/fi';
import PlaceholderThumb from '@/common/components/PlaceholderThumb';
import type { Panorama, ProjectDetail } from '../../../models/project-detail.model';
import { TabEmptyState } from '../shared';
import { TOUR_360_URLS } from './tour360';

/**
 * Pannellum khong co kieu TypeScript di kem va gan minh vao `window`, nen khai
 * bao dung phan API dang dung. Chi 55 KB JS + 9 KB CSS, khong keo theo three.js.
 */
type PannellumViewer = {
  destroy: () => void;
  setYaw: (yaw: number) => void;
  getYaw: () => number;
  resize?: () => void;
};

type PannellumGlobal = {
  viewer: (el: HTMLElement, config: Record<string, unknown>) => PannellumViewer;
};

/**
 * Doi toa do chu thich tu he cua model (x, y tinh theo % khung anh) sang he cua
 * anh cau ma Pannellum dung (yaw: -180..180 do quanh truc dung, pitch: -90..90
 * do tu duoi len). Giu nguyen hop dong du lieu, khong bat backend doi theo.
 */
const toSphere = (hotspot: Panorama['hotspots'][number]) => ({
  yaw: (hotspot.x / 100) * 360 - 180,
  pitch: 90 - (hotspot.y / 100) * 180,
});

/**
 * Mot muc trong dai anh: anh cau (Pannellum) hoac trang tham quan 360 (nhung).
 * `label` la ten ngan hien tren the anh (the da co nhan "360°").
 */
type Slide =
  | { kind: 'pano'; key: string; title: string; label: string; thumb?: string; panorama: Panorama }
  | { kind: 'tour'; key: string; title: string; label: string; thumb?: string; url: string };

const Photo360Tab = ({ project }: { project: ProjectDetail }) => {
  const [index, setIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Safari iPhone / iPad khong cho <div> vao toan man hinh: phu kin bang CSS
  const [isPseudoFs, setIsPseudoFs] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [failed, setFailed] = useState(false);
  // Nut "v" o day khung: an / hien dai anh con de xem tron anh 360
  const [isStripOpen, setIsStripOpen] = useState(true);

  const shellRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<PannellumViewer | null>(null);

  // Anh 360 cua du an + link tham quan 360 (tong the + tung phan khu)
  const slides: Slide[] = [
    ...project.panoramas.map((panorama) => ({
      kind: 'pano' as const,
      key: panorama.publicId,
      title: panorama.title,
      label: panorama.title,
      thumb: panorama.imageUrl || undefined,
      panorama,
    })),
    {
      kind: 'tour' as const,
      key: 'tour-tong-the',
      title: 'Tham quan 360° - Tổng thể',
      label: 'Tổng thể',
      thumb: project.overviewImageUrl || project.hero[0]?.imageUrl,
      url: TOUR_360_URLS[0],
    },
    ...project.phases.map((phase, phaseIndex) => ({
      kind: 'tour' as const,
      key: `tour-${phase.publicId}`,
      title: `Tham quan 360° - ${phase.name}`,
      label: phase.name,
      thumb: phase.imageUrl,
      url: TOUR_360_URLS[(phaseIndex + 1) % TOUR_360_URLS.length],
    })),
  ];

  const total = slides.length;
  const slide = slides[Math.min(index, Math.max(0, total - 1))];
  const panorama = slide?.kind === 'pano' ? slide.panorama : undefined;

  useEffect(() => {
    if (!panorama?.imageUrl) return;

    let cancelled = false;

    // Pannellum doc `window` ngay khi nap nen phai import dong trong effect,
    // giong cach Leaflet duoc nap o tab Mat bang.
    void (async () => {
      await import('pannellum/build/pannellum.js');
      const host = hostRef.current;
      const lib = (window as unknown as { pannellum?: PannellumGlobal }).pannellum;
      if (cancelled || !host || !lib) {
        if (!cancelled) setFailed(true);
        return;
      }

      viewerRef.current = lib.viewer(host, {
        type: 'equirectangular',
        panorama: panorama.imageUrl,
        autoLoad: true,
        showControls: false,
        // Cho keo qua mep tren/duoi mot chut de nguoi xem khong thay bi chan
        minPitch: -85,
        maxPitch: 85,
        hfov: 100,
        minHfov: 50,
        maxHfov: 120,
        friction: 0.15,
        hotSpots: panorama.hotspots.map((hotspot) => ({
          ...toSphere(hotspot),
          type: 'info',
          text: hotspot.label,
          cssClass: 'pano-hotspot',
        })),
      });

      setIsSpinning(false);
    })();

    return () => {
      cancelled = true;
      viewerRef.current?.destroy();
      viewerRef.current = null;
    };
  }, [panorama?.imageUrl, panorama?.hotspots]);

  // Tu xoay: nhich yaw tung chut moi khung hinh cho toi khi nguoi dung tat
  useEffect(() => {
    if (!isSpinning) return;

    let raf = 0;
    const tick = () => {
      const viewer = viewerRef.current;
      if (viewer) viewer.setYaw(viewer.getYaw() + 0.12);
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [isSpinning]);

  // Toan man hinh cua CA khung (anh + nut cua minh) - nut thoat luon thay duoc
  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(document.fullscreenElement === shellRef.current);
      window.setTimeout(() => viewerRef.current?.resize?.(), 120);
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // Toan man hinh gia: khoa cuon trang, Esc de thoat
  useEffect(() => {
    if (!isPseudoFs) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsPseudoFs(false);
    };
    document.addEventListener('keydown', onKeyDown);
    window.setTimeout(() => viewerRef.current?.resize?.(), 120);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKeyDown);
      window.setTimeout(() => viewerRef.current?.resize?.(), 120);
    };
  }, [isPseudoFs]);

  // Dien thoai: dang xem khung 360 thi an nut chat / Zalo / len dau (cung co che ban do)
  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => document.body.classList.toggle("map-in-view", entry.isIntersecting),
      { threshold: 0.35 },
    );
    observer.observe(shell);
    return () => {
      observer.disconnect();
      document.body.classList.remove("map-in-view");
    };
  }, []);

  const isExpanded = isFullscreen || isPseudoFs;

  const toggleFullscreen = () => {
    if (isPseudoFs) {
      setIsPseudoFs(false);
      return;
    }
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
      return;
    }
    const shell = shellRef.current;
    if (document.fullscreenEnabled && typeof shell?.requestFullscreen === 'function') {
      void shell.requestFullscreen().catch(() => {});
      return;
    }
    setIsPseudoFs(true);
  };

  if (total === 0) {
    return <TabEmptyState message="Dự án chưa có ảnh 360°." />;
  }

  return (
    <div>
      {/* isolate: Pannellum dat z-index noi bo, khong duoc de len header dinh */}
      <div
        ref={shellRef}
        // Cung kich co khung ban do tab Vi tri quy can tren moi thiet bi:
        // dien thoai, may tinh bang (doc / ngang, cam ung chua cho thanh tab),
        // may tinh (theo ti le man hinh 56vw). box-content: vien cong ra ngoai
        // giong khung ban do (vien boc ngoai o ban do)
        className={`photo360-shell relative isolate overflow-hidden rounded-lg border border-gray-200 bg-navy-900 shadow-card ${
          isPseudoFs
            ? 'is-pseudo-fs'
            : 'box-content min-h-[20rem] max-sm:h-[calc(100svh-10rem)] sm:h-[min(calc(100svh-9.25rem),105vw)] sm:min-h-[32rem] lg:h-[min(calc(100svh-10rem),56vw)] lg:portrait:h-[min(calc(100svh-9.25rem),90vw)] lg:min-h-[26rem] sm:pointer-coarse:h-[min(calc(100svh-12.5rem),105vw)] lg:pointer-coarse:h-[min(calc(100svh-12.5rem),56vw)] lg:portrait:pointer-coarse:h-[min(calc(100svh-12.5rem),90vw)]'
        } ${isFullscreen ? 'rounded-none border-0' : ''}`}
      >
        {slide.kind === 'tour' ? (
          <iframe
            key={slide.url}
            src={slide.url}
            title={slide.title}
            allow="fullscreen; gyroscope; accelerometer; xr-spatial-tracking"
            allowFullScreen
            className="h-full w-full border-0"
          />
        ) : failed || !panorama?.imageUrl ? (
          <PlaceholderThumb seed={slide.key} label={slide.title} />
        ) : (
          <div ref={hostRef} className="h-full w-full" />
        )}

        <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex items-start justify-between px-3">
          <span className="rounded bg-black/60 px-2 py-1 text-theme-sm font-medium text-white">
            {index + 1}/{total}
          </span>

          <span className="flex gap-2">
            {slide.kind === 'pano' && (
              <button
                type="button"
                onClick={() => setIsSpinning((on) => !on)}
                aria-pressed={isSpinning}
                aria-label={isSpinning ? 'Dừng tự xoay' : 'Tự xoay'}
                className={`pointer-events-auto flex h-9 w-9 items-center justify-center rounded text-white transition ${
                  isSpinning ? 'bg-brand-500' : 'bg-black/60 hover:bg-black/80'
                }`}
              >
                <FiRotateCw aria-hidden />
              </button>
            )}

            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isExpanded ? 'Thoát toàn màn hình' : 'Xem toàn màn hình'}
              className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded bg-black/60 text-white transition hover:bg-black/80"
            >
              {isExpanded ? <FiMinimize aria-hidden /> : <FiMaximize aria-hidden />}
            </button>

          </span>
        </div>

        {/* ── Day khung: dai anh con nam trong anh 360 (giong dai phan khu o
            tab Vi tri quy can), nut "v" an / hien ── */}
        {total > 1 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center">
            <button
              type="button"
              onClick={() => setIsStripOpen((open) => !open)}
              aria-expanded={isStripOpen}
              aria-label={isStripOpen ? 'Ẩn danh sách ảnh 360°' : 'Hiện danh sách ảnh 360°'}
              title={isStripOpen ? 'Ẩn danh sách ảnh 360°' : 'Hiện danh sách ảnh 360°'}
              className="pointer-events-auto flex h-7 items-center gap-1 rounded-t-xl bg-navy-900/70 px-3 text-[11px] font-semibold text-white backdrop-blur transition hover:bg-navy-900/85"
            >
              <FiChevronDown aria-hidden className={`h-4 w-4 transition-transform ${isStripOpen ? '' : 'rotate-180'}`} />
              Ảnh 360°
            </button>
            {isStripOpen && (
              <div className="pointer-events-auto w-full bg-gradient-to-t from-navy-900/80 via-navy-900/55 to-navy-900/20 px-2 pt-1.5 pb-2 backdrop-blur-[2px] sm:px-3 sm:pt-2 sm:pb-2.5">
                <div className="no-scrollbar mx-auto flex w-fit max-w-full gap-1.5 overflow-x-auto p-1 sm:gap-2.5">
                  {slides.map((item, itemIndex) => {
                    const isActive = itemIndex === index;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setIndex(itemIndex)}
                        aria-pressed={isActive}
                        aria-label={`Xem ${item.title}`}
                        className={`group relative aspect-[16/10] w-24 shrink-0 overflow-hidden rounded-lg text-left shadow-card transition sm:w-36 sm:rounded-xl lg:w-32 ${
                          isActive ? 'ring-2 ring-sky-400' : 'ring-1 ring-white/40 hover:ring-white'
                        }`}
                      >
                        <PlaceholderThumb
                          seed={item.key}
                          src={item.thumb}
                          alt=""
                          className="transition duration-500 group-hover:scale-105"
                        />
                        <span aria-hidden className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/75 to-transparent" />
                        <span className="absolute inset-x-0 bottom-0 line-clamp-2 px-1 pb-1 text-center text-[10px] leading-tight font-bold text-white sm:px-1.5 sm:pb-1.5 sm:text-theme-sm sm:leading-tight">
                          {item.label}
                        </span>
                        {item.kind === 'tour' && (
                          <span className="absolute top-1.5 left-1.5 rounded bg-brand-600/90 px-1.5 py-0.5 text-[10px] font-bold text-white">
                            360°
                          </span>
                        )}
                        {isActive && (
                          <span className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-sky-400 text-white shadow">
                            <FiCheck aria-hidden className="h-3 w-3" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Photo360Tab;
