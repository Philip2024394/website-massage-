import { useEffect } from 'react';
import { useLoading } from '../context/LoadingContext';
import { useAuth } from '../context/AuthContext';

/**
 * Hook to manage authentication loading states with enterprise loading system
 * Provides smooth authentication transitions without layout shifts
 */
export const useAuthenticationLoading = () => {
  const { setAuthLoading, setProgress } = useLoading();
  const { user, loggedInUser, loggedInProvider, loggedInCustomer, restoreUserSession } = useAuth();

  // Track authentication loading states
  useEffect(() => {
    let isAuthenticating = false;
    
    // Check if any authentication operation is in progress
    const hasAnyAuthState = user || loggedInUser || loggedInProvider || loggedInCustomer;
    const isInitialLoad = !hasAnyAuthState && 
                          typeof window !== 'undefined' && 
                          !sessionStorage.getItem('auth-initialized');

    if (isInitialLoad) {
      isAuthenticating = true;
      setAuthLoading(true);
      setProgress({
        current: 20,
        stage: 'authenticating',
        message: 'Checking authentication...'
      });
      
      // Restore session on initial load
      restoreUserSession()
        .then(() => {
          setProgress({
            current: 100,
            stage: 'finalizing',
            message: 'Authentication complete'
          });
          sessionStorage.setItem('auth-initialized', 'true');
          setTimeout(() => setAuthLoading(false), 500);
        })
        .catch(() => {
          // No auth session, continue as guest
          sessionStorage.setItem('auth-initialized', 'true');
          setAuthLoading(false);
        });
    } else {
      setAuthLoading(false);
    }

    return () => {
      if (isAuthenticating) {
        setAuthLoading(false);
      }
    };
  }, [user, loggedInUser, loggedInProvider, loggedInCustomer, setAuthLoading, setProgress, restoreUserSession]);

  // Provide auth loading utilities
  const startAuthFlow = (message: string = 'Authenticating...') => {
    setAuthLoading(true);
    setProgress({
      current: 0,
      stage: 'authenticating',
      message
    });
  };

  const completeAuthFlow = () => {
    setProgress({
      current: 100,
      stage: 'finalizing',
      message: 'Success!'
    });
    setTimeout(() => setAuthLoading(false), 500);
  };

  const failAuthFlow = () => {
    setAuthLoading(false);
  };

  return {
    startAuthFlow,
    completeAuthFlow,
    failAuthFlow
  };
};

export default useAuthenticationLoading;