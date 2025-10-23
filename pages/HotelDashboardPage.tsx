import React, { useState } from 'react';
import HotelVillaProviders from '../components/HotelVillaProviders';
import QRCodeMenuBuilder from '../components/QRCodeMenuBuilder';
import { HotelVillaMenu } from '../types';

interface HotelDashboardPageProps {
    onLogout: () => void;
    therapists?: any[];
    places?: any[];
    t: any;
}

const HotelDashboardPage: React.FC<HotelDashboardPageProps> = ({ onLogout, therapists = [], places = [], t }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [hotelMenu, setHotelMenu] = useState<HotelVillaMenu | null>(null);

    const handleSaveMenu = (menuData: Omit<HotelVillaMenu, 'id' | 'createdAt' | 'updatedAt'>) => {
        const newMenu: HotelVillaMenu = {
            ...menuData,
            id: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setHotelMenu(newMenu);
        console.log('Hotel menu saved:', newMenu);
    };

    const handleContactProvider = (providerId: number, providerType: 'therapist' | 'place') => {
        console.log('Contacting provider:', { providerId, providerType });
        // In a real app, this would open a contact modal or redirect to WhatsApp
        alert(`Contacting ${providerType} with ID: ${providerId}`);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'providers':
                return (
                    <HotelVillaProviders
                        therapists={therapists}
                        places={places}
                        viewerType="hotel"
                        onContactProvider={handleContactProvider}
                    />
                );
            case 'menu':
                return (
                    <QRCodeMenuBuilder
                        menu={hotelMenu}
                        ownerType="hotel"
                        onSaveMenu={handleSaveMenu}
                    />
                );
            case 'overview':
            default:
                return (
                    <div className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M5 21V7l8-4v18M9 9h1m0 0h1m-1 0v1m0-1V8m0 1h1m0 0v1M9 12h1m0 0h1m-1 0v1m0-1v-1" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Total Rooms</p>
                                        <p className="text-2xl font-semibold text-gray-900">24</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-green-100 text-green-600">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Occupied</p>
                                        <p className="text-2xl font-semibold text-gray-900">18</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Guests</p>
                                        <p className="text-2xl font-semibold text-gray-900">32</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Revenue</p>
                                        <p className="text-2xl font-semibold text-gray-900">$12,430</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    <button className="w-full text-left p-3 rounded-md border border-gray-200 hover:bg-orange-50 hover:border-orange-200 transition-colors">
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 text-orange-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            New Reservation
                                        </div>
                                    </button>
                                    <button className="w-full text-left p-3 rounded-md border border-gray-200 hover:bg-orange-50 hover:border-orange-200 transition-colors">
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 text-orange-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            Room Management
                                        </div>
                                    </button>
                                    <button className="w-full text-left p-3 rounded-md border border-gray-200 hover:bg-orange-50 hover:border-orange-200 transition-colors">
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 text-orange-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            Guest Services
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center p-3 bg-gray-50 rounded-md">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">Room 205 checked in</p>
                                            <p className="text-xs text-gray-600">2 minutes ago</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center p-3 bg-gray-50 rounded-md">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">Maintenance request: Room 112</p>
                                            <p className="text-xs text-gray-600">15 minutes ago</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center p-3 bg-gray-50 rounded-md">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">New booking for tomorrow</p>
                                            <p className="text-xs text-gray-600">1 hour ago</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="px-4 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-800">
                            <span className="text-white">Indo</span><span className="text-orange-500">street</span> - Hotel Dashboard
                        </h1>
                        <button
                            onClick={onLogout}
                            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Tab Navigation */}
            <div className="bg-white border-b border-gray-200">
                <div className="px-4">
                    <div className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`py-4 px-2 border-b-2 font-medium text-sm ${
                                activeTab === 'overview'
                                    ? 'border-orange-500 text-orange-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('providers')}
                            className={`py-4 px-2 border-b-2 font-medium text-sm ${
                                activeTab === 'providers'
                                    ? 'border-orange-500 text-orange-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Massage Partners ({therapists.length + places.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('menu')}
                            className={`py-4 px-2 border-b-2 font-medium text-sm ${
                                activeTab === 'menu'
                                    ? 'border-orange-500 text-orange-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            QR Menu Builder
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-6">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default HotelDashboardPage;