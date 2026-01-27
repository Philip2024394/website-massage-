import React, { useState } from 'react';
import { ArrowLeft, Menu } from 'lucide-react';
import NotificationBell from '../components/NotificationBell';

interface PlaceTermsPageProps {
    onBack: () => void;
    t: any;
    onNavigateToNotifications?: () => void;
    unreadNotificationsCount?: number;
}

const PlaceTermsPage: React.FC<PlaceTermsPageProps> = ({ 
    onBack, 
    t, 
    onNavigateToNotifications,
    unreadNotificationsCount = 0 
}) => {
    const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with Burger Menu */}
            <header className="bg-white shadow-sm px-4 py-3 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl sm:text-2xl font-bold">
                        <span className="text-gray-900">Inda</span>
                        <span className="text-orange-500">Street</span>
                    </h1>
                    <div className="flex items-center gap-2">
                        {onNavigateToNotifications && (
                            <NotificationBell count={unreadNotificationsCount} onClick={onNavigateToNotifications} />
                        )}
                        <button
                            onClick={() => setIsSideDrawerOpen(true)}
                            className="p-2 text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                        >
                            <Menu className="w-5 h-5 text-orange-600" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Side Drawer */}
            {isSideDrawerOpen && (
                <div className="fixed inset-0 z-50">
                    {/* Overlay */}
                    <div 
                        className="absolute inset-0 bg-black bg-opacity-50"
                        onClick={() => setIsSideDrawerOpen(false)}
                    />
                    
                    {/* Drawer */}
                    <div className="absolute right-0 top-0 h-full w-80 bg-gradient-to-br from-orange-500 to-red-500 shadow-xl">
                        {/* Drawer Header */}
                        <div className="p-6 border-b border-orange-400">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white">Menu</h2>
                                <button
                                    onClick={() => setIsSideDrawerOpen(false)}
                                    className="p-2 text-white hover:bg-orange-600 rounded-lg transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        
                        {/* Drawer Content */}
                        <div className="p-6">
                            <div className="space-y-1">
                                <button
                                    onClick={() => {
                                        setIsSideDrawerOpen(false);
                                        onBack();
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-orange-600 rounded-lg transition-colors text-left"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    <span>Back to Dashboard</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <main className="p-6 space-y-6 text-gray-700 pb-24 max-w-4xl mx-auto">
                <div className="bg-orange-100 border-l-4 border-orange-500 p-4 mb-6">
                    <h2 className="text-xl font-bold text-orange-900 mb-2">Terms and Conditions for Massage Places</h2>
                    <p className="text-sm font-semibold text-orange-900">Effective Date: November 5, 2025</p>
                </div>

                <p className="text-sm leading-relaxed">
                    Welcome to IndaStreet. These Terms and Conditions govern your use of our platform as a massage place provider. 
                    By registering and using our services, you agree to be bound by these terms.
                </p>
                
                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">1. Acceptance of Terms</h3>
                    <p className="text-sm leading-relaxed">
                        By creating an account and listing your massage place on IndaStreet, you acknowledge that you have read, 
                        understood, and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, 
                        you may not use our platform.
                    </p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">2. Platform Service</h3>
                    <p className="text-sm leading-relaxed">
                        IndaStreet is a platform that connects massage places with customers seeking massage services. 
                        We facilitate bookings and provide tools for business management but do not directly provide massage services.
                    </p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">3. Business Registration Requirements</h3>
                    <p className="text-sm leading-relaxed">
                        All massage places must provide valid business registration documents, licenses, and certifications as required by local law. 
                        You must maintain current and valid licenses throughout your use of the platform.
                    </p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">4. Service Quality Standards</h3>
                    <p className="text-sm leading-relaxed">
                        You agree to maintain high standards of service quality, cleanliness, and professionalism. 
                        All staff must be properly trained and certified as required by local regulations.
                    </p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">5. Pricing and Payment</h3>
                    <p className="text-sm leading-relaxed">
                        You may set your own pricing for services. All payments are processed through our secure payment system. 
                        Platform fees and commission structures are outlined in your service agreement.
                    </p>
                </div>
                
                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">6. Customer Relations</h3>
                    <p className="text-sm leading-relaxed">
                        You are responsible for providing excellent customer service and handling customer inquiries professionally. 
                        Any disputes should be resolved amicably and in accordance with platform guidelines.
                    </p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">7. Booking Management</h3>
                    <p className="text-sm leading-relaxed">
                        You must honor all confirmed bookings and provide services as described. 
                        Any cancellations must follow the platform's cancellation policy and provide appropriate notice to customers.
                    </p>
                </div>
                
                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">8. Location and Facilities</h3>
                    <p className="text-sm leading-relaxed">
                        Your massage place must operate from a legitimate business address with proper facilities. 
                        You must ensure compliance with all health and safety regulations.
                    </p>
                </div>
                
                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">9. Staff Management</h3>
                    <p className="text-sm leading-relaxed">
                        You are responsible for hiring, training, and managing your staff. 
                        All therapists working at your location must have appropriate certifications and background checks.
                    </p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">10. Marketing and Promotion</h3>
                    <p className="text-sm leading-relaxed">
                        You may promote your services through the platform's marketing tools. 
                        All promotional content must be accurate and comply with advertising standards.
                    </p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">11. Data Protection and Privacy</h3>
                    <p className="text-sm leading-relaxed">
                        You must protect customer data and privacy in accordance with applicable data protection laws. 
                        Customer information should only be used for providing requested services.
                    </p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">12. Platform Policies</h3>
                    <p className="text-sm leading-relaxed mb-3">
                        You agree to comply with all platform policies and guidelines. Violations may result in account suspension or termination.
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-sm ml-4">
                        <li className="leading-relaxed">Maintain professional conduct at all times</li>
                        <li className="leading-relaxed">Provide accurate business information and pricing</li>
                        <li className="leading-relaxed">Respond to customer inquiries promptly</li>
                        <li className="leading-relaxed">Report any issues or concerns to platform support</li>
                        <li className="leading-relaxed">Keep business licenses and certifications current</li>
                        <li className="leading-relaxed">Maintain clean and safe facilities</li>
                    </ul>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">13. Liability and Insurance</h3>
                    <p className="text-sm leading-relaxed">
                        You are responsible for maintaining appropriate business insurance and liability coverage. 
                        IndaStreet is not liable for incidents that occur at your business location.
                    </p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">14. Termination</h3>
                    <p className="text-sm leading-relaxed">
                        Either party may terminate this agreement with appropriate notice. 
                        Upon termination, you must fulfill all outstanding bookings and obligations.
                    </p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 text-lg">15. Governing Law</h3>
                    <p className="text-sm leading-relaxed">
                        These terms are governed by the laws of the jurisdiction where IndaStreet operates. 
                        Any disputes will be resolved through appropriate legal channels.
                    </p>
                </div>

                <div className="bg-gray-100 p-4 rounded-lg mt-8">
                    <h3 className="font-bold text-gray-800 mb-2">Contact Information</h3>
                    <p className="text-sm text-gray-600">
                        For questions about these terms or platform support, please contact our customer service team 
                        through the platform's support system or at our designated support email.
                    </p>
                </div>

                <div className="text-center py-8">
                    <button 
                        onClick={onBack}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </main>

            {/* Navigation footer removed: relying on GlobalFooter; local back button retained above */}
        </div>
    );
};

export default PlaceTermsPage;
