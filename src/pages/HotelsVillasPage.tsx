import React, { useState } from 'react';
import { ArrowLeft, Shield, CheckCircle, Users, Award, Phone, Mail, MessageCircle } from 'lucide-react';
import UniversalHeader from '../components/shared/UniversalHeader';
import { useTranslations } from '../lib/useTranslations';
import { useLanguage } from '../hooks/useLanguage';
import { AppDrawer } from '../components/AppDrawerClean';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';

interface HotelsVillasPageProps {
    onNavigate: (page: string) => void;
    onBack?: () => void;
    // Navigation props for drawer
    onMassageJobsClick?: () => void;
    onVillaPortalClick?: () => void;
    onTherapistPortalClick?: () => void;
    onMassagePlacePortalClick?: () => void;
    onAgentPortalClick?: () => void;
    onCustomerPortalClick?: () => void;
    onAdminPortalClick?: () => void;
    onTermsClick?: () => void;
    onPrivacyClick?: () => void;
    therapists?: any[];
    places?: any[];
}

const HotelsVillasPage: React.FC<HotelsVillasPageProps> = ({ 
    onNavigate, 
    onMassageJobsClick,
    onVillaPortalClick,
    onTherapistPortalClick,
    onMassagePlacePortalClick,
    onAgentPortalClick,
    onCustomerPortalClick,
    onAdminPortalClick,
    onTermsClick,
    onPrivacyClick,
    therapists = [],
    places = []
}) => {
    const { language } = useLanguage();
    const { t } = useTranslations(language);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Universal Header */}
            <UniversalHeader
                onHomeClick={() => onNavigate('home')}
                title="Hotels & Villas"
                showBrand={false}
                onMenuClick={() => setIsMenuOpen(true)}
                showMenuButton={true}
            />

            {/* Drawer Menu */}
            <AppDrawer 
                isOpen={isMenuOpen} 
                onClose={() => setIsMenuOpen(false)}
                onNavigate={onNavigate}
                onMassageJobsClick={onMassageJobsClick}
                onVillaPortalClick={onVillaPortalClick}
                onTherapistPortalClick={onTherapistPortalClick}
                onMassagePlacePortalClick={onMassagePlacePortalClick}
                onAgentPortalClick={onAgentPortalClick}
                onCustomerPortalClick={onCustomerPortalClick}
                onAdminPortalClick={onAdminPortalClick}
                onTermsClick={onTermsClick}
                onPrivacyClick={onPrivacyClick}
                therapists={therapists}
                places={places}
            />

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <div className="max-w-4xl mx-auto px-6 py-16 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Certified Massage Therapists for Hotels & Villas
                    </h1>
                    <p className="text-xl md:text-2xl text-orange-100 font-medium">
                        Professional. Verified. Trusted across Indonesia.
                    </p>
                </div>
            </section>

            {/* What IndaStreet Offers Hotels */}
            <section className="py-16 bg-white">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                        What IndaStreet Offers Hotels
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-orange-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">On-demand certified massage therapists</h3>
                            <p className="text-gray-600">Access to verified professionals whenever you need them</p>
                        </div>
                        
                        <div className="text-center">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Shield className="w-8 h-8 text-orange-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No employment contracts</h3>
                            <p className="text-gray-600">Independent professionals without HR complications</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-orange-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No HR or insurance burden</h3>
                            <p className="text-gray-600">Zero administrative overhead for your property</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Award className="w-8 h-8 text-orange-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No recruitment costs</h3>
                            <p className="text-gray-600">Pre-screened professionals ready to serve your guests</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-orange-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Flexible service availability</h3>
                            <p className="text-gray-600">Services available when your guests need them</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Therapist Verification & Safety */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                        Therapist Verification & Safety
                    </h2>
                    <p className="text-lg text-gray-600 text-center mb-12">
                        Every therapist undergoes comprehensive verification before serving your guests
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-xl p-6 shadow-sm border">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Identity Verification</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">Government ID (KTP) verified</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">Date of birth validated</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">Background review completed</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">Activity tracked on platform</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Professional Requirements</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">Hotel & villa reference letters required</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">IndaStreet Hotel/Villa Safe Pass issued</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">Full booking traceability</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">Ongoing performance monitoring</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Hotel/Villa Safe Pass */}
            <section className="py-16 bg-white">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <div className="mb-6">
                            <img 
                                src="https://ik.imagekit.io/7grri5v7d/scaffolding_indastreetsssssss-removebg-preview.png" 
                                alt="Hotel Villa Safe Pass Certification" 
                                className="w-56 h-56 object-contain mx-auto"
                            />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Hotel/Villa Safe Pass
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Our exclusive certification system ensuring only qualified therapists serve your guests
                        </p>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">What is the Safe Pass?</h3>
                                <p className="text-gray-700 mb-4">
                                    A mandatory certification that verifies therapists meet our strict standards 
                                    for professional hotel and villa services.
                                </p>
                                <p className="text-gray-700">
                                    Every certified therapist carries official Safe Pass credentials, 
                                    giving you confidence in their professionalism and reliability.
                                </p>
                            </div>
                            
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Protection Benefits</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <Shield className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700">Protects your guests</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Shield className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700">Protects your staff</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Shield className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700">Protects your property</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Shield className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700">Ensures service quality</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Revenue Benefits */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                        Revenue Benefits for Your Property
                    </h2>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                            <div className="text-4xl mb-3">😊</div>
                            <h3 className="font-semibold text-gray-900 mb-2">Increased Guest Satisfaction</h3>
                            <p className="text-sm text-gray-600">Premium spa services enhance guest experience</p>
                        </div>
                        
                        <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                            <div className="text-4xl mb-3">💰</div>
                            <h3 className="font-semibold text-gray-900 mb-2">Additional Service Revenue</h3>
                            <p className="text-sm text-gray-600">New income stream from spa services</p>
                        </div>
                        
                        <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                            <div className="text-4xl mb-3">📈</div>
                            <h3 className="font-semibold text-gray-900 mb-2">Upsell Opportunities</h3>
                            <p className="text-sm text-gray-600">Cross-sell with room packages and amenities</p>
                        </div>
                        
                        <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                            <div className="text-4xl mb-3">⚡</div>
                            <h3 className="font-semibold text-gray-900 mb-2">No Operational Overhead</h3>
                            <p className="text-sm text-gray-600">Zero additional staff or infrastructure needed</p>
                        </div>
                    </div>

                    <div className="mt-12 bg-white rounded-xl p-8 shadow-sm border">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                            Flexible Partnership Models
                        </h3>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="text-center">
                                <h4 className="font-semibold text-gray-800 mb-2">Referral Model</h4>
                                <p className="text-gray-600 text-sm">
                                    Earn commission on each booking referred to IndaStreet therapists
                                </p>
                            </div>
                            <div className="text-center">
                                <h4 className="font-semibold text-gray-800 mb-2">Direct Billing</h4>
                                <p className="text-gray-600 text-sm">
                                    Add spa services directly to guest bills with transparent pricing
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Comparison Table */}
            <section className="py-16 bg-white">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                        Why Hotels Choose IndaStreet
                    </h2>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full bg-white rounded-xl shadow-sm border overflow-hidden">
                            <thead>
                                <tr className="bg-orange-50">
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Freelancers</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-orange-600">IndaStreet</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Identity Verification</td>
                                    <td className="px-6 py-4 text-center text-red-600">❌</td>
                                    <td className="px-6 py-4 text-center text-green-600">✅</td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Background Checks</td>
                                    <td className="px-6 py-4 text-center text-red-600">❌</td>
                                    <td className="px-6 py-4 text-center text-green-600">✅</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Professional Certification</td>
                                    <td className="px-6 py-4 text-center text-red-600">❌</td>
                                    <td className="px-6 py-4 text-center text-green-600">✅</td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Activity Tracking</td>
                                    <td className="px-6 py-4 text-center text-red-600">❌</td>
                                    <td className="px-6 py-4 text-center text-green-600">✅</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Quality Guarantee</td>
                                    <td className="px-6 py-4 text-center text-red-600">❌</td>
                                    <td className="px-6 py-4 text-center text-green-600">✅</td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">24/7 Support</td>
                                    <td className="px-6 py-4 text-center text-red-600">❌</td>
                                    <td className="px-6 py-4 text-center text-green-600">✅</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-16 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Ready to Partner with IndaStreet?
                    </h2>
                    <p className="text-xl text-orange-100 mb-12 max-w-2xl mx-auto">
                        Join hundreds of hotels and villas across Indonesia providing premium spa services to their guests
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
                        <button 
                            onClick={() => onNavigate('contact')}
                            className="w-full sm:w-auto bg-white text-orange-600 font-bold py-4 px-8 rounded-xl hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                            <Phone className="w-5 h-5" />
                            Partner With IndaStreet
                        </button>
                        
                        <button 
                            onClick={() => onNavigate('contact')}
                            className="w-full sm:w-auto bg-orange-700 text-white font-bold py-4 px-8 rounded-xl hover:bg-orange-800 transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                            <Users className="w-5 h-5" />
                            Request Certified Therapists
                        </button>
                    </div>

                    <div className="mt-8 pt-8 border-t border-orange-400">
                        <p className="text-orange-100 mb-4">Need immediate assistance?</p>
                        <button 
                            onClick={() => onNavigate('contact')}
                            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Contact Hospitality Team
                        </button>
                    </div>
                </div>
            </section>

            {/* Legal & Positioning */}
            <section className="py-12 bg-gray-100">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="bg-white rounded-xl p-8 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                            Legal Framework & Positioning
                        </h3>
                        <div className="text-sm text-gray-600 space-y-2 text-center">
                            <p>
                                <strong>Independent Professional Services:</strong> All therapists are independent professionals providing services through the IndaStreet platform.
                            </p>
                            <p>
                                <strong>Platform Role:</strong> IndaStreet provides verification, platform access, and compliance monitoring services.
                            </p>
                            <p>
                                <strong>Property Authority:</strong> Hotels and villas retain final approval for all on-premise access and service provision.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HotelsVillasPage;