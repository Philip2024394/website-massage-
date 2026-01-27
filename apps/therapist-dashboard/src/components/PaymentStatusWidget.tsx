/**
 * Member Payment Status Widget
 * 
 * Shows payment status in member dashboard:
 * - Current status (active, due soon, grace period, suspended)
 * - Days until payment due
 * - Upload payment proof button
 * - Warning messages
 */

import React, { useState, useEffect } from 'react';
// Payment services - to be implemented
// import { paymentNotificationService } from '../../../src/lib/services/paymentNotification.service';
// import { paymentConfirmationService } from '../../../src/lib/services/paymentConfirmation.service';

interface PaymentStatusWidgetProps {
    providerId: string;
    providerType: 'therapist' | 'place';
    providerName: string;
}

export const PaymentStatusWidget: React.FC<PaymentStatusWidgetProps> = ({ 
    providerId
    // providerType,
    // providerName
}) => {
    const [paymentStatus, setPaymentStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploadingProof, setUploadingProof] = useState(false);
    const [proofFile, setProofFile] = useState<File | null>(null);

    useEffect(() => {
        loadPaymentStatus();
        
        // Refresh every 5 minutes
        const interval = setInterval(loadPaymentStatus, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [providerId]);

    const loadPaymentStatus = async () => {
        // TODO: Implement paymentNotificationService
        // try {
        //     const status = await paymentNotificationService.getPaymentStatus(providerId);
        //     setPaymentStatus(status);
        // } catch (error) {
        //     console.error('Error loading payment status:', error);
        // }
        setPaymentStatus(null);
        setLoading(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProofFile(e.target.files[0]);
        }
    };

    const uploadPaymentProof = async () => {
        if (!proofFile) {
            alert('Please select a payment proof image');
            return;
        }

        setUploadingProof(true);
        try {
            // TODO: Implement paymentConfirmationService
            // await paymentConfirmationService.submitPaymentProof({
            //     userId: providerId,
            //     userEmail: '',
            //     userName: providerName,
            //     memberType: providerType as 'therapist' | 'place',
            //     paymentType: 'membership',
            //     amount: paymentStatus?.amountDue || 0,
            //     packageName: 'Standard',
            //     bankName: 'Bank Transfer',
            //     accountNumber: 'N/A',
            //     accountName: 'N/A',
            //     proofOfPaymentFile: proofFile
            // });
            await Promise.resolve();

            alert('✅ Payment proof submitted! Admin will review and approve within 24 hours.');
            setProofFile(null);
            await loadPaymentStatus();
        } catch (error) {
            console.error('Error uploading payment proof:', error);
            alert('Failed to upload payment proof. Please try again.');
        } finally {
            setUploadingProof(false);
        }
    };

    if (loading) {
        return <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>;
    }

    if (!paymentStatus) {
        return null;
    }

    const getStatusDisplay = () => {
        switch (paymentStatus.status) {
            case 'current':
                return {
                    bg: 'bg-green-50',
                    border: 'border-green-200',
                    icon: '✓',
                    title: 'Payment Current',
                    message: paymentStatus.daysUntilDue 
                        ? `Next payment due in ${paymentStatus.daysUntilDue} days`
                        : 'Your account is in good standing',
                    color: 'text-green-700'
                };
            
            case 'due_soon':
                return {
                    bg: 'bg-yellow-50',
                    border: 'border-yellow-300',
                    icon: '⚠️',
                    title: 'Payment Due Soon',
                    message: `Payment due in ${paymentStatus.daysUntilDue} days! Upload payment proof to avoid service interruption.`,
                    color: 'text-yellow-700'
                };
            
            case 'grace_period':
                return {
                    bg: 'bg-orange-50',
                    border: 'border-orange-300',
                    icon: '🚨',
                    title: 'GRACE PERIOD - Payment Overdue',
                    message: `Payment is ${paymentStatus.daysOverdue} day(s) overdue. You have ${5 - (paymentStatus.daysOverdue || 0)} day(s) remaining before your bookings are redirected to other members!`,
                    color: 'text-orange-700'
                };
            
            case 'suspended':
                return {
                    bg: 'bg-red-50',
                    border: 'border-red-400',
                    icon: '❌',
                    title: 'ACCOUNT SUSPENDED - Bookings Disabled',
                    message: 'Your grace period has expired. Customers are being redirected to other members. Upload payment proof immediately to restore service.',
                    color: 'text-red-700'
                };
            
            default:
                return {
                    bg: 'bg-gray-50',
                    border: 'border-gray-200',
                    icon: 'ℹ️',
                    title: 'Payment Status',
                    message: 'Loading...',
                    color: 'text-gray-700'
                };
        }
    };

    const statusDisplay = getStatusDisplay();

    return (
        <div className={`rounded-lg border-2 ${statusDisplay.border} ${statusDisplay.bg} p-6 shadow-lg`}>
            <div className="flex items-start gap-4">
                <div className="text-4xl">{statusDisplay.icon}</div>
                <div className="flex-1">
                    <h3 className={`text-xl font-bold ${statusDisplay.color} mb-2`}>
                        {statusDisplay.title}
                    </h3>
                    <p className={`${statusDisplay.color} mb-4`}>
                        {statusDisplay.message}
                    </p>

                    {paymentStatus.nextPaymentDue && (
                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                            <div>
                                <span className="font-semibold">Next Payment Due:</span>
                                <br />
                                {new Date(paymentStatus.nextPaymentDue).toLocaleDateString()}
                            </div>
                            <div>
                                <span className="font-semibold">Amount Due:</span>
                                <br />
                                ฿{paymentStatus.amountDue || 0}
                            </div>
                        </div>
                    )}

                    {/* Upload Payment Proof */}
                    {paymentStatus.status !== 'current' && (
                        <div className="mt-4 p-4 bg-white rounded border border-gray-200">
                            <h4 className="font-semibold mb-3">Submit Payment Proof</h4>
                            <div className="flex gap-2 items-center">
                                <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={handleFileChange}
                                    className="flex-1 text-sm"
                                    disabled={uploadingProof}
                                />
                                <button
                                    onClick={uploadPaymentProof}
                                    disabled={!proofFile || uploadingProof}
                                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                                >
                                    {uploadingProof ? 'Uploading...' : 'Upload Proof'}
                                </button>
                            </div>
                            <p className="text-xs text-gray-600 mt-2">
                                Upload a screenshot or photo of your bank transfer. Admin will review within 24 hours.
                            </p>
                        </div>
                    )}

                    {/* Warning for suspended accounts */}
                    {paymentStatus.status === 'suspended' && (
                        <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded">
                            <p className="text-sm text-red-800 font-semibold">
                                ⚠️ Your booking buttons are currently disabled. All customer bookings are being redirected to other active members until payment is confirmed.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
