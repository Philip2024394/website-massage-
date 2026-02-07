/**
 * 🔒 CORE SYSTEM LOCK - ENHANCED MENU DATA SERVICE
 * ================================================
 * 
 * ❌ PROHIBITED MODIFICATIONS:
 * - Badge generation algorithm and assignment logic
 * - Default service integration and visibility rules
 * - Menu state management and localStorage persistence
 * - Service booking integration and tracking
 * - Auto-hiding logic when real menu items are uploaded
 * 
 * ✅ SAFE UI MODIFICATIONS:
 * - Badge styling, animations, and visual appearance
 * - Service card layout and spacing
 * - Color schemes and visual themes
 * - Component positioning and responsive design
 * 
 * ⚠️ BUSINESS IMPACT: UX & DATA CRITICAL
 * This service manages:
 * - Dynamic badge system (New, Popular, Just Scheduled, Best Price)
 * - Session-consistent badge rotation and state
 * - Integration between default services and booking system
 * - Menu state persistence for optimal user experience
 * 
 * 🔒 PROTECTION LEVEL: HIGH - CORE FUNCTIONALITY
 */

import { DefaultMenuService, DefaultMenuManager } from './defaultMenuService';
import { BadgeType } from '../components/badges/ServiceBadges';

export interface MenuService extends DefaultMenuService {
  // Extended properties for enhanced functionality
  therapistId: string;
  dateAdded: Date;
  lastModified: Date;
  isActive: boolean;
  bookingCount: number;
  lastBookedAt?: Date;
  
  // Badge metadata
  badges?: BadgeType[];
  badgeRefreshKey?: string;
  
  // Therapist customization
  isCustomized: boolean; // Has therapist edited this default service?
  originalDefaultId?: string; // Reference to original default if customized
}

export interface MenuLoadResult {
  services: MenuService[];
  hasDefaults: boolean;
  hasReal: boolean;
  totalCount: number;
  lastUpdated: Date;
}

/**
 * 🎯 ENHANCED MENU DATA SERVICE
 * Handles default menu assignment, real menu integration, and badge system
 */
export class EnhancedMenuDataService {
  private static readonly STORAGE_KEY_PREFIX = 'therapist_menu_';
  private static readonly DEFAULT_ASSIGNMENT_KEY = 'default_assignment_';

  /**
   * Get complete menu data for a therapist
   * Returns real menu + defaults (filtered to avoid duplicates)
   */
  static async getTherapistMenu(therapistId: string): Promise<MenuLoadResult> {
    try {
      console.log(`📋 Loading menu for therapist ${therapistId}`);
      
      // 1. Load real menu data from database/API
      const realMenuData = await this.loadRealMenuData(therapistId);
      
      // 2. Load or generate default menu
      const defaultMenuData = await this.getDefaultMenuData(therapistId);
      
      // 3. Filter out defaults that conflict with real menu
      const filteredDefaults = this.filterConflictingDefaults(defaultMenuData, realMenuData);
      
      // 4. Combine and enhance with badge data
      const combinedServices = await this.combineAndEnhanceServices(
        realMenuData, 
        filteredDefaults, 
        therapistId
      );
      
      // 5. Sort by priority (real first, then by popularity/category)
      const sortedServices = this.sortServices(combinedServices);
      
      const result: MenuLoadResult = {
        services: sortedServices,
        hasDefaults: filteredDefaults.length > 0,
        hasReal: realMenuData.length > 0,
        totalCount: sortedServices.length,
        lastUpdated: new Date()
      };
      
      console.log(`✅ Menu loaded: ${result.totalCount} services (${realMenuData.length} real, ${filteredDefaults.length} defaults)`);
      
      return result;
      
    } catch (error) {
      console.error('❌ Error loading therapist menu:', error);
      
      // Fallback: return only defaults
      const defaultMenuData = await this.getDefaultMenuData(therapistId);
      const enhancedDefaults = await this.enhanceWithBadges(defaultMenuData, therapistId);
      
      return {
        services: enhancedDefaults,
        hasDefaults: true,
        hasReal: false,
        totalCount: enhancedDefaults.length,
        lastUpdated: new Date()
      };
    }
  }

  /**
   * Load real menu data from database/storage
   */
  private static async loadRealMenuData(therapistId: string): Promise<MenuService[]> {
    // TODO: Replace with actual API call
    // For now, simulate with localStorage
    
    const storageKey = `${this.STORAGE_KEY_PREFIX}${therapistId}`;
    const stored = localStorage.getItem(storageKey);
    
    if (!stored) {
      console.log(`📄 No real menu found for therapist ${therapistId}`);
      return [];
    }
    
    try {
      const parsedData = JSON.parse(stored);
      return parsedData.map((service: any) => ({
        ...service,
        isDefault: false,
        therapistId,
        dateAdded: new Date(service.dateAdded || Date.now()),
        lastModified: new Date(service.lastModified || Date.now()),
        isActive: service.isActive ?? true,
        bookingCount: service.bookingCount || 0,
        isCustomized: false,
        lastBookedAt: service.lastBookedAt ? new Date(service.lastBookedAt) : undefined
      }));
    } catch (error) {
      console.error('❌ Error parsing real menu data:', error);
      return [];
    }
  }

