import React, { useState, useEffect } from 'react';
import type { CommissionRecord } from '../types';
import { CommissionPaymentStatus, CommissionPaymentMethod } from '../types';
import ImageUpload from '../components/ImageUpload';
import { commissionPaymentService } from '../services/commissionPaymentService';

interface ProviderCommissionPaymentPageProps {
    providerId: number;
    providerType: 'therapist' | 'place';
    onBack: () => void;
}

const ProviderCommissionPaymentPage: React.FC<ProviderCommissionPaymentPageProps> = ({
    providerId,
    providerType,
    onBack
}) => {
    const [pendingPayments, setPendingPayments] = useState<CommissionRecord[]>([]);
    const [selectedPayment, setSelectedPayment] = useState<CommissionRecord | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<CommissionPaymentMethod>(CommissionPaymentMethod.BankTransfer);
    const [paymentProofImage, setPaymentProofImage] = useState<string>('');
    const [bankDetails, setBankDetails] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        loadPendingPayments();
    }, [providerId, providerType]);

    const loadPendingPayments = async () => {
        try {
            const payments = await commissionPaymentService.getProviderPendingPayments(
                providerId,
                providerType
            );
            setPendingPayments(payments);
        } catch (err) {
            console.error('Failed to load pending payments:', err);
            setError('Failed to load pending payments');
        }
    };

    const loadBankDetails = async (hotelVillaId: number, hotelVillaType: 'hotel' | 'villa') => {
        try {
            const details = await commissionPaymentService.getHotelVillaBankDetails(
                hotelVillaId,
                hotelVillaType
            );
            setBankDetails(details);
        } catch (err) {
            console.error('Failed to load bank details:', err);
        }
    };

    const handleSelectPayment = (payment: CommissionRecord) => {
        setSelectedPayment(payment);
        setError(null);
        setSuccess(null);
        
        // Load hotel/villa bank details
        // TODO: Determine if it's hotel or villa from payment data
        loadBankDetails(payment.hotelVillaId, 'hotel'); // Placeholder
    };

    const handleUploadProof = async () => {
        if (!selectedPayment || !paymentProofImage) {
            setError('Please upload payment proof screenshot');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await commissionPaymentService.uploadPaymentProof(
                selectedPayment.id,
                paymentProofImage,
                paymentMethod
            );

            setSuccess('Payment proof uploaded successfully! Hotel/Villa will verify it soon.');
            setPaymentProofImage('');
            setSelectedPayment(null);
            
            // Reload pending payments
            await loadPendingPayments();
        } catch (err) {
            console.error('Failed to upload payment proof:', err);
            setError('Failed to upload payment proof. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status: CommissionPaymentStatus) => {
        const badges = {
            [CommissionPaymentStatus.Pending]: 'bg-yellow-100 text-yellow-800',
            [CommissionPaymentStatus.AwaitingVerification]: 'bg-blue-100 text-blue-800',
            [CommissionPaymentStatus.Verified]: 'bg-green-100 text-green-800',
            [CommissionPaymentStatus.Rejected]: 'bg-red-100 text-red-800',
            [CommissionPaymentStatus.Cancelled]: 'bg-gray-100 text-gray-800'
        };

        const labels = {
            [CommissionPaymentStatus.Pending]: 'Payment Due',
            [CommissionPaymentStatus.AwaitingVerification]: 'Verifying',
            [CommissionPaymentStatus.Verified]: 'Verified',
            [CommissionPaymentStatus.Rejected]: 'Rejected',
            [CommissionPaymentStatus.Cancelled]: 'Cancelled'
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[status]}`}>
                {labels[status]}
            </span>
        );
    };

    const totalOutstanding = pendingPayments
        .filter(p => p.status !== CommissionPaymentStatus.Verified)
        .reduce((sum, p) => sum + p.commissionAmount, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-gray-900 to-orange-600 text-white py-6 px-4 shadow-xl">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Back</span>
                    </button>
                    <h1 className="text-2xl md:text-3xl font-bold">Commission Payments</h1>
                    <p className="text-orange-100 mt-2">Upload payment proof to become available</p>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Warning Banner */}
                {pendingPayments.length > 0 && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 pb-20 mb-6 rounded-lg backdrop-blur-sm">
                        <div className="flex items-start">
                            <svg className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <h3 className="text-yellow-800 font-bold text-lg">⚠️ You are currently BUSY</h3>
                                <p className="text-yellow-700 mt-1">
                                    You have <strong>{pendingPayments.length} pending commission payment(s)</strong> totaling <strong className="text-orange-600">Rp {totalOutstanding.toLocaleString()}</strong>.
                                </p>
                                <p className="text-yellow-700 mt-1">
                                    Upload payment proof and get hotel/villa verification to become <strong>Available</strong> again.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 pb-20 mb-6 rounded-lg">
                        <p className="text-green-700 font-medium">{success}</p>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 pb-20 mb-6 rounded-lg">
                        <p className="text-red-700 font-medium">{error}</p>
                    </div>
                )}

                {/* Pending Payments List */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Pending Commission Payments</h2>
                    
                    {pendingPayments.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-gray-700 font-bold text-lg">All Clear!</h3>
                            <p className="text-gray-500 mt-2">No pending commission payments</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingPayments.map(payment => (
                                <div
                                    key={payment.id}
                                    className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${
                                        selectedPayment?.id === payment.id
                                            ? 'border-orange-500 bg-orange-50'
                                            : 'border-gray-200 hover:border-orange-300'
                                    }`}
                                    onClick={() => handleSelectPayment(payment)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-bold text-gray-800">Booking #{payment.bookingId}</h3>
                                                {getStatusBadge(payment.status)}
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                                                <div>
                                                    <span className="text-gray-500">Service Amount:</span>
                                                    <p className="font-semibold text-gray-800">Rp {payment.serviceAmount.toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Commission ({payment.commissionRate}%):</span>
                                                    <p className="font-bold text-orange-600 text-lg">Rp {payment.commissionAmount.toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Service Date:</span>
                                                    <p className="font-semibold text-gray-800">
                                                        {new Date(payment.bookingDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Status:</span>
                                                    <p className="font-semibold text-gray-800">
                                                        {payment.status === CommissionPaymentStatus.Rejected && payment.rejectionReason
                                                            ? payment.rejectionReason
                                                            : payment.status.replace('_', ' ').toUpperCase()}
                                                    </p>
                                                </div>
                                            </div>

                                            {payment.status === CommissionPaymentStatus.Rejected && (
                                                <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                                                    <p className="text-red-700 text-sm">
                                                        <strong>Rejected:</strong> {payment.rejectionReason || 'Payment proof was unclear'}
                                                    </p>
                                                    <p className="text-red-600 text-xs mt-1">Please upload a clearer screenshot</p>
                                                </div>
                                            )}

                                            {payment.status === CommissionPaymentStatus.AwaitingVerification && (
                                                <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                    <p className="text-blue-700 text-sm">
                                                        ⏳ Hotel/Villa is verifying your payment proof...
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {selectedPayment?.id === payment.id && (
                                            <svg className="w-6 h-6 text-orange-500 flex-shrink-0 ml-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Upload Payment Proof Form */}
                {selectedPayment && (
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Upload Payment Proof</h2>

                        {/* Bank Details */}
                        {bankDetails && (
                            <div className="bg-gray-50 rounded-xl p-4 pb-20 mb-6">
                                <h3 className="font-bold text-gray-700 mb-3">Payment Details</h3>
                                
                                {bankDetails.preferredPaymentMethod === 'bank_transfer' && (
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Bank Name:</span>
                                            <span className="font-semibold">{bankDetails.bankName || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Account Number:</span>
                                            <span className="font-semibold font-mono">{bankDetails.bankAccountNumber || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Account Name:</span>
                                            <span className="font-semibold">{bankDetails.bankAccountName || 'N/A'}</span>
                                        </div>
                                    </div>
                                )}

                                {bankDetails.preferredPaymentMethod === 'mobile_payment' && (
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Payment Type:</span>
                                            <span className="font-semibold">{bankDetails.mobilePaymentType || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Phone Number:</span>
                                            <span className="font-semibold font-mono">{bankDetails.mobilePaymentNumber || 'N/A'}</span>
                                        </div>
                                    </div>
                                )}

                                {bankDetails.paymentInstructions && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        <p className="text-xs text-gray-600">{bankDetails.paymentInstructions}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Payment Method Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Payment Method <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { value: CommissionPaymentMethod.BankTransfer, label: '🏦 Bank Transfer', icon: '🏦' },
                                    { value: CommissionPaymentMethod.Cash, label: '💵 Cash', icon: '💵' },
                                    { value: CommissionPaymentMethod.MobilePayment, label: '📱 E-Wallet', icon: '📱' },
                                    { value: CommissionPaymentMethod.Other, label: '💳 Other', icon: '💳' }
                                ].map(method => (
                                    <button
                                        key={method.value}
                                        onClick={() => setPaymentMethod(method.value)}
                                        className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                                            paymentMethod === method.value
                                                ? 'bg-orange-500 text-white shadow-lg scale-105'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {method.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Payment Proof Screenshot Upload */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Payment Proof Screenshot <span className="text-red-500">*</span>
                            </label>
                            <p className="text-xs text-gray-500 mb-3">
                                Upload a clear screenshot showing the payment transaction, date, amount, and recipient details
                            </p>
                            <ImageUpload
                                id="payment-proof"
                                label="Payment Proof"
                                currentImage={paymentProofImage || null}
                                onImageChange={setPaymentProofImage}
                            />
                        </div>

                        {/* Instructions */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 pb-20 mb-6">
                            <h4 className="font-bold text-blue-800 mb-2">📸 Screenshot Guidelines</h4>
                            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                                <li>Ensure payment amount matches: <strong>Rp {selectedPayment.commissionAmount.toLocaleString()}</strong></li>
                                <li>Screenshot must show date, time, and transaction reference</li>
                                <li>Recipient name/account must be clearly visible</li>
                                <li>Image should be clear and not blurry</li>
                            </ul>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleUploadProof}
                            disabled={isSubmitting || !paymentProofImage}
                            className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all ${
                                isSubmitting || !paymentProofImage
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
                                    Uploading...
                                </span>
                            ) : (
                                'Upload Payment Proof'
                            )}
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ProviderCommissionPaymentPage;

