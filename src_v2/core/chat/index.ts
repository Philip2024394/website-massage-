/**
 * ============================================================================
 * 📦 CHAT CORE MODULE - STEP 15 EXPORTS
 * ============================================================================
 * 
 * Clean module exports for the authoritative chat system.
 * 
 * USAGE:
 * import { sendMessage } from '@/core/chat';
 * import { ChatContract } from '@/core/chat';
 * 
 * ============================================================================
 */

// Main message sending function
export { default as sendMessage, getMessageStatus, getChatSessionMessages, createTestMessagePayload } from './sendMessage';

// Message loading and subscriptions
export { loadChatMessages, subscribeToChatUpdates } from './messageLoader';

// Contract validation
export { 
  validateChatContract, 
  isValidChatContract,
  validateSenderIdentity,
  MESSAGE_LIMITS,
  type ChatContract,
  type ChatContractRequired,
  type ChatContractOptional,
  type SenderIdentityRules,
  type ValidationError,
  type ContractValidationResult
} from './chat.contract';

// Type definitions
export {
  type MessageSendResult,
  type MessageSendSuccess,
  type MessageSendError,
  type MessageErrorType,
  type MessageDocument,
  type ChatSession,
  type RateLimit,
  isMessageSuccess,
  isMessageError,
  createValidationError,
  createAppwriteError,
  createNetworkError,
  createPermissionError,
  createSessionNotFoundError,
  createRateLimitError,
  createContentBlockedError,
  createUnknownError,
  createContractViolationError,
  createMessageSuccess,
  checkRateLimit
} from './chat.types';

// Re-export for convenience
export type { ChatContract as MessagePayload } from './chat.contract';