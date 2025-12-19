import React, { useState, useEffect } from 'react';
import { Building2, User, CreditCard, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import PaymentCard from './PaymentCard';

interface BankDetails {
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
}

interface BankDetailsFormProps {
    therapistId: string;
    initialBankDetails?: BankDetails;
    onSave: (details: BankDetails) => Promise<void>;
    onCancel?: () => void;
}

/**
 * Form for therapists to enter and manage their bank payment details
 * Required for accepting scheduled bookings
 */
const BankDetailsForm: React.FC<BankDetailsFormProps> = ({
    therapistId,
    initialBankDetails,
    onSave,
    onCancel
}) => {
    const [formData, setFormData] = useState<BankDetails>({
        bankName: initialBankDetails?.bankName || '',
        accountHolderName: initialBankDetails?.accountHolderName || '',
        accountNumber: initialBankDetails?.accountNumber || ''
    });

    const [errors, setErrors] = useState<Partial<BankDetails>>({});
    const [saving, setSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Popular Indonesian banks
    const popularBanks = [
        'BCA (Bank Central Asia)',
        'Mandiri',
        'BNI (Bank Negara Indonesia)',
        'BRI (Bank Rakyat Indonesia)',
        'CIMB Niaga',
        'Permata Bank',
        'Danamon',
        'BTN (Bank Tabungan Negara)',
        'Mega',
        'Panin Bank',
        'OCBC NISP',
        'Maybank Indonesia',
        'Bank Syariah Indonesia (BSI)',
        'Jenius (BTPN)',
        'Gopay',
        'OVO',
        'Dana',
        'ShopeePay'
    ];

    const validateForm = (): boolean => {
        const newErrors: Partial<BankDetails> = {};

        if (!formData.bankName.trim()) {
            newErrors.bankName = 'Bank name is required';
        }

        if (!formData.accountHolderName.trim()) {
            newErrors.accountHolderName = 'Account holder name is required';
        } else if (formData.accountHolderName.trim().length < 3) {
            newErrors.accountHolderName = 'Name must be at least 3 characters';
        }

        if (!formData.accountNumber.trim()) {
            newErrors.accountNumber = 'Account number is required';
        } else {
            // Remove spaces and check if it's all digits
            const cleanNumber = formData.accountNumber.replace(/\s/g, '');
            if (!/^\d+$/.test(cleanNumber)) {
                newErrors.accountNumber = 'Account number must contain only digits';
            } else if (cleanNumber.length < 10 || cleanNumber.length > 20) {
                newErrors.accountNumber = 'Account number must be 10-20 digits';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setSaving(true);
        setSaveSuccess(false);

        try {
            // Clean account number (remove spaces)
            const cleanedData = {
                ...formData,
                accountNumber: formData.accountNumber.replace(/\s/g, '')
            };

            await onSave(cleanedData);
            
            setSaveSuccess(true);
            
            // Auto-hide success message after 3 seconds
            setTimeout(() => {
                setSaveSuccess(false);
            }, 3000);
        } catch (error) {
            console.error('Failed to save bank details:', error);
            alert('Failed to save bank details. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const isFormValid = formData.bankName && formData.accountHolderName && formData.accountNumber;

    return (
        <div className="max-w-5xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    💳 Payment Information
                </h2>
                <p className="text-gray-600">
                    Add your bank details to receive payments for scheduled bookings. 
                    <span className="text-orange-600 font-semibold"> Required for accepting scheduled bookings.</span>
                </p>
            </div>

            {/* Success Message */}
            {saveSuccess && (
                <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                    <div>
                        <p className="font-bold text-green-900">Bank Details Saved Successfully!</p>
                        <p className="text-sm text-green-700">You can now accept scheduled bookings.</p>
                    </div>
                </div>
            )}

            {/* Warning Notice */}
            {!initialBankDetails && (
                <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold text-amber-900 mb-1">⚠️ Bank Details Required</p>
                        <p className="text-sm text-amber-800">
                            You must complete your bank details to accept scheduled bookings. 
                            This information will be automatically shared with customers when you accept their booking.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form Section */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Bank Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                <Building2 className="inline w-4 h-4 mr-1 text-orange-600" />
                                Bank Name <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.bankName}
                                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all ${
                                    errors.bankName ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                                }`}
                            >
                                <option value="">Select your bank</option>
                                {popularBanks.map(bank => (
                                    <option key={bank} value={bank}>{bank}</option>
                                ))}
                                <option value="other">Other Bank</option>
                            </select>
                            {formData.bankName === 'other' && (
                                <input
                                    type="text"
                                    placeholder="Enter bank name"
                                    value={formData.bankName === 'other' ? '' : formData.bankName}
                                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 mt-2"
                                />
                            )}
                            {errors.bankName && (
                                <p className="text-sm text-red-600 mt-1">{errors.bankName}</p>
                            )}
                        </div>

                        {/* Account Holder Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                <User className="inline w-4 h-4 mr-1 text-orange-600" />
                                Account Holder Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.accountHolderName}
                                onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value.toUpperCase() })}
                                placeholder="JOHN DOE"
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all uppercase ${
                                    errors.accountHolderName ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                                }`}
                            />
                            <p className="text-xs text-gray-500 mt-1">Enter name exactly as it appears on your bank account</p>
                            {errors.accountHolderName && (
                                <p className="text-sm text-red-600 mt-1">{errors.accountHolderName}</p>
                            )}
                        </div>

                        {/* Account Number */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                <CreditCard className="inline w-4 h-4 mr-1 text-orange-600" />
                                Account Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.accountNumber}
                                onChange={(e) => {
                                    // Only allow digits and spaces
                                    const value = e.target.value.replace(/[^\d\s]/g, '');
                                    setFormData({ ...formData, accountNumber: value });
                                }}
                                placeholder="1234 5678 9012 3456"
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 font-mono text-lg transition-all ${
                                    errors.accountNumber ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                                }`}
                                maxLength={24} // Max 20 digits + 4 spaces
                            />
                            <p className="text-xs text-gray-500 mt-1">Enter your bank account number (10-20 digits)</p>
                            {errors.accountNumber && (
                                <p className="text-sm text-red-600 mt-1">{errors.accountNumber}</p>
                            )}
                        </div>

                        {/* Preview Toggle */}
                        {isFormValid && (
                            <button
                                type="button"
                                onClick={() => setShowPreview(!showPreview)}
                                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                            >
                                {showPreview ? '👁️ Hide Preview' : '👁️ Preview Card'}
                            </button>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={saving || !isFormValid}
                                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Save className="w-5 h-5" />
                                {saving ? 'Saving...' : 'Save Bank Details'}
                            </button>
                            
                            {onCancel && (
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Preview Section */}
                <div className="flex items-center justify-center">
                    {showPreview && isFormValid ? (
                        <div className="space-y-4">
                            <div className="text-center mb-4">
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Preview</h3>
                                <p className="text-sm text-gray-600">This is how customers will see your payment details</p>
                            </div>
                            <PaymentCard
                                bankName={formData.bankName}
                                accountHolderName={formData.accountHolderName}
                                accountNumber={formData.accountNumber}
                                size="medium"
                            />
                        </div>
                    ) : (
                        <div className="text-center text-gray-400 p-12">
                            <CreditCard className="w-24 h-24 mx-auto mb-4 opacity-20" />
                            <p className="text-lg font-semibold">Fill in your bank details</p>
                            <p className="text-sm mt-2">Preview will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BankDetailsForm;
