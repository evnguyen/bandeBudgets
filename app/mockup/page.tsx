'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Plus, Receipt, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const MOCK_CATEGORIES = [
	{
		id: '1',
		name: 'Housing',
		items: [
			{
				id: 'a',
				name: 'Rent',
				planned: 1500,
				spent: 1500,
				transactions: [{ id: 't1', description: 'March rent', amount: 1500 }]
			},
			{
				id: 'b',
				name: 'Insurance',
				planned: 120,
				spent: 80,
				transactions: [
					{ id: 't2', description: 'Contents insurance', amount: 45 },
					{ id: 't3', description: 'Building insurance', amount: 35 }
				]
			},
			{
				id: 'c',
				name: 'Maintenance',
				planned: 200,
				spent: 340,
				transactions: [
					{ id: 't4', description: 'Plumber callout', amount: 180 },
					{ id: 't5', description: 'Light fittings', amount: 95 },
					{ id: 't6', description: 'Paint & supplies', amount: 65 }
				]
			}
		]
	},
	{
		id: '2',
		name: 'Transport',
		items: [
			{
				id: 'd',
				name: 'Fuel',
				planned: 150,
				spent: 95,
				transactions: [
					{ id: 't7', description: 'Shell — 14 Apr', amount: 55 },
					{ id: 't8', description: 'BP — 28 Apr', amount: 40 }
				]
			},
			{
				id: 'e',
				name: 'Parking',
				planned: 60,
				spent: 60,
				transactions: [
					{ id: 't9', description: 'City centre — weekly', amount: 30 },
					{ id: 't10', description: 'City centre — weekly', amount: 30 }
				]
			}
		]
	}
]

type Item = (typeof MOCK_CATEGORIES)[0]['items'][0]
type Category = (typeof MOCK_CATEGORIES)[0]

const formatAmount = (n: number) => `$${n.toFixed(0)}`

function isOverBudget(item: Item) {
	return item.spent > item.planned
}

function spendPercent(item: Item) {
	return item.planned > 0 ? Math.min((item.spent / item.planned) * 100, 100) : 0
}

function OptionATransactions({ item }: { item: Item }) {
	if (item.transactions.length === 0) {
		return null
	}
	return (
		<div className="ml-4 space-y-1 border-l-2 border-border pb-2 pl-4 pt-1">
			{item.transactions.map(tx => (
				<div key={tx.id} className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
					<span className="truncate">{tx.description}</span>
					<span className="shrink-0 tabular-nums">{formatAmount(tx.amount)}</span>
				</div>
			))}
			<button type="button" className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
				<Plus className="h-3 w-3" /> Add transaction
			</button>
		</div>
	)
}

function OptionAItem({ item }: { item: Item }) {
	const [txOpen, setTxOpen] = useState(false)
	const remaining = item.planned - item.spent
	const over = isOverBudget(item)

	return (
		<div>
			<div
				className={cn(
					'flex cursor-pointer items-center gap-4 rounded-lg border border-border bg-background px-4 py-3 transition-colors hover:bg-muted/40',
					txOpen && 'rounded-b-none border-b-0'
				)}
				onClick={() => setTxOpen(prev => !prev)}
				role="button"
				tabIndex={0}
				onKeyDown={e => {
					if (e.key === 'Enter' || e.key === ' ') {
						setTxOpen(prev => !prev)
					}
				}}
			>
				<span className="min-w-0 flex-1 truncate text-sm font-medium">{item.name}</span>

				<div className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
					<Receipt className="h-3 w-3" />
					<span>{item.transactions.length}</span>
				</div>

				<div className="flex shrink-0 items-baseline gap-1 text-sm">
					<span className={cn('font-semibold', over ? 'text-red-500' : 'text-foreground')}>
						{formatAmount(item.spent)}
					</span>
					<span className="text-muted-foreground">/ {formatAmount(item.planned)}</span>
				</div>

				<span
					className={cn(
						'w-20 shrink-0 rounded-full px-2 py-0.5 text-right text-xs font-semibold',
						over ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
					)}
				>
					{over ? `−${formatAmount(Math.abs(remaining))}` : `+${formatAmount(remaining)}`}
				</span>

				<button
					type="button"
					aria-label="Delete"
					className="shrink-0 text-muted-foreground hover:text-foreground"
					onClick={e => e.stopPropagation()}
				>
					<Trash2 className="h-3.5 w-3.5" />
				</button>
			</div>

			{txOpen && (
				<div className="rounded-b-lg border border-t-0 border-border bg-background px-4 pb-1">
					<OptionATransactions item={item} />
				</div>
			)}
		</div>
	)
}

