import { 
    therapistService, 
    placeService, 
    facialPlaceService,
    memberStatsService,
    subscriptionService 
} from '../../../../lib/appwriteService';

interface MemberData {
    $id: string;
    name: string;
    type: 'therapist' | 'massage_place' | 'facial_place';
    location: string;
    phone?: string;
    email?: string;
    profileImage?: string;
    images?: string[];
    status: 'active' | 'inactive' | 'pending';
    verified: boolean;
    visibleOnHomepage: boolean;
    $createdAt: string;
    stats: {
        clicksThisMonth: number;
        viewsThisMonth: number;
        bookingsThisMonth: number;
        revenue: number;
    };
    subscription: {
        activationDate: string;
        currentMonth: number;
        monthlyFee: number;
        nextPaymentDate: string;
        daysUntilDue: number;
        paymentHistory: any[];
        status: 'active' | 'pending' | 'overdue';
    };
}

// Calculate pricing based on month number
export const getPricingTier = (month: number): number => {
    if (month === 1) return 0; // Free first month
    if (month === 2) return 100000; // 100k IDR
    if (month === 3) return 135000; // 135k IDR
    if (month === 4) return 175000; // 175k IDR
    return 200000; // 200k IDR for month 5+
};

// Calculate subscription details from activation date
const calculateSubscription = (activationDate: string, currentMonth: number, nextPaymentDate: string) => {
    const activated = new Date(activationDate);
    const now = new Date();
    const nextPayment = new Date(nextPaymentDate);
    
    // Days until due
    const daysUntilDue = Math.ceil((nextPayment.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // Generate payment history
    const paymentHistory: any[] = [];
    for (let i = 1; i <= currentMonth; i++) {
        const monthDue = new Date(activated);
        monthDue.setMonth(activated.getMonth() + i);
        
        paymentHistory.push({
            month: i,
            amount: getPricingTier(i),
            paidDate: i < currentMonth ? monthDue.toISOString() : null,
            dueDate: monthDue.toISOString(),
            status: i < currentMonth ? 'paid' : (daysUntilDue < 0 ? 'overdue' : 'pending')
        });
    }
    
    return {
        activationDate,
        currentMonth,
        monthlyFee: getPricingTier(currentMonth),
        nextPaymentDate,
        daysUntilDue,
        paymentHistory,
        status: daysUntilDue < 0 ? 'overdue' as const : (daysUntilDue <= 7 ? 'pending' as const : 'active' as const)
    };
};

/**
 * Fetch all members with their stats and subscription data
 */
export const fetchAllMembersWithData = async (): Promise<MemberData[]> => {
    try {
        console.log('🔄 Fetching all members with stats and subscriptions...');
        
        // Fetch all member types
        const [therapists, massagePlaces, facialPlaces] = await Promise.all([
            therapistService.getAll(),
            placeService.getAll(),
            facialPlaceService.getAll()
        ]);

        console.log(`📊 Found: ${therapists.length} therapists, ${massagePlaces.length} massage places, ${facialPlaces.length} facial places`);

        // Get current month for stats
        const currentMonth = new Date().toISOString().slice(0, 7);

        // Process all members
        const allMembers: MemberData[] = [];

        // Process therapists
        for (const therapist of therapists) {
            const stats = await memberStatsService.getStatsByMonth(therapist.$id, currentMonth);
            const subscription = await subscriptionService.getSubscription(therapist.$id);

            allMembers.push({
                $id: therapist.$id,
                name: therapist.name || 'Unnamed Therapist',
                type: 'therapist',
                location: therapist.location || 'Unknown',
                phone: therapist.phone || therapist.contactNumber,
                email: therapist.email,
                profileImage: therapist.profileImage,
                images: therapist.images || [],
                status: therapist.status || 'inactive',
                verified: therapist.verified || false,
                visibleOnHomepage: therapist.visibleOnHomepage !== false,
                $createdAt: therapist.$createdAt,
                stats: {
                    clicksThisMonth: stats?.clicksCount || 0,
                    viewsThisMonth: stats?.viewsCount || 0,
                    bookingsThisMonth: stats?.bookingsCount || 0,
                    revenue: stats?.revenue || 0
                },
                subscription: subscription 
                    ? calculateSubscription(
                        subscription.activationDate,
                        subscription.currentMonth,
                        subscription.nextPaymentDate
                    )
                    : calculateSubscription(therapist.$createdAt, 1, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
            });
        }

        // Process massage places
        for (const place of massagePlaces) {
            const stats = await memberStatsService.getStatsByMonth(place.$id, currentMonth);
            const subscription = await subscriptionService.getSubscription(place.$id);

            allMembers.push({
                $id: place.$id,
                name: place.name || 'Unnamed Place',
                type: 'massage_place',
                location: place.location || 'Unknown',
                phone: place.phone || place.contactNumber,
                email: place.email,
                profileImage: place.profileImage || place.mainImage,
                images: place.images || [],
                status: place.status || 'inactive',
                verified: place.verified || false,
                visibleOnHomepage: place.visibleOnHomepage !== false,
                $createdAt: place.$createdAt,
                stats: {
                    clicksThisMonth: stats?.clicksCount || 0,
                    viewsThisMonth: stats?.viewsCount || 0,
                    bookingsThisMonth: stats?.bookingsCount || 0,
                    revenue: stats?.revenue || 0
                },
                subscription: subscription 
                    ? calculateSubscription(
                        subscription.activationDate,
                        subscription.currentMonth,
                        subscription.nextPaymentDate
                    )
                    : calculateSubscription(place.$createdAt, 1, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
            });
        }

        // Process facial places
        for (const place of facialPlaces) {
            const stats = await memberStatsService.getStatsByMonth(place.$id, currentMonth);
            const subscription = await subscriptionService.getSubscription(place.$id);

            allMembers.push({
                $id: place.$id,
                name: place.name || 'Unnamed Facial Place',
                type: 'facial_place',
                location: place.location || 'Unknown',
                phone: place.phone || place.contactNumber,
                email: place.email,
                profileImage: place.profileImage || place.mainImage,
                images: place.images || [],
                status: place.status || 'inactive',
                verified: place.verified || false,
                visibleOnHomepage: place.visibleOnHomepage !== false,
                $createdAt: place.$createdAt,
                stats: {
                    clicksThisMonth: stats?.clicksCount || 0,
                    viewsThisMonth: stats?.viewsCount || 0,
                    bookingsThisMonth: stats?.bookingsCount || 0,
                    revenue: stats?.revenue || 0
                },
                subscription: subscription 
                    ? calculateSubscription(
                        subscription.activationDate,
                        subscription.currentMonth,
                        subscription.nextPaymentDate
                    )
                    : calculateSubscription(place.$createdAt, 1, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
            });
        }

        console.log(`✅ Processed ${allMembers.length} total members with stats`);
        return allMembers;

    } catch (error) {
        console.error('❌ Error fetching members with data:', error);
        return [];
    }
};

/**
 * Update member verified status
 */
export const updateMemberVerified = async (
    memberId: string, 
    memberType: 'therapist' | 'massage_place' | 'facial_place',
    verified: boolean
): Promise<void> => {
    try {
        if (memberType === 'therapist') {
            await therapistService.update(memberId, { verified });
        } else if (memberType === 'massage_place') {
            await placeService.update(memberId, { verified });
        } else if (memberType === 'facial_place') {
            // TODO: Implement facialPlaceService.update method
            console.warn('Facial place update not yet implemented');
        }
    } catch (error) {
        console.error('Error updating member verified status:', error);
        throw error;
    }
};

/**
 * Update member homepage visibility
 */
export const updateMemberVisibility = async (
    memberId: string, 
    memberType: 'therapist' | 'massage_place' | 'facial_place',
    visibleOnHomepage: boolean
): Promise<void> => {
    try {
        if (memberType === 'therapist') {
            await therapistService.update(memberId, { visibleOnHomepage });
        } else if (memberType === 'massage_place') {
            await placeService.update(memberId, { visibleOnHomepage });
        } else if (memberType === 'facial_place') {
            // TODO: Implement facialPlaceService.update method
            console.warn('Facial place update not yet implemented');
        }
    } catch (error) {
        console.error('Error updating member visibility:', error);
        throw error;
    }
};

/**
 * Update member status
 */
export const updateMemberStatus = async (
    memberId: string, 
    memberType: 'therapist' | 'massage_place' | 'facial_place',
    status: 'active' | 'inactive'
): Promise<void> => {
    try {
        if (memberType === 'therapist') {
            await therapistService.update(memberId, { status });
        } else if (memberType === 'massage_place') {
            await placeService.update(memberId, { status });
        } else if (memberType === 'facial_place') {
            // TODO: Implement facialPlaceService.update method
            console.warn('Facial place update not yet implemented');
        }
    } catch (error) {
        console.error('Error updating member status:', error);
        throw error;
    }
};
