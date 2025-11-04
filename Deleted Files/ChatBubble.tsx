/**
 * Chat Bubble Component
 * Displays a message with auto-translation toggle
 * Small 🌐 icon to flip between translated and original text
 */

import React, { useState } from 'react';
import { ChatMessage, MessageSenderType } from '../types';

interface ChatBubbleProps {
    message: ChatMessage;
    currentUserId: string;
    currentUserLanguage: 'en' | 'id';
    senderPhoto?: string;
    recipientPhoto?: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
    message,
    currentUserId,
    currentUserLanguage,
    senderPhoto,
    recipientPhoto
}) => {
    const [showOriginal, setShowOriginal] = useState(false);

    const isMyMessage = message.senderId === currentUserId;
    const isSystemMessage = message.senderType === MessageSenderType.System;

    // Determine which text to show
    const displayText = showOriginal 
        ? message.originalText 
        : (message.translatedText || message.originalText);

    const wasTranslated = message.originalLanguage !== currentUserLanguage 
        && message.translatedText 
        && message.translatedText !== message.originalText;

    // System messages are centered
    if (isSystemMessage) {
        return (
            <div className="flex justify-center my-3">
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm max-w-md text-center">
                    {currentUserLanguage === 'en' ? message.originalText : message.translatedText}
                </div>
            </div>
        );
    }

    return (
        <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} mb-3 gap-2`}>
            {/* Profile image on left for other person's messages */}
            {!isMyMessage && senderPhoto && (
                <div className="flex-shrink-0 mt-auto">
                    <img 
                        src={senderPhoto}
                        alt={message.senderName}
                        className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(message.senderName || 'U')}&background=f97316&color=fff&bold=true`;
                        }}
                    />
                </div>
            )}

            <div className={`max-w-[75%] ${isMyMessage ? 'items-end' : 'items-start'}`}>
                {/* Sender name (only for other person's messages) */}
                {!isMyMessage && (
                    <div className="text-xs text-gray-500 mb-1 px-2">
                        {message.senderName}
                    </div>
                )}

                {/* Message bubble */}
                <div className="relative group">
                    <div
                        className={`
                            px-4 py-2.5 rounded-2xl shadow-sm
                            ${isMyMessage 
                                ? 'bg-orange-500 text-white rounded-tr-sm' 
                                : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                            }
                        `}
                    >
                        <p className="text-sm whitespace-pre-wrap break-words">
                            {displayText}
                        </p>

                        {/* Translation indicator badge */}
                        {wasTranslated && !showOriginal && (
                            <div className="flex items-center gap-1 mt-1 text-xs opacity-70">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z" clipRule="evenodd" />
                                </svg>
                                <span>Translated</span>
                            </div>
                        )}
                    </div>

                    {/* Translation toggle button */}
                    {wasTranslated && (
                        <button
                            onClick={() => setShowOriginal(!showOriginal)}
                            className={`
                                absolute top-1 ${isMyMessage ? 'left-1' : 'right-1'}
                                p-1.5 rounded-full transition-all
                                ${isMyMessage 
                                    ? 'bg-white/20 hover:bg-white/30' 
                                    : 'bg-gray-200 hover:bg-gray-300'
                                }
                                opacity-0 group-hover:opacity-100
                            `}
                            title={showOriginal ? 'Show translation' : 'Show original'}
                        >
                            <svg 
                                className={`w-4 h-4 ${isMyMessage ? 'text-white' : 'text-gray-700'}`} 
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                            >
                                <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Timestamp and read status */}
                <div className={`flex items-center gap-1 mt-1 px-2 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-xs text-gray-500">
                        {new Date(message.createdAt || '').toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </span>
                    {isMyMessage && message.isRead && (
                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    )}
                </div>
            </div>

            {/* Profile image on right for current user's messages */}
            {isMyMessage && recipientPhoto && (
                <div className="flex-shrink-0 mt-auto">
                    <img 
                        src={recipientPhoto}
                        alt="You"
                        className="w-8 h-8 rounded-full object-cover border-2 border-orange-200"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(message.senderName || 'You')}&background=f97316&color=fff&bold=true`;
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default ChatBubble;
