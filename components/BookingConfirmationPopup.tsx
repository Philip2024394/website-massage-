import React, { useState, useEffect } from 'react';

interface BookingConfirmationPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenChat: () => void;
    providerName: string;
    language: 'en' | 'id';
}

const BookingConfirmationPopup: React.FC<BookingConfirmationPopupProps> = ({
    isOpen,
    onClose,
    onOpenChat,
    providerName,
    language
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
            openNow: "Open Chat Now"
        },
        id: {
            title: "Booking Berhasil Ditempatkan!",
            message: `Permintaan booking Anda telah dikirim ke ${providerName}.`,
            chatRedirect: "Anda akan diarahkan ke jendela chat untuk berkomunikasi langsung dengan terapis Anda.",
            waitMessage: "Silakan tunggu terapis membalas.",
            redirectingIn: "Membuka chat dalam",
            seconds: "detik...",
            openNow: "Buka Chat Sekarang"
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