// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
import React from 'react';
import { X, FileText } from 'lucide-react';

interface MembershipTermsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAccept: () => void;
    planType: 'pro' | 'plus';
}

const MembershipTermsModal: React.FC<MembershipTermsModalProps> = ({
    isOpen,
    onClose,
    onAccept,
    planType
}) => {
    if (!isOpen) return null;

    const planDetails = {
        pro: {
            title: 'Pro (Leads) Membership Terms',
            price: 'Rp 0/month + 30% commission per booking',
            features: [
                'Free monthly subscription',
                '30% commission on each completed booking',
                'Access to customer leads',
                'Basic profile listing',
                'Customer communication tools'
            ]
        },
        plus: {
            title: 'Plus Membership Terms',
            price: 'Rp 250,000/month, 0% commission',
            features: [
                'Monthly subscription fee: Rp 250,000',
                '0% commission on bookings',
                'Priority listing in search results',
                'Enhanced profile features',
                'Advanced analytics and insights',
                'Premium customer support'
            ]
        }
    };

    const currentPlan = planDetails[planType];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white">
                            <FileText className="w-6 h-6" />
                            <h2 className="text-xl font-bold">{currentPlan.title}</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <p className="text-white/90 text-sm mt-1">{currentPlan.price}</p>
                </div>

                {/* Content */}
                <div className="p-6  max-h-[60vh]">
                    <div className="space-y-6">
                        {/* Plan Features */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Plan Features</h3>
                            <ul className="space-y-2">
                                {currentPlan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                                        <span className="text-gray-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Terms and Conditions */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Terms and Conditions</h3>
                            <div className="text-sm text-gray-600 space-y-3">
                                <p>
                                    <strong>1. Service Agreement:</strong> By accepting this membership, you agree to provide massage/wellness services through the IndaStreet platform in accordance with our quality standards and customer service guidelines.
                                </p>
                                
                                <p>
                                    <strong>2. Payment Terms:</strong> {planType === 'pro' 
                                        ? 'Commission fees will be automatically deducted from each completed booking payment. Payments are processed weekly.'
                                        : 'Monthly membership fees are due on the same date each month. Failure to pay will result in account suspension after 5 days grace period.'
                                    }
                                </p>
                                
                                <p>
                                    <strong>3. Profile Requirements:</strong> You must maintain accurate profile information, including current pricing, availability, and service descriptions. Fake or misleading information may result in account termination.
                                </p>
                                
                                <p>
                                    <strong>4. Customer Interactions:</strong> All customer communications must be professional and respectful. Any inappropriate behavior will result in immediate account suspension and potential legal action.
                                </p>
                                
                                <p>
                                    <strong>5. Cancellation Policy:</strong> {planType === 'pro'
                                        ? 'Pro membership can be cancelled at any time. Outstanding commission payments remain due.'
                                        : 'Plus membership requires 30 days notice for cancellation. No refunds for partial months.'
                                    }
                                </p>
                                
                                <p>
                                    <strong>6. Quality Standards:</strong> You agree to maintain high service quality, punctuality, and professionalism. Consistently poor reviews may result in account review or suspension.
                                </p>
                                
                                <p>
                                    <strong>7. Platform Rules:</strong> You must comply with all IndaStreet platform rules, Indonesian law, and local regulations regarding massage and wellness services.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onAccept}
                            className="px-8 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                        >
                            Accept Terms & Continue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MembershipTermsModal;