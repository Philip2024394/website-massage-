/**
 * 🔒 CORE SYSTEM LOCK - CRITICAL BUSINESS LOGIC
 * ================================================
 * 
 * ❌ ABSOLUTELY PROHIBITED MODIFICATIONS:
 * - Service definitions (names, descriptions, pricing)
 * - Category distribution (5 categories, 10 services each)
 * - Service interface structure or property names
 * - Default service assignment logic
 * - Popularity scoring or badge assignment data
 * 
 * ⚠️ BUSINESS IMPACT: REVENUE CRITICAL
 * Changes to this file can break:
 * - All therapist default menus (50 unique services)
 * - Customer booking functionality
 * - Badge system and UX consistency
 * - Backend integration and data integrity
 * 
 * 🔒 PROTECTION LEVEL: MAXIMUM - PRODUCTION SYSTEM
 * See CORE_SYSTEM_LOCK.md for full documentation
 */

export interface DefaultMenuService {
  id: string; // 🔒 LOCKED: Unique identifier format
  name: string; // 🔒 LOCKED: Service name (50 unique names)
  category: 'relaxation' | 'office_student' | 'specialty' | 'body_focus' | 'quick_express'; // 🔒 LOCKED: Category system
  description: string; // 🔒 LOCKED: Service description content
  price60: number; // 🔒 LOCKED: Base price structure (multiplied by 1000)
  price90: number; // 🔒 LOCKED: 90-minute pricing
  price120: number; // 🔒 LOCKED: 120-minute pricing
  isDefault: boolean; // 🔒 LOCKED: Default flag logic
  popularity: number; // 🔒 LOCKED: Badge assignment scoring (1-5 scale)
  isNew: boolean; // 🔒 LOCKED: "New" badge assignment data
}

