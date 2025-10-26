import React, { useState, useEffect } from 'react';
import { databases, storage } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import { ID, Query } from 'appwrite';

const DATABASE_ID = APPWRITE_CONFIG.databaseId;
const COLLECTIONS = APPWRITE_CONFIG.collections;
const BUCKET_ID = APPWRITE_CONFIG.bucketId;

interface BankDetail {
    $id: string;
    // Required fields
    accountNumber: string;
    bankName: string;
    currency: string;
    // Optional fields
    branchName?: string;
    accountType?: string;
    balance?: number;
    swiftCode?: string;
    isActive: boolean;
}

interface MembershipPackage {
    id: string;
    title: string;
    duration: string;
    months: number;
    price: number;
    save?: string;
    features: string[];
    popular?: boolean;
}

interface MembershipPaymentPageProps {
    userId: string;
    userEmail: string;
    userName: string;
    userType: 'therapist' | 'place';
    onBack: () => void;
    onPaymentSubmitted: () => void;
}

const MembershipPaymentPage: React.FC<MembershipPaymentPageProps> = ({
    userId,
    userEmail,
    userName,
    userType,
    onBack,
    onPaymentSubmitted
}) => {
    const [step, setStep] = useState<'select' | 'payment' | 'upload' | 'success'>('select');
    const [selectedPackage, setSelectedPackage] = useState<MembershipPackage | null>(null);
    const [bankDetails, setBankDetails] = useState<BankDetail[]>([]);
    const [selectedBank, setSelectedBank] = useState<BankDetail | null>(null);
    const [paymentProof, setPaymentProof] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);
    const [deadline, setDeadline] = useState<Date>(new Date());

    const packages: MembershipPackage[] = [
        {
            id: '1m',
            title: '1 Month',
            duration: '1 Month',
            months: 1,
            price: 100000,
            features: ['Basic visibility', 'Profile listing', 'Direct bookings']
        },
        {
            id: '3m',
            title: '3 Months',
            duration: '3 Months',
            months: 3,
            price: 250000,
            save: 'Save 17%',
            features: ['Enhanced visibility', 'Priority support', 'All 1-month features']
        },
        {
            id: '6m',
            title: '6 Months',
            duration: '6 Months',
            months: 6,
            price: 450000,
            save: 'Save 25%',
            popular: true,
            features: ['Premium visibility', 'Featured badge', 'Priority placement', 'All 3-month features']
        },
        {
            id: '1y',
            title: '1 Year',
            duration: '1 Year',
            months: 12,
            price: 800000,
            save: 'Save 33%',
            features: ['Maximum visibility', 'Verified Pro badge', 'Top placement', 'Dedicated support', 'All 6-month features']
        }
    ];

    useEffect(() => {
        fetchBankDetails();
    }, []);

    useEffect(() => {
        if (selectedPackage) {
            // Set deadline to 24 hours from now
            const deadlineTime = new Date();
            deadlineTime.setHours(deadlineTime.getHours() + 24);
            setDeadline(deadlineTime);
        }
    }, [selectedPackage]);

    const fetchBankDetails = async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.bankDetails,
                [Query.equal('isActive', true)]
            );
            const banks = response.documents as unknown as BankDetail[];
            setBankDetails(banks);
            if (banks.length > 0) {
                setSelectedBank(banks[0]);
            }
        } catch (error) {
            console.error('Error fetching bank details:', error);
        }
    };

    const handlePackageSelect = (pkg: MembershipPackage) => {
        setSelectedPackage(pkg);
        setStep('payment');
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }
            setPaymentProof(file);
            setPreviewUrl(URL.createObjectURL(file));
            setStep('upload');
        }
    };

    const handleSubmitPayment = async () => {
        if (!paymentProof || !selectedPackage || !selectedBank) {
            alert('Please upload payment proof');
            return;
        }

        setIsUploading(true);
        try {
            // Upload payment proof to Appwrite storage
            const fileUpload = await storage.createFile(
                BUCKET_ID,
                ID.unique(),
                paymentProof
            );

            // Get file URL
            const fileUrl = `${APPWRITE_CONFIG.endpoint}/storage/buckets/${BUCKET_ID}/files/${fileUpload.$id}/view?project=${APPWRITE_CONFIG.projectId}`;

            // Calculate expiry date
            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + selectedPackage.months);

            // Generate unique transaction ID
            const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

            // Create payment transaction record
            await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.paymentTransactions,
                ID.unique(),
                {
                    // Required fields
                    transactionId: transactionId,
                    userId: userId,
                    amount: selectedPackage.price,
                    currency: 'IDR',
                    transactionDate: new Date().toISOString(),
                    paymentMethod: 'bank_transfer',
                    status: 'pending',
                    // Optional fields
                    userEmail: userEmail,
                    userName: userName,
                    userType: userType,
                    packageType: selectedPackage.id,
                    packageDuration: selectedPackage.duration,
                    paymentProofUrl: fileUrl,
                    submittedAt: new Date().toISOString(),
                    expiresAt: expiryDate.toISOString(),
                    notes: `Payment submitted for ${selectedBank.bankName} - Account: ${selectedBank.accountNumber}`
                }
            );

            // Send WhatsApp notification (open WhatsApp with pre-filled message)
            const whatsappNumber = '6281392000050'; // Your WhatsApp number
            const message = encodeURIComponent(
                `🔔 New Payment Submission\n\n` +
                `👤 Name: ${userName}\n` +
                `📧 Email: ${userEmail}\n` +
                `📦 Package: ${selectedPackage.duration}\n` +
                `💰 Amount: IDR ${selectedPackage.price.toLocaleString()}\n` +
                `🏦 Bank: ${selectedBank.bankName}\n` +
                `⏰ Submitted: ${new Date().toLocaleString()}\n\n` +
                `Please review and approve in Admin Dashboard.`
            );
            window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');

            setStep('success');
        } catch (error) {
            console.error('Error submitting payment:', error);
            alert('Failed to submit payment. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const formatDeadline = (date: Date) => {
        return date.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Step 1: Package Selection
    if (step === 'select') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 p-4">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Membership</h1>
                        <p className="text-gray-600">Select the perfect package for your needs</p>
                    </div>

                    {/* Packages Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {packages.map((pkg) => (
                            <div
                                key={pkg.id}
                                className={`relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-2 ${
                                    pkg.popular ? 'border-orange-500 transform scale-105' : 'border-gray-200'
                                }`}
                            >
                                {pkg.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                                            🌟 POPULAR
                                        </span>
                                    </div>
                                )}

                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.title}</h3>
                                    <div className="text-4xl font-extrabold text-orange-600 mb-1">
                                        {(pkg.price / 1000).toFixed(0)}K
                                    </div>
                                    <p className="text-gray-500 text-sm">IDR {pkg.price.toLocaleString()}</p>
                                    {pkg.save && (
                                        <p className="text-green-600 font-semibold text-sm mt-2">{pkg.save}</p>
                                    )}
                                </div>

                                <ul className="space-y-3 mb-6">
                                    {pkg.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                            <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handlePackageSelect(pkg)}
                                    className={`w-full py-3 rounded-lg font-semibold transition-all ${
                                        pkg.popular
                                            ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                                    }`}
                                >
                                    Select Package
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Step 2: Payment Instructions
    if (step === 'payment') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 p-4">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Bank Transfer Payment</h2>
                            <p className="text-gray-600">Complete your payment within 24 hours</p>
                        </div>

                        {/* Package Summary */}
                        <div className="bg-gradient-to-r from-orange-100 to-orange-50 rounded-xl p-6 mb-6 border-2 border-orange-300">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-gray-700 font-semibold">Selected Package</p>
                                    <h3 className="text-2xl font-bold text-gray-900">{selectedPackage?.duration}</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-700 font-semibold">Total Amount</p>
                                    <h3 className="text-3xl font-bold text-orange-600">
                                        IDR {selectedPackage?.price.toLocaleString()}
                                    </h3>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg p-3">
                                <p className="text-sm text-gray-700">
                                    ⏰ <span className="font-semibold">Payment Deadline:</span>{' '}
                                    <span className="text-red-600 font-bold">{formatDeadline(deadline)}</span>
                                </p>
                            </div>
                        </div>

                        {/* Bank Selection */}
                        {bankDetails.length > 1 && (
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Select Bank Account
                                </label>
                                <div className="space-y-2">
                                    {bankDetails.map((bank) => (
                                        <button
                                            key={bank.$id}
                                            onClick={() => setSelectedBank(bank)}
                                            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                                                selectedBank?.$id === bank.$id
                                                    ? 'border-orange-500 bg-orange-50'
                                                    : 'border-gray-200 hover:border-orange-300'
                                            }`}
                                        >
                                            <p className="font-bold text-gray-900">{bank.bankName}</p>
                                            <p className="text-sm text-gray-600">{bank.currency} Account</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Bank Details */}
                        {selectedBank && (
                            <div className="bg-gray-50 rounded-xl p-6 mb-6">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                                    </svg>
                                    Transfer to this account:
                                </h3>
                                <div className="space-y-3">
                                    <div className="bg-white rounded-lg p-4">
                                        <p className="text-xs text-gray-500 mb-1">Bank Name</p>
                                        <p className="text-lg font-bold text-gray-900">{selectedBank.bankName}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4">
                                        <p className="text-xs text-gray-500 mb-1">Currency</p>
                                        <p className="text-lg font-bold text-gray-900">{selectedBank.currency}</p>
                                    </div>
                                    {selectedBank.accountType && (
                                        <div className="bg-white rounded-lg p-4">
                                            <p className="text-xs text-gray-500 mb-1">Account Type</p>
                                            <p className="text-lg font-bold text-gray-900">{selectedBank.accountType}</p>
                                        </div>
                                    )}
                                    <div className="bg-white rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Account Number</p>
                                                <p className="text-2xl font-bold text-orange-600 font-mono tracking-wider">
                                                    {selectedBank.accountNumber}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(selectedBank.accountNumber);
                                                    alert('Account number copied!');
                                                }}
                                                className="p-2 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors"
                                            >
                                                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    {selectedBank.branchName && (
                                        <div className="bg-white rounded-lg p-4">
                                            <p className="text-xs text-gray-500 mb-1">Branch</p>
                                            <p className="text-lg font-bold text-gray-900">{selectedBank.branchName}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Instructions */}
                        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
                            <h4 className="font-bold text-blue-900 mb-2">Payment Instructions:</h4>
                            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                                <li>Transfer exactly <strong>IDR {selectedPackage?.price.toLocaleString()}</strong></li>
                                <li>Complete payment within <strong>24 hours</strong></li>
                                <li>Take a screenshot of the successful transaction</li>
                                <li>Upload the screenshot on the next page</li>
                                <li>Wait for admin confirmation (usually within 24 hours)</li>
                            </ol>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep('select')}
                                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                ← Change Package
                            </button>
                            <label className="flex-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <div className="py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors cursor-pointer text-center">
                                    Upload Payment Proof →
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Step 3: Upload Proof
    if (step === 'upload') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 p-4">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Payment Proof</h2>
                            <p className="text-gray-600">Make sure the screenshot is clear and readable</p>
                        </div>

                        {/* Preview */}
                        <div className="mb-6">
                            <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                                <img src={previewUrl} alt="Payment proof" className="w-full h-auto" />
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-6">
                            <h4 className="font-semibold text-gray-900 mb-3">Payment Summary:</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Package:</span>
                                    <span className="font-semibold">{selectedPackage?.duration}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Amount:</span>
                                    <span className="font-semibold">IDR {selectedPackage?.price.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Bank:</span>
                                    <span className="font-semibold">{selectedBank?.bankName}</span>
                                </div>
                            </div>
                        </div>

                        {/* Warning */}
                        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4 mb-6">
                            <p className="text-sm text-yellow-800">
                                ⚠️ <strong>Important:</strong> After submitting, admin will review your payment proof. 
                                You'll receive a WhatsApp notification once your membership is activated.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setStep('payment');
                                    setPaymentProof(null);
                                    setPreviewUrl('');
                                }}
                                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                                disabled={isUploading}
                            >
                                ← Change Screenshot
                            </button>
                            <button
                                onClick={handleSubmitPayment}
                                disabled={isUploading}
                                className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isUploading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Submit Payment
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Step 4: Success
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 p-4 flex items-center justify-center">
            <div className="max-w-md mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Payment Submitted Successfully!</h2>
                    <p className="text-gray-600 mb-6">
                        Thank you for your payment. Our admin team will review your submission and activate your membership shortly.
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                        <p className="text-sm text-blue-800">
                            📱 A WhatsApp notification has been sent to our admin. 
                            You'll receive confirmation within 24 hours.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={onPaymentSubmitted}
                            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
                        >
                            Return to Dashboard
                        </button>
                        <button
                            onClick={onBack}
                            className="w-full py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MembershipPaymentPage;
