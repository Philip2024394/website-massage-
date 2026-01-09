/**
 * ============================================================================
 * 🚩 FLAG MODAL - CHAT REPORTING INTERFACE
 * ============================================================================
 * 
 * Secure modal for reporting chat incidents with:
 * - Required reason selection
 * - Optional message (500 char limit)
 * - Duplicate prevention
 * - Clean UI feedback
 */

import React, { useState } from 'react';
import { X, AlertTriangle, Shield, Send } from 'lucide-react';
import { chatFlagService, FlagReason, FlagSubmission, ReporterRole } from '../lib/services/chatFlagService';

// ============================================================================
// TYPES
// ============================================================================

interface FlagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  chatRoomId: string;
  reporterId: string;
  reporterRole: ReporterRole;
  reportedUserId: string;
  reportedUserName?: string;
}

interface ReasonOption {
  value: FlagReason;
  label: string;
  icon: string;
}

// ============================================================================
// REASON OPTIONS
// ============================================================================

const REASON_OPTIONS: ReasonOption[] = [
  {
    value: 'inappropriate_behavior',
    label: 'Inappropriate behavior',
    icon: '⚠️'
  },
  {
    value: 'harassment_abuse',
    label: 'Harassment or abuse', 
    icon: '🛡️'
  },
  {
    value: 'payment_issue',
    label: 'Payment issue',
    icon: '💳'
  },
  {
    value: 'scam_fraud',
    label: 'Scam or fraud',
    icon: '🚫'
  },
  {
    value: 'therapist_no_show',
    label: 'Therapist no-show',
    icon: '👤'
  },
  {
    value: 'asked_for_contact_number',
    label: 'Asked for contact number',
    icon: '📞'
  },
  {
    value: 'shared_contact_number',
    label: 'Shared contact number',
    icon: '📱'
  },
  {
    value: 'other',
    label: 'Other',
    icon: '📝'
  }
];

// ============================================================================
// COMPONENT
// ============================================================================

export function FlagModal({
  isOpen,
  onClose,
  onSuccess,
  chatRoomId,
  reporterId,
  reporterRole,
  reportedUserId,
  reportedUserName
}: FlagModalProps) {
  const [selectedReason, setSelectedReason] = useState<FlagReason | ''>('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedReason('');
      setMessage('');
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedReason) {
      setError('Please select a reason for reporting.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const submission: FlagSubmission = {
        chatRoomId,
        reporterId,
        reporterRole,
        reportedUserId,
        reason: selectedReason,
        message: message.trim() || undefined
      };

      const result = await chatFlagService.submitFlag(submission);

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Flag submission error:', error);
      setError('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Report This Chat</h3>
              <p className="text-sm text-gray-500">Your report helps keep the platform safe.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Reported User Info */}
          {reportedUserName && (
            <div className="mb-4 p-3 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600">
                Reporting: <span className="font-medium text-gray-900">{reportedUserName}</span>
              </p>
            </div>
          )}

          {/* Reason Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for reporting *
            </label>
            <div className="space-y-2">
              {REASON_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50 ${
                    selectedReason === option.value
                      ? 'border-orange-400 bg-orange-50'
                      : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={option.value}
                    checked={selectedReason === option.value}
                    onChange={(e) => setSelectedReason(e.target.value as FlagReason)}
                    className="sr-only"
                  />
                  <span className="text-lg">{option.icon}</span>
                  <span className="font-medium text-gray-900">{option.label}</span>
                  {selectedReason === option.value && (
                    <div className="ml-auto w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Optional Message */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional details (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide any additional context that would help our review..."
              maxLength={500}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all resize-none"
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-400">Optional, but helpful for our review</p>
              <p className="text-xs text-gray-400">{message.length}/500</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedReason || isSubmitting}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-xl hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Report
                </>
              )}
            </button>
          </div>

          {/* Privacy Notice */}
          <p className="text-xs text-gray-400 mt-4 text-center">
            Reports are reviewed by our trust & safety team. False reports may result in account restrictions.
          </p>
        </form>
      </div>
    </div>
  );
}