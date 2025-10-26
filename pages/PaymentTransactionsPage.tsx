import React, { useState, useEffect } from 'react';
import { databases } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import { Query } from 'appwrite';

const DATABASE_ID = APPWRITE_CONFIG.databaseId;
const COLLECTIONS = APPWRITE_CONFIG.collections;

interface PaymentTransaction {
    $id: string;
    transactionId: string;
    userId: string;
    amount: number;
    currency: string;
    transactionDate: string;
    paymentMethod: string;
    status: string;
    userEmail?: string;
    userName?: string;
    userType?: string;
    packageType?: string;
    packageDuration?: string;
    paymentProofUrl?: string;
    submittedAt?: string;
    reviewedAt?: string;
    reviewedBy?: string;
    notes?: string;
    expiresAt?: string;
    $createdAt: string;
    $updatedAt: string;
}

const PaymentTransactionsPage: React.FC = () => {
    const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);
    const [reviewNotes, setReviewNotes] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchTransactions();
    }, [filter]);

    const fetchTransactions = async () => {
        setIsLoading(true);
        try {
            const queries = filter === 'all' 
                ? [Query.orderDesc('$createdAt'), Query.limit(100)]
                : [Query.equal('status', filter), Query.orderDesc('$createdAt'), Query.limit(100)];

            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.paymentTransactions,
                queries
            );
            setTransactions(response.documents as unknown as PaymentTransaction[]);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            alert('Failed to load payment transactions. The collection may not exist yet.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (transaction: PaymentTransaction) => {
        if (!confirm(`Approve payment for ${transaction.userName || 'this user'}? This will activate their ${transaction.packageDuration || 'membership'}.`)) {
            return;
        }

        setIsProcessing(true);
        try {
            // Update transaction status
            await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.paymentTransactions,
                transaction.$id,
                {
                    status: 'approved',
                    reviewedAt: new Date().toISOString(),
                    reviewedBy: 'Admin',
                    notes: reviewNotes || 'Payment approved and membership activated'
                }
            );

            // Update therapist or place membership
            if (transaction.userType && transaction.expiresAt && (transaction.userType === 'therapist' || transaction.userType === 'place')) {
                const collectionId = transaction.userType === 'therapist' 
                    ? COLLECTIONS.therapists 
                    : COLLECTIONS.places;

                const newExpiryDate = new Date(transaction.expiresAt);
                
                await databases.updateDocument(
                    DATABASE_ID,
                    collectionId,
                    transaction.userId,
                    {
                        status: 'active',
                        membershipPackage: transaction.packageType || '',
                        activeMembershipDate: newExpiryDate.toISOString().split('T')[0]
                    }
                );

                alert(`✅ Payment approved! ${transaction.userName || 'User'}'s membership is now active until ${newExpiryDate.toLocaleDateString()}`);
            } else {
                alert(`✅ Payment approved!`);
            }
            setSelectedTransaction(null);
            setReviewNotes('');
            fetchTransactions();
        } catch (error) {
            console.error('Error approving payment:', error);
            alert('Failed to approve payment. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async (transaction: PaymentTransaction) => {
        const reason = prompt('Reason for rejection (will be shown to user):');
        if (!reason) return;

        setIsProcessing(true);
        try {
            await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.paymentTransactions,
                transaction.$id,
                {
                    status: 'rejected',
                    reviewedAt: new Date().toISOString(),
                    reviewedBy: 'Admin',
                    notes: reason
                }
            );

            alert(`❌ Payment rejected. Reason: ${reason}`);
            setSelectedTransaction(null);
            fetchTransactions();
        } catch (error) {
            console.error('Error rejecting payment:', error);
            alert('Failed to reject payment. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            approved: 'bg-green-100 text-green-800 border-green-300',
            rejected: 'bg-red-100 text-red-800 border-red-300'
        };
        
        const icons = {
            pending: '⏳',
            approved: '✅',
            rejected: '❌'
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${styles[status as keyof typeof styles]}`}>
                {icons[status as keyof typeof icons]} {status.toUpperCase()}
            </span>
        );
    };

    const getPendingCount = () => transactions.filter(t => t.status === 'pending').length;

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Payment Transactions</h2>
                        <p className="text-gray-500 mt-1">Review and manage membership payment submissions</p>
                    </div>
                    {getPendingCount() > 0 && (
                        <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg px-4 py-2">
                            <p className="text-yellow-800 font-bold">⏳ {getPendingCount()} Pending Review</p>
                        </div>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mt-4">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                filter === tab
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            {tab === 'pending' && getPendingCount() > 0 && (
                                <span className="ml-2 bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-xs">
                                    {getPendingCount()}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                        <p className="text-gray-500 mt-2">Loading transactions...</p>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500">No {filter !== 'all' ? filter : ''} transactions found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {transactions.map((transaction) => (
                            <div
                                key={transaction.$id}
                                className="border-2 border-gray-200 rounded-xl p-5 hover:border-orange-300 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-gray-900">{transaction.userName || transaction.userEmail || 'Unknown User'}</h3>
                                            {getStatusBadge(transaction.status)}
                                            {transaction.userType && (
                                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                                    {transaction.userType.toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        {transaction.userEmail && <p className="text-sm text-gray-500">{transaction.userEmail}</p>}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-orange-600">{transaction.currency || 'IDR'} {transaction.amount.toLocaleString()}</p>
                                        {transaction.packageDuration && <p className="text-sm text-gray-500">{transaction.packageDuration}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                                    {transaction.packageType && (
                                        <div>
                                            <span className="text-gray-500">Package:</span>
                                            <p className="font-semibold text-gray-900">{transaction.packageType}</p>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-gray-500">Transaction Date:</span>
                                        <p className="font-semibold text-gray-900">
                                            {new Date(transaction.transactionDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {transaction.paymentMethod && (
                                        <div>
                                            <span className="text-gray-500">Payment Method:</span>
                                            <p className="font-semibold text-gray-900">{transaction.paymentMethod}</p>
                                        </div>
                                    )}
                                    {transaction.expiresAt && (
                                        <div>
                                            <span className="text-gray-500">Expires:</span>
                                            <p className="font-semibold text-gray-900">
                                                {new Date(transaction.expiresAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                    {transaction.reviewedAt && (
                                        <div>
                                            <span className="text-gray-500">Reviewed:</span>
                                            <p className="font-semibold text-gray-900">
                                                {new Date(transaction.reviewedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {transaction.notes && (
                                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                        <p className="text-sm text-gray-700">
                                            <span className="font-semibold">Notes:</span> {transaction.notes}
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setSelectedTransaction(transaction)}
                                        className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
                                    >
                                        View Payment Proof
                                    </button>
                                    {transaction.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleApprove(transaction)}
                                                disabled={isProcessing}
                                                className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                ✅ Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(transaction)}
                                                disabled={isProcessing}
                                                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                ❌ Reject
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Payment Proof Modal */}
            {selectedTransaction && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Payment Proof</h2>
                                    <p className="text-gray-500">{selectedTransaction.userName}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedTransaction(null)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Transaction Details */}
                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Amount:</span>
                                        <p className="font-bold text-orange-600 text-xl">{selectedTransaction.currency || 'IDR'} {selectedTransaction.amount.toLocaleString()}</p>
                                    </div>
                                    {selectedTransaction.packageDuration && (
                                        <div>
                                            <span className="text-gray-500">Package:</span>
                                            <p className="font-semibold text-gray-900">{selectedTransaction.packageDuration}</p>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-gray-500">Status:</span>
                                        <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                                    </div>
                                    {selectedTransaction.expiresAt && (
                                        <div>
                                            <span className="text-gray-500">Valid Until:</span>
                                            <p className="font-semibold text-gray-900">
                                                {new Date(selectedTransaction.expiresAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-gray-500">Transaction ID:</span>
                                        <p className="font-mono text-xs text-gray-900">{selectedTransaction.transactionId}</p>
                                    </div>
                                    {selectedTransaction.paymentMethod && (
                                        <div>
                                            <span className="text-gray-500">Payment Method:</span>
                                            <p className="font-semibold text-gray-900">{selectedTransaction.paymentMethod}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment Screenshot */}
                            {selectedTransaction.paymentProofUrl && (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-900 mb-3">Payment Screenshot:</h3>
                                    <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                                        <img
                                            src={selectedTransaction.paymentProofUrl}
                                            alt="Payment Proof"
                                            className="w-full h-auto"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Review Actions */}
                            {selectedTransaction.status === 'pending' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Review Notes (Optional)
                                        </label>
                                        <textarea
                                            value={reviewNotes}
                                            onChange={(e) => setReviewNotes(e.target.value)}
                                            placeholder="Add any notes about this payment..."
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleApprove(selectedTransaction)}
                                            disabled={isProcessing}
                                            className="flex-1 py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {isProcessing ? 'Processing...' : '✅ Approve & Activate Membership'}
                                        </button>
                                        <button
                                            onClick={() => handleReject(selectedTransaction)}
                                            disabled={isProcessing}
                                            className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            ❌ Reject Payment
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Setup Instructions */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mt-6">
                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Collection Setup Required
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                    <li>Create <code className="bg-blue-100 px-2 py-0.5 rounded">payment_transactions</code> collection in Appwrite</li>
                    <li>Add these attributes: userId, userEmail, userName, userType, packageType, packageDuration, amount, paymentProofUrl, status, submittedAt, reviewedAt, reviewedBy, notes, expiresAt</li>
                    <li>Configure proper permissions for admin access</li>
                </ol>
            </div>
        </div>
    );
};

export default PaymentTransactionsPage;
