'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useProjectDetail } from '../../hooks/useProjects';
import {
  DEFAULT_TAB,
  parseTabKey,
  type ProjectDetail,
  type ProjectDetailTabKey,
} from '../../models/project-detail.model';
import ProjectHero from './ProjectHero';
import ProjectTabNav from './ProjectTabNav';
import AnalysisTab from './tabs/AnalysisTab';
import DocumentsTab from './tabs/DocumentsTab';
import FaqTab from './tabs/FaqTab';
import { PhaseMapViews } from './tabs/PhaseFundTab';
import LocationTab from './tabs/LocationTab';
import OverviewTab from './tabs/OverviewTab';
import PhasesTab from './tabs/PhasesTab';
import Photo360Tab from './tabs/Photo360Tab';
import ProgressTab from './tabs/ProgressTab';
import ProjectNewsTab from './tabs/ProjectNewsTab';
import SalesPolicyTab from './tabs/SalesPolicyTab';
import TrainingVideoLibrary from '@/modules/training/components/TrainingVideoLibrary';
import UnitsTab from './tabs/UnitsTab';

const TAB_PARAM = 'tab';

const DetailSkeleton = () => (
  <div>
    <div className="h-[58vh] min-h-100 w-full animate-pulse bg-gray-200" />
    <div className="site-container py-10">
      <div className="mb-6 h-11 w-full animate-pulse rounded-full bg-gray-100" />
      <div className="h-96 w-full animate-pulse rounded-2xl bg-gray-100" />
    </div>
  </div>
);

type ProjectDetailPageProps = {
  slug: string;
  /** Du lieu route da doc san tren server - dung lam initialData cho query */
  initialProject?: ProjectDetail;
};

const ProjectDetailPage = ({ slug, initialProject }: ProjectDetailPageProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const contentRef = useRef<HTMLDivElement>(null);


  // Tab nam tren URL nen refresh, nut Back va link chia se deu ra dung tab
  const currentTab = parseTabKey(searchParams.get(TAB_PARAM));

  const detailQuery = useProjectDetail(slug, initialProject);

  // Bam "Phan khu" (ke ca khi dang o tab do, dang xem mot phan khu) -> doi
  // key de tab dung lai tu dau: ve luoi the phan khu
  const [phasesTabKey, setPhasesTabKey] = useState(0);

  const changeTab = useCallback(
    (tab: ProjectDetailTabKey) => {
      if (tab === 'phan-khu') setPhasesTabKey((key) => key + 1);

      const next = new URLSearchParams(searchParams.toString());
      if (tab === DEFAULT_TAB) next.delete(TAB_PARAM);
      else next.set(TAB_PARAM, tab);

      const queryString = next.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });

      // Doi tab ma giu nguyen vi tri cuon se roi vao giua mot tab ngan, nhin
      // nhu trang bi vo - keo ve dau vung noi dung.
      contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [pathname, router, searchParams],
  );

  // Vao thang tab ban do (VD nut "Mat bang" tren the du an): cuon toi ngay
  // duoi thanh tab dinh de ban do hien tron man hinh, khong phai tu keo xuong
  const hasProject = Boolean(detailQuery.data);
  const landedOnMapRef = useRef(false);
  useEffect(() => {
    if (!hasProject || landedOnMapRef.current || currentTab !== 'mat-bang-quy-can') return undefined;
    const scrollToMap = () => {
      const content = contentRef.current;
      if (!content) return;
      landedOnMapRef.current = true;
      const headerHeight = window.matchMedia('(min-width: 640px)').matches ? 64 : 57;
      const navHeight =
        parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--project-tabnav-h')) || 57;
      const top = content.getBoundingClientRect().top + window.scrollY - headerHeight - navHeight;
      window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
    };
    // Lan hai: anh hero / thanh tab do xong chieu cao that
    const frame = window.requestAnimationFrame(scrollToMap);
    const timer = window.setTimeout(scrollToMap, 450);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
    // Chi chay mot lan khi trang vua co du lieu
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasProject]);

  if (detailQuery.isLoading) return <DetailSkeleton />;

  if (detailQuery.isError) {
    return (
      <div className="site-container py-16 text-center">
        <p className="mb-4 text-theme-sm text-error-600">
          Không tải được thông tin dự án.
        </p>
        <button
          type="button"
          onClick={() => detailQuery.refetch()}
          className="rounded-full bg-brand-500 px-5 py-2.5 text-theme-sm font-semibold text-white transition hover:bg-brand-600"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const project = detailQuery.data;

  if (!project) {
    return (
      <div className="site-container py-16 text-center">
        <p className="mb-4 text-theme-sm text-gray-500">Không tìm thấy dự án này.</p>
        <Link
          href="/du-an"
          className="rounded-full border border-gray-300 px-5 py-2.5 text-theme-sm font-medium text-gray-700 transition hover:border-brand-400 hover:text-brand-600"
        >
          Về danh sách dự án
        </Link>
      </div>
    );
  }

  const tabContent = (
    <>
      {currentTab === 'tong-quan' && <OverviewTab project={project} />}
      {currentTab === 'vi-tri' && (
        <LocationTab
          location={project.location}
          name={project.name}
          seed={project.publicId}
        />
      )}
      {currentTab === 'phan-khu' && <PhasesTab key={phasesTabKey} project={project} />}
      {/* Chi ban do: thanh chon 3D / 2D theo tong the + tung phan khu */}
      {currentTab === 'mat-bang-quy-can' && (
        <PhaseMapViews project={project} highRise={project.segment === 'cao-tang'} />
      )}
      {currentTab === 'quy-can' && <UnitsTab slug={slug} />}
      {currentTab === 'anh-360' && <Photo360Tab project={project} />}
      {currentTab === 'hoi-dap' && <FaqTab project={project} />}
      {currentTab === 'phan-tich' && <AnalysisTab analysis={project.analysis} />}
      {currentTab === 'dao-tao' && <TrainingVideoLibrary />}
      {currentTab === 'chinh-sach-ban-hang' && (
        <SalesPolicyTab salesPolicy={project.salesPolicy} projectName={project.name} />
      )}
      {currentTab === 'tien-do' && <ProgressTab project={project} />}
      {currentTab === 'tai-lieu' && <DocumentsTab project={project} />}
      {currentTab === 'tin-tuc' && <ProjectNewsTab project={project} />}
    </>
  );

  return (
    <div className="pb-6 sm:pb-8">
      <ProjectHero project={project} />

      <ProjectTabNav
        current={currentTab}
        onChange={changeTab}
        consultants={project.consultants}
        // "Phan khu": thanh tab du an cuon di, thanh tab con cua phan khu
        // (Tong quan ... Chinh sach ban hang) dinh ngay duoi SiteHeader thay
        // cho no. Cac tab khac van giu thanh tab du an dinh.
        sticky={currentTab !== 'phan-khu'}
      />

      {/* Moi tab tran het chieu rong. Truoc day co cot phai dinh o ben, nhung no
          chi cao khoang 500px trong khi trang dai gan 5000px - tu giua trang tro
          xuong mot phan ba chieu ngang bo trong. Bang thong so gio nam trong muc
          "Tong quan du an", nut goi da gan vao thanh tab, nen khong con ly do
          giu cot do.

          scroll-mt tru cho ca SiteHeader (64px) lan thanh tab dinh (~60px). */}
      <div ref={contentRef} className="site-container scroll-mt-32 pt-2 sm:pt-5">
        {tabContent}
      </div>
    </div>
  );
};

export default ProjectDetailPage;
