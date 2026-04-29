'use client';

import { useBudgetStore } from '@/lib/stores/budget-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export function BudgetHeader() {
  const { currentBudget, loadBudget } = useBudgetStore();
  const { user } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  const formatMonth = (date: Date) =>
    date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const getMonthString = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

  const handlePreviousMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
    if (user) loadBudget(user.uid, getMonthString(d));
  };

  const handleNextMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
    if (user) loadBudget(user.uid, getMonthString(d));
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    setCurrentDate(now);
    if (user) loadBudget(user.uid, getMonthString(now));
  };

  const totalIncome = currentBudget?.totalIncome || 0;
  const totalExpenses = currentBudget?.totalExpenses || 0;
  const remaining = totalIncome - totalExpenses;

  return (
    <div className="space-y-5">
      {/* Title row + month nav */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{'Budget'}</h1>
          <p className="text-sm text-muted-foreground">{'Zero-based monthly budget'}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousMonth}
            className="h-9 w-9 shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            onClick={handleCurrentMonth}
            className="h-9 min-w-[148px] text-sm font-medium"
          >
            {formatMonth(currentDate)}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
            className="h-9 w-9 shrink-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary cards — 2-col on mobile (income|expenses), left-to-budget full-width below */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {/* Total Income */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {'Total Income'}
            </span>
            <div className="rounded-md bg-emerald-500/10 p-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-emerald-500 sm:mt-4 sm:text-3xl">
            {'$'}{totalIncome.toFixed(2)}
          </p>
        </div>

        {/* Total Expenses */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {'Total Expenses'}
            </span>
            <div className="rounded-md bg-red-500/10 p-1.5">
              <TrendingDown className="h-4 w-4 text-red-500" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-red-500 sm:mt-4 sm:text-3xl">
            {'$'}{totalExpenses.toFixed(2)}
          </p>
        </div>

        {/* Left to Budget — spans full width on mobile, single col on sm+ */}
        <div className="col-span-2 rounded-xl border border-border bg-card p-4 shadow-sm sm:col-span-1 sm:p-5">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {'Left to Budget'}
            </span>
            <div className={cn('rounded-md p-1.5', remaining >= 0 ? 'bg-primary/10' : 'bg-red-500/10')}>
              <Target className={cn('h-4 w-4', remaining >= 0 ? 'text-primary' : 'text-red-500')} />
            </div>
          </div>
          <p
            className={cn(
              'mt-3 text-2xl font-bold tracking-tight sm:mt-4 sm:text-3xl',
              remaining >= 0 ? 'text-primary' : 'text-red-500'
            )}
          >
            {'$'}{remaining.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
