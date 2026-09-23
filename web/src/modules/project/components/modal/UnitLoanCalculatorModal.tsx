"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiChevronDown,
  FiInfo,
  FiPercent,
  FiTrendingDown,
  FiX,
} from "react-icons/fi";
import { formatNumber } from "@/common/utils/format";
import { calculateLoan, type LoanMethod } from "../../utils/loan";

/**
 * Bang "Tinh lai vay" - bung ra khi bam nut cung ten trong popup chi tiet can.
 *
 * Ben trai nhap, ben phai ra ket qua NGAY khi keo/go (khong co nut "Tinh"):
 * nguoi mua thuong thu vai muc vay khac nhau de so sanh, bat ho bam tinh lai
 * moi lan chi lam cham.
 *
 * Bang chi tiet tung thang mac dinh dong lai - no dai hang tram dong, chi mo
 * khi nguoi dung thuc su muon soi.
 */
type UnitLoanCalculatorModalProps = {
  /** Ma can - hien o tieu de de biet dang tinh cho can nao */
  code: string;
  /** Gia can (VND) - dung lam gia tri bat dong san mac dinh */
  price: number;
  onClose: () => void;
};

/** Cac muc mac dinh - lay theo mat bang lai vay mua nha hien nay */
const DEFAULT_RATIO = 70;
const DEFAULT_PROMO_RATE = 7;
const DEFAULT_PROMO_MONTHS = 12;
const DEFAULT_FLOAT_RATE = 11;
const DEFAULT_TERM_YEARS = 20;

const METHODS: { value: LoanMethod; label: string; hint: string }[] = [
  {
    value: "declining",
    label: "Dư nợ giảm dần",
    hint: "Lãi tính trên dư nợ còn lại - tổng lãi thấp hơn",
  },
  {
    value: "annuity",
    label: "Đều hàng tháng",
    hint: "Mỗi tháng trả như nhau - dễ tính dòng tiền",
  },
];

/** 1_234_567_890 -> "1.234.567.890" */
const vnd = (value: number) => formatNumber(Math.round(value));

