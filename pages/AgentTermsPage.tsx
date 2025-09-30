import React, { useState } from 'react';
import Button from '../components/Button';

interface AgentTermsPageProps {
    onAccept: () => Promise<void>;
    onLogout: () => void;
    t: any;
}

const TermSection: React.FC<{ title: string; content: string }> = ({ title, content }) => (
    <div className="space-y-2">
        <h3 className="font-bold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-700">{content}</p>
    </div>
);

const AgentTermsPage: React.FC<AgentTermsPageProps> = ({ onAccept, onLogout, t }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleAccept = async () => {
        setIsLoading(true);
        await onAccept();
        // The isLoading state will effectively be managed by the page transition
    };
    
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
             <header className="p-4 bg-white sticky top-0 z-10 shadow-sm flex items-center justify-center">
                <h1 className="text-xl font-bold text-gray-800">{t.title}</h1>
            </header>

            <div className="flex-grow p-6 overflow-y-auto">
                 <p className="text-center text-gray-600 mb-6">{t.agreement}</p>
                 <div className="space-y-6">
                    <TermSection title={t.independentContractor.title} content={t.independentContractor.content} />
                    <TermSection title={t.noExclusivity.title} content={t.noExclusivity.content} />
                    <TermSection title={t.professionalConduct.title} content={t.professionalConduct.content} />
                    <TermSection title={t.socialMediaPolicy.title} content={t.socialMediaPolicy.content} />
                    <TermSection title={t.performance.title} content={t.performance.content} />
                    <TermSection title={t.performanceTiers.title} content={t.performanceTiers.content} />
                    <TermSection title={t.renewals.title} content={t.renewals.content} />
                    <TermSection title={t.payment.title} content={t.payment.content} />
                    <TermSection title={t.profileCompletion.title} content={t.profileCompletion.content} />
                    <TermSection title={t.compliance.title} content={t.compliance.content} />
                    <TermSection title={t.training.title} content={t.training.content} />
                    <TermSection title={t.indemnification.title} content={t.indemnification.content} />
                </div>
            </div>

            <footer className="p-4 bg-white border-t sticky bottom-0 z-10">
                <div className="flex gap-4">
                     <Button onClick={onLogout} variant="secondary" disabled={isLoading}>
                        {t.declineButton}
                    </Button>
                    <Button onClick={handleAccept} disabled={isLoading}>
                        {isLoading ? 'Accepting...' : t.acceptButton}
                    </Button>
                </div>
            </footer>
        </div>
    );
};

export default AgentTermsPage;