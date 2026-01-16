/**
 * Read Receipts Hook
 * Track message read status (Facebook Messenger style)
 * Shows checkmarks: sent ✓, delivered ✓✓, read ✓✓ (blue)
 */

import { useState, useEffect } from 'react';
import { databases, DATABASE_ID, client } from '../../lib/appwrite';

interface ReadReceipt {
  messageId: string;
  readBy: string[];
  readAt: Record<string, string>; // userId -> timestamp
  deliveredTo: string[];
  deliveredAt: Record<string, string>;
}

const READ_RECEIPTS_COLLECTION_ID = 'messageReadReceipts'; // Create in Appwrite

export function useReadReceipts(chatRoomId: string, currentUserId: string) {
  const [receipts, setReceipts] = useState<Record<string, ReadReceipt>>({});

  useEffect(() => {
    if (!chatRoomId) return;

    // Subscribe to read receipt updates
    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${READ_RECEIPTS_COLLECTION_ID}.documents`,
      (response: any) => {
        if (response.payload.chatRoomId === chatRoomId) {
          const messageId = response.payload.messageId;
          setReceipts(prev => ({
            ...prev,
            [messageId]: {
              messageId,
              readBy: response.payload.readBy || [],
              readAt: response.payload.readAt || {},
              deliveredTo: response.payload.deliveredTo || [],
              deliveredAt: response.payload.deliveredAt || {}
            }
          }));
        }
      }
    );

    return () => unsubscribe();
  }, [chatRoomId]);

  // Mark message as read
  const markAsRead = async (messageId: string) => {
    try {
      await databases.createDocument(
        DATABASE_ID,
        READ_RECEIPTS_COLLECTION_ID,
        'unique()',
        {
          chatRoomId,
          messageId,
          userId: currentUserId,
          readAt: new Date().toISOString(),
          type: 'read'
        }
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Mark message as delivered
  const markAsDelivered = async (messageId: string) => {
    try {
      await databases.createDocument(
        DATABASE_ID,
        READ_RECEIPTS_COLLECTION_ID,
        'unique()',
        {
          chatRoomId,
          messageId,
          userId: currentUserId,
          deliveredAt: new Date().toISOString(),
          type: 'delivered'
        }
      );
    } catch (error) {
      console.error('Error marking message as delivered:', error);
    }
  };

  // Get read status for a message
  const getMessageStatus = (messageId: string, senderId: string) => {
    const receipt = receipts[messageId];
    if (!receipt) return 'sent';

    // If you're not the sender, don't show status
    if (senderId !== currentUserId) return 'none';

    if (receipt.readBy.length > 0) return 'read';
    if (receipt.deliveredTo.length > 0) return 'delivered';
    return 'sent';
  };

  return {
    receipts,
    markAsRead,
    markAsDelivered,
    getMessageStatus
  };
}
