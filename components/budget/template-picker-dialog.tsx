'use client'

import { useState } from 'react'
import { Check, LayoutTemplate } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog'
import { BUDGET_TEMPLATES } from '@/lib/constants/budget-templates'
import { useBudgetStore } from '@/lib/stores/budget-store'
import { Category } from '@/lib/types'
import { cn } from '@/lib/utils'
import { cloneCategories } from '@/lib/utils/budget-transform'

function templateToCategories(templateId: string): Category[] | null {
	const template = BUDGET_TEMPLATES.find(tmpl => tmpl.id === templateId)
	if (!template) {
		return null
	}
	return cloneCategories(
		template.categories.map((cat, index) => ({
			id: '',
			name: cat.name,
			type: cat.type,
			expenseGroup: cat.expenseGroup,
			order: index,
			budgetItems: cat.items.map((item, itemIndex) => ({
				id: '',
				categoryId: '',
				name: item.name,
				plannedAmount: item.plannedAmount,
				spentAmount: 0,
				transactions: [],
				order: itemIndex
			}))
		}))
	)
}

export function TemplatePickerDialog() {
	const setCategories = useBudgetStore(state => state.setCategories)
	const [open, setOpen] = useState(false)
	const [selected, setSelected] = useState<string | null>(null)
	const [applying, setApplying] = useState(false)

	const handleApply = async () => {
		if (!selected) {
			return
		}
		const categories = templateToCategories(selected)
		if (!categories) {
			return
		}
		setApplying(true)
		await setCategories(categories)
		setApplying(false)
		setOpen(false)
		setSelected(null)
	}

	const handleOpenChange = (next: boolean) => {
		setOpen(next)
		if (!next) {
			setSelected(null)
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button>
					<LayoutTemplate className="h-4 w-4" />
					Use a template
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>Choose a template</DialogTitle>
					<DialogDescription>
						Select a starting point. You can add, remove, or edit any category afterwards.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-3 py-2">
					{BUDGET_TEMPLATES.map(template => {
						const totalItems = template.categories.reduce((sum, cat) => sum + cat.items.length, 0)
						const isSelected = selected === template.id
						return (
							<button
								key={template.id}
								type="button"
								onClick={() => setSelected(template.id)}
								className={cn(
									'w-full rounded-xl border px-4 py-4 text-left transition-colors',
									isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-muted/50'
								)}
							>
								<div className="flex items-start justify-between gap-3">
									<div>
										<p className="font-medium">{template.name}</p>
										<p className="mt-0.5 text-sm text-muted-foreground">{template.description}</p>
										<p className="mt-2 text-xs text-muted-foreground">
											{template.categories.length} categories · {totalItems} items
										</p>
									</div>
									{isSelected && (
										<div className="shrink-0 rounded-full bg-primary p-1">
											<Check className="h-3 w-3 text-primary-foreground" />
										</div>
									)}
								</div>
							</button>
						)
					})}
				</div>

				<div className="flex justify-end gap-2 pt-2">
					<Button variant="outline" onClick={() => handleOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={handleApply} disabled={!selected || applying}>
						{applying ? 'Applying…' : 'Apply template'}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
