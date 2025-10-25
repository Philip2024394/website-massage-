

import React from 'react';
import Button from '../components/Button';

const WhatsAppIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.614-1.486L.057 24zM6.591 17.419c.404.652.812 1.272 1.242 1.85 1.58 2.116 3.663 3.22 5.953 3.218 5.55-.006 10.038-4.488 10.043-10.038.005-5.55-4.488-10.038-10.038-10.043-5.55.005-10.038 4.488-10.043 10.038.002 2.13.642 4.148 1.822 5.898l-1.03 3.766 3.844-1.025z"/>
    </svg>
);

interface ServiceTermsPageProps {
    onBack: () => void;
    t: any;
    contactNumber: string;
}

const ServiceTermsPage: React.FC<ServiceTermsPageProps> = ({ onBack, t, contactNumber }) => {

    const handleWhatsAppClick = () => {
        const number = contactNumber;
        const message = encodeURIComponent('I have a customer service question.');
        window.open(`https://wa.me/${number}?text=${message}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="p-4 bg-white sticky top-0 z-10 shadow-sm flex items-center">
                <button onClick={onBack} className="text-gray-600 hover:text-gray-800 mr-4">
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-xl font-bold text-gray-800">{t.title}</h1>
            </header>

            <main className="p-6 space-y-6 text-gray-700 pb-24 max-w-4xl mx-auto">
                <div className="bg-orange-100 border-l-4 border-orange-500 p-4 mb-6">
                    <p className="text-sm font-semibold text-orange-900">{t.effectiveDate}</p>
                </div>

                <p className="text-sm leading-relaxed">{t.intro}</p>
                
                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">{t.acceptance.title}</h3>
                    <p className="text-sm leading-relaxed">{t.acceptance.content}</p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">{t.platformNature.title}</h3>
                    <p className="text-sm leading-relaxed">{t.platformNature.content}</p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">{t.governingLaw.title}</h3>
                    <p className="text-sm leading-relaxed">{t.governingLaw.content}</p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">{t.userRights.title}</h3>
                    <p className="text-sm leading-relaxed">{t.userRights.content}</p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">{t.confidentiality.title}</h3>
                    <p className="text-sm leading-relaxed">{t.confidentiality.content}</p>
                </div>
                
                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">{t.therapistRightsTitle}</h3>
                    <p className="text-sm leading-relaxed">{t.therapistRightsContent}</p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">{t.paymentTitle}</h3>
                    <p className="text-sm leading-relaxed">{t.paymentContent}</p>
                </div>
                
                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">{t.clientCommunicationTitle}</h3>
                    <p className="text-sm leading-relaxed">{t.clientCommunicationContent}</p>
                </div>
                
                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">{t.clientRightsTitle}</h3>
                    <p className="text-sm leading-relaxed">{t.clientRightsContent}</p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">{t.therapistObligationsTitle}</h3>
                    <p className="text-sm leading-relaxed">{t.therapistObligationsContent}</p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">{t.professionalismTitle}</h3>
                    <p className="text-sm leading-relaxed">{t.professionalismContent}</p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">{t.userConduct.title}</h3>
                    <p className="text-sm leading-relaxed mb-3">{t.userConduct.content}</p>
                    <ul className="list-disc list-inside space-y-2 text-sm ml-4">
                        {t.userConduct.prohibitions.map((item: string, index: number) => (
                            <li key={index} className="leading-relaxed">{item}</li>
                        ))}
                    </ul>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">{t.intellectualProperty.title}</h3>
                    <p className="text-sm leading-relaxed">{t.intellectualProperty.content}</p>
                </div>
                
                <div className="space-y-2 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <h3 className="font-bold text-gray-800 text-lg">🏆 {t.verifiedProBadge?.title || "Verified Pro Badge Program"}</h3>
                    <p className="text-sm leading-relaxed font-semibold text-green-900">{t.verifiedProBadge?.subtitle || "Earn Recognition for Excellence and Commitment"}</p>
                    
                    <div className="mt-4 space-y-3">
                        <div>
                            <h4 className="font-semibold text-gray-800 text-sm mb-2">✅ {t.verifiedProBadge?.howToEarn?.title || "How to Earn the Badge:"}</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                                <li>{t.verifiedProBadge?.howToEarn?.requirement1 || "Complete 3 months of active membership (can be 3 consecutive months or accumulative 1-month memberships)"}</li>
                                <li>{t.verifiedProBadge?.howToEarn?.requirement2 || "Maintain a rating of 4.0 stars or higher"}</li>
                                <li>{t.verifiedProBadge?.howToEarn?.requirement3 || "Keep your membership continuously active"}</li>
                            </ul>
                        </div>
                        
                        <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                            <h4 className="font-semibold text-gray-800 text-sm mb-2">⏰ {t.verifiedProBadge?.continuity?.title || "Membership Continuity Requirement:"}</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                                <li className="text-red-700 font-medium">{t.verifiedProBadge?.continuity?.renewal || "You will receive a renewal reminder 7 days before your membership expires"}</li>
                                <li className="text-red-700 font-medium">{t.verifiedProBadge?.continuity?.warning || "If membership is not renewed within 7 days before expiry, your badge display will expire"}</li>
                                <li>{t.verifiedProBadge?.continuity?.gracePeriod || "Grace Period: You have 5 days after membership expiry to renew and keep your badge active"}</li>
                                <li className="text-red-700 font-medium">{t.verifiedProBadge?.continuity?.reset || "If membership lapses beyond the 5-day grace period, your badge will be RESET and you will need to complete 3 months of membership again"}</li>
                                <li className="text-green-700 font-medium">{t.verifiedProBadge?.continuity?.maintain || "To maintain your badge: Renew your membership before it expires or within the 5-day grace period"}</li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-gray-800 text-sm mb-2">⚠️ {t.verifiedProBadge?.howToLose?.title || "Badge Removal:"}</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                                <li>{t.verifiedProBadge?.howToLose?.condition1 || "Your badge will be automatically removed if your rating falls below 4.0 stars"}</li>
                                <li>{t.verifiedProBadge?.howToLose?.condition2 || "Membership lapse beyond 5-day grace period resets badge progress"}</li>
                                <li>{t.verifiedProBadge?.howToLose?.condition3 || "The badge is visible to all clients on your profile card"}</li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-gray-800 text-sm mb-2">🔄 {t.verifiedProBadge?.howToRegain?.title || "Regaining Your Badge:"}</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                                <li>{t.verifiedProBadge?.howToRegain?.rating || "Rating Recovery: Once your rating returns to 4.0 stars or above, your badge will automatically reappear"}</li>
                                <li>{t.verifiedProBadge?.howToRegain?.membership || "Membership Lapse: If your membership lapsed beyond grace period, you must complete 3 new months of active membership"}</li>
                                <li>{t.verifiedProBadge?.howToRegain?.note || "Your progress is only preserved if you renew within the grace period"}</li>
                            </ul>
                        </div>
                        
                        <div className="bg-blue-50 p-3 rounded border border-blue-200">
                            <h4 className="font-semibold text-gray-800 text-sm mb-2">📧 {t.verifiedProBadge?.notifications?.title || "Renewal Notifications:"}</h4>
                            <p className="text-xs text-gray-700">{t.verifiedProBadge?.notifications?.content || "You will receive notifications at the following times to help you maintain your badge:"}</p>
                            <ul className="list-disc list-inside space-y-1 text-xs ml-4 mt-2">
                                <li>{t.verifiedProBadge?.notifications?.day7 || "7 days before expiry: First reminder to renew membership"}</li>
                                <li>{t.verifiedProBadge?.notifications?.day3 || "3 days before expiry: Second reminder"}</li>
                                <li>{t.verifiedProBadge?.notifications?.day1 || "1 day before expiry: Final reminder"}</li>
                                <li>{t.verifiedProBadge?.notifications?.expiry || "On expiry day: Grace period notification (5 days to renew)"}</li>
                                <li>{t.verifiedProBadge?.notifications?.grace || "Daily reminders during 5-day grace period"}</li>
                            </ul>
                        </div>
                        
                        <p className="text-xs text-gray-600 italic mt-3">{t.verifiedProBadge?.note || "The Verified Pro badge demonstrates your commitment to quality service and helps you stand out to potential clients. Maintain continuous membership to keep your badge active."}</p>
                    </div>
                </div>
                
                <div className="space-y-2 pt-4 border-t-2 border-orange-200">
                    <h3 className="font-bold text-gray-800 text-lg">{t.disclaimerTitle}</h3>
                    <p className="text-sm leading-relaxed">{t.disclaimerContent}</p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">{t.limitationOfLiability.title}</h3>
                    <p className="text-sm leading-relaxed">{t.limitationOfLiability.content}</p>
                </div>
                
                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">{t.disputeResolution.title}</h3>
                    <p className="text-sm leading-relaxed">{t.disputeResolution.content}</p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">{t.indemnification.title}</h3>
                    <p className="text-sm leading-relaxed">{t.indemnification.content}</p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">{t.modifications.title}</h3>
                    <p className="text-sm leading-relaxed">{t.modifications.content}</p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">{t.severability.title}</h3>
                    <p className="text-sm leading-relaxed">{t.severability.content}</p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">{t.entireAgreement.title}</h3>
                    <p className="text-sm leading-relaxed">{t.entireAgreement.content}</p>
                </div>

                <div className="space-y-2 bg-gray-100 p-4 rounded-lg">
                    <h3 className="font-bold text-gray-800 text-lg">{t.contactInformation.title}</h3>
                    <p className="text-sm leading-relaxed">{t.contactInformation.content}</p>
                </div>
            </main>

            <div className="p-4 fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t">
                 <Button
                    onClick={handleWhatsAppClick}
                    className="w-full flex items-center justify-center gap-2"
                >
                    <WhatsAppIcon className="w-5 h-5"/>
                    <span>{t.customerServiceButton}</span>
                </Button>
            </div>
        </div>
    );
};

export default ServiceTermsPage;