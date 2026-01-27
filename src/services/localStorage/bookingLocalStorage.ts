/**
 * 🔒 BOOKING LOCAL STORAGE SERVICE
 * 
 * Local-first booking draft storage:
 * - Store booking data in localStorage while user interacts
 * - No direct backend calls until confirmation
 * - Sync to Appwrite only on booking confirmation
 * - Upsert behavior to prevent duplicates
 * 
 * @author Expert Full-Stack Developer
 * @date 2026-01-28
 */

import { localStorageManager } from './localStorageManager';

export interface BookingDraft {
  id: string;
  chatRoomId: string;
  
  // Provider info
  therapistId: string;
  therapistName: string;
  therapistImage?: string;
  providerType: 'therapist' | 'place' | 'facial';
  
  // Customer info
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerWhatsApp?: string;
  customerAvatar?: string;
  
  // Service details
  serviceType: string;
  duration: number; // 60, 90, 120 minutes
  locationZone: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  address?: string;
  roomNumber?: string;
  
  // Booking type
  bookingType: 'immediate' | 'scheduled';
  scheduledDate?: string;
  scheduledTime?: string;
  
  // Pricing (calculated on frontend, verified on backend)
  totalPrice: number;
  originalPrice?: number;
  discountCode?: string;
  discountPercentage?: number;
  discountedPrice?: number;
  
  // Status
  status: 'draft' | 'pending' | 'confirmed' | 'cancelled';
  synced: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  
  // Validation
  isValid: boolean;
  validationErrors: string[];
}

export interface BookingValidationRules {
  requireCustomerName: boolean;
  requireCustomerPhone: boolean;
  requireDuration: boolean;
  requireLocation: boolean;
  minDuration: number;
  maxDuration: number;
}

/**
 * Booking localStorage Service - Draft Management
 */
class BookingLocalStorageService {
  private DRAFTS_KEY = 'booking_drafts';
  private ACTIVE_DRAFT_KEY = 'active_booking_draft';
  private CONFIRMED_BOOKINGS_KEY = 'confirmed_bookings';

  // Validation rules
  private validationRules: BookingValidationRules = {
    requireCustomerName: true,
    requireCustomerPhone: true,
    requireDuration: true,
    requireLocation: false,
    minDuration: 60,
    maxDuration: 120
  };

  // ============================================================================
  // DRAFT OPERATIONS
  // ============================================================================

  /**
   * Create or update booking draft
   * 
   * FLOW:
   * 1. User selects duration → Save to localStorage
   * 2. User enters details → Update localStorage
   * 3. User clicks confirm → Sync to backend
   */
  upsertDraft(draft: Partial<BookingDraft>): BookingDraft {
    console.log('📦 [BookingLocalStorage] Upserting booking draft');
    
    const existingDraft = this.getActiveDraft();
    const now = new Date().toISOString();
    
    const newDraft: BookingDraft = {
      id: existingDraft?.id || this.generateDraftId(),
      chatRoomId: draft.chatRoomId || existingDraft?.chatRoomId || '',
      
      // Provider
      therapistId: draft.therapistId || existingDraft?.therapistId || '',
      therapistName: draft.therapistName || existingDraft?.therapistName || '',
      therapistImage: draft.therapistImage || existingDraft?.therapistImage,
      providerType: draft.providerType || existingDraft?.providerType || 'therapist',
      
      // Customer
      customerId: draft.customerId || existingDraft?.customerId || '',
      customerName: draft.customerName || existingDraft?.customerName || '',
      customerPhone: draft.customerPhone || existingDraft?.customerPhone || '',
      customerWhatsApp: draft.customerWhatsApp || existingDraft?.customerWhatsApp,
      customerAvatar: draft.customerAvatar || existingDraft?.customerAvatar,
      
      // Service
      serviceType: draft.serviceType || existingDraft?.serviceType || '',
      duration: draft.duration || existingDraft?.duration || 60,
      locationZone: draft.locationZone || existingDraft?.locationZone || '',
      coordinates: draft.coordinates || existingDraft?.coordinates,
      address: draft.address || existingDraft?.address,
      roomNumber: draft.roomNumber || existingDraft?.roomNumber,
      
      // Type
      bookingType: draft.bookingType || existingDraft?.bookingType || 'immediate',
      scheduledDate: draft.scheduledDate || existingDraft?.scheduledDate,
      scheduledTime: draft.scheduledTime || existingDraft?.scheduledTime,
      
      // Pricing
      totalPrice: draft.totalPrice || existingDraft?.totalPrice || 0,
      originalPrice: draft.originalPrice || existingDraft?.originalPrice,
      discountCode: draft.discountCode || existingDraft?.discountCode,
      discountPercentage: draft.discountPercentage || existingDraft?.discountPercentage,
      discountedPrice: draft.discountedPrice || existingDraft?.discountedPrice,
      
      // Status
      status: draft.status || existingDraft?.status || 'draft',
      synced: draft.synced || false,
      
      // Timestamps
      createdAt: existingDraft?.createdAt || now,
      updatedAt: now,
      confirmedAt: draft.confirmedAt || existingDraft?.confirmedAt,
      
      // Validation
      isValid: false,
      validationErrors: []
    };

    // Validate draft
    const validation = this.validateDraft(newDraft);
    newDraft.isValid = validation.isValid;
    newDraft.validationErrors = validation.errors;

    // Save to localStorage
    localStorageManager.set(this.ACTIVE_DRAFT_KEY, newDraft);
    
    // Also save to drafts collection
    this.saveDraftToCollection(newDraft);
    
    console.log('✅ [BookingLocalStorage] Draft saved:', {
      id: newDraft.id,
      isValid: newDraft.isValid,
      errors: newDraft.validationErrors
    });
    
    return newDraft;
  }

