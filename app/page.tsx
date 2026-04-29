'use client';

import { useBudgetStore } from '@/lib/stores/budget-store';
import { CategorySection } from '@/components/budget/category-section';
import { AddCategoryDialog } from '@/components/budget/add-category-dialog';
import { BudgetChart } from '@/components/budget/budget-chart';
import { BudgetSummaryTable } from '@/components/budget/budget-summary-table';
import { BudgetHeader } from '@/components/budget/budget-header';
import { DEFAULT_EXPENSE_GROUP, EXPENSE_GROUPS } from '@/lib/constants/budget-groups';
import { Wallet, Receipt } from 'lucide-react';

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-4 w-0.5 rounded-full bg-primary" />
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </h2>
    </div>
  );
}

export default function HomePage() {
  const { currentBudget, loading } = useBudgetStore();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">{'Loading budget...'}</p>
        </div>
      </div>
    );
  }

  const incomeCategories =
    currentBudget?.categories
      .filter((c) => c.type === 'income')
      .slice()
      .sort((a, b) => a.order - b.order) || [];

  const expenseCategories =
    currentBudget?.categories
      .filter((c) => c.type === 'expense')
      .slice()
      .sort((a, b) => a.order - b.order) || [];

  return (
    <main className="flex-1">
      <div className="space-y-8 p-4 md:p-8">
        <BudgetHeader />

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Overview — first in DOM so it appears near the top on mobile.
              On desktop, grid-column positioning moves it to the right. */}
          <div className="space-y-4 lg:col-start-3 lg:row-start-1 lg:sticky lg:top-8 lg:self-start">
            <SectionHeader label="Overview" />
            {currentBudget && (
              <>
                <BudgetChart categories={currentBudget.categories} />
                <BudgetSummaryTable categories={currentBudget.categories} />
              </>
            )}
          </div>

          {/* Categories — on desktop placed in columns 1-2, same row as Overview */}
          <div className="space-y-8 lg:col-span-2 lg:col-start-1 lg:row-start-1">
            {/* Income */}
            <div className="space-y-3">
              <SectionHeader label="Monthly Income" />
              {incomeCategories.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-10 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Wallet className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">{'No income categories yet'}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {'Add one to start tracking your income.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {incomeCategories.map((category) => (
                    <CategorySection key={category.id} category={category} />
                  ))}
                </div>
              )}
              <AddCategoryDialog type="income" buttonLabel="Add income category" />
            </div>

            {/* Expenses */}
            <div className="space-y-3">
              <SectionHeader label="Expenses" />
              {expenseCategories.length === 0 && (
                <div className="rounded-xl border border-dashed border-border p-10 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Receipt className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">{'No expense categories yet'}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {'Add one to start tracking your expenses.'}
                  </p>
                </div>
              )}
              <div className="space-y-6">
                {EXPENSE_GROUPS.map((group) => {
                  const groupCategories = expenseCategories.filter(
                    (category) => (category.expenseGroup || DEFAULT_EXPENSE_GROUP) === group
                  );
                  if (groupCategories.length === 0) return null;
                  return (
                    <div key={group} className="space-y-3">
                      <p className="pl-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                        {group}
                      </p>
                      {groupCategories.map((category) => (
                        <CategorySection key={category.id} category={category} />
                      ))}
                    </div>
                  );
                })}
              </div>
              <AddCategoryDialog type="expense" buttonLabel="Add expense category" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
