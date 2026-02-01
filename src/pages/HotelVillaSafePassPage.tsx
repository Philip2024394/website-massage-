// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
import React from 'react';
import { Shield, CheckCircle2, Building, Star, Award, Users, Clock, FileText } from 'lucide-react';

interface HotelVillaSafePassPageProps {
  onNavigate: (page: string) => void;
  onTherapistPortalClick?: () => void;
  language?: 'en' | 'id';
}

const HotelVillaSafePassPage: React.FC<HotelVillaSafePassPageProps> = ({ 
  onNavigate,
  onTherapistPortalClick,
  language = 'en'
}) => {
  const handleApplyNow = () => {
    if (onTherapistPortalClick) {
      onTherapistPortalClick();
    } else {
      onNavigate('therapistPortal');
    }
  };

  return (
    <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-white">
      {/* Hero Section */}
      <section className="bg-white border-b border-orange-100 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Hotel & Villa Safe Pass Certification
            </h1>
            <p className="text-xl text-orange-600 font-medium mb-8">
              Official Certification for Professional Massage Therapists
            </p>
          </div>
          
          {/* Safe Pass Image */}
          <div className="flex justify-center mb-8">
            <img 
              src="https://ik.imagekit.io/7grri5v7d/PLASTERING%205%20TROWEL%20HOLDERz.png" 
              alt="Hotel Villa Safe Pass Certification" 
              className="w-full max-w-4xl h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-lg text-gray-600 mb-6">
              The Safe Pass is your professional credential for working in premium hospitality environments. 
              Get officially certified to provide spa and massage services at hotels and villas across Indonesia.
            </p>
            <div className="flex items-center justify-center gap-6 text-gray-700 flex-wrap">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-500" />
                <span>Official Certification</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-orange-500" />
                <span>Admin Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-orange-500" />
                <span>Hotel Authorized</span>
              </div>
            </div>
            
            <button
              onClick={handleApplyNow}
              className="mt-8 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg transition-all transform hover:scale-105"
            >
              Apply for Safe Pass Now
            </button>
          </div>
        </div>
      </section>

      {/* Why Hotels Choose IndaStreet Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            Why Hotels Choose <span className="text-orange-500">Inda</span><span className="text-gray-900">Street</span> Massage
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-orange-500" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-3">Verified Professionals</h3>
              <p className="text-gray-600">
                All therapists undergo strict Safe Pass certification and background checks for your peace of mind.
              </p>
            </div>
            <div className="text-center p-8 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-10 h-10 text-orange-500" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-3">Quality Guaranteed</h3>
              <p className="text-gray-600">
                Premium spa services meeting international hospitality standards for exceptional guest experiences.
              </p>
            </div>
            <div className="text-center p-8 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building className="w-10 h-10 text-orange-500" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-3">Hotel Ready</h3>
              <p className="text-gray-600">
                Certified for professional conduct in luxury hotel and villa environments across Indonesia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements & Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Requirements */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Requirements</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">3 Recommendation Letters</p>
                    <p className="text-sm text-gray-600">From different hotels or villas where you've worked</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Admin Review & Approval</p>
                    <p className="text-sm text-gray-600">All letters reviewed and verified by our team</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Complete Profile Verification</p>
                    <p className="text-sm text-gray-600">KTP ID, bank details, and professional information</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Annual Certification Fee</p>
                    <p className="text-sm text-gray-600">IDR 800,000 per year, renewed annually on 12th calendar date</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Benefits */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Benefits</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Building className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Legal Hotel & Villa Authorization</p>
                    <p className="text-sm text-gray-600">Official permission to work in premium hospitality venues</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Shield className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Official Safe Pass Card</p>
                    <p className="text-sm text-gray-600">Professional ID card with your certified details</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Star className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Enhanced Credibility</p>
                    <p className="text-sm text-gray-600">Stand out with official certification from IndaStreet</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Users className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Premium Bookings Access</p>
                    <p className="text-sm text-gray-600">Priority access to high-value hotel & villa bookings</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            Application Process
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Upload Letters</h4>
              <p className="text-sm text-gray-600">
                Submit 3 hotel/villa recommendation letters
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Admin Review</h4>
              <p className="text-sm text-gray-600">
                Our team verifies your documents
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Payment</h4>
              <p className="text-sm text-gray-600">
                Pay IDR 800,000 annual fee after approval
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                4
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Get Certified</h4>
              <p className="text-sm text-gray-600">
                Receive your Safe Pass card
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-lg shadow-md">
              <Clock className="w-5 h-5 text-orange-500" />
              <span className="text-gray-700">
                <span className="font-bold">Processing Time:</span> 3-5 business days after approval
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Safe Pass Card Preview */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            Your Professional Safe Pass Card
          </h2>
          
          {/* Card Design Preview */}
          <div className="max-w-md mx-auto">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8" />
                  <span className="font-bold text-xl">SAFE PASS</span>
                </div>
                <div className="text-right text-sm opacity-90">
                  <div>Hotel & Villa</div>
                  <div>Indonesia</div>
                </div>
              </div>
              
              <div className="space-y-3 text-base">
                <div className="flex justify-between">
                  <span className="opacity-90">Name:</span>
                  <span className="font-semibold">Your Full Name</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-90">ID:</span>
                  <span className="font-semibold">SP-XXXXXXXX</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-90">Location:</span>
                  <span className="font-semibold">Your City</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-90">Valid Until:</span>
                  <span className="font-semibold">1 Year</span>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/20 flex items-center justify-between">
                <div className="text-sm opacity-75">
                  Issued: Upon Payment
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-center text-gray-600 mt-8 max-w-2xl mx-auto">
            Your Safe Pass card will display your professional credentials and authorized status to work in hotels and villas. 
            The card is valid for 1 year from the date of issuance and must be renewed annually on the 12th calendar date.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Certified?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Join hundreds of certified therapists working in premium hotels and villas across Indonesia
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleApplyNow}
              className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-lg shadow-lg transition-all transform hover:scale-105"
            >
              Apply for Safe Pass
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="bg-orange-700 hover:bg-orange-800 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg transition-all border-2 border-white/20"
            >
              Contact Us
            </button>
          </div>
          
          <div className="mt-12 grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-orange-100">Certified Therapists</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">200+</div>
              <div className="text-orange-100">Partner Hotels & Villas</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-orange-100">Approval Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-gray-900 mb-3 text-lg">How long does the certification process take?</h3>
              <p className="text-gray-600">
                After submitting your application with 3 recommendation letters, our admin team reviews it within 3-5 business days. 
                Once approved and payment is completed, your Safe Pass card is issued immediately.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-gray-900 mb-3 text-lg">What if I don't have 3 recommendation letters?</h3>
              <p className="text-gray-600">
                The 3 recommendation letters from different hotels or villas are mandatory for certification. 
                If you need help obtaining these, contact our support team for guidance on approaching hotels where you've worked.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-gray-900 mb-3 text-lg">Is the Safe Pass valid across all of Indonesia?</h3>
              <p className="text-gray-600">
                Yes! Once certified, your Safe Pass is valid for hotel and villa services throughout Indonesia for 1 year from the date of issuance. 
                The certification must be renewed annually on the 12th calendar date for IDR 800,000.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-gray-900 mb-3 text-lg">What happens if my application is rejected?</h3>
              <p className="text-gray-600">
                If your application is rejected, we provide detailed feedback on why and what needs to be improved. 
                You can resubmit your application once you've addressed the issues. There's no additional fee for resubmission.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HotelVillaSafePassPage;