  /**
   * Get active booking draft
   */
  getActiveDraft(): BookingDraft | null {
    return localStorageManager.get<BookingDraft>(this.ACTIVE_DRAFT_KEY);
  }

  /**
   * Update draft field
   */
  updateDraftField<K extends keyof BookingDraft>(
    field: K, 
    value: BookingDraft[K]
  ): BookingDraft | null {
    console.log(`📝 [BookingLocalStorage] Updating field: ${field}`);
    
    const draft = this.getActiveDraft();
    if (!draft) {
      console.warn('⚠️ [BookingLocalStorage] No active draft found');
      return null;
    }

    draft[field] = value;
    draft.updatedAt = new Date().toISOString();

    // Re-validate
    const validation = this.validateDraft(draft);
    draft.isValid = validation.isValid;
    draft.validationErrors = validation.errors;

    localStorageManager.set(this.ACTIVE_DRAFT_KEY, draft);
    this.saveDraftToCollection(draft);
    
    return draft;
  }

  /**
   * Clear active draft
   */
  clearActiveDraft(): boolean {
    console.log('🗑️ [BookingLocalStorage] Clearing active draft');
    return localStorageManager.remove(this.ACTIVE_DRAFT_KEY);
  }

  // ============================================================================
  // VALIDATION
  // ============================================================================

  /**
   * Validate booking draft
   */
  validateDraft(draft: BookingDraft): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (this.validationRules.requireCustomerName && !draft.customerName?.trim()) {
      errors.push('Customer name is required');
    }

    if (this.validationRules.requireCustomerPhone && !draft.customerPhone?.trim()) {
      errors.push('Customer phone is required');
    }

    if (this.validationRules.requireDuration && !draft.duration) {
      errors.push('Duration is required');
    }

    if (this.validationRules.requireLocation && !draft.locationZone) {
      errors.push('Location is required');
    }

    // Duration validation
    if (draft.duration) {
      if (draft.duration < this.validationRules.minDuration) {
        errors.push(`Duration must be at least ${this.validationRules.minDuration} minutes`);
      }
      if (draft.duration > this.validationRules.maxDuration) {
        errors.push(`Duration cannot exceed ${this.validationRules.maxDuration} minutes`);
      }
    }

    // Phone validation
    if (draft.customerPhone) {
      const cleanPhone = draft.customerPhone.replace(/\D/g, '');
      if (cleanPhone.length < 8 || cleanPhone.length > 15) {
        errors.push('Invalid phone number format');
      }
    }

    // Scheduled booking validation
    if (draft.bookingType === 'scheduled') {
      if (!draft.scheduledDate) {
        errors.push('Scheduled date is required');
      }
      if (!draft.scheduledTime) {
        errors.push('Scheduled time is required');
      }
    }

