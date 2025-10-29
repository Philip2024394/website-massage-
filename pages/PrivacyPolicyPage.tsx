import React from 'react';
import Footer from '../components/Footer';
import { translations } from '../translations/index.ts';

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
            <header className="p-4 bg-white sticky top-0 z-20 shadow-sm">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500">
                            <span className="inline-block animate-float">S</span>treet
                        </span>
                    </h1>
                    <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </header>

            <main className="p-6 space-y-8 text-gray-700 pb-24">
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

            <Footer onHomeClick={onBack} t={translations} />

            <style>{`\n                @keyframes float {\n                    0%, 100% { transform: translateY(0); }\n                    50% { transform: translateY(-5px); }\n                }\n                .animate-float {\n                    animation: float 2s ease-in-out infinite;\n                }\n            `}</style>
        </div>
    );
};

export default PrivacyPolicyPage;
