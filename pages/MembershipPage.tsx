import React, { useState } from 'react';
import MembershipTermsModal from '../components/MembershipTermsModal';
import { FileText, Star } from 'lucide-react';

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
    const [acceptedTerms, setAcceptedTerms] = useState<{ pro: boolean; plus: boolean }>({ pro: false, plus: false });
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [selectedPlanForTerms, setSelectedPlanForTerms] = useState<'pro' | 'plus' | null>(null);

    const planMeta: Record<'pro' | 'plus', { title: string; price: string }> = {
        pro: {
            title: 'Pro (Leads) Membership',
            price: 'Rp 0/month + 30% commission per booking'
        },
        plus: {
            title: 'Plus Membership',
            price: 'Rp 250,000/month, 0% commission'
        }
    };

    const handleTermsCheckbox = (plan: 'pro' | 'plus', checked: boolean) => {
        if (checked) {
            setSelectedPlanForTerms(plan);
            setShowTermsModal(true);
        } else {
            setAcceptedTerms(prev => ({ ...prev, [plan]: false }));
        }
    };

    const handleAcceptTerms = () => {
        if (selectedPlanForTerms) {
            setAcceptedTerms(prev => ({ ...prev, [selectedPlanForTerms]: true }));
        }
        setShowTermsModal(false);
        setSelectedPlanForTerms(null);
    };

    const handleCloseTermsModal = () => {
        if (selectedPlanForTerms) {
            setAcceptedTerms(prev => ({ ...prev, [selectedPlanForTerms]: false }));
        }
        setShowTermsModal(false);
        setSelectedPlanForTerms(null);
    };

    const handleSelectPlan = (plan: 'pro' | 'plus') => {
        if (!acceptedTerms[plan]) {
            return;
        }
        const meta = planMeta[plan];
        onPackageSelect(meta.title, meta.price);
    };

    const renderStars = (filled: number) => (
        <div className="flex gap-0.5">
            {[0, 1, 2, 3, 4].map((index) => (
                <Star
                    key={index}
                    className={`w-4 h-4 ${index < filled ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-300 text-gray-300'}`}
                />
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <CheckCircleIcon className="w-16 h-16 text-brand-green mx-auto mb-4" />
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                        {t?.title || 'Choose Your Membership Package'}
                    </h1>
                    <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
                        {t?.subtitle || 'Select the plan that fits your business needs'}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Pro Plan */}
                    <div className="relative rounded-3xl bg-white border-2 border-gray-200 p-8 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="absolute -top-4 left-8">
                            <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-md">
                                Pay Per Lead
                            </span>
                        </div>
                        <div className="mt-2 mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-2xl font-bold text-gray-900">Pro</h3>
                                {renderStars(3)}
                            </div>
                            <p className="text-sm text-gray-600">Great for starting out. Only pay when you get bookings.</p>
                        </div>
                        <div className="mb-6">
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-extrabold text-gray-900">Rp 0</span>
                                <span className="text-lg text-gray-500">/month</span>
                            </div>
                            <div className="mt-2 inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg text-sm font-semibold border border-orange-200">
                                <span>+</span>
                                <span className="text-xl font-bold">30%</span>
                                <span>commission per booking</span>
                            </div>
                        </div>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-start gap-3 text-gray-700">
                                <span className="text-orange-500 mt-0.5">✔</span>
                                <span><strong className="font-semibold text-gray-900">Zero upfront cost</strong> - start immediately</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-700">
                                <span className="text-orange-500 mt-0.5">✔</span>
                                <span><strong className="font-semibold text-gray-900">Pay only on success</strong> with 30% commission per booking</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-700">
                                <span className="text-orange-500 mt-0.5">✔</span>
                                <span>Full profile, photos, and services included</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-700">
                                <span className="text-orange-500 mt-0.5">✔</span>
                                <span>Price menu slider displayed on your card</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-700">
                                <span className="text-orange-500 mt-0.5">✔</span>
                                <span>Customer chat and booking system</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-700">
                                <span className="text-orange-500 mt-0.5">✔</span>
                                <span>Lead generation included</span>
                            </li>
                        </ul>
                        <div className="space-y-3">
                            <div className="p-4 bg-orange-100 border-2 border-orange-400 rounded-xl shadow-sm">
                                <label className="flex items-start cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={acceptedTerms.pro}
                                        onChange={(e) => handleTermsCheckbox('pro', e.target.checked)}
                                        className="mt-1 w-5 h-5 text-orange-600 border-2 border-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                                    />
                                    <span className="ml-3 text-sm text-gray-900">
                                        I agree to the{' '}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setSelectedPlanForTerms('pro');
                                                setShowTermsModal(true);
                                            }}
                                            className="text-orange-700 font-bold underline inline-flex items-center gap-1 hover:text-orange-800"
                                            title="View Terms & Conditions"
                                        >
                                            <FileText className="w-4 h-4" />
                                            Terms & Conditions
                                        </button>
                                    </span>
                                </label>
                                {!acceptedTerms.pro && (
                                    <p className="mt-2 text-xs text-orange-700 font-semibold flex items-center gap-1">
                                        <span>⚠️</span>
                                        Accept the terms before selecting this plan.
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => handleSelectPlan('pro')}
                                disabled={!acceptedTerms.pro}
                                className={`w-full font-bold py-4 px-6 rounded-xl transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
                                    !acceptedTerms.pro
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
                                }`}
                            >
                                <WhatsAppIcon className="w-4 h-4" />
                                {!acceptedTerms.pro ? 'Accept Terms to Continue' : 'Select Pro Plan'}
                            </button>
                            <div className="text-center">
                                <p className="text-xs text-gray-500">Perfect for:</p>
                                <div className="flex flex-wrap justify-center gap-2 mt-2">
                                    <span className="px-3 py-1 rounded-full text-xs bg-orange-50 text-orange-600 border border-orange-200 font-medium">Independent Therapists</span>
                                    <span className="px-3 py-1 rounded-full text-xs bg-orange-50 text-orange-600 border border-orange-200 font-medium">Just Getting Started</span>
                                    <span className="px-3 py-1 rounded-full text-xs bg-gray-800 text-orange-400 border border-gray-700 font-medium">Low Risk</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Plus Plan */}
                    <div className="relative rounded-3xl bg-white border-2 border-gray-200 p-8 shadow-xl hover:shadow-2xl transition-shadow">
                        <div className="absolute -top-4 left-8">
                            <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-md">
                                Most Popular
                            </span>
                        </div>
                        <div className="mt-2 mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-2xl font-bold text-gray-900">Plus</h3>
                                {renderStars(5)}
                            </div>
                            <p className="text-sm text-gray-600">All-in premium membership. Keep 100% of your bookings.</p>
                        </div>
                        <div className="mb-6">
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-extrabold text-gray-900">Rp 250K</span>
                                <span className="text-lg text-gray-500">/month</span>
                            </div>
                            <div className="mt-2 inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg text-sm font-semibold border border-orange-200">
                                <span>0% Commission</span>
                                <span>—</span>
                                <span>Keep Everything</span>
                            </div>
                        </div>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-start gap-3 text-gray-700">
                                <span className="text-orange-500 mt-0.5">✔</span>
                                <span><strong className="font-semibold text-gray-900">Zero commission</strong> — keep 100% of earnings</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-700">
                                <span className="text-orange-500 mt-0.5">✔</span>
                                <span><strong className="font-semibold text-gray-900">Verified badge</strong> on your profile</span>
                            </li>
                            <li className="flex items-start gap-3 text-orange-700">
                                <span className="text-orange-600 mt-0.5">★</span>
                                <span><strong className="font-semibold">Priority Hotel, Villa & Private Spa</strong> requests</span>
                            </li>
                            <li className="flex items-start gap-3 text-orange-700">
                                <span className="text-orange-600 mt-0.5">★</span>
                                <span><strong className="font-semibold">Full price menu slider</strong> displayed on your card</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-700">
                                <span className="text-orange-500 mt-0.5">✔</span>
                                <span><strong className="font-semibold text-gray-900">Live discount</strong> promotions system</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-700">
                                <span className="text-orange-500 mt-0.5">✔</span>
                                <span>Unlimited leads & advanced analytics</span>
                            </li>
                        </ul>
                        <div className="space-y-3">
                            <div className="p-4 bg-orange-100 border-2 border-orange-400 rounded-xl shadow-sm">
                                <label className="flex items-start cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={acceptedTerms.plus}
                                        onChange={(e) => handleTermsCheckbox('plus', e.target.checked)}
                                        className="mt-1 w-5 h-5 text-orange-600 border-2 border-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                                    />
                                    <span className="ml-3 text-sm text-gray-900">
                                        I agree to the{' '}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setSelectedPlanForTerms('plus');
                                                setShowTermsModal(true);
                                            }}
                                            className="text-orange-700 font-bold underline inline-flex items-center gap-1 hover:text-orange-800"
                                            title="View Terms & Conditions"
                                        >
                                            <FileText className="w-4 h-4" />
                                            Terms & Conditions
                                        </button>
                                    </span>
                                </label>
                                {!acceptedTerms.plus && (
                                    <p className="mt-2 text-xs text-orange-700 font-semibold flex items-center gap-1">
                                        <span>⚠️</span>
                                        Accept the terms before selecting this plan.
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => handleSelectPlan('plus')}
                                disabled={!acceptedTerms.plus}
                                className={`w-full font-bold py-4 px-6 rounded-xl transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
                                    !acceptedTerms.plus
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
                                }`}
                            >
                                <WhatsAppIcon className="w-4 h-4" />
                                {!acceptedTerms.plus ? 'Accept Terms to Continue' : 'Select Plus Plan'}
                            </button>
                            <div className="text-center">
                                <p className="text-xs text-gray-500">Perfect for:</p>
                                <div className="flex flex-wrap justify-center gap-2 mt-2">
                                    <span className="px-3 py-1 rounded-full text-xs bg-orange-50 text-orange-600 border border-orange-200 font-medium">Spas & Clinics</span>
                                    <span className="px-3 py-1 rounded-full text-xs bg-orange-50 text-orange-600 border border-orange-200 font-medium">High Volume Teams</span>
                                    <span className="px-3 py-1 rounded-full text-xs bg-orange-50 text-orange-600 border border-orange-200 font-medium">Maximum Earnings</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10 text-center">
                    <button onClick={onBack} className="text-sm font-medium text-gray-500 hover:text-gray-800">
                        {t?.backToDashboard || '← Back to Home'}
                    </button>
                </div>
            </div>

            <MembershipTermsModal
                isOpen={showTermsModal}
                onClose={handleCloseTermsModal}
                onAccept={handleAcceptTerms}
                planType={selectedPlanForTerms || 'pro'}
            />
        </div>
    );
};

export default MembershipPage;

