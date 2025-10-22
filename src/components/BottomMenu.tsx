import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  DollarSign, 
  Plus, 
  Target, 
  User,
  ArrowDown,
  ArrowUp
} from 'lucide-react';
import { cn } from '../lib/utils';

interface BottomMenuProps {
  className?: string;
}

const BottomMenu = ({ className }: BottomMenuProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  // Itens de navegação principais
  const navItems = [
    { 
      to: '/', 
      icon: Home, 
      label: 'Início',
      id: 'home'
    },
    { 
      to: '/history', 
      icon: DollarSign, 
      label: 'Transações',
      id: 'transactions'
    },
    { 
      to: null, // Botão central especial
      icon: Plus, 
      label: '+',
      id: 'add',
      isCenter: true
    },
    { 
      to: '/goals', 
      icon: Target, 
      label: 'Metas',
      id: 'goals'
    },
    { 
      to: '/profile', 
      icon: User, 
      label: 'Perfil',
      id: 'profile'
    },
  ];

  const handleNavigation = (item: any) => {
    if (item.isCenter) {
      setIsExpanded(!isExpanded);
    } else if (item.to) {
      navigate(item.to);
      setIsExpanded(false);
    }
  };

  const handleTransactionType = (type: 'expense' | 'income') => {
    navigate('/transaction', { state: { type } });
    setIsExpanded(false);
  };

  const handleOverlayClick = () => {
    setIsExpanded(false);
  };

  const isActive = (path: string | null) => {
    if (!path) return false;
    return location.pathname === path;
  };

  return (
    <>
      {/* Overlay quando expandido */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity duration-300"
          onClick={handleOverlayClick}
        />
      )}

      {/* Botões flutuantes */}
      {isExpanded && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center space-y-3">
          {/* Botão Crédito (Receita) */}
          <button
            onClick={() => handleTransactionType('income')}
            className="w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg transform transition-all duration-300 animate-in slide-in-from-bottom-2 fade-in"
            style={{ animationDelay: '100ms' }}
          >
            <ArrowUp size={24} className="text-white" />
          </button>

          {/* Botão Débito (Despesa) */}
          <button
            onClick={() => handleTransactionType('expense')}
            className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transform transition-all duration-300 animate-in slide-in-from-bottom-2 fade-in"
            style={{ animationDelay: '50ms' }}
          >
            <ArrowDown size={24} className="text-white" />
          </button>
        </div>
      )}

      {/* Menu inferior principal */}
      <nav className={cn(
        "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50 shadow-lg",
        className
      )}>
        <div className="flex justify-around items-center max-w-md mx-auto relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);

            if (item.isCenter) {
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  className={cn(
                    "relative flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-300 transform",
                    "bg-blue-500 hover:bg-blue-600 shadow-lg -mt-6 z-10",
                    isExpanded && "rotate-45"
                  )}
                >
                  <Icon size={24} className="text-white" />
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={cn(
                  "flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-300",
                  "text-xs font-medium min-w-0 flex-1 max-w-20",
                  active
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                )}
              >
                <Icon size={18} className="mb-1 flex-shrink-0" />
                <span className="truncate text-center leading-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default BottomMenu;