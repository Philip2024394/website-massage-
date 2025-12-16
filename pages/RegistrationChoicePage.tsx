import React from 'react';
import Button from '../components/Button';

interface RegistrationChoicePageProps {
    onSelect: (type: 'customer' | 'therapist' | 'place') => void;
    onBack: () => void;
    t: any;
}

const RegistrationChoicePage: React.FC<RegistrationChoicePageProps> = ({ onSelect, onBack, t }) => {
    return (
        <div className="min-h-screen bg-gray-50 p-4 pb-20 flex flex-col justify-center">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Choose Registration Type</h1>
                <p className="text-gray-600 mt-2 max-w-md mx-auto">Select how you want to register</p>
            </div>

            <div className="space-y-4 max-w-md mx-auto w-full">
                <div className="bg-white rounded-xl shadow-md p-6 border-2 border-transparent hover:border-orange-500 transition-all">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Customer</h3>
                    <p className="text-gray-600 text-sm mb-4">Book massage services</p>
                    <Button 
                        onClick={() => onSelect('customer')}
                        className="w-full"
                    >
                        Register as Customer
                    </Button>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border-2 border-transparent hover:border-orange-500 transition-all">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Therapist</h3>
                    <p className="text-gray-600 text-sm mb-4">Provide massage services</p>
                    <Button 
                        onClick={() => onSelect('therapist')}
                        className="w-full"
                    >
                        Register as Therapist
                    </Button>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border-2 border-transparent hover:border-orange-500 transition-all">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Massage Place</h3>
                    <p className="text-gray-600 text-sm mb-4">Register your massage business</p>
                    <Button 
                        onClick={() => onSelect('place')}
                        className="w-full"
                    >
                        Register as Place
                    </Button>
                </div>
            </div>

            <div className="mt-8 text-center">
                <button onClick={onBack} className="text-sm font-medium text-gray-500 hover:text-gray-800">
                    Back to Home
                </button>
            </div>
        </div>
    );
};

export default RegistrationChoicePage;
