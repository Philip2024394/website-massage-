// Enhanced Ebook PDF Generator Utility - Indonesian & English Support
// This utility converts ebook data to a viewable PDF format with bilingual content

export interface EbookData {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  description: string;
  coinPrice: number;
  category: string;
  imageUrl: string;
  chapters: {
    title: string;
    content: string;
  }[];
  publishDate: string;
  pages: number;
  language?: string;
  alternateLanguage?: EbookData;
}

// Enhanced Professional Massage Guide - English Version
export const massageDosAndDontsEbook: EbookData = {
  id: 'massage-professional-guide-en',
  title: "The Complete Professional Massage Therapy Guide",
  subtitle: 'Advanced Guidelines for Excellence in Therapeutic Practice - English & Indonesian Edition',
  author: 'IndaStreet Massage Academy - International Edition',
  description: 'Comprehensive 50-page professional guide covering advanced massage therapy techniques, safety protocols, business practices, legal requirements, and international standards. Available in both English and Indonesian languages with culturally adapted content for Indonesian practitioners.',
  coinPrice: 50,
  category: 'Professional Training',
  imageUrl: 'https://via.placeholder.com/400x600/2c3e50/ffffff?text=PROFESSIONAL+MASSAGE+GUIDE',
  pages: 50,
  publishDate: '2025-11-14',
  language: 'English',
  chapters: [
    {
      title: 'Chapter 1: Foundations of Professional Massage Therapy',
      content: `# Chapter 1: Foundations of Professional Massage Therapy
## Bab 1: Dasar-dasar Terapi Pijat Profesional

### The Evolution of Therapeutic Touch
### Evolusi Sentuhan Terapeutik

**English:**
Massage therapy represents one of humanity's oldest healing arts, with documented practices spanning over 5,000 years across diverse cultures. From ancient Chinese medicine and Ayurvedic traditions to modern Western therapeutic approaches, massage continues to evolve as a respected healthcare profession.

**Indonesian:**
Terapi pijat merupakan salah satu seni penyembuhan tertua manusia, dengan praktik terdokumentasi selama lebih dari 5.000 tahun di berbagai budaya. Dari pengobatan Tiongkok kuno dan tradisi Ayurveda hingga pendekatan terapeutik Barat modern, pijat terus berkembang sebagai profesi kesehatan yang dihormati.

### Educational Requirements | Persyaratan Pendidikan

**English Requirements:**
- Minimum 500-1000 hours of accredited training
- Anatomy, physiology, pathology studies
- Hands-on technique training across multiple modalities
- Ethics and business practices education
- CPR/First Aid certification

**Indonesian Requirements:**
- Minimal 500-1000 jam pelatihan terakreditasi
- Studi anatomi, fisiologi, patologi
- Pelatihan teknik langsung di berbagai modalitas
- Pendidikan etika dan praktik bisnis
- Sertifikasi CPR/Pertolongan Pertama

### Indonesian Traditional Massage Heritage

**Traditional Indonesian Practices:**
- Pijat refleksi (reflexology massage)
- Pijat tradisional Jawa (traditional Javanese massage)
- Urut Melayu (Malay traditional massage)
- Bekam (cupping therapy)
- Integration with modern techniques`
    },
    {
      title: 'Chapter 2: Comprehensive Safety Protocols',
      content: `# Chapter 2: Comprehensive Safety Protocols
## Bab 2: Protokol Keselamatan Komprehensif

### Creating Safe Treatment Environments

**English:**
Safety in massage therapy extends far beyond basic hygiene, encompassing physical, emotional, and professional dimensions that protect both therapists and clients.

**Indonesian:**
Keselamatan dalam terapi pijat jauh melampaui kebersihan dasar, mencakup dimensi fisik, emosional, dan profesional yang melindungi terapis dan klien.

### Climate-Adapted Safety for Indonesia

**Tropical Climate Considerations:**
- High humidity effects on equipment and hygiene
- Temperature control in tropical settings
- Mold and fungus prevention strategies
- Enhanced ventilation requirements
- Air conditioning and circulation needs

### Indonesian Health Regulations

**Ministry of Health Guidelines:**
- Health certificate requirements for practitioners
- Facility licensing and safety standards
- Regular health inspections
- COVID-19 protocols adaptation
- Coordination with local Puskesmas

### Emergency Preparedness in Indonesia

**Indonesian Emergency Services:**
- Ambulans: 118 or 119
- Fire Department: 113
- Police: 110
- Nearest hospital locations
- Medical referral protocols`
    },
    {
      title: 'Chapter 3: Advanced Body Mechanics and Ergonomics',
      content: `# Chapter 3: Advanced Body Mechanics and Ergonomics
## Bab 3: Mekanika Tubuh dan Ergonomi Lanjutan

### Protecting Your Career Longevity

**English:**
As a massage therapist, your body is your primary tool. Proper body mechanics and ergonomic principles are essential for career longevity and injury prevention.

**Indonesian:**
Sebagai terapis pijat, tubuh Anda adalah alat utama. Mekanika tubuh yang tepat dan prinsip ergonomis sangat penting untuk umur karir yang panjang dan pencegahan cedera.

### Indonesian Traditional Techniques Integration

**Traditional Postures and Modern Adaptation:**
- Floor-based massage positions (pijat lantai)
- Cross-legged therapist positioning
- Integration with modern table work
- Traditional tool usage (bamboo, coconut shells)
- Climate considerations for Indonesian practitioners

### Climate-Specific Ergonomics

**Tropical Environment Adaptations:**
- Hydration requirements in high humidity
- Clothing selection for comfort and professionalism
- Sweat management during treatments
- Air circulation and fan usage
- Energy conservation in hot weather`
    },
    {
      title: 'Chapter 4: Professional Communication Excellence',
      content: `# Chapter 4: Professional Communication Excellence
## Bab 4: Keunggulan Komunikasi Profesional

### Cultural Communication in Indonesia

**Indonesian Cultural Considerations:**
- Respect for hierarchy and age (hormat pada hierarki dan usia)
- Indirect communication styles
- Religious and spiritual sensitivities
- Gender-specific communication needs
- Regional language variations

### Essential Indonesian Phrases for Practice

**Consultation Phrases:**
- "Selamat datang, bagaimana kabar Anda?" (Welcome, how are you?)
- "Ada keluhan atau nyeri tertentu?" (Any specific complaints or pain?)
- "Tekanan seperti apa yang Anda sukai?" (What pressure do you prefer?)
- "Silakan beri tahu jika tidak nyaman" (Please let me know if uncomfortable)

**Regional Greetings:**
- Javanese: "Sugeng rawuh" (Welcome)
- Sundanese: "Wilujeng sumping" (Welcome) 
- Balinese: "Om Swastiastu" (May you be blessed)

### Religious and Cultural Sensitivities

**Islamic Considerations:**
- Same-gender therapist preferences
- Prayer time scheduling
- Halal product requirements
- Modest draping requirements
- Ramadan fasting considerations

**Hindu-Balinese Considerations:**
- Sacred day restrictions (Nyepi, Galungan)
- Traditional blessing practices
- Temple ceremony scheduling`
    },
    {
      title: 'Chapter 5: Enhanced Hygiene and Sanitation',
      content: `# Chapter 5: Enhanced Hygiene and Sanitation
## Bab 5: Kebersihan dan Sanitasi yang Ditingkatkan

### Tropical Climate Hygiene Adaptations

**Enhanced Protocols for Indonesian Climate:**
- Increased cleaning frequency due to high humidity
- Mold and fungus prevention strategies
- Enhanced air filtration systems
- Dehumidification procedures
- UV sanitization for equipment

### Traditional Indonesian Natural Disinfectants

**Natural Antimicrobial Agents:**
- Turmeric (kunyit) - antibacterial properties
- Lemongrass (sereh) - antimicrobial effects
- Coconut oil (minyak kelapa) - antifungal benefits
- Betel leaf (daun sirih) - antiseptic qualities
- Lime (jeruk nipis) - natural cleaning agent

### Indonesian Health Ministry Standards

**Required Documentation:**
- Health certificate from licensed physician
- Annual communicable disease screenings
- Vaccination records (Hepatitis B, Tetanus)
- Mental health clearance
- Drug-free certification

### Tropical Disease Awareness

**Common Regional Health Concerns:**
- Dengue fever screening protocols
- Malaria history assessment
- Skin infection identification
- Heat-related illness recognition
- Fungal condition awareness`
    },
    {
      title: 'Chapter 6: Cultural Client Assessment',
      content: `# Chapter 6: Cultural Client Assessment and Treatment Planning
## Bab 6: Penilaian Klien Budaya dan Perencanaan Perawatan

### Indonesian Traditional Health Concepts

**Traditional Health Philosophy:**
- "Sehat jasmani dan rohani" (Physical and spiritual health)
- Balance between hot and cold elements (panas-dingin)
- Harmony with nature and community
- Prevention through healthy lifestyle
- Integration of modern and traditional approaches

### Regional Health Assessment Variations

**Javanese Health Concepts:**
- Traditional herbal medicine integration (jamu)
- Spiritual cleansing considerations
- Family involvement in health decisions
- "Ora pareng" (activity restrictions during illness)

**Balinese Health Concepts:**
- Tri Hita Karana (three harmonies)
- Hindu calendar health considerations
- Ceremonial cleansing requirements
- Traditional healer consultation history

### Indonesian Pain Assessment Terms

**Common Pain Descriptors:**
- "Pegal-pegal" (stiff and sore)
- "Nyeri" (pain/ache)
- "Sakit" (hurt/illness)
- "Kaku" (stiff)
- "Linu" (rheumatic pain)
- "Kesemutan" (tingling sensation)

### Cultural Treatment Goals

**Indonesian Healthcare Priorities:**
- Return to family and community responsibilities
- Maintenance of work productivity
- Spiritual and emotional well-being
- Prevention of future health issues
- Integration with traditional healing methods`
    },
    {
      title: 'Chapter 7: Advanced Therapeutic Techniques',
      content: `# Chapter 7: Advanced Therapeutic Techniques
## Bab 7: Teknik Terapeutik Lanjutan

### Indonesian Traditional Massage Integration

**Pijat Tradisional Jawa (Traditional Javanese Massage):**
- Deep pressure using palm and knuckles
- Energy line pathway focus (meridian)
- Herbal compress integration (boreh)
- Spiritual cleansing through touch
- Family treatment traditions

**Indonesian Reflexology (Pijat Refleksi):**
- Foot pressure point mapping
- Hand reflexology techniques
- Ear acupressure methods
- Aromatherapy integration
- Diagnostic foot examination

### Regional Massage Techniques

**Urut Melayu (Malay Traditional Massage):**
- Gentle flowing movements
- Coconut oil applications
- Pregnancy and postpartum specialization
- Herbal steam integration

**Balinese Traditional Massage:**
- Deep tissue pressure with palms
- Acupressure point stimulation
- Aromatic oil blending
- Spiritual energy balancing

### Traditional Tools and Modern Integration

**Indonesian Massage Tools:**
- Bamboo tools (alat bambu) for deep pressure
- Coconut shell scrapers (kerok kelapa)
- Volcanic hot stone therapy
- Herbal compress balls
- Traditional oil warmers

### Herbal Integration Protocols

**Traditional Indonesian Therapeutic Herbs:**
- Turmeric (kunyit) - anti-inflammatory
- Ginger (jahe) - circulation enhancement
- Lemongrass (sereh) - aromatherapy benefits
- Pandan leaves - calming effects
- Cinnamon bark - warming properties`
    },
    {
      title: 'Chapter 8: Business Ethics and Indonesian Legal Framework',
      content: `# Chapter 8: Business Ethics and Indonesian Legal Framework
## Bab 8: Etika Bisnis dan Kerangka Hukum Indonesia

### Indonesian Healthcare Regulations

**Ministry of Health Requirements:**
- Health practitioner registration
- Facility licensing and permits
- Regular health inspections
- Continuing education compliance
- Insurance and liability coverage

### Business License Requirements

**Required Documentation:**
- SIUP (Surat Izin Usaha Perdagangan) - Trading License
- TDP (Tanda Daftar Perusahaan) - Company Registration
- NPWP (Nomor Pokok Wajib Pajak) - Tax ID Number
- IMB (Izin Mendirikan Bangunan) - Building Permit
- Domicile Certificate (Surat Keterangan Domisili)

### Indonesian Business Culture Ethics

**Cultural Considerations:**
- "Bapakisme" - respect for authority and hierarchy
- "Gotong royong" - community cooperation principles
- Religious sensitivity in business practices
- Family-oriented decision making
- Regional cultural variations

### Professional Boundaries in Indonesian Context

**Gender and Religious Considerations:**
- Islamic guidelines for opposite-gender treatment
- Cultural modesty requirements
- Family approval for treatment decisions
- Religious holiday scheduling
- Chaperone requirements when needed

### Financial Ethics and Market Considerations

**Indonesian Market Adaptations:**
- Economic disparity accommodation
- Sliding scale pricing
- Government healthcare integration
- Traditional healer pricing comparisons
- Corporate wellness programs`
    },
    {
      title: 'Chapter 9: Professional Development and Future of Indonesian Massage Therapy',
      content: `# Chapter 9: Professional Development and Future of Indonesian Massage Therapy
## Bab 9: Pengembangan Profesional dan Masa Depan Terapi Pijat Indonesia

### Indonesian Professional Associations

**Major Organizations:**
- PPKTI (Persatuan Pijat Kesehatan Tradisional Indonesia)
- APMI (Asosiasi Pijat Medis Indonesia)
- IHMA (Indonesian Holistic Massage Association)
- Regional spa and wellness associations

### Continuing Education Requirements

**Annual Standards:**
- Minimum 20 hours continuing education
- Ethics and professional conduct (2 hours)
- Safety and hygiene updates (4 hours)
- New technique training (8 hours)
- Business and legal compliance (6 hours)

### High-Demand Specializations in Indonesia

**Growing Market Areas:**
- Medical massage for chronic conditions
- Prenatal and postpartum massage
- Geriatric massage for aging population
- Sports massage for fitness industry growth
- Corporate wellness programs
- Tourism and hospitality services

### Technology Integration

**Emerging Technologies in Indonesian Practice:**
- Electronic health records systems
- Online booking platforms
- Telehealth consultation integration
- Mobile massage service apps
- Virtual reality relaxation therapy

### Research and Evidence-Based Practice

**Indonesian Massage Research:**
- University research partnerships
- Traditional medicine efficacy studies
- Clinical outcome measurement
- Cultural adaptation research
- Integration with modern healthcare

### Building Sustainable Practice

**Long-term Success Strategies:**
- Diversified service offerings
- Multiple revenue streams
- Professional network building
- Community health involvement
- International collaboration

### The Impact of Professional Practice

When massage therapists adhere to professional standards, the benefits extend to:

- Improved public health outcomes
- Reduced healthcare costs through prevention
- Enhanced quality of life for clients
- Economic growth in wellness sectors
- Preservation of cultural healing traditions
- International recognition of Indonesian practices

### Conclusion

Professional massage therapy represents a bridge between ancient healing wisdom and modern healthcare science. By maintaining high standards while honoring cultural traditions, massage therapists contribute to a healthier, more balanced society.

**About IndaStreet Massage Academy**

IndaStreet Massage Academy is committed to advancing professional massage therapy education in Indonesia through comprehensive training programs that integrate traditional Indonesian healing practices with international standards of excellence.

For more information: www.indastreetmassage.com`
    }
  ]
};

