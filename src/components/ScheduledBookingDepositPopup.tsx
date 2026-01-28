import React, { useState } from 'react';
import { Clock, CreditCard, AlertTriangle, Shield, Calendar, X, CheckCircle } from 'lucide-react';

interface ScheduledBookingDepositPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmDeposit: (depositData: DepositData) => void;
    bookingDetails: {
        therapistName: string;
        serviceDuration: number;
        totalPrice: number;
        scheduledDate: string;
        scheduledTime: string;
        location: string;
    };
    depositPercentage: number;
    className?: string;
}

interface DepositData {
    amount: number;
    method: 'bank_transfer';
    termsAccepted: boolean;
    paymentProof?: File;
}

const ScheduledBookingDepositPopup: React.FC<ScheduledBookingDepositPopupProps> = ({
    isOpen,
    onClose,
    onConfirmDeposit,
    bookingDetails,
    depositPercentage = 30,
    className = ''
}) => {
    const [step, setStep] = useState<'terms' | 'payment' | 'confirmation'>('terms');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [paymentProof, setPaymentProof] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [depositData, setDepositData] = useState<DepositData>({
        amount: 0,
        method: 'bank_transfer',
        termsAccepted: false
    });

    const depositAmount = Math.round((bookingDetails.totalPrice * depositPercentage) / 100);
    const remainingAmount = bookingDetails.totalPrice - depositAmount;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert('File size must be less than 5MB');
                return;
            }
            setPaymentProof(file);
        }
    };

    const handleConfirmDeposit = () => {
        if (!termsAccepted || !paymentProof) return;

        const data: DepositData = {
            amount: depositAmount,
            method: 'bank_transfer',
            termsAccepted,
            paymentProof
        };

        onConfirmDeposit(data);
    };

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 bg-black/60 flex items-center justify-center z-[110] p-4 ${className}`}>
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="w-6 h-6" />
                                <h2 className="text-xl font-bold">Scheduled Booking Deposit</h2>
                            </div>
                            <p className="text-red-100 text-sm">Non-refundable deposit required</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {/* Booking Summary */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-orange-600" />
                            Booking Summary
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Therapist:</span>
                                <span className="font-medium">{bookingDetails.therapistName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Service:</span>
                                <span className="font-medium">{bookingDetails.serviceDuration} min massage</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Date:</span>
                                <span className="font-medium">{formatDate(bookingDetails.scheduledDate)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Time:</span>
                                <span className="font-medium">{bookingDetails.scheduledTime}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Location:</span>
                                <span className="font-medium">{bookingDetails.location}</span>
                            </div>
                            <div className="border-t pt-2 mt-3">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total Price:</span>
                                    <span>{formatCurrency(bookingDetails.totalPrice)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Deposit Information */}
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <h4 className="font-bold text-red-900 mb-2">Deposit Required</h4>
                                <div className="space-y-2 text-sm text-red-800">
                                    <div className="bg-white rounded-lg p-3">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-medium">Deposit ({depositPercentage}%):</span>
                                            <span className="font-bold text-lg">{formatCurrency(depositAmount)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-gray-600">
                                            <span>Remaining (pay after service):</span>
                                            <span className="font-medium">{formatCurrency(remainingAmount)}</span>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <p className="font-semibold text-red-900 mb-1">⚠️ Important Terms:</p>
                                        <ul className="space-y-1 text-xs">
                                            <li>• Deposit is <strong>NON-REFUNDABLE</strong> under any circumstances</li>
                                            <li>• Dates may be changed in advance with therapist agreement</li>
                                            <li>• Time slots can be booked outside calendar window</li>
                                            <li>• Remaining amount paid after service completion</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step Content */}
                    {step === 'terms' && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-900 mb-4">Booking Terms & Conditions</h3>
                            
                            <div className="space-y-4">
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-yellow-900 mb-2">Deposit Policy</h4>
                                    <ul className="text-sm text-yellow-800 space-y-1">
                                        <li>• {depositPercentage}% deposit required to confirm scheduled booking</li>
                                        <li>• Deposit is <strong>completely NON-REFUNDABLE</strong></li>
                                        <li>• No exceptions for cancellations or no-shows</li>
                                    </ul>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-blue-900 mb-2">Date Change Policy</h4>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• Dates may be changed with advance notice (minimum 24 hours)</li>
                                        <li>• Changes require agreement from therapist</li>
                                        <li>• Deposit transfers to new date if change approved</li>
                                        <li>• Changes subject to therapist availability</li>
                                    </ul>
                                </div>

                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-green-900 mb-2">Booking Flexibility</h4>
                                    <ul className="text-sm text-green-800 space-y-1">
                                        <li>• Time slots available beyond displayed calendar window</li>
                                        <li>• Special time requests can be accommodated</li>
                                        <li>• Early morning and late evening slots possible</li>
                                        <li>• Contact therapist directly for special arrangements</li>
                                    </ul>
                                </div>
                            </div>

                            <label className="flex items-start gap-3 p-4 bg-gray-50 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                    className="mt-1 w-5 h-5 text-red-500 rounded focus:ring-2 focus:ring-red-500"
                                />
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-900 mb-1">
                                        I accept all terms and conditions
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        I understand the deposit is non-refundable and agree to the booking policies above.
                                    </p>
                                </div>
                            </label>

                            <button
                                onClick={() => setStep('payment')}
                                disabled={!termsAccepted}
                                className="w-full py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Proceed to Payment
                            </button>
                        </div>
                    )}

                    {step === 'payment' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <button
                                    onClick={() => setStep('terms')}
                                    className="text-red-600 text-sm font-medium"
                                >
                                    ← Back to Terms
                                </button>
                                <h3 className="font-bold text-gray-900">Payment Required</h3>
                            </div>

                            <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-4 text-center">
                                <CreditCard className="w-12 h-12 text-red-600 mx-auto mb-3" />
                                <h4 className="text-xl font-bold text-red-900 mb-1">
                                    Deposit: {formatCurrency(depositAmount)}
                                </h4>
                                <p className="text-sm text-red-700">
                                    Transfer exact amount to secure your appointment
                                </p>
                            </div>

                            <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
                                <h4 className="font-semibold text-gray-900 mb-3">Bank Transfer Instructions</h4>
                                <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-2">
                                    <p><strong>Bank:</strong> BCA (Bank Central Asia)</p>
                                    <p><strong>Account Number:</strong> 1234-5678-9012</p>
                                    <p><strong>Account Name:</strong> PT IndaStreet Massage</p>
                                    <p><strong>Amount:</strong> {formatCurrency(depositAmount)}</p>
                                </div>
                                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-xs text-blue-800">
                                        <strong>Important:</strong> Transfer the exact amount shown above. 
                                        Upload proof of transfer below to complete booking.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload Payment Proof <span className="text-red-500">*</span>
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-red-400 transition-colors">
                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        id="payment-proof"
                                    />
                                    <label htmlFor="payment-proof" className="cursor-pointer">
                                        <div className="space-y-2">
                                            <CreditCard className="w-8 h-8 text-gray-400 mx-auto" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {paymentProof ? paymentProof.name : 'Click to upload payment proof'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Support: JPG, PNG, PDF (Max 5MB)
                                                </p>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <button
                                onClick={handleConfirmDeposit}
                                disabled={!paymentProof || uploading}
                                className="w-full py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {uploading ? 'Processing...' : '✅ Confirm Deposit Payment'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScheduledBookingDepositPopup;