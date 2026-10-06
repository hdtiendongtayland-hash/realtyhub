"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type SVGAttributes,
} from "react";
import {
  FiCalendar,
  FiCamera,
  FiFileText,
  FiGlobe,
  FiMapPin,
  FiPhone,
} from "react-icons/fi";
import {
  HiOutlineAcademicCap,
  HiOutlineBookOpen,
  HiOutlineChartBar,
  HiOutlineFire,
  HiOutlineHomeModern,
  HiOutlineNewspaper,
  HiOutlineQuestionMarkCircle,
  HiOutlineSquares2X2,
} from "react-icons/hi2";
import {
  PROJECT_DETAIL_TABS,
  type ProjectConsultant,
  type ProjectDetailTabKey,
} from "../../models/project-detail.model";

/** Icon react-icons: component SVG nhan className + cac attrs SVG.
 *  Dat type len truoc vi TAB_ICONS dung IconType ngay ben duoi - mot so parser
 *  (vd Turbopack/SWC khi cache cu bi stale) khong hoisting type nhanh bang TS. */
type IconType = ComponentType<SVGAttributes<SVGSVGElement>>;

/** Icon nam o day chu khong o model: model la hop dong du lieu, khong chua JSX.
 *  Value la component vi: can chen class responsive cho moi icon.
 *  Tab `mat-bang-quy-can` luon hien icon (ca desktop) vi no la hot-feature;
 *  cac tab khac chi hien icon o duoi lg (chuan goc cua file nay). */
const TAB_ICONS: Record<ProjectDetailTabKey, IconType> = {
  "tong-quan": FiGlobe,
  "vi-tri": FiMapPin,
  "phan-khu": HiOutlineSquares2X2,
  "mat-bang-quy-can": HiOutlineFire,
  "quy-can": HiOutlineHomeModern,
  "anh-360": FiCamera,
  "hoi-dap": HiOutlineQuestionMarkCircle,
  "dao-tao": HiOutlineAcademicCap,
  "chinh-sach-ban-hang": FiFileText,
  "tien-do": FiCalendar,
  "tai-lieu": HiOutlineBookOpen,
  "tin-tuc": HiOutlineNewspaper,
  "phan-tich": HiOutlineChartBar,
};

/** Tab luon hien icon (icon "nong" can hien o moi breakpoint de noi bat dong deu) */
const ALWAYS_VISIBLE_ICON_TABS = new Set<ProjectDetailTabKey>([
  "mat-bang-quy-can",
]);

/** Tab HOT can hieu ung pulse noi bat */
const HOT_TAB = "mat-bang-quy-can";

const telHref = (phone: string) => `tel:${phone.replace(/\s/g, "")}`;

type ProjectTabNavProps = {
  current: ProjectDetailTabKey;
  onChange: (tab: ProjectDetailTabKey) => void;
  consultants: ProjectConsultant[];
  /**
   * false: thanh cuon di theo trang thay vi dinh. Tab "Vi tri quy can" dung
   * cai nay de nhuong cho thanh tab con cua no dinh ngay duoi SiteHeader.
   */
  sticky?: boolean;
};

