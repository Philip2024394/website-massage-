import React from 'react';
import { Menu } from 'lucide-react';

interface ProfileHeaderProps {
    onMenuClick: () => void;
}

/**
 * Reusable Profile Header component
 * Contains branding on left and menu burger on right
 */
export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
    onMenuClick
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
                    
                    {/* Burger menu on the right */}
                    <button
                        onClick={onMenuClick}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Menu className="w-6 h-6 text-gray-600" />
                    </button>
                </div>
            </div>
        </header>
    );
};
