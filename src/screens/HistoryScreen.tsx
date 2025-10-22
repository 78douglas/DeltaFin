import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  X,
  Download,
  ShoppingCart,
  Car,
  Home,
  Utensils,
  Gamepad2,
  Heart,
  GraduationCap,
  Plane,
  Gift,
  Zap,
  Shirt,
  Package
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { Button, Input, Select, Card, CardHeader, CardTitle, CardContent, Badge, LoadingSpinner } from '../components/ui';
import ExportModal from '../components/ExportModal';
import { exportToCSV, exportToPDF, exportToXLS } from '../lib/exportUtils';
import { TransactionType } from '../types';
import { formatToBrazilian, brazilianToISO, isValidBrazilianDate } from '../lib/utils';

// Cores para o gráfico de pizza
const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', 
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
];

// Função para obter ícone da categoria
const getCategoryIcon = (categoryName: string) => {
  const iconMap: { [key: string]: any } = {
    'Alimentação': Utensils,
    'Transporte': Car,
    'Moradia': Home,
    'Compras': ShoppingCart,
    'Entretenimento': Gamepad2,
    'Saúde': Heart,
    'Educação': GraduationCap,
    'Viagem': Plane,
    'Presentes': Gift,
    'Serviços': Zap,
    'Roupas': Shirt,
    'Outros': Package
  };
  return iconMap[categoryName] || Package;
};

