/**
 * Terms & Conditions Page
 * Full legal terms document accessible from footer/links
 */

import React from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { FULL_TERMS_DOCUMENT, LEGAL_TERMS } from '../src/legal/terms';

interface TermsPageProps {
  language?: 'en' | 'id';
  onNavigate?: (page: string) => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ 
  language = 'en',
  onNavigate 
}) => {
  
  const handleBack = () => {
    if (onNavigate) {
      onNavigate('home');
    } else {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {FULL_TERMS_DOCUMENT.title}
              </h1>
              <p className="text-sm text-gray-500">
                {language === 'id' ? 'Versi' : 'Version'} {FULL_TERMS_DOCUMENT.version} • {language === 'id' ? 'Terakhir diperbarui' : 'Last updated'}: {FULL_TERMS_DOCUMENT.lastUpdated}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Important Notice */}
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-8 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="font-semibold text-orange-800 mb-1">
                {language === 'id' ? 'Pemberitahuan Penting' : 'Important Notice'}
              </p>
              <p className="text-sm text-orange-700">
                {language === 'id' 
                  ? 'Semua anggota IndaStreetMassage bergabung sebagai kontraktor independen (wiraswasta). Platform ini hanya menyediakan layanan pemesanan dan komunikasi. Anda bertanggung jawab penuh atas pajak, lisensi, dan kepatuhan hukum Anda.'
                  : 'All IndaStreetMassage members join as independent contractors (self-employed). This platform only provides booking and communication services. You are fully responsible for your taxes, licenses, and legal compliance.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Terms Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {FULL_TERMS_DOCUMENT.sections.map((section, index) => (
            <section key={index} className="mb-8 last:mb-0">
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                {index + 1}. {section.title}
              </h2>
              <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                {language === 'id' ? section.contentId : section.content}
              </div>
            </section>
          ))}
        </div>

        {/* Summary Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-3">
            {language === 'id' ? '📋 Ringkasan Penting' : '📋 Key Summary'}
          </h3>
          <div className="text-sm text-blue-800 whitespace-pre-line">
            {language === 'id' ? LEGAL_TERMS.SUMMARY.contentId : LEGAL_TERMS.SUMMARY.content}
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            {language === 'id' 
              ? 'Pertanyaan tentang syarat ini? Hubungi kami di' 
              : 'Questions about these terms? Contact us at'
            }{' '}
            <a href="mailto:support@indastreetmassage.com" className="text-orange-600 hover:text-orange-700 font-medium">
              support@indastreetmassage.com
            </a>
          </p>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
          >
            {language === 'id' ? '← Kembali' : '← Go Back'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
