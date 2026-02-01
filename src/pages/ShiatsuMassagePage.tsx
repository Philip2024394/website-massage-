// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
import React from 'react';

interface ShiatsuMassagePageProps {
    onBack: () => void;
    onNavigate: (page: string) => void;
    t: any;
}

const ShiatsuMassagePage: React.FC<ShiatsuMassagePageProps> = ({ onBack, onNavigate, t: _t }) => {
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
                    <h1 className="text-3xl font-bold text-gray-900">Shiatsu Massage</h1>
                </div>

                {/* Content */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4">What is Shiatsu Massage?</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Shiatsu is a Japanese bodywork therapy that involves applying pressure to specific points 
                                on the body using fingers, thumbs, palms, and sometimes elbows. This traditional healing 
                                art is based on the principles of Traditional Chinese Medicine and aims to balance the 
                                body's energy flow.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Benefits</h3>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li>Balances energy flow (qi) in the body</li>
                                <li>Reduces stress and promotes relaxation</li>
                                <li>Improves circulation and flexibility</li>
                                <li>Relieves muscle tension and pain</li>
                                <li>Enhances mental clarity and focus</li>
                                <li>Supports the body's natural healing processes</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Techniques Used</h3>
                            <div className="text-gray-600">
                                <p>Shiatsu practitioners use various techniques including:</p>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Finger and palm pressure on acupoints</li>
                                    <li>Gentle stretching and joint manipulation</li>
                                    <li>Rhythmic pressure along meridian lines</li>
                                    <li>Rocking and holding techniques</li>
                                </ul>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">What to Expect</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Shiatsu is typically performed on a futon mat on the floor with you fully clothed in 
                                comfortable, loose-fitting clothing. The practitioner uses their body weight to apply 
                                pressure and may incorporate stretching movements. Sessions usually last 60-90 minutes.
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
                        Book Shiatsu Massage
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

export default ShiatsuMassagePage;

