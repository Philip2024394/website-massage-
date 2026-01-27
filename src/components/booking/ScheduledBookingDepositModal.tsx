import React, { useState } from 'react';
import { X, Upload, CreditCard, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface ScheduledBookingDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingDetails: {
    id: string;
    therapistName: string;
    serviceType: string;
    duration: number;
    totalPrice: number;
    date: string;
    time: string;
    location: string;
  };
  therapistBankDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
  };
  onDepositSubmit: (proofFile: File, notes?: string) => Promise<void>;
}

const ScheduledBookingDepositModal: React.FC<ScheduledBookingDepositModalProps> = ({
  isOpen,
  onClose,
  bookingDetails,
  therapistBankDetails,
  onDepositSubmit
}) => {
  const [step, setStep] = useState<'payment' | 'upload' | 'processing'>('payment');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const depositAmount = Math.round(bookingDetails.totalPrice * 0.3);
  const remainingAmount = bookingDetails.totalPrice - depositAmount;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB');
        return;
      }
      
      setProofFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProofPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitDeposit = async () => {
    if (!proofFile) return;
    
    setIsSubmitting(true);
    try {
      await onDepositSubmit(proofFile, notes);
      setStep('processing');
    } catch (error) {
      console.error('Failed to submit deposit:', error);
      alert('Failed to submit deposit proof. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setStep('payment');
    setProofFile(null);
    setProofPreview(null);
    setNotes('');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Scheduled Booking Deposit</h2>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Step 1: Payment Instructions */}
        {step === 'payment' && (
          <div className="p-6">
            {/* Booking Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Booking Summary</h3>
              <div className="space-y-1 text-sm text-blue-800">
                <div className="flex justify-between">
                  <span>Therapist:</span>
                  <span className="font-medium">{bookingDetails.therapistName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service:</span>
                  <span className="font-medium">{bookingDetails.serviceType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date & Time:</span>
                  <span className="font-medium">{bookingDetails.date} at {bookingDetails.time}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">{bookingDetails.duration} minutes</span>
                </div>
              </div>
            </div>

            {/* Deposit Information */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 mb-6 border border-orange-200">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-orange-900">30% Deposit Required</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-orange-700">Total Price:</span>
                  <span className="font-bold text-orange-900">Rp {bookingDetails.totalPrice.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-orange-700">Deposit (30%):</span>
                  <span className="font-bold text-red-600">Rp {depositAmount.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-orange-700">Pay After Service:</span>
                  <span className="font-medium text-green-700">Rp {remainingAmount.toLocaleString('id-ID')}</span>
                </div>
              </div>
              <div className="mt-3 p-2 bg-red-100 rounded-lg">
                <p className="text-xs text-red-800 font-medium">
                  ⚠️ NON-REFUNDABLE: This deposit secures your appointment and is non-refundable if cancelled.
                </p>
              </div>
            </div>

            {/* Bank Transfer Details */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                🏦 Bank Transfer Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bank:</span>
                  <span className="font-semibold text-gray-900">{therapistBankDetails.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Name:</span>
                  <span className="font-semibold text-gray-900">{therapistBankDetails.accountName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Number:</span>
                  <span className="font-mono font-bold text-gray-900 bg-white px-2 py-1 rounded">
                    {therapistBankDetails.accountNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-bold text-red-600">Rp {depositAmount.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">Payment Instructions:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                <li>Transfer exactly <strong>Rp {depositAmount.toLocaleString('id-ID')}</strong> to the account above</li>
                <li>Take a screenshot of your successful transfer</li>
                <li>Upload the screenshot in the next step</li>
                <li>Wait for therapist confirmation</li>
              </ol>
            </div>

            {/* Action Button */}
            <button
              onClick={() => setStep('upload')}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
            >
              I've Made the Payment - Upload Proof
            </button>
          </div>
        )}

        {/* Step 2: Upload Proof */}
        {step === 'upload' && (
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Payment Proof</h3>
              <p className="text-sm text-gray-600">
                Please upload a clear screenshot of your successful bank transfer
              </p>
            </div>

            {/* File Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Screenshot *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-orange-400 transition-colors">
                {proofPreview ? (
                  <div className="relative">
                    <img 
                      src={proofPreview} 
                      alt="Payment proof" 
                      className="max-w-full h-48 object-contain mx-auto rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setProofFile(null);
                        setProofPreview(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Any additional information about your payment..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep('payment')}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmitDeposit}
                disabled={!proofFile || isSubmitting}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Deposit Proof'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Processing */}
        {step === 'processing' && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Booking in Process</h3>
            <p className="text-sm text-gray-600 mb-6">
              Your deposit proof has been submitted successfully. The therapist will review and confirm your payment.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">What happens next?</span>
              </div>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• Therapist reviews your payment proof</li>
                <li>• You'll receive a notification when approved</li>
                <li>• If approved, your appointment is confirmed</li>
                <li>• If rejected, you can resubmit proof</li>
              </ul>
            </div>

            <button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
            >
              Got it!
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduledBookingDepositModal;