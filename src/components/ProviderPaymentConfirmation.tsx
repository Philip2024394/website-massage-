/**
 * Provider Payment Confirmation Component
 * Displays uploaded payment screenshots for provider confirmation
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, Clock, DollarSign } from 'lucide-react';
import { PaymentScreenshot } from '../services/scheduledBookingPaymentService';

interface ProviderPaymentConfirmationProps {
  providerId: string;
  providerName: string;
  onPaymentConfirmation: (screenshotId: string, confirmed: boolean) => Promise<void>;
}

interface PendingPayment {
  screenshot: PaymentScreenshot;
  bookingDetails: {
    customerName: string;
    serviceType: string;
    scheduledDate: string;
    scheduledTime: string;
    depositAmount: number;
    totalAmount: number;
  };
}

export const ProviderPaymentConfirmation: React.FC<ProviderPaymentConfirmationProps> = ({
  providerId,
  providerName,
  onPaymentConfirmation
}) => {
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadPendingPayments();
    // Poll for new payments every 30 seconds
    const interval = setInterval(loadPendingPayments, 30000);
    return () => clearInterval(interval);
  }, [providerId]);

  const loadPendingPayments = async () => {
    // This would fetch pending payment screenshots for the provider
    // For now, using mock data structure
    console.log('Loading pending payments for provider:', providerId);
  };

  const handleConfirmation = async (screenshotId: string, confirmed: boolean) => {
    setIsProcessing(true);
    try {
      await onPaymentConfirmation(screenshotId, confirmed);
      
      // Remove confirmed/rejected payment from list
      setPendingPayments(prev => 
        prev.filter(payment => payment.screenshot.id !== screenshotId)
      );
      
      // Play confirmation sound
      playNotificationSound(confirmed ? 'success' : 'error');
      
    } catch (error) {
      console.error('Payment confirmation failed:', error);
    } finally {
      setIsProcessing(false);
      setSelectedScreenshot('');
    }
  };

  const playNotificationSound = (type: 'success' | 'error') => {
    const audio = new Audio(`/sounds/payment_${type}.mp3`);
    audio.play().catch(console.error);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const formatDateTime = (date: string, time: string) => {
    return new Date(`${date} ${time}`).toLocaleString('id-ID', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (pendingPayments.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="font-semibold text-gray-700 mb-2">No Pending Payment Confirmations</h3>
        <p className="text-gray-500 text-sm">
          Payment screenshots will appear here when customers upload them for scheduled bookings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h2 className="text-xl font-bold text-blue-800 mb-2 flex items-center gap-2">
          <DollarSign className="w-6 h-6" />
          💳 Payment Confirmations ({pendingPayments.length})
        </h2>
        <p className="text-blue-700 text-sm">
          Review and confirm customer payment screenshots for scheduled bookings.
        </p>
      </div>

      {pendingPayments.map((payment) => (
        <div key={payment.screenshot.id} className="bg-white border-2 border-yellow-200 rounded-xl p-6 shadow-lg">
          {/* Customer and Booking Info */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                💰 Payment from {payment.bookingDetails.customerName}
              </h3>
              <p className="text-gray-600">
                {payment.bookingDetails.serviceType} • {formatDateTime(
                  payment.bookingDetails.scheduledDate, 
                  payment.bookingDetails.scheduledTime
                )}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Deposit Amount:</div>
              <div className="text-xl font-bold text-green-600">
                {formatCurrency(payment.bookingDetails.depositAmount)}
              </div>
              <div className="text-xs text-gray-500">
                Total: {formatCurrency(payment.bookingDetails.totalAmount)}
              </div>
            </div>
          </div>

          {/* Payment Screenshot */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <Eye className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-800">Payment Screenshot</span>
              <span className="text-xs bg-yellow-200 px-2 py-1 rounded">
                Uploaded: {new Date(payment.screenshot.uploadedAt).toLocaleString('id-ID')}
              </span>
            </div>
            
            <div className="relative">
              <img 
                src={payment.screenshot.fileUrl}
                alt="Payment screenshot"
                className="max-w-full max-h-96 mx-auto rounded-lg shadow-md cursor-pointer"
                onClick={() => setSelectedScreenshot(payment.screenshot.id)}
              />
              {selectedScreenshot === payment.screenshot.id && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                     onClick={() => setSelectedScreenshot('')}>
                  <img 
                    src={payment.screenshot.fileUrl}
                    alt="Payment screenshot full size"
                    className="max-w-[90vw] max-h-[90vh] rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => handleConfirmation(payment.screenshot.id, true)}
              disabled={isProcessing}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              {isProcessing ? 'Processing...' : 'Confirm Payment ✅'}
            </button>
            
            <button
              onClick={() => handleConfirmation(payment.screenshot.id, false)}
              disabled={isProcessing}
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              Reject Payment ❌
            </button>
          </div>

          {/* Payment Details Summary */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Verification Checklist:</h4>
            <div className="text-xs text-blue-700 space-y-1">
              <div>✓ Amount matches: {formatCurrency(payment.bookingDetails.depositAmount)}</div>
              <div>✓ Transfer date is recent</div>
              <div>✓ Bank account details are visible</div>
              <div>✓ Receipt looks authentic</div>
            </div>
          </div>

          {/* Reminder */}
          <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs text-yellow-800">
            ⚠️ Once confirmed, the booking will be added to your calendar and the customer will be notified.
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProviderPaymentConfirmation;