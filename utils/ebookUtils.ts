// Ebook PDF Generator Utility
// This utility converts markdown content to a viewable PDF format

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
}

// Massage Do's and Don'ts Ebook Data
export const massageDosAndDontsEbook: EbookData = {
  id: 'massage-dos-donts-guide',
  title: "Massage Do's and Don'ts: A Complete Guide",
  subtitle: 'Professional Guidelines for Safe and Effective Massage Therapy',
  author: 'IndaStreet Massage Academy',
  description: 'Comprehensive guide covering essential massage therapy guidelines, safety protocols, professional ethics, and best practices for both therapists and clients.',
  coinPrice: 75,
  category: 'Professional Training',
  imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage-ebook-cover.png?updatedAt=1699027200000', // You'll need to create this
  pages: 24,
  publishDate: '2025-11-14',
  chapters: [
    {
      title: 'Chapter 1: Introduction to Professional Massage Therapy',
      content: `# Chapter 1: Introduction to Professional Massage Therapy

## The Foundation of Excellence in Massage Practice

Professional massage therapy is both an art and a science, requiring a delicate balance of technical skill, intuitive touch, and unwavering commitment to client wellbeing. As the massage therapy industry continues to grow and evolve, maintaining the highest standards of practice becomes increasingly important for both individual success and the profession's reputation.

### Understanding Professional Standards

Professional massage therapy goes far beyond simply applying pressure to muscles. It encompasses:

- **Clinical Knowledge**: Understanding anatomy, physiology, pathology, and therapeutic applications
- **Technical Proficiency**: Mastering various massage techniques and modalities
- **Ethical Practice**: Maintaining appropriate boundaries and professional conduct
- **Safety Awareness**: Recognizing and preventing potential risks or complications
- **Continuing Education**: Staying current with industry developments and best practices

### The Impact of Professional Practice

When massage therapists adhere to professional standards and best practices, the benefits extend to:

**For Clients:**
- Enhanced therapeutic outcomes and faster healing
- Increased confidence and trust in massage therapy
- Safer treatment experiences with reduced risk of injury
- Better understanding of treatment benefits and expectations

**For Therapists:**
- Reduced liability and legal risks
- Increased client satisfaction and retention
- Enhanced professional reputation and referrals
- Greater career longevity and job satisfaction
- Improved earning potential through excellence

**For the Profession:**
- Elevated public perception and respect
- Increased integration with healthcare systems
- Better insurance coverage and recognition
- Enhanced regulatory support and professional protection

### Professional Development Commitment

Professional massage therapy requires a lifelong commitment to learning and improvement. This guide provides a foundation, but ongoing education through continuing education courses, professional associations, peer collaboration, and industry research will ensure you remain at the forefront of professional practice.

Remember: Every client interaction is an opportunity to represent the massage therapy profession with excellence, integrity, and dedication to healing.`
    },
    {
      title: 'Chapter 2: Essential Safety Do\'s and Don\'ts',
      content: `# Chapter 2: Essential Safety Do's and Don'ts

## Prioritizing Client and Therapist Safety in Every Session

Safety is the cornerstone of professional massage therapy. Every technique, every client interaction, and every treatment decision should prioritize the wellbeing of both client and therapist.

### ✅ DO: Conduct Comprehensive Health Screening

**Always perform a thorough health assessment before beginning any massage treatment:**

- Review detailed health history forms and intake questionnaires
- Ask specific questions about current medications, recent injuries, or surgeries
- Inquire about pain levels, stress factors, and treatment goals
- Assess for contraindications that might require modification or referral
- Document all findings clearly in client records
- Update health information at each subsequent visit

### ❌ DON'T: Skip or Rush the Assessment Process

**Never compromise on safety screening, even for regular clients:**

- Don't assume previous assessments are sufficient for repeat clients
- Don't rely solely on verbal communication without written documentation
- Don't proceed with treatment if you have any safety concerns
- Don't ignore client discomfort or reluctance to discuss health issues

### ✅ DO: Start Conservatively and Progress Gradually

**Always begin with lighter pressure and build intensity based on client response:**

- Start every session with gentle, warming strokes
- Check in frequently about pressure preferences and comfort levels
- Observe client's breathing, muscle tension, and non-verbal cues
- Adjust pressure immediately if client shows signs of discomfort
- Remember that "no pain, no gain" is NOT appropriate for massage therapy

### Emergency Preparedness

**Maintain readiness to respond appropriately to any emergency:**

- Know basic first aid and CPR procedures
- Have emergency contact numbers immediately accessible
- Understand when to stop treatment and seek medical assistance
- Keep detailed incident report forms available
- Maintain current liability insurance and professional credentials`
    },
    {
      title: 'Chapter 3: Professional Ethics and Boundaries',
      content: `# Chapter 3: Professional Ethics and Boundaries

## Maintaining Professional Integrity and Client Trust

Professional ethics and boundaries form the foundation of trustworthy massage therapy practice. Clear boundaries protect both clients and therapists, ensuring therapeutic relationships remain professional, safe, and beneficial.

### ✅ DO: Establish Clear Professional Boundaries

**Create a framework that protects both client and therapist:**

- Clearly explain your scope of practice and limitations during initial consultation
- Establish treatment goals that align with your professional capabilities
- Maintain consistent professional demeanor throughout all interactions
- Set clear policies regarding session length, payment, cancellations, and rescheduling
- Explain draping procedures and consent processes before beginning treatment

### ✅ DO: Obtain and Maintain Informed Consent

**Ensure clients understand and agree to all aspects of treatment:**

- Explain massage techniques, benefits, and potential risks before treatment
- Describe what areas will be treated and how clients will be positioned
- Discuss draping procedures and client's right to maintain modesty
- Inform clients of their right to refuse, modify, or stop treatment at any time
- Document consent discussions and any client preferences or limitations

### ✅ DO: Safeguard Client Information Rigorously

**Maintain strict confidentiality standards for all client information:**

- Keep all client records, conversations, and personal information confidential
- Store client files securely with appropriate access controls
- Only discuss client cases with other healthcare providers when authorized
- Obtain written consent before sharing any client information
- Maintain confidentiality even after the therapeutic relationship ends

### Cultural Sensitivity and Respect

**Respect diverse backgrounds, beliefs, and comfort levels:**

- Ask about cultural preferences that might affect treatment approaches
- Respect religious or cultural requirements regarding modesty or touch
- Accommodate language barriers with interpreters when needed
- Recognize that comfort with touch varies significantly among cultures
- Adapt communication styles to meet individual client needs`
    }
    // Additional chapters would be added here - for brevity, showing first 3
  ]
};

