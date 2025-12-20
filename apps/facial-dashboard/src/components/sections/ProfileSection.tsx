/**
 * Profile Section Component
 * Handles profile picture, main image, name, description, and contact info
 * Max size: 15KB (Facebook/Amazon standard)
 */

import React from 'react';
import ImageUpload from '../../../../../components/ImageUpload';
import MainImageCropper from '../../../../../components/MainImageCropper';
import UserSolidIcon from '../../../../../components/icons/UserSolidIcon';
import PhoneIcon from '../../../../../components/icons/PhoneIcon';

interface ProfileSectionProps {
  name: string;
  setName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  mainImage: string;
  setMainImage: (value: string) => void;
  profilePicture: string;
  setProfilePicture: (value: string) => void;
  contactNumber: string;
  setContactNumber: (value: string) => void;
  ownerWhatsApp: string;
  setOwnerWhatsApp: (value: string) => void;
  showImageCropper: boolean;
  setShowImageCropper: (value: boolean) => void;
  showImageRequirementModal: boolean;
  setShowImageRequirementModal: (value: boolean) => void;
  pendingImageUrl: string;
  setPendingImageUrl: (value: string) => void;
  handleAcceptImageRequirement: () => void;
  handleRejectImageRequirement: () => void;
  t: any;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  name,
  setName,
  description,
  setDescription,
  mainImage,
  setMainImage,
  profilePicture,
  setProfilePicture,
  contactNumber,
  setContactNumber,
  ownerWhatsApp,
  setOwnerWhatsApp,
  showImageCropper,
  setShowImageCropper,
  showImageRequirementModal,
  setShowImageRequirementModal: _setShowImageRequirementModal,
  handleAcceptImageRequirement,
  handleRejectImageRequirement,
  t,
}): JSX.Element => {
  return (
    <div className="space-y-6">
      {/* Main Image Upload */}
      <ImageUpload
        id="main-image-upload"
        label={t?.uploadMainImage || 'Upload Main Image'}
        currentImage={mainImage}
        onImageChange={setMainImage}
      />
      <div className="flex justify-between items-center mt-1">
        <div className="text-xs text-gray-500">
          Recommended: 1200×675px (16:9 ratio)
        </div>
        {mainImage && (
          <button
            type="button"
            onClick={() => setShowImageCropper(true)}
            className="text-xs text-orange-600 hover:text-orange-700 font-semibold underline"
          >
            Edit Banner
          </button>
        )}
      </div>

      {/* Image Cropper Modal */}
      {showImageCropper && mainImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Banner Image</h3>
              <MainImageCropper
                imageUrl={mainImage}
                aspect={16 / 9}
                onConfirm={(croppedImage) => {
                  setMainImage(croppedImage);
                  setShowImageCropper(false);
                }}
                onCancel={() => setShowImageCropper(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Profile Picture Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {t?.uploadProfilePicture || "Upload Profile Picture (Circular Logo)"}
        </label>

        {/* Image Requirement Modal */}
        {showImageRequirementModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-sm w-full shadow-2xl overflow-hidden max-h-[85vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Logo Requirements</h3>
                    <p className="text-orange-100 text-xs sm:text-sm">Read before uploading</p>
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 sm:p-3">
                  <p className="font-semibold text-orange-900 text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Required for Profile
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-2 sm:p-3 space-y-1 sm:space-y-2">
                  <p className="font-semibold text-gray-900 text-xs sm:text-sm">✓ Logo requirements:</p>
                  <ul className="space-y-1">
                    <li className="flex items-start gap-1 sm:gap-2 text-xs sm:text-sm text-gray-700">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Clear, professional business logo</span>
                    </li>
                    <li className="flex items-start gap-1 sm:gap-2 text-xs sm:text-sm text-gray-700">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>High quality (min 400x400px)</span>
                    </li>
                    <li className="flex items-start gap-1 sm:gap-2 text-xs sm:text-sm text-gray-700">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Authentic business image</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3 space-y-1">
                  <p className="font-semibold text-red-900 text-xs sm:text-sm flex items-center gap-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                    </svg>
                    Suspension Policy
                  </p>
                  <ul className="space-y-0.5 text-xs text-red-800">
                    <li className="flex items-start gap-1">
                      <span className="text-red-600">•</span>
                      <span>Fake business info</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-red-600">•</span>
                      <span>Using other's logos</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-red-600">•</span>
                      <span>Inappropriate images</span>
                    </li>
                  </ul>
                  <p className="text-xs text-red-900 font-semibold pt-0.5">
                    May cause suspension
                  </p>
                </div>

                <p className="text-xs text-gray-500 italic text-center pt-1">
                  Confirming verifies this is your authentic business logo
                </p>
              </div>

              <div className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 flex gap-2">
                <button
                  onClick={handleRejectImageRequirement}
                  className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-h-[32px] sm:min-h-[36px]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAcceptImageRequirement}
                  className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 rounded-lg hover:from-green-700 hover:to-green-800 shadow-md transition-all min-h-[32px] sm:min-h-[36px]"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Circular Profile Picture */}
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div
              className="w-32 h-32 rounded-full overflow-hidden border-4 border-orange-200 shadow-lg cursor-pointer hover:border-orange-400 transition-all bg-gray-100 relative"
              onClick={() => {
                const input = document.getElementById('profile-picture-upload') as HTMLInputElement;
                if (input) input.click();
              }}
            >
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UserSolidIcon className="w-16 h-16 text-gray-300" />
                </div>
              )}
            </div>
          </div>
          <input
            type="file"
            id="profile-picture-upload"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setProfilePicture(reader.result as string);
                };
                reader.readAsDataURL(file);
              }
            }}
          />
        </div>
      </div>

      {/* Name Input */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          <UserSolidIcon className="inline w-4 h-4 mr-1" />
          {t?.nameLabel || 'Spa Name'} *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t?.namePlaceholder || 'Enter your spa name'}
          className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
          required
        />
      </div>

      {/* Description Input */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {t?.descriptionLabel || 'Description'} *
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t?.descriptionPlaceholder || 'Describe your spa services...'}
          rows={4}
          className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
          required
        />
      </div>

      {/* Contact Number */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          <PhoneIcon className="inline w-4 h-4 mr-1" />
          {t?.contactNumber || 'Contact Number'} *
        </label>
        <input
          type="tel"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          placeholder="+62 812 3456 7890"
          className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
          required
        />
      </div>

      {/* Owner WhatsApp */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {t?.ownerWhatsApp || 'Owner WhatsApp Number'} *
        </label>
        <input
          type="tel"
          value={ownerWhatsApp}
          onChange={(e) => setOwnerWhatsApp(e.target.value)}
          placeholder="+62 812 3456 7890"
          className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          This number will be used for booking confirmations and customer communications
        </p>
      </div>
    </div>
  );
};

export default ProfileSection;
