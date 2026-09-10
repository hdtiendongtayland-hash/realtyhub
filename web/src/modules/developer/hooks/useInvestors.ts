'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { InvestorService } from '../services/investor.service';
import {
  DEFAULT_INVESTOR_QUERY,
  type Investor,
  type InvestorQuery,
  type PaginatedInvestors,
} from '../models/investor.model';

/**
 * Hook chinh cho 25 Investor.
 *
 * Cung cung cho:
 *   - Section "CAC CHU DAU TU" tren trang chu
 *   - Trang /chu-dau-tu
 *
 * Trang list (/chu-dau-tu) truyen `query` de service loc/sap xep/phan trang.
 * `placeholderData: keepPreviousData` giu danh sach cu khi user doi trang
 * hoac sua filter, tranh nhay ve skeleton trong khoang 200ms gia lap.
 *
 * Call sites that need all 25 investors (e.g. home carousel) pass `undefined`
 * or no arg — the hook defaults to DEFAULT_INVESTOR_QUERY internally.
 */
export const useInvestorList = (query?: InvestorQuery) => {
  const q = query ?? DEFAULT_INVESTOR_QUERY;
  return useQuery({
    queryKey: ['investors', q] as const,
    queryFn: () => InvestorService.list(q),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
};

/** Cac lua chon cho bang loc (khu vuc co du an, nguong so du an...). */
export const useInvestorFilterOptions = () =>
  useQuery({
    queryKey: ['investor-filter-options'] as const,
    queryFn: () => InvestorService.filterOptions(),
    staleTime: 5 * 60 * 1000,
  });

/** Lookup Investor theo slug - dung cho trang detail. */
export const useInvestorDetail = (
  slug: string,
  initialData?: Investor | null,
) =>
  useQuery({
    queryKey: ['investor-detail', slug] as const,
    queryFn: () => InvestorService.detail(slug),
    initialData: initialData ?? undefined,
    staleTime: 5 * 60 * 1000,
  });

export type { Investor, InvestorQuery, PaginatedInvestors };
