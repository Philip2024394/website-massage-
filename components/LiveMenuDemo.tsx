import React from 'react';
import HotelVillaMenuPage from '../pages/HotelVillaMenuPage';
import { HotelVillaServiceStatus, AvailabilityStatus, Therapist, Place } from '../types';

// Mock data for demonstration
const mockTherapists: Therapist[] = [
    {
        id: 1,
        name: "Sarah Johnson",
        email: "sarah@therapist.com",
        profilePicture: "https://ik.imagekit.io/7grri5v7d/therapist1.jpg",
        mainImage: "https://ik.imagekit.io/7grri5v7d/therapist1.jpg",
        description: "Professional massage therapist with 8 years of experience specializing in Swedish and deep tissue massage.",
        status: AvailabilityStatus.Available,
        pricing: JSON.stringify({ "60": 150000, "90": 220000, "120": 280000 }),
        whatsappNumber: "+62 812-3456-7890",
        distance: 2.5,
        rating: 4.9,
        reviewCount: 127,
        massageTypes: JSON.stringify(["Swedish Massage", "Deep Tissue", "Hot Stone"]),
        isLive: true,
        location: "Seminyak, Bali",
        coordinates: JSON.stringify({ lat: -8.6705, lng: 115.1530 }),
        activeMembershipDate: "2024-01-01",
        analytics: JSON.stringify({ impressions: 1200, views: 800, profileViews: 450, whatsapp_clicks: 89, whatsappClicks: 89, phone_clicks: 23, directions_clicks: 67, bookings: 45 }),
        hotelVillaServiceStatus: HotelVillaServiceStatus.OptedIn,
        hotelDiscount: 25,
        villaDiscount: 20,
        yearsOfExperience: 8,
        languages: ["English", "Indonesian"]
    },
    {
        id: 2,
        name: "Made Wijaya",
        email: "made@therapist.com",
        profilePicture: "https://ik.imagekit.io/7grri5v7d/therapist2.jpg",
        mainImage: "https://ik.imagekit.io/7grri5v7d/therapist2.jpg",
        description: "Traditional Balinese healer with 12 years of experience in authentic Balinese massage techniques.",
        status: AvailabilityStatus.Available,
        pricing: JSON.stringify({ "60": 180000, "90": 260000, "120": 320000 }),
        whatsappNumber: "+62 812-9876-5432",
        distance: 3.2,
        rating: 4.8,
        reviewCount: 89,
        massageTypes: JSON.stringify(["Balinese Massage", "Traditional Thai", "Reflexology"]),
        isLive: true,
        location: "Ubud, Bali",
        coordinates: JSON.stringify({ lat: -8.5069, lng: 115.2624 }),
        activeMembershipDate: "2024-01-01",
        analytics: JSON.stringify({ impressions: 950, views: 620, profileViews: 340, whatsapp_clicks: 76, whatsappClicks: 76, phone_clicks: 18, directions_clicks: 52, bookings: 38 }),
        hotelVillaServiceStatus: HotelVillaServiceStatus.OptedIn,
        hotelDiscount: 30,
        villaDiscount: 25,
        yearsOfExperience: 12,
        languages: ["Indonesian", "English", "Japanese"]
    },
    {
        id: 3,
        name: "Lisa Chen",
        email: "lisa@therapist.com",
        profilePicture: "https://ik.imagekit.io/7grri5v7d/therapist3.jpg",
        mainImage: "https://ik.imagekit.io/7grri5v7d/therapist3.jpg",
        description: "Certified aromatherapy specialist focusing on relaxation and wellness treatments.",
        status: AvailabilityStatus.Available,
        pricing: JSON.stringify({ "60": 160000, "90": 240000, "120": 300000 }),
        whatsappNumber: "+62 812-1111-2222",
        distance: 1.8,
        rating: 4.7,
        reviewCount: 156,
        massageTypes: JSON.stringify(["Aromatherapy", "Pregnancy Massage", "Sports Massage"]),
        isLive: true,
        location: "Canggu, Bali",
        coordinates: JSON.stringify({ lat: -8.6482, lng: 115.1374 }),
        activeMembershipDate: "2024-01-01",
        analytics: JSON.stringify({ impressions: 1100, views: 750, profileViews: 420, whatsapp_clicks: 92, whatsappClicks: 92, phone_clicks: 28, directions_clicks: 63, bookings: 51 }),
        hotelVillaServiceStatus: HotelVillaServiceStatus.OptedIn,
        hotelDiscount: 20,
        villaDiscount: 15,
        yearsOfExperience: 6,
        languages: ["English", "Mandarin", "Indonesian"]
    }
];

