export const EXPENSE_GROUPS = [
	'Housing',
	'Transportation',
	'Food',
	'Insurance',
	'Giving',
	'Savings',
	'Personal',
	'Other'
] as const

export type ExpenseGroup = (typeof EXPENSE_GROUPS)[number]

export const DEFAULT_EXPENSE_GROUP: ExpenseGroup = 'Personal'
