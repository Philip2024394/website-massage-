/**
 * ⚡ Optimistic UI Updates Manager
 * 
 * Provides instant UI feedback with automatic rollback on errors
 * Facebook standards compliance: Optimistic updates for better UX
 */

interface OptimisticUpdate {
  id: string;
  optimisticUpdate: () => void;
  rollback: () => void;
  timestamp: number;
}

class OptimisticUpdateManager {
  private activeUpdates = new Map<string, OptimisticUpdate>();
  private rollbackQueue = new Map<string, () => void>();
  
  /**
   * Execute operation with optimistic UI update
   * Updates UI immediately, rolls back if server operation fails
   */
  async executeWithOptimism<T>(
    updateKey: string,
    optimisticUpdate: () => void,
    serverOperation: () => Promise<T>,
    rollback: () => void
  ): Promise<T> {
    // Apply optimistic update immediately
    console.log(`⚡ Applying optimistic update: ${updateKey}`);
    optimisticUpdate();
    
    // Store rollback function
    this.activeUpdates.set(updateKey, {
      id: updateKey,
      optimisticUpdate,
      rollback,
      timestamp: Date.now()
    });
    
    this.rollbackQueue.set(updateKey, rollback);
    
    try {
      // Execute server operation
      const result = await serverOperation();
      
      // Success - commit optimistic update
      console.log(`✅ Optimistic update committed: ${updateKey}`);
      this.activeUpdates.delete(updateKey);
      this.rollbackQueue.delete(updateKey);
      
      return result;
    } catch (error) {
      // Failure - rollback optimistic update
      console.warn(`⏪ Rolling back optimistic update: ${updateKey}`, error);
      
      const update = this.activeUpdates.get(updateKey);
      if (update) {
        update.rollback();
        this.activeUpdates.delete(updateKey);
        this.rollbackQueue.delete(updateKey);
      }
      
      throw error;
    }
  }
  
  /**
   * Execute multiple optimistic updates as a transaction
   * All updates are rolled back if any operation fails
   */
  async executeTransaction<T>(
    transactionId: string,
    updates: Array<{
      key: string;
      optimisticUpdate: () => void;
      rollback: () => void;
    }>,
    serverOperation: () => Promise<T>
  ): Promise<T> {
    // Apply all optimistic updates
    console.log(`⚡ Starting optimistic transaction: ${transactionId} (${updates.length} updates)`);
    
    updates.forEach(update => {
      update.optimisticUpdate();
      this.activeUpdates.set(`${transactionId}-${update.key}`, {
        id: `${transactionId}-${update.key}`,
        optimisticUpdate: update.optimisticUpdate,
        rollback: update.rollback,
        timestamp: Date.now()
      });
    });
    
    try {
      // Execute server operation
      const result = await serverOperation();
      
      // Success - commit all updates
      console.log(`✅ Optimistic transaction committed: ${transactionId}`);
      updates.forEach(update => {
        this.activeUpdates.delete(`${transactionId}-${update.key}`);
      });
      
      return result;
    } catch (error) {
      // Failure - rollback all updates in reverse order
      console.warn(`⏪ Rolling back optimistic transaction: ${transactionId}`, error);
      
      [...updates].reverse().forEach(update => {
        const key = `${transactionId}-${update.key}`;
        const activeUpdate = this.activeUpdates.get(key);
        if (activeUpdate) {
          activeUpdate.rollback();
          this.activeUpdates.delete(key);
        }
      });
      
      throw error;
    }
  }
  
  /**
   * Manually rollback an optimistic update
   */
  rollback(updateKey: string) {
    const update = this.activeUpdates.get(updateKey);
    if (update) {
      console.log(`🔄 Manual rollback: ${updateKey}`);
      update.rollback();
      this.activeUpdates.delete(updateKey);
      this.rollbackQueue.delete(updateKey);
    }
  }
  
  /**
   * Get active optimistic updates (for debugging)
   */
  getActiveUpdates(): string[] {
    return Array.from(this.activeUpdates.keys());
  }
  
  /**
   * Clear all active updates (emergency reset)
   */
  clearAll() {
    console.warn('⚠️ Clearing all optimistic updates');
    this.activeUpdates.clear();
    this.rollbackQueue.clear();
  }
}

// Export singleton instance
export const optimisticUpdateManager = new OptimisticUpdateManager();
