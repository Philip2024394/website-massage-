/**
 * PROFILE IMAGES ONLY – for avatar, profile picture, and small thumbnails.
 * Do not use for card hero or main gallery. See placeMainImages.ts for main images.
 * Kept in a separate file to avoid confusion (e.g. with AI or devs mixing main vs profile).
 */
export const PLACE_PROFILE_IMAGES = {
    /** Massage place: profile/avatar image. */
    massage: 'https://ik.imagekit.io/7grri5v7d/massage%20profile%20iamge.png',
    /** Facial place: profile/avatar image. */
    facial: 'https://ik.imagekit.io/7grri5v7d/facial%202.png?updatedAt=1766551253328',
    /** Beauty place: profile/avatar image. */
    beauty: 'https://ik.imagekit.io/7grri5v7d/beautician%20room%201.png',
} as const;
