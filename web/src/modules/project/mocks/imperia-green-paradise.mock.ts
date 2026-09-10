/**
 * Mock data thực tế cho dự án Imperia Green Paradise.
 *
 * Dữ liệu được chuyển đổi từ imprea.json thành format ProjectDetail.
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

const IMPERIA_GREEN_PARADISE: Project = {
  publicId: 'prj-imperia-green-paradise',
  slug: 'imperia-green-paradise-1776759113000',
  name: 'IMPERIA GREEN PARADISE',
  tagline: 'Khu đô thị biểu tượng tại mặt tiền biển Cần Giờ',
  address: 'Mặt tiền biển Cần Giờ, xã Long Hòa và thị trấn Cần Thạnh, huyện Cần Giờ, TP. Hồ Chí Minh',
  segment: 'cao-tang',
  status: 'sap-mo-ban',
  propertyType: 'can-ho',
  developerId: 'cdt-mik-group',
  developerName: 'MIK Group',
  regionId: 'kv-hcm',
  regionName: 'TP. Hồ Chí Minh',
  thumbnailUrl:
    'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/6512bd43d9caa6e02c990b0a82652dca/2026/07/07/038fe24d-48ea-4461-83ee-4cddba0313b9-optimized.jpg',
  thumbnailUrls: [
    'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/6512bd43d9caa6e02c990b0a82652dca/2026/07/07/038fe24d-48ea-4461-83ee-4cddba0313b9-optimized.jpg',
    'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/6512bd43d9caa6e02c990b0a82652dca/2026/07/07/9a7081ca-1105-4617-b828-d28131a0b58c-optimized.jpg',
    'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/6512bd43d9caa6e02c990b0a82652dca/2026/07/14/3a50ab0c-d4f6-4a9c-8708-861cf38a873f-optimized.jpg',
  ],
  detailUrl: '/gio-hang/imperia-green-paradise-1776759113000',
  isHot: true,
  publishedAt: '2026-04-21T15:11:53.000Z',
  priceFrom: 0,
  areaFrom: 33,
  areaTo: 156,
  bedroomOptions: [0, 1, 2, 3],
  latitude: 10.4114,
  longitude: 106.8867,
  scaleHa: 103,
  handoverYear: 2028,
  amenityTags: [
    'be-boi',
    'cong-vien',
    'truong-hoc',
    'trung-tam-thuong-mai',
    'san-the-thao',
    'an-ninh-24-7',
    'khu-vui-choi',
  ],
  viewpoints: ['view-bien'],
  legal: 'so-lau-dai',
  hasDiscount: true,
  hasBankSupport: true,
};

// ── Hero Images (from fileAttachments type 27) ─────────────────────────────

const HERO_IMAGES = [
  'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/6512bd43d9caa6e02c990b0a82652dca/2026/07/07/038fe24d-48ea-4461-83ee-4cddba0313b9-optimized.jpg',
  'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/6512bd43d9caa6e02c990b0a82652dca/2026/07/07/9a7081ca-1105-4617-b828-d28131a0b58c-optimized.jpg',
  'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/6512bd43d9caa6e02c990b0a82652dca/2026/07/14/3a50ab0c-d4f6-4a9c-8708-861cf38a873f-optimized.jpg',
  'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/6512bd43d9caa6e02c990b0a82652dca/2026/07/14/33d72ff5-eb3f-4711-bb4b-468cbae0380d-optimized.jpg',
  'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/6512bd43d9caa6e02c990b0a82652dca/2026/07/14/9ab739a3-47fd-452e-a405-a52e56c4a797-optimized.jpg',
];

const HERO_CAPTIONS = [
  'Phối cảnh tổng thể Imperia Green Paradise',
  'Quảng trường biển Cần Giờ',
  'Tổ hợp căn hộ cao cấp',
  'Mặt tiền biển dài 1km',
  'Các tiện ích đẳng cấp quốc tế',
];

const createMediaSlides = (images: string[], captions: string[]): MediaSlide[] =>
  images.map((imageUrl, index) => ({
    publicId: `igp-hero-${index + 1}`,
    imageUrl,
    caption: captions[index] || `Hình ${index + 1}`,
  }));

// ── Product Types (from overviewInfo description) ───────────────────────────

const PRODUCTS: ProjectProduct[] = [
  {
    publicId: 'igp-product-1',
    name: 'Studio',
    areaLabel: 'Diện tích 33 m²',
    imageUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/demo-inventory/6512bd43d9caa6e02c990b0a82652dca/2026/05/20/006d96a4-f3d7-40f7-954d-3423515fc5f5-optimized.jpg',
  },
  {
    publicId: 'igp-product-2',
    name: 'Căn 1PN+1',
    areaLabel: 'Diện tích 48 m²',
    imageUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/demo-inventory/6512bd43d9caa6e02c990b0a82652dca/2026/05/20/e2cce4bd-9fef-45eb-9627-293052040ce8-optimized.jpg',
  },
  {
    publicId: 'igp-product-3',
    name: 'Căn 2PN+1WC',
    areaLabel: 'Diện tích 58 m²',
    imageUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/demo-inventory/6512bd43d9caa6e02c990b0a82652dca/2026/05/20/42fe5f13-f854-41c7-8583-7599edd37964-optimized.jpg',
  },
  {
    publicId: 'igp-product-4',
    name: 'Căn 2PN+2WC',
    areaLabel: 'Diện tích 74 m²',
    imageUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/demo-inventory/6512bd43d9caa6e02c990b0a82652dca/2026/05/20/42fe5f13-f854-41c7-8583-7599edd37964-optimized.jpg',
  },
  {
    publicId: 'igp-product-5',
    name: 'Căn 3PN',
    areaLabel: 'Diện tích 85 m²',
    imageUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/demo-inventory/6512bd43d9caa6e02c990b0a82652dca/2026/05/20/135eae58-8711-4249-9391-db8902596c19-optimized.jpg',
  },
  {
    publicId: 'igp-product-6',
    name: 'Duplex',
    areaLabel: 'Diện tích 135 m²',
    imageUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/demo-inventory/6512bd43d9caa6e02c990b0a82652dca/2026/05/20/8fe7c181-8c1f-4c7e-ab78-833a5237b0c9-optimized.jpg',
  },
  {
    publicId: 'igp-product-7',
    name: 'Penthouse',
    areaLabel: 'Diện tích 156 m²',
    imageUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/demo-inventory/6512bd43d9caa6e02c990b0a82652dca/2026/05/20/5c5c68da-6416-4644-b6da-a9d61ca03bd2-optimized.jpg',
  },
];

// ── Amenities (Tiện ích từ overviewInfo) ──────────────────────────────────

const AMENITIES: ProjectAmenity[] = [
  {
    publicId: 'igp-amenity-1',
    name: 'Siêu điểm nhấn đô thị biển',
    imageUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/util/6512bd43d9caa6e02c990b0a82652dca/2026/05/20/9c5babee-b12e-4a51-93b9-1d2816011802-optimized.jpg',
  },
  {
    publicId: 'igp-amenity-2',
    name: 'Nhà hát sóng xanh Blue Wave Theatre',
    imageUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/util/6512bd43d9caa6e02c990b0a82652dca/2026/05/20/10c96b4a-eb48-4b0a-9fe8-2dd013188f29-optimized.jpg',
  },
  {
    publicId: 'igp-amenity-3',
    name: 'Sân Golf 18 lỗ đẳng cấp số 1 thế giới',
    imageUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/util/6512bd43d9caa6e02c990b0a82652dca/2026/05/20/e48afa38-e78e-4cfb-96e0-1270342dee2d-optimized.jpg',
  },
  {
    publicId: 'igp-amenity-4',
    name: 'Biển hồ nước mặn nhân tạo 4 mùa Paradise Lagoon',
    imageUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/util/6512bd43d9caa6e02c990b0a82652dca/2026/05/20/354ff2b6-3149-46d3-9911-6fa0327872fe-optimized.jpg',
  },
  {
    publicId: 'igp-amenity-5',
    name: 'Cảng tàu Quốc tế 5 sao Landmark Harbour',
    imageUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/util/6512bd43d9caa6e02c990b0a82652dca/2026/05/20/aefe5928-fd89-410b-befd-e8404161a3c6-optimized.jpg',
  },
  {
    publicId: 'igp-amenity-6',
    name: 'Quần thể vui chơi giải trí 122 ha',
    imageUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/util/6512bd43d9caa6e02c990b0a82652dca/2026/05/20/6ff4cb88-0b2f-421a-a069-d281895288a5-optimized.jpg',
  },
];

// ── Consultants (from quickContacts) ──────────────────────────────────────

const CONSULTANTS: ProjectConsultant[] = [
  {
    publicId: 'igp-consultant-1',
    role: 'GĐDA',
    name: 'Ms. Hoàng Yến',
    phone: '0966243890',
  },
  {
    publicId: 'igp-consultant-2',
    role: 'Admin',
    name: 'Ms. Tú Trương',
    phone: '0924842777',
  },
];

// ── Location Highlights ────────────────────────────────────────────────────

const LOCATION_HIGHLIGHTS: LocationHighlight[] = [
  {
    publicId: 'igp-loc-1',
    icon: 'plane' as LocationIcon,
    title: 'Sân bay Long Thành - 60 phút',
    description: 'Kết nối trực tiếp qua cao tốc Bắc Nam và đường vành đai 3',
  },
  {
    publicId: 'igp-loc-2',
    icon: 'car' as LocationIcon,
    title: 'Trung tâm Quận 1 - 60 phút',
    description: 'Đi qua Phà Bình Khánh hoặc đường cao tốc Bến Lức - Long Thành',
  },
  {
    publicId: 'igp-loc-3',
    icon: 'ship' as LocationIcon,
    title: 'Cảng tàu Quốc tế Landmark Habour',
    description: 'Cảng du thuyền quốc tế 5 sao ngay trong dự án',
  },
  {
    publicId: 'igp-loc-4',
    icon: 'globe' as LocationIcon,
    title: 'Khu dự trữ sinh quyển Cần Giờ',
    description: 'UNESCO công nhận - hệ sinh thái rừng ngập mặn đa dạng',
  },
];

// ── Phases ────────────────────────────────────────────────────────────────

const PHASES: ProjectPhase[] = [
  {
    publicId: 'igp-phase-1',
    slug: 'the-paradise-tower',
    name: 'The Paradise Tower',
    imageUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/6512bd43d9caa6e02c990b0a82652dca/2026/07/14/3a50ab0c-d4f6-4a9c-8708-861cf38a873f-optimized.jpg',
    totalUnits: 1200,
    priceFrom: 0,
    priceTo: 0,
    headline: 'Tòa tháp biểu tượng - View trực diện biển Đông',
    description:
      'The Paradise Tower là tòa tháp đầu tiên của Imperia Green Paradise, sở hữu view trực diện biển Đông và toàn cảnh khu đô thị. Thiết kế hiện đại, đẳng cấp quốc tế với hệ tiện ích 5 sao.',
    specs: [
      { label: 'Tên dự án', value: 'Imperia Green Paradise' },
      { label: 'Tổng căn', value: '1.200' },
      { label: 'Tiêu chuẩn bàn giao', value: 'Hoàn thiện nội thất cao cấp' },
      { label: 'Diện tích căn', value: '33 - 156 m²' },
      { label: 'Phong cách xây dựng', value: 'Hiện đại, đẳng cấp quốc tế' },
      { label: 'Hình thức sở hữu', value: 'Sở hữu lâu dài' },
      { label: 'Tổng diện tích', value: '103 ha' },
      { label: 'Chủ đầu tư', value: 'MIK Group' },
    ],
    masterPlanImages: [
      {
        publicId: 'igp-phase-1-plan-1',
        imageUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/6512bd43d9caa6e02c990b0a82652dca/2026/05/20/7b8f4b79-71b3-497e-918f-b0c415237398-optimized.jpg',
        caption: 'Mặt bằng tổng thể The Paradise Tower',
      },
    ],
  },
];

// ── Master Plan Map ────────────────────────────────────────────────────────

const PLAN_MARKERS: PlanMarker[] = [
  { publicId: 'igp-pm-1', code: 'PT-A01', price: 0, fundType: 'doc-quyen', phaseName: 'The Paradise Tower', propertyTypeLabel: '1PN+1', landArea: 48, status: 'con-hang', x: 25, y: 30 },
  { publicId: 'igp-pm-2', code: 'PT-A02', price: 0, fundType: 'an-cheo', phaseName: 'The Paradise Tower', propertyTypeLabel: '2PN+1WC', landArea: 58, status: 'con-hang', x: 35, y: 30 },
  { publicId: 'igp-pm-3', code: 'PT-A03', price: 0, fundType: 'an-cheo', phaseName: 'The Paradise Tower', propertyTypeLabel: '2PN+2WC', landArea: 74, status: 'con-hang', x: 45, y: 30 },
  { publicId: 'igp-pm-4', code: 'PT-B01', price: 0, fundType: 'doc-quyen', phaseName: 'The Paradise Tower', propertyTypeLabel: '3PN', landArea: 85, status: 'con-hang', x: 55, y: 30 },
  { publicId: 'igp-pm-5', code: 'PT-B02', price: 0, fundType: 'an-cheo', phaseName: 'The Paradise Tower', propertyTypeLabel: '2PN+1WC', landArea: 58, status: 'con-hang', x: 65, y: 30 },
  { publicId: 'igp-pm-6', code: 'PT-B03', price: 0, fundType: 'thuong', phaseName: 'The Paradise Tower', propertyTypeLabel: 'Studio', landArea: 33, status: 'da-ban', x: 25, y: 50 },
  { publicId: 'igp-pm-7', code: 'PT-C01', price: 0, fundType: 'an-cheo', phaseName: 'The Paradise Tower', propertyTypeLabel: '2PN+2WC', landArea: 74, status: 'con-hang', x: 35, y: 50 },
  { publicId: 'igp-pm-8', code: 'PT-C02', price: 0, fundType: 'doc-quyen', phaseName: 'The Paradise Tower', propertyTypeLabel: 'Duplex', landArea: 135, status: 'con-hang', x: 45, y: 50 },
  { publicId: 'igp-pm-9', code: 'PT-C03', price: 0, fundType: 'thuong', phaseName: 'The Paradise Tower', propertyTypeLabel: '1PN+1', landArea: 48, status: 'con-hang', x: 55, y: 50 },
  { publicId: 'igp-pm-10', code: 'PT-D01', price: 0, fundType: 'doc-quyen', phaseName: 'The Paradise Tower', propertyTypeLabel: 'Penthouse', landArea: 156, status: 'con-hang', x: 65, y: 50 },
];

const MASTER_PLAN_MAP: MasterPlanMap = {
  imageUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/6512bd43d9caa6e02c990b0a82652dca/2026/05/20/7b8f4b79-71b3-497e-918f-b0c415237398-optimized.jpg',
  width: 2000,
  height: 1125,
  markers: PLAN_MARKERS,
};

// ── Panoramas ──────────────────────────────────────────────────────────────

const PANORAMAS: Panorama[] = [
  {
    publicId: 'igp-pano-1',
    title: 'Toàn cảnh thành phố biển Cần Giờ',
    imageUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/6512bd43d9caa6e02c990b0a82652dca/2026/07/14/86283924-7efa-4d9e-ae2f-d17663078439-optimized.jpg',
    hotspots: [
      { publicId: 'igp-pano-1-hs-1', label: 'PARADISE TOWER', x: 50, y: 30 },
      { publicId: 'igp-pano-1-hs-2', label: 'BIỂN ĐÔNG', x: 70, y: 60 },
      { publicId: 'igp-pano-1-hs-3', label: 'CẢNG DU THUYỀN', x: 30, y: 50 },
    ],
  },
  {
    publicId: 'igp-pano-2',
    title: 'Khu biển hồ nhân tạo Paradise Lagoon',
    imageUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/6512bd43d9caa6e02c990b0a82652dca/2026/07/14/e83f5b48-e84b-4368-9189-1f211c4a512f-optimized.jpg',
    hotspots: [
      { publicId: 'igp-pano-2-hs-1', label: 'LAGOON CHÍNH', x: 40, y: 45 },
      { publicId: 'igp-pano-2-hs-2', label: 'BEACH CLUB', x: 60, y: 35 },
    ],
  },
];

// ── Training Videos ────────────────────────────────────────────────────────

const TRAINING_VIDEOS: ProjectVideo[] = [
  {
    publicId: 'igp-training-1',
    title: 'Tổng quan dự án Imperia Green Paradise',
    thumbnailUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/6512bd43d9caa6e02c990b0a82652dca/2026/07/14/3a50ab0c-d4f6-4a9c-8708-861cf38a873f-optimized.jpg',
    videoUrl: 'https://youtu.be/p2Bfy_jwzPs?si=audaRZ-tlR0nWQad',
  },
  {
    publicId: 'igp-training-2',
    title: 'Kịch bản tư vấn Imperia Green Paradise',
    thumbnailUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/6512bd43d9caa6e02c990b0a82652dca/2026/07/14/33d72ff5-eb3f-4711-bb4b-468cbae0380d-optimized.jpg',
    videoUrl: 'https://youtu.be/p2Bfy_jwzPs?si=audaRZ-tlR0nWQad',
  },
];

// ── Sales Policy ────────────────────────────────────────────────────────────

const SALES_POLICY: SalesPolicy = {
  headline: 'Chính sách bán hàng Imperia Green Paradise',
  discountTitle: 'Khách hàng thanh toán sớm',
  discounts: [
    {
      publicId: 'igp-discount-1',
      label: 'Thanh toán trước 30 ngày',
      percent: '5%',
    },
    {
      publicId: 'igp-discount-2',
      label: 'Thanh toán theo tiến độ',
      percent: '3%',
    },
  ],
  perks: [
    {
      publicId: 'igp-perk-1',
      title: 'Hỗ trợ lãi suất 0%',
      value: '24',
      unit: 'tháng',
      note: 'Áp dụng với khách hàng vay ngân hàng',
    },
    {
      publicId: 'igp-perk-2',
      title: 'Cam kết cho thuê',
      value: '8',
      unit: '%/năm',
      note: 'trong 5 năm đầu',
    },
    {
      publicId: 'igp-perk-3',
      title: 'Miễn phí quản lý',
      value: '05',
      unit: 'năm',
      note: '',
    },
    {
      publicId: 'igp-perk-4',
      title: 'Gói nội thất cao cấp',
      value: '200',
      unit: 'triệu',
      note: 'tùy loại căn',
    },
  ],
  interestSchedules: [
    {
      publicId: 'igp-interest-1',
      title: 'Chính sách hỗ trợ lãi suất',
      terms: ['12 tháng', '18 tháng', '24 tháng', '36 tháng'],
      rows: [
        {
          publicId: 'igp-interest-1-row-1',
          label: 'Vay 70%',
          note: '',
          values: ['0%', '4%', '6%', '9%'],
        },
        {
          publicId: 'igp-interest-1-row-2',
          label: 'Vay 80%',
          note: 'Áp dụng với khách hàng đủ điều kiện',
          values: ['0%', '5%', '7%', '11%'],
        },
      ],
    },
  ],
  loyalty: {
    title: 'Chương trình khách hàng thân thiết',
    note: 'Chiết khấu cho khách giới thiệu thành công',
    tiers: [
      { publicId: 'igp-tier-1', name: 'Hạng Bạc', percent: '0.5%' },
      { publicId: 'igp-tier-2', name: 'Hạng Vàng', percent: '0.8%' },
      { publicId: 'igp-tier-3', name: 'Hạng Kim Cương', percent: '1.2%' },
    ],
  },
  payment: {
    title: 'Tiến độ thanh toán',
    plans: [
      {
        publicId: 'igp-plan-1',
        name: 'Tiến độ chuẩn',
        steps: [
          {
            publicId: 'igp-plan-1-step-1',
            label: 'Đặt cọc giữ chỗ',
            note: 'Khi ký thỏa thuận',
            value: '50 triệu',
          },
          {
            publicId: 'igp-plan-1-step-2',
            label: 'Ký HĐMB',
            note: 'Trong vòng 7 ngày',
            value: '15%',
          },
          {
            publicId: 'igp-plan-1-step-3',
            label: 'Thanh toán đợt 1',
            note: 'Sau 60 ngày',
            value: '10%',
          },
          {
            publicId: 'igp-plan-1-step-4',
            label: 'Bàn giao căn hộ',
            note: 'Dự kiến 2028',
            value: '75%',
          },
        ],
      },
    ],
  },
};

// ── Progress Milestones ─────────────────────────────────────────────────────

const PROGRESS: ProgressMilestone[] = [
  {
    publicId: 'igp-progress-1',
    label: 'Quý 4/2025 - Khởi công',
    date: '2025-10-01',
    videoThumbnailUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/6512bd43d9caa6e02c990b0a82652dca/2026/07/14/3a50ab0c-d4f6-4a9c-8708-861cf38a873f-optimized.jpg',
    videoUrl: '#',
    images: [
      'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/6512bd43d9caa6e02c990b0a82652dca/2026/07/14/534726a9-3ffd-47b7-8769-9ee3ae0b46ba-optimized.jpg',
      'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/6512bd43d9caa6e02c990b0a82652dca/2026/07/14/770719bd-3c14-48c0-857e-e1f029491017-optimized.jpg',
    ],
  },
  {
    publicId: 'igp-progress-2',
    label: 'Quý 4/2028 - Bàn giao dự kiến',
    date: '2028-10-01',
    videoThumbnailUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/6512bd43d9caa6e02c990b0a82652dca/2026/07/14/bb2001d8-7064-4178-ad7b-b2057c9f9e0d-optimized.jpg',
    videoUrl: '#',
    images: [
      'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/6512bd43d9caa6e02c990b0a82652dca/2026/07/14/d26f6870-0ed6-4c97-bf94-5ec310a1c951-optimized.jpg',
    ],
  },
];

// ── Documents ────────────────────────────────────────────────────────────────

const DOCUMENTS: ProjectDocument[] = [
  { publicId: 'igp-doc-1', order: 1, name: 'Mặt bằng tổng thể', url: '#' },
  { publicId: 'igp-doc-2', order: 2, name: 'Mặt bằng căn hộ', url: '#' },
  { publicId: 'igp-doc-3', order: 3, name: 'Brochure dự án', url: '#' },
  { publicId: 'igp-doc-4', order: 4, name: 'Chính sách bán hàng', url: '#' },
  { publicId: 'igp-doc-5', order: 5, name: 'Tiện ích đẳng cấp', url: '#' },
];

// ── Stats & Specs ─────────────────────────────────────────────────────────────

const STATS: ProjectStat[] = [
  { key: 'scale', label: 'Quy mô dự án', value: '103 ha' },
  { key: 'capital', label: 'Tổng vốn đầu tư', value: 'Đang cập nhật' },
  { key: 'population', label: 'Số lượng sản phẩm', value: '~5.000 căn' },
];

const SPECS: ProjectSpec[] = [
  { label: 'Tên thương mại', value: 'Imperia Green Paradise' },
  { label: 'Vị trí', value: 'Mặt tiền biển Cần Giờ, TP. Hồ Chí Minh' },
  { label: 'Quy mô dự án', value: '103 ha' },
  { label: 'Chủ đầu tư', value: 'Tập đoàn MIK Group' },
  { label: 'Loại hình sản phẩm', value: 'Căn hộ cao cấp, Penthouse, Officetel, Shophouse & Khách sạn' },
  { label: 'Số lượng sản phẩm', value: '~5.000 căn' },
  { label: 'Đa dạng loại hình', value: 'Studio 33m² → Penthouse 156m²' },
  { label: 'Tiện ích', value: 'Biển hồ nhân tạo, Sân Golf 18 lỗ, Cảng quốc tế, Bệnh viện quốc tế' },
];

// ── Story Sections ─────────────────────────────────────────────────────────

const INTRO: ProjectStorySection = {
  title: 'Giới thiệu dự án',
  body: 'Imperia Green Paradise - Khu đô thị biểu tượng tại mặt tiền biển Cần Giờ, thuộc xã Long Hòa và thị trấn Cần Thạnh, huyện Cần Giờ, TP. Hồ Chí Minh. Dự án do Tập đoàn MIK Group phát triển với sản phẩm Căn hộ cao cấp – Penthouse – Officetel – Shophouse & Khách sạn.',
  videoThumbnailUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/6512bd43d9caa6e02c990b0a82652dca/2026/07/14/3a50ab0c-d4f6-4a9c-8708-861cf38a873f-optimized.jpg',
  videoUrl: 'https://youtu.be/p2Bfy_jwzPs?si=audaRZ-tlR0nWQad',
};

const CLOSING: ProjectStorySection = {
  title: 'Điểm đến của giới thượng lưu',
  body: 'Imperia Green Paradise sở hữu Tòa tháp chọc trời 108 tầng top 10 thế giới, hệ thống bệnh viện Quốc tế Vinmec 5 sao & Cleveland Clinic, Sân Golf 18 lỗ đẳng cấp số 1 thế giới cùng biển hồ nước mặn nhân tạo 4 mùa Paradise Lagoon - tạo nên một khu đô thị đẳng cấp quốc tế hiếm có.',
  videoThumbnailUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/6512bd43d9caa6e02c990b0a82652dca/2026/07/14/33d72ff5-eb3f-4711-bb4b-468cbae0380d-optimized.jpg',
  videoUrl: '#',
};

// ── Master Plan Sheets ─────────────────────────────────────────────────────

const MASTER_PLAN_SHEETS = [
  {
    key: 'tong-quan',
    label: 'Tổng quan',
    imageUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/6512bd43d9caa6e02c990b0a82652dca/2026/05/20/7b8f4b79-71b3-497e-918f-b0c415237398-optimized.jpg',
  },
  {
    key: 'mat-bang-can-ho',
    label: 'Mặt bằng căn hộ',
    imageUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/6512bd43d9caa6e02c990b0a82652dca/2026/05/20/b12ed38c-93d2-4502-b14e-4b5d1cf42d0d-optimized.jpg',
  },
  {
    key: 'paradise-tower',
    label: 'Paradise Tower',
    imageUrl: 'https://realtyhub.com.vn/static/rth/c4ca4238a0b923820dcc509a6f75849b/real-estate-projects/6512bd43d9caa6e02c990b0a82652dca/2026/07/14/3a50ab0c-d4f6-4a9c-8708-861cf38a873f-optimized.jpg',
  },
];

// ── Full ProjectDetail ─────────────────────────────────────────────────────

export const IMPERIA_GREEN_PARADISE_DETAIL: ProjectDetail = {
  ...IMPERIA_GREEN_PARADISE,

  description: `
<p><strong>Tên thương mại:</strong> Imperia Green Paradise</p>
<p><strong>Vị trí:</strong> Mặt tiền biển Cần Giờ, xã Long Hòa, thị trấn Cần Thạnh, huyện Cần Giờ, TP. Hồ Chí Minh</p>
<p><strong>Chủ đầu tư:</strong> Tập đoàn MIK Group</p>
<p><strong>Quy mô:</strong> 103 ha</p>
<p><strong>Loại hình:</strong> Căn hộ cao cấp, Penthouse, Officetel, Shophouse & Khách sạn</p>

<h3>Căn hộ</h3>
<ul>
  <li>Studio: 33m²</li>
  <li>1PN+1: 48m²</li>
  <li>2PN+1WC: 58m²</li>
  <li>2PN+2WC: 74m²</li>
  <li>3PN: 85m²</li>
  <li>Duplex: 135m²</li>
  <li>Penthouse: 156m²</li>
</ul>

<h3>Tiện ích đẳng cấp quốc tế</h3>
<ul>
  <li>Tòa tháp chọc trời 108 tầng top 10 thế giới</li>
  <li>Biển hồ nước mặn nhân tạo 4 mùa Paradise Lagoon</li>
  <li>Sân Golf 18 lỗ đẳng cấp số 1 thế giới</li>
  <li>Cảng tàu Quốc tế 5 sao Landmark Harbour</li>
  <li>Bệnh viện Quốc tế Vinmec 5 sao & Cleveland Clinic</li>
  <li>Nhà hát sóng xanh Blue Wave Theatre</li>
  <li>Quần thể vui chơi giải trí 122 ha</li>
</ul>

<p><strong>Bàn giao:</strong> Dự kiến Quý 4/2028</p>
<p><strong>Sở hữu:</strong> Sở hữu lâu dài</p>
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
    headline: 'Mặt tiền biển Cần Giờ - Tâm điểm mới của TP.HCM',
    intro: 'Imperia Green Paradise tọa lạc tại mặt tiền biển Cần Giờ, kết nối trực tiếp với trung tâm TP.HCM qua hệ thống cao tốc hiện đại, cách sân bay Long Thành chỉ 60 phút.',
    highlights: LOCATION_HIGHLIGHTS,
    closing: 'Vị trí đắc địa trên mặt tiền biển, kết nối nhanh chóng với toàn khu vực phía Nam.',
    latitude: 10.4114,
    longitude: 106.8867,
    mapLabel: 'Imperia Green Paradise, Cần Giờ, TP.HCM',
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
export const IMPERIA_GREEN_PARADISE_SLUG = 'imperia-green-paradise-1776759113000';
