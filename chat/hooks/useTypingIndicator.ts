/**
 * Typing Indicator Hook
 * Real-time typing status for chat rooms
 * Facebook Messenger style "User is typing..."
 */

import { useState, useEffect, useRef } from 'react';
import { databases, DATABASE_ID, client } from '../../lib/appwrite';

interface TypingStatus {
  isTyping: boolean;
  userName: string;
  lastTypingAt: number;
}

const TYPING_COLLECTION_ID = 'chatTypingStatus'; // Create this collection in Appwrite
const TYPING_TIMEOUT = 3000; // 3 seconds before hiding typing indicator

export function useTypingIndicator(chatRoomId: string, currentUserId: string) {
  const [typingUsers, setTypingUsers] = useState<Record<string, TypingStatus>>({});
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Subscribe to typing status changes
  useEffect(() => {
    if (!chatRoomId) return;

    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${TYPING_COLLECTION_ID}.documents`,
      (response: any) => {
        if (response.payload.chatRoomId === chatRoomId) {
          const userId = response.payload.userId;
          
          // Ignore own typing
          if (userId === currentUserId) return;

          setTypingUsers(prev => ({
            ...prev,
            [userId]: {
              isTyping: true,
              userName: response.payload.userName,
              lastTypingAt: Date.now()
            }
          }));

          // Auto-clear after timeout
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
            setTypingUsers(prev => {
              const updated = { ...prev };
              delete updated[userId];
              return updated;
            });
          }, TYPING_TIMEOUT);
        }
      }
    );

    return () => {
      unsubscribe();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [chatRoomId, currentUserId]);

  // Send typing status
  const sendTypingStatus = async (userName: string) => {
    try {
      await databases.createDocument(
        DATABASE_ID,
        TYPING_COLLECTION_ID,
        'unique()',
        {
          chatRoomId,
          userId: currentUserId,
          userName,
          timestamp: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Error sending typing status:', error);
    }
  };

  const activeTypers = Object.values(typingUsers).filter(u => u.isTyping);
  const isOtherUserTyping = activeTypers.length > 0;
  const typingUserNames = activeTypers.map(u => u.userName);

  return {
    isOtherUserTyping,
    typingUserNames,
    sendTypingStatus
  };
}
