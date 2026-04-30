'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { AddBudgetItemDialog } from '@/components/budget/add-budget-item-dialog'
import { BudgetItemCard } from '@/components/budget/budget-item-card'
import type { CategorySectionProps } from '@/components/budget/types'
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

export const CategorySection = ({ category }: CategorySectionProps) => {
	const deleteCategory = useBudgetStore(state => state.deleteCategory)
	const [isExpanded, setIsExpanded] = useState(true)

	const totalPlanned = category.budgetItems.reduce((sum, item) => sum + item.plannedAmount, 0)
	const totalSpent = category.budgetItems.reduce((sum, item) => sum + item.spentAmount, 0)
	const isOverBudget = category.type === TRANSACTION_TYPES.EXPENSE && totalSpent > totalPlanned && totalPlanned > 0

	return (
		<div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
			<div className={cn('h-0.5', isOverBudget ? 'bg-red-500' : 'bg-primary')} />

			<div className="border-b border-border px-5 py-4">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0 flex-1">
						<h3 className="font-semibold text-foreground">{category.name}</h3>
						<div className="mt-0.5 flex items-baseline gap-1.5">
							<span className={cn('text-xl font-bold', isOverBudget ? 'text-red-500' : 'text-foreground')}>
								${totalSpent.toFixed(2)}
							</span>
							{totalPlanned > 0 && <span className="text-xs text-muted-foreground">of ${totalPlanned.toFixed(2)}</span>}
						</div>
					</div>
					<div className="flex shrink-0 items-center gap-1">
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button variant="ghost" size="icon" aria-label="Delete category" className="h-8 w-8">
									<Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Delete Category</AlertDialogTitle>
									<AlertDialogDescription>
										Are you sure you want to delete this category? This will remove all budget items and transactions
										within it.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction
										onClick={() => deleteCategory(category.id)}
										className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
									>
										Delete
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setIsExpanded(!isExpanded)}
							aria-label={isExpanded ? 'Collapse category' : 'Expand category'}
							aria-expanded={isExpanded}
							className="h-8 w-8"
						>
							{isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
						</Button>
					</div>
				</div>
			</div>

			{isExpanded && (
				<div className="p-5">
					{category.budgetItems.length === 0 ? (
						<div className="py-6 text-center">
							<p className="text-sm text-muted-foreground">No budget items yet. Add your first item to get started.</p>
						</div>
					) : (
						<div className="grid gap-3 md:grid-cols-2">
							{category.budgetItems.map(item => (
								<BudgetItemCard key={item.id} categoryId={category.id} item={item} type={category.type} />
							))}
						</div>
					)}
					<div className="mt-4">
						<AddBudgetItemDialog categoryId={category.id} />
					</div>
				</div>
			)}
		</div>
	)
}
