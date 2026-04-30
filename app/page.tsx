'use client'

import { useMemo } from 'react'
import { Receipt, Wallet } from 'lucide-react'
import { AddCategoryDialog } from '@/components/budget/add-category-dialog'
import { BudgetChart } from '@/components/budget/budget-chart'
import { BudgetHeader } from '@/components/budget/budget-header'
import { BudgetSummaryTable } from '@/components/budget/budget-summary-table'
import { CategorySection } from '@/components/budget/category-section'
import { EmptyState } from '@/components/ui/empty-state'
import { PageLoader } from '@/components/ui/page-loader'
import { SectionHeader } from '@/components/ui/section-header'
import { EXPENSE_GROUPS } from '@/lib/constants/budget-groups'
import { TRANSACTION_TYPES } from '@/lib/constants/transactions'
import { useBudgetStore } from '@/lib/stores/budget-store'
import { filterByType, groupExpensesByExpenseGroup } from '@/lib/utils/categories'

export default function HomePage() {
	const currentBudget = useBudgetStore(state => state.currentBudget)
	const loading = useBudgetStore(state => state.loading)

	const { incomeCategories, expensesByGroup, hasExpenses } = useMemo(() => {
		const categories = currentBudget?.categories ?? []
		const income = filterByType(categories, TRANSACTION_TYPES.INCOME)
		const grouped = groupExpensesByExpenseGroup(categories)
		const hasAny = Array.from(grouped.values()).some(list => list.length > 0)
		return {
			incomeCategories: income,
			expensesByGroup: grouped,
			hasExpenses: hasAny
		}
	}, [currentBudget])

	if (loading) {
		return <PageLoader label="Loading budget..." />
	}

	return (
		<main className="flex-1">
			<div className="space-y-8 p-4 md:p-8">
				<BudgetHeader />

				<div className="grid gap-6 lg:grid-cols-3">
					<div className="space-y-4 lg:sticky lg:top-8 lg:col-start-3 lg:row-start-1 lg:self-start">
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
									{incomeCategories.map(category => (
										<CategorySection key={category.id} category={category} />
									))}
								</div>
							)}
							<AddCategoryDialog type={TRANSACTION_TYPES.INCOME} buttonLabel="Add income category" />
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
								{EXPENSE_GROUPS.map(group => {
									const list = expensesByGroup.get(group) ?? []
									if (list.length === 0) {
										return null
									}
									return (
										<div key={group} className="space-y-3">
											<p className="pl-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
												{group}
											</p>
											{list.map(category => (
												<CategorySection key={category.id} category={category} />
											))}
										</div>
									)
								})}
							</div>
							<AddCategoryDialog type={TRANSACTION_TYPES.EXPENSE} buttonLabel="Add expense category" />
						</div>
					</div>
				</div>
			</div>
		</main>
	)
}
