/**
 * Terms & Conditions for users (clients) with agreement.
 * Shown once before using the app; includes tracking consent for services only on indastreetmassage.com.
 */
import React from 'react';

interface UserTermsPageProps {
  t: any;
  onAccept: () => void;
}

const UserTermsPage: React.FC<UserTermsPageProps> = ({ t, onAccept }) => {
  const u = t?.userTerms || {};
  const safeU = {
    title: u.title || 'Terms & Conditions for Users',
    effectiveDate: u.effectiveDate || 'Effective for use of indastreetmassage.com and IndaStreet services.',
    intro: u.intro || 'By using IndaStreet to browse, book, or receive services, you agree to these Terms & Conditions.',
    acceptance: u.acceptance || 'By clicking below, you confirm that you have read and agree to these terms, including the section on location and safety.',
    locationTrackingTitle: u.locationTrackingTitle || 'Location and safety (services only on indastreetmassage.com)',
    locationTrackingContent: u.locationTrackingContent || 'We use location to give you a better experience: relevant updates about nearby therapists and massage places, personalised promos, and to help match you with the right provider. When you use IndaStreet services on indastreetmassage.com, we may use location-related information only in connection with providing and securing those services—for your and the therapist’s safety and to improve service delivery. This applies only to your use of services on indastreetmassage.com. By agreeing, you consent to this use of location for services and safety on IndaStreet.',
    agreeButton: u.agreeButton || 'Agree to terms and conditions',
  };

  return (
    <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50">
      <header className="bg-white p-4 shadow-md sticky top-0 z-[9997]">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            <span className="text-black">Inda</span>
            <span className="text-orange-500">Street</span>
          </h1>
        </div>
      </header>

      <main className="p-6 space-y-6 text-gray-700 pb-24 max-w-4xl mx-auto">
        <div className="bg-orange-100 border-l-4 border-orange-500 p-4 rounded-r-lg">
          <p className="text-sm font-semibold text-orange-900">{safeU.effectiveDate}</p>
        </div>

        <h2 className="text-xl font-bold text-gray-900">{safeU.title}</h2>
        <p className="text-sm leading-relaxed">{safeU.intro}</p>
        <p className="text-sm leading-relaxed">{safeU.acceptance}</p>

        <div className="space-y-2 bg-amber-50/80 border-l-4 border-amber-500 p-4 rounded-r-lg">
          <h3 className="font-bold text-gray-800 text-lg">{safeU.locationTrackingTitle}</h3>
          <p className="text-sm leading-relaxed">{safeU.locationTrackingContent}</p>
        </div>

        <div className="sticky bottom-0 left-0 right-0 pt-6 pb-8 -mx-6 px-6 bg-gray-50 border-t border-gray-200">
          <button
            type="button"
            onClick={onAccept}
            className="w-full py-4 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 active:bg-orange-700 transition-colors shadow-md"
          >
            {safeU.agreeButton}
          </button>
        </div>
      </main>
    </div>
  );
};

export default UserTermsPage;