function OptionACategory({ cat }: { cat: Category }) {
	const [open, setOpen] = useState(true)
	const planned = cat.items.reduce((sum, item) => sum + item.planned, 0)
	const spent = cat.items.reduce((sum, item) => sum + item.spent, 0)
	const over = spent > planned

	return (
		<div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
			<button
				type="button"
				onClick={() => setOpen(prev => !prev)}
				className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
			>
				<div>
					<p className="font-semibold">{cat.name}</p>
					<div className="mt-0.5 flex items-baseline gap-1.5">
						<span className={cn('text-xl font-bold', over && 'text-red-500')}>{formatAmount(spent)}</span>
						<span className="text-xs text-muted-foreground">of {formatAmount(planned)}</span>
					</div>
				</div>
				{open ? (
					<ChevronUp className="h-4 w-4 text-muted-foreground" />
				) : (
					<ChevronDown className="h-4 w-4 text-muted-foreground" />
				)}
			</button>

			{open && (
				<div className="space-y-2 border-t border-border p-5">
					{cat.items.map(item => (
						<OptionAItem key={item.id} item={item} />
					))}
					<button
						type="button"
						className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground hover:border-primary hover:text-primary"
					>
						<Plus className="h-3.5 w-3.5" /> Add item
					</button>
				</div>
			)}
		</div>
	)
}

function OptionBItem({ item }: { item: Item }) {
	const over = isOverBudget(item)
	const remaining = item.planned - item.spent

	return (
		<div className="flex flex-col rounded-lg border border-border bg-background">
			<div className="flex items-start justify-between gap-2 p-4">
				<div className="min-w-0 flex-1">
					<div className="flex items-baseline gap-1.5">
						<span className={cn('text-base font-bold', over && 'text-red-500')}>{formatAmount(item.spent)}</span>
						<span className="text-xs text-muted-foreground">/ {formatAmount(item.planned)}</span>
					</div>
					<p className="mt-0.5 truncate text-sm text-muted-foreground">{item.name}</p>
				</div>

				<div className="flex shrink-0 flex-col items-end gap-1">
					<span
						className={cn(
							'rounded-full px-2 py-0.5 text-xs font-bold tabular-nums',
							over ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'
						)}
					>
						{spendPercent(item).toFixed(0)}%
					</span>
					<span
						className={cn(
							'text-xs',
							over ? 'text-red-500' : remaining < item.planned * 0.15 ? 'text-amber-500' : 'text-emerald-500'
						)}
					>
						{over ? `over ${formatAmount(Math.abs(remaining))}` : `left ${formatAmount(remaining)}`}
					</span>
				</div>
			</div>

			{item.transactions.length > 0 && (
				<div className="space-y-1.5 border-t border-border bg-muted/30 px-4 py-3">
					{item.transactions
						.slice(-3)
						.reverse()
						.map(tx => (
							<div key={tx.id} className="flex items-center justify-between gap-2 text-xs">
								<span className="truncate text-foreground/70">{tx.description}</span>
								<span className="shrink-0 font-medium tabular-nums">{formatAmount(tx.amount)}</span>
							</div>
						))}
					{item.transactions.length > 3 && (
						<p className="text-xs text-muted-foreground">+{item.transactions.length - 3} more</p>
					)}
				</div>
			)}

			<div className="border-t border-border px-4 py-2.5">
				<button
					type="button"
					className="flex w-full items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
				>
					<Plus className="h-3 w-3" /> Add transaction
				</button>
			</div>
		</div>
	)
}

