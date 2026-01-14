import { useEffect, useState } from 'react';
import { authService } from '../../../lib/appwriteService';
import PlaceDashboard from './pages/PlaceDashboard';
import PlaceChat from './pages/PlaceChat';
import PlacePaymentInfo from './pages/PlacePaymentInfo';
import { LanguageProvider } from '../../../context/LanguageContext';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'chat' | 'payment'>('dashboard');
  const [language, setLanguage] = useState<'en' | 'id' | 'gb'>(() => {
    const stored = localStorage.getItem('indastreet_language');
    return (stored === 'en' || stored === 'id') ? stored : 'id';
  });

  const handleLanguageChange = (lang: 'en' | 'id' | 'gb') => {
    setLanguage(lang);
    localStorage.setItem('indastreet_language', lang);
  };

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
    // Redirect to auth app for unified sign in/create account flow
    const authUrl = window.location.origin.includes('localhost') ? 'http://localhost:3001' : window.location.origin;
    window.location.href = `${authUrl}/signin`;
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  // Render different views based on currentView
  if (currentView === 'chat') {
    return <PlaceChat place={user?.place || null} onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'payment') {
    return <PlacePaymentInfo place={user?.place || null} onBack={() => setCurrentView('dashboard')} />;
  }

  return (
    <(LanguageProvider as any) value={{ language, setLanguage: handleLanguageChange }}>
      <PlaceDashboard {...{} as any} onLogout={handleLogout}
        onNavigateToChat={() => setCurrentView('chat')}
        onNavigateToPayment={() => setCurrentView('payment')}
        language={language}
        onLanguageChange={handleLanguageChange as any}
      />
    </LanguageProvider>
  );
}

export default App;


