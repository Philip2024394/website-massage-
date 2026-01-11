/**
 * 🚦 Request Queue with Priority
 * 
 * Queues and prioritizes API requests to prevent flooding
 * Facebook standards compliance: Request throttling and prioritization
 */

type Priority = 'high' | 'medium' | 'low';

interface QueuedRequest<T> {
  id: string;
  priority: Priority;
  operation: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
  timestamp: number;
  retries: number;
}

class PriorityRequestQueue {
  private queue: QueuedRequest<any>[] = [];
  private processing = false;
  private maxConcurrent = 3;
  private activeRequests = 0;
  private requestCounter = 0;
  
  /**
   * Enqueue a request with priority
   */
  async enqueue<T>(
    operation: () => Promise<T>,
    priority: Priority = 'medium'
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const requestId = `req-${++this.requestCounter}`;
      
      const queuedRequest: QueuedRequest<T> = {
        id: requestId,
        priority,
        operation,
        resolve,
        reject,
        timestamp: Date.now(),
        retries: 0
      };
      
      this.queue.push(queuedRequest);
      
      console.log(`📥 Enqueued ${priority} priority request:`, requestId);
      
      // Sort queue by priority, then by timestamp (FIFO within same priority)
      this.sortQueue();
      
      // Start processing
      this.processQueue();
    });
  }
  
  /**
   * Sort queue by priority and timestamp
   */
  private sortQueue() {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    
    this.queue.sort((a, b) => {
      // First, sort by priority (high to low)
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then, sort by timestamp (oldest first - FIFO)
      return a.timestamp - b.timestamp;
    });
  }
  
  /**
   * Process queued requests
   */
  private async processQueue() {
    if (this.processing || this.activeRequests >= this.maxConcurrent) {
      return;
    }
    
    if (this.queue.length === 0) {
      return;
    }
    
    this.processing = true;
    
    while (this.queue.length > 0 && this.activeRequests < this.maxConcurrent) {
      const request = this.queue.shift();
      if (!request) break;
      
      this.activeRequests++;
      
      console.log(`📤 Processing ${request.priority} priority request:`, request.id);
      
      // Execute request (don't await - process in parallel)
      this.executeRequest(request).finally(() => {
        this.activeRequests--;
        this.processQueue(); // Process next item
      });
    }
    
    this.processing = false;
  }
  
  /**
   * Execute a single request
   */
  private async executeRequest<T>(request: QueuedRequest<T>) {
    try {
      const result = await request.operation();
      request.resolve(result);
      console.log(`✅ Request completed:`, request.id);
    } catch (error) {
      console.error(`❌ Request failed:`, request.id, error);
      
      // Retry logic for high priority requests
      if (request.priority === 'high' && request.retries < 2) {
        request.retries++;
        console.log(`🔄 Retrying high priority request:`, request.id, `(attempt ${request.retries + 1}/3)`);
        
        // Re-enqueue at front of queue
        this.queue.unshift(request);
        this.sortQueue();
      } else {
        request.reject(error);
      }
    }
  }
  
  /**
   * Get queue statistics
   */
  getStats() {
    const highCount = this.queue.filter(r => r.priority === 'high').length;
    const mediumCount = this.queue.filter(r => r.priority === 'medium').length;
    const lowCount = this.queue.filter(r => r.priority === 'low').length;
    
    return {
      total: this.queue.length,
      active: this.activeRequests,
      byPriority: {
        high: highCount,
        medium: mediumCount,
        low: lowCount
      },
      oldestRequest: this.queue.length > 0 ? Date.now() - this.queue[0].timestamp : 0
    };
  }
  
  /**
   * Clear all queued requests
   */
  clear() {
    console.warn('⚠️ Clearing request queue');
    this.queue.forEach(request => {
      request.reject(new Error('Request queue cleared'));
    });
    this.queue = [];
  }
}

// Export singleton instance
export const requestQueue = new PriorityRequestQueue();

// Helper functions for common operations
export const queueHighPriority = <T>(operation: () => Promise<T>) => 
  requestQueue.enqueue(operation, 'high');

export const queueMediumPriority = <T>(operation: () => Promise<T>) => 
  requestQueue.enqueue(operation, 'medium');

export const queueLowPriority = <T>(operation: () => Promise<T>) => 
  requestQueue.enqueue(operation, 'low');
