// Note: previously imported types from './types' were unused here and removed to fix TS6192 warnings.

// Massage type with image URL
export interface MassageTypeWithImage {
    name: string;
    imageUrl: string;
}

// Detailed massage type information for SEO
export interface MassageTypeInfo {
    name: string;
    shortDescription: string;
    fullDescription: string;
    benefits: string[];
    duration: string;
    intensity: 'Light' | 'Moderate' | 'Firm' | 'Deep';
    bestFor: string[];
}

export const MASSAGE_TYPE_DETAILS: MassageTypeInfo[] = [
    {
        name: 'Swedish Massage',
        shortDescription: 'Classic relaxation massage with gentle, flowing strokes for stress relief and improved circulation.',
        fullDescription: 'Swedish massage is one of the most popular massage techniques worldwide. It uses five main strokes - effleurage (sliding/gliding), petrissage (kneading), tapotement (rhythmic tapping), friction (cross fiber), and vibration/shaking. This gentle yet effective technique promotes relaxation, improves blood circulation, eases muscle tension, and enhances overall well-being. Perfect for first-time massage recipients and those seeking stress relief.',
        benefits: ['Reduces stress and anxiety', 'Improves blood circulation', 'Eases muscle tension', 'Promotes better sleep', 'Boosts immune system', 'Increases flexibility'],
        duration: '60-90 minutes',
        intensity: 'Light',
        bestFor: ['Beginners', 'Stress relief', 'Relaxation', 'General wellness']
    },
    {
        name: 'Deep Tissue Massage',
        shortDescription: 'Intense therapeutic massage targeting deep muscle layers to relieve chronic pain and tension.',
        fullDescription: 'Deep tissue massage focuses on the deeper layers of muscle and connective tissue. Using slow strokes and deep finger pressure on areas of tension and pain, this technique is particularly beneficial for chronically tense and contracted areas such as stiff necks, low back tightness, and sore shoulders. It helps break down adhesions (bands of painful, rigid tissue) that can disrupt circulation and cause pain, limited movement, and inflammation.',
        benefits: ['Relieves chronic muscle pain', 'Breaks down scar tissue', 'Improves posture', 'Reduces inflammation', 'Treats sports injuries', 'Lowers blood pressure'],
        duration: '60-90 minutes',
        intensity: 'Deep',
        bestFor: ['Chronic pain', 'Athletes', 'Muscle injuries', 'Limited mobility']
    },
    {
        name: 'Sports Massage',
        shortDescription: 'Specialized massage for athletes to enhance performance, prevent injuries, and accelerate recovery.',
        fullDescription: 'Sports massage is designed specifically for people who are involved in physical activity. It focuses on areas of the body that are overused and stressed from repetitive and often aggressive movements. This type of massage can be used before, during, and after athletic events to prepare muscles, reduce recovery time, and prevent injury. It combines techniques from Swedish massage, deep tissue, and stretching to address the specific needs of athletes.',
        benefits: ['Prevents sports injuries', 'Enhances athletic performance', 'Reduces muscle soreness', 'Improves flexibility', 'Speeds recovery', 'Increases range of motion'],
        duration: '30-90 minutes',
        intensity: 'Firm',
        bestFor: ['Athletes', 'Active individuals', 'Injury prevention', 'Pre/post competition']
    },
    {
        name: 'Hot Stone Massage',
        shortDescription: 'Therapeutic massage using heated smooth stones to warm and relax tight muscles.',
        fullDescription: 'Hot stone massage uses smooth, heated basalt stones placed on specific points on the body to warm and loosen tight muscles and balance energy centers. The therapist may also hold stones while applying traditional massage strokes. The heat from the stones penetrates deep into muscles, allowing the therapist to work deeper with less pressure. This ancient technique promotes deep relaxation, eases muscle stiffness, and improves blood flow.',
        benefits: ['Deep muscle relaxation', 'Improves blood flow', 'Reduces stress', 'Eases pain and tension', 'Promotes better sleep', 'Boosts immunity'],
        duration: '75-90 minutes',
        intensity: 'Light',
        bestFor: ['Muscle tension', 'Stress relief', 'Chronic pain', 'Insomnia']
    },
    {
        name: 'Aromatherapy Massage',
        shortDescription: 'Relaxing massage combined with essential oils to enhance emotional and physical well-being.',
        fullDescription: 'Aromatherapy massage combines the therapeutic benefits of massage with the healing properties of essential oils. Different oils are selected based on individual needs - lavender for relaxation, peppermint for energy, eucalyptus for respiratory health, etc. The oils are absorbed through the skin and inhaled during the massage, providing both physical and emotional benefits. This holistic approach treats the mind, body, and spirit.',
        benefits: ['Reduces anxiety and depression', 'Enhances mood', 'Relieves pain', 'Improves sleep quality', 'Boosts energy', 'Strengthens immune system'],
        duration: '60-90 minutes',
        intensity: 'Light',
        bestFor: ['Stress relief', 'Emotional wellness', 'Sleep issues', 'Mood enhancement']
    },
    {
        name: 'Balinese Massage',
        shortDescription: 'Traditional Indonesian massage combining acupressure, reflexology, and aromatherapy for total relaxation.',
        fullDescription: 'Balinese massage is a traditional Indonesian therapy that combines gentle stretches, acupressure, reflexology, and aromatherapy to stimulate the flow of blood, oxygen, and energy around your body. Using a variety of techniques including skin rolling, kneading, stroking, and pressure-point stimulation, this massage promotes deep relaxation, relieves muscle tension, and enhances overall well-being. Essential oils are used to enhance the therapeutic benefits.',
        benefits: ['Deep relaxation', 'Improves blood circulation', 'Relieves muscle tension', 'Reduces stress', 'Enhances sleep quality', 'Boosts energy flow'],
        duration: '60-120 minutes',
        intensity: 'Moderate',
        bestFor: ['Total relaxation', 'Stress relief', 'Muscle tension', 'Energy balance']
    },
    {
        name: 'Javanese Massage',
        shortDescription: 'Gentle Indonesian healing massage focusing on energy flow and holistic wellness.',
        fullDescription: 'Javanese massage is a traditional Indonesian healing technique that focuses on gentle, rhythmic movements to promote energy flow and balance throughout the body. This massage style uses lighter pressure compared to Balinese massage, incorporating elements of meditation and spirituality. The therapist uses hands, thumbs, and sometimes elbows to work on energy lines and pressure points, promoting deep relaxation and inner peace.',
        benefits: ['Promotes energy balance', 'Reduces stress', 'Improves circulation', 'Enhances spiritual wellness', 'Gentle muscle relaxation', 'Calms the mind'],
        duration: '60-90 minutes',
        intensity: 'Light',
        bestFor: ['Stress relief', 'Energy healing', 'Gentle relaxation', 'Holistic wellness']
    },
    {
        name: 'Thai Massage',
        shortDescription: 'Ancient healing practice combining acupressure, stretching, and yoga-like movements.',
        fullDescription: 'Thai massage, also known as Thai yoga massage, is an ancient healing system combining acupressure, Indian Ayurvedic principles, and assisted yoga postures. The recipient remains clothed during the treatment and lies on a mat on the floor. The therapist uses their hands, knees, legs, and feet to move you into a series of yoga-like stretches and applies rhythmic pressure along energy lines. This dynamic bodywork improves flexibility, relieves tension, and energizes the body.',
        benefits: ['Increases flexibility', 'Improves energy levels', 'Relieves muscle tension', 'Enhances athletic performance', 'Reduces headaches', 'Improves posture'],
        duration: '60-120 minutes',
        intensity: 'Moderate',
        bestFor: ['Flexibility', 'Energy boost', 'Athletes', 'Stress relief']
    },
    {
        name: 'Shiatsu Massage',
        shortDescription: 'Japanese finger pressure therapy on energy meridians to balance body energy and promote healing.',
        fullDescription: 'Shiatsu is a Japanese bodywork therapy based on traditional Chinese medicine principles. "Shiatsu" means "finger pressure" in Japanese. The therapist uses thumbs, fingers, and palms to apply pressure to specific points on the body to unblock energy pathways (meridians) and restore balance. Unlike other massage techniques, Shiatsu is typically performed with the client fully clothed on a mat on the floor. It aims to stimulate the body\'s natural healing abilities.',
        benefits: ['Balances energy flow', 'Reduces stress and anxiety', 'Relieves pain', 'Improves circulation', 'Boosts immune system', 'Enhances emotional well-being'],
        duration: '60-90 minutes',
        intensity: 'Moderate',
        bestFor: ['Energy balance', 'Stress relief', 'Pain management', 'Holistic health']
    },
    {
        name: 'Reflexology',
        shortDescription: 'Pressure point therapy on feet, hands, and ears to promote healing throughout the entire body.',
        fullDescription: 'Reflexology is based on the principle that specific points on the feet, hands, and ears correspond to different organs and systems in the body. By applying pressure to these reflex points, reflexologists can improve health in corresponding areas of the body. This ancient practice promotes healing, improves circulation, reduces stress, and restores balance. A typical session focuses primarily on the feet, which contain over 7,000 nerve endings.',
        benefits: ['Reduces stress and tension', 'Improves circulation', 'Enhances nerve function', 'Boosts immune system', 'Promotes better sleep', 'Aids digestion'],
        duration: '30-60 minutes',
        intensity: 'Moderate',
        bestFor: ['Stress relief', 'Overall wellness', 'Circulation', 'Relaxation']
    },
    {
        name: 'Acupressure',
        shortDescription: 'Traditional Chinese medicine technique using finger pressure on specific body points to restore energy balance.',
        fullDescription: 'Acupressure is an ancient Chinese healing technique similar to acupuncture but without needles. Practitioners use their fingers, palms, elbows, or feet to apply pressure to specific points along the body\'s meridians (energy pathways). This stimulates the body\'s natural self-healing abilities and promotes energy flow. Acupressure can be used to relieve pain, reduce tension, improve circulation, and treat various health conditions.',
        benefits: ['Relieves pain and tension', 'Reduces stress', 'Improves energy flow', 'Enhances sleep quality', 'Boosts immune system', 'Alleviates headaches'],
        duration: '30-60 minutes',
        intensity: 'Moderate',
        bestFor: ['Pain relief', 'Energy balance', 'Stress management', 'Holistic healing']
    },
    {
        name: 'Lomi Lomi Massage',
        shortDescription: 'Hawaiian massage using flowing movements mimicking ocean waves for profound relaxation and healing.',
        fullDescription: 'Lomi Lomi is a traditional Hawaiian massage that uses long, flowing strokes that mimic the waves of the ocean. "Lomi Lomi" means "to knead" in Hawaiian. This deeply spiritual practice views massage as a sacred healing art. The therapist uses forearms, hands, and elbows in continuous, rhythmic motions, often working on two areas of the body simultaneously. This creates a profound sense of peace and well-being, releasing tension and promoting energy flow.',
        benefits: ['Deep relaxation', 'Releases muscle tension', 'Improves circulation', 'Enhances energy flow', 'Promotes emotional release', 'Spiritual healing'],
        duration: '60-120 minutes',
        intensity: 'Moderate',
        bestFor: ['Deep relaxation', 'Spiritual wellness', 'Muscle tension', 'Stress relief']
    },
    {
        name: 'Kerokan (Coin Rub)',
        shortDescription: 'Traditional Indonesian healing technique using coins to scrape the skin and release negative energy.',
        fullDescription: 'Kerokan is a traditional Indonesian folk medicine technique that involves scraping the skin with coins (usually old coins) or smooth stones lubricated with oil or balm. The therapist applies firm pressure and scrapes in downward strokes on the back, neck, shoulders, and limbs. This creates red marks (petechiae) which are believed to release "bad wind" or negative energy from the body. Kerokan is commonly used to treat colds, flu, fever, and body aches.',
        benefits: ['Relieves cold and flu symptoms', 'Reduces fever', 'Alleviates body aches', 'Improves circulation', 'Releases toxins', 'Boosts immune response'],
        duration: '15-30 minutes',
        intensity: 'Firm',
        bestFor: ['Cold/flu relief', 'Fever', 'Body aches', 'Traditional healing']
    },
    {
        name: 'Jamu Massage',
        shortDescription: 'Indonesian herbal massage using traditional jamu herbs to detoxify, rejuvenate, and heal the body.',
        fullDescription: 'Jamu massage combines traditional Indonesian massage techniques with the healing properties of jamu - herbal medicine made from natural ingredients like turmeric, ginger, lemongrass, and tamarind. The massage incorporates herbal compresses, wraps, and oils infused with these powerful herbs. This holistic treatment detoxifies the body, improves circulation, relieves pain, and promotes overall wellness. It\'s deeply rooted in Indonesian cultural heritage and traditional medicine.',
        benefits: ['Detoxifies the body', 'Reduces inflammation', 'Relieves muscle pain', 'Improves skin health', 'Boosts immune system', 'Enhances energy'],
        duration: '60-120 minutes',
        intensity: 'Moderate',
        bestFor: ['Detoxification', 'Pain relief', 'Traditional healing', 'Skin health']
    },
    {
        name: 'Prenatal Massage',
        shortDescription: 'Specialized massage for pregnant women to relieve discomfort, reduce stress, and support healthy pregnancy.',
        fullDescription: 'Prenatal massage is specifically designed to address the unique needs of pregnant women. Using specialized positioning (usually side-lying with pillows for support), certified therapists apply gentle techniques to relieve common pregnancy discomforts such as back pain, leg cramps, and swelling. This safe and nurturing therapy reduces stress hormones, improves circulation, and promotes relaxation for both mother and baby. It\'s typically safe after the first trimester.',
        benefits: ['Reduces pregnancy discomfort', 'Relieves back and leg pain', 'Decreases swelling', 'Improves sleep', 'Reduces stress hormones', 'Enhances mood'],
        duration: '45-60 minutes',
        intensity: 'Light',
        bestFor: ['Pregnant women', 'Pregnancy discomfort', 'Stress relief', 'Better sleep']
    },
    {
        name: 'Lymphatic Massage',
        shortDescription: 'Gentle massage technique to stimulate lymph flow, remove toxins, and boost immune system.',
        fullDescription: 'Lymphatic drainage massage uses very gentle, rhythmic strokes to stimulate the lymphatic system - the body\'s natural waste removal system. This specialized technique helps move lymph fluid through the body, removing toxins and supporting immune function. It\'s particularly beneficial for reducing swelling, improving skin health, and supporting post-surgical recovery. The gentle pressure makes it suitable for those who find traditional massage too intense.',
        benefits: ['Reduces swelling and edema', 'Boosts immune system', 'Detoxifies the body', 'Improves skin health', 'Aids post-surgical recovery', 'Reduces inflammation'],
        duration: '45-60 minutes',
        intensity: 'Light',
        bestFor: ['Swelling/edema', 'Post-surgery', 'Immune support', 'Detoxification']
    },
    {
        name: 'Indian Head Massage',
        shortDescription: 'Therapeutic massage focusing on head, neck, and shoulders to relieve tension and promote hair health.',
        fullDescription: 'Indian head massage, also known as champissage, is an ancient Ayurvedic therapy that focuses on the head, neck, and shoulders. Using a variety of techniques including gentle massage, acupressure, and deep kneading, this treatment releases tension, improves circulation to the scalp, and promotes hair growth. Often performed with warm oils infused with herbs, it provides both physical relief and mental clarity. No need to undress - perfect for a quick stress-relief session.',
        benefits: ['Relieves tension headaches', 'Reduces neck and shoulder pain', 'Improves scalp circulation', 'Promotes hair growth', 'Enhances concentration', 'Reduces stress'],
        duration: '30-45 minutes',
        intensity: 'Moderate',
        bestFor: ['Headaches', 'Neck/shoulder tension', 'Hair health', 'Quick relaxation']
    },
    {
        name: 'Abdominal Acupressure',
        shortDescription: 'Specialized pressure point therapy on the abdomen to improve digestion, relieve tension, and support internal organ health.',
        fullDescription: 'Abdominal acupressure is a therapeutic technique that applies gentle to moderate pressure on specific acupressure points located on the abdomen. This ancient healing practice focuses on improving digestive function, relieving bloating and constipation, reducing menstrual cramps, and promoting overall internal organ health. The therapist uses fingers, palms, and sometimes warm compresses to stimulate energy flow and release blockages in the abdominal area, supporting the body\'s natural healing processes.',
        benefits: ['Improves digestion', 'Relieves bloating and gas', 'Reduces menstrual cramps', 'Alleviates constipation', 'Supports organ detoxification', 'Reduces abdominal tension'],
        duration: '30-45 minutes',
        intensity: 'Light',
        bestFor: ['Digestive issues', 'Menstrual discomfort', 'Bloating', 'Abdominal tension']
    },
    {
        name: 'Vitality Massage',
        shortDescription: 'Energizing full-body massage combining invigorating techniques to boost energy, enhance circulation, and restore vitality.',
        fullDescription: 'Vitality massage is a dynamic, energizing treatment designed to combat fatigue, boost energy levels, and restore overall vitality. This invigorating massage combines various techniques including brisk strokes, percussion movements, stretching, and pressure point stimulation to awaken the body and mind. Often incorporating essential oils known for their energizing properties like peppermint, rosemary, or citrus, this treatment improves circulation, oxygenates tissues, and leaves you feeling refreshed and rejuvenated.',
        benefits: ['Boosts energy levels', 'Combats fatigue', 'Improves blood circulation', 'Enhances mental clarity', 'Reduces muscle stiffness', 'Revitalizes body and mind'],
        duration: '60-90 minutes',
        intensity: 'Moderate',
        bestFor: ['Low energy', 'Fatigue', 'Mental fog', 'Sluggishness']
    }
];

