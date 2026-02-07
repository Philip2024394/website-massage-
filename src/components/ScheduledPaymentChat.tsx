/**
 * Scheduled Booking Payment Chat Component
 * Displays bank details and handles payment screenshot upload
 */

import React, { useState, useRef } from 'react';
import { Upload, ImageIcon, CreditCard, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { BankDetails, PaymentConfirmationRequest } from '../services/scheduledBookingPaymentService';

interface ScheduledPaymentChatProps {
  bookingId: string;
  bankDetails: BankDetails;
  paymentRequest: PaymentConfirmationRequest;
  onScreenshotUpload: (file: File) => Promise<void>;
  onPaymentCancel: () => void;
  isUploading?: boolean;
  uploadSuccess?: boolean;
}

export const ScheduledPaymentChat: React.FC<ScheduledPaymentChatProps> = ({
  bookingId,
  bankDetails,
  paymentRequest,
  onScreenshotUpload,
  onPaymentCancel,
  isUploading = false,
  uploadSuccess = false
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPG, PNG, etc.)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      await onScreenshotUpload(selectedFile);
      setSelectedFile(null);
      setPreviewUrl('');
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const formatDateTime = (date: string, time: string) => {
    return new Date(`${date} ${time}`).toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (uploadSuccess) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
          <div>
            <h3 className="text-lg font-bold text-green-800">
              Payment Screenshot Uploaded! ✅
            </h3>
            <p className="text-green-700">
              Your payment proof has been sent to {paymentRequest.providerName} for confirmation.
            </p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-green-200">
          <h4 className="font-semibold text-gray-800 mb-2">Next Steps:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• {paymentRequest.providerName} will verify your payment</li>
            <li>• You'll receive confirmation within 1-2 hours</li>
            <li>• Appointment reminder will be sent 3 hours before scheduled time</li>
            <li>• Your booking is added to the calendar</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="w-8 h-8 text-blue-600" />
        <div>
          <h3 className="text-xl font-bold text-gray-800">
            🏦 Booking Confirmed! Payment Required
          </h3>
          <p className="text-gray-600">
            {paymentRequest.providerName} has accepted your scheduled booking
          </p>
        </div>
      </div>

      {/* Booking Summary */}
      <div className="bg-white p-4 rounded-lg border border-blue-200 mb-6">
        <h4 className="font-semibold text-gray-800 mb-3">📅 Booking Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Service:</span>
            <p className="font-medium">{paymentRequest.serviceType}</p>
          </div>
          <div>
            <span className="text-gray-600">Duration:</span>
            <p className="font-medium">{paymentRequest.duration} minutes</p>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">Scheduled:</span>
            <p className="font-medium text-blue-700">
              {formatDateTime(paymentRequest.scheduledDate, paymentRequest.scheduledTime)}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="bg-white p-4 rounded-lg border border-blue-200 mb-6">
        <h4 className="font-semibold text-gray-800 mb-3">💰 Payment Details</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Amount:</span>
            <span className="font-medium">{formatCurrency(paymentRequest.totalAmount)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Deposit Required (30%):</span>
            <span className="font-bold text-lg text-blue-700">
              {formatCurrency(paymentRequest.depositAmount)}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            💡 Pay remaining {formatCurrency(paymentRequest.totalAmount - paymentRequest.depositAmount)} after service completion
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          🏦 Bank Transfer Details
          <span className="text-xs bg-yellow-200 px-2 py-1 rounded">{paymentRequest.providerName}</span>
        </h4>
        <div className="space-y-2">
          <div>
            <span className="text-sm text-gray-600">Bank:</span>
            <p className="font-bold text-lg">{bankDetails.bankName}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Account Number:</span>
            <p className="font-mono text-lg font-bold tracking-wider bg-white p-2 rounded border">
              {bankDetails.accountNumber}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Account Holder:</span>
            <p className="font-medium">{bankDetails.accountHolderName}</p>
          </div>
          {bankDetails.qrisCode && (
            <div>
              <span className="text-sm text-gray-600">QRIS Code:</span>
              <p className="font-mono text-sm bg-white p-2 rounded border">{bankDetails.qrisCode}</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Instructions */}
      <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg mb-6">
        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          📸 Payment Proof Required
        </h4>
        <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
          <li>Transfer {formatCurrency(paymentRequest.depositAmount)} to the bank account above</li>
          <li>Take a screenshot or photo of the transfer receipt</li>
          <li>Upload the image using the button below</li>
          <li>Wait for {paymentRequest.providerName} to confirm payment</li>
        </ol>
      </div>

      {/* File Upload Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-6">
        {previewUrl ? (
          <div className="space-y-4">
            <img 
              src={previewUrl} 
              alt="Payment screenshot preview" 
              className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
            />
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {isUploading ? 'Uploading...' : 'Send Payment Proof'}
              </button>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl('');
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto" />
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Upload Payment Screenshot</h4>
              <p className="text-gray-600 text-sm mb-4">
                JPG, PNG files up to 5MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
              >
                <Upload className="w-5 h-5" />
                Select Payment Screenshot
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reminder Notice */}
      <div className="bg-blue-100 border border-blue-300 p-4 rounded-lg mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <h4 className="font-semibold text-blue-800">📅 Automatic Reminders</h4>
        </div>
        <p className="text-blue-700 text-sm">
          You'll receive appointment reminders with sound notification 3 hours before your scheduled time.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onPaymentCancel}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
        >
          Cancel Booking
        </button>
        <button
          className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg font-medium cursor-not-allowed opacity-50"
          disabled
        >
          📞 Contact {paymentRequest.providerName}
        </button>
      </div>

      {/* Payment Deadline Notice */}
      <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-600" />
          <span className="text-xs text-yellow-800">
            ⏱️ Please complete payment within 24 hours to secure your booking
          </span>
        </div>
      </div>
    </div>
  );
};

export default ScheduledPaymentChat;