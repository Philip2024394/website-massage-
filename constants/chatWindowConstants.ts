// Avatar options for customer profile
export const AVATAR_OPTIONS = [
    { id: 1, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%201.png', label: 'Avatar 1' },
    { id: 2, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%202.png', label: 'Avatar 2' },
    { id: 3, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%203.png', label: 'Avatar 3' },
    { id: 4, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%204.png', label: 'Avatar 4' },
    { id: 5, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%206.png', label: 'Avatar 6' },
    { id: 6, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%207.png', label: 'Avatar 7' },
    { id: 7, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%208.png', label: 'Avatar 8' },
    { id: 8, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%209.png', label: 'Avatar 9' },
    { id: 9, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2010.png', label: 'Avatar 10' },
    { id: 10, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2011.png', label: 'Avatar 11' },
    { id: 11, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2012.png', label: 'Avatar 12' },
    { id: 12, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2013.png', label: 'Avatar 13' },
    { id: 13, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2014.png', label: 'Avatar 14' },
    { id: 14, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2015.png', label: 'Avatar 15' },
    { id: 15, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2016.png', label: 'Avatar 16' }
];

export interface Message {
    $id: string;
    $createdAt: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    content?: string;
    message?: string;
    sentAt?: string;
    messageType?: 'text' | 'system' | 'booking' | 'payment-card';
    metadata?: {
        paymentCard?: {
            bankName: string;
            accountHolderName: string;
            accountNumber: string;
        };
        depositProofUrl?: string;
    };
    isRead: boolean;
}

export interface ChatWindowProps {
    // Provider info
    providerId: string;
    providerRole: 'therapist' | 'place';
    providerName: string;
    providerPhoto?: string;
    providerStatus?: 'available' | 'busy' | 'offline';
    providerRating?: number;
    pricing?: { '60': number; '90': number; '120': number };
    discountPercentage?: number;
    discountActive?: boolean;
    
    // Booking details (for scheduled bookings)
    bookingId?: string;
    chatRoomId?: string;
    customerName?: string;
    customerWhatsApp?: string;
    
    // Booking mode
    mode?: 'immediate' | 'scheduled';
    
    // Selected service from price menu
    selectedService?: {
        name: string;
        duration: string;
        price: number;
    };
    
    // UI props
    isOpen: boolean;
    onClose: () => void;
}
