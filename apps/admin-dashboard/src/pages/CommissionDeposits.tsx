// @ts-nocheck - temporary until React/Appwrite types are aligned
import React, { useEffect, useState } from 'react';
import {
    ShieldCheck,
    AlertTriangle,
    CheckCircle,
    Clock,
    RefreshCw,
    DollarSign,
    Eye,
    XCircle,
    Upload,
    FileText,
    User
} from 'lucide-react';
import { databases, Query, APPWRITE_CONFIG } from '../../../src/lib/appwrite';

interface CommissionPayment {
    $id: string;
    providerName?: string;
    providerId?: string | number;
    bookingId?: string | number;
    commissionAmount?: number;
    serviceAmount?: number;
    paymentDate?: string;
    status: 'pending' | 'awaiting_verification' | 'verified' | 'rejected' | 'overdue' | string;
    paymentProofImage?: string;
    paymentProofUploadedAt?: string;
    verifiedAt?: string;
    paymentReference?: string;
    note?: string;
}

interface DepositProof {
    $id: string;
    bookingId?: string;
    customerName?: string;
    providerName?: string;
    depositReference?: string;
    depositProofUrl?: string;
    depositUploadedAt?: string;
    depositStatus?: string;
    totalCost?: number;
}

const CommissionDeposits: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [commissions, setCommissions] = useState<CommissionPayment[]>([]);
    const [deposits, setDeposits] = useState<DepositProof[]>([]);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const commissionCollectionId = APPWRITE_CONFIG.collections.commissionRecords || 'commission_records';
    const bookingsCollectionId = APPWRITE_CONFIG.collections.bookings || 'bookings';

    const loadData = async () => {
        setLoading(true);
        try {
            const [awaiting, unpaid, depositsResp] = await Promise.all([
                databases.listDocuments(
                    APPWRITE_CONFIG.databaseId,
                    commissionCollectionId,
                    [Query.equal('status', 'awaiting_verification')]
                ),
                databases.listDocuments(
                    APPWRITE_CONFIG.databaseId,
                    commissionCollectionId,
                    [Query.equal('status', ['pending', 'overdue'])]
                ),
                databases.listDocuments(
                    APPWRITE_CONFIG.databaseId,
                    bookingsCollectionId,
                    [Query.equal('depositStatus', 'uploaded')]
                )
            ]);

            const merged: Record<string, CommissionPayment> = {};
            [...awaiting.documents, ...unpaid.documents].forEach((c: any) => {
                merged[c.$id] = c;
            });
            setCommissions(Object.values(merged));
            setDeposits(depositsResp.documents as any);
        } catch (error) {
            console.error('Error loading commission/deposit data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleVerifyCommission = async (commissionId: string, approve: boolean) => {
        setProcessingId(commissionId);
        try {
            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                commissionCollectionId,
                commissionId,
                {
                    status: approve ? 'verified' : 'rejected',
                    verifiedBy: 'admin',
                    verifiedAt: new Date().toISOString(),
                    rejectionReason: approve ? null : 'Proof not clear'
                }
            );
            await loadData();
        } catch (err) {
            console.error('Failed to update commission status:', err);
            alert('Failed to update commission.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleMarkDepositReviewed = async (bookingId: string) => {
        setProcessingId(bookingId);
        try {
            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                bookingsCollectionId,
                bookingId,
                {
                    depositStatus: 'reviewed',
                    depositReviewedAt: new Date().toISOString()
                }
            );
            await loadData();
        } catch (err) {
            console.error('Failed to mark deposit reviewed:', err);
            alert('Failed to mark deposit.');
        } finally {
            setProcessingId(null);
        }
    };

    const pendingCount = commissions.filter(c => c.status === 'pending' || c.status === 'awaiting_verification').length;
    const overdueCount = commissions.filter(c => c.status === 'overdue').length;
    const depositCount = deposits.length;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-3" />
                    <p className="text-gray-600">Loading commission and deposit data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <ShieldCheck className="w-8 h-8 text-orange-500" />
                            Commissions & Deposits
                        </h1>
                        <p className="text-gray-600 mt-1">Verify 30% commissions and scheduled-booking deposit proofs.</p>
                    </div>
                    <button
                        onClick={loadData}
                        className="p-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg transition-colors"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Pending / Awaiting Proof</p>
                                <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
                            </div>
                            <Clock className="w-8 h-8 text-yellow-500" />
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Overdue (locked)</p>
                                <p className="text-3xl font-bold text-red-600">{overdueCount}</p>
                            </div>
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Deposits to review</p>
                                <p className="text-3xl font-bold text-blue-600">{depositCount}</p>
                            </div>
                            <Upload className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                </div>

                {/* Commissions table */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="font-semibold text-gray-900 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-orange-500" />
                            Commission Proofs
                        </div>
                    </div>
                    {commissions.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                            No commission records awaiting action.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {commissions.map((c) => {
                                const paidAt = c.paymentDate || c.paymentProofUploadedAt || c.verifiedAt;
                                return (
                                    <div key={c.$id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-gray-900 font-semibold">
                                                <User className="w-4 h-4 text-gray-500" />
                                                {c.providerName || 'Therapist'}
                                                <span className="text-gray-400">•</span>
                                                <span className="text-gray-600">Booking {c.bookingId || '—'}</span>
                                            </div>
                                            <div className="text-sm text-gray-700">Commission: IDR {c.commissionAmount?.toLocaleString('id-ID') || '0'} | Service: IDR {c.serviceAmount?.toLocaleString('id-ID') || '0'}</div>
                                            <div className="text-xs text-gray-500">Paid/Proof: {paidAt ? new Date(paidAt).toLocaleString() : '—'}</div>
                                            {(c.paymentReference || c.note) && (
                                                <div className="text-xs text-gray-600">Ref: {c.paymentReference || c.note}</div>
                                            )}
                                            {c.paymentProofImage && (
                                                <button
                                                    onClick={() => setPreviewUrl(c.paymentProofImage as string)}
                                                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                                                >
                                                    <span className="h-14 w-14 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                                        <img
                                                            src={c.paymentProofImage as string}
                                                            alt="Payment proof"
                                                            className="h-full w-full object-cover"
                                                            loading="lazy"
                                                        />
                                                    </span>
                                                    <span className="inline-flex items-center gap-1">
                                                        <Eye className="w-4 h-4" /> View proof
                                                    </span>
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {(c.status === 'pending' || c.status === 'awaiting_verification') && (
                                                <>
                                                    <button
                                                        onClick={() => handleVerifyCommission(c.$id, true)}
                                                        disabled={processingId === c.$id}
                                                        className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                                                    >
                                                        <CheckCircle className="w-4 h-4 inline mr-1" /> Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleVerifyCommission(c.$id, false)}
                                                        disabled={processingId === c.$id}
                                                        className="px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200 hover:bg-red-100 disabled:opacity-50"
                                                    >
                                                        <XCircle className="w-4 h-4 inline mr-1" /> Reject
                                                    </button>
                                                </>
                                            )}
                                            {c.status === 'overdue' && (
                                                <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">Overdue</span>
                                            )}
                                            {c.status === 'verified' && (
                                                <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-full">Verified</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Deposits */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="p-4 border-b border-gray-100 font-semibold text-gray-900 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-blue-500" />
                        Scheduled Booking Deposits
                    </div>
                    {deposits.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                            No deposit proofs awaiting review.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {deposits.map((d) => (
                                <div key={d.$id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                    <div className="flex-1 space-y-1">
                                        <div className="text-sm font-semibold text-gray-900">Booking {d.bookingId || d.$id}</div>
                                        <div className="text-sm text-gray-700">Customer: {d.customerName || '—'} • Provider: {d.providerName || '—'}</div>
                                        <div className="text-sm text-gray-700">Amount: IDR {(d.totalCost || 0).toLocaleString('id-ID')}</div>
                                        {d.depositReference && (
                                            <div className="text-xs text-gray-600">Reference: {d.depositReference}</div>
                                        )}
                                        <div className="text-xs text-gray-500">Uploaded: {d.depositUploadedAt ? new Date(d.depositUploadedAt).toLocaleString() : '—'}</div>
                                        {d.depositProofUrl && (
                                            <button
                                                onClick={() => setPreviewUrl(d.depositProofUrl as string)}
                                                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                                            >
                                                <span className="h-14 w-14 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                                    <img
                                                        src={d.depositProofUrl as string}
                                                        alt="Deposit proof"
                                                        className="h-full w-full object-cover"
                                                        loading="lazy"
                                                    />
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <Eye className="w-4 h-4" /> View proof
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleMarkDepositReviewed(d.$id)}
                                            disabled={processingId === d.$id}
                                            className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            <CheckCircle className="w-4 h-4 inline mr-1" /> Mark reviewed
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {previewUrl && <ProofModal url={previewUrl} onClose={() => setPreviewUrl(null)} />}
        </div>
    );
};

export default CommissionDeposits;

// Lightweight modal to preview proof images without leaving the dashboard
const ProofModal = ({ url, onClose }: { url: string; onClose: () => void }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
        <div className="relative max-h-[90vh] max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <img src={url} alt="Payment proof" className="max-h-[90vh] rounded-lg shadow-2xl" />
            <button
                onClick={onClose}
                className="absolute -top-3 -right-3 rounded-full bg-white shadow px-3 py-2 text-gray-700 hover:bg-gray-100"
            >
                Close
            </button>
        </div>
    </div>
);
