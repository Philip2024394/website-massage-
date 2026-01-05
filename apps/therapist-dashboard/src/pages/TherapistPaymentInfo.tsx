// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState } from 'react';
import { Save, CreditCard, Upload, FileCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import TherapistPageHeader from '../components/TherapistPageHeader';
import { therapistService } from '../../../../lib/appwriteService';
import { showToast } from '../../../../utils/showToastPortal';
import PaymentCard from '../../../../components/PaymentCard';
import type { Therapist } from '../../../../types';

interface TherapistPaymentInfoProps {
  therapist: Therapist | null;
  onBack: () => void;
}

const TherapistPaymentInfo: React.FC<TherapistPaymentInfoProps> = ({ therapist, onBack }) => {
  const [bankName, setBankName] = useState(therapist?.bankName || '');
  const [accountName, setAccountName] = useState(therapist?.accountName || '');
  const [accountNumber, setAccountNumber] = useState(therapist?.accountNumber || '');
  const [ktpIdCard, setKtpIdCard] = useState<File | null>(null);
  const [ktpPreview, setKtpPreview] = useState<string>(therapist?.ktpPhotoUrl || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nameMatchWarning, setNameMatchWarning] = useState(false);

  const handleKtpUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('⚠️ Please upload an image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('⚠️ File size must be less than 5MB', 'error');
      return;
    }

    setKtpIdCard(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setKtpPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    showToast('✅ KTP ID card selected', 'success');
  };

  const handleSave = async () => {
    if (!therapist) {
      showToast('⚠️ Therapist data not found', 'error');
      return;
    }

    // Check if KTP is uploaded
    if (!ktpPreview && !therapist?.ktpPhotoUrl) {
      showToast('⚠️ Please upload your KTP ID card for verification', 'error');
      return;
    }

    setSaving(true);
    try {
      let ktpPhotoUrl = therapist?.ktpPhotoUrl || '';
      
      // Upload KTP if new file is selected
      if (ktpIdCard) {
        setUploading(true);
        const uploadResult = await therapistService.uploadKtpId(
          String(therapist.$id || therapist.id),
          ktpIdCard
        );
        ktpPhotoUrl = uploadResult.url;
        setUploading(false);
      }

      // Update therapist data
      await therapistService.update(String(therapist.$id || therapist.id), {
        bankName: bankName.trim(),
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim(),
        ktpPhotoUrl: ktpPhotoUrl,
        ktpVerified: false, // Reset verification when details change
      });

      showToast('✅ Payment information saved successfully! Admin will verify your KTP.', 'success');
      console.log('✅ Payment info saved:', { bankName, accountName, accountNumber, ktpPhotoUrl });
    } catch (error) {
      console.error('❌ Failed to save payment info:', error);
      showToast('❌ Failed to save payment information', 'error');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  // Check if account name matches therapist name
  React.useEffect(() => {
    if (accountName.trim() && therapist?.name) {
      const namesMatch = accountName.toLowerCase().includes(therapist.name.toLowerCase()) ||
                         therapist.name.toLowerCase().includes(accountName.toLowerCase());
      setNameMatchWarning(!namesMatch);
    } else {
      setNameMatchWarning(false);
    }
  }, [accountName, therapist?.name]);

  return (
    <div className="min-h-screen bg-white">
      <TherapistPageHeader
        title="Payment Information"
        subtitle="Manage your bank details"
        onBackToStatus={onBack}
        icon={<CreditCard className="w-6 h-6 text-blue-600" />}
      />

      {/* Main Content */}
      <main className="max-w-sm mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Info Section */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Direct P2P Payment System</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Our platform facilitates connections between you and customers, but does not process payments.
                  All payments are made directly from the customer to you after service completion.
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span className="text-xs text-gray-500">Shared after service completion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span className="text-xs text-gray-500">100% payment directly to you</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span className="text-xs text-gray-500">No platform fees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span className="text-xs text-gray-500">Update anytime</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* KTP ID Card Upload Section */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileCheck className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">KTP Verification Required</h2>
                <p className="text-sm text-gray-600 mb-4">
                  For your security and customer trust, please upload a clear photo of your Indonesian ID Card (KTP).
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span className="text-xs text-gray-500">Matches bank account identity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span className="text-xs text-gray-500">Builds customer confidence</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span className="text-xs text-gray-500">Protects against fraud</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span className="text-xs text-gray-500">Required for verification</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Upload KTP Photo <span className="text-orange-600">*</span>
              </label>
              
              {ktpPreview ? (
                <div className="space-y-4">
                  <img 
                    src={ktpPreview} 
                    alt="KTP Preview" 
                    className="w-full max-w-md rounded-lg border border-gray-300"
                  />
                  <div className="flex items-center gap-3">
                    {therapist?.ktpVerified ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg border border-green-200">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm">Verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg border border-orange-200">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">Pending</span>
                      </div>
                    )}
                    <label className="cursor-pointer px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm border border-gray-300">
                      Change Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleKtpUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-colors">
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-700 mb-1">Click to upload KTP photo</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleKtpUpload}
                    className="hidden"
                  />
                </label>
              )}
              
              {uploading && (
                <div className="mt-3 flex items-center gap-2 text-orange-600">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <span className="text-sm">Uploading KTP...</span>
                </div>
              )}
            </div>
          </div>

          {/* Live Preview Section */}
          {(bankName.trim() || accountName.trim() || accountNumber.trim()) && (
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Preview</h3>
                <p className="text-gray-600 text-sm">This is how your payment card will appear to customers</p>
              </div>
              
              <div className="flex justify-center mb-6">
                <PaymentCard
                  bankName={bankName || 'Your Bank Name'}
                  accountHolderName={accountName || 'YOUR ACCOUNT NAME'}
                  accountNumber={accountNumber || '0000000000000000'}
                  size="medium"
                />
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-orange-100 rounded">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-3">Payment Card Features</h4>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <span className="text-xs text-gray-500">Auto-shared on booking acceptance</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <span className="text-xs text-gray-500">Manual sharing in chat</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <span className="text-xs text-gray-500">Professional appearance</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <span className="text-xs text-gray-500">Required for bookings</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bank Details Form */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Bank Account Details</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Bank Name <span className="text-orange-600">*</span>
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g., Bank Central Asia, Bank Mandiri, BRI, BNI"
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-colors"
                />
                <p className="text-xs text-gray-500 mt-2">Enter the name of your bank - updates live preview above</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Account Name <span className="text-orange-600">*</span>
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                  placeholder="e.g., JOHN DOE"
                  className={`w-full bg-white border rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none transition-colors uppercase ${
                    nameMatchWarning ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-orange-500'
                  }`}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Enter name as it appears on your bank account - updates card preview above
                </p>
                {nameMatchWarning && (
                    <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-red-600">
                      <span className="font-medium">Warning:</span> Account name should match the name on your KTP ID card ({therapist?.name}).
                      Mismatched names may delay verification.
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Account Number <span className="text-orange-600">*</span>
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d\s]/g, '');
                    setAccountNumber(value);
                  }}
                  placeholder="e.g., 1234567890123456"
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-colors font-mono"
                  maxLength={20}
                />
                <p className="text-xs text-gray-500 mt-2">Enter account number - see live format on card above</p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={saving || !bankName.trim() || !accountName.trim() || !accountNumber.trim()}
              className="w-full px-6 py-4 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold text-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] disabled:transform-none flex items-center justify-center gap-3 border border-orange-500/20"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Payment Information
                </>
              )}
            </button>
            
            {(!bankName.trim() || !accountName.trim() || !accountNumber.trim()) && (
              <p className="text-sm text-orange-600 text-center mt-3">
                Please fill in all fields to save your payment information
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TherapistPaymentInfo;
