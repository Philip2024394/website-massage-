/**
 * 🔒 Idempotency Service
 * 
 * Prevents duplicate operations (double-clicks, network retries, race conditions)
 * Facebook standards compliance: Idempotent API calls
 */

class IdempotencyService {
  private pendingRequests = new Map<string, Promise<any>>();
  private completedRequests = new Map<string, { result: any; timestamp: number }>();
  private defaultTTL = 60000; // 60 seconds
  
  /**
   * Execute an operation only once for a given key
   * Subsequent calls with the same key return the same promise
   */
  async executeOnce<T>(
    key: string,
    operation: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    // Check if request is already in flight
    if (this.pendingRequests.has(key)) {
      console.log('🔒 Deduplicating in-flight request:', key);
      return this.pendingRequests.get(key)!;
    }
    
    // Check if request was recently completed (within TTL)
    const completed = this.completedRequests.get(key);
    if (completed && Date.now() - completed.timestamp < ttl) {
      console.log('🔒 Returning cached result:', key);
      return completed.result;
    }
    
    // Execute operation
    console.log('✅ Executing idempotent operation:', key);
    const promise = operation();
    this.pendingRequests.set(key, promise);
    
    try {
      const result = await promise;
      
      // Cache result
      this.completedRequests.set(key, {
        result,
        timestamp: Date.now()
      });
      
      // Schedule cleanup
      setTimeout(() => {
        this.completedRequests.delete(key);
      }, ttl);
      
      return result;
    } catch (error) {
      // Don't cache errors - allow retry
      console.error('❌ Idempotent operation failed:', key, error);
      throw error;
    } finally {
      // Always remove from pending
      this.pendingRequests.delete(key);
    }
  }
  
  /**
   * Clear cached result for a key (force re-execution)
   */
  invalidate(key: string) {
    console.log('🗑️ Invalidating idempotency key:', key);
    this.pendingRequests.delete(key);
    this.completedRequests.delete(key);
  }
  
  /**
   * Clear all cached results
   */
  clear() {
    console.log('🗑️ Clearing all idempotency cache');
    this.pendingRequests.clear();
    this.completedRequests.clear();
  }
  
  /**
   * Get stats for monitoring
   */
  getStats() {
    return {
      pendingCount: this.pendingRequests.size,
      cachedCount: this.completedRequests.size
    };
  }
}

// Export singleton instance
export const idempotencyService = new IdempotencyService();
