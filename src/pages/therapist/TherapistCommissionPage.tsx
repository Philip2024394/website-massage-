// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState, useEffect } from 'react';
import { Wallet, Upload, Clock, AlertCircle, CheckCircle, Building2, User, Hash, Copy, Check, Calendar, XCircle } from 'lucide-react';
import TherapistPageHeader from '../../components/therapist/TherapistPageHeader';
import { Therapist } from '../../types';
import { therapistService, imageUploadService } from '../../lib/appwriteService';
import { showToast } from '../../utils/showToastPortal';
import { commissionTrackingService } from '../../lib/services/commissionTrackingService';
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
    <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-white">
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

            {/* Payment List - Each booking separate */}
            {pendingPayments.map((payment, index) => {
              const proofData = paymentProofs[payment.$id];
              const isUploading = uploadingFor === payment.$id;
              const hasProof = proofData && proofData.preview;

              return (
                <div key={payment.$id} className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
                  {/* Payment Header */}
                  <div className="bg-gray-50 border-b-2 border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Payment #{index + 1}</h3>
                        <p className="text-sm text-gray-600">Booking ID: {payment.bookingId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Due Amount</p>
                        <p className="text-xl font-bold text-orange-600">IDR {payment.commissionAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Booking Details */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Booking Date:</span>
                        <p className="font-semibold text-gray-900">{new Date(payment.bookingDate).toLocaleDateString()}</p>
                      </div>
                      {payment.scheduledDate && (
                        <div>
                          <span className="text-gray-500">Service Date:</span>
                          <p className="font-semibold text-gray-900">{new Date(payment.scheduledDate).toLocaleDateString()}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">Service Amount:</span>
                        <p className="font-semibold text-gray-900">IDR {payment.serviceAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Commission (30%):</span>
                        <p className="font-semibold text-orange-600">IDR {payment.commissionAmount.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        payment.status === 'overdue' 
                          ? 'bg-red-100 text-red-800'
                          : payment.status === 'awaiting_verification'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {payment.status === 'overdue' ? '⚠️ Overdue' : 
                         payment.status === 'awaiting_verification' ? '🔍 Verifying' : 
                         '⏳ Pending Payment'}
                      </span>
                    </div>

                    {/* Upload Section */}
                    <div className="border-t border-gray-200 pt-4">
                      <label className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Upload className="w-4 h-4 text-orange-500" />
                        Upload Payment Proof *
                      </label>
                      
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePaymentProofUpload(e, payment.$id)}
                        className="hidden"
                        id={`proof-upload-${payment.$id}`}
                        disabled={isUploading}
                      />
                      
                      {hasProof ? (
                        <div className="relative">
                          <img src={proofData.preview} alt="Payment Proof" className="w-full rounded-lg border-2 border-gray-300" />
                          <button
                            onClick={() => handleRemoveProof(payment.$id)}
                            disabled={isUploading}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <label 
                          htmlFor={`proof-upload-${payment.$id}`}
                          className="flex flex-col items-center justify-center py-8 cursor-pointer bg-gray-50 hover:bg-orange-50 rounded-lg transition-colors border-2 border-dashed border-gray-300"
                        >
                          <Upload className="w-10 h-10 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-900 font-medium">Click to upload</p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                        </label>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={() => handleSubmit(payment)}
                      disabled={!hasProof || isUploading}
                      className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
                        !hasProof || isUploading
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-orange-500 hover:bg-orange-600 active:scale-95'
                      }`}
                    >
                      {isUploading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Clock className="w-5 h-5 animate-spin" />
                          Submitting...
                        </span>
                      ) : (
                        `Submit Payment #${index + 1}`
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
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
              src="https://ik.imagekit.io/7grri5v7d/bni_card-removebg-preview.png" 
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
