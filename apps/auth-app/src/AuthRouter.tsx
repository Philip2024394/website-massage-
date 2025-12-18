import React, { useState, useEffect } from 'react';

// Import auth pages
import SimpleSignupFlow from './pages/SimpleSignupFlow';
import PackageTermsPage from './pages/PackageTermsPage';
import RegistrationChoicePage from './pages/RegistrationChoicePage';
import TherapistLoginPage from './pages/TherapistLoginPage';
import MassagePlaceLoginPage from './pages/MassagePlaceLoginPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import SignInPage from './pages/SignInPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

type AuthPage = 
  | 'registrationChoice'
  | 'membershipSignup' 
  | 'packageTerms'
  | 'signIn'
  | 'forgotPassword'
  | 'resetPassword'
  | 'therapistLogin'
  | 'massagePlaceLogin'
  | 'privacy'
  | 'home';

const AuthRouter: React.FC = () => {
  // Default to signup page instead of redundant registration choice
  const [currentPage, setCurrentPage] = useState<AuthPage>('membershipSignup');

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
    } else if (path.includes('/forgot-password')) {
      setCurrentPage('forgotPassword');
    } else if (path.includes('/reset-password')) {
      setCurrentPage('resetPassword');
    } else if (path.includes('/therapist-login')) {
      setCurrentPage('therapistLogin');
    } else if (path.includes('/place-login')) {
      setCurrentPage('massagePlaceLogin');
    } else if (path.includes('/privacy')) {
      setCurrentPage('privacy');
    } else {
      // Default to signup page (portal type selection is in SimpleSignupFlow)
      setCurrentPage('membershipSignup');
    }
  }, []);

  const handleNavigate = (page: string) => {
    // Update URL for better UX
    const pageRoutes: Record<string, string> = {
      'registrationChoice': '/signup', // Redirect to signup (no longer used)
      'membershipSignup': '/signup',
      'packageTerms': '/terms',
      'signIn': '/signin',
      'forgotPassword': '/forgot-password',
      'resetPassword': '/reset-password',
      'therapistLogin': '/therapist-login',
      'massagePlaceLogin': '/place-login',
      'privacy': '/privacy',
      'home': window.location.origin.includes('localhost') ? 'http://localhost:3000' : window.location.origin
    };

    if (page === 'home') {
      // Redirect to main app
      const homeUrl = window.location.origin.includes('localhost') ? 'http://localhost:3000' : window.location.origin;
      window.location.href = homeUrl;
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
        const facialUrl = window.location.origin.includes('localhost') ? 'http://localhost:3006' : window.location.origin;
        window.location.href = facialUrl;
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
    const isProduction = !window.location.origin.includes('localhost');
    const dashboardUrls = isProduction ? {
      therapist: window.location.origin,
      place: window.location.origin
    } : {
      therapist: 'http://localhost:3005',
      place: 'http://localhost:3002'
    };
    
    window.location.href = dashboardUrls[userType];
  };

  const commonNavigateHandler = (page: string) => {
    handleNavigate(page);
  };

  const handleBackToHome = () => {
    const homeUrl = window.location.origin.includes('localhost') ? 'http://localhost:3000' : window.location.origin;
    window.location.href = homeUrl;
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

      case 'forgotPassword':
        return (
          <ForgotPasswordPage 
            onBack={() => handleNavigate('signIn')}
          />
        );

      case 'resetPassword':
        return (
          <ResetPasswordPage 
            onNavigate={commonNavigateHandler}
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