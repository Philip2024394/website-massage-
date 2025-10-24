import React from 'react';

const JoinIndoStreetPage: React.FC = () => {
    const handleWhatsAppContact = () => {
        const adminNumber = '6281392000050';
        const message = 'Hello IndoStreet Admin, I would like to learn more about joining the platform.';
        window.open(`https://wa.me/${adminNumber}?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 pb-16">
            {/* Floating WhatsApp Button */}
            <button
                onClick={handleWhatsAppContact}
                className="fixed bottom-20 right-6 z-50 w-16 h-16 bg-green-500 rounded-full shadow-2xl flex items-center justify-center hover:bg-green-600 transition-all hover:scale-110 animate-pulse"
                aria-label="Contact via WhatsApp"
            >
                <svg className="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
            </button>

            <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                        <span className="text-gray-900">Join </span>
                        <span className="text-orange-600">Indo</span>
                        <span className="text-gray-900">Street</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600">Unlock Your Business Potential</p>
                </div>

                {/* Service Options */}
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    {/* Massage Therapist */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
                        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 text-white">
                            <div className="text-5xl mb-4">🛏️</div>
                            <h2 className="text-2xl font-bold">Massage Therapist</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <h3 className="font-bold text-lg text-gray-900">Benefits:</h3>
                            <ul className="space-y-3 text-gray-700 text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 font-bold">✓</span>
                                    <span>Flexible working hours - be your own boss</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 font-bold">✓</span>
                                    <span>Access to thousands of potential clients</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 font-bold">✓</span>
                                    <span>Set your own pricing and service areas</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 font-bold">✓</span>
                                    <span>Professional platform with verified bookings</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 font-bold">✓</span>
                                    <span>Direct WhatsApp communication with clients</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 font-bold">✓</span>
                                    <span>Track your analytics and grow your business</span>
                                </li>
                            </ul>
                            <button
                                onClick={handleWhatsAppContact}
                                className="w-full mt-4 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                            >
                                Get Started
                            </button>
                        </div>
                    </div>

                    {/* Massage Spa/Place */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white">
                            <div className="text-5xl mb-4">🏢</div>
                            <h2 className="text-2xl font-bold">Massage Spa</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <h3 className="font-bold text-lg text-gray-900">Benefits:</h3>
                            <ul className="space-y-3 text-gray-700 text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-500 font-bold">✓</span>
                                    <span>Increase customer footfall by up to 40%</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-500 font-bold">✓</span>
                                    <span>Digital presence on popular platform</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-500 font-bold">✓</span>
                                    <span>Showcase your spa facilities and services</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-500 font-bold">✓</span>
                                    <span>Manage multiple therapists and bookings</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-500 font-bold">✓</span>
                                    <span>Real-time availability management</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-500 font-bold">✓</span>
                                    <span>Customer reviews and ratings system</span>
                                </li>
                            </ul>
                            <button
                                onClick={handleWhatsAppContact}
                                className="w-full mt-4 bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-600 transition-colors"
                            >
                                Get Started
                            </button>
                        </div>
                    </div>

                    {/* Hotel/Villa Services */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white">
                            <div className="text-5xl mb-4">🏨</div>
                            <h2 className="text-2xl font-bold">Hotel / Villa</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <h3 className="font-bold text-lg text-gray-900">Benefits:</h3>
                            <ul className="space-y-3 text-gray-700 text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-500 font-bold">✓</span>
                                    <span className="font-bold">Increase room bookings by 30%</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-500 font-bold">✓</span>
                                    <span>Premium amenity for your guests</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-500 font-bold">✓</span>
                                    <span>No additional staffing costs required</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-500 font-bold">✓</span>
                                    <span>On-demand massage services for guests</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-500 font-bold">✓</span>
                                    <span>Enhance guest satisfaction and reviews</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-500 font-bold">✓</span>
                                    <span>Competitive edge over other properties</span>
                                </li>
                            </ul>
                            <button
                                onClick={handleWhatsAppContact}
                                className="w-full mt-4 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>

                {/* How It Works */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
                    <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">How It Works</h2>
                    <div className="grid md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">1️⃣</span>
                            </div>
                            <h3 className="font-bold text-lg mb-2">Contact Us</h3>
                            <p className="text-sm text-gray-600">Tap the WhatsApp button to express your interest</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">2️⃣</span>
                            </div>
                            <h3 className="font-bold text-lg mb-2">Discussion</h3>
                            <p className="text-sm text-gray-600">Our team will discuss details and answer questions</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">3️⃣</span>
                            </div>
                            <h3 className="font-bold text-lg mb-2">Setup Profile</h3>
                            <p className="text-sm text-gray-600">Create your professional profile with photos and services</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">4️⃣</span>
                            </div>
                            <h3 className="font-bold text-lg mb-2">Go Live!</h3>
                            <p className="text-sm text-gray-600">Start receiving bookings and growing your business</p>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-2xl p-8 text-white text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h2>
                    <p className="text-lg mb-6 opacity-90">Join hundreds of successful professionals on IndoStreet</p>
                    <button
                        onClick={handleWhatsAppContact}
                        className="bg-white text-orange-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors inline-flex items-center gap-3"
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        Contact Us on WhatsApp
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JoinIndoStreetPage;
