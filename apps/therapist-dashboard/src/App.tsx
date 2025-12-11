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
import TherapistPaymentInfo from './pages/TherapistPaymentInfo';
import TherapistPaymentStatus from './pages/TherapistPaymentStatus';
import TherapistLayout from './components/TherapistLayout';
import LoginPage from './pages/LoginPage';
import PWAInstallPrompt from './components/PWAInstallPrompt';

type Page = 'dashboard' | 'status' | 'bookings' | 'earnings' | 'chat' | 'membership' | 'notifications' | 'legal' | 'calendar' | 'payment' | 'payment-status';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<Page>('status');

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

  // Render page content
  const renderPage = () => {
    switch (currentPage) {
      case 'status':
        return <TherapistOnlineStatus therapist={user} onBack={() => setCurrentPage('status')} />;
      case 'bookings':
        return <TherapistBookings therapist={user} onBack={() => setCurrentPage('status')} />;
      case 'earnings':
        return <TherapistEarnings therapist={user} onBack={() => setCurrentPage('status')} />;
      case 'chat':
        return <TherapistChat therapist={user} onBack={() => setCurrentPage('status')} />;
      case 'membership':
        return <MembershipPage therapist={user} onBack={() => setCurrentPage('status')} />;
      case 'notifications':
        return (
          <TherapistNotifications 
            therapist={user} 
            onBack={() => setCurrentPage('status')}
            onNavigateToBookings={() => setCurrentPage('bookings')}
            onNavigateToChat={() => setCurrentPage('chat')}
          />
        );
      case 'legal':
        return <TherapistLegal therapist={user} onBack={() => setCurrentPage('status')} />;
      case 'calendar':
        return (
          <TherapistCalendar 
            therapist={user} 
            onBack={() => setCurrentPage('status')}
            onNavigateToMembership={() => setCurrentPage('membership')}
          />
        );
      case 'payment':
        return <TherapistPaymentInfo therapist={user} onBack={() => setCurrentPage('status')} />;
      case 'payment-status':
        return <TherapistPaymentStatus therapist={user} onBack={() => setCurrentPage('status')} />;
      case 'dashboard':
      default:
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
            onNavigateToPayment={() => setCurrentPage('payment')}
          />
        );
    }
  };

  return (
    <>
      <PWAInstallPrompt dashboardName="Therapist Dashboard" />
      <TherapistLayout
        therapist={user}
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page as Page)}
        onLogout={handleLogout}
      >
        {renderPage()}
      </TherapistLayout>
    </>
  );
}

export default App;
