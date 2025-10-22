// Tipos principais do DeltaFin v1.0

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: 'credit' | 'debit';
  is_default: boolean;
  order?: number;
  description?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  amount: number;
  description?: string;
  category_name: string | null;
  date: string;
  tags: string[];
  type: 'credit' | 'debit';
  created_at: string;
  category?: Category;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface GoalContribution {
  id: string;
  goal_id: string;
  amount: number;
  description?: string;
  created_at: string;
}

export interface TransactionFormData {
  amount: number;
  description?: string;
  categoryName: string;
  date: Date;
  tags: string[];
  type: 'credit' | 'debit';
}

export interface CategoryExpense {
  categoryName: string;
  amount: number;
  percentage: number;
}

export interface MonthlyStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
}

export interface AppState {
  currentMonth: Date;
  transactions: Transaction[];
  categories: Category[];
  goals: SavingsGoal[];
  loading: boolean;
  error: string | null;
}

export type TransactionType = 'credit' | 'debit';
export type FilterType = 'all' | 'credit' | 'debit';