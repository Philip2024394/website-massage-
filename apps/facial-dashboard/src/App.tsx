import React, { useEffect, useState } from 'react';
import { authService } from '@shared/appwriteService';
import FacialDashboard from './pages/FacialDashboard';
import LoginPage from './pages/LoginPage';
import { LanguageProvider } from '@shared/context/LanguageContext';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [language, setLanguage] = useState<'en' | 'id'>(() => {
    const stored = localStorage.getItem('indastreet_language');
    return (stored === 'en' || stored === 'id') ? stored : 'id';
  });

  const handleLanguageChange = (lang: 'en' | 'id') => {
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

  const handleLogin = async (email: string, password: string) => {
    try {
      await authService.login(email, password);
      await checkAuth();
    } catch (error) {
      throw error;
    }
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
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

  return (
    <LanguageProvider value={{ language, setLanguage: handleLanguageChange }}>
      <FacialDashboard 
        user={user} 
        onLogout={handleLogout}
        language={language}
        onLanguageChange={handleLanguageChange}
      />
    </LanguageProvider>
  );
}

export default App;
