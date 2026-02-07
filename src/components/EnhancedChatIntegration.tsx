/**
 * Enhanced Chat Integration for Scheduled Payment Flow
 * Integrates payment confirmation workflow into existing chat system
 */

import React, { useState, useEffect } from 'react';
import { Send, Upload, CheckCircle, Clock, CreditCard, AlertTriangle } from 'lucide-react';
import { scheduledBookingPaymentService } from '../services/scheduledBookingPaymentService';
import { mp3NotificationService } from '../services/mp3NotificationService';

interface EnhancedChatIntegrationProps {
  bookingId: string;
  customerId: string;
  providerId: string;
  providerType: 'therapist' | 'massage_place' | 'skincare_clinic';
  chatMessages: ChatMessage[];
  onSendMessage: (message: string, type?: 'text' | 'payment' | 'system') => void;
  onFileUpload: (file: File, type: 'screenshot') => void;
}

type PaymentStatus = 
  | 'idle' 
  | 'awaiting_payment'
  | 'showing_bank_details' 
  | 'waiting_screenshot' 
  | 'confirming_payment' 
  | 'completed'
  | 'expired'
  | 'cancelled';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'payment' | 'system' | 'screenshot';
  metadata?: {
    paymentStatus?: PaymentStatus;
    screenshotUrl?: string;
    bankDetails?: any;
    depositAmount?: number;
  };
}

interface PaymentFlowState {
  status: 'idle' | 'showing_bank_details' | 'waiting_screenshot' | 'confirming_payment' | 'completed';
  bankDetails: any | null;
  depositAmount: number;
  uploadedScreenshot: File | null;
  paymentDeadline: Date | null;
}

