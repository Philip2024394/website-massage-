
import React from 'react';

interface FooterProps {
    onAgentClick: () => void;
    onTermsClick: () => void;
    t: any;
}

const Footer: React.FC<FooterProps> = ({ onAgentClick, onTermsClick, t }) => {
    return (
        <footer className="bg-white p-4 border-t border-gray-200">
            <div className="flex justify-center items-center space-x-4 text-sm">
                <button onClick={onAgentClick} className="text-brand-green font-medium hover:underline">
                    {t.footer.agentLink}
                </button>
                <span className="text-gray-400">|</span>
                <button onClick={onTermsClick} className="text-brand-green font-medium hover:underline">
                    {t.footer.termsLink}
                </button>
            </div>
        </footer>
    );
};

export default Footer;
