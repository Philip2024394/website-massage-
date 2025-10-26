import React, { useState, useEffect } from 'react';
import type { Hotel, Villa } from '../types';
import Button from '../components/Button';

interface HotelVillaBankDetailsPageProps {
    hotelVilla: Hotel | Villa;
    hotelVillaType: 'hotel' | 'villa';
    onSave: (updatedDetails: Partial<Hotel | Villa>) => Promise<void>;
    onBack: () => void;
}

const HotelVillaBankDetailsPage: React.FC<HotelVillaBankDetailsPageProps> = ({
    hotelVilla,
    hotelVillaType,
    onSave,
    onBack
}) => {
    const [bankName, setBankName] = useState(hotelVilla.bankName || '');
    const [bankAccountNumber, setBankAccountNumber] = useState(hotelVilla.bankAccountNumber || '');
    const [bankAccountName, setBankAccountName] = useState(hotelVilla.bankAccountName || '');
    const [bankSwiftCode, setBankSwiftCode] = useState(hotelVilla.bankSwiftCode || '');
    const [mobilePaymentNumber, setMobilePaymentNumber] = useState(hotelVilla.mobilePaymentNumber || '');
    const [mobilePaymentType, setMobilePaymentType] = useState(hotelVilla.mobilePaymentType || 'GoPay');
    const [preferredPaymentMethod, setPreferredPaymentMethod] = useState<'bank_transfer' | 'cash' | 'mobile_payment'>(
        hotelVilla.preferredPaymentMethod || 'bank_transfer'
    );
    const [paymentInstructions, setPaymentInstructions] = useState(hotelVilla.paymentInstructions || '');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async () => {
        // Validation
        if (preferredPaymentMethod === 'bank_transfer') {
            if (!bankName || !bankAccountNumber || !bankAccountName) {
                setError('Please fill in all required bank details');
                return;
            }
        }

        if (preferredPaymentMethod === 'mobile_payment') {
            if (!mobilePaymentNumber || !mobilePaymentType) {
                setError('Please fill in all required e-wallet details');
                return;
            }
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const updatedDetails: Partial<Hotel | Villa> = {
                bankName,
                bankAccountNumber,
                bankAccountName,
                bankSwiftCode,
                mobilePaymentNumber,
                mobilePaymentType,
                preferredPaymentMethod,
                paymentInstructions
            };

            await onSave(updatedDetails);
            setSuccess('Bank details saved successfully!');
        } catch (err) {
            console.error('Failed to save bank details:', err);
            setError('Failed to save bank details. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-gray-900 to-orange-600 text-white py-6 px-4 shadow-xl">
                <div className="max-w-3xl mx-auto">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Back</span>
                    </button>
                    <h1 className="text-2xl md:text-3xl font-bold">Payment Details</h1>
                    <p className="text-orange-100 mt-2">Configure where providers should send commission payments</p>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8">
                {/* Success Message */}
                {success && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-lg">
                        <p className="text-green-700 font-medium">{success}</p>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
                        <p className="text-red-700 font-medium">{error}</p>
                    </div>
                )}

                {/* Info Banner */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-lg">
                    <h3 className="text-blue-800 font-bold mb-2">ℹ️ About Commission Payments</h3>
                    <p className="text-blue-700 text-sm">
                        Providers must pay commission fees after completing services at your {hotelVillaType}.
                        They will upload payment proof screenshots which you can verify in the Commission Verification page.
                    </p>
                </div>

                {/* Preferred Payment Method */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Preferred Payment Method</h2>
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={() => setPreferredPaymentMethod('bank_transfer')}
                            className={`py-4 px-4 rounded-xl text-center font-semibold transition-all ${
                                preferredPaymentMethod === 'bank_transfer'
                                    ? 'bg-orange-500 text-white shadow-lg scale-105'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <div className="text-2xl mb-1">🏦</div>
                            <div className="text-sm">Bank Transfer</div>
                        </button>
                        <button
                            onClick={() => setPreferredPaymentMethod('cash')}
                            className={`py-4 px-4 rounded-xl text-center font-semibold transition-all ${
                                preferredPaymentMethod === 'cash'
                                    ? 'bg-orange-500 text-white shadow-lg scale-105'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <div className="text-2xl mb-1">💵</div>
                            <div className="text-sm">Cash</div>
                        </button>
                        <button
                            onClick={() => setPreferredPaymentMethod('mobile_payment')}
                            className={`py-4 px-4 rounded-xl text-center font-semibold transition-all ${
                                preferredPaymentMethod === 'mobile_payment'
                                    ? 'bg-orange-500 text-white shadow-lg scale-105'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <div className="text-2xl mb-1">📱</div>
                            <div className="text-sm">E-Wallet</div>
                        </button>
                    </div>
                </div>

                {/* Bank Transfer Details */}
                {preferredPaymentMethod === 'bank_transfer' && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">🏦 Bank Account Details</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="bankName" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Bank Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="bankName"
                                    type="text"
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                    placeholder="e.g., Bank Mandiri, BCA, BNI"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring focus:ring-orange-200 transition-all"
                                />
                            </div>

                            <div>
                                <label htmlFor="bankAccountNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Account Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="bankAccountNumber"
                                    type="text"
                                    value={bankAccountNumber}
                                    onChange={(e) => setBankAccountNumber(e.target.value)}
                                    placeholder="e.g., 1234567890"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring focus:ring-orange-200 transition-all font-mono"
                                />
                            </div>

                            <div>
                                <label htmlFor="bankAccountName" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Account Holder Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="bankAccountName"
                                    type="text"
                                    value={bankAccountName}
                                    onChange={(e) => setBankAccountName(e.target.value)}
                                    placeholder="e.g., PT Hotel Indonesia"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring focus:ring-orange-200 transition-all"
                                />
                            </div>

                            <div>
                                <label htmlFor="bankSwiftCode" className="block text-sm font-semibold text-gray-700 mb-2">
                                    SWIFT/BIC Code <span className="text-gray-400">(Optional, for international transfers)</span>
                                </label>
                                <input
                                    id="bankSwiftCode"
                                    type="text"
                                    value={bankSwiftCode}
                                    onChange={(e) => setBankSwiftCode(e.target.value)}
                                    placeholder="e.g., BDINIDJA"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring focus:ring-orange-200 transition-all font-mono"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* E-Wallet Details */}
                {preferredPaymentMethod === 'mobile_payment' && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">📱 E-Wallet Details</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="mobilePaymentType" className="block text-sm font-semibold text-gray-700 mb-2">
                                    E-Wallet Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="mobilePaymentType"
                                    value={mobilePaymentType}
                                    onChange={(e) => setMobilePaymentType(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring focus:ring-orange-200 transition-all"
                                >
                                    <option value="GoPay">GoPay</option>
                                    <option value="OVO">OVO</option>
                                    <option value="Dana">Dana</option>
                                    <option value="LinkAja">LinkAja</option>
                                    <option value="ShopeePay">ShopeePay</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="mobilePaymentNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="mobilePaymentNumber"
                                    type="tel"
                                    value={mobilePaymentNumber}
                                    onChange={(e) => setMobilePaymentNumber(e.target.value)}
                                    placeholder="e.g., +62812345678"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring focus:ring-orange-200 transition-all font-mono"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Cash Payment Instructions */}
                {preferredPaymentMethod === 'cash' && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">💵 Cash Payment Instructions</h2>
                        <p className="text-gray-600 text-sm mb-4">
                            Providers will pay cash commission directly to your front desk or designated staff.
                            They must provide a receipt or screenshot of your staff's confirmation.
                        </p>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-yellow-800 text-sm font-semibold">
                                💡 Tip: Ensure your front desk staff issues receipts for all commission payments received.
                            </p>
                        </div>
                    </div>
                )}

                {/* Additional Payment Instructions */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Additional Instructions</h2>
                    <p className="text-gray-600 text-sm mb-3">
                        Provide any additional instructions or notes for providers making commission payments
                    </p>
                    <textarea
                        value={paymentInstructions}
                        onChange={(e) => setPaymentInstructions(e.target.value)}
                        placeholder="e.g., Please include booking ID in transfer description. Payment must be made within 24 hours of service completion."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring focus:ring-orange-200 transition-all resize-none"
                        rows={4}
                    />
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all ${
                        isSubmitting
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-xl hover:shadow-2xl hover:scale-[1.02]'
                    }`}
                >
                    {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                        </span>
                    ) : (
                        'Save Payment Details'
                    )}
                </button>
            </main>
        </div>
    );
};

export default HotelVillaBankDetailsPage;
