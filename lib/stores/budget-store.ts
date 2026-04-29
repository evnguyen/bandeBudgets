import { create } from 'zustand';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Budget, Category, BudgetItem, Transaction } from '@/lib/types';
import { db } from '@/lib/firebase';
import { showNotification } from '@/lib/notifications';
import { TRANSACTION_TYPES, TransactionType } from '@/lib/constants/transactions';
import { DEFAULT_EXPENSE_GROUP } from '@/lib/constants/budget-groups';
import { COLLECTIONS, ID_PREFIXES } from '@/lib/constants/firebase';
import { genId } from '@/lib/ids';
import { getTodayLocalDate, getMonthString } from '@/lib/dates';

const calculateTotals = (categories: Category[]) => {
  let totalIncome = 0;
  let totalExpenses = 0;
  for (const cat of categories) {
    const planned = cat.budgetItems.reduce(
      (sum, item) => sum + (Number(item.plannedAmount) || 0),
      0,
    );
    if (cat.type === TRANSACTION_TYPES.INCOME) {
      totalIncome += planned;
    } else {
      totalExpenses += planned;
    }
  }
  return { totalIncome, totalExpenses };
};

const recalcSpent = (item: BudgetItem): BudgetItem => ({
  ...item,
  spentAmount: item.transactions.reduce((sum, t) => sum + t.amount, 0),
});

const normalizeType = (value: TransactionType | undefined): TransactionType =>
  value === TRANSACTION_TYPES.INCOME
    ? TRANSACTION_TYPES.INCOME
    : TRANSACTION_TYPES.EXPENSE;

const normalizeTransaction = (
  txn: Partial<Transaction>,
  itemId: string,
  type: TransactionType,
): Transaction => ({
  id: txn.id ?? genId(ID_PREFIXES.TRANSACTION),
  budgetItemId: txn.budgetItemId ?? itemId,
  amount: Number(txn.amount) || 0,
  description: txn.description ?? '',
  date: txn.date ?? getTodayLocalDate(),
  type,
  createdAt: txn.createdAt ?? Date.now(),
});

const normalizeItem = (
  item: Partial<BudgetItem>,
  catId: string,
  type: TransactionType,
  index: number,
): BudgetItem => {
  const transactions = (item.transactions ?? []).map((t) =>
    normalizeTransaction(t, item.id ?? '', type),
  );
  return {
    id: item.id ?? genId(ID_PREFIXES.ITEM),
    categoryId: item.categoryId ?? catId,
    name: item.name ?? 'Untitled Item',
    plannedAmount: Number(item.plannedAmount) || 0,
    spentAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
    transactions,
    order: item.order ?? index,
  };
};

const normalizeCategory = (cat: Partial<Category>, index: number): Category => {
  const type = normalizeType(cat.type);
  const id = cat.id ?? genId(ID_PREFIXES.CATEGORY);
  return {
    id,
    name: cat.name ?? 'Untitled Category',
    type,
    expenseGroup:
      type === TRANSACTION_TYPES.EXPENSE
        ? cat.expenseGroup ?? DEFAULT_EXPENSE_GROUP
        : null,
    budgetItems: (cat.budgetItems ?? []).map((item, i) =>
      normalizeItem(item, id, type, i),
    ),
    order: cat.order ?? index,
  };
};

const normalizeBudget = (budget: Budget): Budget => {
  const categories = (budget.categories ?? []).map(normalizeCategory);
  const totals = calculateTotals(categories);
  return {
    ...budget,
    categories,
    totalIncome: totals.totalIncome,
    totalExpenses: totals.totalExpenses,
    createdAt: budget.createdAt ?? Date.now(),
    updatedAt: budget.updatedAt ?? Date.now(),
  };
};

const withTotals = (budget: Budget, categories: Category[]): Budget => ({
  ...budget,
  categories,
  ...calculateTotals(categories),
  updatedAt: Date.now(),
});

const mapCategory = (
  budget: Budget,
  categoryId: string,
  fn: (cat: Category) => Category,
): Budget =>
  withTotals(
    budget,
    budget.categories.map((cat) => (cat.id === categoryId ? fn(cat) : cat)),
  );

