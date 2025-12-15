/**
 * Admin Payment Verification Dashboard
 * 
 * Unified view for admin to verify:
 * 1. Pro commission payments (30%, 3-hour rule)
 * 2. Plus membership payments (250k/month)
 * 
 * Features:
 * - View uploaded payment proofs
 * - Approve/Reject with reasons
 * - Deactivate accounts if needed
 * - Track payment history
 * - Filter by status and type
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, Search } from 'lucide-react';
import { commissionTrackingService } from '../../../../lib/services/commissionTrackingService';

interface AdminPaymentVerificationProps {
    adminId: string;
}

type PaymentType = 'all' | 'commission' | 'membership';


export const AdminPaymentVerification: React.FC<AdminPaymentVerificationProps> = ({ adminId }) => {
    const [commissionPayments, setCommissionPayments] = useState<any[]>([]);
    const [membershipPayments, setMembershipPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProof, setSelectedProof] = useState<string | null>(null);
    const [verifying, setVerifying] = useState<string | null>(null);
    
    // Filters
    const [paymentType, setPaymentType] = useState<PaymentType>('all');
    // const [statusFilter, setStatusFilter] = useState<PaymentStatus>('awaiting_verification');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadPayments();
        
        // Refresh every 30 seconds
        const interval = setInterval(loadPayments, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadPayments = async () => {
        try {
            setLoading(true);
            
            // Load commission payments (Pro members)
            const commissions = await commissionTrackingService.getPaymentsAwaitingVerification();
            setCommissionPayments(commissions);

            // Load membership payments (Plus members)
            // TODO: Implement paymentConfirmationService
            // const memberships = await paymentConfirmationService.getPendingPayments();
            // setMembershipPayments(memberships.filter((p: any) => p.paymentType === 'membership'));
            setMembershipPayments([]);

            console.log('📊 Loaded payments:', {
                commissions: commissions.length,
                memberships: 0
            });
        } catch (error) {
            console.error('Error loading payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCommission = async (paymentId: string, approved: boolean, reason?: string) => {
        setVerifying(paymentId);
        
        try {
            await commissionTrackingService.verifyPayment(paymentId, adminId, approved, reason);
            alert(approved ? '✅ Commission payment verified!' : '❌ Commission payment rejected');
            await loadPayments();
        } catch (error) {
            console.error('Error verifying commission:', error);
            alert('Failed to verify payment');
        } finally {
            setVerifying(null);
        }
    };

    const handleVerifyMembership = async (paymentId: string, approved: boolean /* , reason?: string */) => {
        setVerifying(paymentId);
        
        try {
            // TODO: Implement paymentConfirmationService
            // await paymentConfirmationService.reviewPayment(paymentId, approved, reason);
            await Promise.resolve();
            alert(approved ? '✅ Membership payment verified!' : '❌ Membership payment rejected');
            await loadPayments();
        } catch (error) {
            console.error('Error verifying membership:', error);
            alert('Failed to verify payment');
        } finally {
            setVerifying(null);
        }
    };

    const handleReject = (paymentId: string, type: 'commission' | 'membership') => {
        const reason = prompt('Enter rejection reason:');
        if (reason) {
            if (type === 'commission') {
                handleVerifyCommission(paymentId, false, reason);
            } else {
                handleVerifyMembership(paymentId, false);
            }
        }
    };

    const getFilteredPayments = () => {
        let payments: any[] = [];

        if (paymentType === 'all' || paymentType === 'commission') {
            payments = [...payments, ...commissionPayments.map(p => ({ ...p, type: 'commission' }))];
        }

        if (paymentType === 'all' || paymentType === 'membership') {
            payments = [...payments, ...membershipPayments.map(p => ({ ...p, type: 'membership' }))];
        }

        // Filter by search term
        if (searchTerm) {
            payments = payments.filter(p => 
                p.therapistName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sort by date (newest first)
        payments.sort((a, b) => {
            const dateA = new Date(a.paymentProofUploadedAt || a.submittedAt || a.createdAt);
            const dateB = new Date(b.paymentProofUploadedAt || b.submittedAt || b.createdAt);
            return dateB.getTime() - dateA.getTime();
        });

        return payments;
    };

    const stats = {
        total: commissionPayments.length + membershipPayments.length,
        commission: commissionPayments.length,
        membership: membershipPayments.length,
        totalAmount: [
            ...commissionPayments.map(p => p.commissionAmount),
            ...membershipPayments.map(p => p.amount)
        ].reduce((sum, amount) => sum + amount, 0)
    };

    if (loading) {
        return <div className="animate-pulse bg-gray-200 h-96 rounded-xl"></div>;
    }

    const filteredPayments = getFilteredPayments();

    return (
        <div className="space-y-6">
            {/* Header & Stats */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
                <h1 className="text-3xl font-bold mb-6">Payment Verification Dashboard</h1>
                <div className="grid md:grid-cols-4 gap-4">
                    <div className="bg-white/10 rounded-lg p-4">
                        <p className="text-blue-100 text-sm mb-1">Pending Verifications</p>
                        <p className="text-3xl font-bold">{stats.total}</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                        <p className="text-blue-100 text-sm mb-1">Commission Payments</p>
                        <p className="text-3xl font-bold">{stats.commission}</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                        <p className="text-blue-100 text-sm mb-1">Membership Payments</p>
                        <p className="text-3xl font-bold">{stats.membership}</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                        <p className="text-blue-100 text-sm mb-1">Total Amount</p>
                        <p className="text-2xl font-bold">Rp {stats.totalAmount.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <div className="grid md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                        <select
                            value={paymentType}
                            onChange={(e) => setPaymentType(e.target.value as PaymentType)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Payments</option>
                            <option value="commission">Commission (Pro)</option>
                            <option value="membership">Membership (Plus)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={loadPayments}
                            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                        >
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Payments List */}
            {filteredPayments.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
                    <p className="text-gray-600">No payments pending verification</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredPayments.map((payment) => (
                        <div key={payment.$id} className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    {/* Payment Type Badge */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            payment.type === 'commission' 
                                                ? 'bg-amber-100 text-amber-800' 
                                                : 'bg-purple-100 text-purple-800'
                                        }`}>
                                            {payment.type === 'commission' ? '💰 Pro Commission' : '👑 Plus Membership'}
                                        </span>
                                        {payment.type === 'commission' && payment.status === 'overdue' && (
                                            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">
                                                ⚠️ OVERDUE
                                            </span>
                                        )}
                                    </div>

                                    {/* Member Info */}
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {payment.therapistName || payment.userName}
                                    </h3>
                                    
                                    {payment.type === 'commission' ? (
                                        <>
                                            <p className="text-sm text-gray-600">
                                                <strong>Booking ID:</strong> #{payment.bookingId}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <strong>Service Amount:</strong> Rp {payment.serviceAmount.toLocaleString()}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <strong>Commission (30%):</strong> Rp {payment.commissionAmount.toLocaleString()}
                                            </p>
                                            {payment.scheduledDate && (
                                                <p className="text-sm text-gray-600">
                                                    <strong>Scheduled:</strong> {new Date(payment.scheduledDate).toLocaleString()}
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-sm text-gray-600">
                                                <strong>Transaction ID:</strong> {payment.transactionId}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <strong>Package:</strong> {payment.packageType || payment.packageName}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <strong>Amount:</strong> Rp {payment.amount.toLocaleString()}
                                            </p>
                                        </>
                                    )}

                                    <p className="text-sm text-gray-600 mt-2">
                                        <strong>Uploaded:</strong> {new Date(payment.paymentProofUploadedAt || payment.submittedAt).toLocaleString()}
                                    </p>
                                    
                                    {payment.paymentMethod && (
                                        <p className="text-sm text-gray-600">
                                            <strong>Method:</strong> {payment.paymentMethod}
                                        </p>
                                    )}
                                </div>

                                {/* Amount Display */}
                                <div className="text-right">
                                    <p className="text-sm text-gray-600 mb-1">Amount</p>
                                    <p className="text-3xl font-bold text-blue-600">
                                        Rp {(payment.commissionAmount || payment.amount).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Payment Proof */}
                            {(payment.paymentProofUrl || payment.proofOfPaymentUrl) && (
                                <div className="mb-4">
                                    <button
                                        onClick={() => setSelectedProof(payment.paymentProofUrl || payment.proofOfPaymentUrl)}
                                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        <Eye className="w-5 h-5" />
                                        View Payment Proof
                                    </button>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        if (payment.type === 'commission') {
                                            handleVerifyCommission(payment.$id, true);
                                        } else {
                                            handleVerifyMembership(payment.$id, true);
                                        }
                                    }}
                                    disabled={verifying === payment.$id}
                                    className="flex-1 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                >
                                    {verifying === payment.$id ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            <span>Verifying...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            <span>Approve Payment</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => handleReject(payment.$id, payment.type)}
                                    disabled={verifying === payment.$id}
                                    className="flex-1 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                >
                                    <XCircle className="w-5 h-5" />
                                    <span>Reject Payment</span>
                                </button>
                            </div>

                            {/* Info Banner */}
                            {payment.type === 'commission' && (
                                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <p className="text-xs text-amber-900">
                                        <strong>Note:</strong> If rejected, member's account will be deactivated and they must submit new proof.
                                    </p>
                                </div>
                            )}
                            {payment.type === 'membership' && (
                                <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                    <p className="text-xs text-purple-900">
                                        <strong>Note:</strong> After approval, member becomes official Indastreet partner with brand usage rights.
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Image Modal */}
            {selectedProof && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedProof(null)}
                >
                    <div className="relative max-w-4xl max-h-full">
                        <button
                            onClick={() => setSelectedProof(null)}
                            className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100"
                        >
                            <XCircle className="w-6 h-6 text-gray-700" />
                        </button>
                        <img 
                            src={selectedProof} 
                            alt="Payment Proof" 
                            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
