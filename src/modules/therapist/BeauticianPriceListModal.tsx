/**
 * Beautician treatment menu slider modal – same pattern as TherapistPriceListModal.
 * Shows 4 treatments (real 1–3 + sample fill): name, estimated time, fixed price.
 * Book via WhatsApp opens prefilled beautician booking message to admin.
 */

import React from 'react';
import { StarIcon } from '../../components/therapist/TherapistIcons';
import { getTherapistDisplayName } from '../../utils/therapistCardHelpers';
import { buildBeauticianBookingMessage, getBookingWhatsAppNumber, buildWhatsAppUrl } from '../../utils/whatsappBookingMessages';
import { APP_CONSTANTS } from '../../constants/appConstants';
import type { BeauticianTreatment } from '../../types';

const ADMIN_WHATSAPP = APP_CONSTANTS.DEFAULT_CONTACT_NUMBER ?? '';
const ADMIN_DIGITS = (ADMIN_WHATSAPP && String(ADMIN_WHATSAPP).replace(/\D/g, '')) || '6281392000050';

function formatTreatmentPrice(t: BeauticianTreatment): string {
  const currency = t.currency ?? 'IDR';
  const p = t.fixed_price ?? 0;
  if (currency === 'IDR') {
    return p >= 1000 ? `IDR ${(p / 1000).toFixed(0)}K` : `IDR ${p}`;
  }
  return `€${p}`;
}

interface BeauticianPriceListModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  therapist: any;
  displayRating: string;
  /** Combined treatments for slider (real + sample fill to 4). */
  treatments: BeauticianTreatment[];
  chatLang?: string;
}

const BeauticianPriceListModal: React.FC<BeauticianPriceListModalProps> = ({
  showModal,
  setShowModal,
  therapist,
  displayRating,
  treatments,
  chatLang = 'id',
}) => {
  const displayName = getTherapistDisplayName(therapist?.name);

  const handleBook = (t: BeauticianTreatment) => {
    const message = buildBeauticianBookingMessage({
      beauticianName: displayName,
      treatmentName: t.treatment_name || 'Treatment',
      fixedPrice: t.fixed_price,
      estimatedDurationMin: t.estimated_duration_minutes,
      currency: t.currency,
    });
    const phone = getBookingWhatsAppNumber(therapist, ADMIN_WHATSAPP || undefined) || ADMIN_DIGITS;
    const url = buildWhatsAppUrl(phone, message) || `https://wa.me/${ADMIN_DIGITS}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] bg-black bg-opacity-50 transition-opacity duration-300"
      onClick={() => setShowModal(false)}
    >
      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
      <div
        className="absolute bottom-0 left-0 right-0 h-full w-full bg-white transform transition-transform duration-300 ease-out"
        style={{ animation: 'slideUp 0.3s ease-out forwards' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between bg-gradient-to-r from-orange-500 to-orange-600 sticky top-0">
          <div className="flex items-center gap-3 flex-1">
            <img
              src={(therapist as any)?.profilePicture || (therapist as any)?.mainImage || '/default-avatar.jpg'}
              alt={displayName}
              className="w-11 h-11 rounded-full border-2 border-white object-cover"
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.jpg'; }}
            />
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">{displayName}</h2>
              <div className="flex items-center gap-2 text-xs">
                <StarIcon className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                <span className="font-bold text-black bg-white/90 rounded px-1.5 py-0.5 shadow-sm">{displayRating}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowModal(false)}
            className="flex items-center justify-center w-8 h-8 bg-black/70 hover:bg-black rounded-full transition-colors"
            aria-label="Close"
          >
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-4 py-2">
          <div className="text-sm sm:text-base font-bold text-gray-900">
            {chatLang === 'id' ? 'Daftar Perawatan' : 'Treatment Menu'}
          </div>
          <p className="text-xs text-gray-600 mt-0.5">
            {chatLang === 'id' ? 'Harga tetap per item. Klik "Book via WhatsApp" untuk pesan.' : 'Fixed price per item. Click "Book via WhatsApp" to send your request.'}
          </p>
        </div>

        <div className="flex-1 p-4 max-h-[70vh] overflow-y-auto">
          {treatments.length > 0 ? (
            <div className="bg-white rounded-lg border border-orange-200 overflow-hidden shadow-lg">
              <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200">
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {chatLang === 'id' ? 'Menu Perawatan' : 'Treatments'}
                </h2>
                <p className="text-gray-600 text-sm">
                  {chatLang === 'id' ? 'Harga tetap per perawatan. Pilih lalu pesan via WhatsApp.' : 'Fixed price per treatment. Select and book via WhatsApp.'}
                </p>
              </div>
              <div className="space-y-4 p-4">
                {treatments.map((t, index) => (
                  <div
                    key={index}
                    className="rounded-xl border-2 border-gray-200 bg-gray-100 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-gray-900 mb-1">
                        {t.treatment_name || `Treatment ${index + 1}`}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {chatLang === 'id' ? 'Perkiraan waktu' : 'Estimated time'}: {t.estimated_duration_minutes} min
                      </p>
                      <p className="text-sm font-semibold text-gray-800 mt-1">
                        {formatTreatmentPrice(t)}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleBook(t)}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto font-semibold py-2.5 px-4 rounded-full bg-[#25D366] text-white hover:bg-[#20BD5A] active:scale-[0.98] transition-colors"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        {chatLang === 'id' ? 'Pesan via WhatsApp' : 'Book via WhatsApp'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-gray-200 p-6 text-center text-gray-500">
              {chatLang === 'id' ? 'Belum ada perawatan.' : 'No treatments yet.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BeauticianPriceListModal;