// Helper function to get detailed information for a massage type
export const getMassageTypeDetails = (massageType: string): MassageTypeInfo | undefined => {
    return MASSAGE_TYPE_DETAILS.find(
        m => m.name.toLowerCase() === massageType.toLowerCase()
    );
};

export const MASSAGE_TYPES_CATEGORIZED = [
    {
        category: 'Basic Services',
        types: ['Traditional', 'Body Scrub', 'Facial', 'Hands', 'Feet']
    },
    {
        category: 'Western Massages',
        types: ['Swedish Massage', 'Deep Tissue Massage', 'Sports Massage', 'Hot Stone Massage', 'Aromatherapy Massage']
    },
    {
        category: 'Eastern & Indonesian Massages',
        types: ['Balinese Massage', 'Javanese Massage', 'Thai Massage', 'Shiatsu Massage', 'Reflexology', 'Acupressure', 'Lomi Lomi Massage']
    },
    {
        category: 'Traditional Indonesian Techniques',
        types: ['Kerokan (Coin Rub)', 'Jamu Massage', 'Scraping', 'Cupping']
    },
    {
        category: 'Specialty Massages',
        types: ['Prenatal Massage', 'Lymphatic Massage', 'Indian Head Massage', 'Abdominal Acupressure', 'Vitality Massage', 'Sprain']
    }
];

