/**
 * Professional Notification Badge Component
 * Shows unread message count with elegant styling
 */

import React, { useState, useEffect } from 'react';
import { MessageCircle, Bell, Phone } from 'lucide-react';
import { professionalChatService } from '../services/professionalChatNotificationService';

interface NotificationBadgeProps {
  chatId: string;
  icon?: 'message' | 'bell' | 'phone';
  size?: 'sm' | 'md' | 'lg';
  color?: 'red' | 'blue' | 'green' | 'orange';
  showZero?: boolean;
  onClick?: () => void;
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  chatId,
  icon = 'message',
  size = 'md',
  color = 'red',
  showZero = false,
  onClick,
  className = ''
}) => {
  const [badgeCount, setBadgeCount] = useState(0);

  useEffect(() => {
    // Listen for badge updates
    const handleBadgeUpdate = (event: CustomEvent) => {
      const { chatId: updatedChatId, count } = event.detail;
      if (updatedChatId === chatId) {
        setBadgeCount(count);
      }
    };

    window.addEventListener('notificationBadgeUpdate', handleBadgeUpdate as EventListener);
    
    // Get initial badge count
    const count = professionalChatService.getNotificationBadge(chatId);
    setBadgeCount(count);

    return () => {
      window.removeEventListener('notificationBadgeUpdate', handleBadgeUpdate as EventListener);
    };
  }, [chatId]);

  const getIconComponent = () => {
    const iconProps = {
      className: getIconSize(),
    };

    switch (icon) {
      case 'bell':
        return <Bell {...iconProps} />;
      case 'phone':
        return <Phone {...iconProps} />;
      default:
        return <MessageCircle {...iconProps} />;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-8 h-8';
      default:
        return 'w-6 h-6';
    }
  };

  const getBadgeSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4 text-xs';
      case 'lg':
        return 'w-7 h-7 text-sm';
      default:
        return 'w-5 h-5 text-xs';
    }
  };

  const getBadgeColor = () => {
    switch (color) {
      case 'blue':
        return 'bg-blue-500 text-white';
      case 'green':
        return 'bg-green-500 text-white';
      case 'orange':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-red-500 text-white';
    }
  };

  const getContainerSize = () => {
    switch (size) {
      case 'sm':
        return 'p-2';
      case 'lg':
        return 'p-4';
      default:
        return 'p-3';
    }
  };

  const shouldShowBadge = badgeCount > 0 || showZero;
  const displayCount = badgeCount > 99 ? '99+' : badgeCount.toString();

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Main Icon Button */}
      <button
        onClick={() => {
          onClick?.();
          // Clear badge when clicked
          if (badgeCount > 0) {
            professionalChatService.clearNotificationBadge(chatId);
          }
        }}
        className={`${getContainerSize()} rounded-full transition-all duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
      >
        {getIconComponent()}
      </button>

      {/* Badge */}
      {shouldShowBadge && (
        <div
          className={`absolute -top-1 -right-1 ${getBadgeSize()} ${getBadgeColor()} rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-white animate-pulse`}
        >
          {badgeCount > 0 ? displayCount : ''}
        </div>
      )}
    </div>
  );
};

/**
 * Multiple Chat Badges Component
 * Shows badges for multiple chat rooms
 */
interface MultipleChatBadgesProps {
  chatBadges: Array<{
    chatId: string;
    name: string;
    avatar?: string;
    type: 'customer' | 'therapist' | 'admin';
  }>;
  onChatClick: (chatId: string) => void;
}

export const MultipleChatBadges: React.FC<MultipleChatBadgesProps> = ({
  chatBadges,
  onChatClick
}) => {
  const [badges, setBadges] = useState<Record<string, number>>({});

  useEffect(() => {
    // Listen for badge updates for all chats
    const handleBadgeUpdate = (event: CustomEvent) => {
      const { chatId, count } = event.detail;
      setBadges(prev => ({
        ...prev,
        [chatId]: count
      }));
    };

    window.addEventListener('notificationBadgeUpdate', handleBadgeUpdate as EventListener);
    
    // Get initial badge counts
    const initialBadges: Record<string, number> = {};
    chatBadges.forEach(chat => {
      initialBadges[chat.chatId] = professionalChatService.getNotificationBadge(chat.chatId);
    });
    setBadges(initialBadges);

    return () => {
      window.removeEventListener('notificationBadgeUpdate', handleBadgeUpdate as EventListener);
    };
  }, [chatBadges]);

  const getTotalBadges = () => {
    return Object.values(badges).reduce((sum, count) => sum + count, 0);
  };

  const getChatTypeColor = (type: string) => {
    switch (type) {
      case 'therapist':
        return 'border-green-200 bg-green-50';
      case 'admin':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  return (
    <div className=\"space-y-2\">
      {/* Total Badge Summary */}
      {getTotalBadges() > 0 && (
        <div className=\"bg-red-50 border border-red-200 rounded-lg p-3 text-center\">
          <div className=\"text-red-600 font-bold\">
            {getTotalBadges()} unread message{getTotalBadges() !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Individual Chat Badges */}
      <div className=\"space-y-1\">
        {chatBadges.map(chat => (
          <div
            key={chat.chatId}
            className={`flex items-center justify-between p-3 rounded-lg border ${getChatTypeColor(chat.type)} cursor-pointer hover:shadow-sm transition-all`}
            onClick={() => onChatClick(chat.chatId)}
          >
            <div className=\"flex items-center gap-3\">
              {/* Avatar */}
              {chat.avatar ? (
                <img
                  src={chat.avatar}
                  alt={chat.name}
                  className=\"w-8 h-8 rounded-full\"
                />
              ) : (
                <div className=\"w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold\">
                  {chat.name.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Chat Info */}
              <div>
                <div className=\"font-medium text-gray-800\">{chat.name}</div>
                <div className=\"text-xs text-gray-500 capitalize\">{chat.type}</div>
              </div>
            </div>

            {/* Badge */}
            <NotificationBadge
              chatId={chat.chatId}
              size=\"sm\"
              showZero={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationBadge;