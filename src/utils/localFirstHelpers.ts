/**
 * 🔒 LOCAL-FIRST CHAT & BOOKING HELPERS
 * 
 * Reusable functions for chat window operations:
 * - Adding messages
 * - Updating booking drafts
 * - Validating required fields
 * - Real-time state from localStorage
 * 
 * @author Expert Full-Stack Developer
 * @date 2026-01-28
 */

import { chatLocalStorage, ChatMessage } from '../services/localStorage/chatLocalStorage';
import { bookingLocalStorage, BookingDraft } from '../services/localStorage/bookingLocalStorage';
import { backendSyncService } from '../services/localStorage/backendSyncService';

// ============================================================================
// MESSAGE OPERATIONS
// ============================================================================

/**
 * Add chat message (localStorage only)
 * 
 * FLOW:
 * 1. Save to localStorage
 * 2. Update UI immediately
 * 3. Sync happens in background
 */
export async function addChatMessage(params: {
  chatRoomId: string;
  senderId: string;
  senderType: 'user' | 'therapist' | 'place' | 'system';
  senderName: string;
  message: string;
  messageType?: 'text' | 'image' | 'location' | 'booking-update' | 'system';
  metadata?: Record<string, any>;
}): Promise<ChatMessage> {
  console.log('💬 [ChatHelper] Adding message to localStorage');

  // Add to localStorage (instant)
  const message = chatLocalStorage.addMessage({
    chatRoomId: params.chatRoomId,
    senderId: params.senderId,
    senderType: params.senderType,
    senderName: params.senderName,
    message: params.message,
    messageType: params.messageType || 'text',
    createdAt: new Date().toISOString(),
    isRead: false,
    metadata: params.metadata
  });

  console.log('✅ [ChatHelper] Message added to localStorage:', message.id);

  // Sync will happen automatically via auto-save or manual trigger
  return message;
}

/**
 * Get all messages for chat room (from localStorage)
 */
export function getChatMessages(chatRoomId: string): ChatMessage[] {
  return chatLocalStorage.getMessagesByChatRoom(chatRoomId);
}

/**
 * Add system notification
 */
export async function addSystemNotification(params: {
  chatRoomId: string;
  message: string;
  metadata?: Record<string, any>;
}): Promise<ChatMessage> {
  return addChatMessage({
    chatRoomId: params.chatRoomId,
    senderId: 'system',
    senderType: 'system',
    senderName: 'System',
    message: params.message,
    messageType: 'system',
    metadata: params.metadata
  });
}

// ============================================================================
// BOOKING DRAFT OPERATIONS
// ============================================================================

/**
 * Update booking draft (localStorage only)
 * 
 * FLOW:
 * 1. Update localStorage
 * 2. Validate immediately
 * 3. Update UI buttons state
 * 4. No backend call
 */
export function updateBookingDraft(updates: Partial<BookingDraft>): BookingDraft {
  console.log('📦 [BookingHelper] Updating booking draft');

  const draft = bookingLocalStorage.upsertDraft(updates);

  console.log('✅ [BookingHelper] Draft updated:', {
    id: draft.id,
    isValid: draft.isValid,
    errors: draft.validationErrors
  });

  return draft;
}

/**
 * Get active booking draft (from localStorage)
 */
export function getBookingDraft(): BookingDraft | null {
  return bookingLocalStorage.getActiveDraft();
}

/**
 * Update booking draft field
 */
export function updateBookingField<K extends keyof BookingDraft>(
  field: K,
  value: BookingDraft[K]
): BookingDraft | null {
  return bookingLocalStorage.updateDraftField(field, value);
}

/**
 * Validate booking draft
 */
export function validateBooking(draft?: BookingDraft): {
  isValid: boolean;
  errors: string[];
} {
  const currentDraft = draft || bookingLocalStorage.getActiveDraft();
  
  if (!currentDraft) {
    return {
      isValid: false,
      errors: ['No active booking draft']
    };
  }

  return bookingLocalStorage.validateDraft(currentDraft);
}

/**
 * Get missing required fields
 */
export function getMissingFields(draft?: BookingDraft): string[] {
  const currentDraft = draft || bookingLocalStorage.getActiveDraft();
  
  if (!currentDraft) {
    return ['No active booking'];
  }

  return bookingLocalStorage.getMissingFields(currentDraft);
}

// ============================================================================
// BOOKING CONFIRMATION (triggers sync)
// ============================================================================

/**
 * Confirm booking (triggers backend sync)
 * 
 * FLOW:
 * 1. Validate booking draft
 * 2. Move to confirmed bookings in localStorage
 * 3. Trigger sync to Appwrite backend
 * 4. Backend calculates 30% commission
 * 5. Return success/failure
 */