// Massage types with image URLs for visual display
export const MASSAGE_TYPES_WITH_IMAGES: MassageTypeWithImage[] = [
    // Western Massages
    { 
        name: 'Swedish Massage', 
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20indonesia.png?updatedAt=1759648341961' 
    },
    { 
        name: 'Deep Tissue Massage', 
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20indonesia%20bali.png?updatedAt=1759648529103'
    },
    { 
        name: 'Sports Massage', 
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20indonesia%20solo%20indocountry.png?updatedAt=1759650205320'
    },
    { 
        name: 'Hot Stone Massage', 
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20indonesia%20solo%20indo.png?updatedAt=1759649853222'
    },
    { 
        name: 'Aromatherapy Massage', 
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20indonesia%20solo.png?updatedAt=1759649537508'
    },
    
    // Eastern & Indonesian Massages
    { 
        name: 'Balinese Massage', 
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20indonesia%20solo%20indocountry.png?updatedAt=1759650205320'
    },
    { 
        name: 'Javanese Massage', 
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/body%20scrub%20indonisea.png?updatedAt=1759650812089'
    },
    { 
        name: 'Thai Massage', 
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20indonesia%20jogja.png?updatedAt=1759649265005'
    },
    { 
        name: 'Shiatsu Massage', 
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20tables.png?updatedAt=1761608019801'
    },
    { 
        name: 'Reflexology', 
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20indonesia%20balis.png?updatedAt=1759648929022'
    },
    { 
        name: 'Acupressure', 
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20tables.png?updatedAt=1761608423366'
    },
    { 
        name: 'Lomi Lomi Massage', 
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20image%206.png?updatedAt=1760187126997'
    },
    
    // Traditional Indonesian Techniques
    { 
        name: 'Kerokan (Coin Rub)', 
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20indonesia%20solo%20indocountrys.png?updatedAt=1759650484472'
    },
    { 
        name: 'Jamu Massage', 
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20jobs.png?updatedAt=1761571942696'
    },
    
    // Specialty Massages
    { 
        name: 'Prenatal Massage', 
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20table.png?updatedAt=1761607910862'
    },
    { 
        name: 'Lymphatic Massage', 
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/massages.png?updatedAt=1761607624991'
    },
    { 
        name: 'Indian Head Massage', 
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/body%20scrub%20indonisead.png?updatedAt=1759651049627'
    },
    { 
        name: 'Abdominal Acupressure', 
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20tables.png?updatedAt=1761608423366'
    },
    { 
        name: 'Vitality Massage', 
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20image%206.png?updatedAt=1760187126997'
    }
];

// Helper function to get image URL for a massage type
export const getMassageTypeImage = (massageType: string): string => {
    const massageWithImage = MASSAGE_TYPES_WITH_IMAGES.find(
        m => m.name.toLowerCase() === massageType.toLowerCase()
    );
    return massageWithImage?.imageUrl || '';
};

export const PLACE_SERVICES = [
    'Facials', 'Body Scrubs', 'Body Wraps', 'Hair Salon', 'Beautician', 
    'Acupressure', 'Reflexology', 'Aromatherapy', 'Yoga & Pilates', 
    'Cupping Therapy', 'Physical Therapy', 'Sauna', 'Jacuzzi', 'Steam Room'
];

export const ADDITIONAL_SERVICES = [
    'Facials', 'Body Scrubs', 'Body Wraps', 'Hair Salon', 'Beautician', 
    'Acupressure', 'Reflexology', 'Aromatherapy', 'Yoga & Pilates', 
    'Cupping Therapy', 'Physical Therapy', 'Sauna', 'Jacuzzi', 'Steam Room'
];
