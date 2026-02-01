// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
import React, { useState } from 'react';

interface EbookCardProps {
  ebook: {
    id: string;
    title: string;
    subtitle: string;
    author: string;
    description: string;
    pages: number;
    coinPrice: number;
    category: string;
    difficulty: string;
    estimatedReadTime: string;
    coverImage?: string;
    previewPages?: string[];
    seoSlug: string;
  };
  userCoins: number;
  onPurchase: (ebookId: string, coinCost: number) => void;
  isPurchased?: boolean;
  isLoading?: boolean;
}

export const EbookCard: React.FC<EbookCardProps> = ({
  ebook,
  userCoins,
  onPurchase,
  isPurchased = false,
  isLoading = false
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const canAfford = userCoins >= ebook.coinPrice;

  const handlePurchase = () => {
    if (canAfford && !isPurchased && !isLoading) {
      onPurchase(ebook.id, ebook.coinPrice);
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        {/* Ebook Cover Image */}
        <div className="h-48 bg-gradient-to-br from-orange-400 to-red-500 relative overflow-hidden">
          {ebook.coverImage ? (
            <img
              src={ebook.coverImage}
              alt={`${ebook.title} cover`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-white">
              <div className="text-center p-4">
                <div className="text-2xl font-bold mb-2">{ebook.title}</div>
                <div className="text-sm opacity-90">{ebook.subtitle}</div>
              </div>
            </div>
          )}
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span className="bg-white bg-opacity-90 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
              {ebook.category}
            </span>
          </div>

          {/* Difficulty Badge */}
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(ebook.difficulty)}`}>
              {ebook.difficulty}
            </span>
          </div>

          {/* Purchased Indicator */}
          {isPurchased && (
            <div className="absolute bottom-3 right-3">
              <div className="bg-green-500 text-white rounded-full p-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Ebook Details */}
        <div className="p-6">
          {/* Title and Author */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-2">
              {ebook.title}
            </h3>
            <p className="text-sm text-gray-600 mb-2">{ebook.author}</p>
            <p className="text-sm text-gray-700 line-clamp-3">{ebook.description}</p>
          </div>

          {/* Ebook Stats */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>{ebook.pages} pages</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{ebook.estimatedReadTime}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Preview Button */}
            {ebook.previewPages && ebook.previewPages.length > 0 && (
              <button
                onClick={handlePreview}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview Pages
              </button>
            )}

            {/* Purchase/Access Button */}
            {isPurchased ? (
              <button
                onClick={() => window.open(`/ebooks/${ebook.seoSlug}`, '_blank')}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Read Ebook
              </button>
            ) : (
              <button
                onClick={handlePurchase}
                disabled={!canAfford || isLoading}
                className={`w-full font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 ${
                  canAfford && !isLoading
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    {canAfford ? `Purchase for ${ebook.coinPrice} coins` : `Need ${ebook.coinPrice - userCoins} more coins`}
                  </>
                )}
              </button>
            )}
          </div>

          {/* User Coin Balance */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Your coins:</span>
              <div className="flex items-center gap-1 font-medium text-orange-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029C10.792 13.807 10.304 14 10 14c-.304 0-.792-.193-1.264-.979a1 1 0 00-1.715 1.029z" clipRule="evenodd" />
                </svg>
                {userCoins}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Preview: {ebook.title}</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6  max-h-[60vh]">
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-600 italic mb-4">
                  This is a preview of the first few pages. Purchase the full ebook to access all {ebook.pages} pages.
                </p>
                {ebook.previewPages?.map((page, index) => (
                  <div key={index} className="mb-6 pb-6 border-b border-gray-200 last:border-b-0">
                    <div className="whitespace-pre-wrap text-sm text-gray-800">{page}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowPreview(false)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};