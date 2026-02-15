import React from 'react';

export interface FooterPageLink {
    id: string;
    labelEn: string;
    labelId: string;
}

interface FloatingPageFooterProps {
    currentLanguage?: 'en' | 'id';
    onNavigate?: (page: string) => void;
    className?: string;
    /** Optional: different page links per page. If not set, default links are used. */
    pageLinks?: FooterPageLink[];
}

const defaultPageLinks: FooterPageLink[] = [
    { id: 'how-it-works', labelEn: 'How It Works', labelId: 'Cara Kerja' },
    { id: 'about', labelEn: 'About', labelId: 'Tentang' },
    { id: 'terms', labelEn: 'Terms', labelId: 'Syarat & Ketentuan' },
    { id: 'privacy-policy', labelEn: 'Privacy', labelId: 'Privasi' },
    { id: 'help-faq', labelEn: 'Help', labelId: 'Bantuan' },
];

/** Small leaf SVG for footer link hover animation */
const LeafIcon = ({ className = '' }: { className?: string }) => (
    <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M12 2C8 6 5 10 5 14c0 4 3 7 7 7 4 0 7-3 7-7 0-4-3-8-7-12z" fill="currentColor" opacity="0.9" />
    </svg>
);

const FloatingPageFooter: React.FC<FloatingPageFooterProps> = ({ 
    currentLanguage = 'en',
    onNavigate,
    className = '',
    pageLinks
}) => {
    const links = pageLinks && pageLinks.length > 0 ? pageLinks : defaultPageLinks;

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
        <div className={`w-full footer-with-links ${className}`}>
            {/* Integrated Footer Items - No Container */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Page Links - with stem/leaf hover animation */}
                <div className="flex flex-wrap justify-center items-center gap-x-1 gap-y-2 mb-8">
                    {links.map((link, i) => (
                        <span key={link.id} className="flex items-center">
                            {i > 0 && <span className="text-gray-300 text-xs mx-2" aria-hidden>·</span>}
                            <button
                                type="button"
                                onClick={() => handleLinkClick(link.id)}
                                className="group footer-link-with-leaf relative text-xs text-gray-500 hover:text-orange-600 transition-colors duration-300 py-1 px-0.5"
                            >
                                <span className="relative inline-flex items-center gap-1">
                                    {currentLanguage === 'id' ? link.labelId : link.labelEn}
                                    <span className="footer-leaf inline-flex opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-out pointer-events-none">
                                        <LeafIcon className="text-emerald-600/90 w-3 h-3" />
                                    </span>
                                </span>
                                <span className="footer-link-stem absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-orange-400 to-emerald-500 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
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
            <style>{`
                .footer-link-with-leaf .footer-link-stem { transform: scaleX(0); transform-origin: left center; }
                .footer-link-with-leaf:hover .footer-link-stem { transform: scaleX(1); }
                .footer-link-with-leaf .footer-leaf { transform: scale(0.75); }
                .footer-link-with-leaf:hover .footer-leaf { transform: scale(1); opacity: 1; }
            `}</style>
        </div>
    );
};

export default FloatingPageFooter;
export { defaultPageLinks, type FooterPageLink };