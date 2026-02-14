// 🎯 Service personnel (therapist/place) gate for Job Positions - List Your Service flow
import React from 'react';
import { User, Building2, LogIn, UserPlus, Home } from 'lucide-react';
import PageNumberBadge from '../../components/PageNumberBadge';

interface ServicePersonnelLoginPageProps {
    onTherapistLogin: () => void;
    onPlaceLogin: () => void;
    onTherapistSignup: () => void;
    onPlaceSignup: () => void;
    onBack: () => void;
}

const ServicePersonnelLoginPage: React.FC<ServicePersonnelLoginPageProps> = ({
    onTherapistLogin,
    onPlaceLogin,
    onTherapistSignup,
    onPlaceSignup,
    onBack,
}) => {
    return (
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden fixed inset-0">
            <PageNumberBadge pageNumber={1} pageName="ServicePersonnelLoginPage" isLocked={false} />

            <header className="bg-white p-4 shadow-md z-[9997] flex-shrink-0">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        <span className="text-black">Inda</span><span className="text-orange-500">Street</span>
                    </h1>
                    <button onClick={onBack} title="Go back" className="hover:text-orange-500 transition-colors">
                        <Home className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <main className="flex-1 flex items-start justify-center px-4 py-6 overflow-auto">
                <div className="max-w-md w-full">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">List Your Availability</h2>
                        <p className="text-gray-600 text-sm mb-1">
                            Individuals looking for work list here — not businesses. Sign in or create an account (you don’t need to be on IndaStreet yet).
                        </p>
                        <p className="text-gray-500 text-xs">
                            Already on the platform? Employers will see your full profile, reviews and details when they view your listing.
                        </p>
                    </div>

                    {/* Massage Therapist – on or off platform */}
                    <div className="mb-6 p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <User className="w-6 h-6 text-blue-500" />
                            <h3 className="font-semibold text-gray-800">Massage Therapist</h3>
                        </div>
                        <p className="text-gray-600 text-xs mb-3">
                            I’m a massage therapist looking for work. On IndaStreet or not — list your availability for employers.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={onTherapistLogin}
                                className="flex-1 py-3 px-4 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium flex items-center justify-center gap-2 transition-colors"
                            >
                                <LogIn className="w-4 h-4" />
                                Sign In
                            </button>
                            <button
                                onClick={onTherapistSignup}
                                className="flex-1 py-3 px-4 rounded-lg border-2 border-blue-500 text-blue-500 hover:bg-blue-50 font-medium flex items-center justify-center gap-2 transition-colors"
                            >
                                <UserPlus className="w-4 h-4" />
                                Create Account
                            </button>
                        </div>
                    </div>

                    {/* Spa or clinic staff – personnel, not the business */}
                    <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <Building2 className="w-6 h-6 text-orange-500" />
                            <h3 className="font-semibold text-gray-800">Spa or Skin Clinic Staff</h3>
                        </div>
                        <p className="text-gray-600 text-xs mb-3">
                            I work at a massage spa or skin clinic and want to advertise myself for work. (The spa or clinic itself doesn’t list here.)
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={onPlaceLogin}
                                className="flex-1 py-3 px-4 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium flex items-center justify-center gap-2 transition-colors"
                            >
                                <LogIn className="w-4 h-4" />
                                Sign In
                            </button>
                            <button
                                onClick={onPlaceSignup}
                                className="flex-1 py-3 px-4 rounded-lg border-2 border-orange-500 text-orange-500 hover:bg-orange-50 font-medium flex items-center justify-center gap-2 transition-colors"
                            >
                                <UserPlus className="w-4 h-4" />
                                Create Account
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ServicePersonnelLoginPage;
