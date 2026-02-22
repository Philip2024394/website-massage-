/**
 * Full-screen Terms & Conditions for therapist/facial dashboard first-time login.
 * Content: Account Setup, Profile Verification, Account Deletion, User Conduct.
 * Bilingual: English and Bahasa Indonesia (toggle in modal).
 */

import React, { useState, useMemo } from 'react';
import { translations } from '../translations';

export interface DashboardTermsModalProps {
  t: Record<string, any>;
  onAccept: () => void;
  loading?: boolean;
}

const DashboardTermsModal: React.FC<DashboardTermsModalProps> = ({ t, onAccept, loading }) => {
  const [lang, setLang] = useState<'en' | 'id'>('en');
  const enTerms = (translations as any)?.en?.serviceTerms?.dashboardTerms ?? t?.dashboardTerms ?? {};
  const idTerms = (translations as any)?.id?.serviceTerms?.dashboardTerms ?? {};
  const safe = useMemo(() => (lang === 'id' ? idTerms : enTerms), [lang, enTerms, idTerms]);
  const title = safe.modalTitle ?? 'Terms & Conditions — Dashboard';
  const subtitle = safe.modalSubtitle ?? 'Please read and accept before using your dashboard.';
  const agreeBtn = safe.agreeButton ?? 'I Agree';
  const effectiveDate = safe.effectiveDate ?? '';

  const accountSetup = safe.accountSetup ?? {};
  const profileVerification = safe.profileVerification ?? {};
  const accountDeletion = safe.accountDeletion ?? {};
  const userConduct = safe.userConduct ?? {};

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-gray-900 text-gray-200">
      {/* Language toggle: EN | Bahasa */}
      <div className="flex-shrink-0 flex justify-end gap-2 px-4 py-2 border-b border-gray-700">
        <button
          type="button"
          onClick={() => setLang('en')}
          className={`px-3 py-1.5 rounded text-sm font-medium ${lang === 'en' ? 'bg-amber-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
          English
        </button>
        <button
          type="button"
          onClick={() => setLang('id')}
          className={`px-3 py-1.5 rounded text-sm font-medium ${lang === 'id' ? 'bg-amber-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
          Bahasa Indonesia
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl mx-auto w-full">
        <div className="mb-4">
          <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/50 mb-2">
            Therapist &amp; Facial Services
          </span>
          <h1 className="text-xl font-bold text-white">{title}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>
          {effectiveDate && <p className="text-xs text-gray-500 mt-0.5">{effectiveDate}</p>}
        </div>

        <div className="space-y-5 text-sm">
          <section>
            <h2 className="font-bold text-amber-400 text-base mb-2">{accountSetup.title ?? 'Account Setup and Edits'}</h2>
            <p className="leading-relaxed text-gray-300">{accountSetup.content ?? ''}</p>
          </section>

          <section>
            <h2 className="font-bold text-amber-400 text-base mb-2">{profileVerification.title ?? 'Profile Verification'}</h2>
            <p className="leading-relaxed text-gray-300">{profileVerification.content ?? ''}</p>
          </section>

          <section>
            <h2 className="font-bold text-amber-400 text-base mb-2">{accountDeletion.title ?? 'Account Deletion'}</h2>
            <p className="leading-relaxed text-gray-300">{accountDeletion.content ?? ''}</p>
          </section>

          <section>
            <h2 className="font-bold text-amber-400 text-base mb-2">{userConduct.title ?? 'User Conduct'}</h2>
            <p className="leading-relaxed text-gray-300">{userConduct.content ?? ''}</p>
          </section>
        </div>
      </div>

      <div className="flex-shrink-0 px-4 py-4 bg-gray-900 border-t border-gray-700">
        <button
          type="button"
          onClick={onAccept}
          disabled={loading}
          className="w-full py-3.5 rounded-lg font-semibold text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:opacity-50 transition-colors shadow-md border border-amber-400/50"
        >
          {loading ? (lang === 'id' ? 'Memproses...' : 'Processing...') : (lang === 'id' ? 'Saya Setuju' : agreeBtn)}
        </button>
      </div>
    </div>
  );
};

export default DashboardTermsModal;
