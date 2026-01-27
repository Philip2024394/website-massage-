interface ChatInputProps {
    newMessage: string;
    setNewMessage: (value: string) => void;
    sendMessage: () => void;
    sending: boolean;
    bookingStatus: 'pending' | 'accepted' | 'rejected' | null;
    waitingForResponse: boolean;
    providerName: string;
    language: 'en' | 'id';
}

const ChatInput = ({
    newMessage,
    setNewMessage,
    sendMessage,
    sending,
    bookingStatus,
    waitingForResponse,
    providerName,
    language
}: ChatInputProps): JSX.Element => {
    if (bookingStatus === 'pending' || waitingForResponse) {
        return (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-orange-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center animate-pulse">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-gray-900 mb-1">🔒 {language === 'id' ? `Menunggu ${providerName} Menerima` : `Waiting for ${providerName} to Accept`}</p>
                        <p className="text-sm text-gray-700">
                            {waitingForResponse ? (
                                <>
                                    {language === 'id' 
                                        ? `Permintaan booking Anda telah terkirim. Chat akan aktif setelah ${providerName} menerima booking Anda.`
                                        : `Your booking request has been sent. Chat will be enabled once ${providerName} accepts your booking.`
                                    }
                                    <br />
                                    <span className="text-xs text-orange-600 mt-1 inline-block">
                                        ⏳ {language === 'id' ? 'Mohon tunggu respons...' : 'Please wait for response...'}
                                    </span>
                                </>
                            ) : (
                                language === 'id' 
                                    ? 'Silakan kirim permintaan booking terlebih dahulu untuk mulai chat.'
                                    : 'Please send a booking request first to start chatting.'
                            )}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (bookingStatus === 'rejected') {
        return (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-red-900 mb-1">
                            ❌ {language === 'id' ? 'Booking Ditolak' : 'Booking Declined'}
                        </p>
                        <p className="text-sm text-red-700">
                            {language === 'id' 
                                ? `${providerName} tidak dapat menerima booking ini. Kami mencari terapis alternatif untuk Anda.`
                                : `${providerName} was unable to accept this booking. We are searching for an alternative therapist for you.`
                            }
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex space-x-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder={language === 'id' ? 'Ketik pesan Anda...' : 'Type your message...'}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                    disabled={sending}
                />
                <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="bg-orange-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                >
                    {sending ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    )}
                </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 px-1">
                {language === 'id' ? 'Tekan Enter untuk kirim • Shift+Enter untuk baris baru' : 'Press Enter to send • Shift+Enter for new line'}
            </p>
            <p className="text-xs text-amber-600 mt-1 px-1">
                ⚠️ {language === 'id' ? 'Membagikan nomor telepon atau WhatsApp tidak diizinkan' : 'Sharing phone numbers or WhatsApp is not allowed'}
            </p>
        </>
    );
};

export default ChatInput;
