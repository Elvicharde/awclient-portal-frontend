export interface MockMonthlyLog {
  client: string;
  month: string;
  cash: number;
  investments: number;
  loans: number;
  obligations: number;
  contributions: number;
  adjustments: number;
}

export const mock_monthly_logs: MockMonthlyLog[] = [
  {
    adjustments: 36000,
    cash: 420000,
    client: "Anderson Family Trust",
    contributions: 92000,
    investments: 4400000,
    loans: 710000,
    month: "May 2026",
    obligations: 230000,
  },
  {
    adjustments: 18000,
    cash: 280000,
    client: "Northstar Holdings",
    contributions: 64000,
    investments: 2150000,
    loans: 460000,
    month: "May 2026",
    obligations: 120000,
  },
  {
    adjustments: 41000,
    cash: 540000,
    client: "Riverbend Capital",
    contributions: 110000,
    investments: 5150000,
    loans: 890000,
    month: "May 2026",
    obligations: 310000,
  },
];
