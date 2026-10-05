/**
 * Tim kiem toan trang - gom ket qua tu moi muc tren thanh dieu huong: du an,
 * quy can, chu dau tu, su kien, tin tuc, khoa dao tao.
 *
 * Ban demo: tim tren du lieu mock ngay tren trinh duyet. Khop khong dau, khong
 * phan biet hoa thuong; MOI tu trong tu khoa phai co mat (VD "nha pho thu duc"
 * khop du an co ca "nha pho" lan "Thu Duc").
 *
 * KHI CO BACKEND: GET /search?q=&type= tra ve dung cac nhom duoi day.
 */
import { MOCK_EVENTS } from '@/modules/events/mocks/events.mock';
import { EVENT_TYPE_LABELS } from '@/modules/events/models/event.model';
import { MOCK_DEVELOPER_RECORDS } from '@/modules/developer/mocks/developers.mock';
import { MOCK_NEWS } from '@/modules/news/mocks/news.mock';
import { NEWS_CATEGORY_LABELS } from '@/modules/news/models/news.model';
import { MOCK_PROJECTS } from '@/modules/project/mocks/projects.mock';
import { getAllUnitsAcrossProjects } from '@/modules/project/mocks/project-detail.mock';
import { MOCK_TRAINING_CONTENT } from '@/modules/training/mocks/training.mock';

export type SearchGroupKey = 'du-an' | 'quy-can' | 'chu-dau-tu' | 'su-kien' | 'tin-tuc' | 'dao-tao';

export type SearchHit = {
  id: string;
  group: SearchGroupKey;
  title: string;
  subtitle: string;
  href: string;
  imageUrl?: string;
  /** Nhan nho goc anh / dau dong, VD "Cao tang", "Webinar" */
  badge?: string;
};

export const SEARCH_GROUPS: { key: SearchGroupKey; label: string }[] = [
  { key: 'du-an', label: 'Dự án' },
  { key: 'quy-can', label: 'Quỹ căn' },
  { key: 'chu-dau-tu', label: 'Chủ đầu tư' },
  { key: 'su-kien', label: 'Sự kiện' },
  { key: 'tin-tuc', label: 'Tin tức' },
  { key: 'dao-tao', label: 'Đào tạo' },
];

/** Moi nhom toi da bao nhieu ket qua */
const GROUP_LIMIT = 60;

export const normalizeSearch = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

const formatBillion = (vnd: number) =>
  vnd > 0 ? `${(vnd / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '')} tỷ` : 'Liên hệ';

type Indexed = SearchHit & { haystack: string };

const index = (hit: SearchHit, ...fields: (string | undefined)[]): Indexed => ({
  ...hit,
  haystack: normalizeSearch([hit.title, hit.subtitle, ...fields].filter(Boolean).join(' ')),
});

let cachedIndex: Indexed[] | null = null;

/** Lap chi muc mot lan (bang hang co hang nghin can) */
const buildIndex = (): Indexed[] => {
  if (cachedIndex) return cachedIndex;

  const projects = MOCK_PROJECTS.map((project) =>
    index(
      {
        id: project.publicId,
        group: 'du-an',
        title: project.name,
        subtitle: project.address,
        href: project.detailUrl,
        imageUrl: project.thumbnailUrls[0] ?? project.thumbnailUrl,
        badge: project.isMixed ? 'Hỗn hợp' : project.segment === 'cao-tang' ? 'Cao tầng' : 'Thấp tầng',
      },
      project.tagline,
      project.developerName,
      project.regionName,
    ),
  );

  const units = getAllUnitsAcrossProjects().map((unit) =>
    index(
      {
        id: unit.publicId,
        group: 'quy-can',
        title: `${unit.code} · ${unit.projectName}`,
        subtitle: `${unit.propertyTypeLabel} · ${unit.landArea} m² · ${unit.direction} · ${formatBillion(unit.listedPrice)}`,
        href: `/gio-hang/${unit.projectSlug}?tab=quy-can`,
        imageUrl: unit.thumbnailUrls[0],
        badge: unit.phaseName,
      },
      unit.developerName,
    ),
  );

  const developers = MOCK_DEVELOPER_RECORDS.map((developer) =>
    index(
      {
        id: developer.publicId,
        group: 'chu-dau-tu',
        title: developer.name,
        subtitle: developer.tagline || developer.headquarters,
        href: `/chu-dau-tu/${developer.slug}`,
        imageUrl: developer.logoUrl,
        badge: `${MOCK_PROJECTS.filter((project) => project.developerName === developer.name).length} dự án`,
      },
      developer.description,
      developer.headquarters,
    ),
  );

  const events = MOCK_EVENTS.map((event) =>
    index(
      {
        id: event.publicId,
        group: 'su-kien',
        title: event.title,
        subtitle: `${new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(event.startAt))} · ${event.location.name}`,
        href: `/su-kien/${event.slug}`,
        imageUrl: event.coverImage,
        badge: EVENT_TYPE_LABELS[event.type],
      },
      event.excerpt,
      ...(event.tags ?? []),
    ),
  );

  const news = MOCK_NEWS.map((article) =>
    index(
      {
        id: article.publicId,
        group: 'tin-tuc',
        title: article.title,
        subtitle: article.excerpt,
        href: '/tin-tuc',
        imageUrl: article.thumbnailUrl,
        badge: NEWS_CATEGORY_LABELS[article.category],
      },
    ),
  );

  const courses = MOCK_TRAINING_CONTENT.courses.map((course) =>
    index(
      {
        id: course.publicId,
        group: 'dao-tao',
        title: course.title,
        subtitle: `${course.sessions} buổi · ${course.hours} giờ · ${course.level} · GV ${course.instructor}`,
        href: '/dao-tao#khoa-hoc',
        badge: course.level,
      },
      course.description,
    ),
  );

  cachedIndex = [...projects, ...units, ...developers, ...events, ...news, ...courses];
  return cachedIndex;
};

export type SearchResults = Record<SearchGroupKey, SearchHit[]> & {
  total: number;
  /** So ket qua THAT cua tung nhom (danh sach chi giu toi da GROUP_LIMIT) */
  counts: Record<SearchGroupKey, number>;
};

export const searchSite = (keyword: string): SearchResults => {
  const empty = Object.fromEntries(SEARCH_GROUPS.map(({ key }) => [key, []])) as unknown as Record<
    SearchGroupKey,
    SearchHit[]
  >;
  const counts = Object.fromEntries(SEARCH_GROUPS.map(({ key }) => [key, 0])) as Record<SearchGroupKey, number>;
  const terms = normalizeSearch(keyword).split(' ').filter(Boolean);
  if (terms.length === 0) return { ...empty, total: 0, counts };

  const results = Object.fromEntries(SEARCH_GROUPS.map(({ key }) => [key, []])) as unknown as Record<
    SearchGroupKey,
    SearchHit[]
  >;
  let total = 0;
  for (const item of buildIndex()) {
    if (!terms.every((term) => item.haystack.includes(term))) continue;
    total += 1;
    counts[item.group] += 1;
    const bucket = results[item.group];
    if (bucket.length < GROUP_LIMIT) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- bo truong noi bo
      const { haystack, ...hit } = item;
      bucket.push(hit);
    }
  }
  return { ...results, total, counts };
};
