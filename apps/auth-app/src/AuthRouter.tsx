import React, { useState, useEffect } from 'react';

// Import auth pages
import SimpleSignupFlow from './pages/SimpleSignupFlow';
import PackageTermsPage from './pages/PackageTermsPage';
import RegistrationChoicePage from './pages/RegistrationChoicePage';
import TherapistLoginPage from './pages/TherapistLoginPage';
import MassagePlaceLoginPage from './pages/MassagePlaceLoginPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import SignInPage from './pages/SignInPage';

type AuthPage = 
  | 'registrationChoice'
  | 'membershipSignup' 
  | 'packageTerms'
  | 'signIn'
  | 'therapistLogin'
  | 'massagePlaceLogin'
  | 'privacy'
  | 'home';

const AuthRouter: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<AuthPage>('registrationChoice');

  // Handle URL-based routing
  useEffect(() => {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    
    if (path.includes('/signup') || searchParams.has('signup')) {
      setCurrentPage('membershipSignup');
    } else if (path.includes('/terms')) {
      setCurrentPage('packageTerms');
    } else if (path.includes('/signin') || path.includes('/login')) {
      setCurrentPage('signIn');
    } else if (path.includes('/therapist-login')) {
      setCurrentPage('therapistLogin');
    } else if (path.includes('/place-login')) {
      setCurrentPage('massagePlaceLogin');
    } else if (path.includes('/privacy')) {
      setCurrentPage('privacy');
    } else {
      setCurrentPage('registrationChoice');
    }
  }, []);

  const handleNavigate = (page: string) => {
    // Update URL for better UX
    const pageRoutes: Record<string, string> = {
      'registrationChoice': '/',
      'membershipSignup': '/signup',
      'packageTerms': '/terms',
      'signIn': '/signin',
      'therapistLogin': '/therapist-login',
      'massagePlaceLogin': '/place-login',
      'privacy': '/privacy',
      'home': 'http://localhost:3000'  // Main app
    };

    if (page === 'home') {
      // Redirect to main app
      window.location.href = 'http://localhost:3000';
      return;
    }

    const route = pageRoutes[page];
    if (route) {
      window.history.pushState({}, '', route);
      setCurrentPage(page as AuthPage);
    }
  };

  const handleSelectRegistration = (type: 'therapist' | 'place' | 'facial') => {
    console.log('🎯 Registration type selected:', type);
    
    // Route to appropriate login page
    switch (type) {
      case 'therapist':
        handleNavigate('therapistLogin');
        break;
      case 'place':
        handleNavigate('massagePlaceLogin');
        break;
      case 'facial':
        // Redirect to facial dashboard
        window.location.href = 'http://localhost:3006';
        break;
      default:
        handleNavigate('registrationChoice');
    }
  };

  const handleAuthSuccess = (userId: string, userType: 'therapist' | 'place') => {
    // Store auth info
    sessionStorage.setItem('logged_in_provider', JSON.stringify({
      id: userId,
      type: userType
    }));

    // Redirect to appropriate dashboard
    const dashboardUrls = {
      therapist: 'http://localhost:3005',
      place: 'http://localhost:3002'
    };
    
    window.location.href = dashboardUrls[userType];
  };

  const commonNavigateHandler = (page: string) => {
    handleNavigate(page);
  };

  const handleBackToHome = () => {
    window.location.href = 'http://localhost:3000';
  };

  // Render current page
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'membershipSignup':
        return (
          <SimpleSignupFlow 
            onNavigate={commonNavigateHandler}
            onBack={handleBackToHome}
          />
        );

      case 'packageTerms':
        return (
          <PackageTermsPage 
            onBack={handleBackToHome}
            onNavigate={commonNavigateHandler}
          />
        );

      case 'signIn':
        return (
          <SignInPage 
            onNavigate={commonNavigateHandler}
            onBack={handleBackToHome}
          />
        );

      case 'therapistLogin':
        return (
          <TherapistLoginPage 
            onSuccess={(therapistId) => handleAuthSuccess(therapistId, 'therapist')}
            onBack={handleBackToHome}
          />
        );

      case 'massagePlaceLogin':
        return (
          <MassagePlaceLoginPage 
            onSuccess={(placeId) => handleAuthSuccess(placeId, 'place')}
            onBack={handleBackToHome}
          />
        );

      case 'privacy':
        return (
          <PrivacyPolicyPage 
            onBack={handleBackToHome}
            onNavigate={commonNavigateHandler}
          />
        );

      case 'registrationChoice':
      default:
        return (
          <RegistrationChoicePage 
            onSelect={handleSelectRegistration}
            onBack={handleBackToHome}
            t={{}} // Empty translations object for now
          />
        );
    }
  };

  return (
    <div className="auth-app">
      {renderCurrentPage()}
    </div>
  );
};

export default AuthRouter;