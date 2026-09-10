/**
 * Mock data thực tế cho dự án Blanca City.
 *
 * Dữ liệu được chuyển đổi từ demo.json thành format ProjectDetail.
 * Dùng cho demo và phát triển FE trước khi có API thực.
 */
import type {
  LocationHighlight,
  LocationIcon,
  MasterPlanMap,
  MediaSlide,
  Panorama,
  PlanMarker,
  ProjectAmenity,
  ProjectConsultant,
  ProjectDetail,
  ProjectDocument,
  ProjectPhase,
  ProjectProduct,
  ProjectSpec,
  ProjectStat,
  ProjectStorySection,
  ProjectVideo,
  ProgressMilestone,
  SalesPolicy,
  UnitFundType,
  UnitStatus,
} from '../models/project-detail.model';
import type { Project } from '../models/project.model';

// ── Base Project data ──────────────────────────────────────────────────────

const BLANCA_CITY: Project = {
  publicId: 'prj-blanca-city',
  slug: 'blanca-city-1777362890000',
  name: 'BLANCA CITY',
  tagline: 'Khu đô thị phức hợp cao cấp tại Bãi Sau, Vũng Tàu',
  address: 'Đường 3 Tháng 2, Phường 10, Vũng Tàu, Bà Rịa – Vũng Tàu, Việt Nam',
  segment: 'cao-tang',
  status: 'dang-mo-ban',
  propertyType: 'can-ho',
  developerId: 'cdt-sun-group',
  developerName: 'Sun Group',
  regionId: 'kv-ba-ria-vung-tau',
  regionName: 'Bà Rịa – Vũng Tàu',
  thumbnailUrl:
    'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/1f0e3dad99908345f7439f8ffabdffc4/2026/04/28/5db2f4a1-52d4-44a8-93eb-e2782f2b95ab-optimized.jpg',
  thumbnailUrls: [
    'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/1f0e3dad99908345f7439f8ffabdffc4/2026/04/28/5db2f4a1-52d4-44a8-93eb-e2782f2b95ab-optimized.jpg',
    'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/1f0e3dad99908345f7439f8ffabdffc4/2026/04/28/c24b0aa5-6518-4602-8868-3be15b231156-optimized.jpg',
    'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/1f0e3dad99908345f7439f8ffabdffc4/2026/04/28/9f6e2442-a67b-4118-8964-5d886a00e874-optimized.jpg',
  ],
  detailUrl: '/gio-hang/blanca-city-1777362890000',
  isHot: true,
  publishedAt: '2026-04-28T14:54:50.000Z',
  priceFrom: 0,
  areaFrom: 35,
  areaTo: 93,
  bedroomOptions: [0, 1, 2, 3],
  latitude: 10.4114,
  longitude: 107.1362,
  scaleHa: 96.6,
  handoverYear: 2026,
  amenityTags: [
    'be-boi',
    'cong-vien',
    'truong-hoc',
    'trung-tam-thuong-mai',
    'ham-do-xe',
    'an-ninh-24-7',
    'khu-vui-choi',
  ],
  viewpoints: ['view-bien'],
  legal: 'so-50-nam',
  hasDiscount: true,
  hasBankSupport: true,
};

// ── Helper functions ───────────────────────────────────────────────────────

const createMediaSlides = (images: string[], captions: string[]): MediaSlide[] =>
  images.map((imageUrl, index) => ({
    publicId: `bc-hero-${index + 1}`,
    imageUrl,
    caption: captions[index] || `Hình ${index + 1}`,
  }));

const createPlanMarkers = (units: Array<{ code: string; price: number; status: UnitStatus }>): PlanMarker[] =>
  units.map((unit, index) => ({
    publicId: `bc-marker-${index + 1}`,
    code: unit.code,
    price: unit.price,
    fundType: 'an-cheo' as UnitFundType,
    phaseName: 'Beacon Tower',
    propertyTypeLabel: '2PN',
    landArea: 68,
    status: unit.status,
    x: 20 + (index % 10) * 6,
    y: 30 + Math.floor(index / 10) * 8,
  }));

// ── Hero Images (from fileAttachments type 27) ─────────────────────────────

