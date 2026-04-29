'use client';

import { useState } from 'react';
import { useBudgetStore } from '@/lib/stores/budget-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMonth } from '@/lib/dates';

export const BudgetHeader = () => {
  const currentBudget = useBudgetStore((s) => s.currentBudget);
  const setMonth = useBudgetStore((s) => s.setMonth);
  const user = useAuthStore((s) => s.user);
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const shiftMonth = (months: number) => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + months);
    setCurrentDate(next);
    if (user) setMonth(user.uid, next);
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    if (user) setMonth(user.uid, now);
  };

  const totalIncome = currentBudget?.totalIncome ?? 0;
  const totalExpenses = currentBudget?.totalExpenses ?? 0;
  const remaining = totalIncome - totalExpenses;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budget</h1>
          <p className="text-sm text-muted-foreground">Zero-based monthly budget</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            onClick={() => shiftMonth(-1)}
            aria-label="Previous month"
            className="h-9 w-9 shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            onClick={goToToday}
            className="h-9 min-w-[148px] text-sm font-medium"
          >
            {formatMonth(currentDate)}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => shiftMonth(1)}
            aria-label="Next month"
            className="h-9 w-9 shrink-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <SummaryCard
          label="Planned Income"
          amount={totalIncome}
          icon={<TrendingUp className="h-4 w-4 text-emerald-500" />}
          iconBg="bg-emerald-500/10"
          amountClass="text-emerald-500"
        />
        <SummaryCard
          label="Planned Expenses"
          amount={totalExpenses}
          icon={<TrendingDown className="h-4 w-4 text-red-500" />}
          iconBg="bg-red-500/10"
          amountClass="text-red-500"
        />
        <SummaryCard
          label="Left to Budget"
          amount={remaining}
          icon={
            <Target
              className={cn(
                'h-4 w-4',
                remaining >= 0 ? 'text-primary' : 'text-red-500',
              )}
            />
          }
          iconBg={remaining >= 0 ? 'bg-primary/10' : 'bg-red-500/10'}
          amountClass={remaining >= 0 ? 'text-primary' : 'text-red-500'}
          fullWidthOnMobile
        />
      </div>
    </div>
  );
};

interface SummaryCardProps {
  label: string;
  amount: number;
  icon: React.ReactNode;
  iconBg: string;
  amountClass: string;
  fullWidthOnMobile?: boolean;
}

const SummaryCard = ({
  label,
  amount,
  icon,
  iconBg,
  amountClass,
  fullWidthOnMobile = false,
}: SummaryCardProps) => (
  <div
    className={cn(
      'rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5',
      fullWidthOnMobile && 'col-span-2 sm:col-span-1',
    )}
  >
    <div className="flex items-start justify-between">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className={cn('rounded-md p-1.5', iconBg)}>{icon}</div>
    </div>
    <p
      className={cn(
        'mt-3 text-2xl font-bold tracking-tight sm:mt-4 sm:text-3xl',
        amountClass,
      )}
    >
      ${amount.toFixed(2)}
    </p>
  </div>
);
