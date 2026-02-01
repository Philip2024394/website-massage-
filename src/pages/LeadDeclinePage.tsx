// 🎯 AUTO-FIXED: Mobile scroll architecture violations (3 fixes)
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, AlertTriangle } from 'lucide-react';
import { leadGenerationService } from '../lib/appwriteService';

const LeadDeclinePage: React.FC = () => {
    const { leadId } = useParams<{ leadId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
    
    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    useEffect(() => {
        checkLead();
    }, [leadId]);

    const checkLead = async () => {
        if (!leadId || !token) {
            setResult({ success: false, message: 'Invalid lead URL' });
            setLoading(false);
            return;
        }

        setLoading(false);
    };

    const handleDecline = async () => {
        if (!leadId || !token) return;

        setProcessing(true);
        try {
            const response = await leadGenerationService.declineLead(leadId, token);
            setResult(response);
            
            if (response.success) {
                // Show success for 3 seconds then close
                setTimeout(() => {
                    if (window.opener) {
                        window.close();
                    } else {
                        navigate('/');
                    }
                }, 3000);
            }
        } catch (error) {
            setResult({ success: false, message: 'Error processing decline' });
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
                <div className="text-center">
                    <Loader className="w-12 h-12 text-gray-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (result) {
        return (
            <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                    {result.success ? (
                        <>
                            <CheckCircle className="w-20 h-20 text-blue-500 mx-auto mb-4" />
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Lead Declined
                            </h1>
                            <p className="text-gray-600 mb-6">
                                {result.message}
                            </p>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-blue-800 font-medium">
                                    ✓ No charges applied
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                    Customer will be notified and offered an alternative
                                </p>
                            </div>
                            <p className="text-sm text-gray-500">
                                This window will close automatically in 3 seconds...
                            </p>
                        </>
                    ) : (
                        <>
                            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Error
                            </h1>
                            <p className="text-gray-600 mb-6">
                                {result.message}
                            </p>
                            <button
                                onClick={() => window.close()}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Close Window
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-yellow-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Decline This Lead?
                    </h1>
                    <p className="text-gray-600">
                        Confirm that you cannot accept this booking
                    </p>
                </div>

                {/* Information */}
                <div className="bg-gray-50 rounded-xl p-6 mb-6 space-y-3">
                    <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">No charge for declining</span>
                    </div>
                    <div className="flex items-start gap-2 text-blue-600">
                        <CheckCircle className="w-5 h-5 mt-0.5" />
                        <span className="text-sm">Customer will be notified and offered an alternative provider</span>
                    </div>
                    <div className="flex items-start gap-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 mt-0.5" />
                        <span className="text-sm">Lead will be marked as declined in your history</span>
                    </div>
                </div>

                {/* Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> Frequent declines may affect your future lead priority.
                        Only decline if you truly cannot fulfill this booking.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <button
                        onClick={handleDecline}
                        disabled={processing}
                        className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold py-4 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {processing ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <XCircle className="w-5 h-5" />
                                Confirm Decline
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => navigate(`/lead/accept/${leadId}?token=${token}`)}
                        disabled={processing}
                        className="flex-1 bg-green-500 text-white font-bold py-4 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Go Back
                    </button>
                </div>

                <p className="text-xs text-center text-gray-500 mt-4">
                    You can close this window without taking action
                </p>
            </div>
        </div>
    );
};

export default LeadDeclinePage;
