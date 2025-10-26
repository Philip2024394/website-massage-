import React from 'react';

const AboutUsPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white py-20">
                <div className="max-w-6xl mx-auto px-4">
                    <h1 className="text-5xl font-bold mb-6">About IndaStreet</h1>
                    <p className="text-xl text-orange-100 max-w-3xl">
                        Indonesia's First Comprehensive Wellness Marketplace Connecting Therapists, Hotels, and Employers
                    </p>
                </div>
            </div>

            {/* Mission Section */}
            <div className="max-w-6xl mx-auto px-4 py-16">
                <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                        <p className="text-lg text-gray-700 mb-4">
                            To revolutionize Indonesia's wellness industry by creating a transparent, secure, and efficient 
                            platform that empowers massage therapists, connects businesses with qualified professionals, 
                            and delivers exceptional wellness experiences.
                        </p>
                        <p className="text-lg text-gray-700">
                            We believe every therapist deserves fair opportunities, every hotel deserves access to 
                            top talent, and every client deserves professional, verified wellness services.
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl p-8 border-2 border-orange-200">
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Verified Professionals</h3>
                                    <p className="text-gray-600">Every therapist is verified with certifications and background checks</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Privacy Protected</h3>
                                    <p className="text-gray-600">Advanced privacy controls protect therapist information until verified contact</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Instant Connections</h3>
                                    <p className="text-gray-600">Real-time matching and WhatsApp integration for immediate communication</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Story Section */}
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-20">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
                    <div className="prose prose-lg max-w-none text-gray-700">
                        <p className="mb-4">
                            IndaStreet was born from a simple observation: Indonesia's booming wellness and tourism 
                            industry lacked a professional platform to connect qualified massage therapists with 
                            hotels, resorts, and employers.
                        </p>
                        <p className="mb-4">
                            Hotels struggled to find certified therapists. Therapists couldn't find legitimate job 
                            opportunities. Employers had no way to verify qualifications. The entire industry operated 
                            through word-of-mouth and informal networks.
                        </p>
                        <p className="mb-4">
                            We set out to change that. In 2025, we launched Indonesia's first comprehensive wellness 
                            marketplace that serves therapists, hotels, employers, and agents in one unified platform.
                        </p>
                        <p>
                            Today, we're proud to be revolutionizing how Indonesia's wellness industry operates, 
                            bringing transparency, professionalism, and opportunity to thousands of therapists and 
                            businesses across the archipelago.
                        </p>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid md:grid-cols-4 gap-6 mb-20">
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white text-center">
                        <div className="text-4xl font-bold mb-2">500+</div>
                        <div className="text-orange-100">Verified Therapists</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white text-center">
                        <div className="text-4xl font-bold mb-2">200+</div>
                        <div className="text-blue-100">Hotel Partners</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white text-center">
                        <div className="text-4xl font-bold mb-2">50+</div>
                        <div className="text-green-100">Active Agents</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white text-center">
                        <div className="text-4xl font-bold mb-2">10K+</div>
                        <div className="text-purple-100">Connections Made</div>
                    </div>
                </div>

                {/* Values */}
                <div className="mb-20">
                    <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Core Values</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Empowerment</h3>
                            <p className="text-gray-600">
                                We empower therapists with tools, opportunities, and fair compensation. We believe 
                                in elevating the wellness profession.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Trust & Safety</h3>
                            <p className="text-gray-600">
                                Every verification matters. We ensure safe, secure connections through rigorous 
                                background checks and privacy protection.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Innovation</h3>
                            <p className="text-gray-600">
                                We continuously innovate to solve industry problems. From payment verification to 
                                privacy protection, we lead with technology.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Team Section */}
                <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-8 md:p-12 border-2 border-orange-100">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Why Choose IndaStreet?</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="flex items-start gap-4">
                            <svg className="w-8 h-8 text-orange-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <div>
                                <h4 className="font-bold text-gray-900 mb-2">Multi-Sided Platform</h4>
                                <p className="text-gray-600">Serving therapists, hotels, employers, and agents in one ecosystem</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <svg className="w-8 h-8 text-orange-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <div>
                                <h4 className="font-bold text-gray-900 mb-2">Bilingual Support</h4>
                                <p className="text-gray-600">Full Indonesian and English support for international reach</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <svg className="w-8 h-8 text-orange-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <div>
                                <h4 className="font-bold text-gray-900 mb-2">Payment Verification</h4>
                                <p className="text-gray-600">Secure bank transfer system with admin verification</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <svg className="w-8 h-8 text-orange-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <div>
                                <h4 className="font-bold text-gray-900 mb-2">WhatsApp Integration</h4>
                                <p className="text-gray-600">Instant communication through Indonesia's favorite messaging app</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <svg className="w-8 h-8 text-orange-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <div>
                                <h4 className="font-bold text-gray-900 mb-2">Mobile Optimized</h4>
                                <p className="text-gray-600">Seamless experience on all devices, optimized for mobile</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <svg className="w-8 h-8 text-orange-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <div>
                                <h4 className="font-bold text-gray-900 mb-2">Indonesia-First Design</h4>
                                <p className="text-gray-600">Built specifically for Indonesian wellness market needs</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="mt-20 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Join the Wellness Revolution</h2>
                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                        Whether you're a therapist seeking opportunities, a hotel looking for talent, or an employer 
                        searching for professionals, IndaStreet is your trusted partner.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <button className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors shadow-lg">
                            Get Started Today
                        </button>
                        <button className="px-8 py-4 border-2 border-orange-500 text-orange-600 hover:bg-orange-50 font-bold rounded-lg transition-colors">
                            Contact Our Team
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUsPage;
