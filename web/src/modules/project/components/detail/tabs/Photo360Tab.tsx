'use client';

import 'pannellum/build/pannellum.css';
import { useEffect, useRef, useState } from 'react';
import { FiMaximize, FiMinimize, FiRotateCw } from 'react-icons/fi';
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

/** Mot muc trong dai anh duoi: anh cau (Pannellum) hoac trang tham quan 360 (nhung) */
type Slide =
  | { kind: 'pano'; key: string; title: string; thumb?: string; panorama: Panorama }
  | { kind: 'tour'; key: string; title: string; thumb?: string; url: string };

const Photo360Tab = ({ project }: { project: ProjectDetail }) => {
  const [index, setIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Safari iPhone / iPad khong cho <div> vao toan man hinh: phu kin bang CSS
  const [isPseudoFs, setIsPseudoFs] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [failed, setFailed] = useState(false);

  const shellRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<PannellumViewer | null>(null);

  // Anh 360 cua du an + link tham quan 360 (tong the + tung phan khu)
  const slides: Slide[] = [
    ...project.panoramas.map((panorama) => ({
      kind: 'pano' as const,
      key: panorama.publicId,
      title: panorama.title,
      thumb: panorama.imageUrl || undefined,
      panorama,
    })),
    {
      kind: 'tour' as const,
      key: 'tour-tong-the',
      title: 'Tham quan 360° - Tổng thể',
      thumb: project.overviewImageUrl || project.hero[0]?.imageUrl,
      url: TOUR_360_URLS[0],
    },
    ...project.phases.map((phase, phaseIndex) => ({
      kind: 'tour' as const,
      key: `tour-${phase.publicId}`,
      title: `Tham quan 360° - ${phase.name}`,
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
      <h2 className="mb-5 hidden text-center text-2xl font-bold tracking-tight text-navy-800 sm:block sm:text-3xl">
        Toàn cảnh dự án
      </h2>

      {/* isolate: Pannellum dat z-index noi bo, khong duoc de len header dinh */}
      <div
        ref={shellRef}
        className={`photo360-shell relative isolate w-full overflow-hidden rounded-xl bg-navy-900 shadow-card ${
          isPseudoFs ? 'is-pseudo-fs' : 'h-[calc(100svh-10rem)] min-h-[22rem] sm:h-170'
        } ${isFullscreen ? 'rounded-none' : ''}`}
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

        {slide.kind === 'pano' && (
          <p className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-black/70 to-transparent px-4 pb-3 pt-10 text-center text-base font-medium text-white">
            {slide.title}
          </p>
        )}
      </div>

      <ul className="mt-4 flex gap-3 overflow-x-auto pb-2">
        {slides.map((item, itemIndex) => (
          <li key={item.key} className="w-32 shrink-0">
            <button
              type="button"
              onClick={() => setIndex(itemIndex)}
              aria-current={itemIndex === index}
              aria-label={`Xem ${item.title}`}
              className={`relative block h-20 w-32 overflow-hidden rounded-md border-2 transition ${
                itemIndex === index
                  ? 'border-accent-500'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <PlaceholderThumb seed={item.key} src={item.thumb} alt={item.title} />
              {item.kind === 'tour' && (
                <span className="absolute top-1 left-1 rounded bg-brand-600/90 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  360°
                </span>
              )}
            </button>
            <p className="mt-1 line-clamp-2 text-theme-xs leading-tight text-gray-600">{item.title}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Photo360Tab;
