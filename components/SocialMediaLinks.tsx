import React from 'react';

interface SocialMediaLinksProps {
    className?: string;
}

const SocialMediaLinks: React.FC<SocialMediaLinksProps> = ({ className = '' }) => {
    const socialLinks = [
        {
            name: 'TikTok',
            url: 'https://www.tiktok.com/@indastreet.id',
            imgSrc: 'https://ik.imagekit.io/7grri5v7d/tik%20tok.png',
            color: 'hover:opacity-80'
        },
        {
            name: 'X',
            url: 'https://twitter.com/indastreet_id',
            imgSrc: 'https://ik.imagekit.io/7grri5v7d/x.png',
            color: 'hover:opacity-80'
        },
        {
            name: 'Facebook',
            url: 'https://www.facebook.com/indastreet.id',
            imgSrc: 'https://ik.imagekit.io/7grri5v7d/facebook.png',
            color: 'hover:opacity-80'
        },
        {
            name: 'Instagram',
            url: 'https://www.instagram.com/indastreet.id/',
            imgSrc: 'https://ik.imagekit.io/7grri5v7d/instagrame.png',
            color: 'hover:opacity-80'
        }
    ];

    return (
        <div className={`flex justify-center items-center gap-4 py-4 ${className}`}>
            {socialLinks.map((social) => {
                return (
                    <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`transition-all ${social.color}`}
                        aria-label={social.name}
                        title={`Follow us on ${social.name}`}
                    >
                        <img 
                            src={social.imgSrc} 
                            alt={social.name}
                            className="w-8 h-8 object-contain"
                        />
                    </a>
                );
            })}
        </div>
    );
};

export default SocialMediaLinks;
