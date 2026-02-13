// Core types for the budgeting app
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  budgetItemId: string;
  amount: number;
  description: string;
  date: string;
  type: TransactionType;
  createdAt: number;
}

export interface BudgetItem {
  id: string;
  categoryId: string;
  name: string;
  plannedAmount: number;
  spentAmount: number;
  transactions: Transaction[];
  order: number;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  budgetItems: BudgetItem[];
  order: number;
}

export interface Budget {
  id: string;
  userId: string;
  month: string; // Format: YYYY-MM
  categories: Category[];
  totalIncome: number;
  totalExpenses: number;
  createdAt: number;
  updatedAt: number;
}

export interface UserSettings {
  userId: string;
  primaryColor: string;
  secondaryColor: string;
  currency: string;
  updatedAt: number;
}

// Theme color options
export type ThemeColor = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal';

export interface ThemeColorOption {
  name: string;
  value: ThemeColor;
  primary: string;
  secondary: string;
}
