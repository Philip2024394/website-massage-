import { useState, useCallback, useEffect } from 'react';

/**
 * Hook for managing dynamic badge sessions
 * Provides functionality to refresh badges per user session or on-demand
 */
export function useBadgeSession() {
  const [refreshKey, setRefreshKey] = useState<string>(Date.now().toString());
  
  // Generate new badge session (refreshes all badges)
  const refreshBadges = useCallback(() => {
    setRefreshKey(Date.now().toString());
  }, []);
  
  // Auto-refresh badges every 5 minutes to create a "lively" interface
  useEffect(() => {
    const interval = setInterval(() => {
      refreshBadges();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(interval);
  }, [refreshBadges]);
  
  return {
    refreshKey,
    refreshBadges
  };
}

/**
 * Hook for badge configuration management
 * Allows customization of badge behavior per component
 */
export function useBadgeConfig(initialConfig?: BadgeConfigOptions) {
  const [config, setConfig] = useState<BadgeConfig>({
    showBadges: initialConfig?.showBadges ?? true,
    maxBadges: initialConfig?.maxBadges ?? 2,
    animate: initialConfig?.animate ?? true,
    autoRefresh: initialConfig?.autoRefresh ?? true,
    refreshInterval: initialConfig?.refreshInterval ?? 5 * 60 * 1000 // 5 minutes
  });
  
  const updateConfig = useCallback((updates: Partial<BadgeConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);
  
  return {
    config,
    updateConfig
  };
}

// Types
interface BadgeConfigOptions {
  showBadges?: boolean;
  maxBadges?: 1 | 2;
  animate?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface BadgeConfig extends Required<BadgeConfigOptions> {}

export type { BadgeConfigOptions, BadgeConfig };