'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import jsQR from 'jsqr';
import { FiAlertCircle, FiCamera, FiCheckCircle, FiImage, FiRefreshCw, FiX } from 'react-icons/fi';
import { TbScan } from 'react-icons/tb';
import { parseTicketPayload } from '../utils/event-extras';

type ScanResult =
  | { kind: 'ok'; ticketId: string; eventTitle: string }
  | { kind: 'invalid'; raw: string };

/**
 * Nut "Quet QR check-in" (goc phai trang Su kien) - giong may quet QR cua
 * Zalo: mo camera sau, khung vuong o giua, tu nhan ma QR tren ve dang ky.
 *
 * Doc QR bang jsQR tren tung khung hinh (chay duoc ca Chrome Windows, noi
 * khong co BarcodeDetector). Khong co camera / bi tu choi quyen thi van chon
 * anh QR tu may hoac go ma ve.
 */
const EventQrScanner = ({ events }: { events: { slug: string; title: string }[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [manualCode, setManualCode] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | undefined>(undefined);

  const resolve = useCallback(
    (raw: string): ScanResult => {
      const ticket = parseTicketPayload(raw);
      const event = ticket && events.find((item) => item.slug === ticket.slug);
      return ticket && event
        ? { kind: 'ok', ticketId: ticket.ticketId, eventTitle: event.title }
        : { kind: 'invalid', raw };
    },
    [events],
  );

  const stopCamera = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = undefined;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  /** Doc QR tu mot nguon hinh (khung video hoac anh tai len) */
  const decode = (source: CanvasImageSource, width: number, height: number) => {
    const canvas = (canvasRef.current ??= document.createElement('canvas'));
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return null;
    context.drawImage(source, 0, 0, width, height);
    const image = context.getImageData(0, 0, width, height);
    return jsQR(image.data, width, height, { inversionAttempts: 'dontInvert' })?.data ?? null;
  };

  const startCamera = useCallback(async () => {
    setCameraError('');
    setResult(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Trình duyệt không hỗ trợ camera. Hãy chọn ảnh QR hoặc nhập mã vé.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();

      const tick = () => {
        if (!streamRef.current) return;
        if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth) {
          // Thu nho khung hinh truoc khi doc - nhanh hon, du ro cho QR
          const scale = Math.min(1, 640 / video.videoWidth);
          const raw = decode(video, Math.round(video.videoWidth * scale), Math.round(video.videoHeight * scale));
          if (raw) {
            setResult(resolve(raw));
            stopCamera();
            return;
          }
        }
        frameRef.current = requestAnimationFrame(tick);
      };
      frameRef.current = requestAnimationFrame(tick);
    } catch (error) {
      const name = (error as DOMException)?.name;
      setCameraError(
        name === 'NotAllowedError'
          ? 'Bạn đã chặn quyền camera. Hãy cho phép camera trên trình duyệt, hoặc chọn ảnh QR / nhập mã vé.'
          : 'Không mở được camera. Hãy chọn ảnh QR hoặc nhập mã vé.',
      );
    }
  }, [resolve, stopCamera]);

  // Mo popup -> bat camera; dong -> tat camera
  useEffect(() => {
    if (!isOpen) return undefined;
    // Bat camera o khung hinh ke tiep (sau khi popup + the <video> da ve)
    const startFrame = requestAnimationFrame(() => void startCamera());
    const onKeyDown = (keyEvent: KeyboardEvent) => {
      if (keyEvent.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(startFrame);
      stopCamera();
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, startCamera, stopCamera]);

  const onPickImage = (file: File | undefined) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, 1200 / image.naturalWidth);
      const raw = decode(image, Math.round(image.naturalWidth * scale), Math.round(image.naturalHeight * scale));
      URL.revokeObjectURL(url);
      stopCamera();
      setResult(raw ? resolve(raw) : { kind: 'invalid', raw: '' });
    };
    image.src = url;
  };

  const onManualSubmit = (submitEvent: FormEvent) => {
    submitEvent.preventDefault();
    const code = manualCode.trim().toUpperCase();
    if (!code) return;
    stopCamera();
    // Go ma ve tay: tim ve da dang ky tren may nay (ban demo)
    let slug: string | undefined;
    try {
      slug = (JSON.parse(localStorage.getItem('rh-event-tickets') ?? '{}') as Record<string, string>)[code];
    } catch {
      slug = undefined;
    }
    const event = slug && events.find((item) => item.slug === slug);
    setResult(event ? { kind: 'ok', ticketId: code, eventTitle: event.title } : { kind: 'invalid', raw: code });
  };

  const scanAgain = () => {
    setManualCode('');
    void startCamera();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setResult(null);
          setCameraError('');
          setManualCode('');
          setIsOpen(true);
        }}
        title="Quét mã QR check-in"
        className="inline-flex h-11 items-center gap-2 rounded-full border border-brand-200 bg-white px-4 text-theme-sm font-semibold text-brand-600 shadow-sm transition hover:border-brand-400 hover:bg-brand-50"
      >
        <TbScan aria-hidden className="h-5 w-5" />
        <span className="max-sm:sr-only">Quét QR check-in</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Quét mã QR check-in"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm max-sm:p-0"
        >
          <div className="relative flex w-full max-w-md flex-col overflow-hidden rounded-2xl bg-gray-950 text-white shadow-2xl max-sm:h-full max-sm:max-w-none max-sm:rounded-none">
            <div className="flex items-center justify-between px-4 py-3">
              <p className="flex items-center gap-2 font-semibold">
                <TbScan aria-hidden className="h-5 w-5 text-brand-300" />
                Quét QR check-in
              </p>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Đóng"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
              >
                <FiX aria-hidden />
              </button>
            </div>

            {/* Khung camera: video + mat na toi, o vuong sang o giua + vach quet */}
            <div className="relative aspect-square w-full bg-black max-sm:flex-1">
              <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />

              {!result && !cameraError && (
                <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="relative h-3/5 w-3/5 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">
                    {['top-0 left-0 border-t-4 border-l-4 rounded-tl-2xl', 'top-0 right-0 border-t-4 border-r-4 rounded-tr-2xl', 'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-2xl', 'bottom-0 right-0 border-b-4 border-r-4 rounded-br-2xl'].map((corner) => (
                      <span key={corner} className={`absolute h-8 w-8 border-brand-300 ${corner}`} />
                    ))}
                    <span className="animate-qr-scan absolute inset-x-3 h-0.5 rounded-full bg-brand-300 shadow-[0_0_12px_2px_rgba(111,176,251,0.8)]" />
                  </div>
                  <p className="absolute bottom-4 text-theme-xs text-white/80">
                    Đưa mã QR trên vé vào trong khung
                  </p>
                </div>
              )}

              {cameraError && !result && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                  <FiCamera aria-hidden className="h-10 w-10 text-white/50" />
                  <p className="text-theme-sm text-white/80">{cameraError}</p>
                  <button
                    type="button"
                    onClick={scanAgain}
                    className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-theme-sm font-semibold transition hover:bg-white/20"
                  >
                    <FiRefreshCw aria-hidden />
                    Thử lại camera
                  </button>
                </div>
              )}

              {result && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-950/95 p-6 text-center">
                  {result.kind === 'ok' ? (
                    <>
                      <FiCheckCircle aria-hidden className="h-14 w-14 text-success-500" />
                      <p className="text-lg font-bold">Check-in thành công</p>
                      <p className="text-theme-sm text-white/80">{result.eventTitle}</p>
                      <p className="rounded-full bg-white/10 px-4 py-1.5 font-mono text-theme-sm tracking-widest">
                        {result.ticketId}
                      </p>
                    </>
                  ) : (
                    <>
                      <FiAlertCircle aria-hidden className="h-14 w-14 text-error-500" />
                      <p className="text-lg font-bold">Mã không hợp lệ</p>
                      <p className="text-theme-sm text-white/70">
                        Đây không phải vé sự kiện RealtyHub, hoặc mã vé không tồn tại.
                      </p>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={scanAgain}
                    className="brand-gradient mt-2 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-theme-sm font-semibold"
                  >
                    <TbScan aria-hidden />
                    Quét mã khác
                  </button>
                </div>
              )}
            </div>

            {/* Du phong: chon anh QR / go ma ve */}
            <div className="space-y-3 p-4">
              <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 text-theme-sm font-semibold transition hover:bg-white/10">
                <FiImage aria-hidden />
                Chọn ảnh mã QR từ máy
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(change) => onPickImage(change.target.files?.[0])}
                />
              </label>
              <form onSubmit={onManualSubmit} className="flex gap-2">
                <input
                  value={manualCode}
                  onChange={(change) => setManualCode(change.target.value)}
                  placeholder="Hoặc nhập mã vé, VD RH-7K2QXM"
                  className="h-11 min-w-0 flex-1 rounded-lg border border-white/15 bg-white/5 px-3 text-theme-sm text-white outline-none placeholder:text-white/40 focus:border-brand-300"
                />
                <button
                  type="submit"
                  className="h-11 shrink-0 rounded-lg bg-white px-4 text-theme-sm font-semibold text-gray-900 transition hover:bg-gray-100"
                >
                  Check-in
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EventQrScanner;
