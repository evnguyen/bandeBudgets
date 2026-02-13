'use client';

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { Category } from '@/lib/types';
import { THEME_COLORS } from '@/lib/theme-colors';

interface BudgetChartProps {
  categories: Category[];
}

export function BudgetChart({ categories }: BudgetChartProps) {
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const data = expenseCategories.map((category) => ({
    name: category.name,
    value: category.budgetItems.reduce((sum, item) => sum + item.plannedAmount, 0),
    spent: category.budgetItems.reduce((sum, item) => sum + item.spentAmount, 0),
  }));

  const colors = [
    'hsl(0, 100%, 50%)',
    'hsl(30, 100%, 50%)',
    'hsl(60, 100%, 50%)',
    'hsl(90, 100%, 40%)',
    'hsl(120, 100%, 40%)',
    'hsl(150, 100%, 40%)',
    'hsl(180, 100%, 40%)',
    'hsl(210, 100%, 50%)',
  ];

  const totalPlanned = data.reduce((sum, d) => sum + d.value, 0);
  const totalSpent = data.reduce((sum, d) => sum + d.spent, 0);

  if (expenseCategories.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <p className="text-muted-foreground">{'No expense categories to visualize'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-lg border border-border bg-card p-6">
      <div className="text-center">
        <h3 className="mb-4 text-lg font-semibold">Budget Overview</h3>
        <div className="flex h-64 items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => `$${value.toFixed(2)}`}
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
              />
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