function OptionBCategory({ cat }: { cat: Category }) {
	const [open, setOpen] = useState(true)
	const planned = cat.items.reduce((sum, item) => sum + item.planned, 0)
	const spent = cat.items.reduce((sum, item) => sum + item.spent, 0)
	const catPct = planned > 0 ? Math.min((spent / planned) * 100, 100) : 0
	const over = spent > planned

	return (
		<div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
			<div className={cn('h-0.5', over ? 'bg-red-500' : 'bg-primary')} />

			<div className="border-b border-border px-5 py-4">
				<div className="flex items-start justify-between gap-3">
					<div>
						<p className="font-semibold">{cat.name}</p>
						<div className="mt-0.5 flex items-baseline gap-1.5">
							<span className={cn('text-xl font-bold', over && 'text-red-500')}>{formatAmount(spent)}</span>
							<span className="text-xs text-muted-foreground">of {formatAmount(planned)}</span>
						</div>
					</div>
					<button
						type="button"
						onClick={() => setOpen(prev => !prev)}
						className="mt-1 text-muted-foreground hover:text-foreground"
					>
						{open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
					</button>
				</div>

				<div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
					<div
						className={cn('h-full rounded-full transition-all duration-500', over ? 'bg-red-500' : 'bg-primary')}
						style={{ width: `${catPct}%` }}
					/>
				</div>
				<div className="mt-1 flex justify-between text-xs text-muted-foreground">
					<span>{over ? 'Over budget' : `${formatAmount(planned - spent)} remaining`}</span>
					<span>{catPct.toFixed(0)}%</span>
				</div>
			</div>

			{open && (
				<div className="p-5">
					<div className="grid gap-3 md:grid-cols-2">
						{cat.items.map(item => (
							<OptionBItem key={item.id} item={item} />
						))}
					</div>
					<button
						type="button"
						className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground hover:border-primary hover:text-primary"
					>
						<Plus className="h-3.5 w-3.5" /> Add item
					</button>
				</div>
			)}
		</div>
	)
}

function OptionCItem({ item }: { item: Item }) {
	const [txOpen, setTxOpen] = useState(false)
	const remaining = item.planned - item.spent
	const over = isOverBudget(item)

	return (
		<>
			<div
				className="group flex cursor-pointer items-center gap-3 py-2.5 pl-1 hover:bg-muted/30"
				onClick={() => setTxOpen(prev => !prev)}
				role="button"
				tabIndex={0}
				onKeyDown={e => {
					if (e.key === 'Enter' || e.key === ' ') {
						setTxOpen(prev => !prev)
					}
				}}
			>
				<div className={cn('h-1.5 w-1.5 shrink-0 rounded-full', over ? 'bg-red-500' : 'bg-primary')} />

				<span className="min-w-0 flex-1 truncate text-sm">{item.name}</span>

				<div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
					<Receipt className="h-3 w-3" />
					<span>{item.transactions.length}</span>
				</div>

				<span className={cn('w-12 shrink-0 text-right text-sm font-semibold tabular-nums', over && 'text-red-500')}>
					{formatAmount(item.spent)}
				</span>
				<span className="w-16 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
					/ {formatAmount(item.planned)}
				</span>
				<span
					className={cn(
						'w-20 shrink-0 text-right text-xs font-medium tabular-nums',
						over ? 'text-red-500' : 'text-emerald-500'
					)}
				>
					{over ? `−${formatAmount(Math.abs(remaining))}` : `+${formatAmount(remaining)}`}
				</span>

				<button
					type="button"
					aria-label="Delete"
					className="w-3.5 shrink-0 text-transparent transition-colors hover:!text-foreground group-hover:text-muted-foreground"
					onClick={e => e.stopPropagation()}
				>
					<Trash2 className="h-3.5 w-3.5" />
				</button>
			</div>

			{txOpen && item.transactions.length > 0 && (
				<div className="border-b border-border bg-muted/20 py-2 pl-8 pr-1">
					{item.transactions.map(tx => (
						<div key={tx.id} className="flex items-center justify-between gap-3 py-1 text-xs text-muted-foreground">
							<span className="truncate">{tx.description}</span>
							<span className="shrink-0 tabular-nums">{formatAmount(tx.amount)}</span>
						</div>
					))}
					<button
						type="button"
						className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
					>
						<Plus className="h-3 w-3" /> Add transaction
					</button>
				</div>
			)}
		</>
	)
}

function OptionCCategory({ cat }: { cat: Category }) {
	const [open, setOpen] = useState(true)
	const planned = cat.items.reduce((sum, item) => sum + item.planned, 0)
	const spent = cat.items.reduce((sum, item) => sum + item.spent, 0)
	const over = spent > planned

	return (
		<div
			className={cn(
				'overflow-hidden rounded-xl border-l-4 bg-card shadow-sm',
				over ? 'border-red-500' : 'border-primary'
			)}
		>
			<button
				type="button"
				onClick={() => setOpen(prev => !prev)}
				className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
			>
				<div className="flex items-baseline gap-3">
					<p className="font-semibold">{cat.name}</p>
					<span className="text-sm text-muted-foreground">
						<span className={cn('font-bold', over ? 'text-red-500' : 'text-foreground')}>{formatAmount(spent)}</span>
						{' / '}
						{formatAmount(planned)}
					</span>
					<span className={cn('text-sm font-medium', over ? 'text-red-500' : 'text-emerald-500')}>
						{over ? `−${formatAmount(Math.abs(planned - spent))}` : `+${formatAmount(planned - spent)}`}
					</span>
				</div>
				{open ? (
					<ChevronUp className="h-4 w-4 text-muted-foreground" />
				) : (
					<ChevronDown className="h-4 w-4 text-muted-foreground" />
				)}
			</button>

			{open && (
				<div className="border-t border-border px-5 pb-4">
					<div className="flex items-center gap-3 pb-1 pl-4 pt-3">
						<span className="flex-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">Item</span>
						<span className="w-4 shrink-0" />
						<span className="w-12 shrink-0 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
							Spent
						</span>
						<span className="w-16 shrink-0 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
							Budget
						</span>
						<span className="w-20 shrink-0 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
							Left
						</span>
						<span className="w-3.5 shrink-0" />
					</div>

					<div className="divide-y divide-border">
						{cat.items.map(item => (
							<OptionCItem key={item.id} item={item} />
						))}
					</div>

					<button
						type="button"
						className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground hover:border-primary hover:text-primary"
					>
						<Plus className="h-3.5 w-3.5" /> Add item
					</button>
				</div>
			)}
		</div>
	)
}

const OPTIONS = [
	{
		key: 'A',
		label: 'A — Numbers Only',
		description:
			'No bars. Items are compact rows — click a row to expand its transactions inline below it. Transaction count shown as a receipt icon badge.'
	},
	{
		key: 'B',
		label: 'B — One Bar Per Category',
		description:
			'Single thicker bar per category only. Item cards are clean with a % badge. Transactions sit in a quiet list at the bottom of each card, always visible.'
	},
	{
		key: 'C',
		label: 'C — Flat Rows',
		description:
			'No bars, no item cards. Items are table rows with column headers. Click a row to expand its transactions as indented sub-rows. Left border accent instead of top line.'
	}
]

export default function MockupPage() {
	return (
		<main className="flex-1">
			<div className="mx-auto max-w-3xl space-y-16 p-6 md:p-10">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Budget Layout Mockups</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Click any item row to expand its transactions. Pick a direction to ship.
					</p>
				</div>

				{OPTIONS.map(opt => (
					<section key={opt.key} className="space-y-4">
						<div>
							<h2 className="text-lg font-bold">{opt.label}</h2>
							<p className="mt-0.5 text-sm text-muted-foreground">{opt.description}</p>
						</div>

						<div className="space-y-3">
							{MOCK_CATEGORIES.map(cat =>
								opt.key === 'A' ? (
									<OptionACategory key={cat.id} cat={cat} />
								) : opt.key === 'B' ? (
									<OptionBCategory key={cat.id} cat={cat} />
								) : (
									<OptionCCategory key={cat.id} cat={cat} />
								)
							)}
						</div>
					</section>
				))}
			</div>
		</main>
	)
}
