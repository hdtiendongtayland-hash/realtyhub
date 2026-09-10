'use client';

import { useQuery } from '@tanstack/react-query';
import { EventService } from '../services/event.service';
import type { EventItem } from '../models/event.model';

/**
 * `initialEvent` do route (server component) doc san va truyen xuong, nen
 * HTML tra ve tu server da co du noi dung - quan trong voi SEO trang chi tiet.
 * Khong co no thi lan tai dau chi ra khung xuong.
 */
export const useEventDetail = (slug: string, initialEvent?: EventItem | null) =>
  useQuery({
    queryKey: ['event-detail', slug] as const,
    queryFn: () => EventService.detail(slug),
    initialData: initialEvent ?? undefined,
    staleTime: 5 * 60 * 1000,
  });