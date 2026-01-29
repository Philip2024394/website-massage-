import React from 'react';
import { Sparkles, Droplet, Package, Scissors, User, Hand, Flower2, Waves, Target, Dumbbell, Flame, Heart, Thermometer, Wind } from 'lucide-react';

/**
 * Map of additional services to their corresponding icons
 */
export const AMENITY_ICON_MAP: Record<string, React.ReactNode> = {
    'Facials': <Sparkles className="w-5 h-5 text-orange-500" />,
    'Body Scrubs': <Droplet className="w-5 h-5 text-orange-500" />,
    'Body Wraps': <Package className="w-5 h-5 text-orange-500" />,
    'Hair Salon': <Scissors className="w-5 h-5 text-orange-500" />,
    'Beautician': <User className="w-5 h-5 text-orange-500" />,
    'Acupressure': <Hand className="w-5 h-5 text-orange-500" />,
    'Reflexology': <Target className="w-5 h-5 text-orange-500" />,
    'Aromatherapy': <Flower2 className="w-5 h-5 text-orange-500" />,
    'Yoga & Pilates': <Dumbbell className="w-5 h-5 text-orange-500" />,
    'Cupping Therapy': <Waves className="w-5 h-5 text-orange-500" />,
    'Physical Therapy': <Heart className="w-5 h-5 text-orange-500" />,
    'Sauna': <Flame className="w-5 h-5 text-orange-500" />,
    'Jacuzzi': <Thermometer className="w-5 h-5 text-orange-500" />,
    'Steam Room': <Wind className="w-5 h-5 text-orange-500" />,
};

/**
 * Get icon for a specific amenity
 * @param amenity - The amenity name
 * @returns React node with the icon, or null if no icon is found
 */
export const getAmenityIcon = (amenity: string): React.ReactNode => {
    return AMENITY_ICON_MAP[amenity] || <Sparkles className="w-5 h-5 text-orange-500" />;
};
