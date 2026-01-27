/**
 * Robust API wrapper with timeout and error handling
 */

import { retryWithBackoff } from './rateLimitService';
import { handleAppwriteError } from './globalErrorHandler';

interface ApiWrapperOptions {
    timeout?: number;
    retries?: number;
    context?: string;
}

/**
 * Wrapper for API calls with timeout, retry, and error handling
 */
export async function robustApiCall<T>(
    apiCall: () => Promise<T>,
    options: ApiWrapperOptions = {}
): Promise<T | null> {
    const {
        timeout = 10000, // 10 seconds
        retries = 2,
        context = 'API call'
    } = options;

    try {
        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => {
                reject(new Error(`${context} timed out after ${timeout}ms`));
            }, timeout);
        });

        // Race the API call against timeout
        const result = await Promise.race([
            retryWithBackoff(apiCall, context),
            timeoutPromise
        ]);

        return result;

    } catch (error) {
        // Handle the error gracefully
        const handled = handleAppwriteError(error, context);
        
        if (!handled) {
            console.error(`❌ Unhandled error in ${context}:`, error);
        }

        // Return null instead of throwing to prevent unhandled promise rejections
        return null;
    }
}

/**
 * Wrapper specifically for collection queries that might not exist
 */
export async function robustCollectionQuery<T>(
    queryCall: () => Promise<T>,
    collectionName: string,
    fallbackValue: T
): Promise<T> {
    const result = await robustApiCall(
        queryCall,
        {
            timeout: 8000,
            context: `${collectionName} collection query`
        }
    );

    // Return fallback if null (error occurred)
    return result ?? fallbackValue;
}

/**
 * Safe promise wrapper that never throws unhandled rejections
 */
export function safePromise<T>(
    promise: Promise<T>,
    context: string = 'Promise'
): Promise<T | null> {
    return promise.catch((error) => {
        handleAppwriteError(error, context);
        return null;
    });
}