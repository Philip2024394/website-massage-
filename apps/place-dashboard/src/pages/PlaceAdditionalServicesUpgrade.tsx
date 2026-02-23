// @ts-nocheck
/**
 * Place Additional Services Upgrade – Massage city places: upgrade to list 10 or 15 additional services per year.
 * Transfer to admin bank account, upload payment proof. Activation is immediate once proof is sent.
 * Admin dashboard can check proof and activate/deactivate the upgraded service.
 */
import React, { useState } from 'react';
import { ArrowLeft, Upload, Building2, CheckCircle, AlertCircle } from 'lucide-react';
import { placesService } from '../../../../src/lib/appwriteService';
import { imageUploadService } from '../../../../src/lib/appwriteService';
import { showToast } from '../../../../src/utils/showToastPortal';
import { ADDITIONAL_SERVICES_TIERS } from '../../../../src/constants/appConstants';

const ADMIN_BANK = {
  bankName: 'Bank Mandiri',
  accountName: 'PT IndaStreet Indonesia',
  accountNumber: '1370-0123-4567-890',
};

interface PlaceAdditionalServicesUpgradeProps {
  place: any;
  onBack: () => void;
}

const PlaceAdditionalServicesUpgrade: React.FC<PlaceAdditionalServicesUpgradeProps> = ({ place, onBack }) => {
  const [selectedTier, setSelectedTier] = useState<'10' | '15' | null>(null);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const currentLimit = (place as any)?.additionalServicesLimit ?? 3;
  const tier10 = ADDITIONAL_SERVICES_TIERS.TIER_10;
  const tier15 = ADDITIONAL_SERVICES_TIERS.TIER_15;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file (PNG, JPG)', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be less than 5MB', 'error');
      return;
    }
    setPaymentProof(file);
    const reader = new FileReader();
    reader.onloadend = () => setPaymentProofPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!place?.$id && !place?.id) {
      showToast('Place data not found', 'error');
      return;
    }
    if (!selectedTier) {
      showToast('Please select an upgrade tier (10 or 15 services)', 'error');
      return;
    }
    if (!paymentProof) {
      showToast('Please upload payment proof', 'error');
      return;
    }

    setSubmitting(true);
    setUploading(true);
    try {
      const placeId = String(place.$id || place.id);
      let proofUrl = '';

      try {
        proofUrl = await imageUploadService.uploadImage(paymentProof, 'place-additional-services-proof');
      } catch (uploadErr) {
        console.error('Upload error:', uploadErr);
        showToast('Failed to upload image. Please try again.', 'error');
        setUploading(false);
        setSubmitting(false);
        return;
      }

      setUploading(false);
      if (!proofUrl) {
        showToast('Upload did not return a URL. Please try again.', 'error');
        setSubmitting(false);
        return;
      }

      const limit = selectedTier === '10' ? 10 : 15;
      await placesService.update(placeId, {
        additionalServicesLimit: limit,
        additionalServicesUpgradeProofUrl: proofUrl,
        additionalServicesUpgradeRequestedAt: new Date().toISOString(),
        additionalServicesUpgradeTier: limit,
        additionalServicesUpgradeStatus: 'pending',
      } as any);

      showToast('Payment proof submitted. Your upgrade will be active immediately after admin verification.', 'success');
      onBack();
    } catch (err) {
      console.error('Submit error:', err);
      showToast('Failed to submit. Please try again.', 'error');
    } finally {
      setUploading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">List more services</h1>
              <p className="text-sm text-gray-600">Upgrade your additional services listing</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Info */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
          <p className="text-sm text-gray-800">
            Massage city places can list up to <strong>3 additional services</strong> included. Upgrade to list more per year:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-gray-800">
            <li>• Up to 10 services — {tier10.label}</li>
            <li>• Up to 15 services — {tier15.label}</li>
          </ul>
        </div>

        {/* Activation notice */}
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex gap-3">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-900">Activation is immediate</h3>
            <p className="text-sm text-green-800 mt-1">
              Once you send proof of payment, the upgraded service that you chose will be active. Admin will verify your proof and can activate or deactivate the service from the admin dashboard.
            </p>
          </div>
        </div>

        {/* Current limit */}
        {currentLimit > 3 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-sm text-blue-800">
            Your current limit: <strong>up to {currentLimit} additional services</strong>
          </div>
        )}

        {/* Tier selection */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Choose upgrade</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedTier('10')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selectedTier === '10' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 bg-white hover:border-amber-300'
              }`}
            >
              <p className="font-bold text-gray-900">Up to 10 services</p>
              <p className="text-sm text-amber-700 font-semibold mt-1">{tier10.label}</p>
            </button>
            <button
              type="button"
              onClick={() => setSelectedTier('15')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selectedTier === '15' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 bg-white hover:border-amber-300'
              }`}
            >
              <p className="font-bold text-gray-900">Up to 15 services</p>
              <p className="text-sm text-amber-700 font-semibold mt-1">{tier15.label}</p>
            </button>
          </div>
        </div>

        {/* Bank transfer details */}
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          <div className="bg-gray-100 px-4 py-3 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Transfer to admin bank account</h3>
          </div>
          <div className="p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Bank:</span>
              <span className="font-semibold text-gray-900">{ADMIN_BANK.bankName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Account name:</span>
              <span className="font-semibold text-gray-900">{ADMIN_BANK.accountName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Account number:</span>
              <span className="font-semibold text-gray-900 font-mono">{ADMIN_BANK.accountNumber}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-gray-600">Amount:</span>
              <span className="font-bold text-amber-600">
                {selectedTier === '10' ? 'Rp 200.000' : selectedTier === '15' ? 'Rp 250.000' : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Upload payment proof */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Upload className="w-5 h-5 text-amber-600" />
            Upload payment proof
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            After transferring the amount, upload a screenshot or photo of your transfer confirmation.
          </p>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-amber-400 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="payment-proof-upgrade"
            />
            <label htmlFor="payment-proof-upgrade" className="cursor-pointer block">
              {paymentProofPreview ? (
                <div className="space-y-2">
                  <img src={paymentProofPreview} alt="Payment proof" className="max-h-48 mx-auto rounded-lg border border-gray-200" />
                  <p className="text-sm text-green-600 font-semibold">Image uploaded</p>
                  <p className="text-xs text-gray-500">Click to change</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-12 h-12 mx-auto text-gray-400" />
                  <p className="text-sm text-gray-600">Click to upload payment proof</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </div>
              )}
            </label>
          </div>
          {uploading && (
            <p className="mt-2 text-sm text-amber-600 flex items-center gap-2">
              <span className="animate-spin inline-block w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full" />
              Uploading...
            </p>
          )}
        </div>

        {/* Reminder */}
        <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-900">
            Activation is immediate once you submit. Admin will check your proof and can activate or deactivate the upgraded service from the admin dashboard.
          </p>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!selectedTier || !paymentProof || submitting || uploading}
          className="w-full py-4 rounded-xl font-bold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              Submitting...
            </>
          ) : (
            'Submit payment proof'
          )}
        </button>
      </main>
    </div>
  );
};

export default PlaceAdditionalServicesUpgrade;
