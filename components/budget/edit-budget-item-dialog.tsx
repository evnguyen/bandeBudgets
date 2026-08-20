'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import type { EditBudgetItemDialogProps } from '@/components/budget/types'
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

export const EditBudgetItemDialog = ({ categoryId, item }: EditBudgetItemDialogProps) => {
	const updateBudgetItem = useBudgetStore(state => state.updateBudgetItem)
	const [open, setOpen] = useState(false)
	const [name, setName] = useState(item.name)
	const [plannedAmount, setPlannedAmount] = useState(String(item.plannedAmount))

	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) {
			setName(item.name)
			setPlannedAmount(String(item.plannedAmount))
		}
		setOpen(nextOpen)
	}

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault()
		const trimmedName = name.trim()
		if (!trimmedName || !plannedAmount) {
			return
		}
		const parsedAmount = parseFloat(plannedAmount)
		if (Number.isNaN(parsedAmount)) {
			return
		}

		await updateBudgetItem(categoryId, item.id, {
			name: trimmedName,
			plannedAmount: parsedAmount
		})

		setOpen(false)
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="icon" aria-label="Edit item" className="h-7 w-7 shrink-0">
					<Pencil className="h-3.5 w-3.5 text-muted-foreground" />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Budget Item</DialogTitle>
					<DialogDescription>Update the name or planned amount for this item</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor={`edit-item-name-${item.id}`}>Item Name</Label>
						<Input
							id={`edit-item-name-${item.id}`}
							placeholder="e.g., Rent, Groceries"
							value={name}
							onChange={event => setName(event.target.value)}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor={`edit-item-planned-${item.id}`}>Planned Amount</Label>
						<Input
							id={`edit-item-planned-${item.id}`}
							type="number"
							step="0.01"
							placeholder="0.00"
							value={plannedAmount}
							onChange={event => setPlannedAmount(event.target.value)}
							required
						/>
					</div>
					<Button type="submit" className="w-full">
						Save Changes
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	)
}
