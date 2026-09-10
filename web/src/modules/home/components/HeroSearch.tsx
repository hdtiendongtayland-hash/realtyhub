'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch } from 'react-icons/fi';
import { HiX } from 'react-icons/hi';
import {
  HiOutlineBuildingOffice2,
  HiOutlineMapPin,
  HiOutlineUserGroup,
} from 'react-icons/hi2';
import type {
  HomeBannerSlide,
  HomeSuggestion,
  ParsedFilterChip,
} from '../models/home.model';
import type { ParsedQuery } from '../services/search-parser';
import {
  PROPERTY_TYPE_LABELS,
  VIEWPOINT_LABELS,
  formatPriceShort,
} from '@/modules/project/models/project.model';
import HeroCarousel from './HeroCarousel';
import { useParseSearch, useSearchSuggestions } from '../hooks/useHome';

const SEARCH_PROMPTS = [
  'Tên dự án, khu vực, chủ đầu tư...',
  'nhà dưới 4 tỷ',
  'căn hộ view hồ',
  'biệt thự sổ đỏ',
  'thấp tầng Hà Nội',
];

const TYPE_SPEED_MS = 70; // thoi gian giua cac lan go mot chu
const DELETE_SPEED_MS = 35; // xoa nhanh hon go
const PAUSE_AFTER_TYPE_MS = 1400; // dung lai khi go xong truoc khi xoa

/** Debounce truoc khi goi suggest: tranh 1 lan go = 1 query */
const SUGGEST_DEBOUNCE_MS = 200;

/** Key URL tren trang /du-an - phai khop voi ProjectListPage.PARAM */
const PROJECT_PARAM = {
  search: 'q',
  propertyType: 'lh',
  segment: 'pk',
  legal: 'pl',
  priceMin: 'gia-tu',
  priceMax: 'gia-den',
  areaMax: 'dt',
  bedrooms: 'pn',
  viewpoints: 'vw',
} as const;

type HeroSearchProps = {
  /** Tat ca banner se xoay vong trong carousel. Neu chi co 1 van render binh thuong. */
  slides: HomeBannerSlide[];
};

type TypePhase = 'typing' | 'pausing' | 'deleting';

/** Icon theo tung loai goi y - giu UI dong nhat voi cac khoi khac */
const SUGGESTION_ICON: Record<HomeSuggestion['kind'], React.ComponentType<{ className?: string }>> = {
  project: HiOutlineBuildingOffice2,
  region: HiOutlineMapPin,
  developer: HiOutlineUserGroup,
};

/** Noi cac goi y thanh mot danh sach phang de keyboard nav (↑/↓) va render */
const flattenSuggestions = (groups: {
  projects: HomeSuggestion[];
  regions: HomeSuggestion[];
  developers: HomeSuggestion[];
}) => [...groups.projects, ...groups.regions, ...groups.developers];

/** Build URL search params cho trang /du-an tu parsed filter + leftover text */
const buildProjectSearchUrl = (parsed: ParsedQuery, leftover: string): string => {
  const params = new URLSearchParams();
  if (leftover) params.set(PROJECT_PARAM.search, leftover);
  if (parsed.priceMin !== undefined) params.set(PROJECT_PARAM.priceMin, String(parsed.priceMin));
  if (parsed.priceMax !== undefined) params.set(PROJECT_PARAM.priceMax, String(parsed.priceMax));
  if (parsed.areaMax !== undefined) params.set(PROJECT_PARAM.areaMax, String(parsed.areaMax));
  if (parsed.bedrooms !== undefined) params.set(PROJECT_PARAM.bedrooms, String(parsed.bedrooms));
  if (parsed.propertyType) params.set(PROJECT_PARAM.propertyType, parsed.propertyType);
  if (parsed.segment) params.set(PROJECT_PARAM.segment, parsed.segment);
  if (parsed.legal) params.set(PROJECT_PARAM.legal, parsed.legal);
  if (parsed.viewpoints && parsed.viewpoints.length > 0) {
    params.set(PROJECT_PARAM.viewpoints, parsed.viewpoints.join(','));
  }
  const qs = params.toString();
  return qs ? `/du-an?${qs}` : '/du-an';
};

