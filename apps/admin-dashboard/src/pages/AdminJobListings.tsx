// @ts-nocheck - Admin Job Listings - Work Marketplace management
import React, { useState, useEffect } from 'react';
import { RefreshCw, Building2, User, CheckCircle, ArrowLeft } from 'lucide-react';
import { databases, DATABASE_ID, COLLECTIONS } from '../lib/appwrite';
import { Query } from 'appwrite';

interface AdminJobListingsProps {
    onBack: () => void;
}

const AdminJobListings: React.FC<AdminJobListingsProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<'employers' | 'therapists'>('employers');
    const [employerJobs, setEmployerJobs] = useState<any[]>([]);
    const [therapistListings, setTherapistListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [jobsRes, listingsRes] = await Promise.all([
                databases.listDocuments(DATABASE_ID, COLLECTIONS.employerJobPostings, [Query.orderDesc('$createdAt'), Query.limit(100)]),
                databases.listDocuments(DATABASE_ID, COLLECTIONS.therapistJobListings, [Query.orderDesc('$createdAt'), Query.limit(100)])
            ]);
            setEmployerJobs(jobsRes.documents);
            setTherapistListings(listingsRes.documents);
        } catch (error) {
            console.error('Error loading job listings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const activateEmployerJob = async (jobId: string) => {
        if (!confirm('Activate this job posting? It will become visible to therapists.')) return;
        setProcessing(jobId);
        try {
            await databases.updateDocument(DATABASE_ID, COLLECTIONS.employerJobPostings, jobId, {
                status: 'active'
            });
            await loadData();
        } catch (error) {
            console.error('Error activating job:', error);
            alert('Failed to activate job');
        } finally {
            setProcessing(null);
        }
    };

    const activateTherapistListing = async (listingId: string) => {
        if (!confirm('Activate this therapist listing? It will appear in Find Professionals.')) return;
        setProcessing(listingId);
        try {
            await databases.updateDocument(DATABASE_ID, COLLECTIONS.therapistJobListings, listingId, {
                isActive: true
            });
            await loadData();
        } catch (error) {
            console.error('Error activating listing:', error);
            alert('Failed to activate listing');
        } finally {
            setProcessing(null);
        }
    };

    const formatDate = (d: string) => d ? new Date(d).toLocaleDateString() : '-';

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b px-4 py-3">
                <div className="flex items-center justify-between max-w-6xl mx-auto">
                    <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                        <ArrowLeft className="w-5 h-5" />
                        Back
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900">Job Listings</h1>
                    <button onClick={loadData} disabled={loading} className="p-2 hover:bg-gray-100 rounded-lg">
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </header>

            <div className="max-w-6xl mx-auto p-4">
                <div className="flex gap-2 mb-6 bg-white rounded-lg p-1 shadow-sm">
                    <button
                        onClick={() => setActiveTab('employers')}
                        className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${activeTab === 'employers' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <Building2 className="w-4 h-4 inline-block mr-2" />
                        Employer Jobs ({employerJobs.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('therapists')}
                        className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${activeTab === 'therapists' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <User className="w-4 h-4 inline-block mr-2" />
                        Therapist Listings ({therapistListings.length})
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <RefreshCw className="w-12 h-12 animate-spin mx-auto text-gray-400" />
                        <p className="mt-2 text-gray-500">Loading...</p>
                    </div>
                ) : activeTab === 'employers' ? (
                    <div className="space-y-4">
                        {employerJobs.length === 0 ? (
                            <p className="text-center py-12 text-gray-500">No employer job postings yet</p>
                        ) : (
                            employerJobs.map((job) => (
                                <div key={job.$id} className="bg-white rounded-xl shadow-sm border p-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 truncate">{job.jobTitle}</h3>
                                            <p className="text-sm text-gray-600">{job.businessName}</p>
                                            <p className="text-xs text-gray-500 mt-1">{job.city}, {job.country}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                                    job.status === 'active' ? 'bg-green-100 text-green-700' :
                                                    job.status === 'pending_payment' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {job.status || 'unknown'}
                                                </span>
                                                <span className="text-xs text-gray-500">{formatDate(job.postedDate || job.$createdAt)}</span>
                                            </div>
                                        </div>
                                        {job.status === 'pending_payment' && (
                                            <button
                                                onClick={() => activateEmployerJob(job.$id)}
                                                disabled={processing === job.$id}
                                                className="flex-shrink-0 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {processing === job.$id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                                Activate
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {therapistListings.length === 0 ? (
                            <p className="text-center py-12 text-gray-500">No therapist listings yet</p>
                        ) : (
                            therapistListings.map((listing) => (
                                <div key={listing.$id} className="bg-white rounded-xl shadow-sm border p-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 truncate">{listing.therapistName}</h3>
                                            <p className="text-sm text-gray-600">{listing.jobTitle}</p>
                                            <p className="text-xs text-gray-500 mt-1">{listing.preferredLocations || '-'}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                                    listing.isActive ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {listing.isActive ? 'Active' : 'Pending'}
                                                </span>
                                                <span className="text-xs text-gray-500">{formatDate(listing.listingDate || listing.$createdAt)}</span>
                                            </div>
                                        </div>
                                        {!listing.isActive && (
                                            <button
                                                onClick={() => activateTherapistListing(listing.$id)}
                                                disabled={processing === listing.$id}
                                                className="flex-shrink-0 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {processing === listing.$id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                                Activate
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminJobListings;
