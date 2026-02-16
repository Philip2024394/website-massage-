// 🎯 AUTO-FIXED: Mobile scroll architecture violations (2 fixes)
import React, { useState } from 'react';
import { User, UserCheck, Building2, Sparkles, ArrowLeft, CheckCircle, Globe, Star, Users, TrendingUp, Shield, Award, MapPin, Calendar, Clock } from 'lucide-react';
import UniversalHeader from '../../components/shared/UniversalHeader';
import { AppDrawer } from '../../components/AppDrawerClean';
import { type SupportedLanguage } from '../../context/LanguageContext';

interface RoleSelectionPageProps {
  onNavigate?: (page: string) => void;
  language?: string;
  onLanguageChange?: (lang: SupportedLanguage | string) => void;
  // Navigation props for menu
  onMassageJobsClick?: () => void;
  onHotelPortalClick?: () => void;
  onVillaPortalClick?: () => void;
  onTherapistPortalClick?: () => void;
  onMassagePlacePortalClick?: () => void;
  onFacialPortalClick?: () => void;
  onAgentPortalClick?: () => void;
  onCustomerPortalClick?: () => void;
  onAdminPortalClick?: () => void;
  onTermsClick?: () => void;
  onPrivacyClick?: () => void;
  onLoginClick?: () => void;
}

