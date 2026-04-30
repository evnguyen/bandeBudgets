'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { AddCategoryDialogProps } from '@/components/budget/types'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DEFAULT_EXPENSE_GROUP, EXPENSE_GROUPS, ExpenseGroup } from '@/lib/constants/budget-groups'
import { TRANSACTION_TYPES } from '@/lib/constants/transactions'
import { useBudgetStore } from '@/lib/stores/budget-store'

export const AddCategoryDialog = ({ type, buttonLabel = 'Add category' }: AddCategoryDialogProps) => {
	const addCategory = useBudgetStore(state => state.addCategory)
	const currentBudget = useBudgetStore(state => state.currentBudget)
	const [open, setOpen] = useState(false)
	const [name, setName] = useState('')
	const [expenseGroup, setExpenseGroup] = useState<ExpenseGroup>(DEFAULT_EXPENSE_GROUP)

	const isExpense = type === TRANSACTION_TYPES.EXPENSE

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault()
		if (!name.trim()) {
			return
		}

		const order = currentBudget?.categories.length ?? 0
		await addCategory({
			name,
			type,
			expenseGroup: isExpense ? expenseGroup : null,
			order
		})

		setName('')
		setExpenseGroup(DEFAULT_EXPENSE_GROUP)
		setOpen(false)
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<button
					type="button"
					className="flex w-full items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				>
					<Plus className="h-4 w-4" />
					{buttonLabel}
				</button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add New Category</DialogTitle>
					<DialogDescription>
						{isExpense ? 'Create a new expense category.' : 'Create a new income category.'}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="category-name">Category Name</Label>
						<Input
							id="category-name"
							placeholder="e.g., Housing, Salary"
							value={name}
							onChange={event => setName(event.target.value)}
							required
						/>
					</div>
					{isExpense && (
						<div className="space-y-2">
							<Label>Expense Group</Label>
							<Select value={expenseGroup} onValueChange={value => setExpenseGroup(value as ExpenseGroup)}>
								<SelectTrigger>
									<SelectValue placeholder="Select a group" />
								</SelectTrigger>
								<SelectContent>
									{EXPENSE_GROUPS.map(group => (
										<SelectItem key={group} value={group}>
											{group}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}
					<Button type="submit" className="w-full">
						Create Category
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	)
}
