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
                        <p><strong>{t.dataCollection.personal.split(':')[0]}:</strong> {t.dataCollection.personal.split(':')[1]}</p>
                        <p><strong>{t.dataCollection.usage.split(':')[0]}:</strong> {t.dataCollection.usage.split(':')[1]}</p>
                        <p><strong>{t.dataCollection.location.split(':')[0]}:</strong> {t.dataCollection.location.split(':')[1]}</p>
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
                            {t.dataSharing.points.map((point: string, index: number) => {
                                const parts = point.split(':');
                                return <li key={index}><strong>{parts[0]}:</strong>{parts.slice(1).join(':')}</li>
                            })}
                        </ul>
                    </div>
                } />
                
                <Section title={t.security.title} content={t.security.content} />
                <Section title={t.yourRights.title} content={t.yourRights.content} />
                <Section title={t.policyChanges.title} content={t.policyChanges.content} />
                <Section title={t.contact.title} content={t.contact.content} />

            </main>
        </div>
    );
};

export default PrivacyPolicyPage;
