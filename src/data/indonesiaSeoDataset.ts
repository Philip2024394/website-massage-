/**
 * Indonesia SEO Dataset — Geo keywords + content pool for auto-post engine
 *
 * Usage: Topic + City + Service = Post
 * Example: "Benefits of deep tissue massage in Bandung"
 *
 * Plug into ELITE-AUTO-POST-SYSTEM (see docs/ELITE-AUTO-POST-SYSTEM-SPEC.md).
 */

// ============ GEO KEYWORDS (Primary target locations) ============

/** Tier 1 — Highest search volume cities */
export const SEO_CITIES_TIER_1: readonly string[] = [
  'Jakarta',
  'Surabaya',
  'Bandung',
  'Medan',
  'Bekasi',
  'Tangerang',
  'Depok',
  'Semarang',
  'Palembang',
  'Makassar',
] as const;

/** Tier 2 — High demand service cities */
export const SEO_CITIES_TIER_2: readonly string[] = [
  'Denpasar',
  'Malang',
  'Yogyakarta',
  'Bogor',
  'Batam',
  'Pekanbaru',
  'Bandar Lampung',
  'Padang',
  'Balikpapan',
  'Pontianak',
] as const;

/** Tier 3 — Fast growing cities */
export const SEO_CITIES_TIER_3: readonly string[] = [
  'Samarinda',
  'Banjarmasin',
  'Manado',
  'Kupang',
  'Jayapura',
  'Mataram',
  'Cirebon',
  'Tasikmalaya',
  'Serang',
  'Jambi',
] as const;

/** Tier 4 — Local SEO expansion targets */
export const SEO_CITIES_TIER_4: readonly string[] = [
  'Kediri',
  'Blitar',
  'Probolinggo',
  'Pasuruan',
  'Tegal',
  'Magelang',
  'Salatiga',
  'Binjai',
  'Langsa',
  'Palu',
] as const;

/** All SEO target cities in tier order (Tier 1 first) */
export const SEO_CITIES_ALL: readonly string[] = [
  ...SEO_CITIES_TIER_1,
  ...SEO_CITIES_TIER_2,
  ...SEO_CITIES_TIER_3,
  ...SEO_CITIES_TIER_4,
];

/** Tier label for weighting (e.g. prefer Tier 1 more often) */
export type SeoCityTier = 1 | 2 | 3 | 4;

export const SEO_CITIES_BY_TIER: Record<SeoCityTier, readonly string[]> = {
  1: SEO_CITIES_TIER_1,
  2: SEO_CITIES_TIER_2,
  3: SEO_CITIES_TIER_3,
  4: SEO_CITIES_TIER_4,
};

// ============ 100 SEO TOPICS (Auto-post content pool) ============

/** Massage topics (20) */
export const SEO_TOPICS_MASSAGE: readonly string[] = [
  'Benefits of deep tissue massage',
  'Is daily massage safe?',
  'Massage for stress relief',
  'Massage for back pain',
  'Best time for massage',
  'Sports massage benefits',
  'Massage for office workers',
  'Massage for sleep problems',
  'Prenatal massage safety',
  'Massage after gym recovery',
  'How often should you get massage',
  'Massage myths explained',
  'Hot stone massage benefits',
  'Swedish vs deep tissue massage',
  'Massage for circulation',
  'Home massage vs spa massage',
  'Massage for anxiety relief',
  'Massage and immune system',
  'Trigger point therapy benefits',
  'Massage mistakes people make',
];

/** Beauty + Facial topics (20) */
export const SEO_TOPICS_BEAUTY_FACIAL: readonly string[] = [
  'Facial benefits for skin health',
  'How often should you get a facial',
  'Facial for acne skin',
  'Facial for dry skin',
  'Facial before events',
  'Skin care myths',
  'Anti-aging treatments explained',
  'Natural beauty treatments',
  'Facial vs home skincare',
  'Signs you need a facial',
  'Best treatments for glowing skin',
  'Exfoliation benefits',
  'Blackhead removal safety',
  'Sensitive skin treatments',
  'Facial aftercare tips',
  'Skin hydration treatments',
  'LED facial therapy benefits',
  'Collagen treatments explained',
  'Beauty treatment mistakes',
  'Professional vs DIY skincare',
];

/** Spa topics (10) */
export const SEO_TOPICS_SPA: readonly string[] = [
  'Spa therapy benefits',
  'Spa treatments for relaxation',
  'How spa helps mental health',
  'Aromatherapy benefits',
  'Spa for couples',
  'Spa treatments for stress',
  'Spa detox treatments',
  'Luxury spa experience guide',
  'First spa visit tips',
  'Body scrub benefits',
];

/** Home service topics (10) */
export const SEO_TOPICS_HOME_SERVICE: readonly string[] = [
  'Benefits of home massage',
  'Why home beauty services are growing',
  'Home spa vs spa visit',
  'Safety tips for home services',
  'Booking therapist at home',
  'Home treatment convenience',
  'Privacy benefits of home service',
  'Mobile therapist advantages',
  'Who should book home service',
  'Home wellness trends',
];

/** Authority / Educational topics (10) */
export const SEO_TOPICS_AUTHORITY: readonly string[] = [
  'Signs of professional therapist',
  'How to choose safe therapist',
  'Licensed vs non-licensed therapist',
  'Hygiene standards in beauty services',
  'What makes a good spa',
  'Therapist certification guide',
  'Client safety tips',
  'Questions to ask therapist',
  'Service quality checklist',
  'Red flags when booking services',
];

/** Engagement topics (10) */
export const SEO_TOPICS_ENGAGEMENT: readonly string[] = [
  'Morning or night massage?',
  'Do you prefer spa or home service?',
  "What's your favorite treatment?",
  'Do massages help your stress?',
  'Have you tried facial therapy?',
  'What treatment relaxes you most?',
  'Spa day or gym day?',
  'Would you try mobile therapist?',
  'Best relaxation method?',
  'Do you schedule self-care weekly?',
];

/** Conversion topics (10) */
export const SEO_TOPICS_CONVERSION: readonly string[] = [
  'Why regular massage saves money long term',
  'Why self-care improves productivity',
  'Wellness routines successful people use',
  'Investing in skincare benefits',
  'Why relaxation improves health',
  'Professional treatments vs cheap services',
  'Why quality therapists matter',
  'Benefits of booking trusted providers',
  'Why certified practitioners are safer',
  'Long-term benefits of wellness routines',
];

/** Trending / Viral topics (10) */
export const SEO_TOPICS_TRENDING: readonly string[] = [
  'Wellness trends in Indonesia',
  'Most popular beauty treatments this year',
  'Self-care trends growing fast',
  'Why people choose home services now',
  'Modern relaxation methods',
  'Skincare trends dermatologists recommend',
  'Most requested spa treatments',
  'Fastest growing wellness services',
  'Popular treatments among professionals',
  'Top relaxation methods people love',
];

/** Category id for content rotation (match ELITE-AUTO-POST-SYSTEM types where applicable) */
export type SeoTopicCategory =
  | 'massage'
  | 'beautyFacial'
  | 'spa'
  | 'homeService'
  | 'authority'
  | 'engagement'
  | 'conversion'
  | 'trending';

/** All topic pools by category — use for rotation (e.g. never repeat same category twice in a row) */
export const SEO_TOPICS_BY_CATEGORY: Record<SeoTopicCategory, readonly string[]> = {
  massage: SEO_TOPICS_MASSAGE,
  beautyFacial: SEO_TOPICS_BEAUTY_FACIAL,
  spa: SEO_TOPICS_SPA,
  homeService: SEO_TOPICS_HOME_SERVICE,
  authority: SEO_TOPICS_AUTHORITY,
  engagement: SEO_TOPICS_ENGAGEMENT,
  conversion: SEO_TOPICS_CONVERSION,
  trending: SEO_TOPICS_TRENDING,
};

/** All 100 topics in a single flat array (for random pick) */
export const SEO_TOPICS_ALL: readonly string[] = [
  ...SEO_TOPICS_MASSAGE,
  ...SEO_TOPICS_BEAUTY_FACIAL,
  ...SEO_TOPICS_SPA,
  ...SEO_TOPICS_HOME_SERVICE,
  ...SEO_TOPICS_AUTHORITY,
  ...SEO_TOPICS_ENGAGEMENT,
  ...SEO_TOPICS_CONVERSION,
  ...SEO_TOPICS_TRENDING,
];

/** Topic count per category (for weighting, e.g. 70% educational = massage + authority + spa) */
export const SEO_TOPIC_COUNTS: Record<SeoTopicCategory, number> = {
  massage: SEO_TOPICS_MASSAGE.length,
  beautyFacial: SEO_TOPICS_BEAUTY_FACIAL.length,
  spa: SEO_TOPICS_SPA.length,
  homeService: SEO_TOPICS_HOME_SERVICE.length,
  authority: SEO_TOPICS_AUTHORITY.length,
  engagement: SEO_TOPICS_ENGAGEMENT.length,
  conversion: SEO_TOPICS_CONVERSION.length,
  trending: SEO_TOPICS_TRENDING.length,
};
