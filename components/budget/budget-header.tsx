'use client'

import { ChevronLeft, ChevronRight, Target, TrendingDown, TrendingUp } from 'lucide-react'
import { QuickAddDialog } from '@/components/budget/quick-add-dialog'
import { SummaryCard } from '@/components/budget/summary-card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useBudgetStore } from '@/lib/stores/budget-store'
import { cn } from '@/lib/utils'
import { formatMonth } from '@/lib/utils/dates'

export const BudgetHeader = () => {
	const currentBudget = useBudgetStore(state => state.currentBudget)
	const currentDate = useBudgetStore(state => state.currentDate)
	const setMonth = useBudgetStore(state => state.setMonth)
	const user = useAuthStore(state => state.user)

	const shiftMonth = (months: number) => {
		const next = new Date(currentDate)
		next.setDate(1)
		next.setMonth(next.getMonth() + months)
		if (user) {
			setMonth(user.uid, next)
		}
	}

	const goToToday = () => {
		if (user) {
			setMonth(user.uid, new Date())
		}
	}

	const totalIncome = currentBudget?.totalIncome ?? 0
	const totalExpenses = currentBudget?.totalExpenses ?? 0
	const remaining = totalIncome - totalExpenses

	return (
		<div className="space-y-5">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-serif text-2xl font-semibold tracking-tight">Budget</h1>
					<p className="text-sm text-muted-foreground">Zero-based monthly budget</p>
				</div>
				<div className="flex flex-wrap items-center gap-1.5">
					<QuickAddDialog />
					<Button
						variant="outline"
						size="icon"
						onClick={() => shiftMonth(-1)}
						aria-label="Previous month"
						className="h-9 w-9 shrink-0"
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<Button variant="ghost" onClick={goToToday} className="h-9 min-w-[148px] text-sm font-medium">
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
					icon={<TrendingUp className="h-4 w-4 text-positive" />}
					iconBg="bg-positive/10"
					amountClass="text-positive"
				/>
				<SummaryCard
					label="Planned Expenses"
					amount={totalExpenses}
					icon={<TrendingDown className="h-4 w-4 text-over" />}
					iconBg="bg-over/10"
					amountClass="text-over"
				/>
				<SummaryCard
					label="Left to Budget"
					amount={remaining}
					icon={<Target className={cn('h-4 w-4', remaining >= 0 ? 'text-primary' : 'text-over')} />}
					iconBg={remaining >= 0 ? 'bg-primary/10' : 'bg-over/10'}
					amountClass={remaining >= 0 ? 'text-primary' : 'text-over'}
					fullWidthOnMobile
				/>
			</div>
		</div>
	)
}
