/**
 * ============================================================================
 * 🚩 FLAG ICON - PERSISTENT CHAT REPORT BUTTON
 * ============================================================================
 * 
 * Always-visible flag icon for chat reporting with:
 * - Persistent positioning (top-right of chat)
 * - State management (normal, flagged, disabled)
 * - Anti-abuse duplicate prevention
 * - Clean visual feedback
 */

import React, { useState, useEffect } from 'react';
import { Check, Phone, Star, AlertTriangle, Shield, Ban, User } from 'lucide-react';
import { chatFlagService, FlagReason, ReporterRole } from '../lib/services/chatFlagService';

/**
 * Inline Report Form Component
 */
interface InlineReportFormProps {
  chatRoomId: string;
  reporterId: string;
  reporterRole: string;
  reportedUserId: string;
  reportedUserName: string;
  onSuccess: () => void;
  onClose: () => void;
}

const InlineReportForm: React.FC<InlineReportFormProps> = ({
  chatRoomId,
  reporterId,
  reporterRole,
  reportedUserId,
  reportedUserName,
  onSuccess,
  onClose
}) => {
  const [selectedReason, setSelectedReason] = useState<FlagReason | ''>('');
  const [details, setDetails] = useState('');
  const [contactName, setContactName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reason options with colored icons and labels
  const reasonOptions = [
    { 
      value: 'inappropriate_language' as FlagReason, 
      label: 'Inappropriate Language', 
      icon: <Ban className="w-4 h-4 text-red-500" /> 
    },
    { 
      value: 'harassment' as FlagReason, 
      label: 'Harassment', 
      icon: <AlertTriangle className="w-4 h-4 text-orange-500" /> 
    },
    { 
      value: 'spam' as FlagReason, 
      label: 'Spam', 
      icon: <Shield className="w-4 h-4 text-yellow-500" /> 
    },
    { 
      value: 'fake_profile' as FlagReason, 
      label: 'Fake Profile', 
      icon: <User className="w-4 h-4 text-purple-500" /> 
    },
    { 
      value: 'asked_for_contact_number' as FlagReason, 
      label: 'Asked for Contact Number', 
      icon: <Phone className="w-4 h-4 text-blue-500" /> 
    },
    { 
      value: 'shared_contact_number' as FlagReason, 
      label: 'Shared Contact Number', 
      icon: <Phone className="w-4 h-4 text-indigo-500" /> 
    },
    { 
      value: 'other' as FlagReason, 
      label: 'Other', 
      icon: <Star className="w-4 h-4 text-gray-500" /> 
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedReason) return;
    
    setIsSubmitting(true);
    
    try {
      await chatFlagService.submitFlag({
        chatRoomId,
        reporterId,
        reporterRole: reporterRole as ReporterRole,
        reportedUserId,
        reportedUserName,
        reason: selectedReason,
        message: details.trim() || undefined,
        contactName: contactName.trim() || undefined,
        whatsappNumber: whatsappNumber.trim() || undefined
      });
      
      onSuccess();
    } catch (error) {
      console.error('Failed to submit report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      {/* Header with Back Arrow */}
      <div className="bg-red-500 text-white px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={onClose}
          className="p-1 hover:bg-red-600 rounded-full transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">Report Chat</h3>
          <p className="text-red-100 text-sm">Help us maintain service quality</p>
        </div>
      </div>

      {/* Introductory Message */}
      <div className="bg-red-50 border-b border-red-100 px-4 py-4 flex-shrink-0">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-red-800 leading-relaxed">
              We are committed to providing exceptional service and appreciate your feedback regarding any service standards that may have been compromised. <strong>Your identity remains completely confidential.</strong> Please provide detailed information to help us investigate and take appropriate action regarding any service personnel violations.
            </p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Contact Information Card */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-gray-600" />
              <h4 className="font-medium text-gray-800">Contact Information (Optional)</h4>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Your Name:
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter your name"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  WhatsApp Number:
                </label>
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g. +62 812 3456 7890"
                  maxLength={20}
                />
              </div>
            </div>
          </div>

          {/* Reason Selection Card */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <h4 className="font-medium text-gray-800">Reason for Reporting *</h4>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {reasonOptions.map((option) => (
                <label 
                  key={option.value} 
                  className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg border-2 transition-all ${
                    selectedReason === option.value
                      ? 'bg-red-50 border-red-300 shadow-sm'
                      : 'bg-white border-gray-200 hover:border-red-200 hover:bg-red-25'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={option.value}
                    checked={selectedReason === option.value}
                    onChange={(e) => setSelectedReason(e.target.value as FlagReason)}
                    className="text-red-500 focus:ring-red-500"
                  />
                  <div className="flex items-center space-x-2 flex-1">
                    {option.icon}
                    <span className="text-sm text-gray-700 font-medium">{option.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-gray-600" />
              <h4 className="font-medium text-gray-800">Additional Details</h4>
            </div>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full px-3 py-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows={4}
              maxLength={500}
              placeholder="Please provide detailed information about what happened. The more specific you are, the better we can help..."
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">
                Be specific to help us investigate effectively
              </span>
              <span className="text-xs text-gray-500">
                {details.length}/500
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 pb-4">
            <button
              type="submit"
              disabled={!selectedReason || isSubmitting}
              className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
                selectedReason && !isSubmitting
                  ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting Report...
                </div>
              ) : (
                'Submit Report'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// TYPES
// ============================================================================

interface FlagIconProps {
  chatRoomId: string;
  reporterId: string;
  reporterRole: ReporterRole;
  reportedUserId: string;
  reportedUserName?: string;
  className?: string;
  onReportFormToggle?: (isOpen: boolean) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function FlagIcon({
  chatRoomId,
  reporterId,
  reporterRole,
  reportedUserId,
  reportedUserName,
  className = '',
  onReportFormToggle
}: FlagIconProps) {
  const [showReportForm, setShowReportForm] = useState(false);
  const [hasReported, setHasReported] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Check if user has already reported this chat on mount
  useEffect(() => {
    const checkReportStatus = async () => {
      if (!chatRoomId || !reporterId) {
        setIsCheckingStatus(false);
        return;
      }

      try {
        const alreadyReported = await chatFlagService.hasUserFlagged(chatRoomId, reporterId);
        setHasReported(alreadyReported);
      } catch (error) {
        console.error('Failed to check report status:', error);
        // Fail open - allow reporting if check fails
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkReportStatus();
  }, [chatRoomId, reporterId]);

  // Handle successful report submission
  const handleReportSuccess = () => {
    setHasReported(true);
    setShowReportForm(false);
    onReportFormToggle?.(false);
    setShowSuccessMessage(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  // Handle flag icon click  
  const handleClick = () => {
    if (hasReported || isCheckingStatus) return;
    const newState = !showReportForm;
    setShowReportForm(newState);
    onReportFormToggle?.(newState);
  };

  // Don't render if missing required props
  if (!chatRoomId || !reporterId || !reportedUserId || reporterId === reportedUserId) {
    return null;
  }

  return (
    <>
      <div className={`flex flex-col items-center ${className}`}>
        <div className="relative">
          <button
            onClick={handleClick}
            disabled={hasReported || isCheckingStatus}
            className={`
              w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200
              ${hasReported 
                ? 'bg-green-100 text-green-600 cursor-default' 
                : isCheckingStatus
                ? 'bg-gray-100 text-gray-400 cursor-wait'
                : showReportForm
                ? 'bg-red-500 text-white scale-110'
                : 'bg-red-100 text-red-600 hover:bg-red-500 hover:text-white hover:scale-110 cursor-pointer'
              }
            `}
            title={
              hasReported 
                ? 'Chat already reported' 
                : isCheckingStatus
                ? 'Checking status...'
                : showReportForm
                ? 'Close report form'
                : 'Report this chat'
            }
          >
            {hasReported ? (
              <Check className="w-4 h-4" />
            ) : (
              <span className="text-sm">🚩</span>
            )}
          </button>

          {/* Success Message Tooltip */}
          {showSuccessMessage && (
            <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-green-600 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-50">
              Report submitted successfully
              <div className="absolute bottom-full right-2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-green-600" />
            </div>
          )}
        </div>
        
        {/* Report Text */}
        <span className="text-xs text-gray-600 mt-1 font-medium">Report</span>
      </div>

      {/* Inline Report Form - Full Screen Overlay */}
      {showReportForm && (
        <div className="fixed inset-0 z-[9999] bg-white">
          <InlineReportForm
            chatRoomId={chatRoomId}
            reporterId={reporterId}
            reporterRole={reporterRole}
            reportedUserId={reportedUserId as string}
            reportedUserName={reportedUserName as string}
            onSuccess={handleReportSuccess}
            onClose={() => {
              setShowReportForm(false);
              onReportFormToggle?.(false);
            }}
          />
        </div>
      )}
    </>
  );
}