const HERO_IMAGES = [
  'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/1f0e3dad99908345f7439f8ffabdffc4/2026/04/28/5db2f4a1-52d4-44a8-93eb-e2782f2b95ab-optimized.jpg',
  'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/1f0e3dad99908345f7439f8ffabdffc4/2026/04/28/c24b0aa5-6518-4602-8868-3be15b231156-optimized.jpg',
  'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/1f0e3dad99908345f7439f8ffabdffc4/2026/04/28/9f6e2442-a67b-4118-8964-5d886a00e874-optimized.jpg',
  'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/1f0e3dad99908345f7439f8ffabdffc4/2026/04/28/3b74ae55-09bd-48f8-97a7-1baae1e29a69-optimized.jpg',
  'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/1f0e3dad99908345f7439f8ffabdffc4/2026/04/28/7a694029-3258-491f-b3a2-824ca4b70609-optimized.jpg',
];

const HERO_CAPTIONS = [
  'Phối cảnh tổng thể Blanca City',
  'Khu vực bể bơi tầng 20',
  'Mặt tiền biển',
  'Khu trung tâm thương mại',
  'Công viên nội khu',
];

// ── Product Types (from overviewInfo description) ───────────────────────────

const PRODUCTS: ProjectProduct[] = [
  {
    publicId: 'bc-product-1',
    name: 'Studio',
    areaLabel: 'Diện tích 35,8 m²',
    imageUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/demo-inventory/1f0e3dad99908345f7439f8ffabdffc4/2026/04/28/c4eceff5-9c9c-4a5a-b58d-8bd15f0de2d4-optimized.jpg',
  },
  {
    publicId: 'bc-product-2',
    name: 'Căn 1PN+1',
    areaLabel: 'Diện tích 49,3 m²',
    imageUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/demo-inventory/1f0e3dad99908345f7439f8ffabdffc4/2026/04/28/81b1d973-32fc-476c-abf9-0b5a86ba624b-optimized.jpg',
  },
  {
    publicId: 'bc-product-3',
    name: 'Căn 2PN',
    areaLabel: 'Diện tích 68,8 m²',
    imageUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/demo-inventory/1f0e3dad99908345f7439f8ffabdffc4/2026/04/28/c850138a-6686-4dd3-8f28-af90f45bc2e8-optimized.jpg',
  },
  {
    publicId: 'bc-product-4',
    name: 'Căn 2PN+1',
    areaLabel: 'Diện tích 79,2 m²',
    imageUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/demo-inventory/1f0e3dad99908345f7439f8ffabdffc4/2026/04/28/393bd55b-4a7d-4d4f-b4bb-d12e6241cfe4-optimized.jpg',
  },
  {
    publicId: 'bc-product-5',
    name: 'Căn 3PN',
    areaLabel: 'Diện tích 93,1 m²',
    imageUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/demo-inventory/1f0e3dad99908345f7439f8ffabdffc4/2026/04/28/040c95e1-82f9-4b53-bd77-03a44df6d1c0-optimized.jpg',
  },
];

// ── Amenities (from overviewInfo) ─────────────────────────────────────────

const AMENITIES: ProjectAmenity[] = [
  {
    publicId: 'bc-amenity-1',
    name: 'Khu khách sạn cao tầng',
    imageUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/util/1f0e3dad99908345f7439f8ffabdffc4/2026/04/28/5e20aafe-2e5c-46b9-ab16-3e7c1efdd50e-optimized.jpg',
  },
  {
    publicId: 'bc-amenity-2',
    name: 'Trung tâm thương mại',
    imageUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/util/1f0e3dad99908345f7439f8ffabdffc4/2026/04/28/cd9dac48-0f05-4e94-a701-b08bb482d7b5-optimized.jpg',
  },
  {
    publicId: 'bc-amenity-3',
    name: 'Sun World',
    imageUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/util/1f0e3dad99908345f7439f8ffabdffc4/2026/04/28/4be2135b-436d-474c-852c-6510ae3de973-optimized.jpg',
  },
  {
    publicId: 'bc-amenity-4',
    name: 'Sun Coastal Park',
    imageUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/util/1f0e3dad99908345f7439f8ffabdffc4/2026/04/28/dbff1dd9-21cc-4a00-8fc7-b61628db8e66-optimized.png',
  },
];

// ── Consultants (from quickContacts) ──────────────────────────────────────

