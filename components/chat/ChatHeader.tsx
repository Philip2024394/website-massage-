interface ChatHeaderProps {
    providerName: string;
    providerPhoto?: string;
    providerStatus?: string;
    providerRating?: number;
    isMinimized: boolean;
    onMinimize: () => void;
    onClose: () => void;
    language: 'en' | 'id';
}

const ChatHeader = ({
    providerName,
    providerPhoto,
    providerStatus = 'Available',
    providerRating,
    isMinimized,
    onMinimize,
    onClose,
    language
}: ChatHeaderProps): JSX.Element => {
    const getStatusColor = (status: string): string => {
        switch (status.toLowerCase()) {
            case 'available': return 'bg-green-500';
            case 'busy': return 'bg-yellow-500';
            case 'offline': return 'bg-gray-400';
            default: return 'bg-gray-400';
        }
    };

    return (
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-4 rounded-t-lg flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                    <img
                        src={providerPhoto || 'https://via.placeholder.com/40'}
                        alt={providerName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                    />
                    <div className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(providerStatus)} rounded-full border-2 border-white`} />
                </div>
                
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate">{providerName}</h3>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-orange-100 capitalize">{providerStatus}</span>
                        {providerRating && (
                            <>
                                <span className="text-orange-200">•</span>
                                <div className="flex items-center gap-1">
                                    <svg className="w-4 h-4 fill-yellow-300" viewBox="0 0 20 20">
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                    </svg>
                                    <span className="font-semibold">{providerRating.toFixed(1)}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
                <button
                    onClick={onMinimize}
                    className="hover:bg-orange-500 p-2 rounded-lg transition-colors"
                    aria-label={isMinimized ? (language === 'id' ? 'Buka' : 'Expand') : (language === 'id' ? 'Minimalkan' : 'Minimize')}
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMinimized ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                    </svg>
                </button>
                <button
                    onClick={onClose}
                    className="hover:bg-orange-500 p-2 rounded-lg transition-colors"
                    aria-label={language === 'id' ? 'Tutup' : 'Close'}
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default ChatHeader;
