/**
 * 🪝 React Hook for Chat Booking Storage
 * 
 * Provides easy access to elite storage service in React components
 * Now using modular architecture for better maintainability
 * Includes multi-language chat support
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import * as bookingDraft from '../booking/bookingDraft';
import * as bookingSync from '../booking/bookingSync';
import * as bookingValidator from '../booking/bookingValidator';
import * as chatStorage from '../chat/chatStorage';
import { chatAutosaveService } from '../chat/chatAutosave';
import { chatWindowService } from '../chat/chatWindow';
import { getUserLanguagePreference, setUserLanguagePreference } from '../utils/chatTranslation';
import { logger } from '../utils/logger';

// Re-export types for convenience
export type { BookingDraft, BookingDraftData } from '../booking/bookingDraft';
export type { ChatMessage, ChatSession } from '../chat/chatStorage';

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useChatBookingStorage(therapistId: string, sessionId: string) {
  const [draft, setDraft] = useState<bookingDraft.BookingDraft | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Language preferences
  const [userLanguage, setUserLanguage] = useState(getUserLanguagePreference());
  const [autoTranslate, setAutoTranslate] = useState(true);
  
  // Debounce timer for autosave
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  useEffect(() => {
    // Load existing draft on mount
    const existingDraft = bookingDraft.loadDraft(therapistId);
    if (existingDraft) {
      setDraft(existingDraft);
      logger.info('💾 Loaded existing draft from localStorage');
    }

    // Initialize chat session
    const chatSession = chatStorage.loadSession(sessionId) || chatStorage.createSession(sessionId);
    
    // Chat autosave is auto-initialized globally
    logger.info('✅ Chat booking storage initialized', {
      therapistId,
      sessionId,
      hasDraft: !!existingDraft
    });

    // Cleanup
    return () => {
      // Save any pending changes before unmounting
      if (hasUnsavedChanges && draft) {
        bookingDraft.saveDraft(draft);
      }
      chatAutosaveService.forceFlush();
    };
  }, [therapistId, sessionId]);

  // ==========================================================================
  // DRAFT OPERATIONS
  // ==========================================================================

  /**
   * Save draft (debounced to avoid excessive saves during typing)
   */
  const saveDraft = useCallback((data: Partial<bookingDraft.BookingDraftData>) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    setHasUnsavedChanges(true);

    // Debounce: save after 1 second of inactivity
    saveTimerRef.current = setTimeout(() => {
      setIsSaving(true);
      
      const success = bookingDraft.updateDraftFields(therapistId, data);

      if (success) {
        const updated = bookingDraft.loadDraft(therapistId);
        setDraft(updated);
        setLastSaved(new Date().toISOString());
        setHasUnsavedChanges(false);
      }
      
      setIsSaving(false);
    }, 1000);
  }, [therapistId]);

  /**
   * Save immediately (no debounce)
   */
  const saveDraftImmediately = useCallback((data: Partial<bookingDraft.BookingDraftData>) => {
    setIsSaving(true);
    
    const success = bookingDraft.updateDraftFields(therapistId, data);

    if (success) {
      const updated = bookingDraft.loadDraft(therapistId);
      setDraft(updated);
      setLastSaved(new Date().toISOString());
      setHasUnsavedChanges(false);
    }
    
    setIsSaving(false);
  }, [therapistId]);

  /**
   * Update single field
   */
  const updateField = useCallback(<K extends keyof bookingDraft.BookingDraftData>(
    field: K, 
    value: bookingDraft.BookingDraftData[K]
  ) => {
    const success = bookingDraft.updateDraftField(therapistId, field, value);
    
    if (success) {
      const updated = bookingDraft.loadDraft(therapistId);
      setDraft(updated);
      setHasUnsavedChanges(true);
    }
  }, [therapistId]);

  /**
   * Clear draft
   */
  const clearDraft = useCallback(() => {
    const success = bookingDraft.clearDraft(therapistId);
    
    if (success) {
      setDraft(null);
      setHasUnsavedChanges(false);
      setLastSaved(null);
    }
  }, [therapistId]);

  // ==========================================================================
  // BOOKING OPERATIONS
  // ==========================================================================

  /**
   * Prepare booking draft from form data
   */
  const prepareBooking = useCallback((data: Partial<bookingDraft.BookingDraftData>) => {
    const newDraft = bookingDraft.createDraft(therapistId, data);
    
    setDraft(newDraft);
    setHasUnsavedChanges(false);
    setLastSaved(new Date().toISOString());
    
    return newDraft;
  }, [therapistId]);

  /**
   * Confirm booking and sync to backend
   */
  const confirmBooking = useCallback(async (backendUrl: string) => {
    if (!draft) {
      logger.error('❌ No draft to confirm');
      return false;
    }
    
    setIsSyncing(true);
    
    try {
      const result = await bookingSync.syncDraftToBackend(draft, {
        url: backendUrl,
        validateBeforeSync: true,
        retryOnFailure: true
      });
      
      if (result.success) {
        bookingDraft.clearDraft(therapistId);
        setDraft(null);
        setHasUnsavedChanges(false);
        setLastSaved(null);
      }
      
      return result.success;
    } finally {
      setIsSyncing(false);
    }
  }, [draft, therapistId]);

  /**
   * Cancel booking
   */
  const cancelBooking = useCallback(() => {
    const success = bookingDraft.clearDraft(therapistId);
    
    if (success) {
      setDraft(null);
      setHasUnsavedChanges(false);
      setLastSaved(null);
    }
    
    return success;
  }, [therapistId]);

  // ==========================================================================
  // CHAT OPERATIONS
  // ==========================================================================

  /**
   * Add message to chat
   */
  const addMessage = useCallback((
    senderId: string,
    senderName: string,
    message: string,
    metadata?: any
  ) => {
    const messageId = chatWindowService.sendMessage(
      sessionId,
      senderId,
      senderName,
      message,
      metadata
    );
    
    return !!messageId;
  }, [sessionId]);

  /**
   * Delete message from chat
   */
  const deleteMessage = useCallback((messageId: string) => {
    return chatWindowService.deleteMessage(sessionId, messageId);
  }, [sessionId]);

  /**
   * Reset chat window
   */
  const resetChatWindow = useCallback((preserveBooking: boolean = true) => {
    return chatWindowService.clearMessages(sessionId);
  }, [sessionId]);

  /**
   * Save scroll position
   */
  const saveScrollPosition = useCallback((position: number) => {
    chatStorage.updateScrollPosition(sessionId, position);
  }, [sessionId]);

  // ==========================================================================
  // VALIDATION
  // ==========================================================================

  /**
   * Validate current draft
   */
  const validateDraft = useCallback(() => {
    if (!draft) return false;
    const result = bookingValidator.validateBookingDraft(draft);
    return result.isValid;
  }, [draft]);

  /**
   * Get validation errors
   */
  const getValidationErrors = useCallback((): string[] => {
    if (!draft) return ['No draft exists'];

    const result = bookingValidator.validateBookingDraft(draft);
    return result.errors;
  }, [draft]);

  // ==========================================================================
  // RETURN API
  // ==========================================================================

  return {
    // State
    draft,
    isSaving,
    isSyncing,
    lastSaved,
    hasUnsavedChanges,
    
    // Language preferences
    userLanguage,
    autoTranslate,

    // Draft operations
    saveDraft,
    saveDraftImmediately,
    updateField,
    clearDraft,

    // Booking operations
    prepareBooking,
    confirmBooking,
    cancelBooking,

    // Chat operations
    addMessage,
    deleteMessage,
    resetChatWindow,
    saveScrollPosition,

    // Validation
    validateDraft,
    getValidationErrors,
    
    // Language operations
    setLanguage: (lang: string) => {
      setUserLanguage(lang);
      setUserLanguagePreference(lang);
      chatWindowService.setLanguagePreference(sessionId, lang, autoTranslate);
    },
    toggleAutoTranslate: () => {
      setAutoTranslate(!autoTranslate);
      chatWindowService.setLanguagePreference(sessionId, userLanguage, !autoTranslate);
    },

    // Direct module access
    bookingDraft,
    bookingSync,
    bookingValidator,
    chatStorage,
    chatWindow: chatWindowService,
    chatAutosave: chatAutosaveService
  };
}

