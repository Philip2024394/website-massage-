// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
/**
 * Membership Package Display Component
 * 
 * Shows member:
 * - Current package and features
 * - Payment schedule and amount
 * - Admin bank details for payment
 * - Upgrade/downgrade options
 * - Payment proof upload
 * - Terms and conditions link
 */

import React, { useState, useEffect } from 'react';
import { databases, APPWRITE_CONFIG, Query, storage, ID } from '../../lib/services/_shared';
// Payment notification service - to be implemented

interface MembershipPackageDisplayProps {
    providerId: string;
    providerType: 'therapist' | 'place';
    providerName: string;
}

interface BankDetails {
    bankName: string;
    accountName: string;
    accountNumber: string;
    branchName?: string;
    swiftCode?: string;
    additionalInfo?: string;
}

interface PackageInfo {
    name: string;
    monthlyFee: number;
    features: string[];
    color: string;
}

const PACKAGES: Record<string, PackageInfo> = {
    'Basic': {
        name: 'Basic Package',
        monthlyFee: 999,
        features: [
            '📱 Profile listing',
            '🔍 Search visibility',
            '💬 Customer messaging',
            '📊 Basic analytics',
            '⭐ Customer reviews'
        ],
        color: 'blue'
    },
    'Standard': {
        name: 'Standard Package',
        monthlyFee: 1999,
        features: [
            '✨ All Basic features',
            '🎯 Priority placement',
            '📸 Photo gallery (up to 10)',
            '📈 Advanced analytics',
            '🏆 Badge eligibility',
            '💼 Business tools'
        ],
        color: 'purple'
    },
    'Premium': {
        name: 'Premium Package',
        monthlyFee: 2999,
        features: [
            '👑 All Standard features',
            '🌟 Top placement',
            '📸 Unlimited photos',
            '🎨 Custom branding',
            '📞 Priority support',
            '💰 Lower commission rates',
            '🔥 Featured badge'
        ],
        color: 'gold'
    }
};

