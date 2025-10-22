import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar,
  X,
  ChevronDown,
  ChevronUp,
  Plus
} from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { useToast } from '../components/ui';
import { Button, Card } from '../components/ui';
import { TransactionType } from '../types';
import { formatToBrazilian, brazilianToISO, isValidBrazilianDate } from '../lib/utils';

const TransactionScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { createTransaction, loading } = useTransactions();
  const { creditCategories, debitCategories } = useCategories();
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    type: 'debit' as TransactionType,
    amount: '',
    description: '',
    categoryName: '',
    date: formatToBrazilian(new Date()),
    tags: [] as string[],
    newTag: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showExtraFields, setShowExtraFields] = useState(false);

  // Ref para o input de valor
  const amountInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus no campo de valor quando a tela carregar
  useEffect(() => {
    if (amountInputRef.current) {
      amountInputRef.current.focus();
    }
  }, []);

  // Definir tipo inicial baseado no state da navegação
  useEffect(() => {
    const state = location.state as { type?: 'expense' | 'income' } | null;
    if (state?.type) {
      const transactionType = state.type === 'expense' ? 'debit' : 'credit';
      setFormData(prev => ({ ...prev, type: transactionType as TransactionType }));
    }
  }, [location.state]);

  // Obter categorias baseadas no tipo selecionado
  const getCurrentCategories = () => {
    if (formData.type === 'credit') {
      return creditCategories;
    } else {
      return debitCategories;
    }
  };

  const currentCategories = getCurrentCategories();

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue || numericValue === '') {
      return '0,00';
    }
    const formattedValue = (parseInt(numericValue) / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return formattedValue;
  };

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    setFormData(prev => ({
      ...prev,
      amount: numericValue
    }));
  };

  const handleClearAmount = () => {
    setFormData(prev => ({
      ...prev,
      amount: ''
    }));
    // Manter o foco no campo após limpar
    if (amountInputRef.current) {
      amountInputRef.current.focus();
    }
  };

  const handleTypeChange = (type: TransactionType) => {
    setFormData(prev => ({
      ...prev,
      type,
      categoryName: '' // Reset category when changing type
    }));
  };

  const handleCategorySelect = (categoryName: string) => {
    setFormData(prev => ({
      ...prev,
      categoryName: categoryName
    }));
  };

  const handleAddTag = () => {
    if (formData.newTag.trim() && !formData.tags.includes(formData.newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: ''
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }

    if (!formData.categoryName) {
      newErrors.categoryName = 'Categoria é obrigatória';
    }

    if (!formData.date) {
      newErrors.date = 'Data é obrigatória';
    } else if (!isValidBrazilianDate(formData.date)) {
      newErrors.date = 'Data deve estar no formato DD/MM/AAAA';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      error('Erro de validação', 'Por favor, corrija os campos destacados');
      return;
    }

    try {
      console.log('🔄 Iniciando criação de transação na tela...');
      console.log('📝 Dados do formulário:', formData);
      
      const transactionData = {
        type: formData.type,
        amount: parseFloat(formData.amount) / 100,
        description: formData.description || `Transação ${formData.type === 'credit' ? 'de receita' : 'de despesa'}`,
        category_name: formData.categoryName,
        date: brazilianToISO(formData.date) || formData.date,
        tags: formData.tags
      };
      
      console.log('📦 Dados preparados para envio:', transactionData);
      console.log('💰 Amount calculado:', parseFloat(formData.amount) / 100);
      console.log('📅 Data formatada:', formData.date);
      console.log('🏷️ Category Name:', formData.categoryName);
      
      await createTransaction(transactionData);

      success(
        'Transação criada!', 
        `${formData.type === 'credit' ? 'Receita' : 'Despesa'} de R$ ${formatCurrency(formData.amount)} adicionada com sucesso`
      );
      
      navigate('/history');
    } catch (err) {
      console.error('💥 Erro capturado na tela:', err);
      console.error('💥 Stack trace:', (err as Error).stack);
      error('Erro ao criar transação', 'Tente novamente em alguns instantes');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Card className="mx-auto max-w-md bg-white shadow-xl rounded-3xl overflow-hidden" onKeyDown={handleKeyDown}>
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-lg font-semibold text-gray-800">
              {formData.type === 'debit' ? 'Lançamento de Débito' : 'Lançamento de Crédito'}
            </h1>
            <div className="w-8" />
          </div>

          {/* Toggle Débito/Crédito */}
          <div className="relative bg-gray-100 rounded-full p-1 mb-6">
            <div 
              className={`absolute top-1 bottom-1 w-1/2 rounded-full transition-all duration-300 ease-in-out ${
                formData.type === 'debit' 
                  ? 'left-1 bg-red-500' 
                  : 'left-1/2 bg-green-500'
              }`}
            />
            <div className="relative flex">
              <button
                onClick={() => handleTypeChange('debit')}
                className={`flex-1 py-3 px-6 text-sm font-medium rounded-full transition-colors duration-300 ${
                  formData.type === 'debit' 
                    ? 'text-white' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                DÉBITO
              </button>
              <button
                onClick={() => handleTypeChange('credit')}
                className={`flex-1 py-3 px-6 text-sm font-medium rounded-full transition-colors duration-300 ${
                  formData.type === 'credit' 
                    ? 'text-white' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                CRÉDITO
              </button>
            </div>
          </div>

          {/* Campo de Valor */}
          <div className="mb-6">
            <div className="flex items-center bg-gray-50 rounded-2xl p-4 border-2 border-gray-200 focus-within:border-blue-500 transition-colors">
              <input
                ref={amountInputRef}
                type="text"
                value={formatCurrency(formData.amount)}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0,00"
                className="flex-1 bg-transparent text-2xl font-bold text-gray-800 placeholder-gray-400 outline-none"
              />
              {/* Botão X para limpar - só aparece quando há valor */}
              {formData.amount && formData.amount !== '' && (
                <button
                  onClick={handleClearAmount}
                  className="p-1 mr-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-200"
                  type="button"
                >
                  <X size={20} />
                </button>
              )}
              <div className="text-gray-600">
                <span className="text-lg font-medium">BRL</span>
              </div>
            </div>
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
            )}
          </div>
        </div>

        {/* Categorias */}
        <div className="px-6 pb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Categorias</h3>
          
          <div className="grid grid-cols-4 gap-3 mb-4">
            {currentCategories.map((category) => {
              const isSelected = formData.categoryName === category.name;
              
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.name)}
                  className={`flex flex-col items-center p-3 rounded-2xl transition-all duration-200 ${
                    isSelected
                      ? formData.type === 'debit'
                        ? 'bg-red-100 border-2 border-red-500'
                        : 'bg-green-100 border-2 border-green-500'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <div className={`p-2 rounded-full mb-2 ${
                    isSelected
                      ? formData.type === 'debit'
                        ? 'bg-red-500 text-white'
                        : 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    <span className="text-lg">{category.icon}</span>
                  </div>
                  <span className={`text-xs font-medium text-center ${
                    isSelected ? 'text-gray-800' : 'text-gray-600'
                  }`}>
                    {category.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Botão Mostrar mais campos */}
          <div className="flex justify-center mb-4">
            <button
              onClick={() => setShowExtraFields(!showExtraFields)}
              className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span className="text-sm font-medium">
                {showExtraFields ? 'Mostrar menos' : 'Mostrar mais'}
              </span>
              {showExtraFields ? (
                <ChevronUp size={16} className="transition-transform duration-300" />
              ) : (
                <ChevronDown size={16} className="transition-transform duration-300" />
              )}
            </button>
          </div>

          {errors.categoryName && (
            <p className="text-red-500 text-sm mb-4">{errors.categoryName}</p>
          )}
        </div>

        {/* Campos adicionais */}
        {showExtraFields && (
          <div className="px-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
            {/* Data */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
              <div className="flex items-center bg-gray-50 rounded-2xl p-4 border-2 border-gray-200 focus-within:border-blue-500 transition-colors">
                <input
                  type="text"
                  placeholder="DD/MM/AAAA"
                  value={formData.date}
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
                      setFormData(prev => ({ ...prev, date: formattedValue }));
                    }
                  }}
                  className="flex-1 bg-transparent text-gray-800 outline-none"
                  maxLength={10}
                />
                <Calendar size={20} className="text-gray-400" />
              </div>
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date}</p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-200 focus-within:border-blue-500 transition-colors">
                {/* Tags existentes */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.tags.map((tag, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        <span>{tag}</span>
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 hover:text-blue-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Input para nova tag */}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={formData.newTag}
                    onChange={(e) => setFormData(prev => ({ ...prev, newTag: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder="Adicionar tag..."
                    className="flex-1 bg-transparent text-gray-800 placeholder-gray-400 outline-none"
                  />
                  <button
                    onClick={handleAddTag}
                    className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full hover:bg-blue-600 transition-colors"
                  >
                    <Plus size={16} className="text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Obs</label>
              <div className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-200 focus-within:border-blue-500 transition-colors">
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Opcional"
                  className="w-full bg-transparent text-gray-800 placeholder-gray-400 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Botões de ação */}
        <div className="p-6 pt-8">
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex-1 py-4 rounded-2xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              loading={loading}
              className={`flex-1 py-4 rounded-2xl font-medium text-white transition-colors ${
                formData.type === 'debit'
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              Salvar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TransactionScreen;