const ProjectTabNav = ({
  current,
  onChange,
  consultants,
  sticky = true,
}: ProjectTabNavProps) => {
  const navRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Man hinh hep chi thay 3-4 tab mot luc. Doi tab qua URL (nut Back, link chia
  // se) ma khong keo thanh nay thi tab dang xem nam ngoai tam nhin.
  useEffect(() => {
    const list = listRef.current;
    const active = activeRef.current;
    if (!list || !active) return;

    const offset =
      active.offsetLeft - list.clientWidth / 2 + active.clientWidth / 2;
    list.scrollTo({ left: Math.max(0, offset), behavior: "smooth" });
  }, [current]);

  // Tren desktop, `overflow-x-auto` chi cuon duoc khi trackpad hoac bangg cuon
  // chuot. Chuot thuong khong co phim cuon ngang nen khong the keo. Hook nay
  // them hanh vi drag-to-scroll: giu chuot trai + keo de cuon thanh tab.
  // Dong thoi chuyen bangg cuon doc (wheel deltaY) thanh cuon ngang de nguoi
  // dung chi can xoay bangg chuot la luot qua het 11 tab.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    let isDown = false;
    let startX = 0;
    let scrollStart = 0;

    const onPointerDown = (event: PointerEvent) => {
      // Khong drag khi bong vao button (de click chon tab van hoat dong binh thuong)
      if ((event.target as HTMLElement).closest("button")) return;
      isDown = true;
      startX = event.clientX;
      scrollStart = list.scrollLeft;
      list.classList.add("cursor-grabbing");
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!isDown) return;
      const dx = event.clientX - startX;
      list.scrollLeft = scrollStart - dx;
    };
    const onPointerUp = () => {
      if (!isDown) return;
      isDown = false;
      list.classList.remove("cursor-grabbing");
    };

    // Bangg chuot doc (deltaY) => dich ngang. Chi chan khi thanh tab that su
    // dang tran (co the cuon them) - tranh khong cho nguoi dung cuon trang
    // khi khong can cuon ngang nua.
    const onWheel = (event: WheelEvent) => {
      // Chi xu ly khi con tro dang nam trong thanh tab, de khong can
      // tro ngai cuon trang o cac vung khac.
      if (!list.contains(event.target as Node)) return;
      const hasHorizontalOverflow = list.scrollWidth > list.clientWidth;
      if (!hasHorizontalOverflow) return;
      const atStart = list.scrollLeft <= 0 && event.deltaY < 0;
      const atEnd =
        list.scrollLeft + list.clientWidth >= list.scrollWidth - 1 &&
        event.deltaY > 0;
      if (atStart || atEnd) return;
      // deltaY manh hon deltaX, lay gia tri tuong doi de cam giac tu nhien
      list.scrollLeft += event.deltaY;
      event.preventDefault();
    };

    list.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    // Lang nghe wheel tren window vi su kien tu button con co the khong bubble
    // len ul neu React da stopPropagation. Check contains() ben trong handler.
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      list.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("wheel", onWheel);
    };
  }, []);

  // Ghi chieu cao that cua thanh nay vao --project-tabnav-h: thanh co the
  // xuong hai hang tuy be ngang, ma cac thanh dinh ben duoi (tab con cua
  // "Vi tri quy can") can biet dung cho de dinh sat ngay duoi. Thanh khong
  // dinh thi ghi 0 - thanh ben duoi dinh thang duoi SiteHeader.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const root = document.documentElement;
    const update = () =>
      root.style.setProperty(
        "--project-tabnav-h",
        sticky ? `${nav.getBoundingClientRect().height}px` : "0px",
      );
    update();

    const observer = new ResizeObserver(update);
    observer.observe(nav);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--project-tabnav-h");
    };
  }, [sticky]);

  return (
    // top-16 = dung chieu cao SiteHeader dang dinh o tren, de hai thanh xep sat
    // nhau thay vi de lo mot dai noi dung troi qua giua.
    <nav
      ref={navRef}
      aria-label="Nội dung dự án"
      className={`${
        sticky ? "sticky top-16" : "relative"
      } z-30 border-b border-gray-200 bg-white/90 backdrop-blur-lg`}
    >
      <div className="site-container flex items-center gap-3">
        {/* Duoi lg va ca tren lg: thanh tab cho phep cuon ngang neu qua dai
            (11 tab o 1280-1440px van khong the vua mot hang). Thanh cuon duoc
            giu noi - nho to chuot hoac keo tha (hook drag-to-scroll ben khoi
            them cho chuot thuong). Nut Lien he luon gan phai, nguoi dung cuon
            ngang de xem het tab - khong bao gio co tab bi day xuong hang 2. */}
        <ul
          ref={listRef}
          className="tab-scroll flex min-w-0 flex-1 cursor-grab items-center gap-0.5 overflow-x-scroll py-2 select-none"
        >
          {PROJECT_DETAIL_TABS.map((tab) => {
            const isActive = tab.key === current;
            const Icon = TAB_ICONS[tab.key];
            const alwaysShowIcon = ALWAYS_VISIBLE_ICON_TABS.has(tab.key);

            return (
              <li key={tab.key} className="shrink-0">
                <button
                  ref={isActive ? activeRef : undefined}
                  type="button"
                  onClick={() => onChange(tab.key)}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-2 text-[14px] transition duration-200 lg:px-[9px] ${
                    isActive
                      ? "brand-gradient font-semibold text-white shadow-[0_4px_14px_-4px_rgba(15,111,209,0.7)]"
                      : tab.key === HOT_TAB
                        ? // Chua chon: nhap nhay nen hong + chu do de goi bam
                          "animate-tab-hot font-medium text-gray-600"
                        : "text-gray-600 hover:bg-gray-100 hover:text-brand-600"
                  }`}
                >
                  {/* Tab `mat-bang-quy-can` luon hien icon de noi bat dong deu
                      moi breakpoint. Cac tab khac an icon de tiet kiem be
                      ngang, giup 11 tab co the cuon ngang gon hon. */}
                  <Icon
                    aria-hidden
                    className={
                      alwaysShowIcon
                        ? `shrink-0 ${
                            isActive ? "text-white" : "text-error-500"
                          } ${tab.key === HOT_TAB ? "animate-pulse-fire" : ""}`
                        : `shrink-0 lg:hidden ${isActive ? "text-white" : "text-gray-400"}`
                    }
                  />
                  {tab.label}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Nut lien he gan lien thanh tab: nut goi theo nguoi dung o moi tab ma
            khong chiem mot cot rieng suot chieu dai trang. */}
        <ProjectContactButton consultants={consultants} />
      </div>
    </nav>
  );
};

/**
 * Nut "Lien he" + bang so dien thoai chuyen vien tu van. Dat o hang ten du an
 * (canh Yeu thich / Chia se).
 */
export const ProjectContactButton = ({
  consultants,
}: {
  consultants: ProjectConsultant[];
}) => {
  const contactRef = useRef<HTMLDivElement>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Bam ra ngoai hoac Escape thi dong bang so dien thoai
  useEffect(() => {
    if (!isContactOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!contactRef.current?.contains(event.target as Node))
        setIsContactOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsContactOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isContactOpen]);

  if (consultants.length === 0) return null;

  return (
    <div ref={contactRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsContactOpen((open) => !open)}
        aria-expanded={isContactOpen}
        aria-haspopup="true"
        aria-label="Liên hệ tư vấn"
        className="flex items-center gap-2 rounded-full bg-jade-600 px-3 py-2 text-[14px] font-bold text-white shadow-[0_4px_14px_-4px_rgba(18,134,111,0.8)] transition duration-200 hover:scale-105 hover:bg-jade-500 active:scale-95"
      >
        <FiPhone aria-hidden />
        {/* Duoi sm chi con icon cho do chat; aria-label o tren lo cho ca
              hai truong hop nen trinh doc man hinh luon doc du y nghia. */}
        <span className="hidden sm:inline">Liên hệ</span>
      </button>

      {isContactOpen && (
        <div
          role="menu"
          className="animate-chat-in absolute right-0 top-full z-10 mt-2 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-panel"
        >
          <p className="border-b border-gray-100 bg-gray-25 px-4 py-2.5 text-theme-sm font-bold uppercase tracking-wide text-navy-800">
            Chuyên viên tư vấn
          </p>
          <ul className="divide-y divide-gray-100">
            {consultants.map((consultant) => (
              <li key={consultant.publicId}>
                <a
                  href={telHref(consultant.phone)}
                  role="menuitem"
                  className="block px-4 py-3 transition hover:bg-brand-25"
                >
                  <span className="block text-theme-sm font-semibold uppercase tracking-wide text-accent-600">
                    {consultant.role}
                  </span>
                  <span className="mt-0.5 block text-base text-gray-600">
                    {consultant.name}
                  </span>
                  <span className="mt-1 flex items-center gap-1.5 text-base font-bold text-jade-600">
                    <FiPhone aria-hidden />
                    {consultant.phone}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProjectTabNav;
