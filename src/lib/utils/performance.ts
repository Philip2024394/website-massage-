/**
 * 🚀 Performance Enhancement Utilities
 * Enterprise-level performance optimizations for chat system
 */

import React from 'react';

// Avatar Caching System
class AvatarCache {
    private cache = new Map<string, string>();
    private loadingPromises = new Map<string, Promise<string>>();
    private readonly MAX_CACHE_SIZE = 50;
    private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
    private expirationTimes = new Map<string, number>();

    /**
     * Get cached avatar URL or fetch and cache it
     */
    async getCachedAvatar(url: string): Promise<string> {
        // Return cached version if available and not expired
        const cached = this.cache.get(url);
        const expiration = this.expirationTimes.get(url);
        
        if (cached && expiration && Date.now() < expiration) {
            return cached;
        }

        // If already loading, return the existing promise
        if (this.loadingPromises.has(url)) {
            return this.loadingPromises.get(url)!;
        }

        // Create new loading promise
        const loadingPromise = this.loadAvatar(url);
        this.loadingPromises.set(url, loadingPromise);

        try {
            const processedUrl = await loadingPromise;
            this.setCachedAvatar(url, processedUrl);
            return processedUrl;
        } finally {
            this.loadingPromises.delete(url);
        }
    }

    private async loadAvatar(url: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                // Image loaded successfully, return original URL
                resolve(url);
            };
            
            img.onerror = () => {
                // Fallback to default avatar
                const fallbackUrl = 'https://ik.imagekit.io/7grri5v7d/avatar%201.png';
                resolve(fallbackUrl);
            };
            
            img.src = url;
        });
    }

    private setCachedAvatar(url: string, processedUrl: string) {
        // Implement LRU eviction if cache is full
        if (this.cache.size >= this.MAX_CACHE_SIZE) {
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey) {
                this.cache.delete(oldestKey);
                this.expirationTimes.delete(oldestKey);
            }
        }

        this.cache.set(url, processedUrl);
        this.expirationTimes.set(url, Date.now() + this.CACHE_DURATION);
    }

    /**
     * Preload avatars for better performance
     */
    preloadAvatars(urls: string[]) {
        urls.forEach(url => {
            if (!this.cache.has(url)) {
                this.getCachedAvatar(url).catch(() => {
                    // Silent fail for preloading
                });
            }
        });
    }

    /**
     * Clear expired cache entries
     */
    clearExpired() {
        const now = Date.now();
        for (const [url, expiration] of this.expirationTimes.entries()) {
            if (now >= expiration) {
                this.cache.delete(url);
                this.expirationTimes.delete(url);
            }
        }
    }

    /**
     * Get cache statistics
     */
    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.MAX_CACHE_SIZE,
            loading: this.loadingPromises.size
        };
    }
}

// Chat Initialization Debouncing System
class ChatDebouncer {
    private activeChatRequests = new Map<string, Promise<any>>();
    private readonly DEBOUNCE_TIME = 500; // 500ms debounce
    private debounceTimers = new Map<string, NodeJS.Timeout>();

    /**
     * Debounce chat initialization to prevent multiple concurrent requests
     */
    async debounceChatInit<T>(
        chatId: string,
        initFunction: () => Promise<T>,
        options: {
            debounceTime?: number;
            forceNew?: boolean;
        } = {}
    ): Promise<T> {
        const { debounceTime = this.DEBOUNCE_TIME, forceNew = false } = options;

        // Clear existing debounce timer
        const existingTimer = this.debounceTimers.get(chatId);
        if (existingTimer) {
            clearTimeout(existingTimer);
        }

        // If there's an active request and we're not forcing new, return it
        if (!forceNew && this.activeChatRequests.has(chatId)) {
            return this.activeChatRequests.get(chatId)!;
        }

        // Create debounced promise
        return new Promise((resolve, reject) => {
            const timer = setTimeout(async () => {
                this.debounceTimers.delete(chatId);
                
                try {
                    // Create new request
                    const request = initFunction();
                    this.activeChatRequests.set(chatId, request);
                    
                    const result = await request;
                    this.activeChatRequests.delete(chatId);
                    resolve(result);
                } catch (error) {
                    this.activeChatRequests.delete(chatId);
                    reject(error);
                }
            }, debounceTime);

            this.debounceTimers.set(chatId, timer);
        });
    }