const CONSULTANTS: ProjectConsultant[] = [
  {
    publicId: 'bc-consultant-1',
    role: 'GĐDA',
    name: 'Ms. Phương Trâm',
    phone: '0938888928',
  },
  {
    publicId: 'bc-consultant-2',
    role: 'Admin',
    name: 'Ms. Thùy Linh',
    phone: '0931532777',
  },
  {
    publicId: 'bc-consultant-3',
    role: 'Admin',
    name: 'Ms. Ân Phúc',
    phone: '0921498777',
  },
];

// ── Location Highlights ────────────────────────────────────────────────────

const LOCATION_HIGHLIGHTS: LocationHighlight[] = [
  {
    publicId: 'bc-loc-1',
    icon: 'plane' as LocationIcon,
    title: '30 phút tới sân bay Long Thành',
    description: 'Kết nối trực tiếp qua cao tốc Biên Hòa - Vũng Tàu',
  },
  {
    publicId: 'bc-loc-2',
    icon: 'car' as LocationIcon,
    title: '5 phút tới trung tâm Vũng Tàu',
    description: 'Nằm ngay trục đường 3 Tháng 2, kết nối nhanh mọi điểm đến',
  },
  {
    publicId: 'bc-loc-3',
    icon: 'ship' as LocationIcon,
    title: 'Bãi Sau - Bãi biển riêng 1km',
    description: 'Sở hữu bờ biển riêng dài 1km ngay dưới chân dự án',
  },
  {
    publicId: 'bc-loc-4',
    icon: 'globe' as LocationIcon,
    title: '15 phút tới Bến phà Cần Giờ',
    description: 'Kết nối giao thông đường thủy về TP.HCM',
  },
];

// ── Phases ────────────────────────────────────────────────────────────────

const PHASES: ProjectPhase[] = [
  {
    publicId: 'bc-phase-1',
    slug: 'beacon-tower',
    name: 'Beacon Tower',
    imageUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/demo-inventory/1f0e3dad99908345f7439f8ffabdffc4/2026/04/28/81b1d973-32fc-476c-abf9-0b5a86ba624b-optimized.jpg',
    totalUnits: 500,
    priceFrom: 0,
    priceTo: 0,
    headline: 'Tòa tháp cao 34 tầng với tầm nhìn 360° ra biển',
    description:
      'Beacon Tower là tòa tháp đầu tiên của Blanca City, mang thiết kế hình cánh buồm vươn ra biển lớn. Tòa tháp cao 34 tầng với các căn hộ từ Studio đến 3PN, tầm nhìn panorama ôm trọn biển trời Bãi Sau.',
    specs: [
      { label: 'Tên dự án', value: 'Blanca City' },
      { label: 'Tổng căn', value: '500' },
      { label: 'Tiêu chuẩn bàn giao', value: 'Hoàn thiện nội thất cao cấp' },
      { label: 'Diện tích căn', value: '35,8 - 93,1 m²' },
      { label: 'Phong cách xây dựng', value: 'Hiện đại, sang trọng' },
      { label: 'Hình thức sở hữu', value: 'Sở hữu 50 năm' },
      { label: 'Tổng diện tích', value: '96,6 ha' },
      { label: 'Chủ đầu tư', value: 'Sun Group' },
    ],
    masterPlanImages: [
      {
        publicId: 'bc-phase-1-plan-1',
        imageUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/1f0e3dad99908345f7439f8ffabdffc4/2026/04/28/f8a0a15e-0d00-457d-9662-f22117834b38-optimized.jpg',
        caption: 'Mặt bằng tổng thể Beacon Tower',
      },
    ],
  },
];

// ── Master Plan Map ────────────────────────────────────────────────────────

