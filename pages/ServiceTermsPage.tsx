
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
}

const ServiceTermsPage: React.FC<ServiceTermsPageProps> = ({ onBack, t }) => {

    const handleWhatsAppClick = () => {
        const number = '6281392000050';
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

            <main className="p-6 space-y-6 text-gray-700 pb-24">
                <p className="text-sm">{t.intro}</p>
                
                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800">{t.therapistRightsTitle}</h3>
                    <p className="text-sm">{t.therapistRightsContent}</p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800">{t.paymentTitle}</h3>
                    <p className="text-sm">{t.paymentContent}</p>
                </div>
                
                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800">{t.clientCommunicationTitle}</h3>
                    <p className="text-sm">{t.clientCommunicationContent}</p>
                </div>
                
                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800">{t.clientRightsTitle}</h3>
                    <p className="text-sm">{t.clientRightsContent}</p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800">{t.therapistObligationsTitle}</h3>
                    <p className="text-sm">{t.therapistObligationsContent}</p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800">{t.professionalismTitle}</h3>
                    <p className="text-sm">{t.professionalismContent}</p>
                </div>
                
                <div className="space-y-2 pt-4 border-t border-gray-200">
                    <h3 className="font-bold text-gray-800">{t.disclaimerTitle}</h3>
                    <p className="text-sm">{t.disclaimerContent}</p>
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