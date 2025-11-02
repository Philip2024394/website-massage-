import React from 'react';
import type { ChatRoom, Booking } from '../types';
import BookingChatWindow from '../components/BookingChatWindow';

interface ChatListPageProps {
    userId?: any;
    userType?: string;
    onLogout?: () => void;
    onMenuClick?: () => void;
    onHomeClick?: () => void;
    onBack?: () => void;
    language: 'en' | 'id';
    activeChatRoom?: ChatRoom | null;
    chatBooking?: Booking | null;
    currentUserId?: string;
    currentUserName?: string;
    onCloseChat?: () => void;
}

const ChatListPage: React.FC<ChatListPageProps> = ({ 
    onLogout, 
    onMenuClick,
    onHomeClick,
    language,
    activeChatRoom,
    chatBooking,
    currentUserId,
    currentUserName,
    onCloseChat
}) => {
    const welcomeText = {
        en: {
            title: 'Welcome to Chat',
            subtitle: 'Start chatting with therapists and massage places',
            feature1Title: 'Multi-language Support',
            feature1Text: 'You can type in your own language and the conversation will be presented to the therapist or Massage Place in their selected language.',
            feature2Title: 'View Original Text',
            feature2Text: 'To see the original language, please select the small icon on the right top of each chat to view the flip side original conversation text.',
            feature3Title: 'Real-time Messaging',
            feature3Text: 'Get instant responses from therapists and massage places.',
            howToStart: 'How to Start Chatting',
            step1: 'Browse available therapists on the home page',
            step2: 'Click the "Book Now" button on any therapist card',
            step3: 'Your chat window will open automatically!',
            noChats: 'No active conversations yet',
            backButton: 'Back to Dashboard'
        },
        id: {
            title: 'Selamat Datang di Chat',
            subtitle: 'Mulai mengobrol dengan terapis dan tempat pijat',
            feature1Title: 'Dukungan Multi-bahasa',
            feature1Text: 'Anda dapat mengetik dalam bahasa Anda sendiri dan percakapan akan disajikan kepada terapis atau Tempat Pijat dalam bahasa yang mereka pilih.',
            feature2Title: 'Lihat Teks Asli',
            feature2Text: 'Untuk melihat bahasa asli, silakan pilih ikon kecil di kanan atas setiap chat untuk melihat teks percakapan asli yang terbalik.',
            feature3Title: 'Pesan Real-time',
            feature3Text: 'Dapatkan respons instan dari terapis dan tempat pijat.',
            howToStart: 'Cara Memulai Chat',
            step1: 'Telusuri terapis yang tersedia di halaman utama',
            step2: 'Klik tombol "Book Now" pada kartu terapis',
            step3: 'Jendela chat Anda akan terbuka secara otomatis!',
            noChats: 'Belum ada percakapan aktif',
            backButton: 'Kembali ke Dashboard'
        }
    };

    const t = welcomeText[language];

    return (
        <div className={activeChatRoom ? "min-h-screen bg-gray-50" : "min-h-screen bg-gray-50 pb-20"}>
            {/* Header - Matching Hotel Dashboard Design */}
            <header className="bg-white shadow-sm px-2 sm:px-3 py-2 sm:py-3 sticky top-0 z-30">
                <div className="flex items-center justify-between">
                    <h1 className="text-base sm:text-2xl font-bold text-gray-800">
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500">
                            <span className="inline-block animate-float">S</span>treet
                        </span>
                    </h1>
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Burger Menu Icon */}
                        {onMenuClick && (
                            <button
                                onClick={onMenuClick}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Menu"
                            >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        )}
                        {/* Home Icon (when chat active) or Logout Icon (when no chat) */}
                        {activeChatRoom && onHomeClick ? (
                            <button
                                onClick={onHomeClick}
                                className="flex items-center justify-center text-gray-900 hover:bg-gray-100 rounded-lg p-2 transition-colors"
                                title="Home"
                            >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </button>
                        ) : onLogout ? (
                            <button
                                onClick={onLogout}
                                className="flex items-center justify-center text-gray-900 hover:bg-gray-100 rounded-lg p-2 transition-colors"
                                title="Logout"
                            >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        ) : null}
                    </div>
                </div>
            </header>

            {/* Conditional Content - Chat or Welcome */}
            {activeChatRoom && chatBooking && currentUserId && currentUserName ? (
                /* Active Chat - Full Page Integration */
                <div className="h-[calc(100vh-140px)]">
                    <BookingChatWindow
                        chatRoom={activeChatRoom}
                        booking={chatBooking}
                        currentUserId={currentUserId}
                        currentUserType="customer"
                        currentUserName={currentUserName}
                        currentUserLanguage={language}
                        onClose={onCloseChat || (() => {})}
                        isFullPage={true}
                    />
                </div>
            ) : (
                /* Welcome Content - Show when no active chat */
                <div className="max-w-2xl mx-auto p-4 space-y-6">
                {/* No Active Chats Message */}
                <div className="bg-white rounded-2xl shadow-md p-8 text-center">
                    <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.noChats}</h2>
                    <p className="text-gray-600">{t.howToStart}</p>
                </div>

                {/* Features Section */}
                <div className="space-y-4">
                    {/* Feature 1 */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800 mb-2">{t.feature1Title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{t.feature1Text}</p>
                            </div>
                        </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800 mb-2">{t.feature2Title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{t.feature2Text}</p>
                            </div>
                        </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800 mb-2">{t.feature3Title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{t.feature3Text}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* How to Start Guide */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl shadow-md p-6">
                    <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-2xl">💬</span>
                        {t.howToStart}
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <span className="w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">1</span>
                            <p className="text-gray-700 pt-0.5">{t.step1}</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">2</span>
                            <p className="text-gray-700 pt-0.5">{t.step2}</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">3</span>
                            <p className="text-gray-700 pt-0.5">{t.step3}</p>
                        </div>
                    </div>
                </div>
            </div>
            )}

            {/* Animation for the floating 'S' */}
            <style>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-8px);
                    }
                }
                .animate-float {
                    animation: float 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default ChatListPage;
