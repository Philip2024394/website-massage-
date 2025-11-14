// Test - Simple Ebook Utils
export interface EbookData {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  description: string;
  coinPrice: number;
  category: string;
  imageUrl: string;
  chapters: Array<{
    title: string;
    content: string;
  }>;
  publishDate: string;
  pages: number;
  language?: string;
}

export const massageDosAndDontsEbook: EbookData = {
  id: 'massage-professional-guide-en',
  title: "Professional Massage Therapy Guide",
  subtitle: 'English & Indonesian Edition',
  author: 'IndaStreet Massage Academy',
  description: 'Comprehensive professional guide covering massage therapy techniques, safety protocols, and cultural adaptations for Indonesian practitioners.',
  coinPrice: 50,
  category: 'Professional Training',
  imageUrl: 'https://via.placeholder.com/400x600/2c3e50/ffffff?text=MASSAGE+GUIDE',
  pages: 50,
  publishDate: '2025-11-14',
  language: 'English',
  chapters: [
    {
      title: 'Chapter 1: Professional Massage Foundations / Bab 1: Dasar-dasar Pijat Profesional',
      content: 'Professional massage therapy represents one of the most respected healing arts, combining ancient wisdom with modern scientific understanding. / Terapi pijat profesional mewakili salah satu seni penyembuhan yang paling dihormati, menggabungkan kebijaksanaan kuno dengan pemahaman ilmiah modern. This comprehensive guide explores both Western massage techniques and traditional Indonesian healing methods such as "Pijat Tradisional" and "Urut." Understanding the cultural significance of touch therapy in Indonesian society helps create more meaningful therapeutic relationships. Key principles include respect for the client, professional boundaries, and continuous learning.'
    },
    {
      title: 'Chapter 2: Safety and Hygiene Protocols / Bab 2: Protokol Keamanan dan Kebersihan',
      content: 'Safety in massage therapy encompasses physical, emotional, and professional dimensions that protect both therapists and clients. / Keamanan dalam terapi pijat mencakup dimensi fisik, emosional, dan profesional yang melindungi terapis dan klien. Essential protocols include: thorough hand washing before and after each session, using fresh linens for every client, sanitizing equipment between treatments, maintaining clean workspace, and conducting health assessments. In Indonesian culture, cleanliness ("Kebersihan") is considered sacred - "Kebersihan sebagian dari iman" (Cleanliness is part of faith). This cultural value perfectly aligns with professional massage standards.'
    },
    {
      title: 'Chapter 3: Client Communication / Bab 3: Komunikasi dengan Klien',
      content: 'Effective communication builds trust and ensures optimal therapeutic outcomes. / Komunikasi yang efektif membangun kepercayaan dan memastikan hasil terapeutik yang optimal. Key elements include: obtaining informed consent, explaining procedures clearly, respecting cultural preferences, and maintaining professional dialogue. In Indonesian service culture, showing respect through polite language ("Bahasa sopan") creates welcoming environments. Use respectful phrases like "Permisi" (excuse me), "Mohon maaf" (I apologize), and "Terima kasih" (thank you). Always ask about pressure preferences and comfort levels throughout the session.'
    },
    {
      title: 'Chapter 4: Traditional Indonesian Techniques / Bab 4: Teknik Tradisional Indonesia',
      content: 'Indonesia possesses rich heritage of traditional healing practices that enhance modern massage therapy. / Indonesia memiliki warisan kaya praktik penyembuhan tradisional yang meningkatkan terapi pijat modern. Traditional methods include: "Pijat Refleksi" (reflexology focusing on pressure points), "Urut Tradisional" (traditional massage using herbal oils), "Pijat Batu Panas" (hot stone therapy), and "Pijat Kerok" (scraping massage). These techniques emphasize energy flow ("Aliran energi"), holistic healing, and spiritual wellness. When incorporating traditional methods, always honor their cultural significance and practice with proper training.'
    },
    {
      title: 'Chapter 5: Modern Western Techniques / Bab 5: Teknik Barat Modern',
      content: 'Contemporary massage incorporates scientific understanding of anatomy, physiology, and therapeutic principles. / Pijat kontemporer menggabungkan pemahaman ilmiah anatomi, fisiologi, dan prinsip terapeutik. Primary techniques include: Swedish massage for relaxation and circulation, Deep tissue massage for chronic tension, Sports massage for athletic performance, Trigger point therapy for pain relief, and Myofascial release for structural issues. Each technique requires specific training in muscle anatomy, pressure application, and contraindications. Understanding both Eastern and Western approaches creates comprehensive treatment options.'
    },
    {
      title: 'Chapter 6: Business Ethics / Bab 6: Etika Bisnis',
      content: 'Professional conduct maintains the integrity and reputation of massage therapy practice. / Perilaku profesional menjaga integritas dan reputasi praktik terapi pijat. Core principles include: maintaining strict client confidentiality, respecting physical and emotional boundaries, providing honest pricing, continuing professional education, and ethical advertising. In Indonesian business culture, building long-term relationships ("Hubungan jangka panjang") and maintaining good reputation ("Nama baik") are essential for sustainable success. Always prioritize client well-being over financial gain.'
    },
    {
      title: 'Chapter 7: Health Benefits and Contraindications / Bab 7: Manfaat Kesehatan dan Kontraindikasi',
      content: 'Understanding therapeutic benefits and treatment limitations ensures safe, effective practice. / Memahami manfaat terapeutik dan keterbatasan perawatan memastikan praktik yang aman dan efektif. Documented benefits include: stress reduction, improved circulation, pain management, enhanced flexibility, better sleep quality, and emotional wellness. Important contraindications include: acute injuries, fever, infectious conditions, certain medical conditions, and pregnancy complications. Always conduct thorough health screenings and maintain professional relationships with healthcare providers for appropriate referrals.'
    },
    {
      title: 'Chapter 8: Creating Healing Environments / Bab 8: Menciptakan Lingkungan Penyembuhan',
      content: 'The treatment environment significantly impacts therapeutic effectiveness and client satisfaction. / Lingkungan perawatan secara signifikan mempengaruhi efektivitas terapeutik dan kepuasan klien. Essential elements include: comfortable temperature control, soft ambient lighting, calming background music, pleasant aromatherapy, spotless facilities, and peaceful atmosphere. Indonesian culture emphasizes creating harmony ("Keharmonisan") in environments, showing respect for guests and enhancing healing processes. Consider incorporating traditional elements like essential oils from Indonesian plants such as eucalyptus, lemongrass, or pandan.'
    },
    {
      title: 'Chapter 9: Professional Development / Bab 9: Pengembangan Profesional',
      content: 'Continuous learning ensures high-quality service and career advancement in massage therapy. / Pembelajaran berkelanjutan memastikan layanan berkualitas tinggi dan kemajuan karir dalam terapi pijat. Development opportunities include: continuing education courses, professional workshops, industry conferences, peer mentoring, and specialty certifications. Indonesian culture values "Belajar sepanjang hayat" (lifelong learning), emphasizing continuous improvement and skill development. Join professional associations, maintain current certifications, stay informed about industry trends, and seek feedback from clients and colleagues to excel in this rewarding profession.'
    }
  ]
};

