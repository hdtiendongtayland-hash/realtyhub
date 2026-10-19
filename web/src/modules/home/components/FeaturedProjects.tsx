'use client';

import { Link } from '@/i18n/navigation';
import { useEffect, useMemo, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { useTranslations } from 'next-intl';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useFavorites } from '@/common/hooks/useFavorites';
import ProjectCard from '@/modules/project/components/ProjectCard';
import type { Project } from '@/modules/project/models/project.model';

type FeaturedProjectsProps = {
  projects: Project[];
};

const FeaturedProjects = ({ projects: initialProjects }: FeaturedProjectsProps) => {
  const { favorites } = useFavorites();

  /**
   * Translation hook cho namespace `home.featured`. Key con `projects`
   * chứa title + label "Xem tất cả". Tách namespace theo feature
   * để không gom hết vào `common`.
   */
  const t = useTranslations('home.featured.projects');

  // Du an da tim len dau, giong /gio-hang. Sort cua JS on dinh nen cac du an
  // cung nhom giu nguyen thu tu goc.
  const projects = useMemo(() => {
    if (favorites.length === 0) return initialProjects;
    const favorite = new Set(favorites.map((entry) => entry.publicId));
    return [...initialProjects].sort(
      (a, b) => Number(favorite.has(b.publicId)) - Number(favorite.has(a.publicId)),
    );
  }, [initialProjects, favorites]);

  // Quay vo han: vuot het du an cuoi thi quay lai du an dau (can >= 2 the)
  const canLoop = projects.length > 1;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: canLoop,
    slidesToScroll: 1,
    skipSnaps: false,
  });

  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play: tu dong scroll moi 3 giay, dung khi user tuong tac
  useEffect(() => {
    if (!emblaApi || !isAutoPlaying) return;

    const autoScroll = setInterval(() => {
      emblaApi.scrollNext();
    }, 3000);

    const stopAutoPlay = () => setIsAutoPlaying(false);
    emblaApi.on('pointerDown', stopAutoPlay);

    return () => {
      clearInterval(autoScroll);
      emblaApi.off('pointerDown', stopAutoPlay);
    };
  }, [emblaApi, isAutoPlaying]);

  return (
    <section className="bg-gray-50 py-8 md:py-12">
      <div className="site-container">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wide text-gray-900 md:text-2xl">
              {t('title')}
            </h2>
          </div>
          <Link
            href="/du-an"
            className="inline-flex items-center gap-1 text-theme-sm font-medium text-brand-600 transition hover:text-brand-700"
          >
            {t('viewAll')}
            <FiChevronRight aria-hidden />
          </Link>
        </div>

        {/* ── Mobile carousel (<sm) ─────────────────────────────────────── */}
        <div className="sm:hidden">
          <div className="relative">
            <div ref={emblaRef} className="overflow-hidden">
              <div className="flex gap-4">
                {projects.map((project) => (
                  <div
                    key={project.publicId}
                    className="flex-[0_0_88%] min-w-0"
                  >
                    <ProjectCard project={project} />
                  </div>
                ))}
              </div>
            </div>

            {/* Nut chuyen qua (ngang giua anh) - van vuot tay duoc, quay vong */}
            {projects.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    emblaApi?.scrollPrev();
                    setIsAutoPlaying(false);
                  }}
                  aria-label="Dự án trước"
                  className="absolute top-[6.25rem] z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border-2 border-gray-300 bg-white text-gray-700 shadow-sm transition hover:border-brand-500 hover:bg-brand-50 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 left-1"
                >
                  <FiChevronLeft aria-hidden className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    emblaApi?.scrollNext();
                    setIsAutoPlaying(false);
                  }}
                  aria-label="Dự án tiếp theo"
                  className="absolute top-[6.25rem] z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border-2 border-gray-300 bg-white text-gray-700 shadow-sm transition hover:border-brand-500 hover:bg-brand-50 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 right-1"
                >
                  <FiChevronRight aria-hidden className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

        </div>

        {/* ── Desktop grid (sm+) ─────────────────────────────────────────── */}
        <div className="hidden grid-cols-1 gap-5 sm:grid sm:grid-cols-2 lg:grid lg:grid-cols-3 2xl:grid-cols-4 lg:[&>*:nth-child(n+7)]:hidden 2xl:[&>*:nth-child(n+7)]:block">
          {projects.map((project) => (
            <ProjectCard key={project.publicId} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;