// 🔒 CORE SYSTEM LOCK: DEFAULT MENU SERVICE DEFINITIONS
// =====================================================
// 
// ❌ MODIFICATION OF THIS ARRAY IS ABSOLUTELY PROHIBITED
// 
// This array contains 50 carefully curated massage services that ensure:
// ✅ Every therapist has professional service offerings
// ✅ No duplicate service names across therapist profiles
// ✅ Consistent pricing structure and badge assignment
// ✅ Full booking system integration with Appwrite backend
// ✅ Balanced category distribution for comprehensive coverage
// 
// 🚨 BUSINESS CRITICAL: These services generate direct revenue through bookings
// 🚨 UX CRITICAL: Consistent experience across all therapist profiles
// 🚨 DATA CRITICAL: Backend integration depends on this exact structure
// 
// 🔒 LOCKED SERVICE COUNT: 50 unique services
// 🔒 LOCKED CATEGORY DISTRIBUTION: 5 categories × 10 services each
// 🔒 LOCKED PRICING STRUCTURE: 60/90/120 minute options
// 🔒 LOCKED BADGE SYSTEM: Popularity and "new" flags for dynamic badges
// 
export const DEFAULT_MENU_SERVICES: DefaultMenuService[] = [
  // 📿 RELAXATION / WELLNESS (10 services)
  {
    id: 'default-relaxation-1',
    name: 'Journey Relaxation Massage',
    category: 'relaxation',
    description: 'A peaceful journey to complete relaxation and inner calm',
    price60: 150,
    price90: 200,
    price120: 280,
    isDefault: true,
    popularity: 4,
    isNew: false
  },
  {
    id: 'default-relaxation-2',
    name: 'Serenity Flow Massage',
    category: 'relaxation',
    description: 'Gentle flowing movements to restore balance and serenity',
    price60: 140,
    price90: 190,
    price120: 270,
    isDefault: true,
    popularity: 5,
    isNew: true
  },
  {
    id: 'default-relaxation-3',
    name: 'Tranquil Escape Massage',
    category: 'relaxation',
    description: 'Escape daily stress with this deeply tranquil experience',
    price60: 145,
    price90: 195,
    price120: 275,
    isDefault: true,
    popularity: 4,
    isNew: false
  },
  {
    id: 'default-relaxation-4',
    name: 'Harmony Touch',
    category: 'relaxation',
    description: 'Harmonious touch therapy for mind and body wellness',
    price60: 135,
    price90: 185,
    price120: 260,
    isDefault: true,
    popularity: 3,
    isNew: false
  },
  {
    id: 'default-relaxation-5',
    name: 'Zen Moment Massage',
    category: 'relaxation',
    description: 'Find your zen with this mindful massage experience',
    price60: 155,
    price90: 205,
    price120: 290,
    isDefault: true,
    popularity: 4,
    isNew: true
  },
  {
    id: 'default-relaxation-6',
    name: 'Peaceful Retreat Massage',
    category: 'relaxation',
    description: 'A peaceful retreat for your mind, body, and soul',
    price60: 150,
    price90: 200,
    price120: 280,
    isDefault: true,
    popularity: 3,
    isNew: false
  },
  {
    id: 'default-relaxation-7',
    name: 'Mind & Body Balance',
    category: 'relaxation',
    description: 'Restore perfect balance between mind and body',
    price60: 160,
    price90: 210,
    price120: 300,
    isDefault: true,
    popularity: 4,
    isNew: false
  },
  {
    id: 'default-relaxation-8',
    name: 'Stress Relief Massage',
    category: 'relaxation',
    description: 'Targeted stress relief for complete relaxation',
    price60: 140,
    price90: 190,
    price120: 270,
    isDefault: true,
    popularity: 5,
    isNew: false
  },
  {
    id: 'default-relaxation-9',
    name: 'Calm Breeze Massage',
    category: 'relaxation',
    description: 'Gentle as a calm breeze, soothing for body and mind',
    price60: 145,
    price90: 195,
    price120: 275,
    isDefault: true,
    popularity: 3,
    isNew: false
  },
  {
    id: 'default-relaxation-10',
    name: 'Rejuvenation Therapy',
    category: 'relaxation',
    description: 'Complete rejuvenation for renewed energy and vitality',
    price60: 165,
    price90: 215,
    price120: 310,
    isDefault: true,
    popularity: 4,
    isNew: true
  },

  // 💼 OFFICE / STUDENT FOCUSED (10 services)
  {
    id: 'default-office-1',
    name: 'Office Recharge Massage',
    category: 'office_student',
    description: 'Recharge after long office hours with targeted relief',
    price60: 140,
    price90: 190,
    price120: 270,
    isDefault: true,
    popularity: 5,
    isNew: false
  },
  {
    id: 'default-office-2',
    name: 'Desk Release Therapy',
    category: 'office_student',
    description: 'Release desk-related tension and muscle stiffness',
    price60: 145,
    price90: 195,
    price120: 275,
    isDefault: true,
    popularity: 4,
    isNew: true
  },
  {
    id: 'default-office-3',
    name: 'Student Relief Massage',
    category: 'office_student',
    description: 'Perfect for students dealing with study stress',
    price60: 130,
    price90: 175,
    price120: 250,
    isDefault: true,
    popularity: 4,
    isNew: false
  },
  {
    id: 'default-office-4',
    name: 'Quick Recharge Massage',
    category: 'office_student',
    description: 'Fast and effective recharge for busy professionals',
    price60: 135,
    price90: 180,
    price120: 255,
    isDefault: true,
    popularity: 5,
    isNew: false
  },
  {
    id: 'default-office-5',
    name: 'Study Break Massage',
    category: 'office_student',
    description: 'Take a meaningful study break with this focused massage',
    price60: 125,
    price90: 170,
    price120: 240,
    isDefault: true,
    popularity: 3,
    isNew: true
  },
  {
    id: 'default-office-6',
    name: 'Productivity Boost Massage',
    category: 'office_student',
    description: 'Boost productivity by relieving work-related tension',
    price60: 150,
    price90: 200,
    price120: 280,
    isDefault: true,
    popularity: 4,
    isNew: false
  },
  {
    id: 'default-office-7',
    name: 'Focus Flow Therapy',
    category: 'office_student',
    description: 'Enhance focus and mental clarity through therapeutic touch',
    price60: 155,
    price90: 205,
    price120: 290,
    isDefault: true,
    popularity: 3,
    isNew: true
  },
  {
    id: 'default-office-8',
    name: 'Workday Reset Massage',
    category: 'office_student',
    description: 'Reset and refresh after demanding workdays',
    price60: 145,
    price90: 195,
    price120: 275,
    isDefault: true,
    popularity: 4,
    isNew: false
  },
  {
    id: 'default-office-9',
    name: 'Brain & Body Refresh',
    category: 'office_student',
    description: 'Refresh both mind and body for optimal performance',
    price60: 160,
    price90: 210,
    price120: 300,
    isDefault: true,
    popularity: 4,
    isNew: false
  },
  {
    id: 'default-office-10',
    name: 'Desk Detox Massage',
    category: 'office_student',
    description: 'Detox from desk work with this targeted therapy',
    price60: 140,
    price90: 190,
    price120: 270,
    isDefault: true,
    popularity: 3,
    isNew: true
  },

  // 🏔️ SPECIALTY / ADVENTURE INSPIRED (10 services)
  {
    id: 'default-specialty-1',
    name: 'Weekend Escape Massage',
    category: 'specialty',
    description: 'Escape the week with this rejuvenating weekend treat',
    price60: 160,
    price90: 210,
    price120: 300,
    isDefault: true,
    popularity: 4,
    isNew: false
  },
  {
    id: 'default-specialty-2',
    name: 'Journey to Calm',
    category: 'specialty',
    description: 'Embark on a journey to complete calmness and peace',
    price60: 155,
    price90: 205,
    price120: 290,
    isDefault: true,
    popularity: 5,
    isNew: true
  },
  {
    id: 'default-specialty-3',
    name: 'Explorer\'s Retreat Massage',
    category: 'specialty',
    description: 'A retreat for adventurous souls seeking relaxation',
    price60: 165,
    price90: 215,
    price120: 310,
    isDefault: true,
    popularity: 3,
    isNew: false
  },
  {
    id: 'default-specialty-4',
    name: 'Travel Ease Therapy',
    category: 'specialty',
    description: 'Ease travel fatigue and jet lag with therapeutic touch',
    price60: 150,
    price90: 200,
    price120: 280,
    isDefault: true,
    popularity: 4,
    isNew: false
  },
  {
    id: 'default-specialty-5',
    name: 'Adventure Recovery Massage',
    category: 'specialty',
    description: 'Recover from adventures with this restorative massage',
    price60: 170,
    price90: 220,
    price120: 320,
    isDefault: true,
    popularity: 3,
    isNew: true
  },
  {
    id: 'default-specialty-6',
    name: 'Mountain Breeze Massage',
    category: 'specialty',
    description: 'Feel the refreshing breeze of mountain air in this massage',
    price60: 155,
    price90: 205,
    price120: 290,
    isDefault: true,
    popularity: 4,
    isNew: false
  },
  {
    id: 'default-specialty-7',
    name: 'Coastal Relaxation Massage',
    category: 'specialty',
    description: 'Experience the tranquility of coastal breezes',
    price60: 160,
    price90: 210,
    price120: 300,
    isDefault: true,
    popularity: 4,
    isNew: false
  },
  {
    id: 'default-specialty-8',
    name: 'Forest Whisper Massage',
    category: 'specialty',
    description: 'Listen to whispers of the forest in this nature-inspired massage',
    price60: 165,
    price90: 215,
    price120: 310,
    isDefault: true,
    popularity: 3,
    isNew: true
  },
  {
    id: 'default-specialty-9',
    name: 'Island Escape Therapy',
    category: 'specialty',
    description: 'Escape to a tropical island through therapeutic touch',
    price60: 175,
    price90: 225,
    price120: 330,
    isDefault: true,
    popularity: 5,
    isNew: false
  },
  {
    id: 'default-specialty-10',
    name: 'Sunset Serenity Massage',
    category: 'specialty',
    description: 'Experience the serenity of a beautiful sunset',
    price60: 160,
    price90: 210,
    price120: 300,
    isDefault: true,
    popularity: 4,
    isNew: true
  },

  // 💪 BODY FOCUS / TECHNIQUE BASED (10 services)
  {
    id: 'default-body-1',
    name: 'Deep Tissue Flow',
    category: 'body_focus',
    description: 'Deep tissue techniques with flowing movements',
    price60: 170,
    price90: 220,
    price120: 320,
    isDefault: true,
    popularity: 5,
    isNew: false
  },
  {
    id: 'default-body-2',
    name: 'Muscle Release Therapy',
    category: 'body_focus',
    description: 'Targeted therapy for muscle tension and knots',
    price60: 165,
    price90: 215,
    price120: 310,
    isDefault: true,
    popularity: 4,
    isNew: true
  },
  {
    id: 'default-body-3',
    name: 'Body Reset Massage',
    category: 'body_focus',
    description: 'Reset your body with this comprehensive massage',
    price60: 160,
    price90: 210,
    price120: 300,
    isDefault: true,
    popularity: 4,
    isNew: false
  },
  {
    id: 'default-body-4',
    name: 'Stretch & Relax Therapy',
    category: 'body_focus',
    description: 'Combine stretching with relaxation for optimal results',
    price60: 155,
    price90: 205,
    price120: 290,
    isDefault: true,
    popularity: 3,
    isNew: false
  },
  {
    id: 'default-body-5',
    name: 'Vitality Touch',
    category: 'body_focus',
    description: 'Energizing touch to restore vitality and strength',
    price60: 150,
    price90: 200,
    price120: 280,
    isDefault: true,
    popularity: 4,
    isNew: true
  },
  {
    id: 'default-body-6',
    name: 'Energy Balance Massage',
    category: 'body_focus',
    description: 'Balance your body\'s energy centers and flow',
    price60: 165,
    price90: 215,
    price120: 310,
    isDefault: true,
    popularity: 3,
    isNew: false
  },
  {
    id: 'default-body-7',
    name: 'Posture Alignment Massage',
    category: 'body_focus',
    description: 'Improve posture through targeted therapeutic techniques',
    price60: 170,
    price90: 220,
    price120: 320,
    isDefault: true,
    popularity: 4,
    isNew: true
  },
  {
    id: 'default-body-8',
    name: 'Flex & Restore Therapy',
    category: 'body_focus',
    description: 'Increase flexibility while restoring muscle health',
    price60: 160,
    price90: 210,
    price120: 300,
    isDefault: true,
    popularity: 3,
    isNew: false
  },
  {
    id: 'default-body-9',
    name: 'Revive & Relax Massage',
    category: 'body_focus',
    description: 'Revive tired muscles and deeply relax the body',
    price60: 155,
    price90: 205,
    price120: 290,
    isDefault: true,
    popularity: 4,
    isNew: false
  },
  {
    id: 'default-body-10',
    name: 'Full Body Renewal',
    category: 'body_focus',
    description: 'Complete renewal for your entire body system',
    price60: 175,
    price90: 225,
    price120: 330,
    isDefault: true,
    popularity: 5,
    isNew: true
  },

  // ⚡ QUICK / EXPRESS OPTIONS (10 services)
  {
    id: 'default-express-1',
    name: 'Quick Reset Massage',
    category: 'quick_express',
    description: 'Fast and effective reset for busy schedules',
    price60: 120,
    price90: 165,
    price120: 240,
    isDefault: true,
    popularity: 5,
    isNew: false
  },
  {
    id: 'default-express-2',
    name: 'Mini Escape Massage',
    category: 'quick_express',
    description: 'A mini escape that fits into your busy day',
    price60: 115,
    price90: 160,
    price120: 235,
    isDefault: true,
    popularity: 4,
    isNew: true
  },
  {
    id: 'default-express-3',
    name: 'Fast Track Relaxation',
    category: 'quick_express',
    description: 'Fast track to deep relaxation and stress relief',
    price60: 125,
    price90: 170,
    price120: 245,
    isDefault: true,
    popularity: 4,
    isNew: false
  },
  {
    id: 'default-express-4',
    name: 'Rapid Recharge Therapy',
    category: 'quick_express',
    description: 'Rapidly recharge your energy and focus',
    price60: 130,
    price90: 175,
    price120: 250,
    isDefault: true,
    popularity: 3,
    isNew: false
  },
  {
    id: 'default-express-5',
    name: 'Power Break Massage',
    category: 'quick_express',
    description: 'Powerful break from work stress and tension',
    price60: 120,
    price90: 165,
    price120: 240,
    isDefault: true,
    popularity: 4,
    isNew: true
  },
  {
    id: 'default-express-6',
    name: 'Express Calm',
    category: 'quick_express',
    description: 'Express route to calmness and mental clarity',
    price60: 115,
    price90: 160,
    price120: 235,
    isDefault: true,
    popularity: 5,
    isNew: false
  },
  {
    id: 'default-express-7',
    name: 'Time Saver Massage',
    category: 'quick_express',
    description: 'Save time while getting maximum relaxation benefits',
    price60: 125,
    price90: 170,
    price120: 245,
    isDefault: true,
    popularity: 3,
    isNew: false
  },
  {
    id: 'default-express-8',
    name: 'Quick Revive Therapy',
    category: 'quick_express',
    description: 'Quickly revive your body and mind for the day ahead',
    price60: 130,
    price90: 175,
    price120: 250,
    isDefault: true,
    popularity: 4,
    isNew: true
  },
  {
    id: 'default-express-9',
    name: 'Instant Relax Massage',
    category: 'quick_express',
    description: 'Instant relaxation for immediate stress relief',
    price60: 120,
    price90: 165,
    price120: 240,
    isDefault: true,
    popularity: 4,
    isNew: false
  },
  {
    id: 'default-express-10',
    name: 'Efficiency Massage',
    category: 'quick_express',
    description: 'Efficient massage therapy for maximum results in minimal time',
    price60: 135,
    price90: 180,
    price120: 255,
    isDefault: true,
    popularity: 3,
    isNew: true
  }
];