const UnitLoanCalculatorModal = ({
  code,
  price,
  onClose,
}: UnitLoanCalculatorModalProps) => {
  const [propertyValue, setPropertyValue] = useState(price || 0);
  const [ratio, setRatio] = useState(DEFAULT_RATIO);
  const [promoRate, setPromoRate] = useState(DEFAULT_PROMO_RATE);
  const [promoMonths, setPromoMonths] = useState(DEFAULT_PROMO_MONTHS);
  const [floatRate, setFloatRate] = useState(DEFAULT_FLOAT_RATE);
  const [termYears, setTermYears] = useState(DEFAULT_TERM_YEARS);
  const [method, setMethod] = useState<LoanMethod>("declining");
  const [showSchedule, setShowSchedule] = useState(false);
  const scheduleRef = useRef<HTMLDivElement>(null);

  /**
   * Mo bang chi tiet thi keo no vao tam nhin luon. Nut nam o chan bang (luon
   * thay), con bang thi nam trong vung cuon - khong keo giup thi bam xong
   * nguoi dung khong thay gi doi.
   */
  const toggleSchedule = () => {
    const next = !showSchedule;
    setShowSchedule(next);
    if (!next) return;
    requestAnimationFrame(() =>
      scheduleRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }),
    );
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // Bat o pha capture de dong bang nay TRUOC popup chi tiet dang mo duoi
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [onClose]);

  const loanAmount = Math.round((propertyValue * ratio) / 100);
  const downPayment = propertyValue - loanAmount;

  const result = useMemo(
    () =>
      calculateLoan({
        amount: loanAmount,
        promoRate,
        promoMonths,
        floatRate,
        months: termYears * 12,
        method,
      }),
    [loanAmount, promoRate, promoMonths, floatRate, termYears, method],
  );

  // Ba thanh tien do so sanh voi nhau, lay muc lon nhat lam moc 100%
  const maxAvg = Math.max(result.avgMonthly, 1);

  const field =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 lg:px-2.5 lg:py-1.5 lg:text-xs";
  const label = "mb-1 block text-xs font-medium text-gray-600 lg:mb-0.5 lg:text-[10px]";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 max-md:items-end max-md:p-0"
      role="dialog"
      aria-modal="true"
      aria-label="Công cụ tính lãi vay"
    >
      <button
        type="button"
        aria-label="Đóng"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl max-md:h-[92dvh] max-md:max-h-none max-md:rounded-b-none">
        {/* ── Đầu bảng ──────────────────────────────────────────── */}
        <div className="flex shrink-0 items-center gap-3 border-b border-gray-100 px-4 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <FiPercent className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-bold text-gray-900 lg:text-sm">
              Công cụ tính lãi vay
            </h2>
            <p className="truncate text-xs text-gray-500 lg:text-[11px]">
              Căn {code} · ước tính khoản vay và lịch trả nợ
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        {/* ── Thân bảng: trái nhập - phải kết quả ───────────────── */}
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
          <div className="grid gap-4 p-4 md:grid-cols-2 lg:gap-3 lg:p-3.5">
            {/* ── Cột nhập ──────────────────────────────────── */}
            <div className="space-y-3 lg:space-y-2">
              <h3 className="text-sm font-bold text-gray-900 lg:text-xs">
                Thông tin khoản vay
              </h3>

              <div>
                <label className={label} htmlFor="loan-property-value">
                  Giá trị bất động sản (VND)
                </label>
                <input
                  id="loan-property-value"
                  type="text"
                  inputMode="numeric"
                  value={vnd(propertyValue)}
                  onChange={(event) =>
                    setPropertyValue(
                      Number(event.target.value.replace(/\D/g, "")) || 0,
                    )
                  }
                  className={field}
                />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className={`${label} mb-0`}>Tỷ lệ vay</span>
                  <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-600 lg:px-1.5 lg:py-px lg:text-[10px]">
                    {ratio}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={ratio}
                  onChange={(event) => setRatio(Number(event.target.value))}
                  aria-label="Tỷ lệ vay"
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-brand-500 lg:h-1.5"
                />
                <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg bg-gray-50 p-2 text-xs lg:mt-1.5 lg:p-1.5 lg:text-[10px]">
                  <div>
                    <p className="text-gray-500">Số tiền vay</p>
                    <p className="font-bold text-gray-900">
                      {vnd(loanAmount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500">Trả trước</p>
                    <p className="font-bold text-gray-900">
                      {vnd(downPayment)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={label} htmlFor="loan-promo-rate">
                    Lãi suất ưu đãi (%/năm)
                  </label>
                  <input
                    id="loan-promo-rate"
                    type="number"
                    min={0}
                    step={0.1}
                    value={promoRate}
                    onChange={(event) =>
                      setPromoRate(Number(event.target.value) || 0)
                    }
                    className={field}
                  />
                </div>
                <div>
                  <label className={label} htmlFor="loan-promo-months">
                    Thời gian ưu đãi (tháng)
                  </label>
                  <input
                    id="loan-promo-months"
                    type="number"
                    min={0}
                    step={1}
                    value={promoMonths}
                    onChange={(event) =>
                      setPromoMonths(Number(event.target.value) || 0)
                    }
                    className={field}
                  />
                </div>
                <div>
                  <label className={label} htmlFor="loan-float-rate">
                    Lãi suất sau ưu đãi (%/năm)
                  </label>
                  <input
                    id="loan-float-rate"
                    type="number"
                    min={0}
                    step={0.1}
                    value={floatRate}
                    onChange={(event) =>
                      setFloatRate(Number(event.target.value) || 0)
                    }
                    className={field}
                  />
                </div>
                <div>
                  <label className={label} htmlFor="loan-term">
                    Thời hạn vay (năm)
                  </label>
                  <input
                    id="loan-term"
                    type="number"
                    min={1}
                    max={35}
                    step={1}
                    value={termYears}
                    onChange={(event) =>
                      setTermYears(Number(event.target.value) || 1)
                    }
                    className={field}
                  />
                </div>
              </div>

              <div>
                <span className={label}>Phương thức tính lãi</span>
                <div className="grid grid-cols-2 gap-2">
                  {METHODS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setMethod(option.value)}
                      aria-pressed={method === option.value}
                      title={option.hint}
                      className={`rounded-lg border px-2.5 py-2 text-left transition lg:px-2 lg:py-1.5 ${
                        method === option.value
                          ? "border-brand-500 bg-brand-50/60"
                          : "border-gray-200 bg-white hover:border-brand-300"
                      }`}
                    >
                      <span
                        className={`block text-xs font-bold lg:text-[11px] ${
                          method === option.value
                            ? "text-brand-700"
                            : "text-gray-900"
                        }`}
                      >
                        {option.label}
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-tight text-gray-500 lg:text-[10px]">
                        {option.hint}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Cột kết quả ───────────────────────────────── */}
            <div className="space-y-3 lg:space-y-2">
              <h3 className="text-sm font-bold text-gray-900 lg:text-xs">
                Kết quả ước tính
              </h3>

              {/* Ba con so trung binh moi thang - thanh mau de so sanh do lon */}
              {[
                {
                  title: "Trung bình lãi/tháng",
                  value: result.avgInterest,
                  bar: "bg-gold-500",
                },
                {
                  title: "Trung bình gốc/tháng",
                  value: result.avgPrincipal,
                  bar: "bg-brand-500",
                },
                {
                  title: "Trung bình gốc + lãi/tháng",
                  value: result.avgMonthly,
                  bar: "bg-success-500",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-gray-100 bg-white p-2 shadow-2xs"
                >
                  <p className="text-xs text-gray-500 lg:text-[10px]">{item.title}</p>
                  <p className="text-lg font-bold leading-tight text-gray-900 lg:text-[15px]">
                    {vnd(item.value)}{" "}
                    <span className="text-[11px] font-medium text-gray-500 lg:text-[10px]">
                      VND
                    </span>
                  </p>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full ${item.bar}`}
                      style={{
                        width: `${Math.min((item.value / maxAvg) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}

              <div className="space-y-1.5 rounded-xl bg-gray-50 p-2.5 text-xs lg:space-y-1 lg:p-2 lg:text-[10px]">
                {[
                  { title: "Trả tháng đầu", value: result.firstPayment },
                  { title: "Tổng gốc phải trả", value: result.totalPrincipal },
                  { title: "Tổng lãi phải trả", value: result.totalInterest },
                  { title: "Tổng tiền phải trả", value: result.totalPayment },
                ].map((item, index) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="text-gray-600">{item.title}</span>
                    <span
                      className={`whitespace-nowrap font-bold ${
                        index === 3 ? "text-brand-600" : "text-gray-900"
                      }`}
                    >
                      {vnd(item.value)}
                    </span>
                  </div>
                ))}
              </div>

              <p className="flex items-start gap-1.5 text-[11px] leading-snug text-gray-500 lg:text-[10px]">
                <FiInfo className="mt-px h-3.5 w-3.5 shrink-0" />
                Con số chỉ mang tính ước tính theo lãi suất bạn nhập, không phải
                cam kết cho vay của ngân hàng.
              </p>
            </div>
          </div>

          {/* ── Bảng chi tiết từng tháng ─────────────────────────
              Nam trong vung cuon, con nut bat/tat nam o chan bang ben duoi. */}
          {showSchedule && (
            <div ref={scheduleRef} className="border-t border-gray-100 px-4 pb-4 pt-3">
              <div className="slim-scrollbar max-h-72 overflow-auto rounded-xl border border-gray-100">
                <table className="w-full min-w-[420px] text-right text-xs">
                  <thead className="sticky top-0 bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-2.5 py-2 text-left font-medium">
                        Tháng
                      </th>
                      <th className="px-2.5 py-2 font-medium">Gốc</th>
                      <th className="px-2.5 py-2 font-medium">Lãi</th>
                      <th className="px-2.5 py-2 font-medium">Gốc + lãi</th>
                      <th className="px-2.5 py-2 font-medium">Dư nợ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row) => (
                      <tr
                        key={row.month}
                        className="border-t border-gray-50 text-gray-700"
                      >
                        <td className="whitespace-nowrap px-2.5 py-1.5 text-left">
                          {row.month}
                          <span className="ml-1 text-[10px] text-gray-400">
                            {row.rate}%
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-2.5 py-1.5">
                          {vnd(row.principal)}
                        </td>
                        <td className="whitespace-nowrap px-2.5 py-1.5">
                          {vnd(row.interest)}
                        </td>
                        <td className="whitespace-nowrap px-2.5 py-1.5 font-semibold text-gray-900">
                          {vnd(row.total)}
                        </td>
                        <td className="whitespace-nowrap px-2.5 py-1.5">
                          {vnd(row.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ── Chân bảng (cố định) ────────────────────────────────
            Nut nay truoc nam cuoi vung cuon nen tren laptop phai keo xuong moi
            thay. Dua ra ngoai vung cuon thi no luon hien. */}
        <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-2.5">
          <button
            type="button"
            onClick={toggleSchedule}
            aria-expanded={showSchedule}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-50 py-2.5 text-sm font-semibold text-brand-600 transition hover:bg-brand-100 lg:py-2"
          >
            <FiTrendingDown className="h-4 w-4" />
            {showSchedule
              ? "Ẩn bảng chi tiết theo tháng"
              : "Xem bảng chi tiết theo tháng"}
            <FiChevronDown
              className={`h-4 w-4 transition-transform ${
                showSchedule ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnitLoanCalculatorModal;
