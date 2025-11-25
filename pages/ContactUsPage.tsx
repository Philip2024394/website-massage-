import React, { useState } from 'react';
import { AppDrawer } from '../components/AppDrawer';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';

interface ContactUsPageProps {
    onNavigate: (page: string) => void;
    // Add navigation props for the drawer
    onMassageJobsClick?: () => void;

    onVillaPortalClick?: () => void;
    onTherapistPortalClick?: () => void;
    onMassagePlacePortalClick?: () => void;
    onAgentPortalClick?: () => void;
    onCustomerPortalClick?: () => void;
    onAdminPortalClick?: () => void;
    onTermsClick?: () => void;
    onPrivacyClick?: () => void;
    therapists?: any[];
    places?: any[];
}

const ContactUsPage: React.FC<ContactUsPageProps> = ({ 
    onNavigate,
    onMassageJobsClick,

    onVillaPortalClick,
    onTherapistPortalClick,
    onMassagePlacePortalClick,
    onAgentPortalClick,
    onCustomerPortalClick,
    onAdminPortalClick,
    onTermsClick,
    onPrivacyClick,
    therapists = [],
    places = []
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        userType: '',
        subject: '',
        message: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        console.log('Form submitted:', formData);
        alert('Thank you for contacting us! We will respond within 24 hours.');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="p-4 bg-white sticky top-0 z-20 shadow-sm">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">
                        <span className="text-black">Inda</span><span className="text-orange-500"><span className="inline-block animate-float">S</span>treet</span>
                    </h1>
                    <div className="flex items-center gap-4 pb-20 text-gray-600">
                        {/* Home Button */}
                        <button
                            onClick={() => onNavigate?.('home')}
                            className="p-2 hover:bg-gray-100 rounded-full"
                            title="Home"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </button>
                        <button onClick={() => setIsMenuOpen(true)} title="Menu">
                           <BurgerMenuIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>
            
            {/* Global App Drawer */}
            <AppDrawer
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onMassageJobsClick={onMassageJobsClick}

                onVillaPortalClick={onVillaPortalClick}
                onTherapistPortalClick={onTherapistPortalClick}
                onMassagePlacePortalClick={onMassagePlacePortalClick}
                onAgentPortalClick={onAgentPortalClick}
                onCustomerPortalClick={onCustomerPortalClick}
                onAdminPortalClick={onAdminPortalClick}
                onNavigate={onNavigate}
                onTermsClick={onTermsClick}
                onPrivacyClick={onPrivacyClick}
                therapists={therapists}
                places={places}
            />

        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
            {/* Hero Section */}
            <div 
                className="bg-gradient-to-r from-teal-600 to-blue-600 text-white py-20 relative bg-cover bg-center"
                style={{
                    backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/indastreet%20apps.png?updatedAt=1761568212865)',
                }}
            >
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
                    <h1 className="text-5xl font-bold mb-6 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">Contact IndaStreet</h1>
                    <p className="text-xl text-white max-w-3xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                        We're here to help. Get in touch with our team for support, partnerships, or inquiries.
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-16">
                {/* Contact Form */}
                <div className="grid md:grid-cols-2 gap-12 mb-16">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Let's Connect</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-gray-700 font-bold mb-2">Your Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none"
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-bold mb-2">Email Address *</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none"
                                    placeholder="your.email@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-bold mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none"
                                    placeholder="+62 812 3456 7890"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-bold mb-2">I am a... *</label>
                                <select
                                    required
                                    value={formData.userType}
                                    onChange={(e) => setFormData({...formData, userType: e.target.value})}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none"
                                >
                                    <option value="">Select user type</option>
                                    <option value="therapist">Massage Therapist</option>
                                    <option value="hotel">Hotel/Villa Owner</option>
                                    <option value="employer">Employer/Spa Manager</option>
                                    <option value="agent">Agent</option>
                                    <option value="client">Client/Customer</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-bold mb-2">Subject *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.subject}
                                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none"
                                    placeholder="What is your inquiry about?"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-bold mb-2">Message *</label>
                                <textarea
                                    required
                                    value={formData.message}
                                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                                    rows={6}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none"
                                    placeholder="Tell us how we can help you..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-colors shadow-lg"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>

                    {/* Support Info */}
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Support Resources</h2>
                        <div className="space-y-6">
                            <div 
                                className="bg-white rounded-xl p-6 shadow-lg relative bg-cover bg-center overflow-hidden"
                                style={{
                                    backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/support%20indastreet.png?updatedAt=1761569793668)',
                                }}
                            >
                                <div className="absolute inset-0 bg-white/85"></div>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold text-teal-600 mb-3">🆘 Quick Support</h3>
                                    <p className="text-gray-700 mb-4">
                                        Need immediate help? Check our FAQ section or contact us via WhatsApp for instant support.
                                    </p>
                                    <button 
                                        onClick={() => onNavigate('quick-support')}
                                        className="text-orange-600 font-bold hover:text-orange-700"
                                    >
                                        Visit FAQ →
                                    </button>
                                </div>
                            </div>

                            <div 
                                className="bg-white rounded-xl p-6 shadow-lg relative bg-cover bg-center overflow-hidden"
                                style={{
                                    backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/indastreet%20partners.png?updatedAt=1761568366041)',
                                }}
                            >
                                <div className="absolute inset-0 bg-white/85"></div>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold text-purple-600 mb-3">🤝 Partnership Inquiries</h3>
                                    <p className="text-gray-700 mb-4">
                                        Interested in partnering with IndaStreet? Email us at partnerships@indastreetmassage.com
                                    </p>
                                    <button 
                                        onClick={() => onNavigate('partnership-inquiries')}
                                        className="text-orange-600 font-bold hover:text-orange-700"
                                    >
                                        Learn More →
                                    </button>
                                </div>
                            </div>

                            <div 
                                className="bg-white rounded-xl p-6 shadow-lg relative bg-cover bg-center overflow-hidden"
                                style={{
                                    backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/indastreet%20partners%20jogja.png?updatedAt=1761568590477)',
                                }}
                            >
                                <div className="absolute inset-0 bg-white/85"></div>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold text-orange-600 mb-3">📰 Press & Media</h3>
                                    <p className="text-gray-700 mb-4">
                                        Media inquiries and press kit requests: press@indastreetmassage.com
                                    </p>
                                    <button 
                                        onClick={() => onNavigate('press-media')}
                                        className="text-orange-600 font-bold hover:text-orange-700"
                                    >
                                        Press Kit →
                                    </button>
                                </div>
                            </div>

                            <div 
                                className="bg-white rounded-xl p-6 shadow-lg relative bg-cover bg-center overflow-hidden"
                                style={{
                                    backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/indastreet%20partners%20jogja%20people.png?updatedAt=1761568732395)',
                                }}
                            >
                                <div className="absolute inset-0 bg-white/85"></div>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold text-green-600 mb-3">💼 Career Opportunities</h3>
                                    <p className="text-gray-700 mb-4">
                                        Join our growing team! View open positions at careers@indastreetmassage.com
                                    </p>
                                    <button 
                                        onClick={() => onNavigate('career-opportunities')}
                                        className="text-orange-600 font-bold hover:text-orange-700"
                                    >
                                        View Jobs →
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Office Hours */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 p-8 mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Support Hours</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl p-6 border border-teal-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">📧 Email Support</h3>
                            <div className="space-y-2 text-gray-700">
                                <p><span className="font-bold">Monday - Friday:</span> 9:00 AM - 6:00 PM WIB</p>
                                <p><span className="font-bold">Saturday:</span> 10:00 AM - 4:00 PM WIB</p>
                                <p><span className="font-bold">Sunday:</span> Closed</p>
                                <p className="text-sm text-gray-500 mt-4">Typical response time: 2-6 hours</p>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 border border-green-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">💬 WhatsApp Support</h3>
                            <div className="space-y-2 text-gray-700">
                                <p><span className="font-bold">Available:</span> 24 hours / 7 days</p>
                                <p><span className="font-bold">Auto-Response:</span> Instant</p>
                                <p><span className="font-bold">Live Support:</span> 8:00 AM - 10:00 PM WIB</p>
                                <p className="text-sm text-gray-500 mt-4">Fastest way to get help!</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Media */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Follow Us on Social Media</h2>
                    <div className="flex justify-center gap-6 mb-8">
                        <a href="#" className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                        </a>
                        <a href="#" className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full flex items-center justify-center text-white hover:from-purple-700 hover:to-pink-600 transition-colors">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                        </a>
                        <a href="#" className="w-14 h-14 bg-blue-400 rounded-full flex items-center justify-center text-white hover:bg-blue-500 transition-colors">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                            </svg>
                        </a>
                        <a href="#" className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition-colors">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                        </a>
                    </div>
                    <p className="text-gray-600">
                        Stay updated with the latest news, tips, and wellness content from IndaStreet
                    </p>
                </div>
            </div>
        </div>
        </div>
    );
};

export default ContactUsPage;

