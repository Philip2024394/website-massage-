/**
 * Shared Profile Image Pool
 * Random images displayed on therapist shared profile pages
 */

export const SHARED_PROFILE_IMAGES = [
    'https://ik.imagekit.io/7grri5v7d/bali%20massage.png?updatedAt=1761590994932',
    'https://ik.imagekit.io/7grri5v7d/massage%20solo.png?updatedAt=1761593342541',
    'https://ik.imagekit.io/7grri5v7d/bali%20massage%20indonisea%20new%20job.png?updatedAt=1761591600248',
    'https://ik.imagekit.io/7grri5v7d/bali%20massage%20indonisea.png?updatedAt=1761591108161',
    'https://ik.imagekit.io/7grri5v7d/jungle%20massage.png?updatedAt=1761594798827',
    'https://ik.imagekit.io/7grri5v7d/massage%20villa%20service%20indonisea.png?updatedAt=1761583264188',
    'https://ik.imagekit.io/7grri5v7d/massage%20online.png?updatedAt=1761582970960',
    'https://ik.imagekit.io/7grri5v7d/massage%20jobs.png?updatedAt=1761571942696',
    'https://ik.imagekit.io/7grri5v7d/massage%20places%20indonisea.png?updatedAt=1761571657409',
    'https://ik.imagekit.io/7grri5v7d/hotel%20massage%20indoniseas.png?updatedAt=1761154913720',
    'https://ik.imagekit.io/7grri5v7d/hotel%20massage%20indonisea.png?updatedAt=1761154829609',
    'https://ik.imagekit.io/7grri5v7d/massage%20room.png?updatedAt=1760975249566',
    'https://ik.imagekit.io/7grri5v7d/massage%20hoter%20villa.png?updatedAt=1760965742264',
    'https://ik.imagekit.io/7grri5v7d/massage%20agents.png?updatedAt=1760968250776',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%2016.png?updatedAt=1760187700624',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%2010.png?updatedAt=1760187307232',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%209.png?updatedAt=1760187266868',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%205.png?updatedAt=1760187081702',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%203.png?updatedAt=1760186998015',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%202.png?updatedAt=1760186944882',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%201.png?updatedAt=1760186885261'
];

/**
 * Get a random image from the shared profile pool
 */
export const getRandomSharedProfileImage = (): string => {
    if (SHARED_PROFILE_IMAGES.length === 0) {
        // Fallback to a default placeholder
        return 'https://via.placeholder.com/400x300/f3f4f6/374151?text=Massage+Therapy';
    }
    
    const randomIndex = Math.floor(Math.random() * SHARED_PROFILE_IMAGES.length);
    return SHARED_PROFILE_IMAGES[randomIndex];
};

/**
 * Get multiple random images (no duplicates)
 */
export const getMultipleRandomSharedProfileImages = (count: number): string[] => {
    if (SHARED_PROFILE_IMAGES.length === 0) {
        return Array(count).fill('https://via.placeholder.com/400x300/f3f4f6/374151?text=Massage+Therapy');
    }
    
    const shuffled = [...SHARED_PROFILE_IMAGES].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
};