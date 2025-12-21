import React, { useState, useEffect } from 'react';

// Import auth pages
import SimpleSignupFlow from './pages/SimpleSignupFlow';
import PackageTermsPage from './pages/PackageTermsPage';
// RegistrationChoicePage removed - redundant with SimpleSignupFlow portal selection
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
  // Choose initial page from URL instead of redirecting away from root
  const [currentPage, setCurrentPage] = useState<AuthPage>(() => {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    const action = searchParams.get('action');

    if (path.includes('/signup') || searchParams.has('signup') || action === 'signup') {
      return 'membershipSignup';
    }
    if (path.includes('/terms')) return 'packageTerms';
    if (path.includes('/signin') || path.includes('/login') || action === 'signin') return 'signIn';
    if (path.includes('/forgot-password')) return 'forgotPassword';
    if (path.includes('/reset-password')) return 'resetPassword';
    if (path.includes('/therapist-login')) return 'therapistLogin';
    if (path.includes('/place-login')) return 'massagePlaceLogin';
    if (path.includes('/privacy')) return 'privacy';
    return 'signIn';
  });

  // Handle URL-based routing
  useEffect(() => {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    const action = searchParams.get('action');
    
    if (path.includes('/signup') || searchParams.has('signup') || action === 'signup') {
      setCurrentPage('membershipSignup');
    } else if (path.includes('/terms')) {
      setCurrentPage('packageTerms');
    } else if (path.includes('/signin') || path.includes('/login') || action === 'signin') {
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
      // Default to sign-in page for root/unknown paths
      setCurrentPage('signIn');
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

  // Removed unused registration type handler functions

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
      therapist: 'http://localhost:3003',
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
        // Redirect to signup page (RegistrationChoicePage removed - redundant)
        return (
          <SimpleSignupFlow 
            onNavigate={commonNavigateHandler}
            onBack={handleBackToHome}
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