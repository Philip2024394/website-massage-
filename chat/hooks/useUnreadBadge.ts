/**
 * Unread Message Badge Hook
 * Tracks unread messages across all chat rooms
 * Facebook Messenger style badge counter
 */

import { useState, useEffect } from 'react';
import { useChatContext } from '../../context/ChatProvider';

interface UnreadBadgeData {
  totalUnread: number;
  unreadByRoom: Record<string, number>;
  hasUnread: boolean;
}

export function useUnreadBadge(): UnreadBadgeData {
  const { activeChatRooms } = useChatContext();
  const [unreadData, setUnreadData] = useState<UnreadBadgeData>({
    totalUnread: 0,
    unreadByRoom: {},
    hasUnread: false
  });

  useEffect(() => {
    const unreadByRoom: Record<string, number> = {};
    let totalUnread = 0;

    activeChatRooms.forEach(room => {
      const count = room.unreadCount || 0;
      unreadByRoom[room.$id] = count;
      totalUnread += count;
    });

    setUnreadData({
      totalUnread,
      unreadByRoom,
      hasUnread: totalUnread > 0
    });
  }, [activeChatRooms]);

  return unreadData;
}
