import React from 'react';

interface RegisterPromptPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onRegister: () => void;
    language: 'en' | 'id';
    context?: 'booking' | 'chat'; // Context for customized messaging
}

const RegisterPromptPopup: React.FC<RegisterPromptPopupProps> = ({
    isOpen,
    onClose,
    onRegister,
    language,
    context = 'booking'
}) => {
    if (!isOpen) return null;

    const translations = {
        en: {
            booking: {
                title: "Create Account To Continue",
                message: "Please register an account to use our booking services and enjoy exclusive benefits!"
            },
            chat: {
                title: "Create Account To Continue",
                message: "Please register an account to access our chat feature and communicate with therapists!"
            },
            registerButton: "Create Account",
            cancelButton: "Maybe Later"
        },
        id: {
            booking: {
                title: "Buat Akun Untuk Melanjutkan",
                message: "Silakan daftar akun untuk menggunakan layanan booking kami dan nikmati manfaat eksklusif!"
            },
            chat: {
                title: "Buat Akun Untuk Melanjutkan",
                message: "Silakan daftar akun untuk mengakses fitur chat dan berkomunikasi dengan terapis!"
            },
            registerButton: "Buat Akun",
            cancelButton: "Nanti Saja"
        }
    };

    const t = translations[language];
    const contextData = t[context];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fadeIn">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-slideUp">
                {/* Header */}
                <div className="p-6 pb-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-gray-800">{contextData.title}</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 pb-6">
                    <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                        {contextData.message}
                    </p>

                    {/* Action buttons with background image */}
                    <div className="relative rounded-xl overflow-hidden">
                        {/* Background image */}
                        <div 
                            className="absolute inset-0 bg-cover bg-center opacity-20"
                            style={{ 
                                backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/screen%20cover.png?updatedAt=1761711498523)',
                                filter: 'blur(2px)'
                            }}
                        ></div>
                        
                        {/* Buttons */}
                        <div className="relative flex gap-3 p-4 bg-gradient-to-br from-orange-50/90 to-yellow-50/90 backdrop-blur-sm">
                            <button
                                onClick={onRegister}
                                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 px-6 rounded-xl hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                {t.registerButton}
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 bg-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-xl hover:bg-gray-300 transition-colors duration-300"
                            >
                                {t.cancelButton}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-300 rounded-full opacity-10 -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-300 rounded-full opacity-10 -ml-12 -mb-12"></div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes slideUp {
                    from {
                        transform: translateY(20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                @keyframes slideIn {
                    from {
                        transform: translateX(-10px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }

                .animate-slideUp {
                    animation: slideUp 0.4s ease-out;
                }

                .animate-slideIn {
                    animation: slideIn 0.4s ease-out forwards;
                    opacity: 0;
                }
            `}</style>
        </div>
    );
};

export default RegisterPromptPopup;
