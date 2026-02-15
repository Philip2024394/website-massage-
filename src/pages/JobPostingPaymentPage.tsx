// 🎯 Job listing: 170,000 IDR until placement filled or employer deactivates. Admin approves all; employer uploads payment proof.
import React, { useState, useEffect } from 'react';
import { CreditCard, AlertCircle, CheckCircle, Copy, ArrowLeft, DollarSign, Upload, X } from 'lucide-react';
import { databases, storage, ID } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import { JOB_LISTING_PRICE_IDR, JOB_LISTING_STATUS } from '../constants/businessLogic';

const BurgerMenuIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const COLLECTION = APPWRITE_CONFIG.collections?.employerJobPostings || 'employer_job_postings';
const DB_ID = APPWRITE_CONFIG.databaseId;
const BUCKET_ID = APPWRITE_CONFIG.bucketId || '68f76bdd002387590584';

interface JobPostingPaymentPageProps {
    jobId: string;
    onBack: () => void;
    onNavigate?: (page: string) => void;
    onOpenMenu?: () => void;
}

const JobPostingPaymentPage: React.FC<JobPostingPaymentPageProps> = ({
    jobId,
    onBack,
    onNavigate,
    onOpenMenu
}) => {
    const [jobDetails, setJobDetails] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [paymentProof, setPaymentProof] = useState<File | null>(null);
    const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
    const [proofSubmitted, setProofSubmitted] = useState(false);
    const [deactivated, setDeactivated] = useState(false);
    const [uploading, setUploading] = useState(false);

    const bankAccount = {
        name: 'BCA (Bank Central Asia)',
        accountNumber: '1234567890',
        accountName: 'IndaStreet Platform',
    };

    useEffect(() => {
        fetchJobDetails();
    }, [jobId]);

    const fetchJobDetails = async () => {
        try {
            const response = await databases.getDocument(DB_ID, COLLECTION, jobId);
            setJobDetails(response);
            const status = (response as any)?.status;
            if (status === JOB_LISTING_STATUS.PENDING_APPROVAL || (response as any)?.paymentProofUrl) {
                setProofSubmitted(true);
            }
            if (status === JOB_LISTING_STATUS.FILLED) {
                setDeactivated(true);
            }
        } catch (error) {
            console.error('Error fetching job details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    const formatCurrency = (amount: number) => {
        return 'Rp ' + new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(amount);
    };

    const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file (JPG, PNG).');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('Image must be less than 5MB.');
            return;
        }
        setPaymentProof(file);
        const reader = new FileReader();
        reader.onload = (ev) => setPaymentProofPreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const submitPaymentProof = async () => {
        if (!paymentProof || !paymentProofPreview) {
            alert('Please upload your payment proof image first.');
            return;
        }
        setUploading(true);
        try {
            const blob = await fetch(paymentProofPreview).then((r) => r.blob());
            const file = new File([blob], paymentProof.name, { type: paymentProof.type });
            const uploaded = await storage.createFile(BUCKET_ID, ID.unique(), file);
            const fileUrl = `${APPWRITE_CONFIG.endpoint || 'https://syd.cloud.appwrite.io/v1'}/storage/buckets/${BUCKET_ID}/files/${(uploaded as any).$id}/view?project=${APPWRITE_CONFIG.projectId}`;

            await databases.updateDocument(DB_ID, COLLECTION, jobId, {
                status: JOB_LISTING_STATUS.PENDING_APPROVAL,
                paymentProofUrl: fileUrl,
                paymentProofSubmittedAt: new Date().toISOString(),
            });
            setProofSubmitted(true);
            setPaymentProof(null);
            setPaymentProofPreview(null);
        } catch (err) {
            console.error('Submit payment proof:', err);
            alert('Failed to submit proof. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const deactivateListing = async () => {
        if (!confirm('Mark this listing as Position Filled? It will no longer accept applications.')) return;
        try {
            await databases.updateDocument(DB_ID, COLLECTION, jobId, {
                status: JOB_LISTING_STATUS.FILLED,
                deactivatedAt: new Date().toISOString(),
            });
            setDeactivated(true);
        } catch (err) {
            console.error('Deactivate listing:', err);
            alert('Failed to update. Please try again.');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50 flex flex-col">
            {/* Main Header/Navigation */}
            <header className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onNavigate?.('home')}
                            className="text-2xl font-bold tracking-tight hover:opacity-80 transition-opacity"
                        >
                            <span className="text-black">Inda</span>
                            <span className="text-orange-500">
                                <span className="inline-block animate-float">S</span>treet
                            </span>
                        </button>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                        <button onClick={onOpenMenu} title="Menu">
                            <BurgerMenuIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Payment Page Header */}
            <div className="bg-white border-b px-4 py-3">
                <div className="max-w-4xl mx-auto flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Payment Details</h1>
                        <p className="text-sm text-gray-500">Complete your job posting</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 max-w-4xl mx-auto px-4 py-8 space-y-6 w-full">
                {/* Admin will confirm soon – after proof submitted */}
                {proofSubmitted && !deactivated && (
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-amber-900 mb-1">Admin will confirm soon</h3>
                                <p className="text-sm text-amber-800">
                                    Your payment proof has been received. All job listings require admin approval. Your listing will go live after confirmation.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Position filled – after deactivate */}
                {deactivated && (
                    <div className="bg-slate-100 border-2 border-slate-300 rounded-xl p-6 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-400 text-white mb-2">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-1">Position Filled</h3>
                        <p className="text-sm text-slate-600">This listing is closed and no longer accepts applications.</p>
                    </div>
                )}

                {/* Job Summary */}
                {jobDetails && (
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-orange-500" />
                            Your Job Posting
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Position:</span>
                                <span className="font-medium text-gray-900">{jobDetails.jobTitle}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Business:</span>
                                <span className="font-medium text-gray-900">{jobDetails.businessName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Location:</span>
                                <span className="font-medium text-gray-900">{jobDetails.city}, {jobDetails.country}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Single plan: 170,000 IDR until filled or deactivated */}
                {!proofSubmitted && !deactivated && (
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Job listing fee</h3>
                        <div className="p-5 rounded-xl border-2 border-orange-500 bg-orange-50">
                            <div className="text-3xl font-bold text-orange-600 mb-2 text-center">{formatCurrency(JOB_LISTING_PRICE_IDR)}</div>
                            <p className="text-sm text-gray-700 text-center">Until placement is filled or you deactivate the listing. Admin must approve all submissions.</p>
                            <ul className="mt-3 space-y-1 text-sm text-gray-700">
                                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> One fee, no time limit</li>
                                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> Upload payment proof below</li>
                                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> Admin will confirm soon</li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Bank Details */}
                {!deactivated && (
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-orange-500" />
                        Bank Transfer Details
                    </h3>
                    
                    <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 pb-20 mb-4">
                        <div className="text-center mb-4">
                            <div className="text-sm text-gray-600 mb-1">Amount to Transfer</div>
                            <div className="text-3xl font-bold text-orange-600">
                                {formatCurrency(JOB_LISTING_PRICE_IDR)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Job listing (until filled or deactivated)</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                                <div className="text-xs text-gray-500">Bank Name</div>
                                <div className="font-medium text-gray-900">{bankAccount.name}</div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                                <div className="text-xs text-gray-500">Account Number</div>
                                <div className="font-bold text-lg text-gray-900">{bankAccount.accountNumber}</div>
                            </div>
                            <button
                                onClick={() => copyToClipboard(bankAccount.accountNumber)}
                                className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 text-sm"
                            >
                                <Copy className="w-4 h-4" />
                                Copy
                            </button>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                                <div className="text-xs text-gray-500">Account Name</div>
                                <div className="font-medium text-gray-900">{bankAccount.accountName}</div>
                            </div>
                        </div>
                    </div>
                </div>
                )}

                {/* Upload payment proof */}
                {!proofSubmitted && !deactivated && (
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Upload className="w-5 h-5 text-orange-500" />
                            Upload payment proof
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">Transfer {formatCurrency(JOB_LISTING_PRICE_IDR)} to the bank account above, then upload a screenshot or photo of your payment confirmation. Admin will confirm soon.</p>
                        {paymentProofPreview ? (
                            <div className="relative inline-block">
                                <img src={paymentProofPreview} alt="Proof" className="max-h-40 rounded-lg border-2 border-gray-200" />
                                <button type="button" onClick={() => { setPaymentProof(null); setPaymentProofPreview(null); }} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"><X className="w-4 h-4" /></button>
                            </div>
                        ) : (
                            <label className="flex items-center justify-center gap-2 w-full py-4 px-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-50/50">
                                <Upload className="w-5 h-5 text-orange-500" />
                                <span className="text-sm font-medium text-gray-700">Choose image (JPG, PNG, max 5MB)</span>
                                <input type="file" accept="image/*" onChange={handleProofChange} className="hidden" />
                            </label>
                        )}
                        <button
                            type="button"
                            disabled={!paymentProof || uploading}
                            onClick={submitPaymentProof}
                            className="mt-4 w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-xl"
                        >
                            {uploading ? 'Submitting...' : 'Submit payment proof'}
                        </button>
                    </div>
                )}

                {/* Payment Instructions */}
                {!deactivated && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                    <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Payment instructions
                    </h3>
                    <ol className="space-y-2 text-sm text-blue-900">
                        <li className="flex gap-3">
                            <span className="font-bold flex-shrink-0">1.</span>
                            <span>Transfer <strong>{formatCurrency(JOB_LISTING_PRICE_IDR)}</strong> to the bank account above</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold flex-shrink-0">2.</span>
                            <span>Upload your payment proof above. Admin must approve all submissions.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold flex-shrink-0">3.</span>
                            <span>Admin will confirm soon. Your listing will go live after approval.</span>
                        </li>
                    </ol>
                    <div className="mt-4 pt-4 border-t border-blue-300">
                        <p className="text-sm text-blue-900 font-semibold flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            All payments are non-refundable
                        </p>
                    </div>
                </div>
                )}

                {/* Deactivate listing – position filled */}
                {proofSubmitted && !deactivated && (
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                        <h3 className="font-bold text-gray-900 mb-2">Manage listing</h3>
                        <p className="text-sm text-gray-600 mb-4">To close this job and stop applications, mark it as position filled.</p>
                        <button
                            type="button"
                            onClick={deactivateListing}
                            className="w-full py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50"
                        >
                            Deactivate listing (mark as Position Filled)
                        </button>
                    </div>
                )}

                {/* Note */}
                <div className="text-center text-sm text-gray-500 border-t pt-6">
                    <p>Need help? Contact us via WhatsApp or indastreet.id@gmail.com</p>
                </div>
            </div>

            {/* Navigation footer removed: GlobalFooter covers navigation; page keeps its own actions */}
        </div>
    );
};

export default JobPostingPaymentPage;

