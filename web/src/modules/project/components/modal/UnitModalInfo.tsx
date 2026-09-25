import {
  AreaCard,
  HandoverCard,
  LegalCard,
  PolicyCard,
  PriceCard,
} from './UnitModalInfoCards';

type PropertyDetailCardProps = {
  /** Ma layout/mat bang cua can - hien ngang dong "Dien tich" */
  layout?: string;
  /** Mo phieu tinh gia - nut nho nam ngang dong "Gia" */
  onPriceSheet?: () => void;
  /** Mo bang tinh lai vay - nut nho nam ngang dong "Gia" */
  onLoanCalculator?: () => void;
};

/**
 * Cot thong tin cua popup - ban dung cho DIEN THOAI va iPad: nam the xep doc
 * mot cot, o nhan tin o cuoi (rieng dien thoai).
 *
 * May tinh khong dung component nay: UnitModalDetailDesktop tu rai nam the len
 * luoi va dai duoi theo bo cuc rieng.
 */
export default function PropertyDetailCard({
  layout,
  onPriceSheet,
  onLoanCalculator,
}: PropertyDetailCardProps = {}) {
  return (
    <div className="mx-auto flex w-full flex-col gap-3 rounded-2xl bg-white font-sans text-slate-800">
      <PriceCard
        onPriceSheet={onPriceSheet}
        onLoanCalculator={onLoanCalculator}
      />
      <AreaCard layout={layout} />
      <PolicyCard />
      <HandoverCard />
      <LegalCard />

    </div>
  );
}
