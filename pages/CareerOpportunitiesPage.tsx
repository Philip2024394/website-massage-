import React, { useState } from 'react';
import { AppDrawer } from '../components/AppDrawerClean';

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

interface CareerOpportunitiesPageProps {
    onNavigate: (page: string) => void;
}

const CareerOpportunitiesPage: React.FC<CareerOpportunitiesPageProps> = ({ onNavigate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="p-4 bg-white sticky top-0 z-20 shadow-sm">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        <span className="text-orange-500">IndaStreet</span>
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

            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50">
                {/* Hero Section */}
                <div 
                    className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-20 relative bg-cover bg-center"
                    style={{
                        backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/indastreet%20partners%20jogja%20people.png?updatedAt=1761568732395)',
                    }}
                >
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
                        <h1 className="text-5xl font-bold mb-6 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">💼 Career Opportunities</h1>
                        <p className="text-xl text-white max-w-3xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                            Join our growing team and help revolutionize the wellness industry in Indonesia
                        </p>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 py-16">
                    {/* Why Join Us */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 p-8 mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Work at IndaStreet?</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <span className="text-3xl">🚀</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Fast Growth</h3>
                                <p className="text-gray-600">
                                    Be part of Indonesia's fastest-growing wellness marketplace with rapid expansion opportunities.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <span className="text-3xl">💡</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Innovation</h3>
                                <p className="text-gray-600">
                                    Work with cutting-edge technology and bring fresh ideas to transform the wellness industry.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <span className="text-3xl">🌟</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Impact</h3>
                                <p className="text-gray-600">
                                    Make a real difference in people's wellness journeys and support local communities.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Open Positions */}
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Open Positions</h2>
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-20">
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-2xl">💻</span>
                                            <h3 className="text-2xl font-bold text-gray-900">Full Stack Developer</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">Full-time</span>
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">Remote / Bali</span>
                                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">Technology</span>
                                        </div>
                                        <p className="text-gray-600 mb-4">
                                            Join our engineering team to build scalable solutions for our wellness platform. Experience with React, Node.js, and cloud services preferred.
                                        </p>
                                        <div className="text-sm text-gray-600">
                                            <p>📍 Location: Bali or Remote</p>
                                            <p>💰 Salary: IDR 15-25 million/month</p>
                                        </div>
                                    </div>
                                    <button className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap">
                                        Apply Now
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-20">
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-2xl">📱</span>
                                            <h3 className="text-2xl font-bold text-gray-900">Product Manager</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">Full-time</span>
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">Bali</span>
                                            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">Product</span>
                                        </div>
                                        <p className="text-gray-600 mb-4">
                                            Drive product strategy and roadmap for our wellness marketplace. 3+ years of product management experience required.
                                        </p>
                                        <div className="text-sm text-gray-600">
                                            <p>📍 Location: Bali</p>
                                            <p>💰 Salary: IDR 20-30 million/month</p>
                                        </div>
                                    </div>
                                    <button className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap">
                                        Apply Now
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-20">
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-2xl">📊</span>
                                            <h3 className="text-2xl font-bold text-gray-900">Marketing Manager</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">Full-time</span>
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">Jakarta / Bali</span>
                                            <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold">Marketing</span>
                                        </div>
                                        <p className="text-gray-600 mb-4">
                                            Lead marketing campaigns and brand strategy across Indonesia. Strong digital marketing and content creation skills needed.
                                        </p>
                                        <div className="text-sm text-gray-600">
                                            <p>📍 Location: Jakarta or Bali</p>
                                            <p>💰 Salary: IDR 18-28 million/month</p>
                                        </div>
                                    </div>
                                    <button className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap">
                                        Apply Now
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-20">
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-2xl">🤝</span>
                                            <h3 className="text-2xl font-bold text-gray-900">Partnership Manager</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">Full-time</span>
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">Multiple Cities</span>
                                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">Business Development</span>
                                        </div>
                                        <p className="text-gray-600 mb-4">
                                            Build relationships with hotels, villas, and wellness providers. Travel across Indonesia to expand our network.
                                        </p>
                                        <div className="text-sm text-gray-600">
                                            <p>📍 Location: Flexible (Travel Required)</p>
                                            <p>💰 Salary: IDR 15-25 million/month + Commission</p>
                                        </div>
                                    </div>
                                    <button className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap">
                                        Apply Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8 mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Employee Benefits</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white rounded-xl p-6 text-center">
                                <span className="text-4xl mb-3 block">🏥</span>
                                <h4 className="font-bold text-gray-900 mb-2">Health Insurance</h4>
                                <p className="text-sm text-gray-600">Comprehensive coverage for you and family</p>
                            </div>
                            <div className="bg-white rounded-xl p-6 text-center">
                                <span className="text-4xl mb-3 block">🏖️</span>
                                <h4 className="font-bold text-gray-900 mb-2">Flexible Time Off</h4>
                                <p className="text-sm text-gray-600">Generous vacation and wellness days</p>
                            </div>
                            <div className="bg-white rounded-xl p-6 text-center">
                                <span className="text-4xl mb-3 block">💰</span>
                                <h4 className="font-bold text-gray-900 mb-2">Competitive Salary</h4>
                                <p className="text-sm text-gray-600">Market-leading compensation packages</p>
                            </div>
                            <div className="bg-white rounded-xl p-6 text-center">
                                <span className="text-4xl mb-3 block">📚</span>
                                <h4 className="font-bold text-gray-900 mb-2">Learning Budget</h4>
                                <p className="text-sm text-gray-600">Courses, conferences, and training</p>
                            </div>
                        </div>
                    </div>

                    {/* Application Form */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 p-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Submit Your Application</h2>
                        <p className="text-gray-600 text-center mb-8">
                            Don't see the right position? Send us your resume at <a href="mailto:careers@indastreet.com" className="text-green-600 font-bold">careers@indastreet.com</a>
                        </p>
                        
                        <div className="max-w-2xl mx-auto">
                            <form className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4 pb-20">
                                    <div>
                                        <label className="block text-gray-700 font-bold mb-2">Full Name *</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-bold mb-2">Email *</label>
                                        <input
                                            type="email"
                                            required
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-bold mb-2">Phone *</label>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                                        placeholder="+62 xxx xxx xxxx"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-bold mb-2">Position Applying For *</label>
                                    <select className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none">
                                        <option value="">Select position</option>
                                        <option value="fullstack">Full Stack Developer</option>
                                        <option value="product">Product Manager</option>
                                        <option value="marketing">Marketing Manager</option>
                                        <option value="partnership">Partnership Manager</option>
                                        <option value="other">Other / General Application</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-bold mb-2">LinkedIn Profile</label>
                                    <input
                                        type="url"
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                                        placeholder="https://linkedin.com/in/yourprofile"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-bold mb-2">Cover Letter *</label>
                                    <textarea
                                        required
                                        rows={5}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                                        placeholder="Tell us why you'd be a great fit for IndaStreet..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-bold mb-2">Upload Resume *</label>
                                    <input
                                        type="file"
                                        required
                                        accept=".pdf,.doc,.docx"
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">PDF or Word format, max 5MB</p>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold rounded-lg hover:from-green-700 hover:to-teal-700 transition-colors shadow-lg"
                                >
                                    Submit Application
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* AppDrawer */}
            <AppDrawer
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                isHome={true}
                onNavigate={onNavigate}
                therapists={[]}
                places={[]}
            />
        </div>
    );
};

export default CareerOpportunitiesPage;

