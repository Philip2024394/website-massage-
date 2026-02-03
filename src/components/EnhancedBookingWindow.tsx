/**
 * Enhanced Booking Window with Contact Sharing Warnings
 * Shows warnings about contact sharing during booking process
 */

import React, { useState, useEffect } from 'react';
import { 
  Clock, Shield, AlertTriangle, Ban, X, CheckCircle, 
  Phone, MessageSquare, Eye, EyeOff, Percent 
} from 'lucide-react';
import { chatModerationService } from '../services/chatModerationService';
import { professionalChatService } from '../services/professionalChatNotificationService';

interface EnhancedBookingWindowProps {
  bookingId: string;
  userId: string;
  providerId: string;
  providerName: string;
  providerType: 'therapist' | 'massage_place' | 'skincare_clinic';
  bookingStatus: 'pending' | 'accepted' | 'rejected' | 'expired';
  onChatMessage?: (message: string) => void;
  onBookingCancel?: () => void;
  className?: string;
}

interface ViolationStats {
  percentage: number;
  totalAttempts: number;
  recentAttempts: number;
  riskLevel: 'safe' | 'warning' | 'danger' | 'critical';
  warningMessage: string;
  isDeactivated: boolean;
}

export const EnhancedBookingWindow: React.FC<EnhancedBookingWindowProps> = ({
  bookingId,
  userId,
  providerId,
  providerName,
  providerType,
  bookingStatus,
  onChatMessage,
  onBookingCancel,
  className = ''
}) => {
  const [chatMessage, setChatMessage] = useState('');
  const [violationStats, setViolationStats] = useState<ViolationStats>({
    percentage: 0,
    totalAttempts: 0,
    recentAttempts: 0,
    riskLevel: 'safe',
    warningMessage: '',
    isDeactivated: false
  });
  const [showViolationDetails, setShowViolationDetails] = useState(false);
  const [chatDeactivated, setChatDeactivated] = useState(false);
  const [lastWarningTime, setLastWarningTime] = useState<Date | null>(null);

  useEffect(() => {
    // Load user's violation statistics
    loadViolationStats();
    
    // Check if chat should be deactivated
    checkChatDeactivation();
  }, [userId]);

  const loadViolationStats = async () => {
    try {
      const stats = await chatModerationService.getUserModerationStats(userId);
      const violations = await calculateViolationPercentage(stats);
      setViolationStats(violations);
      
      // Show warning if percentage is high
      if (violations.percentage >= 60) {
        showViolationWarning(violations);
      }
    } catch (error) {
      console.error('Failed to load violation stats:', error);
    }
  };

  const calculateViolationPercentage = async (stats: any): Promise<ViolationStats> => {
    const totalMessages = stats.messagesCount || 0;
    const totalViolations = (stats.flaggedContent || 0) + (stats.phoneNumberAttempts?.length || 0);
    
    if (totalMessages === 0) {
      return {
        percentage: 0,
        totalAttempts: 0,
        recentAttempts: 0,
        riskLevel: 'safe',
        warningMessage: '',
        isDeactivated: false
      };
    }

    const percentage = Math.round((totalViolations / totalMessages) * 100);
    
    // Calculate recent attempts (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentAttempts = (stats.phoneNumberAttempts || []).filter(
      (attempt: any) => new Date(attempt.timestamps[0]) > twentyFourHoursAgo
    ).length;

    // Determine risk level and warnings
    let riskLevel: 'safe' | 'warning' | 'danger' | 'critical';
    let warningMessage = '';
    let isDeactivated = false;

    if (percentage >= 90 || recentAttempts >= 10) {
      riskLevel = 'critical';
      warningMessage = '🚫 CHAT DEACTIVATED - Multiple serious policy violations detected';
      isDeactivated = true;
    } else if (percentage >= 75 || recentAttempts >= 7) {
      riskLevel = 'danger';
      warningMessage = '🚨 FINAL WARNING - One more violation will deactivate your chat permanently';
    } else if (percentage >= 60 || recentAttempts >= 4) {
      riskLevel = 'danger';
      warningMessage = '⛔ DANGER - Sharing personal contact information is STRICTLY FORBIDDEN';
    } else if (percentage >= 40 || recentAttempts >= 2) {
      riskLevel = 'warning';
      warningMessage = '⚠️ WARNING - Repeated policy violations detected';
    } else {
      riskLevel = 'safe';
      warningMessage = '';
    }

    return {
      percentage,
      totalAttempts: totalViolations,
      recentAttempts,
      riskLevel,
      warningMessage,
      isDeactivated
    };
  };

  const showViolationWarning = async (violations: ViolationStats) => {
    // Play appropriate warning sound
    if (violations.riskLevel === 'critical') {
      await professionalChatService.playChatEffect('booking_urgent');
    } else if (violations.riskLevel === 'danger') {
      await professionalChatService.playChatEffect('payment_notification');
    } else if (violations.riskLevel === 'warning') {
      await professionalChatService.playChatEffect('user_away');
    }

    setLastWarningTime(new Date());
  };

  const checkChatDeactivation = async () => {
    if (violationStats.isDeactivated) {
      setChatDeactivated(true);
      
      // Notify admin of chat deactivation
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('chatDeactivationNotification', {
          detail: {
            userId,
            bookingId,
            violationPercentage: violationStats.percentage,
            recentAttempts: violationStats.recentAttempts,
            timestamp: new Date().toISOString()
          }
        }));
      }
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || chatDeactivated) return;

    try {
      // Validate message before sending
      const validation = await chatModerationService.validateMessage({
        text: chatMessage,
        userId,
        chatId: `booking-${bookingId}`,
        recipientId: providerId
      });

      if (!validation.allowed) {
        // Update violation stats
        await loadViolationStats();
        
        // Check if this violation should deactivate chat
        if (validation.reason === 'phone_number' || validation.reason === 'split_phone_attempt') {
          // Immediate deactivation for contact sharing
          setChatDeactivated(true);
          await professionalChatService.playChatEffect('booking_urgent');
        }
        
        return;
      }

      // Send message
      await onChatMessage?.(chatMessage);
      setChatMessage('');
      
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  const getStatusColor = () => {
    switch (bookingStatus) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'accepted':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'expired':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  const getViolationColor = () => {
    switch (violationStats.riskLevel) {
      case 'critical':
        return 'bg-red-600 text-white border-red-600';
      case 'danger':
        return 'bg-red-500 text-white border-red-500';
      case 'warning':
        return 'bg-orange-500 text-white border-orange-500';
      default:
        return 'bg-green-500 text-white border-green-500';
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              Booking Request - {providerName}
            </h3>
            <div className="flex items-center gap-3 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
                {bookingStatus.charAt(0).toUpperCase() + bookingStatus.slice(1)}
              </span>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Waiting for response</span>
              </div>
            </div>
          </div>
          
          {/* Violation Percentage Indicator */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 ${getViolationColor()}`}>
              <Percent className="w-4 h-4" />
              <span className="font-bold">{violationStats.percentage}%</span>
              <span className="text-sm">Violations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Messages */}
      {violationStats.riskLevel !== 'safe' && (
        <div className={`p-4 border-b ${
          violationStats.riskLevel === 'critical' ? 'bg-red-50 border-red-200' :
          violationStats.riskLevel === 'danger' ? 'bg-red-50 border-red-200' :
          'bg-orange-50 border-orange-200'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full ${
              violationStats.riskLevel === 'critical' ? 'bg-red-600 text-white' :
              violationStats.riskLevel === 'danger' ? 'bg-red-500 text-white' :
              'bg-orange-500 text-white'
            }`}>
              {violationStats.riskLevel === 'critical' ? <Ban className="w-5 h-5" /> :
               violationStats.riskLevel === 'danger' ? <AlertTriangle className="w-5 h-5" /> :
               <Shield className="w-5 h-5" />}
            </div>
            
            <div className="flex-1">
              <h4 className={`font-bold text-lg ${
                violationStats.riskLevel === 'critical' ? 'text-red-800' :
                violationStats.riskLevel === 'danger' ? 'text-red-700' :
                'text-orange-700'
              }`}>
                {violationStats.warningMessage}
              </h4>
              
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-4 text-sm">
                  <span className={violationStats.riskLevel === 'critical' || violationStats.riskLevel === 'danger' ? 'text-red-700' : 'text-orange-700'}>
                    Violation Rate: <strong>{violationStats.percentage}%</strong>
                  </span>
                  <span className={violationStats.riskLevel === 'critical' || violationStats.riskLevel === 'danger' ? 'text-red-700' : 'text-orange-700'}>
                    Recent Attempts: <strong>{violationStats.recentAttempts}</strong>
                  </span>
                </div>
                
                <button
                  onClick={() => setShowViolationDetails(!showViolationDetails)}
                  className={`flex items-center gap-1 text-sm font-medium hover:underline ${
                    violationStats.riskLevel === 'critical' || violationStats.riskLevel === 'danger' ? 'text-red-700' : 'text-orange-700'
                  }`}
                >
                  {showViolationDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showViolationDetails ? 'Hide' : 'Show'} Details
                </button>
                
                {showViolationDetails && (
                  <div className="mt-3 p-3 bg-white bg-opacity-70 rounded-lg border">
                    <div className="text-sm space-y-2">
                      <div>
                        <strong>Policy Violations Detected:</strong>
                        <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                          <li>Total violation attempts: {violationStats.totalAttempts}</li>
                          <li>Recent attempts (24h): {violationStats.recentAttempts}</li>
                          <li>Split phone number attempts detected</li>
                          <li>Inappropriate content filtered</li>
                        </ul>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <strong>Next Steps:</strong>
                        {violationStats.riskLevel === 'critical' ? (
                          <p className="text-red-700 mt-1">Chat has been permanently deactivated. Contact support for appeal.</p>
                        ) : violationStats.riskLevel === 'danger' ? (
                          <p className="text-red-700 mt-1">One more violation will permanently deactivate your chat access.</p>
                        ) : (
                          <p className="text-orange-700 mt-1">Follow platform guidelines to avoid further restrictions.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Standard Safety Notice (always shown) */}
      <div className="bg-blue-50 border-b border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-800 mb-2">
              🔒 Platform Safety Notice
            </h4>
            <div className="text-blue-700 text-sm space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>WARNING:</strong> Sharing your personal contact number in chat will 
                  <span className="font-bold text-red-600"> IMMEDIATELY DEACTIVATE</span> this conversation.
                </p>
              </div>
              
              <div className="bg-blue-100 rounded-lg p-3 mt-3">
                <h5 className="font-medium text-blue-800 mb-2">✅ Safe Communication Guidelines:</h5>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Use only the platform's built-in messaging system</li>
                  <li>All booking details and scheduling handled automatically</li>
                  <li>Contact information is shared securely after booking confirmation</li>
                  <li>Report any inappropriate behavior using the flag button</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Section */}
      <div className="p-6">
        {chatDeactivated ? (
          /* Chat Deactivated State */
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ban className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-red-800 mb-2">Chat Deactivated</h3>
            <p className="text-red-700 mb-4">
              This conversation has been deactivated due to policy violations.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
              <p className="font-medium mb-2">Reason for deactivation:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Violation percentage: {violationStats.percentage}%</li>
                <li>Recent violation attempts: {violationStats.recentAttempts}</li>
                <li>Contact information sharing detected</li>
              </ul>
              <p className="mt-3 font-medium">
                Contact customer support if you believe this is an error.
              </p>
            </div>
          </div>
        ) : (
          /* Active Chat State */
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              Send a message to {providerName}
            </h4>
            
            <div className="flex gap-3">
              <div className="flex-1">
                <textarea
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type your message here... (Professional communication only)"
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  maxLength={500}
                  disabled={violationStats.riskLevel === 'critical'}
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">Keep messages professional and platform-appropriate</p>
                  <p className="text-xs text-gray-400">{chatMessage.length}/500</p>
                </div>
              </div>
              
              <button
                onClick={handleSendMessage}
                disabled={!chatMessage.trim() || violationStats.riskLevel === 'critical'}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-semibold transition-colors h-fit"
              >
                Send
              </button>
            </div>

            {/* Safety Reminder */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3" />
                <span>Messages are monitored for safety</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${
                  violationStats.riskLevel === 'safe' ? 'bg-green-500' :
                  violationStats.riskLevel === 'warning' ? 'bg-orange-500' :
                  'bg-red-500'
                }`}></div>
                <span>
                  {violationStats.riskLevel === 'safe' ? 'Safe' :
                   violationStats.riskLevel === 'warning' ? 'Warning' :
                   'Restricted'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {bookingStatus === 'pending' && (
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            <Clock className="w-4 h-4 inline mr-1" />
            Waiting for {providerName} to respond...
          </div>
          
          <button
            onClick={onBookingCancel}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Cancel Booking
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedBookingWindow;