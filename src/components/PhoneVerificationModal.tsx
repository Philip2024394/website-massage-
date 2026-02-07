/**
 * ============================================================================
 * 📱 PHONE VERIFICATION MODAL - ANTI-SPAM PROTECTION
 * ============================================================================
 * 
 * Clean verification UI for booking anti-spam system
 * Shows when booking requires phone verification
 * 
 * Features:
 * - SMS code input (6 digits)
 * - Auto-focus and auto-submit
 * - Resend code with countdown
 * - Clear error messages
 * - Mobile-friendly design
 * 
 * ============================================================================
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Shield, MessageSquare, RefreshCw, CheckCircle } from 'lucide-react';
import { bookingAntiSpamService } from '../services/bookingAntiSpamService';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  phoneNumber: string;
  customerName: string;
  onVerified: (verified: boolean) => void;
  onClose: () => void;
  language?: 'id' | 'en';
}

export const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({
  isOpen,
  phoneNumber,
  customerName,
  onVerified,
  onClose,
  language = 'id'
}) => {
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Translations
  const t = {
    id: {
      title: 'Verifikasi Nomor Telepon',
      subtitle: 'Untuk mencegah pemesanan palsu, kami perlu memverifikasi nomor WhatsApp Anda',
      codeSent: 'Kode verifikasi telah dikirim ke',
      enterCode: 'Masukkan kode 6 digit',
      verifying: 'Memverifikasi...',
      resendCode: 'Kirim ulang kode',
      resendIn: 'Kirim ulang dalam',
      seconds: 'detik',
      attemptsLeft: 'Sisa percobaan',
      close: 'Tutup',
      verified: 'Terverifikasi!',
      proceedBooking: 'Lanjutkan Pemesanan'
    },
    en: {
      title: 'Phone Number Verification',
      subtitle: 'To prevent fake bookings, we need to verify your WhatsApp number',
      codeSent: 'Verification code sent to',
      enterCode: 'Enter 6-digit code',
      verifying: 'Verifying...',
      resendCode: 'Resend code',
      resendIn: 'Resend in',
      seconds: 'seconds',
      attemptsLeft: 'Attempts remaining',
      close: 'Close',
      verified: 'Verified!',
      proceedBooking: 'Proceed with Booking'
    }
  };

  const labels = t[language];

  // Auto-focus first input when modal opens
  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  // Handle code input
  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only digits

    const newCode = [...verificationCode];
    newCode[index] = value.slice(-1); // Only last digit
    setVerificationCode(newCode);
    setError('');

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits entered
    if (index === 5 && value) {
      const completeCode = [...newCode];
      completeCode[5] = value;
      setVerificationCode(completeCode);
      setTimeout(() => verifyCode(completeCode.join('')), 100);
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Verify the code
  const verifyCode = async (code?: string) => {
    const codeToVerify = code || verificationCode.join('');
    
    if (codeToVerify.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const result = await bookingAntiSpamService.sendVerificationCode(phoneNumber);
      
      // In a real implementation, this would verify against the server
      // For demo, we'll simulate verification
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      // Mock verification logic (in production, verify against actual SMS)
      const isValid = codeToVerify === '123456' || codeToVerify.includes('1'); // Demo logic
      
      if (isValid) {
        setSuccess(true);
        setTimeout(() => {
          onVerified(true);
        }, 1000);
      } else {
        setAttemptsRemaining(prev => prev - 1);
        if (attemptsRemaining <= 1) {
          setError('Maximum attempts exceeded. Please request a new code.');
          setTimeout(() => {
            setVerificationCode(['', '', '', '', '', '']);
            setAttemptsRemaining(3);
          }, 2000);
        } else {
          setError(`Incorrect code. ${attemptsRemaining - 1} attempts remaining.`);
          setVerificationCode(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        }
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Resend code
  const resendCode = async () => {
    if (resendCountdown > 0) return;
    
    try {
      await bookingAntiSpamService.sendVerificationCode(phoneNumber);
      setResendCountdown(60);
      setVerificationCode(['', '', '', '', '', '']);
      setError('');
      setAttemptsRemaining(3);
      
      // Start countdown
      const timer = setInterval(() => {
        setResendCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (err) {
      setError('Failed to send code. Please try again.');
    }
  };

  // Start initial countdown when modal opens
  useEffect(() => {
    if (isOpen && resendCountdown === 0) {
      setResendCountdown(60);
      const timer = setInterval(() => {
        setResendCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6" />
              <h2 className="text-xl font-bold">{labels.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          
          {success ? (
            // Success State
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-600 mb-2">{labels.verified}</h3>
              <p className="text-gray-600 mb-6">
                Nomor WhatsApp Anda telah terverifikasi
              </p>
              <button
                onClick={() => onVerified(true)}
                className="w-full bg-green-500 text-white py-3 px-6 rounded-xl font-bold hover:bg-green-600 transition-colors"
              >
                {labels.proceedBooking}
              </button>
            </div>
          ) : (
            // Verification State
            <>
              {/* Info Section */}
              <div className="text-center mb-6">
                <MessageSquare className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  {labels.subtitle}
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">{labels.codeSent}</span>
                  <br />
                  <span className="font-bold text-gray-900">{phoneNumber}</span>
                </p>
              </div>

              {/* Code Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {labels.enterCode}
                </label>
                <div className="flex justify-center gap-2 mb-4">
                  {verificationCode.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleCodeChange(index, e.target.value)}
                      onKeyDown={e => handleKeyDown(index, e)}
                      className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors ${
                        error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      disabled={isVerifying}
                    />
                  ))}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="text-red-600 text-sm text-center mb-3 p-2 bg-red-50 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Attempts Remaining */}
                {attemptsRemaining < 3 && !error.includes('Maximum') && (
                  <div className="text-orange-600 text-sm text-center mb-3">
                    {labels.attemptsLeft}: {attemptsRemaining}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                {/* Verify Button */}
                <button
                  onClick={() => verifyCode()}
                  disabled={verificationCode.join('').length !== 6 || isVerifying}
                  className={`w-full py-3 px-6 rounded-xl font-bold transition-all ${
                    verificationCode.join('').length === 6 && !isVerifying
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isVerifying ? (
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {labels.verifying}
                    </div>
                  ) : (
                    'Verifikasi'
                  )}
                </button>

                {/* Resend Code */}
                <button
                  onClick={resendCode}
                  disabled={resendCountdown > 0}
                  className={`text-sm py-2 px-4 rounded-lg transition-colors ${
                    resendCountdown > 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-blue-500 hover:bg-blue-50'
                  }`}
                >
                  {resendCountdown > 0 
                    ? `${labels.resendIn} ${resendCountdown} ${labels.seconds}`
                    : labels.resendCode
                  }
                </button>
              </div>
            </>
          )}

          {/* Demo Info */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 text-center">
              🎯 <strong>Demo Mode:</strong> Use code "123456" or any code with "1" to verify
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneVerificationModal;