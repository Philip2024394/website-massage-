import React, { useState } from 'react';
import { X, Star, Calendar, Clock, User, MessageSquare, Phone } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (review: ReviewData) => void;
  providerName: string;
  providerType: 'therapist' | 'place';
}

export interface ReviewData {
  userName: string;
  whatsappNumber: string;
  rating: number;
  reviewText: string;
  avatar: string;
  date: string;
  time: string;
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

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  providerName,
  providerType,
}) => {
  const [userName, setUserName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

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

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

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

    onSubmit(reviewData);
    handleClose();
  };

  const handleClose = () => {
    setUserName('');
    setWhatsappNumber('');
    setRating(0);
    setHoveredRating(0);
    setReviewText('');
    setSelectedAvatar('');
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Write a Review</h2>
              <p className="text-orange-100 text-sm mt-1">Share your experience with {providerName}</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
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
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl border-t border-gray-200">
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl"
            >
              Submit Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
