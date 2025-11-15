import React, { useMemo, useState } from 'react';
import Button from '../components/Button';
import { getAgentTerms } from './agentTermsContent';

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

    // Safe defaults to protect from missing translations and strengthen legal coverage
    const terms = useMemo(() => getAgentTerms(t), [t]);

    const handleAccept = async () => {
        setIsLoading(true);
        await onAccept();
        // The isLoading state will effectively be managed by the page transition
    };
    
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
                 <header className="p-4 bg-white sticky top-0 z-10 shadow-sm flex items-center justify-center">
                     <h1 className="text-xl font-bold text-gray-800">{terms.title}</h1>
            </header>

            <div className="flex-grow p-6 overflow-y-auto">
                 <p className="text-center text-gray-600 mb-6">{terms.agreement}</p>
                 <div className="space-y-6">
                    {terms.sections.map((s: any, idx: number) => (
                        <TermSection key={idx} title={s.title} content={s.content} />
                    ))}
                </div>
            </div>

            <footer className="p-4 bg-white border-t sticky bottom-0 z-10">
                <div className="flex gap-4 pb-20">
                     <Button onClick={onLogout} variant="secondary" disabled={isLoading}>
                        {terms.declineButton}
                    </Button>
                    <Button onClick={handleAccept} disabled={isLoading}>
                        {isLoading ? 'Accepting...' : terms.acceptButton}
                    </Button>
                </div>
            </footer>
        </div>
    );
};

export default AgentTermsPage;

