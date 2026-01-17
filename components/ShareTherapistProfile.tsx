/**
 * ShareTherapistProfile Component - LinkedIn/Amazon-Level Share Functionality
 * 
 * Features:
 * ✅ Copy link with visual feedback
 * ✅ Social media sharing (WhatsApp, Facebook, Twitter, LinkedIn, Telegram, Email)
 * ✅ Dynamic URL generation
 * ✅ Share analytics tracking
 * ✅ Mobile-optimized responsive design
 * ✅ Accessibility compliant
 */

import React, { useState, useCallback } from 'react';
import { Share2, Copy, MessageCircle, Facebook, Twitter, Linkedin, Send, Mail, Check, ExternalLink } from 'lucide-react';
import { generateTherapistShareURL, generateShareText, copyShareURLToClipboard } from '../features/shared-profiles/utils/shareUrlBuilder';
import type { Therapist } from '../types';

interface ShareTherapistProfileProps {
    therapist: Therapist;
    className?: string;
    showLabel?: boolean;
    variant?: 'primary' | 'secondary' | 'minimal';
    onShareComplete?: (platform: string, url: string) => void;
}

export const ShareTherapistProfile: React.FC<ShareTherapistProfileProps> = ({
    therapist,
    className = '',
    showLabel = true,
    variant = 'primary',
    onShareComplete
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [shareUrl, setShareUrl] = useState('');

    // Generate share URL and text on component mount
    React.useEffect(() => {
        const url = generateTherapistShareURL(therapist);
        setShareUrl(url);
    }, [therapist]);

    const shareText = generateShareText(
        therapist.name,
        'therapist',
        therapist.location || therapist.city
    );

    const handleCopyLink = useCallback(async () => {
        const success = await copyShareURLToClipboard(shareUrl);
        if (success) {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
            
            // Track analytics
            onShareComplete?.('copy', shareUrl);
            
            // Show toast notification
            if ('vibrate' in navigator) {
                navigator.vibrate(100);
            }
        }
    }, [shareUrl, onShareComplete]);

    const handleSocialShare = useCallback((platform: string, url: string) => {
        // Track analytics
        onShareComplete?.(platform, shareUrl);
        
        // Open in new window
        window.open(url, '_blank', 'width=600,height=400');
        setIsOpen(false);
    }, [shareUrl, onShareComplete]);

    const socialShareUrls = {
        whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
        email: `mailto:?subject=${encodeURIComponent(`${therapist.name} - Terapis Pijat Terbaik`)}&body=${encodeURIComponent(`${shareText}\\n\\n${shareUrl}`)}`
    };

    const buttonClasses = {
        primary: 'bg-orange-500 hover:bg-orange-600 text-white',
        secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
        minimal: 'bg-transparent hover:bg-gray-100 text-gray-600'
    };

    const baseButtonClass = `inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${buttonClasses[variant]}`;

    return (
        <div className={`relative ${className}`}>
            {/* Main Share Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={baseButtonClass}
                aria-label={`Share ${therapist.name}'s profile`}
                aria-expanded={isOpen}
                aria-haspopup="menu"
            >
                <Share2 className="w-4 h-4" />
                {showLabel && <span>Share Profile</span>}
            </button>

            {/* Share Menu Popup */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-20 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Share Panel */}
                    <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl border z-50 min-w-80 max-w-sm">
                        <div className="p-4 border-b">
                            <h3 className="font-semibold text-gray-800 text-sm">Share Profile</h3>
                            <p className="text-xs text-gray-600 mt-1">
                                Share {therapist.name}'s profile with others
                            </p>
                        </div>

                        {/* Copy Link Section */}
                        <div className="p-4 border-b bg-gray-50">
                            <div className="flex items-center gap-2 bg-white rounded-lg border p-2">
                                <div className="flex-1 min-w-0">
                                    <input
                                        type="text"
                                        value={shareUrl}
                                        readOnly
                                        className="w-full bg-transparent text-sm text-gray-600 truncate focus:outline-none"
                                        aria-label="Share URL"
                                    />
                                </div>
                                <button
                                    onClick={handleCopyLink}
                                    className={`flex items-center gap-1 px-3 py-1 rounded transition-all text-xs font-medium ${
                                        copySuccess 
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-orange-100 hover:bg-orange-200 text-orange-700'
                                    }`}
                                    aria-label="Copy link to clipboard"
                                >
                                    {copySuccess ? (
                                        <>
                                            <Check className="w-3 h-3" />
                                            <span>Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3 h-3" />
                                            <span>Copy</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Social Share Buttons */}
                        <div className="p-4">
                            <div className="grid grid-cols-3 gap-3">
                                {/* WhatsApp */}
                                <button
                                    onClick={() => handleSocialShare('whatsapp', socialShareUrls.whatsapp)}
                                    className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-green-50 transition-colors group"
                                    aria-label="Share via WhatsApp"
                                >
                                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                                        <MessageCircle className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs text-gray-600 group-hover:text-green-600">WhatsApp</span>
                                </button>

                                {/* Facebook */}
                                <button
                                    onClick={() => handleSocialShare('facebook', socialShareUrls.facebook)}
                                    className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-blue-50 transition-colors group"
                                    aria-label="Share via Facebook"
                                >
                                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                                        <Facebook className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs text-gray-600 group-hover:text-blue-600">Facebook</span>
                                </button>

                                {/* Twitter */}
                                <button
                                    onClick={() => handleSocialShare('twitter', socialShareUrls.twitter)}
                                    className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-blue-50 transition-colors group"
                                    aria-label="Share via Twitter"
                                >
                                    <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center">
                                        <Twitter className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs text-gray-600 group-hover:text-gray-800">Twitter</span>
                                </button>

                                {/* LinkedIn */}
                                <button
                                    onClick={() => handleSocialShare('linkedin', socialShareUrls.linkedin)}
                                    className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-blue-50 transition-colors group"
                                    aria-label="Share via LinkedIn"
                                >
                                    <div className="w-8 h-8 bg-blue-700 text-white rounded-full flex items-center justify-center">
                                        <Linkedin className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs text-gray-600 group-hover:text-blue-700">LinkedIn</span>
                                </button>

                                {/* Telegram */}
                                <button
                                    onClick={() => handleSocialShare('telegram', socialShareUrls.telegram)}
                                    className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-blue-50 transition-colors group"
                                    aria-label="Share via Telegram"
                                >
                                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
                                        <Send className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs text-gray-600 group-hover:text-blue-500">Telegram</span>
                                </button>

                                {/* Email */}
                                <button
                                    onClick={() => handleSocialShare('email', socialShareUrls.email)}
                                    className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                                    aria-label="Share via Email"
                                >
                                    <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs text-gray-600 group-hover:text-gray-600">Email</span>
                                </button>
                            </div>
                        </div>

                        {/* More Options */}
                        <div className="p-4 border-t bg-gray-50">
                            <button
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: `${therapist.name} - Terapis Pijat`,
                                            text: shareText,
                                            url: shareUrl
                                        });
                                    }
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                                aria-label="More sharing options"
                            >
                                <ExternalLink className="w-4 h-4" />
                                <span>More Options</span>
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Success Toast */}
            {copySuccess && (
                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-60">
                    <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>Link copied to clipboard!</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShareTherapistProfile;