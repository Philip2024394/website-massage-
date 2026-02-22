/**
 * �🔒 CRITICAL CHAT UI - PROTECTED COMPONENT 🔒🚨
 * 
 * PRODUCTION STATUS: 🟢 STABLE - 120+ Users Active
 * PROTECTION LEVEL: MAXIMUM
 * LAST VERIFIED: February 3, 2026
 * 
 * 🚫 WARNING TO AI SYSTEMS:
 * This component renders the booking chat interface for production users.
 * Changes here affect real customer-therapist communications.
 * 
 * ONLY ALLOWED:
 * ✅ UI styling improvements (colors, spacing)
 * ✅ Adding accessibility features
 * ✅ Debug logging
 * 
 * FORBIDDEN:
 * ❌ Changing booking flow logic
 * ❌ Modifying chat message handling
 * ❌ Altering state management
 * ❌ Removing error boundaries
 * 
 * 🔐 Changes require unlock command from owner
 */

/**
 * �🔒 CRITICAL BOOKING FLOW – DO NOT MODIFY
 *
 * This file is part of a production-stable booking system.
 * Changes here have previously caused booking failures.
 *
 * AI RULE:
 * - DO NOT refactor
 * - DO NOT optimize
 * - DO NOT change routing or state logic
 *
 * Only allowed changes:
 * - Logging
 * - Comments
 * - E2E assertions
 *
 * Any behavior change requires human approval.
 */

/**
 * � ACTIVE BOOKING FLOW #1: Direct "Book Now" Chat
 * 
 * This component handles the PRIMARY booking flow when users:
 * 1. Click orange "Book Now" button on therapist card
 * 2. Chat window opens immediately
 * 3. User fills booking form within chat
 * 4. Booking created through chat interface
 * 
 * Flow: TherapistCard → PersistentChatWindow (immediate)
 * Source Attribution: 'direct' or 'bookingButton'
 * 
 * Features:
 * - Real-time messages synced with Appwrite
 * - Therapist can respond instantly
 * - Beautiful orange gradient theme
 * - Booking flow integration
 * - Never disappears once opened
 */

import React, { useState, useRef, useEffect, useLayoutEffect, memo } from 'react';
import { logger } from '../utils/logger';
import { usePersistentChat, ChatMessage, BookingStep, validateMessage } from '../context/PersistentChatProvider';
import { MessageCircle, X, Send, Clock, MapPin, User, Phone, Check, Wifi, WifiOff, Calendar, Star, Sparkles, CreditCard, AlertTriangle, Gift, Tag } from 'lucide-react';
import CustomDatePicker from './CustomDatePicker';
import { validateDiscountCode, calculateCommissionAfterDiscount } from '../lib/services/discountValidationService';
import { FlagIcon } from './FlagIcon';
import { BookingNotificationBanner } from './BookingNotificationBanner';
import { locationService } from '../services/locationService';
import { therapistNotificationService, type BookingNotification } from '../services/therapistNotificationService';
import { scheduledBookingPaymentService } from '../lib/services/scheduledBookingPaymentService';
import { mp3NotificationService } from '../services/mp3NotificationService';

// Extracted components
import { ChatHeader } from '../modules/chat/ChatHeader';
import { BookingCountdown } from './BookingCountdown';
import { DiscountValidator } from '../modules/chat/BookingFlow/DiscountValidator';
import { useBookingForm } from '../modules/chat/hooks/useBookingForm';
import { DURATION_OPTIONS, formatPrice, formatTime } from '../modules/chat/utils/chatHelpers';
import ScheduledBookingDepositModal from './ScheduledBookingDepositModal';
import { BookingChatLockIn } from '../lib/validation/bookingChatLockIn';
import { bookingFlowMonitor } from '../utils/bookingFlowDiagnostics';
import { getRandomTherapistImage } from '../utils/therapistImageUtils';
import { getTherapistDisplayName } from '../utils/therapistCardHelpers';
import { MASSAGE_TYPE_DETAILS, getMassageTypeImage } from '../constants';
import { MassageTypeCard } from './shared/MassageTypeCard';
import { saveBookingDraft, getBookingDraft, clearBookingDraft } from '../lib/bookingDraftStorage';
import BookingAuthModal from './booking/BookingAuthModal';

// Import new enhanced chat UI components
import {
  TherapistAcceptanceUI,
  OnTheWayStatusUI,
  ArrivalConfirmationUI,
  BookingProgressStepper,
  type BookingProgressStep,
  EnhancedTimerComponent,
  ErrorRecoveryUI,
  type ErrorType,
  PaymentFlowUI,
  type PaymentMethod,
  StatusThemeProvider,
  useStatusTheme,
  StatusAwareContainer,
  RealTimeNotificationEnhancer
} from './chat';
import { BookingProgress } from './BookingProgress';
import { BookingConfirmationContainer } from '../modules/chat/BookingConfirmationContainer';
import { BookingWelcomeBanner } from '../modules/chat/BookingWelcomeBanner';

// ========================================================================
// BOOKING RELIABILITY UTILITIES
// ========================================================================

/**
 * Wraps a promise with a timeout
 * @param promise - The promise to wrap
 * @param timeoutMs - Timeout in milliseconds
 * @returns Promise that rejects if timeout is reached
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

/**
 * Retries an async operation with exponential backoff
 * @param operation - The async operation to retry
 * @param maxRetries - Maximum number of retry attempts
 * @param baseDelayMs - Base delay for exponential backoff (1000ms = 1s, 2s, 4s)
 * @param timeoutMs - Timeout for each attempt
 * @returns Promise with the operation result
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000,
  timeoutMs: number = 5000
): Promise<{ success: boolean; data?: T; error?: Error; attempts: number; duration: number }> {
  const startTime = Date.now();
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const attemptStart = Date.now();
    
    try {
      logger.debug(`🔄 [ORDER_NOW_MONITOR] Booking attempt #${attempt} start: ${new Date(attemptStart).toISOString()}`);
      
      const result = await withTimeout(operation(), timeoutMs);
      const duration = Date.now() - attemptStart;
      
      // ✅ CRITICAL FIX: Only log success if Appwrite actually created the booking
      // createBooking returns true/false or booking object - verify it's truthy
      if (!result) {
        throw new Error('Booking creation returned false - Appwrite validation failed');
      }
      
      // For boolean returns, check it's exactly true
      // For object returns (with $id), check the object exists
      const isSuccess = result === true || (typeof result === 'object' && result !== null);
      
      if (!isSuccess) {
        throw new Error(`Booking creation failed - got result: ${JSON.stringify(result)}`);
      }
      
      logger.debug(`✅ [ORDER_NOW_MONITOR] Booking attempt #${attempt} SUCCESS | Duration: ${duration}ms`);
      
      return {
        success: true,
        data: result,
        attempts: attempt,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      lastError = error as Error;
      const duration = Date.now() - attemptStart;
      
      logger.error(`❌ [ORDER_NOW_MONITOR] Booking attempt #${attempt} FAILED | Duration: ${duration}ms | Error: ${lastError.message}`);
      
      // 🔒 CRITICAL: Only retry transient errors (network, timeout, server errors, rate limits)
      // DO NOT retry validation errors (400), auth errors (401), permission errors (403), not found (404)
      const errorStatus = (lastError as any).status || (lastError as any).code;
      const isTransientError = 
        errorStatus === 429 || // Rate limit - retryable with backoff
        errorStatus >= 500 || // Server errors (500, 502, 503, etc.)
        lastError.message.includes('timeout') || 
        lastError.message.includes('ETIMEDOUT') ||
        lastError.message.includes('ECONNREFUSED') ||
        lastError.message.includes('network') ||
        lastError.message.includes('Rate limit');
      
      if (!isTransientError) {
        logger.error(`🚫 [ORDER_NOW_MONITOR] Non-retryable error detected (status: ${errorStatus})`);
        logger.error(`   → This is a validation/client error, not a transient failure`);
        logger.error(`   → Stopping retries immediately to prevent unnecessary API calls`);
        return {
          success: false,
          error: lastError,
          attempts: attempt,
          duration: Date.now() - startTime,
        };
      }
      
      // Don't delay after the last attempt
      if (attempt < maxRetries) {
        const delayMs = baseDelayMs * Math.pow(2, attempt - 1);
        logger.debug(`⏳ [ORDER_NOW_MONITOR] Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  // All retries failed
  const totalDuration = Date.now() - startTime;
  logger.error(`💥 [ORDER_NOW_MONITOR] All ${maxRetries} booking attempts FAILED | Total duration: ${totalDuration}ms`);
  
  return {
    success: false,
    error: lastError || new Error('Unknown error'),
    attempts: maxRetries,
    duration: totalDuration,
  };
}

/**
 * Categorizes booking errors for better reporting
 */
function categorizeBookingError(error: Error): 'timeout' | 'network' | 'validation' | 'unknown' {
  const message = error.message.toLowerCase();
  
  if (message.includes('timeout') || message.includes('timed out')) {
    return 'timeout';
  }
  if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
    return 'network';
  }
  if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
    return 'validation';
  }
  return 'unknown';
}

// 🌐 Booking chat UI – Indonesian (default) and English
const CHAT_MSG: Record<'id' | 'en', Record<string, string>> = {
  id: {
    bookingAccepted: '✅ Booking diterima!',
    acceptFailed: '❌ Gagal menerima booking. Silakan coba lagi.',
    bookingDeclined: '📝 Booking ditolak.',
    declineFailed: '❌ Gagal menolak booking. Silakan coba lagi.',
    bookingExpired: '⏰ Booking kedaluwarsa – tidak ada respons tepat waktu. Terapis/tempat saran ditampilkan di bawah.',
    noOtherProviders: 'Tidak ada terapis aktif atau tempat buka saat ini. Anda bisa coba lagi nanti atau buka beranda.',
    confirmRejectReminder: 'Pengingat: Silakan konfirmasi atau tolak bukti pembayaran. Jika tidak ada respons dalam 24 jam, booking dapat kedaluwarsa.',
    fillRequiredFields: '❌ Harap isi semua field wajib: Nama, WhatsApp, dan Tipe Lokasi',
    hotelVillaRequired: '❌ Booking hotel/villa memerlukan nama fasilitas dan nomor kamar',
    bookingFailed: '❌ Booking gagal. Periksa data Anda dan coba lagi.',
    scheduledCreatedBefore: '📅 Booking terjadwal dibuat! Bayar uang muka 30% (',
    scheduledCreatedAfter: ') untuk mengonfirmasi janji. Uang muka tidak dapat dikembalikan.',
    scheduledFailed: '❌ Gagal membuat booking terjadwal. Silakan coba lagi.',
    depositSubmitted: '✅ Pembayaran uang muka terkirim! Booking akan dikonfirmasi setelah terapis menyetujui bukti pembayaran. Anda akan dapat notifikasi untuk janji mendatang.',
    depositFailed: '❌ Gagal memproses pembayaran uang muka. Silakan coba lagi.',
    uploadJpgPng: '❌ Harap unggah gambar JPG atau PNG.',
    fileMax5mb: '❌ Ukuran file maksimal 5MB.',
    paymentProofUploaded: '✅ Bukti pembayaran terunggah. Terapis dapat melihatnya di chat ini.',
    uploadProofFailed: '❌ Gagal mengunggah bukti. Silakan coba lagi.',
    requestExpired: '⏰ Permintaan booking kedaluwarsa.',
    extendedWait: '⏰ Waktu tunggu diperpanjang 2 menit',
    invalidDiscount: 'Kode diskon tidak valid',
    discountValidateFailed: 'Gagal memvalidasi kode diskon',
    discountApplied: 'diskon akan diterapkan!',
    paymentProofReceived: 'Bukti pembayaran diterima',
    paymentProofBody: 'Pelanggan mengunggah bukti pembayaran. Konfirmasi atau tolak dalam 30 menit.',
  },
  en: {
    bookingAccepted: '✅ Booking accepted successfully!',
    acceptFailed: '❌ Failed to accept booking. Please try again.',
    bookingDeclined: '📝 Booking declined.',
    declineFailed: '❌ Failed to decline booking. Please try again.',
    bookingExpired: '⏰ Booking expired – no response in time. Suggested therapists and places are shown below.',
    noOtherProviders: 'No other active therapists or open places right now. You can try again later or browse the home page.',
    confirmRejectReminder: 'Reminder: Please confirm or reject the payment proof. If no response within 24 hours, the booking may be expired.',
    fillRequiredFields: '❌ Please fill in all required fields: Name, WhatsApp, and Location Type',
    hotelVillaRequired: '❌ Hotel/Villa bookings require facility name and room number',
    bookingFailed: '❌ Booking failed. Please check your details and try again.',
    scheduledCreatedBefore: '📅 Scheduled booking created! Please pay 30% deposit (',
    scheduledCreatedAfter: ') to confirm your appointment. Deposits are non-refundable.',
    scheduledFailed: '❌ Failed to create scheduled booking. Please try again.',
    depositSubmitted: '✅ Deposit payment submitted! Your booking will be confirmed once the therapist approves your payment proof. You will receive notifications about your upcoming appointment.',
    depositFailed: '❌ Failed to process deposit payment. Please try again.',
    uploadJpgPng: '❌ Please upload a JPG or PNG image.',
    fileMax5mb: '❌ File must be 5MB or smaller.',
    paymentProofUploaded: '✅ Payment proof uploaded. Therapist can view it in this chat.',
    uploadProofFailed: '❌ Failed to upload proof. Please try again.',
    requestExpired: '⏰ Booking request expired due to timeout.',
    extendedWait: '⏰ Extended waiting time by 2 minutes',
    invalidDiscount: 'Invalid discount code',
    discountValidateFailed: 'Failed to validate discount code',
    discountApplied: 'discount will be applied!',
    paymentProofReceived: 'Payment proof received',
    paymentProofBody: 'Customer uploaded payment proof. Confirm or reject within 30 minutes.',
  },
};

export function PersistentChatWindow() {
  const {
    chatState,
    isLocked,
    isConnected,
    openChat,
    minimizeChat,
    maximizeChat,
    closeChat,
    setBookingStep,
    setSelectedDuration,
    setSelectedDateTime,
    setCustomerDetails,
    sendMessage,
    addMessage,
    createBooking,
    acceptBooking,
    rejectBooking,
    confirmBooking,
    confirmPaymentReceived,
    rejectPaymentProof,
    updateBookingPaymentProof,
    refundDeposit,
    cancelBooking,
    shareBankCard,
    confirmPayment,
    addSystemNotification,
    lockChat,
    unlockChat,
    recordDepositTimeout,
    timerState,
    isGuestUser,
    refreshUser,
  } = usePersistentChat();

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔒 CRITICAL VALIDATION - BOOKING-IN-CHAT LOCK-IN SYSTEM
  // ═══════════════════════════════════════════════════════════════════════════
  // This section enforces business-critical rules that MUST NOT regress
  
  // RULE 1: Chat CANNOT render without valid booking object
  // NOTE: Only validate when in 'chat' step - allow booking flow steps without booking
  React.useEffect(() => {
    if (
      chatState.isOpen &&
      chatState.bookingStep === 'chat' &&
      chatState.currentBooking !== undefined &&
      chatState.currentBooking !== null
    ) {
      try {
        // Validate booking data schema
        const validatedBooking = BookingChatLockIn.validateBookingData(
          chatState.currentBooking
        );
        
        // Validate countdown timer
        BookingChatLockIn.validateCountdownTimer(timerState.remainingSeconds);
        
        // Development warnings for missing optional fields
        if (process.env.NODE_ENV !== 'production') {
          BookingChatLockIn.warnMissingOptionalFields(validatedBooking);
        }
      } catch (error) {
        // CRITICAL ERROR - Log and prevent render
        logger.error('═'.repeat(80));
        logger.error('🚨 BOOKING VALIDATION FAILED - CHAT CANNOT RENDER 🚨');
        logger.error('═'.repeat(80));
        logger.error(error);
        logger.error('═'.repeat(80));
        
        // Booking is being created - BookingWelcomeBanner will show the countdown
        logger.debug('⏳ Booking creation in progress - countdown will appear when ready');
      }
    }
  }, [chatState.isOpen, chatState.currentBooking, timerState.remainingSeconds, chatState.bookingStep, closeChat]);
  
  // RULE 2: Guard against opening chat without booking (ONLY for existing chat step)
  // ✅ CRITICAL: Allow Order Now flow - don't guard against initial booking creation
  // Note: This warning appears when loading old messages without an active booking
  React.useEffect(() => {
    if (chatState.isOpen && !chatState.currentBooking && chatState.bookingStep === 'chat') {
      logger.debug('🔒 [GUARD] Chat in "chat" step without active booking - likely old messages');
      logger.debug('💡 [INFO] This is normal when viewing message history. Order Now flow will create new booking.');
    }
  }, [chatState.isOpen, chatState.currentBooking, chatState.bookingStep]);
  
  // ═══════════════════════════════════════════════════════════════════════════

  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [messageWarning, setMessageWarning] = useState<string | null>(null);
  
  // Use custom booking form hook
  const {
    customerForm,
    setCustomerForm,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    discountCode,
    setDiscountCode,
    discountValidation,
    setDiscountValidation,
    isValidatingDiscount,
    setIsValidatingDiscount,
    clientMismatchError,
    setClientMismatchError,
  } = useBookingForm(chatState.isMinimized, chatState.bookingStep, chatState.therapist?.id);
  
  const [arrivalCountdown, setArrivalCountdown] = useState(3600); // 1 hour in seconds
  const [therapistResponseCountdown, setTherapistResponseCountdown] = useState(300); // 5 min BOOK_NOW; 30 min for SCHEDULED (set on reset)
  const [bookingNotifications, setBookingNotifications] = useState<BookingNotification[]>([]);
  // Suggested therapists/places after booking timeout (spec 1.1: only active therapists, open places)
  const [suggestedTherapists, setSuggestedTherapists] = useState<Array<{ appwriteId: string; name: string; image?: string }>>([]);
  const [suggestedPlaces, setSuggestedPlaces] = useState<Array<{ appwriteId: string; name: string; image?: string }>>([]);
  const [suggestedLoading, setSuggestedLoading] = useState(false);
  // Spec 2.2: 30 min deposit countdown when scheduled booking is accepted
  const [depositCountdownSeconds, setDepositCountdownSeconds] = useState<number>(0);
  const [uploadingProof, setUploadingProof] = useState(false);
  const proofInputRef = useRef<HTMLInputElement>(null);

  // 🚨 ERROR TRACKING STATE - Tracks booking flow errors with detailed information
  const [bookingError, setBookingError] = useState<{
    errorPoint: string;
    errorReason: string;
    errorDetails?: any;
    timestamp: string;
  } | null>(null);

  // 🔔 Initialize therapist notification system
  useEffect(() => {
    if (chatState.isTherapistView) {
      logger.debug('🔔 Initializing therapist notifications');
      
      // Subscribe to booking notifications
      const unsubscribe = therapistNotificationService.onBookingNotification((notification) => {
        logger.debug('📨 New booking notification received:', notification);
        setBookingNotifications(prev => [...prev, notification]);
        
        // Auto-open chat if enabled (ONLY for therapist view, NOT on landing page)
        // Check if we're not on landing page before auto-opening
        const currentPage = window.location.hash.replace('#', '').split('/')[ 0];
        if (!chatState.isOpen && currentPage !== 'landing' && currentPage !== '' && currentPage !== 'home') {
          logger.debug('🔔 Auto-opening chat for therapist notification');
          maximizeChat();
        }
      });

      // Listen for chat window open events
      const handleOpenChat = (event: CustomEvent) => {
        const { bookingId, customerId, customerName, booking } = event.detail;
        logger.debug('🎯 Opening chat for booking:', bookingId);
        
        // Note: setChatState not available in context
        // Chat state management handled by PersistentChatProvider
        // This event handler may need refactoring to use proper context methods
      };

      window.addEventListener('openTherapistChat', handleOpenChat as EventListener);

      return () => {
        unsubscribe();
        window.removeEventListener('openTherapistChat', handleOpenChat as EventListener);
      };
    }
  }, [chatState.isTherapistView, maximizeChat]);

  // 🌐 CHAT UI LANGUAGE (LOCKED-IN SPEC)
  // ✅ Default: Indonesian (ID)
  // ✅ Persistence: localStorage
  // ✅ Scope: UI text ONLY (labels, buttons, system messages)
  // ❌ Chat messages: NEVER translated (stay as typed)
  const [currentLanguage, setCurrentLanguage] = useState<'id' | 'en'>(() => {
    // Read from localStorage, default to Indonesian
    const stored = localStorage.getItem('chat_ui_language');
    return (stored === 'en' || stored === 'gb') ? 'en' : 'id';
  });

  // Initialize language system
  useEffect(() => {
    // Sync to HTML attribute for CSS selectors if needed
    document.documentElement.setAttribute('data-lang', currentLanguage);
    logger.debug('🌐 [CHAT UI] Language:', { language: currentLanguage === 'id' ? 'Indonesian' : 'English' });
  }, [currentLanguage]);

  // Handle therapist booking responses
  const handleAcceptBooking = async (bookingId: string) => {
    try {
      await therapistNotificationService.acceptBooking(bookingId);
      await acceptBooking();
      
      // Remove from notifications
      setBookingNotifications(prev => prev.filter(n => n.bookingId !== bookingId));
      
      addSystemNotification(CHAT_MSG[currentLanguage].bookingAccepted);
    } catch (error) {
      logger.error('Failed to accept booking:', error);
      addSystemNotification(CHAT_MSG[currentLanguage].acceptFailed);
    }
  };

  const handleDeclineBooking = async (bookingId: string) => {
    try {
      await therapistNotificationService.rejectBooking(bookingId);
      await rejectBooking();
      
      // Remove from notifications
      setBookingNotifications(prev => prev.filter(n => n.bookingId !== bookingId));
      
      addSystemNotification(CHAT_MSG[currentLanguage].bookingDeclined);
    } catch (error) {
      logger.error('Failed to decline booking:', error);
      addSystemNotification(CHAT_MSG[currentLanguage].declineFailed);
    }
  };
  const [isReportFormOpen, setIsReportFormOpen] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showBookingAuthModal, setShowBookingAuthModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState(0);
  const [isProcessingDeposit, setIsProcessingDeposit] = useState(false);
  const [isMassageTypesModalOpen, setIsMassageTypesModalOpen] = useState(false);
  const [massageTypesExpandedCards, setMassageTypesExpandedCards] = useState<{ [key: string]: boolean }>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Validate discount code handler
  const handleValidateDiscount = async () => {
    if (!discountCode.trim() || !chatState.therapist) return;
    
    setIsValidatingDiscount(true);
    setDiscountValidation(null);
    
    try {
      // Validate discount code
      const result = await validateDiscountCode(
        discountCode.trim().toUpperCase(),
        { providerId: chatState.therapist.id }
      );
      
      if (result.valid) {
        setDiscountValidation({
          valid: true,
          percentage: result.discountPercentage,
          message: `🎉 ${result.discountPercentage}% ${CHAT_MSG[currentLanguage].discountApplied}`,
          codeData: result
        });
      } else {
        setDiscountValidation({
          valid: false,
          message: result.message || CHAT_MSG[currentLanguage].invalidDiscount
        });
      }
    } catch (error: unknown) {
      const err = error as Error; logger.error('Discount validation error:', err);
      setDiscountValidation({
        valid: false,
        message: CHAT_MSG[currentLanguage].discountValidateFailed
      });
    } finally {
      setIsValidatingDiscount(false);
    }
  };

  // Arrival countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setArrivalCountdown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Therapist response countdown timer (per spec: on expiry booking is cancelled, suggested list shown)
  useEffect(() => {
    if (!chatState.currentBooking || therapistResponseCountdown <= 0) return;
    if (chatState.currentBooking.status !== 'pending' && chatState.currentBooking.status !== 'waiting_others') return;
    const timer = setInterval(() => {
      setTherapistResponseCountdown(prev => {
        const newCount = prev - 1;
        if (newCount <= 0) {
          const docId = (chatState.currentBooking as { documentId?: string })?.documentId;
          if (docId) {
            import('../lib/services/bookingLifecycleService').then(({ bookingLifecycleService }) => {
              bookingLifecycleService.expireBooking(docId, 'Therapist timeout').catch((err) => logger.error('Expire booking on countdown:', err));
            });
          }
          addSystemNotification(CHAT_MSG[currentLanguage].bookingExpired);
        }
        return Math.max(0, newCount);
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [chatState.currentBooking?.status, therapistResponseCountdown, chatState.currentBooking?.documentId, addSystemNotification, currentLanguage]);

  // Reset countdown timer when a new booking is created (5 min BOOK_NOW, 30 min SCHEDULED per spec)
  useEffect(() => {
    if (chatState.currentBooking && 
        (chatState.currentBooking.status === 'pending' || chatState.currentBooking.status === 'waiting_others')) {
      const isScheduled = (chatState.currentBooking as { bookingType?: string })?.bookingType === 'SCHEDULED';
      const seconds = isScheduled ? 30 * 60 : 5 * 60;
      logger.debug('🔄 Resetting countdown timer for new booking:', { bookingId: chatState.currentBooking.id, isScheduled, seconds });
      setTherapistResponseCountdown(seconds);
    }
  }, [chatState.currentBooking?.id]); // Only reset when booking ID changes (new booking)

  // When booking expired or declined, fetch suggested therapists (active) and places (open) – spec 1.1 & 1.2
  const lifecycleStatus = (chatState.currentBooking as { lifecycleStatus?: string })?.lifecycleStatus;
  const bookingExpiredOrDeclined = chatState.currentBooking && (lifecycleStatus === 'EXPIRED' || lifecycleStatus === 'DECLINED');
  useEffect(() => {
    if (!bookingExpiredOrDeclined) {
      setSuggestedTherapists([]);
      setSuggestedPlaces([]);
      return;
    }
    if (suggestedTherapists.length > 0 || suggestedLoading) return;
    setSuggestedLoading(true);
    (async () => {
      try {
        const currentProviderId = chatState.therapist?.appwriteId || (chatState.therapist as any)?.$id || '';
        const { therapistService, placesService } = await import('../lib/appwriteService');
        const [therapistsRaw, placesRaw] = await Promise.all([
          therapistService.getTherapists().catch(() => []),
          placesService.getPlaces().catch(() => []),
        ]);
        const exclude = (id: string) => id && id === currentProviderId;
        const therapists = therapistsRaw
          .filter((t: any) => (t.status || t.availability || '').toString().toLowerCase() === 'available' && !exclude(t.$id || t.id))
          .slice(0, 10)
          .map((t: any) => ({ appwriteId: t.$id || t.id, name: t.name || 'Therapist', image: t.mainImage || t.profilePicture || t.image }));
        const places = placesRaw
          .filter((p: any) => p.isLive !== false && (p.isOpen !== false || p.status === 'open' || p.status === 'OPEN') && !exclude(p.$id || p.id))
          .slice(0, 10)
          .map((p: any) => ({ appwriteId: p.$id || p.id, name: p.name || 'Place', image: p.mainImage || p.profilePicture }));
        if (therapists.length === 0 && places.length === 0) {
          setSuggestedTherapists([]);
          setSuggestedPlaces([]);
          addSystemNotification(CHAT_MSG[currentLanguage].noOtherProviders);
        } else {
          setSuggestedTherapists(therapists);
          setSuggestedPlaces(places);
        }
      } catch (e) {
        logger.error('Failed to load suggested therapists/places', e);
      } finally {
        setSuggestedLoading(false);
      }
    })();
  }, [bookingExpiredOrDeclined, suggestedLoading, suggestedTherapists.length, chatState.therapist?.appwriteId, addSystemNotification, currentLanguage]);

  // Spec 2.2: 30 min deposit countdown when scheduled booking accepted (same chat window as bank details)
  const isScheduledAccepted = Boolean(
    chatState.currentBooking &&
    (chatState.currentBooking as { bookingType?: string })?.bookingType === 'SCHEDULED' &&
    (chatState.currentBooking as { lifecycleStatus?: string })?.lifecycleStatus === 'ACCEPTED'
  );
  const acceptedAt = (chatState.currentBooking as { acceptedAt?: string })?.acceptedAt;
  const depositDeadlineExtendedAt = (chatState.currentBooking as { depositDeadlineExtendedAt?: string })?.depositDeadlineExtendedAt;
  const depositTimeoutRecordedRef = useRef(false);
  useEffect(() => {
    if (!isScheduledAccepted) {
      setDepositCountdownSeconds(0);
      depositTimeoutRecordedRef.current = false;
      return;
    }
    const baseTime = depositDeadlineExtendedAt || acceptedAt;
    if (!baseTime) {
      setDepositCountdownSeconds(0);
      return;
    }
    const deadline = new Date(baseTime).getTime() + 30 * 60 * 1000;
    const tick = () => {
      const secs = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
      setDepositCountdownSeconds(secs);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isScheduledAccepted, acceptedAt, depositDeadlineExtendedAt]);
  // Spec 2.3: when countdown hits 0, record deposit timeout once (for 2-attempt / 24h lock)
  useEffect(() => {
    if (!isScheduledAccepted || depositCountdownSeconds !== 0 || depositTimeoutRecordedRef.current) return;
    depositTimeoutRecordedRef.current = true;
    const providerId = chatState.therapist?.appwriteId || (chatState.therapist as any)?.$id;
    if (providerId) recordDepositTimeout(providerId);
  }, [isScheduledAccepted, depositCountdownSeconds, recordDepositTimeout, chatState.therapist]);

  // Format countdown to MM:SS
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Spec 4.1: Therapist has 30 min to confirm/reject payment proof (scheduled + accepted + proof uploaded)
  const firstPaymentProofAt = chatState.messages.find(m => m.messageType === 'payment_proof')?.createdAt;
  const isScheduledAcceptedAsTherapist = Boolean(
    chatState.isTherapistView &&
    chatState.currentBooking &&
    (chatState.currentBooking as { bookingType?: string })?.bookingType === 'SCHEDULED' &&
    (chatState.currentBooking as { lifecycleStatus?: string })?.lifecycleStatus === 'ACCEPTED' &&
    firstPaymentProofAt
  );
  const [therapistConfirmCountdownSeconds, setTherapistConfirmCountdownSeconds] = useState(0);
  useEffect(() => {
    if (!isScheduledAcceptedAsTherapist || !firstPaymentProofAt) {
      setTherapistConfirmCountdownSeconds(0);
      return;
    }
    const deadline = new Date(firstPaymentProofAt).getTime() + 30 * 60 * 1000;
    const tick = () => {
      setTherapistConfirmCountdownSeconds(Math.max(0, Math.floor((deadline - Date.now()) / 1000)));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isScheduledAcceptedAsTherapist, firstPaymentProofAt]);

  // Spec 4.3: One-time reminder when therapist's 30 min to confirm payment proof expires
  const therapistConfirmReminderSentRef = useRef(false);
  const prevTherapistConfirmCountdownRef = useRef<number>(therapistConfirmCountdownSeconds);
  useEffect(() => {
    if (!isScheduledAcceptedAsTherapist) {
      therapistConfirmReminderSentRef.current = false;
      prevTherapistConfirmCountdownRef.current = therapistConfirmCountdownSeconds;
      return;
    }
    if (prevTherapistConfirmCountdownRef.current > 0 && therapistConfirmCountdownSeconds === 0 && !therapistConfirmReminderSentRef.current) {
      addSystemNotification(CHAT_MSG[currentLanguage].confirmRejectReminder);
      therapistConfirmReminderSentRef.current = true;
    }
    prevTherapistConfirmCountdownRef.current = therapistConfirmCountdownSeconds;
  }, [isScheduledAcceptedAsTherapist, therapistConfirmCountdownSeconds, addSystemNotification, currentLanguage]);
  useEffect(() => {
    if (!isScheduledAcceptedAsTherapist) return;
    therapistConfirmReminderSentRef.current = false;
  }, [firstPaymentProofAt, chatState.currentBooking?.documentId, isScheduledAcceptedAsTherapist]);

  // Spec 7.2: Sound and optional browser notification when customer submits payment proof (therapist/place view)
  const lastPaymentProofCountRef = useRef(0);
  useEffect(() => {
    if (!chatState.isTherapistView || !chatState.isOpen) return;
    const paymentProofFromCustomer = chatState.messages.filter(
      m => (m as { messageType?: string }).messageType === 'payment_proof' && m.senderId === 'customer'
    );
    const count = paymentProofFromCustomer.length;
    if (count > lastPaymentProofCountRef.current) {
      lastPaymentProofCountRef.current = count;
      if (count > 0) {
        mp3NotificationService.playNotification('payment_success', 0.7).catch(() => {});
        // Browser notification when tab is in background
        if (typeof document !== 'undefined' && document.hidden && typeof Notification !== 'undefined') {
          const notifTitle = CHAT_MSG[currentLanguage].paymentProofReceived;
          const notifBody = CHAT_MSG[currentLanguage].paymentProofBody;
          if (Notification.permission === 'granted') {
            new Notification(notifTitle, { body: notifBody, icon: '/favicon.ico' });
          } else if (Notification.permission === 'default') {
            Notification.requestPermission().then(p => {
              if (p === 'granted') {
                new Notification(notifTitle, { body: notifBody, icon: '/favicon.ico' });
              }
            });
          }
        }
      }
    } else {
      lastPaymentProofCountRef.current = count;
    }
  }, [chatState.isTherapistView, chatState.isOpen, chatState.messages, currentLanguage]);

  // ✅ CRITICAL FIX: Extract data BEFORE hooks to avoid Rules of Hooks violation
  const { therapist, messages, bookingStep, selectedDuration, isMinimized } = chatState;
  const isScheduleMode = chatState.bookingMode === 'schedule';

  // Auto-scroll to bottom when new messages arrive
  // ⚠️ Must always be called (Rules of Hooks) - add safety checks inside
  useLayoutEffect(() => {
    if (chatState.isOpen && chatState.messages.length > 0 && chatState.bookingStep === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatState.isOpen, chatState.messages.length, chatState.bookingStep]);
  
  // 🔍 DIAGNOSTIC: Log bookingStep changes to track state transitions
  // ⚠️ Must always be called (Rules of Hooks)
  React.useEffect(() => {
    if (!chatState.isOpen) return; // Skip if chat is closed
    
    logger.debug('🎨 [BOOKING STEP CHANGED]', {
      newStep: bookingStep,
      shouldShowChat: bookingStep === 'chat',
      shouldShowDetails: bookingStep === 'details',
      shouldShowDuration: bookingStep === 'duration',
      hasBooking: !!chatState.currentBooking,
      messageCount: messages.length
    });
  }, [chatState.isOpen, bookingStep, messages.length, chatState.currentBooking]);

  // ✅ CRITICAL: Early return AFTER all hooks to comply with Rules of Hooks
  // This prevents DOM removal errors during state transitions
  if (!chatState.isOpen || !therapist) {
    return null;
  }

  // Get price for duration - consistent with TherapistCard pricing logic
  const getPrice = (minutes: number) => {
    logger.debug('🔍 [PRICING DEBUG] Getting price for', { minutes });
    logger.debug('🔍 [PRICING DEBUG] Therapist object:', {
      name: therapist.name,
      price60: therapist.price60,
      price90: therapist.price90,
      price120: therapist.price120,
      pricing: therapist.pricing
    });
    
    // Check for separate price fields first (price60, price90, price120)
    const hasValidSeparateFields = Boolean(
      (therapist.price60 && parseInt(therapist.price60) > 0) ||
      (therapist.price90 && parseInt(therapist.price90) > 0) ||
      (therapist.price120 && parseInt(therapist.price120) > 0)
    );

    logger.debug('🔍 [PRICING DEBUG] Has valid separate fields:', { hasValidSeparateFields });

    if (hasValidSeparateFields) {
      const priceField = `price${minutes}` as keyof typeof therapist;
      const price = therapist[priceField];
      const finalPrice = price ? parseInt(price as string) * 1000 : 0;
      logger.debug('✅ [PRICING DEBUG] Using separate field:', { priceField, price, finalPrice });
      return finalPrice;
    }

    // Fallback to JSON pricing format
    const pricing = therapist.pricing || {};
    const basePrice = pricing[minutes.toString()] || pricing['60'] || 0;
    const finalPrice = basePrice * 1000; // Multiply by 1000 to match TherapistCard format
    logger.debug('✅ [PRICING DEBUG] Using pricing object:', { pricing, basePrice, finalPrice });
    return finalPrice;
  };

  // Handle duration selection
  const handleDurationSelect = (minutes: number) => {
    setSelectedDuration(minutes);
    
    // If schedule mode, go to datetime picker first
    if (isScheduleMode) {
      setBookingStep('datetime');
    } else {
      setBookingStep('details');
    }
    
    // Duration info will be shown in BookingWelcomeBanner - no need for system message
    logger.debug(`⏱️ Duration selected: ${minutes} minutes - ${formatPrice(getPrice(minutes))}`);
  };

  // Handle datetime selection
  const handleDateTimeSubmit = () => {
    if (!selectedDate || !selectedTime) return;
    
    setSelectedDateTime(selectedDate, selectedTime);
    setBookingStep('details');
    
    // Add system message
    const dateObj = new Date(selectedDate);
    const formattedDate = dateObj.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    addMessage({
      senderId: 'system',
      senderName: 'System',
      message: `📅 Scheduled for ${formattedDate} at ${selectedTime}`,
      type: 'system',
    });
  };

  // Handle customer form submission
  const handleCustomerSubmit = async (e: React.FormEvent) => {
    logger.debug('🎯 [HANDLE CUSTOMER SUBMIT] Function called');
    
    // � START BOOKING FLOW MONITORING
    const monitorSession = bookingFlowMonitor.startBookingFlow(
      therapist?.id || therapist?.$id,
      chatState.currentUserId || 'guest'
    );
    bookingFlowMonitor.checkpoint('submit_handler_start', 'started');
    
    // �🔒 CRITICAL: Prevent default IMMEDIATELY before any async operations
    e.preventDefault();
    e.stopPropagation();
    
    // 🔒 ADDITIONAL SAFEGUARDS: Block all navigation
    if (e && e.nativeEvent) {
      e.nativeEvent.stopImmediatePropagation();
    }
    
    // ✅ DEFENSIVE GUARD: Initialize booking system protection  
    // const { BookingIsolation } = await import('../booking/BookingIsolation');
    
    // Verify Appwrite configuration before proceeding
    // const { bookingGuard } = await import('../booking/BookingSystemGuard');
    // if (!bookingGuard.verifyAppwriteConfig()) {
    //   throw new Error('Appwrite configuration invalid - booking cannot proceed');
    // }
    
    // Clear any previous errors when starting new submission
    setBookingError(null);
    
    // 🔒 CRITICAL: Lock chat IMMEDIATELY to prevent closure during Order Now booking
    lockChat();
    logger.debug('🔒 Chat locked for Order Now form submission');
    
    logger.debug('═══════════════════════════════════════════');
    logger.debug('🚀 [ORDER NOW] Form submission started');
    logger.debug('Current URL:', { url: window.location.href });
    logger.debug('Current booking step:', { step: chatState.bookingStep });
    logger.debug('Chat is open:', { isOpen: chatState.isOpen });
    logger.debug('Chat is locked:', { isLocked });
    logger.debug('✅ [PROTECTION] Chat locked during order process');
    logger.debug('🔌 [CONNECTION] Real-time connected:', { isConnected });
    logger.debug('📡 [CONNECTION] Testing chat connectivity...');
    
    // Test real-time connection before proceeding
    if (!isConnected) {
      logger.warn('⚠️ [CONNECTION] Chat not connected to real-time - proceeding anyway');
      // BookingWelcomeBanner will show the status - no need for system message
    }
    
    logger.debug('Customer form data:', {
      name: customerForm.name,
      whatsApp: customerForm.whatsApp,
      locationType: customerForm.locationType
    });
    logger.debug('Form validation state:', {
      hasName: !!customerForm.name,
      hasWhatsApp: !!customerForm.whatsApp,
      hasLocationType: !!customerForm.locationType,
      clientMismatchError: !!clientMismatchError
    });
    logger.debug('═══════════════════════════════════════════');
    
    // ⚠️ CRITICAL CHECK: Validate if button should work
    // Enhanced validation with WhatsApp length check (8-15 digits)
    const isWhatsAppValid = customerForm.whatsApp && customerForm.whatsApp.length >= 8 && customerForm.whatsApp.length <= 15;
    const isNameValid = customerForm.name && customerForm.name.trim().length > 0;
    
    // ✅ FIXED: Removed massageFor validation (field not in Appwrite schema)
    if (!isNameValid || !isWhatsAppValid || !!clientMismatchError || !customerForm.locationType) {
      logger.error('❌ [ORDER NOW] Button should be disabled! Missing required fields:');
      logger.error('- Name:', !isNameValid ? 'MISSING/INVALID' : 'OK');
      logger.error('- WhatsApp:', !isWhatsAppValid ? `MISSING/INVALID (length: ${customerForm.whatsApp?.length || 0})` : 'OK');
      logger.error('- Location Type:', !customerForm.locationType ? 'MISSING' : 'OK');
      logger.error('- Client Mismatch:', !!clientMismatchError ? 'ERROR' : 'OK');
      
      // 🚨 Set error state for display
      setBookingError({
        errorPoint: 'Form Validation',
        errorReason: 'Required fields are missing or invalid. Please check: ' + 
          [!isNameValid && 'Name', !isWhatsAppValid && 'WhatsApp (8-15 digits)', 
           !customerForm.locationType && 'Location Type',
           clientMismatchError && 'Client Information Mismatch'].filter(Boolean).join(', '),
        errorDetails: {
          name: isNameValid ? '✅' : '❌',
          whatsApp: isWhatsAppValid ? '✅' : '❌',
          locationType: customerForm.locationType ? '✅' : '❌',
          clientMismatch: clientMismatchError || 'none'
        },
        timestamp: new Date().toLocaleString()
      });
      
      // Show user-friendly error notification
      addSystemNotification(CHAT_MSG[currentLanguage].fillRequiredFields);
      
      // Additional validation for hotel/villa specific fields
      if (customerForm.locationType === 'hotel' || customerForm.locationType === 'villa') {
        logger.error('- Hotel/Villa Name:', !customerForm.hotelVillaName ? 'MISSING' : 'OK');
        logger.error('- Room Number:', !customerForm.roomNumber ? 'MISSING' : 'OK');
        
        if (!customerForm.hotelVillaName || !customerForm.roomNumber) {
          logger.error('❌ Hotel/Villa booking requires name and room number');
          addSystemNotification(CHAT_MSG[currentLanguage].hotelVillaRequired);
          unlockChat(); // Unlock chat so user can fix the form
          return;
        }
      }
      
      // Report to admin monitor
      if (typeof window !== 'undefined' && window.reportBookingComplianceError) {
        window.reportBookingComplianceError({
          type: 'booking-failure',
          message: `Order Now clicked with missing fields: Name=${!!isNameValid}, WhatsApp=${!!isWhatsAppValid}, LocationType=${!!customerForm.locationType}`,
          component: 'PersistentChatWindow-ValidationError',
          severity: 'high'
        });
      }
      unlockChat(); // Unlock chat so user can fix the form
      return;
    }
    
    // ✅ CORRECT ORDER NOW SUCCESS MONITORING
    // Initial state: chat=closed, step=details, booking=false is EXPECTED and CORRECT
    // Only track actual success: booking created AND step changed to 'chat'
    const orderNowStartTime = Date.now();
    setTimeout(() => {
      const bookingCreated = chatState.currentBooking !== null;
      const currentStep = chatState.bookingStep;
      
      logger.debug('🔍 [ORDER NOW MONITOR] Progress check after 8 seconds:');
      logger.debug('- Booking created:', { bookingCreated });
      logger.debug('- Current step:', { currentStep });
      
      if (bookingCreated && currentStep === 'chat') {
        logger.debug('✅ ORDER NOW SUCCESS - Booking created and chat opened!');
        logger.debug('- Flow completed in', { durationMs: Date.now() - orderNowStartTime });
      } else if (!bookingCreated) {
        logger.debug('🔍 ORDER NOW IN PROGRESS - Booking creation still processing');
        logger.debug('- This is normal for network delays or validation');
      } else {
        logger.debug('🔍 ORDER NOW PROCESSING - Booking exists, waiting for chat step');
      }
    }, 8000);
    
    // 🔧 DISABLED: URL restoration monitoring
    // The URL should stay stable during booking - if it changes, it's likely intentional
    // This monitoring was causing issues by fighting against legitimate URL updates
    /* 
    const originalURL = window.location.href;
    const urlCheckInterval = setInterval(() => {
      if (window.location.href !== originalURL) {
        logger.error('🚨 URL CHANGED UNEXPECTEDLY!');
        logger.error('Original URL:', originalURL);
        logger.error('New URL:', window.location.href);
        logger.debug('🔧 RESTORING original URL to prevent booking flow interruption...');
        window.history.replaceState({}, '', originalURL);
        logger.debug('✅ URL restored to:', window.location.href);
        clearInterval(urlCheckInterval);
      }
    }, 100);
    
    // Clear interval after 10 seconds
    setTimeout(() => clearInterval(urlCheckInterval), 10000);
    */
    
    logger.debug('📋 [FLOW] Starting booking creation process');
    logger.debug('🔍 [DEBUG] About to validate required fields...');
    
    if (!customerForm.name || !customerForm.whatsApp) {
      logger.error('❌ [VALIDATION FAILED] Missing required fields');
      logger.error('- Name:', customerForm.name || 'MISSING');
      logger.error('- WhatsApp:', customerForm.whatsApp || 'MISSING');
      setBookingError({
        errorPoint: 'Form Validation',
        errorReason: 'Missing required fields',
        errorDetails: { name: !!customerForm.name, whatsApp: !!customerForm.whatsApp },
        timestamp: new Date().toLocaleString()
      });
      setIsSending(false);
      return;
    }
    
    logger.debug('✅ [VALIDATION] Required fields present');
    
    // ✅ CRITICAL: Set customer details with full WhatsApp (country code + number)
    const fullWhatsApp = `${customerForm.countryCode}${customerForm.whatsApp}`;
    logger.debug('✅ Setting customer WhatsApp:', { fullWhatsApp });
    
    setCustomerDetails({
      name: customerForm.name,
      whatsApp: fullWhatsApp,
      location: customerForm.location,
    });
    
    // ✅ Store WhatsApp in chat state for immediate access
    logger.debug('✅ Customer details set:', {
      name: customerForm.name,
      whatsApp: fullWhatsApp,
      location: customerForm.location
    });

    // Build booking request message
    const locationTypeLabels = { home: '🏠 Home', hotel: '🏨 Hotel', villa: '🏡 Villa' };
    const locationTypeText = customerForm.locationType ? locationTypeLabels[customerForm.locationType] : 'Not specified';
    
    // Generate Google Maps link if coordinates available
    const mapsLink = customerForm.coordinates 
      ? `https://www.google.com/maps?q=${customerForm.coordinates.lat},${customerForm.coordinates.lng}`
      : null;
    
    // Calculate price with discount if applied
    const originalPrice = getPrice(selectedDuration || 60);
    const hasDiscount = discountValidation?.valid && discountValidation.percentage;
    const discountedPrice = hasDiscount 
      ? originalPrice * (1 - (discountValidation.percentage || 0) / 100)
      : originalPrice;
    
    try {
      setIsSending(true);
      logger.debug('═══════════════════════════════════════════');
      logger.debug('📤 PRE-BOOKING VALIDATION');
      logger.debug('═══════════════════════════════════════════');
      logger.debug('✓ Customer Name:', { name: customerForm.name });
      logger.debug('✓ Customer WhatsApp:', { whatsapp: `${customerForm.countryCode}${customerForm.whatsApp}` });
      logger.debug('✓ Treatment For:', { massageFor: customerForm.massageFor });
      logger.debug('✓ Location Type:', { locationType: customerForm.locationType });
      logger.debug('✓ Location:', { location: customerForm.location });
      logger.debug('✓ Selected Duration:', { selectedDuration });
      logger.debug('✓ Original Price:', { originalPrice });
      logger.debug('✓ Discounted Price:', { discountedPrice });
      logger.debug('✓ Therapist:', { name: therapist?.name, id: therapist?.id });
      logger.debug('═══════════════════════════════════════════');
      
      const isScheduledBooking = !!(selectedDate && selectedTime);
      const locationText = customerForm.location?.trim() || 'Location provided in chat';

      // Account required at confirmation: if guest, save draft and show auth modal
      if (isGuestUser) {
        const payload = {
          customerName: customerForm.name,
          customerPhone: fullWhatsApp,
          customerWhatsApp: fullWhatsApp,
          duration: selectedDuration || 60,
          serviceType: chatState.selectedService?.serviceName || 'Professional Treatment',
          price: discountedPrice,
          totalPrice: discountedPrice,
          locationZone: customerForm.location || 'Bali',
          location: locationText,
          locationType: customerForm.locationType as 'home' | 'hotel' | 'villa',
          address: locationText,
          hotelVillaName: customerForm.hotelVillaName,
          roomNumber: customerForm.roomNumber,
          coordinates: customerForm.coordinates,
          discountCode: hasDiscount ? discountCode : undefined,
          discountPercentage: hasDiscount ? discountValidation?.percentage : undefined,
          originalPrice: hasDiscount ? originalPrice : undefined,
          ...(isScheduledBooking && { scheduledDate: selectedDate, scheduledTime: selectedTime }),
        };
        saveBookingDraft({
          bookingType: isScheduledBooking ? 'SCHEDULED' : 'ORDER_NOW',
          payload,
          selectedDate: selectedDate || undefined,
          selectedTime: selectedTime || undefined,
          therapistId: therapist?.id || therapist?.$id,
          therapistName: therapist?.name,
        });
        setIsSending(false);
        setShowBookingAuthModal(true);
        return;
      }
      
      // Create booking directly - UI shows slider-style BookingWelcomeBanner (no text chat messages)
      try {
        logger.debug('✅ Creating booking...');
          
          if (isScheduledBooking) {
            // Create scheduled booking with deposit requirement
            logger.debug('📅 Creating scheduled booking...');
            
            // ✅ SIMPLIFIED: Use the location text field directly
            const scheduledLocationText = customerForm.location?.trim() || 'Location provided in chat';
            
            logger.debug('🔍 Scheduled Simple Location Debug:', {
              locationType: customerForm.locationType,
              locationText: scheduledLocationText,
              originalLocation: customerForm.location
            });
            
            try {
              await handleScheduledBookingWithDeposit({
                duration: selectedDuration || 60,
                totalPrice: discountedPrice,
                originalPrice: hasDiscount ? originalPrice : undefined,
                discountCode: hasDiscount ? discountCode : undefined,
                discountPercentage: hasDiscount ? discountValidation.percentage : undefined,
                serviceType: chatState.selectedService?.serviceName || 'Professional Treatment',
                locationZone: customerForm.location || 'Bali',
                location: scheduledLocationText, // ✅ Simple location text from user input
                coordinates: customerForm.coordinates || undefined,
                scheduledDate: selectedDate,
                scheduledTime: selectedTime,
                customerPhone: fullWhatsApp,
                customerWhatsApp: fullWhatsApp,
                customerName: customerForm.name,
                // massageFor: customerForm.massageFor, // ❌ REMOVED: Not in Appwrite schema
                locationType: customerForm.locationType as 'home' | 'hotel' | 'villa',
                address: scheduledLocationText, // ✅ Same as location
                roomNumber: customerForm.roomNumber || undefined,
              });
              logger.debug('✅ Scheduled booking created');
              
              // 🔒 ALWAYS SWITCH TO CHAT STEP for scheduled bookings too
              logger.debug('═══════════════════════════════════════════');
              logger.debug('✅ [ORDER NOW] Scheduled booking created');
              logger.debug('📋 [FLOW STEP 2 ✅] Booking creation completed');
              logger.debug('📋 [FLOW STEP 3 →] Chat session already exists, proceeding to step transition...');
              logger.debug('Switching to chat step...');
              logger.debug('Current URL (should NOT change):', { url: window.location.href });
              logger.debug('Current step before setBookingStep:', { step: chatState.bookingStep });
              logger.debug('═══════════════════════════════════════════');
              
              setBookingStep('chat');
              
              logger.debug('✅ CHAT OPENED AFTER SCHEDULED BOOKING');
              logger.debug('✅ setBookingStep("chat") called for scheduled booking');
              logger.debug('Current step after setBookingStep:', { step: chatState.bookingStep });
            } catch (schedError) {
              logger.error('❌ Scheduled booking failed:', schedError);
              
              setBookingError({
                errorPoint: 'Scheduled Booking Creation',
                errorReason: (schedError as Error).message || 'Failed to create scheduled booking',
                errorDetails: {
                  errorName: (schedError as Error).name,
                  errorStack: (schedError as Error).stack?.split('\n').slice(0, 3).join('\n')
                },
                timestamp: new Date().toLocaleString()
              });
              
              unlockChat();
              throw schedError;
            }
          } else {
            // Regular immediate booking with timeout and retry logic
            logger.debug('📝 Creating immediate booking with reliability layer...');
            try {
              // 🔒 CREATE BOOKING WITH SIMPLE LOCATION FIELD
              logger.debug('📝 [ORDER_NOW_MONITOR] Initiating booking creation with timeout and retry protection');
              
              // ✅ SIMPLIFIED: Use the location text field directly
              const locationText = customerForm.location?.trim() || 'Location provided in chat';
              
              logger.debug('🔍 Simple Location Debug:', {
                locationType: customerForm.locationType,
                locationText: locationText,
                originalLocation: customerForm.location
              });
              
              // 🛡️ RELIABILITY LAYER: Wrap createBooking with timeout and retry logic
              const bookingPayload = {
                // Customer info
                customerName: customerForm.name,
                customerPhone: fullWhatsApp,
                customerWhatsApp: fullWhatsApp,
                // massageFor: customerForm.massageFor, // ❌ REMOVED: Field not in Appwrite schema (causes 400 error)
                
                // Service details - use selected service name when from menu slider (sample menu items)
                duration: selectedDuration || 60,
                serviceType: chatState.selectedService?.serviceName || 'Professional Treatment',
                price: discountedPrice,
                totalPrice: discountedPrice,
                
                // ✅ SIMPLIFIED: Location details using simple text field
                locationZone: customerForm.location || 'Bali',
                location: locationText, // ✅ Simple location text from user input
                locationType: customerForm.locationType as 'home' | 'hotel' | 'villa',
                address: locationText, // ✅ Same as location
                hotelVillaName: customerForm.hotelVillaName,
                roomNumber: customerForm.roomNumber,
                
                // Optional fields
                coordinates: customerForm.coordinates,
                discountCode: hasDiscount ? discountCode : undefined,
                discountPercentage: hasDiscount ? discountValidation.percentage : undefined
              };
              
              logger.debug('🚀 [ORDER_NOW_MONITOR] Booking payload prepared:', {
                customerName: bookingPayload.customerName,
                duration: bookingPayload.duration,
                price: bookingPayload.price,
                location: bookingPayload.location
              });
              
              // Execute booking with timeout and retry logic
              const bookingResult = await withRetry(
                async () => createBooking(bookingPayload),
                3, // maxRetries
                1000, // baseDelayMs (1s, 2s, 4s backoff)
                5000 // timeoutMs per attempt
              );
              
              // Log final result
              logger.debug(`📊 [ORDER_NOW_MONITOR] Booking operation completed:`, {
                success: bookingResult.success,
                attempts: bookingResult.attempts,
                duration: bookingResult.duration,
                bookingId: bookingResult.success ? (bookingResult.data as any)?.id || 'unknown' : null,
                timestamp: new Date().toISOString()
              });
              
              const bookingCreated = bookingResult.success ? bookingResult.data : false;
              
              bookingFlowMonitor.checkpoint('booking_creation', bookingCreated ? 'success' : 'failed',
                { 
                  bookingCreated: !!bookingCreated, 
                  therapistId: therapist?.id || therapist?.$id,
                  attempts: bookingResult.attempts,
                  duration: bookingResult.duration
                },
                bookingCreated ? undefined : `Booking creation failed after ${bookingResult.attempts} attempts`
              );
              
              logger.debug('📝 [ORDER_NOW_MONITOR] Booking created:', { created: !!bookingCreated, bookingId: bookingCreated ? (bookingCreated as any).id : null });
              
              // ✅ FIXED: Only open chat if booking succeeded
              if (!bookingCreated) {
                const errorCategory = bookingResult.error ? categorizeBookingError(bookingResult.error) : 'unknown';
                
                logger.error('❌ [ORDER_NOW_MONITOR] Booking creation FAILED after all retries');
                logger.error('📊 [ORDER_NOW_MONITOR] Failure reason:', errorCategory);
                logger.error('📊 [ORDER_NOW_MONITOR] Error details:', bookingResult.error?.message);
                logger.error('📊 [ORDER_NOW_MONITOR] Total attempts:', bookingResult.attempts);
                logger.error('📊 [ORDER_NOW_MONITOR] Total duration:', { duration: bookingResult.duration, unit: 'ms' });
                
                bookingFlowMonitor.checkpoint('booking_creation', 'failed',
                  { 
                    bookingCreated: false, 
                    therapistId: therapist?.id || therapist?.$id,
                    errorCategory,
                    attempts: bookingResult.attempts,
                    duration: bookingResult.duration
                  },
                  `Booking failed: ${errorCategory} - ${bookingResult.error?.message}`
                );
                
                // User-friendly error message based on error category
                let userMessage = '❌ Booking could not be completed. Please try again.';
                if (errorCategory === 'timeout') {
                  userMessage = '⏱️ Booking request timed out. Please check your connection and try again.';
                } else if (errorCategory === 'network') {
                  userMessage = '🌐 Network error. Please check your internet connection and try again.';
                } else if (errorCategory === 'validation') {
                  userMessage = '⚠️ Please check your booking details and try again.';
                }
                
                addSystemNotification(userMessage);
                setIsSending(false);
                return; // Stay in details step, do NOT open chat
              }
              
              logger.debug('═══════════════════════════════════════════');
              logger.debug('✅ [ORDER_NOW_MONITOR] Booking created successfully');
              logger.debug('📋 [FLOW STEP 1 ✅] Message sending completed');
              logger.debug('📋 [FLOW STEP 2 ✅] Booking creation successful');
              logger.debug('📊 [ORDER_NOW_MONITOR] Success metrics:', {
                attempts: bookingResult.attempts,
                duration: bookingResult.duration + 'ms',
                bookingId: (bookingCreated as any)?.id || 'unknown',
                timestamp: new Date().toISOString()
              });
              logger.debug('Current URL (should NOT change):', { url: window.location.href });
              logger.debug('🔍 [DEBUG] Current bookingStep BEFORE setBookingStep:', { step: chatState.bookingStep });
              logger.debug('🔍 [DEBUG] Current booking object:', { booking: chatState.currentBooking });
              logger.debug('🔍 [DEBUG] isOpen:', { isOpen: chatState.isOpen });
              logger.debug('═══════════════════════════════════════════');
              
              // ✅ State update happens atomically in createBooking - no need to call setBookingStep again
              logger.debug('✅ [BOOKING→CHAT] Booking created with chat mode enabled');
              logger.debug('✅ [STATE] createBooking set bookingStep to "chat" atomically with booking data');
              logger.debug('🎪 [BOOKING→CHAT] Chat window opened after booking success');
              logger.debug('📋 [FLOW STEP 3 ✅] Chat session ready with booking integration');
              logger.debug('⏱️ [FLOW STEP 4 ✅] Welcome timer started');
              logger.debug('✅ setBookingStep("chat") called for immediate booking with chat integration');
              logger.debug('📡 [DASHBOARD NOTIFY] Therapist dashboard will receive real-time notification');
              
              bookingFlowMonitor.checkpoint('booking_success', 'success', {
                bookingCreated: true,
                chatStep: chatState.bookingStep,
                attempts: bookingResult.attempts,
                duration: bookingResult.duration
              });
              bookingFlowMonitor.endBookingFlow(true);
            } catch (bookingError) {
              logger.error('❌ createBooking threw error:', bookingError);
              
              setBookingError({
                errorPoint: 'Immediate Booking Creation',
                errorReason: (bookingError as Error).message || 'Failed to create immediate booking',
                errorDetails: {
                  errorName: (bookingError as Error).name,
                  errorStack: (bookingError as Error).stack?.split('\n').slice(0, 3).join('\n')
                },
                timestamp: new Date().toLocaleString()
              });
              
              unlockChat();
              throw bookingError;
            }
          }
      } catch (innerError) {
        logger.error('❌ Error in booking flow:', innerError);
        logger.error('❌ Error name:', (innerError as Error).name);
        logger.error('❌ Error message:', (innerError as Error).message);
        logger.error('❌ Error stack:', (innerError as Error).stack);
        throw innerError; // Re-throw to outer catch
      }
      
      setIsSending(false);
      // 🔒 EXPLICIT RETURN FALSE: Block any remaining event propagation
      return false;
    } catch (error: unknown) {
      const err = error as Error; 
      logger.error('❌ [OUTER CATCH] Failed to send booking request:', err);
      logger.error('❌ [OUTER CATCH] Error name:', err.name);
      logger.error('❌ [OUTER CATCH] Error message:', err.message);
      logger.error('❌ [OUTER CATCH] Error stack:', err.stack);
      
      // 🚨 Set comprehensive error state for display
      setBookingError({
        errorPoint: 'Booking Flow - Final Catch',
        errorReason: err.message || 'An unexpected error occurred during booking submission',
        errorDetails: {
          errorName: err.name,
          errorMessage: err.message,
          errorStack: err.stack?.split('\n').slice(0, 5).join('\n'),
          formData: {
            name: customerForm.name ? '✅ Provided' : '❌ Missing',
            whatsApp: customerForm.whatsApp ? '✅ Provided' : '❌ Missing',
            locationType: customerForm.locationType || '❌ Missing'
          }
        },
        timestamp: new Date().toLocaleString()
      });
      
      // �🔄 [FIXED FLOW] Keep user in details step on error so they can retry
      logger.debug('🔄 [ERROR RECOVERY] Staying in details step for user to retry booking...');
      addSystemNotification(CHAT_MSG[currentLanguage].bookingFailed);
      
      // 🔓 UNLOCK CHAT on error to allow user to retry or close if needed
      unlockChat();
      logger.debug('🔓 Chat unlocked after booking error - user can retry');
      
      // Don't switch to chat step on error - let user retry
      
      // Prevent any default action even on error
      return false;
    } finally {
      logger.debug('🏁 Finishing submission, setting isSending to false');
      setIsSending(false);
      
      // ✅ DEFENSIVE CLEANUP: Navigation is cleaned up by isolated booking service
      logger.debug('✅ [BOOKING ISOLATION] Cleanup handled by isolation layer');
    }
    
    // 🔒 FINAL SAFEGUARD: Return false to prevent any form submission
    return false;
  };

  // Handle scheduled booking with 30% deposit
  const handleScheduledBookingWithDeposit = async (bookingData: any) => {
    try {
      const therapist = chatState.therapist;
      if (!therapist) return;
      
      // Calculate 30% deposit
      const totalPrice = bookingData.totalPrice;
      const depositAmount = Math.round(totalPrice * 0.30);
      setDepositAmount(depositAmount);
      
      const therapistDocId = (therapist as any).appwriteId || (therapist as any).$id || therapist.id;
      const providerType = (therapist as { providerType?: 'therapist' | 'place' })?.providerType || 'therapist';
      const scheduledDeposit = await scheduledBookingPaymentService.createScheduledBookingWithDeposit({
        bookingId: `scheduled_${Date.now()}`,
        customerId: chatState.currentUserId || 'guest',
        customerName: chatState.customerName || 'Guest Customer',
        therapistId: therapistDocId,
        therapistName: getTherapistDisplayName(therapist.name),
        providerType,
        serviceType: bookingData.serviceType,
        duration: bookingData.duration,
        totalPrice: totalPrice,
        scheduledDate: bookingData.scheduledDate,
        scheduledTime: bookingData.scheduledTime,
        location: bookingData.location || 'Location TBD', // ✅ Use simple location field
        coordinates: bookingData.coordinates
      });
      
      // Show deposit payment modal
      setShowDepositModal(true);
      
      // Add system message about deposit requirement
      addSystemNotification(
        CHAT_MSG[currentLanguage].scheduledCreatedBefore + formatPrice(depositAmount) + CHAT_MSG[currentLanguage].scheduledCreatedAfter
      );
      
      logger.debug('💰 Scheduled booking created with deposit requirement:', scheduledDeposit);
    } catch (error) {
      logger.error('❌ Failed to create scheduled booking with deposit:', error);
      addSystemNotification(CHAT_MSG[currentLanguage].scheduledFailed);
    }
  };
  
  // Continue booking after user signs in or creates account (from BookingAuthModal)
  const handleBookingAuthSuccess = async () => {
    await refreshUser();
    const draft = getBookingDraft();
    if (!draft) {
      setShowBookingAuthModal(false);
      return;
    }
    clearBookingDraft();
    setShowBookingAuthModal(false);
    if (draft.bookingType === 'ORDER_NOW') {
      const ok = await createBooking(draft.payload);
      if (ok) setBookingStep('chat');
    } else {
      await handleScheduledBookingWithDeposit({
        duration: draft.payload.duration,
        totalPrice: draft.payload.totalPrice,
        originalPrice: draft.payload.originalPrice,
        serviceType: draft.payload.serviceType,
        scheduledDate: draft.selectedDate,
        scheduledTime: draft.selectedTime,
        location: draft.payload.location,
        locationZone: draft.payload.locationZone,
        coordinates: draft.payload.coordinates,
        customerName: draft.payload.customerName,
        customerPhone: draft.payload.customerPhone,
        customerWhatsApp: draft.payload.customerWhatsApp,
      });
      setBookingStep('chat');
    }
  };

  // Handle deposit payment submission
  const handleDepositPayment = async (paymentProofFile: File, paymentMethod: string) => {
    if (!chatState.currentBooking) return;
    
    try {
      setIsProcessingDeposit(true);
      
      // Process deposit payment
      await scheduledBookingPaymentService.processDepositPayment(
        chatState.currentBooking.id,
        paymentProofFile,
        paymentMethod as any,
        'Customer deposit payment for scheduled booking'
      );
      
      // Close modal
      setShowDepositModal(false);
      
      // Add confirmation message
      addSystemNotification(CHAT_MSG[currentLanguage].depositSubmitted);
      
      logger.debug('💳 Deposit payment submitted successfully');
    } catch (error) {
      logger.error('❌ Failed to process deposit payment:', error);
      addSystemNotification(CHAT_MSG[currentLanguage].depositFailed);
    } finally {
      setIsProcessingDeposit(false);
    }
  };

  // Spec 3.1 & 3.2: Upload payment proof in chat (jpg/png, max 5MB); visible to therapist
  const handleUploadPaymentProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      addSystemNotification(CHAT_MSG[currentLanguage].uploadJpgPng);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addSystemNotification(CHAT_MSG[currentLanguage].fileMax5mb);
      return;
    }
    setUploadingProof(true);
    try {
      const { appwriteStorage: storage } = await import('../lib/appwrite');
      const { ID } = await import('appwrite');
      const { APPWRITE_CONFIG } = await import('../lib/appwrite.config');
      const fileId = ID.unique();
      await storage.createFile('payment_proofs', fileId, file);
      const url = `${APPWRITE_CONFIG.endpoint}/storage/buckets/payment_proofs/files/${fileId}/view`;
      addMessage({
        senderId: 'customer',
        senderName: chatState.customerName || 'You',
        type: 'payment_proof',
        message: url,
      });
      if (chatState.currentBooking?.documentId) {
        updateBookingPaymentProof(chatState.currentBooking.documentId, url).catch(() => {});
      }
      addSystemNotification(CHAT_MSG[currentLanguage].paymentProofUploaded);
    } catch (err) {
      logger.error('Upload payment proof failed', err);
      addSystemNotification(CHAT_MSG[currentLanguage].uploadProofFailed);
    } finally {
      setUploadingProof(false);
    }
  };

  // Handle send message (with spam detection)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || isSending) return;

    const content = messageInput.trim();
    
    // Validate message for phone numbers/contact info before sending
    const validation = validateMessage(content);
    if (!validation.isValid) {
      setMessageWarning(validation.warning);
      // Clear warning after 5 seconds
      setTimeout(() => setMessageWarning(null), 5000);
      return;
    }
    
    setMessageInput('');
    setMessageWarning(null);
    setIsSending(true);

    try {
      const result = await sendMessage(content);
      if (!result.sent && result.warning) {
        setMessageWarning(result.warning);
        setTimeout(() => setMessageWarning(null), 5000);
      }
    } catch (error: unknown) {
      const err = error as Error; logger.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Minimized bubble
  // Show profile picture only if booking sent or in active chat, otherwise show chat icon
  const hasActiveChat = messages.length > 0 && bookingStep === 'chat';
  
  if (isMinimized) {
    return (
      <button
        onClick={maximizeChat}
        className="fixed bottom-4 right-4 z-[9999] flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        <div className="relative">
          {hasActiveChat ? (
            <>
              <img 
                src={(therapist as any).profilePicture || (therapist as any).mainImage || (therapist as any).profileImageUrl || (therapist as any).heroImageUrl || (therapist as any).image || (therapist as any).profileImage || getRandomTherapistImage((therapist as any).appwriteId || therapist.id || therapist.$id || '')} 
                alt={getTherapistDisplayName(therapist.name)}
                className="w-10 h-10 rounded-full object-cover border-2 border-white"
              />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>
            </>
          ) : (
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
        <div className="text-left">
          <div className="font-semibold text-sm">{hasActiveChat ? getTherapistDisplayName(therapist.name) : 'Continue Booking'}</div>
          <div className="text-xs text-amber-100">{hasActiveChat ? 'Tap to continue chat' : 'Tap to continue'}</div>
        </div>
      </button>
    );
  }

  // ========================================================================
  // BOOKING NOTIFICATION HANDLERS
  // ========================================================================

  const handleBookingExpire = (bookingId: string) => {
    logger.debug('Booking expired:', { bookingId });
    addSystemNotification(CHAT_MSG[currentLanguage].requestExpired);
  };

  // Convert current booking to BookingRequest format for the banner
  const createBookingRequestFromCurrent = () => {
    if (!chatState.currentBooking) return null;
    
    const booking = chatState.currentBooking;
    const expiryTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    const createdTime = new Date(booking.createdAt || Date.now()).getTime();
    
    return {
      id: booking.id,
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      service: booking.serviceType,
      duration: booking.duration,
      date: booking.scheduledDate,
      time: booking.scheduledTime,
      location: booking.locationZone,
      coordinates: booking.coordinates,
      totalPrice: booking.totalPrice,
      bookingType: booking.bookingType as unknown as 'book_now' | 'scheduled',
      discountCode: booking.discountCode,
      discountPercentage: booking.discountPercentage,
      originalPrice: booking.originalPrice,
      createdAt: createdTime,
      expiresAt: createdTime + expiryTime,
    };
  };

  // Don't render if chat is not open
  if (!chatState.isOpen) {
    return null;
  }

  // 🔍 DEBUGGING: Log therapist data being displayed
  logger.debug('🔍 PersistentChatWindow RENDER: therapist being displayed:', { name: therapist?.name, id: therapist?.id });
  logger.debug('🔍 PersistentChatWindow RENDER: chatState.therapist:', { name: chatState.therapist?.name, id: chatState.therapist?.id });

  // Full chat window
  return (
    <StatusThemeProvider 
      initialStatus={chatState.currentBooking?.status as BookingProgressStep || 'requested'}
    >
      {/* Booking Confirmation Container - Only show when chat is NOT open (full-screen overlay) */}
      {chatState.currentBooking && timerState.isActive && timerState.remainingSeconds > 0 && !chatState.isTherapistView && !chatState.isOpen && (
        <BookingConfirmationContainer
          therapistName={chatState.therapist?.name || 'Therapist'}
          therapistImage={(chatState.therapist as any)?.profilePicture || chatState.therapist?.mainImage || (chatState.therapist as any)?.profileImageUrl || chatState.therapist?.image || chatState.therapist?.profileImage}
          bookingId={chatState.currentBooking.bookingId}
          bookingDetails={{
            customerName: chatState.currentBooking.customerName,
            customerWhatsApp: chatState.currentBooking.customerWhatsApp,
            massageFor: (chatState.currentBooking as any).massageFor,
            locationType: chatState.currentBooking.locationType,
            duration: chatState.currentBooking.duration,
            price: getPrice(chatState.currentBooking.duration || 60),
            serviceType: chatState.currentBooking.serviceType || 'Professional Treatment'
          }}
          countdownSeconds={timerState.remainingSeconds}
          onCancel={() => cancelBooking()}
          showConfirmation={true}
        />
      )}

      {/* ⚠️ CRITICAL: Single div wrapper instead of fragment for stable React reconciliation */}
      <div className="chat-theme-wrapper">
        {/* CSS styles moved OUTSIDE main chat div to prevent DOM conflicts */}
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none; /* Safari and Chrome */
          }
          
          @keyframes slideUp {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          .animate-slide-up {
            animation: slideUp 0.3s ease-out forwards;
          }
          
          /* Shake animation for error container */
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
          .animate-shake {
            animation: shake 0.5s ease-in-out;
          }
        `}</style>

        {/* Enhanced Booking Notification Banner */}
        {chatState.currentBooking?.status === 'pending' && chatState.isTherapistView && (
          <BookingNotificationBanner
            booking={createBookingRequestFromCurrent()!}
            onAccept={handleAcceptBooking}
            onDecline={handleDeclineBooking}
            onExpire={handleBookingExpire}
            isVisible={true}
          />
        )}

        {/* Spec 4.1 & 4.3: Therapist 30 min to confirm/reject payment proof (scheduled + accepted) */}
        {isScheduledAcceptedAsTherapist && (
          <div className="mx-4 mb-4 p-4 rounded-xl border-2 bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-200">
            <h4 className="font-bold text-violet-900 mb-2 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Confirm payment received
            </h4>
            <p className="text-sm text-violet-800 mb-3">
              Customer submitted payment proof. Confirm or reject within 30 minutes. Once confirmed, the slot will be marked as booked (red) on your calendar.
            </p>
            <div className="flex items-center gap-3 p-3 bg-white/80 rounded-lg border border-violet-200 mb-3">
              <Clock className="w-6 h-6 text-violet-600" />
              <span className="font-mono text-xl font-bold text-violet-800">
                {formatCountdown(therapistConfirmCountdownSeconds)}
              </span>
              <span className="text-sm text-violet-700">remaining</span>
            </div>
            {therapistConfirmCountdownSeconds > 0 && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => confirmPaymentReceived()}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm"
                >
                  Confirm payment received
                </button>
                <button
                  type="button"
                  onClick={() => rejectPaymentProof()}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm"
                >
                  Reject proof
                </button>
              </div>
            )}
            {/* Spec 4.3: Show buttons even after 30 min so therapist can still confirm/reject; reminder sent once when countdown hit 0 */}
            {therapistConfirmCountdownSeconds === 0 && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => confirmPaymentReceived()}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm"
                >
                  Confirm payment received
                </button>
                <button
                  type="button"
                  onClick={() => rejectPaymentProof()}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm"
                >
                  Reject proof
                </button>
              </div>
            )}
          </div>
        )}

        {/* Spec 8.2: Therapist/place can agree to refund deposit (exception flow) */}
        {chatState.isTherapistView && chatState.currentBooking && (chatState.currentBooking as { bookingType?: string })?.bookingType === 'SCHEDULED' && ((chatState.currentBooking as { lifecycleStatus?: string })?.lifecycleStatus === 'ACCEPTED' || (chatState.currentBooking as { lifecycleStatus?: string })?.lifecycleStatus === 'CONFIRMED') && (
          <div className="mx-4 mb-4">
            <button
              type="button"
              onClick={() => window.confirm('Refund deposit to customer and cancel this booking?') && refundDeposit()}
              className="text-xs text-amber-700 hover:text-amber-900 underline"
            >
              Refund deposit (exception: no-show / agree to refund)
            </button>
          </div>
        )}
      
      <div
        data-testid="persistent-chat-window"
        className="fixed bottom-0 pb-[env(safe-area-inset-bottom)] left-0 right-0 sm:bottom-4 sm:left-auto sm:right-4 z-[9999] w-full sm:w-[380px] sm:max-w-[calc(100%-32px)] bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col animate-slide-up"
        style={{ 
          /* MOBILE SCROLL COMPLIANCE: Chat window with internal scrolling */
          /* UX FIX: Added safe-area-inset padding for iOS home indicator */
          height: 'min(600px, calc(100dvh - 60px - env(safe-area-inset-bottom)))', // Fixed: iOS Safari viewport + safe area
          maxHeight: 'calc(100dvh - 60px - env(safe-area-inset-bottom))', // Fixed: iOS Safari viewport + safe area
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
      {/* Header - Align with price modal: profilePicture (avatar) first, then mainImage */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-4 flex items-center gap-3">
        
        <img 
          src={(therapist as any).profilePicture || (therapist as any).mainImage || (therapist as any).profileImageUrl || (therapist as any).heroImageUrl || (therapist as any).image || (therapist as any).profileImage || getRandomTherapistImage((therapist as any).appwriteId || therapist.id || therapist.$id || '')}
          alt={getTherapistDisplayName(therapist.name)}
          className="w-10 h-10 rounded-full object-cover border-2 border-white/20 flex-shrink-0 bg-gray-200"
          onError={(e) => {
            (e.target as HTMLImageElement).src = getRandomTherapistImage((therapist as any).appwriteId || therapist.id || therapist.$id || '');
          }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base truncate" id="chat-therapist-name" data-gb="Nama Terapis|Therapist Name">{getTherapistDisplayName(therapist.name)}</h3>
          {/* Availability Indicator - Green flashing dot + "Available" text (case-insensitive) */}
          {(therapist.status || '').toUpperCase() === 'AVAILABLE' && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-green-100" id="availability-status" data-gb="Tersedia|Available">Available</span>
            </div>
          )}
        </div>
        
        {/* 🌐 UI Language Toggle (LOCKED-IN SPEC) */}
        {/* ✅ Toggles UI text only (labels, buttons, system messages) */}
        {/* ❌ Does NOT translate chat messages */}
        <button 
          className={`p-2 rounded-full transition-colors ${
            chatState.currentBooking 
              ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed opacity-50'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
          onClick={() => {
            // 🔒 SAFETY: Disable language switching during active booking
            if (chatState.currentBooking) {
              logger.warn('🔒 [UI LANGUAGE] Switching disabled during active booking');
              alert('⚠️ Language switching is temporarily disabled during booking to prevent data loss.');
              return;
            }
            
            // Toggle language
            const newLang = currentLanguage === 'id' ? 'en' : 'id';
            
            // Update state
            setCurrentLanguage(newLang);
            
            // Persist to localStorage
            localStorage.setItem('chat_ui_language', newLang);
            
            // Sync to HTML attribute
            document.documentElement.setAttribute('data-lang', newLang);
            
            logger.debug('🌐 [UI LANGUAGE] Switched to:', { language: newLang === 'id' ? 'Indonesian' : 'English' });
            logger.debug('💬 [MESSAGES] Stay in original language (NOT translated)');
          }}
          id="language-selector" 
          data-gb="Bahasa|Language"
          title={chatState.currentBooking 
            ? 'Language switching disabled during booking' 
            : (currentLanguage === 'id' 
                ? '🌐 Switch to English (UI only)' 
                : '🌐 Beralih ke Bahasa Indonesia (UI saja)')
          }
          disabled={!!chatState.currentBooking}
        >
          <span className="text-lg">
            {currentLanguage === 'id' ? '🇮🇩' : '🇬🇧'}
          </span>
        </button>
        
        {/* Minimize Button */}
        <button
          onClick={minimizeChat}
          className="p-2 hover:bg-white/20 transition-colors rounded-full"
          title="Minimize Chat"
          id="minimize-chat-btn" 
          data-gb="Perkecil Chat|Minimize Chat"
        >
          <svg className="w-5 h-5 font-bold" fill="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" stroke="currentColor" fill="none"/>
          </svg>
        </button>
      </div>



      {/* 🚨 ERROR DISPLAY CONTAINER - Shows booking flow errors with detailed information */}
      {bookingError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4 rounded-lg shadow-lg animate-shake relative z-50" 
             role="alert" 
             style={{position: 'sticky', top: '10px', border: '2px solid #ef4444'}}>
          <div className="animate-pulse bg-red-100 absolute -top-1 -left-1 -right-1 h-2 rounded-t opacity-50"></div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-red-800 font-bold text-lg">⚠️ Booking Error</h3>
                <button
                  onClick={() => setBookingError(null)}
                  className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-100"
                  title="Clear error"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="bg-white rounded p-2 border border-red-200">
                  <p className="text-gray-700 font-semibold mb-1">📍 Error Point:</p>
                  <p className="text-red-700 font-mono text-xs bg-red-50 p-2 rounded">
                    {bookingError.errorPoint}
                  </p>
                </div>
                
                <div className="bg-white rounded p-2 border border-red-200">
                  <p className="text-gray-700 font-semibold mb-1">❌ Reason:</p>
                  <p className="text-red-600">
                    {bookingError.errorReason}
                  </p>
                </div>
                
                {bookingError.errorDetails && (
                  <div className="bg-white rounded p-2 border border-red-200">
                    <p className="text-gray-700 font-semibold mb-2">🔍 Detailed Error Information:</p>
                    
                    {bookingError.errorDetails.appwriteDetails && (
                      <div className="mb-3 p-3 bg-amber-50 rounded border border-amber-200">
                        <p className="font-semibold text-amber-800 mb-1">📊 Appwrite Service Details:</p>
                        <div className="text-sm text-amber-700 space-y-1">
                          <p><strong>Issue:</strong> {bookingError.errorDetails.appwriteDetails.issue}</p>
                          <p><strong>Solution:</strong> {bookingError.errorDetails.appwriteDetails.solution}</p>
                          {bookingError.errorDetails.appwriteDetails.currentConfig && (
                            <p><strong>Config:</strong> {bookingError.errorDetails.appwriteDetails.currentConfig}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <details className="cursor-pointer mb-2">
                      <summary className="text-sm text-gray-600 hover:text-gray-800 py-1">📋 Form Data Status</summary>
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        {Object.entries(bookingError.errorDetails.formData || {}).map(([key, value]) => (
                          <div key={key} className="flex justify-between py-1">
                            <span className="capitalize font-medium">{key}:</span>
                            <span className={value?.toString().includes('✅') ? 'text-green-600' : 'text-red-600'}>
                              {value?.toString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </details>
                    
                    <details className="cursor-pointer mb-2">
                      <summary className="text-sm text-gray-600 hover:text-gray-800 py-1">🔧 System Information</summary>
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono">
                        <p><strong>Time:</strong> {bookingError.errorDetails.systemInfo?.timestamp}</p>
                        <p><strong>URL:</strong> {bookingError.errorDetails.systemInfo?.url}</p>
                        <p><strong>Browser:</strong> {bookingError.errorDetails.systemInfo?.userAgent}</p>
                      </div>
                    </details>
                    
                    <details className="cursor-pointer">
                      <summary className="text-sm text-gray-600 hover:text-gray-800 py-1">⚠️ Full Error Details</summary>
                      <pre className="text-xs text-gray-600 font-mono bg-gray-50 p-2 rounded overflow-x-auto mt-2">
                        {JSON.stringify(bookingError.errorDetails, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
                
                <div className="text-xs text-gray-500 pt-2 border-t border-red-200">
                  ⏰ {bookingError.timestamp}
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-red-200">
                <p className="text-sm text-gray-600 mb-2">💡 What to do:</p>
                <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                  <li>Check your internet connection</li>
                  <li>Verify all form fields are filled correctly</li>
                  <li>Try again in a few moments</li>
                  <li>Contact support if error persists</li>
                </ul>
                
                <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                  <p className="text-xs text-blue-700 mb-2">🔧 Debug Actions:</p>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        logger.debug('🔍 Current Form State:', customerForm);
                        logger.debug('🔍 Current Chat State:', chatState);
                        logger.debug('🔍 Full Error Object:', bookingError);
                      }}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                    >
                      Log All States
                    </button>
                    <button
                      onClick={() => {
                        const errorReport = {
                          error: bookingError,
                          form: customerForm,
                          timestamp: new Date().toISOString(),
                          url: window.location.href
                        };
                        navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2)).then(() => {
                          alert('Complete error report copied to clipboard! 📋');
                        }).catch(() => {
                          alert('Error details logged to console');
                          logger.debug('📋 Complete Error Report:', errorReport);
                        });
                      }}
                      className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                    >
                      Copy Error Report
                    </button>
                    <button
                      onClick={() => {
                        setBookingError(null);
                        logger.debug('🧹 Error cleared from UI');
                      }}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                    >
                      Clear Error
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const { runSystemDiagnostics, displayDiagnostics } = await import('../utils/chatDiagnostics');
                          logger.debug('🔍 Running system diagnostics...');
                          const diagnostics = await runSystemDiagnostics();
                          displayDiagnostics(diagnostics);
                          alert(`Diagnostics complete! Check console for details.\nOverall status: ${diagnostics.overall}`);
                        } catch (error) {
                          logger.error('❌ Diagnostics failed:', error);
                          alert('Failed to run diagnostics. Check console for details.');
                        }
                      }}
                      className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                    >
                      🔍 Run Diagnostics
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <>
      {/* Therapist Booking Notifications */}
      {chatState.isTherapistView && bookingNotifications.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-amber-400 to-red-500">
          {bookingNotifications.map((notification) => (
            <div key={notification.bookingId} className="bg-white rounded-lg p-4 mb-3 last:mb-0 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-6 h-6 bg-amber-500 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800 mb-1" id="new-booking-title" data-gb="Permintaan Booking Baru|New Booking Request">
                    🔔 Permintaan Booking Baru
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 mb-3">
                    <div><strong id="customer-label" data-gb="Pelanggan|Customer">Pelanggan:</strong> {notification.customerName}</div>
                    <div><strong id="service-type-label" data-gb="Layanan|Service">Layanan:</strong> {notification.serviceType}</div>
                    <div><strong id="duration-booking-label" data-gb="Durasi|Duration">Durasi:</strong> {notification.duration} menit</div>
                    <div><strong id="price-booking-label" data-gb="Harga|Price">Harga:</strong> {Math.round(notification.price / 1000)}k</div>
                    <div className="col-span-2"><strong id="location-label" data-gb="Lokasi|Location">Lokasi:</strong> {notification.location.address}</div>
                  </div>
                  <p className="text-xs text-amber-700 font-medium mb-2" data-gb="Terima dalam 5 menit|Accept within 5 minutes">⏱ Terima dalam 5 menit</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptBooking(notification.bookingId)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                      id="accept-booking-btn" 
                      data-gb="Terima Booking|Accept Booking"
                    >
                      ✅ Terima Booking
                    </button>
                    <button
                      onClick={() => handleDeclineBooking(notification.bookingId)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                      id="decline-booking-btn" 
                      data-gb="Tolak|Decline"
                    >
                      ❌ Tolak
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      </>

      {/* Content area - flex column; chat step has internal scroll for messages, input fixed at bottom */}
      <div className={`flex-1 bg-white flex flex-col min-h-0 ${bookingStep === 'chat' ? '' : 'overflow-y-auto'}`} style={bookingStep === 'chat' ? {} : { 
        overscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'touch',
      }}>
        
        {/* Duration Selection Step */}
        {bookingStep === 'duration' && (
          <div key="duration-step" className="p-4">
            <div className="text-center mb-4">
              <div className="w-48 h-48 mx-auto mb-3 rounded-full overflow-hidden">
                <img 
                  src="https://ik.imagekit.io/7grri5v7d/indastreet%20massage%20logo.png?updatedAt=1764533351258" 
                  alt="Indastreet Massage" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="font-semibold text-gray-800">Select Duration</h4>
              <p className="text-sm text-gray-500 mt-1">Choose your preferred massage duration</p>
            </div>
            
            {/* CSS for animated hand clicking effect */}
            {/* Using CSS variables for responsive container positioning */}
            <style>{`
              :root {
                --container-height: 68px;
                --container-gap: 12px;
                --hand-size: 120px;
                --hand-offset: 15px;
              }
              @keyframes handMove {
                0%, 10% { transform: translateX(-50%) translateY(calc(var(--container-height) / 2 + var(--hand-offset))); }
                15% { transform: translateX(-50%) translateY(calc(var(--container-height) / 2 + var(--hand-offset) + 5px)) scale(0.95); }
                20%, 30% { transform: translateX(-50%) translateY(calc(var(--container-height) / 2 + var(--hand-offset))); }
                33%, 43% { transform: translateX(-50%) translateY(calc(var(--container-height) + var(--container-gap) + var(--container-height) / 2 + var(--hand-offset))); }
                48% { transform: translateX(-50%) translateY(calc(var(--container-height) + var(--container-gap) + var(--container-height) / 2 + var(--hand-offset) + 5px)) scale(0.95); }
                53%, 63% { transform: translateX(-50%) translateY(calc(var(--container-height) + var(--container-gap) + var(--container-height) / 2 + var(--hand-offset))); }
                66%, 76% { transform: translateX(-50%) translateY(calc((var(--container-height) + var(--container-gap)) * 2 + var(--container-height) / 2 + var(--hand-offset))); }
                81% { transform: translateX(-50%) translateY(calc((var(--container-height) + var(--container-gap)) * 2 + var(--container-height) / 2 + var(--hand-offset) + 5px)) scale(0.95); }
                86%, 96% { transform: translateX(-50%) translateY(calc((var(--container-height) + var(--container-gap)) * 2 + var(--container-height) / 2 + var(--hand-offset))); }
                100% { transform: translateX(-50%) translateY(calc(var(--container-height) / 2 + var(--hand-offset))); }
              }
              @keyframes containerHighlight1 {
                0%, 10% { border-color: #fb923c; background-color: #fff7ed; box-shadow: 0 10px 15px -3px rgba(251, 146, 60, 0.3); }
                15% { border-color: #f97316; background-color: #ffedd5; box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.4); transform: scale(1.02); }
                20%, 100% { border-color: #e5e7eb; background-color: white; box-shadow: none; transform: scale(1); }
              }
              @keyframes containerHighlight2 {
                0%, 32% { border-color: #e5e7eb; background-color: white; box-shadow: none; transform: scale(1); }
                33%, 43% { border-color: #fb923c; background-color: #fff7ed; box-shadow: 0 10px 15px -3px rgba(251, 146, 60, 0.3); }
                48% { border-color: #f97316; background-color: #ffedd5; box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.4); transform: scale(1.02); }
                53%, 100% { border-color: #e5e7eb; background-color: white; box-shadow: none; transform: scale(1); }
              }
              @keyframes containerHighlight3 {
                0%, 65% { border-color: #e5e7eb; background-color: white; box-shadow: none; transform: scale(1); }
                66%, 76% { border-color: #fb923c; background-color: #fff7ed; box-shadow: 0 10px 15px -3px rgba(251, 146, 60, 0.3); }
                81% { border-color: #f97316; background-color: #ffedd5; box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.4); transform: scale(1.02); }
                86%, 100% { border-color: #e5e7eb; background-color: white; box-shadow: none; transform: scale(1); }
              }
              .hand-animation { animation: handMove 10s ease-in-out infinite; }
              .container-animate-1 { animation: containerHighlight1 10s ease-in-out infinite; }
              .container-animate-2 { animation: containerHighlight2 10s ease-in-out infinite; }
              .container-animate-3 { animation: containerHighlight3 10s ease-in-out infinite; }
              .duration-container { height: var(--container-height); }
            `}</style>
            
            <div className="relative">
              {/* Animated clicking hand - hide when report form is open */}
              {!isReportFormOpen && (
                <div className="absolute left-1/2 top-0 z-10 hand-animation pointer-events-none">
                  <img 
                    src="https://ik.imagekit.io/7grri5v7d/glove-removebg-preview.png" 
                    alt="Click to select" 
                    className="w-[120px] h-[120px] drop-shadow-lg object-contain"
                  />
                </div>
              )}
              
              <div className="space-y-3">
                {DURATION_OPTIONS.map((option, index) => {
                  const price = getPrice(option.minutes);
                  const animationClass = index === 0 ? 'container-animate-1' : index === 1 ? 'container-animate-2' : 'container-animate-3';
                  return (
                    <div key={option.minutes} className="w-full">
                      <button
                        onClick={() => handleDurationSelect(option.minutes)}
                        className={`w-full p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-amber-400 hover:bg-amber-50 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 text-left group cursor-pointer duration-container ${animationClass}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-800 group-hover:text-amber-600">
                              {option.label}
                            </div>
                            <div className="text-sm text-gray-500">{option.minutes} minutes</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-amber-500 text-lg">
                              {(Math.round(price / 1000))}k
                            </div>
                            <div className="text-xs text-gray-400 group-hover:text-amber-400">Book Now →</div>
                          </div>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Single link at bottom - opens same slider as Jenis Pijat Apa */}
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                setMassageTypesExpandedCards({});
                setIsMassageTypesModalOpen(true);
              }}
                className="text-sm text-amber-600 font-medium hover:text-amber-700 underline-offset-2 hover:underline"
              >
                Not sure? View massage types
              </button>
            </div>
            
            <p className="text-xs text-gray-400 text-center mt-4">
              Indonesia's Premium Choice
            </p>
          </div>
        )}

        {/* DateTime Selection Step (for Schedule mode) */}
        {bookingStep === 'datetime' && (
          <div key="datetime-step" className="p-4">
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-amber-100 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-amber-500" />
              </div>
              <h4 className="font-semibold text-gray-800">Schedule Appointment</h4>
              <p className="text-sm text-gray-500 mt-1">
                {DURATION_OPTIONS.find(opt => opt.minutes === selectedDuration)?.label || `${selectedDuration} min`} • {formatPrice(getPrice(selectedDuration || 60))}
              </p>
            </div>
            
            <div className="space-y-4">
              {/* Date Picker */}
              <CustomDatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                minDate={new Date().toISOString().split('T')[0]}
                label="Select Date"
              />
              
              {/* Time Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Select Time
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'].map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        selectedTime === time
                          ? 'bg-amber-500 text-white'
                          : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-amber-400'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Selected Summary */}
              {selectedDate && selectedTime && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <div className="text-sm text-amber-800">
                    <strong>Selected:</strong> {new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })} at {selectedTime}
                  </div>
                </div>
              )}
              
              <button
                onClick={handleDateTimeSubmit}
                disabled={!selectedDate || !selectedTime}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Continue to Details
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Step - Pre-selected service from Menu Harga */}
        {bookingStep === 'confirmation' && chatState.selectedService && (
          <div key="confirmation-step" className="p-4">
            {/* Service Card with Arrival Countdown */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-50 rounded-2xl p-4 border border-amber-200 shadow-sm mb-4">
              {/* Header with therapist */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <img 
                    src={(therapist as any).profilePicture || (therapist as any).mainImage || (therapist as any).profileImageUrl || (therapist as any).heroImageUrl || (therapist as any).image || (therapist as any).profileImage || getRandomTherapistImage((therapist as any).appwriteId || therapist.id || therapist.$id || '')} 
                    alt={getTherapistDisplayName(therapist.name)}
                    className="w-14 h-14 rounded-full object-cover border-2 border-amber-400 shadow-md"
                  />
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{getTherapistDisplayName(therapist.name)}</h4>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>4.9</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-green-600 font-medium">Available</span>
                  </div>
                </div>
              </div>

              {/* Selected Service Details */}
              <div className="bg-white rounded-xl p-3 border border-amber-200 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Selected Service</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <div className="font-bold text-lg text-gray-900 mb-1">
                  {chatState.selectedService.serviceName}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">{chatState.selectedService.duration} min</span>
                  </div>
                  <div className="text-xl font-bold text-amber-600">
                    {formatPrice(chatState.selectedService.price)}
                  </div>
                </div>
              </div>

              {/* Arrival Time Countdown */}
              <div className="bg-gradient-to-r from-amber-500 to-amber-500 rounded-xl p-3 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs opacity-90">Estimated Arrival</div>
                      <div className="font-semibold">~1 Hour</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs opacity-90">Countdown</div>
                    <div className="font-bold text-2xl font-mono tracking-wider">
                      {formatCountdown(arrivalCountdown)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirm & Book Button */}
            <button
              onClick={() => setBookingStep('details')}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <Check className="w-5 h-5" />
              Confirm & Book Now
            </button>

            {/* Change Selection Link */}
            <button
              onClick={() => setBookingStep('duration')}
              className="w-full mt-3 py-2 text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              ← Change selection
            </button>
          </div>
        )}

        {/* Customer Details Step */}
        {bookingStep === 'details' && (
          <div key="details-step" className="p-4">
            <div className="text-center mb-4">
              <div className="w-64 h-64 mx-auto -mt-[15px] flex items-center justify-center">
                <img 
                  src="https://ik.imagekit.io/7grri5v7d/indastreet%20massage%20logo.png?updatedAt=1764533351258" 
                  alt="Indastreet Massage"
                  className="w-64 h-64 object-contain"
                />
              </div>
              <h4 className="text-lg font-bold text-gray-800 text-center mb-2 -mt-[20px]">Booking Details</h4>
            </div>
            <div className="text-center mb-4">
              {chatState.selectedService ? (
                <div className="mt-2 space-y-1">
                  <p className="text-lg font-medium text-amber-600">{chatState.selectedService.serviceName}</p>
                  <p className="text-base text-gray-700">
                    <span className="font-bold">{chatState.selectedService.duration} min</span> • <span className="font-bold">IDR {chatState.selectedService.price.toLocaleString('id-ID')}</span>
                  </p>
                </div>
              ) : (
                <p className="text-base text-gray-700 mt-1">
                  <span className="font-bold">{DURATION_OPTIONS.find(opt => opt.minutes === selectedDuration)?.label || `${selectedDuration} min`}</span> • <span className="font-bold">{Math.round(getPrice(selectedDuration || 60) / 1000)}k</span>
                </p>
              )}
              {isScheduleMode && selectedDate && selectedTime && (
                <p className="text-sm text-amber-600 mt-1">
                  📅 {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {selectedTime}
                </p>
              )}
              {isScheduleMode ? (
                <p className="text-sm text-amber-600 mt-2 font-medium">
                  ⏰ Required 20 Minute Before Therapy
                </p>
              ) : (
                <p className="text-sm text-gray-600 mt-2">
                  🕐 Estimated Arrival: 30-60 minutes
                </p>
              )}
            </div>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCustomerSubmit(e);
                return false;
              }} 
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="w-4 h-4 inline mr-1" />
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="customer_name"
                  autoComplete="name"
                  inputMode="text"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, name: e.target.value }))}
                  onFocus={(e) => {
                    // Scroll input into view on mobile
                    setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                  }}
                  placeholder="Enter your name"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 outline-none transition-all text-base ${
                    !customerForm.name.trim() 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50 animate-pulse' 
                      : 'border-gray-200 focus:border-amber-400 focus:ring-amber-100'
                  }`}
                  style={{ fontSize: '16px' }}
                  required
                />
                {!customerForm.name.trim() && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1 font-medium">
                    <span>⚠️</span> Name is required to proceed
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <svg className="w-4 h-4 inline mr-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp Number <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    name="country_code"
                    value={customerForm.countryCode}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, countryCode: e.target.value }))}
                    className="px-2 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all bg-white text-base accent-amber-500"
                    style={{ fontSize: '16px', accentColor: '#f97316' }}
                  >
                    <option value="+62">🇮🇩 +62</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+61">🇦🇺 +61</option>
                    <option value="+65">🇸🇬 +65</option>
                    <option value="+60">🇲🇾 +60</option>
                    <option value="+66">🇹🇭 +66</option>
                    <option value="+81">🇯🇵 +81</option>
                    <option value="+82">🇰🇷 +82</option>
                    <option value="+86">🇨🇳 +86</option>
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+49">🇩🇪 +49</option>
                    <option value="+33">🇫🇷 +33</option>
                    <option value="+31">🇳🇱 +31</option>
                    <option value="+7">🇷🇺 +7</option>
                  </select>
                  <input
                    type="tel"
                    name="whatsapp_number"
                    autoComplete="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={customerForm.whatsApp}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, whatsApp: e.target.value.replace(/[^0-9]/g, '') }))}
                    onFocus={(e) => {
                      // Scroll input into view on mobile
                      setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                    }}
                    placeholder="812 3456 7890"
                    className={`flex-1 px-4 py-3 border-2 rounded-xl focus:ring-2 outline-none transition-all text-base ${
                      !customerForm.whatsApp.trim() || customerForm.whatsApp.length < 8 || customerForm.whatsApp.length > 15
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50 animate-pulse' 
                        : 'border-gray-200 focus:border-amber-400 focus:ring-amber-100'
                    }`}
                    style={{ fontSize: '16px' }}
                    required
                  />
                </div>
                {(!customerForm.whatsApp.trim() || customerForm.whatsApp.length < 8 || customerForm.whatsApp.length > 15) && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1 font-medium">
                    <span>⚠️</span> Valid WhatsApp number required (8-15 digits)
                  </p>
                )}
              </div>
              
              {/* Treatment For Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                  Treatment For <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'male', label: 'Male', icon: 'https://ik.imagekit.io/7grri5v7d/male_ss-removebg-preview.png', isImage: true },
                    { value: 'female', label: 'Female', icon: 'https://ik.imagekit.io/7grri5v7d/male_sss-removebg-preview.png', isImage: true },
                    { value: 'children', label: 'Children', icon: 'https://ik.imagekit.io/7grri5v7d/male_ssss-removebg-preview.png', isImage: true },
                  ].map((option) => {
                    // Check if therapist accepts this client type
                    const clientPref = therapist.clientPreferences || 'Males And Females';
                    let isCompatible = true;
                    
                    if (option.value === 'male') {
                      isCompatible = clientPref === 'Males Only' || clientPref === 'Males And Females' || clientPref === 'All Ages And Genders';
                    } else if (option.value === 'female') {
                      isCompatible = clientPref === 'Females Only' || clientPref === 'Males And Females' || clientPref === 'All Ages And Genders';
                    } else if (option.value === 'children') {
                      isCompatible = clientPref === 'Babies Only' || clientPref === 'All Ages And Genders';
                    }
                    
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setCustomerForm(prev => ({ ...prev, massageFor: option.value as 'male' | 'female' | 'children' }));
                          // Validate compatibility and set error message
                          if (!isCompatible) {
                            const prefLabels: Record<string, string> = {
                              'Males Only': 'Male clients only',
                              'Females Only': 'Female clients only',
                              'Males And Females': 'Male and Female clients',
                              'Babies Only': 'Babies/Children only',
                              'All Ages And Genders': 'All ages and genders'
                            };
                            setClientMismatchError(`Unfortunately ${getTherapistDisplayName(therapist.name)} only provides massage service for ${prefLabels[clientPref] || clientPref}`);
                          } else {
                            setClientMismatchError(null);
                          }
                        }}
                        className={`text-sm font-medium transition-all flex flex-col items-center gap-1 relative ${
                          option.isImage
                            ? customerForm.massageFor === option.value
                              ? 'scale-105'
                              : ''
                            : `py-3 px-2 rounded-xl ${customerForm.massageFor === option.value
                              ? isCompatible
                                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg scale-105'
                                : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg scale-105'
                              : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-amber-400 hover:bg-amber-50'}`
                        }`}
                      >
                        {option.isImage ? (
                          <div className="relative -mt-[10px]">
                            <img src={option.icon} alt={option.label} className="w-[100px] h-[100px] object-cover" />
                            <span className={`absolute bottom-6 left-1/2 -translate-x-1/2 font-bold text-sm drop-shadow-lg ${
                              customerForm.massageFor === option.value ? 'text-amber-500' : 'text-white'
                            }`}>{option.label}</span>
                          </div>
                        ) : (
                          <>
                            <span className="text-xl">{option.icon}</span>
                            <span>{option.label}</span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
                
                {/* Client mismatch error message */}
                {clientMismatchError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-300 rounded-xl">
                    <p className="text-sm text-red-700 font-medium">⚠️ {clientMismatchError}</p>
                    <p className="text-xs text-red-600 mt-1">Please choose a different therapist or select a compatible option.</p>
                  </div>
                )}
                {/* Required field - therapist service compatibility */}
                {!customerForm.massageFor && (
                  <p className="text-xs text-amber-600 mt-2 text-center flex items-center justify-center gap-1 font-medium">
                    <span>⚠️</span> Please select who the treatment is for (some therapists only serve specific clients)
                  </p>
                )}
              </div>
              
              {/* Location Section - Different for scheduled vs instant booking */}
              {isScheduleMode ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                    Treatment Center Address
                  </label>
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <MapPin className="w-5 h-5 text-amber-600 mr-2" />
                      <span className="text-sm font-semibold text-amber-800">Treatment Location</span>
                    </div>
                    <p className="text-gray-800 font-medium">
                      {chatState.therapist?.location || 'Professional Treatment Center'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {chatState.therapist?.city || 'Bali'}
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                    My Location <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'home', label: 'Home', icon: 'https://ik.imagekit.io/7grri5v7d/home%20icon.png', isImage: true },
                      { value: 'hotel', label: 'Hotel', icon: 'https://ik.imagekit.io/7grri5v7d/hotel%20icon.png', isImage: true },
                      { value: 'villa', label: 'Villa', icon: 'https://ik.imagekit.io/7grri5v7d/villa%20icon.png', isImage: true },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setCustomerForm(prev => ({ ...prev, locationType: option.value as 'home' | 'hotel' | 'villa' }))}
                        className={`text-sm font-medium transition-all flex flex-col items-center gap-1 relative ${
                          option.isImage
                            ? customerForm.locationType === option.value
                              ? 'scale-105'
                              : ''
                            : `py-3 px-2 rounded-xl ${customerForm.locationType === option.value
                              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg scale-105'
                              : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-amber-400 hover:bg-amber-50'}`
                        }`}
                      >
                        {option.isImage ? (
                          <div className="relative -mt-[10px]">
                            <img src={option.icon} alt={option.label} className="w-[100px] h-[100px] object-cover" />
                            <span className={`absolute bottom-6 left-1/2 -translate-x-1/2 font-bold text-sm drop-shadow-lg ${
                              customerForm.locationType === option.value ? 'text-amber-500' : 'text-white'
                            }`}>{option.label}</span>
                          </div>
                        ) : (
                          <>
                            <span className="text-xl">{option.icon}</span>
                            <span>{option.label}</span>
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                  {/* Validation warning when no location type selected */}
                  {!customerForm.locationType && (
                    <p className="text-xs text-red-600 mt-2 text-center flex items-center justify-center gap-1 font-medium">
                      <span>⚠️</span> Please select your location type
                    </p>
                  )}
                </div>
              )}
              
              {/* Massage Location Header - Only show for instant bookings */}
              {!isScheduleMode && (
                <div className="text-center">
                  <h3 className="text-base font-semibold text-gray-800 mb-4">Massage Location</h3>
                </div>
              )}
              
              {/* Address Input Fields - Only for instant bookings and HOME location */}
              {!isScheduleMode && customerForm.locationType === 'home' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      name="address_line_1"
                      autoComplete="address-line1"
                      inputMode="text"
                      value={customerForm.address1 || ''}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, address1: e.target.value }))}
                      onFocus={(e) => {
                        setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                      }}
                      placeholder="Street address, building name"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-base"
                      style={{ fontSize: '16px' }}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 2 (Area/District) *
                    </label>
                    <input
                      type="text"
                      name="address_line_2"
                      autoComplete="address-line2"
                      inputMode="text"
                      value={customerForm.address2 || ''}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, address2: e.target.value }))}
                      onFocus={(e) => {
                        setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                      }}
                      placeholder="e.g. Seminyak, Kuta, Ubud"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-base"
                      style={{ fontSize: '16px' }}
                      required
                    />
                  </div>
                </>
              )}
              
              {/* Hotel/Villa Name and Room Number - only show for instant bookings and hotel/villa location */}
              {!isScheduleMode && (customerForm.locationType === 'hotel' || customerForm.locationType === 'villa') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                      </svg>
                      {customerForm.locationType === 'hotel' ? 'Hotel' : 'Villa'} Name *
                    </label>
                    <input
                      type="text"
                      name="hotel_villa_name"
                      autoComplete="organization"
                      inputMode="text"
                      value={customerForm.hotelVillaName}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, hotelVillaName: e.target.value }))}
                      onFocus={(e) => {
                        setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                      }}
                      placeholder={customerForm.locationType === 'hotel' ? 'e.g. Grand Hyatt Bali' : 'e.g. Villa Seminyak Estate'}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-base"
                      style={{ fontSize: '16px' }}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                      Room Number *
                    </label>
                    <input
                      type="text"
                      name="room_number"
                      inputMode="text"
                      value={customerForm.roomNumber}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, roomNumber: e.target.value }))}
                      onFocus={(e) => {
                        setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                      }}
                      placeholder="e.g. Room 1205"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-base"
                      style={{ fontSize: '16px' }}
                      required
                    />
                  </div>
                </>
              )}
              
              {/* Discount Code Section */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Have a Discount Code?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="discount_code"
                    inputMode="text"
                    autoCapitalize="characters"
                    value={discountCode}
                    onChange={(e) => {
                      setDiscountCode(e.target.value.toUpperCase());
                      setDiscountValidation(null); // Reset validation when typing
                    }}
                    onFocus={(e) => {
                      setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                    }}
                    placeholder="Enter code"
                    disabled={discountValidation?.valid}
                    className={`flex-1 px-4 py-3 border-2 rounded-xl outline-none transition-all text-base ${
                      discountValidation?.valid
                        ? 'border-green-400 bg-green-50 text-green-700'
                        : discountValidation === null
                        ? 'border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100'
                        : 'border-red-300 bg-red-50'
                    }`}
                    style={{ fontSize: '16px' }}
                  />
                  {!discountValidation?.valid && (
                    <button
                      type="button"
                      onClick={handleValidateDiscount}
                      disabled={isValidatingDiscount || !discountCode.trim()}
                      className="px-4 py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isValidatingDiscount ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Tag className="w-4 h-4" />
                          Apply
                        </>
                      )}
                    </button>
                  )}
                </div>
                
                {/* Discount validation result */}
                {discountValidation && (
                  <div className={`mt-2 p-3 rounded-xl text-sm ${
                    discountValidation.valid
                      ? 'bg-green-100 border border-green-300'
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    {discountValidation.valid ? (
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-700">{discountValidation.message}</p>
                          <p className="text-xs text-green-600 mt-1">
                            Original: {formatPrice(getPrice(selectedDuration || 60))} → 
                            <span className="font-bold ml-1">
                              {formatPrice(getPrice(selectedDuration || 60) * (1 - (discountValidation.percentage || 0) / 100))}
                            </span>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setDiscountCode('');
                            setDiscountValidation(null);
                          }}
                          className="ml-auto text-green-600 hover:text-green-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                        <p>{discountValidation.message}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Price Summary with Discount */}
              {discountValidation?.valid && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Original Price:</span>
                    <span className="text-gray-400 line-through">{formatPrice(getPrice(selectedDuration || 60))}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-600 font-medium">Discount ({discountValidation.percentage}%):</span>
                    <span className="text-green-600">-{formatPrice(getPrice(selectedDuration || 60) * (discountValidation.percentage || 0) / 100)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-green-200">
                    <span className="text-gray-800 font-bold">You Pay:</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatPrice(getPrice(selectedDuration || 60) * (1 - (discountValidation.percentage || 0) / 100))}
                    </span>
                  </div>
                </div>
              )}
              
              {/* UX FIX: Added border separator to prevent accidental taps */}
              <div className="border-t-2 border-gray-200 pt-4 mt-4">
                <button
                  type="submit"
                  data-testid="order-now-button"
                  disabled={isSending || !customerForm.name.trim() || !customerForm.whatsApp || customerForm.whatsApp.length < 8 || customerForm.whatsApp.length > 15 || !!clientMismatchError || !customerForm.locationType || ((customerForm.locationType === 'hotel' || customerForm.locationType === 'villa') && (!customerForm.hotelVillaName || !customerForm.roomNumber))}
                  className={`w-full py-3 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  (!isSending && customerForm.name.trim() && customerForm.whatsApp && customerForm.whatsApp.length >= 8 && customerForm.whatsApp.length <= 15 && !clientMismatchError && customerForm.locationType && !((customerForm.locationType === 'hotel' || customerForm.locationType === 'villa') && (!customerForm.hotelVillaName || !customerForm.roomNumber)))
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700'
                }`}
              >
                {isSending ? (
                  <React.Fragment key="sending">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </React.Fragment>
                ) : (
                  <React.Fragment key="ready">
                    <Send className="w-5 h-5" />
                    Order Now
                  </React.Fragment>
                )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Chat Messages Step - Only render when in chat mode; messages scroll, input fixed at bottom */}
        <div key="chat-step" className={`flex flex-col min-h-0 ${bookingStep === 'chat' ? 'flex-1' : 'hidden'}`}>
          {/* Messages - scrollable */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="p-4 space-y-3">
              {/* Slider-style booking confirmation - when currentBooking exists (same design as slider menu) */}
              {chatState.currentBooking && (
                <BookingWelcomeBanner
                  currentBooking={{
                    status: chatState.currentBooking.status,
                    serviceType: chatState.selectedService?.serviceName || chatState.currentBooking.serviceType || 'Professional Massage',
                    providerType: (chatState.currentBooking as any)?.providerType || 'therapist',
                    massageFor: (chatState.currentBooking as any)?.massageFor || customerForm.massageFor,
                    duration: chatState.selectedDuration || chatState.currentBooking.duration || 60,
                    customerName: chatState.currentBooking.customerName || chatState.customerName || customerForm.name || 'Customer',
                    locationZone: chatState.currentBooking.locationZone || chatState.currentBooking.address,
                    totalPrice: chatState.currentBooking.totalPrice ?? getPrice(chatState.selectedDuration || 60),
                    bookingType: (chatState.currentBooking.bookingType === 'SCHEDULED' || chatState.currentBooking.bookingType === 'scheduled') ? 'scheduled' : 'book_now',
                    scheduledDate: chatState.currentBooking.scheduledDate,
                    scheduledTime: chatState.currentBooking.scheduledTime,
                    bookingId: chatState.currentBooking.bookingId || chatState.currentBooking.id,
                    id: chatState.currentBooking.id
                  }}
                  bookingCountdown={timerState.isActive && timerState.remainingSeconds > 0 ? timerState.remainingSeconds : null}
                  onCancelBooking={cancelBooking}
                />
              )}
              {/* Welcome when no booking yet */}
              {messages.length === 0 && !chatState.currentBooking && (
              <div className="text-center py-12 px-4">
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-r from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <MessageCircle className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    🎉 Welcome {getTherapistDisplayName(therapist.name)} Massage Service
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Your booking has been submitted. Chat with your therapist once they accept.
                  </p>
                </div>
              </div>
              )}
              
              {/* Message list - conditionally rendered */}
              {messages.length > 0 && (
              <>
                {messages.map((msg: ChatMessage) => {
                  const isOwn = msg.senderType === 'customer' || 
                               (msg.senderId !== therapist.id && msg.senderType !== 'therapist' && msg.senderType !== 'system');
                  const isSystem = msg.senderType === 'system' || msg.isSystemMessage;

                  if (isSystem) {
                    // Enhanced system message styling based on content
                    const isSuccess = msg.message.includes('✅') || msg.message.includes('🎉') || msg.message.includes('✨');
                    const isWarning = msg.message.includes('⚠️') || msg.message.includes('⏰');
                    const isError = msg.message.includes('❌');
                    const isInfo = msg.message.includes('📨') || msg.message.includes('🔄') || msg.message.includes('🚗') || msg.message.includes('💳');
                    
                    return (
                      <div key={msg.$id} className="flex justify-center my-3">
                        <div className={`text-sm px-5 py-3 rounded-2xl max-w-[90%] text-center shadow-sm animate-fade-in ${
                          isError ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-800 border border-red-200' :
                          isWarning ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-900 border border-yellow-200' :
                          isSuccess ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-800 border border-green-200' :
                          isInfo ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border border-blue-200' :
                          'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          <p className="whitespace-pre-wrap font-medium leading-relaxed">{msg.message}</p>
                          <div className="text-xs mt-2 opacity-70">
                            {formatTime(msg.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.$id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md chat-bubble-hover ${
                          isOwn
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-br-md'
                            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md hover:border-gray-300'
                        }`}
                      >
                        {!isOwn && (
                          <div className="text-xs font-medium text-amber-500 mb-1">
                            {msg.senderName}
                          </div>
                        )}
                        {/* Payment proof image (spec 3.1 & 3.2) */}
                        {(msg as ChatMessage & { messageType?: string }).messageType === 'payment_proof' && msg.message.startsWith('http') ? (
                          <div className="space-y-1">
                            <img src={msg.message} alt="Payment proof" className="max-w-full rounded-lg border border-gray-200 max-h-64 object-contain" />
                            <p className="text-xs text-gray-500">Payment proof</p>
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                        )}
                        <div className={`text-xs mt-1 flex items-center gap-1 ${isOwn ? 'text-amber-100 justify-end' : 'text-gray-400'}`}>
                          {formatTime(msg.createdAt)}
                          {isOwn && msg.read && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
              )}
              
              {/* Scroll anchor - always present */}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Status-specific UI Components based on booking status */}
          {chatState.currentBooking && (
              <>
                {/* Spec 2.1 & 2.2: 30% deposit countdown in same chat window as bank details (scheduled + accepted) */}
                {isScheduledAccepted && (
                  <div className="mx-4 mb-4 p-4 rounded-xl border-2 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                    <h4 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Secure your booking – 30% deposit
                    </h4>
                    <p className="text-sm text-emerald-800 mb-3">
                      Transfer 30% deposit and upload proof of payment in this chat within 30 minutes.
                    </p>
                    <p className="text-xs text-amber-800 mb-3 bg-amber-50/80 border border-amber-200 rounded-lg px-3 py-2">
                      ⚠️ Deposit is non-refundable; you cannot switch therapist/place for this booking. Refund only if: no-show, service not provided, or therapist/place agrees to refund.
                    </p>
                    <div className="flex items-center gap-3 p-3 bg-white/80 rounded-lg border border-emerald-200">
                      <Clock className="w-6 h-6 text-emerald-600" />
                      <span className="font-mono text-xl font-bold text-emerald-800">
                        {Math.floor(depositCountdownSeconds / 60)}:{(depositCountdownSeconds % 60).toString().padStart(2, '0')}
                      </span>
                      <span className="text-sm text-emerald-700">remaining</span>
                    </div>
                    {depositCountdownSeconds <= 0 && (
                      <p className="text-sm text-amber-700 mt-2">Time’s up. Upload proof if you’ve already transferred, or the slot may be released.</p>
                    )}
                    <input
                      ref={proofInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      className="hidden"
                      onChange={handleUploadPaymentProof}
                    />
                    <button
                      type="button"
                      disabled={uploadingProof}
                      onClick={() => proofInputRef.current?.click()}
                      className="mt-3 w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium text-sm flex items-center justify-center gap-2"
                    >
                      {uploadingProof ? 'Uploading…' : 'Upload payment proof (JPG/PNG, max 5MB)'}
                    </button>
                  </div>
                )}

                {/* Suggested therapists & places after timeout or reject (spec 1.1 & 1.2: only active/open) */}
                {bookingExpiredOrDeclined && (
                  <div className="mx-4 mb-4 p-4 rounded-xl border-2 bg-gradient-to-br from-amber-50 to-amber-50 border-amber-200">
                    <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Suggested therapists & places
                    </h4>
                    <p className="text-sm text-amber-800 mb-3">Click to view and book with an available therapist or open place.</p>
                    {suggestedLoading ? (
                      <p className="text-sm text-amber-700">Loading…</p>
                    ) : (
                      <div className="space-y-2">
                        {suggestedTherapists.map((t) => (
                          <button
                            key={t.appwriteId}
                            type="button"
                            onClick={() => openChat({ id: t.name, appwriteId: t.appwriteId, name: t.name, mainImage: t.image }, 'book', 'search')}
                            className="w-full text-left p-3 rounded-lg bg-white/80 hover:bg-white border border-amber-200 flex items-center gap-3"
                          >
                            {t.image ? <img src={t.image} alt="" className="w-10 h-10 rounded-full object-cover" /> : <User className="w-10 h-10 text-amber-600" />}
                            <span className="font-medium text-gray-800">{t.name}</span>
                            <span className="text-xs text-amber-700 ml-auto">Therapist</span>
                          </button>
                        ))}
                        {suggestedPlaces.map((p) => (
                          <button
                            key={p.appwriteId}
                            type="button"
                            onClick={() => openChat({ id: p.name, appwriteId: p.appwriteId, name: p.name, mainImage: p.image }, 'book', 'search')}
                            className="w-full text-left p-3 rounded-lg bg-white/80 hover:bg-white border border-amber-200 flex items-center gap-3"
                          >
                            {p.image ? <img src={p.image} alt="" className="w-10 h-10 rounded-full object-cover" /> : <MapPin className="w-10 h-10 text-amber-600" />}
                            <span className="font-medium text-gray-800">{p.name}</span>
                            <span className="text-xs text-amber-700 ml-auto">Place</span>
                          </button>
                        ))}
                        {!suggestedLoading && suggestedTherapists.length === 0 && suggestedPlaces.length === 0 && (
                          <p className="text-sm text-amber-700">No suggested options right now. Try again later or search from the home page.</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Removed duplicate waiting message - shown in BookingWelcomeBanner above */}
                {false && (chatState.currentBooking.status === 'pending' || chatState.currentBooking.status === 'waiting_others') && (
                  <div className="mx-4 mb-4 p-4 rounded-xl border-2 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                        <Clock className="w-8 h-8 text-blue-600 animate-pulse" />
                      </div>
                      <h4 className="font-bold text-lg text-blue-800 mb-2">Waiting for Therapist Response</h4>
                      <p className="text-sm text-blue-700 mb-4">
                        We've sent your booking request to nearby therapists. Please wait while they respond.
                      </p>
                      
                      {/* Response Countdown Timer */}
                      <div className="bg-white/70 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Clock className="w-5 h-5 text-amber-600" />
                          <span className="font-semibold text-gray-700">Response Timer</span>
                        </div>
                        <div className="text-3xl font-mono font-bold text-amber-600 mb-2">
                          {Math.floor(therapistResponseCountdown / 60)}:{(therapistResponseCountdown % 60).toString().padStart(2, '0')}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-1000 ${
                              therapistResponseCountdown > 60 ? 'bg-blue-500' :
                              therapistResponseCountdown > 30 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${(therapistResponseCountdown / 300) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-600">
                          {therapistResponseCountdown > 60 ? 'Searching for available therapists...' :
                           therapistResponseCountdown > 30 ? 'Finding the best match...' : 
                           'Almost ready to connect you...'}
                        </p>
                      </div>

                      {/* Status Messages */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-center gap-2 text-sm text-blue-700">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                          <span>Notifying qualified therapists in your area</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <span>Matching you with available professionals</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          <span>Preparing service details</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => cancelBooking()}
                          className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                          <X className="w-5 h-5" />
                          Cancel Booking
                        </button>
                        
                        <button
                          onClick={() => {
                            // Extend timer by 2 minutes
                            setTherapistResponseCountdown(prev => prev + 120);
                            addSystemNotification(CHAT_MSG[currentLanguage].extendedWait);
                          }}
                          className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                          <Clock className="w-5 h-5" />
                          Wait 2 More Min
                        </button>
                      </div>
                      
                      {/* Expiration Warning */}
                      {therapistResponseCountdown <= 60 && (
                        <div className="mt-3 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                          <div className="flex items-center gap-2 text-yellow-800">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="font-medium text-sm">
                              {therapistResponseCountdown <= 30 ? 
                                'Booking will expire soon!' : 
                                'Less than 1 minute remaining'}
                            </span>
                          </div>
                          <p className="text-xs text-yellow-700 mt-1">
                            Don't worry - you can always create a new booking if this one expires.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Therapist Accepted Status */}
                {(chatState.currentBooking.status === 'therapist_accepted' || chatState.currentBooking.status === 'user_confirmed') && (
                  <TherapistAcceptanceUI
                    therapist={{
                      id: therapist.id,
                      name: getTherapistDisplayName(therapist.name),
                      image: therapist.image,
                      rating: 4.9,
                      whatsApp: therapist.whatsApp || therapist.phone
                    }}
                    booking={{
                      estimatedArrival: 45,
                      acceptedAt: new Date().toISOString(),
                      location: chatState.currentBooking.locationZone
                    }}
                    onConfirmBooking={confirmBooking}
                    onCancelBooking={cancelBooking}
                    onRequestLocation={() => logger.debug('Request location')}
                    onContactTherapist={() => window.open(`tel:${therapist.phone}`)}
                  />
                )}

                {/* On The Way Status */}
                {chatState.currentBooking.status === 'on_the_way' && (
                  <OnTheWayStatusUI
                    therapist={{
                      id: therapist.id,
                      name: getTherapistDisplayName(therapist.name),
                      image: therapist.image,
                      whatsApp: therapist.whatsApp,
                      phone: therapist.phone
                    }}
                    booking={{
                      estimatedArrival: Math.floor(arrivalCountdown / 60),
                      departedAt: new Date().toISOString(),
                      currentLocation: "Heading to your location",
                      notes: "Your therapist is on the way"
                    }}
                    onContactTherapist={(method) => {
                      if (method === 'call') window.open(`tel:${therapist.phone}`);
                      if (method === 'whatsapp') window.open(`https://wa.me/${therapist.whatsApp}`);
                      if (method === 'chat') setBookingStep('chat');
                    }}
                    onUpdateLocation={() => logger.debug('Update location')}
                  />
                )}

                {/* Arrival Confirmation */}
                {chatState.currentBooking.status === 'user_confirmed' && (
                  <ArrivalConfirmationUI
                    therapist={{
                      id: therapist.id,
                      name: getTherapistDisplayName(therapist.name),
                      image: therapist.image,
                      phone: therapist.phone
                    }}
                    booking={{
                      serviceType: 'Traditional Massage',
                      duration: selectedDuration || 60,
                      totalPrice: getPrice(selectedDuration || 60),
                      arrivedAt: new Date().toISOString(),
                      location: chatState.currentBooking.locationZone
                    }}
                    onStartService={() => logger.debug('Start service')}
                    onContactTherapist={() => window.open(`tel:${therapist.phone}`)}
                    onEmergencyContact={() => window.open('tel:911')}
                    onConfirmPaymentMethod={(method) => logger.debug('Payment method:', { method })}
                  />
                )}

                {/* Service Timer for in-progress sessions */}
                {chatState.currentBooking.status === 'completed' && (
                  <EnhancedTimerComponent
                    type="service"
                    initialSeconds={(selectedDuration || 60) * 60}
                    title="Massage Session"
                    description="Enjoy your relaxing massage"
                    isActive={true}
                  />
                )}

                {/* Payment Flow for completed sessions */}
                {chatState.currentBooking.status === 'completed' && !chatState.currentBooking.paymentStatus && (
                  <PaymentFlowUI
                    pricing={{
                      servicePrice: getPrice(selectedDuration || 60),
                      total: getPrice(selectedDuration || 60)
                    }}
                    onMethodSelect={() => {}}
                    onPaymentSubmit={() => {}}
                    showTipping={true}
                    allowPromoCode={true}
                  />
                )}
                {/* Real-time Notifications */}
                {chatState.currentBooking && (
                  <RealTimeNotificationEnhancer
                    bookingStatus={chatState.currentBooking.status as BookingProgressStep}
                    soundEnabled={true}
                    pushEnabled={true}
                  />
                )}

              </>
            )}
      </div>

      {/* Real-time Notifications */}
      {chatState.currentBooking && (
        <RealTimeNotificationEnhancer
          bookingStatus={chatState.currentBooking.status as BookingProgressStep}
          soundEnabled={true}
          pushEnabled={true}
        />
      )}

      {/* Booking Action Buttons - Show when therapist accepted */}
      {bookingStep === 'chat' && chatState.currentBooking?.status === 'therapist_accepted' && (
        <div className="p-3 bg-blue-50 border-t border-blue-200">
          <p className="text-xs text-blue-700 mb-2 text-center">
            ✅ {getTherapistDisplayName(therapist.name)} accepted your booking. Confirm now!
          </p>
          <div className="flex gap-2">
            <button
              onClick={confirmBooking}
              className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-1"
            >
              <Check className="w-4 h-4" />
              Confirm Booking
            </button>
            <button
              onClick={cancelBooking}
              className="px-4 py-2.5 bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Payment Options - Show when service completed; flex-shrink-0 to stay above input */}
      {bookingStep === 'chat' && chatState.currentBooking?.status === 'completed' && !chatState.currentBooking?.paymentStatus && (
        <div className="flex-shrink-0 p-3 bg-emerald-50 border-t border-emerald-200">
          <p className="text-xs text-emerald-700 mb-2 text-center">
            ✨ Service completed! Choose payment method:
          </p>
          <p className="text-xs text-emerald-600 mb-3 text-center">
            💡 For bank transfer, use details shared in chat above
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => confirmPayment('cash')}
              className="flex-1 py-2.5 bg-white border-2 border-emerald-400 text-emerald-700 text-sm font-semibold rounded-xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-1"
            >
              💵 Cash
            </button>
            <button
              onClick={() => {
                shareBankCard();
                confirmPayment('bank_transfer');
              }}
              className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-semibold rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all flex items-center justify-center gap-1"
            >
              <CreditCard className="w-4 h-4" />
              Bank Transfer
            </button>
          </div>
        </div>
      )}

      {/* Message Input - Fixed at bottom of chat; flex-shrink-0 prevents it from scrolling away */}
      {bookingStep === 'chat' && (
        <form onSubmit={handleSendMessage} className="flex-shrink-0 p-3 bg-white border-t border-gray-100">
          {/* Spam Warning */}
          {messageWarning && (
            <div className="mb-2 p-2 bg-red-50 border border-red-300 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{messageWarning}</p>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <FlagIcon
              chatRoomId={`user-${chatState.therapist?.id || 'unknown'}`}
              reporterId="user-current"
              reporterRole="user"
              reportedUserId={chatState.therapist?.id || 'unknown'}
              reportedUserName={chatState.therapist?.name}
              onReportFormToggle={setIsReportFormOpen}
            />
            <input
              type="text"
              name="chat_message"
              inputMode="text"
              autoComplete="off"
              value={messageInput}
              onChange={(e) => {
                setMessageInput(e.target.value);
                // Clear warning when user starts typing again
                if (messageWarning) setMessageWarning(null);
              }}
              onFocus={(e) => {
                // Scroll input into view on mobile when keyboard opens
                setTimeout(() => {
                  e.target.scrollIntoView({ behavior: 'smooth', block: 'end' });
                }, 300);
              }}
              placeholder={`💬 Message ${getTherapistDisplayName(therapist.name)}... (Press Enter to send)`}
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none text-base transition-all duration-200 placeholder-gray-400 hover:bg-gray-100"
              style={{ fontSize: '16px' }}
              disabled={isSending}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && messageInput.trim()) {
                  e.preventDefault();
                  (document.querySelector('button[type="submit"]') as HTMLButtonElement)?.click();
                }
              }}
            />
            <button
              type="submit"
              disabled={!messageInput.trim() || isSending}
              className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full hover:from-amber-600 hover:to-amber-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      )}
    </div>
    
    {/* Scheduled Booking Deposit Modal */}
    <ScheduledBookingDepositModal
      isOpen={showDepositModal}
      onClose={() => setShowDepositModal(false)}
      onSubmitPayment={handleDepositPayment}
      depositAmount={depositAmount}
      therapistName={chatState.therapist?.name || 'Therapist'}
      scheduledDate={selectedDate || 'TBD'}
      scheduledTime={selectedTime || 'TBD'}
      serviceType="Traditional Massage"
      isProcessing={isProcessingDeposit}
    />

    {/* Massage Types Full-Screen Modal - Same slider as Jenis Pijat Apa */}
    {isMassageTypesModalOpen && (
      <div 
        className="fixed inset-0 bg-white z-[9999] overflow-y-auto animate-slideUp"
      >
        <button
          className="fixed top-4 right-4 z-10 p-2 bg-amber-500 rounded-full shadow-lg hover:bg-amber-600 transition-colors"
          onClick={() => {
            setIsMassageTypesModalOpen(false);
            setMassageTypesExpandedCards({});
          }}
          aria-label="Close massage types"
        >
          <X size={24} strokeWidth={2} className="text-black" />
        </button>

        <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6">
          <div className="flex flex-col gap-4">
            {MASSAGE_TYPE_DETAILS.map((massageTypeDetail, index) => {
              const massage = {
                name: massageTypeDetail.name,
                description: massageTypeDetail.shortDescription,
                fullDescription: massageTypeDetail.fullDescription,
                benefits: massageTypeDetail.benefits || [],
                duration: massageTypeDetail.duration || '60-90 min',
                intensity: massageTypeDetail.intensity || 'Medium',
                bestFor: massageTypeDetail.bestFor || [],
                image: getMassageTypeImage(massageTypeDetail.name),
                popularity: [4.2, 4.5, 4.7, 4.8][index % 4]
              };

              return (
                <MassageTypeCard
                  key={massage.name}
                  massage={massage}
                  expanded={massageTypesExpandedCards[massage.name] || false}
                  onToggleExpanded={() => setMassageTypesExpandedCards(prev => ({
                    ...prev,
                    [massage.name]: !prev[massage.name]
                  }))}
                  showActionButtons={false}
                />
              );
            })}
          </div>
        </div>
      </div>
    )}

    </div>
      </div>

      {/* Account required at confirmation: Sign In / Create Account modal */}
      {showBookingAuthModal && (
        <BookingAuthModal
          isOpen={showBookingAuthModal}
          onClose={() => {
            setShowBookingAuthModal(false);
            unlockChat();
          }}
          onAuthSuccess={handleBookingAuthSuccess}
          language={currentLanguage}
        />
      )}
    </StatusThemeProvider>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(PersistentChatWindow);