    // Price validation
    if (!draft.totalPrice || draft.totalPrice <= 0) {
      errors.push('Invalid price');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get required fields that are missing
   */
  getMissingFields(draft: BookingDraft): string[] {
    const missing: string[] = [];

    if (!draft.customerName?.trim()) missing.push('customerName');
    if (!draft.customerPhone?.trim()) missing.push('customerPhone');
    if (!draft.duration) missing.push('duration');
    if (draft.bookingType === 'scheduled') {
      if (!draft.scheduledDate) missing.push('scheduledDate');
      if (!draft.scheduledTime) missing.push('scheduledTime');
    }

    return missing;
  }

  // ============================================================================
  // DRAFT COLLECTION MANAGEMENT
  // ============================================================================

  /**
   * Save draft to collection (for history)
   */
  private saveDraftToCollection(draft: BookingDraft): boolean {
    const drafts = this.getAllDrafts();
    const index = drafts.findIndex(d => d.id === draft.id);
    
    if (index >= 0) {
      drafts[index] = draft;
    } else {
      drafts.push(draft);
    }

    return localStorageManager.set(this.DRAFTS_KEY, drafts);
  }

  /**
   * Get all drafts
   */
  getAllDrafts(): BookingDraft[] {
    return localStorageManager.get<BookingDraft[]>(this.DRAFTS_KEY) || [];
  }

  /**
   * Get draft by ID
   */
  getDraftById(id: string): BookingDraft | null {
    const drafts = this.getAllDrafts();
    return drafts.find(d => d.id === id) || null;
  }

  /**
   * Clear all drafts
   */
  clearAllDrafts(): boolean {
    console.log('🗑️ [BookingLocalStorage] Clearing all drafts');
    localStorageManager.remove(this.DRAFTS_KEY);
    localStorageManager.remove(this.ACTIVE_DRAFT_KEY);
    return true;
  }

  // ============================================================================
  // CONFIRMED BOOKINGS
  // ============================================================================

  /**
   * Move draft to confirmed bookings
   */
  confirmDraft(draftId: string): BookingDraft | null {
    console.log('✅ [BookingLocalStorage] Confirming draft:', draftId);
    
    const draft = this.getDraftById(draftId);
    if (!draft) return null;

    draft.status = 'confirmed';
    draft.confirmedAt = new Date().toISOString();
    draft.synced = false; // Will be synced by sync service

    // Save to confirmed bookings
    const confirmed = localStorageManager.get<BookingDraft[]>(this.CONFIRMED_BOOKINGS_KEY) || [];
    confirmed.push(draft);
    localStorageManager.set(this.CONFIRMED_BOOKINGS_KEY, confirmed);

    // Clear active draft
    this.clearActiveDraft();

    return draft;
  }

  /**
   * Get all confirmed bookings pending sync
   */
  getUnsyncedBookings(): BookingDraft[] {
    const confirmed = localStorageManager.get<BookingDraft[]>(this.CONFIRMED_BOOKINGS_KEY) || [];
    return confirmed.filter(b => !b.synced && b.status === 'confirmed');
  }

  /**
   * Mark booking as synced
   */
  markBookingSynced(bookingId: string): boolean {
    console.log('✅ [BookingLocalStorage] Marking booking synced:', bookingId);
    
    const confirmed = localStorageManager.get<BookingDraft[]>(this.CONFIRMED_BOOKINGS_KEY) || [];
    const booking = confirmed.find(b => b.id === bookingId);
    
    if (!booking) return false;

    booking.synced = true;
    return localStorageManager.set(this.CONFIRMED_BOOKINGS_KEY, confirmed);
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Generate unique draft ID
   */
  private generateDraftId(): string {
    return `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate commission (30% admin, 70% provider)
   * NOTE: This is for UI display only
   * Backend performs authoritative calculation
   */
  calculateCommission(totalPrice: number): {
    adminCommission: number;
    providerPayout: number;
  } {
    const adminCommission = Math.round(totalPrice * 0.3);
    const providerPayout = totalPrice - adminCommission;
    
    return { adminCommission, providerPayout };
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const drafts = this.getAllDrafts();
    const confirmed = localStorageManager.get<BookingDraft[]>(this.CONFIRMED_BOOKINGS_KEY) || [];
    
    return {
      totalDrafts: drafts.length,
      activeDraft: this.getActiveDraft() !== null,
      confirmedBookings: confirmed.length,
      unsyncedBookings: confirmed.filter(b => !b.synced).length
    };
  }
}

// Export singleton instance
export const bookingLocalStorage = new BookingLocalStorageService();
