/**
 * Lop truy xuat du lieu cho module events.
 *
 * HIEN TAI: doc tu MOCK_EVENTS trong bo nho.
 * KHI CO BACKEND: giu nguyen chu ky ham, thay than axios goi GET /events:
 *
 *   const res = await api.get(apiRoutes.EVENT.LIST());
 *   return unwrapApiData<PaginatedEvents>(res.data);
 *
 * Khong component hay hook nao doc mock truc tiep - moi thu di qua day,
 * nen khi backend san, viec doi chi cham vao file nay.
 */
import { MOCK_EVENTS } from '../mocks/events.mock';
import type { EventItem } from '../models/event.model';

/** Do tre gia lap de UX giong API that (cho hook query) */
const NETWORK_DELAY_MS = 200;

const delay = <T,>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), NETWORK_DELAY_MS));

export const EventService = {
  /**
   * Lay 1 su kien theo slug - dung cho /su-kien/[slug].
   * Tra ve null neu khong co slug do - route se goi notFound().
   *
   * KHI CO BACKEND: GET /events/:slug
   */
  detail: async (slug: string): Promise<EventItem | null> => {
    const event = MOCK_EVENTS.find((entry) => entry.slug === slug) ?? null;
    return delay(event);
  },

  /**
   * Lay danh sach day du - hien chi dung cho client side (khong qua hook).
   * KHI CO BACKEND: GET /events (tra ve paginated).
   */
  list: (): EventItem[] => MOCK_EVENTS,
};