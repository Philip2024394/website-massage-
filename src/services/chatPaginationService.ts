import { logger } from './enterpriseLogger';
/**
 * ⚡ CHAT MESSAGE PAGINATION SERVICE - FACEBOOK STANDARDS
 * 
 * Implements infinite scroll pagination for chat messages
 * - Loads messages in batches (default: 50 per page)
 * - Maintains scroll position when loading older messages
 * - Caches loaded messages for performance
 * - Handles edge cases (first page, last page, empty results)
 * 
 * Based on Facebook Messenger's pagination strategy
 */

import { databases } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import { Query } from 'appwrite';

export interface PaginationConfig {
  pageSize?: number; // Messages per page (default: 50)
  maxCacheSize?: number; // Maximum messages to keep in memory (default: 500)
}

export interface PaginatedMessages {
  messages: any[];
  hasMore: boolean;
  totalCount: number;
  cursor?: string; // Cursor for next page
}

export interface MessagePage {
  messages: any[];
  cursor?: string;
  timestamp: number;
}

class ChatPaginationService {
  private messageCache: Map<string, MessagePage[]> = new Map();
  private maxCacheSize: number = 500;
  private defaultPageSize: number = 50;
  
  /**
   * Load initial messages for a conversation
   * 
   * @param conversationId - Chat room/conversation ID
   * @param pageSize - Number of messages to load
   * @returns First page of messages
   */
  async loadInitialMessages(
    conversationId: string,
    pageSize: number = this.defaultPageSize
  ): Promise<PaginatedMessages> {
    try {
      logger.info(`📖 Loading initial ${pageSize} messages for conversation: ${conversationId}`);
      
      // Clear cache for this conversation
      this.messageCache.delete(conversationId);
      
      // Load first page
      const result = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.chatMessages || 'chat_messages',
        [
          Query.equal('conversationId', conversationId),
          Query.orderDesc('timestamp'),
          Query.limit(pageSize)
        ]
      );
      
      const messages = result.documents.reverse(); // Oldest first for display
      const hasMore = result.total > pageSize;
      
      // Cache first page
      this.cacheMessagePage(conversationId, {
        messages,
        cursor: messages.length > 0 ? messages[0].$id : undefined,
        timestamp: Date.now()
      });
      
      logger.info(`✅ Loaded ${messages.length} messages (${result.total} total, hasMore: ${hasMore})`);
      
      return {
        messages,
        hasMore,
        totalCount: result.total,
        cursor: messages.length > 0 ? messages[0].$id : undefined
      };
      
    } catch (error) {
      logger.error('❌ Failed to load initial messages:', error);
      throw error;
    }
  }
  
  /**
   * Load older messages (previous page)
   * 
   * @param conversationId - Chat room/conversation ID
   * @param cursor - Message ID to load before
   * @param pageSize - Number of messages to load
   * @returns Previous page of messages
   */
  async loadOlderMessages(
    conversationId: string,
    cursor: string,
    pageSize: number = this.defaultPageSize
  ): Promise<PaginatedMessages> {
    try {
      logger.info(`📖 Loading ${pageSize} older messages before cursor: ${cursor}`);
      
      // Get cursor message timestamp
      const cursorMessage = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.chatMessages || 'chat_messages',
        cursor
      );
      
      const cursorTimestamp = new Date(cursorMessage.timestamp).getTime();
      
      // Load messages before cursor
      const result = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.chatMessages || 'chat_messages',
        [
          Query.equal('conversationId', conversationId),
          Query.lessThan('timestamp', new Date(cursorTimestamp).toISOString()),
          Query.orderDesc('timestamp'),
          Query.limit(pageSize)
        ]
      );
      
      const messages = result.documents.reverse(); // Oldest first
      const hasMore = messages.length === pageSize; // If we got full page, assume more exist
      
      // Cache page
      if (messages.length > 0) {
        this.cacheMessagePage(conversationId, {
          messages,
          cursor: messages[0].$id,
          timestamp: Date.now()
        });
      }
      
      logger.info(`✅ Loaded ${messages.length} older messages (hasMore: ${hasMore})`);
      
      return {
        messages,
        hasMore,
        totalCount: 0, // Don't recalculate total for pagination
        cursor: messages.length > 0 ? messages[0].$id : undefined
      };
      
    } catch (error) {
      logger.error('❌ Failed to load older messages:', error);
      throw error;
    }
  }
  
  /**
   * Load newer messages (for updates)
   * 
   * @param conversationId - Chat room/conversation ID
   * @param afterTimestamp - Load messages after this timestamp
   * @returns Newer messages
   */
  async loadNewerMessages(
    conversationId: string,
    afterTimestamp: string
  ): Promise<any[]> {
    try {
      const result = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.chatMessages || 'chat_messages',
        [
          Query.equal('conversationId', conversationId),
          Query.greaterThan('timestamp', afterTimestamp),
          Query.orderAsc('timestamp'),
          Query.limit(100) // Max 100 new messages at once
        ]
      );
      
      return result.documents;
      
    } catch (error) {
      logger.error('❌ Failed to load newer messages:', error);
      return [];
    }
  }
  
  /**
   * Search messages in conversation
   * 
   * @param conversationId - Chat room/conversation ID
   * @param searchQuery - Text to search for
   * @param pageSize - Number of results per page
   * @returns Search results
   */
  async searchMessages(
    conversationId: string,
    searchQuery: string,
    pageSize: number = 20
  ): Promise<any[]> {
    try {
      logger.info(`🔍 Searching messages for: "${searchQuery}"`);
      
      const result = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.chatMessages || 'chat_messages',
        [
          Query.equal('conversationId', conversationId),
          Query.search('message', searchQuery),
          Query.orderDesc('timestamp'),
          Query.limit(pageSize)
        ]
      );
      
      logger.info(`✅ Found ${result.documents.length} matching messages`);
      return result.documents;
      
    } catch (error) {
      logger.error('❌ Search failed:', error);
      return [];
    }
  }
  
  /**
   * Cache message page
   */
  private cacheMessagePage(conversationId: string, page: MessagePage) {
    const pages = this.messageCache.get(conversationId) || [];
    pages.push(page);
    
    // Limit cache size
    const totalMessages = pages.reduce((sum, p) => sum + p.messages.length, 0);
    if (totalMessages > this.maxCacheSize) {
      // Remove oldest page
      pages.shift();
    }
    
    this.messageCache.set(conversationId, pages);
  }
  
  /**
   * Get cached messages
   */
  getCachedMessages(conversationId: string): any[] {
    const pages = this.messageCache.get(conversationId) || [];
    return pages.flatMap(p => p.messages);
  }
  
  /**
   * Clear cache for conversation
   */
  clearCache(conversationId: string) {
    this.messageCache.delete(conversationId);
    logger.info(`🗑️ Cache cleared for conversation: ${conversationId}`);
  }
  
  /**
   * Clear all caches
   */
  clearAllCaches() {
    this.messageCache.clear();
    logger.info('🗑️ All message caches cleared');
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats(): {
    totalConversations: number;
    totalCachedMessages: number;
    cacheSize: string;
  } {
    const totalConversations = this.messageCache.size;
    let totalMessages = 0;
    
    for (const pages of this.messageCache.values()) {
      totalMessages += pages.reduce((sum, p) => sum + p.messages.length, 0);
    }
    
    // Rough estimate of cache size
    const estimatedBytes = totalMessages * 500; // ~500 bytes per message
    const cacheSizeKB = Math.round(estimatedBytes / 1024);
    
    return {
      totalConversations,
      totalCachedMessages: totalMessages,
      cacheSize: cacheSizeKB > 1024 
        ? `${Math.round(cacheSizeKB / 1024)} MB` 
        : `${cacheSizeKB} KB`
    };
  }
}

