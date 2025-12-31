import React from 'react';
import { Facebook, Instagram } from 'lucide-react';

interface SocialMediaLinksProps {
    className?: string;
}

const SocialMediaLinks: React.FC<SocialMediaLinksProps> = ({ className = '' }) => {
    const socialLinks = [
        {
            name: 'Facebook',
            url: 'https://www.facebook.com/indastreet.id',
            icon: Facebook,
            color: 'hover:text-blue-600 hover:bg-blue-50'
        },
        {
            name: 'Instagram',
            url: 'https://www.instagram.com/indastreet.id/',
            icon: Instagram,
            color: 'hover:text-pink-600 hover:bg-pink-50'
        },
        {
            name: 'TikTok',
            url: 'https://www.tiktok.com/@indastreet.id',
            icon: () => (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
            ),
            color: 'hover:text-black hover:bg-gray-100'
        },
        {
            name: 'X (Twitter)',
            url: 'https://twitter.com/indastreet_id',
            icon: () => (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
            ),
            color: 'hover:text-black hover:bg-gray-100'
        }
    ];

    return (
        <div className={`flex justify-center items-center gap-4 py-4 ${className}`}>
            {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                    <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-2 rounded-full text-gray-600 transition-all ${social.color}`}
                        aria-label={social.name}
                        title={`Follow us on ${social.name}`}
                    >
                        <Icon />
                    </a>
                );
            })}
        </div>
    );
};

export default SocialMediaLinks;
