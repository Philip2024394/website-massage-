/**
 * useImageUpload Hook
 * Handles image upload logic, validation, and state management
 * Max size: 8KB (Facebook/Amazon standard)
 */

import { useState } from 'react';

interface UseImageUploadReturn {
  showImageRequirementModal: boolean;
  setShowImageRequirementModal: (show: boolean) => void;
  pendingImageUrl: string;
  setPendingImageUrl: (url: string) => void;
  handleAcceptImageRequirement: () => void;
  handleRejectImageRequirement: () => void;
  handleGalleryImageChange: (index: number, imageUrl: string) => void;
  handleGalleryCaptionChange: (index: number, caption: string) => void;
  handleGalleryDescriptionChange: (index: number, description: string) => void;
}

interface UseImageUploadProps {
  profilePicture: string;
  setProfilePicture: (url: string) => void;
  galleryImages: Array<{ imageUrl: string; caption: string; description: string }>;
  setGalleryImages: (images: Array<{ imageUrl: string; caption: string; description: string }>) => void;
}

export const useImageUpload = ({
  profilePicture: _profilePicture,
  setProfilePicture,
  galleryImages,
  setGalleryImages,
}: UseImageUploadProps): UseImageUploadReturn => {
  const [showImageRequirementModal, setShowImageRequirementModal] = useState(false);
  const [pendingImageUrl, setPendingImageUrl] = useState('');

  const handleAcceptImageRequirement = () => {
    if (pendingImageUrl) {
      setProfilePicture(pendingImageUrl);
      setPendingImageUrl('');
    }
    setShowImageRequirementModal(false);
  };

  const handleRejectImageRequirement = () => {
    setPendingImageUrl('');
    setShowImageRequirementModal(false);
  };

  const handleGalleryImageChange = (index: number, imageUrl: string) => {
    const newGallery = [...galleryImages];
    newGallery[index] = { ...newGallery[index], imageUrl };
    setGalleryImages(newGallery);
  };

  const handleGalleryCaptionChange = (index: number, caption: string) => {
    const newGallery = [...galleryImages];
    newGallery[index] = { ...newGallery[index], caption };
    setGalleryImages(newGallery);
  };

  const handleGalleryDescriptionChange = (index: number, description: string) => {
    const newGallery = [...galleryImages];
    newGallery[index] = { ...newGallery[index], description };
    setGalleryImages(newGallery);
  };

  return {
    showImageRequirementModal,
    setShowImageRequirementModal,
    pendingImageUrl,
    setPendingImageUrl,
    handleAcceptImageRequirement,
    handleRejectImageRequirement,
    handleGalleryImageChange,
    handleGalleryCaptionChange,
    handleGalleryDescriptionChange,
  };
};