// Export singleton instance
export const chatPaginationService = new ChatPaginationService();

/**
 * React hook for paginated chat messages
 */
export const usePaginatedMessages = (conversationId: string, pageSize: number = 50) => {
  const [messages, setMessages] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(false);
  const [cursor, setCursor] = React.useState<string | undefined>();
  const [error, setError] = React.useState<Error | null>(null);
  
  // Load initial messages
  React.useEffect(() => {
    if (!conversationId) return;
    
    const loadInitial = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await chatPaginationService.loadInitialMessages(conversationId, pageSize);
        
        setMessages(result.messages);
        setHasMore(result.hasMore);
        setCursor(result.cursor);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitial();
  }, [conversationId, pageSize]);
  
  // Load more messages
  const loadMore = async () => {
    if (!cursor || loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      
      const result = await chatPaginationService.loadOlderMessages(conversationId, cursor, pageSize);
      
      // Prepend older messages
      setMessages(prev => [...result.messages, ...prev]);
      setHasMore(result.hasMore);
      setCursor(result.cursor);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoadingMore(false);
    }
  };
  
  // Append new message (from real-time subscription)
  const appendMessage = (message: any) => {
    setMessages(prev => [...prev, message]);
  };
  
  return {
    messages,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
    appendMessage
  };
};

// Re-export React for the hook
import * as React from 'react';
