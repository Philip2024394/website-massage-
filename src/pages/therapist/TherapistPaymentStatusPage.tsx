// 🎯 AUTO-FIXED: Mobile scroll architecture violations (6 fixes)
// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Calendar, CreditCard, DollarSign, FileText, RefreshCw, Menu } from 'lucide-react';
import TherapistPageHeader from '../../components/therapist/TherapistPageHeader';
import { paymentConfirmationService } from '../../lib/appwriteService';
import type { Therapist } from '../../types';
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

const TherapistPaymentStatusPage: React.FC<TherapistPaymentStatusProps> = ({ therapist, onBack }) => {
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
            
            // Deduplicate payments based on transactionId and submittedAt
            const uniquePayments = data.reduce((acc: PaymentConfirmation[], current: PaymentConfirmation) => {
                const isDuplicate = acc.some(payment => 
                    payment.transactionId === current.transactionId &&
                    payment.submittedAt === current.submittedAt &&
                    payment.amount === current.amount &&
                    payment.packageType === current.packageType
                );
                
                if (!isDuplicate) {
                    acc.push(current);
                }
                return acc;
            }, []);
            
            setPayments(uniquePayments);
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
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-800 rounded-lg text-xs sm:text-sm font-semibold border border-orange-200">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        Menunggu Review
                    </span>
                );
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-800 rounded-lg text-xs sm:text-sm font-semibold border border-green-200">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        Disetujui
                    </span>
                );
            case 'declined':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-800 rounded-lg text-xs sm:text-sm font-semibold border border-red-200">
                        <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        Ditolak
                    </span>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50 flex items-center justify-center" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y pan-x' }}>
                <div className="text-center">
                    <RefreshCw className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Memuat riwayat pembayaran...</p>
                </div>
            </div>
        );
    }

    const submitHelp = paymentStatusHelp.submitProof;
    const historyHelp = paymentStatusHelp.paymentHistory;
    const expiryHelp = paymentStatusHelp.expiryDate;

    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y pan-x' }}>
            {/* Standardized Page Header */}
            <TherapistPageHeader
                title="Riwayat Pembayaran"
                subtitle="Lacak pengajuan dan persetujuan pembayaran Anda"
                onBackToStatus={onBack}
                icon={<CreditCard className="w-6 h-6 text-orange-600" />}
                actions={
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-orange-50 rounded-lg transition-colors"
                        aria-label="Open menu"
                        title="Menu"
                    >
                        <Menu className="w-5 h-5 text-orange-600" />
                    </button>
                }
            />

            <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
                {/* Info Banner - review process */}
                <section className="bg-white border border-gray-200 rounded-lg p-4" aria-labelledby="review-heading">
                    <h2 id="review-heading" className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Proses Review</h2>
                    <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <ul className="text-sm text-gray-700 space-y-1">
                            <li>• Admin memeriksa pembayaran dalam 7 hari</li>
                            <li>• Pembayaran disetujui mengaktifkan membership langsung</li>
                            <li>• Pembayaran ditolak dapat dikirim ulang dengan bukti yang benar</li>
                        </ul>
                    </div>
                </section>

                {/* Help content - on page */}
                <section className="bg-white border border-gray-200 rounded-lg p-4" aria-labelledby="help-heading">
                    <h2 id="help-heading" className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Panduan</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-1">{submitHelp.title}</h3>
                            <p className="text-xs text-gray-600 mb-2">{submitHelp.content}</p>
                            {submitHelp.benefits && submitHelp.benefits.length > 0 && (
                                <ul className="text-xs text-gray-600 space-y-0.5">
                                    {submitHelp.benefits.map((b, i) => <li key={i}>• {b}</li>)}
                                </ul>
                            )}
                        </div>
                        <div className="border-t border-gray-200 pt-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-1">{historyHelp.title}</h3>
                            <p className="text-xs text-gray-600 mb-2">{historyHelp.content}</p>
                            {historyHelp.benefits && historyHelp.benefits.length > 0 && (
                                <ul className="text-xs text-gray-600 space-y-0.5">
                                    {historyHelp.benefits.map((b, i) => <li key={i}>• {b}</li>)}
                                </ul>
                            )}
                        </div>
                        <div className="border-t border-gray-200 pt-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-1">{expiryHelp.title}</h3>
                            <p className="text-xs text-gray-600 mb-2">{expiryHelp.content}</p>
                            {expiryHelp.benefits && expiryHelp.benefits.length > 0 && (
                                <ul className="text-xs text-gray-600 space-y-0.5">
                                    {expiryHelp.benefits.map((b, i) => <li key={i}>• {b}</li>)}
                                </ul>
                            )}
                        </div>
                    </div>
                </section>

                {/* Payment List */}
                {payments.length === 0 ? (
                    <section className="bg-white border border-gray-200 rounded-lg p-8 text-center" aria-label="Riwayat pembayaran kosong">
                        <FileText className="w-14 h-14 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-gray-900 mb-1">Belum Ada Riwayat Pembayaran</h3>
                        <p className="text-sm text-gray-600 mb-5">
                            Anda belum mengirim bukti pembayaran. Silakan ke Membership untuk mengajukan pembayaran.
                        </p>
                        <button
                            onClick={() => onBack()}
                            className="px-5 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium text-sm"
                        >
                            Ke Membership
                        </button>
                    </section>
                ) : (
                    <section className="space-y-4" aria-label="Daftar pembayaran">
                        {payments.map((payment) => {
                            const daysRemaining = getDaysRemaining(payment.expiresAt);
                            const isExpiringSoon = daysRemaining <= 2 && payment.status === 'pending';

                            return (
                                <div
                                    key={payment.$id}
                                    className={`bg-white border rounded-lg p-4 ${
                                        isExpiringSoon ? 'border-orange-400 border-2' : 'border-gray-200'
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
                                                <p className="text-xs text-gray-600">Paket</p>
                                                <p className="text-sm font-bold text-black">
                                                    {payment.packageType || 'Membership'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                                            <div>
                                                <p className="text-xs text-gray-600">Jumlah</p>
                                                <p className="text-sm font-bold text-black">
                                                    IDR {payment.amount.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        {payment.packageDuration && (
                                            <div className="flex items-center gap-3">
                                                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                                                <div>
                                                    <p className="text-xs text-gray-600">Durasi</p>
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
                                                {isExpiringSoon ? '⚠️ Segera kadaluarsa!' : 'Menunggu review'}
                                            </p>
                                            </div>
                                            <p className="text-xs sm:text-sm text-gray-700">
                                                Admin akan memeriksa dalam {daysRemaining} hari.
                                                {isExpiringSoon && ' Mohon bersabar, admin akan merespons segera.'}
                                            </p>
                                        </div>
                                    )}

                                    {payment.status === 'approved' && payment.reviewedAt && (
                                        <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 mb-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <CheckCircle className="w-4 h-4 text-black" />
                                                <p className="text-xs sm:text-sm font-bold text-black">
                                                Pembayaran Dikonfirmasi ✅
                                            </p>
                                            </div>
                                            <p className="text-xs sm:text-sm text-gray-700">
                                                Disetujui {new Date(payment.reviewedAt).toLocaleDateString('id-ID')}
                                                {' • '}Membership Anda aktif!
                                            </p>
                                        </div>
                                    )}

                                    {payment.status === 'declined' && (
                                        <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 mb-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <XCircle className="w-4 h-4 text-black" />
                                                <p className="text-xs sm:text-sm font-bold text-black">
                                                Pembayaran Ditolak
                                            </p>
                                            </div>
                                            <p className="text-xs sm:text-sm text-gray-700 mb-2">
                                                {payment.declineReason || 'Periksa bukti pembayaran dan kirim ulang.'}
                                            </p>
                                            <button
                                                onClick={() => onBack()}
                                                className="text-xs sm:text-sm text-orange-600 hover:text-orange-700 font-semibold"
                                            >
                                                Kirim Bukti Pembayaran Baru
                                            </button>
                                        </div>
                                    )}

                                    {/* View Proof Button */}
                                    <button
                                        onClick={() => setSelectedProof(payment.paymentProofUrl)}
                                        className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm font-semibold"
                                    >
                                        Lihat Bukti Pembayaran
                                    </button>
                                </div>
                            );
                        })}
                    </section>
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
                                className="absolute -top-12 right-0 text-white hover:text-gray-300 text-sm font-semibold"
                            >
                                Tutup
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

export default TherapistPaymentStatusPage;
