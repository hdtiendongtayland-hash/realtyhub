# UnitCard Redesign - Sản Phẩm Nổi Bật

## Tổng quan

Đã redesign component `UnitCard` và `FeaturedUnits` theo mẫu UX/UI mới với layout đơn giản, rõ ràng và slide carousel cuộn ngang.

## Thay đổi chính

### 1. UnitCard Component (`src/modules/project/components/UnitCard.tsx`)

#### Layout mới:
- **Ảnh bìa**: Tỷ lệ 4:3 (aspect-[4/3]) thay vì 16:10
- **Badge HOT**: Góc trên trái, chỉ hiển thị cho quỹ độc quyền (fundType === 'doc-quyen')
- **Nhãn trạng thái**: Góc trên phải (Còn hàng/Giữ chỗ/Đã bán)
- **Thông tin dự án**: Tên dự án + mã căn, loại hình (pill với icon)
- **Divider ngang**: Phân tách các section rõ ràng
- **Danh sách thông tin**: 
  - Icon + text layout (FiMaximize, FiDollarSign, FiMapPin)
  - Hiển thị: Diện tích, Giá (TTS + đơn giá/m²), Phân khu
- **Nút hành động**: 
  - "Xem chi tiết" (full width, brand primary)
  - "Liên hệ" (icon phone, border brand)

#### Điểm cải thiện:
- Loại bỏ bảng 3 cột phức tạp (giá niêm yết/TTS/TTTĐ)
- Đơn giản hóa thông tin, tập trung vào giá TTS chính
- Tăng khoảng trắng và khả năng đọc
- Responsive tốt hơn cho mobile

### 2. FeaturedUnits Component (`src/modules/project/components/FeaturedUnits.tsx`)

#### Tính năng mới:
- **Horizontal Carousel**: Cuộn ngang với `overflow-x-auto`
- **Navigation buttons**: Prev/Next (ẩn trên mobile, hiện từ md trở lên)
- **Responsive width**:
  - Mobile: 85% viewport width (1 card)
  - Tablet (sm): 50% - gap (2 cards)
  - Desktop (lg): 33.333% - gap (3 cards)
  - Large (xl): 25% - gap (4 cards)
- **Smooth scroll**: Tự động tính toán khoảng cách scroll dựa trên card width
- **Snap scroll**: snap-x snap-mandatory cho UX tốt trên mobile
- **Hidden scrollbar**: Sử dụng utility `no-scrollbar` có sẵn

#### UI tweaks:
- Background: `bg-gray-50` thay vì `bg-white`
- Header text: Màu gray-600 thay vì gray-500
- Link "Xem tất cả": Font semibold + hover animation

## File đã thay đổi

```
src/modules/project/components/
├── UnitCard.tsx          # Redesigned layout
└── FeaturedUnits.tsx     # Added carousel functionality
```

## Kiểm tra

### Build
```bash
cd web
npm run build
```
✅ Build thành công

### Lint
```bash
npm run lint -- src/modules/project/components/UnitCard.tsx src/modules/project/components/FeaturedUnits.tsx
```
✅ Không có lỗi lint

### Dev Server
```bash
npm run dev
```
Server đang chạy tại: http://localhost:3000

### Trang demo
- **Demo popup**: http://localhost:3000/demo-popup
- **Trang chủ** (nếu có FeaturedUnits): http://localhost:3000

## CSS Utilities sử dụng

- `no-scrollbar`: Utility có sẵn trong `app/globals.css` (line 326-332)
- `snap-x`, `snap-mandatory`, `snap-start`: Tailwind built-in
- `line-clamp-1`: Tailwind built-in để truncate text

## Icon mới

Thêm icons từ `react-icons/fi`:
- `FiMapPin`: Vị trí/phân khu
- `FiHome`: Loại hình bất động sản  
- `FiMaximize`: Diện tích
- `FiDollarSign`: Giá
- `FiPhone`: Liên hệ
- `FiChevronLeft`, `FiChevronRight`: Navigation carousel

## Tương thích

- ✅ Responsive: Mobile-first design
- ✅ Accessibility: ARIA labels, semantic HTML
- ✅ SEO: Server-side rendered
- ✅ Performance: Smooth scroll với will-change
- ✅ Browser: Modern browsers (flex, grid, CSS scroll-snap)

## Ghi chú

1. **Badge HOT**: Tự động hiển thị dựa trên `fundType === 'doc-quyen'`
2. **Carousel navigation**: Chỉ hiện khi có > 4 items
3. **Mobile UX**: Scroll ngang tự nhiên, không cần navigation buttons
4. **Desktop UX**: Navigation buttons để điều khiển chính xác

## Screenshot Reference

Layout mới dựa trên ảnh tham khảo từ user với:
- Badge HOT góc trái
- Thông tin rõ ràng theo từng dòng
- Divider phân tách sections
- Icon inline với text
- CTA buttons rõ ràng

---

**Updated**: Monday, Sep 7, 2026
**Version**: 1.0.0
