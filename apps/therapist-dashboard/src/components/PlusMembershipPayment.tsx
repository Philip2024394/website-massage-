/**
 * Plus Membership Payment Component
 * 
 * Flow:
 * 1. User selects Plus plan
 * 2. Sees admin bank details
 * 3. Uploads payment proof
 * 4. Can upload profile after proof submission
 * 5. Admin verifies payment
 * 6. Account activated on live site
 */

import React, { useState, useEffect } from 'react';
import { Building2, Upload, CheckCircle, AlertCircle, Crown } from 'lucide-react';
import { paymentConfirmationService } from '../../../../src/lib/appwriteService';

interface PlusMembershipPaymentProps {
    therapistId: string;
    therapistName: string;
    therapistEmail: string;
    onPaymentSubmitted?: () => void;
}

interface BankDetails {
    bankName: string;
    accountName: string;
    accountNumber: string;
    branchName?: string;
    swiftCode?: string;
}

export const PlusMembershipPayment: React.FC<PlusMembershipPaymentProps> = ({
    therapistId,
    therapistName,
    therapistEmail,
    onPaymentSubmitted
}) => {
    const [adminBankDetails] = useState<BankDetails>({
        bankName: 'Bank Central Asia (BCA)',
        accountName: 'Indastreet Massage Platform',
        accountNumber: '1234567890',
        branchName: 'Jakarta Pusat',
        swiftCode: 'CENAIDJA'
    });
    
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<any>(null);
    const [loadingStatus, setLoadingStatus] = useState(true);

    const monthlyFee = 250000; // 250k IDR

    useEffect(() => {
        loadPaymentStatus();
        // Refresh every 30 seconds
        const interval = setInterval(loadPaymentStatus, 30000);
        return () => clearInterval(interval);
    }, [therapistId]);

    const loadPaymentStatus = async () => {
        try {
            const payments = await paymentConfirmationService.getUserPayments(therapistId);
            const latestPayment = payments.find(p => 
                p.paymentType === 'membership' && 
                (p.packageType === 'Plus' || p.packageName === 'Plus')
            );
            setPaymentStatus(latestPayment);
        } catch (error) {
            console.error('Error loading payment status:', error);
        } finally {
            setLoadingStatus(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmitPayment = async () => {
        if (!selectedFile) {
            alert('Please select a payment proof file');
            return;
        }

        setUploading(true);

        try {
            await paymentConfirmationService.submitPaymentProof({
                userId: therapistId,
                userEmail: therapistEmail,
                userName: therapistName,
                memberType: 'therapist',
                paymentType: 'membership',
                packageName: 'Plus',
                packageDuration: '1 month',
                amount: monthlyFee,
                bankName: adminBankDetails.bankName,
                accountNumber: adminBankDetails.accountNumber,
                accountName: adminBankDetails.accountName,
                proofOfPaymentFile: selectedFile
            });

            alert('✅ Payment proof submitted successfully! You can now upload your profile. Admin will verify your payment within 24 hours.');
            setSelectedFile(null);
            await loadPaymentStatus();
            
            if (onPaymentSubmitted) {
                onPaymentSubmitted();
            }
        } catch (error) {
            console.error('Error submitting payment:', error);
            alert('Failed to submit payment proof. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('✅ Copied to clipboard!');
    };

    const getStatusDisplay = () => {
        if (!paymentStatus) {
            return {
                color: 'gray',
                bg: 'bg-gray-50',
                border: 'border-gray-200',
                icon: <AlertCircle className="w-6 h-6 text-gray-600" />,
                title: 'No Payment Submitted',
                message: 'Submit your payment proof to activate Plus membership'
            };
        }

        switch (paymentStatus.status) {
            case 'pending':
                return {
                    color: 'blue',
                    bg: 'bg-blue-50',
                    border: 'border-blue-200',
                    icon: <AlertCircle className="w-6 h-6 text-blue-600" />,
                    title: '⏳ Payment Under Review',
                    message: 'Admin is reviewing your payment. You can upload your profile now. Account will be live after verification.'
                };
            case 'approved':
                return {
                    color: 'green',
                    bg: 'bg-green-50',
                    border: 'border-green-200',
                    icon: <CheckCircle className="w-6 h-6 text-green-600" />,
                    title: '✅ Payment Verified',
                    message: 'Your Plus membership is active! You are now an official Indastreet partner.'
                };
            case 'declined':
                return {
                    color: 'red',
                    bg: 'bg-red-50',
                    border: 'border-red-200',
                    icon: <AlertCircle className="w-6 h-6 text-red-600" />,
                    title: '❌ Payment Declined',
                    message: paymentStatus.declineReason || 'Please submit a new payment proof with correct details.'
                };
            default:
                return {
                    color: 'gray',
                    bg: 'bg-gray-50',
                    border: 'border-gray-200',
                    icon: <AlertCircle className="w-6 h-6 text-gray-600" />,
                    title: 'Payment Status Unknown',
                    message: 'Please contact support'
                };
        }
    };

    if (loadingStatus) {
        return <div className="animate-pulse bg-gray-200 h-96 rounded-xl"></div>;
    }

    const statusDisplay = getStatusDisplay();
    const canUploadNewProof = !paymentStatus || paymentStatus.status === 'declined';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <Crown className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Plus Membership</h2>
                        <p className="text-amber-100">Official Indastreet Partner Status</p>
                    </div>
                </div>
                <div className="flex items-center justify-between bg-white/10 rounded-lg p-4">
                    <div>
                        <p className="text-amber-100 text-sm">Monthly Investment</p>
                        <p className="text-3xl font-bold">Rp {monthlyFee.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-amber-100 text-sm">Commission</p>
                        <p className="text-3xl font-bold">0%</p>
                    </div>
                </div>
            </div>

            {/* Payment Status */}
            <div className={`${statusDisplay.bg} border-2 ${statusDisplay.border} rounded-xl p-6`}>
                <div className="flex items-start gap-4">
                    {statusDisplay.icon}
                    <div className="flex-1">
                        <h3 className={`text-lg font-bold text-${statusDisplay.color}-900 mb-2`}>
                            {statusDisplay.title}
                        </h3>
                        <p className={`text-${statusDisplay.color}-800`}>
                            {statusDisplay.message}
                        </p>
                        {paymentStatus?.submittedAt && (
                            <p className={`text-xs text-${statusDisplay.color}-600 mt-2`}>
                                Submitted: {new Date(paymentStatus.submittedAt).toLocaleString()}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Bank Details */}
            {canUploadNewProof && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Building2 className="w-6 h-6 text-blue-600" />
                        <h3 className="text-xl font-bold text-gray-900">Admin Bank Details</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Bank Name</label>
                                <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                                    <span className="font-semibold text-gray-900">{adminBankDetails.bankName}</span>
                                    <button
                                        onClick={() => copyToClipboard(adminBankDetails.bankName)}
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Branch</label>
                                <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                                    <span className="font-semibold text-gray-900">{adminBankDetails.branchName}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Account Name</label>
                            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                                <span className="font-semibold text-gray-900">{adminBankDetails.accountName}</span>
                                <button
                                    onClick={() => copyToClipboard(adminBankDetails.accountName)}
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Account Number</label>
                            <div className="flex items-center justify-between bg-blue-50 border-2 border-blue-300 rounded-lg px-4 py-3">
                                <span className="text-2xl font-bold text-blue-900">{adminBankDetails.accountNumber}</span>
                                <button
                                    onClick={() => copyToClipboard(adminBankDetails.accountNumber)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Transfer Amount</label>
                            <div className="bg-green-50 border-2 border-green-300 rounded-lg px-4 py-3">
                                <span className="text-2xl font-bold text-green-900">Rp {monthlyFee.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-900 font-semibold mb-2">📝 Transfer Instructions:</p>
                        <ol className="text-sm text-amber-800 space-y-1 list-decimal list-inside">
                            <li>Transfer exactly Rp {monthlyFee.toLocaleString()} to the account above</li>
                            <li>Take a screenshot or photo of your transfer confirmation</li>
                            <li>Upload the proof below</li>
                            <li>You can upload your profile immediately after submission</li>
                            <li>Admin will verify within 24 hours</li>
                        </ol>
                    </div>
                </div>
            )}

            {/* Upload Section */}
            {canUploadNewProof && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Upload className="w-6 h-6 text-orange-600" />
                        <h3 className="text-xl font-bold text-gray-900">Upload Payment Proof</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select your bank transfer screenshot or receipt
                            </label>
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={handleFileSelect}
                                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none p-2"
                            />
                            {selectedFile && (
                                <p className="text-sm text-green-600 mt-2 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                </p>
                            )}
                        </div>

                        <button
                            onClick={handleSubmitPayment}
                            disabled={!selectedFile || uploading}
                            className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold rounded-xl hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                        >
                            {uploading ? (
                                <>
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                    <span>Uploading...</span>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-6 h-6" />
                                    <span>Submit Payment Proof</span>
                                </>
                            )}
                        </button>

                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-900 font-semibold mb-2">✅ After Submission:</p>
                            <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                                <li>You can immediately upload your profile to the platform</li>
                                <li>Your account will be visible on the live site</li>
                                <li>Admin will verify your payment within 24 hours</li>
                                <li>If declined, you can submit a new proof</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Benefits Reminder */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-purple-900 mb-4">🎯 Plus Membership Benefits</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-purple-900">0% Commission</p>
                            <p className="text-sm text-purple-700">Keep 100% of all earnings</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-purple-900">Official Indastreet Partner</p>
                            <p className="text-sm text-purple-700">Represent our brand professionally</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-purple-900">Gold Verified Badge</p>
                            <p className="text-sm text-purple-700">Build trust with customers</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-purple-900">Priority Placement</p>
                            <p className="text-sm text-purple-700">Top 3 in search results</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Branding Restrictions */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-red-900 mb-4">⚠️ Important: Brand Usage Policy</h3>
                <div className="space-y-3 text-sm text-red-800">
                    <p className="font-semibold">Plus Members (You):</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>✅ Can represent Indastreet Massage brand</li>
                        <li>✅ Use official Indastreet marketing materials</li>
                        <li>✅ Advertise as "Official Indastreet Partner"</li>
                    </ul>
                    <p className="font-semibold mt-4">Pro Members:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>❌ Cannot use Indastreet brand for business purposes</li>
                        <li>✅ Only listed in Massage Hub Directory</li>
                        <li>❌ Cannot claim partnership or affiliation</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
