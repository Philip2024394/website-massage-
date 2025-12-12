// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, Calendar, User, DollarSign, FileText, RefreshCw, AlertCircle } from 'lucide-react';
import { paymentConfirmationService } from '../lib/appwriteService';

interface PaymentConfirmation {
    $id: string;
    transactionId: string;
    userId: string;
    userEmail: string;
    userName: string;
    memberType: string;
    paymentType: string;
    packageType?: string; // Collection uses packageType, not packageName
    packageDuration?: string;
    amount: number;
    bankName: string;
    accountNumber: string;
    accountName: string;
    paymentProofUrl: string; // Collection uses paymentProofUrl, not proofOfPaymentUrl
    status: 'pending' | 'approved' | 'declined';
    submittedAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
    declineReason?: string;
    expiresAt: string;
}

const AdminPaymentReview: React.FC = () => {
    const [payments, setPayments] = useState<PaymentConfirmation[]>([]);
    const [filteredPayments, setFilteredPayments] = useState<PaymentConfirmation[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState<PaymentConfirmation | null>(null);
    const [selectedProof, setSelectedProof] = useState<string | null>(null);
    const [showDeclineModal, setShowDeclineModal] = useState(false);
    const [declineReason, setDeclineReason] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        loadPayments();
    }, []);

    useEffect(() => {
        filterPayments();
    }, [payments, statusFilter, searchQuery]);

    const loadPayments = async () => {
        try {
            setLoading(true);
            const data = await paymentConfirmationService.getAllPayments();
            setPayments(data);
        } catch (error) {
            console.error('Failed to load payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterPayments = () => {
        let filtered = [...payments];

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(p => p.status === statusFilter);
        }

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.userName.toLowerCase().includes(query) ||
                p.userEmail.toLowerCase().includes(query) ||
                p.transactionId.toLowerCase().includes(query)
            );
        }

        setFilteredPayments(filtered);
    };

    const handleApprove = async (payment: PaymentConfirmation) => {
        if (!confirm(`Approve payment from ${payment.userName}?\n\nAmount: IDR ${payment.amount.toLocaleString()}\n\nThis will activate their membership.`)) {
            return;
        }

        setProcessing(true);
        try {
            await paymentConfirmationService.approvePayment(payment.$id, 'admin');
            alert('✅ Payment approved! Membership activated.');
            loadPayments();
            setSelectedPayment(null);
        } catch (error) {
            console.error('Failed to approve payment:', error);
            alert('❌ Failed to approve payment. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const handleDeclineClick = (payment: PaymentConfirmation) => {
        setSelectedPayment(payment);
        setShowDeclineModal(true);
        setDeclineReason('');
    };

    const handleDeclineSubmit = async () => {
        if (!selectedPayment) return;
        if (!declineReason.trim()) {
            alert('Please provide a reason for declining.');
            return;
        }

        setProcessing(true);
        try {
            await paymentConfirmationService.declinePayment(
                selectedPayment.$id,
                'admin',
                declineReason.trim()
            );
            alert('❌ Payment declined. User has been notified.');
            setShowDeclineModal(false);
            setSelectedPayment(null);
            setDeclineReason('');
            loadPayments();
        } catch (error) {
            console.error('Failed to decline payment:', error);
            alert('❌ Failed to decline payment. Please try again.');
        } finally {
            setProcessing(false);
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
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        <Clock className="w-3 h-3" />
                        Pending
                    </span>
                );
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Approved
                    </span>
                );
            case 'declined':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                        <XCircle className="w-3 h-3" />
                        Declined
                    </span>
                );
            default:
                return null;
        }
    };

    const pendingCount = payments.filter(p => p.status === 'pending').length;
    const approvedCount = payments.filter(p => p.status === 'approved').length;
    const declinedCount = payments.filter(p => p.status === 'declined').length;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading payments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">💳 Payment Review</h1>
                            <p className="text-gray-600">Review and approve member payment confirmations</p>
                        </div>
                        <button
                            onClick={loadPayments}
                            className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-yellow-700 font-medium">Pending Review</p>
                                    <p className="text-2xl font-bold text-yellow-900">{pendingCount}</p>
                                </div>
                                <Clock className="w-10 h-10 text-yellow-500" />
                            </div>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-700 font-medium">Approved</p>
                                    <p className="text-2xl font-bold text-green-900">{approvedCount}</p>
                                </div>
                                <CheckCircle className="w-10 h-10 text-green-500" />
                            </div>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-red-700 font-medium">Declined</p>
                                    <p className="text-2xl font-bold text-red-900">{declinedCount}</p>
                                </div>
                                <XCircle className="w-10 h-10 text-red-500" />
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or transaction ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-gray-500" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="declined">Declined</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Payment List */}
                {filteredPayments.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payments Found</h3>
                        <p className="text-gray-600">
                            {searchQuery || statusFilter !== 'all'
                                ? 'No payments match your filters.'
                                : 'No payment submissions yet.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredPayments.map((payment) => {
                            const daysRemaining = getDaysRemaining(payment.expiresAt);
                            const isExpiringSoon = daysRemaining <= 2 && payment.status === 'pending';

                            return (
                                <div
                                    key={payment.$id}
                                    className={`bg-white rounded-xl shadow-sm p-6 ${
                                        isExpiringSoon ? 'border-2 border-orange-300' : ''
                                    }`}
                                >
                                    <div className="flex flex-col lg:flex-row gap-6">
                                        {/* Left: Member Info */}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <User className="w-6 h-6 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">{payment.userName}</h3>
                                                        <p className="text-sm text-gray-600">{payment.userEmail}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {payment.memberType} • {payment.paymentType}
                                                        </p>
                                                    </div>
                                                </div>
                                                {getStatusBadge(payment.status)}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <p className="text-xs text-gray-500">Package</p>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {payment.packageType || 'N/A'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Amount</p>
                                                    <p className="text-sm font-bold text-gray-900">
                                                        IDR {payment.amount.toLocaleString()}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Submitted</p>
                                                    <p className="text-sm text-gray-700">
                                                        {new Date(payment.submittedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                {payment.status === 'pending' && (
                                                    <div>
                                                        <p className="text-xs text-gray-500">Days Remaining</p>
                                                        <p className={`text-sm font-medium ${
                                                            isExpiringSoon ? 'text-orange-600' : 'text-gray-700'
                                                        }`}>
                                                            {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {payment.status === 'declined' && payment.declineReason && (
                                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                                    <p className="text-xs font-semibold text-red-800 mb-1">Decline Reason:</p>
                                                    <p className="text-sm text-red-700">{payment.declineReason}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Right: Actions */}
                                        <div className="lg:w-72 flex flex-col gap-3">
                                            <button
                                                onClick={() => setSelectedProof(payment.paymentProofUrl)}
                                                className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View Payment Proof
                                            </button>

                                            {payment.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(payment)}
                                                        disabled={processing}
                                                        className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        Approve Payment
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeclineClick(payment)}
                                                        disabled={processing}
                                                        className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                        Decline Payment
                                                    </button>
                                                </>
                                            )}

                                            {isExpiringSoon && payment.status === 'pending' && (
                                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                                    <div className="flex items-start gap-2">
                                                        <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                                                        <p className="text-xs text-orange-800">
                                                            ⚠️ Review expiring soon! Please respond within {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Image Modal */}
            {selectedProof && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedProof(null)}
                >
                    <div className="relative max-w-5xl w-full">
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

            {/* Decline Modal */}
            {showDeclineModal && selectedPayment && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => !processing && setShowDeclineModal(false)}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Decline Payment</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            You are about to decline payment from <strong>{selectedPayment.userName}</strong>.
                            Please provide a reason that will be sent to the user.
                        </p>

                        <textarea
                            value={declineReason}
                            onChange={(e) => setDeclineReason(e.target.value)}
                            placeholder="Reason for declining (e.g., unclear payment proof, wrong amount, etc.)"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                            rows={4}
                            disabled={processing}
                        />

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowDeclineModal(false)}
                                disabled={processing}
                                className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeclineSubmit}
                                disabled={processing || !declineReason.trim()}
                                className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                                {processing ? 'Declining...' : 'Confirm Decline'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPaymentReview;
