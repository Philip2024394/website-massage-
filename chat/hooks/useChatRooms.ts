/**
 * useChatRooms Hook
 * 
 * Purpose: Fetches and manages active chat rooms for the current user
 * Data Flow: Appwrite chat_rooms collection → React state → UI components
 * 
 * Features:
 * - Fetches user's active chat rooms on mount
 * - Real-time subscription to chat room updates
 * - Filters rooms by user role (customer/therapist)
 * - Returns loading state and error handling
 */

import { useState, useEffect } from 'react';
import { Client, Databases, Query } from 'appwrite';
import { APPWRITE_CONFIG } from '../../lib/appwrite.config';

export interface ChatRoom {
  $id: string;
  $createdAt: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  therapistId: string;
  therapistName: string;
  therapistPhoto?: string;
  bookingDate: string;
  bookingTime: string;
  serviceDuration: string;
  serviceType: string;
  status: 'active' | 'completed' | 'cancelled';
  lastMessageAt?: string;
  unreadCount?: number;
}

interface UseChatRoomsReturn {
  chatRooms: ChatRoom[];
  activeChatRoom: ChatRoom | null;
  loading: boolean;
  error: string | null;
  setActiveChatRoom: (room: ChatRoom | null) => void;
  refreshRooms: () => Promise<void>;
}

export function useChatRooms(userId: string, userRole: 'customer' | 'therapist'): UseChatRoomsReturn {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [activeChatRoom, setActiveChatRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Appwrite client
  const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);

  const databases = new Databases(client);

  // Fetch chat rooms from Appwrite
  const fetchChatRooms = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📥 [useChatRooms] Fetching chat rooms for:', { userId, userRole });

      // Build query based on user role
      const queries = [
        Query.equal(userRole === 'customer' ? 'customerId' : 'therapistId', userId),
        Query.equal('status', 'active'),
        Query.orderDesc('$createdAt'),
        Query.limit(50)
      ];

      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.chatSessions,
        queries
      );

      console.log('✅ [useChatRooms] Fetched chat rooms:', response.documents.length);
      
      setChatRooms(response.documents as ChatRoom[]);
      
      // Auto-select first room if none selected
      if (!activeChatRoom && response.documents.length > 0) {
        setActiveChatRoom(response.documents[0] as ChatRoom);
      }

    } catch (err: any) {
      console.error('❌ [useChatRooms] Error fetching chat rooms:', err);
      setError(err.message || 'Failed to load chat rooms');
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    if (!userId) return;

    console.log('🔔 [useChatRooms] Setting up real-time subscription');

    // Subscribe to chat_sessions collection
    const unsubscribe = client.subscribe(
      `databases.${APPWRITE_CONFIG.databaseId}.collections.${APPWRITE_CONFIG.collections.chatSessions}.documents`,
      (response) => {
        console.log('📨 [useChatRooms] Real-time event:', response.events);

        const payload = response.payload as ChatRoom;

        // Check if this update is relevant to current user
        const isRelevant = userRole === 'customer' 
          ? payload.customerId === userId 
          : payload.therapistId === userId;

        if (!isRelevant) return;

        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
          console.log('➕ [useChatRooms] New chat room created');
          setChatRooms(prev => [payload, ...prev]);
        }

        if (response.events.includes('databases.*.collections.*.documents.*.update')) {
          console.log('🔄 [useChatRooms] Chat room updated');
          setChatRooms(prev => 
            prev.map(room => room.$id === payload.$id ? payload : room)
          );
          
          // Update active room if it's the one being updated
          if (activeChatRoom?.$id === payload.$id) {
            setActiveChatRoom(payload);
          }
        }

        if (response.events.includes('databases.*.collections.*.documents.*.delete')) {
          console.log('🗑️ [useChatRooms] Chat room deleted');
          setChatRooms(prev => prev.filter(room => room.$id !== payload.$id));
          
          if (activeChatRoom?.$id === payload.$id) {
            setActiveChatRoom(null);
          }
        }
      }
    );

    // Initial fetch
    fetchChatRooms();

    return () => {
      console.log('🔌 [useChatRooms] Cleaning up real-time subscription');
      unsubscribe();
    };
  }, [userId, userRole]);

  return {
    chatRooms,
    activeChatRoom,
    loading,
    error,
    setActiveChatRoom,
    refreshRooms: fetchChatRooms
  };
}
