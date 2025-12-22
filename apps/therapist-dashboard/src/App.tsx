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
    if (!user?.$id) return;
    try {
      console.log('🔄 Refreshing therapist data from Appwrite...');
      const updatedTherapist = await therapistService.getById(user.$id);
      console.log('✅ Therapist data refreshed:', {
        status: updatedTherapist.status,
        availability: updatedTherapist.availability,
        isLive: updatedTherapist.isLive
      });
      setUser(updatedTherapist);
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
        console.log('✅ User ID:', currentUser.$id);
        console.log('✅ User status:', currentUser.status);
        
        console.log('🔍 Attempting to fetch therapist profile...');
        console.log('🔍 Using collection:', 'therapists_collection_id');
        console.log('🔍 Searching by email:', currentUser.email);
        
        const therapists = await therapistService.getByEmail(currentUser.email);
        console.log('🔍 Looking for therapist with email:', currentUser.email);
        console.log('🔍 Found therapists:', therapists);
        console.log('🔍 Number of results:', therapists?.length || 0);
        
        if (therapists && therapists.length > 0) {
          const therapistDoc = therapists[0];
          console.log('✅ Found therapist document:', therapistDoc.$id);
          console.log('✅ Therapist name:', therapistDoc.name);
          console.log('✅ Therapist email:', therapistDoc.email);
          console.log('✅ Therapist status:', therapistDoc.status);
          console.log('✅ Agent ID (userId):', therapistDoc.agentId);
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
          console.error('❌ Query returned:', therapists);
          console.error('❌ This means the therapist account was not found in Appwrite therapists collection');
          console.error('❌ Check: 1) Email matches exactly 2) therapists collection exists 3) Collection permissions allow read');
          console.error('❌ Collection ID being used:', 'therapists_collection_id');
          console.error('❌ Database ID:', '68f76ee1000e64ca8d05');
          
          // More helpful error message
          console.error(`
╔════════════════════════════════════════════════════════════╗
║  NO THERAPIST PROFILE FOUND                                ║
╚════════════════════════════════════════════════════════════╝

Email: ${currentUser.email}
User ID: ${currentUser.$id}
Collection: therapists_collection_id

Possible causes:
1. Profile exists but collection permissions don't allow authenticated reads
2. Email mismatch (check case sensitivity)
3. Profile needs to be created
4. agentId doesn't match user ID

COPY ALL CONSOLE OUTPUT AND SEND TO DEVELOPER
          `);
          
          // Alert disabled for debugging - check console instead
          // alert(errorMsg);
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
    // TEMPORARILY DISABLED - Show error instead of redirecting
    // const authUrl = window.location.origin.includes('localhost') ? 'http://localhost:3001' : window.location.origin;
    // window.location.href = `${authUrl}/signin`;
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-2xl w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-red-500">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">❌</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Authentication Failed</h1>
              <p className="text-gray-600">Unable to load therapist dashboard</p>
            </div>
            
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
              <h2 className="font-bold text-red-800 mb-2">⚠️ Debug Information:</h2>
              <p className="text-sm text-red-700 mb-4">
                Open browser console (F12) to see detailed error messages.
                Copy ALL console output and send to developer.
              </p>
            </div>
            
            <div className="space-y-2 text-sm">
              <p className="text-gray-700"><strong>Expected:</strong> Therapist profile found in database</p>
              <p className="text-gray-700"><strong>Result:</strong> No profile found or permission denied</p>
            </div>
            
            <div className="mt-6 text-center">
              <a 
                href="http://localhost:3001/signin" 
                className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Back to Sign In
              </a>
            </div>
          </div>
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
        return <TherapistMenu therapist={user} onNavigateToPayment={() => setCurrentPage('premium-upgrade')} />;
      case 'premium-upgrade':
        return <PremiumUpgrade therapist={user} />;
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
            onProfileSaved={() => setCurrentPage('status')}
            onNavigateToNotifications={() => setCurrentPage('notifications')}
            onNavigateToLegal={() => setCurrentPage('legal')}
            onNavigateToCalendar={() => setCurrentPage('calendar')}
            onNavigateToPayment={() => setCurrentPage('premium-upgrade')}
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
