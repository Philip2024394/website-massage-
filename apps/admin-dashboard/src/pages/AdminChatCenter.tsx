// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState, useEffect, useRef } from 'react';
import { 
    MessageSquare, Send, Search, Trash2, Archive, 
    ChevronDown, ChevronRight, User, Building, Sparkles,
    Clock, X, CheckCheck, Paperclip, Image as ImageIcon, FileText
} from 'lucide-react';
import { therapistService, placesService, messagingService } from '@shared/appwriteService';

interface Member {
    $id: string;
    name: string;
    email: string;
    category: 'therapist' | 'massage-place' | 'facial-place';
    status: string;
    unreadCount?: number;
    isOnline?: boolean;
    lastSeen?: Date;
    lastLogin?: Date;
}

interface Conversation {
    $id: string;
    memberId: string;
    memberName: string;
    memberCategory: string;
    lastMessage: string;
    lastMessageTime: Date;
    unreadCount: number;
    expiresAt: Date;
    memberIsOnline?: boolean;
    memberLastSeen?: Date;
}

interface Message {
    $id: string;
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: Date;
    read: boolean;
    readAt?: Date;
    senderName: string;
    deliveredAt?: Date;
}

const AdminChatCenter: React.FC = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [deletedConversations, setDeletedConversations] = useState<Conversation[]>([]);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
        'therapist': true,
        'massage-place': true,
        'facial-place': true
    });
    const [showDeleted, setShowDeleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const CONVERSATION_EXPIRY_WEEKS = 5;

    useEffect(() => {
        loadMembers();
        loadConversations();
    }, []);

    useEffect(() => {
        if (selectedMember) {
            loadMessages(selectedMember.$id);
            // Poll for new messages every 5 seconds
            const interval = setInterval(() => loadMessages(selectedMember.$id), 5000);
            return () => clearInterval(interval);
        }
    }, [selectedMember]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadMembers = async () => {
        try {
            const [therapists, massagePlaces, facialPlaces] = await Promise.all([
                therapistService.getAll(),
                placesService.getAll().then(places => places.filter(p => !p.isFacialPlace)),
                placesService.getAll().then(places => places.filter(p => p.isFacialPlace))
            ]);

            const allMembers: Member[] = [
                ...therapists.map(t => ({
                    $id: t.$id,
                    name: t.name,
                    email: t.email,
                    category: 'therapist' as const,
                    status: t.status
                })),
                ...massagePlaces.map(p => ({
                    $id: p.$id,
                    name: p.name,
                    email: p.email || '',
                    category: 'massage-place' as const,
                    status: p.status
                })),
                ...facialPlaces.map(p => ({
                    $id: p.$id,
                    name: p.name,
                    email: p.email || '',
                    category: 'facial-place' as const,
                    status: p.status
                }))
            ];

            setMembers(allMembers);
        } catch (error) {
            console.error('Error loading members:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadConversations = async () => {
        try {
            // Load conversations from messaging service
            // Filter conversations older than 5 weeks for deletion
            const fiveWeeksAgo = new Date();
            fiveWeeksAgo.setDate(fiveWeeksAgo.getDate() - (CONVERSATION_EXPIRY_WEEKS * 7));

            // TODO: Implement actual conversation loading from Appwrite
            // This is a placeholder structure
            setConversations([]);
            setDeletedConversations([]);
        } catch (error) {
            console.error('Error loading conversations:', error);
        }
    };

    const loadMessages = async (memberId: string) => {
        try {
            // Determine member role
            const member = members.find(m => m.$id === memberId);
            const memberRole = member?.category === 'therapist' ? 'therapist' : 'place';
            
            // Generate conversation ID using messagingService (same format as TherapistChat)
            const conversationId = messagingService.generateConversationId(
                { id: 'admin', role: 'admin' },
                { id: memberId, role: memberRole }
            );
            
            // Fetch messages from Appwrite
            const dbMessages = await messagingService.getConversation(conversationId);
            
            // Transform to admin chat format
            const formatted: Message[] = dbMessages.map((msg: any) => ({
                $id: msg.$id || Date.now().toString(),
                senderId: msg.senderId,
                receiverId: msg.recipientId || msg.receiverId, // Support both field names
                content: msg.content,
                timestamp: new Date(msg.createdAt || new Date()),
                read: msg.read || msg.isRead, // Support both field names
                senderName: msg.senderName,
                deliveredAt: new Date(msg.createdAt || new Date()),
                readAt: (msg.read || msg.isRead) ? new Date(msg.createdAt || new Date()) : undefined
            }));
            
            setMessages(formatted);
            
            // Mark unread messages as read
            for (const msg of dbMessages) {
                const isUnread = !(msg.read || msg.isRead);
                const isForAdmin = (msg.recipientId === 'admin' || msg.receiverId === 'admin');
                if (isUnread && isForAdmin) {
                    await messagingService.markAsRead(msg.$id);
                }
            }
            
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedMember) return;

        try {
            // Determine member role
            const memberRole = selectedMember.category === 'therapist' ? 'therapist' : 'place';
            
            // Generate conversation ID using messagingService (same format as TherapistChat)
            const conversationId = messagingService.generateConversationId(
                { id: 'admin', role: 'admin' },
                { id: selectedMember.$id, role: memberRole }
            );
            
            // Save message to Appwrite database (also creates notification)
            const savedMsg = await messagingService.sendMessage({
                conversationId,
                senderId: 'admin',
                senderType: 'user', // Use 'user' for admin
                senderName: 'Support Team',
                recipientId: selectedMember.$id,
                recipientType: memberRole,
                recipientName: selectedMember.name,
                content: newMessage.trim(),
            });

            // Add to local messages immediately
            const message: Message = {
                $id: savedMsg.$id || Date.now().toString(),
                senderId: 'admin',
                receiverId: selectedMember.$id,
                content: newMessage.trim(),
                timestamp: new Date(savedMsg.createdAt || new Date()),
                read: false,
                senderName: 'Support Team',
                deliveredAt: new Date()
            };

            setMessages(prev => [...prev, message]);
            setNewMessage('');
            
            console.log('✅ Admin message sent to database');
        } catch (error) {
            console.error('❌ Error sending message:', error);
            alert('Failed to send message. Please try again.');
        }
    };

    const _deleteConversation = (conversationId: string) => {
        const conv = conversations.find(c => c.$id === conversationId);
        if (conv) {
            setConversations(conversations.filter(c => c.$id !== conversationId));
            setDeletedConversations([...deletedConversations, conv]);
        }
    };

    const emptyDeletedFolder = () => {
        if (confirm('Are you sure you want to permanently delete all conversations in the deleted folder?')) {
            setDeletedConversations([]);
        }
    };

    const toggleCategory = (category: string) => {
        setExpandedCategories({
            ...expandedCategories,
            [category]: !expandedCategories[category]
        });
    };

    const getCategoryIcon = (category: string): React.ReactElement => {
        switch (category) {
            case 'therapist': return React.createElement(User, { className: "w-4 h-4" });
            case 'massage-place': return React.createElement(Building, { className: "w-4 h-4" });
            case 'facial-place': return React.createElement(Sparkles, { className: "w-4 h-4" });
            default: return React.createElement(User, { className: "w-4 h-4" });
        }
    };

    const getCategoryLabel = (category: string) => {
        switch (category) {
            case 'therapist': return 'Therapists';
            case 'massage-place': return 'Massage Places';
            case 'facial-place': return 'Facial Places';
            default: return category;
        }
    };

    const _getOnlineStatus = (member: Member | Conversation) => {
        if ('memberIsOnline' in member) {
            return member.memberIsOnline;
        }
        return member.isOnline || false;
    };

    const _getLastSeen = (member: Member | Conversation): Date | undefined => {
        if ('memberLastSeen' in member) {
            return member.memberLastSeen;
        }
        return member.lastSeen;
    };

    const formatLastSeen = (lastSeen?: Date): string => {
        if (!lastSeen) return 'Never';
        
        const now = new Date();
        const lastSeenDate = new Date(lastSeen);
        const diffMs = now.getTime() - lastSeenDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return lastSeenDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: now.getFullYear() !== lastSeenDate.getFullYear() ? 'numeric' : undefined
        });
    };

    const formatLastLogin = (lastLogin?: Date): string => {
        if (!lastLogin) return 'Never logged in';
        
        const loginDate = new Date(lastLogin);
        const now = new Date();
        const diffMs = now.getTime() - loginDate.getTime();
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffDays === 0) {
            return `Today at ${loginDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
        } else if (diffDays === 1) {
            return `Yesterday at ${loginDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return loginDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: now.getFullYear() !== loginDate.getFullYear() ? 'numeric' : undefined 
            });
        }
    };

    const getMessageReadStatus = (message: Message): 'sent' | 'delivered' | 'read' => {
        if (message.read && message.readAt) return 'read';
        if (message.deliveredAt) return 'delivered';
        return 'sent';
    };

    const filteredMembers = members.filter(m => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const membersByCategory = {
        'therapist': filteredMembers.filter(m => m.category === 'therapist'),
        'massage-place': filteredMembers.filter(m => m.category === 'massage-place'),
        'facial-place': filteredMembers.filter(m => m.category === 'facial-place')
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 border-b px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <MessageSquare className="w-6 h-6 text-white" />
                        <div>
                            <h1 className="text-2xl font-bold text-white">Admin Chat Center</h1>
                            <p className="text-orange-100 text-sm">IndaStreet Communications</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowDeleted(!showDeleted)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                        >
                            <Archive className="w-4 h-4" />
                            Deleted ({deletedConversations.length})
                        </button>
                        {deletedConversations.length > 0 && (
                            <button
                                onClick={emptyDeletedFolder}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                Empty Deleted
                            </button>
                        )}
                    </div>
                </div>

                {/* Chat Content */}
                {selectedMember ? (
                    <div className="flex-1 flex flex-col">
                        {/* Selected Member Header */}
                        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="relative w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                    {getCategoryIcon(selectedMember.category)}
                                    {/* Online/Offline indicator */}
                                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                                        selectedMember.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                                    }`} title={selectedMember.isOnline ? 'Online' : 'Offline'}></div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="font-semibold text-gray-800">{selectedMember.name}</h2>
                                        {selectedMember.isOnline && (
                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                                Online
                                            </span>
                                        )}
                                        {!selectedMember.isOnline && (
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                                                Offline
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {getCategoryLabel(selectedMember.category)}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {selectedMember.isOnline 
                                            ? 'Active now' 
                                            : `Last seen: ${formatLastSeen(selectedMember.lastSeen)}`}
                                    </p>
                                    {selectedMember.lastLogin && (
                                        <p className="text-xs text-gray-400">
                                            Last login: {formatLastLogin(selectedMember.lastLogin)}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedMember(null)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.length === 0 ? (
                                <div className="text-center text-gray-500 mt-20">
                                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                    <p>No messages yet. Start a conversation!</p>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg.$id}
                                        className={`flex ${msg.senderId === 'admin' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-lg ${
                                                msg.senderId === 'admin'
                                                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                                                    : 'bg-white border border-gray-200'
                                            } rounded-2xl overflow-hidden`}
                                        >
                                            {msg.senderId === 'admin' && (
                                                <div className="px-4 pt-2 pb-1 border-b border-orange-400/30">
                                                    <p className="text-xs font-semibold text-orange-100">IndaStreet</p>
                                                </div>
                                            )}
                                            <div className="px-4 py-3">
                                                <p className="text-sm">{msg.content}</p>
                                            </div>
                                            <div className={`flex items-center justify-between gap-2 px-4 pb-2 text-xs ${
                                                msg.senderId === 'admin' ? 'text-orange-100' : 'text-gray-400'
                                            }`}>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {msg.timestamp.toLocaleTimeString()}
                                                </div>
                                                {msg.senderId === 'admin' && (
                                                    <div className="flex items-center gap-1">
                                                        {getMessageReadStatus(msg) === 'read' && msg.readAt && (
                                                            <div className="flex items-center gap-1" title={`Read at ${new Date(msg.readAt).toLocaleString()}`}>
                                                                <CheckCheck className="w-3 h-3 text-blue-300" />
                                                                <span className="text-xs">Seen</span>
                                                            </div>
                                                        )}
                                                        {getMessageReadStatus(msg) === 'delivered' && !msg.read && (
                                                            <div className="flex items-center gap-1" title="Delivered but not read yet">
                                                                <CheckCheck className="w-3 h-3 text-orange-200" />
                                                                <span className="text-xs">Delivered</span>
                                                            </div>
                                                        )}
                                                        {getMessageReadStatus(msg) === 'sent' && !msg.deliveredAt && !msg.read && (
                                                            <div className="flex items-center gap-1" title="Sent">
                                                                <span className="text-xs">Sent</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {msg.senderId !== 'admin' && !msg.read && (
                                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                                                        Unread
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="bg-white border-t p-4">
                            {/* Attachment Preview */}
                            {attachments.length > 0 && (
                                <div className="flex gap-2 mb-3 flex-wrap">
                                    {attachments.map((file, index) => (
                                        <div key={index} className="relative bg-orange-50 border border-orange-200 rounded-lg p-2 flex items-center gap-2">
                                            {file.type.startsWith('image/') ? (
                                                <ImageIcon className="w-4 h-4 text-orange-500" />
                                            ) : (
                                                <FileText className="w-4 h-4 text-orange-500" />
                                            )}
                                            <span className="text-sm text-gray-700 max-w-[150px] truncate">{file.name}</span>
                                            <button
                                                onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                                                className="ml-2 text-gray-400 hover:text-red-500"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex gap-3">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            setAttachments([...attachments, ...Array.from(e.target.files)]);
                                        }
                                    }}
                                    multiple
                                    accept="image/*,.pdf,.doc,.docx,.txt"
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
                                    title="Attach files or photos"
                                >
                                    <Paperclip className="w-4 h-4" />
                                </button>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                                    placeholder="Type your message..."
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!newMessage.trim() && attachments.length === 0}
                                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:bg-gray-300 text-white rounded-lg transition-colors flex items-center gap-2 font-semibold"
                                >
                                    <Send className="w-4 h-4" />
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                            <MessageSquare className="w-24 h-24 mx-auto mb-6 text-gray-300" />
                            <h2 className="text-2xl font-semibold mb-2">Select a member to chat</h2>
                            <p>Choose a member from the right sidebar to start messaging</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Sidebar - Members by Category */}
            <div className="w-96 bg-white border-l flex flex-col">
                {/* Search */}
                <div className="p-4 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search members..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Members List */}
                <div className="flex-1 overflow-y-auto">
                    {Object.entries(membersByCategory).map(([category, categoryMembers]) => (
                        <div key={category} className="border-b">
                            {/* Category Header */}
                            <button
                                onClick={() => toggleCategory(category)}
                                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    {getCategoryIcon(category)}
                                    <span className="font-semibold text-gray-700">
                                        {getCategoryLabel(category)}
                                    </span>
                                    <span className="text-sm text-gray-400">
                                        ({categoryMembers.length})
                                    </span>
                                </div>
                                {expandedCategories[category] ? (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                )}
                            </button>

                            {/* Category Members */}
                            {expandedCategories[category] && (
                                <div className="bg-gray-50">
                                    {categoryMembers.length === 0 ? (
                                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                            No members found
                                        </div>
                                    ) : (
                                        categoryMembers.map((member) => (
                                            <button
                                                key={member.$id}
                                                onClick={() => setSelectedMember(member)}
                                                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-100 transition-colors ${
                                                    selectedMember?.$id === member.$id ? 'bg-orange-50 border-l-4 border-orange-500' : ''
                                                }`}
                                            >
                                                <div className="relative w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                                                    {getCategoryIcon(member.category)}
                                                    {/* Online/Offline indicator */}
                                                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                                                        member.isOnline ? 'bg-green-500' : 'bg-gray-400'
                                                    }`} title={member.isOnline ? 'Online' : 'Offline'}></div>
                                                </div>
                                                <div className="flex-1 text-left min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-gray-800 truncate">
                                                            {member.name}
                                                        </p>
                                                        {member.isOnline && (
                                                            <span className="text-xs text-green-600 font-semibold">●</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {member.isOnline ? 'Online now' : `Last seen: ${formatLastSeen(member.lastSeen)}`}
                                                    </p>
                                                    {member.lastLogin && (
                                                        <p className="text-xs text-gray-400 truncate">
                                                            Last login: {formatLastLogin(member.lastLogin)}
                                                        </p>
                                                    )}
                                                </div>
                                                {member.unreadCount && member.unreadCount > 0 && (
                                                    <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                        {member.unreadCount}
                                                    </div>
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Deleted Conversations Modal */}
            {showDeleted && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                        <div className="px-6 py-4 border-b flex items-center justify-between">
                            <h2 className="text-xl font-bold">Deleted Conversations</h2>
                            <button
                                onClick={() => setShowDeleted(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            {deletedConversations.length === 0 ? (
                                <div className="text-center text-gray-500 py-12">
                                    <Archive className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                    <p>No deleted conversations</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {deletedConversations.map((conv) => (
                                        <div
                                            key={conv.$id}
                                            className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-gray-800">{conv.memberName}</p>
                                                    <p className="text-sm text-gray-500">{conv.memberCategory}</p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        Expires: {conv.expiresAt.toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminChatCenter;
