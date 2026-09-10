/**
 * Hooks cho trang chu - TanStack Query, giu pattern giong useProjects.ts.
 *
 * `initialContent` do route (server component) doc san va truyen xuong, nen
 * HTML tra ve tu server da co noi dung hero + featured projects - quan trong
 * voi SEO va first paint.
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HomeService } from '../services/home.service';
import { parseSearchQuery } from '../services/search-parser';
import type { HomeContent, HomeSuggestions } from '../models/home.model';

export const useHomeContent = (initialContent?: HomeContent) =>
  useQuery({
    queryKey: ['home-content'] as const,
    queryFn: () => HomeService.content(),
    initialData: initialContent,
    // Noi dung trang chu thay doi rat cham - 5 phut la du
    staleTime: 5 * 60 * 1000,
  });

/**
 * Parse text thanh filter + text con lai + tokens. Pure memoization theo
 * keyword, de UI render chip ngay lap tuc (khong doi server).
 */
export const useParseSearch = (keyword: string) => useMemo(() => parseSearchQuery(keyword), [keyword]);

/** Goi y tu khoa cho thanh tim kiem hero. */
export const useSearchSuggestions = (keyword: string) =>
  useQuery<HomeSuggestions>({
    queryKey: ['home-search-suggest', keyword] as const,
    queryFn: () => HomeService.suggest(keyword),
    enabled: keyword.trim().length > 0,
    // Goi y nen "tuoi" nhanh - chi can 1 ki tu moi cung goi lai
    staleTime: 30 * 1000,
  });