const HeroSearch = ({ slides }: HeroSearchProps) => {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [state, setState] = useState<{ index: number; charCount: number; phase: TypePhase }>({
    index: 0,
    charCount: 0,
    phase: 'typing',
  });

  // ── Dropdown goi y ─────────────────────────────────────────────────────
  // Debounce keyword truoc khi dua vao query -> khong spam request khi user go
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const wrapperRef = useRef<HTMLFormElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedKeyword(keyword), SUGGEST_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [keyword]);

  // Parse ngay lap tuc (khong debounce) de chip hien thi ngay khi go
  const { parsed, leftover, tokens } = useParseSearch(keyword);

  const { data: suggestions } = useSearchSuggestions(debouncedKeyword);
  const flatSuggestions = useMemo(
    () => flattenSuggestions(suggestions ?? { projects: [], regions: [], developers: [] }),
    [suggestions],
  );
  const hasFlatSuggestions = flatSuggestions.length > 0;

  // Chip row dung token tu parse truc tiep (de hien thi khi chua co data tu
  // server, va co originalText de xoa chip).
  const chips: ParsedFilterChip[] = useMemo(
    () =>
      tokens.map((token) => ({
        id: token.id,
        group: token.group,
        label: chipLabel(token.id, parsed),
        originalText: token.originalText,
      })),
    [tokens, parsed],
  );

  // Click ra ngoai -> dong dropdown
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleClick = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  // Hieu ung typewriter: go chu -> pause -> xoa -> next cau. Khi user da go
  // vao input (keyword !rỗng) thi dung hanh vi nay lai.
  useEffect(() => {
    if (keyword) return undefined;
    let delay: number;
    switch (state.phase) {
      case 'typing':
        delay = TYPE_SPEED_MS;
        break;
      case 'pausing':
        delay = PAUSE_AFTER_TYPE_MS;
        break;
      case 'deleting':
        delay = DELETE_SPEED_MS;
        break;
      default:
        delay = TYPE_SPEED_MS;
    }
    const id = setTimeout(() => {
      setState((prev) => {
        const text = SEARCH_PROMPTS[prev.index] ?? '';
        if (prev.phase === 'typing') {
          if (prev.charCount >= text.length) {
            return { ...prev, phase: 'pausing' };
          }
          return { ...prev, charCount: prev.charCount + 1 };
        }
        if (prev.phase === 'pausing') {
          return { ...prev, phase: 'deleting' };
        }
        // deleting
        if (prev.charCount <= 0) {
          const nextIndex = (prev.index + 1) % SEARCH_PROMPTS.length;
          return { index: nextIndex, charCount: 0, phase: 'typing' };
        }
        return { ...prev, charCount: prev.charCount - 1 };
      });
    }, delay);
    return () => clearTimeout(id);
  }, [keyword, state]);

  /** Xu ly khi user chon mot goi y: project mo trang chi tiet, region/developer fill + search */
  const applySuggestion = (suggestion: HomeSuggestion) => {
    setIsOpen(false);
    if (suggestion.href) {
      router.push(suggestion.href);
      return;
    }
    router.push(buildProjectSearchUrl(parsed, suggestion.label));
  };

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsOpen(false);
    router.push(buildProjectSearchUrl(parsed, leftover));
  };

  /** Click × tren chip: cat originalText khoi input, parser se tu bo qua token do */
  const removeChip = (chip: ParsedFilterChip) => {
    const before = keyword.slice(
      0,
      keyword.toLowerCase().indexOf(chip.originalText.toLowerCase()),
    );
    const afterStart = before.length + chip.originalText.length;
    const after = keyword.slice(afterStart);
    setKeyword(`${before} ${after}`.replace(/\s+/g, ' ').trim());
    setHighlightIndex(0);
  };

  /** Keyboard nav tren input: ArrowDown/ArrowUp/Enter/Esc */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      return;
    }
    if (!hasFlatSuggestions || !isOpen) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % flatSuggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightIndex((prev) => (prev - 1 + flatSuggestions.length) % flatSuggestions.length);
    } else if (event.key === 'Enter' && isOpen) {
      // Enter tren input se chon goi y dang highlight (neu co), neu khong
      // thi submit form nhu cu.
      const target = flatSuggestions[highlightIndex];
      if (target) {
        event.preventDefault();
        applySuggestion(target);
      }
    }
  };

  const [firstBanner] = slides;
  const hasDropdownContent = chips.length > 0 || hasFlatSuggestions;

  return (
    <section className="relative isolate -mt-16 flex min-h-[704px] items-center overflow-hidden pt-16 lg:min-h-[824px]">
      {/* Carousel 3 anh that - mobile/desktop rieng */}
      <HeroCarousel slides={slides} />

      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-black/35"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-black/20 via-transparent to-black/55"
      />

      <div className="site-container pb-20 md:pb-28 lg:pb-32">
        <div className="mx-auto max-w-3xl text-center text-white">
          <h1 className="text-3xl font-extrabold uppercase leading-tight tracking-wide [text-shadow:_0_2px_8px_rgba(0,0,0,0.6)] md:text-4xl lg:text-5xl">
            <span>#1 NỀN TẢNG DÀNH CHO</span>
            <br className="hidden md:inline" />
            <span className="md:block"> NHÀ MÔI GIỚI BẤT ĐỘNG SẢN</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base italic font-medium leading-relaxed [text-shadow:_0_1px_4px_rgba(0,0,0,0.5)] md:text-lg lg:text-xl">
            {firstBanner?.subtitle}
          </p>
        </div>

        {/* Thanh tim kiem - card trang noi bat nen nen mau dam */}
        <form
          onSubmit={submitSearch}
          role="search"
          aria-label="Tìm kiếm dự án"
          className="relative mx-auto mt-8 flex max-w-2xl items-center gap-2 rounded-full bg-white p-1.5 shadow-panel md:mt-10"
          ref={wrapperRef}
        >
          <label htmlFor="home-search" className="sr-only">
            Tìm dự án
          </label>
          <div className="flex flex-1 items-center gap-2 pl-4">
            <div className="relative flex-1">
              <input
                id="home-search"
                ref={inputRef}
                type="search"
                value={keyword}
                onChange={(event) => {
                  setKeyword(event.target.value);
                  setHighlightIndex(0);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                onKeyDown={handleKeyDown}
                role="combobox"
                aria-expanded={isOpen && hasDropdownContent}
                aria-controls="home-search-suggestions"
                aria-autocomplete="list"
                aria-activedescendant={
                  isOpen && flatSuggestions[highlightIndex]
                    ? `home-suggest-${highlightIndex}`
                    : undefined
                }
                aria-label="Tìm dự án"
                className="w-full bg-transparent py-2.5 text-theme-sm text-gray-800 outline-none"
                autoComplete="off"
              />

              {keyword === '' && (() => {
                const text = SEARCH_PROMPTS[state.index] ?? '';
                const visible = text.slice(0, state.charCount);
                return (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 flex items-center overflow-hidden"
                  >
                    <span className="whitespace-nowrap text-theme-sm text-gray-400">
                      {visible}
                      <span className="ml-0.5 inline-block h-4 w-px -translate-y-0.5 bg-gray-400 align-middle animate-pulse" />
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>
          <button
            type="submit"
            aria-label="Tìm kiếm"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-500 px-3 py-2.5 text-theme-sm font-semibold text-white shadow-theme-xs transition hover:bg-brand-600 sm:px-5"
          >
            <span className="hidden sm:inline">Tìm kiếm</span>
            <svg
              data-testid="icon-ai-search"
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="currentColor"
              className="inline-block size-5 shrink-0 sm:size-4"
            >
              <path
                fillRule="evenodd"
                d="m17.998 11.181-.243.445c-.759 1.387-2.751 1.387-3.51 0l-.75-1.371-1.37-.75c-1.388-.759-1.388-2.751 0-3.51l1.37-.75.75-1.37c.759-1.388 2.751-1.388 3.51 0l.75 1.37 1.37.75c1.388.759 1.388 2.75.001 3.51l-1.371.75zM16 4.834l-.459.839-.572 1.046-1.885 1.031 1.885 1.031L16 10.666l1.031-1.885 1.885-1.03-1.885-1.032z"
              />
              <path d="M11 18a7 7 0 0 0 6.046-3.47 3.94 3.94 0 0 0 2.463-1.944l.46-.842a8.96 8.96 0 0 1-1.937 4.874l3.675 3.675a1 1 0 0 1-1.414 1.414l-3.675-3.675A9 9 0 1 1 12.97 2.217q-.27.313-.48.698l-.47.857-.457.25A7 7 0 1 0 11 18m9.125-15.486a.4.4 0 0 1 .75 0l.101.273a.4.4 0 0 0 .237.237l.273.1a.4.4 0 0 1 0 .751l-.273.101a.4.4 0 0 0-.237.237l-.1.273a.4.4 0 0 1-.751 0l-.101-.273a.4.4 0 0 0-.237-.237l-.273-.1a.4.4 0 0 1 0-.751l.273-.101a.4.4 0 0 0 .237-.237l.1-.273Z" />
            </svg>
          </button>

          {/* Dropdown: chip row + goi y */}
          {isOpen && hasDropdownContent && (
            <div
              id="home-search-suggestions"
              role="listbox"
              aria-label="Gợi ý tìm kiếm"
              className="absolute left-0 right-0 top-full z-30 mt-2 max-h-[420px] overflow-y-auto rounded-2xl border border-gray-100 bg-white py-2 text-left shadow-panel"
            >
              {/* Chip row - hien thi ngay khi parse ra filter, ko doi server */}
              {chips.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 px-3 pb-2">
                  <span className="text-theme-xs font-medium uppercase tracking-wide text-gray-500">
                    Bo loc
                  </span>
                  {chips.map((chip) => (
                    <span
                      key={chip.id}
                      className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-theme-xs font-medium text-brand-700"
                    >
                      {chip.label}
                      <button
                        type="button"
                        aria-label={`Xoa bo loc ${chip.label}`}
                        onMouseDown={(event) => {
                          // Khong preventDefault de khong gay bat ngo cho
                          // state cua input; chi can dong dropdown.
                          event.stopPropagation();
                          removeChip(chip);
                        }}
                        className="inline-flex size-4 items-center justify-center rounded-full text-brand-600 transition hover:bg-brand-100 hover:text-brand-800"
                      >
                        <HiX className="size-3" aria-hidden />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Suggestions list */}
              {hasFlatSuggestions && (
                <ul>
                  {flatSuggestions.map((suggestion, index) => {
                    const Icon = SUGGESTION_ICON[suggestion.kind];
                    const active = index === highlightIndex;
                    return (
                      <li
                        key={`${suggestion.kind}-${suggestion.label}-${index}`}
                        id={`home-suggest-${index}`}
                        role="option"
                        aria-selected={active}
                        onMouseEnter={() => setHighlightIndex(index)}
                        onMouseDown={(event) => {
                          // onMouseDown chu khong phai onClick de chay truoc khi
                          // input blur (blur se dong dropdown truoc khi click).
                          event.preventDefault();
                          applySuggestion(suggestion);
                        }}
                        className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 text-theme-sm transition ${
                          active ? 'bg-brand-50 text-brand-700' : 'text-gray-800 hover:bg-gray-50'
                        }`}
                      >
                        <Icon
                          className={`size-5 shrink-0 ${
                            active ? 'text-brand-600' : 'text-gray-400'
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium">{suggestion.label}</div>
                          <div className="truncate text-theme-xs text-gray-500">
                            {suggestion.sublabel}
                          </div>
                        </div>
                        <FiSearch
                          aria-hidden
                          className={`size-4 shrink-0 ${
                            active ? 'text-brand-500' : 'text-gray-300'
                          }`}
                        />
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </form>
      </div>
    </section>
  );
};

/**
 * Format nhan cho chip - tra ve chuoi tieng Viet co dau de hien thi.
 * Parser khong tra label vi label tuy thuoc vao parsed value, can dinh nghia
 * o day de dung chung giua dropdown va submit URL.
 */
const chipLabel = (id: string, parsed: ParsedQuery): string => {
  if (id === 'priceMin' && parsed.priceMin !== undefined) {
    return formatPriceShort(parsed.priceMin).replace(/^(\d)/, 'Tr\u00EAn $1');
  }
  if (id === 'priceMax' && parsed.priceMax !== undefined) {
    return `D\u01B0\u1EDBi ${formatPriceShort(parsed.priceMax)}`;
  }
  if (id === 'areaMax' && parsed.areaMax !== undefined) {
    return `Tr\u1EA7n ${parsed.areaMax} m\u00B2`;
  }
  if (id === 'bedrooms' && parsed.bedrooms !== undefined) {
    return `${parsed.bedrooms}+ ph\u00F2ng ng\u1EE7`;
  }
  if (id === 'propertyType' && parsed.propertyType) {
    return PROPERTY_TYPE_LABELS[parsed.propertyType];
  }
  if (id === 'segment' && parsed.segment) {
    return parsed.segment === 'cao-tang' ? 'Cao t\u1EA7ng' : 'Th\u1EA5p t\u1EA7ng';
  }
  if (id === 'legal' && parsed.legal) {
    const labels = {
      'so-lau-dai': 'S\u1ED5 l\u00E2u d\u00E0i',
      'so-50-nam': 'S\u1EDF h\u1EEFu 50 n\u0103m',
      'dang-hoan-thien': '\u0110ang ho\u00E0n thi\u1EC7n',
    };
    return labels[parsed.legal];
  }
  if (id.startsWith('view:') && parsed.viewpoints) {
    const key = id.slice(5) as keyof typeof VIEWPOINT_LABELS;
    return VIEWPOINT_LABELS[key] ?? id;
  }
  return id;
};

export default HeroSearch;
