'use client';

import { useBudgetStore } from '@/lib/stores/budget-store';
import { CategorySection } from '@/components/budget/category-section';
import { AddCategoryDialog } from '@/components/budget/add-category-dialog';
import { BudgetChart } from '@/components/budget/budget-chart';
import { BudgetSummaryTable } from '@/components/budget/budget-summary-table';

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

  const incomeCategories = currentBudget?.categories.filter((c) => c.type === 'income') || [];
  const expenseCategories = currentBudget?.categories.filter((c) => c.type === 'expense') || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Main content */}
        <main className="flex-1">
          <div className="grid gap-6 p-4 md:p-8 lg:grid-cols-3">
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
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold uppercase tracking-wider text-primary">
                    Expenses
                  </h2>
                </div>

                {expenseCategories.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <p className="text-muted-foreground">
                      {'No expense categories yet. Add one to start tracking your expenses.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {expenseCategories.map((category) => (
                      <CategorySection key={category.id} category={category} />
                    ))}
                  </div>
                )}
              </div>

              <AddCategoryDialog />
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
        </main>
      </div>
    </div>
  );
}