    /**
     * Check if chat is currently initializing
     */
    isInitializing(chatId: string): boolean {
        return this.activeChatRequests.has(chatId) || this.debounceTimers.has(chatId);
    }

    /**
     * Cancel pending chat initialization
     */
    cancelInit(chatId: string) {
        const timer = this.debounceTimers.get(chatId);
        if (timer) {
            clearTimeout(timer);
            this.debounceTimers.delete(chatId);
        }
        this.activeChatRequests.delete(chatId);
    }

    /**
     * Get active requests count
     */
    getActiveCount(): number {
        return this.activeChatRequests.size + this.debounceTimers.size;
    }
}

// Request Deduplication System
class RequestDeduplicator {
    private activeRequests = new Map<string, Promise<any>>();
    
    /**
     * Deduplicate identical requests
     */
    async deduplicate<T>(
        key: string,
        requestFunction: () => Promise<T>,
        ttl: number = 5000
    ): Promise<T> {
        // If request is already active, return existing promise
        if (this.activeRequests.has(key)) {
            return this.activeRequests.get(key)!;
        }

        // Create new request
        const requestPromise = requestFunction();
        this.activeRequests.set(key, requestPromise);

        // Auto-cleanup after TTL
        setTimeout(() => {
            this.activeRequests.delete(key);
        }, ttl);

        try {
            const result = await requestPromise;
            return result;
        } catch (error) {
            // Remove failed request immediately
            this.activeRequests.delete(key);
            throw error;
        }
    }

    /**
     * Clear all active requests
     */
    clear() {
        this.activeRequests.clear();
    }

    /**
     * Get active requests count
     */
    getActiveCount(): number {
        return this.activeRequests.size;
    }
}

// Singleton instances
export const avatarCache = new AvatarCache();
export const chatDebouncer = new ChatDebouncer();
export const requestDeduplicator = new RequestDeduplicator();

// Utility functions
export const performanceUtils = {
    /**
     * Preload critical avatars
     */
    preloadCriticalAvatars(therapistPhotos: string[]) {
        avatarCache.preloadAvatars(therapistPhotos);
    },

    /**
     * Get performance statistics
     */
    getPerformanceStats() {
        return {
            avatarCache: avatarCache.getStats(),
            activeChatInits: chatDebouncer.getActiveCount(),
            activeRequests: requestDeduplicator.getActiveCount()
        };
    },

    /**
     * Cleanup expired cache entries
     */
    cleanupCache() {
        avatarCache.clearExpired();
        requestDeduplicator.clear();
    },

    /**
     * Initialize performance monitoring
     */
    initPerformanceMonitoring() {
        // Auto-cleanup every 10 minutes
        setInterval(() => {
            this.cleanupCache();
        }, 10 * 60 * 1000);

        // Log performance stats in development
        if (process.env.NODE_ENV === 'development') {
            setInterval(() => {
                console.log('🚀 Performance Stats:', this.getPerformanceStats());
            }, 30 * 1000);
        }
    }
};

// Enhanced Image Component with Lazy Loading and Caching
export interface EnhancedImageProps {
    src: string;
    alt: string;
    className?: string;
    fallbackSrc?: string;
    loading?: 'lazy' | 'eager';
    onLoad?: () => void;
    onError?: () => void;
}

export const createEnhancedImage = (props: EnhancedImageProps) => {
    const {
        src,
        alt,
        className = '',
        fallbackSrc = 'https://ik.imagekit.io/7grri5v7d/avatar%201.png',
        loading = 'lazy',
        onLoad,
        onError
    } = props;

    // Use cached avatar if available
    const [imageSrc, setImageSrc] = React.useState(src);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        let isMounted = true;

        avatarCache.getCachedAvatar(src).then(cachedSrc => {
            if (isMounted) {
                setImageSrc(cachedSrc);
                setIsLoading(false);
            }
        }).catch(() => {
            if (isMounted) {
                setImageSrc(fallbackSrc);
                setIsLoading(false);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [src, fallbackSrc]);

    return React.createElement('img', {
        src: imageSrc,
        alt,
        className: `${className} ${isLoading ? 'opacity-50' : ''}`,
        loading,
        onLoad: () => {
            setIsLoading(false);
            onLoad?.();
        },
        onError: () => {
            setImageSrc(fallbackSrc);
            setIsLoading(false);
            onError?.();
        }
    });
};