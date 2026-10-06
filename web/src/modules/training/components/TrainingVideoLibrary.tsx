'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { FiArrowLeft, FiArrowRight, FiList, FiPlay, FiPlayCircle, FiSearch, FiX } from 'react-icons/fi';
import {
  TRAINING_PLAYLISTS,
  TRAINING_VIDEO_TOPICS,
  TRAINING_VIDEOS,
  type TrainingVideo,
  type TrainingVideoTopic,
} from '../mocks/training-videos.mock';

const TABS = [
  { key: 'video', label: 'Video bài giảng' },
  { key: 'playlist', label: 'Danh sách phát' },
  { key: 'dang-hoc', label: 'Đang học' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

/** So video hien tren moi trang (tab Video bai giang) */
const VIDEOS_PER_PAGE = 6;

const viewsLabel = (views: number) =>
  views >= 1000 ? `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(views / 1000)}N lượt xem` : `${views} lượt xem`;

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').toLowerCase();

/** The video kieu YouTube: anh 16:9 + thoi luong, avatar giang vien, tieu de 2 dong */
const VideoCard = ({ video, onPlay }: { video: TrainingVideo; onPlay: (video: TrainingVideo) => void }) => (
  <article className="group">
    <button
      type="button"
      onClick={() => onPlay(video)}
      aria-label={`Phát video: ${video.title}`}
      className="relative block aspect-video w-full overflow-hidden rounded-xl bg-gray-100"
    >
      <Image
        src={video.thumbnailUrl}
        alt=""
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover transition duration-300 group-hover:scale-105"
      />
      <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/25">
        <FiPlayCircle aria-hidden className="h-14 w-14 text-white opacity-0 drop-shadow-lg transition group-hover:opacity-100" />
      </span>
      <span className="absolute right-2 bottom-2 rounded-md bg-black/80 px-1.5 py-0.5 text-[12px] font-semibold text-white">
        {video.duration}
      </span>
      {video.isNew && (
        <span className="brand-gradient absolute top-2 left-2 rounded-md px-2 py-0.5 text-[11px] font-bold tracking-wide text-white uppercase">
          Mới
        </span>
      )}
      {video.progress !== undefined && (
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 bg-white/40">
          <span className="block h-full bg-error-500" style={{ width: `${video.progress}%` }} />
        </span>
      )}
    </button>

    <div className="mt-3 flex gap-3">
      <Image
        src={video.instructorAvatar}
        alt={video.instructor}
        width={36}
        height={36}
        className="h-9 w-9 shrink-0 rounded-full object-cover"
      />
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-base leading-snug font-semibold text-gray-900">
          <button type="button" onClick={() => onPlay(video)} className="text-left transition hover:text-brand-600">
            {video.title}
          </button>
        </h3>
        <p className="mt-1 text-theme-sm text-gray-600">{video.instructor}</p>
        <p className="text-theme-xs text-gray-500">
          {viewsLabel(video.views)} · {video.publishedAgo}
        </p>
      </div>
    </div>
  </article>
);

/** Xem video: khung YouTube + danh sach video tiep theo cung chu de */
const VideoPlayer = ({
  video,
  onClose,
  onPlay,
}: {
  video: TrainingVideo;
  onClose: () => void;
  onPlay: (video: TrainingVideo) => void;
}) => {
  useEffect(() => {
    const onKeyDown = (keyEvent: KeyboardEvent) => {
      if (keyEvent.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const upNext = TRAINING_VIDEOS.filter((item) => item.publicId !== video.publicId)
    .sort((a, b) => Number(b.topic === video.topic) - Number(a.topic === video.topic))
    .slice(0, 5);

  return (
    <div role="dialog" aria-modal="true" aria-label={video.title} className="fixed inset-0 z-50 flex items-center justify-center p-4 max-md:p-0">
      <button type="button" aria-label="Đóng" onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative grid max-h-[92vh] w-full max-w-6xl gap-4 overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl max-md:max-h-full max-md:rounded-none lg:grid-cols-[minmax(0,1fr)_320px]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-gray-900/70 text-white transition hover:bg-gray-900"
        >
          <FiX aria-hidden />
        </button>
        <div className="min-w-0">
          <div className="aspect-video overflow-hidden rounded-xl bg-black">
            <iframe
              key={video.publicId}
              src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
          <h2 className="mt-4 text-lg leading-snug font-bold text-gray-900">{video.title}</h2>
          <div className="mt-3 flex items-center gap-3">
            <Image src={video.instructorAvatar} alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
            <div>
              <p className="font-semibold text-gray-900">{video.instructor}</p>
              <p className="text-theme-xs text-gray-500">
                {viewsLabel(video.views)} · {video.publishedAgo}
              </p>
            </div>
          </div>
        </div>
        <aside>
          <p className="mb-3 text-theme-sm font-bold text-gray-900">Video tiếp theo</p>
          <ul className="space-y-3">
            {upNext.map((item) => (
              <li key={item.publicId}>
                <button type="button" onClick={() => onPlay(item)} className="group flex w-full gap-3 text-left">
                  <span className="relative block aspect-video w-36 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <Image src={item.thumbnailUrl} alt="" fill sizes="144px" className="object-cover" />
                    <span className="absolute right-1 bottom-1 rounded bg-black/80 px-1 text-[11px] font-semibold text-white">
                      {item.duration}
                    </span>
                  </span>
                  <span className="min-w-0">
                    <span className="line-clamp-2 text-theme-sm leading-snug font-semibold text-gray-900 group-hover:text-brand-600">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-theme-xs text-gray-500">{item.instructor}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
};

/**
 * Thu vien video bai giang (trang /dao-tao) - kieu YouTube:
 * - 3 tab: Video bai giang / Danh sach phat / Dang hoc.
 * - Hang chu de de loc + o tim nhanh, luoi 3 cot tren may tinh.
 * - Bam video mo khung xem + "Video tiep theo".
 */
const TrainingVideoLibrary = () => {
  const [tab, setTab] = useState<TabKey>('video');
  const [topic, setTopic] = useState<TrainingVideoTopic | 'tat-ca'>('tat-ca');
  const [keyword, setKeyword] = useState('');
  const [playing, setPlaying] = useState<TrainingVideo | null>(null);
  const [videoPage, setVideoPage] = useState(1);

  const videos = useMemo(() => {
    const term = normalize(keyword.trim());
    return TRAINING_VIDEOS.filter(
      (video) =>
        (topic === 'tat-ca' || video.topic === topic) &&
        (!term || normalize(`${video.title} ${video.instructor}`).includes(term)),
    );
  }, [topic, keyword]);

  const totalPages = Math.max(1, Math.ceil(videos.length / VIDEOS_PER_PAGE));
  const currentPage = Math.min(videoPage, totalPages);
  const paginatedVideos = useMemo(
    () => videos.slice((currentPage - 1) * VIDEOS_PER_PAGE, currentPage * VIDEOS_PER_PAGE),
    [videos, currentPage],
  );

  const inProgress = TRAINING_VIDEOS.filter((video) => video.progress !== undefined);
  const byId = new Map(TRAINING_VIDEOS.map((video) => [video.publicId, video]));

  const chip = (isActive: boolean) =>
    `shrink-0 rounded-lg px-3.5 py-2 text-theme-sm font-medium whitespace-nowrap transition ${
      isActive ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`;

  return (
    <section id="thu-vien-video" className="site-container scroll-mt-28 pt-10 pb-16 md:pt-12 md:pb-20">
      {/* Thanh tìm kiếm nổi bật phía trên */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Cung kieu o tim kiem trang Chu dau tu: vien tron, bong nhe, kinh lup ben phai */}
        <form
          role="search"
          onSubmit={(event) => event.preventDefault()}
          className="flex w-full min-w-0 items-center gap-2 rounded-full border border-gray-200 bg-white py-2 pr-2 pl-5 shadow-card transition focus-within:border-brand-300 focus-within:shadow-panel lg:max-w-2xl"
        >
          <input
            type="search"
            value={keyword}
            onChange={(change) => {
              setKeyword(change.target.value);
              setVideoPage(1); // loc thay doi -> ve trang 1
            }}
            placeholder="Tìm theo tên bài giảng, giảng viên..."
            aria-label="Tìm kiếm trong thư viện đào tạo"
            className="h-9 min-w-0 flex-1 bg-transparent text-base text-gray-800 outline-none placeholder:text-gray-400"
          />
          <button
            type="submit"
            aria-label="Tìm kiếm"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-brand-50 hover:text-brand-600"
          >
            <FiSearch aria-hidden className="text-lg" />
          </button>
        </form>
      </div>

      {/* 3 tab */}
      <div role="tablist" aria-label="Thư viện bài giảng" className="mb-6 flex gap-1 border-b border-gray-200">
        {TABS.map((item) => {
          const isActive = item.key === tab;
          const count = item.key === 'video' ? TRAINING_VIDEOS.length : item.key === 'playlist' ? TRAINING_PLAYLISTS.length : inProgress.length;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setTab(item.key)}
              className={`relative px-4 py-3 text-theme-sm font-semibold transition ${
                isActive ? 'text-brand-600' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {item.label}
              <span className="ml-1.5 text-theme-xs text-gray-400">{count}</span>
              <span aria-hidden className={`brand-gradient absolute inset-x-2 -bottom-px h-0.5 rounded-full ${isActive ? '' : 'opacity-0'}`} />
            </button>
          );
        })}
      </div>

      {tab === 'video' && (
        <>
          <div className="mb-6 no-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto">
              <button type="button" onClick={() => {
                  setTopic('tat-ca');
                  setVideoPage(1);
                }} className={chip(topic === 'tat-ca')}>
                Tất cả
              </button>
              {TRAINING_VIDEO_TOPICS.map((item) => (
                <button key={item.key} type="button" onClick={() => {
                  setTopic(item.key);
                  setVideoPage(1);
                }} className={chip(topic === item.key)}>
                  {item.label}
                </button>
              ))}
            </div>

          {paginatedVideos.length === 0 ? (
            <p className="py-12 text-center text-theme-sm text-gray-500">Không có video nào khớp.</p>
          ) : (
            <>
              <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedVideos.map((video) => (
                  <VideoCard key={video.publicId} video={video} onPlay={setPlaying} />
                ))}
              </div>

              {totalPages > 1 && (
                <nav aria-label="Phân trang video" className="mt-12 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVideoPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    aria-label="Trang trước"
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-theme-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:border-gray-100 disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <FiArrowLeft aria-hidden className="h-4 w-4" />
                    Trước
                  </button>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => {
                    const isActive = page === currentPage;
                    return (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setVideoPage(page)}
                        aria-current={isActive ? 'page' : undefined}
                        aria-label={`Trang ${page}`}
                        className={`inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-theme-sm font-semibold transition ${
                          isActive
                            ? 'bg-brand-500 text-white shadow-theme-sm'
                            : 'border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setVideoPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    aria-label="Trang sau"
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-theme-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:border-gray-100 disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    Sau
                    <FiArrowRight aria-hidden className="h-4 w-4" />
                  </button>
                </nav>
              )}
            </>
          )}
        </>
      )}

      {tab === 'playlist' && (
        <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {TRAINING_PLAYLISTS.map((playlist) => {
            const first = byId.get(playlist.videoIds[0]);
            return (
              <article key={playlist.publicId} className="group">
                <button
                  type="button"
                  onClick={() => first && setPlaying(first)}
                  className="relative block aspect-video w-full overflow-hidden rounded-xl bg-gray-100"
                >
                  {/* Hai lop the phia sau - dau hieu "danh sach phat" */}
                  <span aria-hidden className="absolute inset-x-6 -top-0 h-2 rounded-t-lg bg-gray-300" />
                  <Image src={playlist.thumbnailUrl} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition duration-300 group-hover:scale-105" />
                  <span className="absolute inset-y-0 right-0 flex w-2/5 flex-col items-center justify-center gap-1 bg-black/70 text-white">
                    <FiList aria-hidden className="h-6 w-6" />
                    <span className="text-theme-sm font-bold">{playlist.videoIds.length} video</span>
                  </span>
                  <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100">
                    <span className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-theme-sm font-semibold text-gray-900">
                      <FiPlay aria-hidden />
                      Phát tất cả
                    </span>
                  </span>
                </button>
                <h3 className="mt-3 text-base font-semibold text-gray-900">{playlist.title}</h3>
                <ol className="mt-1.5 space-y-0.5 text-theme-xs text-gray-500">
                  {playlist.videoIds.slice(0, 3).map((id, index) => (
                    <li key={id} className="line-clamp-1">
                      {index + 1}. {byId.get(id)?.title}
                    </li>
                  ))}
                </ol>
              </article>
            );
          })}
        </div>
      )}

      {tab === 'dang-hoc' && (
        <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {inProgress.map((video) => (
            <div key={video.publicId}>
              <VideoCard video={video} onPlay={setPlaying} />
              <p className="mt-2 pl-12 text-theme-xs font-semibold text-brand-600">Đã xem {video.progress}% · Học tiếp</p>
            </div>
          ))}
        </div>
      )}

      {playing && <VideoPlayer video={playing} onClose={() => setPlaying(null)} onPlay={setPlaying} />}
    </section>
  );
};

export default TrainingVideoLibrary;
