import type { SummaryCardProps } from '@/components/budget/types'
import { cn } from '@/lib/utils'

export const SummaryCard = ({
	label,
	amount,
	icon,
	iconBg,
	amountClass,
	fullWidthOnMobile = false
}: SummaryCardProps) => (
	<div
		className={cn(
			'rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5',
			fullWidthOnMobile && 'col-span-2 sm:col-span-1'
		)}
	>
		<div className="flex items-start justify-between">
			<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
			<div className={cn('rounded-md p-1.5', iconBg)}>{icon}</div>
		</div>
		<p className={cn('mt-3 text-2xl font-bold tracking-tight sm:mt-4 sm:text-3xl', amountClass)}>
			${amount.toFixed(2)}
		</p>
	</div>
)
