/**
 * Standalone Chat System - Export Module
 * 
 * This module provides a complete, standalone chat system that is fully decoupled
 * from the main booking application. It pulls all data from Appwrite in real-time
 * and can be imported anywhere in your app without breaking existing functionality.
 * 
 * Usage:
 * ```tsx
 * import { FloatingChatWindow } from './chat';
 * 
 * function App() {
 *   return (
 *     <div>
 *       <YourMainApp />
 *       <FloatingChatWindow 
 *         userId="user123"
 *         userName="John Doe"
 *         userRole="customer"
 *       />
 *     </div>
 *   );
 * }
 * ```
 */

// Main component
export { FloatingChatWindow } from './FloatingChatWindow';

// Sub-components (if you want to use them separately)
export { BookingBanner } from './BookingBanner';
export { ChatMessages } from './ChatMessages';
export { ChatInput } from './ChatInput';



// Hooks (for custom implementations)
export { useChatRooms } from './hooks/useChatRooms';
export { useChatMessages } from './hooks/useChatMessages';
export { useBookingCountdown } from './hooks/useBookingCountdown';
export { useNotifications } from './hooks/useNotifications';

// Types (for TypeScript users)
export type { ChatRoom } from './hooks/useChatRooms';
export type { ChatMessage } from './hooks/useChatMessages';
export type { Notification, NotificationType } from './hooks/useNotifications';

// Enhanced Avatar System
export { 
  AVATAR_OPTIONS, 
  LEGACY_AVATAR_OPTIONS,
  getAutoAssignedAvatar,
  getRandomAvatarByGender,
  type AvatarOption
} from '../constants/chatAvatars';
