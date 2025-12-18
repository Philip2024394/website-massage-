import { useEffect, useState } from 'react';
import { authService, therapistService } from '../../../lib/appwriteService';
import { systemHealthService } from "../../../lib/systemHealthService";
// import { membershipNotificationService } from './services/membershipNotificationService'; // Unused
import TherapistDashboard from './pages/TherapistDashboard';
import TherapistOnlineStatus from './pages/TherapistOnlineStatus';
import TherapistBookings from './pages/TherapistBookings';
import TherapistEarnings from './pages/TherapistEarnings';
import TherapistChat from './pages/TherapistChat';
import MembershipPage from './pages/MembershipPage';
import PackageTermsPage from './pages/PackageTermsPage';
import TherapistNotifications from './pages/TherapistNotifications';
import TherapistLegal from './pages/TherapistLegal';
import TherapistCalendar from './pages/TherapistCalendar';
import TherapistPaymentInfo from './pages/TherapistPaymentInfo';
import TherapistPaymentStatus from './pages/TherapistPaymentStatus';
import TherapistLayout from './components/TherapistLayout';
import LoginPage from './pages/LoginPage';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import ToastContainer from './components/ToastContainer';
import { LanguageProvider } from '../../../context/LanguageContext';
import { useTranslations } from '../../../lib/useTranslations';

type Page = 'dashboard' | 'status' | 'bookings' | 'earnings' | 'chat' | 'package-terms' | 'notifications' | 'legal' | 'calendar' | 'payment' | 'payment-status';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<Page>('status');
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [language, setLanguage] = useState<'en' | 'id'>(() => {
    // Try to get language from localStorage or default to 'id'
    const stored = localStorage.getItem('indastreet_language');
    return (stored === 'en' || stored === 'id') ? stored : 'id';
  });
  const { t } = useTranslations(language);

  // Persist language changes
  const handleLanguageChange = (lang: 'en' | 'id') => {
    setLanguage(lang);
    localStorage.setItem('indastreet_language', lang);
  };

  useEffect(() => {
    // Always rely on server state to decide onboarding
    console.log('🔄 App mounted - checking auth...');
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        console.log('✅ Authenticated user:', currentUser.email);
        
        const therapists = await therapistService.getByEmail(currentUser.email);
        console.log('🔍 Looking for therapist with email:', currentUser.email);
        console.log('🔍 Found therapists:', therapists);
        
        if (therapists && therapists.length > 0) {
          const therapistDoc = therapists[0];
          console.log('✅ Found therapist document:', therapistDoc.$id);
          setUser(therapistDoc);
          setIsAuthenticated(true);
          
          // Package selection now happens on main site during signup flow
          // Skip membership setup check and go directly to dashboard
          console.log('✅ Package selection handled on main site - showing dashboard directly');
          
          // 🏥 START SYSTEM HEALTH MONITORING
          systemHealthService.startHealthMonitoring(therapistDoc.$id);
          console.log('✅ System health monitoring started for therapist:', therapistDoc.$id);
          
          // Test notification system on first load
          const hasTestedBefore = localStorage.getItem('notificationTested');
          if (!hasTestedBefore) {
            systemHealthService.testNotificationSystem().then(success => {
              if (success) {
                localStorage.setItem('notificationTested', 'true');
                console.log('✅ Notification system test successful');
              } else {
                console.warn('⚠️ Notification system test failed');
              }
            });
          }
        } else {
          console.error('❌ No therapist document found for email:', currentUser.email);
          console.error('❌ This means the therapist account was not created in Appwrite therapists collection');
          console.error('❌ Check: 1) Email matches exactly 2) therapists collection exists 3) Document was created');
          // User is authenticated but has no therapist profile
          alert(`No therapist profile found for ${currentUser.email}. Please contact admin to create your therapist profile.`);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      // Silently handle not authenticated state (expected on first load)
      // Only log if it's not a 401/guest error
      if (error instanceof Error && !error.message.includes('guests') && !error.message.includes('401')) {
        console.error('Auth check error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    // LoginPage handles authentication internally
    // This just refreshes the auth state after successful login
    await checkAuth();
  };

  const handleLogout = async () => {
    try {
      // 🛑 STOP SYSTEM HEALTH MONITORING
      systemHealthService.stopHealthMonitoring();
      console.log('🛑 System health monitoring stopped');
      
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
      case 'package-terms':
        return <PackageTermsPage
          onBack={() => setCurrentPage('packages')}
          onNavigate={setCurrentPage}
          language={language}
        />;
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
            onProfileSaved={() => setCurrentPage('status')}
            onNavigateToNotifications={() => setCurrentPage('notifications')}
            onNavigateToLegal={() => setCurrentPage('legal')}
            onNavigateToCalendar={() => setCurrentPage('calendar')}
            onNavigateToPayment={() => setCurrentPage('payment')}
          />
        );
    }
  };

  // Package selection now happens on main site, no onboarding needed here
  console.log('✅ Skipping onboarding - package selection handled on main site');

  return (
    <LanguageProvider value={{ language, setLanguage: handleLanguageChange }}>
      <PWAInstallPrompt dashboardName="Therapist Dashboard" />
      <ToastContainer />
      <TherapistLayout
        therapist={user}
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page as Page)}
        onLogout={handleLogout}
        language={language}
        onLanguageChange={handleLanguageChange}
      >
        {renderPage()}
      </TherapistLayout>
    </LanguageProvider>
  );
}

export default App;
