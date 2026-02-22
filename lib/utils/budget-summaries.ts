import { Category } from '@/lib/types';

export interface ExpenseCategorySummary {
  name: string;
  planned: number;
  spent: number;
  remaining: number;
  percentage: number;
}

export function getExpenseCategorySummaries(
  categories: Category[]
): ExpenseCategorySummary[] {
  return categories
    .filter((category) => category.type === 'expense')
    .map((category) => {
      const budgetItems = category.budgetItems ?? [];
      const planned = budgetItems.reduce(
        (sum, item) => sum + item.plannedAmount,
        0
      );
      const spent = budgetItems.reduce(
        (sum, item) => sum + item.spentAmount,
        0
      );
      const remaining = planned - spent;
      const percentage = planned > 0 ? Math.round((spent / planned) * 100) : 0;

      return {
        name: category.name,
        planned,
        spent,
        remaining,
        percentage,
      };
    });
}
