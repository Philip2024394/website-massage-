/**
 * 🔒 CORE SYSTEM LOCK - ENHANCED MENU DATA HOOKS
 * ===============================================
 * 
 * 🔒 LOCKED FUNCTIONALITY (DO NOT MODIFY):
 * - Menu data loading and state management logic
 * - Badge system integration and session consistency
 * - Default/real menu detection and switching logic
 * - Service data transformation and caching
 * - Real-time data updates and synchronization
 * - Error handling and loading state management
 * 
 * ⚠️ BUSINESS IMPACT: SYSTEM INTEGRITY CRITICAL
 * This hook manages:
 * - All therapist menu data loading and state
 * - Badge refresh and session management
 * - Integration between default services and real services
 * - Component state consistency across UI updates
 * - Data persistence and localStorage synchronization
 * 
 * 🔒 PROTECTION LEVEL: HIGH - DATA MANAGEMENT LAYER
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import EnhancedMenuDataService, { MenuService, MenuLoadResult } from '../services/enhancedMenuDataService';
import { useBadgeSession } from './useBadgeSession';

interface UseEnhancedMenuDataResult {
  // Menu data
  menuData: MenuService[];
  menuLoadResult: MenuLoadResult | null;
  isLoading: boolean;
  error: string | null;
  
  // Status flags
  hasDefaultMenu: boolean;
  hasRealMenu: boolean;
  totalServices: number;
  
  // Badge system integration
  badgeRefreshKey: string;
  refreshBadges: () => void;
  
  // Service management
  addService: (service: Partial<MenuService>) => Promise<void>;
  updateService: (serviceId: string, updates: Partial<MenuService>) => Promise<void>;
  deleteService: (serviceId: string) => Promise<void>;
  
  // Booking integration
  markServiceBooked: (serviceId: string) => Promise<void>;
  
  // Menu management
  refreshMenu: () => Promise<void>;
  clearDefaultAssignments: () => void;
  exportMenu: () => string;
  importMenu: (data: string) => boolean;
}

/** Profile prices from dashboard (60/90/120 in thousands). When set, "Traditional Massage" is added to slider from these. */
export type ProfilePrices = { price60: number; price90: number; price120: number } | null | undefined;

/**
 * 🎯 ENHANCED MENU DATA HOOK
 * Provides comprehensive menu management with default fallback and badge integration.
 * When profilePrices is provided (from dashboard 3 prices), "Traditional Massage" is injected into the slider with those prices.
 */
