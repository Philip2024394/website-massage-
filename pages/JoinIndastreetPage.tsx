import React from 'react';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import HomeIcon from '../components/icons/HomeIcon';

interface JoinIndastreetPageProps {
    onBack: () => void;
    onNavigateToTherapistLogin: () => void;
    onNavigateToMassagePlaceLogin: () => void;
    t: any;
}

const JoinIndastreetPage: React.FC<JoinIndastreetPageProps> = ({
    onBack,
    t
}) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50">
            {/* Global Header - Same as HomePage */}
            <header className="bg-white p-4 shadow-md sticky top-0 z-[9997]">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500">Street</span>
                    </h1>
                    <div className="flex items-center gap-3 text-gray-600">
                        <button 
                            onClick={onBack}
                            className="p-2 hover:bg-orange-50 rounded-full transition-colors"
                            title="Home"
                        >
                            <HomeIcon className="w-5 h-5 text-orange-500" />
                        </button>
                        <button className="p-2 hover:bg-orange-50 rounded-full transition-colors text-orange-500">
                           <BurgerMenuIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 py-8 pb-24">
                {/* Hero Image Section */}
                <div className="text-center mb-12">
                    <div className="max-w-4xl mx-auto mb-8">
                        <img 
                            src="https://ik.imagekit.io/7grri5v7d/indastreet%20agent.png?updatedAt=1763103354040"
                            alt="Join Indastreet"
                            className="w-full h-auto rounded-3xl shadow-2xl object-cover"
                        />
                    </div>
                    
                    {/* Agent Opportunity Header */}
                    <div className="max-w-4xl mx-auto mb-12">
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                            Become an Indastreet Partner Agent
                        </h2>
                        <div className="bg-white rounded-2xl shadow-xl p-8 text-left">
                            <h3 className="text-2xl font-bold text-orange-600 mb-4">
                                Build Your Future as a Self-Employed Partner
                            </h3>
                            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                                Join Indastreet as a partner agent and earn lucrative commissions while helping wellness professionals grow their business. This exclusive opportunity allows you to work on your own schedule while building a sustainable income stream.
                            </p>
                            
                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6">
                                    <div className="text-4xl font-bold text-orange-600 mb-2">20%</div>
                                    <p className="text-gray-700 font-semibold">Commission on New Sign-ups</p>
                                    <p className="text-sm text-gray-600 mt-2">Earn 20% commission for every new therapist or massage place you bring to Indastreet</p>
                                </div>
                                <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-6">
                                    <div className="text-4xl font-bold text-teal-600 mb-2">10%</div>
                                    <p className="text-gray-700 font-semibold">Recurring Commission</p>
                                    <p className="text-sm text-gray-600 mt-2">Continuous 10% earnings as your partners grow their business</p>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-6">
                                <h4 className="text-xl font-bold text-gray-900 mb-4">What You'll Receive:</h4>
                                <ul className="space-y-3">
                                    <li className="flex items-start">
                                        <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-gray-700"><strong>Full Training</strong> - Comprehensive onboarding and ongoing support from the Indastreet team</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-gray-700"><strong>Official Uniform</strong> - Professional branded attire to represent Indastreet</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-gray-700"><strong>Official ID Card</strong> - Verified identification as an authorized Indastreet partner</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-gray-700"><strong>Flexible Schedule</strong> - Work your own hours at your own pace</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-gray-700"><strong>Exclusive Territory</strong> - Agent positions are limited by city and area to ensure your success</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-center text-white">
                                <h4 className="text-2xl font-bold mb-3">Ready to Start Your Journey?</h4>
                                <p className="text-lg mb-4">Contact us today to learn more about becoming the next successful Indastreet partner agent</p>
                                <button className="bg-white text-orange-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg">
                                    Contact Us Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Why Choose Indastreet Section */}
                <div className="max-w-4xl mx-auto mb-12">
                    <h3 className="text-3xl font-bold text-center text-gray-900 mb-8">Why Become an Indastreet Agent?</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-2">High Earnings</h4>
                            <p className="text-gray-600">Lucrative commission structure with unlimited earning potential</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-2">Flexibility</h4>
                            <p className="text-gray-600">Be your own boss and set your own schedule</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-2">Growth</h4>
                            <p className="text-gray-600">Build a sustainable business with recurring income</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JoinIndastreetPage;