const mapItem = (
  budget: Budget,
  categoryId: string,
  itemId: string,
  fn: (item: BudgetItem) => BudgetItem,
): Budget =>
  mapCategory(budget, categoryId, (cat) => ({
    ...cat,
    budgetItems: cat.budgetItems.map((item) => (item.id === itemId ? fn(item) : item)),
  }));

interface BudgetState {
  currentBudget: Budget | null;
  loading: boolean;
  loadBudget: (userId: string, month: string) => Promise<void>;
  setMonth: (userId: string, date: Date) => Promise<void>;
  addCategory: (
    category: Omit<Category, 'id' | 'budgetItems' | 'expenseGroup'> & {
      expenseGroup?: Category['expenseGroup'];
    },
  ) => Promise<void>;
  updateCategory: (categoryId: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  addBudgetItem: (
    categoryId: string,
    item: Omit<BudgetItem, 'id' | 'transactions' | 'spentAmount'>,
  ) => Promise<void>;
  updateBudgetItem: (
    categoryId: string,
    itemId: string,
    updates: Partial<BudgetItem>,
  ) => Promise<void>;
  deleteBudgetItem: (categoryId: string, itemId: string) => Promise<void>;
  addTransaction: (
    categoryId: string,
    itemId: string,
    transaction: Omit<Transaction, 'id' | 'createdAt'>,
  ) => Promise<boolean>;
  updateTransaction: (
    categoryId: string,
    itemId: string,
    transactionId: string,
    updates: Partial<Transaction>,
  ) => Promise<void>;
  deleteTransaction: (
    categoryId: string,
    itemId: string,
    transactionId: string,
  ) => Promise<void>;
  saveBudgetToFirebase: () => Promise<void>;
}

const createNewBudget = (userId: string, month: string): Budget => ({
  id: `${userId}_${month}`,
  userId,
  month,
  categories: [],
  totalIncome: 0,
  totalExpenses: 0,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export const useBudgetStore = create<BudgetState>((set, get) => {
  const persistAndUpdate = async (budget: Budget) => {
    set({ currentBudget: budget });
    await get().saveBudgetToFirebase();
  };

  return {
    currentBudget: null,
    loading: false,

    loadBudget: async (userId, month) => {
      set({ loading: true });
      const budgetId = `${userId}_${month}`;
      try {
        const ref = doc(db, COLLECTIONS.BUDGETS, budgetId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          set({
            currentBudget: normalizeBudget(snap.data() as Budget),
            loading: false,
          });
          return;
        }
      } catch (error) {
        console.error('Error loading budget:', error);
      }

      const newBudget = createNewBudget(userId, month);
      set({ currentBudget: newBudget, loading: false });
      try {
        await setDoc(doc(db, COLLECTIONS.BUDGETS, budgetId), newBudget);
      } catch (error) {
        console.error('Error creating budget:', error);
      }
    },

    setMonth: async (userId, date) => {
      await get().loadBudget(userId, getMonthString(date));
    },

    addCategory: async (category) => {
      const budget = get().currentBudget;
      if (!budget) return;
      const type = normalizeType(category.type);
      const newCategory: Category = {
        id: genId(ID_PREFIXES.CATEGORY),
        name: category.name,
        type,
        expenseGroup:
          type === TRANSACTION_TYPES.EXPENSE
            ? category.expenseGroup ?? DEFAULT_EXPENSE_GROUP
            : null,
        budgetItems: [],
        order: category.order,
      };
      await persistAndUpdate(
        withTotals(budget, [...budget.categories, newCategory]),
      );
    },

    updateCategory: async (categoryId, updates) => {
      const budget = get().currentBudget;
      if (!budget) return;
      const updated = mapCategory(budget, categoryId, (cat) => ({
        ...cat,
        ...updates,
        type: cat.type,
        expenseGroup:
          cat.type === TRANSACTION_TYPES.EXPENSE
            ? updates.expenseGroup ?? cat.expenseGroup ?? DEFAULT_EXPENSE_GROUP
            : null,
      }));
      await persistAndUpdate(updated);
    },

    deleteCategory: async (categoryId) => {
      const budget = get().currentBudget;
      if (!budget) return;
      await persistAndUpdate(
        withTotals(
          budget,
          budget.categories.filter((cat) => cat.id !== categoryId),
        ),
      );
    },

    addBudgetItem: async (categoryId, item) => {
      const budget = get().currentBudget;
      if (!budget) return;
      const exists = budget.categories.some((c) => c.id === categoryId);
      if (!exists) {
        showNotification('Category not found. Please refresh and try again.', 'error');
        return;
      }
      const newItem: BudgetItem = {
        ...item,
        id: genId(ID_PREFIXES.ITEM),
        transactions: [],
        spentAmount: 0,
      };
      await persistAndUpdate(
        mapCategory(budget, categoryId, (cat) => ({
          ...cat,
          budgetItems: [...cat.budgetItems, newItem],
        })),
      );
    },

    updateBudgetItem: async (categoryId, itemId, updates) => {
      const budget = get().currentBudget;
      if (!budget) return;
      await persistAndUpdate(
        mapItem(budget, categoryId, itemId, (item) => ({ ...item, ...updates })),
      );
    },

    deleteBudgetItem: async (categoryId, itemId) => {
      const budget = get().currentBudget;
      if (!budget) return;
      await persistAndUpdate(
        mapCategory(budget, categoryId, (cat) => ({
          ...cat,
          budgetItems: cat.budgetItems.filter((item) => item.id !== itemId),
        })),
      );
    },

    addTransaction: async (categoryId, itemId, transaction) => {
      const budget = get().currentBudget;
      if (!budget) return false;

      const category = budget.categories.find((c) => c.id === categoryId);
      if (!category) {
        showNotification('Category not found. Please refresh and try again.', 'error');
        return false;
      }
      const item = category.budgetItems.find((i) => i.id === itemId);
      if (!item) {
        showNotification('Budget item not found. Please refresh and try again.', 'error');
        return false;
      }
      if (transaction.type !== category.type) {
        showNotification('Transaction type does not match category type.', 'error');
        return false;
      }

      const newTransaction: Transaction = {
        ...transaction,
        id: genId(ID_PREFIXES.TRANSACTION),
        createdAt: Date.now(),
      };

      await persistAndUpdate(
        mapItem(budget, categoryId, itemId, (i) =>
          recalcSpent({ ...i, transactions: [...i.transactions, newTransaction] }),
        ),
      );
      return true;
    },

    updateTransaction: async (categoryId, itemId, transactionId, updates) => {
      const budget = get().currentBudget;
      if (!budget) return;
      let found = false;
      const updated = mapItem(budget, categoryId, itemId, (item) => {
        found = true;
        return recalcSpent({
          ...item,
          transactions: item.transactions.map((t) =>
            t.id === transactionId ? { ...t, ...updates } : t,
          ),
        });
      });
      if (!found) {
        showNotification('Budget item not found. Please refresh and try again.', 'error');
        return;
      }
      await persistAndUpdate(updated);
    },

    deleteTransaction: async (categoryId, itemId, transactionId) => {
      const budget = get().currentBudget;
      if (!budget) return;
      let found = false;
      const updated = mapItem(budget, categoryId, itemId, (item) => {
        found = true;
        return recalcSpent({
          ...item,
          transactions: item.transactions.filter((t) => t.id !== transactionId),
        });
      });
      if (!found) {
        showNotification('Budget item not found. Please refresh and try again.', 'error');
        return;
      }
      await persistAndUpdate(updated);
    },

    saveBudgetToFirebase: async () => {
      const budget = get().currentBudget;
      if (!budget) return;
      try {
        const ref = doc(db, COLLECTIONS.BUDGETS, budget.id);
        await setDoc(ref, budget, { merge: true });
      } catch (error) {
        console.error('Error saving budget:', error);
        showNotification(
          'Failed to save changes. Your data is saved locally.',
          'error',
        );
      }
    },
  };
});
