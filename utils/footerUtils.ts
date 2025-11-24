/**
 * Footer Management Utility
 * Helps manage footer visibility and behavior across different page types
 */

export type FooterType = 'global' | 'dashboard' | 'none';

export interface FooterConfig {
  showGlobalFooter: boolean;
  showDashboardFooter: boolean;
  pageClass: string;
  paddingBottom: string;
}

/**
 * Determine footer configuration based on current page and user role
 */
export const getFooterConfig = (
  currentPage: string,
  _userRole?: string | null
): FooterConfig => {
  // Dashboard pages that have their own footers
  const dashboardPages = [
    'adminDashboard',
    'therapistPortal',
    'placeDashboard',
    'villaDashboard',
    'agentDashboard',
    'customerDashboard'
  ];

  // Pages that should not show any footer
  const noFooterPages = [
    'login',
    'register',
    'loading',
    'error'
  ];

  // Full screen pages that manage their own layout (handled implicitly by page components)

  if (noFooterPages.includes(currentPage)) {
    return {
      showGlobalFooter: false,
      showDashboardFooter: false,
      pageClass: 'no-footer',
      paddingBottom: 'pb-0'
    };
  }

  if (dashboardPages.includes(currentPage)) {
    // Special handling for Partners dashboard that uses DashboardFooter component
    if (currentPage === 'villaDashboard') {
      return {
        showGlobalFooter: false,
        showDashboardFooter: true,
        pageClass: 'has-dashboard-footer',
        paddingBottom: 'pb-16'
      };
    }
    
    return {
      showGlobalFooter: true,
      showDashboardFooter: false,
      pageClass: 'has-global-footer',
      paddingBottom: 'pb-20'
    };
  }

  // Default: show global footer
  return {
    showGlobalFooter: true,
    showDashboardFooter: false,
    pageClass: 'has-global-footer',
    paddingBottom: 'pb-20'
  };
};

/**
 * Apply footer body class for global styles
 */
export const applyFooterBodyClass = (config: FooterConfig) => {
  if (typeof document !== 'undefined') {
    // Remove all footer classes
    document.body.classList.remove('has-footer', 'has-dashboard-footer', 'no-footer');
    
    // Add appropriate class
    if (config.pageClass !== 'no-footer') {
      document.body.classList.add('has-footer');
    }
    document.body.classList.add(config.pageClass);
  }
};

/**
 * Hook to manage footer configuration
 */
export const useFooterConfig = (currentPage: string, userRole?: string | null) => {
  const config = getFooterConfig(currentPage, userRole);
  
  // Apply body class when config changes
  React.useEffect(() => {
    applyFooterBodyClass(config);
    
    return () => {
      // Cleanup on unmount
      if (typeof document !== 'undefined') {
        document.body.classList.remove('has-footer', 'has-dashboard-footer', 'no-footer');
      }
    };
  }, [config]);
  
  return config;
};

import React from 'react';