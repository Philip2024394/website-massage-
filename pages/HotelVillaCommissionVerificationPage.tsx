import React, { useState, useEffect, useCallback } from 'react';
import type { CommissionRecord } from '../types';
import { CommissionPaymentStatus } from '../types';
import { commissionPaymentService } from '../services/commissionPaymentService';

interface HotelVillaCommissionVerificationPageProps {
    hotelVillaId: number;
    hotelVillaUserId: number;
    onBack: () => void;
}

const HotelVillaCommissionVerificationPage: React.FC<HotelVillaCommissionVerificationPageProps> = ({
    hotelVillaId,
    hotelVillaUserId,
    onBack
}) => {
    const [pendingVerifications, setPendingVerifications] = useState<CommissionRecord[]>([]);
    const [selectedPayment, setSelectedPayment] = useState<CommissionRecord | null>(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
    const [commissionHistory, setCommissionHistory] = useState<CommissionRecord[]>([]);

    const loadPendingVerifications = useCallback(async () => {
        try {
            const payments = await commissionPaymentService.getHotelVillaPaymentVerificationQueue(
                hotelVillaId
            );
            setPendingVerifications(payments);
        } catch (err) {
            console.error('Failed to load pending verifications:', err);
            setError('Failed to load pending verifications');
        }
    }, [hotelVillaId]);

    const loadCommissionHistory = useCallback(async () => {
        try {
            const history = await commissionPaymentService.getHotelVillaCommissionHistory(
                hotelVillaId
            );
            setCommissionHistory(history);
        } catch (err) {
            console.error('Failed to load commission history:', err);
        }
    }, [hotelVillaId]);

    useEffect(() => {
        loadPendingVerifications();
        loadCommissionHistory();
    }, [loadPendingVerifications, loadCommissionHistory]);

    const handleVerifyPayment = async (verified: boolean) => {
        if (!selectedPayment) return;

        if (!verified && !rejectionReason.trim()) {
            setError('Please provide a reason for rejection');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await commissionPaymentService.verifyPayment(
                selectedPayment.id,
                hotelVillaUserId,
                verified,
                verified ? undefined : rejectionReason
            );

            setSuccess(
                verified
                    ? `Payment verified! ${selectedPayment.providerName} is now available for bookings.`
                    : `Payment rejected. ${selectedPayment.providerName} will be notified to reupload.`
            );
            setSelectedPayment(null);
            setRejectionReason('');
            setShowImageModal(false);
            
            // Reload lists
            await loadPendingVerifications();
            await loadCommissionHistory();
        } catch (err) {
            console.error('Failed to verify payment:', err);
            setError('Failed to process verification. Please try again.');
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
            [CommissionPaymentStatus.Pending]: 'Awaiting Payment',
            [CommissionPaymentStatus.AwaitingVerification]: 'Verify Now',
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

    const getPaymentMethodLabel = (method?: string) => {
        const labels: Record<string, string> = {
            bank_transfer: '🏦 Bank Transfer',
            cash: '💵 Cash',
            mobile_payment: '📱 E-Wallet',
            other: '💳 Other'
        };
        return method ? labels[method] || method : 'N/A';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-gray-900 to-orange-600 text-white py-6 px-4 shadow-xl">
                <div className="max-w-6xl mx-auto">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Back to Dashboard</span>
                    </button>
                    <h1 className="text-2xl md:text-3xl font-bold">Commission Verification</h1>
                    <p className="text-orange-100 mt-2">Verify provider payment proofs</p>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
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

                {/* Tabs */}
                <div className="bg-white rounded-t-2xl shadow-xl">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`flex-1 py-4 px-6 font-bold text-center transition-all ${
                                activeTab === 'pending'
                                    ? 'bg-orange-500 text-white rounded-tl-2xl'
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <span className="flex items-center justify-center gap-2">
                                🔔 Pending Verification
                                {pendingVerifications.length > 0 && (
                                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                        {pendingVerifications.length}
                                    </span>
                                )}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`flex-1 py-4 px-6 font-bold text-center transition-all ${
                                activeTab === 'history'
                                    ? 'bg-orange-500 text-white rounded-tr-2xl'
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            📊 Commission History
                        </button>
                    </div>
                </div>

                {/* Pending Verifications Tab */}
                {activeTab === 'pending' && (
                    <div className="bg-white rounded-b-2xl shadow-xl p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Payments Awaiting Verification</h2>
                        
                        {pendingVerifications.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="text-gray-700 font-bold text-lg">All Caught Up!</h3>
                                <p className="text-gray-500 mt-2">No pending payment verifications</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 pb-20">
                                {pendingVerifications.map(payment => (
                                    <div
                                        key={payment.id}
                                        className="border-2 border-orange-200 rounded-xl p-5 bg-gradient-to-r from-orange-50 to-white"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-bold text-gray-800 text-lg">{payment.providerName}</h3>
                                                    {getStatusBadge(payment.status)}
                                                </div>
                                                <p className="text-sm text-gray-500">Booking #{payment.bookingId}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-20 mb-4">
                                            <div>
                                                <span className="text-xs text-gray-500">Service Amount</span>
                                                <p className="font-semibold text-gray-800">Rp {payment.serviceAmount.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-gray-500">Commission ({payment.commissionRate}%)</span>
                                                <p className="font-bold text-orange-600 text-lg">Rp {payment.commissionAmount.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-gray-500">Payment Method</span>
                                                <p className="font-semibold text-gray-800">{getPaymentMethodLabel(payment.paymentMethod)}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-gray-500">Uploaded</span>
                                                <p className="font-semibold text-gray-800">
                                                    {payment.paymentProofUploadedAt
                                                        ? new Date(payment.paymentProofUploadedAt).toLocaleString()
                                                        : 'N/A'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Payment Proof Image */}
                                        {payment.paymentProofImage && (
                                            <div className="mb-4">
                                                <p className="text-sm font-semibold text-gray-700 mb-2">Payment Proof:</p>
                                                <img
                                                    src={payment.paymentProofImage}
                                                    alt="Payment Proof"
                                                    className="w-full max-w-md rounded-lg border-2 border-gray-200 cursor-pointer hover:border-orange-500 transition-all"
                                                    onClick={() => {
                                                        setSelectedPayment(payment);
                                                        setShowImageModal(true);
                                                    }}
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Click to view full size</p>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => {
                                                    setSelectedPayment(payment);
                                                    handleVerifyPayment(true);
                                                }}
                                                disabled={isSubmitting}
                                                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                                            >
                                                ✅ Verify & Accept
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedPayment(payment);
                                                    // Show rejection modal
                                                }}
                                                disabled={isSubmitting}
                                                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                                            >
                                                ❌ Reject
                                            </button>
                                        </div>

                                        {/* Rejection Reason Input (shown when reject is clicked) */}
                                        {selectedPayment?.id === payment.id && !isSubmitting && (
                                            <div className="mt-4 p-4 pb-20 bg-red-50 border border-red-200 rounded-lg">
                                                <label className="block text-sm font-semibold text-red-800 mb-2">
                                                    Rejection Reason:
                                                </label>
                                                <textarea
                                                    value={rejectionReason}
                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                    placeholder="e.g., Payment amount doesn't match, screenshot is unclear, wrong recipient"
                                                    className="w-full px-4 py-3 border-2 border-red-300 rounded-lg focus:border-red-500 focus:ring focus:ring-red-200 resize-none"
                                                    rows={3}
                                                />
                                                <div className="flex gap-3 mt-3">
                                                    <button
                                                        onClick={() => handleVerifyPayment(false)}
                                                        className="flex-1 bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700"
                                                    >
                                                        Confirm Rejection
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedPayment(null);
                                                            setRejectionReason('');
                                                        }}
                                                        className="flex-1 bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-400"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Commission History Tab */}
                {activeTab === 'history' && (
                    <div className="bg-white rounded-b-2xl shadow-xl p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Commission History</h2>
                        
                        {commissionHistory.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="text-gray-700 font-bold text-lg">No History</h3>
                                <p className="text-gray-500 mt-2">No commission payments recorded yet</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking #</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {commissionHistory.map(payment => (
                                            <tr key={payment.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(payment.bookingDate).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {payment.providerName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    #{payment.bookingId}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    Rp {payment.serviceAmount.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-orange-600">
                                                    Rp {payment.commissionAmount.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {getStatusBadge(payment.status)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Image Modal */}
            {showImageModal && selectedPayment?.paymentProofImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowImageModal(false)}
                >
                    <div className="max-w-4xl max-h-full overflow-auto" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={selectedPayment.paymentProofImage}
                            alt="Payment Proof Full Size"
                            className="w-full h-auto rounded-lg shadow-2xl"
                        />
                        <button
                            onClick={() => setShowImageModal(false)}
                            className="mt-4 w-full bg-white text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-100"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HotelVillaCommissionVerificationPage;

