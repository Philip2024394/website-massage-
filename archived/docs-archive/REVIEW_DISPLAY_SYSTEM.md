# Review Display System - Implementation Complete

## Overview
The review display system shows 5 reviews at the bottom of each therapist's profile page (both regular and shared profiles). These reviews auto-update every 5 minutes from the mock review data generated for Yogyakarta therapists.

## Architecture

### 1. Review Storage & Generation
- **reviewService.ts**: Manages reviews in localStorage
  - Stores all reviews with key `massage_app_reviews`
  - Provides methods to add, retrieve, and filter reviews
  - Includes hardcoded `surtiningsihMockReviews` for initial data
  
- **autoReviewService.ts**: Generates new reviews every 5 minutes
  - Creates reviews with random names, ratings (80% 5-star), and comments
  - Automatically adds reviews to the 4 Yogyakarta therapists
  - Dispatches `reviewsUpdated` custom event when new reviews are added

- **reviewInitializationService.ts**: Creates initial review data
  - Generates rating (4.7-5.0) and review count (28-35) for new therapists
  - Called when therapist profile is initialized

### 2. Review Display Component
- **RotatingReviews.tsx**: Displays reviews with auto-refresh
  - Fetches reviews from local `reviewService`
  - Shows 5 reviews by default (configurable via `limit` prop)
  - Auto-refreshes every 5 minutes via `setInterval`
  - Listens for `reviewsUpdated` events from auto-review system
  - Supports filtering by:
    - Specific provider ID (therapist)
    - Location (Yogyakarta/Jogja variants)
  - Assigns avatars from pool of 18 avatar images
  - Displays review name, rating (stars), comment, and location

### 3. Integration Points

#### SharedTherapistProfile.tsx (Line ~290)
```tsx
<RotatingReviews 
  location={profile.location || profile.city}
  limit={5}
  providerId={therapistId}
  providerType="therapist"
/>
```

#### TherapistCard.tsx
- Displays rating badge with star count
- Shows review count from therapist data
- Auto-updated via reviewService initialization

## Data Flow

### For Individual Therapist Profiles
```
1. User opens therapist profile
2. RotatingReviews component loads
3. Calls reviewService.getReviewsForProvider(therapistId)
4. Filters reviews for that specific therapist
5. Displays 5 most recent reviews
6. Auto-refreshes every 5 minutes
7. Listens for new reviews from auto-review system
```

### For Showcase Profiles (First 5 Yogyakarta Therapists)
```
1. User views city page (e.g., Bali, Jakarta)
2. HomePage.tsx creates showcase profiles
3. Sets location to match viewing area
4. RotatingReviews component loads
5. If providerId exists: shows that therapist's reviews
6. If no providerId: shows general Yogyakarta reviews
7. Reviews display with dynamic location matching
8. Auto-refreshes every 5 minutes
```

## Review Generation System

### Mock Review Pool
- **15 Indonesian Names**: Andi, Budi, Sari, Dewi, etc.
- **10 Review Comments**: Professional, skilled, recommended, etc.
- **Rating Distribution**: 80% give 5 stars, 20% give 4 stars

### Auto-Generation Schedule
- Runs every 5 minutes (300,000ms)
- Generates 1 review per cycle for each Yogyakarta therapist
- Reviews include:
  - Random name from pool
  - Random rating (weighted to 5 stars)
  - Random comment
  - Therapist's location
  - Current timestamp

## Yogyakarta Therapist IDs
```javascript
const YOGYAKARTA_THERAPISTS = [
  '692467a3001f6f05aaa1', // Budi
  '69499239000c90bfd283', // ww
  '694a02cd0036089583db', // ww
  '694ed78f9574395fd7b9', // Wiwid
  '693cfadf003d16b9896a'  // Surtiningsih (featured)
];
```

## Review Display Features

### 1. Dynamic Line Clamping
- Reviews show 2-5 lines initially (varies per review)
- "Read more" / "Show less" button for longer reviews
- Smooth expansion/collapse animation

### 2. Visual Elements
- Avatar image (18 image pool)
- Reviewer name
- 5-star rating display
- Review text/comment
- Location badge (📍 Location)

### 3. Real-time Updates
- Listens for `reviewsUpdated` custom event
- Refreshes display immediately when new review added
- Background 5-minute rotation for variety
- Smooth loading states

## Methods Available

### reviewService
```typescript
// Get reviews for specific provider
getReviewsForProvider(providerId, providerType, limit?)

// Get Yogyakarta reviews (for showcase)
getYogyakartaReviews(limit?)

// Get recent reviews across all
getRecentReviews(limit?)

// Add new review
addReview(review)

// Initialize provider with reviews
initializeProvider(providerId, providerType, location)
```

### autoReviewService
```typescript
// Start auto-review generation
startAutoReviews(providerId, providerType, location)

// Stop auto-review generation
stopAutoReviews(providerId)

// Generate single review
generateRandomReview(providerId, providerType, location)
```

## Testing the System

### Verify Reviews Display
1. Navigate to any Yogyakarta therapist profile
2. Scroll to bottom of page
3. Should see "Customer Reviews" section
4. Should display 5 reviews with avatars, names, ratings
5. Each review should have location badge

### Verify Auto-Update
1. Open browser console
2. Navigate to therapist profile
3. Wait 5 minutes
4. Should see log: "🔄 Auto-rotating reviews..."
5. Review list should refresh with potentially new reviews

### Verify Showcase Profiles
1. Navigate to non-Yogyakarta city (e.g., Bali)
2. First 5 profiles should be Yogyakarta therapists
3. Status should show "busy"
4. Location should match city being viewed
5. Reviews should still display at bottom

## Status: ✅ COMPLETE

All features implemented and integrated:
- ✅ Review generation every 5 minutes
- ✅ Review display at bottom of profile pages
- ✅ Shows 5 reviews per page
- ✅ Auto-refresh functionality
- ✅ Showcase profile support
- ✅ Dynamic location matching
- ✅ Event-driven updates
- ✅ LocalStorage persistence
- ✅ Avatar assignment
- ✅ Rating display
- ✅ Read more/less functionality
