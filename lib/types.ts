import type { ExpenseGroup } from '@/lib/constants/budget-groups'
import type { TransactionType } from '@/lib/constants/transactions'

export type { TransactionType, ExpenseGroup }

export interface Transaction {
	id: string
	budgetItemId: string
	amount: number
	description: string
	date: string
	type: TransactionType
	createdAt: number
}

export interface BudgetItem {
	id: string
	categoryId: string
	name: string
	plannedAmount: number
	spentAmount: number
	transactions: Transaction[]
	order: number
}

export interface Category {
	id: string
	name: string
	type: TransactionType
	expenseGroup: ExpenseGroup | null
	budgetItems: BudgetItem[]
	order: number
}

export interface Budget {
	id: string
	userId: string
	month: string
	categories: Category[]
	totalIncome: number
	totalExpenses: number
	createdAt: number
	updatedAt: number
}

export interface NewCategory {
	name: string
	type: TransactionType
	expenseGroup?: ExpenseGroup | null
	order: number
}

export interface NewBudgetItem {
	categoryId: string
	name: string
	plannedAmount: number
	order: number
}

export interface NewTransaction {
	budgetItemId: string
	amount: number
	description: string
	date: string
	type: TransactionType
}

export interface QuickAddEntry {
	categoryId: string
	itemId: string
	transaction: NewTransaction
}

export interface BudgetMonthSummary {
	month: string
	totalIncome: number
	totalExpenses: number
	categories: {
		name: string
		type: TransactionType
		planned: number
		spent: number
	}[]
}

export interface AiInsightsRequest {
	budgetHistory: BudgetMonthSummary[]
	userContext: string
}

export type NotificationType = 'error' | 'success'

export type NotificationCallback = (message: string, type: NotificationType) => void

export interface ExpenseCategorySummary {
	name: string
	planned: number
	spent: number
	remaining: number
	percentage: number
}
