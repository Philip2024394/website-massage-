import React, { useState, useEffect } from 'react';
import { Briefcase, CheckCircle, XCircle, Clock, Eye, DollarSign, MapPin, Calendar, User, Mail, Phone, Search, Filter, Edit2, Save, X } from 'lucide-react';
import { databases } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';

interface JobPosting {
    $id: string;
    jobTitle: string;
    businessName: string;
    city: string;
    country: string;
    status: string;
    postedDate: string;
    contactEmail: string;
    contactPhone?: string;
    contactPerson: string;
    salaryMin?: string;
    salaryMax?: string;
    selectedplanprice?: string;
    whatsappsent?: boolean;
    whatsappsentat?: string;
    jobDescription: string;
    businessType: string;
    workType: string;
    employmentType: string;
    numberOfPositions: number;
    massagetypes?: string[];
    requirements?: string[];
    benefits?: string[];
    imageurl?: string;
}

const AdminJobPostingsPage: React.FC = () => {
    const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editedJob, setEditedJob] = useState<JobPosting | null>(null);

    useEffect(() => {
        fetchJobPostings();
    }, []);

    const fetchJobPostings = async () => {
        try {
            setIsLoading(true);
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.employerJobPostings || 'employer_job_postings'
            );
            
            // Sort by posted date, newest first
            const sortedJobs = response.documents.sort((a: any, b: any) => 
                new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
            );
            
            setJobPostings(sortedJobs as unknown as JobPosting[]);
        } catch (error) {
            console.error('Error fetching job postings:', error);
            alert('Failed to load job postings');
        } finally {
            setIsLoading(false);
        }
    };

    const updateJobStatus = async (jobId: string, newStatus: string) => {
        try {
            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.employerJobPostings || 'employer_job_postings',
                jobId,
                { status: newStatus }
            );
            
            alert(`Job ${newStatus === 'active' ? 'approved' : 'rejected'} successfully!`);
            fetchJobPostings();
            setSelectedJob(null);
        } catch (error) {
            console.error('Error updating job status:', error);
            alert('Failed to update job status');
        }
    };

    const saveEditedJob = async () => {
        if (!editedJob) return;
        
        try {
            const updateData: any = {
                jobTitle: editedJob.jobTitle,
                businessName: editedJob.businessName,
                jobDescription: editedJob.jobDescription,
                city: editedJob.city,
                country: editedJob.country,
                contactPerson: editedJob.contactPerson,
                contactEmail: editedJob.contactEmail,
                businessType: editedJob.businessType,
                workType: editedJob.workType,
                employmentType: editedJob.employmentType,
                numberOfPositions: editedJob.numberOfPositions,
            };

            // Add optional fields if they exist
            if (editedJob.contactPhone) updateData.contactPhone = editedJob.contactPhone;
            if (editedJob.salaryMin) updateData.salaryMin = editedJob.salaryMin;
            if (editedJob.salaryMax) updateData.salaryMax = editedJob.salaryMax;
            if (editedJob.imageurl) updateData.imageurl = editedJob.imageurl;
            if (editedJob.massagetypes && editedJob.massagetypes.length > 0) updateData.massagetypes = editedJob.massagetypes;
            if (editedJob.requirements && editedJob.requirements.length > 0) updateData.requirements = editedJob.requirements;
            if (editedJob.benefits && editedJob.benefits.length > 0) updateData.benefits = editedJob.benefits;

            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.employerJobPostings || 'employer_job_postings',
                editedJob.$id,
                updateData
            );
            
            alert('Job updated successfully!');
            setIsEditing(false);
            setEditedJob(null);
            fetchJobPostings();
            setSelectedJob(null);
        } catch (error) {
            console.error('Error updating job:', error);
            alert('Failed to update job');
        }
    };

    const startEditing = (job: JobPosting) => {
        setEditedJob({ ...job });
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setEditedJob(null);
    };

    const getFilteredJobs = () => {
        let filtered = jobPostings;
        
        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(job => job.status === filterStatus);
        }
        
        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(job => 
                job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.city.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        return filtered;
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending_payment':
                return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Pending Payment
                </span>;
            case 'active':
                return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Active
                </span>;
            case 'rejected':
                return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Rejected
                </span>;
            default:
                return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">
                    {status}
                </span>;
        }
    };

    const filteredJobs = getFilteredJobs();
    const pendingCount = jobPostings.filter(j => j.status === 'pending_payment').length;
    const activeCount = jobPostings.filter(j => j.status === 'active').length;

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border-2 border-yellow-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-yellow-600 text-sm font-medium">Pending Review</p>
                            <p className="text-3xl font-bold text-yellow-900">{pendingCount}</p>
                        </div>
                        <Clock className="w-12 h-12 text-yellow-500" />
                    </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-600 text-sm font-medium">Active Jobs</p>
                            <p className="text-3xl font-bold text-green-900">{activeCount}</p>
                        </div>
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-600 text-sm font-medium">Total Jobs</p>
                            <p className="text-3xl font-bold text-blue-900">{jobPostings.length}</p>
                        </div>
                        <Briefcase className="w-12 h-12 text-blue-500" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by job title, business, or city..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                    </div>
                    
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="pending_payment">Pending Payment</option>
                            <option value="active">Active</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Job Listings */}
            {isLoading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading job postings...</p>
                </div>
            ) : filteredJobs.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
                    <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No job postings found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredJobs.map((job) => (
                        <div 
                            key={job.$id} 
                            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold text-gray-900">{job.jobTitle}</h3>
                                        {getStatusBadge(job.status)}
                                    </div>
                                    <p className="text-gray-600 font-medium">{job.businessName}</p>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {job.city}, {job.country}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(job.postedDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                
                                {job.imageurl && (
                                    <img 
                                        src={job.imageurl} 
                                        alt={job.jobTitle}
                                        className="w-24 h-24 object-cover rounded-lg ml-4"
                                    />
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">{job.contactPerson}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">{job.contactEmail}</span>
                                </div>
                                {job.contactPhone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">{job.contactPhone}</span>
                                    </div>
                                )}
                            </div>

                            {job.selectedplanprice && (
                                <div className="flex items-center gap-2 mb-4 bg-green-50 px-3 py-2 rounded-lg w-fit">
                                    <DollarSign className="w-4 h-4 text-green-600" />
                                    <span className="text-green-700 font-semibold">Plan: Rp {parseInt(job.selectedplanprice).toLocaleString('id-ID')}</span>
                                </div>
                            )}

                            {job.whatsappsent && job.whatsappsentat && (
                                <div className="bg-blue-50 px-3 py-2 rounded-lg mb-4 text-sm">
                                    <p className="text-blue-700">
                                        ✅ Payment proof sent via WhatsApp: {new Date(job.whatsappsentat).toLocaleString()}
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedJob(job)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                                >
                                    <Eye className="w-4 h-4" />
                                    View Details
                                </button>
                                
                                {job.status === 'pending_payment' && (
                                    <>
                                        <button
                                            onClick={() => updateJobStatus(job.$id, 'active')}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => updateJobStatus(job.$id, 'rejected')}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Reject
                                        </button>
                                    </>
                                )}
                                
                                {job.status === 'active' && (
                                    <button
                                        onClick={() => updateJobStatus(job.$id, 'pending_payment')}
                                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                                    >
                                        <Clock className="w-4 h-4" />
                                        Set Pending
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Details Modal */}
            {selectedJob && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {isEditing ? 'Edit Job' : 'Job Details'}
                            </h2>
                            <div className="flex items-center gap-2">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={saveEditedJob}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                                        >
                                            <Save className="w-4 h-4" />
                                            Save
                                        </button>
                                        <button
                                            onClick={cancelEditing}
                                            className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => startEditing(selectedJob)}
                                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setSelectedJob(null);
                                        setIsEditing(false);
                                        setEditedJob(null);
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            {/* Image Section */}
                            {isEditing && editedJob ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                                    <input
                                        type="text"
                                        value={editedJob.imageurl || ''}
                                        onChange={(e) => setEditedJob({ ...editedJob, imageurl: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                        placeholder="Enter image URL"
                                    />
                                    {editedJob.imageurl && (
                                        <img 
                                            src={editedJob.imageurl} 
                                            alt="Preview"
                                            className="mt-2 w-full h-64 object-cover rounded-lg"
                                        />
                                    )}
                                </div>
                            ) : (
                                selectedJob.imageurl && (
                                    <img 
                                        src={selectedJob.imageurl} 
                                        alt={selectedJob.jobTitle}
                                        className="w-full h-64 object-cover rounded-lg"
                                    />
                                )
                            )}
                            
                            {/* Job Title & Business Info */}
                            <div>
                                {isEditing && editedJob ? (
                                    <>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                                        <input
                                            type="text"
                                            value={editedJob.jobTitle}
                                            onChange={(e) => setEditedJob({ ...editedJob, jobTitle: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 mb-3"
                                        />
                                        
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
                                        <input
                                            type="text"
                                            value={editedJob.businessName}
                                            onChange={(e) => setEditedJob({ ...editedJob, businessName: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 mb-3"
                                        />
                                        
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
                                        <input
                                            type="text"
                                            value={editedJob.businessType}
                                            onChange={(e) => setEditedJob({ ...editedJob, businessType: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <h3 className="font-bold text-xl text-gray-900 mb-2">{selectedJob.jobTitle}</h3>
                                        <p className="text-gray-600 font-medium mb-1">{selectedJob.businessName}</p>
                                        <p className="text-gray-500">{selectedJob.businessType}</p>
                                    </>
                                )}
                            </div>

                            {/* Work Details */}
                            {isEditing && editedJob ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Work Type</label>
                                        <input
                                            type="text"
                                            value={editedJob.workType}
                                            onChange={(e) => setEditedJob({ ...editedJob, workType: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type</label>
                                        <input
                                            type="text"
                                            value={editedJob.employmentType}
                                            onChange={(e) => setEditedJob({ ...editedJob, employmentType: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Positions</label>
                                        <input
                                            type="number"
                                            value={editedJob.numberOfPositions}
                                            onChange={(e) => setEditedJob({ ...editedJob, numberOfPositions: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                        <input
                                            type="text"
                                            value={editedJob.city}
                                            onChange={(e) => setEditedJob({ ...editedJob, city: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                                        <input
                                            type="text"
                                            value={editedJob.country}
                                            onChange={(e) => setEditedJob({ ...editedJob, country: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Work Type</p>
                                        <p className="font-medium">{selectedJob.workType}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Employment Type</p>
                                        <p className="font-medium">{selectedJob.employmentType}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Positions</p>
                                        <p className="font-medium">{selectedJob.numberOfPositions}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Location</p>
                                        <p className="font-medium">{selectedJob.city}, {selectedJob.country}</p>
                                    </div>
                                </div>
                            )}

                            {/* Salary */}
                            {isEditing && editedJob ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Min Salary</label>
                                        <input
                                            type="text"
                                            value={editedJob.salaryMin || ''}
                                            onChange={(e) => setEditedJob({ ...editedJob, salaryMin: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                            placeholder="e.g., 3000000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Max Salary</label>
                                        <input
                                            type="text"
                                            value={editedJob.salaryMax || ''}
                                            onChange={(e) => setEditedJob({ ...editedJob, salaryMax: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                            placeholder="e.g., 5000000"
                                        />
                                    </div>
                                </div>
                            ) : (
                                (selectedJob.salaryMin || selectedJob.salaryMax) && (
                                    <div>
                                        <p className="text-gray-500 text-sm mb-1">Salary Range</p>
                                        <p className="font-medium">
                                            {selectedJob.salaryMin && `Rp ${parseInt(selectedJob.salaryMin).toLocaleString('id-ID')}`}
                                            {selectedJob.salaryMin && selectedJob.salaryMax && ' - '}
                                            {selectedJob.salaryMax && `Rp ${parseInt(selectedJob.salaryMax).toLocaleString('id-ID')}`}
                                        </p>
                                    </div>
                                )
                            )}

                            {/* Job Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
                                {isEditing && editedJob ? (
                                    <textarea
                                        value={editedJob.jobDescription}
                                        onChange={(e) => setEditedJob({ ...editedJob, jobDescription: e.target.value })}
                                        rows={6}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    />
                                ) : (
                                    <p className="text-gray-700 whitespace-pre-wrap">{selectedJob.jobDescription}</p>
                                )}
                            </div>

                            {selectedJob.massagetypes && selectedJob.massagetypes.length > 0 && (
                                <div>
                                    <p className="text-gray-500 text-sm mb-2">Massage Types Required</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedJob.massagetypes.map((type, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                                                {type}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                                <div>
                                    <p className="text-gray-500 text-sm mb-2">Requirements</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        {selectedJob.requirements.map((req, idx) => (
                                            <li key={idx} className="text-gray-700">{req}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                                <div>
                                    <p className="text-gray-500 text-sm mb-2">Benefits</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        {selectedJob.benefits.map((benefit, idx) => (
                                            <li key={idx} className="text-gray-700">{benefit}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Contact Information */}
                            <div className="border-t pt-4">
                                <h4 className="font-bold text-gray-900 mb-3">Contact Information</h4>
                                {isEditing && editedJob ? (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                                            <input
                                                type="text"
                                                value={editedJob.contactPerson}
                                                onChange={(e) => setEditedJob({ ...editedJob, contactPerson: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                            <input
                                                type="email"
                                                value={editedJob.contactEmail}
                                                onChange={(e) => setEditedJob({ ...editedJob, contactEmail: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                            <input
                                                type="text"
                                                value={editedJob.contactPhone || ''}
                                                onChange={(e) => setEditedJob({ ...editedJob, contactPhone: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2 text-sm">
                                        <p><span className="text-gray-500">Contact Person:</span> {selectedJob.contactPerson}</p>
                                        <p><span className="text-gray-500">Email:</span> {selectedJob.contactEmail}</p>
                                        {selectedJob.contactPhone && (
                                            <p><span className="text-gray-500">Phone:</span> {selectedJob.contactPhone}</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-bold text-gray-900 mb-2">Payment Status</h4>
                                {getStatusBadge(selectedJob.status)}
                                {selectedJob.selectedplanprice && (
                                    <p className="mt-2 text-sm">Plan Price: <span className="font-semibold">Rp {parseInt(selectedJob.selectedplanprice).toLocaleString('id-ID')}</span></p>
                                )}
                                {selectedJob.whatsappsent && selectedJob.whatsappsentat && (
                                    <p className="mt-2 text-sm text-green-600">
                                        ✅ Payment proof sent: {new Date(selectedJob.whatsappsentat).toLocaleString()}
                                    </p>
                                )}
                            </div>

                            {selectedJob.status === 'pending_payment' && (
                                <div className="flex gap-2 pt-4 border-t">
                                    <button
                                        onClick={() => {
                                            updateJobStatus(selectedJob.$id, 'active');
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Approve Job Posting
                                    </button>
                                    <button
                                        onClick={() => {
                                            updateJobStatus(selectedJob.$id, 'rejected');
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
                                    >
                                        <XCircle className="w-5 h-5" />
                                        Reject Job Posting
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminJobPostingsPage;
