import { useState } from 'react';
import { 
  Modal, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button,
  useToast 
} from './ui';
import { useApp } from '../context/AppContext';
import { Transaction } from '../types';
import { Trash2, AlertTriangle } from 'lucide-react';

interface DeleteTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

const DeleteTransactionModal: React.FC<DeleteTransactionModalProps> = ({
  isOpen,
  onClose,
  transaction
}) => {
  const { deleteTransaction } = useApp();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!transaction) return;

    setLoading(true);
    
    try {
      await deleteTransaction(transaction.id);
      showToast('Transação excluída com sucesso!', 'success');
      onClose();
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      showToast('Erro ao excluir transação', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Math.abs(value));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalHeader>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle size={24} className="text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Confirmar Exclusão</h2>
            <p className="text-sm text-gray-600">Esta ação não pode ser desfeita</p>
          </div>
        </div>
      </ModalHeader>
      
      <ModalBody>
        {transaction && (
          <div className="space-y-4">
            <p className="text-gray-700">
              Tem certeza que deseja excluir esta transação?
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Descrição:</span>
                <span className="font-medium">{transaction.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Categoria:</span>
                <span className="font-medium">{transaction.category_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Valor:</span>
                <span className={`font-bold ${
                  transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Data:</span>
                <span className="font-medium">
                  {new Date(transaction.date).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        )}
      </ModalBody>
      
      <ModalFooter>
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Excluindo...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Trash2 size={16} />
              <span>Excluir Transação</span>
            </div>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteTransactionModal;