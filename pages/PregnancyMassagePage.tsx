import React from 'react';

interface PregnancyMassagePageProps {
    onBack: () => void;
    onNavigate: (page: string) => void;
    t: any;
}

const PregnancyMassagePage: React.FC<PregnancyMassagePageProps> = ({ onBack, onNavigate, t: _t }) => {
    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button 
                        onClick={onBack}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        aria-label="Go back"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Pregnancy Massage</h1>
                </div>

                {/* Content */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4">What is Pregnancy Massage?</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Pregnancy massage, also known as prenatal massage, is a specialized form of therapeutic 
                                massage designed specifically for expecting mothers. It provides relief from the physical 
                                and emotional stresses of pregnancy while ensuring the safety of both mother and baby.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Benefits During Pregnancy</h3>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li>Reduces back pain and sciatica</li>
                                <li>Relieves swelling in hands, feet, and ankles</li>
                                <li>Improves sleep quality and reduces insomnia</li>
                                <li>Decreases stress hormones and promotes relaxation</li>
                                <li>Helps with muscle tension and joint pain</li>
                                <li>Supports emotional well-being</li>
                                <li>May help reduce morning sickness symptoms</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Safe Positioning Techniques</h3>
                            <div className="space-y-3 text-gray-600">
                                <div>
                                    <strong>Side-lying Position:</strong> Safest position for all trimesters using supportive pillows
                                </div>
                                <div>
                                    <strong>Semi-reclined Position:</strong> Comfortable alternative for later pregnancy
                                </div>
                                <div>
                                    <strong>Seated Position:</strong> Ideal for neck, shoulder, and back massage
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Safety Considerations</h3>
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                                <ul className="list-disc list-inside text-gray-700 space-y-2">
                                    <li>Generally safe after first trimester (12+ weeks)</li>
                                    <li>Performed by certified prenatal massage therapists</li>
                                    <li>Avoidance of certain pressure points and areas</li>
                                    <li>Doctor approval recommended for high-risk pregnancies</li>
                                    <li>Modified techniques and gentle pressure used</li>
                                </ul>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">What to Expect</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Your session will begin with a consultation about your pregnancy and any specific 
                                concerns. You'll be positioned comfortably with supportive pillows, and the therapist 
                                will use gentle, flowing strokes adapted for pregnancy. Sessions typically last 60-90 
                                minutes and focus on areas of common pregnancy discomfort.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-4">
                    <button 
                        onClick={() => onNavigate('home')}
                        className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                    >
                        Book Pregnancy Massage
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

export default PregnancyMassagePage;
