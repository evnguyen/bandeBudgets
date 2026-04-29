import type { TransactionType } from '@/lib/constants/transactions';
import type { ExpenseGroup } from '@/lib/constants/budget-groups';
import type { ThemeColor } from '@/lib/theme-colors';

export type { TransactionType, ExpenseGroup, ThemeColor };

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
  expenseGroup: ExpenseGroup | null;
  budgetItems: BudgetItem[];
  order: number;
}

export interface Budget {
  id: string;
  userId: string;
  month: string;
  categories: Category[];
  totalIncome: number;
  totalExpenses: number;
  createdAt: number;
  updatedAt: number;
}

export interface UserSettings {
  userId: string;
  primaryColor: ThemeColor;
  secondaryColor: ThemeColor;
  updatedAt: number;
}

export interface ThemeColorOption {
  name: string;
  value: ThemeColor;
  primary: string;
  secondary: string;
}
