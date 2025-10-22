import { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  GripVertical,
  Save,
  X
} from 'lucide-react';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select
} from '../components/ui';
import { useCategories } from '../hooks/useCategories';
import { Category } from '../types';



interface CategoryFormData {
  name: string;
  icon: string;
  type: 'credit' | 'debit';
}

const CategoriesManagementScreen = ({ onBack }: { onBack: () => void }) => {
  const { 
    creditCategories, 
    debitCategories, 
    createCategory, 
    updateCategory, 
    deleteCategory,
    loadCategories 
  } = useCategories();

  const [activeTab, setActiveTab] = useState<'credit' | 'debit'>('debit');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    icon: '📝',
    type: 'debit'
  });
  const [draggedItem, setDraggedItem] = useState<Category | null>(null);

  const commonIcons = [
    '🍽️', '🏠', '🎮', '🏥', '🚗', '📚', '💳', '💸',
    '💰', '💻', '🎁', '🛒', '💵', '📈', '🎯', '⚡',
    '🛍️', '📱', '✈️', '🎬', '☕', '🏋️', '📄', '🔧'
  ];

  const categories = useMemo(() => {
    const currentCategories = activeTab === 'credit' ? creditCategories : debitCategories;
    return currentCategories.slice().sort((a, b) => a.order - b.order);
  }, [activeTab, creditCategories, debitCategories]);

  const handleCreateCategory = async () => {
    try {
      const maxOrder = Math.max(...categories.map(c => c.order), 0);
      await createCategory({
        ...formData,
        order: maxOrder + 1,
        is_default: false,
        created_at: new Date().toISOString()
      });
      await loadCategories();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    
    try {
      await updateCategory(editingCategory.id, formData);
      await loadCategories();
      setShowModal(false);
      setEditingCategory(null);
      resetForm();
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      try {
        await deleteCategory(categoryId);
        await loadCategories();
      } catch (error) {
        console.error('Erro ao excluir categoria:', error);
      }
    }
  };

  const handleReorderCategories = async (newOrder: Category[]) => {
    try {
      const updates = newOrder.map((category, index) => ({
        id: category.id,
        order: index + 1
      }));

      for (const update of updates) {
        await updateCategory(update.id, { order: update.order });
      }
      
      await loadCategories();
    } catch (error) {
      console.error('Erro ao reordenar categorias:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      icon: '📝',
      type: activeTab
    });
  };

  const openCreateModal = () => {
    resetForm();
    setFormData(prev => ({ ...prev, type: activeTab }));
    setEditingCategory(null);
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setFormData({
      name: category.name,
      icon: category.icon,
      type: category.type
    });
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleDragStart = (e: React.DragEvent, category: Category) => {
    setDraggedItem(category);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetCategory: Category) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem.id === targetCategory.id) {
      setDraggedItem(null);
      return;
    }

    const newCategories = [...categories];
    const draggedIndex = newCategories.findIndex(c => c.id === draggedItem.id);
    const targetIndex = newCategories.findIndex(c => c.id === targetCategory.id);

    // Remove o item arrastado e insere na nova posição
    const [removed] = newCategories.splice(draggedIndex, 1);
    newCategories.splice(targetIndex, 0, removed);

    handleReorderCategories(newCategories);
    setDraggedItem(null);
  };

  return (
    <div className="p-4 space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="flex items-center space-x-2"
        >
          <ArrowLeft size={16} />
          <span>Voltar</span>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gerenciar Categorias</h1>
          <p className="text-gray-600">Organize suas categorias de transações</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('debit')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'debit'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Despesas
        </button>
        <button
          onClick={() => setActiveTab('credit')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'credit'
              ? 'bg-white text-green-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Receitas
        </button>
      </div>

      {/* Add Category Button */}
      <Button
        onClick={openCreateModal}
        className="w-full flex items-center justify-center space-x-2"
      >
        <Plus size={20} />
        <span>Adicionar Categoria</span>
      </Button>

      {/* Categories List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === 'credit' ? 'Categorias de Receita' : 'Categorias de Despesa'}
          </CardTitle>
          <p className="text-sm text-gray-600">
            Arraste para reordenar • {categories.length} categorias
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                draggable
                onDragStart={(e) => handleDragStart(e, category)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, category)}
                className={`flex items-center space-x-4 p-4 rounded-lg border transition-all cursor-move ${
                  draggedItem?.id === category.id
                    ? 'opacity-50 scale-95'
                    : 'hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <GripVertical size={20} className="text-gray-400" />
                
                <div className="flex items-center space-x-3 flex-1">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <h3 className="font-medium text-gray-800">{category.name}</h3>
                    {category.is_default && (
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        Padrão
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(category)}
                    className="p-2"
                  >
                    <Edit size={16} />
                  </Button>
                  
                  {!category.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-2 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {categories.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhuma categoria encontrada</p>
                <p className="text-sm">Adicione uma nova categoria para começar</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Criação/Edição */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCategory(null);
          resetForm();
        }}
        size="md"
      >
        <ModalHeader>
          <h2 className="text-xl font-bold">
            {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
          </h2>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Categoria
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Alimentação"
                className="w-full"
              />
            </div>

            <div>
              <Select
                label="Tipo"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'credit' | 'debit' }))}
                options={[
                  { value: 'debit', label: 'Despesa' },
                  { value: 'credit', label: 'Receita' }
                ]}
                placeholder="Selecione o tipo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ícone
              </label>
              <div className="grid grid-cols-8 gap-2 p-4 border rounded-lg max-h-40 overflow-y-auto">
                {commonIcons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, icon }))}
                    className={`p-2 text-xl rounded hover:bg-gray-100 transition-colors ${
                      formData.icon === icon ? 'bg-blue-100 ring-2 ring-blue-500' : ''
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-sm text-gray-600">Selecionado:</span>
                <span className="text-2xl">{formData.icon}</span>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => {
              setShowModal(false);
              setEditingCategory(null);
              resetForm();
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
            disabled={!formData.name.trim()}
          >
            {editingCategory ? 'Salvar' : 'Criar'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default CategoriesManagementScreen;