import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Calendar, CreditCard, DollarSign, FileText, RefreshCw } from 'lucide-react';
import { paymentConfirmationService } from '../../../../lib/appwriteService';
import type { Therapist } from '../../../../types';

interface TherapistPaymentStatusProps {
    therapist: Therapist;
    onBack: () => void;
}

interface PaymentConfirmation {
    $id: string;
    transactionId: string;
    packageType?: string; // Collection uses packageType, not packageName
    packageDuration?: string;
    amount: number;
    status: 'pending' | 'approved' | 'declined';
    submittedAt: string;
    reviewedAt?: string;
    declineReason?: string;
    expiresAt: string;
    paymentProofUrl: string; // Collection uses paymentProofUrl, not proofOfPaymentUrl
}

const TherapistPaymentStatus: React.FC<TherapistPaymentStatusProps> = ({ therapist, onBack }) => {
    const [payments, setPayments] = useState<PaymentConfirmation[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProof, setSelectedProof] = useState<string | null>(null);

    useEffect(() => {
        loadPayments();
    }, [therapist]);

    const loadPayments = async () => {
        try {
            setLoading(true);
            const userId = String(therapist.$id || therapist.id);
            const data = await paymentConfirmationService.getUserPayments(userId);
            setPayments(data);
        } catch (error) {
            console.error('Failed to load payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDaysRemaining = (expiresAt: string): number => {
        const now = new Date();
        const expiry = new Date(expiresAt);
        const diff = expiry.getTime() - now.getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        <Clock className="w-4 h-4" />
                        Pending Review
                    </span>
                );
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Approved
                    </span>
                );
            case 'declined':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                        <XCircle className="w-4 h-4" />
                        Declined
                    </span>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading payment history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">💳 Payment History</h1>
                            <p className="text-gray-600">Track your membership payment submissions and status</p>
                        </div>
                        <button
                            onClick={loadPayments}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Info Banner */}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div className="text-sm text-blue-800">
                                <p className="font-semibold mb-1">Payment Review Process</p>
                                <ul className="space-y-1 list-disc list-inside">
                                    <li>Admin reviews all payments within 7 days</li>
                                    <li>Approved payments activate your membership immediately</li>
                                    <li>Declined payments can be resubmitted with correct proof</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment List */}
                {payments.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payment History</h3>
                        <p className="text-gray-600 mb-6">
                            You haven't submitted any payment proofs yet.
                        </p>
                        <button
                            onClick={() => onBack()}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Go to Membership
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {payments.map((payment) => {
                            const daysRemaining = getDaysRemaining(payment.expiresAt);
                            const isExpiringSoon = daysRemaining <= 2 && payment.status === 'pending';

                            return (
                                <div
                                    key={payment.$id}
                                    className={`bg-white rounded-xl shadow-lg p-6 ${
                                        isExpiringSoon ? 'border-2 border-orange-300' : ''
                                    }`}
                                >
                                    {/* Status and Date */}
                                    <div className="flex items-center justify-between mb-4">
                                        {getStatusBadge(payment.status)}
                                        <span className="text-sm text-gray-500">
                                            {new Date(payment.submittedAt).toLocaleDateString('en-US', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </div>

                                    {/* Payment Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div className="flex items-center gap-3">
                                            <CreditCard className="w-5 h-5 text-blue-600" />
                                            <div>
                                                <p className="text-xs text-gray-500">Package</p>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {payment.packageType || 'Membership'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <DollarSign className="w-5 h-5 text-green-600" />
                                            <div>
                                                <p className="text-xs text-gray-500">Amount</p>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    IDR {payment.amount.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        {payment.packageDuration && (
                                            <div className="flex items-center gap-3">
                                                <Calendar className="w-5 h-5 text-purple-600" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Duration</p>
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {payment.packageDuration.replace('_', ' ')}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Status-specific content */}
                                    {payment.status === 'pending' && (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Clock className="w-4 h-4 text-yellow-600" />
                                                <p className="text-sm font-semibold text-yellow-900">
                                                    {isExpiringSoon
                                                        ? '⚠️ Review Expiring Soon!'
                                                        : 'Under Review'}
                                                </p>
                                            </div>
                                            <p className="text-sm text-yellow-800">
                                                Admin will review within {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}.
                                                {isExpiringSoon && ' Please be patient, admin will respond soon.'}
                                            </p>
                                        </div>
                                    )}

                                    {payment.status === 'approved' && payment.reviewedAt && (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                                <p className="text-sm font-semibold text-green-900">
                                                    Payment Confirmed ✅
                                                </p>
                                            </div>
                                            <p className="text-sm text-green-800">
                                                Approved on {new Date(payment.reviewedAt).toLocaleDateString()}
                                                {' • '}Your membership is now active!
                                            </p>
                                        </div>
                                    )}

                                    {payment.status === 'declined' && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <XCircle className="w-4 h-4 text-red-600" />
                                                <p className="text-sm font-semibold text-red-900">
                                                    Payment Not Received
                                                </p>
                                            </div>
                                            <p className="text-sm text-red-800 mb-2">
                                                {payment.declineReason || 'Please check your payment proof and resubmit.'}
                                            </p>
                                            <button
                                                onClick={() => onBack()}
                                                className="text-sm text-red-600 hover:text-red-700 font-medium underline"
                                            >
                                                Submit New Payment Proof
                                            </button>
                                        </div>
                                    )}

                                    {/* View Proof Button */}
                                    <button
                                        onClick={() => setSelectedProof(payment.paymentProofUrl)}
                                        className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                                    >
                                        📄 View Payment Proof
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Image Modal */}
                {selectedProof && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                        onClick={() => setSelectedProof(null)}
                    >
                        <div className="relative max-w-4xl w-full">
                            <button
                                onClick={() => setSelectedProof(null)}
                                className="absolute -top-12 right-0 text-white hover:text-gray-300 text-xl font-bold"
                            >
                                ✕ Close
                            </button>
                            <img
                                src={selectedProof}
                                alt="Payment Proof"
                                className="w-full h-auto rounded-lg shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TherapistPaymentStatus;
