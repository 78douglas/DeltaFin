import { useApp } from '../context/AppContext';
import { Transaction, FilterType } from '../types';

export const useTransactions = () => {
  const { 
    state, 
    loadTransactions, 
    createTransaction, 
    updateTransaction, 
    deleteTransaction,
    getMonthlyStats,
    getCategoryExpenses 
  } = useApp();

  const getFilteredTransactions = (filter: FilterType = 'all') => {
    if (filter === 'all') return state.transactions;
    return state.transactions.filter(transaction => transaction.type === filter);
  };

  const getTransactionsByCategory = (categoryName: string) => {
    return state.transactions.filter(transaction => transaction.category_name === categoryName);
  };

  const getTransactionsByDateRange = (startDate: Date, endDate: Date) => {
    return state.transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  };

  const getRecentTransactions = (limit: number = 5) => {
    return state.transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  };

  const searchTransactions = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return state.transactions.filter(transaction =>
      transaction.description?.toLowerCase().includes(lowercaseQuery) ||
      transaction.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  };

  const getMonthlyTransactions = (month?: Date) => {
    const targetMonth = month || state.currentMonth;
    return state.transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return (
        transactionDate.getMonth() === targetMonth.getMonth() &&
        transactionDate.getFullYear() === targetMonth.getFullYear()
      );
    });
  };

  const getTotalBalance = () => {
    return state.transactions.reduce((balance, transaction) => {
      return transaction.type === 'credit' 
        ? balance + transaction.amount 
        : balance - Math.abs(transaction.amount);
    }, 0);
  };

  const getTransactionSummary = (transactions: Transaction[]) => {
    const income = transactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      income,
      expenses,
      balance: income - expenses,
      count: transactions.length,
    };
  };

  return {
    transactions: state.transactions,
    loading: state.loading,
    error: state.error,
    currentMonth: state.currentMonth,
    loadTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getFilteredTransactions,
    filterTransactions: getFilteredTransactions,
    getTransactionsByCategory,
    getTransactionsByDateRange,
    getRecentTransactions,
    searchTransactions,
    getMonthlyTransactions,
    getTotalBalance,
    getTransactionSummary,
    getMonthlyStats,
    getCategoryExpenses,
  };
};

export default useTransactions;