export function useEnhancedMenuData(
  therapistId: string,
  profilePrices?: ProfilePrices
): UseEnhancedMenuDataResult {
  const [menuLoadResult, setMenuLoadResult] = useState<MenuLoadResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Badge system integration
  const { refreshKey: badgeRefreshKey, refreshBadges } = useBadgeSession();
  
  // Load menu data (include profile prices so Traditional Massage from dashboard appears in slider)
  const loadMenu = useCallback(async () => {
    if (!therapistId) {
      console.warn('⚠️ useEnhancedMenuData: No therapist ID provided, cannot load menu');
      setError('Therapist ID is required');
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const hasProfilePrices =
        profilePrices &&
        Number(profilePrices.price60) > 0 &&
        Number(profilePrices.price90) > 0 &&
        Number(profilePrices.price120) > 0;
      
      console.log(`📋 useEnhancedMenuData: Loading enhanced menu for therapist: ${therapistId}`, hasProfilePrices ? '(with profile Traditional Massage)' : '');
      
      const result = await EnhancedMenuDataService.getTherapistMenu(
        therapistId,
        hasProfilePrices ? profilePrices! : undefined
      );
      
      console.log(`✅ useEnhancedMenuData: Menu loaded successfully:`, {
        therapistId,
        totalServices: result.totalCount,
        hasReal: result.hasReal,
        hasDefaults: result.hasDefaults,
        services: result.services.map(s => s.name)
      });
      
      setMenuLoadResult(result);
      
    } catch (err) {
      console.error('❌ useEnhancedMenuData: Error loading menu:', err);
      setError(err instanceof Error ? err.message : 'Failed to load menu');
      
      // Provide empty fallback
      setMenuLoadResult({
        services: [],
        hasDefaults: false,
        hasReal: false,
        totalCount: 0,
        lastUpdated: new Date()
      });
    } finally {
      setIsLoading(false);
    }
  }, [therapistId, profilePrices]);
  
  // 🎯 GOLD STANDARD: Initial load with unmount cleanup
  useEffect(() => {
    let isMounted = true;
    
    const loadWithCleanup = async () => {
      if (isMounted) {
        await loadMenu();
      }
    };
    
    loadWithCleanup();
    
    return () => {
      isMounted = false;
    };
  }, [loadMenu]);
  
  // Refresh menu
  const refreshMenu = useCallback(async () => {
    await loadMenu();
    refreshBadges(); // Also refresh badges
  }, [loadMenu, refreshBadges]);
  
  // Add new service
  const addService = useCallback(async (service: Partial<MenuService>) => {
    try {
      console.log('➕ Adding new service:', service.name);
      
      await EnhancedMenuDataService.saveService(therapistId, {
        ...service,
        isDefault: false, // New services are always real/custom
        isNew: true,
        dateAdded: new Date()
      });
      
      await refreshMenu();
      
    } catch (err) {
      console.error('❌ Error adding service:', err);
      setError(err instanceof Error ? err.message : 'Failed to add service');
    }
  }, [therapistId, refreshMenu]);
  
  // Update existing service (sample items cannot be updated)
  const updateService = useCallback(async (serviceId: string, updates: Partial<MenuService>) => {
    try {
      const currentService = menuLoadResult?.services.find(s => s.id === serviceId);
      if (!currentService) {
        throw new Error('Service not found');
      }
      if ((currentService as any).isSampleMenu) {
        console.warn('⚠️ Sample menu items cannot be edited');
        return;
      }
      
      console.log('✏️ Updating service:', serviceId);
      await EnhancedMenuDataService.saveService(therapistId, {
        ...currentService,
        ...updates,
        lastModified: new Date(),
        isCustomized: currentService.isDefault // Mark as customized if it was a default
      });
      
      await refreshMenu();
      
    } catch (err) {
      console.error('❌ Error updating service:', err);
      setError(err instanceof Error ? err.message : 'Failed to update service');
    }
  }, [therapistId, menuLoadResult, refreshMenu]);
  
  // Delete service (sample items cannot be deleted)
  const deleteService = useCallback(async (serviceId: string) => {
    try {
      const currentService = menuLoadResult?.services.find(s => s.id === serviceId);
      if (currentService && (currentService as any).isSampleMenu) {
        console.warn('⚠️ Sample menu items cannot be deleted');
        return;
      }
      
      console.log('🗑️ Deleting service:', serviceId);
      const success = await EnhancedMenuDataService.deleteService(therapistId, serviceId);
      
      if (!success) {
        throw new Error('Failed to delete service');
      }
      
      await refreshMenu();
      
    } catch (err) {
      console.error('❌ Error deleting service:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete service');
    }
  }, [therapistId, menuLoadResult, refreshMenu]);
  
  // Mark service as booked (for badge updates)
  const markServiceBooked = useCallback(async (serviceId: string) => {
    try {
      await EnhancedMenuDataService.markServiceBooked(therapistId, serviceId);
      
      // Refresh quietly (don't show loading state)
      const result = await EnhancedMenuDataService.getTherapistMenu(therapistId);
      setMenuLoadResult(result);
      
    } catch (err) {
      console.error('❌ Error marking service as booked:', err);
      // Don't set error state for this operation
    }
  }, [therapistId]);
  
  // Clear default assignments
  const clearDefaultAssignments = useCallback(() => {
    EnhancedMenuDataService.clearDefaultAssignments();
    refreshMenu();
  }, [refreshMenu]);
  
  // Export menu
  const exportMenu = useCallback(() => {
    return EnhancedMenuDataService.exportTherapistMenu(therapistId);
  }, [therapistId]);
  
  // Import menu
  const importMenu = useCallback((data: string) => {
    const success = EnhancedMenuDataService.importTherapistMenu(therapistId, data);
    if (success) {
      refreshMenu();
    }
    return success;
  }, [therapistId, refreshMenu]);
  
  // Derived state
  const derivedState = useMemo(() => {
    const services = menuLoadResult?.services || [];
    
    return {
      menuData: services,
      hasDefaultMenu: menuLoadResult?.hasDefaults || false,
      hasRealMenu: menuLoadResult?.hasReal || false,
      totalServices: menuLoadResult?.totalCount || 0
    };
  }, [menuLoadResult]);
  
  return {
    // Menu data
    ...derivedState,
    menuLoadResult,
    isLoading,
    error,
    
    // Badge system integration
    badgeRefreshKey,
    refreshBadges,
    
    // Service management
    addService,
    updateService,
    deleteService,
    
    // Booking integration
    markServiceBooked,
    
    // Menu management
    refreshMenu,
    clearDefaultAssignments,
    exportMenu,
    importMenu
  };
}

/**
 * 🔗 COMPATIBILITY HOOK
 * Provides backward compatibility with existing useTherapistCardState.
 * When therapist is provided, their dashboard 3 prices (price60/90/120) are used to inject
 * "Traditional Massage" into the price slider; if it is the lowest, it is shown on profile.
 */
export function useCompatibleMenuData(
  therapistId: string,
  therapist?: { price60?: string | number; price90?: string | number; price120?: string | number } | null
) {
  const profilePrices = useMemo(() => {
    if (!therapist) return undefined;
    const p60 = Number(therapist.price60) || 0;
    const p90 = Number(therapist.price90) || 0;
    const p120 = Number(therapist.price120) || 0;
    if (p60 > 0 && p90 > 0 && p120 > 0) return { price60: p60, price90: p90, price120: p120 };
    return undefined;
  }, [therapist?.price60, therapist?.price90, therapist?.price120]);
  
  const enhancedMenuData = useEnhancedMenuData(therapistId, profilePrices);
  
  // Transform to legacy format
  const legacyFormat = useMemo(() => {
    const transformed = enhancedMenuData.menuData.map(service => ({
      id: service.id,
      serviceName: service.name,
      description: service.description,
      price60: service.price60.toString(),
      price90: service.price90.toString(),
      price120: service.price120.toString(),
      // Legacy compatibility fields
      name: service.name,
      min60: '60', // Default minimum duration
      min90: '90',
      min120: '120'
    }));
    
    return transformed;
  }, [enhancedMenuData.menuData, therapistId]);
  
  return {
    // Legacy format for existing components
    menuData: legacyFormat,
    
    // Enhanced functionality exposed
    enhancedMenuData,
    
    // Status helpers
    isDefaultMenu: enhancedMenuData.hasDefaultMenu && !enhancedMenuData.hasRealMenu,
    hasAnyMenu: enhancedMenuData.totalServices > 0,
    
    // Quick actions
    refreshMenu: enhancedMenuData.refreshMenu,
    addService: enhancedMenuData.addService,
    updateService: enhancedMenuData.updateService,
    deleteService: enhancedMenuData.deleteService
  };
}

export default useEnhancedMenuData;