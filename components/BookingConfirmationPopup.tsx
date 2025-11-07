import React, { useState, useEffect } from 'react';

interface TherapistBankDetails {
    bankName?: string;
    bankAccountNumber?: string;
    bankAccountName?: string;
    mobilePaymentNumber?: string;
    mobilePaymentType?: string;
}

interface BookingConfirmationPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenChat: () => void;
    providerName: string;
    language: 'en' | 'id';
    bookingAmount?: number;
    duration?: number;
    therapistBankDetails?: TherapistBankDetails;
}

const BookingConfirmationPopup: React.FC<BookingConfirmationPopupProps> = ({
    isOpen,
    onClose,
    onOpenChat,
    providerName,
    language,
    bookingAmount,
    duration,
    therapistBankDetails
}) => {
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        if (isOpen && countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (isOpen && countdown === 0) {
            // Auto open chat after countdown
            const openTimer = setTimeout(() => {
                onOpenChat();
                onClose();
            }, 500);
            return () => clearTimeout(openTimer);
        }
    }, [isOpen, countdown, onOpenChat, onClose]);

    // Reset countdown when popup opens
    useEffect(() => {
        if (isOpen) {
            setCountdown(3);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const translations = {
        en: {
            title: "Booking Placed Successfully!",
            message: `Your booking request has been sent to ${providerName}.`,
            chatRedirect: "You will be redirected to the chat window to communicate directly with your therapist.",
            waitMessage: "Please wait for the therapist to reply.",
            redirectingIn: "Opening chat in",
            seconds: "seconds...",
            openNow: "Open Chat Now",
            paymentInfo: "Payment Information",
            cashPayment: "💵 Cash Payment",
            cashRequired: "Cash payment due after your massage",
            exactAmount: "Please ensure you have the exact amount",
            bankTransfer: "🏦 Bank Transfer Available",
            bankName: "Bank",
            accountNumber: "Account Number",
            accountName: "Account Name",
            eWallet: "📱 E-Wallet Available",
            transfersAccepted: "Transfers accepted to the following account"
        },
        id: {
            title: "Booking Berhasil Ditempatkan!",
            message: `Permintaan booking Anda telah dikirim ke ${providerName}.`,
            chatRedirect: "Anda akan diarahkan ke jendela chat untuk berkomunikasi langsung dengan terapis Anda.",
            waitMessage: "Silakan tunggu terapis membalas.",
            redirectingIn: "Membuka chat dalam",
            seconds: "detik...",
            openNow: "Buka Chat Sekarang",
            paymentInfo: "Informasi Pembayaran",
            cashPayment: "💵 Pembayaran Tunai",
            cashRequired: "Pembayaran tunai setelah pijat selesai",
            exactAmount: "Harap siapkan uang pas",
            bankTransfer: "🏦 Transfer Bank Tersedia",
            bankName: "Bank",
            accountNumber: "Nomor Rekening",
            accountName: "Nama Rekening",
            eWallet: "📱 E-Wallet Tersedia",
            transfersAccepted: "Transfer diterima ke rekening berikut"
        }
    };

    const t = translations[language];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform animate-slideUp">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-2xl p-6 text-white text-center">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold">{t.title}</h2>
                </div>

                {/* Content */}
                <div className="p-6 text-center">
                    <p className="text-gray-700 text-lg mb-4">{t.message}</p>
                    
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg mb-6">
                        <p className="text-blue-800 text-sm font-medium">{t.chatRedirect}</p>
                        <p className="text-blue-600 text-sm mt-1">{t.waitMessage}</p>
                    </div>

                    {/* Payment Information */}
                    {bookingAmount && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                                <span className="text-green-600 mr-2">💳</span>
                                {t.paymentInfo}
                            </h3>
                            
                            {/* Booking Amount */}
                            <div className="bg-white rounded-lg p-3 mb-4 border border-green-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 font-medium">
                                        {duration ? `${duration} min massage` : 'Total Amount'}:
                                    </span>
                                    <span className="text-2xl font-bold text-green-600">
                                        Rp {bookingAmount.toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>

                            {/* Cash Payment (Always Available) */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                                <div className="flex items-start gap-2">
                                    <span className="text-yellow-600 text-lg">💵</span>
                                    <div className="flex-1">
                                        <p className="font-semibold text-yellow-800">{t.cashPayment}</p>
                                        <p className="text-yellow-700 text-sm">{t.cashRequired}</p>
                                        <p className="text-yellow-600 text-xs mt-1">{t.exactAmount}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Bank Transfer (If Available) */}
                            {therapistBankDetails?.bankName && therapistBankDetails?.bankAccountNumber && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                                    <div className="flex items-start gap-2 mb-2">
                                        <span className="text-blue-600 text-lg">🏦</span>
                                        <div className="flex-1">
                                            <p className="font-semibold text-blue-800">{t.bankTransfer}</p>
                                            <p className="text-blue-700 text-sm mb-2">{t.transfersAccepted}:</p>
                                            
                                            <div className="bg-white rounded-md p-2 border border-blue-100">
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">{t.bankName}:</span>
                                                        <span className="font-semibold text-gray-800">{therapistBankDetails.bankName}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">{t.accountNumber}:</span>
                                                        <span className="font-mono font-bold text-gray-800">{therapistBankDetails.bankAccountNumber}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">{t.accountName}:</span>
                                                        <span className="font-semibold text-gray-800">{therapistBankDetails.bankAccountName}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* E-Wallet (If Available) */}
                            {therapistBankDetails?.mobilePaymentNumber && therapistBankDetails?.mobilePaymentType && (
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                    <div className="flex items-start gap-2">
                                        <span className="text-purple-600 text-lg">📱</span>
                                        <div className="flex-1">
                                            <p className="font-semibold text-purple-800">{t.eWallet}</p>
                                            <div className="bg-white rounded-md p-2 border border-purple-100 mt-2">
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Type:</span>
                                                        <span className="font-semibold text-gray-800">{therapistBankDetails.mobilePaymentType}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Number:</span>
                                                        <span className="font-mono font-bold text-gray-800">{therapistBankDetails.mobilePaymentNumber}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Countdown */}
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full">
                            <span className="text-2xl font-bold text-orange-600">{countdown}</span>
                        </div>
                        <div className="text-left">
                            <p className="text-sm text-gray-600">{t.redirectingIn}</p>
                            <p className="text-xs text-gray-500">{t.seconds}</p>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                onOpenChat();
                                onClose();
                            }}
                            className="flex-1 py-3 px-4 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                        >
                            {t.openNow}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingConfirmationPopup;