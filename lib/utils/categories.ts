import { DEFAULT_EXPENSE_GROUP, EXPENSE_GROUPS, type ExpenseGroup } from '@/lib/constants/budget-groups'
import { TRANSACTION_TYPES } from '@/lib/constants/transactions'
import type { Category } from '@/lib/types'

export const sortByOrder = (categoryA: Category, categoryB: Category): number => {
	return categoryA.order - categoryB.order
}

export const filterByType = (categories: Category[], type: Category['type']): Category[] => {
	return categories
		.filter(category => category.type === type)
		.slice()
		.sort(sortByOrder)
}

export const groupExpensesByExpenseGroup = (categories: Category[]): Map<ExpenseGroup, Category[]> => {
	const grouped = new Map<ExpenseGroup, Category[]>()
	for (const group of EXPENSE_GROUPS) {
		grouped.set(group, [])
	}
	for (const category of categories) {
		if (category.type !== TRANSACTION_TYPES.EXPENSE) {
			continue
		}
		const group = category.expenseGroup ?? DEFAULT_EXPENSE_GROUP
		grouped.get(group)?.push(category)
	}
	return grouped
}