export const EnhancedChatIntegration: React.FC<EnhancedChatIntegrationProps> = ({
  bookingId,
  customerId,
  providerId,
  providerType,
  chatMessages,
  onSendMessage,
  onFileUpload
}) => {
  const [paymentFlow, setPaymentFlow] = useState<PaymentFlowState>({
    status: 'idle',
    bankDetails: null,
    depositAmount: 0,
    uploadedScreenshot: null,
    paymentDeadline: null
  });

  const [newMessage, setNewMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    // Check if booking has been accepted and needs payment
    checkBookingPaymentStatus();
  }, [bookingId]);

  const checkBookingPaymentStatus = async () => {
    try {
      const paymentStatus = await (scheduledBookingPaymentService as any).getPaymentStatus(bookingId);
      
      if (paymentStatus?.status === 'awaiting_payment') {
        // Trigger payment flow
        await initiatePaymentFlow();
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };

  const initiatePaymentFlow = async () => {
    try {
      // Get provider bank details and calculate deposit
      const bankDetails = await (scheduledBookingPaymentService as any).getProviderBankDetails(providerId, providerType);
      const bookingAmount = 300000; // This should come from booking data
      const depositAmount = Math.round(bookingAmount * 0.3);

      setPaymentFlow({
        status: 'showing_bank_details',
        bankDetails,
        depositAmount,
        uploadedScreenshot: null,
        paymentDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours deadline
      });

      // Send system message with bank details
      const bankDetailsMessage = `
🏦 **PAYMENT REQUIRED - BOOKING CONFIRMED** 

Your scheduled booking has been accepted! Please transfer **30% deposit** to confirm:

💰 **Deposit Amount:** Rp ${depositAmount.toLocaleString('id-ID')}
🏪 **Bank:** ${bankDetails.bankName}
🔢 **Account:** ${bankDetails.accountNumber}  
👤 **Name:** ${bankDetails.accountHolder}

⚠️ **Important:** 
- Transfer the exact amount: Rp ${depositAmount.toLocaleString('id-ID')}
- Upload payment screenshot within 2 hours
- Booking will be cancelled if payment not received

📸 Upload your payment screenshot below ⬇️
      `.trim();

      onSendMessage(bankDetailsMessage, 'system');

      // Play notification sound
      await mp3NotificationService.playNotification('booking_confirmed');

    } catch (error) {
      console.error('Error initiating payment flow:', error);
      onSendMessage('❌ Error loading payment details. Please contact support.', 'system');
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      onSendMessage('❌ Please upload an image file for payment screenshot.', 'system');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      onSendMessage('❌ File too large. Please upload an image under 10MB.', 'system');
      return;
    }

    try {
      setPaymentFlow(prev => ({
        ...prev,
        status: 'waiting_screenshot',
        uploadedScreenshot: file
      }));

      // Upload screenshot and process payment
      const result = await (scheduledBookingPaymentService as any).uploadPaymentScreenshot(
        bookingId, file, paymentFlow.depositAmount
      );

      setPaymentFlow(prev => ({
        ...prev,
        status: 'confirming_payment'
      }));

      // Send confirmation message to customer
      onSendMessage(
        '✅ Payment screenshot uploaded successfully! Your provider will verify the payment within 30 minutes.', 
        'system'
      );

      // Send notification to provider's chat
      const providerMessage = `
💳 **NEW PAYMENT RECEIVED**

Customer uploaded payment screenshot for booking #${bookingId}

🧾 **Screenshot:** [View Payment Proof](${result.screenshotUrl})
💰 **Amount:** Rp ${paymentFlow.depositAmount.toLocaleString('id-ID')}
👤 **From:** Customer ID ${customerId}

Please verify the payment and confirm/reject within 30 minutes.
      `.trim();

      // This would send to provider's chat
      await sendToProviderChat(providerId, providerMessage);

      // Play upload success sound
      await mp3NotificationService.playNotification('payment_success');

      onFileUpload(file, 'screenshot');

    } catch (error) {
      console.error('Error uploading screenshot:', error);
      onSendMessage('❌ Failed to upload screenshot. Please try again.', 'system');
    }
  };

  const sendToProviderChat = async (providerId: string, message: string) => {
    // This would integrate with the provider's chat system
    console.log(`Sending to provider ${providerId}:`, message);
    
    // Play notification sound for provider
    await mp3NotificationService.playNotification('booking_confirmed');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage, 'text');
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'showing_bank_details':
        return <CreditCard className="w-5 h-5 text-blue-500" />;
      case 'waiting_screenshot':
        return <Upload className="w-5 h-5 text-yellow-500" />;
      case 'confirming_payment':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return null;
    }
  };

  const formatTimeRemaining = (deadline: Date | null) => {
    if (!deadline) return '';
    
    const now = new Date();
    const remaining = deadline.getTime() - now.getTime();
    
    if (remaining <= 0) return 'Expired';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Payment Status Banner */}
      {paymentFlow.status !== 'idle' && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 shadow-lg">
          <div className="flex items-center gap-3">
            {getPaymentStatusIcon(paymentFlow.status)}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">
                {paymentFlow.status === 'showing_bank_details' && '💳 Payment Required'}
                {paymentFlow.status === 'waiting_screenshot' && '📸 Upload Payment Screenshot'}
                {paymentFlow.status === 'confirming_payment' && '⏳ Payment Under Review'}
                {paymentFlow.status === 'completed' && '✅ Payment Confirmed'}
              </h3>
              <p className="text-blue-100 text-sm">
                {paymentFlow.status === 'showing_bank_details' && 
                  `Deposit: Rp ${paymentFlow.depositAmount.toLocaleString('id-ID')} • ${formatTimeRemaining(paymentFlow.paymentDeadline)}`}
                {paymentFlow.status === 'waiting_screenshot' && 
                  'Drag & drop your payment screenshot or click upload button'}
                {paymentFlow.status === 'confirming_payment' && 
                  'Provider will verify your payment within 30 minutes'}
                {paymentFlow.status === 'completed' && 
                  'Your booking is confirmed and added to calendar'}
              </p>
            </div>
            {paymentFlow.paymentDeadline && paymentFlow.status !== 'completed' && (
              <div className="text-right">
                <div className="text-xs text-blue-200">Deadline:</div>
                <div className="font-mono text-sm">{formatTimeRemaining(paymentFlow.paymentDeadline)}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === customerId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-xl p-3 ${
                message.type === 'system'
                  ? 'bg-yellow-100 border border-yellow-300 text-yellow-800'
                  : message.senderId === customerId
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-800'
              }`}
            >
              <div className="font-medium text-sm mb-1">{message.senderName}</div>
              <div className="whitespace-pre-wrap text-sm">{message.message}</div>
              <div className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
              
              {/* Payment Screenshot Preview */}
              {message.type === 'screenshot' && message.metadata?.screenshotUrl && (
                <div className="mt-2">
                  <img 
                    src={message.metadata.screenshotUrl} 
                    alt="Payment screenshot"
                    className="max-w-full rounded-lg shadow-md"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* File Upload Area */}
      {(paymentFlow.status === 'showing_bank_details' || paymentFlow.status === 'waiting_screenshot') && (
        <div
          className={`mx-4 mb-2 border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
            isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 font-medium">📸 Upload Payment Screenshot</p>
          <p className="text-sm text-gray-500 mb-3">
            Drag & drop or click to upload your bank transfer receipt
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            className="hidden"
            id="screenshot-upload"
          />
          <label
            htmlFor="screenshot-upload"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer transition-colors"
          >
            Choose File 📁
          </label>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                paymentFlow.status === 'showing_bank_details'
                  ? 'Upload payment screenshot first...'
                  : 'Type your message...'
              }
              className="w-full p-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              disabled={paymentFlow.status === 'showing_bank_details'}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || paymentFlow.status === 'showing_bank_details'}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white p-3 rounded-xl transition-colors flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {paymentFlow.status === 'showing_bank_details' && (
          <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs text-yellow-800">
            <AlertTriangle className="w-4 h-4 inline mr-1" />
            Please upload your payment screenshot before sending messages
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedChatIntegration;