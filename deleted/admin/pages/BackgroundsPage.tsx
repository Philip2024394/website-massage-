import React, { useState, useEffect } from 'react';
import { storageUtils } from '../../../shared/utils';

interface BackgroundImage {
  id: string;
  name: string;
  url: string;
  type: 'login' | 'landing';
  loginArea?: string;
  thumbnail?: string;
  isActive: boolean;
  uploadedAt: Date;
}

const BackgroundsPage: React.FC = () => {
  const [backgrounds, setBackgrounds] = useState<BackgroundImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const loginAreas = [
    { id: 'admin', name: 'Admin Login', color: 'bg-blue-500' },
    { id: 'agent', name: 'Agent Login', color: 'bg-green-500' },
    { id: 'client', name: 'Client Login', color: 'bg-purple-500' },
    { id: 'therapist', name: 'Therapist Login', color: 'bg-pink-500' },
    { id: 'place', name: 'Place Login', color: 'bg-yellow-500' },
    { id: 'hotel', name: 'Hotel Login', color: 'bg-indigo-500' },
    { id: 'villa', name: 'Villa Login', color: 'bg-red-500' },
    { id: 'landing', name: 'Landing Page', color: 'bg-orange-500' }
  ];

  useEffect(() => {
    // Load existing backgrounds from storage
    const savedBackgrounds = storageUtils.get('admin_backgrounds') || [];
    setBackgrounds(savedBackgrounds);
  }, []);

  const saveBackgrounds = (newBackgrounds: BackgroundImage[]) => {
    setBackgrounds(newBackgrounds);
    storageUtils.set('admin_backgrounds', newBackgrounds);
  };

  const handleFileUpload = async (file: File, areaId: string, areaName: string) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    try {
      // Create object URL for immediate preview
      const objectUrl = URL.createObjectURL(file);
      
      // In a real app, you would upload to a service like Cloudinary, AWS S3, etc.
      // For demo purposes, we'll use the object URL
      const newBackground: BackgroundImage = {
        id: Date.now().toString(),
        name: areaName,
        url: objectUrl,
        type: areaId === 'landing' ? 'landing' : 'login',
        loginArea: areaId === 'landing' ? undefined : areaId,
        thumbnail: objectUrl,
        isActive: true,
        uploadedAt: new Date()
      };

      // Deactivate previous background for this area
      const updatedBackgrounds = backgrounds.map(bg => 
        bg.loginArea === areaId || (bg.type === 'landing' && areaId === 'landing')
          ? { ...bg, isActive: false }
          : bg
      );

      // Add new background
      const finalBackgrounds = [...updatedBackgrounds, newBackground];
      saveBackgrounds(finalBackgrounds);

      // Apply background immediately
      applyBackground(newBackground);

      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const applyBackground = (background: BackgroundImage) => {
    // Store the background URL for immediate application
    if (background.type === 'landing') {
      storageUtils.set('landing_background', background.url);
    } else {
      storageUtils.set(`${background.loginArea}_background`, background.url);
    }
    
    // Trigger immediate update for components using useBackground hook
    window.dispatchEvent(new Event('backgroundUpdate'));
  };

  const handleUrlUpload = (url: string, areaId: string, areaName: string) => {
    if (!url.trim()) {
      alert('Please enter a valid URL');
      return;
    }

    const newBackground: BackgroundImage = {
      id: Date.now().toString(),
      name: areaName,
      url: url.trim(),
      type: areaId === 'landing' ? 'landing' : 'login',
      loginArea: areaId === 'landing' ? undefined : areaId,
      thumbnail: url.trim(),
      isActive: true,
      uploadedAt: new Date()
    };

    // Deactivate previous background for this area
    const updatedBackgrounds = backgrounds.map(bg => 
      bg.loginArea === areaId || (bg.type === 'landing' && areaId === 'landing')
        ? { ...bg, isActive: false }
        : bg
    );

    // Add new background
    const finalBackgrounds = [...updatedBackgrounds, newBackground];
    saveBackgrounds(finalBackgrounds);
    applyBackground(newBackground);
  };

  const setActiveBackground = (backgroundId: string) => {
    const updatedBackgrounds = backgrounds.map(bg => {
      const targetBg = backgrounds.find(b => b.id === backgroundId);
      if (!targetBg) return bg;

      // Deactivate others in the same area
      if (
        (bg.loginArea === targetBg.loginArea) ||
        (bg.type === 'landing' && targetBg.type === 'landing')
      ) {
        return { ...bg, isActive: bg.id === backgroundId };
      }
      return bg;
    });

    saveBackgrounds(updatedBackgrounds);
    
    const activeBg = updatedBackgrounds.find(bg => bg.id === backgroundId);
    if (activeBg) {
      applyBackground(activeBg);
    }
  };

  const deleteBackground = (backgroundId: string) => {
    if (confirm('Are you sure you want to delete this background?')) {
      const updatedBackgrounds = backgrounds.filter(bg => bg.id !== backgroundId);
      saveBackgrounds(updatedBackgrounds);
    }
  };

  const BackgroundCard: React.FC<{ area: any }> = ({ area }) => {
    const [showUpload, setShowUpload] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const activeBackground = backgrounds.find(bg => 
      bg.isActive && (
        (area.id === 'landing' && bg.type === 'landing') ||
        (area.id !== 'landing' && bg.loginArea === area.id)
      )
    );

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <div className={`w-4 h-4 rounded-full ${area.color} mr-3`}></div>
          <h3 className="text-lg font-semibold text-gray-800">{area.name}</h3>
        </div>

        {/* Current Background Preview */}
        {activeBackground ? (
          <div className="mb-4">
            <div className="relative rounded-lg overflow-hidden bg-gray-100 h-32">
              <img 
                src={activeBackground.thumbnail} 
                alt={`${area.name} background`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlN2ViIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                }}
              />
              <div className="absolute top-2 right-2">
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">Active</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Uploaded: {new Date(activeBackground.uploadedAt).toLocaleDateString()}
            </p>
          </div>
        ) : (
          <div className="mb-4">
            <div className="rounded-lg bg-gray-100 h-32 flex items-center justify-center">
              <span className="text-gray-500">No background set</span>
            </div>
          </div>
        )}

        {/* Upload Controls */}
        <div className="space-y-3">
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
          >
            {showUpload ? 'Hide Upload' : 'Change Background'}
          </button>

          {showUpload && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image File
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file, area.id, area.name);
                    }
                  }}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {/* URL Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or Enter Image URL
                </label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      handleUrlUpload(urlInput, area.id, area.name);
                      setUrlInput('');
                    }}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                  >
                    Set
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Previous Backgrounds */}
          {backgrounds.filter(bg => 
            (area.id === 'landing' && bg.type === 'landing') ||
            (area.id !== 'landing' && bg.loginArea === area.id)
          ).length > 1 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Previous Backgrounds</h4>
              <div className="grid grid-cols-3 gap-2">
                {backgrounds
                  .filter(bg => 
                    (area.id === 'landing' && bg.type === 'landing') ||
                    (area.id !== 'landing' && bg.loginArea === area.id)
                  )
                  .slice(0, 6)
                  .map((bg) => (
                    <div key={bg.id} className="relative">
                      <img
                        src={bg.thumbnail}
                        alt="Background option"
                        className={`w-full h-16 object-cover rounded cursor-pointer border-2 ${
                          bg.isActive ? 'border-green-500' : 'border-gray-200'
                        }`}
                        onClick={() => setActiveBackground(bg.id)}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OWEzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5OL0E8L3RleHQ+PC9zdmc+';
                        }}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteBackground(bg.id);
                        }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Background Management</h1>
          <p className="text-gray-600">
            Manage background images for all login pages and the landing page. 
            Changes will be applied immediately when users visit those pages.
          </p>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-800 font-medium">Uploading...</span>
              <span className="text-blue-600">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Background Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loginAreas.map((area) => (
            <BackgroundCard key={area.id} area={area} />
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Instructions</h3>
          <ul className="text-yellow-700 space-y-1 text-sm">
            <li>• Upload images or provide URLs for each login area</li>
            <li>• Recommended image size: 1920x1080 or higher for best quality</li>
            <li>• Supported formats: JPG, PNG, WebP</li>
            <li>• Changes are applied immediately and saved locally</li>
            <li>• Click on previous backgrounds to reactivate them</li>
            <li>• Use the × button to delete unused backgrounds</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BackgroundsPage;