import { useContext } from 'react';
import { ChatContext } from '../context/ChatProvider';

/**
 * Hook to interact with the ChatProvider context
 * Replaces event-based chat system with direct context calls
 */
export function useChatProvider() {
  const context = useContext(ChatContext);

  if (!context) {
    console.error('❌ useChatProvider must be used within ChatProvider');
    throw new Error('useChatProvider must be used within ChatProvider');
  }

  const {
    activeChatRooms,
    openChatRoom,
    closeChatRoom,
    minimizeChatRoom,
    isChatMinimized,
    setSelectedChatId,
    selectedChatId,
    subscriptionActive,
    isLoading,
    error: chatError,
    messages,
    messagesLoading,
    messagesError,
    currentChatRoom,
    sendMessage,
    sending,
    notifications,
    addNotification,
    removeNotification
  } = context as any;

  /**
   * Open a chat room after successful booking
   * Replaces the old window.dispatchEvent('openChat') pattern
   */
  const openBookingChat = (payload: {
    chatRoomId: string;
    bookingId: string;
    providerId: string;
    providerName: string;
    providerImage?: string | null;
    customerName: string;
    customerWhatsApp: string;
    serviceDuration?: string;
    serviceType?: string;
    serviceDate?: string;
    serviceTime?: string;
  }) => {
    console.log('🚀 [useChatProvider] Opening booking chat:', payload);

    try {
      // Validate required fields
      if (!payload.chatRoomId) {
        throw new Error('Cannot open chat without chatRoomId');
      }

      if (!payload.bookingId) {
        throw new Error('Cannot open chat without bookingId');
      }

      // Open the chat room using the ChatProvider
      // The ChatProvider will automatically detect the room exists in Appwrite
      // and make it visible through real-time subscriptions
      openChatRoom(payload.chatRoomId);

      console.log('✅ [useChatProvider] Chat room opened successfully');

      // Add success notification
      addNotification(
        'success',
        'Chat Opened',
        `Chat with ${payload.providerName} is ready`,
        { duration: 3000 }
      );

      return true;
    } catch (error: any) {
      console.error('❌ [useChatProvider] Failed to open booking chat:', error);
      
      // Add error notification
      addNotification(
        'error',
        'Chat Failed',
        error.message || 'Could not open chat room',
        { duration: 5000 }
      );

      return false;
    }
  };

  /**
   * Legacy compatibility function for existing booking hooks
   * Converts old payload format to new openBookingChat format
   */
  const handleBookingSuccess = (payload: {
    chatRoomId: string;
    bookingId: string;
    providerId: string;
    providerName: string;
    providerImage?: string | null;
    therapistId?: string;
    therapistName?: string;
    customerName: string;
    customerWhatsApp: string;
    userRole?: string;
    source?: string;
    pricing?: { [key: string]: number };
    bookingDate?: string;
    bookingTime?: string;
    serviceDuration?: string;
    serviceType?: string;
  }) => {
    console.log('🔄 [useChatProvider] Converting legacy booking success payload');

    return openBookingChat({
      chatRoomId: payload.chatRoomId,
      bookingId: payload.bookingId,
      providerId: payload.providerId,
      providerName: payload.providerName || payload.therapistName || 'Provider',
      providerImage: payload.providerImage,
      customerName: payload.customerName,
      customerWhatsApp: payload.customerWhatsApp,
      serviceDuration: payload.serviceDuration,
      serviceType: payload.serviceType,
      serviceDate: payload.bookingDate,
      serviceTime: payload.bookingTime
    });
  };

  return {
    // Core chat state
    activeChatRooms,
    selectedChatId,
    subscriptionActive,
    isLoading,
    chatError,
    
    // Current chat room data
    currentChatRoom,
    messages,
    messagesLoading,
    messagesError,
    
    // Chat room controls
    openChatRoom,
    closeChatRoom,
    minimizeChatRoom,
    isChatMinimized,
    setSelectedChatId,
    
    // Message controls
    sendMessage,
    sending,
    
    // Notifications
    notifications,
    addNotification,
    removeNotification,
    
    // Booking integration
    openBookingChat,
    handleBookingSuccess
  };
}

const noop = () => {};
const noopAsync = () => Promise.resolve(false);

const optionalFallback = {
  activeChatRooms: [],
  selectedChatId: null,
  subscriptionActive: false,
  isLoading: false,
  chatError: null,
  currentChatRoom: null,
  messages: [],
  messagesLoading: false,
  messagesError: null,
  openChatRoom: noop,
  closeChatRoom: noop,
  minimizeChatRoom: noop,
  isChatMinimized: false,
  setSelectedChatId: noop,
  sendMessage: noopAsync,
  sending: false,
  notifications: [],
  addNotification: noop,
  removeNotification: noop,
  openBookingChat: noopAsync,
  handleBookingSuccess: noopAsync
};

/** Same as useChatProvider but never throws. Returns no-op functions when outside ChatProvider (e.g. lazy-loaded profile pages). */
export function useChatProviderOptional() {
  const context = useContext(ChatContext);
  if (!context) return optionalFallback;
  const ctx = context as any;
  return {
    activeChatRooms: ctx.activeChatRooms ?? [],
    selectedChatId: ctx.selectedChatId ?? null,
    subscriptionActive: ctx.subscriptionActive ?? false,
    isLoading: ctx.isLoading ?? false,
    chatError: ctx.error ?? ctx.chatError ?? null,
    currentChatRoom: ctx.currentChatRoom ?? null,
    messages: ctx.messages ?? [],
    messagesLoading: ctx.messagesLoading ?? false,
    messagesError: ctx.messagesError ?? null,
    openChatRoom: ctx.openChatRoom ?? noop,
    closeChatRoom: ctx.closeChatRoom ?? noop,
    minimizeChatRoom: ctx.minimizeChatRoom ?? noop,
    isChatMinimized: ctx.isChatMinimized ?? false,
    setSelectedChatId: ctx.setSelectedChatId ?? noop,
    sendMessage: ctx.sendMessage ?? noopAsync,
    sending: ctx.sending ?? false,
    notifications: ctx.notifications ?? [],
    addNotification: ctx.addNotification ?? noop,
    removeNotification: ctx.removeNotification ?? noop,
    openBookingChat: ctx.openBookingChat ?? noopAsync,
    handleBookingSuccess: ctx.handleBookingSuccess ?? noopAsync
  };
}