const RoleSelectionPage: React.FC<RoleSelectionPageProps> = ({ 
  onNavigate, 
  language = 'en', 
  onLanguageChange,
  // Navigation props
  onMassageJobsClick,
  onHotelPortalClick,
  onVillaPortalClick,
  onTherapistPortalClick,
  onMassagePlacePortalClick,
  onFacialPortalClick,
  onAgentPortalClick,
  onCustomerPortalClick,
  onAdminPortalClick,
  onTermsClick,
  onPrivacyClick,
  onLoginClick
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleRoleSelect = (role: string) => {
    if (onNavigate) {
      // Navigate to signup with role parameter
      const url = new URL(window.location.href);
      url.searchParams.set('role', role);
      window.history.pushState({}, '', url.toString());
      onNavigate('signup');
    } else {
      // Fallback - direct redirect
      window.location.href = `/signup?role=${role}`;
    }
  };

  const handleBack = () => {
    if (onNavigate) {
      onNavigate('home');
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50">
      {/* Universal Header – same design and layout as home page, with home icon */}
      <UniversalHeader
        language={language}
        onLanguageChange={onLanguageChange as (lang: string) => void}
        onMenuClick={() => setIsMenuOpen(true)}
        onHomeClick={() => onNavigate?.('home')}
        showHomeButton
      />

      {/* App Drawer – same as home page */}
      {isMenuOpen && (
        <AppDrawer
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          t={{}} // Empty translations object for now
          language={language}
          onNavigate={onNavigate}
          onMassageJobsClick={onMassageJobsClick}
          onHotelPortalClick={onHotelPortalClick}
          onVillaPortalClick={onVillaPortalClick}
          onTherapistPortalClick={onTherapistPortalClick}
          onMassagePlacePortalClick={onMassagePlacePortalClick}
          onFacialPortalClick={onFacialPortalClick}
          onAgentPortalClick={onAgentPortalClick}
          onCustomerPortalClick={onCustomerPortalClick}
          onAdminPortalClick={onAdminPortalClick}
          onTermsClick={onTermsClick}
          onPrivacyClick={onPrivacyClick}
          onQRCodeClick={() => onNavigate && onNavigate('qr-code')}
          onLoginClick={onLoginClick}
        />
      )}

      {/* Spacer so content starts below fixed header – matches home page layout */}
      <div className="pt-[60px] sm:pt-16" aria-hidden />

      {/* Main Content */}
      <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gradient-to-br from-gray-50 via-orange-50/30 to-yellow-50/20">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 via-transparent to-yellow-500/10"></div>
          <div className="relative max-w-7xl mx-auto px-6 py-16 sm:py-24">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8">
                <span className="text-gray-900">Why Join </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500">IndaStreet</span>
                <span className="text-gray-900"> over IndaStreet Massage</span>
              </h1>
              
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 blur-3xl transform rotate-1"></div>
                <div className="relative bg-white/40 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl">
                  <p className="text-xl sm:text-2xl text-gray-700 leading-relaxed">
                    IndaStreet is <span className="font-semibold text-gray-900">not just another listing platform.</span>
                    <br />
                    It is a <span className="font-semibold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">verified, professional ecosystem</span> built to help qualified massage therapists and wellness providers grow <span className="font-semibold text-gray-900">consistently and globally.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Directory Badge */}
        <div className="relative max-w-7xl mx-auto px-6 -mt-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-gray-900 to-black text-white px-8 py-4 rounded-full shadow-2xl border border-gray-800">
              <Globe className="w-6 h-6 text-orange-500" />
              <span className="text-lg font-semibold">World's Largest Premium Directory</span>
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
              </div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">
              For Massage Therapists • Massage Spas • Skin Clinics • Verified Hotels & Villas
            </p>
          </div>
        </div>

        {/* Main Benefits Grid */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            
            {/* Built for Qualified Professionals */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-yellow-500/10 rounded-3xl transform rotate-1 group-hover:rotate-2 transition-transform"></div>
              <div className="relative bg-white/60 backdrop-blur-sm border border-white/40 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Built for Qualified Professionals Only</h2>
                </div>
                
                <p className="text-gray-700 mb-6 leading-relaxed">
                  IndaStreet is designed for <span className="font-semibold text-gray-900">trained, verified massage therapists, spas, and skin clinics.</span>
                  <br />Every provider goes through a qualification and profile process, helping maintain trust, safety, and professional standards across the platform.
                </p>
                
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 mb-3">This protects:</h3>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Therapists</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Clients</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">The reputation of the industry as a whole</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Access to High-Quality Clients */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-3xl transform -rotate-1 group-hover:-rotate-2 transition-transform"></div>
              <div className="relative bg-white/60 backdrop-blur-sm border border-white/40 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Access to High-Quality Clients</h2>
                </div>
                
                <p className="text-gray-700 mb-6">
                  IndaStreet connects you with clients actively searching for:
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3 bg-white/50 rounded-xl p-4">
                    <MapPin className="w-5 h-5 text-orange-500" />
                    <span className="font-medium text-gray-700">Home massage</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/50 rounded-xl p-4">
                    <Building2 className="w-5 h-5 text-yellow-500" />
                    <span className="font-medium text-gray-700">Hotel & villa massage</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/50 rounded-xl p-4">
                    <Sparkles className="w-5 h-5 text-orange-500" />
                    <span className="font-medium text-gray-700">Spa treatments</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/50 rounded-xl p-4">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="font-medium text-gray-700">Skin & wellness services</span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-gray-900/10 to-black/10 rounded-xl p-4 border border-gray-200">
                  <p className="text-gray-800 font-medium">
                    Clients come to IndaStreet expecting <span className="text-orange-600">professional, verified providers</span>, not random listings.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Work Where You Want */}
          <div className="relative mb-16">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/5 to-black/5 rounded-3xl"></div>
            <div className="relative bg-white/60 backdrop-blur-sm border border-white/40 rounded-3xl p-8 shadow-xl">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-900 to-black rounded-2xl flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-orange-500" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Work Where You Want</h2>
                </div>
                <p className="text-xl text-gray-700">You stay in control:</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Flexible Schedule</h3>
                  <p className="text-gray-600">Accept bookings that fit your schedule</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Choose Areas</h3>
                  <p className="text-gray-600">Choose service areas (home, hotel, villa, spa)</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-black rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Set Your Prices</h3>
                  <p className="text-gray-600">Set your own prices and availability</p>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-gray-700 font-medium">
                  IndaStreet supports <span className="text-orange-600">flexible work</span> without locking you into fixed shifts or locations.
                </p>
              </div>
            </div>
          </div>

          {/* Trusted Brand, Global Vision */}
          <div className="relative mb-16">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-yellow-500/10 to-gray-900/10 rounded-3xl transform rotate-1"></div>
            <div className="relative bg-white/60 backdrop-blur-sm border border-white/40 rounded-3xl p-8 shadow-xl">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 via-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center">
                    <Globe className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Trusted Brand, Global Vision</h2>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <p className="text-lg text-gray-700 mb-6">
                    IndaStreet is being built as <span className="font-bold text-gray-900">one of the world's largest qualified massage and wellness directories.</span>
                  </p>
                  
                  <p className="text-gray-700 mb-6">
                    By joining early, you become part of a platform focused on:
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">Long-term growth</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">Professional credibility</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">International expansion</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 text-white">
                  <h3 className="text-xl font-bold mb-4 text-orange-500">Your Profile Grows</h3>
                  <p className="text-gray-300">
                    Your professional profile grows with the platform, gaining more visibility and credibility as IndaStreet expands globally.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Safety, Structure, and Support */}
          <div className="relative mb-16">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-gray-900/10 rounded-3xl transform -rotate-1"></div>
            <div className="relative bg-white/60 backdrop-blur-sm border border-white/40 rounded-3xl p-8 shadow-xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-gray-900 rounded-2xl flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Safety, Structure, and Support</h2>
                  <p className="text-gray-600">IndaStreet is structured to protect professionals</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-4 bg-white/50 rounded-xl p-4">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Clear booking flow</h4>
                      <p className="text-gray-600 text-sm">Streamlined process for both providers and clients</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 bg-white/50 rounded-xl p-4">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Transparent service listings</h4>
                      <p className="text-gray-600 text-sm">Clear pricing and service descriptions</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4 bg-white/50 rounded-xl p-4">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Platform safety rules</h4>
                      <p className="text-gray-600 text-sm">Designed for therapist safety and clarity</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 bg-white/50 rounded-xl p-4">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Ongoing improvements</h4>
                      <p className="text-gray-600 text-sm">Based on real therapist feedback</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-xl p-6 text-center">
                <p className="text-lg font-medium text-gray-800">
                  This is a system built <span className="text-orange-600 font-bold">with therapists</span>, not against them.
                </p>
              </div>
            </div>
          </div>

          {/* No Agency Control */}
          <div className="relative mb-16">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/10 to-orange-500/10 rounded-3xl"></div>
            <div className="relative bg-white/60 backdrop-blur-sm border border-white/40 rounded-3xl p-8 shadow-xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">No Agency Control. No Middlemen.</h2>
                <div className="flex justify-center gap-8 text-lg">
                  <span className="line-through text-red-500">You are not working for an agency.</span>
                </div>
                <div className="flex justify-center gap-8 text-lg mt-2">
                  <span className="line-through text-red-500">You are not hidden behind someone else's brand.</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-gray-900 to-black rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold text-orange-500 mb-6 text-center">IndaStreet gives you:</h3>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-semibold mb-2">Your Own Professional Profile</h4>
                    <p className="text-gray-300 text-sm">Build your personal brand and reputation</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-semibold mb-2">Direct Access to Clients</h4>
                    <p className="text-gray-300 text-sm">Connect directly without intermediaries</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl mx-auto mb-4 flex items-center justify-center">
                      <TrendingUp className="w-8 h-8 text-orange-500" />
                    </div>
                    <h4 className="font-semibold mb-2">Platform That Supports Independence</h4>
                    <p className="text-gray-300 text-sm">Not control, but empowerment</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-yellow-500/20 to-gray-900/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-3xl p-12 text-white text-center shadow-2xl">
              <h2 className="text-4xl font-bold mb-6">
                <span className="text-white">Join the Future of Professional </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500">Massage & Wellness</span>
              </h2>
              
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                If you are <span className="text-orange-500 font-semibold">qualified, professional, and serious</span> about your work,
                <br />IndaStreet is built for you.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto mb-8">
                <div className="flex items-center gap-3 text-gray-300">
                  <span className="text-2xl">👉</span>
                  <span>Create your profile</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <span className="text-2xl">👉</span>
                  <span>Get verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Role Selection Section */}
        <div className="max-w-md mx-auto px-6 pb-16">
          <div className="bg-white/80 backdrop-blur-sm border border-white/40 rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Choose Your Account Type</h2>
              <p className="text-gray-600">Select the option that best describes your professional practice</p>
            </div>

            {/* Role Selection Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleBack}
                className="absolute top-4 left-4 p-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              {/* Customer Option */}
              <button
                onClick={() => handleRoleSelect('customer')}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-4 px-6 rounded-2xl hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 font-semibold"
              >
                <User className="w-6 h-6" />
                I'm looking for massage services
              </button>

              {/* Therapist Option */}
              <button
                onClick={() => handleRoleSelect('therapist')}
                className="w-full bg-gradient-to-r from-gray-900 to-black text-white py-4 px-6 rounded-2xl hover:from-gray-800 hover:to-gray-900 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 font-semibold"
              >
                <UserCheck className="w-6 h-6" />
                <span>I'm a massage therapist</span>
                <div className="ml-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                  VERIFIED
                </div>
              </button>

              {/* Massage Place Option */}
              <button
                onClick={() => handleRoleSelect('massage_place')}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 px-6 rounded-2xl hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 font-semibold"
              >
                <Building2 className="w-6 h-6" />
                <span>I own a massage spa</span>
                <div className="ml-2 bg-gray-900 text-white text-xs px-2 py-1 rounded-full">
                  BUSINESS
                </div>
              </button>

              {/* Facial Place Option */}
              <button
                onClick={() => handleRoleSelect('facial_place')}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-800 text-white py-4 px-6 rounded-2xl hover:from-gray-700 hover:to-gray-900 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 font-semibold"
              >
                <Sparkles className="w-6 h-6" />
                <span>I provide facial treatments</span>
                <div className="ml-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full">
                  WELLNESS
                </div>
              </button>
            </div>
        
        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate ? onNavigate('login') : (window.location.href = '/login')}
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
      </div>
    </div>
    </div>
  );
};

export default RoleSelectionPage;