const PLAN_MARKERS: PlanMarker[] = [
  { publicId: 'bc-pm-1', code: 'BT-01', price: 0, fundType: 'doc-quyen', phaseName: 'Beacon Tower', propertyTypeLabel: '2PN', landArea: 68, status: 'con-hang', x: 25, y: 35 },
  { publicId: 'bc-pm-2', code: 'BT-02', price: 0, fundType: 'an-cheo', phaseName: 'Beacon Tower', propertyTypeLabel: '2PN', landArea: 68, status: 'con-hang', x: 35, y: 35 },
  { publicId: 'bc-pm-3', code: 'BT-03', price: 0, fundType: 'an-cheo', phaseName: 'Beacon Tower', propertyTypeLabel: '1PN+1', landArea: 49, status: 'con-hang', x: 45, y: 35 },
  { publicId: 'bc-pm-4', code: 'BT-04', price: 0, fundType: 'an-cheo', phaseName: 'Beacon Tower', propertyTypeLabel: '3PN', landArea: 93, status: 'con-hang', x: 55, y: 35 },
  { publicId: 'bc-pm-5', code: 'BT-05', price: 0, fundType: 'doc-quyen', phaseName: 'Beacon Tower', propertyTypeLabel: '2PN+1', landArea: 79, status: 'con-hang', x: 65, y: 35 },
  { publicId: 'bc-pm-6', code: 'BT-06', price: 0, fundType: 'thuong', phaseName: 'Beacon Tower', propertyTypeLabel: 'Studio', landArea: 35, status: 'da-ban', x: 25, y: 50 },
  { publicId: 'bc-pm-7', code: 'BT-07', price: 0, fundType: 'thuong', phaseName: 'Beacon Tower', propertyTypeLabel: '2PN', landArea: 68, status: 'con-hang', x: 35, y: 50 },
  { publicId: 'bc-pm-8', code: 'BT-08', price: 0, fundType: 'an-cheo', phaseName: 'Beacon Tower', propertyTypeLabel: '1PN+1', landArea: 49, status: 'con-hang', x: 45, y: 50 },
];

const MASTER_PLAN_MAP: MasterPlanMap = {
  imageUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/1f0e3dad99908345f7439f8ffabdffc4/2026/04/28/f8a0a15e-0d00-457d-9662-f22117834b38-optimized.jpg',
  width: 1600,
  height: 1000,
  markers: PLAN_MARKERS,
};

// ── Panoramas ──────────────────────────────────────────────────────────────

const PANORAMAS: Panorama[] = [
  {
    publicId: 'bc-pano-1',
    title: 'Toàn cảnh từ trên cao',
    imageUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/1f0e3dad99908345f7439f8ffabdffc4/2026/05/30/58c0d025-7a3c-49d8-bc37-10c0f5873b5f-optimized.jpg',
    hotspots: [
      { publicId: 'bc-pano-1-hs-1', label: 'BEACON TOWER', x: 50, y: 30 },
      { publicId: 'bc-pano-1-hs-2', label: 'BÃI BIỂN', x: 70, y: 60 },
      { publicId: 'bc-pano-1-hs-3', label: 'TRUNG TÂM THƯƠNG MẠI', x: 30, y: 50 },
    ],
  },
  {
    publicId: 'bc-pano-2',
    title: 'Khu bể bơi tầng 20',
    imageUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/1f0e3dad99908345f7439f8ffabdffc4/2026/05/30/69ad08dd-14a0-4d67-a536-88c777c9b6f2-optimized.jpg',
    hotspots: [
      { publicId: 'bc-pano-2-hs-1', label: 'HỒ BƠI CHÍNH', x: 40, y: 45 },
      { publicId: 'bc-pano-2-hs-2', label: 'SKY BAR', x: 60, y: 35 },
    ],
  },
];

// ── Training Videos ────────────────────────────────────────────────────────

const TRAINING_VIDEOS: ProjectVideo[] = [
  {
    publicId: 'bc-training-1',
    title: 'Tổng quan dự án Blanca City và lợi thế cạnh tranh',
    thumbnailUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/1f0e3dad99908345f7439f8ffabdffc4/2026/04/28/b0cddd7c-00d4-4daa-902c-2bebc975f250-optimized.jpg',
    videoUrl: 'https://youtu.be/_z_RRlyhS74?si=6vlw9sO2dyHK9JGz',
  },
  {
    publicId: 'bc-training-2',
    title: 'Kịch bản tư vấn và xử lý từ chối cho Blanca City',
    thumbnailUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/1f0e3dad99908345f7439f8ffabdffc4/2026/04/28/ff8282bc-4186-4093-95c0-e8d4dd9052c2-optimized.jpg',
    videoUrl: 'https://youtu.be/_z_RRlyhS74?si=6vlw9sO2dyHK9JGz',
  },
];

// ── Sales Policy ────────────────────────────────────────────────────────────

