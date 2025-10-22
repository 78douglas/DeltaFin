import { useState } from 'react';
import { 
  X, 
  Check,
  Home,
  Car,
  ShoppingCart,
  Heart,
  GraduationCap,
  Coffee,
  Gamepad2,
  CreditCard,
  Wallet,
  PiggyBank,
  TrendingUp,
  Gift,
  Briefcase,
  ShoppingBag,
  Users,
  Calendar,
  DollarSign,
  MoreHorizontal,
  Tag,
  Palette,
  Smartphone,
  Plane,
  Music,
  Camera,
  Book,
  Utensils,
  Fuel,
  Zap
} from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { useToast } from '../components/ui';
import { 
  Modal, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  Button,
  Input,
  Select
} from '../components/ui';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Ícones disponíveis para categorias
const availableIcons = [
  { name: 'Home', icon: Home, value: 'home' },
  { name: 'Carro', icon: Car, value: 'car' },
  { name: 'Compras', icon: ShoppingCart, value: 'shopping-cart' },
  { name: 'Saúde', icon: Heart, value: 'heart' },
  { name: 'Educação', icon: GraduationCap, value: 'graduation-cap' },
  { name: 'Café', icon: Coffee, value: 'coffee' },
  { name: 'Jogos', icon: Gamepad2, value: 'gamepad-2' },
  { name: 'Cartão', icon: CreditCard, value: 'credit-card' },
  { name: 'Carteira', icon: Wallet, value: 'wallet' },
  { name: 'Poupança', icon: PiggyBank, value: 'piggy-bank' },
  { name: 'Investimento', icon: TrendingUp, value: 'trending-up' },
  { name: 'Presente', icon: Gift, value: 'gift' },
  { name: 'Trabalho', icon: Briefcase, value: 'briefcase' },
  { name: 'Loja', icon: ShoppingBag, value: 'shopping-bag' },
  { name: 'Pessoas', icon: Users, value: 'users' },
  { name: 'Calendário', icon: Calendar, value: 'calendar' },
  { name: 'Dinheiro', icon: DollarSign, value: 'dollar-sign' },
  { name: 'Celular', icon: Smartphone, value: 'smartphone' },
  { name: 'Viagem', icon: Plane, value: 'plane' },
  { name: 'Música', icon: Music, value: 'music' },
  { name: 'Foto', icon: Camera, value: 'camera' },
  { name: 'Livro', icon: Book, value: 'book' },
  { name: 'Comida', icon: Utensils, value: 'utensils' },
  { name: 'Combustível', icon: Fuel, value: 'fuel' },
  { name: 'Energia', icon: Zap, value: 'zap' },
  { name: 'Tag', icon: Tag, value: 'tag' },
  { name: 'Outros', icon: MoreHorizontal, value: 'more-horizontal' }
];

// Cores predefinidas
const predefinedColors = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#14B8A6', // Teal
  '#F43F5E', // Rose
  '#A855F7', // Violet
  '#22C55E', // Green-500
  '#EAB308', // Yellow-500
  '#DC2626'  // Red-600
];