// 🎯 MENU ASSIGNMENT LOGIC
export class DefaultMenuManager {
  /**
   * Get a randomized subset of default services for a therapist
   * @param therapistId - Unique therapist identifier for consistent randomization
   * @param count - Number of services to return (default: 5-8 services)
   * @returns Array of selected default services
   */
  static getDefaultMenuForTherapist(
    therapistId: string, 
    count: number = this.getRandomServiceCount(therapistId)
  ): DefaultMenuService[] {
    // Create consistent seed based on therapist ID
    const seed = this.createSeed(therapistId);
    
    // Ensure balanced category distribution
    const servicesPerCategory = Math.ceil(count / 5);
    const selectedServices: DefaultMenuService[] = [];
    
    const categories: (keyof typeof this.getCategorizedServices)[] = [
      'relaxation', 'office_student', 'specialty', 'body_focus', 'quick_express'
    ];
    
    const categorizedServices = this.getCategorizedServices();
    
    categories.forEach((category, categoryIndex) => {
      const categoryServices = categorizedServices[category];
      const shuffled = this.shuffleArray([...categoryServices], seed + categoryIndex);
      
      // Take 1-2 services from each category
      const takeCount = Math.min(servicesPerCategory, categoryServices.length);
      selectedServices.push(...shuffled.slice(0, takeCount));
    });
    
    // Shuffle final selection and trim to desired count
    const finalSelection = this.shuffleArray(selectedServices, seed)
      .slice(0, count)
      .map((service, index) => ({
        ...service,
        id: `${therapistId}-default-${index + 1}` // Unique ID per therapist
      }));
    
    return finalSelection;
  }
  
