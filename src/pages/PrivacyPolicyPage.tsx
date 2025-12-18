import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold">
                <span className="text-black">Inda</span>
                <span className="text-orange-500">Street</span>
              </h1>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-black hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              Home
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-light text-black mb-3">Privacy Policy</h2>
          <p className="text-gray-500 text-lg">How we protect and use your information</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h3 className="text-xl font-semibold text-black mb-4">Information We Collect</h3>
              <p className="text-gray-600 mb-4">
                We collect information you provide directly to us when you create an account, 
                book services, or communicate with us. This includes:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Personal information (name, email, phone number)</li>
                <li>Profile information and preferences</li>
                <li>Payment and billing information</li>
                <li>Communication history and feedback</li>
                <li>Location data when using our services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-black mb-4">How We Use Your Information</h3>
              <p className="text-gray-600 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send you technical notices and support messages</li>
                <li>Communicate with you about products, services, and events</li>
                <li>Monitor and analyze trends and usage</li>
                <li>Personalize and improve your experience</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-black mb-4">Information Sharing</h3>
              <p className="text-gray-600 mb-4">
                We may share your information in the following situations:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>With service providers who need access to provide services</li>
                <li>With therapists and places for booking and service delivery</li>
                <li>When required by law or to protect our rights</li>
                <li>In connection with a business transaction</li>
                <li>With your consent or at your direction</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-black mb-4">Data Security</h3>
              <p className="text-gray-600">
                We implement appropriate security measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction. However, 
                no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-black mb-4">Your Rights</h3>
              <p className="text-gray-600 mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Access and update your personal information</li>
                <li>Delete your account and personal data</li>
                <li>Opt out of marketing communications</li>
                <li>Request a copy of your data</li>
                <li>File a complaint with regulatory authorities</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-black mb-4">Contact Us</h3>
              <p className="text-gray-600">
                If you have any questions about this Privacy Policy, please contact us at{' '}
                <a href="mailto:privacy@indastreet.com" className="text-orange-500 hover:text-orange-600 underline">
                  privacy@indastreet.com
                </a>
              </p>
            </section>

            <section>
              <p className="text-gray-500 text-sm">
                Last updated: December 18, 2025
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;