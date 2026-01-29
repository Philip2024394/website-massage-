// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Calendar, CreditCard, DollarSign, FileText, RefreshCw } from 'lucide-react';
import TherapistPageHeader from '../../components/therapist/TherapistPageHeader';
import { paymentConfirmationService } from '../../lib/appwriteService';
import type { Therapist } from '../../types';
import HelpTooltip from '../../components/therapist/HelpTooltip';
import { paymentStatusHelp } from './constants/helpContent';

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
        const daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
        // If expiry date is not set or already expired, default to 2 days
        return daysRemaining > 0 ? daysRemaining : 2;
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs sm:text-sm font-bold">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        Pending Review
                    </span>
                );
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-black rounded-lg text-xs sm:text-sm font-bold">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        Approved
                    </span>
                );
            case 'declined':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-200 text-black rounded-lg text-xs sm:text-sm font-bold">
                        <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        Declined
                    </span>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center overflow-y-auto overflow-x-hidden" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y pan-x' }}>
                <div className="text-center">
                    <RefreshCw className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading payment history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white overflow-y-auto overflow-x-hidden" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y pan-x' }}>
            {/* Standardized Page Header */}
            <TherapistPageHeader
                title="Payment Status"
                subtitle="Track your payment submissions and approvals"
                onBackToStatus={onBack}
                icon={<CreditCard className="w-6 h-6 text-orange-600" />}
                actions={
                    <div className="flex items-center gap-2">
                        <HelpTooltip 
                            {...paymentStatusHelp.submitProof}
                            position="left"
                            size="md"
                        />
                        <button
                            onClick={loadPayments}
                            className="p-2 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Refresh payment list"
                        >
                            <RefreshCw className="w-5 h-5 text-orange-600" />
                        </button>
                    </div>
                }
            />

            <div className="p-3 sm:p-5 space-y-4 max-w-7xl mx-auto">
                {/* Info Banner */}
                <div className="bg-white border border-gray-300 rounded-lg p-3 sm:p-4">
                    <div className="flex gap-2 sm:gap-3">
                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <div className="text-xs sm:text-sm text-gray-700">
                            <p className="font-bold text-black mb-1">Payment Review Process</p>
                            <ul className="space-y-1">
                                <li>• Admin reviews all payments within 7 days</li>
                                <li>• Approved payments activate your membership immediately</li>
                                <li>• Declined payments can be resubmitted with correct proof</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Payment List */}
                {payments.length === 0 ? (
                    <div className="bg-white border border-gray-300 rounded-lg p-8 sm:p-12 text-center">
                        <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-base sm:text-lg font-bold text-black mb-2">No Payment History</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            You haven't submitted any payment proofs yet.
                        </p>
                        <button
                            onClick={() => onBack()}
                            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold text-sm"
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
                                    className={`bg-white border rounded-lg p-4 sm:p-6 ${
                                        isExpiringSoon ? 'border-orange-500 border-2' : 'border-gray-300'
                                    }`}
                                >
                                    {/* Status and Date */}
                                    <div className="flex items-center justify-between mb-4">
                                        {getStatusBadge(payment.status)}
                                        <span className="text-xs sm:text-sm text-gray-600">
                                            {new Date(payment.submittedAt).toLocaleDateString('en-US', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </div>

                                    {/* Payment Details */}
                                    <div className="grid grid-cols-1 gap-3 mb-4">
                                        <div className="flex items-center gap-3">
                                            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                                            <div>
                                                <p className="text-xs text-gray-600">Package</p>
                                                <p className="text-sm font-bold text-black">
                                                    {payment.packageType || 'Membership'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                                            <div>
                                                <p className="text-xs text-gray-600">Amount</p>
                                                <p className="text-sm font-bold text-black">
                                                    IDR {payment.amount.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        {payment.packageDuration && (
                                            <div className="flex items-center gap-3">
                                                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                                                <div>
                                                    <p className="text-xs text-gray-600">Duration</p>
                                                    <p className="text-sm font-bold text-black">
                                                        {payment.packageDuration.replace('_', ' ')}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Status-specific content */}
                                    {payment.status === 'pending' && (
                                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Clock className="w-4 h-4 text-orange-600" />
                                                <p className="text-xs sm:text-sm font-bold text-black">
                                                    {isExpiringSoon
                                                        ? '⚠️ Review Expiring Soon!'
                                                        : 'Under Review'}
                                                </p>
                                            </div>
                                            <p className="text-xs sm:text-sm text-gray-700">
                                                Admin will review within {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}.
                                                {isExpiringSoon && ' Please be patient, admin will respond soon.'}
                                            </p>
                                        </div>
                                    )}

                                    {payment.status === 'approved' && payment.reviewedAt && (
                                        <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 mb-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <CheckCircle className="w-4 h-4 text-black" />
                                                <p className="text-xs sm:text-sm font-bold text-black">
                                                    Payment Confirmed ✅
                                                </p>
                                            </div>
                                            <p className="text-xs sm:text-sm text-gray-700">
                                                Approved on {new Date(payment.reviewedAt).toLocaleDateString()}
                                                {' • '}Your membership is now active!
                                            </p>
                                        </div>
                                    )}

                                    {payment.status === 'declined' && (
                                        <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 mb-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <XCircle className="w-4 h-4 text-black" />
                                                <p className="text-xs sm:text-sm font-bold text-black">
                                                    Payment Not Received
                                                </p>
                                            </div>
                                            <p className="text-xs sm:text-sm text-gray-700 mb-2">
                                                {payment.declineReason || 'Please check your payment proof and resubmit.'}
                                            </p>
                                            <button
                                                onClick={() => onBack()}
                                                className="text-xs sm:text-sm text-orange-500 hover:text-orange-600 font-bold underline"
                                            >
                                                Submit New Payment Proof
                                            </button>
                                        </div>
                                    )}

                                    {/* View Proof Button */}
                                    <button
                                        onClick={() => setSelectedProof(payment.paymentProofUrl)}
                                        className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm font-semibold"
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
                        <div className="relative max-w-sm w-full">
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
