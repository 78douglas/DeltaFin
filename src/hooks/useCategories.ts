import { useApp } from '../context/AppContext';
import { Category } from '../types';

export const useCategories = () => {
  const { state, loadCategories, createCategory, updateCategory, deleteCategory } = useApp();

  const getCategoriesByType = (type: 'credit' | 'debit') => {
    return state.categories
      .filter(category => category.type === type)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  const getCategoryById = (id: string) => {
    return state.categories.find(category => category.id === id);
  };

  const getCategoryByName = (name: string) => {
    return state.categories.find(category => category.name === name);
  };

  const getCategoryStats = (categoryName: string, month?: Date) => {
    const targetMonth = month || state.currentMonth;
    const categoryTransactions = state.transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return (
        transaction.category_name === categoryName &&
        transactionDate.getMonth() === targetMonth.getMonth() &&
        transactionDate.getFullYear() === targetMonth.getFullYear()
      );
    });

    const total = categoryTransactions.reduce((sum, transaction) => {
      return sum + Math.abs(transaction.amount);
    }, 0);

    return {
      total,
      transactionCount: categoryTransactions.length,
      transactions: categoryTransactions,
    };
  };

  const getTopCategories = (limit: number = 5, month?: Date) => {
    const targetMonth = month || state.currentMonth;
    const categoryTotals = state.categories.map(category => {
      const stats = getCategoryStats(category.id, targetMonth);
      return {
        ...category,
        total: stats.total,
        transactionCount: stats.transactionCount,
      };
    });

    return categoryTotals
      .filter(category => category.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);
  };

  return {
    categories: state.categories,
    creditCategories: getCategoriesByType('credit'),
    debitCategories: getCategoriesByType('debit'),
    loading: state.loading,
    error: state.error,
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getCategoryByName,
    getCategoryStats,
    getTopCategories,
    getCreditCategories: () => getCategoriesByType('credit'),
    getDebitCategories: () => getCategoriesByType('debit'),
  };
};

export default useCategories;