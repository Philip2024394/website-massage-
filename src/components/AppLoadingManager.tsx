import React, { useEffect } from 'react';
import { useLoading } from '../context/LoadingContext';
import { useAuth } from '../context/AuthContext';
import { useAuthenticationLoading } from '../hooks/useAuthenticationLoading';
import { logger } from '../utils/logger';

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
    console.log('✅ Splash hidden - boot manager initialized');
    // P0 FIX: NEVER block landing page or home page
    // Landing page and home must render immediately, no loading states
    setGlobalLoading(false);
  }, [setGlobalLoading]);

  // Manage page loading state
  useEffect(() => {
    // P0 FIX: Landing page and home NEVER show loading spinner
    if (page === 'landing' || page === 'home' || page === '') {
      console.log('🔥 Landing/Home mounted - no loading state');
      setPageLoading(false);
      return;
    }
    
    // Other pages can show loading states
    if (page && isLoading) {
      setPageLoading(true);
    } else {
      setPageLoading(false);
    }
  }, [isLoading, page, setPageLoading]);

  // Log loading state changes for debugging
  useEffect(() => {
    logger.debug('🚀 [LOADING MANAGER] State changed:', {
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