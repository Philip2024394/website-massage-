// Colored SVG Icon Components
export const ColoredProfileIcon = ({ className = "w-5 h-5" }) => (
    <div className={`${className} relative`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            <circle cx="12" cy="12" r="10" fill="url(#profileGradient)" />
            <circle cx="12" cy="8" r="3" fill="white" />
            <path d="M6.168 18.849A6 6 0 0112 16a6 6 0 015.832 2.849" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <defs>
                <linearGradient id="profileGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#1D4ED8" />
                </linearGradient>
            </defs>
        </svg>
    </div>
);

// Colored Calendar Icon
export const ColoredCalendarIcon = ({ className = "w-5 h-5" }) => (
    <div className={`${className} relative`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            <rect x="3" y="4" width="18" height="16" rx="2" fill="url(#calendarGradient)" />
            <rect x="3" y="4" width="18" height="4" rx="2" fill="#DC2626" />
            <line x1="8" y1="2" x2="8" y2="6" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="2" x2="16" y2="6" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <circle cx="9" cy="12" r="1" fill="white" />
            <circle cx="15" cy="12" r="1" fill="white" />
            <circle cx="9" cy="16" r="1" fill="white" />
            <circle cx="15" cy="16" r="1" fill="white" />
            <defs>
                <linearGradient id="calendarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#059669" />
                </linearGradient>
            </defs>
        </svg>
    </div>
);

// Colored Analytics Icon
export const ColoredAnalyticsIcon = ({ className = "w-5 h-5" }) => (
    <div className={`${className} relative`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            <rect x="3" y="3" width="18" height="18" rx="2" fill="url(#analyticsGradient)" />
            <rect x="7" y="13" width="2" height="4" fill="white" />
            <rect x="11" y="9" width="2" height="8" fill="white" />
            <rect x="15" y="11" width="2" height="6" fill="white" />
            <circle cx="8" cy="12" r="1.5" fill="#F59E0B" />
            <circle cx="12" cy="8" r="1.5" fill="#F59E0B" />
            <circle cx="16" cy="10" r="1.5" fill="#F59E0B" />
            <line x1="8" y1="12" x2="12" y2="8" stroke="#F59E0B" strokeWidth="2" />
            <line x1="12" y1="8" x2="16" y2="10" stroke="#F59E0B" strokeWidth="2" />
            <defs>
                <linearGradient id="analyticsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
            </defs>
        </svg>
    </div>
);

// Colored Hotel Icon
export const ColoredHotelIcon = ({ className = "w-5 h-5" }) => (
    <div className={`${className} relative`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            <rect x="4" y="6" width="16" height="14" rx="1" fill="url(#hotelGradient)" />
            <rect x="4" y="6" width="16" height="3" fill="#DC2626" />
            <rect x="7" y="11" width="2" height="3" fill="white" />
            <rect x="11" y="11" width="2" height="3" fill="white" />
            <rect x="15" y="11" width="2" height="3" fill="white" />
            <rect x="7" y="16" width="2" height="2" fill="white" />
            <rect x="11" y="16" width="2" height="2" fill="white" />
            <rect x="15" y="16" width="2" height="2" fill="white" />
            <polygon points="4,6 12,2 20,6" fill="#F59E0B" />
            <defs>
                <linearGradient id="hotelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F97316" />
                    <stop offset="100%" stopColor="#EA580C" />
                </linearGradient>
            </defs>
        </svg>
    </div>
);

// Colored Bell Icon
export const ColoredBellIcon = ({ className = "w-5 h-5" }) => (
    <div className={`${className} relative`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9z" fill="url(#bellGradient)" />
            <path d="M13.73 21a2 2 0 01-3.46 0" stroke="url(#bellGradient)" strokeWidth="2" strokeLinecap="round" />
            <circle cx="18" cy="6" r="3" fill="#EF4444" />
            <defs>
                <linearGradient id="bellGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
            </defs>
        </svg>
    </div>
);

// Colored Tag Icon
export const ColoredTagIcon = ({ className = "w-5 h-5" }) => (
    <div className={`${className} relative`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" fill="url(#tagGradient)" />
            <circle cx="7" cy="7" r="1.5" fill="white" />
            <defs>
                <linearGradient id="tagGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#EC4899" />
                    <stop offset="100%" stopColor="#DB2777" />
                </linearGradient>
            </defs>
        </svg>
    </div>
);

// Colored Crown Icon
export const ColoredCrownIcon = ({ className = "w-5 h-5" }) => (
    <div className={`${className} relative`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            <path d="M5 16L3 8l5.5 5L12 4l3.5 9L21 8l-2 8H5z" fill="url(#crownGradient)" />
            <circle cx="5" cy="8" r="1.5" fill="#F59E0B" />
            <circle cx="12" cy="4" r="1.5" fill="#F59E0B" />
            <circle cx="19" cy="8" r="1.5" fill="#F59E0B" />
            <rect x="5" y="16" width="14" height="2" fill="#DC2626" />
            <defs>
                <linearGradient id="crownGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FBBF24" />
                    <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
            </defs>
        </svg>
    </div>
);

// Colored Document Icon
export const ColoredDocumentIcon = ({ className = "w-5 h-5" }) => (
    <div className={`${className} relative`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" fill="url(#documentGradient)" />
            <path d="M14 2v6h6" fill="#60A5FA" />
            <line x1="9" y1="12" x2="15" y2="12" stroke="white" strokeWidth="1.5" />
            <line x1="9" y1="16" x2="15" y2="16" stroke="white" strokeWidth="1.5" />
            <defs>
                <linearGradient id="documentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#1D4ED8" />
                </linearGradient>
            </defs>
        </svg>
    </div>
);

// Colored Globe Icon
export const ColoredGlobeIcon = ({ className = "w-5 h-5" }) => (
    <div className={`${className} relative`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            <circle cx="12" cy="12" r="10" fill="url(#globeGradient)" />
            <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke="white" strokeWidth="1.5" />
            <defs>
                <linearGradient id="globeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06B6D4" />
                    <stop offset="100%" stopColor="#0891B2" />
                </linearGradient>
            </defs>
        </svg>
    </div>
);

// Colored History Icon
export const ColoredHistoryIcon = ({ className = "w-5 h-5" }) => (
    <div className={`${className} relative`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            <circle cx="12" cy="12" r="10" fill="url(#historyGradient)" />
            <path d="M12 6v6l4 2" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <defs>
                <linearGradient id="historyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
            </defs>
        </svg>
    </div>
);

// Colored Coins Icon
export const ColoredCoinsIcon = ({ className = "w-5 h-5" }) => (
    <div className={`${className} relative`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            <circle cx="8" cy="8" r="6" fill="url(#coinsGradient1)" />
            <circle cx="16" cy="16" r="6" fill="url(#coinsGradient2)" />
            <text x="8" y="12" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">$</text>
            <text x="16" y="20" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">¥</text>
            <defs>
                <linearGradient id="coinsGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
                <linearGradient id="coinsGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#059669" />
                </linearGradient>
            </defs>
        </svg>
    </div>
);

export default {
    ColoredProfileIcon,
    ColoredCalendarIcon,
    ColoredAnalyticsIcon,
    ColoredHotelIcon,
    ColoredBellIcon,
    ColoredTagIcon,
    ColoredCrownIcon,
    ColoredDocumentIcon,
    ColoredGlobeIcon,
    ColoredHistoryIcon,
    ColoredCoinsIcon
};