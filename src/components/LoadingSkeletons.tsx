import React from 'react';

// ============================================================================
// SKELETON LOADING COMPONENTS - Better UX than spinners
// ============================================================================

export const CardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
    <div className="flex items-start gap-4">
      {/* Avatar skeleton */}
      <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
      
      <div className="flex-1 space-y-3">
        {/* Name skeleton */}
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        
        {/* Rating skeleton */}
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-4 h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
        
        {/* Price skeleton */}
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
    
    {/* Button skeleton */}
    <div className="mt-4 h-10 bg-gray-200 rounded w-full"></div>
  </div>
);

export const BookingCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
    <div className="space-y-3">
      {/* Customer name */}
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      
      {/* Service details */}
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
      
      {/* Price */}
      <div className="h-5 bg-gray-200 rounded w-1/3"></div>
      
      {/* Buttons */}
      <div className="flex gap-2 pt-2">
        <div className="flex-1 h-9 bg-gray-200 rounded"></div>
        <div className="flex-1 h-9 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);

export const ListSkeleton = ({ count = 3 }) => (
  <div className="space-y-4">
    {[...Array(count)].map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

export const BookingListSkeleton = ({ count = 3 }) => (
  <div className="space-y-4">
    {[...Array(count)].map((_, i) => (
      <BookingCardSkeleton key={i} />
    ))}
  </div>
);

export const ChatLoadingSkeleton = () => (
  <div className="p-4 space-y-3 animate-pulse">
    {/* Message skeletons */}
    {[...Array(3)].map((_, i) => (
      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-xs rounded-lg p-3 ${
          i % 2 === 0 ? 'bg-gray-200' : 'bg-gray-100'
        }`}>
          <div className="h-3 bg-gray-300 rounded w-20 mb-1"></div>
          <div className="h-3 bg-gray-300 rounded w-16"></div>
        </div>
      </div>
    ))}
  </div>
);

export const InlineLoadingSkeleton = () => (
  <div className="flex items-center gap-2 animate-pulse">
    <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
    <div className="h-3 bg-gray-200 rounded w-16"></div>
  </div>
);