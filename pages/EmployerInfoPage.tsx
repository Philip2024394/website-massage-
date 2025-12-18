import React, { useState } from 'react';

const BurgerMenuIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const CloseIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface EmployerInfoPageProps {
    onNavigate: (page: string) => void;
}

const EmployerInfoPage: React.FC<EmployerInfoPageProps> = ({ onNavigate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="p-4 bg-white sticky top-0 z-20 shadow-sm">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">
                        <span className="text-black">Inda</span><span className="text-orange-500"><span className="inline-block animate-float">S</span>treet</span>
                    </h1>
                    <div className="flex items-center gap-4 text-gray-600">
                        <button onClick={() => setIsMenuOpen(true)} title="Menu">
                           <BurgerMenuIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>
            
            {/* Side Drawer */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
                    <div 
                        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" 
                        onClick={() => setIsMenuOpen(false)}
                        aria-hidden="true"
                    ></div>
    
                    <div className={`absolute right-0 top-0 bottom-0 w-[70%] sm:w-80 bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-2xl flex flex-col transform transition-transform ease-in-out duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                        <div className="p-6 flex justify-between items-center">
                            <h2 className="font-bold text-2xl">
                                <span className="text-black">inda</span>
                                <span className="text-orange-500">Street</span>
                            </h2>
                            <button 
                                onClick={() => setIsMenuOpen(false)} 
                                className="text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-all" 
                                aria-label="Close menu"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        <nav className="flex-grow overflow-y-auto p-4">
                            <div className="space-y-2">
                                <button 
                                    onClick={() => onNavigate('home')} 
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-orange-500 group"
                                >
                                    <span className="text-2xl">🏠</span>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">Back to Home</h3>
                                        <p className="text-xs text-gray-500">Return to main page</p>
                                    </div>
                                </button>
                            </div>
                        </nav>
                    </div>
                </div>
            )}

            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
                {/* Hero Section */}
                <div 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-20 relative bg-cover bg-center"
                    style={{
                        backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/massage%20jobs.png?updatedAt=1761571942696)',
                    }}
                >
                    <div className="absolute inset-0 bg-black/30"></div>
                    <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
                        <h1 className="text-5xl font-bold mb-6 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">👔 For Employers</h1>
                        <p className="text-xl text-white max-w-3xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                            Hire certified massage therapists seeking full-time employment
                        </p>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 py-16">
                    {/* What is Therapist For Contract */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 p-8 mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What is "Therapist For Contract"?</h2>
                        <p className="text-gray-600 text-lg text-center max-w-3xl mx-auto mb-8">
                            Our privacy-protected job marketplace where certified therapists actively seeking permanent employment list themselves with hidden identities. Browse qualified candidates and unlock contact information for a one-time fee.
                        </p>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <span className="text-3xl">🔒</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Privacy Protected</h3>
                                <p className="text-gray-600">
                                    Therapist names hidden until you pay unlock fee, protecting them from spam and unsolicited contacts.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <span className="text-3xl">✓</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Pre-Verified Professionals</h3>
                                <p className="text-gray-600">
                                    All therapists are certified and verified. View qualifications, experience, and specializations.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <span className="text-3xl">💼</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Serious Candidates Only</h3>
                                <p className="text-gray-600">
                                    Therapists seeking full-time roles, not freelancers. Ready for interviews and employment.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* How It Works for Employers */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How to Hire Through IndaStreet</h2>
                        <div className="grid md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">1</div>
                                <h4 className="font-bold text-gray-900 mb-2">Browse Candidates</h4>
                                <p className="text-sm text-gray-600">Search therapist listings by specialty, location, experience, certifications</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">2</div>
                                <h4 className="font-bold text-gray-900 mb-2">Review Qualifications</h4>
                                <p className="text-sm text-gray-600">See detailed profiles with work history, skills, and certifications (name hidden)</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">3</div>
                                <h4 className="font-bold text-gray-900 mb-2">Pay Unlock Fee</h4>
                                <p className="text-sm text-gray-600">IDR 300,000 one-time payment to reveal name and WhatsApp contact</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">4</div>
                                <h4 className="font-bold text-gray-900 mb-2">Interview & Hire</h4>
                                <p className="text-sm text-gray-600">Contact directly via WhatsApp, conduct interviews, negotiate salary, hire</p>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Information */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 p-8 mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Simple, Transparent Pricing</h2>
                        <div className="max-w-2xl mx-auto">
                            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center mb-6">
                                <h3 className="text-2xl font-bold mb-2">IDR 300,000</h3>
                                <p className="text-white/90 mb-4">One-time unlock fee per therapist</p>
                                <div className="text-left space-y-2 text-sm">
                                    <p>✓ Reveals therapist's full name</p>
                                    <p>✓ Unlocks WhatsApp contact number</p>
                                    <p>✓ Access to complete profile details</p>
                                    <p>✓ Direct communication for interviews</p>
                                    <p>✓ No placement fees or commissions</p>
                                    <p>✓ No recurring charges</p>
                                </div>
                            </div>
                            <div className="border-l-4 border-green-500 pl-6 py-4">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Free Features</h3>
                                <ul className="text-gray-600 space-y-2">
                                    <li>• Browse all therapist listings</li>
                                    <li>• View qualifications and certifications</li>
                                    <li>• See work experience and specializations</li>
                                    <li>• Filter by location and skills</li>
                                    <li>• Read profile descriptions</li>
                                    <li>• Save favorite candidates</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* What You Can See */}
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Candidate Information Available</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-purple-500">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Before Unlocking (Free)</h3>
                                <ul className="text-gray-600 space-y-2">
                                    <li>✓ Years of experience</li>
                                    <li>✓ Massage specializations (e.g., Balinese, Deep Tissue, Swedish)</li>
                                    <li>✓ Certifications and training institutions</li>
                                    <li>✓ Languages spoken</li>
                                    <li>✓ Current location/service area</li>
                                    <li>✓ Availability (full-time/part-time preference)</li>
                                    <li>✓ Profile description and skills</li>
                                    <li>✗ Name (hidden as "Therapist #1234")</li>
                                    <li>✗ WhatsApp number (locked)</li>
                                </ul>
                            </div>

                            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-6 shadow-lg border-l-4 border-pink-500">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">After Unlocking (IDR 300K)</h3>
                                <ul className="text-gray-900 space-y-2">
                                    <li>✓ <strong>Full Name Revealed</strong></li>
                                    <li>✓ <strong>WhatsApp Contact Number</strong></li>
                                    <li>✓ All information from free preview</li>
                                    <li>✓ Direct communication for interviews</li>
                                    <li>✓ Ability to negotiate salary and terms</li>
                                    <li>✓ Schedule in-person interviews</li>
                                    <li>✓ Request references and additional documents</li>
                                    <li>✓ Complete hiring process independently</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Benefits for Employers */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Employers Love IndaStreet</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-xl p-6 shadow-md">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-2xl">💰</span>
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2">Cost Effective</h4>
                                <p className="text-sm text-gray-600">
                                    No expensive recruitment agency fees (typically 20-30% of annual salary). Pay only IDR 300K per unlock.
                                </p>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-md">
                                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-2xl">⚡</span>
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2">Fast Hiring</h4>
                                <p className="text-sm text-gray-600">
                                    Candidates are pre-verified and ready to work. Skip lengthy recruitment processes and hire within days.
                                </p>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-md">
                                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-2xl">🎯</span>
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2">Quality Candidates</h4>
                                <p className="text-sm text-gray-600">
                                    All therapists are certified professionals actively seeking employment, not passive job seekers.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Employer Success Stories */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 p-8 mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Employer Success Stories</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                                        <span className="text-2xl">🏨</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Luxury Resort Seminyak</h4>
                                        <p className="text-sm text-gray-600">5-Star Hotel</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 italic text-sm">
                                    "Hired 3 full-time therapists in 2 weeks! Saved over IDR 50 million in recruitment agency fees. All candidates were professional and certified."
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mr-4">
                                        <span className="text-2xl">💆</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Wellness Spa Ubud</h4>
                                        <p className="text-sm text-gray-600">Day Spa</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 italic text-sm">
                                    "Found our head therapist through IndaStreet. The unlock fee was nothing compared to agency costs. She's been with us 6 months - perfect fit!"
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                                        <span className="text-2xl">🏡</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Private Villa Canggu</h4>
                                        <p className="text-sm text-gray-600">Luxury Villa</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 italic text-sm">
                                    "Platform made hiring so easy. Unlocked 2 profiles, interviewed both, hired 1. Total cost IDR 600K vs millions with agencies!"
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-12 text-center text-white">
                        <h2 className="text-4xl font-bold mb-4">Ready to Find Your Next Therapist?</h2>
                        <p className="text-xl mb-8 max-w-2xl mx-auto">
                            Browse 100+ certified therapists actively seeking full-time employment
                        </p>
                        <button 
                            onClick={() => onNavigate('therapistJobs')}
                            className="px-8 py-4 bg-white text-purple-600 font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-lg text-lg"
                        >
                            Browse Therapist For Contract
                        </button>
                        <p className="mt-6 text-sm">
                            Questions? <button onClick={() => onNavigate('contact')} className="underline font-bold">Contact our hiring support team</button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployerInfoPage;

