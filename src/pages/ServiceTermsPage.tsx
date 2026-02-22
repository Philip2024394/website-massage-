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

    /* Service provider terms modal: same UI design as user terms (orange accent, black backdrop) */
    if (acceptMode && onAccept) {
        const modalTitle = safeT.serviceProviderTerms?.modalTitle ?? 'Therapist And Facial Services';
        const modalSubtitle = safeT.serviceProviderTerms?.modalSubtitle ?? 'Terms for therapists and facial service providers — IndaStreet';
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black p-4">
                <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-lg bg-gray-900 shadow-2xl overflow-hidden">
                    <div className="flex-shrink-0 px-6 py-4 bg-gray-900">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/50 mb-2">Therapist And Facial Services</span>
                        <h1 className="text-xl font-bold text-white">{modalTitle}</h1>
                        <p className="text-xs text-gray-400 mt-0.5">{modalSubtitle}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{safeT.effectiveDate}</p>
                    </div>
                    <div
                        className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 min-h-0 service-terms-modal-scroll"
                        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgb(249 115 22) rgb(31 41 55)' }}
                    >
                        <div className="service-terms-modal-dark">
                            <ServiceTermsPageContent safeT={safeT} />
                        </div>
                    </div>
                    <div className="flex-shrink-0 px-6 py-4 bg-gray-900">
                        <button
                            type="button"
                            onClick={onAccept}
                            className="w-full py-3.5 rounded-lg font-semibold text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 transition-colors shadow-md border border-amber-400/50"
                        >
                            {safeT.serviceProviderTerms?.agreeButton ?? 'Agree to terms and conditions'}
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
                    .service-terms-modal-dark .bg-amber-100 { background: rgba(251,146,60,0.2); }
                    .service-terms-modal-dark .text-amber-900 { color: rgb(253 186 116); }
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
                    .service-terms-modal-dark .border-amber-200 { border-color: rgba(251,146,60,0.5); }
                    .service-terms-modal-dark .bg-black { background: rgb(17 24 39); }
                    .service-terms-modal-dark .bg-black .text-gray-300 { color: rgb(209 213 219); }
                    .service-terms-modal-dark .bg-red-900\\/90 { background: rgba(127, 29, 29, 0.9); }
                    .service-terms-modal-dark .text-red-100 { color: rgb(254 226 226); }
                    .service-terms-modal-dark .text-red-100\\/90 { color: rgba(254, 226, 226, 0.9); }
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
                        <span className="text-amber-500"><span className="inline-block animate-float">S</span>treet</span>
                    </h1>
                    {!acceptMode && onBack && (
                        <button onClick={onBack} className="p-2 hover:bg-amber-50 rounded-full transition-colors text-amber-500" aria-label="Close">
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
                    <div className="sticky bottom-0 left-0 right-0 pt-6 pb-8 -mx-6 px-6 bg-gray-50">
                        <button
                            type="button"
                            onClick={onAccept}
                            className="w-full py-4 rounded-xl font-semibold text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 transition-colors shadow-md"
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
                <div className="bg-black text-gray-300 p-4 mb-6 rounded-lg">
                    <p className="text-sm font-semibold">{safeT.effectiveDate}</p>
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

                <div className="space-y-2 bg-black text-gray-300 p-4 rounded-lg">
                    <h3 className="font-bold text-lg">{safeT.locationTrackingTitle}</h3>
                    <p className="text-sm leading-relaxed">{safeT.locationTrackingContent}</p>
                </div>

                <div className="space-y-2 bg-red-900/90 p-4 rounded-lg text-red-100">
                    <h3 className="font-bold text-red-100 text-lg">{safeT.contactSharingTitle}</h3>
                    <p className="text-sm leading-relaxed text-red-100/90">{safeT.contactSharingContent}</p>
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
                
                <div className="space-y-2 bg-black text-gray-300 p-4 rounded-lg">
                    <h3 className="font-bold text-lg">{safeT.serviceProviderTerms?.title || "Therapist And Facial Services"}</h3>
                    <p className="text-sm leading-relaxed">{safeT.serviceProviderTerms?.intro || "By signing in or using IndaStreet as a therapist or facial service provider, you agree to the following terms."}</p>
                    <div className="mt-4 space-y-3">
                        <div>
                            <h4 className="font-semibold text-sm mb-2">💰 {safeT.serviceProviderTerms?.commissionTitle || "Commission"}</h4>
                            <p className="text-sm leading-relaxed">{safeT.serviceProviderTerms?.commissionContent || "You must pay 30% commission to IndaStreet on all revenue from: Book Now, Order Now, and all scheduled bookings. This applies to every such booking made through the platform."}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm mb-2">📵 {safeT.serviceProviderTerms?.noContactTitle || "No Sharing Contact Information"}</h4>
                            <p className="text-sm leading-relaxed">{safeT.serviceProviderTerms?.noContactContent || "You must never share your personal phone number, WhatsApp, or any other contact information with clients outside of the IndaStreet platform. All booking-related communication and transactions must remain on the platform."}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm mb-2">🔐 {safeT.serviceProviderTerms?.noAccountSharingTitle || "No Account Sharing"}</h4>
                            <p className="text-sm leading-relaxed">{safeT.serviceProviderTerms?.noAccountSharingContent || "You must never share your account with anyone. Each therapist or place must use only their own registered account. Sharing or lending your account is a serious violation and may result in immediate suspension or termination."}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm mb-2">⚠️ {safeT.serviceProviderTerms?.sexualOfferingTitle || "No Sexual Offerings — Zero Tolerance"}</h4>
                            <p className="text-sm leading-relaxed">{safeT.serviceProviderTerms?.sexualOfferingContent || "Any offering, solicitation, or provision of services of a sexual nature through or in connection with the platform will be reported to the correct authorities. Your account will be frozen with immediate effect for the duration of the investigation. The platform is for professional, legitimate massage and wellness services only."}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm mb-2">🌐 {safeT.serviceProviderTerms?.platformPurposeTitle || "Platform Purpose and Users"}</h4>
                            <p className="text-sm leading-relaxed">{safeT.serviceProviderTerms?.platformPurposeContent || "The platform is for traffic purpose only. All users of the platform are IndaStreet Massage (indastreetmassage.com) users. You agree to use the platform solely to receive and fulfil bookings through IndaStreet and not to divert traffic or users to other channels."}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm mb-2">📍 {safeT.serviceProviderTerms?.gpsTitle || "GPS Location Agreement"}</h4>
                            <p className="text-sm leading-relaxed">{safeT.serviceProviderTerms?.gpsContent || "All service providers on IndaStreet agree to the use of GPS location where applicable, to offer safe service for users and for service providers. Location data may be used for safety, verification, and platform administration in accordance with our Privacy Policy."}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm mb-2">📋 {safeT.serviceProviderTerms?.otherTitle || "Other Obligations"}</h4>
                            <p className="text-sm leading-relaxed">{safeT.serviceProviderTerms?.otherContent || "You agree to provide only professional, lawful massage and wellness services; to comply with all applicable laws and regulations; and to maintain accurate profile information. IndaStreet reserves the right to suspend or terminate accounts that breach these terms."}</p>
                        </div>
                    </div>
                </div>
                
                <div className="space-y-2 pt-4 border-t-2 border-gray-700 bg-black text-gray-300 p-4 rounded-lg">
                    <h3 className="font-bold text-lg">{safeT.disclaimerTitle}</h3>
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
