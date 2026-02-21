// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
/**
 * ============================================================================
 * 👁️ PROFILE PREVIEW SYSTEM - REAL-TIME CLIENT VIEW
 * ============================================================================
 * 
 * Real-time profile preview showing exactly how clients see the therapist:
 * - Live preview with instant updates
 * - Client perspective with booking flow simulation
 * - Mobile and desktop preview modes
 * - Social proof display with testimonials
 * - Service showcase with pricing
 * - Availability visualization
 * - Performance metrics integration
 * 
 * ============================================================================
 */

import React, { useState, useCallback } from 'react';
import { BookNowButton } from '../BookNowButton';
import { 
  Eye, Phone as Smartphone, Laptop as Desktop, Star, MapPin, Phone, Clock, DollarSign, Calendar, Award, Users, MessageCircle, TrendingUp, Play as ChevronRight, Shield, Heart, Share2, Star as Bookmark, Play as PlayCircle} from 'lucide-react';
import { TherapistProfile, ProfileService, Testimonial } from './EnhancedProfileEditor';

interface ProfilePreviewProps {
  profile: TherapistProfile;
  viewMode?: 'desktop' | 'mobile';
  showBookingFlow?: boolean;
  className?: string;
}

export const ProfilePreview: React.FC<ProfilePreviewProps> = ({
  profile,
  viewMode = 'desktop',
  showBookingFlow = true,
  className = ""
}) => {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>(viewMode);
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'reviews'>('overview');
  const [selectedService, setSelectedService] = useState<ProfileService | null>(null);

  const ProfileHeader: React.FC = () => (
    <div className="relative">
      {/* Cover Photo */}
      <div className="h-48 bg-gradient-to-r from-orange-400 to-pink-400 rounded-t-lg overflow-hidden">
        {profile.coverPhoto ? (
          <img 
            src={profile.coverPhoto} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/80">
            <div className="text-center">
              <Award className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">Professional Massage Therapy</p>
            </div>
          </div>
        )}
      </div>

      {/* Profile Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 text-white">
        <div className="flex items-end gap-4">
          {/* Profile Picture */}
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
            {profile.profilePicture ? (
              <img 
                src={profile.profilePicture} 
                alt={profile.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Users className="w-8 h-8" />
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">{profile.name || 'Your Name'}</h1>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {profile.location || 'Location'}
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                {profile.socialProof.rating.toFixed(1)} ({profile.socialProof.totalReviews})
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {profile.experience}+ years
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <BookNowButton
              className="bg-transparent px-6 py-2 rounded-lg flex items-center justify-center min-h-[40px] [&_img]:max-h-8"
              ariaLabel="Book Now"
            />
            <div className="flex gap-2">
              <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-lg transition-colors">
                <Heart className="w-4 h-4" />
              </button>
              <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-lg transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-lg transition-colors">
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const StatsBar: React.FC = () => (
    <div className="bg-white p-4 border-b border-gray-200">
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-500">{profile.socialProof.totalBookings}</div>
          <div className="text-xs text-gray-500">Total Bookings</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-500">{profile.socialProof.returningClients}%</div>
          <div className="text-xs text-gray-500">Return Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-500">{profile.socialProof.responseTime}m</div>
          <div className="text-xs text-gray-500">Response Time</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-500">{profile.analytics.viewsThisMonth}</div>
          <div className="text-xs text-gray-500">Views This Month</div>
        </div>
      </div>
    </div>
  );

  const TabNavigation: React.FC = () => (
    <div className="bg-white border-b border-gray-200">
      <div className="flex">
        {[
          { id: 'overview', label: 'Overview', count: null },
          { id: 'services', label: 'Services', count: profile.services.length },
          { id: 'reviews', label: 'Reviews', count: profile.socialProof.totalReviews }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'text-orange-600 border-orange-500'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.count !== null && (
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  const OverviewTab: React.FC = () => (
    <div className="p-6 space-y-6">
      {/* Bio */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
        <p className="text-gray-700 leading-relaxed">
          {profile.bio || 'Share your story, experience, and what makes your approach special...'}
        </p>
      </div>

      {/* Specializations */}
      {profile.specializations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Specializations</h3>
          <div className="flex flex-wrap gap-2">
            {profile.specializations.map((spec, index) => (
              <span
                key={index}
                className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {profile.certifications.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Certifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.certifications.map((cert) => (
              <div key={cert.id} className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{cert.name}</h4>
                  <p className="text-sm text-gray-600">{cert.issuer}</p>
                  <p className="text-xs text-gray-500">{cert.dateObtained}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Why Choose Me</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-500 mb-1">
              {profile.experience}+
            </div>
            <div className="text-sm text-gray-600">Years Experience</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-500 mb-1">
              {profile.socialProof.rating.toFixed(1)}★
            </div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-500 mb-1">
              {profile.socialProof.returningClients}%
            </div>
            <div className="text-sm text-gray-600">Return Clients</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-500 mb-1">
              {profile.socialProof.responseTime}m
            </div>
            <div className="text-sm text-gray-600">Response Time</div>
          </div>
        </div>
      </div>
    </div>
  );

  const ServicesTab: React.FC = () => (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profile.services.map((service) => (
          <div
            key={service.id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedService(service)}
          >
            {service.image && (
              <div className="h-32 overflow-hidden">
                <img 
                  src={service.image} 
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900">{service.name}</h3>
                <span className="text-orange-500 font-bold">${service.price}</span>
              </div>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {service.description || 'Professional massage therapy service'}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {service.duration} min
                </div>
                <BookNowButton
                  className="px-3 py-1 rounded-full min-h-0 [&_img]:max-h-5"
                  ariaLabel="Book Now"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {profile.services.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <PlayCircle className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Services Yet</h3>
          <p className="text-gray-600">Add your services to showcase what you offer to clients.</p>
        </div>
      )}
    </div>
  );

  const ReviewsTab: React.FC = () => (
    <div className="p-6">
      {/* Rating Summary */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-500 mb-1">
              {profile.socialProof.rating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= profile.socialProof.rating 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-600">
              {profile.socialProof.totalReviews} reviews
            </div>
          </div>
          
          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-3 mb-1">
                <span className="text-sm text-gray-600 w-3">{rating}</span>
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400"
                    style={{ 
                      width: `${Math.random() * 80 + 10}%` // Simulate distribution
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="space-y-4">
        {profile.socialProof.recentTestimonials.length > 0 ? (
          profile.socialProof.recentTestimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{testimonial.clientName}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= testimonial.rating 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    {testimonial.serviceType && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {testimonial.serviceType}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-500">{testimonial.date}</span>
              </div>
              <p className="text-gray-700">{testimonial.comment}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MessageCircle className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-600">Your client reviews will appear here once you start receiving bookings.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Preview Mode Toggle */}
      <div className="bg-gray-100 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">Client Preview</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewMode('desktop')}
              className={`p-2 rounded-lg transition-colors ${
                previewMode === 'desktop' 
                  ? 'bg-orange-100 text-orange-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Desktop className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewMode('mobile')}
              className={`p-2 rounded-lg transition-colors ${
                previewMode === 'mobile' 
                  ? 'bg-orange-100 text-orange-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Phone className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className={`${previewMode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'}`}>
        <ProfileHeader />
        <StatsBar />
        <TabNavigation />
        
        <div className="min-h-96">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'services' && <ServicesTab />}
          {activeTab === 'reviews' && <ReviewsTab />}
        </div>
      </div>

      {/* Service Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-96 ">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">{selectedService.name}</h3>
                <button
                  onClick={() => setSelectedService(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              {selectedService.image && (
                <img 
                  src={selectedService.image} 
                  alt={selectedService.name}
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
              )}
              
              <p className="text-gray-700 mb-4">{selectedService.description}</p>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{selectedService.duration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price</span>
                  <span className="font-bold text-orange-500">${selectedService.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium">{selectedService.category}</span>
                </div>
              </div>
              
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition-colors">
                Book This Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePreview;