/**
 * STEP 1: SINGLE SOURCE OF TRUTH ENFORCEMENT
 * This guard prevents direct createDocument calls to chat_messages collection
 * All chat messages MUST go through messaging.service.ts
 */

import { databases as originalDatabases } from '../config';

// Create a proxy to intercept createDocument calls
const databasesProxy = new Proxy(originalDatabases, {
  get(target, prop) {
    if (prop === 'createDocument') {
      return function(databaseId: string, collectionId: string, documentId: string, data: any) {
        // Block direct calls to chat_messages collection
        if (collectionId === 'chat_messages' || collectionId.includes('messages')) {
          console.error('🚫 BLOCKED: Direct createDocument call to chat_messages collection');
          console.error('🚫 Use messagingService.sendMessage() instead for all chat messages');
          console.error('🚫 Collection attempted:', collectionId);
          console.error('🚫 Stack trace:', new Error().stack);
          
          throw new Error(`ENFORCEMENT: Direct createDocument calls to chat_messages collection are blocked. Use messagingService.sendMessage() instead.`);
        }
        
        // Allow calls to other collections
        return originalDatabases.createDocument(databaseId, collectionId, documentId, data);
      };
    }
    
    return target[prop as keyof typeof target];
  }
});

export { databasesProxy as databases };

// Re-export everything else from the original config
export * from '../config';