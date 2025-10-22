import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Category, Transaction, SavingsGoal, AppState } from '../types';
import { supabase } from '../services/supabase';

// Actions
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'SET_GOALS'; payload: SavingsGoal[] }
  | { type: 'ADD_GOAL'; payload: SavingsGoal }
  | { type: 'UPDATE_GOAL'; payload: SavingsGoal }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'SET_CURRENT_MONTH'; payload: Date };

// Initial State
const initialState: AppState = {
  categories: [],
  transactions: [],
  goals: [],
  currentMonth: new Date(),
  loading: false,
  error: null,
};

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(cat =>
          cat.id === action.payload.id ? action.payload : cat
        ),
      };
    
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(cat => cat.id !== action.payload),
      };
    
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [...state.transactions, action.payload] };
    
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(trans =>
          trans.id === action.payload.id ? action.payload : trans
        ),
      };
    
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(trans => trans.id !== action.payload),
      };
    
    case 'SET_GOALS':
      return { ...state, goals: action.payload };
    
    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, action.payload] };
    
    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map(goal =>
          goal.id === action.payload.id ? action.payload : goal
        ),
      };
    
    case 'DELETE_GOAL':
      return {
        ...state,
        goals: state.goals.filter(goal => goal.id !== action.payload),
      };
    
    case 'SET_CURRENT_MONTH':
      return { ...state, currentMonth: action.payload };
    
    default:
      return state;
  }
};

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Category actions
  loadCategories: () => Promise<void>;
  createCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  // Transaction actions
  loadTransactions: (month?: Date) => Promise<void>;
  createTransaction: (transaction: Omit<Transaction, 'id' | 'created_at'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  // Goal actions
  loadGoals: () => Promise<void>;
  createGoal: (goal: Omit<SavingsGoal, 'id' | 'created_at' | 'updated_at' | 'current_amount'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<SavingsGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  // Utility functions
  setCurrentMonth: (month: Date) => void;
  getMonthlyStats: (month?: Date) => { income: number; expenses: number; balance: number };
  getCategoryExpenses: (month?: Date) => { name: string; value: number; color: string }[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Category actions
  const loadCategories = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      dispatch({ type: 'SET_CATEGORIES', payload: data || [] });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createCategory = async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { data, error } = await supabase
        .from('categories')
        .insert([category])
        .select()
        .single();

      if (error) throw error;
      dispatch({ type: 'ADD_CATEGORY', payload: data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      dispatch({ type: 'UPDATE_CATEGORY', payload: data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      dispatch({ type: 'DELETE_CATEGORY', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Transaction actions
  const loadTransactions = async (month?: Date) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      console.log('🔄 Carregando transações...');
      
      let query = supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (month) {
        const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
        const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
        query = query
          .gte('date', startOfMonth.toISOString())
          .lte('date', endOfMonth.toISOString());
        console.log(`📅 Filtrando por mês: ${startOfMonth.toISOString()} - ${endOfMonth.toISOString()}`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro ao carregar transações:', error);
        throw error;
      }
      
      console.log(`✅ Transações carregadas: ${data?.length || 0} registros`);
      console.log('📊 Dados das transações:', data);
      
      dispatch({ type: 'SET_TRANSACTIONS', payload: data || [] });
    } catch (error) {
      console.error('💥 Erro na função loadTransactions:', error);
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createTransaction = async (transactionData: any) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transactionData])
        .select();

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }

      if (data && data.length > 0) {
        dispatch({ type: 'ADD_TRANSACTION', payload: data[0] });
        await loadTransactions(); // Recarrega as transações
      }
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao criar transação' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      dispatch({ type: 'UPDATE_TRANSACTION', payload: data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      dispatch({ type: 'DELETE_TRANSACTION', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Goal actions
  const loadGoals = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      dispatch({ type: 'SET_GOALS', payload: data || [] });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createGoal = async (goal: Omit<SavingsGoal, 'id' | 'created_at' | 'updated_at' | 'current_amount'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { data, error } = await supabase
        .from('savings_goals')
        .insert([{ ...goal, current_amount: 0 }])
        .select()
        .single();

      if (error) throw error;
      dispatch({ type: 'ADD_GOAL', payload: data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateGoal = async (id: string, updates: Partial<SavingsGoal>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { data, error } = await supabase
        .from('savings_goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      dispatch({ type: 'UPDATE_GOAL', payload: data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      dispatch({ type: 'DELETE_GOAL', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Utility functions
  const setCurrentMonth = (month: Date) => {
    dispatch({ type: 'SET_CURRENT_MONTH', payload: month });
  };

  const getMonthlyStats = (month?: Date) => {
    const targetMonth = month || new Date();
    
    // Data de início: 1º dia do mês às 00:00:00
    const startOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
    
    // Data de fim: hoje às 23:59:59 (ou último dia do mês se for mês passado)
    const today = new Date();
    const isCurrentMonth = targetMonth.getMonth() === today.getMonth() && 
                          targetMonth.getFullYear() === today.getFullYear();
    
    const endDate = isCurrentMonth 
      ? new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
      : new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0, 23, 59, 59);

    const monthTransactions = state.transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startOfMonth && transactionDate <= endDate;
    });

    const income = monthTransactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthTransactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      income,
      expenses,
      balance: income - expenses,
    };
  };

  const getCategoryExpenses = (month?: Date) => {
    const targetMonth = month || new Date();
    
    // Data de início: 1º dia do mês às 00:00:00
    const startOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
    
    // Data de fim: hoje às 23:59:59 (ou último dia do mês se for mês passado)
    const today = new Date();
    const isCurrentMonth = targetMonth.getMonth() === today.getMonth() && 
                          targetMonth.getFullYear() === today.getFullYear();
    
    const endDate = isCurrentMonth 
      ? new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
      : new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0, 23, 59, 59);

    const monthTransactions = state.transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return (
        transactionDate >= startOfMonth && 
        transactionDate <= endDate &&
        transaction.type === 'debit'
      );
    });

    const categoryTotals = monthTransactions.reduce((acc, transaction) => {
      const categoryName = transaction.category_name || 'Outros';
      acc[categoryName] = (acc[categoryName] || 0) + Math.abs(transaction.amount);
      return acc;
    }, {} as Record<string, number>);

    // Array de cores fixas para o gráfico de pizza
    const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6B7280'];

    return Object.entries(categoryTotals).map(([categoryName, total], index) => {
      return {
        name: categoryName,
        value: total,
        color: COLORS[index % COLORS.length],
      };
    });
  };

  // Load initial data
  useEffect(() => {
    console.log('🚀 AppProvider: Inicializando dados...');
    loadCategories();
    loadTransactions();
    loadGoals();
  }, []);



  const contextValue: AppContextType = {
    state,
    dispatch,
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    loadTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    loadGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    setCurrentMonth,
    getMonthlyStats,
    getCategoryExpenses,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;