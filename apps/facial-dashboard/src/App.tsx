import React, { useEffect, useState } from 'react';
import { authService } from '../../../src/lib/appwriteService';
import FacialDashboard from './pages/FacialDashboard';
import { LanguageProvider } from '../../../src/context/LanguageContext';

function App() {
  // Minimal wrapper to satisfy code-splitting route expectations.
  // Facial dashboard pages own their internal routing/state.
  const [_isAuthenticated, _setIsAuthenticated] = useState(false);
  const [_isLoading, _setIsLoading] = useState(true);

  useEffect(() => {
    // Avoid hard-failing if auth is unavailable in some environments.
    (async () => {
      try {
        await authService.getCurrentUser?.();
        _setIsAuthenticated(true);
      } catch {
        _setIsAuthenticated(false);
      } finally {
        _setIsLoading(false);
      }
    })();
  }, []);

  return (
    <LanguageProvider>
      <FacialDashboard />
    </LanguageProvider>
  );
}

export default App;

