'use client'

import { Trash2 } from 'lucide-react'
import { AddTransactionDialog } from '@/components/budget/add-transaction-dialog'
import type { BudgetItemCardProps } from '@/components/budget/types'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { TRANSACTION_TYPES } from '@/lib/constants/transactions'
import { useBudgetStore } from '@/lib/stores/budget-store'
import { cn } from '@/lib/utils'

export const BudgetItemCard = ({ categoryId, item, type }: BudgetItemCardProps) => {
	const deleteBudgetItem = useBudgetStore(state => state.deleteBudgetItem)
	const isIncome = type === TRANSACTION_TYPES.INCOME
	const transactions = item.transactions

	const remaining = item.plannedAmount - item.spentAmount
	const isOverBudget = !isIncome && item.spentAmount > item.plannedAmount

	return (
		<div className="rounded-lg border border-border bg-background p-4">
			<div className="space-y-3">
				<div className="flex items-start justify-between gap-2">
					<div className="min-w-0 flex-1">
						<h4 className="truncate text-sm font-semibold">{item.name}</h4>
						<div className="mt-0.5 flex items-baseline gap-1.5">
							<span className={cn('text-lg font-bold', isOverBudget && 'text-red-500')}>
								${item.spentAmount.toFixed(2)}
							</span>
							<span className="text-xs text-muted-foreground">
								{isIncome ? 'of $' : '/ $'}
								{item.plannedAmount.toFixed(2)}
							</span>
						</div>
					</div>
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button variant="ghost" size="icon" aria-label="Delete item" className="h-7 w-7 shrink-0">
								<Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Delete Budget Item</AlertDialogTitle>
								<AlertDialogDescription>
									Are you sure you want to delete this budget item? This action cannot be undone and will remove all
									associated transactions.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction
									onClick={() => deleteBudgetItem(categoryId, item.id)}
									className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
								>
									Delete
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>

				<p className={cn('text-xs', isOverBudget ? 'text-red-500' : 'text-muted-foreground')}>
					{isIncome
						? `Received: $${item.spentAmount.toFixed(2)}`
						: isOverBudget
							? `Over by $${Math.abs(remaining).toFixed(2)}`
							: `Left: $${remaining.toFixed(2)}`}
				</p>

				<AddTransactionDialog categoryId={categoryId} budgetItemId={item.id} transactionType={type} />

				{transactions.length > 0 && (
					<div className="space-y-1.5 rounded-lg border border-border bg-muted/30 p-2.5">
						<p className="text-xs font-medium text-muted-foreground">Recent Transactions</p>
						{transactions
							.slice(-3)
							.reverse()
							.map(transaction => (
								<div key={transaction.id} className="flex items-center justify-between gap-2 text-xs">
									<span className="truncate text-foreground/80">{transaction.description}</span>
									<span className="shrink-0 font-medium">${transaction.amount.toFixed(2)}</span>
								</div>
							))}
						{transactions.length > 3 && (
							<p className="text-xs text-muted-foreground">+{transactions.length - 3} more</p>
						)}
					</div>
				)}
			</div>
		</div>
	)
}
