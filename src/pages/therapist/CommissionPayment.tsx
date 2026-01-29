// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Wallet, Upload, Clock, AlertCircle, CheckCircle, Building2, User, Hash, Copy, Check, Calendar, XCircle, Timer, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';
import TherapistPageHeader from '../../components/therapist/TherapistPageHeader';
import { Therapist } from '../../types';
import { therapistService, imageUploadService } from '../../lib/appwriteService';
import { showToast } from '../../utils/showToastPortal';
import { commissionTrackingService, CommissionPayment as CommissionPaymentType } from '../../lib/services/commissionTrackingService';
import HelpTooltip from '../../components/therapist/HelpTooltip';
import { commissionHelp } from './constants/helpContent';

interface CommissionPaymentProps {
  therapist: Therapist | null;
  onBack?: () => void;
  language?: 'en' | 'id';
}

// Admin payment details for commission
interface AdminPaymentDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftCode: string;
}

// Countdown timer hook with animation
const useCountdown = (deadline: string, isPaused: boolean = false) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, total: 0, expired: false });
  
  useEffect(() => {
    if (isPaused) return;
    
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(deadline).getTime();
      const diff = target - now;
      
      if (diff <= 0) {
        return { hours: 0, minutes: 0, seconds: 0, total: 0, expired: true };
      }
      
      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        total: diff,
        expired: false
      };
    };
    
    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, [deadline, isPaused]);
  
  return timeLeft;
};

