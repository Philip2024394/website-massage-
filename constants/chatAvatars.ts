// Enhanced Avatar System with Race and Gender Matching
export interface AvatarOption {
  id: number;
  imageUrl: string;
  label: string;
  gender: 'male' | 'female' | 'child';
  race: 'asian' | 'caucasian' | 'african' | 'mixed';
  ageGroup?: 'child' | 'young-adult' | 'adult' | 'senior';
}

// Male Avatars by Race
const MALE_AVATARS: AvatarOption[] = [
  { id: 1, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2017.png?updatedAt=1764960013042', label: 'Asian Male 1', gender: 'male', race: 'asian' },
  { id: 2, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2015.png?updatedAt=1764959950628', label: 'Asian Male 2', gender: 'male', race: 'asian' },
  { id: 3, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2013.png?updatedAt=1764959889596', label: 'Caucasian Male 1', gender: 'male', race: 'caucasian' },
  { id: 4, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2011.png?updatedAt=1764959828146', label: 'Caucasian Male 2', gender: 'male', race: 'caucasian' },
  { id: 5, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%203.png?updatedAt=1764959593146', label: 'African Male 1', gender: 'male', race: 'african' },
  { id: 6, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%208.png?updatedAt=1764959729553', label: 'African Male 2', gender: 'male', race: 'african' },
  { id: 7, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%201.png?updatedAt=1764959491012', label: 'Mixed Male 1', gender: 'male', race: 'mixed' },
];

// Female Avatars by Race
const FEMALE_AVATARS: AvatarOption[] = [
  { id: 11, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%207.png?updatedAt=1764959694505', label: 'Asian Female 1', gender: 'female', race: 'asian' },
  { id: 12, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%202.png?updatedAt=1764959549336', label: 'Asian Female 2', gender: 'female', race: 'asian' },
  { id: 13, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%204.png?updatedAt=1764959623724', label: 'Caucasian Female 1', gender: 'female', race: 'caucasian' },
  { id: 14, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2012.png?updatedAt=1764959860098', label: 'Caucasian Female 2', gender: 'female', race: 'caucasian' },
  { id: 15, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2010.png?updatedAt=1764959801858', label: 'African Female 1', gender: 'female', race: 'african' },
  { id: 16, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2016.png?updatedAt=1764959984734', label: 'African Female 2', gender: 'female', race: 'african' },
  { id: 17, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2014.png?updatedAt=1764959919170', label: 'Mixed Female 1', gender: 'female', race: 'mixed' },
];

// Children Avatars by Race
const CHILDREN_AVATARS: AvatarOption[] = [
  { id: 21, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%206.png?updatedAt=1764959663603', label: 'Asian Child 1', gender: 'child', race: 'asian', ageGroup: 'child' },
  { id: 22, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%206.png?updatedAt=1764959663603', label: 'Asian Child 2', gender: 'child', race: 'asian', ageGroup: 'child' },
  { id: 23, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%206.png?updatedAt=1764959663603', label: 'Caucasian Child 1', gender: 'child', race: 'caucasian', ageGroup: 'child' },
  { id: 24, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%206.png?updatedAt=1764959663603', label: 'Caucasian Child 2', gender: 'child', race: 'caucasian', ageGroup: 'child' },
  { id: 25, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%206.png?updatedAt=1764959663603', label: 'African Child 1', gender: 'child', race: 'african', ageGroup: 'child' },
  { id: 26, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%206.png?updatedAt=1764959663603', label: 'African Child 2', gender: 'child', race: 'african', ageGroup: 'child' },
];

// Combined Avatar Pool
export const AVATAR_OPTIONS: AvatarOption[] = [
  ...MALE_AVATARS,
  ...FEMALE_AVATARS,
  ...CHILDREN_AVATARS
];

// Legacy support for existing system
export const LEGACY_AVATAR_OPTIONS = [
    { id: 1, imageUrl: 'https://ik.imagekit.io/xyprobhyt/avatars/avatar1.jpg', label: 'Avatar 1' },
    { id: 2, imageUrl: 'https://ik.imagekit.io/xyprobhyt/avatars/avatar2.jpg', label: 'Avatar 2' },
    { id: 3, imageUrl: 'https://ik.imagekit.io/xyprobhyt/avatars/avatar3.jpg', label: 'Avatar 3' },
    { id: 4, imageUrl: 'https://ik.imagekit.io/xyprobhyt/avatars/avatar4.jpg', label: 'Avatar 4' },
    { id: 5, imageUrl: 'https://ik.imagekit.io/xyprobhyt/avatars/avatar5.jpg', label: 'Avatar 5' },
    { id: 6, imageUrl: 'https://ik.imagekit.io/xyprobhyt/avatars/avatar6.jpg', label: 'Avatar 6' },
    { id: 7, imageUrl: 'https://ik.imagekit.io/xyprobhyt/avatars/avatar7.jpg', label: 'Avatar 7' },
    { id: 8, imageUrl: 'https://ik.imagekit.io/xyprobhyt/avatars/avatar8.jpg', label: 'Avatar 8' },
    { id: 9, imageUrl: 'https://ik.imagekit.io/xyprobhyt/avatars/avatar9.jpg', label: 'Avatar 9' },
    { id: 10, imageUrl: 'https://ik.imagekit.io/xyprobhyt/avatars/avatar10.jpg', label: 'Avatar 10' },
    { id: 11, imageUrl: 'https://ik.imagekit.io/xyprobhyt/avatars/avatar11.jpg', label: 'Avatar 11' },
    { id: 12, imageUrl: 'https://ik.imagekit.io/xyprobhyt/avatars/avatar12.jpg', label: 'Avatar 12' },
    { id: 13, imageUrl: 'https://ik.imagekit.io/xyprobhyt/avatars/avatar13.jpg', label: 'Avatar 13' },
    { id: 14, imageUrl: 'https://ik.imagekit.io/xyprobhyt/avatars/avatar14.jpg', label: 'Avatar 14' },
    { id: 15, imageUrl: 'https://ik.imagekit.io/xyprobhyt/avatars/avatar15.jpg', label: 'Avatar 15' }
];

/**
 * Avatar Assignment Utilities
 * System automatically assigns random avatars without user selection
 */

/**
 * Auto-assign random avatar from all available options
 * @param userId - Optional user ID for consistent assignment
 * @returns Random avatar option
 */
export function getAutoAssignedAvatar(userId?: string): AvatarOption {
  // Combine all available avatars (male + female + children)
  const allAvatars = [...MALE_AVATARS, ...FEMALE_AVATARS, ...CHILDREN_AVATARS];
  
  if (userId) {
    // Use user ID to generate consistent random index (same user = same avatar)
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const randomIndex = hash % allAvatars.length;
    return allAvatars[randomIndex];
  } else {
    // Fully random selection
    const randomIndex = Math.floor(Math.random() * allAvatars.length);
    return allAvatars[randomIndex];
  }
}

/**
 * Get random avatar from specific gender pool
 * @param gender - Target gender (optional)
 * @returns Random avatar from specified gender or all avatars
 */
export function getRandomAvatarByGender(gender?: 'male' | 'female' | 'child'): AvatarOption {
  let pool: AvatarOption[];
  
  if (gender === 'male') {
    pool = MALE_AVATARS;
  } else if (gender === 'female') {
    pool = FEMALE_AVATARS;
  } else if (gender === 'child') {
    pool = CHILDREN_AVATARS;
  } else {
    // Random from all avatars
    pool = [...MALE_AVATARS, ...FEMALE_AVATARS, ...CHILDREN_AVATARS];
  }
  
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}
