'use client'

import { ChevronLeft, ChevronRight, Target, TrendingDown, TrendingUp } from 'lucide-react'
import { AiInsightsDialog } from '@/components/budget/ai-insights-dialog'
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
		next.setMonth(next.getMonth() + months)
		console.info('[BudgetHeader] shiftMonth →', formatMonth(next))
		if (user) {
			setMonth(user.uid, next)
		}
	}

	const goToToday = () => {
		const now = new Date()
		console.info('[BudgetHeader] goToToday →', formatMonth(now))
		if (user) {
			setMonth(user.uid, now)
		}
	}

	const totalIncome = currentBudget?.totalIncome ?? 0
	const totalExpenses = currentBudget?.totalExpenses ?? 0
	const remaining = totalIncome - totalExpenses

	return (
		<div className="space-y-5">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Budget</h1>
					<p className="text-sm text-muted-foreground">Zero-based monthly budget</p>
				</div>
				<div className="flex items-center gap-2">
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
					<AiInsightsDialog />
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
					icon={<Target className={cn('h-4 w-4', remaining >= 0 ? 'text-primary' : 'text-red-500')} />}
					iconBg={remaining >= 0 ? 'bg-primary/10' : 'bg-red-500/10'}
					amountClass={remaining >= 0 ? 'text-primary' : 'text-red-500'}
					fullWidthOnMobile
				/>
			</div>
		</div>
	)
}
