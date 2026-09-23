/**
 * Tinh lich tra no cho cong cu "Tinh lai vay".
 *
 * Tach khoi giao dien de con so kiem tra duoc doc lap: cho nay chi nhan so va
 * tra ve so, khong biet gi ve React.
 *
 * Hai cach tinh pho bien o ngan hang Viet Nam:
 *
 * - "du no giam dan": goc chia deu cho ca ky han, lai tinh tren du no con lai
 *   -> thang dau tra nhieu nhat roi giam dan. Tong lai THAP hon.
 * - "deu hang thang" (annuity): moi thang tra mot so nhu nhau. De liệu truoc
 *   dong tien nhung tong lai CAO hon.
 *
 * Ca hai deu ho tro hai muc lai: lai uu dai trong `promoMonths` thang dau, sau
 * do nhay sang lai tha noi. Voi kieu "deu hang thang", so tien phai tra duoc
 * TINH LAI o thang het uu dai tren du no va so thang con lai - dung nhu cach
 * ngan hang lam, chu khong giu nguyen so cu.
 */

export type LoanMethod = "declining" | "annuity";

export type LoanInput = {
  /** So tien vay (VND) */
  amount: number;
  /** Lai suat uu dai, %/nam */
  promoRate: number;
  /** So thang huong lai uu dai */
  promoMonths: number;
  /** Lai suat sau uu dai (tha noi), %/nam */
  floatRate: number;
  /** Tong ky han vay, tinh bang thang */
  months: number;
  method: LoanMethod;
};

export type LoanRow = {
  /** Thang thu may, bat dau tu 1 */
  month: number;
  /** Goc phai tra trong thang */
  principal: number;
  /** Lai phai tra trong thang */
  interest: number;
  /** Goc + lai */
  total: number;
  /** Du no sau khi tra thang nay */
  balance: number;
  /** Lai suat dang ap dung, %/nam - de bang chi tiet chi ro moc doi lai */
  rate: number;
};

export type LoanResult = {
  rows: LoanRow[];
  totalPrincipal: number;
  totalInterest: number;
  totalPayment: number;
  /** Trung binh lai moi thang */
  avgInterest: number;
  /** Trung binh goc moi thang */
  avgPrincipal: number;
  /** Trung binh goc + lai moi thang */
  avgMonthly: number;
  /** So phai tra thang dau tien - con so nguoi mua quan tam nhat */
  firstPayment: number;
};

/** So tien tra deu hang thang cho khoan `balance` trong `months` thang */
const annuityPayment = (balance: number, monthlyRate: number, months: number) => {
  if (months <= 0) return 0;
  if (monthlyRate === 0) return balance / months;
  const factor = Math.pow(1 + monthlyRate, months);
  return (balance * monthlyRate * factor) / (factor - 1);
};

export const calculateLoan = ({
  amount,
  promoRate,
  promoMonths,
  floatRate,
  months,
  method,
}: LoanInput): LoanResult => {
  const empty: LoanResult = {
    rows: [],
    totalPrincipal: 0,
    totalInterest: 0,
    totalPayment: 0,
    avgInterest: 0,
    avgPrincipal: 0,
    avgMonthly: 0,
    firstPayment: 0,
  };

  if (amount <= 0 || months <= 0) return empty;

  const promo = Math.min(Math.max(promoMonths, 0), months);
  const rows: LoanRow[] = [];

  let balance = amount;
  // Kieu "deu hang thang": giu so tien phai tra cua giai doan hien tai, tinh
  // lai moi khi doi muc lai.
  let payment =
    method === "annuity"
      ? annuityPayment(amount, promoRate / 100 / 12, months)
      : 0;

  for (let month = 1; month <= months; month += 1) {
    const rate = month <= promo ? promoRate : floatRate;
    const monthlyRate = rate / 100 / 12;

    // Vua het uu dai: tinh lai so phai tra tren du no va so thang con lai
    if (method === "annuity" && month === promo + 1) {
      payment = annuityPayment(balance, monthlyRate, months - promo);
    }

    const interest = balance * monthlyRate;
    let principal =
      method === "declining" ? amount / months : payment - interest;

    // Thang cuoi: tra not phan le do lam tron, de du no ve dung 0
    if (month === months || principal > balance) principal = balance;

    balance -= principal;

    rows.push({
      month,
      principal,
      interest,
      total: principal + interest,
      balance: Math.max(balance, 0),
      rate,
    });
  }

  const totalPrincipal = rows.reduce((sum, row) => sum + row.principal, 0);
  const totalInterest = rows.reduce((sum, row) => sum + row.interest, 0);

  return {
    rows,
    totalPrincipal,
    totalInterest,
    totalPayment: totalPrincipal + totalInterest,
    avgInterest: totalInterest / months,
    avgPrincipal: totalPrincipal / months,
    avgMonthly: (totalPrincipal + totalInterest) / months,
    firstPayment: rows[0]?.total ?? 0,
  };
};
