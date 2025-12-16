import React from 'react';
import { Building2, Users, Briefcase, Home } from 'lucide-react';
import Button from '../components/Button';

interface JoinIndastreetPartnersPageProps {
    onNavigate: (page: any) => void;
    onMassageJobsClick?: () => void;
    onHotelPortalClick?: () => void;
    onVillaPortalClick?: () => void;
    onTherapistPortalClick?: () => void;
    onMassagePlacePortalClick?: () => void;
    onCustomerPortalClick?: () => void;
    onAdminPortalClick?: () => void;
    onTermsClick?: () => void;
    onPrivacyClick?: () => void;
    therapists?: any[];
    places?: any[];
    t?: any;
}

const JoinIndastreetPartnersPage: React.FC<JoinIndastreetPartnersPageProps> = ({
    onNavigate,
    onMassageJobsClick,
    onTherapistPortalClick,
    onMassagePlacePortalClick,
}) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Join IndaStreet Partners
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Grow your business with Indonesia's leading massage and wellness platform
                    </p>
                </div>

                {/* Partner Types */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {/* Massage Therapist */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow border-2 border-transparent hover:border-orange-500">
                        <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                            <Users className="w-8 h-8 text-orange-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Massage Therapist</h3>
                        <p className="text-gray-600 mb-6">
                            Join as an independent therapist and get bookings from customers across Bali
                        </p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-start text-sm text-gray-700">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>Flexible working hours</span>
                            </li>
                            <li className="flex items-start text-sm text-gray-700">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>Direct customer bookings</span>
                            </li>
                            <li className="flex items-start text-sm text-gray-700">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>Professional profile page</span>
                            </li>
                            <li className="flex items-start text-sm text-gray-700">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>Booking management tools</span>
                            </li>
                        </ul>
                        <Button
                            onClick={onTherapistPortalClick}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                        >
                            Join as Therapist
                        </Button>
                    </div>

                    {/* Massage Place/Spa */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow border-2 border-transparent hover:border-orange-500">
                        <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                            <Building2 className="w-8 h-8 text-orange-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Massage Place / Spa</h3>
                        <p className="text-gray-600 mb-6">
                            Register your spa or massage business and reach thousands of customers
                        </p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-start text-sm text-gray-700">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>Business profile listing</span>
                            </li>
                            <li className="flex items-start text-sm text-gray-700">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>Online booking system</span>
                            </li>
                            <li className="flex items-start text-sm text-gray-700">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>Customer reviews & ratings</span>
                            </li>
                            <li className="flex items-start text-sm text-gray-700">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>Analytics dashboard</span>
                            </li>
                        </ul>
                        <Button
                            onClick={onMassagePlacePortalClick}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                        >
                            Join as Business
                        </Button>
                    </div>

                    {/* Employer/Hotel */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow border-2 border-transparent hover:border-orange-500">
                        <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                            <Briefcase className="w-8 h-8 text-orange-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Employer / Hotel</h3>
                        <p className="text-gray-600 mb-6">
                            Post job openings and hire qualified massage therapists for your business
                        </p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-start text-sm text-gray-700">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>Post unlimited job listings</span>
                            </li>
                            <li className="flex items-start text-sm text-gray-700">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>Access qualified candidates</span>
                            </li>
                            <li className="flex items-start text-sm text-gray-700">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>Application management</span>
                            </li>
                            <li className="flex items-start text-sm text-gray-700">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>Direct communication</span>
                            </li>
                        </ul>
                        <Button
                            onClick={onMassageJobsClick}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                        >
                            Post a Job
                        </Button>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="text-center">
                    <button
                        onClick={() => onNavigate('home')}
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 font-medium"
                    >
                        <Home className="w-5 h-5 mr-2" />
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JoinIndastreetPartnersPage;
