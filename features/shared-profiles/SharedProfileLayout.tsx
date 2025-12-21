/**
 * Universal Shared Profile Layout
 * Used for therapists, massage places, and facial places
 * Provides consistent UI and SEO for all shared links
 */

import React, { ReactNode } from 'react';

interface SharedProfileLayoutProps {
    children: ReactNode;
    providerName: string;
    providerType: 'therapist' | 'place' | 'facial';
    city?: string;
    error?: string | null;
    loading?: boolean;
}

export const SharedProfileLayout: React.FC<SharedProfileLayoutProps> = ({
    children,
    providerName,
    providerType,
    city,
    error,
    loading
}) => {
    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !providerName) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="text-6xl mb-4">😔</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        Profile Not Found
                    </h1>
                    <p className="text-gray-600 mb-6">
                        {error || 'The profile you\'re looking for doesn\'t exist or has been removed.'}
                    </p>
                    <a 
                        href="/"
                        className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition"
                    >
                        🏠 Go to Homepage
                    </a>
                </div>
            </div>
        );
    }

    // Success state - render children
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
            {/* Shared link indicator banner */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 text-center text-sm">
                ✨ Viewing shared profile • {providerType === 'therapist' ? 'Therapist' : providerType === 'facial' ? 'Facial Place' : 'Massage Place'}
                {city && ` • ${city}`}
            </div>

            {/* Main content */}
            <div className="container mx-auto px-4 py-6">
                {children}
            </div>

            {/* Call to action footer */}
            <div className="bg-white border-t border-gray-200 py-6 mt-8">
                <div className="container mx-auto px-4 text-center">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Book {providerName} Now
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Fast booking, instant chat, verified professionals
                    </p>
                    <a 
                        href="/"
                        className="inline-block bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition font-semibold"
                    >
                        📱 Open IndaStreet App
                    </a>
                </div>
            </div>
        </div>
    );
};
