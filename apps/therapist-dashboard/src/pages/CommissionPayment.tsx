// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState, useEffect } from 'react';
import { Wallet, Upload, Clock, AlertCircle, CheckCircle, Building2, User, Hash, Copy, Check, ArrowLeft } from 'lucide-react';
import { Therapist } from '../../../../types';
import { therapistService, imageUploadService } from '../../../../lib/appwriteService';
import { showToast } from '../../../../utils/showToastPortal';

interface CommissionPaymentProps {
  therapist: Therapist | null;
  onBack?: () => void;
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
  onBack
}) => {
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string>('');
  const [adminPaymentDetails, setAdminPaymentDetails] = useState<AdminPaymentDetails>({
    bankName: 'BNI',
    accountName: 'Philip Francis O Farrell',
    accountNumber: '1354188005',
    swiftCode: 'BNINIDJA'
  });
  
  // Demo data - in production, fetch from pending commissions
  const bookingAmount = 500000;
  const commissionRate = 0.30;
  const commissionAmount = bookingAmount * commissionRate;
  const bookingId = 'demo-booking-123';
  
  // Fetch admin bank details from Appwrite
  useEffect(() => {
    const fetchAdminSettings = async () => {
      try {
        const { databases } = await import('../../../../lib/appwrite');
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



  const handlePaymentProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setPaymentProof(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPaymentProofPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    showToast('✅ Payment proof selected', 'success');
  };

  const handleSubmit = async () => {
    if (!therapist) {
      showToast('❌ No therapist data found', 'error');
      return;
    }

    if (!paymentProof && !paymentProofPreview) {
      showToast('⚠️ Please upload payment proof', 'error');
      return;
    }

    setUploading(true);
    try {
      let paymentProofUrl = paymentProofPreview;

      if (paymentProof) {
        try {
          paymentProofUrl = await imageUploadService.uploadImage(paymentProof, 'commission-proofs');
          showToast('✅ Payment proof uploaded', 'success');
        } catch (error) {
          console.error('Failed to upload payment proof:', error);
          showToast('❌ Failed to upload payment proof', 'error');
          setUploading(false);
          return;
        }
      }

      // Save commission payment record
      const commissionPayment = {
        bookingId,
        therapistId: String(therapist.$id || therapist.id),
        amount: commissionAmount,
        proofUrl: paymentProofUrl,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };

      // In production, save to commissionPayments collection
      // await commissionService.create(commissionPayment);

      showToast('✅ Payment proof submitted! Account remains active.', 'success');
      
      // Close payment window after successful submission
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Failed to submit payment proof:', error);
      showToast('❌ Failed to submit payment proof', 'error');
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    showToast(`✅ ${label} copied!`, 'success');
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="w-full bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3 py-4 px-5">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-black">Payments 30%</h1>
              <p className="text-xs text-gray-600">Pay commission per booking</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-5 space-y-4 max-w-7xl mx-auto">

        {/* Commission Summary Card */}
        <div className="bg-white border border-black rounded-lg p-3 sm:p-4">
          <h3 className="text-sm sm:text-base font-bold text-black mb-3">Payment Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600">Booking Amount:</span>
              <span className="font-semibold text-black">IDR {bookingAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600">Commission Rate:</span>
              <span className="font-semibold text-black">30%</span>
            </div>
            <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between">
              <span className="text-sm sm:text-base font-bold text-black">Amount Due:</span>
              <span className="text-base sm:text-lg font-bold text-orange-500">IDR {commissionAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Admin Payment Card */}
        <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden">
          <img 
            src="https://ik.imagekit.io/7grri5v7d/bni_card-removebg-preview.png" 
            alt="BNI Card" 
            className="w-full h-full object-contain"
          />
        </div>

        {/* Info Notice */}
        <div className="bg-white border border-gray-300 rounded-lg p-3 sm:p-4">
          <div className="flex gap-2 sm:gap-3">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div className="w-full">
              <p className="text-xs sm:text-sm font-bold text-black mb-1">Payment Instructions</p>
              <ul className="text-xs sm:text-sm text-gray-700 space-y-1 mb-3 sm:mb-4">
                <li>• Transfer the commission amount to the account above</li>
                <li>• Take a clear photo of the transaction receipt</li>
                <li>• Upload the payment proof below</li>
                <li>• Your commission will be verified within 24 hours</li>
              </ul>

              {/* Official Bank Details */}
              <div className="bg-white border-2 border-orange-300 rounded-lg p-2 sm:p-3 mt-2 sm:mt-3">
                <p className="text-xs font-bold text-orange-600 uppercase tracking-wide mb-2">⚠️ Official Payment Account Only</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-2">
                  <div>
                    <span className="text-gray-600 font-semibold">Bank:</span>
                    <p className="text-black font-bold">{adminPaymentDetails.bankName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 font-semibold">Account Number:</span>
                    <p className="text-black font-bold font-mono text-xs break-all">{adminPaymentDetails.accountNumber}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 font-semibold">Account Name:</span>
                    <p className="text-black font-bold text-xs">{adminPaymentDetails.accountName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 font-semibold">SWIFT Code:</span>
                    <p className="text-black font-bold font-mono text-xs">{adminPaymentDetails.swiftCode}</p>
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded p-2 mt-2">
                  <p className="text-xs text-red-700 font-semibold">
                    🛡️ <strong>Security Warning:</strong> Payments are ONLY made to this account. Never pay anyone asking for payment if the details don't match these exact details. Report any suspicious requests immediately.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Payment Proof */}
        <div className="bg-white border border-gray-300 rounded-lg p-3 sm:p-4">
          <label className="block text-xs sm:text-sm font-bold text-black mb-3 flex items-center gap-2">
            <Upload className="w-4 h-4 text-orange-500" />
            Upload Payment Proof *
          </label>
          
          <input
            type="file"
            accept="image/*"
            onChange={handlePaymentProofUpload}
            className="hidden"
            id="commission-proof-upload"
          />
          
          {paymentProofPreview ? (
            <div className="relative">
              <img src={paymentProofPreview} alt="Payment Proof" className="w-full rounded-lg border border-gray-300" />
              <button
                onClick={() => { setPaymentProof(null); setPaymentProofPreview(''); }}
                className="absolute top-2 right-2 p-1.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label htmlFor="commission-proof-upload" className="flex flex-col items-center justify-center py-6 sm:py-8 cursor-pointer bg-gray-50 hover:bg-orange-50 rounded-lg transition-colors border border-dashed border-gray-300">
              <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mb-2" />
              <p className="text-xs sm:text-sm text-black font-medium">Click to upload</p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
            </label>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={uploading || !paymentProofPreview}
          className={`w-full py-3 sm:py-4 rounded-lg font-semibold text-white transition-all text-sm sm:text-base ${
            uploading || !paymentProofPreview ? 'bg-gray-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
          }`}
        >
          {uploading ? 'Submitting...' : 'Submit Payment'}
        </button>
      </div>
    </div>
  );
};

export default CommissionPayment;
