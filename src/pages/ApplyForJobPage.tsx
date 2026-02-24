// Apply for Job – Flow-based application with home header, CV upload, submission ref
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Briefcase, MapPin, Send, CheckCircle, FileText, AlertCircle, Lightbulb } from 'lucide-react';
import { databases, Query } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import { containsContactSpam, CONTACT_SPAM_MESSAGE_EN } from '../utils/contactSpam';
import UniversalHeader from '../components/shared/UniversalHeader';
import { AppDrawer } from '../components/AppDrawerClean';

interface ApplyForJobPageProps {
    jobId: string;
    onBack: () => void;
    onNavigate?: (page: string) => void;
    language?: string;
    onLanguageChange?: (lang: string) => void;
    onMassageJobsClick?: () => void;
    onTermsClick?: () => void;
    onPrivacyClick?: () => void;
    therapists?: any[];
    places?: any[];
}

interface JobDetails {
    $id: string;
    jobTitle: string;
    businessName: string;
    location?: string;
    employmentType?: string;
    jobDescription?: string;
    salaryRangeMin?: number;
    salaryRangeMax?: number;
    contactWhatsApp?: string;
    employerId?: string;
    userId?: string;
    [key: string]: any;
}

const APPLY_FOR_JOB_STORAGE_KEY = 'indastreet_apply_for_job_id';
const COLLECTION = APPWRITE_CONFIG.collections.employerJobPostings || 'employer_job_postings';
const POSITION_FILLED_BADGE_URL = 'https://ik.imagekit.io/7grri5v7d/position%20filled.png?updatedAt=1771076784587';

function generateSubmissionRef(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const r = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `APP-${y}${m}${day}-${r}`;
}

