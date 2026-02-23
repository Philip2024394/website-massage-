/**
 * Place Verified Page – Massage City Place verification documents upload.
 * User selects document type from dropdown (with explanation), then uploads the file.
 */

import React, { useState } from 'react';
import { ShieldCheck, Upload, ChevronDown, FileText, ArrowLeft } from 'lucide-react';
import ImageUpload from '../../../../src/components/ImageUpload';

export const VERIFICATION_DOCUMENT_TYPES = [
  {
    id: 'id_passport',
    label: 'ID – Passport or ID Card',
    description: 'Upload a clear photo or scan of your passport or national ID card. The document must show your full name and photo. Accepted formats: JPG, PNG, PDF.',
  },
  {
    id: 'business_registration',
    label: 'Business registration',
    description: 'Upload your business registration document (e.g. NIB, TDP, SIUP, or equivalent in your country). The document must show the registered business name and registration number.',
  },
  {
    id: 'bank_header',
    label: 'Bank header with company name and address',
    description: 'Upload a bank statement or official bank letterhead showing your business (company) name and address. This confirms your business bank account details for verification.',
  },
  {
    id: 'government_letter',
    label: 'Official government letter with business name and address',
    description: 'Upload an official government letter (e.g. from tax office, local authority, or business registry) that shows your business name and registered address.',
  },
] as const;

export type VerificationDocTypeId = typeof VERIFICATION_DOCUMENT_TYPES[number]['id'];

interface PlaceVerifiedPageProps {
  placeId: string;
  onBack: () => void;
  onUpload?: (docType: VerificationDocTypeId, imageUrl: string) => Promise<void>;
}

const PlaceVerifiedPage: React.FC<PlaceVerifiedPageProps> = ({ placeId, onBack, onUpload }) => {
  const [selectedDocType, setSelectedDocType] = useState<VerificationDocTypeId | ''>('');
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedMeta = selectedDocType
    ? VERIFICATION_DOCUMENT_TYPES.find((d) => d.id === selectedDocType)
    : null;

  const handleImageChange = (imageDataUrl: string) => {
    setUploadedUrl(imageDataUrl);
  };

  const handleSubmit = async () => {
    if (!selectedDocType || !uploadedUrl) return;
    setIsSubmitting(true);
    try {
      await onUpload?.(selectedDocType as VerificationDocTypeId, uploadedUrl);
      setUploadedUrl(null);
      setSelectedDocType('');
    } catch (e) {
      console.error('Upload failed', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-700"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Get Verified</h1>
                <p className="text-sm text-gray-600">Upload documents to get your verified badge</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 max-w-xl mx-auto">
        {/* Document type dropdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Document type to verify</label>
          <p className="text-xs text-gray-500 mb-3">Select the type of document you want to upload. Each option explains what we need.</p>
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-white text-left focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <span className={selectedMeta ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                {selectedMeta ? selectedMeta.label : 'Select document type…'}
              </span>
              <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {dropdownOpen && (
              <>
                <div className="absolute inset-0 z-10" aria-hidden onClick={() => setDropdownOpen(false)} />
                <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {VERIFICATION_DOCUMENT_TYPES.map((doc) => (
                    <li key={doc.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDocType(doc.id);
                          setDropdownOpen(false);
                          setUploadedUrl(null);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-amber-50 border-b border-gray-100 last:border-0 flex items-start gap-2"
                      >
                        <FileText className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span className="font-medium text-gray-900">{doc.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          {selectedMeta && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-900">{selectedMeta.description}</p>
            </div>
          )}
        </div>

        {/* Upload area */}
        {selectedDocType && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload document</label>
            <ImageUpload
              id="verified-doc-upload"
              label=""
              currentImage={uploadedUrl}
              onImageChange={handleImageChange}
              heightClass="h-40"
            />
            <p className="text-xs text-gray-500 mt-2">Upload a clear photo or scan. PDF, JPG or PNG.</p>
            <button
              type="button"
              disabled={!uploadedUrl || isSubmitting}
              onClick={handleSubmit}
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 px-4 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              <Upload className="w-5 h-5" />
              {isSubmitting ? 'Submitting…' : 'Submit for verification'}
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Why get verified?</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Verified badge on your profile builds trust with customers</li>
            <li>• Your place appears with a verified badge on the hero image</li>
            <li>• Admin will review your documents and approve within 48 hours</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PlaceVerifiedPage;
