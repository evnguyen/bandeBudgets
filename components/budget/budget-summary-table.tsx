'use client';

import { Category } from '@/lib/types';

interface BudgetSummaryTableProps {
  categories: Category[];
}

export function BudgetSummaryTable({ categories }: BudgetSummaryTableProps) {
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const rows = expenseCategories.map((category) => {
    const planned = category.budgetItems.reduce((sum, item) => sum + item.plannedAmount, 0);
    const spent = category.budgetItems.reduce((sum, item) => sum + item.spentAmount, 0);
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

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
            <th className="px-4 py-3 text-right text-sm font-semibold">Planned</th>
            <th className="px-4 py-3 text-right text-sm font-semibold">Spent</th>
            <th className="px-4 py-3 text-right text-sm font-semibold">Remaining</th>
            <th className="px-4 py-3 text-right text-sm font-semibold">%</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-b border-border hover:bg-muted/50 transition-colors">
              <td className="px-4 py-3 text-sm font-medium">{row.name}</td>
              <td className="px-4 py-3 text-right text-sm">${row.planned.toFixed(2)}</td>
              <td className="px-4 py-3 text-right text-sm">
                <span className={row.spent > row.planned ? 'text-red-600 font-semibold' : ''}>
                  ${row.spent.toFixed(2)}
                </span>
              </td>
              <td className="px-4 py-3 text-right text-sm">
                <span className={row.remaining < 0 ? 'text-red-600 font-semibold' : ''}>
                  ${row.remaining.toFixed(2)}
                </span>
              </td>
              <td className="px-4 py-3 text-right text-sm">{row.percentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
