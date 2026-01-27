/**
 * Seed Review Generator
 * Generates deterministic, unique, SEO-optimized preview reviews for profiles
 * Reviews rotate UI-side only (no database writes) based on time buckets
 */

export interface SeedReview {
  id: string;
  profileId: string;
  text: string;
  rating: number;
  avatarUrl: string;
  city: string;
  userName: string;
  isSeed: true;
  createdAt: string;
}

// Avatar pool for consistent assignment
const AVATAR_POOL = [
  'https://ik.imagekit.io/7grri5v7d/avatar%201.png',
  'https://ik.imagekit.io/7grri5v7d/avatar%202.png',
  'https://ik.imagekit.io/7grri5v7d/avatar%203.png',
  'https://ik.imagekit.io/7grri5v7d/avatar%204.png',
  'https://ik.imagekit.io/7grri5v7d/avatar%206.png',
  'https://ik.imagekit.io/7grri5v7d/avatar%207.png',
  'https://ik.imagekit.io/7grri5v7d/avatar%208.png',
  'https://ik.imagekit.io/7grri5v7d/avatar%209.png',
  'https://ik.imagekit.io/7grri5v7d/avatar%2010.png',
  'https://ik.imagekit.io/7grri5v7d/avatar%2011.png',
  'https://ik.imagekit.io/7grri5v7d/avatar%2012.png',
  'https://ik.imagekit.io/7grri5v7d/avatar%2013.png',
  'https://ik.imagekit.io/7grri5v7d/avatar%2014.png',
  'https://ik.imagekit.io/7grri5v7d/avatar%2015.png',
  'https://ik.imagekit.io/7grri5v7d/avatar%2016.png',
  'https://ik.imagekit.io/7grri5v7d/avatar%2017.png',
  'https://ik.imagekit.io/7grri5v7d/avatar%2018.png'
];

// Review templates with varied lengths and SEO keywords
const REVIEW_TEMPLATES = [
  // Short reviews (1-2 sentences)
  {
    template: 'Excellent massage service! Very professional and relaxing experience in {city}.',
    rating: 5,
    length: 'short'
  },
  {
    template: 'Amazing experience! The therapist was skilled and attentive. Highly recommend!',
    rating: 5,
    length: 'short'
  },
  {
    template: 'Best massage in {city}! Will definitely come back for another session.',
    rating: 5,
    length: 'short'
  },
  {
    template: 'Great service and very relaxing atmosphere. Perfect for stress relief!',
    rating: 4,
    length: 'short'
  },
  
  // Medium reviews (3-4 sentences)
  {
    template: 'Outstanding massage therapy in {city}. The therapist really understood my needs and targeted all the problem areas. I felt so much better afterwards. The atmosphere was peaceful and clean.',
    rating: 5,
    length: 'medium'
  },
  {
    template: 'Very professional service from start to finish. The massage technique was excellent and I could feel my tension melting away. Great value for money in {city}. Will definitely return!',
    rating: 5,
    length: 'medium'
  },
  {
    template: 'Fantastic massage experience! The therapist was very knowledgeable about pressure points and muscle therapy. I had chronic back pain that improved significantly after just one session. Highly recommended for anyone in {city}!',
    rating: 5,
    length: 'medium'
  },
  {
    template: 'Good massage overall. The therapist was friendly and professional. The room was clean and comfortable. Only minor issue was the wait time, but the quality made up for it.',
    rating: 4,
    length: 'medium'
  },
  
  // Long reviews (5+ sentences)
  {
    template: 'Absolutely incredible massage experience in {city}! I came in with severe shoulder and neck pain from working at a computer all day. The therapist took time to understand my specific issues and customized the treatment accordingly. The technique was perfect - just the right amount of pressure. By the end of the session, I felt like a new person. The ambiance was relaxing with soft music and aromatherapy. Will definitely make this a regular part of my wellness routine!',
    rating: 5,
    length: 'long'
  },
  {
    template: 'I have been to many massage places in {city}, but this is by far the best. The therapist is extremely skilled and professional. They use traditional techniques combined with modern therapy methods. The treatment room is immaculate and has a very peaceful atmosphere. I particularly appreciated how they checked in about pressure levels throughout the session. My chronic pain has improved dramatically after multiple visits. Cannot recommend highly enough!',
    rating: 5,
    length: 'long'
  },
  {
    template: 'Wonderful massage therapy service. I was dealing with sports injury pain and the therapist really knew how to work on those specific areas. They explained what they were doing and gave me helpful advice for recovery. The facility is clean, well-maintained, and has a calming environment. Prices are very reasonable for the quality of service. This is now my go-to place for massage in {city}. Five stars all the way!',
    rating: 5,
    length: 'long'
  },
  {
    template: 'Great experience at this massage center. The staff was welcoming and professional from the moment I walked in. The therapist had excellent technique and really focused on my problem areas. The room had perfect lighting and temperature. I felt completely relaxed throughout the entire session. My only suggestion would be slightly longer appointment times, but overall a fantastic experience in {city}!',
    rating: 4,
    length: 'long'
  },
  
  // Additional variety
  {
    template: 'Perfect massage! The therapist listened to my concerns and provided exactly what I needed. Very skilled hands!',
    rating: 5,
    length: 'short'
  },
  {
    template: 'Incredible therapeutic massage in {city}. My back pain is gone! Professional service and clean facility.',
    rating: 5,
    length: 'short'
  },
  {
    template: 'Top-notch massage therapy. The therapist was knowledgeable and professional. I felt instant relief from my muscle tension. The environment was peaceful and welcoming. Definitely returning soon!',
    rating: 5,
    length: 'medium'
  },
  {
    template: 'Very satisfied with the massage service. The technique was effective and I felt much better afterwards. Good location in {city} and easy to book. Reasonable prices for quality service.',
    rating: 4,
    length: 'medium'
  }
];

// Reviewer names for variety
const REVIEWER_NAMES = [
  'Sarah Johnson', 'Michael Chen', 'Emma Williams', 'David Lee',
  'Sophie Martin', 'James Brown', 'Olivia Garcia', 'Daniel Rodriguez',
  'Isabella Martinez', 'Alexander Kim', 'Mia Anderson', 'Ethan Taylor',
  'Ava Thompson', 'Noah Wilson', 'Charlotte Davis', 'Liam Martinez',
  'Amelia White', 'Lucas Harris', 'Harper Clark', 'Mason Lewis',
  'Evelyn Walker', 'Logan Hall', 'Abigail Young', 'Benjamin King'
];

/**
 * Simple deterministic hash function
 * Used for consistent random-like selection based on seed
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Deterministic pseudo-random number generator
 * Returns consistent results for same seed
 */
function seededRandom(seed: number, index: number): number {
  const x = Math.sin(seed + index) * 10000;
  return x - Math.floor(x);
}

/**
 * Get current 5-minute time bucket
 * Used for rotating reviews every 5 minutes
 */
function getTimeBucket(): number {
  return Math.floor(Date.now() / (5 * 60 * 1000)); // 5-minute buckets
}

/**
 * Generate a deterministic shuffle of array
 * Same profileId + timeBucket always produces same order
 */
function deterministicShuffle<T>(array: T[], profileId: string, timeBucket: number): T[] {
  const arr = [...array];
  const seed = simpleHash(profileId + timeBucket.toString());
  
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed, i) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  
  return arr;
}

/**
 * Generate exactly 5 unique seed reviews for a profile
 * Reviews are deterministic based on profileId and rotate every 5 minutes
 */
export function generateSeedReviews(
  profileId: string,
  city: string = 'Yogyakarta',
  count: number = 5
): SeedReview[] {
  const timeBucket = getTimeBucket();
  const seed = simpleHash(profileId + timeBucket.toString());
  
  // Shuffle templates and names deterministically
  const shuffledTemplates = deterministicShuffle(REVIEW_TEMPLATES, profileId, timeBucket);
  const shuffledNames = deterministicShuffle(REVIEWER_NAMES, profileId, timeBucket);
  const shuffledAvatars = deterministicShuffle(AVATAR_POOL, profileId, timeBucket);
  
  const reviews: SeedReview[] = [];
  
  for (let i = 0; i < count; i++) {
    const template = shuffledTemplates[i % shuffledTemplates.length];
    const reviewerName = shuffledNames[i % shuffledNames.length];
    const avatarUrl = shuffledAvatars[i % shuffledAvatars.length];
    
    // Replace city placeholder with actual city
    const text = template.template.replace(/{city}/g, city);
    
    // Generate timestamp (vary within last 60 days)
    const daysAgo = Math.floor(seededRandom(seed, i * 100) * 60);
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
    
    reviews.push({
      id: `seed_${profileId}_${i}_${timeBucket}`,
      profileId,
      text,
      rating: template.rating,
      avatarUrl,
      city,
      userName: reviewerName,
      isSeed: true,
      createdAt
    });
  }
  
  return reviews;
}

/**
 * Get display reviews: Real reviews + seed reviews to fill up to 5
 * Real reviews always take priority
 */
export function getDisplayReviews(
  profileId: string,
  realReviews: any[],
  city: string = 'Yogyakarta'
): Array<any | SeedReview> {
  // If we have 5 or more real reviews, only show real reviews
  if (realReviews.length >= 5) {
    return realReviews.slice(0, 5);
  }
  
  // Generate seed reviews to fill the gap
  const seedReviewsNeeded = 5 - realReviews.length;
  const seedReviews = generateSeedReviews(profileId, city, seedReviewsNeeded);
  
  // Real reviews first, then seed reviews
  return [...realReviews, ...seedReviews];
}

/**
 * Check if a review is a seed review
 */
export function isSeedReview(review: any): review is SeedReview {
  return review?.isSeed === true || review?.id?.startsWith('seed_');
}
