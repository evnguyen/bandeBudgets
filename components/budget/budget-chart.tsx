'use client';

import { useMemo, useState } from 'react';
import type { ChartConfig } from '@/components/ui/chart';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { Category } from '@/lib/types';
import { THEME_COLORS } from '@/lib/theme-colors';
import {
  getExpenseCategorySummaries,
  ExpenseCategorySummary,
} from '@/lib/utils/budget-summaries';

interface BudgetChartProps {
  categories: Category[];
}

interface BudgetChartRow extends ExpenseCategorySummary {}
interface BudgetChartRowWithValue extends BudgetChartRow {
  value: number;
}

interface BudgetChartRowWithMeta extends BudgetChartRowWithValue {
  chartKey: string;
  fill: string;
}

const CHART_MODES = ['planned', 'spent'] as const;
type ChartMode = (typeof CHART_MODES)[number];

export function BudgetChart({ categories }: BudgetChartProps) {
  const [chartMode, setChartMode] = useState<ChartMode>('planned');
  const rows = getExpenseCategorySummaries(categories);

  // All hooks must be called unconditionally before any early returns
  const palette = useMemo(
    () => THEME_COLORS.map((color) => `hsl(${color.primary})`),
    []
  );

  const chartData: BudgetChartRowWithMeta[] = useMemo(() => {
    return rows
      .map((row, index) => {
        const value = row[chartMode];
        const chartKey = `${row.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'category'}-${index}`;
        return {
          ...row,
          value,
          chartKey,
          fill: `var(--color-${chartKey})`,
        };
      })
      .filter((row) => row.value > 0);
  }, [rows, chartMode]);

  const chartConfig = useMemo<ChartConfig>(() => {
    return chartData.reduce((config, row, index) => {
      config[row.chartKey] = {
        label: row.name,
        color: palette[index % palette.length],
      };
      return config;
    }, {} as ChartConfig);
  }, [chartData, palette]);

  const totalPlanned = rows.reduce((sum, row) => sum + row.planned, 0);
  const totalSpent = rows.reduce((sum, row) => sum + row.spent, 0);

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">{'No data to visualize'}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {'Add expense categories to see your budget breakdown.'}
        </p>
      </div>
    );
  }

  const emptyStateMessage =
    chartMode === 'planned'
      ? 'Add planned amounts to see a breakdown by category.'
      : 'Track spending to see a sectional view of each category.';

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">{'Budget Overview'}</h3>
          <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
            {CHART_MODES.map((mode) => {
              const isActive = mode === chartMode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setChartMode(mode)}
                  className={`rounded-md px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {mode}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex h-56 w-full items-center justify-center">
          {chartData.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">{emptyStateMessage}</p>
          ) : (
            <ChartContainer
              config={chartConfig}
              className="mx-auto h-full w-full max-w-[220px]"
            >
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                />
              </PieChart>
            </ChartContainer>
          )}
        </div>

        <div className="mt-4 space-y-2.5 border-t border-border pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{'Total Planned'}</span>
            <span className="font-semibold">${totalPlanned.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{'Total Spent'}</span>
            <span className="font-semibold text-red-500">${totalSpent.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2.5 text-sm">
            <span className="text-muted-foreground">{'Remaining'}</span>
            <span className="font-semibold text-emerald-500">
              ${(totalPlanned - totalSpent).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
