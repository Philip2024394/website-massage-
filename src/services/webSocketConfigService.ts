/**
 * WebSocket Configuration Service
 * Handles proper WebSocket setup for development and production
 */

import { appwriteConnectionHealthMonitor } from './appwriteConnectionHealthMonitor.service';

interface WebSocketConfig {
  useAppwriteRealtime: boolean;
  fallbackToPolling: boolean;
  reconnectAttempts: number;
  heartbeatInterval: number;
}

class WebSocketConfigService {
  private config: WebSocketConfig = {
    useAppwriteRealtime: true, // Use Appwrite instead of custom WebSocket server
    fallbackToPolling: true,
    reconnectAttempts: 5,
    heartbeatInterval: 30000
  };

  /**
   * Get optimal WebSocket configuration based on environment
   */
  getConfig(): WebSocketConfig {
    // In development, always use Appwrite realtime
    if (process.env.NODE_ENV === 'development') {
      return {
        ...this.config,
        useAppwriteRealtime: true
      };
    }

    return this.config;
  }

  /**
   * Check if custom WebSocket server is needed
   * Returns false since we're using Appwrite realtime
   */
  needsCustomWebSocketServer(): boolean {
    return false; // Always use Appwrite realtime
  }

  /**
   * Get connection URL for custom WebSocket (if needed)
   */
  getWebSocketUrl(): string | null {
    // Since we're using Appwrite realtime, return null
    return null;
  }

  /**
   * Initialize connection monitoring
   */
  async initializeMonitoring(): Promise<void> {
    try {
      // Start Appwrite connection health monitoring
      appwriteConnectionHealthMonitor.startMonitoring();
      console.log('✅ WebSocket monitoring initialized (Appwrite realtime)');
    } catch (error) {
      console.warn('⚠️ WebSocket monitoring initialization failed:', error);
    }
  }

  /**
   * Get status message for current configuration
   */
  getStatusMessage(): string {
    const config = this.getConfig();
    
    if (config.useAppwriteRealtime) {
      return '🔗 Using Appwrite realtime WebSocket connections - no separate server needed';
    }
    
    return '⚠️ Custom WebSocket server required but not implemented';
  }
}

export const webSocketConfigService = new WebSocketConfigService();