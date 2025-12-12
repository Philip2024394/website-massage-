import { useEffect, useState } from 'react';
import { authService } from '@shared/appwriteService';
import PlaceDashboard from './pages/PlaceDashboard';
import PlaceChat from './pages/PlaceChat';
import PlacePaymentInfo from './pages/PlacePaymentInfo';
import LoginPage from './pages/LoginPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'chat' | 'payment'>('dashboard');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.log('Not authenticated');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    // Login is handled inside LoginPage component
    await checkAuth();
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Render different views based on currentView
  if (currentView === 'chat') {
    return <PlaceChat place={user?.place || null} onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'payment') {
    return <PlacePaymentInfo place={user?.place || null} onBack={() => setCurrentView('dashboard')} />;
  }

  return (
    <PlaceDashboard 
      onLogout={handleLogout}
      onNavigateToChat={() => setCurrentView('chat')}
      onNavigateToPayment={() => setCurrentView('payment')}
    />
  );
}

export default App;
