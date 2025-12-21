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
            // Close the current tab/window since it was opened with window.open
            window.close();
            // If close fails (not allowed), navigate to the return URL
            setTimeout(() => {
                window.location.href = returnToUrl;
            }, 100);
        } else {
            // Check if we can go back in history
            if (window.history.length > 1) {
                console.log('🔙 Using browser back navigation');
                window.history.back();
            } else {
                console.log('🔙 No history, navigating to home');
                window.location.href = '/';
            }
        }
    };

    return (
        <div className={isSharedProfileContext ? "min-h-screen bg-white" : "min-h-screen bg-gray-50"}>
            {/* Header */}
            <div className={isSharedProfileContext ? "bg-white p-4" : "bg-white shadow-sm border-b sticky top-0 z-10"}>
                <div className="flex items-center justify-between">
                    <button 
                        onClick={handleBackNavigation}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-medium">Back</span>
                    </button>
                    {!isSharedProfileContext && (
                        <>
                            <h1 className="text-lg font-bold text-gray-800">
                                Terms & Conditions
                            </h1>
                            <div className="w-12"></div> {/* Spacer for center alignment */}
                        </>
                    )}
                </div>
            </div>

            {/* Hero Image for Shared Profile Context */}
            {isSharedProfileContext && (
                <div className="flex justify-center mb-4 pt-4">
                    <img 
                        src="https://ik.imagekit.io/7grri5v7d/logo%20yoga.png" 
                        alt="Logo" 
                        className="h-32 w-auto object-contain"
                    />
                </div>
            )}

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
                <div className={isSharedProfileContext ? "bg-white p-6" : "bg-white rounded-lg shadow-sm border p-6"}>
                    {!isSharedProfileContext && (
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-orange-500" />
                            Booking Terms and Conditions
                        </h2>
                    )}
                    {isSharedProfileContext ? (
                        <div className="prose prose-gray max-w-none space-y-6">
                            <p className="text-gray-800 leading-relaxed">
                                As a professional massage therapist, I am fully committed to maintaining the highest standards of cleanliness, hygiene, and professional practice. All techniques I offer are performed within industry guidelines and are supported by years of formal training and experience.
                            </p>
                            
                            <p className="text-gray-800 leading-relaxed">
                                By booking or receiving my massage services, you agree to the following terms and conditions:
                            </p>

                            <div className="space-y-5">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-base mb-2">1. Services & Pricing</h3>
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        My massage services are offered at the rates listed on my profile. From time to time, I may offer discretionary discounts to regular clients who continue to support my professional practice. First-time or trial sessions are charged at listed prices unless otherwise stated.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-bold text-gray-900 text-base mb-2">2. Communication & Booking Policy</h3>
                                    <p className="text-gray-700 text-sm leading-relaxed mb-2">
                                        All communication regarding massage services, bookings, scheduling, and expectations must be discussed and confirmed through the chat window provided on my profile page prior to my arrival. This ensures accurate records are maintained for quality assurance and to uphold my professional standards.
                                    </p>
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        Failure to communicate through the approved chat system may result in the booking being declined or cancelled.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-bold text-gray-900 text-base mb-2">3. Arrival & Punctuality</h3>
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        I aim to arrive within the agreed booking time, typically within one hour. Delays may occur due to circumstances beyond my control, such as traffic, festivals, or emergencies. Where possible, I will communicate any delays in advance.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-bold text-gray-900 text-base mb-2">4. Health Disclosure & Consultation</h3>
                                    <p className="text-gray-700 text-sm leading-relaxed mb-2">
                                        Before the massage begins, I will discuss any relevant medical conditions, injuries, sensitivities, or areas requiring attention. It is your responsibility to provide accurate information to ensure the service is safe and suitable.
                                    </p>
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        During the session, you may request adjustments to pressure or technique to ensure your comfort.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-bold text-gray-900 text-base mb-2">5. Professional Boundaries & Safety</h3>
                                    <p className="text-gray-700 text-sm leading-relaxed mb-2">
                                        I reserve the right to refuse or discontinue a session if I feel uncomfortable, unsafe, or if professional boundaries are not respected.
                                    </p>
                                    <p className="text-gray-700 text-sm leading-relaxed mb-2">Massage will not be provided if:</p>
                                    <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
                                        <li>Alcohol or illegal substances are present</li>
                                        <li>Additional people are present without prior agreement</li>
                                        <li>The environment is unsafe or misrepresented</li>
                                    </ul>
                                    <p className="text-gray-700 text-sm leading-relaxed mt-2">
                                        Any request for services outside my professional scope will be declined. If such requests continue, the session will be terminated immediately.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-bold text-gray-900 text-base mb-2">6. Mobile, Hotel & Villa Service</h3>
                                    <p className="text-gray-700 text-sm leading-relaxed mb-2">For mobile, hotel, or villa bookings:</p>
                                    <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
                                        <li>Full service address and room number must be provided in advance</li>
                                        <li>Location cannot be changed once my journey has started</li>
                                    </ul>
                                    <p className="text-gray-700 text-sm leading-relaxed mt-2">
                                        Providing incorrect or incomplete location details may result in cancellation with applicable charges.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-bold text-gray-900 text-base mb-2">7. Cancellations</h3>
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        You may cancel your booking at any time. However, if cancellation occurs after I have started my journey, the session will be charged based on time and travel costs, calculated as if the massage session had commenced.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-bold text-gray-900 text-base mb-2">8. Payment Terms</h3>
                                    <p className="text-gray-700 text-sm leading-relaxed mb-2">Payment must be made in full via:</p>
                                    <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
                                        <li>Cash, or</li>
                                        <li>Bank transfer</li>
                                    </ul>
                                    <p className="text-gray-700 text-sm leading-relaxed mt-2">
                                        For bank transfers, proof of payment may be requested before or immediately after the session.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-bold text-gray-900 text-base mb-2">9. Hygiene & Equipment</h3>
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        All massage oils, towels, sheets, and equipment used are clean, freshly prepared, and sanitized to professional hygiene standards. Fresh linens are used for every client to ensure safety, comfort, and cleanliness.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-bold text-gray-900 text-base mb-2">10. Right to Refuse Service</h3>
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        I reserve the right to refuse or end a service at any time if these terms are breached or if professional, ethical, or safety standards cannot be maintained.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-bold text-gray-900 text-base mb-2">11. Client Feedback & Ratings</h3>
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        If you feel that my service met your expectations and professional standards, I kindly invite you to support my profile by leaving a premium star rating. Your feedback is greatly appreciated and helps maintain service quality and trust for future clients.
                                    </p>
                                </div>
                            </div>
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

                {/* Bottom corner image for shared profile context */}
                {isSharedProfileContext && (
                    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-10 pointer-events-none">
                        <img 
                            src="https://ik.imagekit.io/7grri5v7d/green%20leaf.png" 
                            alt="Leaf decoration" 
                            className="w-20 h-20 sm:w-24 sm:h-24 object-contain opacity-60"
                        />
                    </div>
                )}

                {/* Bottom Spacing */}
                <div className="h-8"></div>
            </div>
        </div>
    );
};

export default MobileTermsAndConditionsPage;