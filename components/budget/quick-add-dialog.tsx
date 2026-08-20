'use client'

import { useMemo, useState } from 'react'
import { Plus, X, Zap } from 'lucide-react'
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
import { TRANSACTION_TYPES } from '@/lib/constants/transactions'
import { useBudgetStore } from '@/lib/stores/budget-store'
import type { BudgetItem, Category, QuickAddEntry } from '@/lib/types'
import { cn } from '@/lib/utils'
import { getTodayLocalDate } from '@/lib/utils/dates'

interface StagedEntry {
	description: string
	amount: number
}

interface Draft {
	description: string
	amount: string
}

interface Row {
	item: BudgetItem
	category: Category
}

const EMPTY_DRAFT: Draft = { description: '', amount: '' }

const canStage = (draft: Draft): boolean => {
	const parsed = parseFloat(draft.amount)
	return !Number.isNaN(parsed) && parsed > 0 && draft.description.trim().length > 0
}

export const QuickAddDialog = () => {
	const currentBudget = useBudgetStore(state => state.currentBudget)
	const addTransactions = useBudgetStore(state => state.addTransactions)

	const [open, setOpen] = useState(false)
	const [query, setQuery] = useState('')
	const [drafts, setDrafts] = useState<Record<string, Draft>>({})
	const [staged, setStaged] = useState<Record<string, StagedEntry[]>>({})
	const [saving, setSaving] = useState(false)

	const rows = useMemo<Row[]>(() => {
		const categories = currentBudget?.categories ?? []
		return categories.flatMap(category => category.budgetItems.map(item => ({ item, category })))
	}, [currentBudget])

	const visibleRows = useMemo(() => {
		const term = query.trim().toLowerCase()
		if (!term) {
			return rows
		}
		// Rows with staged entries stay visible so pending work is never hidden by a search.
		return rows.filter(
			row =>
				`${row.item.name} ${row.category.name}`.toLowerCase().includes(term) || (staged[row.item.id]?.length ?? 0) > 0
		)
	}, [rows, query, staged])

	const stagedEntries = useMemo<QuickAddEntry[]>(() => {
		const today = getTodayLocalDate()
		return rows.flatMap(row =>
			(staged[row.item.id] ?? []).map(entry => ({
				categoryId: row.category.id,
				itemId: row.item.id,
				transaction: {
					budgetItemId: row.item.id,
					amount: entry.amount,
					description: entry.description,
					date: today,
					type: row.category.type
				}
			}))
		)
	}, [rows, staged])

	const stagedTotal = stagedEntries.reduce((sum, entry) => sum + entry.transaction.amount, 0)

	const resetAll = () => {
		setQuery('')
		setDrafts({})
		setStaged({})
	}

	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) {
			resetAll()
		}
		setOpen(nextOpen)
	}

	const getDraft = (itemId: string): Draft => drafts[itemId] ?? EMPTY_DRAFT

	const setDraft = (itemId: string, patch: Partial<Draft>) => {
		setDrafts(previous => ({ ...previous, [itemId]: { ...(previous[itemId] ?? EMPTY_DRAFT), ...patch } }))
	}

	const stageEntry = (itemId: string) => {
		const draft = getDraft(itemId)
		if (!canStage(draft)) {
			return
		}
		const entry: StagedEntry = { description: draft.description.trim(), amount: parseFloat(draft.amount) }
		setStaged(previous => ({ ...previous, [itemId]: [...(previous[itemId] ?? []), entry] }))
		setDrafts(previous => ({ ...previous, [itemId]: EMPTY_DRAFT }))
	}

	const unstageEntry = (itemId: string, index: number) => {
		setStaged(previous => {
			const remaining = (previous[itemId] ?? []).filter((_, entryIndex) => entryIndex !== index)
			const next = { ...previous }
			if (remaining.length === 0) {
				delete next[itemId]
			} else {
				next[itemId] = remaining
			}
			return next
		})
	}

	const handleSave = async () => {
		if (stagedEntries.length === 0) {
			return
		}
		setSaving(true)
		const added = await addTransactions(stagedEntries)
		setSaving(false)
		if (added > 0) {
			setOpen(false)
		}
	}

	const stagedTotalFor = (itemId: string) => (staged[itemId] ?? []).reduce((sum, entry) => sum + entry.amount, 0)

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button size="sm" className="h-9 shrink-0">
					<Zap className="mr-2 h-4 w-4" />
					Quick add
				</Button>
			</DialogTrigger>
			<DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0">
				<DialogHeader className="px-5 pt-5 text-left">
					<DialogTitle className="font-serif text-lg font-medium">Quick add</DialogTitle>
					<DialogDescription>Log one or more transactions against any budget item</DialogDescription>
				</DialogHeader>

				<div className="px-5 pb-3 pt-3">
					<Input
						value={query}
						onChange={event => setQuery(event.target.value)}
						placeholder="Search items"
						aria-label="Search budget items"
						autoComplete="off"
					/>
				</div>

				<div className="max-h-[46vh] overflow-y-auto px-3 pb-3">
					{rows.length === 0 ? (
						<p className="px-2 py-8 text-center text-sm text-muted-foreground">
							No budget items yet. Add a category and an item first.
						</p>
					) : visibleRows.length === 0 ? (
						<p className="px-2 py-8 text-center text-sm text-muted-foreground">
							No item matches &ldquo;{query.trim()}&rdquo;.
						</p>
					) : (
						visibleRows.map((row, index) => {
							const previous = visibleRows[index - 1]
							const showGroup = !previous || previous.category.id !== row.category.id
							const draft = getDraft(row.item.id)
							const entries = staged[row.item.id] ?? []
							const isIncome = row.category.type === TRANSACTION_TYPES.INCOME
							const projectedSpent = row.item.spentAmount + stagedTotalFor(row.item.id)
							const remaining = row.item.plannedAmount - projectedSpent
							const isOverBudget = !isIncome && remaining < 0

							return (
								<div key={row.item.id}>
									{showGroup && (
										<p className="px-2 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
											{row.category.name}
										</p>
									)}
									<div
										className={cn(
											'rounded-lg p-2.5',
											entries.length > 0 && 'bg-primary/5 ring-1 ring-inset ring-primary/25'
										)}
									>
										<div className="flex items-baseline gap-2">
											<span className="min-w-0 flex-1 truncate text-sm font-semibold">{row.item.name}</span>
											<span
												className={cn(
													'shrink-0 text-xs tabular-nums',
													isOverBudget ? 'text-over' : 'text-muted-foreground'
												)}
											>
												{isIncome
													? `$${projectedSpent.toFixed(2)} received`
													: isOverBudget
														? `$${Math.abs(remaining).toFixed(2)} over`
														: `$${remaining.toFixed(2)} left`}
											</span>
										</div>

										<div className="mt-2 flex flex-wrap gap-1.5">
											<Input
												value={draft.description}
												onChange={event => setDraft(row.item.id, { description: event.target.value })}
												placeholder="What was it?"
												aria-label={`Description for ${row.item.name}`}
												autoComplete="off"
												className="h-9 min-w-0 flex-1 basis-full text-sm sm:basis-0"
											/>
											<Input
												value={draft.amount}
												onChange={event => setDraft(row.item.id, { amount: event.target.value })}
												placeholder="0.00"
												inputMode="decimal"
												aria-label={`Amount for ${row.item.name}`}
												autoComplete="off"
												className="h-9 w-24 flex-1 text-right text-sm tabular-nums sm:flex-none"
											/>
											<Button
												type="button"
												size="icon"
												onClick={() => stageEntry(row.item.id)}
												disabled={!canStage(draft)}
												aria-label={`Add entry for ${row.item.name}`}
												className="h-9 w-9 shrink-0"
											>
												<Plus className="h-4 w-4" />
											</Button>
										</div>

										{entries.length > 0 && (
											<div className="mt-2 space-y-1">
												{entries.map((entry, entryIndex) => (
													<div
														key={`${entry.description}-${entryIndex}`}
														className="flex items-center gap-2 rounded-md border border-primary/30 bg-card px-2.5 py-1.5 text-xs"
													>
														<span className="min-w-0 flex-1 truncate">{entry.description}</span>
														<span className="shrink-0 font-semibold tabular-nums">${entry.amount.toFixed(2)}</span>
														<button
															type="button"
															onClick={() => unstageEntry(row.item.id, entryIndex)}
															aria-label={`Remove ${entry.description}`}
															className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-over focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
														>
															<X className="h-3.5 w-3.5" />
														</button>
													</div>
												))}
											</div>
										)}
									</div>
								</div>
							)
						})
					)}
				</div>

				<div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/40 px-5 py-3">
					<span className={cn('text-sm tabular-nums', stagedEntries.length === 0 && 'text-muted-foreground')}>
						{stagedEntries.length === 0 ? (
							'Nothing added yet'
						) : (
							<>
								<strong className="font-semibold">{stagedEntries.length}</strong>
								{stagedEntries.length === 1 ? ' transaction' : ' transactions'} &middot;{' '}
								<strong className="font-semibold">${stagedTotal.toFixed(2)}</strong>
							</>
						)}
					</span>
					<div className="flex gap-2">
						<Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>
							Cancel
						</Button>
						<Button type="button" onClick={handleSave} disabled={stagedEntries.length === 0 || saving}>
							{saving ? 'Saving…' : stagedEntries.length > 0 ? `Save ${stagedEntries.length}` : 'Save'}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
