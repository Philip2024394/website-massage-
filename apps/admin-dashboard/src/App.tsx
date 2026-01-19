import { useEffect, useState } from 'react';
// import { authService } from '../../../lib/appwriteService';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  // ADMIN DASHBOARD BYPASS: Always run from VS Code localhost, no auth needed
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>({ 
    name: 'Admin User',
    email: 'admin@indastreet.com'
  });

  useEffect(() => {
    // Try to get existing session if available, but don't block
    // checkAuth();
    console.log('Admin Dashboard loaded successfully');
  }, []);

  const checkAuth = async () => {
    try {
      // const currentUser = await authService.getCurrentUser();
      // if (currentUser) {
      //   setUser(currentUser);
      // }
      console.log('Auth check skipped in development mode');
    } catch (error) {
      console.log('No existing session, using local admin access');
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      // await authService.login(email, password);
      // await checkAuth();
      console.log('Login handled locally');
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      // await authService.logout();
      setIsAuthenticated(false);
      setUser(null);
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return <AdminDashboard user={user} onLogout={handleLogout} />;
}

export default App;