export async function confirmBooking(draftId?: string): Promise<{
  success: boolean;
  bookingId?: string;
  error?: string;
}> {
  console.log('✅ [BookingHelper] Confirming booking');

  try {
    // Get draft
    const draft = draftId 
      ? bookingLocalStorage.getDraftById(draftId)
      : bookingLocalStorage.getActiveDraft();

    if (!draft) {
      return {
        success: false,
        error: 'No booking draft found'
      };
    }

    // Validate
    const validation = bookingLocalStorage.validateDraft(draft);
    if (!validation.isValid) {
      return {
        success: false,
        error: `Validation failed: ${validation.errors.join(', ')}`
      };
    }

    // Confirm draft (moves to confirmed bookings)
    const confirmed = bookingLocalStorage.confirmDraft(draft.id);
    if (!confirmed) {
      return {
        success: false,
        error: 'Failed to confirm booking'
      };
    }

    // Trigger sync to backend
    console.log('🔄 [BookingHelper] Triggering sync to backend...');
    const syncResult = await backendSyncService.syncAll({ force: true });

    if (!syncResult.success) {
      console.error('❌ [BookingHelper] Sync failed:', syncResult.errors);
      return {
        success: false,
        error: `Sync failed: ${syncResult.errors[0]?.error || 'Unknown error'}`
      };
    }

    console.log('✅ [BookingHelper] Booking confirmed and synced:', confirmed.id);

    return {
      success: true,
      bookingId: confirmed.id
    };

  } catch (error: any) {
    console.error('❌ [BookingHelper] Confirmation failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================================
// CHAT SESSION MANAGEMENT
// ============================================================================

/**
 * Initialize chat session
 */
export function initializeChatSession(params: {
  chatRoomId: string;
  therapistId: string;
  therapistName: string;
  customerId: string;
  customerName: string;
}) {
  console.log('🚀 [ChatHelper] Initializing chat session');

  return chatLocalStorage.setSession({
    id: params.chatRoomId,
    chatRoomId: params.chatRoomId,
    therapistId: params.therapistId,
    therapistName: params.therapistName,
    customerId: params.customerId,
    customerName: params.customerName,
    isActive: true
  });
}

/**
 * End chat session and cleanup
 */
export async function endChatSession(): Promise<void> {
  console.log('🛑 [ChatHelper] Ending chat session');

  // End session
  chatLocalStorage.endSession();

  // Final sync before cleanup
  await backendSyncService.syncAll({ force: true });

  // Clear active draft (optional - comment out to keep for later)
  // bookingLocalStorage.clearActiveDraft();
}

// ============================================================================
// UI STATE HELPERS
// ============================================================================

/**
 * Check if booking is ready to confirm
 */
export function isBookingReadyToConfirm(): boolean {
  const draft = bookingLocalStorage.getActiveDraft();
  if (!draft) return false;

  const validation = bookingLocalStorage.validateDraft(draft);
  return validation.isValid;
}

/**
 * Get booking button state
 */
export function getBookingButtonState(): {
  enabled: boolean;
  label: string;
  missingFields: string[];
} {
  const draft = bookingLocalStorage.getActiveDraft();

  if (!draft) {
    return {
      enabled: false,
      label: 'Start Booking',
      missingFields: ['No booking started']
    };
  }

  const validation = bookingLocalStorage.validateDraft(draft);
  const missing = bookingLocalStorage.getMissingFields(draft);

  if (validation.isValid) {
    return {
      enabled: true,
      label: 'Confirm Booking',
      missingFields: []
    };
  }

  return {
    enabled: false,
    label: `Missing: ${missing.join(', ')}`,
    missingFields: missing
  };
}

/**
 * Get sync status for UI
 */
export function getSyncStatusUI(): {
  isSyncing: boolean;
  unsyncedCount: number;
  lastSync: string | null;
  needsSync: boolean;
} {
  const status = backendSyncService.getSyncStatus();

  return {
    isSyncing: status.isSyncing,
    unsyncedCount: status.unsyncedMessages + status.unsyncedBookings,
    lastSync: status.lastSync,
    needsSync: status.needsSync
  };
}

// ============================================================================
// COMMISSION CALCULATION (UI ONLY)
// ============================================================================

/**
 * Calculate commission for UI display
 * NOTE: Backend performs authoritative calculation
 */
export function calculateCommissionPreview(totalPrice: number): {
  totalPrice: number;
  adminCommission: number;
  providerPayout: number;
  commissionRate: number;
} {
  const commission = bookingLocalStorage.calculateCommission(totalPrice);

  return {
    totalPrice,
    adminCommission: commission.adminCommission,
    providerPayout: commission.providerPayout,
    commissionRate: 0.3 // 30%
  };
}
