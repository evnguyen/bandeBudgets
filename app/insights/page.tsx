'use client'

import { doc, getDoc } from 'firebase/firestore'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
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

const SECTIONS = [
	{ key: 'SPENDING TRENDS', label: 'Spending Trends' },
	{ key: 'TOP CONCERNS', label: 'Top Concerns' },
	{ key: 'POSITIVE HABITS', label: 'Positive Habits' },
	{ key: 'RECOMMENDATIONS', label: 'Recommendations' },
	{ key: 'FORECAST', label: 'Forecast' }
]

function parseSections(text: string): Record<string, string> {
	const result: Record<string, string> = {}
	for (const { key } of SECTIONS) {
		const pattern = new RegExp(`${key}:\\s*([\\s\\S]*?)(?=${SECTIONS.map(s => s.key).join(':|')}:|$)`)
		const match = text.match(pattern)
		if (match?.[1]) {
			result[key] = match[1].trim()
		}
	}
	return result
}

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
		date.setDate(1)
		date.setMonth(date.getMonth() - index)
		return getMonthString(date)
	})

	const snapshots = await Promise.all(
		months.map(month => getDoc(doc(db, COLLECTIONS.BUDGETS, getBudgetId(userId, month))))
	)

	return snapshots.filter(snapshot => snapshot.exists()).map(snapshot => buildMonthSummary(snapshot.data() as Budget))
}

function GhostCards() {
	return (
		<div className="space-y-3">
			{SECTIONS.map(({ key, label }) => (
				<div key={key} className="rounded-xl border border-dashed border-border bg-card/50 px-5 py-4">
					<p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/40">{label}</p>
					<div className="space-y-2">
						<div className="h-2 w-full rounded-full bg-muted" />
						<div className="h-2 w-4/5 rounded-full bg-muted" />
						<div className="h-2 w-3/5 rounded-full bg-muted" />
					</div>
				</div>
			))}
		</div>
	)
}

function SkeletonCards() {
	return (
		<div className="space-y-3">
			{SECTIONS.map(({ key }) => (
				<div key={key} className="animate-pulse rounded-xl border border-border bg-card px-5 py-4">
					<div className="mb-3 h-3 w-32 rounded-full bg-muted" />
					<div className="space-y-2">
						<div className="h-2 w-full rounded-full bg-muted" />
						<div className="h-2 w-4/5 rounded-full bg-muted" />
						<div className="h-2 w-3/5 rounded-full bg-muted" />
					</div>
				</div>
			))}
		</div>
	)
}

function InsightCards({ sections }: { sections: Record<string, string> }) {
	return (
		<div className="space-y-3">
			{SECTIONS.map(({ key, label }) => (
				<div key={key} className="rounded-xl border-l-4 border-primary bg-card px-5 py-4 shadow-sm">
					<p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
					<p className="text-sm leading-relaxed text-foreground/80">{sections[key] ?? '—'}</p>
				</div>
			))}
		</div>
	)
}

export default function InsightsPage() {
	const user = useAuthStore(state => state.user)
	const { toast } = useToast()

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
		const remaining = getCooldownRemaining()
		if (remaining > 0) {
			startCooldownTimer(remaining)
		}
	}, [startCooldownTimer])

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

		const token = await user.getIdToken()
		const requestBody: AiInsightsRequest = { budgetHistory: history, userContext }

		try {
			const response = await fetch('/api/ai-insights', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
	const sections = state === 'success' ? parseSections(insights) : {}

	return (
		<main className="flex-1">
			<div className="mx-auto max-w-2xl space-y-6 p-6 md:p-10">
				<div>
					<h1 className="font-serif text-2xl font-semibold tracking-tight">AI Insights</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Analyses your last 6 months of budget data and gives actionable savings advice.
					</p>
				</div>

				<div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
					<div className="space-y-2">
						<Label
							htmlFor="ai-context"
							className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
						>
							Additional context (optional)
						</Label>
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
					<div className="flex justify-end">
						<Button onClick={handleGenerate} disabled={isLoading || cooldown > 0} className="w-40">
							{isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
							{isLoading
								? loadingMessage
								: cooldown > 0
									? `Wait ${cooldown}s`
									: state === 'success'
										? 'Regenerate'
										: 'Generate'}
						</Button>
					</div>
				</div>

				{state === 'idle' && <GhostCards />}
				{isLoading && <SkeletonCards />}
				{state === 'success' && <InsightCards sections={sections} />}
			</div>
		</main>
	)
}
