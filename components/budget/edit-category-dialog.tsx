'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import type { EditCategoryDialogProps } from '@/components/budget/types'
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

export const EditCategoryDialog = ({ category }: EditCategoryDialogProps) => {
	const updateCategory = useBudgetStore(state => state.updateCategory)
	const [open, setOpen] = useState(false)
	const [name, setName] = useState(category.name)
	const [expenseGroup, setExpenseGroup] = useState<ExpenseGroup>(category.expenseGroup ?? DEFAULT_EXPENSE_GROUP)

	const isExpense = category.type === TRANSACTION_TYPES.EXPENSE

	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) {
			setName(category.name)
			setExpenseGroup(category.expenseGroup ?? DEFAULT_EXPENSE_GROUP)
		}
		setOpen(nextOpen)
	}

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault()
		const trimmedName = name.trim()
		if (!trimmedName) {
			return
		}

		await updateCategory(category.id, {
			name: trimmedName,
			expenseGroup: isExpense ? expenseGroup : null
		})

		setOpen(false)
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="icon" aria-label="Edit category" className="h-8 w-8">
					<Pencil className="h-3.5 w-3.5 text-muted-foreground" />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Category</DialogTitle>
					<DialogDescription>
						{isExpense ? 'Rename this category or move it to another expense group.' : 'Rename this category.'}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor={`edit-category-name-${category.id}`}>Category Name</Label>
						<Input
							id={`edit-category-name-${category.id}`}
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
						Save Changes
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	)
}
