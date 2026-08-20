'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { AddTransactionDialog } from '@/components/budget/add-transaction-dialog'
import { EditBudgetItemDialog } from '@/components/budget/edit-budget-item-dialog'
import { EditTransactionDialog } from '@/components/budget/edit-transaction-dialog'
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
	const [showAllTransactions, setShowAllTransactions] = useState(false)
	const isIncome = type === TRANSACTION_TYPES.INCOME
	const transactions = item.transactions

	const orderedTransactions = [...transactions].reverse()
	const visibleTransactions = showAllTransactions ? orderedTransactions : orderedTransactions.slice(0, 3)
	const hiddenCount = orderedTransactions.length - visibleTransactions.length

	const remaining = item.plannedAmount - item.spentAmount
	const isOverBudget = !isIncome && item.spentAmount > item.plannedAmount

	return (
		<div className="rounded-lg border border-border bg-background p-4">
			<div className="space-y-3">
				<div className="flex items-start justify-between gap-2">
					<div className="min-w-0 flex-1">
						<h4 className="truncate text-sm font-semibold">{item.name}</h4>
						<div className="mt-0.5 flex items-baseline gap-1.5">
							<span className={cn('font-serif text-lg font-semibold', isOverBudget && 'text-over')}>
								${item.spentAmount.toFixed(2)}
							</span>
							<span className="text-xs text-muted-foreground">
								{isIncome ? 'of $' : '/ $'}
								{item.plannedAmount.toFixed(2)}
							</span>
						</div>
					</div>
					<div className="flex shrink-0 items-center gap-0.5">
						<EditBudgetItemDialog categoryId={categoryId} item={item} />
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
				</div>

				<p className={cn('text-xs', isOverBudget ? 'text-over' : 'text-muted-foreground')}>
					{isIncome
						? `Received: $${item.spentAmount.toFixed(2)}`
						: isOverBudget
							? `Over by $${Math.abs(remaining).toFixed(2)}`
							: `Left: $${remaining.toFixed(2)}`}
				</p>

				<AddTransactionDialog categoryId={categoryId} budgetItemId={item.id} transactionType={type} />

				{transactions.length > 0 && (
					<div className="space-y-1.5 rounded-lg border border-border bg-muted/30 p-2.5">
						<p className="text-xs font-medium text-muted-foreground">
							{showAllTransactions ? 'All Transactions' : 'Recent Transactions'}
						</p>
						{visibleTransactions.map(transaction => (
							<EditTransactionDialog
								key={transaction.id}
								categoryId={categoryId}
								budgetItemId={item.id}
								transaction={transaction}
							/>
						))}
						{orderedTransactions.length > 3 && (
							<button
								type="button"
								onClick={() => setShowAllTransactions(!showAllTransactions)}
								className="text-xs text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							>
								{showAllTransactions ? 'Show less' : `+${hiddenCount} more`}
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	)
}
