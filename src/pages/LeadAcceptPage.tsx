// 🎯 AUTO-FIXED: Mobile scroll architecture violations (3 fixes)
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, DollarSign, Clock, User, Phone, MapPin, Calendar, MessageCircle } from 'lucide-react';
import { leadGenerationService } from '../lib/appwriteService';

const LeadAcceptPage: React.FC = () => {
    const { leadId } = useParams<{ leadId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string; lead?: any } | null>(null);
    const [lead, setLead] = useState<any>(null);
    
    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    useEffect(() => {
        loadLeadDetails();
    }, [leadId]);

    const loadLeadDetails = async () => {
        if (!leadId || !token) {
            setResult({ success: false, message: 'Invalid lead URL' });
            setLoading(false);
            return;
        }

        try {
            // Load lead details to show confirmation
            const leadData = await leadGenerationService.getMemberLeads(leadId);
            if (leadData.length > 0) {
                setLead(leadData[0]);
            }
        } catch (error) {
            console.error('Error loading lead:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async () => {
        if (!leadId || !token) return;

        setProcessing(true);
        try {
            const response = await leadGenerationService.acceptLead(leadId, token);
            setResult(response);
            
            if (response.success) {
                // Show success for 3 seconds then redirect
                setTimeout(() => {
                    // Close window or navigate back
                    if (window.opener) {
                        window.close();
                    } else {
                        navigate('/');
                    }
                }, 5000);
            }
        } catch (error) {
            setResult({ success: false, message: 'Error processing acceptance' });
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
                <div className="text-center">
                    <Loader className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading lead details...</p>
                </div>
            </div>
        );
    }

    if (result) {
        return (
            <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                    {result.success ? (
                        <>
                            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Lead Accepted!
                            </h1>
                            <p className="text-gray-600 mb-6">
                                {result.message}
                            </p>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-green-800 font-medium mb-2">
                                    ✅ Lead Accepted - Commission Details:
                                </p>
                                <ul className="text-xs text-green-700 space-y-1 mb-3">
                                    <li>• <strong>Amount Due:</strong> Rp {result.lead?.leadCost?.toLocaleString() || '0'} (25% commission)</li>
                                    <li>• <strong>Payment Deadline:</strong> Within 7 days of month-end invoice</li>
                                    <li>• <strong>Invoice Date:</strong> 1st of next month</li>
                                </ul>
                                <p className="text-xs text-green-600 border-t border-green-200 pt-2">
                                    📱 Customer has been notified and will contact you shortly via WhatsApp
                                </p>
                            </div>
                            <p className="text-sm text-gray-500">
                                This window will close automatically in 5 seconds...
                            </p>
                        </>
                    ) : (
                        <>
                            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Cannot Accept Lead
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
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <DollarSign className="w-8 h-8 text-orange-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Accept Booking Lead?
                    </h1>
                    <p className="text-gray-600">
                        Review the details below before accepting
                    </p>
                </div>

                {lead && (
                    <>
                        {/* Lead Details */}
                        <div className="bg-gray-50 rounded-xl p-6 mb-6 space-y-4">
                            <div className="flex items-start gap-3">
                                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500">Customer</p>
                                    <p className="font-semibold text-gray-900">{lead.customerName}</p>
                                </div>
                            </div>

                            {/* 🔒 PRIVACY: Customer WhatsApp REMOVED - therapists use in-app chat only */}
                            <div className="flex items-start gap-3">
                                <MessageCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500">Communication</p>
                                    <p className="font-semibold text-blue-900">Use in-app chat system</p>
                                </div>
                            </div>

                            {lead.customerLocation && (
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-500">Location</p>
                                        <p className="font-semibold text-gray-900">{lead.customerLocation}</p>
                                        {lead.hotelVillaName && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                {lead.hotelVillaName} {lead.roomNumber && `- Room ${lead.roomNumber}`}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500">Requested Time</p>
                                    <p className="font-semibold text-gray-900">{lead.requestedDateTime}</p>
                                    <p className="text-sm text-gray-600 mt-1">Duration: {lead.duration} minutes</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500">Service Type</p>
                                    <p className="font-semibold text-gray-900">{lead.serviceType}</p>
                                </div>
                            </div>

                            {lead.notes && (
                                <div className="border-t pt-4">
                                    <p className="text-sm text-gray-500 mb-1">Additional Notes</p>
                                    <p className="text-gray-700">{lead.notes}</p>
                                </div>
                            )}
                        </div>

                        {/* Pricing Alert */}
                        <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6 mb-6">
                            <div className="flex items-center gap-3 mb-3">
                                <DollarSign className="w-6 h-6 text-orange-600" />
                                <h3 className="text-lg font-bold text-orange-900">Lead Cost - 25% Commission</h3>
                            </div>
                            <p className="text-3xl font-bold text-orange-600 mb-2">
                                Rp {(lead?.leadCost || 0).toLocaleString()}
                            </p>
                            <p className="text-sm text-orange-700 mb-3">
                                This is 25% of the booking price (Rp {(lead?.bookingPrice || 0).toLocaleString()}), payable to IndaStreet.
                            </p>
                            <div className="bg-white/70 rounded-lg p-3 border border-orange-300">
                                <p className="text-sm font-semibold text-orange-900 mb-1">
                                    💰 Payment Terms:
                                </p>
                                <ul className="text-xs text-orange-800 space-y-1">
                                    <li>• Added to your monthly invoice</li>
                                    <li>• <strong>Payment due within 7 days of month-end</strong></li>
                                    <li>• No charge if you decline this lead</li>
                                </ul>
                            </div>
                        </div>

                        {/* Expiry Warning */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                            <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-yellow-800">
                                    ⏰ This lead expires in 5 minutes
                                </p>
                                <p className="text-xs text-yellow-600 mt-1">
                                    If you don't respond, it will be sent to other providers
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button
                                onClick={handleAccept}
                                disabled={processing}
                                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <Loader className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Accept Lead
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => navigate(`/lead/decline/${leadId}?token=${token}`)}
                                disabled={processing}
                                className="flex-1 bg-gray-200 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <XCircle className="w-5 h-5" />
                                Decline
                            </button>
                        </div>

                        <div className="bg-gray-100 rounded-lg p-4 mt-4">
                            <p className="text-xs text-center text-gray-700 font-medium mb-2">
                                ⚠️ By accepting, you agree to:
                            </p>
                            <ul className="text-xs text-gray-600 space-y-1">
                                <li>✓ Pay Rp {(lead?.leadCost || 0).toLocaleString()} (25% commission) to IndaStreet</li>
                                <li>✓ Payment due within 7 days of month-end invoice</li>
                                <li>✓ Contact customer immediately to confirm booking</li>
                            </ul>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default LeadAcceptPage;
