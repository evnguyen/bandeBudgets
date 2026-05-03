import type { ExpenseGroup } from '@/lib/constants/budget-groups'
import type { TransactionType } from '@/lib/constants/transactions'

export interface TemplateItem {
	name: string
	plannedAmount: number
}

export interface TemplateCategory {
	name: string
	type: TransactionType
	expenseGroup: ExpenseGroup | null
	items: TemplateItem[]
}

export interface BudgetTemplate {
	id: string
	name: string
	description: string
	categories: TemplateCategory[]
}

export const BUDGET_TEMPLATES: BudgetTemplate[] = [
	{
		id: 'essential',
		name: 'Essential',
		description: 'A simple starting point covering the basics.',
		categories: [
			{
				name: 'Salary',
				type: 'income',
				expenseGroup: null,
				items: [{ name: 'Paycheck', plannedAmount: 0 }]
			},
			{
				name: 'Housing',
				type: 'expense',
				expenseGroup: 'Housing',
				items: [
					{ name: 'Rent / Mortgage', plannedAmount: 0 },
					{ name: 'Utilities', plannedAmount: 0 },
					{ name: 'Internet', plannedAmount: 0 }
				]
			},
			{
				name: 'Food',
				type: 'expense',
				expenseGroup: 'Food',
				items: [{ name: 'Groceries', plannedAmount: 0 }]
			},
			{
				name: 'Transportation',
				type: 'expense',
				expenseGroup: 'Transportation',
				items: [
					{ name: 'Gas', plannedAmount: 0 },
					{ name: 'Car Insurance', plannedAmount: 0 }
				]
			},
			{
				name: 'Personal',
				type: 'expense',
				expenseGroup: 'Personal',
				items: [
					{ name: 'Phone', plannedAmount: 0 },
					{ name: 'Subscriptions', plannedAmount: 0 }
				]
			}
		]
	},
	{
		id: 'complete',
		name: 'Complete',
		description: 'Covers income, savings, giving, and all major expense areas.',
		categories: [
			{
				name: 'Salary',
				type: 'income',
				expenseGroup: null,
				items: [
					{ name: 'Primary Job', plannedAmount: 0 },
					{ name: 'Side Income', plannedAmount: 0 }
				]
			},
			{
				name: 'Giving',
				type: 'expense',
				expenseGroup: 'Giving',
				items: [
					{ name: 'Charity', plannedAmount: 0 },
					{ name: 'Gifts', plannedAmount: 0 }
				]
			},
			{
				name: 'Savings',
				type: 'expense',
				expenseGroup: 'Savings',
				items: [
					{ name: 'Emergency Fund', plannedAmount: 0 },
					{ name: 'Retirement', plannedAmount: 0 },
					{ name: 'General Savings', plannedAmount: 0 }
				]
			},
			{
				name: 'Housing',
				type: 'expense',
				expenseGroup: 'Housing',
				items: [
					{ name: 'Rent / Mortgage', plannedAmount: 0 },
					{ name: 'Utilities', plannedAmount: 0 },
					{ name: 'Internet', plannedAmount: 0 },
					{ name: 'Home Repairs', plannedAmount: 0 }
				]
			},
			{
				name: 'Transportation',
				type: 'expense',
				expenseGroup: 'Transportation',
				items: [
					{ name: 'Car Payment', plannedAmount: 0 },
					{ name: 'Gas', plannedAmount: 0 },
					{ name: 'Car Insurance', plannedAmount: 0 },
					{ name: 'Maintenance', plannedAmount: 0 }
				]
			},
			{
				name: 'Food',
				type: 'expense',
				expenseGroup: 'Food',
				items: [
					{ name: 'Groceries', plannedAmount: 0 },
					{ name: 'Dining Out', plannedAmount: 0 }
				]
			},
			{
				name: 'Insurance',
				type: 'expense',
				expenseGroup: 'Insurance',
				items: [
					{ name: 'Health Insurance', plannedAmount: 0 },
					{ name: 'Life Insurance', plannedAmount: 0 }
				]
			},
			{
				name: 'Personal',
				type: 'expense',
				expenseGroup: 'Personal',
				items: [
					{ name: 'Phone', plannedAmount: 0 },
					{ name: 'Subscriptions', plannedAmount: 0 },
					{ name: 'Clothing', plannedAmount: 0 },
					{ name: 'Entertainment', plannedAmount: 0 },
					{ name: 'Personal Care', plannedAmount: 0 }
				]
			}
		]
	},
	{
		id: 'saver',
		name: 'Saver',
		description: 'Prioritises savings and investments with lean spending.',
		categories: [
			{
				name: 'Salary',
				type: 'income',
				expenseGroup: null,
				items: [{ name: 'Paycheck', plannedAmount: 0 }]
			},
			{
				name: 'Savings',
				type: 'expense',
				expenseGroup: 'Savings',
				items: [
					{ name: 'Emergency Fund', plannedAmount: 0 },
					{ name: 'Retirement', plannedAmount: 0 },
					{ name: 'Investments', plannedAmount: 0 }
				]
			},
			{
				name: 'Housing',
				type: 'expense',
				expenseGroup: 'Housing',
				items: [
					{ name: 'Rent / Mortgage', plannedAmount: 0 },
					{ name: 'Utilities', plannedAmount: 0 },
					{ name: 'Internet', plannedAmount: 0 }
				]
			},
			{
				name: 'Food',
				type: 'expense',
				expenseGroup: 'Food',
				items: [{ name: 'Groceries', plannedAmount: 0 }]
			},
			{
				name: 'Transportation',
				type: 'expense',
				expenseGroup: 'Transportation',
				items: [{ name: 'Gas / Transit', plannedAmount: 0 }]
			},
			{
				name: 'Personal',
				type: 'expense',
				expenseGroup: 'Personal',
				items: [
					{ name: 'Phone', plannedAmount: 0 },
					{ name: 'Essentials Only', plannedAmount: 0 }
				]
			}
		]
	}
]
