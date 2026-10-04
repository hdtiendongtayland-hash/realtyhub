/**
 * Chinh sach ban hang theo thang - ban demo dung chung cho MOI du an.
 *
 * Moi thang la mot anh chinh sach (anh trong public/images/sales-policy).
 * Thang moi nhat dat dau danh sach - tab "Chinh sach ban hang" mo san no.
 * Khi co du lieu that, moi du an se co danh sach rieng.
 */
export type SalesPolicyMonth = {
  publicId: string;
  /** Nhan hien o danh sach ben trai */
  label: string;
  imageUrl: string;
  width: number;
  height: number;
};

export const SALES_POLICY_MONTHS: SalesPolicyMonth[] = [
  {
    publicId: 'csbh-2026-10',
    label: 'Tháng 10/2026',
    imageUrl: '/images/sales-policy/thang-10-2026.png',
    width: 1031,
    height: 1525,
  },
  {
    publicId: 'csbh-2026-09',
    label: 'Tháng 9/2026',
    imageUrl: '/images/sales-policy/thang-09-2026.png',
    width: 1122,
    height: 1402,
  },
];
