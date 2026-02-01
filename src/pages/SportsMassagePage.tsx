// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
import React from 'react';

interface SportsMassagePageProps {
    onBack: () => void;
    onNavigate: (page: string) => void;
    t: any;
}

const SportsMassagePage: React.FC<SportsMassagePageProps> = ({ onBack, onNavigate, t: _t }) => {
    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50 p-4 pb-20">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 pb-20 mb-6">
                    <button 
                        onClick={onBack}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        aria-label="Go back"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Sports Massage</h1>
                </div>

                {/* Content */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4">What is Sports Massage?</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Sports massage is a specialized form of massage therapy designed to help athletes prepare 
                                for and recover from training and competition. It combines techniques from Swedish massage, 
                                deep tissue massage, and stretching to enhance athletic performance and prevent injuries.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Benefits</h3>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li>Improved athletic performance</li>
                                <li>Faster recovery from training and competition</li>
                                <li>Injury prevention and rehabilitation</li>
                                <li>Reduced muscle tension and soreness</li>
                                <li>Enhanced flexibility and range of motion</li>
                                <li>Better circulation and reduced inflammation</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Types of Sports Massage</h3>
                            <div className="grid md:grid-cols-2 gap-4 pb-20 text-gray-600">
                                <div>
                                    <strong>Pre-Event:</strong> Light, stimulating massage before competition
                                </div>
                                <div>
                                    <strong>Post-Event:</strong> Gentle massage to aid recovery
                                </div>
                                <div>
                                    <strong>Maintenance:</strong> Regular sessions during training
                                </div>
                                <div>
                                    <strong>Rehabilitative:</strong> Focused on injury recovery
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Who Can Benefit</h3>
                            <p className="text-gray-600 leading-relaxed">
                                While designed for athletes, sports massage benefits anyone engaged in regular physical 
                                activity, including weekend warriors, fitness enthusiasts, and people with physically 
                                demanding jobs. It's also helpful for those recovering from injuries or dealing with 
                                chronic pain conditions.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-4 pb-20">
                    <button 
                        onClick={() => onNavigate('home')}
                        className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        Book Sports Massage
                    </button>
                    <button 
                        onClick={() => onNavigate('massageTypes')}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        View All Massage Types
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SportsMassagePage;

