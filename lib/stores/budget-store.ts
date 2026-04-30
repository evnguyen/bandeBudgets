import { doc, getDoc, setDoc } from 'firebase/firestore'
import { create } from 'zustand'
import { DEFAULT_EXPENSE_GROUP } from '@/lib/constants/budget-groups'
import { COLLECTIONS, ID_PREFIXES } from '@/lib/constants/firebase'
import { TRANSACTION_TYPES } from '@/lib/constants/transactions'
import { db } from '@/lib/firebase'
import { showNotification } from '@/lib/notifications'
import { Budget, BudgetItem, Category, NewBudgetItem, NewCategory, NewTransaction, Transaction } from '@/lib/types'
import { applyCategories, calculateTotals, mapCategory, mapItem, recalculateSpent } from '@/lib/utils/budget-mutations'
import { applyCategoryDefaults, createNewBudget, getBudgetId } from '@/lib/utils/budget-transform'
import { getMonthString } from '@/lib/utils/dates'
import { genId } from '@/lib/utils/ids'

interface BudgetState {
	currentBudget: Budget | null
	currentDate: Date
	loading: boolean
	loadBudget: (userId: string, month: string) => Promise<void>
	setMonth: (userId: string, date: Date) => Promise<void>
	addCategory: (category: NewCategory) => Promise<void>
	updateCategory: (categoryId: string, updates: Partial<Category>) => Promise<void>
	deleteCategory: (categoryId: string) => Promise<void>
	addBudgetItem: (categoryId: string, item: NewBudgetItem) => Promise<void>
	updateBudgetItem: (categoryId: string, itemId: string, updates: Partial<BudgetItem>) => Promise<void>
	deleteBudgetItem: (categoryId: string, itemId: string) => Promise<void>
	addTransaction: (categoryId: string, itemId: string, transaction: NewTransaction) => Promise<boolean>
	updateTransaction: (
		categoryId: string,
		itemId: string,
		transactionId: string,
		updates: Partial<Transaction>
	) => Promise<void>
	deleteTransaction: (categoryId: string, itemId: string, transactionId: string) => Promise<void>
	saveBudgetToFirebase: () => Promise<void>
}

