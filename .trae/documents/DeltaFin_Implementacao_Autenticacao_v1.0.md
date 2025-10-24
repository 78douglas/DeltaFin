# DeltaFin - Guia de Implementação do Sistema de Autenticação

## Documento de Implementação Técnica v1.0

## 1. Estrutura de Arquivos

```
src/
├── contexts/
│   └── AuthContext.tsx          # Context de autenticação
├── components/
│   ├── auth/
│   │   ├── LoginScreen.tsx      # Tela de login
│   │   └── ProtectedRoute.tsx   # Componente de proteção de rotas
│   └── ui/
│       └── LoadingSpinner.tsx   # Spinner de loading
├── hooks/
│   └── useAuth.ts               # Hook personalizado de auth
└── types/
    └── auth.ts                  # Types de autenticação
```

## 2. Implementação do AuthContext

**src/contexts/AuthContext.tsx**

```typescript
import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

// Types
interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

// Actions
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: User | null; session: Session | null } }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        session: action.payload.session,
        loading: false,
        error: null
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

// Initial state
const initialState: AuthState = {
  user: null,
  session: null,
  loading: true,
  error: null
};

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          dispatch({ type: 'SET_ERROR', payload: error.message });
          return;
        }

        dispatch({
          type: 'SET_USER',
          payload: { user: session?.user ?? null, session }
        });
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao inicializar autenticação' });
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        dispatch({
          type: 'SET_USER',
          payload: { user: session?.user ?? null, session }
        });

        // Handle sign in success
        if (event === 'SIGNED_IN' && session) {
          // Create or update user profile
          await createUserProfile(session.user);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Create user profile
  const createUserProfile = async (user: User) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          avatar_url: user.user_metadata?.avatar_url || '',
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error creating user profile:', error);
      }
    } catch (error) {
      console.error('Error in createUserProfile:', error);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao fazer login com Google' });
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    } catch (error) {
      console.error('Sign out error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao fazer logout' });
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    signInWithGoogle,
    signOut,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

## 3. Componente de Proteção de Rotas

**src/components/auth/ProtectedRoute.tsx**

```typescript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
```

## 4. Tela de Login

**src/components/auth/LoginScreen.tsx**

```typescript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { Wallet, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui';
import LoadingSpinner from '../ui/LoadingSpinner';

const LoginScreen: React.FC = () => {
  const { user, loading, error, signInWithGoogle, clearError } = useAuth();

  // Redirect if already authenticated
  if (user && !loading) {
    return <Navigate to="/" replace />;
  }

  const handleGoogleLogin = async () => {
    clearError();
    await signInWithGoogle();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Wallet size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">DeltaFin</h1>
          <p className="text-gray-600">
            Controle suas finanças de forma simples e inteligente
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Bem-vindo de volta
            </h2>
            <p className="text-gray-600 text-sm">
              Faça login para acessar sua conta
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-800 text-sm font-medium">Erro no login</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Google Login Button */}
          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 flex items-center justify-center space-x-3 py-3"
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Entrar com Google</span>
              </>
            )}
          </Button>

          {/* Loading State */}
          {loading && (
            <div className="mt-4 text-center">
              <p className="text-gray-600 text-sm">Conectando...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Ao fazer login, você concorda com nossos{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Termos de Uso
            </a>{' '}
            e{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Política de Privacidade
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
```

## 5. Componente LoadingSpinner

**src/components/ui/LoadingSpinner.tsx**

```typescript
import React from 'react';
import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
        sizeClasses[size],
        className
      )}
    />
  );
};

export default LoadingSpinner;
```

## 6. Atualização do App.tsx

**src/App.tsx**

```typescript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './components/ui';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginScreen from './components/auth/LoginScreen';
import BottomMenu from './components/BottomMenu';
import DashboardScreen from './screens/DashboardScreen';
import TransactionScreen from './screens/TransactionScreen';
import HistoryScreen from './screens/HistoryScreen';
import GoalsScreen from './screens/GoalsScreen';
import CategoriesScreen from './screens/CategoriesScreen';
import ProfileScreen from './screens/ProfileScreen';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppProvider>
          <Router>
            <Routes>
              {/* Public Route */}
              <Route path="/login" element={<LoginScreen />} />
              
              {/* Protected Routes */}
              <Route path="/*" element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    {/* Header */}
                    <header className="bg-blue-600 text-white p-4 shadow-lg">
                      <h1 className="text-xl font-bold text-center">DeltaFin</h1>
                    </header>

                    {/* Main Content */}
                    <main className="flex-1 overflow-auto pb-20">
                      <Routes>
                        <Route path="/" element={<DashboardScreen />} />
                        <Route path="/transaction" element={<TransactionScreen />} />
                        <Route path="/history" element={<HistoryScreen />} />
                        <Route path="/goals" element={<GoalsScreen />} />
                        <Route path="/categories" element={<CategoriesScreen />} />
                        <Route path="/profile" element={<ProfileScreen />} />
                      </Routes>
                    </main>

                    {/* Bottom Menu */}
                    <BottomMenu />
                  </div>
                </ProtectedRoute>
              } />
            </Routes>
          </Router>
        </AppProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