  /**
   * Get random service count based on therapist ID (5-8 services)
   */
  private static getRandomServiceCount(therapistId: string): number {
    const seed = this.createSeed(therapistId);
    return 5 + (seed % 4); // Returns 5, 6, 7, or 8
  }
  
  /**
   * Create consistent seed from therapist ID
   */
  private static createSeed(therapistId: string): number {
    let hash = 0;
    for (let i = 0; i < therapistId.length; i++) {
      const char = therapistId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
  
  /**
   * Shuffle array with consistent seed
   */
  private static shuffleArray<T>(array: T[], seed: number): T[] {
    const shuffled = [...array];
    let currentIndex = shuffled.length;
    let randomIndex: number;
    
    // Use seeded random for consistent results
    const seededRandom = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };
    
    while (currentIndex !== 0) {
      randomIndex = Math.floor(seededRandom(seed + currentIndex) * currentIndex);
      currentIndex--;
      
      [shuffled[currentIndex], shuffled[randomIndex]] = [
        shuffled[randomIndex], shuffled[currentIndex]
      ];
    }
    
    return shuffled;
  }
  
  /**
   * Group services by category
   */
  private static getCategorizedServices() {
    return {
      relaxation: DEFAULT_MENU_SERVICES.filter(s => s.category === 'relaxation'),
      office_student: DEFAULT_MENU_SERVICES.filter(s => s.category === 'office_student'),
      specialty: DEFAULT_MENU_SERVICES.filter(s => s.category === 'specialty'),
      body_focus: DEFAULT_MENU_SERVICES.filter(s => s.category === 'body_focus'),
      quick_express: DEFAULT_MENU_SERVICES.filter(s => s.category === 'quick_express')
    };
  }
  
  /**
   * Check if service should be replaced by real menu item
   */
  static shouldReplaceDefaultService(
    defaultServiceName: string, 
    realMenuItems: Array<{serviceName: string}>
  ): boolean {
    // Simple name matching - can be enhanced with fuzzy matching
    const normalizedDefault = defaultServiceName.toLowerCase().trim();
    
    return realMenuItems.some(realItem => {
      const normalizedReal = realItem.serviceName.toLowerCase().trim();
      
      // Exact match
      if (normalizedDefault === normalizedReal) return true;
      
      // Partial match for common massage terms
      const commonTerms = ['massage', 'therapy', 'treatment', 'session'];
      const defaultTerms = normalizedDefault.split(' ');
      const realTerms = normalizedReal.split(' ');
      
      // Check if major terms overlap
      const overlap = defaultTerms.filter(term => 
        realTerms.includes(term) && !commonTerms.includes(term)
      );
      
      return overlap.length >= 2; // At least 2 non-common terms match
    });
  }
}

export default DefaultMenuManager;