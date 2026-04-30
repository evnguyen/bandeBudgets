import type { ReactNode } from 'react'
import type { BudgetItem, Category, ExpenseCategorySummary, TransactionType } from '@/lib/types'

export interface BudgetChartProps {
	categories: Category[]
}

export interface ChartDatum extends ExpenseCategorySummary {
	value: number
	chartKey: string
	fill: string
}

export interface CategorySectionProps {
	category: Category
}

export interface BudgetItemCardProps {
	categoryId: string
	item: BudgetItem
	type: TransactionType
}

export interface BudgetSummaryTableProps {
	categories: Category[]
}

export interface AddBudgetItemDialogProps {
	categoryId: string
}

export interface AddCategoryDialogProps {
	type: TransactionType
	buttonLabel?: string
}

export interface AddTransactionDialogProps {
	categoryId: string
	budgetItemId: string
	transactionType: TransactionType
}

export interface SummaryCardProps {
	label: string
	amount: number
	icon: ReactNode
	iconBg: string
	amountClass: string
	fullWidthOnMobile?: boolean
}
