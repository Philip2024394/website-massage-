import React from 'react';
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
    // Defensive translation guards to prevent runtime crashes if namespace shape changes
    const tp = t || {};
    const safeArr = (arr: any) => (Array.isArray(arr) ? arr : []);
    
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
                <p className="text-xs text-gray-500">{tp.lastUpdated || ''}</p>

                <Section title={tp.introduction?.title || 'Introduction'} content={tp.introduction?.content || ''} />
                
                <Section title={tp.dataCollection?.title || 'Data We Collect'} content={
                    <div className="space-y-2 text-sm text-gray-700 leading-relaxed">
                        <p>• {tp.dataCollection?.personal || ''}</p>
                        <p>• {tp.dataCollection?.usage || ''}</p>
                        <p>• {tp.dataCollection?.location || ''}</p>
                        <p>• {tp.dataCollection?.photos || ''}</p>
                        <p>• {tp.dataCollection?.communications || ''}</p>
                    </div>
                } />

                <Section title={tp.dataUsage?.title || 'How We Use Data'} content={
                    <div>
                        <p className="text-sm text-gray-700 leading-relaxed mb-2">{tp.dataUsage?.content || ''}</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                            {safeArr(tp.dataUsage?.points).map((point: string, index: number) => <li key={index}>{point}</li>)}
                        </ul>
                    </div>
                } />

                <Section title={tp.dataSharing?.title || 'Data Sharing'} content={
                     <div>
                        <p className="text-sm text-gray-700 leading-relaxed mb-2">{tp.dataSharing?.content || ''}</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                            {safeArr(tp.dataSharing?.points).map((point: string, index: number) => <li key={index}>{point}</li>)}
                        </ul>
                        <p className="text-sm text-gray-700 leading-relaxed mt-3 italic">{tp.dataSharing?.note || ''}</p>
                    </div>
                } />

                <Section title={tp.legalBasis?.title || 'Legal Basis'} content={
                    <div>
                        <p className="text-sm text-gray-700 leading-relaxed mb-2">{tp.legalBasis?.content || ''}</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                            {safeArr(tp.legalBasis?.points).map((point: string, index: number) => <li key={index}>{point}</li>)}
                        </ul>
                    </div>
                } />

                <Section title={tp.dataRetention?.title || 'Data Retention'} content={tp.dataRetention?.content || ''} />
                <Section title={tp.security?.title || 'Security'} content={tp.security?.content || ''} />
                <Section title={tp.yourRights?.title || 'Your Rights'} content={tp.yourRights?.content || ''} />
                <Section title={tp.cookies?.title || 'Cookies'} content={tp.cookies?.content || ''} />
                <Section title={tp.thirdPartyServices?.title || 'Third-Party Services'} content={tp.thirdPartyServices?.content || ''} />
                <Section title={tp.childrenPrivacy?.title || "Children's Privacy"} content={tp.childrenPrivacy?.content || ''} />
                <Section title={tp.dataTransfer?.title || 'International Transfers'} content={tp.dataTransfer?.content || ''} />
                <Section title={tp.policyChanges?.title || 'Policy Changes'} content={tp.policyChanges?.content || ''} />
                <Section title={tp.governing?.title || 'Governing Law'} content={tp.governing?.content || ''} />
                
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                    <Section title={tp.disclaimer?.title || 'Disclaimer'} content={tp.disclaimer?.content || ''} />
                </div>

                <Section title={tp.contact?.title || 'Contact'} content={tp.contact?.content || ''} />

            </main>

            {/* Navigation footer removed: GlobalFooter provides app-wide navigation */}

            <style>{`\n                @keyframes float {\n                    0%, 100% { transform: translateY(0); }\n                    50% { transform: translateY(-5px); }\n                }\n                .animate-float {\n                    animation: float 2s ease-in-out infinite;\n                }\n            `}</style>
        </div>
    );
};

export default PrivacyPolicyPage;
