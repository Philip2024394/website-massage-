/**
 * Professional User Status Component
 * Shows online/away/offline status with device type
 */

import React, { useState, useEffect } from 'react';
import { Circle, Smartphone, Monitor, Tablet, Wifi, WifiOff } from 'lucide-react';
import { professionalChatService, UserPresence } from '../services/professionalChatNotificationService';

interface UserStatusIndicatorProps {
  userId: string;
  userName?: string;
  showText?: boolean;
  showDeviceIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const UserStatusIndicator: React.FC<UserStatusIndicatorProps> = ({
  userId,
  userName,
  showText = false,
  showDeviceIcon = false,
  size = 'md',
  className = ''
}) => {
  const [presence, setPresence] = useState<UserPresence | null>(null);

  useEffect(() => {
    // Listen for presence updates
    const handlePresenceUpdate = (event: CustomEvent) => {
      const userPresence = event.detail as UserPresence;
      if (userPresence.userId === userId) {
        setPresence(userPresence);
      }
    };

    window.addEventListener('userPresenceUpdate', handlePresenceUpdate as EventListener);
    
    // Get initial presence
    const currentPresence = professionalChatService.getUserPresence(userId);
    setPresence(currentPresence);

    return () => {
      window.removeEventListener('userPresenceUpdate', handlePresenceUpdate as EventListener);
    };
  }, [userId]);

  const getStatusColor = () => {
    if (!presence) return 'bg-gray-400';
    
    switch (presence.status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusSize = () => {
    switch (size) {
      case 'sm':
        return 'w-2 h-2';
      case 'lg':
        return 'w-4 h-4';
      default:
        return 'w-3 h-3';
    }
  };

  const getStatusText = () => {
    if (!presence) return 'Unknown';
    
    const now = new Date();
    const lastSeen = new Date(presence.lastSeen);
    const diffMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60));
    
    switch (presence.status) {
      case 'online':
        return 'Online';
      case 'away':
        return diffMinutes < 5 ? 'Away' : `Away ${diffMinutes}m ago`;
      case 'offline':
        if (diffMinutes < 60) {
          return `Last seen ${diffMinutes}m ago`;
        } else if (diffMinutes < 1440) { // 24 hours
          const hours = Math.floor(diffMinutes / 60);
          return `Last seen ${hours}h ago`;
        } else {
          const days = Math.floor(diffMinutes / 1440);
          return `Last seen ${days}d ago`;
        }
      default:
        return 'Unknown';
    }
  };

  const getDeviceIcon = () => {
    if (!presence?.deviceType || !showDeviceIcon) return null;

    const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
    const iconColor = 'text-gray-500';

    switch (presence.deviceType) {
      case 'mobile':
        return <Smartphone className={`${iconSize} ${iconColor}`} />;
      case 'tablet':
        return <Tablet className={`${iconSize} ${iconColor}`} />;
      case 'desktop':
        return <Monitor className={`${iconSize} ${iconColor}`} />;
      default:
        return null;
    }
  };

  if (!presence) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Circle className={`${getStatusSize()} text-gray-300`} />
        {showText && <span className=\"text-sm text-gray-500\">Unknown</span>}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Status Dot */}
      <div className=\"relative\">
        <div className={`${getStatusSize()} ${getStatusColor()} rounded-full ${
          presence.status === 'online' ? 'animate-pulse' : ''
        }`}></div>
        {presence.status === 'online' && (
          <div className={`absolute inset-0 ${getStatusSize()} ${getStatusColor()} rounded-full animate-ping opacity-75`}></div>
        )}
      </div>

      {/* Status Text */}
      {showText && (
        <div className=\"flex items-center gap-1\">
          <span className={`text-sm ${
            presence.status === 'online' ? 'text-green-600 font-medium' :
            presence.status === 'away' ? 'text-yellow-600' : 'text-gray-500'
          }`}>
            {userName ? `${userName} - ${getStatusText()}` : getStatusText()}
          </span>
          {getDeviceIcon()}
        </div>
      )}
    </div>
  );
};

/**
 * User Status Manager Component
 * Manages user's own status with controls
 */
interface UserStatusManagerProps {
  currentUserId: string;
  currentUserName: string;
  onStatusChange?: (status: UserPresence['status']) => void;
}

export const UserStatusManager: React.FC<UserStatusManagerProps> = ({
  currentUserId,
  currentUserName,
  onStatusChange
}) => {
  const [currentStatus, setCurrentStatus] = useState<UserPresence['status']>('online');
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  useEffect(() => {
    // Auto-detect user activity and set status
    let activityTimeout: NodeJS.Timeout;
    let isUserActive = true;

    const resetActivityTimer = () => {
      clearTimeout(activityTimeout);
      
      if (!isUserActive) {
        isUserActive = true;
        updateStatus('online');
      }

      activityTimeout = setTimeout(() => {
        isUserActive = false;
        updateStatus('away');
      }, 5 * 60 * 1000); // 5 minutes inactive = away
    };

    const updateStatus = (status: UserPresence['status']) => {
      setCurrentStatus(status);
      professionalChatService.updateUserPresence(currentUserId, status, 'desktop');
      onStatusChange?.(status);
    };

    // Listen for user activity
    const activities = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    activities.forEach(activity => {
      document.addEventListener(activity, resetActivityTimer, true);
    });

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateStatus('away');
      } else {
        updateStatus('online');
        resetActivityTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initialize
    updateStatus('online');
    resetActivityTimer();

    return () => {
      clearTimeout(activityTimeout);
      activities.forEach(activity => {
        document.removeEventListener(activity, resetActivityTimer, true);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Set offline when component unmounts
      updateStatus('offline');
    };
  }, [currentUserId, onStatusChange]);

  const statusOptions = [
    { status: 'online' as const, label: '🟢 Online', description: 'Available for messages' },
    { status: 'away' as const, label: '🟡 Away', description: 'Will respond later' },
    { status: 'offline' as const, label: '⚫ Offline', description: 'Not available' }
  ];

  const handleStatusChange = (status: UserPresence['status']) => {
    setCurrentStatus(status);
    professionalChatService.updateUserPresence(currentUserId, status, 'desktop');
    onStatusChange?.(status);
    setShowStatusMenu(false);

    // Play status change sound
    if (status === 'online') {
      professionalChatService.playChatEffect('user_online');
    }
  };

  return (
    <div className=\"relative\">
      {/* Status Button */}
      <button
        onClick={() => setShowStatusMenu(!showStatusMenu)}
        className=\"flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors\"
      >
        <UserStatusIndicator
          userId={currentUserId}
          userName={currentUserName}
          showText={true}
          showDeviceIcon={true}
        />
        <span className=\"text-xs text-gray-500\">▼</span>
      </button>

      {/* Status Menu */}
      {showStatusMenu && (
        <div className=\"absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px]\">
          <div className=\"p-2\">
            <div className=\"text-sm font-medium text-gray-700 mb-2\">Set your status</div>
            {statusOptions.map(option => (
              <button
                key={option.status}
                onClick={() => handleStatusChange(option.status)}
                className={`w-full text-left p-2 rounded-md hover:bg-gray-50 transition-colors ${
                  currentStatus === option.status ? 'bg-blue-50 border border-blue-200' : ''
                }`}
              >
                <div className=\"font-medium text-sm\">{option.label}</div>
                <div className=\"text-xs text-gray-500\">{option.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Online Users List Component
 */
interface OnlineUsersListProps {
  userIds: string[];
  title?: string;
  maxVisible?: number;
}

export const OnlineUsersList: React.FC<OnlineUsersListProps> = ({
  userIds,
  title = 'Online Users',
  maxVisible = 5
}) => {
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);

  useEffect(() => {
    const updateOnlineUsers = () => {
      const users = userIds
        .map(id => professionalChatService.getUserPresence(id))
        .filter((presence): presence is UserPresence => presence !== null && presence.status === 'online');
      setOnlineUsers(users);
    };

    // Listen for presence updates
    const handlePresenceUpdate = () => updateOnlineUsers();
    window.addEventListener('userPresenceUpdate', handlePresenceUpdate as EventListener);
    
    updateOnlineUsers();

    return () => {
      window.removeEventListener('userPresenceUpdate', handlePresenceUpdate as EventListener);
    };
  }, [userIds]);

  if (onlineUsers.length === 0) return null;

  const visibleUsers = onlineUsers.slice(0, maxVisible);
  const hiddenCount = Math.max(0, onlineUsers.length - maxVisible);

  return (
    <div className=\"bg-green-50 border border-green-200 rounded-lg p-3\">
      <div className=\"text-sm font-medium text-green-800 mb-2\">{title} ({onlineUsers.length})</div>
      <div className=\"space-y-1\">
        {visibleUsers.map(user => (
          <UserStatusIndicator
            key={user.userId}
            userId={user.userId}
            showText={true}
            showDeviceIcon={true}
            size=\"sm\"
          />
        ))}
        {hiddenCount > 0 && (
          <div className=\"text-xs text-green-600\">
            +{hiddenCount} more online
          </div>
        )}
      </div>
    </div>
  );
};

export default UserStatusIndicator;