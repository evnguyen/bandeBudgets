'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import type { EditTransactionDialogProps } from '@/components/budget/types'
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

export const EditTransactionDialog = ({ categoryId, budgetItemId, transaction }: EditTransactionDialogProps) => {
	const updateTransaction = useBudgetStore(state => state.updateTransaction)
	const deleteTransaction = useBudgetStore(state => state.deleteTransaction)
	const [open, setOpen] = useState(false)
	const [description, setDescription] = useState(transaction.description)
	const [amount, setAmount] = useState(String(transaction.amount))
	const [date, setDate] = useState(transaction.date)
	const [confirmingDelete, setConfirmingDelete] = useState(false)

	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) {
			setDescription(transaction.description)
			setAmount(String(transaction.amount))
			setDate(transaction.date)
			setConfirmingDelete(false)
		}
		setOpen(nextOpen)
	}

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault()
		const trimmedDescription = description.trim()
		if (!trimmedDescription || !amount) {
			return
		}
		const parsedAmount = parseFloat(amount)
		if (Number.isNaN(parsedAmount)) {
			return
		}

		await updateTransaction(categoryId, budgetItemId, transaction.id, {
			description: trimmedDescription,
			amount: parsedAmount,
			date
		})

		setOpen(false)
	}

	const handleDelete = async () => {
		await deleteTransaction(categoryId, budgetItemId, transaction.id)
		setOpen(false)
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<button
					type="button"
					aria-label={`Edit transaction ${transaction.description}`}
					className="-mx-1 flex w-full items-center justify-between gap-2 rounded px-1 py-0.5 text-left text-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					<span className="truncate text-foreground/80">{transaction.description}</span>
					<span className="shrink-0 font-medium">${transaction.amount.toFixed(2)}</span>
				</button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Transaction</DialogTitle>
					<DialogDescription>Update or remove this transaction</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor={`edit-transaction-description-${transaction.id}`}>Description</Label>
						<Input
							id={`edit-transaction-description-${transaction.id}`}
							placeholder="e.g., Weekly grocery shopping"
							value={description}
							onChange={event => setDescription(event.target.value)}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor={`edit-transaction-amount-${transaction.id}`}>Amount</Label>
						<Input
							id={`edit-transaction-amount-${transaction.id}`}
							type="number"
							step="0.01"
							placeholder="0.00"
							value={amount}
							onChange={event => setAmount(event.target.value)}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor={`edit-transaction-date-${transaction.id}`}>Date</Label>
						<Input
							id={`edit-transaction-date-${transaction.id}`}
							type="date"
							value={date}
							onChange={event => setDate(event.target.value)}
							required
						/>
					</div>
					<Button type="submit" className="w-full">
						Save Changes
					</Button>
				</form>

				{confirmingDelete ? (
					<div className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3">
						<p className="text-sm text-muted-foreground">
							Delete this transaction? This action cannot be undone and will update the amount spent.
						</p>
						<div className="flex gap-2">
							<Button type="button" variant="outline" className="flex-1" onClick={() => setConfirmingDelete(false)}>
								Cancel
							</Button>
							<Button
								type="button"
								onClick={handleDelete}
								className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
							>
								Delete
							</Button>
						</div>
					</div>
				) : (
					<Button
						type="button"
						variant="ghost"
						onClick={() => setConfirmingDelete(true)}
						className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
					>
						<Trash2 className="mr-2 h-4 w-4" />
						Delete Transaction
					</Button>
				)}
			</DialogContent>
		</Dialog>
	)
}
