/**
 * StatusThemeProvider Component
 * Provides status-specific themes and visual feedback for different booking states
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { BookingProgressStep } from './BookingProgressStepper';

interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  border: string;
  text: string;
  icon: string;
  gradient: string;
  shadow: string;
  animation?: string;
}

interface StatusThemeContextType {
  currentTheme: ThemeConfig;
  setBookingStatus: (status: BookingProgressStep) => void;
  getThemeForStatus: (status: BookingProgressStep) => ThemeConfig;
  applyThemeToElement: (element: HTMLElement, theme?: ThemeConfig) => void;
}

const StatusThemeContext = createContext<StatusThemeContextType | undefined>(undefined);

const statusThemes: Record<BookingProgressStep, ThemeConfig> = {
  requested: {
    primary: 'text-blue-600',
    secondary: 'text-blue-500',
    accent: 'text-blue-700',
    background: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: 'text-blue-600',
    gradient: 'bg-gradient-to-br from-blue-50 to-blue-100',
    shadow: 'shadow-blue-100',
    animation: 'animate-pulse'
  },
  
  accepted: {
    primary: 'text-green-600',
    secondary: 'text-green-500',
    accent: 'text-green-700',
    background: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: 'text-green-600',
    gradient: 'bg-gradient-to-br from-green-50 to-green-100',
    shadow: 'shadow-green-100'
  },
  
  confirmed: {
    primary: 'text-emerald-600',
    secondary: 'text-emerald-500',
    accent: 'text-emerald-700',
    background: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    icon: 'text-emerald-600',
    gradient: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
    shadow: 'shadow-emerald-100'
  },
  
  preparing: {
    primary: 'text-purple-600',
    secondary: 'text-purple-500',
    accent: 'text-purple-700',
    background: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-800',
    icon: 'text-purple-600',
    gradient: 'bg-gradient-to-br from-purple-50 to-purple-100',
    shadow: 'shadow-purple-100',
    animation: 'animate-bounce'
  },
  
  en_route: {
    primary: 'text-orange-600',
    secondary: 'text-orange-500',
    accent: 'text-orange-700',
    background: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-800',
    icon: 'text-orange-600',
    gradient: 'bg-gradient-to-br from-orange-50 to-orange-100',
    shadow: 'shadow-orange-100',
    animation: 'animate-pulse'
  },
  
  arrived: {
    primary: 'text-indigo-600',
    secondary: 'text-indigo-500',
    accent: 'text-indigo-700',
    background: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-800',
    icon: 'text-indigo-600',
    gradient: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
    shadow: 'shadow-indigo-100'
  },
  
  in_progress: {
    primary: 'text-pink-600',
    secondary: 'text-pink-500',
    accent: 'text-pink-700',
    background: 'bg-pink-50',
    border: 'border-pink-200',
    text: 'text-pink-800',
    icon: 'text-pink-600',
    gradient: 'bg-gradient-to-br from-pink-50 to-pink-100',
    shadow: 'shadow-pink-100',
    animation: 'animate-pulse'
  },
  
  completed: {
    primary: 'text-teal-600',
    secondary: 'text-teal-500',
    accent: 'text-teal-700',
    background: 'bg-teal-50',
    border: 'border-teal-200',
    text: 'text-teal-800',
    icon: 'text-teal-600',
    gradient: 'bg-gradient-to-br from-teal-50 to-teal-100',
    shadow: 'shadow-teal-100'
  }
};

interface StatusThemeProviderProps {
  children: React.ReactNode;
  initialStatus?: BookingProgressStep;
}

export const StatusThemeProvider: React.FC<StatusThemeProviderProps> = ({
  children,
  initialStatus = 'requested'
}) => {
  const [currentStatus, setCurrentStatus] = useState<BookingProgressStep>(initialStatus);
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(statusThemes[initialStatus]);

  const setBookingStatus = (status: BookingProgressStep) => {
    setCurrentStatus(status);
    setCurrentTheme(statusThemes[status]);
  };

  const getThemeForStatus = (status: BookingProgressStep): ThemeConfig => {
    return statusThemes[status];
  };

  const applyThemeToElement = (element: HTMLElement, theme: ThemeConfig = currentTheme) => {
    // Apply CSS custom properties for dynamic theming
    element.style.setProperty('--theme-primary', theme.primary);
    element.style.setProperty('--theme-secondary', theme.secondary);
    element.style.setProperty('--theme-accent', theme.accent);
    element.style.setProperty('--theme-background', theme.background);
    element.style.setProperty('--theme-border', theme.border);
    element.style.setProperty('--theme-text', theme.text);
    element.style.setProperty('--theme-icon', theme.icon);
  };

  useEffect(() => {
    // ⚠️ CRITICAL FIX: Defer DOM mutations to prevent React reconciliation conflicts
    // Use requestAnimationFrame to ensure React has finished its render phase
    const timeoutId = setTimeout(() => {
      try {
        // Apply global theme variables to document root
        const root = document.documentElement;
        if (root) {
          applyThemeToElement(root, currentTheme);
        }
        
        // Add status class to body for global status-specific styling
        // Use defensive checks to prevent DOM manipulation errors
        if (document.body) {
          const bodyClasses = document.body.className || '';
          const cleanedClasses = bodyClasses.replace(/booking-status-\w+/g, '').trim();
          document.body.className = cleanedClasses;
          document.body.classList.add(`booking-status-${currentStatus}`);
        }
      } catch (error) {
        // Silently fail if DOM manipulation fails during transitions
        console.warn('StatusThemeProvider: DOM update skipped during transition', error);
      }
    }, 0);
    
    return () => {
      clearTimeout(timeoutId);
      // Cleanup on unmount - use try-catch for safety
      try {
        if (document.body) {
          const bodyClasses = document.body.className || '';
          document.body.className = bodyClasses.replace(/booking-status-\w+/g, '').trim();
        }
      } catch (error) {
        // Silently fail during cleanup
        console.warn('StatusThemeProvider: Cleanup skipped', error);
      }
    };
  }, [currentStatus, currentTheme]);

  const contextValue: StatusThemeContextType = {
    currentTheme,
    setBookingStatus,
    getThemeForStatus,
    applyThemeToElement
  };

  return (
    <StatusThemeContext.Provider value={contextValue}>
      <div 
        className={`theme-provider ${currentTheme.gradient} transition-all duration-500`}
        data-status={currentStatus}
      >
        {children}
      </div>
    </StatusThemeContext.Provider>
  );
};

// Hook to use the status theme context
export const useStatusTheme = (): StatusThemeContextType => {
  const context = useContext(StatusThemeContext);
  if (!context) {
    throw new Error('useStatusTheme must be used within a StatusThemeProvider');
  }
  return context;
};

// Higher-order component for themed components
export const withStatusTheme = <P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P & { statusOverride?: BookingProgressStep }> => {
  return ({ statusOverride, ...props }) => {
    const { currentTheme, getThemeForStatus } = useStatusTheme();
    const theme = statusOverride ? getThemeForStatus(statusOverride) : currentTheme;
    
    return (
      <div className={`themed-component ${theme.background} ${theme.border} ${theme.shadow}`}>
        <WrappedComponent {...props as P} />
      </div>
    );
  };
};

// Utility component for status-aware containers
export const StatusAwareContainer: React.FC<{
  children: React.ReactNode;
  status?: BookingProgressStep;
  className?: string;
}> = ({ children, status, className = '' }) => {
  const { currentTheme, getThemeForStatus } = useStatusTheme();
  const theme = status ? getThemeForStatus(status) : currentTheme;
  
  return (
    <div 
      className={`status-container ${theme.background} ${theme.border} ${theme.shadow} ${theme.animation || ''} transition-all duration-300 ${className}`}
      data-status={status}
    >
      {children}
    </div>
  );
};

// Utility component for status icons with theme
export const StatusIcon: React.FC<{
  icon: React.ReactNode;
  status?: BookingProgressStep;
  size?: 'sm' | 'md' | 'lg';
}> = ({ icon, status, size = 'md' }) => {
  const { currentTheme, getThemeForStatus } = useStatusTheme();
  const theme = status ? getThemeForStatus(status) : currentTheme;
  
  const sizeClasses = {
    sm: 'w-4 h-4 p-1',
    md: 'w-6 h-6 p-2',
    lg: 'w-8 h-8 p-2'
  };
  
  return (
    <div 
      className={`status-icon ${theme.background} ${theme.icon} ${sizeClasses[size]} rounded-full ${theme.animation || ''} transition-all duration-200`}
    >
      {icon}
    </div>
  );
};

// Theme-aware text component
export const StatusText: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent';
  status?: BookingProgressStep;
  className?: string;
}> = ({ children, variant = 'primary', status, className = '' }) => {
  const { currentTheme, getThemeForStatus } = useStatusTheme();
  const theme = status ? getThemeForStatus(status) : currentTheme;
  
  const colorClass = theme[variant];
  
  return (
    <span className={`status-text ${colorClass} ${className} transition-colors duration-200`}>
      {children}
    </span>
  );
};

// Export all theme configurations for external use
export { statusThemes };

// Utility function to get theme colors programmatically
export const getStatusColors = (status: BookingProgressStep) => {
  const theme = statusThemes[status];
  return {
    primary: theme.primary.replace('text-', ''),
    background: theme.background.replace('bg-', ''),
    border: theme.border.replace('border-', ''),
    // Convert Tailwind classes to CSS color values
    cssColors: {
      primary: `var(--${theme.primary.replace('text-', 'color-')})`,
      background: `var(--${theme.background.replace('bg-', 'color-')})`,
      border: `var(--${theme.border.replace('border-', 'color-')})`
    }
  };
};