'use client'

import { doc, getDoc } from 'firebase/firestore'
import { useState } from 'react'
import { Copy, Loader2 } from 'lucide-react'
import { TemplatePickerDialog } from '@/components/budget/template-picker-dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { COLLECTIONS } from '@/lib/constants/firebase'
import { db } from '@/lib/firebase'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useBudgetStore } from '@/lib/stores/budget-store'
import { Budget } from '@/lib/types'
import { cloneCategories, getBudgetId } from '@/lib/utils/budget-transform'
import { getMonthString } from '@/lib/utils/dates'

interface BudgetEmptyStateProps {
	onStartFresh: () => void
}

export function BudgetEmptyState({ onStartFresh }: BudgetEmptyStateProps) {
	const { toast } = useToast()
	const user = useAuthStore(state => state.user)
	const currentBudget = useBudgetStore(state => state.currentBudget)
	const setCategories = useBudgetStore(state => state.setCategories)
	const [copying, setCopying] = useState(false)

	const handleCopyLastMonth = async () => {
		if (!user || !currentBudget) {
			return
		}
		setCopying(true)
		try {
			const [yearStr, monthStr] = currentBudget.month.split('-')
			const prevMonth = getMonthString(new Date(Number(yearStr), Number(monthStr) - 2))
			const snapshot = await getDoc(doc(db, COLLECTIONS.BUDGETS, getBudgetId(user.uid, prevMonth)))
			const prevBudget = snapshot.exists() ? (snapshot.data() as Budget) : null
			if (!prevBudget?.categories?.length) {
				toast({ description: 'No budget found for last month.' })
				return
			}
			await setCategories(cloneCategories(prevBudget.categories))
		} catch {
			toast({ description: "Failed to copy last month's budget.", variant: 'destructive' })
		} finally {
			setCopying(false)
		}
	}

	return (
		<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
			<h2 className="text-lg font-semibold">Your budget is empty</h2>
			<p className="mt-1 text-sm text-muted-foreground">How would you like to get started?</p>

			<div className="mt-6 flex flex-col gap-3 sm:flex-row">
				<TemplatePickerDialog />
				<Button variant="outline" onClick={handleCopyLastMonth} disabled={copying}>
					{copying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
					Copy last month
				</Button>
			</div>

			<button
				type="button"
				onClick={onStartFresh}
				className="mt-5 text-sm text-muted-foreground underline-offset-4 hover:underline"
			>
				or start from scratch
			</button>
		</div>
	)
}
