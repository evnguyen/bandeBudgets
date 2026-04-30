'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { AddTransactionDialogProps } from '@/components/budget/types'
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
import { getTodayLocalDate } from '@/lib/utils/dates'

export const AddTransactionDialog = ({ categoryId, budgetItemId, transactionType }: AddTransactionDialogProps) => {
	const addTransaction = useBudgetStore(state => state.addTransaction)
	const [open, setOpen] = useState(false)
	const [description, setDescription] = useState('')
	const [amount, setAmount] = useState('')
	const [date, setDate] = useState(() => getTodayLocalDate())

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault()
		if (!description.trim() || !amount) {
			return
		}
		const parsedAmount = parseFloat(amount)
		if (Number.isNaN(parsedAmount)) {
			return
		}

		const saved = await addTransaction(categoryId, budgetItemId, {
			budgetItemId,
			amount: parsedAmount,
			description,
			date,
			type: transactionType
		})
		if (!saved) {
			return
		}

		setDescription('')
		setAmount('')
		setDate(getTodayLocalDate())
		setOpen(false)
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm">
					<Plus className="mr-2 h-4 w-4" />
					Add Transaction
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Transaction</DialogTitle>
					<DialogDescription>Record a new transaction for this budget item</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="transaction-description">Description</Label>
						<Input
							id="transaction-description"
							placeholder="e.g., Weekly grocery shopping"
							value={description}
							onChange={event => setDescription(event.target.value)}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="transaction-amount">Amount</Label>
						<Input
							id="transaction-amount"
							type="number"
							step="0.01"
							placeholder="0.00"
							value={amount}
							onChange={event => setAmount(event.target.value)}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="transaction-date">Date</Label>
						<Input
							id="transaction-date"
							type="date"
							value={date}
							onChange={event => setDate(event.target.value)}
							required
						/>
					</div>
					<Button type="submit" className="w-full">
						Add Transaction
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	)
}
