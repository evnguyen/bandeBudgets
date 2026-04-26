'use client';

import { useBudgetStore } from '@/lib/stores/budget-store';
import { CategorySection } from '@/components/budget/category-section';
import { AddCategoryDialog } from '@/components/budget/add-category-dialog';
import { BudgetChart } from '@/components/budget/budget-chart';
import { BudgetSummaryTable } from '@/components/budget/budget-summary-table';
import { BudgetHeader } from '@/components/budget/budget-header';
import { DEFAULT_EXPENSE_GROUP, EXPENSE_GROUPS } from '@/lib/constants/budget-groups';

export default function HomePage() {
  const { currentBudget, loading } = useBudgetStore();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">{'Loading budget...'}</p>
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
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Main content */}
        <main className="flex-1">
          <div className="space-y-6 p-4 md:p-8">
            <BudgetHeader />
            <div className="grid gap-6 lg:grid-cols-3">
            {/* Left column - Categories list */}
              <div className="lg:col-span-2 space-y-6">
              {/* Income Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold uppercase tracking-wider text-primary">
                    Monthly Income
                  </h2>
                </div>

                {incomeCategories.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <p className="text-muted-foreground">
                      {'No income categories yet. Add one to start tracking your income.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {incomeCategories.map((category) => (
                      <CategorySection key={category.id} category={category} />
                    ))}
                  </div>
                )}
              </div>

              {/* Expenses Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold uppercase tracking-wider text-primary">
                    Expenses
                  </h2>
                </div>

                {expenseCategories.length === 0 && (
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <p className="text-muted-foreground">
                      {'No expense categories yet. Add one to start tracking your expenses.'}
                    </p>
                  </div>
                )}

                {EXPENSE_GROUPS.map((group) => {
                  const groupCategories = expenseCategories.filter(
                    (category) => (category.expenseGroup || DEFAULT_EXPENSE_GROUP) === group
                  );
                  if (groupCategories.length === 0) {
                    return null;
                  }

                  return (
                    <div key={group} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                          {group}
                        </h3>
                      </div>
                      <div className="space-y-4">
                        {groupCategories.map((category) => (
                          <CategorySection key={category.id} category={category} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
                <AddCategoryDialog allowTypeSelection buttonLabel="Add Category" />
              </div>

              {/* Right column - Chart and Summary */}
              <div className="space-y-6">
                {currentBudget && (
                  <>
                    <BudgetChart categories={currentBudget.categories} />
                    <BudgetSummaryTable categories={currentBudget.categories} />
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
