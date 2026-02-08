// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
/**
 * 🔗 INTEGRATION STATUS PAGE
 * 
 * Visual dashboard showing the connection status between:
 * - Main app (customer bookings) 
 * - Therapist dashboard (notifications)
 * - Chat system (communication)
 * 
 * Usage: Add to main app for diagnostics and monitoring
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Wifi, MessageCircle, Calendar, Activity } from 'lucide-react';
import { logger } from '../utils/logger';

interface IntegrationStatus {
    mainApp: 'connected' | 'disconnected' | 'error';
    dashboard: 'connected' | 'disconnected' | 'error'; 
    chat: 'connected' | 'disconnected' | 'error';
    realtime: 'active' | 'inactive' | 'error';
    bookingCount: number;
    lastBooking?: string;
}

const IntegrationStatusPage: React.FC<{
    therapistId?: string;
    onClose?: () => void;
}> = ({ therapistId = 'all-therapists', onClose }) => {
    const [status, setStatus] = useState<IntegrationStatus>({
        mainApp: 'disconnected',
        dashboard: 'disconnected', 
        chat: 'disconnected',
        realtime: 'inactive',
        bookingCount: 0
    });
    
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    
    // Check integration status
    const checkIntegrationStatus = async () => {
        setLoading(true);
        
        try {
            logger.debug('🔍 Checking integration status for:', therapistId);
            
            // Import integration service
            const { bookingFlowIntegration } = await import('../lib/services/bookingFlowIntegration.service');
            
            // Check health status
            const health = await bookingFlowIntegration.verifyIntegrationHealth(therapistId !== 'all-therapists' ? therapistId : undefined);
            
            setStatus({
                mainApp: health.mainAppStatus,
                dashboard: health.dashboardStatus,
                chat: health.chatStatus,
                realtime: health.realtimeStatus,
                bookingCount: health.totalBookingsToday,
                lastBooking: health.lastBookingTime
            });
            
            setLastUpdate(new Date());
            logger.info('✅ Integration status updated:', health);
            
        } catch (error) {
            logger.error('❌ Failed to check integration status:', error);
            
            setStatus({
                mainApp: 'error',
                dashboard: 'error',
                chat: 'error',
                realtime: 'error',
                bookingCount: 0
            });
        }
        
        setLoading(false);
    };
    
    // Auto-refresh status every 30 seconds
    useEffect(() => {
        checkIntegrationStatus();
        
        const interval = setInterval(() => {
            checkIntegrationStatus();
        }, 30000);
        
        return () => clearInterval(interval);
    }, [therapistId]);
    
    // Status indicator component
    const StatusIndicator: React.FC<{
        label: string;
        status: 'connected' | 'disconnected' | 'error' | 'active' | 'inactive';
        icon: React.ReactNode;
        description: string;
    }> = ({ label, status, icon, description }) => {
        const getStatusColor = () => {
            switch (status) {
                case 'connected':
                case 'active':
                    return 'text-green-600 bg-green-50 border-green-200';
                case 'disconnected':
                case 'inactive':
                    return 'text-yellow-600 bg-yellow-50 border-yellow-200';
                case 'error':
                    return 'text-red-600 bg-red-50 border-red-200';
                default:
                    return 'text-gray-600 bg-gray-50 border-gray-200';
            }
        };
        
        const getStatusIcon = () => {
            switch (status) {
                case 'connected':
                case 'active':
                    return <CheckCircle className="w-5 h-5 text-green-600" />;
                case 'disconnected':
                case 'inactive':
                    return <AlertCircle className="w-5 h-5 text-yellow-600" />;
                case 'error':
                    return <XCircle className="w-5 h-5 text-red-600" />;
                default:
                    return <AlertCircle className="w-5 h-5 text-gray-600" />;
            }
        };
        
        return (
            <div className={`p-4 rounded-lg border-2 ${getStatusColor()}`}>
                <div className="flex items-center gap-3 mb-2">
                    {icon}
                    <div className="flex-grow">
                        <h3 className="font-semibold text-sm">{label}</h3>
                        <p className="text-xs opacity-75">{description}</p>
                    </div>
                    {getStatusIcon()}
                </div>
                <div className="text-xs font-mono uppercase tracking-wide">
                    {status}
                </div>
            </div>
        );
    };
    
    // Overall health status
    const getOverallHealth = (): 'healthy' | 'warning' | 'critical' => {
        const { mainApp, dashboard, chat, realtime } = status;
        
        if (mainApp === 'error' || dashboard === 'error') return 'critical';
        if (mainApp === 'disconnected' || dashboard === 'disconnected') return 'warning';
        if (chat === 'error' || realtime === 'error') return 'warning';
        
        return 'healthy';
    };
    
    const overallHealth = getOverallHealth();
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] ">
                {/* Header */}
                <div className={`p-6 rounded-t-xl ${
                    overallHealth === 'healthy' ? 'bg-green-50 border-b border-green-200' :
                    overallHealth === 'warning' ? 'bg-yellow-50 border-b border-yellow-200' :
                    'bg-red-50 border-b border-red-200'
                }`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-1">
                                🔗 Integration Status
                            </h2>
                            <p className="text-sm text-gray-600">
                                Main App ↔ Therapist Dashboard
                            </p>
                        </div>
                        
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
                            >
                                <XCircle className="w-5 h-5 text-gray-600" />
                            </button>
                        )}
                    </div>
                    
                    {/* Overall Status */}
                    <div className={`mt-4 p-3 rounded-lg ${
                        overallHealth === 'healthy' ? 'bg-green-100 text-green-800' :
                        overallHealth === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }`}>
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            {overallHealth === 'healthy' ? (
                                <CheckCircle className="w-4 h-4" />
                            ) : overallHealth === 'warning' ? (
                                <AlertCircle className="w-4 h-4" />
                            ) : (
                                <XCircle className="w-4 h-4" />
                            )}
                            
                            {overallHealth === 'healthy' ? 'System Healthy' :
                             overallHealth === 'warning' ? 'Minor Issues' :
                             'System Critical'}
                        </div>
                    </div>
                </div>
                
                {/* Status Grid */}
                <div className="p-6 space-y-4">
                    <StatusIndicator
                        label="Main App Bookings"
                        status={status.mainApp}
                        icon={<Calendar className="w-5 h-5" />}
                        description="Customer booking creation"
                    />
                    
                    <StatusIndicator
                        label="Therapist Dashboard"
                        status={status.dashboard}
                        icon={<Activity className="w-5 h-5" />}
                        description="Real-time notifications"
                    />
                    
                    <StatusIndicator
                        label="Chat System"
                        status={status.chat}
                        icon={<MessageCircle className="w-5 h-5" />}
                        description="Customer-therapist messaging"
                    />
                    
                    <StatusIndicator
                        label="Real-time Sync"
                        status={status.realtime}
                        icon={<Wifi className="w-5 h-5" />}
                        description="Live data synchronization"
                    />
                </div>
                
                {/* Stats */}
                <div className="px-6 pb-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-sm text-gray-900 mb-2">Statistics</h3>
                        <div className="grid grid-cols-1 gap-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Bookings:</span>
                                <span className="font-mono font-semibold">{status.bookingCount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Last Update:</span>
                                <span className="font-mono">{lastUpdate.toLocaleTimeString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Therapist ID:</span>
                                <span className="font-mono text-xs">{therapistId}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Actions */}
                <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                    <div className="flex gap-3">
                        <button
                            onClick={checkIntegrationStatus}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            {loading ? 'Checking...' : 'Refresh'}
                        </button>
                        
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Close
                            </button>
                        )}
                    </div>
                    
                    <p className="text-xs text-gray-500 text-center mt-3">
                        Auto-refresh every 30 seconds
                    </p>
                </div>
            </div>
        </div>
    );
};

export default IntegrationStatusPage;