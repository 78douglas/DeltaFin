import { NavLink, Outlet } from 'react-router-dom';
import { Home, Plus, History, Target, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

const Navigation = () => {
  const navItems = [
    { to: '/', icon: Home, label: 'Início' },
    { to: '/transaction', icon: Plus, label: 'Adicionar' },
    { to: '/history', icon: History, label: 'Histórico' },
    { to: '/goals', icon: Target, label: 'Metas' },
    { to: '/categories', icon: Settings, label: 'Categorias' },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-lg">
        <h1 className="text-xl font-bold text-center">DeltaFin</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 px-1 py-1 safe-area-inset-bottom">
        <div className="flex justify-around max-w-md mx-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center py-2 px-2 rounded-lg transition-colors',
                  'text-xs font-medium min-w-0 flex-1 max-w-20',
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                )
              }
            >
              <Icon size={18} className="mb-1 flex-shrink-0" />
              <span className="truncate text-center leading-tight">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Navigation;