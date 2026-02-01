// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
/**
 * Legal Terms Modal Component
 * Displays full terms and requires acceptance
 * Non-dismissible until terms are accepted
 */

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { FULL_TERMS_DOCUMENT, LEGAL_TERMS, validateTermsAcceptance } from '../../src/legal/terms';
import { databases } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../../app/packages/auth/src/config';

interface TermsModalProps {
  isOpen: boolean;
  userType: 'therapist' | 'massage_place' | 'facial_place';
  userId: string;
  memberDocId: string;
  language?: 'en' | 'id';
  onAccept: () => void;
  canDismiss?: boolean; // Allow dismissal only for non-mandatory views
}

export const TermsModal: React.FC<TermsModalProps> = ({
  isOpen,
  userType,
  userId,
  memberDocId,
  language = 'en',
  onAccept,
  canDismiss = false
}) => {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset scroll state when modal opens
  useEffect(() => {
    if (isOpen) {
      setHasScrolled(false);
      setError(null);
    }
  }, [isOpen]);

  // Handle scroll to track if user has read terms
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrolledToBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    if (scrolledToBottom && !hasScrolled) {
      setHasScrolled(true);
    }
  };

  // Handle terms acceptance
  const handleAccept = async () => {
    setAccepting(true);
    setError(null);

    try {
      // Get collection ID based on user type
      const collectionId = userType === 'therapist' 
        ? APPWRITE_CONFIG.collections.therapists 
        : userType === 'massage_place'
        ? APPWRITE_CONFIG.collections.places
        : APPWRITE_CONFIG.collections.facialPlaces;

      // Update member document with acceptance data
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        collectionId,
        memberDocId,
        {
          termsAccepted: true,
          termsAcceptedAt: new Date().toISOString(),
          independentContractor: true,
          updatedAt: new Date().toISOString()
        }
      );

      console.log('✅ LEGAL_TERMS_ENFORCEMENT_ACTIVE - Terms accepted by:', userId);
      
      // Call parent callback
      onAccept();
    } catch (err) {
      console.error('❌ Error accepting terms:', err);
      setError(language === 'id' 
        ? 'Gagal menyimpan penerimaan syarat. Silakan coba lagi.' 
        : 'Failed to save terms acceptance. Please try again.'
      );
    } finally {
      setAccepting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {FULL_TERMS_DOCUMENT.title}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {language === 'id' ? 'Versi' : 'Version'} {FULL_TERMS_DOCUMENT.version} - {language === 'id' ? 'Terakhir diperbarui' : 'Last updated'}: {FULL_TERMS_DOCUMENT.lastUpdated}
            </p>
          </div>
          {canDismiss && (
            <button
              onClick={() => onAccept()}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Content - Scrollable */}
        <div 
          className="flex-1  px-6 py-4"
          onScroll={handleScroll}
        >
          {/* Important Notice */}
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="font-semibold text-orange-800 mb-1">
                  {language === 'id' ? 'Pemberitahuan Penting' : 'Important Notice'}
                </p>
                <p className="text-sm text-orange-700">
                  {language === 'id' 
                    ? 'Harap baca seluruh syarat dan ketentuan ini dengan seksama. Dengan menerima, Anda menyetujui untuk beroperasi sebagai kontraktor independen dan bertanggung jawab penuh atas pajak, lisensi, dan kepatuhan hukum Anda.'
                    : 'Please read these entire terms and conditions carefully. By accepting, you agree to operate as an independent contractor and take full responsibility for your taxes, licenses, and legal compliance.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Terms Sections */}
          {FULL_TERMS_DOCUMENT.sections.map((section, index) => (
            <div key={index} className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {index + 1}. {section.title}
              </h3>
              <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                {language === 'id' ? section.content : section.content}
              </div>
            </div>
          ))}

          {/* Scroll indicator */}
          {!hasScrolled && (
            <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-8 pb-4 text-center">
              <p className="text-sm text-gray-500 animate-pulse">
                ↓ {language === 'id' ? 'Gulir ke bawah untuk melanjutkan' : 'Scroll down to continue'} ↓
              </p>
            </div>
          )}
        </div>

        {/* Footer - Accept Button */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          {error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {!hasScrolled && (
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                {language === 'id' 
                  ? '📜 Silakan gulir ke bawah dan baca semua syarat sebelum menerima.'
                  : '📜 Please scroll down and read all terms before accepting.'
                }
              </p>
            </div>
          )}

          <button
            onClick={handleAccept}
            disabled={!hasScrolled || accepting}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center ${
              hasScrolled && !accepting
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {accepting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {language === 'id' ? 'Menyimpan...' : 'Saving...'}
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 mr-2" />
                {language === 'id' ? 'Saya Menerima Syarat & Ketentuan' : 'I Accept the Terms & Conditions'}
              </>
            )}
          </button>

          {!canDismiss && (
            <p className="text-xs text-center text-gray-500 mt-3">
              {language === 'id' 
                ? 'Anda harus menerima syarat untuk melanjutkan menggunakan platform.'
                : 'You must accept the terms to continue using the platform.'
              }
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TermsModal;