const SALES_POLICY: SalesPolicy = {
  headline: 'Chính sách bán hàng dự án Blanca City',
  discountTitle: 'Khách hàng thanh toán sớm',
  discounts: [
    {
      publicId: 'bc-discount-1',
      label: 'Thanh toán trước 30 ngày',
      percent: '8%',
    },
    {
      publicId: 'bc-discount-2',
      label: 'Thanh toán trước 60 ngày',
      percent: '6%',
    },
  ],
  perks: [
    {
      publicId: 'bc-perk-1',
      title: 'Chính sách hỗ trợ lãi suất trần không quá',
      value: '6',
      unit: '%/năm',
      note: '',
    },
    {
      publicId: 'bc-perk-2',
      title: 'Đảm bảo lãi suất',
      value: '8',
      unit: '%/năm',
      note: 'trong 24 tháng đầu tiên',
    },
    {
      publicId: 'bc-perk-3',
      title: 'Miễn phí quản lý',
      value: '03',
      unit: 'năm',
      note: '',
    },
    {
      publicId: 'bc-perk-4',
      title: 'Gói nội thất cao cấp trị giá',
      value: '150',
      unit: 'triệu',
      note: '',
    },
  ],
  interestSchedules: [
    {
      publicId: 'bc-interest-1',
      title: 'Chính sách hỗ trợ lãi suất',
      terms: ['12 tháng', '18 tháng', '24 tháng', '36 tháng'],
      rows: [
        {
          publicId: 'bc-interest-1-row-1',
          label: 'Vay 70%',
          note: '',
          values: ['0%', '5%', '7%', '10%'],
        },
        {
          publicId: 'bc-interest-1-row-2',
          label: 'Vay 80%',
          note: 'Áp dụng với khách hàng đủ điều kiện',
          values: ['0%', '6%', '8%', '12%'],
        },
      ],
    },
  ],
  loyalty: {
    title: 'Chương trình khách hàng thân thiết',
    note: 'Chiết khấu cho khách giới thiệu thành công',
    tiers: [
      { publicId: 'bc-tier-1', name: 'Hạng Đồng', percent: '0.3%' },
      { publicId: 'bc-tier-2', name: 'Hạng Bạc', percent: '0.5%' },
      { publicId: 'bc-tier-3', name: 'Hạng Vàng', percent: '0.8%' },
    ],
  },
  payment: {
    title: 'Tiến độ thanh toán',
    plans: [
      {
        publicId: 'bc-plan-1',
        name: 'Tiến độ chuẩn',
        steps: [
          {
            publicId: 'bc-plan-1-step-1',
            label: 'Đặt cọc',
            note: 'Khi ký HĐĐC',
            value: '20%',
          },
          {
            publicId: 'bc-plan-1-step-2',
            label: 'Thanh toán đợt 1',
            note: 'Sau 30 ngày',
            value: '10%',
          },
          {
            publicId: 'bc-plan-1-step-3',
            label: 'Thanh toán đợt 2',
            note: 'Sau 60 ngày',
            value: '10%',
          },
          {
            publicId: 'bc-plan-1-step-4',
            label: 'Thanh toán đợt 3',
            note: 'Khi bàn giao',
            value: '60%',
          },
        ],
      },
    ],
  },
};

// ── Progress Milestones ─────────────────────────────────────────────────────

const PROGRESS: ProgressMilestone[] = [
  {
    publicId: 'bc-progress-1',
    label: 'Quý 2/2025 - Khởi công',
    date: '2025-04-01',
    videoThumbnailUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/1f0e3dad99908345f7439f8ffabdffc4/2026/04/28/5db2f4a1-52d4-44a8-93eb-e2782f2b95ab-optimized.jpg',
    videoUrl: '#',
    images: [
      'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/1f0e3dad99908345f7439f8ffabdffc4/2026/05/30/62d16717-b62f-4db5-a41b-af0e74660139-optimized.jpg',
      'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/1f0e3dad99908345f7439f8ffabdffc4/2026/05/30/da61c6b6-75cd-48ed-93f0-ffdc7ce845e7-optimized.jpg',
    ],
  },
  {
    publicId: 'bc-progress-2',
    label: 'Quý 4/2026 - Bàn giao dự kiến',
    date: '2026-10-01',
    videoThumbnailUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/1f0e3dad99908345f7439f8ffabdffc4/2026/08/07/fbf37e6c-e29f-43fd-b44c-8a3503a8e209-optimized.jpg',
    videoUrl: '#',
    images: [
      'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/1f0e3dad99908345f7439f8ffabdffc4/2026/05/30/dd5c16f8-b270-4bfc-a960-dab7d4926b68-optimized.jpg',
    ],
  },
];

