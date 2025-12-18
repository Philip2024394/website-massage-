import React from 'react';
import Button from '../components/Button';

interface RegistrationChoicePageProps {
    onSelect: (type: 'therapist' | 'place' | 'facial') => void;
    onBack: () => void;
    t: any;
}

const RegistrationChoicePage: React.FC<RegistrationChoicePageProps> = ({ onSelect, onBack }) => {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold">
                                <span className="text-black">Inda</span>
                                <span className="text-orange-500">Street</span>
                            </h1>
                        </div>
                        <button
                            onClick={onBack}
                            className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-light text-black mb-3">Choose Registration Type</h1>
                    <p className="text-gray-500 text-lg">Select how you want to register</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-orange-500 hover:shadow-md transition-all">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Massage Therapist</h3>
                        <p className="text-gray-600 text-sm mb-4">Provide massage services</p>
                        <Button 
                            onClick={() => onSelect('therapist')}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                        >
                            Register as Express Therapist
                        </Button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-orange-500 hover:shadow-md transition-all">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Massage Place</h3>
                        <p className="text-gray-600 text-sm mb-4">Register your spa or wellness center</p>
                        <Button 
                            onClick={() => onSelect('place')}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                        >
                            Register as Massage Place
                        </Button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-orange-500 hover:shadow-md transition-all">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Facial Clinic</h3>
                        <p className="text-gray-600 text-sm mb-4">Register your beauty and facial clinic</p>
                        <Button 
                            onClick={() => onSelect('facial')}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                        >
                            Register as Facial Clinic
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistrationChoicePage;