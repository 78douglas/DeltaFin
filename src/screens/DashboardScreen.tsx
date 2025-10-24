import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
  ShoppingBag,
  Coffee,
  Car,
  Home,
  Gamepad2,
  Heart,
  GraduationCap,
  Plane,
  Gift,
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  User,
  HelpCircle,
  Edit,
  Trash2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { useApp } from '../context/AppContext';

import { Button } from '../components/ui';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PieChart from '../components/charts/PieChart';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatToBrazilian } from '../lib/utils';
import EditTransactionModal from '../components/EditTransactionModal';
import DeleteTransactionModal from '../components/DeleteTransactionModal';
import { Transaction } from '../types';

const DashboardScreen = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { 
    getMonthlyStats, 
    getCategoryExpenses, 
    state: { loading, transactions, editMode }
  } = useApp();
  const { getCategoryByName } = useCategories();
  const { getTotalBalance } = useTransactions();

  const [showBalance, setShowBalance] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  // Estado para controlar o mês selecionado
  const currentDate = new Date();
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // Usar o mês selecionado para calcular estatísticas mensais
  const [year, month] = selectedMonth.split('-');
  const selectedDate = new Date(parseInt(year), parseInt(month) - 1, 1);
  const monthlyStats = getMonthlyStats(selectedDate);
  
  // Calcular saldo total de todas as transações (histórico completo)
  const balance = getTotalBalance();
  const categoryExpenses = getCategoryExpenses(selectedDate);
  
  // Filtrar transações do mês selecionado
  // Fechar menu quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    const transactionMonth = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
    return transactionMonth === selectedMonth;
  });
  
  const recentTransactions = filteredTransactions;

  // Agrupar transações por mês (reutilizando lógica da HistoryScreen)
  const groupTransactionsByDate = (transactions: any[]) => {
    const grouped = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
      
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(transaction);
      return acc;
    }, {} as Record<string, any[]>);

    // Ordenar os meses (mais recente primeiro) e retornar array de objetos
    return Object.keys(grouped)
      .sort((a, b) => new Date(b + '-01').getTime() - new Date(a + '-01').getTime())
      .map(monthKey => ({
        date: monthKey,
        transactions: grouped[monthKey].sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime())
      }));
  };

  const formatDateHeader = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatTransactionDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowEditModal(true);
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDeleteModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedTransaction(null);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedTransaction(null);
  };

  const groupedRecentTransactions = groupTransactionsByDate(recentTransactions);

  // Gerar opções para o seletor de mês
  const generateMonthOptions = () => {
    const options = [];
    const currentYear = new Date().getFullYear();
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    // Adicionar meses de 2024 e 2025
    for (let year = 2024; year <= 2025; year++) {
      for (let month = 0; month < 12; month++) {
        const value = `${year}-${String(month + 1).padStart(2, '0')}`;
        const label = `${months[month]} ${year}`;
        options.push({ value, label });
      }
    }
    
    return options.reverse(); // Mais recentes primeiro
  };

  const monthOptions = generateMonthOptions();

  // Cores modernas para o gráfico de pizza - Paleta diversificada e contrastante
  const COLORS = [
    '#FF6B6B', // Vermelho vibrante
    '#4ECDC4', // Turquesa
    '#45B7D1', // Azul
    '#FFA726', // Laranja
    '#AB47BC', // Roxo
    '#66BB6A', // Verde
    '#FFEB3B', // Amarelo
    '#FF7043', // Laranja avermelhado
    '#26C6DA', // Ciano
    '#EC407A', // Rosa
    '#8BC34A', // Verde claro
    '#FF9800'  // Laranja escuro
  ];

  // Dados para o gráfico de pizza
  const pieData = categoryExpenses.map((item, index) => ({
    name: item.name,
    value: item.value,
    color: COLORS[index % COLORS.length]
  }));

  // Função para obter ícone da categoria
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('alimentação') || name.includes('comida')) return Coffee;
    if (name.includes('transporte') || name.includes('combustível')) return Car;
    if (name.includes('moradia') || name.includes('casa')) return Home;
    if (name.includes('compras') || name.includes('shopping')) return ShoppingBag;
    if (name.includes('saúde') || name.includes('médico')) return Heart;
    if (name.includes('lazer') || name.includes('entretenimento')) return Gamepad2;
    if (name.includes('cartão') || name.includes('crédito')) return CreditCard;
    return Wallet;
  };

  // Função para logout
  const handleLogout = () => {
    setShowLogoutConfirm(true);
    setShowUserMenu(false);
  };

  const confirmLogout = async () => {
    await signOut();
    setShowLogoutConfirm(false);
  };

  // Função para navegar para configurações
  const handleNavigateToProfile = () => {
    setShowUserMenu(false);
    navigate('/profile');
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <LoadingSpinner fullScreen text="Carregando dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header com Avatar e Seletor de Mês */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {/* Menu do Usuário à esquerda */}
            <div className="relative user-menu-container">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-10 h-10 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                {user?.user_metadata?.avatar_url ? (
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt={user.user_metadata?.full_name || user.user_metadata?.name || 'Usuário'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={20} className="text-white" />
                )}
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 py-2 z-50">
                  {/* Perfil */}
                  <button
                    onClick={handleNavigateToProfile}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50/80 transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <User size={16} className="text-purple-600" />
                    </div>
                    <span className="text-gray-700 font-medium">Meu Perfil</span>
                  </button>

                  {/* Configurações */}
                  <button
                    onClick={handleNavigateToProfile}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50/80 transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Settings size={16} className="text-blue-600" />
                    </div>
                    <span className="text-gray-700 font-medium">Configurações</span>
                  </button>



                  {/* Ajuda */}
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      // Implementar página de ajuda ou modal
                      alert('Funcionalidade de ajuda em desenvolvimento');
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50/80 transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <HelpCircle size={16} className="text-green-600" />
                    </div>
                    <span className="text-gray-700 font-medium">Ajuda</span>
                  </button>

                  {/* Divisor */}
                  <div className="my-2 border-t border-gray-200/50"></div>

                  {/* Sair */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-red-50/80 transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <LogOut size={16} className="text-red-600" />
                    </div>
                    <span className="text-red-600 font-medium">Sair</span>
                  </button>
                </div>
              )}
            </div>
            
            {/* Seletor de mês no centro */}
            <div className="flex-1 flex justify-center">
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                {monthOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Espaço à direita para balanceamento */}
            <div className="w-12"></div>
          </div>
        </div>

        {/* Card Unificado: Saldo + Receitas + Despesas */}
        <div className="mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
            {/* Saldo em Conta - Seção Principal */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <h2 className="text-lg font-medium text-gray-600">Saldo em conta</h2>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                >
                  {showBalance ? <EyeOff size={18} className="text-gray-600" /> : <Eye size={18} className="text-gray-600" />}
                </button>
              </div>
              <div className="bg-green-600 rounded-2xl p-6 text-center">
                <p className="text-4xl sm:text-5xl font-bold text-white">
                  {showBalance ? formatCurrency(balance) : '••••••'}
                </p>
              </div>
            </div>

            {/* Receitas e Despesas - Lado a Lado */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {/* Receitas */}
              <div className="group">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 sm:p-6 border border-green-100 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                        <ArrowUpRight size={20} className="text-white sm:w-6 sm:h-6" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-green-700">Receitas</p>
                        <p className="text-lg sm:text-2xl font-bold text-green-600">
                          {showBalance ? formatCurrency(monthlyStats.income) : '••••••'}
                        </p>
                      </div>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-green-600">
                    <TrendingUp size={16} />
                    <span>Entradas do mês</span>
                  </div>
                </div>
              </div>

              {/* Despesas */}
              <div className="group">
                <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-4 sm:p-6 border border-red-100 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="p-2 sm:p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg">
                        <ArrowDownRight size={20} className="text-white sm:w-6 sm:h-6" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-red-700">Despesas</p>
                        <p className="text-lg sm:text-2xl font-bold text-red-600">
                          {showBalance ? formatCurrency(monthlyStats.expenses) : '••••••'}
                        </p>
                      </div>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-red-600">
                    <TrendingDown size={16} />
                    <span>Saídas do mês</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de Despesas por Categoria - Design Moderno */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 mb-8">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Despesas por Categoria</h3>
            <p className="text-gray-600">Distribuição dos seus gastos mensais</p>
          </div>
          
          {categoryExpenses.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Gráfico */}
              <div className="relative">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius="85%"
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number, name: string) => {
                          const percentage = ((value / monthlyStats.expenses) * 100).toFixed(1);
                          return [`${formatCurrency(value)} (${percentage}%)`, name];
                        }}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Legenda Moderna */}
              <div className="space-y-4">
                {(showAllCategories ? categoryExpenses : categoryExpenses.slice(0, 4)).map((item, index) => {
                  const IconComponent = getCategoryIcon(item.name);
                  const percentage = ((item.value / monthlyStats.expenses) * 100).toFixed(1);
                  
                  return (
                    <div key={item.name} className="flex items-center justify-between p-4 bg-gray-50/80 rounded-xl hover:bg-gray-100/80 transition-colors duration-200">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="p-2 rounded-lg shadow-sm"
                          style={{ backgroundColor: COLORS[index % COLORS.length] + '20' }}
                        >
                          <IconComponent 
                            size={20} 
                            style={{ color: COLORS[index % COLORS.length] }}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{item.name}</p>
                          <p className="text-sm text-gray-500">{percentage}%</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">{formatCurrency(item.value)}</p>
                        <div 
                          className="w-3 h-3 rounded-full ml-auto mt-1"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                      </div>
                    </div>
                  );
                })}
                
                {/* Botão Mostrar Mais/Menos */}
                {categoryExpenses.length > 4 && (
                  <div className="text-center pt-2">
                    <button
                      onClick={() => setShowAllCategories(!showAllCategories)}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200"
                    >
                      {showAllCategories ? 'Mostrar menos' : `Mostrar mais (${categoryExpenses.length - 4} categorias)`}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Estado vazio - Sem despesas */
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <ShoppingBag size={28} className="text-white" />
                </div>
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">Nenhuma despesa encontrada</h4>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Adicione algumas transações de despesa para visualizar o gráfico de distribuição por categoria.
              </p>
              <Button 
                onClick={() => navigate('/transaction')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-6 py-3"
              >
                <Plus size={18} className="mr-2" />
                Adicionar Despesa
              </Button>
            </div>
          )}
        </div>

        {/* Transações Recentes - Design Elegante */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
          <div className="mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Transações Recentes</h3>
              <p className="text-gray-600">Transações do mês selecionado</p>
            </div>
          </div>

          {groupedRecentTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-500 mb-6 text-lg">Nenhuma transação no mês selecionado</p>
              <Button 
                onClick={() => navigate('/transaction')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-6 py-3"
              >
                <Plus size={18} className="mr-2" />
                Adicionar primeira transação
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedRecentTransactions.map((group) => (
                <div key={group.date} className="space-y-3">
                  {/* Cabeçalho do Mês */}
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-800">
                      {formatDateHeader(group.date)}
                    </h4>
                    <span className="text-sm text-gray-500">
                      {group.transactions.length} transação{group.transactions.length !== 1 ? 'ões' : ''}
                    </span>
                  </div>

                  {/* Transações do Mês */}
                  <div className="divide-y divide-gray-100">
                    {group.transactions.slice(0, 10).map((transaction, index) => {
                      const category = getCategoryByName(transaction.category_name);
                      const isCredit = transaction.type === 'credit';
                      
                      return (
                        <div 
                          key={transaction.id} 
                          className="group flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-center space-x-4 min-w-0 flex-1">
                            {/* Emoji da Categoria */}
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                              {category?.icon || '📄'}
                            </div>
                            
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-gray-800 truncate text-lg">
                                {category?.name || 'Categoria não encontrada'}
                              </p>
                              <p className="text-sm text-gray-600 mt-1 truncate">
                                {transaction.description}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            {/* Botões de Editar/Excluir - Apenas quando editMode está ativo */}
                            {editMode && (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditTransaction(transaction);
                                  }}
                                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                  title="Editar transação"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTransaction(transaction);
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                  title="Excluir transação"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            )}
                            
                            <div className="text-right flex-shrink-0">
                              <span className={`font-bold text-xl ${
                                isCredit ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {isCredit ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                              </span>
                              <div className="text-sm text-gray-500 mt-1">
                                {formatTransactionDate(transaction.date)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botão Ver Todas no Final da Página */}
        <div className="mt-8 text-center">
          <Button
            onClick={() => navigate('/history')}
            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-6 py-3"
          >
            Ver todas as transações
          </Button>
        </div>
      </div>

      {/* Modal de Confirmação de Logout */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut size={24} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Confirmar Saída
              </h3>
              <p className="text-gray-600 mb-6">
                Tem certeza que deseja sair da sua conta?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Transação */}
      {showEditModal && selectedTransaction && (
        <EditTransactionModal
          transaction={selectedTransaction}
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
        />
      )}

      {/* Modal de Exclusão de Transação */}
      {showDeleteModal && selectedTransaction && (
        <DeleteTransactionModal
          transaction={selectedTransaction}
          isOpen={showDeleteModal}
          onClose={handleCloseDeleteModal}
        />
      )}
    </div>
  );
};

export default DashboardScreen;