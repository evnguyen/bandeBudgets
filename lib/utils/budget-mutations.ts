import { TRANSACTION_TYPES } from '@/lib/constants/transactions'
import { Budget, BudgetItem, Category } from '@/lib/types'

export const calculateTotals = (categories: Category[]) => {
	let totalIncome = 0
	let totalExpenses = 0
	for (const category of categories) {
		const planned = category.budgetItems.reduce((sum, item) => sum + (Number(item.plannedAmount) || 0), 0)
		if (category.type === TRANSACTION_TYPES.INCOME) {
			totalIncome += planned
		} else {
			totalExpenses += planned
		}
	}
	return { totalIncome, totalExpenses }
}

export const recalculateSpent = (item: BudgetItem): BudgetItem => {
	return {
		...item,
		spentAmount: item.transactions.reduce((sum, transaction) => sum + transaction.amount, 0)
	}
}

export const applyCategories = (budget: Budget, categories: Category[]): Budget => {
	return {
		...budget,
		categories,
		...calculateTotals(categories),
		updatedAt: Date.now()
	}
}

export const mapCategory = (budget: Budget, categoryId: string, updater: (category: Category) => Category): Budget => {
	return applyCategories(
		budget,
		budget.categories.map(category => (category.id === categoryId ? updater(category) : category))
	)
}

export const mapItem = (
	budget: Budget,
	categoryId: string,
	itemId: string,
	updater: (item: BudgetItem) => BudgetItem
): Budget => {
	return mapCategory(budget, categoryId, category => ({
		...category,
		budgetItems: category.budgetItems.map(item => (item.id === itemId ? updater(item) : item))
	}))
}
