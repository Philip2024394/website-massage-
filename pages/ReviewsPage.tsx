import React, { useState, useEffect } from 'react';
import { Home, Star, MessageSquare, User, Phone, Calendar, Clock } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { ReviewData } from '../components/ReviewModal';
import { ReviewCard } from '../components/ReviewCard';
import { reviewService } from '../lib/appwriteService';

interface ReviewsPageProps {
  providerId: string;
  providerName: string;
  providerType: 'therapist' | 'place';
  initialReviews?: ReviewData[];
  onBack: () => void;
}

const avatarOptions = [
  { id: 1, emoji: '👨', label: 'Man' },
  { id: 2, emoji: '👩', label: 'Woman' },
  { id: 3, emoji: '👴', label: 'Older Man' },
  { id: 4, emoji: '👵', label: 'Older Woman' },
  { id: 5, emoji: '🧔', label: 'Bearded Man' },
  { id: 6, emoji: '👱‍♀️', label: 'Blonde Woman' },
  { id: 7, emoji: '👨‍💼', label: 'Professional Man' },
  { id: 8, emoji: '👩‍💼', label: 'Professional Woman' },
  { id: 9, emoji: '🧑', label: 'Person' },
  { id: 10, emoji: '😊', label: 'Happy Face' },
];

export const ReviewsPage: React.FC<ReviewsPageProps> = ({
  providerId,
  providerName,
  providerType,
  initialReviews = [],
  onBack,
}) => {
  const [reviews, setReviews] = useState<ReviewData[]>(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
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
        const appwriteReviews = await reviewService.getByProvider(Number(providerId), providerType);
        
        // Convert Appwrite reviews to ReviewData format
        const formattedReviews: ReviewData[] = appwriteReviews.map((review: any) => ({
          userName: review.reviewerName || 'Anonymous',
          whatsappNumber: review.whatsapp || '',
          rating: review.rating,
          reviewText: review.comment || '',
          avatar: review.avatar || '😊',
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
  }, [providerId, providerType]);

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
      
      // Save to Appwrite
      await reviewService.createAnonymous({
        providerId: providerId,
        providerType: providerType,
        providerName: providerName,
        rating: rating,
        reviewerName: userName.trim(),
        whatsappNumber: whatsappNumber.trim(),
        comment: reviewText.trim(),
        avatar: selectedAvatar,
      });

      // Also save comment and avatar separately if needed
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
      
      // Reset form
      setUserName('');
      setWhatsappNumber('');
      setRating(0);
      setReviewText('');
      setSelectedAvatar('');
      setErrors({});
      setShowForm(false);

      // Scroll to top to see the new review
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error submitting review:', error);
      setErrors({ submit: 'Failed to submit review. Please try again.' });
    } finally {
      setSubmitting(false);
    }
    
    // TODO: Save review to Appwrite database
    console.log('New review submitted:', reviewData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <PageContainer className="py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl sm:text-2xl font-bold">
              <span className="text-gray-900">Inda</span>
              <span className="text-orange-500">street</span>
            </h1>
            <button 
              onClick={onBack} 
              className="p-2 rounded-lg transition-colors text-gray-700 hover:text-orange-500 hover:bg-orange-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <Home className="w-5 h-5 text-orange-600" />
            </button>
          </div>
        </PageContainer>
      </header>

      {/* Provider Name and Reviews Title */}
      <div className="bg-white border-b border-gray-200 relative overflow-hidden">
        <PageContainer className="py-4">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-1 pr-20 sm:pr-24">Customer Reviews</h2>
            <p className="text-gray-600 pr-20 sm:pr-24">{providerName}</p>
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
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-orange-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Write Your Review</h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setErrors({});
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
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
                    <Phone className="w-4 h-4 inline mr-2" />
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
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none ${
                      errors.reviewText ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <div>
                      {errors.reviewText && <p className="text-red-500 text-xs">{errors.reviewText}</p>}
                    </div>
                    <p className="text-xs text-gray-500">{reviewText.length} characters</p>
                  </div>
                </div>

                {/* Avatar Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Choose Your Avatar *
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    {avatarOptions.map((avatar) => (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => setSelectedAvatar(avatar.emoji)}
                        className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                          selectedAvatar === avatar.emoji
                            ? 'border-orange-500 bg-orange-50 shadow-lg'
                            : 'border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        <div className="text-4xl text-center">{avatar.emoji}</div>
                        <div className="text-xs text-gray-600 text-center mt-1">{avatar.label}</div>
                      </button>
                    ))}
                  </div>
                  {errors.avatar && <p className="text-red-500 text-xs mt-2">{errors.avatar}</p>}
                </div>

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
