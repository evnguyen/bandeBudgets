import { TRANSACTION_TYPES } from '@/lib/constants/transactions'
import { Category, ExpenseCategorySummary } from '@/lib/types'

export const getExpenseCategorySummaries = (categories: Category[]): ExpenseCategorySummary[] => {
	return categories
		.filter(category => category.type === TRANSACTION_TYPES.EXPENSE)
		.map(category => {
			const planned = category.budgetItems.reduce((sum, item) => sum + item.plannedAmount, 0)
			const spent = category.budgetItems.reduce((sum, item) => sum + item.spentAmount, 0)
			return {
				name: category.name,
				planned,
				spent,
				remaining: planned - spent,
				percentage: planned > 0 ? Math.round((spent / planned) * 100) : 0
			}
		})
}
