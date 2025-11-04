import React, { useEffect, useState } from 'react';
import { MessageSquare, Users, Calendar, Search, Trash2, Clock, Archive } from 'lucide-react';

interface ChatMessage {
  $id: string;
  senderId: string;
  senderName: string;
  senderType: 'customer' | 'therapist' | 'place';
  recipientId: string;
  recipientName: string;
  recipientType: 'customer' | 'therapist' | 'place';
  message: string;
  timestamp: string;
  bookingId?: string;
  keepForever?: boolean; // New field to prevent auto-deletion
  createdAt: string; // Creation date for auto-delete calculation
}

const AdminChatMessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'customer' | 'therapist' | 'place'>('all');

  useEffect(() => {
    fetchMessages();
    // Run auto-delete check on mount and every hour
    checkAutoDelete();
    const interval = setInterval(checkAutoDelete, 60 * 60 * 1000); // Every hour
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual chat message fetching from Appwrite
      // This is a placeholder - you'll need to create a chat collection in Appwrite
      console.log('Fetching chat messages...');
      
      // Placeholder data for demonstration
      const placeholderMessages: ChatMessage[] = [];
      setMessages(placeholderMessages);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-delete messages older than 1 month (unless marked keepForever)
  const checkAutoDelete = async () => {
    try {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const messagesToDelete = messages.filter(msg => {
        const messageDate = new Date(msg.createdAt || msg.timestamp);
        return !msg.keepForever && messageDate < oneMonthAgo;
      });

      if (messagesToDelete.length > 0) {
        console.log(`Auto-deleting ${messagesToDelete.length} messages older than 1 month`);
        // TODO: Implement actual deletion in Appwrite
        // await Promise.all(messagesToDelete.map(msg => chatService.delete(msg.$id)));
        
        // Remove from local state
        setMessages(prev => prev.filter(msg => !messagesToDelete.includes(msg)));
      }
    } catch (error) {
      console.error('Error during auto-delete:', error);
    }
  };

  // Toggle keep forever status
  const toggleKeepForever = async (messageId: string) => {
    try {
      const message = messages.find(m => m.$id === messageId);
      if (!message) return;

      const updatedKeepStatus = !message.keepForever;
      
      // TODO: Update in Appwrite
      // await chatService.update(messageId, { keepForever: updatedKeepStatus });

      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.$id === messageId 
          ? { ...msg, keepForever: updatedKeepStatus }
          : msg
      ));

      alert(updatedKeepStatus 
        ? 'Message will be kept permanently' 
        : 'Message will be auto-deleted after 1 month'
      );
    } catch (error) {
      console.error('Error toggling keep forever:', error);
      alert('Failed to update message status');
    }
  };

  // Calculate days until auto-delete
  const getDaysUntilDelete = (message: ChatMessage): number | null => {
    if (message.keepForever) return null;
    
    const messageDate = new Date(message.createdAt || message.timestamp);
    const deleteDate = new Date(messageDate);
    deleteDate.setMonth(deleteDate.getMonth() + 1);
    
    const now = new Date();
    const daysLeft = Math.ceil((deleteDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysLeft;
  };

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = searchTerm === '' || 
      msg.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
      msg.senderType === filterType || 
      msg.recipientType === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'customer':
        return 'bg-blue-100 text-blue-700';
      case 'therapist':
        return 'bg-green-100 text-green-700';
      case 'place':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-3 rounded-lg">
            <MessageSquare className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Chat Messages</h2>
            <p className="text-sm text-gray-600">Monitor all user conversations</p>
          </div>
        </div>
        <button
          onClick={fetchMessages}
          className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages, users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
          >
            <option value="all">All Types</option>
            <option value="customer">Customers</option>
            <option value="therapist">Therapists</option>
            <option value="place">Places</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-600">Total Messages</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{messages.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-gray-600">Customers</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {messages.filter(m => m.senderType === 'customer' || m.recipientType === 'customer').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-green-500" />
            <span className="text-xs text-gray-600">Therapists</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {messages.filter(m => m.senderType === 'therapist' || m.recipientType === 'therapist').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-gray-600">Today</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {messages.filter(m => {
              const today = new Date().toDateString();
              return new Date(m.timestamp).toDateString() === today;
            }).length}
          </p>
        </div>
      </div>

      {/* Messages List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No chat messages found</p>
          <p className="text-sm text-gray-400 mt-1">
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your filters' 
              : 'Messages will appear here when users start chatting'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMessages.map((msg) => {
            const daysLeft = getDaysUntilDelete(msg);
            return (
            <div
              key={msg.$id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col gap-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 truncate">{msg.senderName}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(msg.senderType)}`}>
                        {msg.senderType}
                      </span>
                      <span className="text-gray-400 text-sm">→</span>
                      <span className="font-semibold text-gray-900 truncate">{msg.recipientName}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(msg.recipientType)}`}>
                        {msg.recipientType}
                      </span>
                    </div>
                    {/* Date and Time */}
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimestamp(msg.timestamp)}</span>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700">{msg.message}</p>
                </div>

                {/* Footer with auto-delete info and controls */}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    {/* Booking Reference */}
                    {msg.bookingId && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>Booking: {msg.bookingId}</span>
                      </div>
                    )}
                    
                    {/* Auto-delete status */}
                    {msg.keepForever ? (
                      <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                        <Archive className="w-3 h-3" />
                        Kept permanently
                      </span>
                    ) : daysLeft !== null && (
                      <span className={`flex items-center gap-1 text-xs font-medium ${
                        daysLeft <= 7 ? 'text-red-600' : 'text-orange-600'
                      }`}>
                        <Trash2 className="w-3 h-3" />
                        Auto-delete in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Keep/Allow Delete Toggle */}
                  <button
                    onClick={() => toggleKeepForever(msg.$id)}
                    className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                      msg.keepForever
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {msg.keepForever ? 'Allow Auto-Delete' : 'Keep Forever'}
                  </button>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      )}

      {/* Info Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Chat Monitoring & Auto-Delete</h4>
            <p className="text-sm text-blue-700 mb-2">
              This page displays all chat conversations between customers, therapists, and massage places. 
              You can monitor message content, track conversation patterns, and ensure compliance with platform policies.
            </p>
            <div className="space-y-1 text-xs text-blue-600">
              <p>
                <strong>🗑️ Auto-Delete:</strong> Messages are automatically deleted after 1 month to maintain system efficiency.
              </p>
              <p>
                <strong>📌 Keep Forever:</strong> Click "Keep Forever" to prevent important messages from being auto-deleted.
              </p>
              <p>
                <strong>⏰ Delete Countdown:</strong> Each message shows how many days remain before auto-deletion.
              </p>
              <p>
                <strong>🔒 Privacy:</strong> Chat messages are stored securely and only accessible to administrators for moderation purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChatMessagesPage;
