'use client';

import { useMemo, useState } from 'react';
import type { ChartConfig } from '@/components/ui/chart';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie } from 'recharts';
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

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <p className="text-muted-foreground">{'No expense categories to visualize'}</p>
      </div>
    );
  }

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

  const modeLabel = chartMode === 'planned' ? 'Planned' : 'Spent';
  const emptyStateMessage =
    chartMode === 'planned'
      ? 'Add planned amounts to share a breakdown by category.'
      : 'Track spending to see a sectional view of each category.';

  return (
    <div className="space-y-6 rounded-lg border border-border bg-card p-6">
      <div className="text-center">
        <h3 className="mb-2 text-lg font-semibold">Budget Overview</h3>
        <div className="flex items-center justify-center gap-2">
          {CHART_MODES.map((mode) => {
            const isActive = mode === chartMode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setChartMode(mode)}
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow'
                    : 'border border-border bg-muted text-muted-foreground hover:border-primary hover:text-foreground'
                }`}
              >
                {mode.toUpperCase()}
              </button>
            );
          })}
        </div>
        <div className="flex h-64 w-full items-center justify-center">
          {chartData.length === 0 ? (
            <div className="rounded-lg border border-border bg-muted p-6 text-center text-sm text-muted-foreground">
              {emptyStateMessage}
            </div>
          ) : (
            <ChartContainer
              config={chartConfig}
              className="mx-auto h-full w-full max-w-[250px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                />
              </PieChart>
            </ChartContainer>
          )}
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