// Função para formatar moeda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const HistoryScreen = () => {
  const { 
    transactions, 
    filterTransactions, 
    searchTransactions,
    getTransactionsByDateRange,
    loading,
    error,
    loadTransactions
  } = useTransactions();
  const { categories, getCategoryByName } = useCategories();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [periodType, setPeriodType] = useState<'predefined' | 'custom'>('predefined');
  const [predefinedPeriod, setPredefinedPeriod] = useState('all-time');
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Recarregar transações quando a tela for acessada
  useEffect(() => {
    loadTransactions();
  }, []);

  // Aplicar filtros de período predefinido
  const applyPredefinedPeriod = () => {
    if (periodType === 'predefined') {
      const now = new Date();
      let startDateForPeriod: Date;
      
      switch (predefinedPeriod) {
        case 'all-time':
          // Retornar todas as transações sem filtro de data
          return transactions;
        case '1-month':
          startDateForPeriod = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          break;
        case '3-months':
          startDateForPeriod = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
          break;
        case '6-months':
          startDateForPeriod = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
          break;
        case '1-year':
          startDateForPeriod = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          break;
        case '2-years':
        default:
          startDateForPeriod = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
          break;
      }
      
      return getTransactionsByDateRange(startDateForPeriod, now);
    }
    return transactions;
  };

  // Aplicar filtros
  let filteredTransactions = periodType === 'predefined' ? applyPredefinedPeriod() : transactions;

  if (searchTerm) {
    filteredTransactions = filteredTransactions.filter(transaction => 
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (filterType !== 'all') {
    filteredTransactions = filteredTransactions.filter(t => t.type === filterType);
  }

  if (selectedCategory) {
    filteredTransactions = filteredTransactions.filter(t => t.category_name === selectedCategory);
  }

  if (periodType === 'custom' && startDate && endDate) {
    // Converter datas brasileiras para ISO antes de filtrar
    const startDateISO = brazilianToISO(startDate);
    const endDateISO = brazilianToISO(endDate);
    
    if (startDateISO && endDateISO) {
      filteredTransactions = getTransactionsByDateRange(new Date(startDateISO), new Date(endDateISO));
    }
  }

  // Agrupar transações por mês
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

  const groupedTransactions = groupTransactionsByDate(filteredTransactions);

  // Calcular resumo
  const summary = filteredTransactions.reduce(
    (acc, transaction) => {
      if (transaction.type === 'credit') {
        acc.income += transaction.amount;
      } else {
        acc.expenses += transaction.amount;
      }
      return acc;
    },
    { income: 0, expenses: 0 }
  );

  const balance = summary.income - summary.expenses;

  // Calcular despesas por categoria para o gráfico
  const categoryExpenses = filteredTransactions
    .filter(transaction => transaction.type === 'debit')
    .reduce((acc, transaction) => {
      const category = getCategoryByName(transaction.category_name);
      const categoryName = category?.name || 'Outros';
      
      if (!acc[categoryName]) {
        acc[categoryName] = 0;
      }
      acc[categoryName] += transaction.amount;
      return acc;
    }, {} as Record<string, number>);

  const chartData = Object.entries(categoryExpenses)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Dados para o gráfico de pizza com cores pré-definidas (igual ao DashboardScreen)
  const pieData = chartData.map((item, index) => ({
    name: item.name,
    value: item.value,
    color: COLORS[index % COLORS.length]
  }));



  const formatTransactionDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateHeader = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setSelectedCategory('');
    setStartDate('');
    setEndDate('');
    setPeriodType('predefined');
    setPredefinedPeriod('all-time');
  };

  const hasActiveFilters = searchTerm || filterType !== 'all' || selectedCategory || 
    (periodType === 'custom' && (startDate || endDate)) || 
    (periodType === 'predefined' && predefinedPeriod !== 'all-time');

  // Função para exportar transações
  const handleExport = async (format: 'csv' | 'pdf' | 'xls') => {
    setIsExporting(true);
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `transacoes_${timestamp}`;
      
      switch (format) {
        case 'csv':
          exportToCSV(filteredTransactions, `${filename}.csv`);
          break;
        case 'pdf':
          exportToPDF(filteredTransactions, `${filename}.pdf`);
          break;
        case 'xls':
          exportToXLS(filteredTransactions, `${filename}.xlsx`);
          break;
      }
      
      setShowExportModal(false);
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao exportar as transações. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  // Filtrar categorias duplicadas por nome e criar opções únicas
  const uniqueCategories = categories.reduce((acc, current) => {
    const exists = acc.find(item => item.name === current.name);
    if (!exists) {
      acc.push(current);
    }
    return acc;
  }, []);

  const categoryOptions = [
    { value: '', label: 'Todas as categorias' },
    ...uniqueCategories.map(cat => ({
      value: cat.name,
      label: cat.name
    }))
  ];

  const typeOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'credit', label: 'Receitas' },
    { value: 'debit', label: 'Despesas' }
  ];

  const predefinedPeriodOptions = [
    { value: 'all-time', label: 'Todo período' },
    { value: '1-month', label: 'Último mês' },
    { value: '3-months', label: 'Últimos 3 meses' },
    { value: '6-months', label: 'Últimos 6 meses' },
    { value: '1-year', label: 'Último 1 ano' },
    { value: '2-years', label: 'Últimos 2 anos' }
  ];

  if (loading) {
    return (
      <div className="p-4">
        <LoadingSpinner fullScreen text="Carregando histórico..." />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
      {/* Componente de teste temporário - REMOVIDO TEMPORARIAMENTE */}
      {/* <TestTransactions /> */}
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Histórico</h1>
          <p className="text-gray-600">Todas as suas transações</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowExportModal(true)}
            disabled={filteredTransactions.length === 0}
            className="flex items-center gap-2"
          >
            <Download size={16} />
            Exportar
          </Button>
        </div>
      </div>

      {/* Nova Seção de Filtros e Busca */}
      <div className="mb-6">
        {/* Header colapsável */}
        <div 
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => setFiltersExpanded(!filtersExpanded)}
        >
          <h3 className="font-medium text-gray-800">Filtros e Busca</h3>
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            {filtersExpanded ? (
              <div className="flex items-center space-x-1">
                <Filter size={16} />
                <span>Ocultar Filtros</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <Filter size={16} />
                <span>Mostrar Filtros</span>
              </div>
            )}
          </button>
        </div>

        {/* Conteúdo dos filtros */}
        {filtersExpanded && (
          <div className="p-4 border border-gray-200 rounded-b-lg bg-white">
            {/* Campo de busca */}
            <div className="mb-4">
              <Input
                placeholder="Buscar por categoria ou tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search size={20} className="text-gray-400" />}
                className="w-full"
              />
            </div>

            {/* Linha 1: Tipo + Categoria */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Tipo</label>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as TransactionType | 'all')}
                  options={typeOptions}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Categoria</label>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  options={categoryOptions}
                />
              </div>
            </div>

            {/* Linha 2: Tipo do Período + Período */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Tipo do Período:</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="periodType" 
                      value="predefined"
                      checked={periodType === 'predefined'}
                      onChange={(e) => setPeriodType(e.target.value as 'predefined' | 'custom')}
                      className="mr-2"
                    />
                    <span className="text-gray-700">Predefinido</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="periodType" 
                      value="custom"
                      checked={periodType === 'custom'}
                      onChange={(e) => setPeriodType(e.target.value as 'predefined' | 'custom')}
                      className="mr-2"
                    />
                    <span className="text-gray-700">Personalizado</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Período:</label>
                {periodType === 'predefined' ? (
                  <Select
                    value={predefinedPeriod}
                    onChange={(e) => setPredefinedPeriod(e.target.value)}
                    options={predefinedPeriodOptions}
                  />
                ) : (
                  <span className="text-gray-500 text-sm">Selecione as datas abaixo</span>
                )}
              </div>
            </div>

            {/* Linha 3: Datas (só quando personalizado) */}
            {periodType === 'custom' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Data Início</label>
                  <Input
                    type="text"
                    placeholder="DD/MM/AAAA"
                    value={startDate}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Permitir apenas números e barras
                      const cleanValue = value.replace(/[^\d/]/g, '');
                      
                      // Formatação automática
                      let formattedValue = cleanValue;
                      if (cleanValue.length >= 2 && cleanValue.indexOf('/') === -1) {
                        formattedValue = cleanValue.slice(0, 2) + '/' + cleanValue.slice(2);
                      }
                      if (cleanValue.length >= 5 && cleanValue.split('/').length === 2) {
                        const parts = cleanValue.split('/');
                        formattedValue = parts[0] + '/' + parts[1].slice(0, 2) + '/' + parts[1].slice(2);
                      }
                      
                      // Limitar a 10 caracteres (DD/MM/AAAA)
                      if (formattedValue.length <= 10) {
                        setStartDate(formattedValue);
                      }
                    }}
                    leftIcon={<Calendar size={20} className="text-gray-400" />}
                    maxLength={10}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Data Fim</label>
                  <Input
                    type="text"
                    placeholder="DD/MM/AAAA"
                    value={endDate}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Permitir apenas números e barras
                      const cleanValue = value.replace(/[^\d/]/g, '');
                      
                      // Formatação automática
                      let formattedValue = cleanValue;
                      if (cleanValue.length >= 2 && cleanValue.indexOf('/') === -1) {
                        formattedValue = cleanValue.slice(0, 2) + '/' + cleanValue.slice(2);
                      }
                      if (cleanValue.length >= 5 && cleanValue.split('/').length === 2) {
                        const parts = cleanValue.split('/');
                        formattedValue = parts[0] + '/' + parts[1].slice(0, 2) + '/' + parts[1].slice(2);
                      }
                      
                      // Limitar a 10 caracteres (DD/MM/AAAA)
                      if (formattedValue.length <= 10) {
                        setEndDate(formattedValue);
                      }
                    }}
                    leftIcon={<Calendar size={20} className="text-gray-400" />}
                    maxLength={10}
                  />
                </div>
              </div>
            )}

            {/* Botão Limpar */}
            <div className="flex justify-end">
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-gray-600 hover:text-gray-800"
                disabled={!hasActiveFilters}
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        )}
      </div>



      {/* Lista de Transações Agrupadas por Data */}
      <div className="space-y-6">
        {filteredTransactions.length === 0 ? (
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-gray-500 mb-2">
                  {hasActiveFilters 
                    ? 'Nenhuma transação encontrada com os filtros aplicados' 
                    : 'Nenhuma transação encontrada'
                  }
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Limpar filtros
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          groupedTransactions.map((group) => (
            <div key={group.date} className="space-y-3">
              {/* Cabeçalho da Data */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  {formatDateHeader(group.date)}
                </h2>
                <span className="text-sm text-gray-500">
                  {group.transactions.length} transação{group.transactions.length !== 1 ? 'ões' : ''}
                </span>
              </div>

              {/* Transações do Dia */}
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100">
                    {group.transactions.map((transaction) => {
                      const category = getCategoryByName(transaction.category_name);
                      
                      return (
                        <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-4">
                              {/* Emoji da Categoria */}
                              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                                {category?.icon || '📄'}
                              </div>
                              
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-800">
                                  {category?.name || 'Categoria não encontrada'}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  {transaction.description}
                                </p>
                                
                                {/* Tags (apenas se existirem e não forem vazias) */}
                                {transaction.tags && transaction.tags.length > 0 && transaction.tags.some((tag: string) => tag.trim() !== '') && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {transaction.tags.filter((tag: string) => tag.trim() !== '').map((tag: string, index: number) => (
                                      <Badge key={index} variant="outline" size="sm">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <span className={`text-lg font-bold ${
                                transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
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
                </CardContent>
              </Card>
            </div>
          ))
        )}
      </div>

      {/* Gráfico de Despesas por Categoria no Período */}
      {chartData.length > 0 && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800">
                Despesas por Categoria no Período
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gráfico de Pizza */}
                <div className="flex justify-center">
                  <div className="w-80 h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
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
                          formatter={(value: number) => {
                            const total = chartData.reduce((sum, item) => sum + item.value, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return [`${formatCurrency(value)} (${percentage}%)`, 'Valor'];
                          }}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Legenda */}
                <div className="space-y-4">
                  {chartData.map((item, index) => {
                    const IconComponent = getCategoryIcon(item.name);
                    const total = chartData.reduce((sum, data) => sum + data.value, 0);
                    const percentage = ((item.value / total) * 100).toFixed(1);
                    
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
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de Exportação */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        isExporting={isExporting}
      />
    </div>
  );
};

export default HistoryScreen;