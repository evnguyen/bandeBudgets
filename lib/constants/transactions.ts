export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
} as const;

export type TransactionType =
  (typeof TRANSACTION_TYPES)[keyof typeof TRANSACTION_TYPES];

export const CHART_MODES = {
  PLANNED: 'planned',
  SPENT: 'spent',
} as const;

export type ChartMode = (typeof CHART_MODES)[keyof typeof CHART_MODES];

export const CHART_MODE_LIST: ChartMode[] = [
  CHART_MODES.PLANNED,
  CHART_MODES.SPENT,
];
