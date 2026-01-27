export interface Message {
    $id: string;
    $createdAt: string;
    senderId: string;
    senderName: string;
    senderAvatar: string;
    content: string;
    message?: string;
    sentAt?: string;
    messageType: 'text' | 'system' | 'booking';
    isRead: boolean;
}

export interface ChatWindowProps {
    providerId: string;
    providerRole: 'therapist' | 'place';
    providerName: string;
    providerPhoto?: string;
    providerStatus?: string;
    providerRating?: number;
    pricing?: {
        duration60?: number;
        duration90?: number;
        duration120?: number;
        price60?: number;
        price90?: number;
        price120?: number;
    };
    discountPercentage?: number;
    discountActive?: boolean;
    bookingId?: string;
    chatRoomId?: string;
    customerName?: string;
    customerWhatsApp?: string;
    mode?: 'immediate' | 'scheduled';
    selectedService?: {
        name: string;
        duration: number;
        price: number;
    };
    isOpen: boolean;
    onClose: () => void;
}
