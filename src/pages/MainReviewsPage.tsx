import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, MessageSquare, User, MessageCircle, Calendar, Clock } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { ReviewData } from '../components/ReviewModal';
import { ReviewCard } from '../components/ReviewCard';
import { reviewService } from '../lib/appwriteService';

interface ReviewsPageProps {
  providerId?: string;
  providerName?: string;
  providerType?: 'therapist' | 'place';
  providerImage?: string;
  ownerWhatsApp?: string;
  initialReviews?: ReviewData[];
  onBack?: () => void;
}

const avatarOptions = [
  { id: 1, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%201.png', label: 'Avatar 1' },
  { id: 2, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%202.png', label: 'Avatar 2' },
  { id: 3, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%203.png', label: 'Avatar 3' },
  { id: 4, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%204.png', label: 'Avatar 4' },
  { id: 5, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%206.png', label: 'Avatar 6' },
  { id: 6, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%207.png', label: 'Avatar 7' },
  { id: 7, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%208.png', label: 'Avatar 8' },
  { id: 8, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%209.png', label: 'Avatar 9' },
  { id: 9, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2010.png', label: 'Avatar 10' },
  { id: 10, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2011.png', label: 'Avatar 11' },
  { id: 11, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2012.png', label: 'Avatar 12' },
  { id: 12, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2013.png', label: 'Avatar 13' },
  { id: 13, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2014.png', label: 'Avatar 14' },
  { id: 14, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2015.png', label: 'Avatar 15' },
  { id: 15, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2016.png', label: 'Avatar 16' },
  { id: 16, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2017.png', label: 'Avatar 17' },
  { id: 17, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2018.png', label: 'Avatar 18' },
];

export const ReviewsPage: React.FC<ReviewsPageProps> = ({
  providerId,
  providerName,
  providerType,
  providerImage,
  ownerWhatsApp,
  initialReviews = [],
  onBack,
}) => {
  // Fallback to URL params if props are not provided
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  
  // Try sessionStorage first (for React routing), then URL params
  let sessionParams: Record<string, string> = {};
  if (typeof window !== 'undefined') {
    const storedParams = sessionStorage.getItem('reviewParams');
    if (storedParams) {
      try {
        sessionParams = JSON.parse(storedParams);
        // Clear after reading
        sessionStorage.removeItem('reviewParams');
      } catch (e) {
        console.error('Failed to parse review params from sessionStorage', e);
      }
    }
  }
  
  const qpProviderId = sessionParams.providerId || params.get('providerId') || undefined;
  const qpProviderName = sessionParams.providerName || params.get('providerName') || undefined;
  const qpProviderType = (sessionParams.providerType || params.get('providerType')) as 'therapist' | 'place' | null || undefined;
  const qpProviderImage = sessionParams.providerImage || params.get('providerImage') || undefined;

  const effectiveProviderId = providerId ?? qpProviderId ?? '0';
  const effectiveProviderName = providerName ?? qpProviderName ?? 'Unknown';
  const effectiveProviderType: 'therapist' | 'place' = providerType ?? qpProviderType ?? 'therapist';
  const effectiveProviderImage = providerImage ?? qpProviderImage;

  const handleBack = () => {
    if (onBack) {
      onBack(); // AppRouter routes this to 'home'
      return;
    }
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };
  const [reviews, setReviews] = useState<ReviewData[]>(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Form states
  const [userName, setUserName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load reviews from Appwrite on mount
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        const appwriteReviews = await reviewService.getByProvider(Number(effectiveProviderId), effectiveProviderType);
        
        // Convert Appwrite reviews to ReviewData format
        const formattedReviews: ReviewData[] = appwriteReviews.map((review: any) => ({
          userName: review.reviewerName || 'Anonymous',
          whatsappNumber: review.whatsapp || '',
          rating: review.rating,
          reviewText: review.comment || '',
          avatar: review.avatar || 'https://ik.imagekit.io/7grri5v7d/avatar%201.png',
          date: new Date(review.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          time: new Date(review.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        }));
        
        setReviews(formattedReviews);
      } catch (error) {
        console.error('Error loading reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [effectiveProviderId, effectiveProviderType]);

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!userName.trim()) {
      newErrors.userName = 'Name is required';
    }

    if (!whatsappNumber.trim()) {
      newErrors.whatsappNumber = 'WhatsApp number is required';
    } else if (!/^\+?[0-9]{10,15}$/.test(whatsappNumber.replace(/\s/g, ''))) {
      newErrors.whatsappNumber = 'Please enter a valid WhatsApp number';
    }

    if (rating === 0) {
      newErrors.rating = 'Please select a star rating';
    }

    if (!reviewText.trim()) {
      newErrors.reviewText = 'Review text is required';
    } else if (reviewText.trim().length < 10) {
      newErrors.reviewText = 'Review must be at least 10 characters';
    }

    if (!selectedAvatar) {
      newErrors.avatar = 'Please select an avatar';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitReview = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setErrors({});
      
      const now = new Date();
      const reviewData: ReviewData = {
        userName: userName.trim(),
        whatsappNumber: whatsappNumber.trim(),
        rating,
        reviewText: reviewText.trim(),
        avatar: selectedAvatar,
        date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      };

      // Add to local state immediately for instant feedback
      setReviews([reviewData, ...reviews]);
      
      // Save to Appwrite
      await reviewService.createAnonymous({
        providerId: providerId || '',
        providerType: providerType as 'therapist' | 'place',
        // providerName: providerName, // Removed - not in interface
        rating: rating,
        reviewerName: userName.trim(),
        whatsappNumber: whatsappNumber.trim(),
        comment: reviewText.trim(),
        avatar: selectedAvatar,
      });

      console.log('✅ Review submitted successfully');

      // Determine redirect target
      const paramsForRedirect = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
      const returnUrl = paramsForRedirect.get('returnUrl');
      const idForRedirect = effectiveProviderId;
      const nameForRedirect = effectiveProviderName || '';
      const cleanSlug = nameForRedirect
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      let fallbackProfileUrl = '/';
      if (idForRedirect && cleanSlug) {
        if (effectiveProviderType === 'place') {
          fallbackProfileUrl = `/profile/place/${idForRedirect}-${cleanSlug}`;
        } else {
          fallbackProfileUrl = `/profile/therapist/${idForRedirect}-${cleanSlug}`;
        }
      }

      // Reset form
      setUserName('');
      setWhatsappNumber('');
      setRating(0);
      setReviewText('');
      setSelectedAvatar('');
      setErrors({});
      setShowForm(false);

      // Redirect back to profile (prefer explicit returnUrl)
      if (typeof window !== 'undefined') {
        const target = returnUrl || fallbackProfileUrl;
        window.location.href = target;
        return;
      }
    } catch (error) {
      console.error('❌ Error submitting review:', error);
      
      // Remove from local state if save failed
      setReviews(reviews);
      
      setErrors({ submit: 'Failed to submit review. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Success Message Toast */}
      {showSuccessMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-bold">Thank you for your review!</p>
              <p className="text-sm text-green-100">Your review has been submitted successfully.</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <PageContainer className="py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl sm:text-2xl font-bold">
              <span className="text-gray-900">Inda</span>
              <span className="text-orange-500">street</span>
            </h1>
            <button 
              onClick={handleBack} 
              className="p-2 rounded-lg transition-colors text-gray-700 hover:text-orange-500 hover:bg-orange-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-orange-600" />
            </button>
          </div>
        </PageContainer>
      </header>

      {/* Provider Name and Reviews Title */}
      <div className="bg-white border-b border-gray-200 relative overflow-hidden">
        <PageContainer className="py-4">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-1 pr-20 sm:pr-24">Customer Reviews</h2>
            <div className="flex items-center gap-3 pr-20 sm:pr-24">
              {effectiveProviderImage && (
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-orange-500 shadow-md flex-shrink-0">
                  <img 
                    src={effectiveProviderImage} 
                    alt={effectiveProviderName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <p className="text-gray-600 font-medium">{effectiveProviderName}</p>
            </div>
          </div>
          <img 
            src="https://ik.imagekit.io/7grri5v7d/reviews.png" 
            alt="Reviews" 
            className="absolute bottom-0 right-0 h-16 sm:h-20 md:h-24 w-auto object-contain"
          />
        </PageContainer>
      </div>

      <main>
        <PageContainer className="py-6 space-y-6">
          {/* Rating Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-5xl font-bold text-gray-900">{averageRating}</div>
                  <div className="flex items-center justify-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(parseFloat(averageRating))
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-gray-200 text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </p>
                </div>
              </div>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <MessageSquare className="w-5 h-5" />
                  Leave a Review
                </button>
              )}
            </div>
          </div>

          {/* Review Form */}
          {showForm && (
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-orange-200 relative">
              {/* Close button in top-right corner */}
              <button
                onClick={() => {
                  setShowForm(false);
                  setErrors({});
                }}
                className="absolute top-4 right-4 w-10 h-10 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg z-10"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="mb-6">
                <div className="flex items-center gap-4">
                  {/* Selected Avatar Display */}
                  {selectedAvatar && (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg overflow-hidden">
                      <img 
                        src={selectedAvatar} 
                        alt="Selected avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="pr-12">
                    <h2 className="text-2xl font-bold text-gray-900">Write Your Review</h2>
                    <p className="text-gray-600 text-xs mt-1 max-w-md leading-relaxed">
                      If you feel the service that was offered was not to your satisfaction, we kindly ask you first make contact with the owner as this would be addressed with immediate effect. And send a direct message to the highest authority to make them aware of areas of improvement.
                    </p>
                    {ownerWhatsApp && (
                      <a
                        href={`https://wa.me/${ownerWhatsApp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors shadow-md"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Owner's WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Name Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all ${
                      errors.userName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.userName && <p className="text-red-500 text-xs mt-1">{errors.userName}</p>}
                </div>

                {/* WhatsApp Number Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <MessageCircle className="w-4 h-4 inline mr-2" />
                    WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+62 812 3456 7890"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all ${
                      errors.whatsappNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.whatsappNumber && <p className="text-red-500 text-xs mt-1">{errors.whatsappNumber}</p>}
                </div>

                {/* Star Rating */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rating *
                  </label>
                  <div className="flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-10 h-10 ${
                              star <= (hoveredRating || rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-200 text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                      {rating > 0 && (
                        <span className="ml-2 text-sm font-medium text-gray-700">
                          {rating} {rating === 1 ? 'Star' : 'Stars'}
                        </span>
                      )}
                    </div>
                    <img 
                      src="https://ik.imagekit.io/7grri5v7d/reviews.png?updatedAt=1764760532097" 
                      alt="Reviews"
                      className="w-24 h-24 flex-shrink-0"
                    />
                  </div>
                  {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating}</p>}
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    Your Review *
                  </label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Tell us about your experience..."
                    rows={5}
                    maxLength={500}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none ${
                      errors.reviewText ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <div>
                      {errors.reviewText && <p className="text-red-500 text-xs">{errors.reviewText}</p>}
                    </div>
                    <p className="text-xs text-gray-500">{reviewText.length}/500 characters</p>
                  </div>
                </div>

                {/* Avatar Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Choose Your Avatar *
                  </label>
                  <div className="grid grid-cols-5 gap-4">
                    {avatarOptions.map((avatar) => (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => setSelectedAvatar(avatar.imageUrl)}
                        className="relative transition-all hover:scale-105 focus:outline-none"
                      >
                        <img 
                          src={avatar.imageUrl} 
                          alt={avatar.label} 
                          className={`w-full aspect-square rounded-full object-cover ${
                            selectedAvatar === avatar.imageUrl
                              ? 'ring-4 ring-orange-500 ring-offset-2 shadow-lg shadow-orange-500/50'
                              : 'hover:ring-2 hover:ring-orange-300 hover:ring-offset-2'
                          }`}
                        />
                        {selectedAvatar === avatar.imageUrl && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full animate-pulse shadow-lg">
                            <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-75"></div>
                          </div>
                        )}
                        <div className="text-xs text-gray-600 text-center mt-1">{avatar.label}</div>
                      </button>
                    ))}
                  </div>
                  {errors.avatar && <p className="text-red-500 text-xs mt-2">{errors.avatar}</p>}
                </div>

                {/* Error Message */}
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm">{errors.submit}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleSubmitReview}
                  disabled={submitting}
                  className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
                <p className="text-gray-600 mb-6">
                  Be the first to share your experience with {providerName}
                </p>
                {!showForm && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Write First Review
                  </button>
                )}
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-gray-900 mt-8">All Reviews</h3>
                {reviews.map((review, index) => (
                  <ReviewCard key={index} review={review} />
                ))}
              </>
            )}
          </div>
        </PageContainer>
      </main>
    </div>
  );
};

export default ReviewsPage;