  /**
   * Get or generate default menu data for therapist
   */
  private static async getDefaultMenuData(therapistId: string): Promise<MenuService[]> {
    const assignmentKey = `${this.DEFAULT_ASSIGNMENT_KEY}${therapistId}`;
    let storedAssignment = localStorage.getItem(assignmentKey);
    
    if (!storedAssignment) {
      // Generate new default assignment
      const defaultServices = DefaultMenuManager.getDefaultMenuForTherapist(therapistId);
      
      // Convert to MenuService format
      const menuServices: MenuService[] = defaultServices.map(service => ({
        ...service,
        therapistId,
        dateAdded: new Date(),
        lastModified: new Date(),
        isActive: true,
        bookingCount: 0,
        isCustomized: false,
        originalDefaultId: service.id
      }));
      
      // Store assignment for consistency
      localStorage.setItem(assignmentKey, JSON.stringify(menuServices));
      console.log(`🎲 Generated new default menu for therapist ${therapistId}: ${menuServices.length} services`);
      
      return menuServices;
    }
    
    try {
      const parsedAssignment = JSON.parse(storedAssignment);
      return parsedAssignment.map((service: any) => ({
        ...service,
        dateAdded: new Date(service.dateAdded),
        lastModified: new Date(service.lastModified),
        lastBookedAt: service.lastBookedAt ? new Date(service.lastBookedAt) : undefined
      }));
    } catch (error) {
      console.error('❌ Error parsing default assignment:', error);
      // Regenerate if parsing fails
      return await this.getDefaultMenuData(therapistId);
    }
  }

  /**
   * Filter out default services that conflict with real menu
   */
  private static filterConflictingDefaults(
    defaultServices: MenuService[], 
    realServices: MenuService[]
  ): MenuService[] {
    return defaultServices.filter(defaultService => {
      const shouldReplace = DefaultMenuManager.shouldReplaceDefaultService(
        defaultService.name,
        realServices.map(s => ({ serviceName: s.name }))
      );
      
      if (shouldReplace) {
        console.log(`🔄 Filtering out default service "${defaultService.name}" - conflict with real menu`);
      }
      
      return !shouldReplace;
    });
  }

  /**
   * Combine real and default services with badge enhancement
   */
  private static async combineAndEnhanceServices(
    realServices: MenuService[],
    defaultServices: MenuService[],
    therapistId: string
  ): Promise<MenuService[]> {
    const combined = [...realServices, ...defaultServices];
    return await this.enhanceWithBadges(combined, therapistId);
  }

  /**
   * Enhance services with badge data
   */
  private static async enhanceWithBadges(
    services: MenuService[],
    therapistId: string
  ): Promise<MenuService[]> {
    const refreshKey = `${therapistId}-${Date.now().toString().slice(0, -5)}`;
    
    return services.map(service => {
      // Generate badges based on service characteristics
      const badges = this.generateBadgesForService(service);
      
      return {
        ...service,
        badges,
        badgeRefreshKey: refreshKey
      };
    });
  }

  /**
   * Generate appropriate badges for a service
   */
  private static generateBadgesForService(service: MenuService): BadgeType[] {
    const badges: BadgeType[] = [];
    
    // New badge - for recently added services
    const daysSinceAdded = (Date.now() - service.dateAdded.getTime()) / (1000 * 60 * 60 * 24);
    if (service.isNew || daysSinceAdded <= 7) {
      badges.push('NEW');
    }
    
    // Popular badge - for high booking count or high popularity
    if (service.bookingCount >= 10 || service.popularity >= 4) {
      badges.push('POPULAR');
    }
    
    // Just Scheduled badge - recently booked
    if (service.lastBookedAt) {
      const hoursSinceBooked = (Date.now() - service.lastBookedAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceBooked <= 24) {
        badges.push('JUST_SCHEDULED');
      }
    }
    
    // Best Price badge - for competitive pricing
    const avgPrice = (service.price60 + service.price90 + service.price120) / 3;
    if (avgPrice <= 150 || service.category === 'quick_express') {
      badges.push('BEST_PRICE');
    }
    
    // Limit to max 2 badges and ensure variety
    const shuffledBadges = badges.sort(() => Math.random() - 0.5);
    return shuffledBadges.slice(0, 2);
  }

