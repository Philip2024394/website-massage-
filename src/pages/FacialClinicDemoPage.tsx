import React from 'react';
import FacialClinicProfilePage from './FacialClinicProfilePage';

/**
 * Demo page showing the ultimate facial clinic profile
 * with example data
 */
const FacialClinicDemo: React.FC = () => {
    const demoClinic = {
        id: 'demo-clinic-1',
        name: 'Radiance Skin & Beauty Clinic',
        tagline: 'Your Journey to Radiant Skin Begins Here',
        description: `Welcome to Radiance Skin & Beauty Clinic, where we combine advanced skincare technology with expert aestheticians to deliver transformative facial treatments. With over 10 years of experience and 10,000+ satisfied clients, we are Indonesia's premier destination for professional facial and skin care services.

Our state-of-the-art facility features the latest equipment and techniques, ensuring you receive world-class treatments in a luxurious, relaxing environment. Every treatment is customized to your unique skin type and concerns, delivering visible results you can see and feel.`,
        
        heroImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&h=800&fit=crop',
        logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=200&fit=crop',
        
        location: 'Jl. Raya Seminyak No. 123, Bali',
        address: 'Jl. Raya Seminyak No. 123, Kuta, Badung, Bali 80361',
        phone: '+62 361 234567',
        whatsapp: '6281234567890',
        email: 'info@radianceclinic.com',
        website: 'https://radianceclinic.com',
        
        rating: 4.9,
        reviewCount: 2847,
        totalTreatments: 15000,
        yearsInBusiness: 10,
        
        certifications: [
            'ISO 9001:2015 Certified',
            'Ministry of Health Licensed',
            'International Aesthetic Association',
            'Certified Organic Products',
            'Dermatologist Approved',
            'Award Winner 2024'
        ],
        
        operatingHours: {
            weekdays: '09:00 - 21:00',
            weekend: '10:00 - 20:00'
        },
        
        treatments: [
            {
                id: 't1',
                name: 'Diamond Microdermabrasion',
                description: 'Advanced exfoliation treatment that removes dead skin cells and stimulates collagen production for brighter, smoother skin.',
                image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&h=600&fit=crop',
                prices: { min60: 350000, min90: 500000, min120: 650000 },
                category: 'exfoliation',
                popular: true
            },
            {
                id: 't2',
                name: 'Hydra Facial Deluxe',
                description: 'Deep cleansing, exfoliation, and hydration treatment that delivers instant glow and long-lasting results.',
                image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=600&fit=crop',
                prices: { min60: 450000, min90: 650000, min120: 850000 },
                category: 'hydration',
                popular: true,
                new: true
            },
            {
                id: 't3',
                name: 'Anti-Aging Collagen Boost',
                description: 'Revolutionary treatment combining LED therapy and collagen masks to reduce wrinkles and firm skin.',
                image: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&h=600&fit=crop',
                prices: { min60: 500000, min90: 750000, min120: 950000 },
                category: 'anti-aging',
                popular: true
            },
            {
                id: 't4',
                name: 'Acne Clear Treatment',
                description: 'Specialized treatment targeting acne, blemishes, and scarring with medical-grade ingredients.',
                image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&h=600&fit=crop',
                prices: { min60: 400000, min90: 550000, min120: 700000 },
                category: 'acne'
            },
            {
                id: 't5',
                name: 'Brightening Vitamin C',
                description: 'Illuminating treatment infused with high-potency Vitamin C to fade dark spots and even skin tone.',
                image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&h=600&fit=crop',
                prices: { min60: 380000, min90: 520000, min120: 680000 },
                category: 'brightening'
            },
            {
                id: 't6',
                name: 'Luxury Gold Facial',
                description: 'Premium treatment with 24K gold serum and massage for ultimate anti-aging and radiance.',
                image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&h=600&fit=crop',
                prices: { min60: 800000, min90: 1200000, min120: 1500000 },
                category: 'luxury',
                new: true
            },
            {
                id: 't7',
                name: 'Deep Pore Cleansing',
                description: 'Intensive extraction and purifying treatment for congested skin and enlarged pores.',
                image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&h=600&fit=crop',
                prices: { min60: 300000, min90: 420000, min120: 550000 },
                category: 'cleansing'
            },
            {
                id: 't8',
                name: 'Sensitive Skin Soothing',
                description: 'Gentle treatment specially formulated for sensitive and reactive skin types.',
                image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&h=600&fit=crop',
                prices: { min60: 350000, min90: 480000, min120: 620000 },
                category: 'sensitive'
            }
        ],
        
        team: [
            {
                id: 'tm1',
                name: 'Dr. Sarah Wijaya',
                role: 'Medical Director & Dermatologist',
                image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop',
                specialization: 'Advanced Skin Care & Laser Treatments',
                experience: '15+ years experience'
            },
            {
                id: 'tm2',
                name: 'Lisa Kusuma',
                role: 'Senior Aesthetician',
                image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
                specialization: 'Facial Treatments & Anti-Aging',
                experience: '10+ years experience'
            },
            {
                id: 'tm3',
                name: 'Maya Putri',
                role: 'Skin Care Specialist',
                image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
                specialization: 'Acne Treatment & Chemical Peels',
                experience: '8+ years experience'
            },
            {
                id: 'tm4',
                name: 'Dewi Lestari',
                role: 'Beauty Therapist',
                image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
                specialization: 'Hydration & Brightening Treatments',
                experience: '6+ years experience'
            }
        ],
        
        gallery: [
            {
                id: 'g1',
                url: 'https://images.unsplash.com/photo-1560750557-50b1c4aa19e5?w=800&h=600&fit=crop',
                caption: 'Luxurious Treatment Room',
                category: 'interior'
            },
            {
                id: 'g2',
                url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=600&fit=crop',
                caption: 'State-of-the-Art Equipment',
                category: 'interior'
            },
            {
                id: 'g3',
                url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=600&fit=crop',
                caption: 'Relaxing Spa Atmosphere',
                category: 'interior'
            },
            {
                id: 'g4',
                url: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&h=600&fit=crop',
                caption: 'Professional Facial Treatment',
                category: 'treatment'
            },
            {
                id: 'g5',
                url: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800&h=600&fit=crop',
                caption: 'Advanced Skin Analysis',
                category: 'treatment'
            },
            {
                id: 'g6',
                url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&h=600&fit=crop',
                caption: 'Premium Products Used',
                category: 'treatment'
            }
        ],
        
        amenities: [
            'Private Treatment Rooms',
            'Medical-Grade Equipment',
            'Organic Products',
            'Free WiFi',
            'Complimentary Refreshments',
            'Air Conditioned',
            'Sterile Environment',
            'Parking Available',
            'Professional Staff',
            'Online Booking',
            'Flexible Payment',
            'Post-Treatment Care'
        ],
        
        specialOffers: {
            title: 'New Year Special Package',
            description: 'Get our premium Diamond Microdermabrasion + Hydra Facial combo at an unbeatable price!',
            discount: 30,
            validUntil: 'December 31, 2025'
        }
    };

    const handleBook = (treatment: any) => {
        console.log('Booking treatment:', treatment);
        alert(`Booking confirmed for: ${treatment.name}\n\nWe'll contact you shortly to confirm your appointment!`);
    };

    const handleNavigate = (page: string) => {
        console.log('Navigate to:', page);
    };

    return (
        <FacialClinicProfilePage
            clinic={demoClinic}
            onBook={handleBook}
            onNavigate={handleNavigate}
            onBack={() => window.history.back()}
        />
    );
};

export default FacialClinicDemo;
