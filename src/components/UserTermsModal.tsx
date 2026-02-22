/**
 * Terms & Conditions + Privacy Policy acceptance modal for users.
 * Design: black backdrop, container with orange border, scrollable content, accept button outside scroll.
 * Header: "IndaStreet Massage". Content includes Terms, Privacy Policy, and related policies.
 */
import React from 'react';

interface UserTermsModalProps {
  t: any;
  onAccept: () => void;
}

const Section: React.FC<{ title: string; content: string | React.ReactNode }> = ({ title, content }) => (
  <div className="space-y-2 mb-6">
    <h3 className="text-base font-semibold text-amber-400">{title}</h3>
    {typeof content === 'string' ? (
      <p className="text-sm text-gray-300 leading-relaxed">{content}</p>
    ) : (
      <div className="text-sm text-gray-300 leading-relaxed">{content}</div>
    )}
  </div>
);

export const UserTermsModal: React.FC<UserTermsModalProps> = ({ t, onAccept }) => {
  const u = t?.userTerms || {};
  const pp = t?.privacyPolicy || {};
  const safeArr = (arr: any) => (Array.isArray(arr) ? arr : []);

  const safeU = {
    modalBadge: u.modalBadge || 'For clients',
    modalTitle: u.modalTitle || 'IndaStreet Massage — Terms for users',
    title: u.title || 'Terms & Conditions for Users',
    effectiveDate: u.effectiveDate || 'Effective for use of indastreetmassage.com and IndaStreet services.',
    intro: u.intro || 'By using IndaStreet to browse, book, or receive services, you agree to these Terms & Conditions.',
    acceptance: u.acceptance || 'By clicking below, you confirm that you have read and agree to these terms, including the section on location and safety.',
    locationTrackingTitle: u.locationTrackingTitle || 'Location and safety (services only on indastreetmassage.com)',
    locationTrackingContent: u.locationTrackingContent || 'We use location to give you a better experience and to help match you with the right provider. When you use IndaStreet services, we may use location-related information only in connection with providing and securing those services. By agreeing, you consent to this use of location for services and safety on IndaStreet.',
    agreeButton: u.agreeButton || 'Accept Terms and Conditions',
  };

  return (
    <>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black p-4">
        {/* Container: orange border, dark background */}
        <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-lg border-2 border-amber-500 bg-gray-900 shadow-2xl overflow-hidden">
          {/* Header - fixed at top of container (user/client terms only) */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-amber-500/50 bg-gray-900">
            <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/50 mb-2">{safeU.modalBadge}</span>
            <h1 className="text-xl font-bold text-white">
              {safeU.modalTitle}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {safeU.effectiveDate}
            </p>
          </div>

          {/* Scrollable content with visible scrollbar on the right */}
          <div
            className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 min-h-0"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgb(249 115 22) rgb(31 41 55)',
            }}
          >
            <div className="pr-2 user-terms-modal-scroll-content">
              {/* ═══ Terms & Conditions ═══ */}
              <h2 className="text-lg font-bold text-amber-400 mb-4 pt-2 border-t border-gray-700 first:border-t-0 first:pt-0">
                {safeU.title}
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed mb-4">{safeU.intro}</p>
              <p className="text-sm text-gray-300 leading-relaxed mb-4">{safeU.acceptance}</p>
              <Section title={safeU.locationTrackingTitle} content={safeU.locationTrackingContent} />

              {/* ═══ Privacy Policy ═══ */}
              <h2 className="text-lg font-bold text-amber-400 mb-4 pt-4 border-t border-gray-700">
                {pp.title || 'Privacy Policy'}
              </h2>
              {pp.lastUpdated && (
                <p className="text-xs text-gray-500 mb-4">{pp.lastUpdated}</p>
              )}
              {pp.introduction?.title && (
                <Section title={pp.introduction.title} content={pp.introduction.content || ''} />
              )}
              {pp.dataCollection?.title && (
                <Section
                  title={pp.dataCollection.title}
                  content={
                    <ul className="list-disc list-inside space-y-1 text-gray-300">
                      {pp.dataCollection.personal && <li>{pp.dataCollection.personal}</li>}
                      {pp.dataCollection.usage && <li>{pp.dataCollection.usage}</li>}
                      {pp.dataCollection.location && <li>{pp.dataCollection.location}</li>}
                      {pp.dataCollection.photos && <li>{pp.dataCollection.photos}</li>}
                      {pp.dataCollection.communications && <li>{pp.dataCollection.communications}</li>}
                    </ul>
                  }
                />
              )}
              {pp.dataUsage?.title && (
                <Section
                  title={pp.dataUsage.title}
                  content={
                    <>
                      {pp.dataUsage.content && <p className="mb-2">{pp.dataUsage.content}</p>}
                      <ul className="list-disc list-inside space-y-1">
                        {safeArr(pp.dataUsage?.points).map((point: string, i: number) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    </>
                  }
                />
              )}
              {pp.dataSharing?.title && (
                <Section
                  title={pp.dataSharing.title}
                  content={
                    <>
                      {pp.dataSharing.content && <p className="mb-2">{pp.dataSharing.content}</p>}
                      <ul className="list-disc list-inside space-y-1 mb-2">
                        {safeArr(pp.dataSharing?.points).map((point: string, i: number) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                      {pp.dataSharing.note && <p className="text-gray-400 italic text-xs">{pp.dataSharing.note}</p>}
                    </>
                  }
                />
              )}
              {pp.legalBasis?.title && (
                <Section
                  title={pp.legalBasis.title}
                  content={
                    <>
                      {pp.legalBasis.content && <p className="mb-2">{pp.legalBasis.content}</p>}
                      <ul className="list-disc list-inside space-y-1">
                        {safeArr(pp.legalBasis?.points).map((point: string, i: number) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    </>
                  }
                />
              )}
              {pp.dataRetention?.title && <Section title={pp.dataRetention.title} content={pp.dataRetention.content || ''} />}
              {pp.security?.title && <Section title={pp.security.title} content={pp.security.content || ''} />}
              {pp.yourRights?.title && <Section title={pp.yourRights.title} content={pp.yourRights.content || ''} />}
              {pp.cookies?.title && <Section title={pp.cookies.title} content={pp.cookies.content || ''} />}
              {pp.thirdPartyServices?.title && <Section title={pp.thirdPartyServices.title} content={pp.thirdPartyServices.content || ''} />}
              {pp.childrenPrivacy?.title && <Section title={pp.childrenPrivacy.title} content={pp.childrenPrivacy.content || ''} />}
              {pp.dataTransfer?.title && <Section title={pp.dataTransfer.title} content={pp.dataTransfer.content || ''} />}
              {pp.policyChanges?.title && <Section title={pp.policyChanges.title} content={pp.policyChanges.content || ''} />}
              {pp.governing?.title && <Section title={pp.governing.title} content={pp.governing.content || ''} />}
              {pp.disclaimer?.title && <Section title={pp.disclaimer.title} content={pp.disclaimer.content || ''} />}
              {pp.contact?.title && <Section title={pp.contact.title} content={pp.contact.content || ''} />}

              {/* Other policies note */}
              <div className="pt-4 pb-6 border-t border-gray-700">
                <p className="text-xs text-gray-500">
                  By accepting, you also acknowledge our use of cookies and tracking technologies as described above, and any other policies referred to on our platform (e.g. Cookie Policy, Community Guidelines) where applicable.
                </p>
              </div>
            </div>
          </div>

          {/* Footer - Accept button OUTSIDE scroll, fixed at bottom of container */}
          <div className="flex-shrink-0 px-6 py-4 border-t border-amber-500/50 bg-gray-900">
            <button
              type="button"
              onClick={onAccept}
              className="w-full py-3.5 rounded-lg font-semibold text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 transition-colors shadow-md border border-amber-400/50"
            >
              {safeU.agreeButton}
            </button>
          </div>
        </div>
      </div>
      {/* Scrollbar styling for WebKit (Chrome, Safari, Edge) */}
      <style>{`
        .user-terms-modal-scroll-content::-webkit-scrollbar {
          width: 8px;
        }
        .user-terms-modal-scroll-content::-webkit-scrollbar-track {
          background: rgb(31 41 55);
          border-radius: 4px;
        }
        .user-terms-modal-scroll-content::-webkit-scrollbar-thumb {
          background: rgb(249 115 22);
          border-radius: 4px;
        }
        .user-terms-modal-scroll-content::-webkit-scrollbar-thumb:hover {
          background: rgb(234 88 12);
        }
      `}</style>
    </>
  );
};

export default UserTermsModal;
