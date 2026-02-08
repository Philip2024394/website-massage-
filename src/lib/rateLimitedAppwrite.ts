/**
 * Rate-Limited Appwrite Wrapper
 * 
 * Wraps critical Appwrite operations with production-grade rate limiting
 * Prevents API abuse and ensures system stability
 */

import { rateLimiter } from './rateLimiter.production';
import { logger } from './logger.production';
import { databases, account } from '@/lib/appwrite';
import type { Models } from 'appwrite';

/**
 * Get user identifier for rate limiting
 * Falls back to IP-based limiting if no user ID available
 */
function getUserKey(): string {
  try {
    // Try to get user ID from localStorage
    const user = localStorage.getItem('currentUser');
    if (user) {
      const parsed = JSON.parse(user);
      return parsed.$id || parsed.id || 'anonymous';
    }
  } catch (error) {
    logger.warn('Failed to get user ID for rate limiting:', error);
  }
  
  // Fallback to session-based ID
  return sessionStorage.getItem('sessionId') || 'anonymous';
}

/**
 * Rate-limited database document creation
 */
export async function createDocumentRateLimited(
  databaseId: string,
  collectionId: string,
  documentId: string,
  data: any,
  permissions?: string[]
): Promise<Models.Document> {
  const userId = getUserKey();
  
  // Determine appropriate rate limit based on collection
  let config;
  if (collectionId.includes('booking')) {
    config = rateLimiter.configs.createBooking;
  } else if (collectionId.includes('message') || collectionId.includes('chat')) {
    config = rateLimiter.configs.sendMessage;
  } else if (collectionId.includes('review')) {
    config = rateLimiter.configs.submitReview;
  } else {
    config = rateLimiter.configs.apiGeneral;
  }
  
  try {
    // Check rate limit
    await rateLimiter.enforce(userId, config);
    
    // Execute operation
    const result = await databases.createDocument(
      databaseId,
      collectionId,
      documentId,
      data,
      permissions
    );
    
    logger.debug('Document created (rate-limited)', {
      collectionId,
      documentId,
      userId
    });
    
    return result;
  } catch (error: any) {
    // If rate limit error, enhance with user-friendly message
    if (error.code === 429) {
      logger.warn('Rate limit exceeded for document creation', {
        collectionId,
        userId,
        retryAfter: error.retryAfter
      });
      
      // Throw enhanced error
      const enhancedError: any = new Error(error.message);
      enhancedError.code = 429;
      enhancedError.retryAfter = error.retryAfter;
      enhancedError.userMessage = config.message;
      throw enhancedError;
    }
    
    // Re-throw other errors
    throw error;
  }
}

/**
 * Rate-limited account creation
 */
export async function createAccountRateLimited(
  email: string,
  password: string,
  name?: string
): Promise<Models.User<Models.Preferences>> {
  const userId = email; // Use email as key for registration
  
  try {
    // Enforce rate limit
    await rateLimiter.enforce(userId, rateLimiter.configs.register);
    
    // Create account
    const result = await account.create('unique()', email, password, name);
    
    logger.info('Account created (rate-limited)', {
      email,
      userId: result.$id
    });
    
    return result;
  } catch (error: any) {
    if (error.code === 429) {
      logger.warn('Rate limit exceeded for account creation', {
        email,
        retryAfter: error.retryAfter
      });
      
      const enhancedError: any = new Error(
        'Too many registration attempts. Please try again later.'
      );
      enhancedError.code = 429;
      enhancedError.retryAfter = error.retryAfter;
      throw enhancedError;
    }
    
    throw error;
  }
}

/**
 * Rate-limited login
 */
export async function createSessionRateLimited(
  email: string,
  password: string
): Promise<Models.Session> {
  const userId = email; // Use email as key for login attempts
  
  try {
    // Enforce rate limit
    await rateLimiter.enforce(userId, rateLimiter.configs.login);
    
    // Create session
    const result = await account.createEmailPasswordSession(email, password);
    
    logger.info('Session created (rate-limited)', {
      email,
      sessionId: result.$id
    });
    
    return result;
  } catch (error: any) {
    if (error.code === 429) {
      logger.warn('Rate limit exceeded for login', {
        email,
        retryAfter: error.retryAfter
      });
      
      const enhancedError: any = new Error(
        rateLimiter.configs.login.message || 'Too many login attempts'
      );
      enhancedError.code = 429;
      enhancedError.retryAfter = error.retryAfter;
      throw enhancedError;
    }
    
    throw error;
  }
}

/**
 * Rate-limited password reset
 */
export async function createPasswordResetRateLimited(
  email: string,
  url: string
): Promise<Models.Token> {
  const userId = email;
  
  try {
    // Enforce rate limit
    await rateLimiter.enforce(userId, rateLimiter.configs.passwordReset);
    
    // Create recovery
    const result = await account.createRecovery(email, url);
    
    logger.info('Password reset requested (rate-limited)', {
      email
    });
    
    return result;
  } catch (error: any) {
    if (error.code === 429) {
      logger.warn('Rate limit exceeded for password reset', {
        email,
        retryAfter: error.retryAfter
      });
      
      const enhancedError: any = new Error(
        rateLimiter.configs.passwordReset.message || 'Too many password reset attempts'
      );
      enhancedError.code = 429;
      enhancedError.retryAfter = error.retryAfter;
      throw enhancedError;
    }
    
    throw error;
  }
}

/**
 * Helper to handle rate limit errors in UI
 */
export function formatRateLimitError(error: any): string {
  if (error.code === 429) {
    if (error.retryAfter) {
      const minutes = Math.ceil(error.retryAfter / 60);
      return `${error.userMessage || error.message} Please wait ${minutes} minute${minutes > 1 ? 's' : ''}.`;
    }
    return error.userMessage || error.message || 'Too many requests. Please try again later.';
  }
  
  return error.message || 'An error occurred';
}

// Global error handler for rate limit errors
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.code === 429) {
      logger.warn('Unhandled rate limit error', {
        error: event.reason
      });
      
      // Show user-friendly notification
      const message = formatRateLimitError(event.reason);
      
      // Try to show toast notification if available
      if ((window as any).showToast) {
        (window as any).showToast(message, 'warning');
      } else {
        console.warn(message);
      }
    }
  });
}
