import React from 'react';
import { ArrowLeft, Shield, Clock, CreditCard, MapPin, Phone } from 'lucide-react';

const MobileTermsAndConditionsPage: React.FC = () => {
    // Get the returnTo URL and context from query params
    const urlParams = new URLSearchParams(window.location.search);
    const returnToUrl = urlParams.get('returnTo');
    const context = urlParams.get('context');
    const isSharedProfileContext = context === 'sharedProfile';

    const handleBackNavigation = () => {
        if (returnToUrl) {
            // If we have a return URL (from shared profile), go back to it
            console.log('🔙 Returning to shared profile:', returnToUrl);
            window.location.href = returnToUrl;
        } else {
            // Check if we can close the tab (opened in new tab)
            try {
                // Try to close if it's a popup/new tab
                window.close();
                
                // If close doesn't work (not a popup), use back navigation
                setTimeout(() => {
                    if (window.history.length > 1) {
                        console.log('🔙 Using browser back navigation');
                        window.history.back();
                    } else {
                        console.log('🔙 No history, navigating to home');
                        window.location.href = '/';
                    }
                }, 100);
            } catch (e) {
                // Fallback to normal navigation
                console.log('🔙 Fallback to browser back');
                if (window.history.length > 1) {
                    window.history.back();
                } else {
                    window.location.href = '/';
                }
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="flex items-center justify-between p-4">
                    <button 
                        onClick={handleBackNavigation}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-medium">Back</span>
                    </button>
                    <h1 className="text-lg font-bold text-gray-800">
                        {isSharedProfileContext ? 'Massage Therapist Standards' : 'Terms & Conditions'}
                    </h1>
                    <div className="w-12"></div> {/* Spacer for center alignment */}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto p-4 space-y-6">
                {/* Show note and last updated only for regular terms, not shared profile context */}
                {!isSharedProfileContext && (
                    <>
                        {returnToUrl && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <p className="text-sm text-orange-800">
                                    <strong>Note:</strong> You're viewing this from a shared therapist profile. Closing this tab will return you to the profile page.
                                </p>
                            </div>
                        )}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                                <strong>Last Updated:</strong> December 21, 2025
                            </p>
                        </div>
                    </>
                )}

                {/* Introduction */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-orange-500" />
                        {isSharedProfileContext ? 'Professional Massage Therapist Standards' : 'Booking Terms and Conditions'}
                    </h2>
                    {isSharedProfileContext ? (
                        <div className="prose prose-gray max-w-none">
                            <p className="text-gray-800 leading-relaxed mb-4">
                                As a professional massage therapist, I am fully committed to maintaining the highest standards of cleanliness, hygiene, and professional practice. All techniques I offer are performed within industry guidelines and are supported by years of formal training and experience.
                            </p>
                            
                            <p className="text-gray-800 leading-relaxed mb-4">
                                Massage is more than a service to me—it is a passion rooted in wellness, care, and helping others feel their best. I continuously apply my knowledge and skills to ensure every session is safe, effective, and tailored to each client's individual needs.
                            </p>
                            
                            <p className="text-gray-800 leading-relaxed">
                                I welcome you to experience my services and trust that you will feel the same level of care and satisfaction that many of my clients have already enjoyed. Your comfort, wellbeing, and relaxation are always my top priorities.
                            </p>
                        </div>
                    ) : (
                        <p className="text-gray-600 leading-relaxed">
                            By using IndaStreet Massage Platform and booking massage services through our platform, you agree to these terms and conditions. Please read them carefully before making any booking.
                        </p>
                    )}
                </div>

                {/* Only show terms sections when NOT in shared profile context */}
                {!isSharedProfileContext && (
                    <>
                        {/* Booking Policy */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-orange-500" />
                                Booking Policy
                            </h3>
                            <ul className="space-y-3 text-gray-600">
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                                    <span><strong>Booking Confirmation:</strong> All bookings require confirmation from the massage therapist. You will receive notification via WhatsApp or in-app chat.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                                    <span><strong>Response Time:</strong> Therapists have up to 15 minutes to respond to immediate booking requests.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                                    <span><strong>Scheduling:</strong> Scheduled bookings can be made up to 7 days in advance, subject to therapist availability.</span>
                                </li>
                            </ul>
                        </div>

                {/* Payment Terms */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-orange-500" />
                        Payment Terms
                    </h3>
                    <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span><strong>Payment Method:</strong> Payment is made directly to the massage therapist in cash upon service completion.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span><strong>Pricing:</strong> Prices displayed are final and include all applicable fees. No hidden charges.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span><strong>Discounts:</strong> Any promotional discounts will be applied automatically and honored by the therapist.</span>
                        </li>
                    </ul>
                </div>

                {/* Cancellation Policy */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-red-500" />
                        Cancellation Policy
                    </h3>
                    <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span><strong>Free Cancellation:</strong> Cancel up to 2 hours before scheduled appointment without penalty.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span><strong>Late Cancellation:</strong> Cancellations within 2 hours may be subject to fees as determined by the therapist.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span><strong>No-Show:</strong> Failure to appear for scheduled appointment may result in full service charge.</span>
                        </li>
                    </ul>
                </div>

                {/* Location & Access */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-500" />
                        Location & Access
                    </h3>
                    <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span><strong>Accurate Address:</strong> You must provide accurate location details including GPS coordinates when available.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span><strong>Access Requirements:</strong> Ensure clear access to your location. Additional fees may apply for difficult-to-reach locations.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span><strong>Privacy & Safety:</strong> Maintain appropriate environment for professional massage services.</span>
                        </li>
                    </ul>
                </div>

                {/* Professional Conduct */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-green-500" />
                        Professional Conduct
                    </h3>
                    <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span><strong>Professional Service:</strong> All services provided are strictly professional therapeutic massage treatments.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span><strong>Respect:</strong> Both clients and therapists must maintain respectful and appropriate behavior at all times.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span><strong>Reporting:</strong> Any inappropriate conduct should be reported immediately through our platform.</span>
                        </li>
                    </ul>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Phone className="w-5 h-5 text-purple-500" />
                        Contact & Support
                    </h3>
                    <div className="space-y-2 text-gray-600">
                        <p><strong>Platform Support:</strong> Available through in-app chat or WhatsApp</p>
                        <p><strong>Emergency Contact:</strong> Contact local authorities for any emergency situations</p>
                        <p><strong>Disputes:</strong> All booking disputes will be mediated through IndaStreet platform</p>
                    </div>
                </div>

                {/* Agreement */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-orange-800 mb-3">Agreement</h3>
                    <p className="text-orange-700 leading-relaxed">
                        By checking the terms and conditions checkbox and proceeding with your booking, you acknowledge that you have read, understood, and agree to be bound by these terms and conditions. These terms may be updated periodically, and continued use of the platform constitutes acceptance of any changes.
                    </p>
                </div>
                </>
                )}

                {/* Contact Support - Show for both contexts */}
                {isSharedProfileContext && (
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <h3 className="font-bold text-gray-800 text-lg mb-4">Contact & Support</h3>
                        <div className="space-y-2 text-sm text-gray-700">
                            <p><strong>Platform Support:</strong> Available 24/7 for booking assistance</p>
                            <p><strong>Quality Concerns:</strong> Report any issues through our support channel</p>
                            <p><strong>Emergency Contact:</strong> +62-813-9200-0050</p>
                        </div>
                    </div>
                )}

                {/* Bottom Spacing */}
                <div className="h-8"></div>
            </div>
        </div>
    );
};

export default MobileTermsAndConditionsPage;