// PDF Generation Function
export const generateEbook = (ebook: EbookData): string => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="${ebook.language === 'Indonesian' ? 'id' : 'en'}">
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
                page-break-inside: avoid;
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
            
            h3 {
                color: #2c3e50;
                margin-top: 25px;
                font-size: 1.2em;
            }
            
            p {
                margin: 15px 0;
                text-align: justify;
            }
            
            strong {
                color: #2c3e50;
                font-weight: 600;
            }
            
            ul, ol {
                margin: 15px 0;
                padding-left: 30px;
            }
            
            li {
                margin: 8px 0;
                line-height: 1.5;
            }
            
            .bilingual-section {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin: 20px 0;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
            }
            
            @media print {
                body { background: white; }
                .chapter { box-shadow: none; border: 1px solid #ddd; }
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
                ${ebook.pages} Pages | ${ebook.language} Edition
            </div>
        </div>

        ${ebook.chapters.map(chapter => `
            <div class="chapter">
                ${chapter.content
                  .replace(/### (.*)/g, '<h3>$1</h3>')
                  .replace(/## (.*)/g, '<h2>$1</h2>')
                  .replace(/# (.*)/g, '<h1>$1</h1>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/^\- (.*)/gm, '<li>$1</li>')
                  .replace(/\n\n/g, '</p><p>')
                  .replace(/^(?!<[h|l|s])/gm, '<p>')
                  .replace(/(?<![>])$/gm, '</p>')
                }
            </div>
        `).join('')}

        <div style="margin-top: 60px; padding: 30px 0; border-top: 2px solid #2c3e50; text-align: center; color: #7f8c8d;">
            <p><strong>© 2025 IndaStreet Massage Academy. All rights reserved.</strong></p>
            <p>For more professional development resources, visit: <strong>www.indastreetmassage.com</strong></p>
            <p><em>Available in both English and Indonesian | Tersedia dalam bahasa Inggris dan Indonesia</em></p>
        </div>
    </body>
    </html>
  `;

  return htmlContent;
};