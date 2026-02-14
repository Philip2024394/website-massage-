// Apply for Job – Candidates apply to employer job postings (premium card style)
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Briefcase, MapPin, Send, CheckCircle } from 'lucide-react';
import { databases } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';

const cardClass = 'rounded-[20px] shadow-lg border border-slate-200/80 bg-white';

interface ApplyForJobPageProps {
    jobId: string;
    onBack: () => void;
    onNavigate?: (page: string) => void;
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
    [key: string]: any;
}

const ApplyForJobPage: React.FC<ApplyForJobPageProps> = ({ jobId, onBack, onNavigate }) => {
    const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        whatsapp: '',
        coverLetter: '',
        experience: '',
        specialties: '',
    });

    useEffect(() => {
        if (jobId) fetchJobDetails();
    }, [jobId]);

    const fetchJobDetails = async () => {
        try {
            const response = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.employerJobPostings || 'employer_job_postings',
                jobId
            );
            setJobDetails(response as unknown as JobDetails);
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
        const msg = `Hi, I'm interested in the *${jobDetails?.jobTitle || 'position'}* at *${jobDetails?.businessName || 'your company'}*.\n\n` +
            `*Name:* ${formData.name}\n` +
            `*Email:* ${formData.email}\n` +
            `*Phone:* ${formData.phone}\n` +
            (formData.experience ? `*Experience:* ${formData.experience}\n` : '') +
            (formData.specialties ? `*Specialties:* ${formData.specialties}\n` : '') +
            (formData.coverLetter ? `*Message:* ${formData.coverLetter}\n` : '') +
            `\nI found this opportunity on IndaStreet.`;
        
        const wa = formData.whatsapp || formData.phone || jobDetails?.contactWhatsApp || '';
        const clean = wa.replace(/\D/g, '');
        const num = clean.startsWith('62') ? clean : clean.startsWith('0') ? '62' + clean.slice(1) : '62' + clean;
        window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank');
        setSubmitted(true);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading job details...</p>
                </div>
            </div>
        );
    }

    if (!jobDetails) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <header className="p-4 bg-white border-b border-slate-200 flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-700" />
                    </button>
                    <h1 className="text-xl font-bold text-slate-900">Apply for Job</h1>
                </header>
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className={cardClass + ' p-8 text-center max-w-md'}>
                        <p className="text-slate-600 mb-4">Job not found or no longer available.</p>
                        <button onClick={onBack} className="px-6 py-2.5 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600">
                            Back to Jobs
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <header className="p-4 bg-white border-b border-slate-200 flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-700" />
                    </button>
                    <h1 className="text-xl font-bold text-slate-900">Application Sent</h1>
                </header>
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className={cardClass + ' p-8 text-center max-w-md'}>
                        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Application Submitted</h2>
                        <p className="text-slate-600 mb-6">WhatsApp has been opened with your application details. Send the message to complete your application.</p>
                        <button onClick={onBack} className="px-6 py-2.5 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600">
                            Back to Jobs
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const jobImageUrl = (jobDetails as any).imageurl || (jobDetails as any).imageUrl || 'https://ik.imagekit.io/7grri5v7d/massage%20villa%20service%20indonisea.png?updatedAt=1761583264188';

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="p-4 bg-white border-b border-slate-200 sticky top-0 z-10 flex items-center gap-3">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-700" />
                </button>
                <h1 className="text-xl font-bold text-slate-900">Apply for Job</h1>
            </header>

            <main className="max-w-2xl mx-auto p-4 pb-12 space-y-6">
                {/* Job summary card – same style as job cards */}
                <div className={cardClass + ' overflow-hidden'}>
                    <div className="relative w-full h-40 overflow-hidden bg-slate-100">
                        <img src={jobImageUrl} alt={jobDetails.businessName} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-5">
                        <h2 className="text-lg font-bold text-slate-900 mb-1">{jobDetails.businessName}</h2>
                        <p className="text-sm text-slate-600 mb-2 flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            {jobDetails.location || '—'}
                        </p>
                        <p className="text-base font-semibold text-primary-600 mb-2">{jobDetails.jobTitle}</p>
                        <p className="text-sm text-slate-600 mb-2">
                            {jobDetails.employmentType?.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            {(jobDetails.salaryRangeMin || jobDetails.salaryRangeMax) && (
                                <span> • {formatSalary(jobDetails.salaryRangeMin || 0)} – {formatSalary(jobDetails.salaryRangeMax || 0)}</span>
                            )}
                        </p>
                        <p className="text-sm text-slate-600 line-clamp-3">{jobDetails.jobDescription}</p>
                    </div>
                </div>

                {/* Application form */}
                <div className={cardClass + ' p-6'}>
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-primary-500" />
                        Your Application
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
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
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                                placeholder="your@email.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                            <input
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                                placeholder="08123456789"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp (for employer contact)</label>
                            <input
                                type="tel"
                                value={formData.whatsapp}
                                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                                placeholder="Same as phone or different"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Experience</label>
                            <input
                                type="text"
                                value={formData.experience}
                                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                                placeholder="e.g. 5 years, Balinese massage, spa experience"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Specialties / Massage types</label>
                            <input
                                type="text"
                                value={formData.specialties}
                                onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                                placeholder="e.g. Deep Tissue, Swedish, Hot Stone"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Cover letter / Message</label>
                            <textarea
                                rows={4}
                                value={formData.coverLetter}
                                onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                                placeholder="Introduce yourself and why you're a good fit..."
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            <Send className="w-5 h-5" />
                            Submit Application via WhatsApp
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default ApplyForJobPage;
