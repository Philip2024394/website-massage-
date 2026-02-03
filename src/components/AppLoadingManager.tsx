import React, { useEffect } from 'react';
import { useLoading } from '../context/LoadingContext';
import { useAuth } from '../context/AuthContext';
import { useAuthenticationLoading } from '../hooks/useAuthenticationLoading';

interface AppLoadingManagerProps {
  children: React.ReactNode;
  isLoading: boolean;
  page: string;
}

/**
 * Manages app-level loading states and coordinates with enterprise loading system
 * Integrates authentication loading, page transitions, and global app state
 */
export const AppLoadingManager: React.FC<AppLoadingManagerProps> = ({ 
  children, 
  isLoading, 
  page 
}) => {
  const { setGlobalLoading, setPageLoading, loading } = useLoading();
  const { user } = useAuth();
  
  // 🚀 AUTHENTICATION LOADING: Integrated with enterprise system
  useAuthenticationLoading();

  // Manage global loading state based on app initialization
  useEffect(() => {
    // Set global loading during critical app initialization
    if (isLoading && (page === undefined || page === null || page === '')) {
      setGlobalLoading(true, 'Initializing IndaStreet...');
    } else {
      setGlobalLoading(false);
    }
  }, [isLoading, page, setGlobalLoading]);

  // Manage page loading state
  useEffect(() => {
    // Set page loading for route transitions (except landing page)
    if (page && page !== 'landing') {
      setPageLoading(isLoading);
    } else {
      setPageLoading(false);
    }
  }, [isLoading, page, setPageLoading]);

  // Log loading state changes for debugging
  useEffect(() => {
    console.log('🚀 [LOADING MANAGER] State changed:', {
      global: loading.global,
      auth: loading.auth,
      page: loading.page,
      data: loading.data,
      appIsLoading: isLoading,
      currentPage: page,
      hasUser: !!user
    });
  }, [loading, isLoading, page, user]);

  return <>{children}</>;
};

export default AppLoadingManager;