/**
 * 🎁 SEND DISCOUNT MODAL
 * 
 * Modal for therapists to send discount reward codes to customers.
 * Used in two scenarios:
 * 1. After receiving a review notification - "Thank You" discount
 * 2. From dashboard drawer - promotional discount to any customer
 * 
 * Features:
 * - Pre-defined discount percentages (no manual input)
 * - Pre-defined validity periods
 * - System-generated unique codes
 * - Sends to customer's chat + rewards section
 */

import React, { useState } from 'react';
import { X, Gift, Star, Clock, Send, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { 
  sendReviewDiscount, 
  DISCOUNT_OPTIONS, 
  VALIDITY_OPTIONS,
  DISCOUNT_LABELS,
  VALIDITY_LABELS,
  formatExpiryDate,
  type DiscountPercentage,
  type ValidityPeriod
} from '../lib/services/discountRewardService';
import { logger } from '../utils/logger';

interface SendDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  
  // Provider info (therapist/place)
  providerId: string;
  providerType: 'therapist' | 'place';
  providerName: string;
  
  // Customer info
  customerId: string;
  customerName: string;
  
  // Optional: If this is a thank-you for a review
  reviewId?: string;
  
  // Callback when discount is sent successfully
  onSuccess?: (discountCode: string, percentage: number) => void;
}

const SendDiscountModal: React.FC<SendDiscountModalProps> = ({
  isOpen,
  onClose,
  providerId,
  providerType,
  providerName,
  customerId,
  customerName,
  reviewId,
  onSuccess
}) => {
  const [selectedPercentage, setSelectedPercentage] = useState<DiscountPercentage | null>(null);
  const [selectedValidity, setSelectedValidity] = useState<ValidityPeriod | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; code?: string; message?: string } | null>(null);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!selectedPercentage || !selectedValidity) return;

    setIsSending(true);
    setResult(null);

    try {
      const response = await sendReviewDiscount({
        reviewId: reviewId || `promo_${Date.now()}`, // Generate promo ID if no review
        providerId,
        providerType,
        providerName,
        userId: customerId,
        userName: customerName,
        discountPercentage: selectedPercentage,
        validityDays: selectedValidity
      });

      setResult({
        success: response.success,
        code: response.code,
        message: response.message || (response.success 
          ? `Discount code sent to ${customerName}!` 
          : response.error || 'Failed to send discount')
      });

      if (response.success && response.code) {
        onSuccess?.(response.code, selectedPercentage);
        
        // Auto-close after success
        setTimeout(() => {
          onClose();
        }, 3000);
      }
    } catch (error) {
      logger.error('Failed to send discount:', error);
      setResult({
        success: false,
        message: 'Network error. Please try again.'
      });
    } finally {
      setIsSending(false);
    }
  };

  const isReviewThankYou = Boolean(reviewId);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold">
                  {isReviewThankYou ? '🎁 Send Thank You Discount' : '🎯 Send Promotional Discount'}
                </h2>
                <p className="text-sm text-orange-100">
                  To: {customerName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Success/Error Result */}
          {result && (
            <div className={`p-4 rounded-xl flex items-start gap-3 ${
              result.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {result.success ? (
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`font-semibold ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                  {result.success ? 'Discount Sent!' : 'Failed'}
                </p>
                {result.code && (
                  <p className="text-lg font-bold text-green-800 mt-1">
                    Code: {result.code}
                  </p>
                )}
                <p className={`text-sm mt-1 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                  {result.message}
                </p>
              </div>
            </div>
          )}

          {/* Discount Percentage Selection */}
          {!result?.success && (
            <>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Star className="w-4 h-4 text-orange-500" />
                  Select Discount Amount
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {DISCOUNT_OPTIONS.map((percentage) => (
                    <button
                      key={percentage}
                      onClick={() => setSelectedPercentage(percentage)}
                      className={`py-3 px-4 rounded-xl border-2 font-bold text-lg transition-all ${
                        selectedPercentage === percentage
                          ? 'bg-orange-500 border-orange-600 text-white shadow-lg scale-105'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      {percentage}%
                      <span className="block text-xs font-normal mt-0.5 opacity-80">
                        {percentage === 30 ? 'MAX' : 'OFF'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Validity Period Selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Clock className="w-4 h-4 text-orange-500" />
                  Valid For
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {VALIDITY_OPTIONS.map((days) => (
                    <button
                      key={days}
                      onClick={() => setSelectedValidity(days)}
                      className={`py-3 px-3 rounded-xl border-2 font-semibold transition-all ${
                        selectedValidity === days
                          ? 'bg-amber-500 border-amber-600 text-white shadow-lg scale-105'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-amber-300 hover:bg-amber-50'
                      }`}
                    >
                      {VALIDITY_LABELS[days]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              {selectedPercentage && selectedValidity && (
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-semibold text-orange-700">Preview</span>
                  </div>
                  <div className="text-center py-3 bg-white rounded-lg shadow-sm">
                    <p className="text-3xl font-bold text-orange-600">{selectedPercentage}% OFF</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Valid until {formatExpiryDate(selectedValidity)}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Customer will receive this discount code in their chat
                  </p>
                </div>
              )}

              {/* Info Box for Review Thank You */}
              {isReviewThankYou && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
                  <p className="font-semibold">💡 Tip:</p>
                  <p>Thank-you discounts encourage repeat bookings! The customer will see a special banner in their chat.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!result?.success && (
          <div className="px-6 pb-6">
            <button
              onClick={handleSend}
              disabled={!selectedPercentage || !selectedValidity || isSending}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                selectedPercentage && selectedValidity && !isSending
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Discount to {customerName}
                </>
              )}
            </button>
          </div>
        )}

        {/* Close button after success */}
        {result?.success && (
          <div className="px-6 pb-6">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scaleIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SendDiscountModal;
