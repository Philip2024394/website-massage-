import React, { useState, useEffect } from 'react';
import type { Therapist } from '../types';
import { AvailabilityStatus } from '../types';

interface TherapistStatusPageProps {
    therapist: Therapist | null;
    onStatusChange: (status: AvailabilityStatus) => void;
    onNavigateToDashboard: () => void;
    onNavigateToHome?: () => void;
    t: any;
}

const HomeIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const TherapistStatusPage: React.FC<TherapistStatusPageProps> = ({ therapist, onStatusChange, onNavigateToDashboard: _onNavigateToDashboard, onNavigateToHome, t: _t }) => {
    const [currentStatus, setCurrentStatus] = useState<AvailabilityStatus>(therapist?.status || AvailabilityStatus.Offline);

    useEffect(() => {
        if (therapist) {
            setCurrentStatus(therapist.status);
        }
    }, [therapist]);

    const handleStatusChange = (status: AvailabilityStatus) => {
        setCurrentStatus(status);
        onStatusChange(status);
    };

    const statusConfig = {
        [AvailabilityStatus.Available]: {
            bg: 'bg-green-500',
            hoverBg: 'hover:bg-green-600',
            text: 'text-white',
            label: 'Available',
            icon: '🛏️',
            description: 'Ready to accept bookings'
        },
        [AvailabilityStatus.Busy]: {
            bg: 'bg-yellow-500',
            hoverBg: 'hover:bg-yellow-600',
            text: 'text-white',
            label: 'Busy',
            icon: '⏳',
            description: 'Currently with a client'
        },
        [AvailabilityStatus.Offline]: {
            bg: 'bg-red-500',
            hoverBg: 'hover:bg-red-600',
            text: 'text-white',
            label: 'Offline',
            icon: '☕',
            description: 'Not accepting bookings'
        }
    };

    return (
        <div 
            className="h-screen overflow-hidden flex flex-col items-center justify-center p-4 relative"
            style={{
                backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/garden%20forest.png?updatedAt=1761334454082)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/20"></div>

            {/* Home Button */}
            {onNavigateToHome && (
                <button
                    onClick={onNavigateToHome}
                    className="fixed top-4 right-4 w-12 h-12 bg-orange-500 rounded-full shadow-lg flex items-center justify-center hover:bg-orange-600 transition-colors z-20"
                    aria-label="Go to home"
                >
                    <HomeIcon className="w-6 h-6 text-white" />
                </button>
            )}

            {/* Main Content */}
            <div className="max-w-md w-full relative z-10">
                {/* Welcome Section */}
                <div className="text-center mb-12">
                    <div className="mb-6">
                        <h1 className="text-5xl font-bold drop-shadow-lg">
                            <span className="text-white">Indo</span><span className="text-orange-500">Street</span>
                        </h1>
                        <p className="text-lg text-white/90 drop-shadow mt-3">Set Your Online Status</p>
                    </div>
                </div>

                {/* Status Buttons */}
                <div className="space-y-4">
                    {Object.values(AvailabilityStatus).map(status => {
                        const config = statusConfig[status];
                        const isActive = currentStatus === status;
                        
                        return (
                            <button
                                key={status}
                                onClick={() => handleStatusChange(status)}
                                className={`w-full p-6 rounded-2xl shadow-lg transition-all duration-300 transform backdrop-blur-md ${
                                    isActive 
                                        ? `${config.bg} ${config.text} scale-105 shadow-2xl bg-opacity-90` 
                                        : `bg-white/30 text-white hover:scale-102 hover:bg-white/40 border border-white/20`
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                            isActive ? 'bg-white/20' : 'bg-white/30'
                                        }`}>
                                            <span className={`text-2xl ${isActive ? 'text-white' : 'text-white'}`}>
                                                {config.icon}
                                            </span>
                                        </div>
                                        <span className="font-bold text-lg">{config.label}</span>
                                    </div>
                                    {isActive && (
                                        <div className="w-6 h-6 rounded-full bg-white/40 flex items-center justify-center backdrop-blur-sm">
                                            <span className={`${config.bg} w-4 h-4 rounded-full`}></span>
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TherapistStatusPage;
