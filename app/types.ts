// c:/prog/cashflow/cashflow/app/types.ts

export interface Asset {
  name: string;
  type: string;
  cost?: number;
  downPayment?: number;
  cashflow?: number;
  units?: number;
  quantity?: number;
  costPerShare?: number;
  costPerCoin?: number;
}
