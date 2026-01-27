import React, { useState } from 'react';
import { CreditCard, AlertTriangle, CheckCircle } from 'lucide-react';

interface PaymentMethodSelectorProps {
    selectedMethod: 'cash' | 'bank_transfer' | null;
    onMethodSelect: (method: 'cash' | 'bank_transfer') => void;
    amount?: number;
    showBankDetails?: boolean;
    onRequestBankDetails?: () => void;
    className?: string;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
    selectedMethod,
    onMethodSelect,
    amount,
    showBankDetails = true,
    onRequestBankDetails,
    className = ''
}) => {
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Payment Amount Display */}
            {amount && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 text-center">
                    <div className="text-sm text-blue-700 font-medium mb-1">Payment Amount</div>
                    <div className="text-2xl font-bold text-blue-900">{formatCurrency(amount)}</div>
                </div>
            )}

            {/* Payment Method Options */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    💳 Choose Payment Method
                </h3>
                
                {/* Cash Payment Option */}
                <button
                    onClick={() => onMethodSelect('cash')}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${
                        selectedMethod === 'cash'
                            ? 'border-green-500 bg-green-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-full ${
                                selectedMethod === 'cash' ? 'bg-green-500' : 'bg-gray-200'
                            }`}>
                                <span>💵</span>
                            </div>
                            <div className="text-left">
                                <h4 className="font-bold text-gray-900">💵 Cash Payment</h4>
                                <p className="text-sm text-gray-600">Pay directly after service completion</p>
                            </div>
                        </div>
                        {selectedMethod === 'cash' && (
                            <CheckCircle className="w-6 h-6 text-green-500" />
                        )}
                    </div>
                    
                    {selectedMethod === 'cash' && (
                        <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
                            <div className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-gray-700">
                                    <p className="font-medium text-green-800 mb-1">Cash Payment Selected</p>
                                    <p>Please have exact amount ready. Payment due after service completion.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </button>

                {/* Bank Transfer Option */}
                <button
                    onClick={() => onMethodSelect('bank_transfer')}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${
                        selectedMethod === 'bank_transfer'
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-full ${
                                selectedMethod === 'bank_transfer' ? 'bg-blue-500' : 'bg-gray-200'
                            }`}>
                                <CreditCard className={`w-6 h-6 ${
                                    selectedMethod === 'bank_transfer' ? 'text-white' : 'text-gray-600'
                                }`} />
                            </div>
                            <div className="text-left">
                                <h4 className="font-bold text-gray-900">🏦 Bank Transfer</h4>
                                <p className="text-sm text-gray-600">Transfer to therapist's bank account</p>
                            </div>
                        </div>
                        {selectedMethod === 'bank_transfer' && (
                            <CheckCircle className="w-6 h-6 text-blue-500" />
                        )}
                    </div>
                </button>

                {/* Bank Transfer Details Notice */}
                {selectedMethod === 'bank_transfer' && (
                    <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-6 h-6 text-orange-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-orange-900 mb-2">Bank Transfer Instructions</h4>
                                <div className="space-y-2 text-sm text-orange-800">
                                    <p>• IndaStreet will provide bank details in the chat window</p>
                                    <p>• Therapist will share their bank account information</p>
                                    <p>• Transfer exact amount after service completion</p>
                                    <p>• Keep transfer receipt for your records</p>
                                </div>
                                
                                {showBankDetails && onRequestBankDetails && (
                                    <button
                                        onClick={onRequestBankDetails}
                                        className="mt-3 px-4 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                                    >
                                        🏦 Request Bank Details in Chat
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Payment Security Notice */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Secure Payment Process</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p>• All payments are processed after service completion</p>
                            <p>• Bank details are shared securely through our chat system</p>
                            <p>• IndaStreet monitors all payment communications</p>
                            <p>• Report any payment issues to our support team</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentMethodSelector;