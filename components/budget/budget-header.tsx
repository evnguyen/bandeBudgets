'use client';

import { useBudgetStore } from '@/lib/stores/budget-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export function BudgetHeader() {
  const { currentBudget, loadBudget } = useBudgetStore();
  const { user } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getMonthString = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
    if (user) {
      loadBudget(user.uid, getMonthString(newDate));
    }
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
    if (user) {
      loadBudget(user.uid, getMonthString(newDate));
    }
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    setCurrentDate(now);
    if (user) {
      loadBudget(user.uid, getMonthString(now));
    }
  };

  const remaining = (currentBudget?.totalIncome || 0) - (currentBudget?.totalExpenses || 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{'Budget'}</h1>
        <Link href="/settings">
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" onClick={handleCurrentMonth} className="min-w-[200px]">
          {formatMonth(currentDate)}
        </Button>
        <Button variant="outline" size="icon" onClick={handleNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground">{'Total Income'}</p>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {'$'}
            {(currentBudget?.totalIncome || 0).toFixed(2)}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground">{'Total Expenses'}</p>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {'$'}
            {(currentBudget?.totalExpenses || 0).toFixed(2)}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground">{'Left to Budget'}</p>
          <p
            className={`mt-2 text-3xl font-bold ${
              remaining >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {'$'}
            {remaining.toFixed(2)}
          </p>
        </Card>
      </div>
    </div>
  );
}
