import React from 'react';

interface EbookPageProps {
  ebookId: string;
  title: string;
  content: string[];
  seoData: {
    title: string;
    description: string;
    keywords: string[];
    canonicalUrl: string;
  };
}

export const EbookPage: React.FC<EbookPageProps> = ({ ebookId, title, content, seoData }) => {
  return (
    <>
      {/* SEO will be handled by document head - this is the content component */}

      <div className="min-h-screen bg-gray-50 pb-40">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Shop
              </button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mt-4">{title}</h1>
            <p className="text-gray-600 mt-2">by IndaStreet Massage Academy</p>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-4xl mx-auto px-4 py-8">
          <article className="bg-white rounded-lg shadow-sm p-8">
            <div className="prose prose-lg max-w-none">
              {content.map((section, index) => (
                <section key={index} className="mb-8">
                  <div 
                    className="text-gray-800 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: section }}
                  />
                  {index < content.length - 1 && (
                    <hr className="my-8 border-gray-200" />
                  )}
                </section>
              ))}
            </div>

            {/* Footer - Fixed positioning */}
            <footer className="fixed bottom-0 left-0 right-0 bg-white pt-8 border-t border-gray-200 z-50">
              <div className="bg-orange-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Continue Your Professional Development
                </h3>
                <p className="text-gray-700 mb-4">
                  Explore more professional massage therapy resources and continuing education materials.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => window.open('/coin-shop', '_blank')}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Browse More Ebooks
                  </button>
                  <button
                    onClick={() => window.open('/book-massage', '_blank')}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Book a Massage
                  </button>
                  <button
                    onClick={() => window.open('/therapist-signup', '_blank')}
                    className="border border-orange-500 text-orange-500 hover:bg-orange-50 px-4 py-2 rounded-lg transition-colors"
                  >
                    Join as Therapist
                  </button>
                </div>
              </div>
            </footer>
          </article>
        </main>

        {/* Related Content */}
        <aside className="max-w-4xl mx-auto px-4 pb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Related Professional Resources
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/info/massage-safety-guidelines"
                className="block p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
              >
                <h4 className="font-medium text-gray-900">Safety Guidelines</h4>
                <p className="text-sm text-gray-600 mt-1">Essential safety protocols for massage therapy</p>
              </a>
              <a
                href="/info/professional-massage-ethics"
                className="block p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
              >
                <h4 className="font-medium text-gray-900">Professional Ethics</h4>
                <p className="text-sm text-gray-600 mt-1">Ethical standards and boundary management</p>
              </a>
              <a
                href="/info/massage-technique-training"
                className="block p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
              >
                <h4 className="font-medium text-gray-900">Technique Training</h4>
                <p className="text-sm text-gray-600 mt-1">Advanced massage technique development</p>
              </a>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};