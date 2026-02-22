// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
import React, { useState, useEffect, useCallback } from 'react';
import { Query, ID } from 'appwrite';
import { databases } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import { imageUploadService } from '../lib/appwriteService';

const DATABASE_ID = APPWRITE_CONFIG.databaseId;
const COLLECTIONS = APPWRITE_CONFIG.collections;

type SubmissionMode = 'jobOffer' | 'jobWanted';

interface TherapistJobListing {
    $id: string;
    therapistId: string;
    therapistName: string;
    listingId: number;
    jobTitle: string;
    jobDescription: string;
    availability: 'full-time' | 'part-time' | 'both' | string;
    minimumSalary: string;
    preferredLocations: string[] | string;
    accommodation?: 'required' | 'preferred' | 'not-required';
    specializations?: string[];
    languages?: string[];
    yearsOfExperience?: number;
    contactWhatsApp: string;
    isActive: boolean;
    profileImage?: string;
    experienceLevel?: 'Experienced' | 'Basic Skill' | 'Require Training';
    willingToRelocateDomestic: boolean;
    willingToRelocateInternational: boolean;
    $createdAt: string;
}

interface EmployerJobPosting {
    $id: string;
    employerId: string;
    jobTitle: string;
    jobDescription: string;
    employmentType: string;
    location: string;
    salaryRangeMin: number;
    salaryRangeMax: number;
    applicationDeadline?: string;
    businessName: string;
    businessType: string;
    numberOfPositions: number;
    accommodationProvided: boolean;
    requirements: string[];
    benefits: string[];
    contactWhatsApp: string;
    isActive: boolean;
    $createdAt: string;
    imageUrl?: string;
    transportationProvided?: string;
    country?: string;
    flightsPaidByEmployer?: boolean;
    visaArrangedByEmployer?: boolean;
}

interface BrowseJobsPageProps {
    onBack: () => void;
    onPostJob: () => void;
    t?: any;
}

interface SubmissionFormState {
    contactName: string;
    whatsapp: string;
    headline: string;
    location: string;
    description: string;
}

interface PendingPaymentState {
    paymentRecordId: string | null;
    submissionId: string;
    submissionType: SubmissionMode;
    submittedAt: string;
    deadline: string;
    status: 'awaiting-proof' | 'submitted' | 'expired';
    formSnapshot: SubmissionFormState;
    proofUrl?: string;
}

const PAYMENT_AMOUNT = 150000;
const PAYMENT_LOCAL_STORAGE_KEY = 'massage_jobs_payment_submission';
const BANK_DETAILS = {
    bank: 'BCA (Bank Central Asia)',
    accountNumber: '1234567890',
    accountName: 'IndaStreet Platform'
};

const initialSubmissionForm: SubmissionFormState = {
    contactName: '',
    whatsapp: '',
    headline: '',
    location: '',
    description: ''
};

