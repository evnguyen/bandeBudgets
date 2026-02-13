import { create } from 'zustand';
import { Budget, Category, BudgetItem, Transaction } from '@/lib/types';
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
  addTransaction: (categoryId: string, itemId: string, transaction: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
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
    console.log('[v0] Loading budget:', budgetId);

    try {
      const budgetRef = doc(db, 'budgets', budgetId);
      const budgetSnap = await getDoc(budgetRef);
      
      if (budgetSnap.exists()) {
        console.log('[v0] Budget found in Firebase, loading:', budgetSnap.data());
        set({ currentBudget: budgetSnap.data() as Budget, loading: false });
        return;
      }
    } catch (error) {
      console.error('[v0] Error loading budget from Firebase, falling back to local:', error);
    }

    console.log('[v0] Creating new budget:', budgetId);
    // Create a new budget locally (and try to persist to Firebase)
    await get().createBudget(userId, month);
  },
  
  createBudget: async (userId: string, month: string) => {
    const budgetId = `${userId}_${month}`;
    console.log('[v0] Creating new budget:', budgetId);
    
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
    console.log('[v0] Budget loaded locally:', newBudget.id);

    try {
      const budgetRef = doc(db, 'budgets', budgetId);
      await setDoc(budgetRef, newBudget);
      console.log('[v0] Budget persisted to Firebase:', budgetId);
    } catch (error) {
      console.error('[v0] Error persisting budget to Firebase:', error);
    }
  },
  
  addCategory: async (category) => {
    const state = get();
    if (!state.currentBudget) return;
    
    const newCategory: Category = {
      ...category,
      id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      budgetItems: [],
    };
    
    const updatedCategories = [...state.currentBudget.categories, newCategory];
    set({
      currentBudget: {
        ...state.currentBudget,
        categories: updatedCategories,
        updatedAt: Date.now(),
      },
    });
    
    await get().saveBudgetToFirebase();
  },
  
  updateCategory: async (categoryId, updates) => {
    const state = get();
    if (!state.currentBudget) return;
    
    const updatedCategories = state.currentBudget.categories.map((cat) =>
      cat.id === categoryId ? { ...cat, ...updates } : cat
    );
    
    set({
      currentBudget: {
        ...state.currentBudget,
        categories: updatedCategories,
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
    
    set({
      currentBudget: {
        ...state.currentBudget,
        categories: updatedCategories,
        updatedAt: Date.now(),
      },
    });
    
    await get().saveBudgetToFirebase();
  },
  
  addBudgetItem: async (categoryId, item) => {
    const state = get();
    if (!state.currentBudget) return;
    
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
    
    set({
      currentBudget: {
        ...state.currentBudget,
        categories: updatedCategories,
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
    
    set({
      currentBudget: {
        ...state.currentBudget,
        categories: updatedCategories,
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
    
    set({
      currentBudget: {
        ...state.currentBudget,
        categories: updatedCategories,
        updatedAt: Date.now(),
      },
    });
    
    await get().saveBudgetToFirebase();
  },
  
  addTransaction: async (categoryId, itemId, transaction) => {
    const state = get();
    if (!state.currentBudget) return;
    
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
    
    // Recalculate totals
    let totalIncome = 0;
    let totalExpenses = 0;
    
    updatedCategories.forEach((cat) => {
      cat.budgetItems.forEach((item) => {
        if (cat.type === 'income') {
          totalIncome += item.spentAmount;
        } else {
          totalExpenses += item.spentAmount;
        }
      });
    });
    
    set({
      currentBudget: {
        ...state.currentBudget,
        categories: updatedCategories,
        totalIncome,
        totalExpenses,
        updatedAt: Date.now(),
      },
    });
    
    await get().saveBudgetToFirebase();
  },
  
  updateTransaction: async (categoryId, itemId, transactionId, updates) => {
    const state = get();
    if (!state.currentBudget) return;
    
    const updatedCategories = state.currentBudget.categories.map((cat) =>
      cat.id === categoryId
        ? {
            ...cat,
            budgetItems: cat.budgetItems.map((item) => {
              if (item.id === itemId) {
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
    
    // Recalculate totals
    let totalIncome = 0;
    let totalExpenses = 0;
    
    updatedCategories.forEach((cat) => {
      cat.budgetItems.forEach((item) => {
        if (cat.type === 'income') {
          totalIncome += item.spentAmount;
        } else {
          totalExpenses += item.spentAmount;
        }
      });
    });
    
    set({
      currentBudget: {
        ...state.currentBudget,
        categories: updatedCategories,
        totalIncome,
        totalExpenses,
        updatedAt: Date.now(),
      },
    });
    
    await get().saveBudgetToFirebase();
  },
  
  deleteTransaction: async (categoryId, itemId, transactionId) => {
    const state = get();
    if (!state.currentBudget) return;
    
    const updatedCategories = state.currentBudget.categories.map((cat) =>
      cat.id === categoryId
        ? {
            ...cat,
            budgetItems: cat.budgetItems.map((item) => {
              if (item.id === itemId) {
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
    
    // Recalculate totals
    let totalIncome = 0;
    let totalExpenses = 0;
    
    updatedCategories.forEach((cat) => {
      cat.budgetItems.forEach((item) => {
        if (cat.type === 'income') {
          totalIncome += item.spentAmount;
        } else {
          totalExpenses += item.spentAmount;
        }
      });
    });
    
    set({
      currentBudget: {
        ...state.currentBudget,
        categories: updatedCategories,
        totalIncome,
        totalExpenses,
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
      await setDoc(budgetRef, state.currentBudget as any, { merge: true });
      console.log('[v0] Budget saved to Firebase successfully');
    } catch (error) {
      // Firebase save failed — local state is still correct
      console.error('[v0] Error saving budget to Firebase:', error);
      showNotification('Failed to save changes to Firebase. Your data is saved locally.', 'error');
    }
  },
}));
