import { useState, useEffect } from 'react';
import { 
  Modal, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button, 
  Input, 
  Select,
  useToast 
} from './ui';
import { useCategories } from '../hooks/useCategories';
import { useApp } from '../context/AppContext';
import { Transaction } from '../types';

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  isOpen,
  onClose,
  transaction
}) => {
  const { categories } = useCategories();
  const { updateTransaction } = useApp();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category_name: '',
    type: 'debit' as 'credit' | 'debit',
    date: ''
  });

  const [loading, setLoading] = useState(false);

  // Preencher o formulário quando a transação for carregada
  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: Math.abs(transaction.amount).toString(),
        description: transaction.description || '',
        category_name: transaction.category_name || '',
        type: transaction.type,
        date: transaction.date.split('T')[0] // Converter para formato YYYY-MM-DD
      });
    }
  }, [transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transaction) return;

    setLoading(true);
    
    try {
      const amount = parseFloat(formData.amount);
      
      if (isNaN(amount) || amount <= 0) {
        showToast('Por favor, insira um valor válido', 'error');
        return;
      }

      await updateTransaction(transaction.id, {
        amount: formData.type === 'debit' ? -Math.abs(amount) : Math.abs(amount),
        description: formData.description,
        category_name: formData.category_name,
        type: formData.type,
        date: formData.date
      });

      showToast('Transação atualizada com sucesso!', 'success');
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      showToast('Erro ao atualizar transação', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      amount: '',
      description: '',
      category_name: '',
      type: 'debit',
      date: ''
    });
    onClose();
  };

  const typeOptions = [
    { value: 'debit', label: 'Despesa' },
    { value: 'credit', label: 'Receita' }
  ];

  const categoryOptions = categories.map(category => ({
    value: category.name,
    label: `${category.icon} ${category.name}`
  }));

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          <h2 className="text-xl font-bold text-gray-800">Editar Transação</h2>
        </ModalHeader>
        
        <ModalBody>
          <div className="space-y-4">
            {/* Tipo */}
            <Select
              label="Tipo"
              value={formData.type}
              onChange={(value) => setFormData(prev => ({ ...prev, type: value as 'credit' | 'debit' }))}
              options={typeOptions}
              required
            />

            {/* Valor */}
            <Input
              label="Valor"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0,00"
              required
            />

            {/* Categoria */}
            <Select
              label="Categoria"
              value={formData.category_name}
              onChange={(value) => setFormData(prev => ({ ...prev, category_name: value }))}
              options={categoryOptions}
              placeholder="Selecione uma categoria"
              required
            />

            {/* Descrição */}
            <Input
              label="Descrição"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição da transação"
              required
            />

            {/* Data */}
            <Input
              label="Data"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>
        </ModalBody>
        
        <ModalFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default EditTransactionModal;