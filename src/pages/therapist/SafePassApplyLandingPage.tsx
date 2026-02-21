/**
 * Safe Pass Apply Landing Page
 * For beauticians and therapists: choose to apply for Hotel Safe Pass or Villa Safe Pass.
 * Both options lead to the same application flow (therapist-hotel-villa-safe-pass).
 */
import React from 'react';
import { Shield, Building, Home, ChevronRight } from 'lucide-react';
import TherapistSimplePageLayout from '../../components/therapist/TherapistSimplePageLayout';
import type { Therapist } from '../../types';

interface SafePassApplyLandingPageProps {
  therapist: Therapist | null;
  onBack: () => void;
  onNavigate?: (page: string) => void;
  language?: 'en' | 'id';
}

const SafePassApplyLandingPage: React.FC<SafePassApplyLandingPageProps> = ({
  therapist,
  onBack,
  onNavigate,
  language = 'id',
}) => {
  const isId = language === 'id';

  const copy = {
    title: isId ? 'Apply Safe Pass' : 'Apply Safe Pass',
    subtitle: isId
      ? 'Pilih jenis Safe Pass yang ingin Anda ajukan'
      : 'Choose which Safe Pass you want to apply for',
    hotel: {
      title: isId ? 'Hotel Safe Pass' : 'Hotel Safe Pass',
      desc: isId
        ? 'Sertifikasi untuk layanan di hotel. Upload surat rekomendasi dari hotel, lengkapi profil, dan bayar biaya sertifikasi.'
        : 'Certification to provide services at hotels. Upload recommendation letters, complete your profile, and pay the certification fee.',
    },
    villa: {
      title: isId ? 'Villa Safe Pass' : 'Villa Safe Pass',
      desc: isId
        ? 'Sertifikasi untuk layanan di villa. Upload surat rekomendasi dari villa, lengkapi profil, dan bayar biaya sertifikasi.'
        : 'Certification to provide services at villas. Upload recommendation letters, complete your profile, and pay the certification fee.',
    },
    apply: isId ? 'Apply' : 'Apply',
  };

  const handleBackToStatus = () => {
    onNavigate?.('therapist-status') ?? onBack();
  };

  return (
    <TherapistSimplePageLayout
      title={copy.title}
      subtitle={copy.subtitle}
      onBackToStatus={handleBackToStatus}
      onNavigate={onNavigate}
      therapist={therapist}
      currentPage="therapist-safe-pass-apply"
      icon={<Shield className="w-6 h-6 text-orange-600" />}
      language={language}
      containerClassName="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gradient-to-b from-orange-50 to-white"
    >
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <section className="bg-white rounded-2xl border border-orange-100 overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {isId ? 'Pilih jenis Safe Pass' : 'Choose Safe Pass type'}
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {/* Hotel Safe Pass card */}
            <div className="rounded-xl border-2 border-orange-100 bg-orange-50/50 p-5 hover:border-orange-200 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{copy.hotel.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{copy.hotel.desc}</p>
                  <button
                    type="button"
                    onClick={() => onNavigate?.('therapist-hotel-villa-safe-pass')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 font-medium text-sm transition-colors"
                  >
                    {copy.apply}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Villa Safe Pass card */}
            <div className="rounded-xl border-2 border-orange-100 bg-orange-50/50 p-5 hover:border-orange-200 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{copy.villa.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{copy.villa.desc}</p>
                  <button
                    type="button"
                    onClick={() => onNavigate?.('therapist-hotel-villa-safe-pass')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 font-medium text-sm transition-colors"
                  >
                    {copy.apply}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <p className="text-center text-xs text-gray-500">
          {isId
            ? 'Satu aplikasi mencakup Hotel & Villa. Setelah disetujui, Anda dapat membayar biaya dan menerima kartu Safe Pass.'
            : 'One application covers both Hotel & Villa. After approval, you can pay the fee and receive your Safe Pass card.'}
        </p>
      </div>
    </TherapistSimplePageLayout>
  );
};

export default SafePassApplyLandingPage;
