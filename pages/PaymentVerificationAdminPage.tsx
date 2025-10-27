import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, Clock, Search, Filter } from 'lucide-react';
import { databases, Query } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';

const DATABASE_ID = APPWRITE_CONFIG.databaseId;

interface PaymentVerification {
    $id: string;
    userId: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    amount: number;
    paymentMethod: string;
    bankAccount: string;
    transferDate: string;
    referenceNumber: string;
    paymentCode: string;
    proofImageUrl: string;
    proofImageId: string;
    notes: string;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: string;
    verifiedAt?: string;
    verifiedBy?: string;
    rejectionReason?: string;
    $createdAt: string;
}

const PaymentVerificationAdminPage: React.FC = () => {
    const [payments, setPayments] = useState<PaymentVerification[]>([]);
    const [filteredPayments, setFilteredPayments] = useState<PaymentVerification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState<PaymentVerification | null>(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchPayments();
    }, []);

    useEffect(() => {
        filterPayments();
    }, [payments, filterStatus, searchQuery]);

    const fetchPayments = async () => {
        setIsLoading(true);
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                'paymentVerifications',
                [
                    Query.orderDesc('$createdAt'),
                    Query.limit(100)
                ]
            );
            setPayments(response.documents as any);
        } catch (error) {
            console.error('Error fetching payments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterPayments = () => {
        let filtered = payments;

        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(p => p.status === filterStatus);
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(p =>
                p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.paymentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.phoneNumber.includes(searchQuery)
            );
        }

        setFilteredPayments(filtered);
    };

    const handleApprove = async (payment: PaymentVerification) => {
        if (!window.confirm(`Approve payment from ${payment.fullName}?`)) return;

        setIsProcessing(true);
        try {
            // Update payment status
            await databases.updateDocument(
                DATABASE_ID,
                'paymentVerifications',
                payment.$id,
                {
                    status: 'approved',
                    verifiedAt: new Date().toISOString(),
                    verifiedBy: 'admin', // Replace with actual admin ID
                }
            );

            // TODO: Update user's premium status in users collection
            // await databases.updateDocument(DATABASE_ID, 'users', payment.userId, {
            //     isPremium: true,
            //     premiumUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            // });

            alert('Payment approved successfully!');
            fetchPayments();
            setSelectedPayment(null);
        } catch (error) {
            console.error('Error approving payment:', error);
            alert('Failed to approve payment');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async (payment: PaymentVerification) => {
        if (!rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        if (!window.confirm(`Reject payment from ${payment.fullName}?`)) return;

        setIsProcessing(true);
        try {
            await databases.updateDocument(
                DATABASE_ID,
                'paymentVerifications',
                payment.$id,
                {
                    status: 'rejected',
                    verifiedAt: new Date().toISOString(),
                    verifiedBy: 'admin',
                    rejectionReason: rejectionReason,
                }
            );

            alert('Payment rejected');
            fetchPayments();
            setSelectedPayment(null);
            setRejectionReason('');
        } catch (error) {
            console.error('Error rejecting payment:', error);
            alert('Failed to reject payment');
        } finally {
            setIsProcessing(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Pending
                </span>;
            case 'approved':
                return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Approved
                </span>;
            case 'rejected':
                return <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Rejected
                </span>;
            default:
                return null;
        }
    };

    const stats = {
        pending: payments.filter(p => p.status === 'pending').length,
        approved: payments.filter(p => p.status === 'approved').length,
        rejected: payments.filter(p => p.status === 'rejected').length,
        total: payments.length,
        totalAmount: payments.filter(p => p.status === 'approved').reduce((sum, p) => sum + p.amount, 0),
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Payment Verification Dashboard</h1>
                    <p className="text-gray-600 mt-2">Manage and verify user payment submissions</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <p className="text-sm text-gray-600 mb-1">Total Payments</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="bg-yellow-50 rounded-xl shadow-md p-6 border-2 border-yellow-200">
                        <p className="text-sm text-yellow-700 mb-1">Pending</p>
                        <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                    </div>
                    <div className="bg-green-50 rounded-xl shadow-md p-6 border-2 border-green-200">
                        <p className="text-sm text-green-700 mb-1">Approved</p>
                        <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                    </div>
                    <div className="bg-red-50 rounded-xl shadow-md p-6 border-2 border-red-200">
                        <p className="text-sm text-red-700 mb-1">Rejected</p>
                        <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl shadow-md p-6 border-2 border-blue-200">
                        <p className="text-sm text-blue-700 mb-1">Total Revenue</p>
                        <p className="text-xl font-bold text-blue-600">{formatCurrency(stats.totalAmount)}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search by name, email, phone, or payment code..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilterStatus('all')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                    filterStatus === 'all'
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilterStatus('pending')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                    filterStatus === 'pending'
                                        ? 'bg-yellow-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Pending
                            </button>
                            <button
                                onClick={() => setFilterStatus('approved')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                    filterStatus === 'approved'
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Approved
                            </button>
                            <button
                                onClick={() => setFilterStatus('rejected')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                    filterStatus === 'rejected'
                                        ? 'bg-red-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Rejected
                            </button>
                        </div>
                    </div>
                </div>

                {/* Payments Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {isLoading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500 mx-auto"></div>
                            <p className="text-gray-600 mt-4">Loading payments...</p>
                        </div>
                    ) : filteredPayments.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-gray-500">No payments found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b-2 border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Payment Code</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Method</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredPayments.map((payment) => (
                                        <tr key={payment.$id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {formatDate(payment.submittedAt)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{payment.fullName}</p>
                                                    <p className="text-sm text-gray-600">{payment.email}</p>
                                                    <p className="text-sm text-gray-600">{payment.phoneNumber}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-sm font-semibold text-gray-900">
                                                    {payment.paymentCode}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-gray-900">
                                                {formatCurrency(payment.amount)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 uppercase">
                                                {payment.paymentMethod}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(payment.status)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => setSelectedPayment(payment)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-semibold"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Detail Modal */}
                {selectedPayment && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b-2 border-gray-200 p-6 flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
                                <button
                                    onClick={() => {
                                        setSelectedPayment(null);
                                        setRejectionReason('');
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <XCircle className="w-6 h-6 text-gray-600" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Status */}
                                <div className="flex items-center justify-between">
                                    <div className="text-3xl">
                                        {getStatusBadge(selectedPayment.status)}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">Submitted</p>
                                        <p className="font-semibold text-gray-900">{formatDate(selectedPayment.submittedAt)}</p>
                                    </div>
                                </div>

                                {/* User Info */}
                                <div className="bg-gray-50 rounded-xl p-6 grid md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Full Name</p>
                                        <p className="font-semibold text-gray-900">{selectedPayment.fullName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Email</p>
                                        <p className="font-semibold text-gray-900">{selectedPayment.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">WhatsApp</p>
                                        <p className="font-semibold text-gray-900">{selectedPayment.phoneNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Payment Code</p>
                                        <p className="font-mono font-semibold text-gray-900">{selectedPayment.paymentCode}</p>
                                    </div>
                                </div>

                                {/* Payment Info */}
                                <div className="bg-orange-50 rounded-xl p-6 grid md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-orange-700 mb-1">Amount</p>
                                        <p className="text-2xl font-bold text-orange-600">{formatCurrency(selectedPayment.amount)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-orange-700 mb-1">Payment Method</p>
                                        <p className="font-semibold text-orange-900 uppercase">{selectedPayment.paymentMethod}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-orange-700 mb-1">Bank Account</p>
                                        <p className="font-mono font-semibold text-orange-900">{selectedPayment.bankAccount}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-orange-700 mb-1">Reference Number</p>
                                        <p className="font-semibold text-orange-900">{selectedPayment.referenceNumber || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Notes */}
                                {selectedPayment.notes && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Additional Notes</p>
                                        <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{selectedPayment.notes}</p>
                                    </div>
                                )}

                                {/* Proof Image */}
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Payment Proof</p>
                                    <img
                                        src={selectedPayment.proofImageUrl}
                                        alt="Payment Proof"
                                        className="w-full rounded-lg border-2 border-gray-300 cursor-pointer hover:border-orange-500 transition-colors"
                                        onClick={() => setShowImageModal(true)}
                                    />
                                    <p className="text-xs text-gray-500 mt-2 text-center">Click to view full size</p>
                                </div>

                                {/* Rejection Reason */}
                                {selectedPayment.status === 'rejected' && selectedPayment.rejectionReason && (
                                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                                        <p className="text-sm font-semibold text-red-700 mb-1">Rejection Reason</p>
                                        <p className="text-red-900">{selectedPayment.rejectionReason}</p>
                                    </div>
                                )}

                                {/* Actions for Pending Payments */}
                                {selectedPayment.status === 'pending' && (
                                    <div className="space-y-4 pt-4 border-t-2 border-gray-200">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                                Rejection Reason (if rejecting)
                                            </label>
                                            <textarea
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                rows={3}
                                                placeholder="Provide reason for rejection..."
                                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            />
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => handleApprove(selectedPayment)}
                                                disabled={isProcessing}
                                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors font-semibold"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                                {isProcessing ? 'Processing...' : 'Approve Payment'}
                                            </button>
                                            <button
                                                onClick={() => handleReject(selectedPayment)}
                                                disabled={isProcessing}
                                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 transition-colors font-semibold"
                                            >
                                                <XCircle className="w-5 h-5" />
                                                {isProcessing ? 'Processing...' : 'Reject Payment'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Full Size Image Modal */}
                {showImageModal && selectedPayment && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50"
                        onClick={() => setShowImageModal(false)}
                    >
                        <img
                            src={selectedPayment.proofImageUrl}
                            alt="Payment Proof Full Size"
                            className="max-w-full max-h-full object-contain"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentVerificationAdminPage;
