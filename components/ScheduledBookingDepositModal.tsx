/**
 * 💳 SCHEDULED BOOKING DEPOSIT MODAL
 * 
 * Modal for collecting 30% deposit payment for scheduled bookings
 * Features:
 * - Non-refundable deposit policy display
 * - Payment proof upload
 * - Bank transfer instructions
 * - Terms acknowledgment
 */

import React, { useState } from 'react';
import { X, Upload, AlertTriangle, Shield, CreditCard, Clock, FileCheck } from 'lucide-react';

interface ScheduledBookingDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitPayment: (paymentProof: File, paymentMethod: string, notes?: string) => Promise<void>;
  depositAmount: number;
  therapistName: string;
  scheduledDate: string;
  scheduledTime: string;
  serviceType: string;
  isProcessing: boolean;
}

const ScheduledBookingDepositModal: React.FC<ScheduledBookingDepositModalProps> = ({
  isOpen,
  onClose,
  onSubmitPayment,
  depositAmount,
  therapistName,
  scheduledDate,
  scheduledTime,
  serviceType,
  isProcessing
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'e_wallet'>('bank_transfer');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a JPG or PNG image file');
        return;
      }
      
      if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        return;
      }
      
      setPaymentProof(file);
    }
  };

  const handleSubmit = async () => {
    if (!paymentProof) {
      alert('Please upload payment proof');
      return;
    }
    
    if (!termsAccepted) {
      alert('Please accept the terms and conditions');
      return;
    }

    try {
      setUploading(true);
      await onSubmitPayment(paymentProof, paymentMethod, paymentNotes);
    } catch (error) {
      console.error('Failed to submit payment:', error);
    } finally {
      setUploading(false);
    }
  };

  const formatPrice = (amount: number) => `Rp ${amount.toLocaleString('id-ID')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            💳 Pay 30% Deposit
          </h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Booking Summary */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Booking Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Therapist:</span>
                <span className="font-medium text-blue-900">{therapistName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Service:</span>
                <span className="font-medium text-blue-900">{serviceType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Date & Time:</span>
                <span className="font-medium text-blue-900">{scheduledDate} at {scheduledTime}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                <span className="text-blue-700">Deposit Required (30%):</span>
                <span className="font-bold text-blue-900 text-lg">{formatPrice(depositAmount)}</span>
              </div>
            </div>
          </div>

          {/* Non-Refundable Policy Warning */}
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">
                  ⚠️ Non-Refundable Deposit Policy
                </h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Deposits are <strong>non-refundable</strong> under any circumstances</li>
                  <li>• If you don't show up, you forfeit the entire deposit</li>
                  <li>• Rescheduling requires 24-hour notice (subject to availability)</li>
                  <li>• Payment secures your appointment slot</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCard className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Bank Transfer</div>
              </button>
              
              <button
                type="button"
                onClick={() => setPaymentMethod('e_wallet')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'e_wallet'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-6 h-6 mx-auto mb-2 bg-green-500 rounded text-white text-xs flex items-center justify-center">
                  💳
                </div>
                <div className="text-sm font-medium">E-Wallet</div>
              </button>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Payment Instructions</h3>
            <ol className="text-sm text-gray-700 space-y-1">
              <li>1. Transfer {formatPrice(depositAmount)} to the therapist's account</li>
              <li>2. Take a clear photo of the transaction receipt</li>
              <li>3. Upload the payment proof below</li>
              <li>4. Add any notes if needed</li>
              <li>5. Wait for therapist approval (usually within 2 hours)</li>
            </ol>
          </div>

          {/* Upload Payment Proof */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Payment Proof *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="payment-proof"
                disabled={isProcessing}
              />
              <label htmlFor="payment-proof" className="cursor-pointer">
                {paymentProof ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <FileCheck className="w-5 h-5" />
                    <span className="text-sm font-medium">{paymentProof.name}</span>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload payment proof</p>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Payment Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              placeholder="Any additional information about your payment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              disabled={isProcessing}
            />
          </div>

          {/* Terms Acceptance */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              disabled={isProcessing}
            />
            <label htmlFor="terms" className="text-sm text-gray-700">
              I understand and accept that this deposit is <strong>non-refundable</strong> and I agree to the booking terms and conditions.
            </label>
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-3 bg-green-50 rounded-xl p-4 border border-green-200">
            <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-green-900">🛡️ Security Notice</h4>
              <p className="text-xs text-green-800 mt-1">
                Only pay to the therapist's verified bank account shown in this app. Report any suspicious payment requests immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!paymentProof || !termsAccepted || isProcessing || uploading}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading || isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              'Submit Payment Proof'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduledBookingDepositModal;