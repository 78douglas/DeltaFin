import { useState } from 'react';
import { 
  Target, 
  Plus, 
  TrendingUp, 
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Trash2
} from 'lucide-react';
import { useGoals } from '../hooks/useGoals';
import { useToast } from '../components/ui';
import { 
  Button, 
  Input, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Modal, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  Badge,
  LoadingSpinner 
} from '../components/ui';
import { formatToBrazilian, brazilianToISO, isValidBrazilianDate } from '../lib/utils';

const GoalsScreen = () => {
  const { 
    goals, 
    createGoal, 
    updateGoal,
    addContribution,
    getGoalProgress,
    getGoalsByStatus,
    getTotalSaved,
    getTotalTarget,
    getOverallProgress,
    getGoalRecommendedContribution,
    loading 
  } = useGoals();
  
  const { success, error } = useToast();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  const [newGoal, setNewGoal] = useState({
    name: '',
    target_amount: '',
    target_date: '',
    description: ''
  });

  const [contribution, setContribution] = useState({
    amount: '',
    description: ''
  });

  const [editGoal, setEditGoal] = useState({
    name: '',
    target_amount: '',
    target_date: '',
    description: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return formatToBrazilian(new Date(dateString));
  };

  const validateGoalForm = (goalData = newGoal) => {
    const newErrors: Record<string, string> = {};

    if (!goalData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!goalData.target_amount || parseFloat(goalData.target_amount) <= 0) {
      newErrors.target_amount = 'Meta deve ser maior que zero';
    }

    if (!goalData.target_date) {
      newErrors.target_date = 'Data é obrigatória';
    } else if (!isValidBrazilianDate(goalData.target_date)) {
      newErrors.target_date = 'Data deve estar no formato DD/MM/AAAA';
    } else {
      const isoDate = brazilianToISO(goalData.target_date);
      if (isoDate) {
        const targetDate = new Date(isoDate);
        const today = new Date();
        if (targetDate <= today) {
          newErrors.target_date = 'Data deve ser futura';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateContributionForm = () => {
    const newErrors: Record<string, string> = {};

    if (!contribution.amount || parseFloat(contribution.amount) <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateGoal = async () => {
    if (!validateGoalForm()) {
      error('Erro de validação', 'Por favor, corrija os campos destacados');
      return;
    }

    try {
      await createGoal({
        name: newGoal.name.trim(),
        target_amount: parseFloat(newGoal.target_amount),
        target_date: brazilianToISO(newGoal.target_date) || newGoal.target_date,
        description: newGoal.description.trim() || undefined
      });

      success('Meta criada!', `Meta "${newGoal.name}" criada com sucesso`);
      setShowCreateModal(false);
      setNewGoal({ name: '', target_amount: '', target_date: '', description: '' });
      setErrors({});
    } catch (err) {
      console.error('Erro ao criar meta:', err);
      error('Erro ao criar meta', 'Tente novamente em alguns instantes');
    }
  };

  const handleEditGoal = async () => {
    if (!selectedGoalId || !validateGoalForm(editGoal)) {
      error('Erro de validação', 'Por favor, corrija os campos destacados');
      return;
    }

    try {
      await updateGoal(selectedGoalId, {
        name: editGoal.name.trim(),
        target_amount: parseFloat(editGoal.target_amount),
        target_date: brazilianToISO(editGoal.target_date) || editGoal.target_date,
        description: editGoal.description.trim() || undefined
      });

      success('Meta atualizada!', `Meta "${editGoal.name}" foi atualizada com sucesso`);
      setShowEditModal(false);
      setSelectedGoalId(null);
      setEditGoal({ name: '', target_amount: '', target_date: '', description: '' });
      setErrors({});
    } catch (err) {
      console.error('Erro ao atualizar meta:', err);
      error('Erro ao atualizar meta', 'Tente novamente em alguns instantes');
    }
  };

  const handleAddContribution = async () => {
    if (!selectedGoalId || !validateContributionForm()) {
      error('Erro de validação', 'Por favor, corrija os campos destacados');
      return;
    }

    try {
      await addContribution(selectedGoalId, {
        amount: parseFloat(contribution.amount),
        description: contribution.description.trim() || undefined
      });

      success('Contribuição adicionada!', `R$ ${parseFloat(contribution.amount).toFixed(2)} adicionado à meta`);
      setShowContributionModal(false);
      setSelectedGoalId(null);
      setContribution({ amount: '', description: '' });
      setErrors({});
    } catch (err) {
      console.error('Erro ao adicionar contribuição:', err);
      error('Erro ao adicionar contribuição', 'Tente novamente em alguns instantes');
    }
  };

  const openContributionModal = (goalId: string) => {
    setSelectedGoalId(goalId);
    setShowContributionModal(true);
  };

  const handleEdit = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      setSelectedGoalId(goalId);
      setEditGoal({
        name: goal.name,
        target_amount: goal.target_amount.toString(),
        target_date: formatToBrazilian(new Date(goal.target_date)),
        description: goal.description || ''
      });
      setShowEditModal(true);
      setErrors({});
    }
  };

  const handleDelete = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal && window.confirm(`Tem certeza que deseja excluir a meta "${goal.name}"?`)) {
      // TODO: Implementar exclusão de meta
      console.log('Excluir meta:', goalId);
      success('Funcionalidade em desenvolvimento', 'A exclusão de metas será implementada em breve');
    }
  };

  const getStatusBadge = (goal: any) => {
    const progress = getGoalProgress(goal);
    
    if (progress.percentage >= 100) {
      return <Badge variant="success" size="sm">Concluída</Badge>;
    }
    
    const today = new Date();
    const targetDate = new Date(goal.target_date);
    
    if (targetDate < today) {
      return <Badge variant="danger" size="sm">Vencida</Badge>;
    }
    
    if (progress.percentage > 0) {
      return <Badge variant="warning" size="sm">Em Progresso</Badge>;
    }
    
    return <Badge variant="outline" size="sm">Não Iniciada</Badge>;
  };

  const getStatusIcon = (goal: any) => {
    const progress = getGoalProgress(goal);
    
    if (progress.percentage >= 100) {
      return <CheckCircle className="text-green-600" size={20} />;
    }
    
    const today = new Date();
    const targetDate = new Date(goal.target_date);
    
    if (targetDate < today) {
      return <AlertCircle className="text-red-600" size={20} />;
    }
    
    return <Clock className="text-blue-600" size={20} />;
  };

  // Estatísticas gerais
  const totalSaved = getTotalSaved();
  const totalTarget = getTotalTarget();
  const overallProgress = getOverallProgress();

  // Metas por status
  const goalsByStatus = getGoalsByStatus();
  const completedGoals = goalsByStatus.completed;
  const inProgressGoals = goalsByStatus.inProgress;
  const notStartedGoals = goalsByStatus.notStarted;

  if (loading) {
    return (
      <div className="p-4">
        <LoadingSpinner fullScreen text="Carregando metas..." />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Metas de Poupança</h1>
          <p className="text-gray-600">Defina e acompanhe seus objetivos financeiros</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center space-x-2 w-full sm:w-auto"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Nova Meta</span>
          <span className="sm:hidden">Nova</span>
        </Button>
      </div>

      {/* Card Principal de Progresso Geral */}
      <Card className="bg-white shadow-sm border border-gray-200 rounded-xl">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Progresso Geral</h3>
          
          {/* Barra de Progresso */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-600">
                {overallProgress.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(overallProgress, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Total Poupado e Meta Total */}
          <div className="grid grid-cols-2 gap-4">
            {/* Total Poupado */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Target className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Poupado</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(totalSaved)}
                </p>
              </div>
            </div>

            {/* Meta Total */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Meta Total</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(totalTarget)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card de Estatísticas */}
      <Card className="bg-white shadow-sm border border-gray-200 rounded-xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Concluídas */}
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <p className="text-3xl font-bold text-green-600 mb-1">{completedGoals.length}</p>
              <p className="text-sm text-gray-500">Concluídas</p>
            </div>

            {/* Em Progresso */}
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="text-blue-600" size={24} />
              </div>
              <p className="text-3xl font-bold text-blue-600 mb-1">{inProgressGoals.length}</p>
              <p className="text-sm text-gray-500">Em Progresso</p>
            </div>

            {/* Não Iniciadas */}
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="text-gray-600" size={24} />
              </div>
              <p className="text-3xl font-bold text-gray-600 mb-1">{notStartedGoals.length}</p>
              <p className="text-sm text-gray-500">Não Iniciadas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Metas */}
      <Card>
        <CardHeader>
          <CardTitle>Suas Metas ({goals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <div className="text-center py-12">
              <Target size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">Nenhuma meta criada ainda</p>
              <Button onClick={() => setShowCreateModal(true)}>
                Criar primeira meta
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => {
                const progress = getGoalProgress(goal);
                const recommendedContribution = getGoalRecommendedContribution(goal, 12);
                
                return (
                  <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(goal)}
                        <div>
                          <h3 className="font-semibold text-gray-800">{goal.name}</h3>
                          {goal.description && (
                            <p className="text-sm text-gray-600">{goal.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-wrap">
                        {getStatusBadge(goal)}
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openContributionModal(goal.id)}
                            disabled={progress.percentage >= 100}
                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                          >
                            Contribuir
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(goal.id)}
                            className="text-blue-600 border-blue-600 hover:bg-blue-50 p-2"
                            title="Editar meta"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(goal.id)}
                            className="text-red-600 border-red-600 hover:bg-red-50 p-2"
                            title="Excluir meta"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progresso: {progress.percentage.toFixed(1)}%</span>
                        <span>
                          {formatCurrency(progress.saved)} / {formatCurrency(goal.target_amount)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            progress.percentage >= 100 
                              ? 'bg-green-500' 
                              : progress.percentage > 0 
                                ? 'bg-blue-500' 
                                : 'bg-gray-300'
                          }`}
                          style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Informações Adicionais */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-gray-600">
                          Meta: {formatDate(goal.target_date)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <DollarSign size={16} className="text-gray-400" />
                        <span className="text-gray-600">
                          Faltam: {formatCurrency(progress.remaining)}
                        </span>
                      </div>
                      
                      {recommendedContribution > 0 && (
                        <div className="flex items-center space-x-2">
                          <TrendingUp size={16} className="text-gray-400" />
                          <span className="text-gray-600">
                            Sugestão mensal: {formatCurrency(recommendedContribution)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Criar Meta */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewGoal({ name: '', target_amount: '', target_date: '', description: '' });
          setErrors({});
        }}
        title="Nova Meta de Poupança"
        size="md"
      >
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Nome da Meta"
              value={newGoal.name}
              onChange={(e) => setNewGoal(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Viagem para Europa"
              error={errors.name}
              required
            />

            <Input
              label="Valor da Meta"
              type="number"
              step="0.01"
              min="0"
              value={newGoal.target_amount}
              onChange={(e) => setNewGoal(prev => ({ ...prev, target_amount: e.target.value }))}
              placeholder="0,00"
              error={errors.target_amount}
              required
              leftIcon={<span className="text-gray-500">R$</span>}
            />

            <Input
              label="Data Limite"
              type="text"
              placeholder="DD/MM/AAAA"
              value={newGoal.target_date}
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
                  setNewGoal(prev => ({ ...prev, target_date: formattedValue }));
                }
              }}
              error={errors.target_date}
              required
              leftIcon={<Calendar size={20} className="text-gray-400" />}
              maxLength={10}
            />

            <Input
              label="Descrição (opcional)"
              value={newGoal.description}
              onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva sua meta..."
              helperText="Uma descrição pode ajudar a manter o foco no objetivo"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setShowCreateModal(false);
              setNewGoal({ name: '', target_amount: '', target_date: '', description: '' });
              setErrors({});
            }}
          >
            Cancelar
          </Button>
          <Button onClick={handleCreateGoal} loading={loading}>
            Criar Meta
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal Editar Meta */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedGoalId(null);
          setEditGoal({ name: '', target_amount: '', target_date: '', description: '' });
          setErrors({});
        }}
        title="Editar Meta de Poupança"
        size="md"
      >
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Nome da Meta"
              value={editGoal.name}
              onChange={(e) => setEditGoal(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Viagem para Europa"
              error={errors.name}
              required
            />

            <Input
              label="Valor da Meta"
              type="number"
              step="0.01"
              min="0"
              value={editGoal.target_amount}
              onChange={(e) => setEditGoal(prev => ({ ...prev, target_amount: e.target.value }))}
              placeholder="0,00"
              error={errors.target_amount}
              required
              leftIcon={<span className="text-gray-500">R$</span>}
            />

            <Input
              label="Data Limite"
              type="text"
              placeholder="DD/MM/AAAA"
              value={editGoal.target_date}
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
                  setEditGoal(prev => ({ ...prev, target_date: formattedValue }));
                }
              }}
              error={errors.target_date}
              required
              leftIcon={<Calendar size={20} className="text-gray-400" />}
              maxLength={10}
            />

            <Input
              label="Descrição (opcional)"
              value={editGoal.description}
              onChange={(e) => setEditGoal(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva sua meta..."
              helperText="Uma descrição pode ajudar a manter o foco no objetivo"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setShowEditModal(false);
              setSelectedGoalId(null);
              setEditGoal({ name: '', target_amount: '', target_date: '', description: '' });
              setErrors({});
            }}
          >
            Cancelar
          </Button>
          <Button onClick={handleEditGoal} loading={loading}>
            Salvar Alterações
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal Adicionar Contribuição */}
      <Modal
        isOpen={showContributionModal}
        onClose={() => {
          setShowContributionModal(false);
          setSelectedGoalId(null);
          setContribution({ amount: '', description: '' });
          setErrors({});
        }}
        title="Adicionar Contribuição"
        size="md"
      >
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Valor da Contribuição"
              type="number"
              step="0.01"
              min="0"
              value={contribution.amount}
              onChange={(e) => setContribution(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0,00"
              error={errors.amount}
              required
              leftIcon={<span className="text-gray-500">R$</span>}
            />

            <Input
              label="Descrição (opcional)"
              value={contribution.description}
              onChange={(e) => setContribution(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Ex: Economia do mês de janeiro"
              helperText="Adicione uma nota sobre esta contribuição"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setShowContributionModal(false);
              setSelectedGoalId(null);
              setContribution({ amount: '', description: '' });
              setErrors({});
            }}
          >
            Cancelar
          </Button>
          <Button onClick={handleAddContribution} loading={loading}>
            Adicionar Contribuição
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default GoalsScreen;