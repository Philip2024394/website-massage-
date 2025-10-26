import React, { useState } from 'react';

const ContactUsPage: React.FC = () => {
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
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white py-20">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <h1 className="text-5xl font-bold mb-6">Contact IndaStreet</h1>
                    <p className="text-xl text-teal-100 max-w-3xl mx-auto">
                        We're here to help. Get in touch with our team for support, partnerships, or inquiries.
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-16">
                {/* Contact Cards */}
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition-shadow">
                        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                            <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Email Us</h3>
                        <p className="text-gray-600 mb-4">support@indastreet.com</p>
                        <p className="text-sm text-gray-500">Response within 24 hours</p>
                    </div>

                    <div className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition-shadow">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">WhatsApp</h3>
                        <p className="text-gray-600 mb-4">+62 812 3456 7890</p>
                        <p className="text-sm text-gray-500">Available 24/7</p>
                    </div>

                    <div className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition-shadow">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Head Office</h3>
                        <p className="text-gray-600 mb-4">Bali, Indonesia</p>
                        <p className="text-sm text-gray-500">Mon-Sat: 9 AM - 6 PM WIB</p>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="grid md:grid-cols-2 gap-12 mb-16">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
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
                                className="w-full py-4 bg-gradient-to-r from-teal-600 to-blue-600 text-white font-bold rounded-lg hover:from-teal-700 hover:to-blue-700 transition-colors shadow-lg"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>

                    {/* Support Info */}
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Support Resources</h2>
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl p-6 shadow-lg">
                                <h3 className="text-xl font-bold text-teal-600 mb-3">🆘 Quick Support</h3>
                                <p className="text-gray-700 mb-4">
                                    Need immediate help? Check our FAQ section or contact us via WhatsApp for instant support.
                                </p>
                                <button className="text-blue-600 font-bold hover:text-blue-700">
                                    Visit FAQ →
                                </button>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-lg">
                                <h3 className="text-xl font-bold text-purple-600 mb-3">🤝 Partnership Inquiries</h3>
                                <p className="text-gray-700 mb-4">
                                    Interested in partnering with IndaStreet? Email us at partnerships@indastreet.com
                                </p>
                                <button className="text-blue-600 font-bold hover:text-blue-700">
                                    Learn More →
                                </button>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-lg">
                                <h3 className="text-xl font-bold text-orange-600 mb-3">📰 Press & Media</h3>
                                <p className="text-gray-700 mb-4">
                                    Media inquiries and press kit requests: press@indastreet.com
                                </p>
                                <button className="text-blue-600 font-bold hover:text-blue-700">
                                    Press Kit →
                                </button>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-lg">
                                <h3 className="text-xl font-bold text-green-600 mb-3">💼 Career Opportunities</h3>
                                <p className="text-gray-700 mb-4">
                                    Join our growing team! View open positions at careers@indastreet.com
                                </p>
                                <button className="text-blue-600 font-bold hover:text-blue-700">
                                    View Jobs →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Office Hours */}
                <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl p-8 mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Support Hours</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-xl p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">📧 Email Support</h3>
                            <div className="space-y-2 text-gray-700">
                                <p><span className="font-bold">Monday - Friday:</span> 9:00 AM - 6:00 PM WIB</p>
                                <p><span className="font-bold">Saturday:</span> 10:00 AM - 4:00 PM WIB</p>
                                <p><span className="font-bold">Sunday:</span> Closed</p>
                                <p className="text-sm text-gray-500 mt-4">Typical response time: 2-6 hours</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-6">
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
    );
};

export default ContactUsPage;
