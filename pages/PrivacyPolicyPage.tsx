import React from 'react';

interface PrivacyPolicyPageProps {
    onBack: () => void;
    t: any;
}

const Section: React.FC<{ title: string, content: string | React.ReactNode }> = ({ title, content }) => (
    <div className="space-y-2">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        {typeof content === 'string' ? <p className="text-sm text-gray-700 leading-relaxed">{content}</p> : content}
    </div>
);

const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onBack, t }) => {
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

            <main className="p-6 space-y-8 text-gray-700 pb-8">
                <p className="text-xs text-gray-500">{t.lastUpdated}</p>

                <Section title={t.introduction.title} content={t.introduction.content} />
                
                <Section title={t.dataCollection.title} content={
                    <div className="space-y-2 text-sm text-gray-700 leading-relaxed">
                        <p>• {t.dataCollection.personal}</p>
                        <p>• {t.dataCollection.usage}</p>
                        <p>• {t.dataCollection.location}</p>
                        <p>• {t.dataCollection.photos}</p>
                        <p>• {t.dataCollection.communications}</p>
                    </div>
                } />

                <Section title={t.dataUsage.title} content={
                    <div>
                        <p className="text-sm text-gray-700 leading-relaxed mb-2">{t.dataUsage.content}</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                            {t.dataUsage.points.map((point: string, index: number) => <li key={index}>{point}</li>)}
                        </ul>
                    </div>
                } />

                <Section title={t.dataSharing.title} content={
                     <div>
                        <p className="text-sm text-gray-700 leading-relaxed mb-2">{t.dataSharing.content}</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                            {t.dataSharing.points.map((point: string, index: number) => <li key={index}>{point}</li>)}
                        </ul>
                        <p className="text-sm text-gray-700 leading-relaxed mt-3 italic">{t.dataSharing.note}</p>
                    </div>
                } />

                <Section title={t.legalBasis.title} content={
                    <div>
                        <p className="text-sm text-gray-700 leading-relaxed mb-2">{t.legalBasis.content}</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                            {t.legalBasis.points.map((point: string, index: number) => <li key={index}>{point}</li>)}
                        </ul>
                    </div>
                } />

                <Section title={t.dataRetention.title} content={t.dataRetention.content} />
                <Section title={t.security.title} content={t.security.content} />
                <Section title={t.yourRights.title} content={t.yourRights.content} />
                <Section title={t.cookies.title} content={t.cookies.content} />
                <Section title={t.thirdPartyServices.title} content={t.thirdPartyServices.content} />
                <Section title={t.childrenPrivacy.title} content={t.childrenPrivacy.content} />
                <Section title={t.dataTransfer.title} content={t.dataTransfer.content} />
                <Section title={t.policyChanges.title} content={t.policyChanges.content} />
                <Section title={t.governing.title} content={t.governing.content} />
                
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                    <Section title={t.disclaimer.title} content={t.disclaimer.content} />
                </div>

                <Section title={t.contact.title} content={t.contact.content} />

            </main>
        </div>
    );
};

export default PrivacyPolicyPage;