export const useBudgetStore = create<BudgetState>((set, get) => {
	const saveBudget = async (budget: Budget) => {
		set({ currentBudget: budget })
		await get().saveBudgetToFirebase()
	}

	return {
		currentBudget: null,
		currentDate: new Date(),
		loading: false,

		loadBudget: async (userId, month) => {
			set({ loading: true })
			const budgetId = getBudgetId(userId, month)
			try {
				const ref = doc(db, COLLECTIONS.BUDGETS, budgetId)
				const snapshot = await getDoc(ref)
				if (snapshot.exists()) {
					const raw = snapshot.data() as Budget
					const categories = (raw.categories ?? []).map(applyCategoryDefaults)
					const { totalIncome, totalExpenses } = calculateTotals(categories)
					set({
						currentBudget: {
							...raw,
							categories,
							totalIncome,
							totalExpenses,
							createdAt: raw.createdAt ?? Date.now(),
							updatedAt: raw.updatedAt ?? Date.now()
						},
						loading: false
					})
					return
				}
			} catch (error) {
				console.error('Error loading budget:', error)
			}

			const newBudget = createNewBudget(userId, month)
			set({ currentBudget: newBudget, loading: false })
			try {
				await setDoc(doc(db, COLLECTIONS.BUDGETS, budgetId), newBudget)
			} catch (error) {
				console.error('Error creating budget:', error)
			}
		},

		setMonth: async (userId, date) => {
			set({ currentDate: date })
			await get().loadBudget(userId, getMonthString(date))
		},

		addCategory: async category => {
			const budget = get().currentBudget
			if (!budget) {
				return
			}
			const type = category.type
			const newCategory: Category = {
				id: genId(ID_PREFIXES.CATEGORY),
				name: category.name,
				type,
				expenseGroup: type === TRANSACTION_TYPES.EXPENSE ? (category.expenseGroup ?? DEFAULT_EXPENSE_GROUP) : null,
				budgetItems: [],
				order: category.order
			}
			await saveBudget(applyCategories(budget, [...budget.categories, newCategory]))
		},

		updateCategory: async (categoryId, updates) => {
			const budget = get().currentBudget
			if (!budget) {
				return
			}
			const updated = mapCategory(budget, categoryId, category => ({
				...category,
				...updates,
				type: category.type,
				expenseGroup:
					category.type === TRANSACTION_TYPES.EXPENSE
						? (updates.expenseGroup ?? category.expenseGroup ?? DEFAULT_EXPENSE_GROUP)
						: null
			}))
			await saveBudget(updated)
		},

		deleteCategory: async categoryId => {
			const budget = get().currentBudget
			if (!budget) {
				return
			}
			await saveBudget(
				applyCategories(
					budget,
					budget.categories.filter(category => category.id !== categoryId)
				)
			)
		},

		addBudgetItem: async (categoryId, item) => {
			const budget = get().currentBudget
			if (!budget) {
				return
			}
			const exists = budget.categories.some(category => category.id === categoryId)
			if (!exists) {
				showNotification('Category not found. Please refresh and try again.', 'error')
				return
			}
			const newItem: BudgetItem = {
				...item,
				id: genId(ID_PREFIXES.ITEM),
				transactions: [],
				spentAmount: 0
			}
			await saveBudget(
				mapCategory(budget, categoryId, category => ({
					...category,
					budgetItems: [...category.budgetItems, newItem]
				}))
			)
		},

		updateBudgetItem: async (categoryId, itemId, updates) => {
			const budget = get().currentBudget
			if (!budget) {
				return
			}
			await saveBudget(mapItem(budget, categoryId, itemId, item => ({ ...item, ...updates })))
		},

		deleteBudgetItem: async (categoryId, itemId) => {
			const budget = get().currentBudget
			if (!budget) {
				return
			}
			await saveBudget(
				mapCategory(budget, categoryId, category => ({
					...category,
					budgetItems: category.budgetItems.filter(item => item.id !== itemId)
				}))
			)
		},

		addTransaction: async (categoryId, itemId, transaction) => {
			const budget = get().currentBudget
			if (!budget) {
				return false
			}

			const category = budget.categories.find(existingCategory => existingCategory.id === categoryId)
			if (!category) {
				showNotification('Category not found. Please refresh and try again.', 'error')
				return false
			}
			const item = category.budgetItems.find(budgetItem => budgetItem.id === itemId)
			if (!item) {
				showNotification('Budget item not found. Please refresh and try again.', 'error')
				return false
			}
			if (transaction.type !== category.type) {
				showNotification('Transaction type does not match category type.', 'error')
				return false
			}

			const newTransaction: Transaction = {
				...transaction,
				id: genId(ID_PREFIXES.TRANSACTION),
				createdAt: Date.now()
			}

			await saveBudget(
				mapItem(budget, categoryId, itemId, budgetItem =>
					recalculateSpent({
						...budgetItem,
						transactions: [...budgetItem.transactions, newTransaction]
					})
				)
			)
			return true
		},

		updateTransaction: async (categoryId, itemId, transactionId, updates) => {
			const budget = get().currentBudget
			if (!budget) {
				return
			}
			let found = false
			const updated = mapItem(budget, categoryId, itemId, item => {
				found = true
				return recalculateSpent({
					...item,
					transactions: item.transactions.map(transaction =>
						transaction.id === transactionId ? { ...transaction, ...updates } : transaction
					)
				})
			})
			if (!found) {
				showNotification('Budget item not found. Please refresh and try again.', 'error')
				return
			}
			await saveBudget(updated)
		},

		deleteTransaction: async (categoryId, itemId, transactionId) => {
			const budget = get().currentBudget
			if (!budget) {
				return
			}
			let found = false
			const updated = mapItem(budget, categoryId, itemId, item => {
				found = true
				return recalculateSpent({
					...item,
					transactions: item.transactions.filter(transaction => transaction.id !== transactionId)
				})
			})
			if (!found) {
				showNotification('Budget item not found. Please refresh and try again.', 'error')
				return
			}
			await saveBudget(updated)
		},

		saveBudgetToFirebase: async () => {
			const budget = get().currentBudget
			if (!budget) {
				return
			}
			try {
				const ref = doc(db, COLLECTIONS.BUDGETS, budget.id)
				await setDoc(ref, budget, { merge: true })
			} catch (error) {
				console.error('Error saving budget:', error)
				showNotification('Failed to save changes. Your data is saved locally.', 'error')
			}
		}
	}
})
