/**
 * Membership Plans page for home service massage therapists.
 * Shown after they save their profile live. Explains Free vs Paid and offers
 * Upgrade or "Skip for now" (profile stays live; Book Now/Scheduled go to admin WhatsApp until upgraded).
 */
import React from 'react';
import { Crown, MessageCircle, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import type { Therapist } from '../../types';

export interface TherapistMembershipPlansPageProps {
  therapist: Therapist | null;
  onNavigate?: (page: string) => void;
  onBack?: () => void;
  language?: string;
}

const TherapistMembershipPlansPage: React.FC<TherapistMembershipPlansPageProps> = ({
  therapist,
  onNavigate,
  onBack,
  language = 'id',
}) => {
  const isId = language === 'id';

  const copy = {
    id: {
      title: 'Profil Anda Sudah Live',
      subtitle: 'Pilih paket keanggotaan atau lanjutkan dengan gratis. Anda bisa upgrade kapan saja.',
      freeTitle: 'Gratis',
      freeDesc: 'Book Now & Jadwal mengarah ke WhatsApp admin sampai Anda upgrade. Tidak ada biaya.',
      paidTitle: 'Plus / Premium',
      paidPrice: 'Rp 200.000/bulan',
      paidDesc: 'Book Now & Jadwal langsung ke WhatsApp Anda. Lebih banyak kontrol dan konversi.',
      upgrade: 'Upgrade ke Premium',
      skip: 'Nanti saja',
      back: 'Kembali',
    },
    en: {
      title: 'Your Profile Is Live',
      subtitle: 'Choose a membership plan or continue free. You can upgrade anytime.',
      freeTitle: 'Free',
      freeDesc: 'Book Now & Scheduled buttons go to admin WhatsApp until you upgrade. No payment.',
      paidTitle: 'Plus / Premium',
      paidPrice: 'Rp 200,000/month',
      paidDesc: 'Book Now & Scheduled go directly to your WhatsApp. More control and conversions.',
      upgrade: 'Upgrade to Premium',
      skip: 'Skip for now',
      back: 'Back',
    },
  };

  const t = isId ? copy.id : copy.en;

  return (
    <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50 pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Header */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <span className="text-sm font-medium">{t.back}</span>
          </button>
        )}

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-green-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">{t.title}</h1>
        </div>
        <p className="text-gray-600 text-sm mb-6">{t.subtitle}</p>

        {/* Free plan */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold text-gray-900">{t.freeTitle}</h2>
          </div>
          <p className="text-gray-600 text-sm">{t.freeDesc}</p>
        </div>

        {/* Paid plan */}
        <div className="bg-white rounded-xl border-2 border-amber-200 p-4 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-amber-600" />
            <h2 className="font-semibold text-gray-900">{t.paidTitle}</h2>
          </div>
          <p className="text-amber-700 font-medium text-sm mb-1">{t.paidPrice}</p>
          <p className="text-gray-600 text-sm">{t.paidDesc}</p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => onNavigate?.('therapist-premium-upgrade')}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors"
          >
            <Crown className="w-5 h-5" />
            {t.upgrade}
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate?.('therapist-dashboard')}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            <CheckCircle className="w-5 h-5 text-gray-500" />
            {t.skip}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TherapistMembershipPlansPage;
