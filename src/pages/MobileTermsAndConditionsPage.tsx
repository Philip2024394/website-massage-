import React from 'react';
import { ArrowLeft, Shield, Clock, CreditCard, MapPin, Phone } from 'lucide-react';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import PageContainer from '../components/layout/PageContainer';

const MobileTermsAndConditionsPage: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [language, setLanguage] = React.useState<'en' | 'id'>('id');
    
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
            {/* Global Header - Same as Home Page */}
            {!isSharedProfileContext && (
                <header className="bg-white shadow-md sticky top-0 z-[9997] w-full max-w-full">
                    <PageContainer className="py-2 sm:py-3 max-w-full">
                        <div className="flex justify-between items-center max-w-full">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex-shrink-0">
                                <span className="text-black">Inda</span>
                                <span className="text-amber-500">Street</span>
                            </h1>
                            <div className="flex items-center gap-2 sm:gap-3 text-gray-600 flex-shrink-0">
                                {/* Language Selector - Flag Icon */}
                                <button 
                                    onClick={() => {
                                        const newLanguage = language === 'id' ? 'en' : 'id';
                                        setLanguage(newLanguage);
                                        console.log('🌐 Language changed to:', newLanguage);
                                    }} 
                                    className="flex items-center justify-center min-w-[44px] min-h-[44px] w-10 h-10 sm:w-11 sm:h-11 hover:bg-amber-50 rounded-full transition-colors flex-shrink-0" 
                                    title={language === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
                                >
                                    <span className="text-xl sm:text-2xl">
                                        {language === 'id' ? '🇮🇩' : '🇬🇧'}
                                    </span>
                                </button>

                                <button 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setIsMenuOpen(true);
                                    }} 
                                    title="Menu" 
                                    className="hover:bg-amber-50 rounded-full transition-colors text-amber-500 flex-shrink-0 min-w-[44px] min-h-[44px] w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center"
                                >
                                    <BurgerMenuIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                            </div>
                        </div>
                    </PageContainer>
                </header>
            )}

            {/* Shared Profile Context Header */}
            {isSharedProfileContext && (
                <div className="bg-white p-4">
                    <div className="flex items-center justify-between">
                        <button 
                            onClick={handleBackNavigation}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="text-sm font-medium">Back</span>
                        </button>
                    </div>
                </div>
            )}

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
                {/* Show last updated only for regular terms, not shared profile context */}
                {!isSharedProfileContext && (
                    <>
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
                            <Shield className="w-5 h-5 text-amber-500" />
                            Booking Terms and Conditions
                        </h2>
                    )}
                    {isSharedProfileContext ? (
                        <div className="prose prose-gray max-w-none space-y-4">
                            <p className="text-gray-800 leading-relaxed">
                                As a professional massage therapist, I am fully committed to maintaining the highest standards of cleanliness, hygiene, and professional practice. All techniques I offer are performed within industry guidelines and are supported by years of formal training and experience.
                            </p>
                            
                            <p className="text-gray-800 leading-relaxed">
                                My passion is wellness and helping my clients achieve physical and mental relaxation through therapeutic massage. I take pride in creating a safe, comfortable, and professional environment for every session.
                            </p>

                            <p className="text-gray-800 leading-relaxed">
                                Every massage I provide is tailored to your individual needs, whether you're seeking relief from muscle tension, stress reduction, or simply a moment of tranquility in your busy life. I look forward to welcoming you and providing you with an exceptional massage experience.
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
                        {/* Therapist Professional Standards */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-amber-500" />
                                Massage Therapist Professional Standards
                            </h3>
                            <div className="space-y-5">
                                <div>
                                    <h4 className="font-bold text-gray-900 text-base mb-2">1. Services & Pricing</h4>
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        Massage services are offered at the rates listed on therapist profiles. From time to time, therapists may offer discretionary discounts to regular clients who continue to support their professional practice. First-time or trial sessions are charged at listed prices unless otherwise stated.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-gray-900 text-base mb-2">2. Communication & Booking Policy</h4>
                                    <p className="text-gray-700 text-sm leading-relaxed mb-2">
                                        All communication regarding massage services, bookings, scheduling, and expectations must be discussed and confirmed through the chat window provided on the therapist profile page prior to arrival. This ensures accurate records are maintained for quality assurance and to uphold professional standards.
                                    </p>
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        Failure to communicate through the approved chat system may result in the booking being declined or cancelled.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-gray-900 text-base mb-2">3. Arrival & Punctuality</h4>
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        Therapists aim to arrive within the agreed booking time, typically within one hour. Delays may occur due to circumstances beyond their control, such as traffic, festivals, or emergencies. Where possible, therapists will communicate any delays in advance.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-gray-900 text-base mb-2">4. Health Disclosure & Consultation</h4>
                                    <p className="text-gray-700 text-sm leading-relaxed mb-2">
                                        Before the massage begins, therapists will discuss any relevant medical conditions, injuries, sensitivities, or areas requiring attention. It is your responsibility to provide accurate information to ensure the service is safe and suitable.
                                    </p>
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        During the session, you may request adjustments to pressure or technique to ensure your comfort.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-gray-900 text-base mb-2">5. Professional Boundaries & Safety</h4>
                                    <p className="text-gray-700 text-sm leading-relaxed mb-2">
                                        Therapists reserve the right to refuse or discontinue a session if they feel uncomfortable, unsafe, or if professional boundaries are not respected.
                                    </p>
                                    <p className="text-gray-700 text-sm leading-relaxed mb-2">Massage will not be provided if:</p>
                                    <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
                                        <li>Alcohol or illegal substances are present</li>
                                        <li>Additional people are present without prior agreement</li>
                                        <li>The environment is unsafe or misrepresented</li>
                                    </ul>
                                    <p className="text-gray-700 text-sm leading-relaxed mt-2">
                                        Any request for services outside the therapist's professional scope will be declined. If such requests continue, the session will be terminated immediately.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-gray-900 text-base mb-2">6. Mobile, Hotel & Villa Service</h4>
                                    <p className="text-gray-700 text-sm leading-relaxed mb-2">For mobile, hotel, or villa bookings:</p>
                                    <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
                                        <li>Full service address and room number must be provided in advance</li>
                                        <li>Location cannot be changed once the therapist's journey has started</li>
                                    </ul>
                                    <p className="text-gray-700 text-sm leading-relaxed mt-2">
                                        Providing incorrect or incomplete location details may result in cancellation with applicable charges.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-gray-900 text-base mb-2">7. Hygiene & Equipment</h4>
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        All massage oils, towels, sheets, and equipment used are clean, freshly prepared, and sanitized to professional hygiene standards. Fresh linens are used for every client to ensure safety, comfort, and cleanliness.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-gray-900 text-base mb-2">8. Right to Refuse Service</h4>
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        Therapists reserve the right to refuse or end a service at any time if these terms are breached or if professional, ethical, or safety standards cannot be maintained.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-gray-900 text-base mb-2">9. Client Feedback & Ratings</h4>
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        If you feel that the service met your expectations and professional standards, therapists kindly invite you to support their profile by leaving a premium star rating. Your feedback is greatly appreciated and helps maintain service quality and trust for future clients.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Booking Policy */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-amber-500" />
                                Booking Policy
                            </h3>
                            <ul className="space-y-3 text-gray-600">
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                                    <span><strong>Booking Confirmation:</strong> All bookings require confirmation from the massage therapist. You will receive notification via in-app chat.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                                    <span><strong>Response Time:</strong> Therapists have up to 15 minutes to respond to immediate booking requests.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                                    <span><strong>Scheduling:</strong> Scheduled bookings can be made up to 7 days in advance, subject to therapist availability.</span>
                                </li>
                            </ul>
                        </div>

                {/* Payment Terms */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-amber-500" />
                        Payment Terms
                    </h3>
                    <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span><strong>Payment Method:</strong> Payment is made directly to the massage therapist in cash upon service completion.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span><strong>Pricing:</strong> Prices displayed are final and include all applicable fees. No hidden charges.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
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

                {/* Profile Setup & Operational Fees - For Therapists and Service Providers */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-indigo-500" />
                        Profile Setup & Operational Fees
                    </h3>
                    <div className="space-y-4">
                        <p className="text-gray-700 leading-relaxed">
                            <strong>Platform Support Services:</strong> IndaStreet provides comprehensive business growth services to support massage therapists, massage centers, and facial treatment providers at every stage—from independent practitioners to established enterprises. Our team offers professional guidance, marketing support, and operational assistance to help you reach your full business potential.
                        </p>
                        
                        <p className="text-gray-700 leading-relaxed">
                            <strong>Operational Costs:</strong> Like your professional services, maintaining and operating a high-quality platform requires ongoing investment. To ensure sustainable growth, reliable infrastructure, and continuous improvement of our services, we must cover operational expenses including technology maintenance, customer support, payment processing, and platform development.
                        </p>

                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mt-4">
                            <h4 className="font-bold text-indigo-900 text-base mb-3">Profile Upload Fee Structure</h4>
                            
                            <ul className="space-y-3 text-gray-700">
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></span>
                                    <span><strong>Standard Profile Setup Fee:</strong> Therapist profiles, massage center profiles, and facial treatment center profiles uploaded and managed by the IndaStreet team are subject to a one-time setup fee of <strong>IDR 350,000</strong>. This fee covers professional profile creation, quality verification, photography assistance (if applicable), and initial platform integration.</span>
                                </li>
                                
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></span>
                                    <span><strong>Fee Waiver Program:</strong> As a token of appreciation for your partnership and continued service, the <strong>IDR 350,000 profile setup fee will be fully waived and refunded after your account has been active and operational for 4 consecutive months</strong>. This is our way of saying thank you for choosing IndaStreet as your business growth partner.</span>
                                </li>
                                
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></span>
                                    <span><strong>Profile Removal Policy:</strong> Please note that therapist profiles, massage center profiles, and facial treatment center profiles cannot be removed from the platform unless one of the following conditions is met:
                                        <ul className="list-disc pl-6 mt-2 space-y-1">
                                            <li>The profile setup fee of IDR 350,000 has been paid in full, OR</li>
                                            <li>Your account has completed the 4-month operational period and qualifies for fee waiver</li>
                                        </ul>
                                    </span>
                                </li>
                                
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></span>
                                    <span><strong>Payment Methods:</strong> Profile setup fees can be paid via bank transfer, mobile payment apps, or other payment methods as specified by the IndaStreet admin team. Payment confirmation and receipts will be provided upon request.</span>
                                </li>
                            </ul>
                        </div>

                        <p className="text-sm text-gray-600 italic mt-4">
                            <strong>Note:</strong> Self-registered profiles created directly by therapists or business owners through the platform's registration system are not subject to this setup fee. This fee applies exclusively to profiles created and uploaded by the IndaStreet team on behalf of service providers.
                        </p>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Phone className="w-5 h-5 text-purple-500" />
                        Contact & Support
                    </h3>
                    <div className="space-y-2 text-gray-600">
                        <p><strong>Platform Support:</strong> Available through in-app chat</p>
                        <p><strong>Admin Contact:</strong> WhatsApp support available for administrative issues only</p>
                        <p><strong>Emergency Contact:</strong> Contact local authorities for any emergency situations</p>
                        <p><strong>Disputes:</strong> All booking disputes will be mediated through IndaStreet platform</p>
                    </div>
                </div>

                {/* Agreement */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-amber-800 mb-3">Agreement</h3>
                    <p className="text-amber-700 leading-relaxed">
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