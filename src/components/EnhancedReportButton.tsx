/**
 * Enhanced Report Button with Content Filtering
 * Integrates with existing flag system + new spam prevention
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, CheckCircle, X, Eye, EyeOff } from 'lucide-react';
import { chatFlagService } from '../lib/services/chatFlagService';
import { chatModerationService, ContentFilterResult } from '../services/chatModerationService';
import { professionalChatService } from '../services/professionalChatNotificationService';

interface EnhancedReportButtonProps {
  chatId: string;
  currentUserId: string;
  recipientId: string;
  recipientName: string;
  userRole: 'customer' | 'therapist' | 'admin';
  onReportSubmitted?: (reportId: string) => void;
  className?: string;
}

export const EnhancedReportButton: React.FC<EnhancedReportButtonProps> = ({
  chatId,
  currentUserId,
  recipientId,
  recipientName,
  userRole,
  onReportSubmitted,
  className = ''
}) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [hasReported, setHasReported] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportMessage, setReportMessage] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    // Check if user has already reported this chat
    const checkReportStatus = async () => {
      try {
        const alreadyReported = await chatFlagService.hasUserFlagged(chatId, currentUserId);
        setHasReported(alreadyReported);
      } catch (error) {
        console.error('Failed to check report status:', error);
      }
    };
    
    checkReportStatus();
  }, [chatId, currentUserId]);

  const reportReasons = [
    { value: 'inappropriate_behavior', label: '⚠️ Inappropriate behavior', severity: 'high' },
    { value: 'harassment_abuse', label: '🛡️ Harassment or abuse', severity: 'high' },
    { value: 'shared_contact_number', label: '📞 Shared contact information', severity: 'medium' },
    { value: 'asked_for_contact_number', label: '📱 Asked for personal contact', severity: 'medium' },
    { value: 'payment_issue', label: '💰 Payment related issue', severity: 'medium' },
    { value: 'scam_fraud', label: '🚨 Suspected scam or fraud', severity: 'high' },
    { value: 'therapist_no_show', label: '👥 Therapist no-show', severity: 'medium' },
    { value: 'spam_repetitive', label: '📧 Spam or repetitive messages', severity: 'low' },
    { value: 'other', label: '🔍 Other issue', severity: 'low' }
  ];

  const handleReport = async () => {
    if (!reportReason) return;

    setIsSubmitting(true);
    try {
      const result = await chatFlagService.submitFlag({
        chatRoomId: chatId,
        reporterId: currentUserId,
        reporterRole: userRole === 'customer' ? 'user' : 'therapist',
        reportedUserId: recipientId,
        reportedUserName: recipientName,
        reason: reportReason as any,
        message: reportMessage
      });

      if (result.success) {
        setReportSuccess(true);
        setHasReported(true);
        onReportSubmitted?.(result.flagId || '');

        // Play notification sound
        await professionalChatService.playChatEffect('payment_notification');

        // Notify admin (this would integrate with your admin notification system)
        await notifyAdminOfReport(result.flagId || '', reportReason, userRole);

        // Close modal after success message
        setTimeout(() => {
          setShowReportModal(false);
          setReportSuccess(false);
        }, 2000);
      } else {
        alert(`Report failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Report submission error:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const notifyAdminOfReport = async (reportId: string, reason: string, reporterRole: string) => {
    // This integrates with your existing admin notification system
    console.log('🚨 Admin notification: New report submitted', {
      reportId,
      reason,
      reporterRole,
      chatId,
      timestamp: new Date().toISOString()
    });

    // Send to admin dashboard (this would use your existing admin notification service)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('adminReportNotification', {
        detail: {
          type: 'chat_report',
          reportId,
          reason,
          reporterRole,
          chatId,
          severity: reportReasons.find(r => r.value === reason)?.severity || 'medium',
          timestamp: new Date().toISOString()
        }
      }));
    }
  };

  const getReasonColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  if (hasReported) {
    return (
      <button
        className={`p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors ${className}`}
        title="Report submitted"
        disabled
      >
        <CheckCircle className="w-5 h-5" />
      </button>
    );
  }

  return (
    <>
      {/* Report Button */}
      <button
        onClick={() => setShowReportModal(true)}
        className={`p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors ${className}`}
        title="Report this chat"
      >
        <AlertTriangle className="w-5 h-5" />
      </button>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
            {reportSuccess ? (
              // Success State
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Report Submitted ✅</h3>
                <p className="text-gray-600 mb-4">
                  Thank you for helping keep our platform safe. Our team will review this report.
                </p>
                <div className="text-sm text-gray-500">
                  You'll receive an update once the report is reviewed.
                </div>
              </div>
            ) : (
              // Report Form
              <>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Shield className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">🚨 Report Chat</h3>
                      <p className="text-sm text-gray-600">Report: {recipientName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Form Content */}
                <div className="p-6 space-y-4">
                  {/* Reason Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What's the issue? *
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {reportReasons.map(reason => (
                        <label
                          key={reason.value}
                          className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                            reportReason === reason.value 
                              ? `border-red-300 ${getReasonColor(reason.severity)}`
                              : 'border-gray-200'
                          }`}
                        >
                          <input
                            type="radio"
                            value={reason.value}
                            checked={reportReason === reason.value}
                            onChange={(e) => setReportReason(e.target.value)}
                            className="sr-only"
                          />
                          <div className="flex-1 text-sm font-medium">
                            {reason.label}
                          </div>
                          {reason.severity === 'high' && (
                            <AlertTriangle className="w-4 h-4 text-red-500 ml-2" />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional details (optional)
                    </label>
                    <textarea
                      value={reportMessage}
                      onChange={(e) => setReportMessage(e.target.value)}
                      placeholder="Describe what happened..."
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      rows={3}
                      maxLength={500}
                    />
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500">Help us understand the situation</p>
                      <p className="text-xs text-gray-400">{reportMessage.length}/500</p>
                    </div>
                  </div>

                  {/* Warning */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-yellow-800">
                        <strong>Important:</strong> False reports may result in restrictions on your account. 
                        Only report genuine violations of our community guidelines.
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleReport}
                    disabled={!reportReason || isSubmitting}
                    className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting Report...
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4" />
                        Submit Report 🚨
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

/**
 * Message Filter Alert Component
 * Shows when message was filtered by moderation system
 */
interface MessageFilterAlertProps {
  filterResult: ContentFilterResult;
  onDismiss: () => void;
  onOverride?: () => void;
}

export const MessageFilterAlert: React.FC<MessageFilterAlertProps> = ({
  filterResult,
  onDismiss,
  onOverride
}) => {
  const getAlertColor = () => {
    switch (filterResult.severity) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'medium':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      default:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
  };

  const getIcon = () => {
    switch (filterResult.reason) {
      case 'phone_number':
        return '📞';
      case 'spam':
        return '📧';
      case 'profanity':
        return '🤐';
      case 'inappropriate':
        return '⚠️';
      case 'rate_limit':
        return '⏳';
      default:
        return '🛡️';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getAlertColor()}`}>
      <div className="flex items-start gap-3">
        <div className="text-2xl">{getIcon()}</div>
        <div className="flex-1">
          <h4 className="font-semibold mb-2">Message Filtered</h4>
          <p className="text-sm mb-2">{filterResult.warning}</p>
          
          {filterResult.suggestions && (
            <div className="text-xs space-y-1">
              <strong>Suggestions:</strong>
              <ul className="list-disc list-inside ml-2">
                {filterResult.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
          
          {filterResult.filteredContent && (
            <div className="mt-3 p-2 bg-white bg-opacity-50 rounded text-xs">
              <strong>Filtered version:</strong>
              <div className="mt-1 font-mono">{filterResult.filteredContent}</div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {onOverride && (
            <button
              onClick={onOverride}
              className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
              title="Send anyway (not recommended)"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedReportButton;