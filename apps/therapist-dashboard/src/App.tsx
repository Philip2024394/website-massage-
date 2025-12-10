import React, { useEffect, useState } from 'react';
import { authService } from '@shared/appwriteService';
import TherapistDashboard from './pages/TherapistDashboard';
import TherapistOnlineStatus from './pages/TherapistOnlineStatus';
import TherapistBookings from './pages/TherapistBookings';
import TherapistEarnings from './pages/TherapistEarnings';
import TherapistChat from './pages/TherapistChat';
import MembershipPage from './pages/MembershipPage';
import TherapistNotifications from './pages/TherapistNotifications';
import TherapistLegal from './pages/TherapistLegal';
import TherapistCalendar from './pages/TherapistCalendar';
import LoginPage from './pages/LoginPage';

type Page = 'dashboard' | 'status' | 'bookings' | 'earnings' | 'chat' | 'membership' | 'notifications' | 'legal' | 'calendar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Page routing
  if (currentPage === 'status') {
    return <TherapistOnlineStatus therapist={user} onBack={() => setCurrentPage('dashboard')} />;
  }
  
  if (currentPage === 'bookings') {
    return <TherapistBookings therapist={user} onBack={() => setCurrentPage('dashboard')} />;
  }
  
  if (currentPage === 'earnings') {
    return <TherapistEarnings therapist={user} onBack={() => setCurrentPage('dashboard')} />;
  }
  
  if (currentPage === 'chat') {
    return <TherapistChat therapist={user} onBack={() => setCurrentPage('dashboard')} />;
  }
  
  if (currentPage === 'membership') {
    return <MembershipPage therapist={user} onBack={() => setCurrentPage('dashboard')} />;
  }

  if (currentPage === 'notifications') {
    return (
      <TherapistNotifications 
        therapist={user} 
        onBack={() => setCurrentPage('dashboard')}
        onNavigateToBookings={() => setCurrentPage('bookings')}
        onNavigateToChat={() => setCurrentPage('chat')}
      />
    );
  }

  if (currentPage === 'legal') {
    return <TherapistLegal therapist={user} onBack={() => setCurrentPage('dashboard')} />;
  }

  if (currentPage === 'calendar') {
    return (
      <TherapistCalendar 
        therapist={user} 
        onBack={() => setCurrentPage('dashboard')}
        onNavigateToMembership={() => setCurrentPage('membership')}
      />
    );
  }

  return (
    <TherapistDashboard 
      therapist={user} 
      onLogout={handleLogout}
        onNavigateToStatus={() => setCurrentPage('status')}
        onNavigateToBookings={() => setCurrentPage('bookings')}
        onNavigateToEarnings={() => setCurrentPage('earnings')}
        onNavigateToChat={() => setCurrentPage('chat')}
        onNavigateToMembership={() => setCurrentPage('membership')}
        onNavigateToNotifications={() => setCurrentPage('notifications')}
        onNavigateToLegal={() => setCurrentPage('legal')}
        onNavigateToCalendar={() => setCurrentPage('calendar')}
    />
  );
}

export default App;
