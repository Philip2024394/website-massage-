/**
 * Place SafePass Application Page
 * Allows places (hotels, villas, etc.) to apply for SafePass certification
 */

import React, { useState, useEffect } from 'react';
import { Shield, Upload, CheckCircle, Clock, XCircle, FileText, AlertCircle, Info, Building } from 'lucide-react';
import safePassService from '../../services/safePassService';import { logger } from '../../utils/logger';import type { SafePassApplication } from '../../types/safepass.types';

interface PlaceSafePassApplicationProps {
    placeId: string;
    placeName: string;
}

const PlaceSafePassApplication: React.FC<PlaceSafePassApplicationProps> = ({
    placeId,
    placeName
}) => {
    const [existingApplication, setExistingApplication] = useState<SafePassApplication | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Form state
    const [paymentId, setPaymentId] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
    const [uploadingFiles, setUploadingFiles] = useState(false);

    useEffect(() => {
        loadExistingApplication();
    }, [placeId]);

    const loadExistingApplication = async () => {
        setLoading(true);
        try {
            const app = await safePassService.getApplicationByEntity('place', placeId);
            setExistingApplication(app);
        } catch (error) {
            console.error('Error loading application:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setUploadedFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const uploadFiles = async () => {
        if (uploadedFiles.length === 0) {
            alert('Please select at least one document to upload');
            return false;
        }

        setUploadingFiles(true);
        try {
            const urls: string[] = [];
            for (const file of uploadedFiles) {
                const url = await safePassService.uploadLetter(file);
                urls.push(url);
            }
            setUploadedUrls(urls);
            return true;
        } catch (error) {
            console.error('Error uploading files:', error);
            alert('Error uploading files. Please try again.');
            return false;
        } finally {
            setUploadingFiles(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (uploadedFiles.length === 0) {
            alert('Please upload at least one supporting document');
            return;
        }

        if (!paymentId.trim()) {
            alert('Please provide a payment reference ID');
            return;
        }

        setSubmitting(true);
        try {
            // Upload files first if not already uploaded
            let urls = uploadedUrls;
            if (uploadedUrls.length === 0) {
                const uploadSuccess = await uploadFiles();
                if (!uploadSuccess) {
                    setSubmitting(false);
                    return;
                }
                urls = uploadedUrls;
            }

            // Submit application
            await safePassService.submitApplication({
                entityType: 'place',
                entityId: placeId,
                entityName: placeName,
                hotelVillaLetters: urls,
                safePassPaymentId: paymentId
            });

            alert('SafePass application submitted successfully!');
            await loadExistingApplication();
            
            // Reset form
            setPaymentId('');
            setUploadedFiles([]);
            setUploadedUrls([]);
        } catch (error) {
            console.error('Error submitting application:', error);
            alert('Error submitting application. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusDisplay = () => {
        if (!existingApplication) return null;

        const status = existingApplication.hotelVillaSafePassStatus;

        switch (status) {
            case 'pending':
                return (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <div className="flex items-start gap-3">
                            <Clock className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-semibold text-yellow-900 mb-2">Application Under Review</h3>
                                <p className="text-yellow-800 text-sm">
                                    Your SafePass application is being reviewed by our admin team. 
                                    You will be notified once a decision is made.
                                </p>
                                <p className="text-yellow-700 text-xs mt-2">
                                    Submitted: {new Date(existingApplication.safePassSubmittedAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case 'approved':
                return (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-semibold text-blue-900 mb-2">Application Approved</h3>
                                <p className="text-blue-800 text-sm">
                                    Your SafePass application has been approved! 
                                    Your SafePass certification is being prepared and will be activated soon.
                                </p>
                                <p className="text-blue-700 text-xs mt-2">
                                    Approved: {new Date(existingApplication.safePassApprovedAt!).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case 'active':
                return (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <div className="flex items-start gap-3">
                            <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-green-900 mb-2">SafePass Active ✓</h3>
                                <p className="text-green-800 text-sm mb-3">
                                    Your SafePass is active! Your establishment is now certified to host professional 
                                    massage therapists with proper safety and quality standards.
                                </p>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-green-700">Issued:</span>
                                        <span className="ml-2 font-medium">
                                            {new Date(existingApplication.safePassIssuedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-green-700">Expires:</span>
                                        <span className="ml-2 font-medium">
                                            {new Date(existingApplication.safePassExpiry).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                {existingApplication.safePassCardUrl && (
                                    <a
                                        href={existingApplication.safePassCardUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        <FileText className="w-4 h-4" />
                                        View SafePass Certificate
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 'rejected':
                return (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <div className="flex items-start gap-3">
                            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-semibold text-red-900 mb-2">Application Rejected</h3>
                                <p className="text-red-800 text-sm mb-2">
                                    Unfortunately, your SafePass application was not approved.
                                </p>
                                {existingApplication.safePassRejectionReason && (
                                    <div className="bg-red-100 border border-red-300 rounded p-3 mt-3">
                                        <p className="text-red-900 text-sm">
                                            <strong>Reason:</strong> {existingApplication.safePassRejectionReason}
                                        </p>
                                    </div>
                                )}
                                <p className="text-red-700 text-xs mt-3">
                                    You can submit a new application after addressing the issues mentioned above.
                                </p>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    // Show status if application exists and is not rejected
    if (existingApplication && existingApplication.hotelVillaSafePassStatus !== 'rejected') {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <Building className="w-8 h-8 text-orange-600" />
                        <h1 className="text-3xl font-bold text-gray-900">SafePass Status</h1>
                    </div>
                    {getStatusDisplay()}
                </div>
            </div>
        );
    }

    // Show application form
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <Building className="w-8 h-8 text-orange-600" />
                    <h1 className="text-3xl font-bold text-gray-900">Apply for SafePass</h1>
                </div>

                {/* Info Card */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <div className="flex items-start gap-3">
                        <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="font-semibold text-blue-900 mb-2">What is SafePass for Places?</h3>
                            <p className="text-blue-800 text-sm mb-3">
                                SafePass certification ensures your establishment meets industry standards for hosting 
                                professional massage therapists. It provides assurance to both therapists and guests 
                                about safety, quality, and professional service delivery.
                            </p>
                            <ul className="text-blue-800 text-sm space-y-1">
                                <li>✓ Verified safe and professional environment</li>
                                <li>✓ Access to certified therapist network</li>
                                <li>✓ Enhanced guest satisfaction</li>
                                <li>✓ Valid for 2 years</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Show rejection status if exists */}
                {existingApplication && existingApplication.hotelVillaSafePassStatus === 'rejected' && (
                    <div className="mb-6">
                        {getStatusDisplay()}
                    </div>
                )}

                {/* Application Form */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Submit Application</h2>

                    <form onSubmit={handleSubmit}>
                        {/* Payment ID */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Payment Reference ID *
                            </label>
                            <input
                                type="text"
                                value={paymentId}
                                onChange={(e) => setPaymentId(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Enter payment transaction ID"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Transfer SafePass fee and enter your payment reference number
                            </p>
                        </div>

                        {/* Document Upload */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Supporting Documents *
                            </label>
                            <p className="text-xs text-gray-600 mb-3">
                                Upload required documents (business license, facility photos, safety certifications, etc.)
                            </p>
                            
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-600">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        PDF, JPG, PNG (max 10MB each)
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    multiple
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="hidden"
                                />
                            </label>

                            {/* Uploaded Files List */}
                            {uploadedFiles.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {uploadedFiles.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-gray-600" />
                                                <span className="text-sm text-gray-700">{file.name}</span>
                                                <span className="text-xs text-gray-500">
                                                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(index)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Requirements Checklist */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-medium text-gray-900 mb-3">Application Requirements:</h3>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                    <span>Valid payment proof for SafePass fee</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                    <span>Business license or registration certificate</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                    <span>Facility photos showing massage service areas</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                    <span>Safety and hygiene certifications</span>
                                </li>
                            </ul>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={submitting || uploadingFiles}
                            className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {submitting || uploadingFiles ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    {uploadingFiles ? 'Uploading documents...' : 'Submitting application...'}
                                </>
                            ) : (
                                <>
                                    <Shield className="w-5 h-5" />
                                    Submit SafePass Application
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PlaceSafePassApplication;
