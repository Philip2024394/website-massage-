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
                                <a 
                                    href="https://wa.me/6281392000050?text=Hi,%20I'm%20interested%20in%20becoming%20an%20Indastreet%20partner%20agent"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-white text-orange-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
                                >
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                    </svg>
                                    Contact Us on WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JoinIndastreetPage;
