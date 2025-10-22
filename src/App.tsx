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
