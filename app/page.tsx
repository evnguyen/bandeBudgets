'use client';

import { useMemo } from 'react';
import { useBudgetStore } from '@/lib/stores/budget-store';
import { CategorySection } from '@/components/budget/category-section';
import { AddCategoryDialog } from '@/components/budget/add-category-dialog';
import { BudgetChart } from '@/components/budget/budget-chart';
import { BudgetSummaryTable } from '@/components/budget/budget-summary-table';
import { BudgetHeader } from '@/components/budget/budget-header';
import { PageLoader } from '@/components/ui/page-loader';
import { TRANSACTION_TYPES } from '@/lib/constants/transactions';
import {
  EXPENSE_GROUPS,
  DEFAULT_EXPENSE_GROUP,
  ExpenseGroup,
} from '@/lib/constants/budget-groups';
import { Wallet, Receipt } from 'lucide-react';
import type { Category } from '@/lib/types';

interface SectionHeaderProps {
  label: string;
}

const SectionHeader = ({ label }: SectionHeaderProps) => (
  <div className="flex items-center gap-3">
    <div className="h-4 w-0.5 rounded-full bg-primary" />
    <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      {label}
    </h2>
  </div>
);

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const EmptyState = ({ icon, title, description }: EmptyStateProps) => (
  <div className="rounded-xl border border-dashed border-border p-10 text-center">
    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
      {icon}
    </div>
    <p className="text-sm font-medium">{title}</p>
    <p className="mt-1 text-xs text-muted-foreground">{description}</p>
  </div>
);

const sortByOrder = (a: Category, b: Category) => a.order - b.order;

export default function HomePage() {
  const currentBudget = useBudgetStore((s) => s.currentBudget);
  const loading = useBudgetStore((s) => s.loading);

  const { incomeCategories, expenseGroupedCategories } = useMemo(() => {
    const categories = currentBudget?.categories ?? [];
    const income = categories
      .filter((c) => c.type === TRANSACTION_TYPES.INCOME)
      .slice()
      .sort(sortByOrder);
    const expenses = categories
      .filter((c) => c.type === TRANSACTION_TYPES.EXPENSE)
      .slice()
      .sort(sortByOrder);

    const grouped = new Map<ExpenseGroup, Category[]>();
    for (const group of EXPENSE_GROUPS) grouped.set(group, []);
    for (const cat of expenses) {
      const group = cat.expenseGroup ?? DEFAULT_EXPENSE_GROUP;
      grouped.get(group)?.push(cat);
    }

    return {
      incomeCategories: income,
      expenseGroupedCategories: grouped,
    };
  }, [currentBudget]);

  if (loading) return <PageLoader label="Loading budget..." />;

  const hasExpenses = Array.from(expenseGroupedCategories.values()).some(
    (list) => list.length > 0,
  );

  return (
    <main className="flex-1">
      <div className="space-y-8 p-4 md:p-8">
        <BudgetHeader />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-start-3 lg:row-start-1 lg:sticky lg:top-8 lg:self-start">
            <SectionHeader label="Overview" />
            {currentBudget && (
              <>
                <BudgetChart categories={currentBudget.categories} />
                <BudgetSummaryTable categories={currentBudget.categories} />
              </>
            )}
          </div>

          <div className="space-y-8 lg:col-span-2 lg:col-start-1 lg:row-start-1">
            <div className="space-y-3">
              <SectionHeader label="Monthly Income" />
              {incomeCategories.length === 0 ? (
                <EmptyState
                  icon={<Wallet className="h-5 w-5 text-muted-foreground" />}
                  title="No income categories yet"
                  description="Add one to start tracking your income."
                />
              ) : (
                <div className="space-y-3">
                  {incomeCategories.map((category) => (
                    <CategorySection key={category.id} category={category} />
                  ))}
                </div>
              )}
              <AddCategoryDialog
                type={TRANSACTION_TYPES.INCOME}
                buttonLabel="Add income category"
              />
            </div>

            <div className="space-y-3">
              <SectionHeader label="Expenses" />
              {!hasExpenses && (
                <EmptyState
                  icon={<Receipt className="h-5 w-5 text-muted-foreground" />}
                  title="No expense categories yet"
                  description="Add one to start tracking your expenses."
                />
              )}
              <div className="space-y-6">
                {EXPENSE_GROUPS.map((group) => {
                  const list = expenseGroupedCategories.get(group) ?? [];
                  if (list.length === 0) return null;
                  return (
                    <div key={group} className="space-y-3">
                      <p className="pl-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                        {group}
                      </p>
                      {list.map((category) => (
                        <CategorySection key={category.id} category={category} />
                      ))}
                    </div>
                  );
                })}
              </div>
              <AddCategoryDialog
                type={TRANSACTION_TYPES.EXPENSE}
                buttonLabel="Add expense category"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
