import { create } from 'zustand';
import { Budget, Category, BudgetItem, Transaction, TransactionType } from '@/lib/types';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { showNotification } from '@/lib/notifications';
import { DEFAULT_EXPENSE_GROUP } from '@/lib/constants/budget-groups';

const calculateTotals = (categories: Category[]) => {
  let totalIncome = 0;
  let totalExpenses = 0;

  categories.forEach((cat) => {
    const items = cat.budgetItems ?? [];
    const planned = items.reduce(
      (sum, item) => sum + (Number(item.plannedAmount) || 0),
      0
    );
    if (cat.type === 'income') {
      totalIncome += planned;
    } else {
      totalExpenses += planned;
    }
  });

  return { totalIncome, totalExpenses };
};

const stripUndefined = <T>(value: T): T => {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefined(item)) as T;
  }
  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    Object.entries(value as Record<string, unknown>).forEach(([key, val]) => {
      if (val === undefined) return;
      result[key] = stripUndefined(val);
    });
    return result as T;
  }
  return value;
};

const normalizeTransactionType = (value: TransactionType | undefined): TransactionType =>
  value === 'income' ? 'income' : 'expense';

const getTodayLocalDate = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

const normalizeBudget = (budget: Budget): Budget => {
  const categories = (budget.categories ?? []).map((cat, catIndex) => {
    const normalizedType = normalizeTransactionType(cat.type);
    const budgetItems = (cat.budgetItems ?? []).map((item, itemIndex) => {
      const transactions = (item.transactions ?? []).map((txn) => ({
        ...txn,
        id: txn.id || `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        budgetItemId: txn.budgetItemId || item.id,
        amount: Number(txn.amount) || 0,
        description: txn.description || '',
        date: txn.date || getTodayLocalDate(),
        type: normalizedType,
        createdAt: typeof txn.createdAt === 'number' ? txn.createdAt : Date.now(),
      }));
      const spentAmount = transactions.reduce((sum, txn) => sum + txn.amount, 0);

      return {
        ...item,
        id: item.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        categoryId: item.categoryId || cat.id,
        name: item.name || 'Untitled Item',
        plannedAmount: Number(item.plannedAmount) || 0,
        spentAmount,
        transactions,
        order: typeof item.order === 'number' ? item.order : itemIndex,
      };
    });

    return {
      ...cat,
      id: cat.id || `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: cat.name || 'Untitled Category',
      type: normalizedType,
      expenseGroup:
        normalizedType === 'expense'
          ? cat.expenseGroup || DEFAULT_EXPENSE_GROUP
          : undefined,
      budgetItems,
      order: typeof cat.order === 'number' ? cat.order : catIndex,
    };
  });

  const totals = calculateTotals(categories);

  return {
    ...budget,
    categories,
    totalIncome: totals.totalIncome,
    totalExpenses: totals.totalExpenses,
    createdAt: typeof budget.createdAt === 'number' ? budget.createdAt : Date.now(),
    updatedAt: typeof budget.updatedAt === 'number' ? budget.updatedAt : Date.now(),
  };
};

interface BudgetState {
  currentBudget: Budget | null;
  loading: boolean;
  
  // Actions
  loadBudget: (userId: string, month: string) => Promise<void>;
  createBudget: (userId: string, month: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'budgetItems'>) => Promise<void>;
  updateCategory: (categoryId: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  addBudgetItem: (categoryId: string, item: Omit<BudgetItem, 'id' | 'transactions' | 'spentAmount'>) => Promise<void>;
  updateBudgetItem: (categoryId: string, itemId: string, updates: Partial<BudgetItem>) => Promise<void>;
  deleteBudgetItem: (categoryId: string, itemId: string) => Promise<void>;
  addTransaction: (
    categoryId: string,
    itemId: string,
    transaction: Omit<Transaction, 'id' | 'createdAt'>
  ) => Promise<boolean>;
  updateTransaction: (categoryId: string, itemId: string, transactionId: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (categoryId: string, itemId: string, transactionId: string) => Promise<void>;
  saveBudgetToFirebase: () => Promise<void>;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  currentBudget: null,
  loading: false,
  
  loadBudget: async (userId: string, month: string) => {
    set({ loading: true });
    const budgetId = `${userId}_${month}`;
    console.log('Loading budget:', budgetId);

    try {
      const budgetRef = doc(db, 'budgets', budgetId);
      const budgetSnap = await getDoc(budgetRef);
      
      if (budgetSnap.exists()) {
        console.log('Budget found in Firebase, loading:', budgetSnap.data());
        const normalized = normalizeBudget(budgetSnap.data() as Budget);
        set({ currentBudget: normalized, loading: false });
        return;
      }
    } catch (error) {
      console.error('Error loading budget from Firebase, falling back to local:', error);
    }

    console.log('Creating new budget:', budgetId);
    // Create a new budget locally (and try to persist to Firebase)
    await get().createBudget(userId, month);
  },
  
  createBudget: async (userId: string, month: string) => {
    const budgetId = `${userId}_${month}`;
    console.log('Creating new budget:', budgetId);
    
    const newBudget: Budget = {
      id: budgetId,
      userId,
      month,
      categories: [],
      totalIncome: 0,
      totalExpenses: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Always set locally first so the app is usable immediately
    set({ currentBudget: newBudget, loading: false });
    console.log('Budget loaded locally:', newBudget.id);

    try {
      const budgetRef = doc(db, 'budgets', budgetId);
      await setDoc(budgetRef, newBudget);
      console.log('Budget persisted to Firebase:', budgetId);
    } catch (error) {
      console.error('Error persisting budget to Firebase:', error);
    }
  },
  
  addCategory: async (category) => {
    const state = get();
    if (!state.currentBudget) return;
    const normalizedType = normalizeTransactionType(category.type);
    const expenseGroup =
      normalizedType === 'expense'
        ? category.expenseGroup || DEFAULT_EXPENSE_GROUP
        : undefined;

    const newCategory: Category = {
      ...category,
      type: normalizedType,
      expenseGroup,
      id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      budgetItems: [],
    };
    
    const updatedCategories = [...state.currentBudget.categories, newCategory];
    const totals = calculateTotals(updatedCategories);
    set({
      currentBudget: {
        ...state.currentBudget,
        categories: updatedCategories,
        totalIncome: totals.totalIncome,
        totalExpenses: totals.totalExpenses,
        updatedAt: Date.now(),
      },
    });
    
    await get().saveBudgetToFirebase();
  },
  
  updateCategory: async (categoryId, updates) => {
    const state = get();
    if (!state.currentBudget) return;
    
    const updatedCategories = state.currentBudget.categories.map((cat) =>
      cat.id === categoryId
        ? {
            ...cat,
            ...updates,
            type: cat.type,
            expenseGroup:
              cat.type === 'expense'
                ? updates.expenseGroup || cat.expenseGroup || DEFAULT_EXPENSE_GROUP
                : undefined,
          }
        : cat
    );

    const totals = calculateTotals(updatedCategories);
    set({
      currentBudget: {
        ...state.currentBudget,
        categories: updatedCategories,
        totalIncome: totals.totalIncome,
        totalExpenses: totals.totalExpenses,
        updatedAt: Date.now(),
      },
    });
    
    await get().saveBudgetToFirebase();
  },
  
  deleteCategory: async (categoryId) => {
    const state = get();
    if (!state.currentBudget) return;
    
    const updatedCategories = state.currentBudget.categories.filter(
      (cat) => cat.id !== categoryId
    );

    const totals = calculateTotals(updatedCategories);
    set({
      currentBudget: {
        ...state.currentBudget,
        categories: updatedCategories,
        totalIncome: totals.totalIncome,
        totalExpenses: totals.totalExpenses,
        updatedAt: Date.now(),
      },
    });
    
    await get().saveBudgetToFirebase();
  },
  
  addBudgetItem: async (categoryId, item) => {
    const state = get();
    if (!state.currentBudget) return;
    const category = state.currentBudget.categories.find((cat) => cat.id === categoryId);
    if (!category) {
      showNotification('Category not found. Please refresh and try again.', 'error');
      return;
    }

    const newItem: BudgetItem = {
      ...item,
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      transactions: [],
      spentAmount: 0,
    };
    
    const updatedCategories = state.currentBudget.categories.map((cat) =>
      cat.id === categoryId
        ? { ...cat, budgetItems: [...cat.budgetItems, newItem] }
        : cat
    );

    const totals = calculateTotals(updatedCategories);
    set({
      currentBudget: {
        ...state.currentBudget,
        categories: updatedCategories,
        totalIncome: totals.totalIncome,
        totalExpenses: totals.totalExpenses,
        updatedAt: Date.now(),
      },
    });
    
    await get().saveBudgetToFirebase();
  },
  
  updateBudgetItem: async (categoryId, itemId, updates) => {
    const state = get();
    if (!state.currentBudget) return;
    
    const updatedCategories = state.currentBudget.categories.map((cat) =>
      cat.id === categoryId
        ? {
            ...cat,
            budgetItems: cat.budgetItems.map((item) =>
              item.id === itemId ? { ...item, ...updates } : item
            ),
          }
        : cat
    );

    const totals = calculateTotals(updatedCategories);
    set({
      currentBudget: {
        ...state.currentBudget,
        categories: updatedCategories,
        totalIncome: totals.totalIncome,
        totalExpenses: totals.totalExpenses,
        updatedAt: Date.now(),
      },
    });
    
    await get().saveBudgetToFirebase();
  },
  
  deleteBudgetItem: async (categoryId, itemId) => {
    const state = get();
    if (!state.currentBudget) return;
    
    const updatedCategories = state.currentBudget.categories.map((cat) =>
      cat.id === categoryId
        ? {
            ...cat,
            budgetItems: cat.budgetItems.filter((item) => item.id !== itemId),
          }
        : cat
    );

    const totals = calculateTotals(updatedCategories);
    set({
      currentBudget: {
        ...state.currentBudget,
        categories: updatedCategories,
        totalIncome: totals.totalIncome,
        totalExpenses: totals.totalExpenses,
        updatedAt: Date.now(),
      },
    });
    
    await get().saveBudgetToFirebase();
  },
  
  addTransaction: async (categoryId, itemId, transaction) => {
    const state = get();
    if (!state.currentBudget) return false;

    const category = state.currentBudget.categories.find((cat) => cat.id === categoryId);
    if (!category) {
      showNotification('Category not found. Please refresh and try again.', 'error');
      return false;
    }
    const budgetItem = category.budgetItems.find((item) => item.id === itemId);
    if (!budgetItem) {
      showNotification('Budget item not found. Please refresh and try again.', 'error');
      return false;
    }
    if (transaction.type !== category.type) {
      showNotification('Transaction type does not match category type.', 'error');
      return false;
    }
    
    const newTransaction: Transaction = {
      ...transaction,
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
    };
    
    const updatedCategories = state.currentBudget.categories.map((cat) =>
      cat.id === categoryId
        ? {
            ...cat,
            budgetItems: cat.budgetItems.map((item) => {
              if (item.id === itemId) {
                const updatedTransactions = [...item.transactions, newTransaction];
                const newSpentAmount = updatedTransactions.reduce(
                  (sum, txn) => sum + txn.amount,
                  0
                );
                return {
                  ...item,
                  transactions: updatedTransactions,
                  spentAmount: newSpentAmount,
                };
              }
              return item;
            }),
          }
        : cat
    );

    const totals = calculateTotals(updatedCategories);
    set({
      currentBudget: {
        ...state.currentBudget,
        categories: updatedCategories,
        totalIncome: totals.totalIncome,
        totalExpenses: totals.totalExpenses,
        updatedAt: Date.now(),
      },
    });
    
    await get().saveBudgetToFirebase();
    return true;
  },
  
  updateTransaction: async (categoryId, itemId, transactionId, updates) => {
    const state = get();
    if (!state.currentBudget) return;
    let itemFound = false;
    
    const updatedCategories = state.currentBudget.categories.map((cat) =>
      cat.id === categoryId
        ? {
            ...cat,
            budgetItems: cat.budgetItems.map((item) => {
              if (item.id === itemId) {
                itemFound = true;
                const updatedTransactions = item.transactions.map((txn) =>
                  txn.id === transactionId ? { ...txn, ...updates } : txn
                );
                const newSpentAmount = updatedTransactions.reduce(
                  (sum, txn) => sum + txn.amount,
                  0
                );
                return {
                  ...item,
                  transactions: updatedTransactions,
                  spentAmount: newSpentAmount,
                };
              }
              return item;
            }),
          }
        : cat
    );
    if (!itemFound) {
      showNotification('Budget item not found. Please refresh and try again.', 'error');
      return;
    }

    const totals = calculateTotals(updatedCategories);
    set({
      currentBudget: {
        ...state.currentBudget,
        categories: updatedCategories,
        totalIncome: totals.totalIncome,
        totalExpenses: totals.totalExpenses,
        updatedAt: Date.now(),
      },
    });
    
    await get().saveBudgetToFirebase();
  },
  
  deleteTransaction: async (categoryId, itemId, transactionId) => {
    const state = get();
    if (!state.currentBudget) return;
    let itemFound = false;
    
    const updatedCategories = state.currentBudget.categories.map((cat) =>
      cat.id === categoryId
        ? {
            ...cat,
            budgetItems: cat.budgetItems.map((item) => {
              if (item.id === itemId) {
                itemFound = true;
                const updatedTransactions = item.transactions.filter(
                  (txn) => txn.id !== transactionId
                );
                const newSpentAmount = updatedTransactions.reduce(
                  (sum, txn) => sum + txn.amount,
                  0
                );
                return {
                  ...item,
                  transactions: updatedTransactions,
                  spentAmount: newSpentAmount,
                };
              }
              return item;
            }),
          }
        : cat
    );
    if (!itemFound) {
      showNotification('Budget item not found. Please refresh and try again.', 'error');
      return;
    }

    const totals = calculateTotals(updatedCategories);
    set({
      currentBudget: {
        ...state.currentBudget,
        categories: updatedCategories,
        totalIncome: totals.totalIncome,
        totalExpenses: totals.totalExpenses,
        updatedAt: Date.now(),
      },
    });
    
    await get().saveBudgetToFirebase();
  },
  
  saveBudgetToFirebase: async () => {
    const state = get();
    if (!state.currentBudget) return;
    
    try {
      const budgetRef = doc(db, 'budgets', state.currentBudget.id);
      const sanitizedBudget = stripUndefined(state.currentBudget);
      await setDoc(budgetRef, sanitizedBudget as any, { merge: true });
      console.log('Budget saved to Firebase successfully');
    } catch (error) {
      // Firebase save failed -- local state is still correct
      console.error('Error saving budget to Firebase:', error);
      showNotification('Failed to save changes to Firebase. Your data is saved locally.', 'error');
    }
  },
}));



