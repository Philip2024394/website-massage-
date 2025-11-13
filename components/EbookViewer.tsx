import React, { useState, useEffect } from 'react';
import { massageDosAndDontsEbook, generateEbookPDF } from '../utils/ebookUtils';

interface EbookViewerProps {
  ebookId: string;
  onClose: () => void;
}

export const EbookViewer: React.FC<EbookViewerProps> = ({ ebookId, onClose }) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate the HTML content for the ebook
    if (ebookId === 'massage-dos-donts-guide') {
      const pdfContent = generateEbookPDF(massageDosAndDontsEbook);
      setHtmlContent(pdfContent);
      setLoading(false);
    }
  }, [ebookId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${massageDosAndDontsEbook.title}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ebook...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900 truncate">
              {massageDosAndDontsEbook.title}
            </h2>
            <p className="text-sm text-gray-600">by {massageDosAndDontsEbook.author}</p>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto bg-white">
            <div 
              className="ebook-content"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
              style={{ 
                minHeight: '100%',
                background: 'white'
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>📚 {massageDosAndDontsEbook.pages} pages</span>
              <span>🏷️ Professional Training</span>
              <span>📅 Published {new Date(massageDosAndDontsEbook.publishDate).toLocaleDateString()}</span>
            </div>
            <div className="text-orange-600 font-medium">
              IndaStreet Massage Academy
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles - handled in CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            .fixed, .bg-black, .bg-opacity-50 {
              display: none !important;
            }
            .ebook-content {
              width: 100% !important;
              height: auto !important;
              overflow: visible !important;
              font-size: 12pt !important;
              line-height: 1.5 !important;
            }
          }
        `
      }} />
    </div>
  );
};