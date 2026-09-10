/**
 * Lop truy xuat du lieu trang chu.
 *
 * HIEN TAI: doc tu mock trong bo nho.
 * KHI CO BACKEND: giu nguyen chu ky ham, thay than ham bang goi axios:
 *
 *   const res = await api.get(apiRoutes.HOME.GET_CONTENT());
 *   return unwrapApiData<HomeContent>(res.data);
 *
 * Trang chu chi can mot luot goi duy nhat nen tra ve nguyen object.
 */
import { InvestorService } from '@/modules/developer/services/investor.service';
import { DEFAULT_INVESTOR_QUERY } from '@/modules/developer/models/investor.model';
import { ProjectService } from '@/modules/project/services/project.service';
import { MOCK_HOME_CONTENT } from '../mocks/home.mock';
import { MOCK_DEVELOPERS, MOCK_PROJECTS, MOCK_REGIONS } from '@/modules/project/mocks/projects.mock';
import type { HomeContent } from '../models/home.model';
import type { HomeSuggestion, HomeSuggestions } from '../models/home.model';
import { parseSearchQuery } from './search-parser';

/** Do tre gia lap de trang thai loading hien ra dung nhu khi goi API that */
const NETWORK_DELAY_MS = 250;

const delay = <T,>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), NETWORK_DELAY_MS));

export const HomeService = {
  /**
   * Noi dung tong hop cua trang chu - banner, du an noi bat, can noi bat,
   * 25 chu dau tu.
   *
   * Can noi bat lay tu ProjectService.featuredUnits (gom tu tat ca du an),
   * giu nguyen source-of-truth o mot cho - khi backend `projects/units/featured`
   * co, chi can doi ProjectService.featuredUnits.
   *
   * 25 chu dau tu lay tu InvestorService - cung nguon voi trang /chu-dau-tu.
   *
   * Ghi chu: MOCK_HOME_CONTENT khong con chua features/testimonials (2 khoi
   * nay da duoc di chuyen sang trang /gioi-thieu).
   *
   * KHI CO BACKEND: GET /home (hoac /home-config)
   */
  content: async (): Promise<HomeContent> => {
    const [featuredUnits, investorsPage] = await Promise.all([
      ProjectService.featuredUnits(12, 3),
      InvestorService.list(DEFAULT_INVESTOR_QUERY),
    ]);
    return delay({
      ...MOCK_HOME_CONTENT,
      featuredUnits,
      investors: investorsPage.investors,
    });
  },

  /**
   * Goi y tu khoa cho thanh tim kiem hero. Gom 3 nhom:
   *   - Du an (ten, tagline, dia chi, chu dau tu) -> click mo trang chi tiet
   *   - Khu vuc (ten tinh/thanh) -> click fill input roi submit search
   *   - Chu dau tu -> click fill input roi submit search
   *
   * Bo dau tieng Viet de "vinhomes" van match "Vinhomes".
   * Tu khoa duoc parse NL truoc (vd "nha duoi 4 ty" -> propertyType + priceMax),
   * phan con lai (leftover) moi dung de match ten du an/khu vuc/chu dau tu.
   *
   * KHI CO BACKEND: GET /search/suggest?q=...&types=project,region,developer
   */
  suggest: async (rawKeyword: string): Promise<HomeSuggestions> => {
    const { leftover } = parseSearchQuery(rawKeyword);
    const keyword = HomeService._normalize(leftover);

    // Doc thang tu mock pool - giong cach ProjectService.featuredUnits lam.
    // Khi co backend, suggest se goi endpoint rieng (vd GET /search/suggest)
    // nen khong phu thuoc vao project pagination.
    const pool = MOCK_PROJECTS;

    const projects: HomeSuggestion[] = (keyword
      ? pool.filter((project) => {
          const haystack = HomeService._normalize(
            `${project.name} ${project.tagline} ${project.address} ${project.developerName}`,
          );
          return haystack.includes(keyword);
        })
      : pool
    )
      .map((project) => {
        // Tinh priority tai cho: HOT + ten ngan uu tien hon. Chi dung de sort,
        // khong can luu vao suggestion cuoi cung.
        const priority = (project.isHot ? 0 : 1) + project.name.length / 1000;
        return { project, priority };
      })
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 6)
      // Strip wrapper object, chi giau field can thiet cho UI
      .map(({ project }) => ({
        kind: 'project' as const,
        label: project.name,
        sublabel: project.address,
        href: project.detailUrl,
      }));

    const regions: HomeSuggestion[] = (keyword
      ? MOCK_REGIONS.filter((region) => HomeService._normalize(region.label).includes(keyword))
      : MOCK_REGIONS
    )
      .slice(0, 3)
      .map((region) => ({
        kind: 'region' as const,
        label: region.label,
        sublabel: 'Khu vuc',
        // Khu vuc chua co trang rieng - click se fill input roi submit search
        href: null,
      }));

    const developers: HomeSuggestion[] = (keyword
      ? MOCK_DEVELOPERS.filter((developer) =>
          HomeService._normalize(developer.label).includes(keyword),
        )
      : MOCK_DEVELOPERS
    )
      .slice(0, 3)
      .map((developer) => ({
        kind: 'developer' as const,
        label: developer.label,
        sublabel: 'Chu dau tu',
        href: null,
      }));

    return delay({
      projects,
      regions,
      developers,
    });
  },

  /** Bo dau tieng Viet - copy nguyen tac tu ProjectService.normalize */
  _normalize: (value: string) =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd'),
};
