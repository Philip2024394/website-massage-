import React from 'react';
import Button from '../components/Button';

const WhatsAppIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.614-1.486L.057 24zM6.591 17.419c.404.652.812 1.272 1.242 1.85 1.58 2.116 3.663 3.22 5.953 3.218 5.55-.006 10.038-4.488 10.043-10.038.005-5.55-4.488-10.038-10.038-10.043-5.55.005-10.038 4.488-10.043 10.038.002 2.13.642 4.148 1.822 5.898l-1.03 3.766 3.844-1.025z"/>
    </svg>
);

const CheckCircleIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);


interface MembershipPageProps {
    onSelectPackage?: (packageName: string, price: string) => void;
    onPackageSelect: (packageName: string, price: string) => void;
    onBack: () => void;
    t: any;
}

const MembershipPage: React.FC<MembershipPageProps> = ({ onPackageSelect, onBack, t }) => {
    const packages = [
        { id: '1m', title: t.packages.oneMonth.title, price: t.packages.oneMonth.price, save: null, bestValue: false },
        { id: '3m', title: t.packages.threeMonths.title, price: t.packages.threeMonths.price, save: t.packages.threeMonths.save, bestValue: false },
        { id: '6m', title: t.packages.sixMonths.title, price: t.packages.sixMonths.price, save: t.packages.sixMonths.save, bestValue: false },
        { id: '1y', title: t.packages.oneYear.title, price: t.packages.oneYear.price, save: t.packages.oneYear.save, bestValue: true },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-4 pb-20 flex flex-col justify-center">
            <div className="text-center mb-8">
                <CheckCircleIcon className="w-16 h-16 text-brand-green mx-auto mb-2" />
                <h1 className="text-3xl font-bold text-gray-800">{t.title}</h1>
                <p className="text-gray-600 mt-2 max-w-md mx-auto">{t.subtitle}</p>
            </div>

            <div className="max-w-2xl mx-auto mb-6">
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                    <p className="text-sm text-yellow-900">
                        Important: All membership payments must be transferred ONLY to the bank account(s) displayed on the payment page. We do not accept payments to any other account or method.
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {packages.map(pkg => (
                    <div key={pkg.id} className={`bg-white rounded-xl shadow-md p-4 border-2 transition-all ${pkg.bestValue ? 'border-brand-green' : 'border-transparent'}`}>
                        {pkg.bestValue && (
                            <div className="absolute -top-3 right-4 bg-brand-green text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                {t.packages.oneYear.bestValue}
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{pkg.title}</h3>
                                <p className="text-2xl font-extrabold text-brand-green-dark mt-1">{pkg.price}</p>
                                {pkg.save && <p className="text-sm font-semibold text-green-600">{pkg.save}</p>}
                            </div>
                            <Button 
                                onClick={() => onPackageSelect(pkg.title, pkg.price)}
                                className="w-auto px-4 py-2 flex items-center gap-2 text-sm"
                            >
                                <WhatsAppIcon className="w-4 h-4" />
                                {t.selectButton.split(' ')[0]}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 text-center">
                <button onClick={onBack} className="text-sm font-medium text-gray-500 hover:text-gray-800">
                    {t.backToDashboard}
                </button>
            </div>
        </div>
    );
};

export default MembershipPage;

