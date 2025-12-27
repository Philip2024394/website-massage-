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
import TherapistMenu from './pages/TherapistMenu';
import PremiumUpgrade from './pages/PremiumUpgrade';
import CommissionPayment from './pages/CommissionPayment';
import TherapistSchedule from './pages/TherapistSchedule';
import TherapistLayout from './components/TherapistLayout';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import ToastContainer from './components/ToastContainer';
import { LanguageProvider } from '../../../context/LanguageContext';
import { useTranslations } from '../../../lib/useTranslations';

type Page = 'dashboard' | 'status' | 'bookings' | 'earnings' | 'chat' | 'package-terms' | 'notifications' | 'legal' | 'calendar' | 'payment' | 'payment-status' | 'custom-menu' | 'premium-upgrade' | 'commission-payment' | 'schedule';

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

  // Function to refresh user data from Appwrite
  const refreshUser = async () => {
    if (!user?.$id) {
      console.log('⚠️ Cannot refresh - no user ID');
      return;
    }
    try {
      console.log('🔄 Refreshing therapist data from Appwrite for ID:', user.$id);
      console.log('📧 Session user email:', user.email);
      console.log('👤 Session user name:', user.name);
      
      const updatedTherapist = await therapistService.getById(user.$id);
      console.log('✅ Therapist data refreshed from database:', {
        id: updatedTherapist.$id,
        name: updatedTherapist.name,
        email: updatedTherapist.email,
        status: updatedTherapist.status,
        availability: updatedTherapist.availability,
        isLive: updatedTherapist.isLive,
        city: updatedTherapist.city,
        whatsappNumber: updatedTherapist.whatsappNumber
      });
      
      // Check if IDs match
      if (updatedTherapist.$id !== user.$id) {
        console.warn('⚠️ ID MISMATCH DETECTED!');
        console.warn('   Session ID:', user.$id);
        console.warn('   Fetched ID:', updatedTherapist.$id);
      } else {
        console.log('✅ Session ID and fetched ID match:', user.$id);
      }
      
      setUser(updatedTherapist);
      console.log('✅ User state updated with fresh data');
    } catch (error) {
      console.error('❌ Failed to refresh therapist data:', error);
    }
  };

  // Persist language changes
  const handleLanguageChange = (lang: 'en' | 'id') => {
    setLanguage(lang);
    localStorage.setItem('indastreet_language', lang);
  };

  // Refresh user data when page changes (to keep status in sync)
  useEffect(() => {
    if (user?.$id) {
      refreshUser();
    }
  }, [currentPage]);

  // Listen for profile update events and refresh user data
  useEffect(() => {
    const handleProfileUpdate = (event: any) => {
      console.log('🔔 Profile update event received, refreshing user data...');
      if (user?.$id) {
        refreshUser();
      }
    };

    window.addEventListener('therapistProfileUpdated', handleProfileUpdate);
    return () => {
      window.removeEventListener('therapistProfileUpdated', handleProfileUpdate);
    };
  }, [user?.$id]);

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
        
        // Normalize email for consistent lookup (therapist documents are stored with normalized emails)
        const normalizedEmail = currentUser.email.toLowerCase().trim();
        console.log('🔍 [DEBUG] Auth email exact value:', JSON.stringify(currentUser.email));
        console.log('🔍 [DEBUG] Normalized email for lookup:', normalizedEmail);
        
        let therapists = await therapistService.getByEmail(normalizedEmail);
        console.log('🔍 Looking for therapist with email:', normalizedEmail);
        console.log('🔍 Found therapists:', therapists);
        
        // Retry if not found (database might still be indexing)
        if (!therapists || therapists.length === 0) {
          console.log('⏳ Therapist not found, retrying in 1 second...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          therapists = await therapistService.getByEmail(normalizedEmail);
          console.log('🔍 Retry result - Found therapists:', therapists?.length || 0);
        }
        
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
          console.error('❌ No therapist document found for email:', normalizedEmail);
          console.error('❌ Original auth email:', currentUser.email);
          console.error('❌ This means the therapist profile lookup failed');
          console.error('❌ Possible causes:');
          console.error('   1. Therapist document was not created during signup');
          console.error('   2. Document exists but email field differs');
          console.error('   3. Database/collection permissions issue');
          
          // IMPORTANT: Don't immediately redirect - user IS authenticated
          // Just show an error state instead of redirecting
          console.warn('⚠️ User is authenticated but no therapist profile found. Keeping them on page to see error.');
          setUser(null);
          setIsAuthenticated(true); // Keep authenticated to prevent redirect
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



  const handleLogout = async () => {
    try {
      // 🛑 STOP SYSTEM HEALTH MONITORING
      systemHealthService.stopHealthMonitoring();
      console.log('🛑 System health monitoring stopped');
      
      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);
      
      // Redirect to home page (main app)
      window.location.href = '/';
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

  // Show error if authenticated but no therapist profile
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-lg">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">
            Your therapist profile could not be loaded. This might be a temporary issue.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Retry Loading Profile
            </button>
            <button
              onClick={handleLogout}
              className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Sign Out
            </button>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            If this problem persists, contact support at{' '}
            <a href="mailto:indastreet.id@gmail.com" className="text-orange-600 hover:underline">
              indastreet.id@gmail.com
            </a>
          </p>
        </div>
      </div>
    );
  }

  // Render page content
  const renderPage = () => {
    switch (currentPage) {
      case 'status':
        return <TherapistOnlineStatus therapist={user} onBack={() => setCurrentPage('status')} onRefresh={refreshUser} onNavigate={setCurrentPage} />;
      case 'bookings':
        return <TherapistBookings therapist={user} onBack={() => setCurrentPage('status')} onNavigate={setCurrentPage} />;
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
      case 'custom-menu':
        return <TherapistMenu therapist={user} />;
      case 'commission-payment':
        return <CommissionPayment therapist={user} onBack={() => setCurrentPage('status')} />;
      case 'schedule':
        return <TherapistSchedule therapist={user} />;
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
            onNavigateToNotifications={() => setCurrentPage('notifications')}
            onNavigateToLegal={() => setCurrentPage('legal')}
            onNavigateToCalendar={() => setCurrentPage('calendar')}
            onNavigateToMenu={() => setCurrentPage('custom-menu')}
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
        language={language}
        onLanguageChange={handleLanguageChange}
      >
        {renderPage()}
      </TherapistLayout>
    </LanguageProvider>
  );
}

export default App;
