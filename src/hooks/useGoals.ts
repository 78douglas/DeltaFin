import { useApp } from '../context/AppContext';
import { SavingsGoal } from '../types';

export const useGoals = () => {
  const { state, loadGoals, createGoal, updateGoal, deleteGoal } = useApp();

  const getGoalById = (id: string) => {
    return state.goals.find(goal => goal.id === id);
  };

  const getGoalProgress = (goal: SavingsGoal) => {
    const percentage = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
    const saved = goal.current_amount;
    const remaining = Math.max(goal.target_amount - goal.current_amount, 0);
    
    return {
      percentage,
      saved,
      remaining
    };
  };

  const getGoalRemaining = (goal: SavingsGoal) => {
    return Math.max(goal.target_amount - goal.current_amount, 0);
  };

  const getGoalsByStatus = () => {
    const completed = state.goals.filter(goal => goal.current_amount >= goal.target_amount);
    const inProgress = state.goals.filter(goal => 
      goal.current_amount > 0 && goal.current_amount < goal.target_amount
    );
    const notStarted = state.goals.filter(goal => goal.current_amount === 0);

    return {
      completed,
      inProgress,
      notStarted,
    };
  };

  const getTotalSaved = () => {
    return state.goals.reduce((total, goal) => total + goal.current_amount, 0);
  };

  const getTotalTarget = () => {
    return state.goals.reduce((total, goal) => total + goal.target_amount, 0);
  };

  const getOverallProgress = () => {
    const totalSaved = getTotalSaved();
    const totalTarget = getTotalTarget();
    
    if (totalTarget === 0) return 0;
    return (totalSaved / totalTarget) * 100;
  };

  const addContribution = async (goalId: string, contributionData: { amount: number; description?: string }) => {
    const goal = getGoalById(goalId);
    if (!goal) throw new Error('Meta não encontrada');

    const newCurrentAmount = goal.current_amount + contributionData.amount;
    await updateGoal(goalId, { current_amount: newCurrentAmount });

    // TODO: Implementar criação de contribuição na tabela goal_contributions
    // quando necessário para histórico detalhado
  };

  const getGoalEstimatedCompletion = (goal: SavingsGoal, monthlyContribution: number) => {
    if (monthlyContribution <= 0) return null;
    
    const remaining = getGoalRemaining(goal);
    const monthsToComplete = Math.ceil(remaining / monthlyContribution);
    
    const completionDate = new Date();
    completionDate.setMonth(completionDate.getMonth() + monthsToComplete);
    
    return {
      months: monthsToComplete,
      date: completionDate,
    };
  };

  const getGoalRecommendedContribution = (goal: SavingsGoal, targetMonths: number) => {
    const remaining = getGoalRemaining(goal);
    return remaining / targetMonths;
  };

  return {
    goals: state.goals,
    loading: state.loading,
    error: state.error,
    loadGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    getGoalById,
    getGoalProgress,
    getGoalRemaining,
    getGoalsByStatus,
    getTotalSaved,
    getTotalTarget,
    getOverallProgress,
    addContribution,
    getGoalEstimatedCompletion,
    getGoalRecommendedContribution,
  };
};

export default useGoals;