const AddCategoryModal = ({ isOpen, onClose }: AddCategoryModalProps) => {
  const { createCategory, loading } = useCategories();
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    icon: 'tag',
    color: '#3B82F6',
    type: 'debit' as 'credit' | 'debit',
    description: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedIconIndex, setSelectedIconIndex] = useState(25); // Tag como padrão

  // Validação do formulário
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome da categoria é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Nome deve ter no máximo 50 caracteres';
    }

    if (!formData.type) {
      newErrors.type = 'Tipo da categoria é obrigatório';
    }

    if (!formData.color) {
      newErrors.color = 'Cor da categoria é obrigatória';
    }

    if (!formData.icon) {
      newErrors.icon = 'Ícone da categoria é obrigatório';
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'Descrição deve ter no máximo 200 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submeter formulário
  const handleSubmit = async () => {
    if (!validateForm()) {
      error('Erro de validação', 'Por favor, corrija os campos destacados');
      return;
    }

    try {
      await createCategory({
        name: formData.name.trim(),
        type: formData.type,
        icon: formData.icon,
        is_default: false,
        description: formData.description.trim() || undefined,
        created_at: new Date().toISOString()
      });

      success('Categoria criada!', `Categoria "${formData.name}" criada com sucesso`);
      handleClose();
    } catch (err) {
      console.error('Erro ao criar categoria:', err);
      error('Erro ao criar categoria', 'Tente novamente em alguns instantes');
    }
  };

  // Fechar modal e resetar formulário
  const handleClose = () => {
    setFormData({
      name: '',
      icon: 'tag',
      color: '#3B82F6',
      type: 'debit',
      description: ''
    });
    setErrors({});
    setSelectedIconIndex(25);
    onClose();
  };

  // Selecionar ícone
  const handleIconSelect = (iconValue: string, index: number) => {
    setFormData(prev => ({ ...prev, icon: iconValue }));
    setSelectedIconIndex(index);
    if (errors.icon) {
      setErrors(prev => ({ ...prev, icon: '' }));
    }
  };

  // Selecionar cor
  const handleColorSelect = (color: string) => {
    setFormData(prev => ({ ...prev, color }));
    if (errors.color) {
      setErrors(prev => ({ ...prev, color: '' }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      closeOnOverlayClick={false}
    >
      <ModalHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Nova Categoria</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
      </ModalHeader>

      <ModalBody>
        <div className="space-y-6">
          {/* Nome da categoria */}
          <Input
            label="Nome da Categoria"
            value={formData.name}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, name: e.target.value }));
              if (errors.name) {
                setErrors(prev => ({ ...prev, name: '' }));
              }
            }}
            placeholder="Ex: Alimentação, Transporte..."
            error={errors.name}
            required
            maxLength={50}
          />

          {/* Tipo da categoria */}
          <Select
            label="Tipo da Categoria"
            value={formData.type}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, type: e.target.value as 'credit' | 'debit' }));
              if (errors.type) {
                setErrors(prev => ({ ...prev, type: '' }));
              }
            }}
            error={errors.type}
            required
            options={[
              { value: 'debit', label: '💸 Despesa' },
              { value: 'credit', label: '💰 Receita' }
            ]}
          />

          {/* Seletor de ícones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Ícone da Categoria <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-7 gap-2 p-4 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
              {availableIcons.map((iconItem, index) => {
                const IconComponent = iconItem.icon;
                const isSelected = selectedIconIndex === index;
                
                return (
                  <button
                    key={iconItem.value}
                    type="button"
                    onClick={() => handleIconSelect(iconItem.value, index)}
                    className={`flex flex-col items-center p-3 rounded-lg transition-all duration-200 hover:bg-gray-50 ${
                      isSelected 
                        ? 'bg-blue-100 border-2 border-blue-500 text-blue-600' 
                        : 'border-2 border-transparent text-gray-600'
                    }`}
                    title={iconItem.name}
                  >
                    <IconComponent size={20} />
                    <span className="text-xs mt-1 text-center leading-tight">
                      {iconItem.name}
                    </span>
                    {isSelected && (
                      <div className="absolute top-1 right-1">
                        <Check size={12} className="text-blue-600" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {errors.icon && (
              <p className="text-red-500 text-sm mt-1">{errors.icon}</p>
            )}
          </div>

          {/* Seletor de cores */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Cor da Categoria <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              {/* Cores predefinidas */}
              <div className="grid grid-cols-8 gap-2">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorSelect(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                      formData.color === color 
                        ? 'border-gray-800 scale-110 shadow-lg' 
                        : 'border-gray-300 hover:border-gray-500'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  >
                    {formData.color === color && (
                      <Check size={16} className="text-white mx-auto" />
                    )}
                  </button>
                ))}
              </div>
              
              {/* Seletor de cor personalizada */}
              <div className="flex items-center space-x-3">
                <Palette size={20} className="text-gray-400" />
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) => handleColorSelect(e.target.value)}
                  className="w-20 h-10 p-1 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-600">Cor personalizada</span>
              </div>
            </div>
            {errors.color && (
              <p className="text-red-500 text-sm mt-1">{errors.color}</p>
            )}
          </div>

          {/* Descrição */}
          <Input
            label="Descrição (opcional)"
            value={formData.description}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, description: e.target.value }));
              if (errors.description) {
                setErrors(prev => ({ ...prev, description: '' }));
              }
            }}
            placeholder="Descreva a categoria para facilitar a identificação..."
            error={errors.description}
            maxLength={200}
            helperText={`${formData.description.length}/200 caracteres`}
          />

          {/* Preview da categoria */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview da Categoria</h4>
            <div className="flex items-center space-x-3">
              <div 
                className="p-3 rounded-full"
                style={{ backgroundColor: formData.color + '20', color: formData.color }}
              >
                {(() => {
                  const selectedIcon = availableIcons.find(icon => icon.value === formData.icon);
                  const IconComponent = selectedIcon?.icon || Tag;
                  return <IconComponent size={24} />;
                })()}
              </div>
              <div>
                <h5 className="font-medium text-gray-800">
                  {formData.name || 'Nome da categoria'}
                </h5>
                <p className="text-sm text-gray-600">
                  {formData.type === 'credit' ? '💰 Receita' : '💸 Despesa'}
                </p>
                {formData.description && (
                  <p className="text-xs text-gray-500 mt-1">{formData.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button
          variant="ghost"
          onClick={handleClose}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          loading={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Criar Categoria
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddCategoryModal;