import React, { useState } from 'react';
import { CreditCard, MessageCircle, AlertTriangle, CheckCircle, Copy, Eye, EyeOff } from 'lucide-react';

interface BankDetailsRequestButtonProps {
    onRequestBankDetails: () => void;
    bankDetails?: {
        bankName: string;
        accountHolderName: string;
        accountNumber: string;
    } | null;
    isLoading?: boolean;
    className?: string;
}

const BankDetailsRequestButton: React.FC<BankDetailsRequestButtonProps> = ({
    onRequestBankDetails,
    bankDetails,
    isLoading = false,
    className = ''
}) => {
    const [showAccountNumber, setShowAccountNumber] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const maskAccountNumber = (accountNumber: string) => {
        if (accountNumber.length <= 4) return accountNumber;
        const start = accountNumber.slice(0, 4);
        const end = accountNumber.slice(-4);
        const middle = '*'.repeat(accountNumber.length - 8);
        return `${start}${middle}${end}`;
    };

    if (bankDetails) {
        // Show bank details if available
        return (
            <div className={`bg-white rounded-xl border-2 border-green-200 shadow-lg ${className}`}>
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-t-xl">
                    <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        <h3 className="font-bold">Bank Transfer Details</h3>
                    </div>
                </div>
                
                <div className="p-4 space-y-4">
                    {/* Bank Name */}
                    <div>
                        <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Bank</label>
                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <span className="font-bold text-gray-900">{bankDetails.bankName}</span>
                        </div>
                    </div>

                    {/* Account Holder Name */}
                    <div>
                        <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Account Name</label>
                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <span className="font-bold text-gray-900">{bankDetails.accountHolderName}</span>
                        </div>
                    </div>

                    {/* Account Number */}
                    <div>
                        <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Account Number</label>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-lg text-gray-900">
                                    {showAccountNumber ? bankDetails.accountNumber : maskAccountNumber(bankDetails.accountNumber)}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setShowAccountNumber(!showAccountNumber)}
                                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                        title={showAccountNumber ? 'Hide account number' : 'Show account number'}
                                    >
                                        {showAccountNumber ? (
                                            <EyeOff className="w-4 h-4 text-gray-600" />
                                        ) : (
                                            <Eye className="w-4 h-4 text-gray-600" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => copyToClipboard(bankDetails.accountNumber)}
                                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                        title="Copy account number"
                                    >
                                        <Copy className="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                            </div>
                            {copySuccess && (
                                <div className="mt-2 text-xs text-green-600 font-medium flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    Account number copied!
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">Transfer Instructions:</p>
                                <ul className="space-y-1 text-xs">
                                    <li>• Transfer exact amount after service completion</li>
                                    <li>• Use the account details shown above</li>
                                    <li>• Keep your transfer receipt</li>
                                    <li>• Notify therapist when transfer is complete</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show request button if no bank details
    return (
        <div className={`bg-white rounded-xl border-2 border-amber-200 ${className}`}>
            <div className="p-4 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-amber-600" />
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Need Bank Details for Transfer?
                </h3>
                
                <p className="text-gray-600 mb-4 text-sm">
                    Click below to request bank account details in the chat window. 
                    The therapist will share their secure payment information.
                </p>
                
                <button
                    onClick={onRequestBankDetails}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <MessageCircle className="w-5 h-5" />
                    )}
                    {isLoading ? 'Requesting...' : 'Request Bank Details in Chat'}
                </button>
                
                <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-gray-600 text-left">
                            <p className="font-medium text-gray-700 mb-1">Safe & Secure Process:</p>
                            <p>Bank details are shared securely through our monitored chat system. 
                            Never share bank information outside the IndaStreet platform.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BankDetailsRequestButton;