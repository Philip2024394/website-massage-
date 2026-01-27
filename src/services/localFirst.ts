/**
 * 🔒 LOCAL-FIRST SERVICES - EXPORT INDEX
 * 
 * Central export point for all local-first services
 * 
 * @author Expert Full-Stack Developer
 * @date 2026-01-28
 */

// ============================================================================
// CORE SERVICES
// ============================================================================

export { localStorageManager } from './localStorage/localStorageManager';
export type { LocalStorageOptions, StoredData } from './localStorage/localStorageManager';

export { chatLocalStorage } from './localStorage/chatLocalStorage';
export type { ChatMessage, ChatSession } from './localStorage/chatLocalStorage';

export { bookingLocalStorage } from './localStorage/bookingLocalStorage';
export type { 
  BookingDraft, 
  BookingValidationRules 
} from './localStorage/bookingLocalStorage';

export { backendSyncService } from './localStorage/backendSyncService';
export type { 
  SyncResult, 
  SyncOptions 
} from './localStorage/backendSyncService';

// ============================================================================
// HOOKS
// ============================================================================

export { useAutoSave, useDebounce } from '../hooks/useAutoSave';
export type { UseAutoSaveOptions } from '../hooks/useAutoSave';

// ============================================================================
// HELPERS
// ============================================================================

export {
  // Message operations
  addChatMessage,
  getChatMessages,
  addSystemNotification,
  
  // Booking operations
  updateBookingDraft,
  getBookingDraft,
  updateBookingField,
  validateBooking,
  getMissingFields,
  confirmBooking,
  
  // Session management
  initializeChatSession,
  endChatSession,
  
  // UI helpers
  isBookingReadyToConfirm,
  getBookingButtonState,
  getSyncStatusUI,
  calculateCommissionPreview
} from '../utils/localFirstHelpers';

// ============================================================================
// USAGE DOCUMENTATION
// ============================================================================

/**
 * QUICK START GUIDE
 * 
 * 1. Initialize Auto-Save in your component:
 * ```typescript
 * import { useAutoSave } from '@/services/localFirst';
 * 
 * const { triggerSync, getSyncStatus } = useAutoSave({
 *   enabled: true,
 *   interval: 45, // seconds
 *   syncOnUnmount: true,
 *   syncOnWindowClose: true
 * });
 * ```
 * 
 * 2. Add messages (no backend calls):
 * ```typescript
 * import { addChatMessage } from '@/services/localFirst';
 * 
 * await addChatMessage({
 *   chatRoomId: 'chat_123',
 *   senderId: 'user_456',
 *   senderType: 'user',
 *   senderName: 'John',
 *   message: 'Hello!'
 * });
 * // Message saved to localStorage instantly
 * // UI updates immediately
 * // Sync happens automatically in background
 * ```
 * 
 * 3. Update booking draft (no backend calls):
 * ```typescript
 * import { updateBookingDraft } from '@/services/localFirst';
 * 
 * updateBookingDraft({
 *   duration: 60,
 *   totalPrice: 450000,
 *   customerName: 'John Doe'
 * });
 * // Draft saved to localStorage instantly
 * // Validation runs automatically
 * // Button states update
 * ```
 * 
 * 4. Confirm booking (ONLY backend call):
 * ```typescript
 * import { confirmBooking } from '@/services/localFirst';
 * 
 * const result = await confirmBooking();
 * if (result.success) {
 *   console.log('Booking created:', result.bookingId);
 *   // Backend calculated 30% commission
 * }
 * ```
 * 
 * 5. Manual sync trigger:
 * ```typescript
 * import { backendSyncService } from '@/services/localFirst';
 * 
 * const result = await backendSyncService.syncAll({ force: true });
 * console.log('Synced:', result.syncedCount);
 * ```
 * 
 * 6. Check sync status:
 * ```typescript
 * import { getSyncStatusUI } from '@/services/localFirst';
 * 
 * const status = getSyncStatusUI();
 * console.log('Unsynced:', status.unsyncedCount);
 * console.log('Last sync:', status.lastSync);
 * ```
 */

/**
 * ARCHITECTURE FLOW
 * 
 * ┌──────────────┐
 * │ User Action  │
 * └──────┬───────┘
 *        │
 *        ▼
 * ┌──────────────────┐
 * │  localStorage    │ ← Instant write
 * │  (Draft/Message) │
 * └──────┬───────────┘
 *        │
 *        ▼
 * ┌──────────────┐
 * │  UI Update   │ ← Instant feedback
 * └──────┬───────┘
 *        │
 *        ▼
 * ┌─────────────────────────┐
 * │  Background Sync        │
 * │  (Auto-save/On Confirm) │ ← Async
 * └─────────┬───────────────┘
 *           │
 *           ▼
 * ┌────────────────────┐
 * │  Appwrite Backend  │ ← Authoritative
 * │  - Upsert check    │
 * │  - 30% commission  │
 * │  - Data integrity  │
 * └────────────────────┘
 */

/**
 * BENEFITS
 * 
 * ✅ Zero runtime errors from backend during user interaction
 * ✅ Instant UI updates (no loading spinners)
 * ✅ Offline support (sync when back online)
 * ✅ Auto-save every 30-60 seconds
 * ✅ Sync on window close
 * ✅ Upsert behavior prevents duplicates
 * ✅ Backend performs authoritative 30% commission calculation
 * ✅ Data integrity maintained
 * ✅ Responsive user experience
 */

/**
 * COMMISSION CALCULATION
 * 
 * ⚠️ CRITICAL: Two-phase calculation
 * 
 * Phase 1 (Frontend): Preview only
 * const preview = calculateCommissionPreview(450000);
 * // Display to user, NOT authoritative
 * 
 * Phase 2 (Backend): Authoritative during sync
 * const adminCommission = Math.round(totalPrice * 0.3);
 * // Used for actual payments and reports
 */
