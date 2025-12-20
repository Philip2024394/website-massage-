import { Message } from '../../types/chat';

interface ChatMessageProps {
    message: Message;
    isOwnMessage: boolean;
    selectedAvatar: string;
    customerName: string;
    language: 'en' | 'id';
    formatTime: (date: string) => string;
}

const ChatMessage = ({
    message: msg,
    isOwnMessage,
    selectedAvatar,
    customerName,
    language,
    formatTime
}: ChatMessageProps): JSX.Element => {
    const isSystemMessage = msg.messageType === 'system' || msg.messageType === 'booking';
    const messageText = msg.content || msg.message || '';

    const parseMessageForLinks = (text: string): JSX.Element[] => {
        const lines = text.split('\n');
        return lines.map((line, idx) => {
            // Check for Google Maps link pattern
            const googleMapsMatch = line.match(/🗺️\s*Location:\s*(https:\/\/www\.google\.com\/maps[^\s]+)/);
            if (googleMapsMatch) {
                const url = googleMapsMatch[1];
                const parts = line.split(url);
                return (
                    <div key={idx} className="flex items-center gap-2">
                        {parts[0]}
                        <a 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 underline font-medium"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {language === 'id' ? 'Lihat di Peta' : 'View on Map'}
                        </a>
                        {parts[1]}
                    </div>
                );
            }
            return <div key={idx}>{line}</div>;
        });
    };

    return (
        <div className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} ${isSystemMessage ? 'justify-center' : ''}`}>
            {/* Avatar for therapist messages */}
            {!isOwnMessage && !isSystemMessage && (
                <img
                    src={msg.senderAvatar || 'https://via.placeholder.com/32'}
                    alt={msg.senderName}
                    className="w-8 h-8 rounded-full object-cover border-2 border-gray-300 flex-shrink-0"
                />
            )}

            <div className={`max-w-[75%] ${isSystemMessage ? 'max-w-[90%]' : ''}`}>
                {/* Message bubble */}
                <div className={`
                    p-3 rounded-2xl shadow-md
                    ${isSystemMessage 
                        ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200' 
                        : isOwnMessage 
                            ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-tr-none' 
                            : 'bg-white border border-gray-200 rounded-tl-none'
                    }
                `}>
                    <div className={`text-sm whitespace-pre-wrap break-words ${isSystemMessage ? 'text-center text-gray-800 font-medium' : ''}`}>
                        {parseMessageForLinks(messageText)}
                    </div>
                    <div className={`text-xs mt-1 ${
                        isSystemMessage ? 'text-blue-600 text-center' :
                        isOwnMessage ? 'text-orange-100' : 'text-gray-500'
                    }`}>
                        {formatTime(msg.sentAt || msg.$createdAt)}
                    </div>
                </div>
            </div>

            {/* Avatar for customer messages */}
            {isOwnMessage && !isSystemMessage && (
                <img
                    src={msg.senderAvatar || selectedAvatar}
                    alt={customerName}
                    className="w-8 h-8 rounded-full object-cover border-2 border-orange-500 flex-shrink-0"
                />
            )}
        </div>
    );
};

export default ChatMessage;
