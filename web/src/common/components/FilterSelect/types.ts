export type SelectOption = {
  value: string;
  label: string;
};

export const RESET_VALUE = '__all__';

export type FilterSelectVariant = 'field' | 'chip';

export type FilterSelectProps = {
  /** Vua la placeholder, vua la nhan cho trinh doc man hinh */
  label: string;
  value: string | null;
  options: SelectOption[];
  isLoading?: boolean;
  /** Icon dan dau, giup quet mat nhanh ra o loc can tim */
  icon?: React.ReactNode;
  /** Nhan cho dong "bo chon" dau danh sach */
  resetLabel?: string;
  variant?: FilterSelectVariant;
  onChange: (value: string | null) => void;
  className?: string;
};

/** Toa do menu, tinh theo viewport vi menu dung position: fixed */
export type MenuPosition = {
  left: number;
  width: number;
  maxHeight: number;
  /** Mo xuong duoi: dat top. Mo len tren: dat bottom. Chi mot trong hai co gia tri. */
  top: number | null;
  bottom: number | null;
};