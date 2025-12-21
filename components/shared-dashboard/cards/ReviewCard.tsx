/**
 * ReviewCard - Shared review display component
 */

import React from 'react';

export interface ReviewCardProps {
    id: string | number;
    customerName: string;
    rating: number;
    comment?: string;
    date: string;
    service?: string;
    customerAvatar?: string;
    onReply?: (reply: string) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
    customerName,
    rating,
    comment,
    date,
    service,
    customerAvatar,
    onReply,
}) => {
    const [showReply, setShowReply] = React.useState(false);
    const [replyText, setReplyText] = React.useState('');

    const handleSubmitReply = () => {
        if (onReply && replyText.trim()) {
            onReply(replyText);
            setReplyText('');
            setShowReply(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start space-x-4">
                {customerAvatar ? (
                    <img
                        src={customerAvatar}
                        alt={customerName}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-600 text-xl">👤</span>
                    </div>
                )}
                
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h4 className="font-semibold text-gray-900">{customerName}</h4>
                            {service && <p className="text-xs text-gray-600">{service}</p>}
                        </div>
                        <span className="text-xs text-gray-500">{date}</span>
                    </div>
                    
                    <div className="flex items-center mb-2">
                        {[...Array(5)].map((_, i) => (
                            <span
                                key={i}
                                className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            >
                                ★
                            </span>
                        ))}
                        <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
                    </div>
                    
                    {comment && (
                        <p className="text-sm text-gray-700 mb-3">{comment}</p>
                    )}
                    
                    {onReply && (
                        <>
                            {!showReply ? (
                                <button
                                    onClick={() => setShowReply(true)}
                                    className="text-sm text-blue-600 hover:text-blue-700"
                                >
                                    Reply
                                </button>
                            ) : (
                                <div className="mt-3">
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Write your reply..."
                                        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows={3}
                                    />
                                    <div className="flex space-x-2 mt-2">
                                        <button
                                            onClick={handleSubmitReply}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                                        >
                                            Send Reply
                                        </button>
                                        <button
                                            onClick={() => setShowReply(false)}
                                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewCard;
