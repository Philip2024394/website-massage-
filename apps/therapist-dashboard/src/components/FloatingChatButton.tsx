// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

interface FloatingChatButtonProps {
  onNavigate: (page: string) => void;
  therapistId: string;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ onNavigate, therapistId }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Safety check - if no therapistId, don't try to load/save
    if (!therapistId || therapistId === 'default') {
      return;
    }

    // Load unread count from localStorage
    const loadUnreadCount = () => {
      const storageKey = `chat_unread_${therapistId}`;
      const count = parseInt(localStorage.getItem(storageKey) || '0');
      setUnreadCount(count);
    };

    loadUnreadCount();

    // Listen for storage changes (when new messages arrive)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `chat_unread_${therapistId}`) {
        setUnreadCount(parseInt(e.newValue || '0'));
      }
    };

    // Listen for custom event when new message arrives
    const handleNewMessage = (e: CustomEvent) => {
      if (e.detail.therapistId === therapistId) {
        const newCount = unreadCount + 1;
        setUnreadCount(newCount);
        localStorage.setItem(`chat_unread_${therapistId}`, String(newCount));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('newChatMessage', handleNewMessage as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('newChatMessage', handleNewMessage as EventListener);
    };
  }, [therapistId, unreadCount]);

  const handleClick = () => {
    // Clear unread count when opening chat (only if valid therapistId)
    if (therapistId && therapistId !== 'default') {
      setUnreadCount(0);
      localStorage.setItem(`chat_unread_${therapistId}`, '0');
    }
    onNavigate('chat');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center z-50"
      title="Open Support Chat"
    >
      <MessageCircle className="w-6 h-6" />
      
      {/* Notification Badge */}
      {unreadCount > 0 && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 shadow-lg border-2 border-white animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </div>
      )}
    </button>
  );
};

export default FloatingChatButton;
