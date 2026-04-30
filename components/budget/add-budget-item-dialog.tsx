'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { AddBudgetItemDialogProps } from '@/components/budget/types'
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
import { useBudgetStore } from '@/lib/stores/budget-store'

export const AddBudgetItemDialog = ({ categoryId }: AddBudgetItemDialogProps) => {
	const addBudgetItem = useBudgetStore(state => state.addBudgetItem)
	const currentBudget = useBudgetStore(state => state.currentBudget)
	const [open, setOpen] = useState(false)
	const [name, setName] = useState('')
	const [plannedAmount, setPlannedAmount] = useState('')

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault()
		if (!name.trim() || !plannedAmount) {
			return
		}
		const parsedAmount = parseFloat(plannedAmount)
		if (Number.isNaN(parsedAmount)) {
			return
		}

		const category = currentBudget?.categories.find(existingCategory => existingCategory.id === categoryId)
		const order = category?.budgetItems.length ?? 0

		await addBudgetItem(categoryId, {
			categoryId,
			name,
			plannedAmount: parsedAmount,
			order
		})

		setName('')
		setPlannedAmount('')
		setOpen(false)
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="sm" className="w-full">
					<Plus className="mr-2 h-4 w-4" />
					Add Item
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Budget Item</DialogTitle>
					<DialogDescription>Add a new item to track in this category</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="item-name">Item Name</Label>
						<Input
							id="item-name"
							placeholder="e.g., Rent, Groceries"
							value={name}
							onChange={event => setName(event.target.value)}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="planned-amount">Planned Amount</Label>
						<Input
							id="planned-amount"
							type="number"
							step="0.01"
							placeholder="0.00"
							value={plannedAmount}
							onChange={event => setPlannedAmount(event.target.value)}
							required
						/>
					</div>
					<Button type="submit" className="w-full">
						Create Item
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	)
}