```

## 7. Atualização do DashboardScreen

**Modificações necessárias no src/screens/DashboardScreen.tsx**

```typescript
// Adicionar import do useAuth
import { useAuth } from '../contexts/AuthContext';

// No componente DashboardScreen, substituir:
const DashboardScreen = () => {
  const { user, signOut } = useAuth();
  // ... resto do código

  // Atualizar função de logout
  const confirmLogout = async () => {
    await signOut();
    setShowLogoutConfirm(false);
  };

  // Atualizar avatar do usuário
  const userAvatar = user?.user_metadata?.avatar_url;
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || 'Usuário';

  // No JSX do avatar:
  <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center">
    {userAvatar ? (
      <img 
        src={userAvatar} 
        alt={userName}
        className="w-full h-full object-cover"
      />
    ) : (
      <User size={20} className="text-white" />
    )}
  </div>
```

## 8. Migration SQL

**supabase/migrations/007\_setup\_authentication.sql**

```sql
-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Add user_id to existing tables
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE savings_goals ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Update RLS policies for transactions
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON transactions;
CREATE POLICY "Users can manage own transactions" ON transactions
    FOR ALL USING (auth.uid() = user_id);

-- Update RLS policies for categories  
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON categories;
CREATE POLICY "Users can view categories" ON categories
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can manage own categories" ON categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON categories
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON categories
    FOR DELETE USING (auth.uid() = user_id);

-- Update RLS policies for savings_goals
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON savings_goals;
CREATE POLICY "Users can manage own goals" ON savings_goals
    FOR ALL USING (auth.uid() = user_id);
```

## 9. Configuração de Variáveis de Ambiente

**Atualizar .env.example**

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Backend Configuration (Service Role - NEVER expose in frontend)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# App Configuration
VITE_APP_NAME=DeltaFin
VITE_APP_VERSION=1.0.0

# Google OAuth (configured in Supabase Dashboard)
# No additional env vars needed - handled by Supabase
```

## 10. Checklist de Implementação

### ✅ Passos de Desenvolvimento

1. **Criar estrutura de arquivos** conforme documentado
2. **Implementar AuthContext** com todas as funcionalidades
3. **Criar componente ProtectedRoute** para proteção de rotas
4. **Desenvolver LoginScreen** com design responsivo
5. **Atualizar App.tsx** com roteamento protegido
6. **Modificar DashboardScreen** para usar dados do usuário
7. **Executar migration SQL** no Supabase
8. **Configurar Google OAuth** no Supabase Dashboard
9. **Testar fluxo completo** de login/logout
10. **Preparar para deploy** com variáveis de produção

### ✅ Configuração Supabase Dashboard

1. **Authentication > Providers > Google**

   * Enable Google provider

   * Add Google Client ID and Secret

   * Configure redirect URLs
2. **Authentication > Settings**

   * Set site URL for production

   * Configure additional redirect URLs
3. **Database > RLS**

   * Verify policies are active

   * Test with authenticated user

### ✅ Testes Necessários

1. **Login Flow**: Testar login via Google
2. **Session Persistence**: Reload da página mantém login
3. **Route Protection**: URLs protegidas redirecionam para login
4. **Logout**: Limpa sessão e redireciona
5. **Error Handling**: Testa cenários de erro
6. **Responsive Design**: Testa em mobile e desktop

