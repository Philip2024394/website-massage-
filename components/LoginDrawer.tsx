import React from 'react';
import UserSolidIcon from './icons/UserSolidIcon';
import BriefcaseIcon from './icons/BriefcaseIcon';
import HomeIcon from './icons/HomeIcon';
import MapPinIcon from './icons/MapPinIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';

interface LoginOption {
    id: string;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    description: string;
}

interface LoginDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSelect: (loginType: string) => void;
    t: any;
}

const LoginDrawer: React.FC<LoginDrawerProps> = ({ isOpen, onClose, onLoginSelect, t }) => {
    const loginOptions: LoginOption[] = [
        {
            id: 'admin',
            title: 'Admin',
            icon: DocumentTextIcon,
            color: 'bg-red-500 hover:bg-red-600',
            description: 'System administration and management'
        },
        {
            id: 'hotel',
            title: 'Hotel',
            icon: HomeIcon,
            color: 'bg-blue-500 hover:bg-blue-600',
            description: 'Hotel management and bookings'
        },
        {
            id: 'villa',
            title: 'Villa',
            icon: MapPinIcon,
            color: 'bg-green-500 hover:bg-green-600',
            description: 'Villa rental management'
        },
        {
            id: 'agent',
            title: 'Agent',
            icon: BriefcaseIcon,
            color: 'bg-purple-500 hover:bg-purple-600',
            description: 'Sales agent portal'
        },
        {
            id: 'therapist',
            title: 'Therapist',
            icon: UserSolidIcon,
            color: 'bg-pink-500 hover:bg-pink-600',
            description: 'Therapist dashboard and profile'
        },
        {
            id: 'massagePlace',
            title: 'Massage Place',
            icon: HomeIcon,
            color: 'bg-brand-orange hover:bg-brand-orange-dark',
            description: 'Massage center management'
        }
    ];

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-[60] transition-opacity duration-300"
                    onClick={onClose}
                />
            )}
            
            {/* Drawer */}
            <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-[70] ${
                isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}>
                {/* Header */}
                <div className="bg-gradient-to-r from-brand-orange to-brand-orange-dark text-white p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Login Portal</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-brand-orange-light mt-2 text-sm">Select your login type</p>
                </div>

                {/* Login Options */}
                <div className="p-4 overflow-y-auto" style={{ height: 'calc(100vh - 140px)', paddingBottom: '6rem' }}>
                    <div className="space-y-3">
                        {loginOptions.map((option) => {
                            const IconComponent = option.icon;
                            return (
                                <button
                                    key={option.id}
                                    onClick={() => {
                                        onLoginSelect(option.id);
                                        onClose();
                                    }}
                                    className="w-full p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md group"
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className={`${option.color} p-3 rounded-lg transition-all duration-200 group-hover:scale-110`}>
                                            <IconComponent className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <h3 className="font-semibold text-gray-900 group-hover:text-brand-orange transition-colors">
                                                {option.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {option.description}
                                            </p>
                                        </div>
                                        <div className="text-gray-400 group-hover:text-brand-orange transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                                <span className="text-2xl font-bold text-white">Indo</span>
                                <span className="text-2xl font-bold text-brand-orange">street</span>
                            </div>
                            <p className="text-xs text-gray-600">
                                Secure login portal for all user types
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginDrawer;