import React, { useState, useEffect } from 'react';

interface PageNumberBadgeProps {
    pageNumber: number;
    pageName: string;
    isLocked?: boolean;
    showNumbers?: boolean; // Admin toggle
}

const PageNumberBadge: React.FC<PageNumberBadgeProps> = ({ 
    pageNumber, 
    pageName, 
    isLocked: propIsLocked,
    showNumbers = false // Default to hidden in production
}) => {
    console.log(`PageNumberBadge RENDERING: Page ${pageNumber}, showNumbers: ${showNumbers}`);
    const [actualIsLocked, setActualIsLocked] = useState(propIsLocked || false);

    // Check actual file system read-only status
    useEffect(() => {
        const checkFileProtection = () => {
            try {
                // List of files we have locked with read-only protection
                const lockedFileNames = [
                    'HomePage',
                    'AcceptBookingPage', 
                    'MassagePlaceProfilePage',
                    'TherapistStatusPage',
                    'HeroSection'
                ];
                
                // Check if current page name matches any of our locked files
                const isPageLocked = lockedFileNames.some(lockedName => {
                    const normalizedPageName = pageName.replace(/Page$/i, '').replace(/\.tsx$/i, '');
                    const normalizedLockedName = lockedName.replace(/Page$/i, '').replace(/\.tsx$/i, '');
                    
                    return normalizedPageName.toLowerCase().includes(normalizedLockedName.toLowerCase()) ||
                           normalizedLockedName.toLowerCase().includes(normalizedPageName.toLowerCase()) ||
                           pageName.toLowerCase() === lockedName.toLowerCase() ||
                           pageName.toLowerCase() === (lockedName + 'Page').toLowerCase();
                });
                
                console.log(`🔍 PageNumberBadge Lock Check:`);
                console.log(`   Page Number: ${pageNumber}`);
                console.log(`   Page Name: "${pageName}"`);
                console.log(`   Locked Files: [${lockedFileNames.join(', ')}]`);
                console.log(`   Is Locked: ${isPageLocked}`);
                
                setActualIsLocked(isPageLocked);
                
            } catch (error) {
                console.log('PageNumberBadge: Error checking file protection:', error);
                // Fallback to always unlocked if there's an error
                setActualIsLocked(false);
            }
        };
        
        checkFileProtection();
        
        // Also use prop if provided (override)
        if (propIsLocked !== undefined) {
            console.log(`PageNumberBadge: Using prop override for page ${pageNumber}:`, propIsLocked);
            setActualIsLocked(propIsLocked);
        }
    }, [pageNumber, pageName, propIsLocked]);

    // Don't render if numbers are disabled
    if (!showNumbers) return null;

    return (
        <div className="fixed top-4 right-4 z-[9999] pointer-events-none select-none">
            <div className={`
                inline-flex items-center gap-2 px-4 py-2 rounded-lg shadow-xl backdrop-blur-md
                ${actualIsLocked 
                    ? 'bg-red-500 text-white border-4 border-red-700 shadow-red-500/50' 
                    : 'bg-blue-500 text-white border-4 border-blue-700 shadow-blue-500/50'
                }
                font-mono text-sm font-bold min-h-[40px]
            `}>
                {/* Lock icon if locked */}
                {actualIsLocked && (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                )}
                
                {/* Lock Status - More Prominent Display */}
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                    actualIsLocked 
                        ? 'bg-white bg-opacity-90 text-red-600' 
                        : 'bg-black bg-opacity-50 text-white'
                }`}>
                    {actualIsLocked ? '🔒 LOCKED' : 'UNLOCKED'}
                </span>
                
                {/* Page number */}
                <span className="text-lg">#{pageNumber}</span>
                
                {/* Page name (truncated if too long) */}
                <span className="text-xs opacity-80 max-w-20 truncate" title={pageName}>
                    {pageName}
                </span>
            </div>
        </div>
    );
};

export default PageNumberBadge;