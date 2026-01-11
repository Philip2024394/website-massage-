/**
 * ============================================================================
 * 🌍 PUBLIC PROFILE PAGE - NO AUTH REQUIRED
 * ============================================================================
 * 
 * Simple, stable public profile view accessible via: /t/{memberId}
 * 
 * RULES:
 * - No authentication required
 * - No redirects on failure
 * - No language/city dependencies
 * - Works in incognito mode
 * - Displays Open Graph meta tags for social sharing
 */

import React, { useState, useEffect } from 'react';
import { databases, DATABASE_ID } from '../lib/appwrite';
import { MapPin, Star, Clock, Phone, Mail, Share2, MessageCircle } from 'lucide-react';

interface PublicProfilePageProps {
  memberId?: string;
  onNavigate?: (page: string) => void;
}

interface MemberProfile {
  $id: string;
  name: string;
  profileImage?: string;
  city?: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  experience?: string;
  specialties?: string[];
  phone?: string;
  email?: string;
  status?: string;
}

export default function PublicProfilePage({ memberId, onNavigate }: PublicProfilePageProps) {
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🌍 Public profile route mounted for member:', memberId);
    
    if (!memberId) {
      setError('No member ID provided');
      setLoading(false);
      return;
    }

    loadProfile();
  }, [memberId]);

  const loadProfile = async () => {
    if (!memberId) return;

    try {
      setLoading(true);
      setError(null);

      // Try therapists collection first
      try {
        const response = await databases.getDocument(
          DATABASE_ID,
          'therapists_collection_id',
          memberId
        );
        
        setProfile(response as unknown as MemberProfile);
        updateMetaTags(response as unknown as MemberProfile);
        console.log('✅ Public profile loaded successfully');
        return;
      } catch (therapistError) {
        // Try places collection
        try {
          const response = await databases.getDocument(
            DATABASE_ID,
            'places_collection_id',
            memberId
          );
          
          setProfile(response as unknown as MemberProfile);
          updateMetaTags(response as unknown as MemberProfile);
          console.log('✅ Public profile loaded successfully');
          return;
        } catch (placeError) {
          console.error('❌ Profile not found in any collection');
          setError('Profile not found');
        }
      }
    } catch (err) {
      console.error('❌ Failed to load public profile:', err);
      setError('Unable to load profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const updateMetaTags = (profile: MemberProfile) => {
    const profileUrl = `${window.location.origin}/t/${profile.$id}`;
    const title = `${profile.name} - Professional Massage Services`;
    const description = profile.description || `Book a massage session with ${profile.name}`;
    const image = profile.profileImage || 'https://ik.imagekit.io/7grri5v7d/indastreet%20massage.png';

    // Update Open Graph meta tags
    document.title = title;
    
    const updateMetaTag = (property: string, content: string) => {
      let element = document.querySelector(`meta[property="${property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', image);
    updateMetaTag('og:url', profileUrl);
    updateMetaTag('og:type', 'profile');

    console.log('🏷️ Open Graph meta tags updated for social sharing');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">😔</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Available</h1>
          <p className="text-gray-600 mb-6">
            {error || 'The profile you are looking for could not be found.'}
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  const profileUrl = `${window.location.origin}/t/${profile.$id}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Check out ${profile.name}'s profile: ${profileUrl}`)}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">
              <span className="text-black">Inda</span>
              <span className="text-orange-500">Street</span>
            </h1>
            <button
              onClick={() => window.location.href = '/'}
              className="text-sm text-gray-600 hover:text-orange-500 transition-colors"
            >
              Browse More
            </button>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="relative h-48 bg-gradient-to-r from-orange-400 to-pink-500">
            <div className="absolute -bottom-16 left-8">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-4xl font-bold">
                    {profile.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-20 px-8 pb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{profile.name}</h2>
                {profile.city && (
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{profile.city}</span>
                  </div>
                )}
                {profile.rating && (
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="ml-2 font-semibold text-gray-900">{profile.rating.toFixed(1)}</span>
                    {profile.reviewCount && (
                      <span className="ml-1 text-gray-600">({profile.reviewCount} reviews)</span>
                    )}
                  </div>
                )}
              </div>

              {profile.status === 'active' && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Available</span>
                </div>
              )}
            </div>

            {/* Description */}
            {profile.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
                <p className="text-gray-700 leading-relaxed">{profile.description}</p>
              </div>
            )}

            {/* Specialties */}
            {profile.specialties && profile.specialties.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {profile.experience && (
              <div className="mb-6">
                <div className="flex items-center text-gray-700">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>{profile.experience} years of experience</span>
                </div>
              </div>
            )}

            {/* Contact Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Contact via WhatsApp</span>
              </a>
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <span>Book Now</span>
              </button>
            </div>

            {/* Share URL Section */}
            <div className="border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-600 mb-2">Share this profile:</p>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <input
                  type="text"
                  value={profileUrl}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-gray-700 outline-none min-w-0"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(profileUrl);
                    alert('Profile link copied to clipboard!');
                  }}
                  className="px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-xs sm:text-sm whitespace-nowrap min-w-[80px] flex-shrink-0"
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
