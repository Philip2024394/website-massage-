import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, Home } from 'lucide-react';

type Plan = 'pro' | 'plus';

interface PackageTermsPageProps {
  onBack: () => void;
  onNavigate?: (page: string) => void;
  onAcceptTerms?: (plan: Plan) => void;
  t?: any; // translations
  language?: 'en' | 'id';
}

const PackageTermsPage: React.FC<PackageTermsPageProps> = ({ onBack, onNavigate, onAcceptTerms, t, language = 'en' }) => {
  // Read plan immediately from localStorage to avoid flash of wrong content
  const getInitialPlan = (): Plan => {
    if (typeof window !== 'undefined') {
      const pendingPlan = localStorage.getItem('pendingTermsPlan') as Plan;
      if (pendingPlan === 'pro' || pendingPlan === 'plus') {
        return pendingPlan;
      }
    }
    return 'pro';
  };

  const [plan, setPlan] = useState<Plan>(getInitialPlan);
  const isPro = plan === 'pro';

  // Translation helper
  const getText = (key: string, fallback: string) => {
    return t?.packageTerms?.[key] || fallback;
  };

  useEffect(() => {
    // Re-check plan from localStorage on mount (handles any async updates)
    const pendingPlan = localStorage.getItem('pendingTermsPlan') as Plan;
    if (pendingPlan === 'pro' || pendingPlan === 'plus') {
      setPlan(pendingPlan);
    }
  }, []);

  const handleAccept = () => {
    // Store acceptance in localStorage
    const acceptedTerms = JSON.parse(localStorage.getItem('acceptedTerms') || '{}');
    acceptedTerms[plan] = true;
    localStorage.setItem('acceptedTerms', JSON.stringify(acceptedTerms));
    localStorage.setItem('membership_terms_accepted', 'true');
    localStorage.setItem('membership_terms_date', new Date().toISOString());
    localStorage.setItem('selected_membership_plan', plan);
    
    // Clear pending plan
    localStorage.removeItem('pendingTermsPlan');
    
    // Call callback if provided
    if (onAcceptTerms) {
      onAcceptTerms(plan);
    }
    
    // In dashboard context, navigate to membership packages
    if (onNavigate) {
      onNavigate('packages');
    } else {
      onBack();
    }
  };

  const handleCancel = () => {
    localStorage.removeItem('pendingTermsPlan');
    onBack();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Global Header */}
      <header className="bg-white shadow-md sticky top-0 z-[9997] w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <button 
              onClick={handleCancel} 
              className="hover:bg-orange-50 rounded-full transition-colors text-gray-600 flex-shrink-0 min-w-[44px] min-h-[44px] w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex-shrink-0">
              <span className="text-black">Inda</span>
              <span className="text-orange-500">Street</span>
            </h1>
            <div className="flex items-center gap-2 sm:gap-3 text-gray-600 flex-shrink-0">
              <button
                onClick={handleCancel}
                className="hover:bg-orange-50 rounded-full transition-colors text-gray-600 flex-shrink-0 min-w-[44px] min-h-[44px] w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center"
                title="Back to Dashboard"
              >
                <Home className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 mb-4">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {getText('title', language === 'id' ? 'Syarat & Ketentuan Keanggotaan' : 'Membership Terms & Conditions')}
          </h2>
          <p className="text-lg text-gray-600">
            {isPro 
              ? (language === 'id' ? 'Paket Pro - Sistem Komisi' : 'Pro Package - Commission System')
              : (language === 'id' ? 'Paket Plus - Langganan Premium' : 'Plus Package - Premium Subscription')
            }
          </p>
        </div>

        {/* Terms Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8 mb-8">
          <div className="prose max-w-none">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {language === 'id' ? 'Ketentuan Layanan' : 'Terms of Service'}
            </h3>
            
            <div className="space-y-4 text-gray-700">
              <p>
                {language === 'id' 
                  ? 'Dengan menerima syarat dan ketentuan ini, Anda setuju untuk terikat dengan semua kebijakan dan prosedur IndaStreet.'
                  : 'By accepting these terms and conditions, you agree to be bound by all IndaStreet policies and procedures.'
                }
              </p>
              
              <h4 className="font-semibold text-gray-900">
                {isPro 
                  ? (language === 'id' ? '1. Paket Pro (Sistem Komisi)' : '1. Pro Package (Commission System)')
                  : (language === 'id' ? '1. Paket Plus (Langganan Bulanan)' : '1. Plus Package (Monthly Subscription)')
                }
              </h4>
              
              {isPro ? (
                <ul className="list-disc pl-6 space-y-2">
                  <li>{language === 'id' ? 'Biaya bulanan: Rp 0' : 'Monthly fee: Rp 0'}</li>
                  <li>{language === 'id' ? 'Komisi per booking: 30% dari total pembayaran' : 'Commission per booking: 30% of total payment'}</li>
                  <li>{language === 'id' ? 'Akses penuh ke semua fitur platform' : 'Full access to all platform features'}</li>
                  <li>{language === 'id' ? 'Dukungan pelanggan prioritas' : 'Priority customer support'}</li>
                </ul>
              ) : (
                <ul className="list-disc pl-6 space-y-2">
                  <li>{language === 'id' ? 'Biaya bulanan: Rp 250.000' : 'Monthly fee: Rp 250,000'}</li>
                  <li>{language === 'id' ? 'Komisi: 0% - Anda menyimpan semua pendapatan' : 'Commission: 0% - You keep all earnings'}</li>
                  <li>{language === 'id' ? 'Akses premium ke semua fitur' : 'Premium access to all features'}</li>
                  <li>{language === 'id' ? 'Dukungan pelanggan VIP' : 'VIP customer support'}</li>
                </ul>
              )}

              <h4 className="font-semibold text-gray-900 mt-6">
                {language === 'id' ? '2. Kewajiban Member' : '2. Member Obligations'}
              </h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>{language === 'id' ? 'Memberikan layanan berkualitas tinggi' : 'Provide high-quality services'}</li>
                <li>{language === 'id' ? 'Mematuhi standar profesional platform' : 'Comply with platform professional standards'}</li>
                <li>{language === 'id' ? 'Merespons booking dalam waktu yang wajar' : 'Respond to bookings in a timely manner'}</li>
                <li>{language === 'id' ? 'Mempertahankan rating pelanggan yang baik' : 'Maintain good customer ratings'}</li>
              </ul>

              <h4 className="font-semibold text-gray-900 mt-6">
                {language === 'id' ? '3. Pembayaran dan Penagihan' : '3. Payment and Billing'}
              </h4>
              <p>
                {isPro 
                  ? (language === 'id' 
                    ? 'Komisi akan dipotong secara otomatis dari setiap pembayaran yang diterima. Sisa pembayaran akan ditransfer ke akun Anda dalam 24-48 jam.'
                    : 'Commission will be automatically deducted from each payment received. Remaining payment will be transferred to your account within 24-48 hours.')
                  : (language === 'id'
                    ? 'Biaya langganan bulanan akan dipotong otomatis setiap bulan. Semua pembayaran dari pelanggan akan ditransfer penuh ke akun Anda.'
                    : 'Monthly subscription fee will be automatically charged each month. All customer payments will be transferred in full to your account.')
                }
              </p>

              <h4 className="font-semibold text-gray-900 mt-6">
                {language === 'id' ? '4. Pembatalan dan Pengembalian Dana' : '4. Cancellation and Refunds'}
              </h4>
              <p>
                {language === 'id' 
                  ? 'Anda dapat membatalkan keanggotaan kapan saja. Pengembalian dana akan diproses sesuai dengan kebijakan pengembalian dana kami.'
                  : 'You may cancel your membership at any time. Refunds will be processed according to our refund policy.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleCancel}
            className="px-8 py-3 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold transition-colors"
          >
            {language === 'id' ? 'Kembali' : 'Cancel'}
          </button>
          <button
            onClick={handleAccept}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold transition-colors shadow-lg"
          >
            {language === 'id' ? 'Saya Setuju & Lanjutkan' : 'I Agree & Continue'}
          </button>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            {language === 'id' 
              ? 'Dengan melanjutkan, Anda setuju dengan semua syarat dan ketentuan di atas'
              : 'By continuing, you agree to all the terms and conditions above'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default PackageTermsPage;