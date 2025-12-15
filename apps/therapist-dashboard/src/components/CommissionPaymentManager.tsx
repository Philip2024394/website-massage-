/**
 * Commission Payment Manager Component
 * 
 * Shows members:
 * - Pending commission payments
 * - 3-hour countdown timer
 * - Upload payment proof interface
 * - Payment history
 * - Account status warnings
 */

import React, { useState, useEffect } from 'react';
import { Clock, Upload, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';
import { commissionTrackingService, CommissionPayment } from '../../../../lib/services/commissionTrackingService';

interface CommissionPaymentManagerProps {
    therapistId: string;
    therapistName: string;
}

export const CommissionPaymentManager: React.FC<CommissionPaymentManagerProps> = ({
    therapistId
    // therapistName - unused parameter
}) => {
    const [pendingPayments, setPendingPayments] = useState<CommissionPayment[]>([]);
    const [paymentHistory, setPaymentHistory] = useState<CommissionPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadingFor, setUploadingFor] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [paymentMethod, setPaymentMethod] = useState('bank_transfer');

    useEffect(() => {
        loadPayments();
        
        // Refresh every minute
        const interval = setInterval(loadPayments, 60000);
        return () => clearInterval(interval);
    }, [therapistId]);

    const loadPayments = async () => {
        try {
            const [pending, history] = await Promise.all([
                commissionTrackingService.getTherapistPendingPayments(therapistId),
                commissionTrackingService.getPaymentHistory(therapistId)
            ]);

            setPendingPayments(pending);
            setPaymentHistory(history);
        } catch (error) {
            console.error('Error loading payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUploadProof = async (paymentId: string) => {
        if (!selectedFile) {
            alert('Please select a file');
            return;
        }

        setUploadingFor(paymentId);

        try {
            await commissionTrackingService.uploadPaymentProof(
                paymentId,
                selectedFile,
                paymentMethod
            );

            alert('✅ Payment proof uploaded! Your account is now active. Admin will verify within 24 hours.');
            setSelectedFile(null);
            setUploadingFor(null);
            await loadPayments();
        } catch (error) {
            console.error('Error uploading proof:', error);
            alert('Failed to upload payment proof. Please try again.');
        } finally {
            setUploadingFor(null);
        }
    };

    const getTimeRemaining = (deadline: string): string => {
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diff = deadlineDate.getTime() - now.getTime();

        if (diff <= 0) return 'OVERDUE';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        return `${hours}h ${minutes}m remaining`;
    };

    const getStatusBadge = (status: CommissionPayment['status']) => {
        switch (status) {
            case 'pending':
                return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">⏳ Pending</span>;
            case 'overdue':
                return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">⚠️ Overdue</span>;
            case 'awaiting_verification':
                return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">🔍 Verifying</span>;
            case 'verified':
                return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">✅ Verified</span>;
            case 'rejected':
                return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">❌ Rejected</span>;
            default:
                return null;
        }
    };

    if (loading) {
        return <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>;
    }

    const totalPending = pendingPayments.reduce((sum, p) => sum + p.commissionAmount, 0);
    const hasOverdue = pendingPayments.some(p => p.status === 'overdue');

    return (
        <div className="space-y-6">
            {/* Warning Banner */}
            {hasOverdue && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-red-900 mb-2">⚠️ Account Deactivated</h3>
                            <p className="text-red-800 mb-4">
                                You have overdue commission payments. Your "Book Now" and "Schedule" buttons are disabled,
                                and your profile is set to Busy. Upload payment proof to reactivate your account immediately.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Summary Card */}
            {pendingPayments.length > 0 && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900">Pending Commissions</h3>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Total Due</p>
                            <p className="text-2xl font-bold text-orange-600">Rp {totalPending.toLocaleString()}</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-700">
                        💡 Upload payment proof within 3 hours to keep your account active
                    </p>
                </div>
            )}

            {/* Pending Payments List */}
            {pendingPayments.length > 0 && (
                <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Payments Due</h4>
                    {pendingPayments.map((payment) => (
                        <div key={payment.$id} className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h5 className="font-bold text-gray-900">Booking #{payment.bookingId}</h5>
                                        {getStatusBadge(payment.status)}
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        <Calendar className="w-4 h-4 inline mr-1" />
                                        {new Date(payment.bookingDate).toLocaleString()}
                                    </p>
                                    {payment.scheduledDate && (
                                        <p className="text-sm text-gray-600">
                                            📅 Scheduled: {new Date(payment.scheduledDate).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">Commission (30%)</p>
                                    <p className="text-xl font-bold text-orange-600">Rp {payment.commissionAmount.toLocaleString()}</p>
                                    <p className="text-xs text-gray-500">from Rp {payment.serviceAmount.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Timer */}
                            {(payment.status === 'pending' || payment.status === 'overdue') && (
                                <div className={`mb-4 p-3 rounded-lg ${
                                    payment.status === 'overdue' ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'
                                }`}>
                                    <div className="flex items-center gap-2">
                                        <Clock className={`w-5 h-5 ${payment.status === 'overdue' ? 'text-red-600' : 'text-blue-600'}`} />
                                        <span className={`font-semibold ${payment.status === 'overdue' ? 'text-red-900' : 'text-blue-900'}`}>
                                            {getTimeRemaining(payment.paymentDeadline)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Rejection Reason */}
                            {payment.status === 'rejected' && payment.rejectionReason && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm font-semibold text-red-900 mb-1">❌ Rejection Reason:</p>
                                    <p className="text-sm text-red-800">{payment.rejectionReason}</p>
                                </div>
                            )}

                            {/* Upload Section */}
                            {(payment.status === 'pending' || payment.status === 'overdue' || payment.status === 'rejected') && (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                                        <select
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        >
                                            <option value="bank_transfer">Bank Transfer</option>
                                            <option value="cash">Cash</option>
                                            <option value="e_wallet">E-Wallet</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Proof</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            📸 Take a photo or screenshot of your bank transfer, cash receipt, or e-wallet transaction
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => handleUploadProof(payment.$id)}
                                        disabled={!selectedFile || uploadingFor === payment.$id}
                                        className="w-full py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                    >
                                        {uploadingFor === payment.$id ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                <span>Uploading...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-5 h-5" />
                                                <span>Upload Payment Proof</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Verification Status */}
                            {payment.status === 'awaiting_verification' && (
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="w-5 h-5 text-blue-600" />
                                        <p className="font-semibold text-blue-900">Payment Proof Submitted</p>
                                    </div>
                                    <p className="text-sm text-blue-800">
                                        ✅ Your account is now active! Admin will verify your payment within 24 hours.
                                    </p>
                                    {payment.paymentProofUploadedAt && (
                                        <p className="text-xs text-blue-600 mt-1">
                                            Uploaded: {new Date(payment.paymentProofUploadedAt).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            )}

                            {payment.status === 'verified' && (
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <p className="font-semibold text-green-900">Payment Verified ✅</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Payment History */}
            {paymentHistory.length > 0 && (
                <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Payment History</h4>
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Booking ID</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Amount</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {paymentHistory.map((payment) => (
                                        <tr key={payment.$id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {new Date(payment.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">#{payment.bookingId}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 text-right font-semibold">
                                                Rp {payment.commissionAmount.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {getStatusBadge(payment.status)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {pendingPayments.length === 0 && paymentHistory.length === 0 && (
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">All Clear!</h3>
                    <p className="text-gray-600">No pending commission payments</p>
                </div>
            )}
        </div>
    );
};
