import React from 'react';
import { CheckCircle, X, Upload, Star } from 'lucide-react';

interface PaymentModalProps {
    showPaymentModal: boolean;
    setShowPaymentModal: (value: boolean) => void;
    paymentProof: File | null;
    paymentProofPreview: string | null;
    uploadingPayment: boolean;
    handlePaymentProofChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handlePaymentSubmit: () => Promise<void>;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
    showPaymentModal,
    setShowPaymentModal,
    paymentProof,
    paymentProofPreview,
    uploadingPayment,
    handlePaymentProofChange,
    handlePaymentSubmit
}): JSX.Element | null => {
    if (!showPaymentModal) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {/* @ts-ignore - Lucide React 19 compat */}
                            <CheckCircle className="w-6 h-6 text-white" />
                            <h2 className="text-white text-lg font-bold">Submit Payment & Go Live</h2>
                        </div>
                        <button
                            onClick={() => setShowPaymentModal(false)}
                            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition-colors"
                            title="Close modal (you can edit profile and come back)"
                        >
                            {/* @ts-ignore - Lucide React 19 compat */}
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-4">
                    {/* Package Info */}
                    <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1">
                                {/* @ts-ignore - Lucide React 19 compat */}
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <h3 className="font-bold text-gray-800">Plus Plan - Rp 250,000/month</h3>
                        </div>
                        <ul className="text-sm text-gray-700 space-y-1">
                            <li>✅ 0% commission on all bookings</li>
                            <li>✅ Premium profile badge</li>
                            <li>✅ Priority placement in search</li>
                            <li>✅ Advanced booking features</li>
                        </ul>
                    </div>

                    {/* Payment & Verification Process */}
                    <div className="bg-blue-50 border-2 border-blue-400 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-2xl">📋</span>
                            <h3 className="font-bold text-blue-900 text-lg">Payment & Verification Process</h3>
                        </div>
                        <div className="space-y-2 text-sm text-blue-900">
                            <p>✅ <strong>Step 1:</strong> Your profile is now LIVE - customers can see you</p>
                            <p>✅ <strong>Step 2:</strong> Complete payment and upload proof below</p>
                            <p>⏰ <strong>Step 3:</strong> You have 5 hours to edit your profile after submission</p>
                            <p>🔍 <strong>Step 4:</strong> Admin reviews payment within 48 hours</p>
                            <p>⭐ <strong>Step 5:</strong> Verified badge activated after approval</p>
                        </div>
                    </div>
                    
                    {/* Payment Deadline Warning */}
                    <div className="bg-orange-50 border-2 border-orange-400 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">⏰</span>
                            <h3 className="font-bold text-orange-900 text-base">Submit Payment Proof Today</h3>
                        </div>
                        <p className="text-orange-800 text-sm font-semibold">
                            💡 Upload your payment proof below. After submission, you can edit your profile for 5 hours before it locks for admin review.
                        </p>
                    </div>

                    {/* Bank Details */}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                            🏦 Bank Transfer Details
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Bank:</span>
                                <span className="font-semibold text-gray-800">Bank Mandiri</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Account Name:</span>
                                <span className="font-semibold text-gray-800">PT IndaStreet Indonesia</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Account Number:</span>
                                <span className="font-semibold text-gray-800">1370-0123-4567-890</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Amount:</span>
                                <span className="font-bold text-purple-600 text-lg">Rp 250,000</span>
                            </div>
                        </div>
                    </div>

                    {/* Upload Section */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            📸 Upload Payment Proof *
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-400 transition-colors">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePaymentProofChange}
                                className="hidden"
                                id="payment-proof-upload"
                            />
                            <label htmlFor="payment-proof-upload" className="cursor-pointer">
                                {paymentProofPreview ? (
                                    <div className="space-y-2">
                                        <img src={paymentProofPreview} alt="Payment proof" className="max-h-48 mx-auto rounded-lg" />
                                        <p className="text-sm text-green-600 font-semibold">✅ Image uploaded</p>
                                        <p className="text-xs text-gray-500">Click to change</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {/* @ts-ignore - Lucide React 19 compat */}
                                        <Upload className="w-12 h-12 mx-auto text-gray-400" />
                                        <p className="text-sm text-gray-600">Click to upload payment proof</p>
                                        <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handlePaymentSubmit}
                        disabled={!paymentProof || uploadingPayment}
                        className={`w-full px-6 py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all ${
                            !paymentProof || uploadingPayment
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl'
                        }`}
                    >
                        {uploadingPayment ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                </svg>
                                Submitting...
                            </span>
                        ) : !paymentProof ? (
                            '⚠️ Please Upload Payment Proof'
                        ) : (
                            '🚀 Submit Payment & Go LIVE!'
                        )}
                    </button>

                    {/* Info Message */}
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-800 font-medium text-center">
                            ✅ Your profile is already LIVE! Submit payment proof before midnight to keep it active.
                        </p>
                    </div>

                    {/* Can Edit Profile Note */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-800 text-center">
                            💡 You can close this modal to edit your profile and come back to submit payment anytime before midnight.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
