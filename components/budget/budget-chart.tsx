'use client';

import type { TooltipProps } from 'recharts';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Category } from '@/lib/types';
import { THEME_COLORS } from '@/lib/theme-colors';
import {
  getExpenseCategorySummaries,
  ExpenseCategorySummary,
} from '@/lib/utils/budget-summaries';

interface BudgetChartProps {
  categories: Category[];
}

interface BudgetChartRow extends ExpenseCategorySummary {
  chartValue: number;
}

export function BudgetChart({ categories }: BudgetChartProps) {
  const rows = getExpenseCategorySummaries(categories);

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <p className="text-muted-foreground">{'No expense categories to visualize'}</p>
      </div>
    );
  }

  const chartData: BudgetChartRow[] = rows
    .map((row) => ({
      ...row,
      chartValue: row.spent > 0 ? row.spent : row.planned,
    }))
    .filter((row) => row.chartValue > 0);

  if (chartData.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <p className="text-muted-foreground">
          {'Add planned amounts or track spending to populate the chart.'}
        </p>
      </div>
    );
  }

  const totalPlanned = rows.reduce((sum, row) => sum + row.planned, 0);
  const totalSpent = rows.reduce((sum, row) => sum + row.spent, 0);

  const palette = THEME_COLORS.map((color) => `hsl(${color.primary})`);

  const renderTooltip = ({
    active,
    payload,
  }: TooltipProps<number, string>) => {
    if (!active || !payload?.length) {
      return null;
    }

    const row = payload[0].payload as BudgetChartRow;

    return (
      <div className="rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground shadow">
        <div className="mb-1 text-left text-sm font-semibold text-foreground">{row.name}</div>
        <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-wider text-muted-foreground">
          <span>Spent</span>
          <span className="font-semibold text-foreground">${row.spent.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-wider text-muted-foreground">
          <span>Planned</span>
          <span className="font-semibold text-foreground">${row.planned.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-wider text-muted-foreground">
          <span>Remaining</span>
          <span className="font-semibold text-foreground">${row.remaining.toFixed(2)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 rounded-lg border border-border bg-card p-6">
      <div className="text-center">
        <h3 className="mb-4 text-lg font-semibold">Budget Overview</h3>
        <div className="flex h-64 items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="chartValue"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
                ))}
              </Pie>
              <Tooltip content={renderTooltip} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h4 className="mb-4 font-semibold">Summary</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Planned</span>
            <span className="font-semibold">${totalPlanned.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Spent</span>
            <span className="font-semibold text-red-600">${totalSpent.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm text-muted-foreground">Remaining</span>
            <span className="font-semibold text-green-600">
              ${(totalPlanned - totalSpent).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
