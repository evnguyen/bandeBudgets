'use client'

import { doc, getDoc } from 'firebase/firestore'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { AI_INSIGHTS_COOLDOWN_MS, AI_INSIGHTS_ERRORS } from '@/lib/constants/ai-models'
import { COLLECTIONS } from '@/lib/constants/firebase'
import { STORAGE_KEYS } from '@/lib/constants/keys'
import { db } from '@/lib/firebase'
import { useAuthStore } from '@/lib/stores/auth-store'
import type { AiInsightsRequest, Budget, BudgetMonthSummary } from '@/lib/types'
import { getBudgetId } from '@/lib/utils/budget-transform'
import { getMonthString } from '@/lib/utils/dates'

type InsightState = 'idle' | 'loading-history' | 'loading-ai' | 'success'

function getCooldownRemaining(): number {
	try {
		const stored = localStorage.getItem(STORAGE_KEYS.AI_INSIGHTS_COOLDOWN)
		if (!stored) {
			return 0
		}
		const elapsed = Date.now() - Number(stored)
		return elapsed >= AI_INSIGHTS_COOLDOWN_MS ? 0 : Math.ceil((AI_INSIGHTS_COOLDOWN_MS - elapsed) / 1000)
	} catch {
		return 0
	}
}

function saveCooldownTimestamp(): void {
	try {
		localStorage.setItem(STORAGE_KEYS.AI_INSIGHTS_COOLDOWN, String(Date.now()))
	} catch {
		return
	}
}

function buildMonthSummary(budget: Budget): BudgetMonthSummary {
	return {
		month: budget.month,
		totalIncome: budget.totalIncome,
		totalExpenses: budget.totalExpenses,
		categories: budget.categories.map(category => ({
			name: category.name,
			type: category.type,
			planned: category.budgetItems.reduce((sum, item) => sum + item.plannedAmount, 0),
			spent: category.budgetItems.reduce((sum, item) => sum + item.spentAmount, 0)
		}))
	}
}

async function loadBudgetHistory(userId: string): Promise<BudgetMonthSummary[]> {
	const months = Array.from({ length: 6 }, (_, index) => {
		const date = new Date()
		date.setMonth(date.getMonth() - index)
		return getMonthString(date)
	})

	const snapshots = await Promise.all(
		months.map(month => getDoc(doc(db, COLLECTIONS.BUDGETS, getBudgetId(userId, month))))
	)

	return snapshots.filter(snapshot => snapshot.exists()).map(snapshot => buildMonthSummary(snapshot.data() as Budget))
}

export const AiInsightsDialog = () => {
	const user = useAuthStore(state => state.user)
	const { toast } = useToast()

	const [open, setOpen] = useState(false)
	const [state, setState] = useState<InsightState>('idle')
	const [userContext, setUserContext] = useState('')
	const [insights, setInsights] = useState('')
	const [cooldown, setCooldown] = useState(0)

	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

	const startCooldownTimer = useCallback((seconds: number) => {
		setCooldown(seconds)
		if (intervalRef.current) {
			clearInterval(intervalRef.current)
		}
		intervalRef.current = setInterval(() => {
			setCooldown(prev => {
				if (prev <= 1) {
					clearInterval(intervalRef.current!)
					intervalRef.current = null
					return 0
				}
				return prev - 1
			})
		}, 1000)
	}, [])

	useEffect(() => {
		if (!open) {
			return
		}
		const remaining = getCooldownRemaining()
		if (remaining > 0) {
			startCooldownTimer(remaining)
		}
	}, [open, startCooldownTimer])

	useEffect(() => {
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current)
			}
		}
	}, [])

	const handleGenerate = useCallback(async () => {
		if (!user) {
			return
		}

		setState('loading-history')

		let history: BudgetMonthSummary[]
		try {
			history = await loadBudgetHistory(user.uid)
		} catch {
			toast({ description: 'Failed to load budget history.', variant: 'destructive' })
			setState('idle')
			return
		}

		if (history.length === 0) {
			toast({ description: 'No budget data found. Add some categories first.' })
			setState('idle')
			return
		}

		setState('loading-ai')

		const requestBody: AiInsightsRequest = { userId: user.uid, budgetHistory: history, userContext }

		try {
			const response = await fetch('/api/ai-insights', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(requestBody)
			})

			if (!response.ok) {
				const serverError = await response
					.json()
					.then((body: { error?: string }) => body.error ?? null)
					.catch(() => null)
				const description = serverError ?? AI_INSIGHTS_ERRORS[response.status] ?? 'AI request failed. Please try again.'
				toast({ description, variant: 'destructive' })
				setState('idle')
				return
			}

			const data = (await response.json()) as { insights: string }
			setInsights(data.insights)
			setState('success')
			saveCooldownTimestamp()
			startCooldownTimer(AI_INSIGHTS_COOLDOWN_MS / 1000)
		} catch {
			toast({ description: 'Network error. Check your connection.', variant: 'destructive' })
			setState('idle')
		}
	}, [user, userContext, toast, startCooldownTimer])

	const isLoading = state === 'loading-history' || state === 'loading-ai'
	const loadingMessage = state === 'loading-history' ? 'Fetching your budget data…' : 'Analysing with AI…'

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" className="gap-1.5">
					<Sparkles className="h-4 w-4" />
					AI Insights
				</Button>
			</DialogTrigger>

			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Sparkles className="h-5 w-5 text-primary" />
						AI Budget Insights
					</DialogTitle>
					<DialogDescription>
						Analyses your last 6 months of budget data and gives actionable savings advice.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-2">
					<Label htmlFor="ai-context">Additional context (optional)</Label>
					<Textarea
						id="ai-context"
						placeholder='e.g. "I eat out a lot" or "I want to save $5k by December"'
						value={userContext}
						onChange={e => setUserContext(e.target.value)}
						disabled={isLoading}
						className="resize-none"
						rows={2}
					/>
				</div>

				{isLoading && (
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Loader2 className="h-4 w-4 animate-spin" />
						{loadingMessage}
					</div>
				)}

				{state === 'success' && (
					<ScrollArea className="h-64 rounded-md border bg-muted/30 p-4">
						<p className="whitespace-pre-wrap text-sm leading-relaxed">{insights}</p>
					</ScrollArea>
				)}

				<Button onClick={handleGenerate} disabled={isLoading || cooldown > 0} className="w-full">
					{isLoading
						? 'Generating…'
						: cooldown > 0
							? `Wait ${cooldown}s`
							: state === 'success'
								? 'Regenerate'
								: 'Generate Insights'}
				</Button>
			</DialogContent>
		</Dialog>
	)
}