  /**
   * Sort services by priority
   */
  private static sortServices(services: MenuService[]): MenuService[] {
    return services.sort((a, b) => {
      // Real services first
      if (!a.isDefault && b.isDefault) return -1;
      if (a.isDefault && !b.isDefault) return 1;
      
      // Within category, sort by popularity then by name
      if (a.popularity !== b.popularity) {
        return b.popularity - a.popularity;
      }
      
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Save a service (real or customized default)
   */
  static async saveService(
    therapistId: string, 
    service: Partial<MenuService>
  ): Promise<MenuService> {
    console.log(`💾 Saving service for therapist ${therapistId}:`, service.name);
    
    const storageKey = `${this.STORAGE_KEY_PREFIX}${therapistId}`;
    const existingData = localStorage.getItem(storageKey);
    const services: MenuService[] = existingData ? JSON.parse(existingData) : [];
    
    const now = new Date();
    const serviceToSave: MenuService = {
      id: service.id || `custom-${Date.now()}`,
      name: service.name || 'New Service',
      category: service.category || 'relaxation',
      description: service.description || '',
      price60: service.price60 || 150,
      price90: service.price90 || 200,
      price120: service.price120 || 280,
      isDefault: service.isDefault || false,
      popularity: service.popularity || 3,
      isNew: service.isNew || true,
      therapistId,
      dateAdded: service.dateAdded || now,
      lastModified: now,
      isActive: service.isActive ?? true,
      bookingCount: service.bookingCount || 0,
      isCustomized: service.isCustomized || false,
      originalDefaultId: service.originalDefaultId
    };
    
    // Update existing or add new
    const existingIndex = services.findIndex(s => s.id === serviceToSave.id);
    if (existingIndex >= 0) {
      services[existingIndex] = serviceToSave;
    } else {
      services.push(serviceToSave);
    }
    
    localStorage.setItem(storageKey, JSON.stringify(services));
    
    return serviceToSave;
  }

  /**
   * Delete a service
   */
  static async deleteService(therapistId: string, serviceId: string): Promise<boolean> {
    console.log(`🗑️ Deleting service ${serviceId} for therapist ${therapistId}`);
    
    const storageKey = `${this.STORAGE_KEY_PREFIX}${therapistId}`;
    const existingData = localStorage.getItem(storageKey);
    
    if (!existingData) return false;
    
    try {
      const services: MenuService[] = JSON.parse(existingData);
      const filteredServices = services.filter(s => s.id !== serviceId);
      
      localStorage.setItem(storageKey, JSON.stringify(filteredServices));
      
      return true;
    } catch (error) {
      console.error('❌ Error deleting service:', error);
      return false;
    }
  }

  /**
   * Mark service as booked (updates badges)
   */
  static async markServiceBooked(
    therapistId: string, 
    serviceId: string
  ): Promise<void> {
    console.log(`📅 Marking service ${serviceId} as booked`);
    
    const menu = await this.getTherapistMenu(therapistId);
    const service = menu.services.find(s => s.id === serviceId);
    
    if (service) {
      service.bookingCount = (service.bookingCount || 0) + 1;
      service.lastBookedAt = new Date();
      
      await this.saveService(therapistId, service);
    }
  }

  /**
   * Clear all default assignments (force regeneration)
   */
  static clearDefaultAssignments(): void {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.DEFAULT_ASSIGNMENT_KEY)) {
        localStorage.removeItem(key);
      }
    });
    console.log('🔄 Cleared all default menu assignments');
  }

  /**
   * Export therapist menu for backup/migration
   */
  static exportTherapistMenu(therapistId: string): string {
    const realStorageKey = `${this.STORAGE_KEY_PREFIX}${therapistId}`;
    const defaultStorageKey = `${this.DEFAULT_ASSIGNMENT_KEY}${therapistId}`;
    
    const realData = localStorage.getItem(realStorageKey);
    const defaultData = localStorage.getItem(defaultStorageKey);
    
    return JSON.stringify({
      therapistId,
      exportDate: new Date().toISOString(),
      realMenu: realData ? JSON.parse(realData) : [],
      defaultAssignment: defaultData ? JSON.parse(defaultData) : []
    }, null, 2);
  }

  /**
   * Import therapist menu from backup
   */
  static importTherapistMenu(therapistId: string, exportedData: string): boolean {
    try {
      const data = JSON.parse(exportedData);
      
      if (data.realMenu?.length > 0) {
        const realStorageKey = `${this.STORAGE_KEY_PREFIX}${therapistId}`;
        localStorage.setItem(realStorageKey, JSON.stringify(data.realMenu));
      }
      
      if (data.defaultAssignment?.length > 0) {
        const defaultStorageKey = `${this.DEFAULT_ASSIGNMENT_KEY}${therapistId}`;
        localStorage.setItem(defaultStorageKey, JSON.stringify(data.defaultAssignment));
      }
      
      console.log(`✅ Imported menu data for therapist ${therapistId}`);
      return true;
    } catch (error) {
      console.error('❌ Error importing menu data:', error);
      return false;
    }
  }
}

export default EnhancedMenuDataService;