export const generateEbook = (ebook: EbookData): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${ebook.title}</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9f9f9;
            }
            
            .cover {
                background: linear-gradient(135deg, #2c3e50, #3498db);
                color: white;
                text-align: center;
                padding: 60px 40px;
                border-radius: 15px;
                margin-bottom: 40px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            }
            
            .cover .title {
                font-size: 2.5em;
                font-weight: bold;
                margin-bottom: 20px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            
            .cover .subtitle {
                font-size: 1.2em;
                margin-bottom: 30px;
                opacity: 0.9;
            }
            
            .cover .author {
                font-size: 1.1em;
                font-style: italic;
                margin-bottom: 20px;
            }
            
            .chapter {
                background: white;
                margin-bottom: 30px;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            
            h1 {
                color: #2c3e50;
                border-bottom: 3px solid #3498db;
                padding-bottom: 15px;
                margin-top: 0;
                font-size: 1.8em;
            }
            
            h2 {
                color: #34495e;
                margin-top: 35px;
                font-size: 1.4em;
                border-left: 4px solid #3498db;
                padding-left: 15px;
            }
            
            p {
                margin: 15px 0;
                text-align: justify;
            }
            
            strong {
                color: #2c3e50;
                font-weight: 600;
            }
        </style>
    </head>
    <body>
        <div class="cover">
            <div class="title">${ebook.title}</div>
            <div class="subtitle">${ebook.subtitle}</div>
            <div class="author">by ${ebook.author}</div>
            <div style="margin-top: 20px; color: rgba(255,255,255,0.9);">
                Published: ${new Date(ebook.publishDate).toLocaleDateString()}<br>
                ${ebook.pages} Pages
            </div>
        </div>

        ${ebook.chapters.map(chapter => `
            <div class="chapter">
                <h1>${chapter.title}</h1>
                <p>${chapter.content}</p>
            </div>
        `).join('')}

        <div style="margin-top: 60px; padding: 30px 0; border-top: 2px solid #2c3e50; text-align: center; color: #7f8c8d;">
            <p><strong>© 2025 IndaStreet Massage Academy. All rights reserved.</strong></p>
            <p>For more professional development resources, visit: <strong>www.indastreetmassage.com</strong></p>
        </div>
    </body>
    </html>
  `;
};