// ============================================================================
// ADDITIONAL HOOKS
// ============================================================================

/**
 * Hook for monitoring storage health
 */
export function useStorageHealth() {
  const [health, setHealth] = useState({
    localStorage: true,
    autosaveRunning: chatAutosaveService.getStatus().running,
    pendingSaves: chatAutosaveService.getStatus().pendingSaves
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const status = chatAutosaveService.getStatus();
      setHealth({
        localStorage: true, // Would need to implement check
        autosaveRunning: status.running,
        pendingSaves: status.pendingSaves
      });
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return health;
}

/**
 * Hook for autosave indicator
 */
export function useAutosaveIndicator(lastSaved: string | null) {
  const [indicator, setIndicator] = useState<string>('');

  useEffect(() => {
    if (!lastSaved) {
      setIndicator('');
      return;
    }

    const updateIndicator = () => {
      const now = new Date();
      const savedTime = new Date(lastSaved);
      const diffSeconds = Math.floor((now.getTime() - savedTime.getTime()) / 1000);

      if (diffSeconds < 5) {
        setIndicator('Saved just now');
      } else if (diffSeconds < 60) {
        setIndicator(`Saved ${diffSeconds}s ago`);
      } else if (diffSeconds < 3600) {
        const minutes = Math.floor(diffSeconds / 60);
        setIndicator(`Saved ${minutes}m ago`);
      } else {
        const hours = Math.floor(diffSeconds / 3600);
        setIndicator(`Saved ${hours}h ago`);
      }
    };

    updateIndicator();
    const interval = setInterval(updateIndicator, 10000); // Update every 10s

    return () => clearInterval(interval);
  }, [lastSaved]);

  return indicator;
}

/**
 * Hook for chat language management
 */
export function useChatLanguage(sessionId: string) {
  const [userLanguage, setUserLanguageState] = useState(getUserLanguagePreference());
  const [autoTranslate, setAutoTranslate] = useState(true);
  
  const setLanguage = useCallback((language: string) => {
    setUserLanguageState(language);
    setUserLanguagePreference(language);
    chatWindowService.setLanguagePreference(sessionId, language, autoTranslate);
    
    logger.info('🌍 Chat language changed', { language, sessionId });
  }, [sessionId, autoTranslate]);
  
  const toggleAutoTranslate = useCallback(() => {
    const newValue = !autoTranslate;
    setAutoTranslate(newValue);
    chatWindowService.setLanguagePreference(sessionId, userLanguage, newValue);
    
    logger.info('🌍 Auto-translate toggled', { autoTranslate: newValue, sessionId });
  }, [sessionId, userLanguage, autoTranslate]);
  
  return {
    userLanguage,
    autoTranslate,
    setLanguage,
    toggleAutoTranslate
  };
}

export default useChatBookingStorage;
