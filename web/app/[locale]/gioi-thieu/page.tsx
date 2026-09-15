/**
 * Trang /gioi-thieu - phien ban viet lai ngay 05/09/2026.
 *
 * Truoc day: trang gioi thieu doanh nghiep truyen thong (hero co anh that,
 * commitments, stats, modules, company, FAQ, CTA co form PartnerSignup).
 *
 * Phien ban moi: trang gioi thieu chinh thuc cua NEN TANG RealtyHub,
 * nhan manh day la cong nghe danh rieng cho moi gioi BĐS.
 *
 * Cau truc:
 *  1. AboutHeroSection          - headline + lead + CTA
 *  2. AboutIntroSection         - "Ve RealtyHub" + grid 8 pillars
 *  3. AboutInventorySection     - "QUY CAN PHONG PHU" + callout Mien Nam
 *  4. AboutTrustedSection       - "DUOC KHACH HANG TIN TUONG"
 *  5. AboutJourneySection       - "DONG HANH CUNG BAN TU A DEN Z" - timeline
 *  6. AboutCtaSection           - "TRO THANH CONG TAC VIEN" - CTA cuoi trang
 *
 * Ghi chu pham vi:
 *  - 2 section cu "KHACH HANG NOI GI" (TestimonialsSection) va "VI SAO
 *    CHON REALTYHUB" (WhyUs) da duoc di chuyen ra khoi trang chu va KHONG
 *    con xuat hien o bat ky trang nao khac - chung chi con ton tai trong
 *    source code vi cac component duoc tai su dung cho muc dich khac.
 *  - Trang nay chi su dung data trong MOCK_ABOUT_PAGE (about-page.mock.ts).
 *  - Khong import MOCK_ABOUT_CONTENT cu de tranh nham lan.
 *  - Route dang ky ctv: /tro-thanh-moi-gioi (AgentOnboardingView da co).
 *  - Route dang nhap: /login.
 *
 * Locale-aware: metadata `title`/`description` lấy từ namespace `about.metadata`
 * qua `generateMetadata` (Next 16 cần `params` là Promise).
 */

import type { Metadata } from 'next';

import AboutCtaSection from '@/modules/about/components/AboutCtaSection';
import AboutHeroSection from '@/modules/about/components/AboutHeroSection';
import AboutIntroSection from '@/modules/about/components/AboutIntroSection';
import AboutInventorySection from '@/modules/about/components/AboutInventorySection';
import AboutJourneySection from '@/modules/about/components/AboutJourneySection';
import AboutTrustedSection from '@/modules/about/components/AboutTrustedSection';
import { MOCK_ABOUT_PAGE } from '@/modules/about/mocks/about-page.mock';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about.metadata' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function GioiThieuPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Bật static rendering cho sub-tree này - yêu cầu của next-intl.
  setRequestLocale(locale);

  const ABOUT = MOCK_ABOUT_PAGE;

  return (
    <main className="bg-white">
      {/* 1. HERO - hiện đã self-contained, đọc text từ `about.hero` */}
      <AboutHeroSection />

      {/* 2. VỀ REALTYHUB - nền tảng cho môi giới */}
      <AboutIntroSection intro={ABOUT.intro} />

      {/* 3. QUỸ CĂN PHONG PHÚ - tập trung miền Nam */}
      <AboutInventorySection inventory={ABOUT.inventory} />

      {/* 4. ĐƯỢC KHÁCH HÀNG TIN TƯỞNG VÀ LỰA CHỌN */}
      <AboutTrustedSection trusted={ABOUT.trusted} />

      {/* 5. ĐỒNG HÀNH CÙNG BẠN TỪ A ĐẾN Z */}
      <AboutJourneySection journey={ABOUT.journey} />

      {/* 6. CTA - Trở thành cộng tác viên */}
      <AboutCtaSection cta={ABOUT.cta} />
    </main>
  );
}
