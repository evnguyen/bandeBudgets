'use client';

import { Category } from '@/lib/types';
import { getExpenseCategorySummaries } from '@/lib/utils/budget-summaries';

interface BudgetSummaryTableProps {
  categories: Category[];
}

export function BudgetSummaryTable({ categories }: BudgetSummaryTableProps) {
  const rows = getExpenseCategorySummaries(categories);

  if (rows.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">{'Category Breakdown'}</h3>
      </div>
      <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {'Category'}
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {'Planned'}
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {'Spent'}
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {'%'}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => {
            const isOver = row.remaining < 0;
            return (
              <tr key={row.name} className="transition-colors hover:bg-muted/30">
                <td className="px-4 py-3 text-xs font-medium">{row.name}</td>
                <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                  ${row.planned.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right text-xs">
                  <span className={isOver ? 'font-semibold text-red-500' : ''}>
                    ${row.spent.toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-xs">
                  <span
                    className={`inline-flex items-center rounded-full px-1.5 py-0.5 font-semibold ${
                      isOver
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {row.percentage}{'%'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}
