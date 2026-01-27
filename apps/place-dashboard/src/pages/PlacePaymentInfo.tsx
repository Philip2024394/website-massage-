// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState } from 'react';
import { ArrowLeft, Save, CreditCard, Upload, FileCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { placesService } from '../../../../src/lib/appwriteService';
import { showToast } from '../../../../src/utils/showToastPortal';
import type { Place } from '../../../../src/types.ts';

interface PlacePaymentInfoProps {
  place: Place | null;
  onBack: () => void;
}

const PlacePaymentInfo: React.FC<PlacePaymentInfoProps> = ({ place, onBack }) => {
  const [bankName, setBankName] = useState((place as any)?.bankName || '');
  const [accountName, setAccountName] = useState((place as any)?.accountName || '');
  const [accountNumber, setAccountNumber] = useState((place as any)?.accountNumber || '');
  const [ktpIdCard, setKtpIdCard] = useState<File | null>(null);
  const [ktpPreview, setKtpPreview] = useState<string>((place as any)?.ktpPhotoUrl || '');
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
    if (!place) {
      showToast('⚠️ Place data not found', 'error');
      return;
    }

    // Check if KTP is uploaded
    if (!ktpPreview && !(place as any)?.ktpPhotoUrl) {
      showToast('⚠️ Please upload your KTP ID card for verification', 'error');
      return;
    }

    setSaving(true);
    try {
      let ktpPhotoUrl = (place as any)?.ktpPhotoUrl || '';
      
      // Upload KTP if new file is selected
      if (ktpIdCard) {
        setUploading(true);
        // Use placesService uploadImage for places
        const fileId = `ktp-place-${place.$id || place.id}-${Date.now()}`;
        const uploadResult = await placesService.uploadImage(fileId, ktpIdCard);
        ktpPhotoUrl = uploadResult.url;
        setUploading(false);
      }

      // Update place data
      await placesService.update(String(place.$id || place.id), {
        bankName: bankName.trim(),
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim(),
        ktpPhotoUrl: ktpPhotoUrl,
        ktpVerified: false, // Reset verification when details change
      } as any);

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

  // Check if account name matches place name
  React.useEffect(() => {
    if (accountName.trim() && place?.name) {
      const namesMatch = accountName.toLowerCase().includes(place.name.toLowerCase()) ||
                         place.name.toLowerCase().includes(accountName.toLowerCase());
      setNameMatchWarning(!namesMatch);
    } else {
      setNameMatchWarning(false);
    }
  }, [accountName, place?.name]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">💳 Payment Information</h1>
                <p className="text-sm text-gray-600">Manage your bank details for receiving payments</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Info Banner */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <CreditCard className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-lg font-bold text-blue-900 mb-2">Direct P2P Payment System</h2>
                <p className="text-sm text-blue-700 mb-3">
                  Our platform facilitates connections between you and customers, but <strong>does not process payments</strong>.
                  All payments are made directly from the customer to you after service completion.
                </p>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li>Your bank details will only be shared with customers <strong>after</strong> the massage is completed</li>
                  <li>You receive 100% of the payment directly into your account</li>
                  <li>No platform fees or commission on payments</li>
                  <li>Update your bank details anytime</li>
                </ul>
              </div>
            </div>
          </div>

          {/* KTP ID Card Upload Section */}
          <div className="mb-8 p-6 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
            <div className="flex items-start gap-4 mb-4">
              <FileCheck className="w-8 h-8 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-lg font-bold text-yellow-900 mb-2">🆔 KTP Verification Required</h2>
                <p className="text-sm text-yellow-800 mb-2">
                  For your security and customer trust, please upload a clear photo of your <strong>Indonesian ID Card (KTP)</strong>.
                </p>
                <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                  <li>Ensures your bank account name matches your legal identity</li>
                  <li>Builds customer confidence in booking your services</li>
                  <li>Protects against fraud and identity theft</li>
                  <li>Required for payment processing verification</li>
                </ul>
              </div>
            </div>

            {/* Upload Area */}
            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload KTP Photo <span className="text-red-500">*</span>
              </label>
              
              {ktpPreview ? (
                <div className="relative">
                  <img 
                    src={ktpPreview} 
                    alt="KTP Preview" 
                    className="w-full max-w-md rounded-lg border-2 border-gray-300"
                  />
                  <div className="mt-3 flex items-center gap-3">
                    {(place as any)?.ktpVerified ? (
                      <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-sm font-semibold">Verified by Admin</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-800 rounded-lg">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm font-semibold">Pending Verification</span>
                      </div>
                    )}
                    <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold">
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
                <label className="block w-full border-2 border-dashed border-gray-400 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-700 mb-1">Click to upload KTP photo</p>
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
                <div className="mt-3 flex items-center gap-2 text-blue-600">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <span className="text-sm font-semibold">Uploading KTP...</span>
                </div>
              )}
            </div>
          </div>

          {/* Bank Details Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bank Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g., Bank Central Asia, Bank Mandiri, BRI, BNI"
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors text-base"
              />
              <p className="text-xs text-gray-500 mt-1">Enter the name of your bank</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Account Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="e.g., John Doe / Business Name"
                className={`w-full border-2 rounded-lg px-4 py-3 focus:outline-none transition-colors text-base ${
                  nameMatchWarning ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the name registered on your bank account (must match your KTP)
              </p>
              {nameMatchWarning && (
                <div className="mt-2 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-700">
                    <strong>Warning:</strong> Account name should match the name on your KTP ID card or business registration.
                    Mismatched names may delay verification.
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Account Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="e.g., 1234567890"
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors text-base font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">Enter your bank account number</p>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving || !bankName.trim() || !accountName.trim() || !accountNumber.trim()}
              className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:transform-none flex items-center justify-center gap-3"
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
                  <Save className="w-6 h-6" />
                  Save Payment Information
                </>
              )}
            </button>
            
            {(!bankName.trim() || !accountName.trim() || !accountNumber.trim()) && (
              <p className="text-sm text-red-600 text-center mt-3">
                ⚠️ Please fill in all fields to save your payment information
              </p>
            )}
          </div>

          {/* Preview Section */}
          {bankName.trim() && accountName.trim() && accountNumber.trim() && (
            <div className="mt-8 p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Preview (How customers will see it):</h3>
              <div className="bg-white rounded-lg p-4 space-y-2 border border-gray-300">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Bank Name:</span>
                  <span className="text-sm font-semibold text-gray-900">{bankName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Account Name:</span>
                  <span className="text-sm font-semibold text-gray-900">{accountName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Account Number:</span>
                  <span className="text-sm font-mono font-semibold text-gray-900">{accountNumber}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PlacePaymentInfo;
