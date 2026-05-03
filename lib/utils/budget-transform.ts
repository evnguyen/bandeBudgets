import { DEFAULT_EXPENSE_GROUP } from '@/lib/constants/budget-groups'
import { ID_PREFIXES } from '@/lib/constants/firebase'
import { TRANSACTION_TYPES, TransactionType } from '@/lib/constants/transactions'
import { Budget, BudgetItem, Category, Transaction } from '@/lib/types'
import { getTodayLocalDate } from '@/lib/utils/dates'
import { genId } from '@/lib/utils/ids'

const applyTransactionDefaults = (
	transaction: Partial<Transaction>,
	itemId: string,
	type: TransactionType
): Transaction => {
	return {
		id: transaction.id ?? genId(ID_PREFIXES.TRANSACTION),
		budgetItemId: transaction.budgetItemId ?? itemId,
		amount: Number(transaction.amount) || 0,
		description: transaction.description ?? '',
		date: transaction.date ?? getTodayLocalDate(),
		type,
		createdAt: transaction.createdAt ?? Date.now()
	}
}

const applyItemDefaults = (
	item: Partial<BudgetItem>,
	categoryId: string,
	type: TransactionType,
	index: number
): BudgetItem => {
	const transactions = (item.transactions ?? []).map(transaction =>
		applyTransactionDefaults(transaction, item.id ?? '', type)
	)
	return {
		id: item.id ?? genId(ID_PREFIXES.ITEM),
		categoryId: item.categoryId ?? categoryId,
		name: item.name ?? 'Untitled Item',
		plannedAmount: Number(item.plannedAmount) || 0,
		spentAmount: transactions.reduce((sum, transaction) => sum + transaction.amount, 0),
		transactions,
		order: item.order ?? index
	}
}

export const applyCategoryDefaults = (category: Partial<Category>, index: number): Category => {
	const type = category.type ?? TRANSACTION_TYPES.EXPENSE
	const id = category.id ?? genId(ID_PREFIXES.CATEGORY)
	return {
		id,
		name: category.name ?? 'Untitled Category',
		type,
		expenseGroup: type === TRANSACTION_TYPES.EXPENSE ? (category.expenseGroup ?? DEFAULT_EXPENSE_GROUP) : null,
		budgetItems: (category.budgetItems ?? []).map((item, itemIndex) => applyItemDefaults(item, id, type, itemIndex)),
		order: category.order ?? index
	}
}

export const createNewBudget = (userId: string, month: string): Budget => {
	return {
		id: `${userId}_${month}`,
		userId,
		month,
		categories: [],
		totalIncome: 0,
		totalExpenses: 0,
		createdAt: Date.now(),
		updatedAt: Date.now()
	}
}

export const getBudgetId = (userId: string, month: string): string => {
	return `${userId}_${month}`
}

export const cloneCategories = (categories: Category[]): Category[] => {
	return categories.map((cat, index) => {
		const categoryId = genId(ID_PREFIXES.CATEGORY)
		return {
			id: categoryId,
			name: cat.name,
			type: cat.type,
			expenseGroup: cat.expenseGroup,
			order: cat.order ?? index,
			budgetItems: cat.budgetItems.map((item, itemIndex) => ({
				id: genId(ID_PREFIXES.ITEM),
				categoryId,
				name: item.name,
				plannedAmount: item.plannedAmount,
				spentAmount: 0,
				transactions: [],
				order: item.order ?? itemIndex
			}))
		}
	})
}
