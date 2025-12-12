import React, { useState, useEffect } from 'react';
import { databases, DATABASE_ID } from '../lib/appwrite';
import { Query } from 'appwrite';

interface MemberHealthStatus {
    memberId: string;
    memberName: string;
    memberType: 'therapist' | 'place' | 'hotel' | 'villa';
    lastSeen: string;
    notificationStatus: {
        isEnabled: boolean;
        lastTestSent: string;
        lastTestReceived: string;
        soundEnabled: boolean;
        browserSupport: boolean;
    };
    bookingStatus: {
        totalBookings: number;
        bookNowBookings: number;
        scheduledBookings: number;
        lastBookingReceived: string;
        missedBookings: number;
    };
    chatStatus: {
        isOnline: boolean;
        lastMessageSent: string;
        lastMessageReceived: string;
        unreadMessages: number;
    };
    systemHealth: {
        browserVersion: string;
        deviceType: string;
        connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
        lastHealthCheck: string;
    };
    overallStatus: 'healthy' | 'warning' | 'critical' | 'offline';
}

export default function SystemHealthMonitor() {
    const [members, setMembers] = useState<MemberHealthStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'healthy' | 'warning' | 'critical' | 'offline'>('all');
    const [selectedMember, setSelectedMember] = useState<MemberHealthStatus | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        loadMemberHealthStatus();
        
        if (autoRefresh) {
            const interval = setInterval(loadMemberHealthStatus, 30000); // Refresh every 30 seconds
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    const loadMemberHealthStatus = async () => {
        try {
            setLoading(true);
            
            // Get all active members from different collections
            const [therapists, places, hotels] = await Promise.all([
                databases.listDocuments(DATABASE_ID, 'therapists', [Query.equal('isActive', true)]),
                databases.listDocuments(DATABASE_ID, 'places', [Query.equal('isActive', true)]),
                databases.listDocuments(DATABASE_ID, 'hotels', [Query.equal('isActive', true)])
            ]);

            const healthStatuses: MemberHealthStatus[] = [];

            // Process therapists
            for (const therapist of therapists.documents) {
                const status = await getMemberHealthStatus(therapist.$id, 'therapist', therapist.name);
                healthStatuses.push(status);
            }

            // Process places
            for (const place of places.documents) {
                const status = await getMemberHealthStatus(place.$id, 'place', place.name);
                healthStatuses.push(status);
            }

            // Process hotels
            for (const hotel of hotels.documents) {
                const status = await getMemberHealthStatus(hotel.$id, 'hotel', hotel.name);
                healthStatuses.push(status);
            }

            setMembers(healthStatuses);
        } catch (error) {
            console.error('Error loading member health status:', error);
        } finally {
            setLoading(false);
        }
    };

    const getMemberHealthStatus = async (
        memberId: string,
        memberType: 'therapist' | 'place' | 'hotel' | 'villa',
        memberName: string
    ): Promise<MemberHealthStatus> => {
        try {
            // Get notification logs
            const notificationLogs = await databases.listDocuments(
                DATABASE_ID,
                'notification_logs',
                [
                    Query.equal('recipientId', memberId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(10)
                ]
            );

            // Get booking logs
            const bookings = await databases.listDocuments(
                DATABASE_ID,
                'bookings',
                [
                    Query.equal('providerId', memberId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(50)
                ]
            );

            // Get chat messages
            const chatMessages = await databases.listDocuments(
                DATABASE_ID,
                'messages',
                [
                    Query.equal('receiverId', memberId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(20)
                ]
            );

            // Get system health checks
            const healthChecks = await databases.listDocuments(
                DATABASE_ID,
                'system_health_checks',
                [
                    Query.equal('memberId', memberId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(1)
                ]
            );

            const latestHealthCheck = healthChecks.documents[0];

            // Calculate notification status
            const lastNotification = notificationLogs.documents[0];
            const notificationStatus = {
                isEnabled: latestHealthCheck?.notificationsEnabled || false,
                lastTestSent: lastNotification?.$createdAt || 'Never',
                lastTestReceived: lastNotification?.receivedAt || 'Never',
                soundEnabled: latestHealthCheck?.soundEnabled || false,
                browserSupport: latestHealthCheck?.browserSupport || false
            };

            // Calculate booking status
            const bookNowBookings = bookings.documents.filter(b => b.mode === 'immediate').length;
            const scheduledBookings = bookings.documents.filter(b => b.mode === 'scheduled').length;
            const missedBookings = bookings.documents.filter(b => 
                !b.providerAcknowledged && 
                new Date(b.$createdAt).getTime() < Date.now() - 5 * 60 * 1000 // 5 minutes old
            ).length;

            const bookingStatus = {
                totalBookings: bookings.documents.length,
                bookNowBookings,
                scheduledBookings,
                lastBookingReceived: bookings.documents[0]?.$createdAt || 'Never',
                missedBookings
            };

            // Calculate chat status
            const unreadMessages = chatMessages.documents.filter(m => !m.isRead).length;
            const chatStatus = {
                isOnline: latestHealthCheck?.isOnline || false,
                lastMessageSent: latestHealthCheck?.lastMessageSent || 'Never',
                lastMessageReceived: chatMessages.documents[0]?.$createdAt || 'Never',
                unreadMessages
            };

            // Calculate system health
            const systemHealth = {
                browserVersion: latestHealthCheck?.browserVersion || 'Unknown',
                deviceType: latestHealthCheck?.deviceType || 'Unknown',
                connectionQuality: latestHealthCheck?.connectionQuality || 'unknown' as any,
                lastHealthCheck: latestHealthCheck?.$createdAt || 'Never'
            };

            // Determine overall status
            let overallStatus: 'healthy' | 'warning' | 'critical' | 'offline' = 'healthy';
            
            if (!latestHealthCheck || 
                new Date(latestHealthCheck.$createdAt).getTime() < Date.now() - 10 * 60 * 1000) {
                overallStatus = 'offline';
            } else if (missedBookings > 3 || !notificationStatus.isEnabled || !notificationStatus.soundEnabled) {
                overallStatus = 'critical';
            } else if (missedBookings > 0 || unreadMessages > 10 || systemHealth.connectionQuality === 'poor') {
                overallStatus = 'warning';
            }

            return {
                memberId,
                memberName,
                memberType,
                lastSeen: latestHealthCheck?.$createdAt || 'Never',
                notificationStatus,
                bookingStatus,
                chatStatus,
                systemHealth,
                overallStatus
            };
        } catch (error) {
            console.error(`Error getting health status for ${memberId}:`, error);
            return {
                memberId,
                memberName,
                memberType,
                lastSeen: 'Error',
                notificationStatus: {
                    isEnabled: false,
                    lastTestSent: 'Error',
                    lastTestReceived: 'Error',
                    soundEnabled: false,
                    browserSupport: false
                },
                bookingStatus: {
                    totalBookings: 0,
                    bookNowBookings: 0,
                    scheduledBookings: 0,
                    lastBookingReceived: 'Error',
                    missedBookings: 0
                },
                chatStatus: {
                    isOnline: false,
                    lastMessageSent: 'Error',
                    lastMessageReceived: 'Error',
                    unreadMessages: 0
                },
                systemHealth: {
                    browserVersion: 'Unknown',
                    deviceType: 'Unknown',
                    connectionQuality: 'offline',
                    lastHealthCheck: 'Error'
                },
                overallStatus: 'offline'
            };
        }
    };

    const sendTestNotification = async (memberId: string) => {
        try {
            await databases.createDocument(
                DATABASE_ID,
                'notifications',
                'unique()',
                {
                    recipientId: memberId,
                    type: 'test',
                    title: '🔔 System Test',
                    message: 'This is a test notification from admin. If you received this with sound, your system is working correctly!',
                    priority: 'high',
                    requiresSound: true,
                    createdAt: new Date().toISOString()
                }
            );
            alert('Test notification sent! Check if member receives it with sound.');
        } catch (error) {
            console.error('Error sending test notification:', error);
            alert('Failed to send test notification');
        }
    };

    const sendTestBooking = async (memberId: string, mode: 'immediate' | 'scheduled') => {
        try {
            await databases.createDocument(
                DATABASE_ID,
                'bookings',
                'unique()',
                {
                    providerId: memberId,
                    customerName: 'Admin Test',
                    customerWhatsApp: '000000000',
                    mode,
                    duration: 60,
                    scheduledTime: mode === 'scheduled' ? new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() : null,
                    status: 'pending',
                    isTest: true,
                    createdAt: new Date().toISOString()
                }
            );
            alert(`Test ${mode} booking sent! Check if member receives notification.`);
        } catch (error) {
            console.error('Error sending test booking:', error);
            alert('Failed to send test booking');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'bg-green-100 text-green-800 border-green-300';
            case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'critical': return 'bg-red-100 text-red-800 border-red-300';
            case 'offline': return 'bg-gray-100 text-gray-800 border-gray-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy': return '✅';
            case 'warning': return '⚠️';
            case 'critical': return '🚨';
            case 'offline': return '⚫';
            default: return '❓';
        }
    };

    const filteredMembers = members.filter(m => filter === 'all' || m.overallStatus === filter);

    const healthySummary = {
        total: members.length,
        healthy: members.filter(m => m.overallStatus === 'healthy').length,
        warning: members.filter(m => m.overallStatus === 'warning').length,
        critical: members.filter(m => m.overallStatus === 'critical').length,
        offline: members.filter(m => m.overallStatus === 'offline').length
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">🏥 System Health Monitor</h1>
                    <p className="text-gray-600">Real-time monitoring of member notifications, bookings, and system status</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                        <div className="text-sm text-gray-600">Total Members</div>
                        <div className="text-2xl font-bold text-gray-900">{healthySummary.total}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500 cursor-pointer hover:bg-green-50"
                         onClick={() => setFilter('healthy')}>
                        <div className="text-sm text-gray-600">✅ Healthy</div>
                        <div className="text-2xl font-bold text-green-600">{healthySummary.healthy}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500 cursor-pointer hover:bg-yellow-50"
                         onClick={() => setFilter('warning')}>
                        <div className="text-sm text-gray-600">⚠️ Warning</div>
                        <div className="text-2xl font-bold text-yellow-600">{healthySummary.warning}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500 cursor-pointer hover:bg-red-50"
                         onClick={() => setFilter('critical')}>
                        <div className="text-sm text-gray-600">🚨 Critical</div>
                        <div className="text-2xl font-bold text-red-600">{healthySummary.critical}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-500 cursor-pointer hover:bg-gray-50"
                         onClick={() => setFilter('offline')}>
                        <div className="text-sm text-gray-600">⚫ Offline</div>
                        <div className="text-2xl font-bold text-gray-600">{healthySummary.offline}</div>
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-white rounded-lg shadow p-4 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={loadMemberHealthStatus}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? '🔄 Loading...' : '🔄 Refresh'}
                        </button>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={autoRefresh}
                                onChange={(e) => setAutoRefresh(e.target.checked)}
                                className="w-4 h-4"
                            />
                            <span className="text-sm text-gray-700">Auto-refresh (30s)</span>
                        </label>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Filter:</span>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as any)}
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="all">All Members</option>
                            <option value="healthy">Healthy Only</option>
                            <option value="warning">Warning Only</option>
                            <option value="critical">Critical Only</option>
                            <option value="offline">Offline Only</option>
                        </select>
                    </div>
                </div>

                {/* Members List */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notifications</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chat</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Seen</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredMembers.map((member) => (
                                <tr key={member.memberId} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(member.overallStatus)}`}>
                                            {getStatusIcon(member.overallStatus)} {member.overallStatus.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{member.memberName}</div>
                                        <div className="text-sm text-gray-500">{member.memberType}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            {member.notificationStatus.isEnabled ? '✅ Enabled' : '❌ Disabled'}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Sound: {member.notificationStatus.soundEnabled ? '🔊 On' : '🔇 Off'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">Total: {member.bookingStatus.totalBookings}</div>
                                        <div className="text-sm text-gray-500">
                                            Missed: {member.bookingStatus.missedBookings > 0 ? (
                                                <span className="text-red-600 font-bold">⚠️ {member.bookingStatus.missedBookings}</span>
                                            ) : '0'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            {member.chatStatus.isOnline ? '🟢 Online' : '⚫ Offline'}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Unread: {member.chatStatus.unreadMessages}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(member.lastSeen).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm space-y-1">
                                        <button
                                            onClick={() => sendTestNotification(member.memberId)}
                                            className="block w-full px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                                        >
                                            🔔 Test Notification
                                        </button>
                                        <button
                                            onClick={() => sendTestBooking(member.memberId, 'immediate')}
                                            className="block w-full px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                                        >
                                            📱 Test Book Now
                                        </button>
                                        <button
                                            onClick={() => sendTestBooking(member.memberId, 'scheduled')}
                                            className="block w-full px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-xs"
                                        >
                                            📅 Test Schedule
                                        </button>
                                        <button
                                            onClick={() => setSelectedMember(member)}
                                            className="block w-full px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs"
                                        >
                                            📊 Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Detail Modal */}
                {selectedMember && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-2xl font-bold text-gray-900">{selectedMember.memberName} - System Details</h2>
                                <button
                                    onClick={() => setSelectedMember(null)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Notification Details */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-bold text-lg mb-3">🔔 Notification System</h3>
                                    <div className="space-y-2 text-sm">
                                        <div><strong>Enabled:</strong> {selectedMember.notificationStatus.isEnabled ? '✅ Yes' : '❌ No'}</div>
                                        <div><strong>Sound:</strong> {selectedMember.notificationStatus.soundEnabled ? '🔊 Enabled' : '🔇 Disabled'}</div>
                                        <div><strong>Browser Support:</strong> {selectedMember.notificationStatus.browserSupport ? '✅ Yes' : '❌ No'}</div>
                                        <div><strong>Last Test Sent:</strong> {selectedMember.notificationStatus.lastTestSent}</div>
                                        <div><strong>Last Test Received:</strong> {selectedMember.notificationStatus.lastTestReceived}</div>
                                    </div>
                                </div>

                                {/* Booking Details */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-bold text-lg mb-3">📱 Booking System</h3>
                                    <div className="space-y-2 text-sm">
                                        <div><strong>Total Bookings:</strong> {selectedMember.bookingStatus.totalBookings}</div>
                                        <div><strong>Book Now:</strong> {selectedMember.bookingStatus.bookNowBookings}</div>
                                        <div><strong>Scheduled:</strong> {selectedMember.bookingStatus.scheduledBookings}</div>
                                        <div><strong>Missed Bookings:</strong> <span className={selectedMember.bookingStatus.missedBookings > 0 ? 'text-red-600 font-bold' : ''}>{selectedMember.bookingStatus.missedBookings}</span></div>
                                        <div><strong>Last Booking:</strong> {selectedMember.bookingStatus.lastBookingReceived}</div>
                                    </div>
                                </div>

                                {/* Chat Details */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-bold text-lg mb-3">💬 Chat System</h3>
                                    <div className="space-y-2 text-sm">
                                        <div><strong>Status:</strong> {selectedMember.chatStatus.isOnline ? '🟢 Online' : '⚫ Offline'}</div>
                                        <div><strong>Unread Messages:</strong> {selectedMember.chatStatus.unreadMessages}</div>
                                        <div><strong>Last Message Sent:</strong> {selectedMember.chatStatus.lastMessageSent}</div>
                                        <div><strong>Last Message Received:</strong> {selectedMember.chatStatus.lastMessageReceived}</div>
                                    </div>
                                </div>

                                {/* System Health Details */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-bold text-lg mb-3">🖥️ System Health</h3>
                                    <div className="space-y-2 text-sm">
                                        <div><strong>Browser:</strong> {selectedMember.systemHealth.browserVersion}</div>
                                        <div><strong>Device:</strong> {selectedMember.systemHealth.deviceType}</div>
                                        <div><strong>Connection:</strong> {selectedMember.systemHealth.connectionQuality}</div>
                                        <div><strong>Last Health Check:</strong> {selectedMember.systemHealth.lastHealthCheck}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