export const generateEbookPDF = (ebook: EbookData): string => {
  // This creates a formatted HTML version that can be converted to PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>${ebook.title}</title>
        <style>
            body {
                font-family: 'Georgia', serif;
                line-height: 1.6;
                max-width: 800px;
                margin: 0 auto;
                padding: 40px 20px;
                background: #fff;
                color: #333;
            }
            .cover {
                text-align: center;
                margin-bottom: 60px;
                padding: 40px 0;
                border-bottom: 2px solid #e67e22;
            }
            .title {
                font-size: 2.5em;
                font-weight: bold;
                color: #2c3e50;
                margin-bottom: 10px;
            }
            .subtitle {
                font-size: 1.3em;
                color: #7f8c8d;
                margin-bottom: 30px;
                font-style: italic;
            }
            .author {
                font-size: 1.1em;
                color: #e67e22;
                font-weight: 500;
            }
            .chapter {
                margin: 40px 0;
                padding: 30px 0;
                border-bottom: 1px solid #ecf0f1;
            }
            .chapter:last-child {
                border-bottom: none;
            }
            .chapter h1 {
                color: #e67e22;
                font-size: 1.8em;
                margin-bottom: 20px;
                border-left: 4px solid #e67e22;
                padding-left: 15px;
            }
            .chapter h2 {
                color: #2c3e50;
                font-size: 1.4em;
                margin: 25px 0 15px 0;
            }
            .chapter h3 {
                color: #34495e;
                font-size: 1.2em;
                margin: 20px 0 10px 0;
            }
            .chapter ul {
                margin: 15px 0;
                padding-left: 25px;
            }
            .chapter li {
                margin: 8px 0;
            }
            .dos {
                background: #d5f4e6;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #27ae60;
                margin: 20px 0;
            }
            .donts {
                background: #fadbd8;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #e74c3c;
                margin: 20px 0;
            }
            .page-break {
                page-break-after: always;
            }
            @media print {
                body {
                    font-size: 12pt;
                    line-height: 1.5;
                }
                .chapter {
                    page-break-inside: avoid;
                }
            }
        </style>
    </head>
    <body>
        <div class="cover">
            <div class="title">${ebook.title}</div>
            <div class="subtitle">${ebook.subtitle}</div>
            <div class="author">by ${ebook.author}</div>
            <div style="margin-top: 20px; color: #7f8c8d;">
                Published: ${new Date(ebook.publishDate).toLocaleDateString()}<br>
                ${ebook.pages} Pages
            </div>
        </div>

        ${ebook.chapters.map(chapter => `
            <div class="chapter">
                ${chapter.content
                  .replace(/### (.*)/g, '<h3>$1</h3>')
                  .replace(/## (.*)/g, '<h2>$1</h2>')
                  .replace(/# (.*)/g, '<h1>$1</h1>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/- (.*)/g, '<li>$1</li>')
                  .replace(/\n\n/g, '</p><p>')
                  .replace(/^/, '<p>')
                  .replace(/$/, '</p>')
                  .replace(/### ✅ DO:(.*?)(?=###|\n\n|$)/gs, '<div class="dos"><h3>✅ DO:$1</div>')
                  .replace(/### ❌ DON\'T:(.*?)(?=###|\n\n|$)/gs, '<div class="donts"><h3>❌ DON\'T:$1</div>')
                }
            </div>
        `).join('')}

        <div style="margin-top: 60px; padding: 30px 0; border-top: 2px solid #e67e22; text-align: center; color: #7f8c8d;">
            <p><strong>© 2025 IndaStreet Massage Academy. All rights reserved.</strong></p>
            <p>For more professional development resources, visit: www.indastreetmassage.com</p>
        </div>
    </body>
    </html>
  `;

  return htmlContent;
};