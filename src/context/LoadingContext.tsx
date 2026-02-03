import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface LoadingState {
  // Global app loading (initial app boot, critical operations)
  global: boolean;
  
  // Authentication loading
  auth: boolean;
  
  // Page/route loading
  page: boolean;
  
  // Data fetching loading
  data: boolean;
  
  // Individual components loading (by component ID)
  components: Record<string, boolean>;
  
  // Operation-specific loading (by operation name)
  operations: Record<string, boolean>;
}

export interface LoadingProgress {
  current: number; // 0-100
  total: number;
  stage: 'initializing' | 'loading' | 'authenticating' | 'finalizing';
  message?: string;
}

interface LoadingContextType {
  loading: LoadingState;
  progress: LoadingProgress;
  
  // Global loading controls
  setGlobalLoading: (loading: boolean, message?: string) => void;
  
  // Auth loading controls  
  setAuthLoading: (loading: boolean) => void;
  
  // Page loading controls
  setPageLoading: (loading: boolean) => void;
  
  // Data loading controls
  setDataLoading: (loading: boolean) => void;
  
  // Component loading controls
  setComponentLoading: (componentId: string, loading: boolean) => void;
  getComponentLoading: (componentId: string) => boolean;
  
  // Operation loading controls
  setOperationLoading: (operationName: string, loading: boolean) => void;
  getOperationLoading: (operationName: string) => boolean;
  
  // Progress controls
  setProgress: (progress: Partial<LoadingProgress>) => void;
  
  // Combined state helpers
  isAnyLoading: () => boolean;
  isCriticalLoading: () => boolean; // global || auth
  canShowContent: () => boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

/**
 * Enterprise-grade loading state management
 * Follows Amazon/Meta patterns for consistent UX
 */
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState<LoadingState>({
    global: false,
    auth: false, 
    page: false,
    data: false,
    components: {},
    operations: {}
  });
  
  const [progress, setProgressState] = useState<LoadingProgress>({
    current: 0,
    total: 100,
    stage: 'initializing'
  });

  // Global loading - for critical app initialization
  const setGlobalLoading = useCallback((isLoading: boolean, message?: string) => {
    setLoading(prev => ({ ...prev, global: isLoading }));
    if (isLoading && message) {
      setProgressState(prev => ({ ...prev, message, stage: 'initializing' }));
    }
  }, []);

  // Auth loading - for authentication flows
  const setAuthLoading = useCallback((isLoading: boolean) => {
    setLoading(prev => ({ ...prev, auth: isLoading }));
    if (isLoading) {
      setProgressState(prev => ({ ...prev, stage: 'authenticating' }));
    }
  }, []);

  // Page loading - for route changes
  const setPageLoading = useCallback((isLoading: boolean) => {
    setLoading(prev => ({ ...prev, page: isLoading }));
    if (isLoading) {
      setProgressState(prev => ({ ...prev, stage: 'loading' }));
    }
  }, []);

  // Data loading - for API calls
  const setDataLoading = useCallback((isLoading: boolean) => {
    setLoading(prev => ({ ...prev, data: isLoading }));
  }, []);

  // Component loading - for individual components
  const setComponentLoading = useCallback((componentId: string, isLoading: boolean) => {
    setLoading(prev => ({
      ...prev,
      components: {
        ...prev.components,
        [componentId]: isLoading
      }
    }));
  }, []);

  const getComponentLoading = useCallback((componentId: string) => {
    return loading.components[componentId] || false;
  }, [loading.components]);

  // Operation loading - for specific operations
  const setOperationLoading = useCallback((operationName: string, isLoading: boolean) => {
    setLoading(prev => ({
      ...prev,
      operations: {
        ...prev.operations,
        [operationName]: isLoading
      }
    }));
  }, []);

  const getOperationLoading = useCallback((operationName: string) => {
    return loading.operations[operationName] || false;
  }, [loading.operations]);

  // Progress management
  const setProgress = useCallback((newProgress: Partial<LoadingProgress>) => {
    setProgressState(prev => ({ ...prev, ...newProgress }));
  }, []);

  // Combined state helpers
  const isAnyLoading = useCallback(() => {
    return loading.global || 
           loading.auth || 
           loading.page || 
           loading.data ||
           Object.values(loading.components).some(Boolean) ||
           Object.values(loading.operations).some(Boolean);
  }, [loading]);

  const isCriticalLoading = useCallback(() => {
    return loading.global || loading.auth;
  }, [loading.global, loading.auth]);

  const canShowContent = useCallback(() => {
    return !loading.global && !loading.auth;
  }, [loading.global, loading.auth]);

  const value: LoadingContextType = {
    loading,
    progress,
    setGlobalLoading,
    setAuthLoading,
    setPageLoading,
    setDataLoading,
    setComponentLoading,
    getComponentLoading,
    setOperationLoading,
    getOperationLoading,
    setProgress,
    isAnyLoading,
    isCriticalLoading,
    canShowContent
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

/**
 * Hook for component-specific loading state
 * Automatically manages loading state for a specific component
 */
export const useComponentLoading = (componentId: string) => {
  const { setComponentLoading, getComponentLoading } = useLoading();
  
  const isLoading = getComponentLoading(componentId);
  
  const setLoading = useCallback((loading: boolean) => {
    setComponentLoading(componentId, loading);
  }, [componentId, setComponentLoading]);

  return { isLoading, setLoading };
};

/**
 * Hook for operation-specific loading state
 * Automatically manages loading state for a specific operation
 */
export const useOperationLoading = (operationName: string) => {
  const { setOperationLoading, getOperationLoading } = useLoading();
  
  const isLoading = getOperationLoading(operationName);
  
  const setLoading = useCallback((loading: boolean) => {
    setOperationLoading(operationName, loading);
  }, [operationName, setOperationLoading]);

  return { isLoading, setLoading };
};