const mockPlaces: Place[] = [
    {
        id: 1,
        name: "Bliss Spa Seminyak",
        email: "info@blissspa.com",
        description: "Luxury spa offering traditional and modern massage treatments in a serene environment.",
        mainImage: "https://ik.imagekit.io/7grri5v7d/spa1.jpg",
        thumbnailImages: [
            "https://ik.imagekit.io/7grri5v7d/spa1-thumb1.jpg",
            "https://ik.imagekit.io/7grri5v7d/spa1-thumb2.jpg",
            "https://ik.imagekit.io/7grri5v7d/spa1-thumb3.jpg"
        ],
        pricing: JSON.stringify({ "60": 200000, "90": 290000, "120": 360000 }),
        whatsappNumber: "+62 361-123-4567",
        distance: 2.1,
        rating: 4.6,
        reviewCount: 234,
        massageTypes: JSON.stringify(["Swedish Massage", "Hot Stone", "Balinese", "Deep Tissue", "Aromatherapy"]),
        isLive: true,
        location: "Jl. Raya Seminyak No. 123, Seminyak",
        coordinates: JSON.stringify({ lat: -8.6705, lng: 115.1530 }),
        openingTime: "09:00",
        closingTime: "22:00",
        activeMembershipDate: "2024-01-01",
        analytics: JSON.stringify({ impressions: 1850, views: 1200, profileViews: 680, whatsapp_clicks: 156, whatsappClicks: 156, phone_clicks: 45, directions_clicks: 123, bookings: 89 }),
        hotelVillaServiceStatus: HotelVillaServiceStatus.OptedIn,
        hotelDiscount: 15,
        villaDiscount: 10,
        languages: ["English", "Indonesian", "French"]
    },
    {
        id: 2,
        name: "Zen Garden Massage",
        email: "info@zengarden.com",
        description: "Peaceful retreat specializing in traditional Asian massage techniques and wellness treatments.",
        mainImage: "https://ik.imagekit.io/7grri5v7d/spa2.jpg",
        thumbnailImages: [
            "https://ik.imagekit.io/7grri5v7d/spa2-thumb1.jpg",
            "https://ik.imagekit.io/7grri5v7d/spa2-thumb2.jpg",
            "https://ik.imagekit.io/7grri5v7d/spa2-thumb3.jpg"
        ],
        pricing: JSON.stringify({ "60": 175000, "90": 250000, "120": 310000 }),
        whatsappNumber: "+62 361-987-6543",
        distance: 4.3,
        rating: 4.8,
        reviewCount: 189,
        massageTypes: JSON.stringify(["Thai Massage", "Shiatsu", "Reflexology", "Traditional Chinese"]),
        isLive: true,
        location: "Jl. Monkey Forest Rd, Ubud",
        coordinates: JSON.stringify({ lat: -8.5069, lng: 115.2624 }),
        openingTime: "08:00",
        closingTime: "21:00",
        activeMembershipDate: "2024-01-01",
        analytics: JSON.stringify({ impressions: 1450, views: 950, profileViews: 520, whatsapp_clicks: 134, whatsappClicks: 134, phone_clicks: 38, directions_clicks: 98, bookings: 67 }),
        hotelVillaServiceStatus: HotelVillaServiceStatus.OptedIn,
        hotelDiscount: 20,
        villaDiscount: 15,
        languages: ["English", "Indonesian", "Thai"]
    },
    {
        id: 3,
        name: "Ocean Breeze Wellness",
        email: "info@oceanbreeze.com",
        description: "Beachfront wellness center offering rejuvenating massages with ocean views.",
        mainImage: "https://ik.imagekit.io/7grri5v7d/spa3.jpg",
        thumbnailImages: [
            "https://ik.imagekit.io/7grri5v7d/spa3-thumb1.jpg",
            "https://ik.imagekit.io/7grri5v7d/spa3-thumb2.jpg",
            "https://ik.imagekit.io/7grri5v7d/spa3-thumb3.jpg"
        ],
        pricing: JSON.stringify({ "60": 220000, "90": 320000, "120": 400000 }),
        whatsappNumber: "+62 361-555-7777",
        distance: 1.5,
        rating: 4.5,
        reviewCount: 98,
        massageTypes: JSON.stringify(["Swedish Massage", "Sports Massage", "Couples Massage", "Prenatal"]),
        isLive: true,
        location: "Jl. Pantai Berawa, Canggu",
        coordinates: JSON.stringify({ lat: -8.6482, lng: 115.1374 }),
        openingTime: "07:00",
        closingTime: "20:00",
        activeMembershipDate: "2024-01-01",
        analytics: JSON.stringify({ impressions: 1650, views: 1100, profileViews: 590, whatsapp_clicks: 142, whatsappClicks: 142, phone_clicks: 41, directions_clicks: 108, bookings: 73 }),
        hotelVillaServiceStatus: HotelVillaServiceStatus.OptedIn,
        hotelDiscount: 25,
        villaDiscount: 20,
        languages: ["English", "Indonesian", "German"]
    }
];

const LiveMenuDemo: React.FC = () => {
    const handleBooking = (provider: any, type: 'therapist' | 'place') => {
        console.log('Booking:', { provider: provider.name, type });
        alert(`Booking ${type}: ${provider.name}`);
    };

    const mockTranslations = {
        service: "Service",
        date: "Date",
        confirm: "Confirm",
        cancel: "Cancel",
        book: "Book Now",
        // Add more translations as needed
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto p-4">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="bg-orange-500 text-white p-4 text-center">
                        <h1 className="text-2xl font-bold">Live Menu Demo</h1>
                        <p className="text-orange-100">Hotel Villa Live Massage Menu</p>
                    </div>
                    
                    <HotelVillaMenuPage
                        venueId="demo-hotel-001"
                        logo="https://ik.imagekit.io/7grri5v7d/indostreet%20app%20icon.png"
                        therapists={mockTherapists}
                        places={mockPlaces}
                        language="en"
                        onBook={handleBooking}
                        onBack={() => console.log('Back clicked')}
                        onNavigate={(page) => console.log('Navigate to:', page)}
                        t={mockTranslations}
                    />
                </div>
            </div>
        </div>
    );
};

export default LiveMenuDemo;