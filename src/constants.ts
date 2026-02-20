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

// Detailed facial type information for SEO
export interface FacialTypeInfo {
    name: string;
    shortDescription: string;
    fullDescription: string;
    benefits: string[];
    duration: string;
    intensity: 'Gentle' | 'Light' | 'Moderate' | 'Deep';
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
    },
    {
        name: 'Traditional',
        shortDescription: 'Authentic Indonesian massage combining time-honored techniques for deep relaxation and healing.',
        fullDescription: 'Traditional Indonesian massage is a comprehensive healing therapy that has been practiced for centuries across the archipelago. This therapeutic massage combines deep tissue work, acupressure, gentle stretching, and rhythmic movements to release muscle tension, improve circulation, and restore energy balance. Using natural oils often infused with local herbs and spices, the therapist applies firm but soothing pressure along energy meridians and muscle groups. This holistic approach treats both physical discomfort and promotes spiritual well-being, embodying Indonesia\'s rich wellness heritage.',
        benefits: ['Releases deep muscle tension', 'Improves blood circulation', 'Reduces stress and anxiety', 'Balances body energy', 'Relieves chronic pain', 'Enhances flexibility'],
        duration: '60-90 minutes',
        intensity: 'Moderate',
        bestFor: ['Muscle tension', 'Stress relief', 'Cultural experience', 'Overall wellness']
    },
    {
        name: 'Feet',
        shortDescription: 'Specialized foot massage targeting pressure points to promote relaxation and overall body wellness.',
        fullDescription: 'Foot massage is a therapeutic treatment focusing exclusively on the feet, which contain thousands of nerve endings connected to every part of the body. This specialized therapy combines reflexology techniques, deep tissue work, and acupressure to relieve foot pain, reduce tension, and promote healing throughout the entire body. The therapist uses thumbs, fingers, and knuckles to apply varying pressure to specific reflex zones, improving circulation, releasing toxins, and restoring balance. Often incorporating warm oils or foot soaks, this treatment is both deeply relaxing and therapeutically beneficial.',
        benefits: ['Relieves foot pain and fatigue', 'Improves overall circulation', 'Reduces stress and tension', 'Promotes better sleep', 'Supports full-body healing', 'Enhances mobility'],
        duration: '30-60 minutes',
        intensity: 'Moderate',
        bestFor: ['Foot pain', 'Standing jobs', 'Relaxation', 'Reflexology benefits']
    },
    {
        name: 'Hands',
        shortDescription: 'Therapeutic hand massage relieving tension, improving circulation, and addressing repetitive strain.',
        fullDescription: 'Hand massage is a specialized treatment targeting the intricate muscles, tendons, and pressure points of the hands and wrists. This therapeutic session is particularly beneficial for those who use their hands extensively - office workers, musicians, craftspeople, or anyone experiencing hand fatigue or discomfort. Using a combination of gentle stretching, kneading, pressure point therapy, and joint mobilization, the therapist works to relieve carpal tunnel symptoms, arthritis pain, and repetitive strain injuries. Hand reflexology principles are often incorporated, as specific points on the hands correspond to various organs and body systems.',
        benefits: ['Relieves hand and wrist pain', 'Reduces carpal tunnel symptoms', 'Improves hand flexibility', 'Enhances circulation', 'Reduces arthritis discomfort', 'Promotes relaxation'],
        duration: '20-45 minutes',
        intensity: 'Light',
        bestFor: ['Office workers', 'Arthritis', 'Carpal tunnel', 'Hand fatigue']
    },
    {
        name: 'Body Scrub',
        shortDescription: 'Exfoliating body treatment using natural scrubs to remove dead skin, detoxify, and reveal smooth, glowing skin.',
        fullDescription: 'Body scrub, also known as body polish or exfoliation treatment, is a luxurious spa therapy that revitalizes the skin from head to toe. Using natural exfoliants such as sea salt, sugar, coffee grounds, rice powder, or ground herbs mixed with nourishing oils, the therapist gently massages the scrub over the entire body in circular motions. This process removes dead skin cells, unclogs pores, stimulates circulation, and promotes cell renewal. After rinsing, the skin is left incredibly soft, smooth, and radiant. Many Indonesian spas use traditional ingredients like turmeric, lulur (yellow rice powder), or boreh (spice paste) for added therapeutic benefits.',
        benefits: ['Removes dead skin cells', 'Improves skin texture and tone', 'Boosts circulation', 'Detoxifies skin', 'Reduces ingrown hairs', 'Prepares skin for tanning'],
        duration: '45-60 minutes',
        intensity: 'Light',
        bestFor: ['Skin rejuvenation', 'Dry skin', 'Pre-event prep', 'Spa experience']
    },
    {
        name: 'Facial',
        shortDescription: 'Comprehensive facial treatment cleansing, nourishing, and rejuvenating skin for a healthy, radiant complexion.',
        fullDescription: 'Facial massage and treatment is a multi-step skincare therapy designed to cleanse, exfoliate, nourish, and rejuvenate facial skin. A typical facial includes deep cleansing, steam treatment, exfoliation, extractions (if needed), facial massage using upward and outward strokes to improve circulation and tone facial muscles, application of serums and masks tailored to your skin type, and moisturization. The facial massage component promotes lymphatic drainage, reduces puffiness, smooths fine lines, and creates a healthy glow. This relaxing treatment not only improves skin health but also provides stress relief and promotes overall well-being.',
        benefits: ['Deep cleanses pores', 'Improves skin texture', 'Reduces fine lines', 'Promotes even skin tone', 'Boosts circulation', 'Provides deep relaxation'],
        duration: '45-90 minutes',
        intensity: 'Light',
        bestFor: ['All skin types', 'Anti-aging', 'Acne treatment', 'Skin health']
    }
];

