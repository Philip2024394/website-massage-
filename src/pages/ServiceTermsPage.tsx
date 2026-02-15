// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
import React from 'react';

interface ServiceTermsPageProps {
    onBack?: () => void;
    t: any;
    contactNumber?: string;
    /** First-time dashboard flow: show "Agree to terms" at end and no back button */
    acceptMode?: boolean;
    onAccept?: () => void;
}

const ServiceTermsPage: React.FC<ServiceTermsPageProps> = ({ onBack, t, contactNumber: _contactNumber, acceptMode, onAccept }) => {
    const safeT = t || {};

    /* Same style as user Terms popup: black backdrop, orange border, dark content (therapist/place sign-in) */
    if (acceptMode && onAccept) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black p-4">
                <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-lg border-2 border-orange-500 bg-gray-900 shadow-2xl overflow-hidden">
                    <div className="flex-shrink-0 px-6 py-4 border-b border-orange-500/50 bg-gray-900">
                        <h1 className="text-xl font-bold text-white">IndaStreet Massage</h1>
                        <p className="text-xs text-gray-400 mt-0.5">{safeT.effectiveDate}</p>
                    </div>
                    <div
                        className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 min-h-0 service-terms-modal-scroll"
                        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgb(249 115 22) rgb(31 41 55)' }}
                    >
                        <div className="service-terms-modal-dark">
                            <ServiceTermsPageContent safeT={safeT} />
                        </div>
                    </div>
                    <div className="flex-shrink-0 px-6 py-4 border-t border-orange-500/50 bg-gray-900">
                        <button
                            type="button"
                            onClick={onAccept}
                            className="w-full py-3.5 rounded-lg font-semibold text-white bg-orange-500 hover:bg-orange-600 active:bg-orange-700 transition-colors shadow-md border border-orange-400/50"
                        >
                            Agree to terms and conditions
                        </button>
                    </div>
                </div>
                <style>{`
                    .service-terms-modal-scroll::-webkit-scrollbar { width: 8px; }
                    .service-terms-modal-scroll::-webkit-scrollbar-track { background: rgb(31 41 55); border-radius: 4px; }
                    .service-terms-modal-scroll::-webkit-scrollbar-thumb { background: rgb(249 115 22); border-radius: 4px; }
                    .service-terms-modal-dark { color: rgb(209 213 219); }
                    .service-terms-modal-dark h3 { color: rgb(251 146 60); }
                    .service-terms-modal-dark h4 { color: rgb(253 186 116); }
                    .service-terms-modal-dark p, .service-terms-modal-dark li { color: rgb(209 213 219); }
                    .service-terms-modal-dark .bg-orange-100 { background: rgba(251,146,60,0.2); }
                    .service-terms-modal-dark .text-orange-900 { color: rgb(253 186 116); }
                    .service-terms-modal-dark .bg-amber-50\\/80 { background: rgba(251,191,36,0.2); }
                    .service-terms-modal-dark .bg-red-50\\/80 { background: rgba(239,68,68,0.2); }
                    .service-terms-modal-dark .bg-green-50 { background: rgba(34,197,94,0.2); }
                    .service-terms-modal-dark .text-green-900 { color: rgb(134 239 172); }
                    .service-terms-modal-dark .bg-yellow-50 { background: rgba(234,179,8,0.2); }
                    .service-terms-modal-dark .border-yellow-200 { border-color: rgba(234,179,8,0.5); }
                    .service-terms-modal-dark .text-gray-800 { color: rgb(229 231 235); }
                    .service-terms-modal-dark .text-gray-700 { color: rgb(209 213 219); }
                    .service-terms-modal-dark .text-gray-600 { color: rgb(156 163 175); }
                    .service-terms-modal-dark .text-red-700 { color: rgb(252 165 165); }
                    .service-terms-modal-dark .text-green-700 { color: rgb(134 239 172); }
                    .service-terms-modal-dark .bg-blue-50 { background: rgba(59,130,246,0.2); }
                    .service-terms-modal-dark .border-blue-200 { border-color: rgba(59,130,246,0.5); }
                    .service-terms-modal-dark .bg-gray-100 { background: rgb(55 65 81); }
                    .service-terms-modal-dark .border-orange-200 { border-color: rgba(251,146,60,0.5); }
                `}</style>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50">
            <header className="bg-white p-4 shadow-md sticky top-0 z-[9997]">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500"><span className="inline-block animate-float">S</span>treet</span>
                    </h1>
                    {!acceptMode && onBack && (
                        <button onClick={onBack} className="p-2 hover:bg-orange-50 rounded-full transition-colors text-orange-500" aria-label="Close">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </header>

            <main className="p-6 space-y-6 text-gray-700 pb-24 max-w-4xl mx-auto">
                <ServiceTermsPageContent safeT={safeT} />
                {acceptMode && onAccept && (
                    <div className="sticky bottom-0 left-0 right-0 pt-6 pb-8 -mx-6 px-6 bg-gray-50 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onAccept}
                            className="w-full py-4 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 active:bg-orange-700 transition-colors shadow-md"
                        >
                            Agree to terms and conditions
                        </button>
                    </div>
                )}
            </main>

            <style>{`\n                @keyframes float {\n                    0%, 100% { transform: translateY(0); }\n                    50% { transform: translateY(-5px); }\n                }\n                .animate-float {\n                    animation: float 2s ease-in-out infinite;\n                }\n            `}</style>
        </div>
    );
};

/** Shared terms content: used in full page (light) and in accept-mode modal (dark via .service-terms-modal-dark) */
const ServiceTermsPageContent: React.FC<{ safeT: Record<string, any> }> = ({ safeT }) => (
    <>
                <div className="bg-orange-100 border-l-4 border-orange-500 p-4 mb-6">
                    <p className="text-sm font-semibold text-orange-900">{safeT.effectiveDate}</p>
                </div>

                <p className="text-sm leading-relaxed">{safeT.intro}</p>
                
                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">{safeT.acceptance?.title}</h3>
                    <p className="text-sm leading-relaxed">{safeT.acceptance?.content}</p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">{safeT.platformNature?.title}</h3>
                    <p className="text-sm leading-relaxed">{safeT.platformNature?.content}</p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">{safeT.governingLaw?.title}</h3>
                    <p className="text-sm leading-relaxed">{safeT.governingLaw?.content}</p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">{safeT.userRights?.title}</h3>
                    <p className="text-sm leading-relaxed">{safeT.userRights?.content}</p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">{safeT.confidentiality?.title}</h3>
                    <p className="text-sm leading-relaxed">{safeT.confidentiality?.content}</p>
                </div>
                
                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">{safeT.therapistRightsTitle}</h3>
                    <p className="text-sm leading-relaxed">{safeT.therapistRightsContent}</p>
                </div>

                <div className="space-y-2 bg-amber-50/80 border-l-4 border-amber-500 p-4 rounded-r-lg">
                    <h3 className="font-bold text-gray-800 text-lg">{safeT.locationTrackingTitle}</h3>
                    <p className="text-sm leading-relaxed">{safeT.locationTrackingContent}</p>
                </div>

                <div className="space-y-2 bg-red-50/80 border-l-4 border-red-500 p-4 rounded-r-lg">
                    <h3 className="font-bold text-gray-800 text-lg">{safeT.contactSharingTitle}</h3>
                    <p className="text-sm leading-relaxed">{safeT.contactSharingContent}</p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">{safeT.paymentTitle}</h3>
                    <p className="text-sm leading-relaxed">{safeT.paymentContent}</p>
                </div>
                
                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">{safeT.clientCommunicationTitle}</h3>
                    <p className="text-sm leading-relaxed">{safeT.clientCommunicationContent}</p>
                </div>
                
                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">{safeT.clientRightsTitle}</h3>
                    <p className="text-sm leading-relaxed">{safeT.clientRightsContent}</p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">{safeT.therapistObligationsTitle}</h3>
                    <p className="text-sm leading-relaxed">{safeT.therapistObligationsContent}</p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">{safeT.professionalismTitle}</h3>
                    <p className="text-sm leading-relaxed">{safeT.professionalismContent}</p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">{safeT.userConduct?.title}</h3>
                    <p className="text-sm leading-relaxed mb-3">{safeT.userConduct?.content}</p>
                    <ul className="list-disc list-inside space-y-2 text-sm ml-4">
                        {(safeT.userConduct?.prohibitions || []).map((item: string, index: number) => (
                            <li key={index} className="leading-relaxed">{item}</li>
                        ))}
                    </ul>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">{safeT.intellectualProperty?.title}</h3>
                    <p className="text-sm leading-relaxed">{safeT.intellectualProperty?.content}</p>
                </div>
                
                <div className="space-y-2 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <h3 className="font-bold text-gray-800 text-lg">🏆 {safeT.verifiedProBadge?.title || "Verified Pro Badge Program"}</h3>
                    <p className="text-sm leading-relaxed font-semibold text-green-900">{safeT.verifiedProBadge?.subtitle || "Earn Recognition for Excellence and Commitment"}</p>
                    
                    <div className="mt-4 space-y-3">
                        <div>
                            <h4 className="font-semibold text-gray-800 text-sm mb-2">✅ {safeT.verifiedProBadge?.howToEarn?.title || "How to Earn the Badge:"}</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                                <li>{safeT.verifiedProBadge?.howToEarn?.requirement1 || "Complete 3 months of active membership (can be 3 consecutive months or accumulative 1-month memberships)"}</li>
                                <li>{safeT.verifiedProBadge?.howToEarn?.requirement2 || "Maintain a rating of 4.0 stars or higher"}</li>
                                <li>{safeT.verifiedProBadge?.howToEarn?.requirement3 || "Keep your membership continuously active"}</li>
                            </ul>
                        </div>
                        
                        <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                            <h4 className="font-semibold text-gray-800 text-sm mb-2">⏰ {safeT.verifiedProBadge?.continuity?.title || "Membership Continuity Requirement:"}</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                                <li className="text-red-700 font-medium">{safeT.verifiedProBadge?.continuity?.renewal || "You will receive a renewal reminder 7 days before your membership expires"}</li>
                                <li className="text-red-700 font-medium">{safeT.verifiedProBadge?.continuity?.warning || "If membership is not renewed within 7 days before expiry, your badge display will expire"}</li>
                                <li>{safeT.verifiedProBadge?.continuity?.gracePeriod || "Grace Period: You have 5 days after membership expiry to renew and keep your badge active"}</li>
                                <li className="text-red-700 font-medium">{safeT.verifiedProBadge?.continuity?.reset || "If membership lapses beyond the 5-day grace period, your badge will be RESET and you will need to complete 3 months of membership again"}</li>
                                <li className="text-green-700 font-medium">{safeT.verifiedProBadge?.continuity?.maintain || "To maintain your badge: Renew your membership before it expires or within the 5-day grace period"}</li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-gray-800 text-sm mb-2">⚠️ {safeT.verifiedProBadge?.howToLose?.title || "Badge Removal:"}</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                                <li>{safeT.verifiedProBadge?.howToLose?.condition1 || "Your badge will be automatically removed if your rating falls below 4.0 stars"}</li>
                                <li>{safeT.verifiedProBadge?.howToLose?.condition2 || "Membership lapse beyond 5-day grace period resets badge progress"}</li>
                                <li>{safeT.verifiedProBadge?.howToLose?.condition3 || "The badge is visible to all clients on your profile card"}</li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-gray-800 text-sm mb-2">🔄 {safeT.verifiedProBadge?.howToRegain?.title || "Regaining Your Badge:"}</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                                <li>{safeT.verifiedProBadge?.howToRegain?.rating || "Rating Recovery: Once your rating returns to 4.0 stars or above, your badge will automatically reappear"}</li>
                                <li>{safeT.verifiedProBadge?.howToRegain?.membership || "Membership Lapse: If your membership lapsed beyond grace period, you must complete 3 new months of active membership"}</li>
                                <li>{safeT.verifiedProBadge?.howToRegain?.note || "Your progress is only preserved if you renew within the grace period"}</li>
                            </ul>
                        </div>
                        
                        <div className="bg-blue-50 p-3 rounded border border-blue-200">
                            <h4 className="font-semibold text-gray-800 text-sm mb-2">📧 {safeT.verifiedProBadge?.notifications?.title || "Renewal Notifications:"}</h4>
                            <p className="text-xs text-gray-700">{safeT.verifiedProBadge?.notifications?.content || "You will receive notifications at the following times to help you maintain your badge:"}</p>
                            <ul className="list-disc list-inside space-y-1 text-xs ml-4 mt-2">
                                <li>{safeT.verifiedProBadge?.notifications?.day7 || "7 days before expiry: First reminder to renew membership"}</li>
                                <li>{safeT.verifiedProBadge?.notifications?.day3 || "3 days before expiry: Second reminder"}</li>
                                <li>{safeT.verifiedProBadge?.notifications?.day1 || "1 day before expiry: Final reminder"}</li>
                                <li>{safeT.verifiedProBadge?.notifications?.expiry || "On expiry day: Grace period notification (5 days to renew)"}</li>
                                <li>{safeT.verifiedProBadge?.notifications?.grace || "Daily reminders during 5-day grace period"}</li>
                            </ul>
                        </div>
                        
                        <p className="text-xs text-gray-600 italic mt-3">{safeT.verifiedProBadge?.note || "The Verified Pro badge demonstrates your commitment to quality service and helps you stand out to potential clients. Maintain continuous membership to keep your badge active."}</p>
                    </div>
                </div>
                
                <div className="space-y-2 pt-4 border-t-2 border-orange-200">
                    <h3 className="font-bold text-gray-800 text-lg">{safeT.disclaimerTitle}</h3>
                    <p className="text-sm leading-relaxed">{safeT.disclaimerContent}</p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">{safeT.limitationOfLiability?.title}</h3>
                    <p className="text-sm leading-relaxed">{safeT.limitationOfLiability?.content}</p>
                </div>
                
                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">{safeT.disputeResolution?.title}</h3>
                    <p className="text-sm leading-relaxed">{safeT.disputeResolution?.content}</p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">{safeT.indemnification?.title}</h3>
                    <p className="text-sm leading-relaxed">{safeT.indemnification?.content}</p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">{safeT.modifications?.title}</h3>
                    <p className="text-sm leading-relaxed">{safeT.modifications?.content}</p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">{safeT.severability?.title}</h3>
                    <p className="text-sm leading-relaxed">{safeT.severability?.content}</p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">{safeT.entireAgreement?.title}</h3>
                    <p className="text-sm leading-relaxed">{safeT.entireAgreement?.content}</p>
                </div>

                <div className="space-y-2 bg-gray-100 p-4 rounded-lg">
                    <h3 className="font-bold text-gray-800 text-lg">{safeT.contactInformation?.title}</h3>
                    <p className="text-sm leading-relaxed">{safeT.contactInformation?.content}</p>
                </div>
    </>
);

export default ServiceTermsPage;
