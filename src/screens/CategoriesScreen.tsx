import { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Tag,
  Palette
} from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { useToast } from '../components/ui';
import { 
  Button, 
  Input, 
  Select, 
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
import ConfirmModal from '../components/ui/ConfirmModal';
import AddCategoryModal from '../components/AddCategoryModal';

const CategoriesScreen = () => {
  const { 
    categories, 
    createCategory, 
    updateCategory, 
    deleteCategory,
    getCategoryStats,
    loading 
  } = useCategories();
  
  const { success, error } = useToast();

  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    type: 'debit' as 'credit' | 'debit',
    description: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});



  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!categoryForm.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!categoryForm.type) {
      newErrors.type = 'Tipo é obrigatório';
    }



    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateCategory = async () => {
    if (!validateForm()) {
      error('Erro de validação', 'Por favor, corrija os campos destacados');
      return;
    }

    try {
      await createCategory({
        name: categoryForm.name.trim(),
        type: categoryForm.type,
        icon: 'tag',
        is_default: false,
        description: categoryForm.description.trim() || undefined,
        created_at: new Date().toISOString()
      });

      success('Categoria criada!', `Categoria "${categoryForm.name}" criada com sucesso`);
      setShowAddCategoryModal(false);
      resetForm();
    } catch (err) {
      console.error('Erro ao criar categoria:', err);
      error('Erro ao criar categoria', 'Tente novamente em alguns instantes');
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory || !validateForm()) {
      error('Erro de validação', 'Por favor, corrija os campos destacados');
      return;
    }

    try {
      await updateCategory(selectedCategory.id, {
        name: categoryForm.name.trim(),
        type: categoryForm.type,
        description: categoryForm.description.trim() || undefined
      });

      success('Categoria atualizada!', `Categoria "${categoryForm.name}" atualizada com sucesso`);
      setShowEditModal(false);
      setSelectedCategory(null);
      resetForm();
    } catch (err) {
      console.error('Erro ao atualizar categoria:', err);
      error('Erro ao atualizar categoria', 'Tente novamente em alguns instantes');
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;

    try {
      await deleteCategory(selectedCategory.id);
      success('Categoria excluída!', `Categoria "${selectedCategory.name}" excluída com sucesso`);
      setShowDeleteModal(false);
      setSelectedCategory(null);
    } catch (err) {
      console.error('Erro ao excluir categoria:', err);
      error('Erro ao excluir categoria', 'Tente novamente em alguns instantes');
    }
  };

  const openCreateModal = () => {
    setShowAddCategoryModal(true);
  };

  const openEditModal = (category: any) => {
    setSelectedCategory(category);
    setCategoryForm({
      name: category.name,
      type: category.type,
      description: category.description || ''
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (category: any) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setCategoryForm({
      name: '',
      type: 'debit',
      description: ''
    });
    setErrors({});
  };

  // Estatísticas das categorias
  const incomeCategories = categories.filter(cat => cat.type === 'credit');
  const expenseCategories = categories.filter(cat => cat.type === 'debit');

  // Calcular totais
  const totalIncomeCategories = incomeCategories.length;
  const totalExpenseCategories = expenseCategories.length;

  if (loading) {
    return (
      <div className="p-4">
        <LoadingSpinner fullScreen text="Carregando categorias..." />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categorias</h1>
          <p className="text-gray-600">Organize suas transações por categorias</p>
        </div>
        <Button
          onClick={openCreateModal}
          className="flex items-center justify-center space-x-2 w-full sm:w-auto"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Nova Categoria</span>
          <span className="sm:hidden">Nova</span>
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center space-x-4 py-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Tag className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Categorias</p>
              <p className="text-xl font-bold text-blue-600">
                {categories.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center space-x-4 py-4">
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Receitas</p>
              <p className="text-xl font-bold text-green-600">
                {totalIncomeCategories}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center space-x-4 py-4">
            <div className="p-3 bg-red-100 rounded-full">
              <TrendingDown className="text-red-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Despesas</p>
              <p className="text-xl font-bold text-red-600">
                {totalExpenseCategories}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Categorias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categorias de Receita */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="text-green-600" size={20} />
              <span>Receitas ({totalIncomeCategories})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {incomeCategories.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500 text-sm">Nenhuma categoria de receita</p>
              </div>
            ) : (
              <div className="space-y-3">
                {incomeCategories.map((category) => {
                  const stats = getCategoryStats(category.id);
                  
                  return (
                    <div key={category.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: '#3B82F6' }}
                        />
                        <div>
                          <h4 className="font-medium text-gray-800">{category.name}</h4>
                          {category.description && (
                            <p className="text-xs text-gray-500">{category.description}</p>
                          )}
                          <div className="flex items-center space-x-4 text-xs text-gray-600 mt-1">
                            <span>{stats.transactionCount} transações</span>
                            <span>{formatCurrency(stats.total)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="success" size="sm">Receita</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(category)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteModal(category)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Categorias de Despesa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingDown className="text-red-600" size={20} />
              <span>Despesas ({totalExpenseCategories})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expenseCategories.length === 0 ? (
              <div className="text-center py-8">
                <TrendingDown size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500 text-sm">Nenhuma categoria de despesa</p>
              </div>
            ) : (
              <div className="space-y-3">
                {expenseCategories.map((category) => {
                  const stats = getCategoryStats(category.id);
                  
                  return (
                    <div key={category.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: '#10B981' }}
                        />
                        <div>
                          <h4 className="font-medium text-gray-800">{category.name}</h4>
                          {category.description && (
                            <p className="text-xs text-gray-500">{category.description}</p>
                          )}
                          <div className="flex items-center space-x-4 text-xs text-gray-600 mt-1">
                            <span>{stats.transactionCount} transações</span>
                            <span>{formatCurrency(stats.total)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="danger" size="sm">Despesa</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(category)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteModal(category)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal Adicionar Categoria */}
      <AddCategoryModal
        isOpen={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
      />

      {/* Modal Editar Categoria */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCategory(null);
          resetForm();
        }}
        title="Editar Categoria"
        size="md"
      >
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Nome da Categoria"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Alimentação"
              error={errors.name}
              required
            />

            <Select
              label="Tipo"
              value={categoryForm.type}
              onChange={(e) => setCategoryForm(prev => ({ ...prev, type: e.target.value as 'credit' | 'debit' }))}
              error={errors.type}
              required
              options={[
                { value: 'credit', label: 'Receita' },
                { value: 'debit', label: 'Despesa' }
              ]}
            />



            <Input
              label="Descrição (opcional)"
              value={categoryForm.description}
              onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva a categoria..."
              helperText="Uma descrição pode ajudar a identificar melhor a categoria"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setShowEditModal(false);
              setSelectedCategory(null);
              resetForm();
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleUpdateCategory} 
            loading={loading}
          >
            Atualizar Categoria
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal Confirmar Exclusão */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCategory(null);
        }}
        onConfirm={handleDeleteCategory}
        title="Excluir Categoria"
        description={`Tem certeza que deseja excluir a categoria "${selectedCategory?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        variant="danger"
        loading={loading}
      />
    </div>
  );
};

export default CategoriesScreen;