const BrowseJobsPage: React.FC<BrowseJobsPageProps> = ({ onBack, onPostJob }) => {
    const [viewMode, setViewMode] = useState<'jobOffers' | 'jobWanted'>('jobOffers');
    const [therapistListings, setTherapistListings] = useState<TherapistJobListing[]>([]);
    const [employerPostings, setEmployerPostings] = useState<EmployerJobPosting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [submissionForm, setSubmissionForm] = useState<SubmissionFormState>(initialSubmissionForm);
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);
    const [isSubmittingForm, setIsSubmittingForm] = useState(false);
    const [pendingPayment, setPendingPayment] = useState<PendingPaymentState | null>(null);
    const [showPaymentPanel, setShowPaymentPanel] = useState(false);
    const [countdownLabel, setCountdownLabel] = useState('03:00:00');
    const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
    const [paymentStatusMessage, setPaymentStatusMessage] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isUploadingProof, setIsUploadingProof] = useState(false);

    const isJobOfferMode = viewMode === 'jobOffers';

    console.log('🔍 BrowseJobsPage mounted - viewMode:', viewMode);

    useEffect(() => {
        fetchListings();
    }, [viewMode]);

    const fetchListings = async () => {
        setIsLoading(true);
        try {
            if (viewMode === 'jobWanted') {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.therapistJobListings,
                    [
                        Query.equal('isActive', true),
                        Query.orderDesc('$createdAt'),
                        Query.limit(50)
                    ]
                );
                setTherapistListings(response.documents as unknown as TherapistJobListing[]);
            } else {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.employerJobPostings,
                    [
                        Query.equal('isActive', true),
                        Query.orderDesc('$createdAt'),
                        Query.limit(50)
                    ]
                );
                setEmployerPostings(response.documents as unknown as EmployerJobPosting[]);
            }
        } catch (error) {
            console.error('Error fetching job listings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        try {
            const cached = localStorage.getItem(PAYMENT_LOCAL_STORAGE_KEY);
            if (!cached) return;
            const parsed = JSON.parse(cached) as PendingPaymentState;
            setPendingPayment(parsed);
        } catch (error) {
            console.error('Failed to parse cached payment submission:', error);
            localStorage.removeItem(PAYMENT_LOCAL_STORAGE_KEY);
        }
    }, []);

    useEffect(() => {
        if (pendingPayment) {
            localStorage.setItem(PAYMENT_LOCAL_STORAGE_KEY, JSON.stringify(pendingPayment));
            setShowPaymentPanel(true);
        } else {
            localStorage.removeItem(PAYMENT_LOCAL_STORAGE_KEY);
        }
    }, [pendingPayment]);

    const expireSubmission = useCallback(async () => {
        if (!pendingPayment || pendingPayment.status !== 'awaiting-proof') return;

        setPendingPayment(prev => prev ? { ...prev, status: 'expired' } : prev);

        try {
            if (pendingPayment.paymentRecordId) {
                await databases.updateDocument(
                    DATABASE_ID,
                    COLLECTIONS.paymentTransactions,
                    pendingPayment.paymentRecordId,
                    {
                        status: 'auto_deactivated',
                        autoDeactivatedAt: new Date().toISOString()
                    }
                );
            }
        } catch (error) {
            console.error('Error auto-deactivating submission:', error);
        }
    }, [pendingPayment]);

    useEffect(() => {
        if (!pendingPayment || pendingPayment.status !== 'awaiting-proof') {
            setCountdownLabel('00:00:00');
            return;
        }

        const updateCountdown = () => {
            const diff = new Date(pendingPayment.deadline).getTime() - Date.now();
            if (diff <= 0) {
                setCountdownLabel('00:00:00');
                expireSubmission();
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            setCountdownLabel([
                hours.toString().padStart(2, '0'),
                minutes.toString().padStart(2, '0'),
                seconds.toString().padStart(2, '0')
            ].join(':'));
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [pendingPayment, expireSubmission]);

    useEffect(() => {
        const syncPaymentRecord = async () => {
            if (!pendingPayment?.paymentRecordId) return;

            try {
                const record = await databases.getDocument(
                    DATABASE_ID,
                    COLLECTIONS.paymentTransactions,
                    pendingPayment.paymentRecordId
                );

                const remoteStatus = (record as any)?.status as string | undefined;
                const remoteProof = (record as any)?.paymentProofUrl as string | undefined;

                if (remoteStatus && remoteStatus.toLowerCase().includes('submitted') && pendingPayment.status !== 'submitted') {
                    setPendingPayment(prev => prev ? { ...prev, status: 'submitted', proofUrl: remoteProof || prev.proofUrl } : prev);
                }
            } catch (error) {
                console.error('Unable to sync payment submission:', error);
            }
        };

        syncPaymentRecord();
    }, [pendingPayment?.paymentRecordId]);

    const filteredTherapistListings = therapistListings.filter(listing =>
        listing.therapistName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.jobDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (listing.specializations || []).some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filteredEmployerPostings = employerPostings.filter(posting =>
        posting.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        posting.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        posting.jobDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        posting.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatSalary = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const describePreferredLocations = (value: string[] | string | undefined) => {
        if (!value || (Array.isArray(value) && value.length === 0)) {
            return 'Open to relocation';
        }
        return Array.isArray(value) ? value.join(', ') : value;
    };

    const handleContactWhatsApp = (whatsapp: string, name: string, context: 'job' | 'therapist') => {
        const audio = new Audio('/sounds/booking-notification.mp3');
        audio.volume = 0.3;
        audio.play().catch(err => console.log('Sound play failed:', err));

        const sanitized = whatsapp.replace(/\D/g, '');
        const message = context === 'job'
            ? `Hi ${name}, I'm interested in your massage job posting on IndaStreet.`
            : `Hi ${name}, I'm interested in hiring you for a massage role I found on IndaStreet.`;
        window.open(`https://wa.me/${sanitized}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handleFormInputChange = (field: keyof SubmissionFormState, value: string) => {
        setSubmissionForm(prev => ({ ...prev, [field]: value }));
    };

    const validateSubmissionForm = () => {
        if (!submissionForm.contactName.trim()) return 'Please provide a contact name.';
        if (!submissionForm.whatsapp.trim()) return 'Please provide a WhatsApp number.';
        if (!submissionForm.headline.trim()) return 'Add a short headline for your listing.';
        if (!submissionForm.location.trim()) return 'Share your preferred location.';
        if (!submissionForm.description.trim()) return 'Describe what you offer or what you are looking for.';
        return null;
    };

    const handleSubmitListing = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError(null);
        setFormSuccess(null);

        const validationError = validateSubmissionForm();
        if (validationError) {
            setFormError(validationError);
            return;
        }

        setIsSubmittingForm(true);

        const submissionId = `JOB-${Date.now().toString(36).toUpperCase()}`;
        const submittedAt = new Date().toISOString();
        const deadline = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();
        const submissionType: SubmissionMode = isJobOfferMode ? 'jobOffer' : 'jobWanted';

        try {
            const payload = {
                submissionId,
                listingType: submissionType,
                status: 'awaiting_proof',
                paymentAmount: PAYMENT_AMOUNT,
                paymentCurrency: 'IDR',
                paymentDeadline: deadline,
                submissionSource: 'massage_jobs_page',
                contactName: submissionForm.contactName,
                whatsappNumber: submissionForm.whatsapp,
                listingHeadline: submissionForm.headline,
                listingLocation: submissionForm.location,
                listingDescription: submissionForm.description,
                autoDeactivateAt: deadline,
                submittedAt
            };

            const record = await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.paymentTransactions,
                ID.unique(),
                payload
            );

            const newPending: PendingPaymentState = {
                paymentRecordId: record.$id,
                submissionId,
                submissionType,
                submittedAt,
                deadline,
                status: 'awaiting-proof',
                formSnapshot: submissionForm
            };

            setPendingPayment(newPending);
            setSubmissionForm(initialSubmissionForm);
            setPaymentProofFile(null);
            setPaymentStatusMessage(null);
            setUploadError(null);
            setCountdownLabel('03:00:00');
            setFormSuccess('Listing submitted. Complete the payment within 3 hours to keep it live.');
        } catch (error) {
            console.error('Failed to create payment submission:', error);
            setFormError('Unable to create submission. Please try again in a moment.');
        } finally {
            setIsSubmittingForm(false);
        }
    };

    const handleProofFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUploadError(null);
        const file = event.target.files?.[0];
        if (file) {
            setPaymentProofFile(file);
        }
    };

    const handleUploadPaymentProof = async () => {
        if (!pendingPayment) {
            setUploadError('No active submission found.');
            return;
        }
        if (pendingPayment.status !== 'awaiting-proof') {
            setUploadError('Payment proof already submitted or the submission expired.');
            return;
        }
        if (!paymentProofFile) {
            setUploadError('Please select an image of your payment receipt.');
            return;
        }
        if (!pendingPayment.paymentRecordId) {
            setUploadError('Cannot find the payment record. Please start a new submission.');
            return;
        }

        setIsUploadingProof(true);
        setUploadError(null);

        try {
            const proofUrl = await imageUploadService.uploadImage(paymentProofFile, 'job-payment-proofs');

            await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.paymentTransactions,
                pendingPayment.paymentRecordId,
                {
                    paymentProofUrl: proofUrl,
                    proofUploadedAt: new Date().toISOString(),
                    status: 'submitted'
                }
            );

            setPendingPayment(prev => prev ? { ...prev, status: 'submitted', proofUrl } : prev);
            setPaymentProofFile(null);
            setPaymentStatusMessage('Payment proof uploaded. Our team will verify it shortly.');
        } catch (error) {
            console.error('Error uploading payment proof:', error);
            setUploadError('Failed to upload payment proof. Please try again.');
        } finally {
            setIsUploadingProof(false);
        }
    };

    const handleResetPaymentFlow = () => {
        setPendingPayment(null);
        setPaymentProofFile(null);
        setPaymentStatusMessage(null);
        setUploadError(null);
        setCountdownLabel('03:00:00');
    };

    const searchPlaceholder = isJobOfferMode
        ? 'Search available massage job offers...'
        : 'Search therapists looking for jobs...';

    const listingsToRender = isJobOfferMode ? filteredEmployerPostings : filteredTherapistListings;
    const totalListings = listingsToRender.length;

    const heroSubtitle = isJobOfferMode
        ? 'Share credible massage vacancies and request payment proof without leaving this page.'
        : 'Therapists who are ready to work can spotlight themselves and upload proof within 3 hours.';

    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-white">
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 rounded-xl border border-amber-200 hover:bg-amber-50 transition-colors"
                        >
                            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-gray-600">Lowongan Pijat</p>
                            <h1 className="text-3xl font-bold text-black">Massage Jobs Exchange</h1>
                            <p className="text-sm text-gray-600">{heroSubtitle}</p>
                        </div>
                        <div className="ml-auto">
                            <button
                                onClick={onPostJob}
                                className="px-4 py-2 rounded-xl border border-amber-200 text-sm font-semibold text-amber-600 hover:bg-amber-50"
                            >
                                Open Advanced Posting Form
                            </button>
                        </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => setViewMode('jobOffers')}
                            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                                isJobOfferMode
                                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                                    : 'bg-gray-100 text-gray-600 hover:text-black'
                            }`}
                        >
                            Job Offers
                        </button>
                        <button
                            onClick={() => setViewMode('jobWanted')}
                            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                                !isJobOfferMode
                                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                                    : 'bg-gray-100 text-gray-600 hover:text-black'
                            }`}
                        >
                            Job Wanted
                        </button>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl bg-slate-900 text-white p-4">
                            <p className="text-xs uppercase tracking-widest text-white/60">Listing Fee</p>
                            <p className="text-2xl font-semibold mt-1">{formatSalary(PAYMENT_AMOUNT)}</p>
                            <p className="text-xs text-white/70">Verified manually after payment proof</p>
                        </div>
                        <div className="rounded-2xl bg-white border border-slate-200 p-4">
                            <p className="text-xs uppercase tracking-widest text-slate-500">Live Listings</p>
                            <p className="text-2xl font-semibold text-slate-900 mt-1">{totalListings}</p>
                            <p className="text-xs text-slate-500">Active {isJobOfferMode ? 'job offers' : 'job seekers'}</p>
                        </div>
                        <div className="rounded-2xl bg-white border border-slate-200 p-4">
                            <p className="text-xs uppercase tracking-widest text-slate-500">Auto Deactivate</p>
                            <p className="text-2xl font-semibold text-slate-900 mt-1">3 Hours</p>
                            <p className="text-xs text-slate-500">Upload proof before countdown ends</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8 space-y-10">
                <section>
                    <label className="text-sm font-semibold text-slate-600">Search Marketplace</label>
                    <div className="relative mt-2">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 pl-12 text-slate-800 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                        />
                        <svg className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-2">
                    <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Submit Listing</p>
                                <h2 className="text-xl font-bold text-slate-900 mt-1">{isJobOfferMode ? 'Post a Massage Job Offer' : 'Promote Yourself to Employers'}</h2>
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-900/5 text-slate-600">Rp 150.000</span>
                        </div>

                        <p className="text-sm text-slate-500 mt-2">Fill the short brief below. After submission, complete the payment proof step to keep the listing visible.</p>

                        <form className="mt-6 space-y-4" onSubmit={handleSubmitListing}>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Contact Name</label>
                                <input
                                    type="text"
                                    value={submissionForm.contactName}
                                    onChange={(e) => handleFormInputChange('contactName', e.target.value)}
                                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 focus:border-slate-900 focus:outline-none"
                                    placeholder="Business or Therapist Name"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">WhatsApp Number</label>
                                <input
                                    type="tel"
                                    value={submissionForm.whatsapp}
                                    onChange={(e) => handleFormInputChange('whatsapp', e.target.value)}
                                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 focus:border-slate-900 focus:outline-none"
                                    placeholder="6281xxxx"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Headline</label>
                                <input
                                    type="text"
                                    value={submissionForm.headline}
                                    onChange={(e) => handleFormInputChange('headline', e.target.value)}
                                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 focus:border-slate-900 focus:outline-none"
                                    placeholder={isJobOfferMode ? 'Example: Spa Therapist in Seminyak' : 'Example: Senior Therapist seeking Bali placement'}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Location / Coverage</label>
                                <input
                                    type="text"
                                    value={submissionForm.location}
                                    onChange={(e) => handleFormInputChange('location', e.target.value)}
                                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 focus:border-slate-900 focus:outline-none"
                                    placeholder="City, Island, or Country"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Description</label>
                                <textarea
                                    value={submissionForm.description}
                                    onChange={(e) => handleFormInputChange('description', e.target.value)}
                                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 focus:border-slate-900 focus:outline-none"
                                    rows={4}
                                    placeholder={isJobOfferMode ? 'Share the role, benefits, salary range, and expectations.' : 'Share your skills, experience, and relocation ability.'}
                                />
                            </div>

                            {formError && <p className="text-sm text-red-600">{formError}</p>}
                            {formSuccess && <p className="text-sm text-emerald-600">{formSuccess}</p>}

                            <button
                                type="submit"
                                disabled={isSubmittingForm}
                                className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-opacity disabled:opacity-50"
                            >
                                {isSubmittingForm ? 'Submitting...' : 'Submit & Start Payment Window'}
                            </button>
                        </form>
                    </div>

                    <div className={`relative overflow-hidden rounded-3xl ${showPaymentPanel ? 'bg-slate-900 text-white' : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white'} shadow-xl`}>
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top,_#ffffff,_transparent_60%)]"></div>
                        <div className="relative p-6 space-y-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.3em] text-white/60">Payment Proof</p>
                                    <h3 className="text-2xl font-bold">Activation Center</h3>
                                </div>
                                {pendingPayment && (
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        pendingPayment.status === 'awaiting-proof'
                                            ? 'bg-amber-400/20 text-amber-200'
                                            : pendingPayment.status === 'submitted'
                                                ? 'bg-emerald-400/20 text-emerald-200'
                                                : 'bg-rose-400/20 text-rose-200'
                                    }`}>
                                        {pendingPayment.status.replace('-', ' ')}
                                    </span>
                                )}
                            </div>

                            {pendingPayment ? (
                                <>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <p className="text-xs uppercase tracking-widest text-white/60">Submission ID</p>
                                            <p className="text-lg font-semibold">{pendingPayment.submissionId}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-widest text-white/60">Time Remaining</p>
                                            <p className={`text-2xl font-semibold ${pendingPayment.status === 'awaiting-proof' ? 'text-amber-200' : 'text-emerald-200'}`}>
                                                {pendingPayment.status === 'awaiting-proof' ? countdownLabel : pendingPayment.status === 'submitted' ? 'Waiting Review' : 'Expired'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <p className="text-xs uppercase tracking-widest text-white/60">Amount</p>
                                            <p className="text-2xl font-semibold">{formatSalary(PAYMENT_AMOUNT)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-widest text-white/60">Deadline</p>
                                            <p className="text-base">{new Date(pendingPayment.deadline).toLocaleString('id-ID')}</p>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl bg-white/10 p-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Bank</span>
                                            <span className="font-semibold">{BANK_DETAILS.bank}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Account Number</span>
                                            <span className="font-semibold">{BANK_DETAILS.accountNumber}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Account Name</span>
                                            <span className="font-semibold">{BANK_DETAILS.accountName}</span>
                                        </div>
                                    </div>

                                    {pendingPayment.status === 'awaiting-proof' ? (
                                        <>
                                            <div>
                                                <label className="text-sm font-medium text-white/80">Upload Proof</label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleProofFileChange}
                                                    className="mt-2 w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-2 text-sm text-white"
                                                />
                                            </div>
                                            <button
                                                onClick={handleUploadPaymentProof}
                                                disabled={isUploadingProof}
                                                className="w-full rounded-2xl bg-white/10 py-3 text-sm font-semibold backdrop-blur disabled:opacity-40"
                                            >
                                                {isUploadingProof ? 'Uploading...' : 'Upload & Submit Proof'}
                                            </button>
                                        </>
                                    ) : (
                                        <div className="rounded-2xl bg-white/10 p-4 text-sm">
                                            {pendingPayment.status === 'submitted'
                                                ? 'Payment proof received. We will verify your listing within 12 hours.'
                                                : 'Submission expired. Start a new listing to reopen the payment window.'}
                                        </div>
                                    )}

                                    {(pendingPayment.status === 'submitted' || pendingPayment.status === 'expired') && (
                                        <button
                                            onClick={handleResetPaymentFlow}
                                            className="w-full rounded-2xl border border-white/30 py-3 text-sm font-semibold"
                                        >
                                            Start New Submission
                                        </button>
                                    )}

                                    {paymentStatusMessage && <p className="text-sm text-emerald-200">{paymentStatusMessage}</p>}
                                    {uploadError && <p className="text-sm text-rose-200">{uploadError}</p>}
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-sm text-white/80">Each listing costs Rp 150.000. After submitting the form, upload your bank transfer proof within 3 hours or the listing deactivates automatically.</p>
                                    <ul className="space-y-2 text-sm text-white/80">
                                        <li>• Submit the short form to generate a Submission ID.</li>
                                        <li>• Transfer to the official IndaStreet account above.</li>
                                        <li>• Upload payment proof in PNG/JPG format.</li>
                                        <li>• Verification happens within 12 hours.</li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Marketplace Feed</p>
                            <h2 className="text-2xl font-bold text-slate-900">{isJobOfferMode ? 'Massage Job Offers' : 'Therapists Seeking Jobs'}</h2>
                            <p className="text-sm text-slate-500">{totalListings} live {isJobOfferMode ? 'vacancies' : 'profiles'} ready for review.</p>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="py-20 text-center">
                            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"></div>
                            <p className="mt-4 text-sm text-slate-500">Loading listings...</p>
                        </div>
                    ) : listingsToRender.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center">
                            <p className="text-lg font-semibold text-slate-600">No listings match your filters</p>
                            <p className="text-sm text-slate-500">Try switching modes or clearing the search term.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {isJobOfferMode
                                ? filteredEmployerPostings.map(posting => (
                                    <div key={posting.$id} className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                                        <div className="flex flex-col lg:flex-row">
                                            <div className="lg:w-2/5 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white p-6 space-y-4">
                                                <div>
                                                    <p className="text-xs uppercase tracking-widest text-white/60">Position</p>
                                                    <h3 className="text-2xl font-semibold">{posting.jobTitle}</h3>
                                                </div>
                                                <div>
                                                    <p className="text-xs uppercase text-white/60">Hiring Company</p>
                                                    <p className="text-lg font-semibold">{posting.businessName}</p>
                                                    <p className="text-sm text-white/80">{posting.location}{posting.country ? `, ${posting.country}` : ''}</p>
                                                </div>
                                                <div className="flex flex-wrap gap-2 text-xs uppercase">
                                                    <span className="rounded-full bg-white/10 px-3 py-1">{posting.employmentType}</span>
                                                    {posting.accommodationProvided && <span className="rounded-full bg-white/10 px-3 py-1">Accommodation</span>}
                                                    {posting.flightsPaidByEmployer && <span className="rounded-full bg-white/10 px-3 py-1">Flights</span>}
                                                    {posting.visaArrangedByEmployer && <span className="rounded-full bg-white/10 px-3 py-1">Visa</span>}
                                                </div>
                                                <p className="text-sm text-white/80 line-clamp-3">{posting.jobDescription}</p>
                                            </div>
                                            <div className="flex-1 p-6 space-y-6">
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-500">Salary Range</p>
                                                        <p className="text-base font-semibold text-slate-900">{formatSalary(posting.salaryRangeMin)} - {formatSalary(posting.salaryRangeMax)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-500">Application Deadline</p>
                                                        <p className="text-base text-slate-700">{posting.applicationDeadline ? new Date(posting.applicationDeadline).toLocaleDateString('id-ID') : 'Rolling'}</p>
                                                    </div>
                                                </div>
                                                {posting.requirements?.length > 0 && (
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-500 mb-2">Top Requirements</p>
                                                        <div className="flex flex-wrap gap-2 text-xs">
                                                            {posting.requirements.slice(0, 4).map((item, idx) => (
                                                                <span key={idx} className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{item}</span>
                                                            ))}
                                                            {posting.requirements.length > 4 && <span className="rounded-full bg-slate-50 px-3 py-1 text-slate-500">+{posting.requirements.length - 4} more</span>}
                                                        </div>
                                                    </div>
                                                )}
                                                {posting.benefits?.length > 0 && (
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-500 mb-2">Benefits</p>
                                                        <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                                                            {posting.benefits.slice(0, 3).map((benefit, idx) => (
                                                                <li key={idx}>{benefit}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 bg-slate-50 px-6 py-4">
                                            <div className="text-sm text-slate-500">Posted {new Date(posting.$createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                            <button
                                                onClick={() => handleContactWhatsApp(posting.contactWhatsApp, posting.businessName, 'job')}
                                                className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30"
                                            >
                                                Apply via WhatsApp
                                            </button>
                                        </div>
                                    </div>
                                )) : filteredTherapistListings.map(listing => (
                                    <div key={listing.$id} className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
                                        <div className="flex flex-col lg:flex-row">
                                            <div className="lg:w-2/5 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-6 space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-semibold">
                                                        {listing.therapistName?.charAt(0) || 'T'}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-semibold">{listing.therapistName}</h3>
                                                        <p className="text-sm text-white/80">{listing.jobTitle}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-2 text-xs uppercase">
                                                    <span className="rounded-full bg-white/10 px-3 py-1">{listing.availability}</span>
                                                    {listing.experienceLevel && <span className="rounded-full bg-white/10 px-3 py-1">{listing.experienceLevel}</span>}
                                                    {listing.willingToRelocateInternational && <span className="rounded-full bg-white/10 px-3 py-1">International</span>}
                                                </div>
                                                <p className="text-sm text-white/80 line-clamp-3">{listing.jobDescription}</p>
                                            </div>
                                            <div className="flex-1 p-6 space-y-6">
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-500">Expected Salary</p>
                                                        <p className="text-base font-semibold text-slate-900">{listing.minimumSalary || 'Negotiable'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-500">Preferred Locations</p>
                                                        <p className="text-sm text-slate-700">{describePreferredLocations(listing.preferredLocations)}</p>
                                                    </div>
                                                </div>
                                                {listing.specializations && listing.specializations.length > 0 && (
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-500 mb-2">Key Skills</p>
                                                        <div className="flex flex-wrap gap-2 text-xs">
                                                            {listing.specializations.slice(0, 4).map((skill, idx) => (
                                                                <span key={idx} className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">{skill}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {listing.languages && listing.languages.length > 0 && (
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-500 mb-2">Languages</p>
                                                        <div className="flex flex-wrap gap-2 text-xs">
                                                            {listing.languages.slice(0, 3).map((lang, idx) => (
                                                                <span key={idx} className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{lang}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-500">Experience</p>
                                                        <p className="text-base text-slate-700">{listing.yearsOfExperience ? `${listing.yearsOfExperience} years` : 'Not specified'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-500">Relocation</p>
                                                        <p className="text-base text-slate-700">{listing.willingToRelocateInternational ? 'International' : listing.willingToRelocateDomestic ? 'Domestic' : 'Local only'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-emerald-100 bg-emerald-50 px-6 py-4">
                                            <div className="text-sm text-emerald-700">Updated {new Date(listing.$createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                            <button
                                                onClick={() => handleContactWhatsApp(listing.contactWhatsApp, listing.therapistName, 'therapist')}
                                                className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30"
                                            >
                                                Contact via WhatsApp
                                            </button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default BrowseJobsPage;

