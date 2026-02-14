import React from 'react';

interface FloatingPageFooterProps {
    currentLanguage?: 'en' | 'id';
    onNavigate?: (page: string) => void;
    className?: string;
}

const essentialLinks = [
    { id: 'how-it-works' as const, labelEn: 'How It Works', labelId: 'Cara Kerja' },
    { id: 'about' as const, labelEn: 'About', labelId: 'Tentang' },
    { id: 'terms' as const, labelEn: 'Terms', labelId: 'Syarat & Ketentuan' },
    { id: 'privacy-policy' as const, labelEn: 'Privacy', labelId: 'Privasi' },
    { id: 'help-faq' as const, labelEn: 'Help', labelId: 'Bantuan' },
];

const FloatingPageFooter: React.FC<FloatingPageFooterProps> = ({ 
    currentLanguage = 'en',
    onNavigate,
    className = '' 
}) => {
    const handleLinkClick = (pageId: string) => {
        if (onNavigate) {
            onNavigate(pageId);
        } else {
            window.location.href = `/?page=${pageId}`;
        }
    };

    const socialLinks = [
        {
            name: 'TikTok',
            url: 'https://www.tiktok.com/@indastreet.team?is_from_webapp=1&sender_device=pc',
            imgSrc: 'https://ik.imagekit.io/7grri5v7d/tik%20tok.png'
        },
        {
            name: 'Facebook',
            url: 'https://www.facebook.com/share/g/1C2QCPTp62/',
            imgSrc: 'https://ik.imagekit.io/7grri5v7d/facebook.png'
        },
        {
            name: 'Instagram',
            url: 'https://www.instagram.com/indastreet.id/',
            imgSrc: 'https://ik.imagekit.io/7grri5v7d/instagrame.png'
        }
    ];

    return (
        <div className={`w-full ${className}`}>
            {/* Integrated Footer Items - No Container */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Essential Links - minimal row with separators */}
                <div className="flex flex-wrap justify-center items-center gap-x-1 gap-y-2 mb-8">
                    {essentialLinks.map((link, i) => (
                        <span key={link.id} className="flex items-center">
                            {i > 0 && <span className="text-gray-300 text-xs mx-2" aria-hidden>·</span>}
                            <button
                                type="button"
                                onClick={() => handleLinkClick(link.id)}
                                className="text-xs text-gray-500 hover:text-orange-600 transition-colors"
                            >
                                {currentLanguage === 'id' ? link.labelId : link.labelEn}
                            </button>
                        </span>
                    ))}
                </div>

                {/* Social Media Section - Integrated */}
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">
                        {currentLanguage === 'id' ? 'Ikuti Kami' : 'Follow Us'}
                    </h3>
                    <div className="flex justify-center items-center gap-6">
                        {socialLinks.map((social) => (
                            <a
                                key={social.name}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="transition-all hover:scale-110 active:scale-95 hover:opacity-80 p-2 rounded-xl hover:bg-white hover:shadow-md interactive"
                                aria-label={social.name}
                                title={`Follow us on ${social.name}`}
                            >
                                <img 
                                    src={social.imgSrc} 
                                    alt={social.name}
                                    className="w-14 h-14 object-contain"
                                />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Brand Section - Integrated */}
                <div className="text-center pt-6">
                    <a 
                        href="https://www.indastreetmassage.com" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xl font-bold text-orange-500 hover:text-orange-600 active:text-orange-700 transition-colors inline-block mb-3 interactive"
                    >
                        IndaStreet Massage
                    </a>
                    <p className="text-sm text-gray-600 mb-2 px-4">
                        {currentLanguage === 'id' 
                            ? 'Platform Booking Pijat Terbaik di Indonesia'
                            : 'Indonesia\'s Premier Massage Booking Platform'
                        }
                    </p>
                    <p className="text-xs text-gray-500">
                        © {new Date().getFullYear()} IndaStreet. {currentLanguage === 'id' ? 'Hak Cipta Dilindungi' : 'All Rights Reserved'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FloatingPageFooter;