const ApplyForJobPage: React.FC<ApplyForJobPageProps> = ({
    jobId: jobIdProp,
    onBack,
    onNavigate,
    language = 'id',
    onLanguageChange,
    onMassageJobsClick,
    onTermsClick,
    onPrivacyClick,
    therapists = [],
    places = [],
}) => {
    const jobId = jobIdProp || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(APPLY_FOR_JOB_STORAGE_KEY) : null) || '';
    const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
    const [employerPostCount, setEmployerPostCount] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [showApplicationSentModal, setShowApplicationSentModal] = useState(false);
    const [submissionRef, setSubmissionRef] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        coverLetter: '',
        experience: '',
        specialties: '',
        cvFile: null as File | null,
    });

    useEffect(() => {
        if (jobId) fetchJobDetails();
        else setIsLoading(false);
    }, [jobId]);

    useEffect(() => {
        return () => {
            try { sessionStorage.removeItem(APPLY_FOR_JOB_STORAGE_KEY); } catch (_) {}
        };
    }, []);

    const fetchJobDetails = async () => {
        try {
            const response = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                COLLECTION,
                jobId
            ) as unknown as JobDetails;
            setJobDetails(response);
            const employerId = response.employerId || response.userId || (response as any).employer_id;
            if (employerId) {
                try {
                    const list = await databases.listDocuments(
                        APPWRITE_CONFIG.databaseId,
                        COLLECTION,
                        [Query.equal('employerId', employerId), Query.limit(500)]
                    );
                    const alt = await databases.listDocuments(
                        APPWRITE_CONFIG.databaseId,
                        COLLECTION,
                        [Query.equal('userId', employerId), Query.limit(500)]
                    );
                    const count = Math.max(list?.total ?? 0, alt?.total ?? 0);
                    setEmployerPostCount(count);
                } catch (_) {
                    setEmployerPostCount(null);
                }
            }
        } catch (error) {
            console.error('Error fetching job details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatSalary = (amount: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (containsContactSpam(formData.experience) || containsContactSpam(formData.specialties) || containsContactSpam(formData.coverLetter)) {
            alert(CONTACT_SPAM_MESSAGE_EN);
            return;
        }
        const ref = generateSubmissionRef();
        setSubmissionRef(ref);
        const cvNote = formData.cvFile ? `\n*CV:* ${formData.cvFile.name} (attached)` : '';
        const msg = `Hi, I'm interested in the *${jobDetails?.jobTitle || 'position'}* at *${jobDetails?.businessName || 'your company'}*.\n\n` +
            `*Reference:* ${ref}\n` +
            `*Name:* ${formData.name}\n` +
            `*Email:* ${formData.email}\n` +
            `*Phone:* ${formData.phone}\n` +
            (formData.experience ? `*Experience:* ${formData.experience}\n` : '') +
            (formData.specialties ? `*Specialties:* ${formData.specialties}\n` : '') +
            (formData.coverLetter ? `*Message:* ${formData.coverLetter}\n` : '') +
            cvNote +
            `\nI found this opportunity on IndaStreet.`;
        const wa = formData.phone || jobDetails?.contactWhatsApp || (jobDetails as any)?.contactPhone || '';
        const clean = wa.replace(/\D/g, '');
        const num = clean.startsWith('62') ? clean : clean.startsWith('0') ? '62' + clean.slice(1) : '62' + clean;
        window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank');
        setSubmitted(true);
        setShowApplicationSentModal(true);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <UniversalHeader language={language} onLanguageChange={onLanguageChange} onMenuClick={() => setIsMenuOpen(true)} onHomeClick={() => onNavigate?.('home')} showHomeButton={true} />
                {isMenuOpen && (
                    <AppDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} language={language} onNavigate={onNavigate}
                        onMassageJobsClick={onMassageJobsClick} onTermsClick={onTermsClick} onPrivacyClick={onPrivacyClick} therapists={therapists} places={places} t={{}} />
                )}
                <div className="flex-1 flex items-center justify-center pt-24">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4" />
                        <p className="text-slate-600">Loading job details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!jobDetails) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <UniversalHeader language={language} onLanguageChange={onLanguageChange} onMenuClick={() => setIsMenuOpen(true)} onHomeClick={() => onNavigate?.('home')} showHomeButton={true} />
                {isMenuOpen && (
                    <AppDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} language={language} onNavigate={onNavigate}
                        onMassageJobsClick={onMassageJobsClick} onTermsClick={onTermsClick} onPrivacyClick={onPrivacyClick} therapists={therapists} places={places} t={{}} />
                )}
                <div className="flex-1 flex items-center justify-center p-6 pt-24 text-center">
                    <p className="text-slate-600 mb-4">Job not found or no longer available.</p>
                    <button onClick={onBack} className="px-6 py-2.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600">
                        Back to Jobs
                    </button>
                </div>
            </div>
        );
    }

    const isPositionFilled = (jobDetails as any).status === 'filled';
    if (isPositionFilled) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <UniversalHeader language={language} onLanguageChange={onLanguageChange} onMenuClick={() => setIsMenuOpen(true)} onHomeClick={() => onNavigate?.('home')} showHomeButton={true} />
                {isMenuOpen && (
                    <AppDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} language={language} onNavigate={onNavigate}
                        onMassageJobsClick={onMassageJobsClick} onTermsClick={onTermsClick} onPrivacyClick={onPrivacyClick} therapists={therapists} places={places} t={{}} />
                )}
                <div className="flex-1 flex items-center justify-center p-6 pt-24 text-center">
                    <img src={POSITION_FILLED_BADGE_URL} alt="Position filled" className="h-20 w-auto mx-auto mb-4 object-contain" />
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">Position filled</h2>
                    <p className="text-slate-600 mb-6">This position is no longer accepting applications.</p>
                    <button onClick={onBack} className="px-6 py-2.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600">
                        Back to Jobs
                    </button>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <UniversalHeader language={language} onLanguageChange={onLanguageChange} onMenuClick={() => setIsMenuOpen(true)} onHomeClick={() => onNavigate?.('home')} showHomeButton={true} />
                {isMenuOpen && (
                    <AppDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} language={language} onNavigate={onNavigate}
                        onMassageJobsClick={onMassageJobsClick} onTermsClick={onTermsClick} onPrivacyClick={onPrivacyClick} therapists={therapists} places={places} t={{}} />
                )}
                {showApplicationSentModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowApplicationSentModal(false)}>
                        <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center" onClick={(e) => e.stopPropagation()}>
                            <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Application sent</h3>
                            <p className="text-slate-600 text-sm mb-6">
                                Your application has been sent to the employer. They will normally contact you within 72 hours. IndaStreet is here to help you find roles that fit your career—browse more listings anytime.
                            </p>
                            <button onClick={() => setShowApplicationSentModal(false)} className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl">
                                OK
                            </button>
                        </div>
                    </div>
                )}
                <main className="flex-1 px-4 sm:px-6 pt-24 pb-12 max-w-xl mx-auto w-full">
                    <div className="text-center py-8">
                        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Apply Today</h1>
                        <p className="text-sm text-slate-600 mb-4">
                            Best of luck. Employers are waiting for your application. Don&apos;t waste time—apply today.
                        </p>
                        {submissionRef && (
                            <p className="text-sm font-mono text-slate-700 bg-slate-100 px-4 py-2 rounded-lg inline-block mb-6">
                                {submissionRef}
                            </p>
                        )}
                        <button onClick={onBack} className="px-6 py-2.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600">
                            Back to job listings
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    const jobImageUrl = (jobDetails as any).imageurl || (jobDetails as any).imageUrl || 'https://ik.imagekit.io/7grri5v7d/massage%20villa%20service%20indonisea.png?updatedAt=1761583264188';
    const isFirstPost = employerPostCount !== null && employerPostCount <= 1;

    return (
        <div className="min-h-screen bg-slate-50">
            <UniversalHeader
                language={language}
                onLanguageChange={onLanguageChange as (lang: string) => void}
                onMenuClick={() => setIsMenuOpen(true)}
                onHomeClick={() => onNavigate?.('home')}
                showHomeButton={true}
            />
            {isMenuOpen && (
                <AppDrawer
                    isOpen={isMenuOpen}
                    onClose={() => setIsMenuOpen(false)}
                    language={language}
                    onNavigate={onNavigate}
                    onMassageJobsClick={onMassageJobsClick}
                    onTermsClick={onTermsClick}
                    onPrivacyClick={onPrivacyClick}
                    therapists={therapists}
                    places={places}
                    t={{}}
                />
            )}

            <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-16 space-y-8">
                {/* Job listing ref – back to listings */}
                <div>
                    <button
                        type="button"
                        onClick={onBack}
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Ref: {jobId}
                    </button>
                </div>

                {/* Job role & employer – flow section */}
                <section className="space-y-3">
                    <div className="relative w-full aspect-[21/9] min-h-[180px] rounded-xl overflow-hidden bg-slate-200">
                        <img src={jobImageUrl} alt={jobDetails.businessName} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
                            <h1 className="text-xl sm:text-2xl font-bold drop-shadow-sm">
                                Apply for this position
                            </h1>
                            <p className="text-sm sm:text-base text-white/95 mt-0.5">
                                {jobDetails.jobTitle} at {jobDetails.businessName}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-orange-600">{jobDetails.jobTitle}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-sm text-slate-600">{jobDetails.businessName}</span>
                        {employerPostCount !== null && (
                            <>
                                <span className="text-slate-400">·</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${isFirstPost ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'}`}>
                                    {isFirstPost ? 'Employer’s first post' : `Employer has posted before (${employerPostCount} post${employerPostCount === 1 ? '' : 's'})`}
                                </span>
                            </>
                        )}
                    </div>
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {jobDetails.location || '—'}
                    </p>
                    {(jobDetails.salaryRangeMin != null || jobDetails.salaryRangeMax != null) && (
                        <p className="text-sm text-slate-600">
                            {formatSalary(jobDetails.salaryRangeMin || 0)} – {formatSalary(jobDetails.salaryRangeMax || 0)}
                        </p>
                    )}
                    {jobDetails.jobDescription && (
                        <p className="text-sm text-slate-600 line-clamp-4">{jobDetails.jobDescription}</p>
                    )}
                </section>

                {/* First impressions & CV advice – flow section */}
                <section className="space-y-3 border-l-4 border-orange-400 pl-4 py-2 bg-orange-50/50 rounded-r-lg">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                        First impressions last
                    </h2>
                    <p className="text-sm text-slate-700 leading-relaxed">
                        Submitting as much relevant information helps the employer make a decision. Your CV is important—it’s the first step of any successful interview. If presented well, it will normally lead to an interview. Please upload your CV and fill in the form below.
                    </p>
                </section>

                {/* Recommendations */}
                <section className="space-y-3">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-amber-500" />
                        Tips for your application
                    </h2>
                    <ul className="text-sm text-slate-700 space-y-2 list-none">
                        <li className="flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">•</span>
                            <span>Use one contact number only—the number you give will be used for WhatsApp. Use a number you check often so the employer can reach you.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">•</span>
                            <span>Use a professional email address; avoid nicknames or shared family inboxes.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">•</span>
                            <span>Tailor your cover letter to this role and business; mention the job title and why you’re a good fit.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">•</span>
                            <span>Keep your CV to 1–2 pages and name the file clearly (e.g. YourName_CV.pdf).</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">•</span>
                            <span>List specific experience and techniques (e.g. years, types of massage, languages) so employers can see your fit quickly.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">•</span>
                            <span>Double-check spelling and your contact number before submitting—one mistake can cost you a callback.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">•</span>
                            <span>After submitting, save your reference number so you can follow up with the employer.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">•</span>
                            <span>Reply promptly if the employer contacts you; it shows you’re serious and organised.</span>
                        </li>
                    </ul>
                </section>

                {/* Application form – flow */}
                <section className="space-y-5">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-orange-500" />
                        Your application
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full name *</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                                placeholder="Your full name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                                placeholder="your@email.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Contact number (phone / WhatsApp) *</label>
                            <input
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                                placeholder="e.g. 08123456789 — employer will contact you on this number"
                            />
                        </div>

                        {/* CV upload */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-orange-500" />
                                Upload CV (PDF or Word)
                            </label>
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => setFormData({ ...formData, cvFile: e.target.files?.[0] || null })}
                                className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-orange-100 file:text-orange-700 file:font-semibold hover:file:bg-orange-200"
                            />
                            {formData.cvFile && (
                                <p className="mt-1 text-xs text-slate-500">Selected: {formData.cvFile.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Experience</label>
                            <input
                                type="text"
                                value={formData.experience}
                                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                                placeholder="e.g. 5 years, Balinese massage, spa experience"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Specialties / Massage types</label>
                            <input
                                type="text"
                                value={formData.specialties}
                                onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                                placeholder="e.g. Deep Tissue, Swedish, Hot Stone"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Cover letter / Message</label>
                            <textarea
                                rows={4}
                                value={formData.coverLetter}
                                onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                                placeholder="Introduce yourself and why you're a good fit..."
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            <Send className="w-5 h-5" />
                            Submit application via WhatsApp
                        </button>
                        <p className="text-sm text-slate-500 text-center mt-3 leading-relaxed">
                            Job listings are updated weekly. Choosing wisely is the key to a long career with an establishment that fits your requirements ideally.
                        </p>
                    </form>
                </section>
            </main>
        </div>
    );
};

export default ApplyForJobPage;