export const MembershipPackageDisplay: React.FC<MembershipPackageDisplayProps> = ({
    providerId,
    providerType,
    providerName
}) => {
    const [subscription, setSubscription] = useState<any>(null);
    const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploadingProof, setUploadingProof] = useState(false);
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [showTerms, setShowTerms] = useState(false);
    const [showUpgradeOptions, setShowUpgradeOptions] = useState(false);

    useEffect(() => {
        loadMembershipData();
    }, [providerId]);

    const loadMembershipData = async () => {
        try {
            // Load subscription
            const subResponse = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                'member_subscriptions',
                [Query.equal('providerId', providerId), Query.limit(1)]
            );

            if (subResponse.documents.length > 0) {
                setSubscription(subResponse.documents[0]);
            }

            // Load admin bank details (from config or settings collection)
            // For now using hardcoded, but you should fetch from admin settings
            setBankDetails({
                bankName: 'Bangkok Bank',
                accountName: 'Massage Platform Co., Ltd.',
                accountNumber: '123-4-56789-0',
                branchName: 'Sukhumvit Branch',
                swiftCode: 'BKKBTHBK',
                additionalInfo: 'Please include your Provider ID in the transfer note'
            });

            // Load payment status
            // const status = await paymentNotificationService.getPaymentStatus(providerId);
            const status = null; // Payment service to be implemented
            setPaymentStatus(status);

        } catch (error) {
            console.error('Error loading membership data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProofFile(e.target.files[0]);
        }
    };

    const uploadPaymentProof = async () => {
        if (!proofFile || !subscription) {
            showErrorToast('Please select a payment proof file');
            return;
        }

        setUploadingProof(true);
        try {
            // Upload file to Appwrite storage
            const fileResponse = await storage.createFile(
                'payment_proofs', // bucket ID
                ID.unique(),
                proofFile
            );

            const fileUrl = storage.getFileView('payment_proofs', fileResponse.$id);

            // Create payment confirmation document
            await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                'payment_confirmations',
                ID.unique(),
                {
                    providerId: providerId,
                    providerName: providerName,
                    providerType: providerType,
                    subscriptionId: subscription.$id,
                    packageType: subscription.membershipType,
                    amount: subscription.monthlyAmount,
                    proofFileUrl: fileUrl.toString(),
                    proofFileId: fileResponse.$id,
                    submittedAt: new Date().toISOString(),
                    status: 'pending',
                    reviewed: false
                }
            );

            showSuccessToast('✅ Payment proof submitted successfully! Admin will review within 24 hours.');
            setProofFile(null);
            await loadMembershipData();

        } catch (error) {
            console.error('Error uploading payment proof:', error);
            showErrorToast('❌ Failed to upload payment proof. Please try again.');
        } finally {
            setUploadingProof(false);
        }
    };

    if (loading) {
        return <div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>;
    }

    if (!subscription) {
        return (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
                <h3 className="text-xl font-bold text-yellow-800 mb-2">No Active Membership</h3>
                <p className="text-yellow-700">You don't have an active membership. Please contact admin to subscribe.</p>
            </div>
        );
    }

    const packageInfo = PACKAGES[subscription.membershipType] || PACKAGES['Basic'];
    const daysUntilDue = paymentStatus?.daysUntilDue || 0;
    const isOverdue = daysUntilDue < 0;

    return (
        <div className="space-y-6">
            {/* Current Package Display */}
            <div className={`bg-gradient-to-br from-${packageInfo.color}-50 to-${packageInfo.color}-100 rounded-xl border-2 border-${packageInfo.color}-300 p-6 shadow-lg`}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{packageInfo.name}</h2>
                        <p className="text-lg text-gray-600 mt-1">฿{packageInfo.monthlyFee.toLocaleString()}/month</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        subscription.subscriptionStatus === 'active' ? 'bg-green-500 text-white' :
                        subscription.subscriptionStatus === 'grace_period' ? 'bg-orange-500 text-white' :
                        'bg-red-500 text-white'
                    }`}>
                        {subscription.subscriptionStatus.toUpperCase()}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Package Features:</h4>
                        <ul className="space-y-1">
                            {packageInfo.features.map((feature, idx) => (
                                <li key={idx} className="text-gray-700 text-sm">{feature}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Payment Schedule:</h4>
                        <div className="space-y-2 text-sm">
                            <p><span className="font-medium">Next Payment:</span> {new Date(subscription.nextPaymentDue).toLocaleDateString()}</p>
                            <p><span className="font-medium">Amount Due:</span> ฿{subscription.monthlyAmount?.toLocaleString()}</p>
                            <p><span className="font-medium">Days Until Due:</span> {isOverdue ? `${Math.abs(daysUntilDue)} days overdue` : `${daysUntilDue} days`}</p>
                            <p><span className="font-medium">Auto-Renew:</span> {subscription.autoRenewal ? '✅ Enabled' : '❌ Disabled'}</p>
                        </div>
                    </div>
                </div>

                {/* Payment Status Warning */}
                {isOverdue && (
                    <div className="bg-red-100 border-2 border-red-400 rounded-lg p-4 mb-4">
                        <h4 className="font-bold text-red-800 text-lg mb-2">⚠️ PAYMENT OVERDUE</h4>
                        <p className="text-red-700">
                            Your payment is {Math.abs(daysUntilDue)} day(s) overdue. 
                            {subscription.subscriptionStatus === 'suspended' 
                                ? ' Your bookings have been disabled and customers are being redirected to other members. Upload payment proof immediately!'
                                : ` You have ${5 - Math.abs(daysUntilDue)} day(s) remaining before your bookings are disabled.`
                            }
                        </p>
                    </div>
                )}

                {/* Upgrade/Downgrade Options */}
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowUpgradeOptions(!showUpgradeOptions)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                        {showUpgradeOptions ? 'Hide Options' : '🔄 Change Package'}
                    </button>
                    <button
                        onClick={() => setShowTerms(!showTerms)}
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                    >
                        📄 Terms & Conditions
                    </button>
                </div>
            </div>

            {/* Upgrade/Downgrade Options */}
            {showUpgradeOptions && (
                <div className="bg-white rounded-lg border-2 border-gray-300 p-6">
                    <h3 className="text-xl font-bold mb-4">Available Packages</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        {Object.entries(PACKAGES).map(([key, pkg]) => (
                            <div
                                key={key}
                                className={`border-2 rounded-lg p-4 ${
                                    key === subscription.membershipType 
                                        ? 'border-green-500 bg-green-50' 
                                        : 'border-gray-300 hover:border-blue-400'
                                }`}
                            >
                                <h4 className="font-bold text-lg mb-2">{pkg.name}</h4>
                                <p className="text-2xl font-bold text-blue-600 mb-3">฿{pkg.monthlyFee.toLocaleString()}/mo</p>
                                <ul className="space-y-1 mb-4 text-sm">
                                    {pkg.features.slice(0, 4).map((feature, idx) => (
                                        <li key={idx} className="text-gray-600">{feature}</li>
                                    ))}
                                </ul>
                                {key === subscription.membershipType ? (
                                    <div className="text-center py-2 bg-green-500 text-white rounded font-semibold">
                                        Current Package
                                    </div>
                                ) : (
                                    <button className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">
                                        {pkg.monthlyFee > packageInfo.monthlyFee ? 'Upgrade' : 'Downgrade'}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-4">
                        ℹ️ Package changes take effect at the start of next billing cycle. Contact admin for immediate changes.
                    </p>
                </div>
            )}

            {/* Terms and Conditions */}
            {showTerms && (
                <div className="bg-white rounded-lg border-2 border-gray-300 p-6 max-h-96 ">
                    <h3 className="text-xl font-bold mb-4">Membership Terms & Conditions</h3>
                    <div className="space-y-4 text-sm text-gray-700">
                        <section>
                            <h4 className="font-semibold text-lg mb-2">1. Payment Terms</h4>
                            <ul className="list-disc list-inside space-y-1 ml-4">
                                <li>Monthly membership fees are due on the same date each month</li>
                                <li>Payment must be received 7 days before due date to avoid notices</li>
                                <li>5-day grace period provided after due date before service interruption</li>
                                <li>Late payments may result in booking redirection and account suspension</li>
                            </ul>
                        </section>

                        <section>
                            <h4 className="font-semibold text-lg mb-2">2. Service Suspension</h4>
                            <ul className="list-disc list-inside space-y-1 ml-4">
                                <li>Accounts with payments overdue by 6+ days will have bookings disabled</li>
                                <li>Customer bookings will be automatically redirected to active members</li>
                                <li>Profile visibility may be reduced during suspension</li>
                                <li>Service restored within 24 hours of payment confirmation</li>
                            </ul>
                        </section>

                        <section>
                            <h4 className="font-semibold text-lg mb-2">3. Package Changes</h4>
                            <ul className="list-disc list-inside space-y-1 ml-4">
                                <li>Upgrades take effect immediately upon payment</li>
                                <li>Downgrades take effect at the start of next billing cycle</li>
                                <li>No refunds for partial months when downgrading</li>
                                <li>Contact admin for special circumstances or questions</li>
                            </ul>
                        </section>

                        <section>
                            <h4 className="font-semibold text-lg mb-2">4. Cancellation Policy</h4>
                            <ul className="list-disc list-inside space-y-1 ml-4">
                                <li>30 days notice required for membership cancellation</li>
                                <li>Access continues until end of paid period</li>
                                <li>No refunds for remaining days after cancellation</li>
                                <li>Reactivation may require new application review</li>
                            </ul>
                        </section>
                    </div>
                </div>
            )}

            {/* Admin Bank Details for Payment */}
            <div className="bg-blue-50 rounded-lg border-2 border-blue-300 p-6">
                <h3 className="text-xl font-bold text-blue-900 mb-4">💳 Payment Instructions</h3>
                <div className="bg-white rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Bank Transfer Details:</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-600">Bank Name</p>
                            <p className="font-semibold text-gray-900">{bankDetails?.bankName}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Account Name</p>
                            <p className="font-semibold text-gray-900">{bankDetails?.accountName}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Account Number</p>
                            <p className="font-semibold text-gray-900 text-lg">{bankDetails?.accountNumber}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Branch</p>
                            <p className="font-semibold text-gray-900">{bankDetails?.branchName}</p>
                        </div>
                        {bankDetails?.swiftCode && (
                            <div>
                                <p className="text-gray-600">SWIFT Code</p>
                                <p className="font-semibold text-gray-900">{bankDetails.swiftCode}</p>
                            </div>
                        )}
                    </div>
                    {bankDetails?.additionalInfo && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded">
                            <p className="text-sm text-yellow-800">
                                <strong>⚠️ Important:</strong> {bankDetails.additionalInfo}
                            </p>
                        </div>
                    )}
                </div>

                {/* Payment Proof Upload */}
                <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-3">Upload Payment Proof</h4>
                    <div className="space-y-3">
                        <div className="flex gap-2 items-center">
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={handleFileChange}
                                className="flex-1 text-sm border border-gray-300 rounded p-2"
                                disabled={uploadingProof}
                            />
                            <button
                                onClick={uploadPaymentProof}
                                disabled={!proofFile || uploadingProof}
                                className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium whitespace-nowrap"
                            >
                                {uploadingProof ? '⏳ Uploading...' : '📤 Send Proof'}
                            </button>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                            <p>✓ Upload a clear screenshot or photo of your bank transfer confirmation</p>
                            <p>✓ Ensure transfer amount matches: ฿{subscription.monthlyAmount?.toLocaleString()}</p>
                            <p>✓ Admin will review and approve within 24 hours</p>
                            <p>✓ Accepted formats: JPG, PNG, PDF</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Help Section */}
            <div className="bg-gray-50 rounded-lg border border-gray-300 p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Need Help?</h4>
                <p className="text-sm text-gray-600 mb-3">
                    If you have questions about your membership, payments, or need to discuss special circumstances, please contact our admin team.
                </p>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                    💬 Contact Admin Support
                </button>
            </div>
        </div>
    );
};
