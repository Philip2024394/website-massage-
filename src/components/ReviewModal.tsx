// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
import React, { useState } from 'react';
import { X, Star, Calendar, Clock, User, MessageSquare, MessageCircle } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (review: ReviewData) => void;
  providerName: string;
  providerType: 'therapist' | 'place';
  ownerWhatsApp?: string;
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

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  providerName,
  providerType,
  ownerWhatsApp,
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh]  relative">
        {/* Close button in top-right corner */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-10 h-10 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center gap-4 pr-12">
            {/* Selected Avatar Display */}
            {selectedAvatar && (
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg overflow-hidden border-2 border-white/30">
                <img 
                  src={selectedAvatar} 
                  alt="Selected avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold">Write a Review</h2>
              <p className="text-orange-100 text-xs mt-2 max-w-md leading-relaxed">
                If you feel the service that was offered was not to your satisfaction, we kindly ask you first make contact with the owner as this would be addressed with immediate effect. And send a direct message to the highest authority to make them aware of areas of improvement.
              </p>
              {ownerWhatsApp && (
                <a
                  href={`https://wa.me/${ownerWhatsApp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-semibold rounded-lg transition-colors border border-white/30 shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Owner's WhatsApp</span>
                </a>
              )}
            </div>
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