// ── Documents ────────────────────────────────────────────────────────────────

const DOCUMENTS: ProjectDocument[] = [
  { publicId: 'bc-doc-1', order: 1, name: 'Tổng mặt bằng', url: '#' },
  { publicId: 'bc-doc-2', order: 2, name: 'Brochure dự án', url: '#' },
  { publicId: 'bc-doc-3', order: 3, name: 'Mặt bằng căn hộ Beacon Tower', url: '#' },
  { publicId: 'bc-doc-4', order: 4, name: 'Chính sách bán hàng', url: '#' },
  { publicId: 'bc-doc-5', order: 5, name: 'Tiện ích dự án', url: '#' },
];

// ── Stats & Specs ─────────────────────────────────────────────────────────────

const STATS: ProjectStat[] = [
  { key: 'scale', label: 'Quy mô dự án', value: '96,6 ha' },
  { key: 'capital', label: 'Tổng vốn đầu tư', value: 'Đang cập nhật' },
  { key: 'population', label: 'Quy mô dân số', value: 'Đang cập nhật' },
];

const SPECS: ProjectSpec[] = [
  { label: 'Tên dự án', value: 'Blanca City' },
  { label: 'Vị trí', value: 'Đường 3 Tháng 2, Phường 10, Vũng Tàu, Bà Rịa – Vũng Tàu' },
  { label: 'Quy mô dự án', value: '96,6 ha' },
  { label: 'Chủ đầu tư', value: 'Công ty TNHH Đầu tư và phát triển đô thị Vũng Tàu (Sun Group)' },
  { label: 'Phát triển dự án', value: 'Sun Group' },
  { label: 'Quản lý vận hành', value: 'Sun Property Management' },
  { label: 'Nhà thầu thi công', value: 'Contecon hoặc Hòa Bình' },
  { label: 'Loại hình sản phẩm', value: 'Căn hộ cao cấp, Shophouse, Nhà phố, Biệt thự' },
  { label: 'Hình thức sở hữu', value: 'Sở hữu 50 năm (không bán cho khách nước ngoài)' },
  { label: 'Khởi công', value: 'Quý 2/2025' },
  { label: 'Giao nhà', value: 'Quý 4/2026' },
  { label: 'Tiêu chuẩn bàn giao', value: 'Hoàn thiện nội thất cao cấp' },
];

// ── Story Sections ─────────────────────────────────────────────────────────

const INTRO: ProjectStorySection = {
  title: 'Giới thiệu dự án',
  body: 'Blanca City do Sun Group phát triển tại Bãi Sau, Vũng Tàu — chỉ cách sân bay Long Thành 30 phút. Dự án mang sắc trắng thuần khiết, các tòa tháp cao 34–40 tầng có hình dáng như những cánh buồm vươn ra biển lớn, sở hữu tầm nhìn 360° ôm trọn biển trời.',
  videoThumbnailUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/1f0e3dad99908345f7439f8ffabdffc4/2026/05/30/5cf9af34-46d9-4db6-839e-6b7e791b690f-optimized.jpg',
  videoUrl: 'https://youtu.be/_z_RRlyhS74?si=6vlw9sO2dyHK9JGz',
};

const CLOSING: ProjectStorySection = {
  title: 'Chuẩn sống thượng lưu ngay bên bờ biển',
  body: 'Blanca City là lựa chọn hoàn hảo để an cư, nghỉ dưỡng chuẩn 5 sao hoặc đầu tư sinh lời bền vững. Với bể bơi và đường dạo tầng 20, Skybar rooftop, dải bờ biển riêng dài 1 km cùng Trung tâm thương mại sát biển lớn nhất Việt Nam ngay dưới chân nhà.',
  videoThumbnailUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/1f0e3dad99908345f7439f8ffabdffc4/2026/07/18/ecfd0d67-897f-4d0e-8c2b-d62eaea8e7bc-optimized.jpg',
  videoUrl: '#',
};

// ── Master Plan Sheets ─────────────────────────────────────────────────────

