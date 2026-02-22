/**
 * MAIN IMAGES ONLY – for place/card hero, gallery, and banner.
 * Do not use for profile/avatar. See placeProfileImages.ts for profile images.
 * Kept in a separate file to avoid confusion (e.g. with AI or devs mixing main vs profile).
 */
export const PLACE_MAIN_IMAGES = {
    /** Massage place: card hero and gallery (e.g. room/space). */
    massage: 'https://ik.imagekit.io/7grri5v7d/massage%20room%202.png',
    /** Facial place: card hero and gallery (e.g. clinic space). */
    facial: 'https://ik.imagekit.io/7grri5v7d/facial%202.png?updatedAt=1766551253328',
    /** Beauty place: card hero and gallery (e.g. salon space). */
    beauty: 'https://ik.imagekit.io/7grri5v7d/beautician%20room%201.png',
} as const;