// Animated countdown digit component
const CountdownDigit: React.FC<{ value: number; label: string; isUrgent: boolean }> = ({ value, label, isUrgent }) => (
  <div className={`flex flex-col items-center ${isUrgent ? 'animate-pulse' : ''}`}>
    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center font-bold text-lg sm:text-xl shadow-inner ${
      isUrgent ? 'bg-red-500 text-white' : 'bg-gray-800 text-white'
    }`}>
      {String(value).padStart(2, '0')}
    </div>
    <span className={`text-xs mt-1 font-medium ${isUrgent ? 'text-red-600' : 'text-gray-500'}`}>{label}</span>
  </div>
);

// Elite Payment Card Component with Countdown Timer
interface PaymentCardProps {
  payment: any;
  index: number;
  paymentProofs: { [key: string]: { file: File | null, preview: string } };
  uploadingFor: string | null;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>, paymentId: string) => void;
  onRemoveProof: (paymentId: string) => void;
  onSubmit: (payment: any) => void;
  language: 'en' | 'id';
}

const PaymentCard: React.FC<PaymentCardProps> = ({
  payment,
  index,
  paymentProofs,
  uploadingFor,
  onUpload,
  onRemoveProof,
  onSubmit,
  language
}) => {
  // 🔒 LATE PAYMENT PENALTY - 50,000 IDR for overdue accounts
  const LATE_PAYMENT_FEE = 50000;
  
  const proofData = paymentProofs[payment.$id];
  const isUploading = uploadingFor === payment.$id;
  const hasProof = proofData && proofData.preview;
  const isAwaitingVerification = payment.status === 'awaiting_verification';
  const isVerified = payment.status === 'verified';
  const isOverdue = payment.status === 'overdue';
  
  // Countdown timer - pauses when proof is uploaded
  const countdown = useCountdown(payment.paymentDeadline, isAwaitingVerification || hasProof);
  const isUrgent = countdown.hours === 0 && countdown.minutes < 30 && !countdown.expired;
  
  // Format duration
  const formatDuration = (mins: number) => {
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const remaining = mins % 60;
      return remaining > 0 ? `${hours}h ${remaining}min` : `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    return `${mins} min`;
  };

  return (
    <div className={`bg-white rounded-xl overflow-hidden shadow-lg border-2 transition-all ${
      isOverdue ? 'border-red-400 shadow-red-100' :
      isAwaitingVerification ? 'border-green-400 shadow-green-100' :
      isUrgent ? 'border-amber-400 shadow-amber-100' :
      'border-gray-200'
    }`}>
      {/* Header with Status */}
      <div className={`px-4 py-3 ${
        isOverdue ? 'bg-red-500' :
        isAwaitingVerification ? 'bg-green-500' :
        isUrgent ? 'bg-amber-500' :
        'bg-gradient-to-r from-orange-500 to-amber-500'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isAwaitingVerification ? (
              <CheckCircle className="w-5 h-5 text-white" />
            ) : isOverdue ? (
              <AlertTriangle className="w-5 h-5 text-white" />
            ) : (
              <Timer className="w-5 h-5 text-white" />
            )}
            <span className="text-white font-bold text-sm">
              {isAwaitingVerification ? '✓ Proof Submitted - Awaiting Admin' :
               isOverdue ? '⚠️ OVERDUE - Account Locked' :
               `Payment #${index + 1} Due`}
            </span>
          </div>
          <span className="text-white/80 text-xs font-mono">{payment.bookingId?.slice(-8) || 'N/A'}</span>
        </div>
      </div>

      {/* Countdown Timer Section - Only show if pending */}
      {!isAwaitingVerification && !isOverdue && !countdown.expired && (
        <div className="bg-gray-900 py-4">
          <p className="text-center text-gray-400 text-xs mb-2 uppercase tracking-wider">
            {language === 'id' ? 'Waktu Tersisa Sebelum Akun Terkunci' : 'Time Remaining Before Account Lock'}
          </p>
          <div className="flex justify-center gap-2">
            <CountdownDigit value={countdown.hours} label={language === 'id' ? 'Jam' : 'Hours'} isUrgent={isUrgent} />
            <div className="flex items-center text-2xl text-gray-500 font-bold">:</div>
            <CountdownDigit value={countdown.minutes} label={language === 'id' ? 'Menit' : 'Min'} isUrgent={isUrgent} />
            <div className="flex items-center text-2xl text-gray-500 font-bold">:</div>
            <CountdownDigit value={countdown.seconds} label={language === 'id' ? 'Detik' : 'Sec'} isUrgent={isUrgent} />
          </div>
          {isUrgent && (
            <p className="text-center text-red-400 text-xs mt-2 animate-pulse">
              ⚠️ {language === 'id' ? 'Segera upload bukti pembayaran!' : 'Upload payment proof now!'}
            </p>
          )}
          {/* Late Fee Warning */}
          <div className="mt-3 mx-4 bg-red-900/50 border border-red-500 rounded-lg p-3">
            <p className="text-center text-red-300 text-xs font-bold">
              ⚠️ {language === 'id' 
                ? 'PERINGATAN: Jika waktu habis, biaya keterlambatan IDR 50.000 akan ditambahkan!' 
                : 'WARNING: If timer expires, late fee of IDR 50,000 will be added!'}
            </p>
          </div>
        </div>
      )}

      {/* Account Active Banner - Shows when proof uploaded */}
      {isAwaitingVerification && (
        <div className="bg-green-50 border-b-2 border-green-200 py-4 px-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-green-800 font-bold text-lg">
                {language === 'id' ? 'Akun Sekarang Aktif!' : 'Account Now Active!'}
              </p>
              <p className="text-green-600 text-sm">
                {language === 'id' ? 'Admin akan konfirmasi dalam 48 jam' : 'Admin will confirm within 48 hours'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overdue Banner with Late Fee Warning */}
      {isOverdue && (
        <div className="bg-red-50 border-b-2 border-red-200 py-4 px-4">
          <div className="flex items-center justify-center gap-3 mb-3">
            <AlertTriangle className="w-10 h-10 text-red-500" />
            <div>
              <p className="text-red-800 font-bold">
                {language === 'id' ? 'Akun Status: SIBUK' : 'Account Status: BUSY'}
              </p>
              <p className="text-red-600 text-sm">
                {language === 'id' ? 'Upload bukti pembayaran untuk mengaktifkan kembali' : 'Upload payment proof to reactivate'}
              </p>
            </div>
          </div>
          {/* Late Fee Warning Box */}
          <div className="bg-red-100 border-2 border-red-400 rounded-lg p-3 mt-2">
            <p className="text-center text-red-800 font-bold text-sm">
              ⚠️ {language === 'id' 
                ? 'BIAYA KETERLAMBATAN: IDR 50.000 ditambahkan ke total pembayaran' 
                : 'LATE FEE: IDR 50,000 added to total payment'}
            </p>
          </div>
        </div>
      )}

      {/* Booking Details Card */}
      <div className="p-4 space-y-4">
        {/* Customer & Service Info */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                {language === 'id' ? 'Nama Pelanggan' : 'Customer Name'}
              </p>
              <p className="font-bold text-gray-900">{payment.customerName || 'Customer'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                {language === 'id' ? 'Jenis Pijat' : 'Massage Type'}
              </p>
              <p className="font-semibold text-gray-900 text-sm">{payment.massageType || 'Massage'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                {language === 'id' ? 'Durasi' : 'Duration'}
              </p>
              <p className="font-semibold text-gray-900 text-sm">{formatDuration(payment.duration || 60)}</p>
            </div>
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className={`rounded-xl p-4 ${isOverdue ? 'bg-red-50' : 'bg-orange-50'}`}>
          <div className="flex justify-between items-center mb-3 pb-3 border-b border-orange-200">
            <span className="text-gray-600 text-sm">
              {language === 'id' ? 'Harga Layanan' : 'Service Price'}
            </span>
            <span className="font-semibold text-gray-900">IDR {(payment.serviceAmount || 0).toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="text-orange-700 font-bold">30% {language === 'id' ? 'Komisi Admin' : 'Admin Commission'}</p>
            </div>
            <span className="font-semibold text-orange-600">IDR {(payment.commissionAmount || 0).toLocaleString()}</span>
          </div>
          
          {/* Late Fee - Only show if overdue */}
          {isOverdue && (
            <div className="flex justify-between items-center mb-2 pb-2 border-b border-red-300">
              <div>
                <p className="text-red-700 font-bold">⚠️ {language === 'id' ? 'Biaya Keterlambatan' : 'Late Payment Fee'}</p>
                <p className="text-xs text-red-500">{language === 'id' ? 'Denda karena melewati batas waktu' : 'Penalty for exceeding deadline'}</p>
              </div>
              <span className="font-bold text-red-600">+ IDR {LATE_PAYMENT_FEE.toLocaleString()}</span>
            </div>
          )}
          
          {/* Total Due */}
          <div className="flex justify-between items-center pt-2">
            <div>
              <p className={`font-bold text-lg ${isOverdue ? 'text-red-800' : 'text-orange-700'}`}>
                {language === 'id' ? 'TOTAL YANG HARUS DIBAYAR' : 'TOTAL DUE'}
              </p>
              {!isOverdue && (
                <p className="text-xs text-orange-600">
                  {language === 'id' ? 'Bayar dalam 5 jam' : 'Pay within 5 hours'}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className={`text-3xl font-black ${isOverdue ? 'text-red-600' : 'text-orange-600'}`}>
                IDR {((payment.commissionAmount || 0) + (isOverdue ? LATE_PAYMENT_FEE : 0)).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Upload Section - Only show if not awaiting verification */}
        {!isAwaitingVerification && (
          <div className="border-t border-gray-200 pt-4">
            <label className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Upload className="w-4 h-4 text-orange-500" />
              {language === 'id' ? 'Upload Bukti Pembayaran' : 'Upload Payment Proof'} *
            </label>
            
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onUpload(e, payment.$id)}
              className="hidden"
              id={`proof-upload-${payment.$id}`}
              disabled={isUploading}
            />
            
            {hasProof ? (
              <div className="relative mt-3">
                <img src={proofData.preview} alt="Payment Proof" className="w-full rounded-lg border-2 border-green-400" />
                <button
                  onClick={() => onRemoveProof(payment.$id)}
                  disabled={isUploading}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-5 h-5" />
                </button>
                <div className="absolute bottom-2 left-2 right-2 bg-green-500 text-white text-center py-2 rounded-lg font-semibold text-sm">
                  ✓ {language === 'id' ? 'Bukti Siap Dikirim' : 'Proof Ready to Submit'}
                </div>
              </div>
            ) : (
              <label 
                htmlFor={`proof-upload-${payment.$id}`}
                className="flex flex-col items-center justify-center py-8 cursor-pointer bg-gray-50 hover:bg-orange-50 rounded-lg transition-colors border-2 border-dashed border-gray-300 mt-3"
              >
                <Upload className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-900 font-medium">
                  {language === 'id' ? 'Klik untuk upload' : 'Click to upload'}
                </p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG max 5MB</p>
              </label>
            )}
          </div>
        )}

        {/* Submit Button */}
        {!isAwaitingVerification && (
          <button
            onClick={() => onSubmit(payment)}
            disabled={!hasProof || isUploading}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
              !hasProof || isUploading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-98 shadow-lg'
            }`}
          >
            {isUploading ? (
              <>
                <Clock className="w-5 h-5 animate-spin" />
                {language === 'id' ? 'Mengirim...' : 'Submitting...'}
              </>
            ) : (
              <>
                {language === 'id' ? 'Kirim Bukti Pembayaran' : 'Submit Payment Proof'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

interface CommissionPaymentProps {
  therapist: Therapist | null;
  onBack?: () => void;
  language?: 'en' | 'id';
}

// Admin payment details for commission
interface AdminPaymentDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftCode: string;
}

const CommissionPayment: React.FC<CommissionPaymentProps> = ({ 
  therapist,
  onBack,
  language = 'id'
}) => {
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [paymentProofs, setPaymentProofs] = useState<{ [key: string]: { file: File | null, preview: string } }>({});
  const [copied, setCopied] = useState<string>('');
  const [adminPaymentDetails, setAdminPaymentDetails] = useState<AdminPaymentDetails>({
    bankName: 'BNI',
    accountName: 'Philip Francis O Farrell',
    accountNumber: '1354188005',
    swiftCode: 'BNINIDJA'
  });

  // Translation labels
  const labels = {
    en: {
      title: 'Commission Payment',
      subtitle: 'Pay your 30% booking commission',
      paymentSummary: 'Payment Summary',
      bookingAmount: 'Booking Amount',
      commissionRate: 'Commission Rate',
      amountDue: 'Amount Due',
      paymentInstructions: 'Payment Instructions',
      instruction1: '• Transfer the commission amount to the account above',
      instruction2: '• Take a clear photo of the transaction receipt',
      instruction3: '• Upload the payment proof below',
      instruction4: '• Your commission will be verified within 24 hours',
      officialAccount: '⚠️ Official Payment Account Only',
      bank: 'Bank',
      accountNumber: 'Account Number',
      accountName: 'Account Name',
      swiftCode: 'SWIFT Code',
      securityWarning: '🛡️ Security Warning: Payments are ONLY made to this account. Never pay anyone asking for payment if the details don\'t match these exact details. Report any suspicious requests immediately.',
      uploadProof: 'Upload Payment Proof *',
      clickUpload: 'Click to upload',
      fileTypes: 'PNG, JPG up to 5MB',
      submitting: 'Submitting...',
      submitPayment: 'Submit Payment'
    },
    id: {
      title: 'Pembayaran Komisi',
      subtitle: 'Bayar komisi booking 30% Anda',
      paymentSummary: 'Ringkasan Pembayaran',
      bookingAmount: 'Jumlah Booking',
      commissionRate: 'Tarif Komisi',
      amountDue: 'Jumlah yang Harus Dibayar',
      paymentInstructions: 'Instruksi Pembayaran',
      instruction1: '• Transfer jumlah komisi ke akun di atas',
      instruction2: '• Ambil foto yang jelas dari struk transaksi',
      instruction3: '• Upload bukti pembayaran di bawah',
      instruction4: '• Komisi Anda akan diverifikasi dalam 24 jam',
      officialAccount: '⚠️ Rekening Pembayaran Resmi Saja',
      bank: 'Bank',
      accountNumber: 'Nomor Rekening',
      accountName: 'Nama Rekening',
      swiftCode: 'Kode SWIFT',
      securityWarning: '🛡️ Peringatan Keamanan: Pembayaran HANYA dilakukan ke rekening ini. Jangan pernah membayar siapa pun yang meminta pembayaran jika detailnya tidak cocok dengan detail yang tepat ini. Laporkan permintaan yang mencurigakan segera.',
      uploadProof: 'Upload Bukti Pembayaran *',
      clickUpload: 'Klik untuk upload',
      fileTypes: 'PNG, JPG maksimal 5MB',
      submitting: 'Mengirim...',
      submitPayment: 'Kirim Pembayaran'
    }
  };

  const currentLabels = labels[language];
  
  // Load pending commission payments for this therapist
  useEffect(() => {
    loadPendingPayments();
  }, [therapist]);

  const loadPendingPayments = async () => {
    if (!therapist) return;
    
    setLoading(true);
    try {
      const therapistId = String(therapist.$id || therapist.id);
      const payments = await commissionTrackingService.getTherapistPendingPayments(therapistId);
      
      console.log('📋 Loaded pending commission payments:', payments);
      setPendingPayments(payments);
      
      if (payments.length === 0) {
        showToast('✅ No pending commission payments!', 'success');
      }
    } catch (error) {
      console.error('Failed to load pending payments:', error);
      showToast('⚠️ Failed to load commission payments', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total pending amount
  const totalPending = pendingPayments.reduce((sum, payment) => sum + payment.commissionAmount, 0);
  
  // Fetch admin bank details from Appwrite
  useEffect(() => {
    const fetchAdminSettings = async () => {
      try {
        const { databases } = await import('../../lib/appwrite');
        const response = await databases.listDocuments(
          '68f76ee1000e64ca8d05', // Your database ID
          'admin_settings', // Collection ID
          []
        );
        
        console.log('💳 Admin settings response:', response);
        
        if (response.documents.length > 0) {
          const settings = response.documents[0];
          console.log('💳 Admin settings document:', settings);
          console.log('💳 Field values:', {
            bankname: settings.bankname,
            bankaccountdetails: settings.bankaccountdetails,
            settingValue: settings.settingValue,
            description: settings.description
          });
          
          setAdminPaymentDetails({
            bankName: settings.bankname || 'BNI',
            accountName: settings.bankaccountdetails || 'Philip Francis O Farrell',
            accountNumber: settings.settingValue || '1354188005',
            swiftCode: settings.description || 'BNINIDJA'
          });
          console.log('✅ Bank details updated from Appwrite');
        } else {
          console.log('⚠️ No admin_settings documents found - using defaults');
        }
      } catch (error) {
        console.log('⚠️ Failed to fetch admin settings, using defaults:', error);
      }
    };
    
    fetchAdminSettings();
  }, []);



  const handlePaymentProofUpload = (e: React.ChangeEvent<HTMLInputElement>, paymentId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('⚠️ Please upload an image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('⚠️ File size must be less than 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPaymentProofs(prev => ({
        ...prev,
        [paymentId]: {
          file,
          preview: reader.result as string
        }
      }));
    };
    reader.readAsDataURL(file);

    showToast('✅ Payment proof selected', 'success');
  };

  const handleRemoveProof = (paymentId: string) => {
    setPaymentProofs(prev => {
      const updated = { ...prev };
      delete updated[paymentId];
      return updated;
    });
  };

  const handleSubmit = async (payment: any) => {
    if (!therapist) {
      showToast('❌ No therapist data found', 'error');
      return;
    }

    const paymentId = payment.$id;
    const proofData = paymentProofs[paymentId];

    if (!proofData || (!proofData.file && !proofData.preview)) {
      showToast('⚠️ Please upload payment proof', 'error');
      return;
    }

    setUploadingFor(paymentId);
    try {
      let paymentProofUrl = proofData.preview;

      if (proofData.file) {
        try {
          paymentProofUrl = await imageUploadService.uploadImage(proofData.file, 'commission-proofs');
          showToast('✅ Payment proof uploaded', 'success');
        } catch (error) {
          console.error('Failed to upload payment proof:', error);
          showToast('❌ Failed to upload payment proof', 'error');
          setUploadingFor(null);
          return;
        }
      }

      // Submit payment proof via commission tracking service
      await commissionTrackingService.uploadPaymentProof(
        paymentId,
        paymentProofUrl,
        'bank_transfer'
      );

      showToast('✅ Payment proof submitted! Account activated.', 'success');
      
      // Remove from UI
      setPendingPayments(prev => prev.filter(p => p.$id !== paymentId));
      handleRemoveProof(paymentId);
      
      // Reload payments after short delay
      setTimeout(() => {
        loadPendingPayments();
      }, 1000);
      
    } catch (error) {
      console.error('Failed to submit payment proof:', error);
      showToast('❌ Failed to submit payment proof', 'error');
    } finally {
      setUploadingFor(null);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    showToast(`✅ ${label} copied!`, 'success');
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="min-h-screen bg-white overflow-y-auto overflow-x-hidden" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y pan-x' }}>
      {/* Page Header with Back Navigation */}
      <TherapistPageHeader
        title=""
        subtitle="Bayar komisi booking 30% Anda"
        onBackToStatus={onBack}
        icon={
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
        }
        actions={<HelpTooltip {...commissionHelp.overview} position="left" size="md" />}
      />
      
      {/* Standardized Status Header */}
      <div className="max-w-sm mx-auto px-4 pt-6 pb-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Pembayaran Komisi 30%</h2>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-700">{(therapist?.onlineHoursThisMonth || 0).toFixed(1)}j</span>
              <span className="text-xs text-gray-500">bulan ini</span>
            </div>
          </div>

          {/* Status Grid */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => console.log('Status change: available')}
              className={`p-4 rounded-xl border-2 transition-all ${
                therapist?.status === 'available' && therapist?.availability === 'online'
                  ? 'bg-green-50 border-green-500'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <CheckCircle className={`w-6 h-6 mx-auto mb-2 ${
                therapist?.status === 'available' && therapist?.availability === 'online'
                  ? 'text-green-600'
                  : 'text-gray-400'
              }`} />
              <p className={`text-sm font-semibold ${
                therapist?.status === 'available' && therapist?.availability === 'online'
                  ? 'text-green-700'
                  : 'text-gray-600'
              }`}>Tersedia</p>
            </button>

            <button
              onClick={() => console.log('Status change: busy')}
              className={`p-4 rounded-xl border-2 transition-all ${
                therapist?.status === 'busy'
                  ? 'bg-amber-50 border-amber-500'
                  : 'border-gray-200 hover:border-amber-300'
              }`}
            >
              <Clock className={`w-6 h-6 mx-auto mb-2 ${
                therapist?.status === 'busy'
                  ? 'text-amber-600'
                  : 'text-gray-400'
              }`} />
              <p className={`text-sm font-semibold ${
                therapist?.status === 'busy'
                  ? 'text-amber-700'
                  : 'text-gray-600'
              }`}>Sibuk</p>
            </button>

            <button
              onClick={() => console.log('Status change: offline')}
              className={`p-4 rounded-xl border-2 transition-all ${
                therapist?.availability === 'offline'
                  ? 'bg-red-50 border-red-500'
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              <XCircle className={`w-6 h-6 mx-auto mb-2 ${
                therapist?.availability === 'offline'
                  ? 'text-red-600'
                  : 'text-gray-400'
              }`} />
              <p className={`text-sm font-semibold ${
                therapist?.availability === 'offline'
                  ? 'text-red-700'
                  : 'text-gray-600'
              }`}>Offline</p>
            </button>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-5 space-y-4 max-w-7xl mx-auto">

        {loading ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <Clock className="w-12 h-12 text-orange-500 mx-auto mb-3 animate-spin" />
            <p className="text-gray-600">Loading commission payments...</p>
          </div>
        ) : pendingPayments.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">All Clear!</h3>
            <p className="text-gray-600">No pending commission payments</p>
          </div>
        ) : (
          <>
            {/* Total Summary Card */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-lg p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Pending Commissions</p>
                  <p className="text-2xl sm:text-3xl font-bold text-orange-600">IDR {totalPending.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Payments Due</p>
                  <p className="text-3xl font-bold text-gray-900">{pendingPayments.length}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-orange-700 bg-orange-100 rounded-lg p-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Upload payment proofs to keep your account active and accept new bookings</span>
              </div>
            </div>

            {/* Payment List - Each booking with countdown timer */}
            {pendingPayments.map((payment, index) => (
              <PaymentCard
                key={payment.$id}
                payment={payment}
                index={index}
                paymentProofs={paymentProofs}
                uploadingFor={uploadingFor}
                onUpload={handlePaymentProofUpload}
                onRemoveProof={handleRemoveProof}
                onSubmit={handleSubmit}
                language={language}
              />
            ))}
          </>
        )}

        {/* Bank Details Card - Always visible for reference */}
        <div className="bg-white border-2 border-orange-300 rounded-lg p-4">
          <h3 className="text-base font-bold text-orange-600 mb-3 uppercase tracking-wide">
            {currentLabels.officialAccount}
          </h3>

          {/* BNI Card Image */}
          <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4">
            <img 
              src="https://ik.imagekit.io/7grri5v7d/bni_card-removebg-preview.png?updatedAt=1766127885485" 
              alt="BNI Card" 
              className="w-full h-full object-contain"
            />
          </div>

          {/* Bank Account Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
            <div>
              <span className="text-gray-600 font-semibold">{currentLabels.bank}:</span>
              <p className="text-black font-bold">{adminPaymentDetails.bankName}</p>
            </div>
            <div>
              <span className="text-gray-600 font-semibold">{currentLabels.accountNumber}:</span>
              <p className="text-black font-bold font-mono break-all">{adminPaymentDetails.accountNumber}</p>
            </div>
            <div>
              <span className="text-gray-600 font-semibold">{currentLabels.accountName}:</span>
              <p className="text-black font-bold">{adminPaymentDetails.accountName}</p>
            </div>
            <div>
              <span className="text-gray-600 font-semibold">{currentLabels.swiftCode}:</span>
              <p className="text-black font-bold font-mono">{adminPaymentDetails.swiftCode}</p>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
            <p className="text-xs font-bold text-blue-900 mb-2">{currentLabels.paymentInstructions}</p>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>{currentLabels.instruction1}</li>
              <li>{currentLabels.instruction2}</li>
              <li>{currentLabels.instruction3}</li>
              <li>{currentLabels.instruction4}</li>
            </ul>
          </div>

          {/* Security Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 font-semibold">
                {currentLabels.securityWarning}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommissionPayment;
