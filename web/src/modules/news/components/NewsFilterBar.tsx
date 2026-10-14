'use client';

import { FiBarChart2, FiGrid } from 'react-icons/fi';

import HeroFilterBar from '@/common/components/HeroFilterBar';

const SORT_OPTIONS = [{ value: 'cu-nhat', label: 'Cũ nhất trước' }];

/** Bo loc trang /tin-tuc - cung kieu bo loc trang Su kien */
const NewsFilterBar = ({ categoryOptions }: { categoryOptions: { value: string; label: string }[] }) => (
  <HeroFilterBar
    searchPlaceholder="Tìm bài viết, dự án, chủ đề..."
    withDateRange
    resetParams={['page']}
    selects={[
      { param: 'category', label: 'Chuyên mục', icon: FiGrid, options: categoryOptions },
      { param: 'sort', label: 'Sắp xếp', icon: FiBarChart2, options: SORT_OPTIONS, allLabel: 'Mới nhất' },
    ]}
  />
);

export default NewsFilterBar;
