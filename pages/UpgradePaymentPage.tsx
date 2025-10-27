import React, { useState } from 'react';
import { Upload, CreditCard, AlertCircle, CheckCircle, Copy } from 'lucide-react';
import { databases, storage, ID } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';

const DATABASE_ID = APPWRITE_CONFIG.databaseId;
const BUCKET_ID = 'payment-proofs'; // You'll need to create this bucket in Appwrite

interface UpgradePaymentPageProps {
    onBack: () => void;
}

const UpgradePaymentPage: React.FC<UpgradePaymentPageProps> = ({ onBack }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        amount: '50000',
        paymentMethod: 'bca' as 'bca' | 'mandiri' | 'bni' | 'bri' | 'other',
        transferDate: new Date().toISOString().split('T')[0],
        referenceNumber: '',
        notes: '',
    });

    const [proofImage, setProofImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [error, setError] = useState('');

    // Generate unique payment code for this user
    const paymentCode = `INDA${Date.now().toString().slice(-8)}`;

    const bankAccounts = {
        bca: {
            name: 'BCA (Bank Central Asia)',
            accountNumber: '1234567890',
            accountName: 'IndaStreet Platform',
        },
        mandiri: {
            name: 'Bank Mandiri',
            accountNumber: '0987654321',
            accountName: 'IndaStreet Platform',
        },
        bni: {
            name: 'BNI (Bank Negara Indonesia)',
            accountNumber: '5555666677',
            accountName: 'IndaStreet Platform',
        },
        bri: {
            name: 'BRI (Bank Rakyat Indonesia)',
            accountNumber: '8888999900',
            accountName: 'IndaStreet Platform',
        },
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError('File size must be less than 5MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                setError('Please upload an image file');
                return;
            }
            setProofImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError('');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!proofImage) {
            setError('Please upload proof of payment');
            return;
        }

        if (!formData.fullName || !formData.email || !formData.phoneNumber) {
            setError('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);

        try {
            // Upload image to Appwrite Storage
            const imageUpload = await storage.createFile(
                BUCKET_ID,
                ID.unique(),
                proofImage
            );

            const imageUrl = `${APPWRITE_CONFIG.endpoint}/storage/buckets/${BUCKET_ID}/files/${imageUpload.$id}/view?project=${APPWRITE_CONFIG.projectId}`;

            // Create payment record in database
            await databases.createDocument(
                DATABASE_ID,
                'paymentVerifications', // You'll need to create this collection
                ID.unique(),
                {
                    userId: 'current-user-id', // Replace with actual user ID from auth
                    fullName: formData.fullName,
                    email: formData.email,
                    phoneNumber: formData.phoneNumber,
                    amount: parseInt(formData.amount),
                    paymentMethod: formData.paymentMethod,
                    bankAccount: formData.paymentMethod !== 'other' ? bankAccounts[formData.paymentMethod as keyof typeof bankAccounts].accountNumber : 'Other payment method',
                    transferDate: formData.transferDate,
                    referenceNumber: formData.referenceNumber,
                    paymentCode: paymentCode,
                    proofImageUrl: imageUrl,
                    proofImageId: imageUpload.$id,
                    notes: formData.notes,
                    status: 'pending',
                    submittedAt: new Date().toISOString(),
                }
            );

            setSubmitSuccess(true);
            setTimeout(() => {
                onBack();
            }, 3000);

        } catch (err: any) {
            console.error('Payment submission error:', err);
            setError(err.message || 'Failed to submit payment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Submitted!</h2>
                    <p className="text-gray-600 mb-6">
                        Your payment proof has been submitted successfully. We'll verify it within 24 hours and you'll receive a notification once approved.
                    </p>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-orange-700">
                            <strong>Payment Code:</strong> {paymentCode}
                        </p>
                        <p className="text-xs text-orange-600 mt-1">
                            Please save this code for reference
                        </p>
                    </div>
                    <button
                        onClick={onBack}
                        className="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                    >
                        Back to Jobs
                    </button>
                </div>
            </div>
        );
    }

    const selectedBank = formData.paymentMethod !== 'other' ? bankAccounts[formData.paymentMethod as keyof typeof bankAccounts] : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
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
                    <h1 className="text-3xl font-bold text-gray-900">Upgrade Your Account</h1>
                    <p className="text-gray-600 mt-2">Get instant access to all job contact details</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left: Payment Instructions */}
                    <div className="space-y-6">
                        {/* Pricing Card */}
                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <CreditCard className="w-8 h-8" />
                                <div>
                                    <h3 className="text-lg font-semibold">Premium Access</h3>
                                    <p className="text-orange-100 text-sm">Unlimited job contact details</p>
                                </div>
                            </div>
                            <div className="text-4xl font-bold mb-2">Rp 50,000</div>
                            <p className="text-orange-100 text-sm">per month</p>
                        </div>

                        {/* Bank Account Details */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-orange-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Transfer to:</h3>
                            
                            {selectedBank ? (
                                <div className="space-y-3 mb-4">
                                    <div>
                                        <label className="text-sm text-gray-600">Bank</label>
                                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                            <span className="font-semibold text-gray-900">{selectedBank.name}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-600">Account Number</label>
                                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                            <span className="font-mono font-bold text-lg text-gray-900">{selectedBank.accountNumber}</span>
                                            <button
                                                onClick={() => copyToClipboard(selectedBank.accountNumber)}
                                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                            >
                                                <Copy className="w-5 h-5 text-orange-500" />
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-600">Account Name</label>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <span className="font-semibold text-gray-900">{selectedBank.accountName}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-600">Amount</label>
                                        <div className="flex items-center justify-between bg-orange-50 p-3 rounded-lg border-2 border-orange-200">
                                            <span className="font-bold text-xl text-orange-600">Rp 50,000</span>
                                            <button
                                                onClick={() => copyToClipboard('50000')}
                                                className="p-2 hover:bg-orange-100 rounded-lg transition-colors"
                                            >
                                                <Copy className="w-5 h-5 text-orange-500" />
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-600">Payment Code (Optional)</label>
                                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                            <span className="font-mono font-semibold text-gray-900">{paymentCode}</span>
                                            <button
                                                onClick={() => copyToClipboard(paymentCode)}
                                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                            >
                                                <Copy className="w-5 h-5 text-orange-500" />
                                                </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Include this in transfer notes for faster verification</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3 mb-4">
                                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                                        <p className="text-sm text-yellow-800">Please select a payment method below to see bank details.</p>
                                    </div>
                                </div>
                            )}

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-700">
                                    <strong>💡 Tip:</strong> Use mobile banking or ATM to transfer. After transferring, upload your proof of payment below.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Upload Form */}
                    <div>
                        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Upload Payment Proof</h3>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    WhatsApp Number *
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    placeholder="628123456789"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Bank Used for Transfer *
                                </label>
                                <select
                                    value={formData.paymentMethod}
                                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                >
                                    <option value="bca">BCA</option>
                                    <option value="mandiri">Mandiri</option>
                                    <option value="bni">BNI</option>
                                    <option value="bri">BRI</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Transfer Reference Number
                                </label>
                                <input
                                    type="text"
                                    value={formData.referenceNumber}
                                    onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                                    placeholder="Optional"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Upload Screenshot/Photo *
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
                                    {previewUrl ? (
                                        <div className="relative">
                                            <img src={previewUrl} alt="Proof" className="max-h-64 mx-auto rounded-lg" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setProofImage(null);
                                                    setPreviewUrl('');
                                                }}
                                                className="mt-4 text-red-500 hover:text-red-700 text-sm font-medium"
                                            >
                                                Remove Image
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer">
                                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-gray-600 mb-1">Click to upload or drag and drop</p>
                                            <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                                required
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Additional Notes
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="Any additional information..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-lg transition-all shadow-lg disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Payment Proof'}
                            </button>

                            <p className="text-xs text-gray-500 text-center">
                                By submitting, you agree that the payment information is accurate. Verification usually takes up to 24 hours.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpgradePaymentPage;