// Helper function to get detailed information for a massage type
export const getMassageTypeDetails = (massageType: string): MassageTypeInfo | undefined => {
    return MASSAGE_TYPE_DETAILS.find(
        m => m.name.toLowerCase() === massageType.toLowerCase()
    );
};

// Facial Type Details Array
export const FACIAL_TYPE_DETAILS: FacialTypeInfo[] = [
    {
        name: 'Anti-Aging Facial',
        shortDescription: 'Advanced anti-aging treatment targeting fine lines, wrinkles, and age spots to rejuvenate and firm skin.',
        fullDescription: 'Anti-aging facial is a comprehensive treatment combining cutting-edge techniques and premium products to combat visible signs of aging. This luxurious facial uses potent serums containing retinol, peptides, and antioxidants to stimulate collagen production, improve skin elasticity, and reduce fine lines and wrinkles. The treatment includes deep cleansing, gentle exfoliation, facial massage to promote circulation, application of specialized anti-aging masks, and intensive hydration. Regular sessions can significantly improve skin texture, tone, and firmness, restoring a more youthful, radiant appearance.',
        benefits: ['Reduces fine lines and wrinkles', 'Firms and lifts skin', 'Improves skin elasticity', 'Evens skin tone', 'Boosts collagen production', 'Restores youthful glow'],
        duration: '75-90 minutes',
        intensity: 'Moderate',
        bestFor: ['Mature skin', 'Fine lines', 'Wrinkles', 'Loss of firmness']
    },
    {
        name: 'Collagen Facial',
        shortDescription: 'Intensive collagen-boosting treatment that enhances skin elasticity and reduces wrinkles for firmer, younger-looking skin.',
        fullDescription: 'Collagen facial is a specialized treatment designed to replenish and boost collagen levels in the skin. As we age, our natural collagen production decreases, leading to sagging skin and wrinkles. This facial uses collagen-rich masks, serums, and creams along with techniques that stimulate the skin\'s own collagen production. The treatment may include gentle microcurrent therapy or LED light therapy to enhance results. Collagen facials deeply hydrate, plump the skin, minimize fine lines, and restore elasticity, leaving your complexion looking firmer, smoother, and more youthful.',
        benefits: ['Boosts skin elasticity', 'Reduces wrinkles and fine lines', 'Firms sagging skin', 'Deeply hydrates', 'Plumps skin', 'Improves skin texture'],
        duration: '60-90 minutes',
        intensity: 'Moderate',
        bestFor: ['Aging skin', 'Loss of firmness', 'Wrinkles', 'Dehydrated skin']
    },
    {
        name: 'Microdermabrasion',
        shortDescription: 'Exfoliating treatment using fine crystals or diamond tips to remove dead skin cells and reveal smoother, brighter skin.',
        fullDescription: 'Microdermabrasion is a non-invasive mechanical exfoliation technique that removes the outermost layer of dead skin cells using fine crystals or a diamond-tipped wand. This controlled exfoliation stimulates cell renewal, improves skin texture, and enhances product absorption. The treatment is effective for reducing fine lines, age spots, acne scars, and hyperpigmentation while promoting a more even skin tone. The procedure also stimulates blood flow and collagen production, resulting in fresher, healthier-looking skin. With no downtime, this treatment is perfect for those seeking immediate radiance and long-term skin improvement.',
        benefits: ['Exfoliates dead skin cells', 'Reduces fine lines', 'Minimizes pore size', 'Fades age spots and hyperpigmentation', 'Improves skin texture', 'Enhances product absorption'],
        duration: '45-60 minutes',
        intensity: 'Moderate',
        bestFor: ['Uneven texture', 'Fine lines', 'Sun damage', 'Age spots']
    },
    {
        name: 'Chemical Peel',
        shortDescription: 'Advanced exfoliation treatment using carefully selected acids to remove damaged outer layers for fresh, youthful skin.',
        fullDescription: 'Chemical peel is a professional skincare treatment that uses various acids (such as glycolic, salicylic, lactic, or TCA) to chemically exfoliate the skin. Depending on the strength - light, medium, or deep - peels can address different concerns from mild texture issues to significant sun damage and scarring. The treatment removes damaged outer layers, stimulating new cell growth and collagen production. This results in smoother, more even-toned skin with reduced appearance of fine lines, acne scars, and hyperpigmentation. Post-treatment, skin may peel for several days as it reveals the fresh, rejuvenated complexion underneath.',
        benefits: ['Removes damaged skin layers', 'Reduces acne scars', 'Evens skin tone', 'Minimizes fine lines', 'Treats hyperpigmentation', 'Stimulates cell renewal'],
        duration: '30-60 minutes',
        intensity: 'Deep',
        bestFor: ['Acne scars', 'Hyperpigmentation', 'Sun damage', 'Wrinkles']
    },
    {
        name: 'LED Light Therapy',
        shortDescription: 'Non-invasive treatment using different colored LED lights to treat various skin concerns and promote healing.',
        fullDescription: 'LED light therapy facial uses different wavelengths of light to penetrate the skin at varying depths, triggering specific cellular responses. Red light stimulates collagen production and reduces inflammation, blue light kills acne-causing bacteria, and near-infrared light promotes healing and reduces redness. This painless, non-invasive treatment has no downtime and is suitable for all skin types. Regular sessions can significantly improve skin texture, reduce breakouts, minimize fine lines, and promote overall skin health. Often combined with other facial treatments, LED therapy enhances results and accelerates healing.',
        benefits: ['Reduces acne and breakouts', 'Stimulates collagen production', 'Minimizes inflammation', 'Improves skin tone', 'Accelerates healing', 'No downtime'],
        duration: '30-45 minutes',
        intensity: 'Gentle',
        bestFor: ['Acne', 'Anti-aging', 'Redness', 'All skin types']
    },
    {
        name: 'Hydrating Facial',
        shortDescription: 'Intensive moisture treatment for dry, dehydrated skin leaving it plump, supple, and radiant.',
        fullDescription: 'Hydrating facial is a deeply moisturizing treatment specifically designed for dry, dehydrated, or dull skin. This luxurious facial uses hydrating serums rich in hyaluronic acid, glycerin, and vitamins to replenish moisture levels and restore the skin\'s natural barrier. The treatment typically includes gentle cleansing, light exfoliation to remove dry patches, a hydrating massage to boost circulation, and application of intensive moisture masks. The result is plump, dewy skin with improved elasticity and a healthy glow. Perfect for all ages and particularly beneficial in dry climates or after sun exposure.',
        benefits: ['Deep moisture replenishment', 'Plumps and softens skin', 'Reduces dryness and flakiness', 'Restores skin barrier', 'Improves elasticity', 'Creates dewy glow'],
        duration: '60-75 minutes',
        intensity: 'Gentle',
        bestFor: ['Dry skin', 'Dehydrated skin', 'Tight skin', 'Dull complexion']
    },
    {
        name: 'Brightening Facial',
        shortDescription: 'Illuminating treatment that reduces dark spots, evens skin tone, and reveals a luminous, radiant complexion.',
        fullDescription: 'Brightening facial is a specialized treatment targeting hyperpigmentation, dark spots, and uneven skin tone. Using powerful ingredients like vitamin C, kojic acid, licorice extract, and niacinamide, this facial inhibits melanin production while gently exfoliating to reveal brighter skin. The treatment includes deep cleansing, enzymatic or chemical exfoliation, brightening serums and masks, and protective antioxidants. Regular sessions can fade sun spots, age spots, and post-inflammatory hyperpigmentation while preventing new discoloration. The result is a more even, luminous complexion with a healthy, radiant glow.',
        benefits: ['Reduces dark spots and hyperpigmentation', 'Evens skin tone', 'Adds luminous radiance', 'Prevents future discoloration', 'Improves overall complexion', 'Boosts skin clarity'],
        duration: '60-75 minutes',
        intensity: 'Moderate',
        bestFor: ['Dark spots', 'Uneven tone', 'Sun damage', 'Dull skin']
    },
    {
        name: 'Acne Treatment Facial',
        shortDescription: 'Deep cleansing treatment specifically targeting breakouts, clearing pores, and preventing future acne.',
        fullDescription: 'Acne treatment facial is a comprehensive therapy designed to address active breakouts, congested pores, and acne-prone skin. This clinical treatment begins with deep cleansing to remove excess oil and impurities, followed by gentle exfoliation to unclog pores. Steam softens blackheads and whiteheads for safe extraction, performed by trained professionals. Antibacterial and anti-inflammatory treatments including salicylic acid, benzoyl peroxide, or tea tree oil are applied to kill acne-causing bacteria and reduce inflammation. A soothing mask calms redness and irritation, while final products help regulate oil production and prevent future breakouts.',
        benefits: ['Clears active breakouts', 'Unclogs pores', 'Reduces inflammation and redness', 'Controls excess oil', 'Prevents future acne', 'Fades acne scars'],
        duration: '60-75 minutes',
        intensity: 'Moderate',
        bestFor: ['Oily skin', 'Active acne', 'Clogged pores', 'Acne-prone skin']
    },
    {
        name: 'Deep Cleansing Facial',
        shortDescription: 'Thorough purifying treatment that cleanses pores, removes impurities, and refreshes congested skin.',
        fullDescription: 'Deep cleansing facial is a fundamental skincare treatment that thoroughly purifies the skin by removing dirt, oil, makeup residue, and environmental pollutants that accumulate in pores. This essential treatment includes double cleansing, steam to open pores, gentle exfoliation to remove dead skin cells, professional extractions to clear blackheads and congestion, and a purifying mask to draw out impurities. The facial concludes with toner, serum, and moisturizer to balance and protect the skin. Ideal for all skin types, this treatment leaves skin feeling fresh, clean, and rejuvenated while preventing breakouts and maintaining skin health.',
        benefits: ['Deeply cleanses pores', 'Removes blackheads and congestion', 'Eliminates impurities', 'Refreshes skin', 'Prevents breakouts', 'Balances oil production'],
        duration: '60 minutes',
        intensity: 'Moderate',
        bestFor: ['Congested skin', 'Blackheads', 'Oily skin', 'Urban environment'],
    },
    {
        name: 'Sensitive Skin Facial',
        shortDescription: 'Gentle, soothing treatment specially formulated for delicate, reactive, and easily irritated skin.',
        fullDescription: 'Sensitive skin facial is a carefully designed treatment using gentle, hypoallergenic products and techniques to care for delicate, reactive skin. This calming facial avoids harsh ingredients, strong acids, and aggressive techniques that could trigger irritation. Instead, it uses mild cleansers, soothing ingredients like chamomile, aloe vera, and calendula, and cooling masks to reduce redness and inflammation. The gentle massage promotes circulation without causing stress to the skin. This nurturing treatment strengthens the skin barrier, reduces sensitivity over time, and leaves skin feeling comfortable, calm, and nourished without any irritation.',
        benefits: ['Calms irritation and redness', 'Strengthens skin barrier', 'Reduces sensitivity', 'Gentle nourishment', 'Soothes inflammation', 'No harsh ingredients'],
        duration: '60 minutes',
        intensity: 'Gentle',
        bestFor: ['Sensitive skin', 'Reactive skin', 'Rosacea', 'Easily irritated skin']
    },
    {
        name: 'Oxygen Facial',
        shortDescription: 'Revitalizing treatment infusing pure oxygen for instant glow, plump skin, and enhanced radiance.',
        fullDescription: 'Oxygen facial is an innovative treatment that uses pressurized oxygen to deliver vitamins, minerals, and botanical extracts deep into the skin. This infusion of pure oxygen and nourishing serums hydrates, plumps, and revitalizes the skin instantly. The treatment stimulates cellular respiration, boosts collagen production, and accelerates cell turnover while providing powerful antioxidant protection. Oxygen facials are particularly popular before special events as they create an immediate luminous glow with no downtime. The treatment is gentle yet effective for all skin types, detoxifying the skin while promoting a healthy, radiant complexion.',
        benefits: ['Instant luminous glow', 'Deeply hydrates', 'Plumps fine lines', 'Boosts circulation', 'Detoxifies skin', 'Enhances product absorption'],
        duration: '45-60 minutes',
        intensity: 'Gentle',
        bestFor: ['Dull skin', 'Special events', 'All skin types', 'Pre-event glow']
    },
    {
        name: 'Gold Facial',
        shortDescription: 'Luxurious treatment using 24K gold particles to brighten, firm, and rejuvenate skin with opulent radiance.',
        fullDescription: 'Gold facial is an indulgent luxury treatment incorporating 24-karat gold particles or gold-infused products for their remarkable anti-aging and skin-enhancing properties. Gold has been used in skincare for centuries due to its ability to improve blood circulation, stimulate cellular renewal, and provide antioxidant protection. This opulent facial includes gold-enriched cleansers, serums, masks, and massage techniques that help firm skin, reduce fine lines, and create a luminous, radiant glow. The treatment is anti-inflammatory, improves skin elasticity, and leaves the complexion looking healthy, bright, and rejuvenated with a golden goddess glow.',
        benefits: ['Firms and lifts skin', 'Reduces fine lines', 'Brightens complexion', 'Improves elasticity', 'Provides antioxidant protection', 'Creates luxurious glow'],
        duration: '75-90 minutes',
        intensity: 'Light',
        bestFor: ['Special occasions', 'Anti-aging', 'Dull skin', 'Luxury treatment']
    },
    {
        name: 'Vitamin C Facial',
        shortDescription: 'Powerful antioxidant treatment for brightening, protecting, and rejuvenating skin with vitamin C.',
        fullDescription: 'Vitamin C facial is a potent antioxidant treatment utilizing high concentrations of vitamin C (ascorbic acid) to brighten, protect, and rejuvenate the skin. Vitamin C is essential for collagen synthesis, making it a powerful anti-aging ingredient. This facial neutralizes free radicals from sun exposure and pollution, fades hyperpigmentation and sun spots, evens skin tone, and boosts radiance. The treatment typically includes vitamin C-infused cleansers, exfoliants, serums, and masks, often combined with other antioxidants like vitamin E and ferulic acid for enhanced effectiveness. Regular treatments result in brighter, more even-toned, protected, and youthful-looking skin.',
        benefits: ['Brightens skin tone', 'Fades dark spots', 'Boosts collagen production', 'Provides antioxidant protection', 'Evens complexion', 'Protects against environmental damage'],
        duration: '60 minutes',
        intensity: 'Moderate',
        bestFor: ['Dull skin', 'Sun damage', 'Uneven tone', 'Anti-aging']
    },
    {
        name: 'Organic/Natural Facial',
        shortDescription: 'Pure, eco-friendly treatment using only natural, chemical-free ingredients for gentle, effective skincare.',
        fullDescription: 'Organic/natural facial is a wholesome treatment using only certified organic, natural, and plant-based ingredients free from synthetic chemicals, parabens, sulfates, and artificial fragrances. This eco-conscious facial harnesses the power of botanical extracts, essential oils, natural clays, and fruit enzymes to cleanse, nourish, and rejuvenate the skin. Each product is carefully selected for its purity and efficacy, providing gentle yet effective skincare suitable for all skin types, especially sensitive skin. This treatment not only benefits your skin but also supports environmental sustainability, offering a natural path to healthy, beautiful skin without harsh chemicals.',
        benefits: ['Chemical-free skincare', 'Gentle and nourishing', 'Suitable for sensitive skin', 'Environmentally friendly', 'Rich in natural vitamins', 'No harsh ingredients'],
        duration: '60-75 minutes',
        intensity: 'Gentle',
        bestFor: ['Sensitive skin', 'Natural beauty', 'Eco-conscious', 'Chemical sensitivity']
    },
    {
        name: 'Men\'s Facial',
        shortDescription: 'Tailored facial treatment addressing men\'s specific skin concerns including oil control and shaving irritation.',
        fullDescription: 'Men\'s facial is specifically designed to address the unique skincare needs of male skin, which tends to be thicker, oilier, and more prone to irritation from daily shaving. This targeted treatment includes deep cleansing to remove excess oil and impurities, exfoliation to prevent ingrown hairs, steam and extractions to clear congested pores, and a purifying mask. Special attention is given to the beard area and neck to soothe shaving irritation and razor burn. The facial concludes with products that control oil, minimize pores, and protect against environmental damage. This treatment helps men maintain healthy, clear, well-groomed skin.',
        benefits: ['Deep pore cleansing', 'Controls excess oil', 'Prevents ingrown hairs', 'Soothes shaving irritation', 'Reduces breakouts', 'Refreshes and invigorates'],
        duration: '60 minutes',
        intensity: 'Moderate',
        bestFor: ['Men\'s skin', 'Oily skin', 'Shaving irritation', 'Congested pores']
    },
    {
        name: 'Lulur Facial',
        shortDescription: 'Traditional Indonesian beauty treatment using turmeric and rice powder for glowing, radiant skin.',
        fullDescription: 'Lulur facial is an authentic Indonesian beauty ritual that has been used by Javanese royalty for centuries. This traditional treatment uses a blend of finely ground rice, turmeric, sandalwood, and aromatic spices to exfoliate, brighten, and nourish the skin. The golden paste is gently massaged onto the face, providing gentle exfoliation while the turmeric\'s anti-inflammatory and brightening properties work their magic. After the paste is removed, a cooling yogurt mask soothes and hydrates the skin. This time-honored treatment leaves skin incredibly smooth, bright, and glowing with a healthy radiance, embodying Indonesia\'s rich wellness heritage.',
        benefits: ['Natural skin brightening', 'Gentle exfoliation', 'Anti-inflammatory benefits', 'Improves skin tone', 'Traditional healing', 'Creates golden glow'],
        duration: '60-75 minutes',
        intensity: 'Gentle',
        bestFor: ['All skin types', 'Dull skin', 'Cultural experience', 'Natural beauty']
    },
    {
        name: 'Javanese Facial',
        shortDescription: 'Ancient Indonesian beauty ritual combining traditional herbs, massage, and healing techniques for holistic skin wellness.',
        fullDescription: 'Javanese facial is an ancient Indonesian healing and beauty treatment that combines herbal remedies, gentle massage, and spiritual wellness practices. This holistic facial uses traditional Indonesian medicinal herbs, flowers, and spices known for their healing and beautifying properties. The treatment includes cleansing with natural ingredients, gentle facial massage using techniques passed down through generations, application of herbal masks made from freshly ground ingredients, and aromatherapy with Indonesian essential oils. This deeply relaxing and culturally rich treatment not only improves skin health but also promotes inner peace and spiritual balance, offering a complete mind-body-skin experience.',
        benefits: ['Holistic skin wellness', 'Natural herbal healing', 'Promotes relaxation', 'Improves circulation', 'Cultural authenticity', 'Balances mind and body'],
        duration: '75-90 minutes',
        intensity: 'Gentle',
        bestFor: ['Holistic wellness', 'Stress relief', 'Cultural experience', 'Sensitive skin']
    },
    {
        name: 'Herbal Facial',
        shortDescription: 'Natural healing treatment using medicinal herbs and botanical extracts for rejuvenation and skin health.',
        fullDescription: 'Herbal facial is a therapeutic treatment harnessing the healing power of medicinal herbs, plants, and botanical extracts. This natural approach to skincare uses fresh or dried herbs specifically selected for their individual skin benefits - chamomile for soothing, lavender for calming, green tea for antioxidants, rosemary for stimulation, and many others. The treatment includes herbal steam to open pores and allow botanical essences to penetrate deeply, application of herbal-infused products, and fresh herbal masks tailored to your skin\'s needs. This gentle yet effective treatment provides vitamin-rich nourishment, healing properties, and aromatic therapy for complete skin wellness.',
        benefits: ['Natural healing properties', 'Rich in antioxidants', 'Soothes and calms', 'Addresses specific concerns', 'Aromatherapy benefits', 'Chemical-free treatment'],
        duration: '60-75 minutes',
        intensity: 'Gentle',
        bestFor: ['Natural skincare', 'Sensitive skin', 'Stressed skin', 'Holistic health']
    }
];

// Helper function to get detailed information for a facial type
export const getFacialTypeDetails = (facialType: string): FacialTypeInfo | undefined => {
    return FACIAL_TYPE_DETAILS.find(
        f => f.name.toLowerCase() === facialType.toLowerCase()
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
    },
    { 
        name: 'Feet', 
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/foot%20massage.png?updatedAt=1767211778688'
    },
    { 
        name: 'Hands', 
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/hand%20massage.png?updatedAt=1767211549476'
    },
    { 
        name: 'Facial', 
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/antic%20aging.png?updatedAt=1764966155682'
    },
    { 
        name: 'Traditional', 
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20deep%20tissue%20indoniseas.png?updatedAt=1762579867409'
    },
    { 
        name: 'Body Scrub', 
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/body%20scrube.png'
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