const MASTER_PLAN_SHEETS = [
  {
    key: 'tong-quan',
    label: 'Tổng quan',
    imageUrl: 'https://dongtayland.vn/wp-content/uploads/2025/05/mat-bang-tong-update.jpg',
  },
  {
    key: 'beacon',
    label: 'Beacon Tower',
    imageUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/1f0e3dad99908345f7439f8ffabdffc4/2026/04/28/f8a0a15e-0d00-457d-9662-f22117834b38-optimized.jpg',
  },
];

// ── Full ProjectDetail ─────────────────────────────────────────────────────

export const BLANCA_CITY_DETAIL: ProjectDetail = {
  ...BLANCA_CITY,

  description: `
<p><strong>Tên dự án:</strong> Blanca City</p>
<p><strong>Địa chỉ:</strong> Đường 3 Tháng 2, Phường 10, Vũng Tàu, Bà Rịa – Vũng Tàu</p>
<p><strong>Chủ đầu tư:</strong> Công ty TNHH Đầu tư và phát triển đô thị Vũng Tàu (Sun Group)</p>
<p><strong>Quy mô:</strong> 96,6 ha</p>
<p><strong>Loại hình:</strong> Căn hộ cao cấp, Shophouse, Nhà phố, Biệt thự song lập, Biệt thự đơn lập</p>

<h3>Căn hộ</h3>
<ul>
  <li>Studio: Diện tích 35,8m²</li>
  <li>Căn 1PN+1: Diện tích 49,3m²</li>
  <li>Căn 2PN: Diện tích 68,8m²</li>
  <li>Căn 2PN+1: Diện tích 79,2m²</li>
  <li>Căn 3PN: Diện tích 93,1m²</li>
</ul>

<h3>Shophouse</h3>
<ul>
  <li>Xây 3 tầng, diện tích từ 263m² – 463m²</li>
  <li>Xây 5 tầng, diện tích từ 425m² – 800m²</li>
</ul>

<h3>Nhà phố</h3>
<ul>
  <li>Diện tích từ 242,7m² – 580m²</li>
</ul>

<h3>Biệt thự</h3>
<ul>
  <li>Song lập: Cao 3 tầng, diện tích đất từ 345m² – 380m²</li>
  <li>Đơn lập: Cao 3 tầng, diện tích đất từ 391m² – 482m²</li>
</ul>

<p><strong>Tiện ích:</strong> Khu khách sạn cao tầng, trung tâm thương mại, hội nghị, công viên nước</p>
<p><strong>Bàn giao:</strong> Hoàn thiện nội thất cao cấp</p>
<p><strong>Sở hữu:</strong> Sở hữu lâu dài/50 năm (không bán cho khách nước ngoài)</p>
<p><strong>Khởi công:</strong> Quý 2/2025</p>
<p><strong>Giao nhà:</strong> Quý 4/2026</p>
`,

  hero: createMediaSlides(HERO_IMAGES, HERO_CAPTIONS),
  stats: STATS,
  specs: SPECS,
  overviewImageUrl: HERO_IMAGES[0],
  masterPlan: MASTER_PLAN_SHEETS,
  products: PRODUCTS,
  intro: INTRO,
  amenities: AMENITIES,
  closing: CLOSING,
  consultants: CONSULTANTS,

  location: {
    bannerUrl: HERO_IMAGES[0],
    headline: 'Vị trí chiến lược tại Bãi Sau - Trung tâm du lịch mới của Vũng Tàu',
    intro: 'Blanca City tọa lạc tại Bãi Sau, một trong những bãi biển đẹp nhất Vũng Tàu, kết nối thuận tiện với các tuyến giao thông trọng điểm của khu vực.',
    highlights: LOCATION_HIGHLIGHTS,
    closing: 'Vị trí đắc địa ngay bờ biển, kết nối đồng bộ với TP.HCM và sân bay Long Thành.',
    latitude: 10.4114,
    longitude: 107.1362,
    mapLabel: 'Blanca City, Đường 3 Tháng 2, Phường 10, Vũng Tàu',
  },

  phases: PHASES,
  planMap: MASTER_PLAN_MAP,
  panoramas: PANORAMAS,
  trainingVideos: TRAINING_VIDEOS,
  salesPolicy: SALES_POLICY,
  progress: PROGRESS,
  documents: DOCUMENTS,
  news: [],
};

// Export slug for easy reference
export const BLANCA_CITY_SLUG = 'blanca-city-1777362890000';
