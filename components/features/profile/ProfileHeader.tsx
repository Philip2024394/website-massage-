import React from 'react';
import { Home } from 'lucide-react';

interface ProfileHeaderProps {
    onHomeClick: () => void;
}

/**
 * Reusable Profile Header component
 * Contains branding on left and home icon on right
 */
export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
    onHomeClick
}) => {
    return (
        <header className="bg-white shadow-md sticky top-0 z-30">
            <div className="w-full px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Brand on the left */}
                    <h1 className="text-xl font-bold text-gray-800">
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500">Street</span>
                    </h1>
                    
                    {/* Home icon on the right */}
                    <button
                        onClick={onHomeClick}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Go to home"
                    >
                        <Home className="w-6 h-6 text-gray-600" />
                    </button>
                </div>
            </div>
        </header>
    );
};
