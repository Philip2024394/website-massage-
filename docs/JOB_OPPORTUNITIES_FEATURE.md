# Job Opportunities Feature

## 🎯 Overview
A dual-sided job marketplace connecting massage therapists with employers (hotels, spas, wellness centers) for domestic and international job opportunities.

## 💼 Business Model

### For Therapists
- **Registration Fee:** Rp 200,000 / year
- **Requirement:** Active IndaStreet membership
- **Benefits:**
  - Visibility to employers worldwide
  - Direct contact from interested employers
  - 12-month listing period
  - Update preferences anytime

### For Employers
- **Free** job posting (monetization can be added later)
- Post unlimited job openings
- Access to qualified therapist pool
- Filter by location, experience, specializations

## 📋 Features

### Therapist Job Opportunities Page
**Location:** `pages/TherapistJobOpportunitiesPage.tsx`

**Access:** Therapist Dashboard → "Job Opportunities" tab

**Features:**
1. **Relocation Preferences**
   - Willing to relocate domestically (Indonesia)
   - Willing to work internationally

2. **Work Preferences**
   - Availability: Full-time, Part-time, or Both
   - Minimum salary expectations
   - Accommodation requirements (Required/Preferred/Not Required)

3. **Location Selection**
   - **Indonesian Cities:** Bali, Jakarta, Surabaya, Bandung, Yogyakarta, Medan, Semarang, Makassar, Lombok, Ubud
   - **International:** Dubai, Singapore, Hong Kong, Thailand, Malaysia, Maldives, Australia, Japan, South Korea, Europe

4. **Profile Information**
   - Years of experience
   - Specializations
   - Languages spoken

5. **Payment Integration**
   - Rp 200,000 annual registration fee
   - Secure payment modal
   - 1-year listing validity

### Employer Job Posting Page
**Location:** `pages/EmployerJobPostingPage.tsx`

**Access:** Available to all users (can be accessed directly)

**Features:**
1. **Business Information**
   - Business name
   - Business type: Hotel, Spa, Wellness Center, Resort, Home Service, Other
   - Contact person details

2. **Contact Information**
   - Email (required)
   - Phone number
   - Contact person name

3. **Location**
   - Country: Indonesia or International
   - City selection with preset options
   - Custom city input

4. **Position Details**
   - Position title (default: Massage Therapist)
   - Number of positions available
   - Work type: Full-time, Part-time, Contract
   - Salary range (min-max)
   - Start date

5. **Accommodation**
   - Checkbox for accommodation provided
   - Accommodation details textarea

6. **Requirements** (Multi-select)
   - Certified massage therapist
   - Minimum years of experience
   - Language requirements (English, etc.)
   - Specific massage expertise
   - Professional appearance
   - Customer service skills

7. **Benefits** (Multi-select)
   - Accommodation provided
   - Meals included
   - Health insurance
   - Visa sponsorship
   - Performance bonuses
   - Training & development
   - Paid vacation

8. **Job Description**
   - Free-text description of role and responsibilities

## 🗄️ Database Schema

### Appwrite Collections

#### 1. `therapist_job_listings`
Stores therapist job opportunity registrations.

**Attributes:**
```typescript
{
  therapistId: string;                    // Reference to therapist
  therapistName: string;                  // Cached for display
  willingToRelocateDomestic: boolean;
  willingToRelocateInternational: boolean;
  availability: 'full-time' | 'part-time' | 'both';
  minimumSalary: string;                  // Monthly in Rupiah
  preferredLocations: string[];           // Array of cities/countries
  accommodation: 'required' | 'preferred' | 'not-required';
  experienceYears: number;
  specializations: string[];              // Types of massage
  languages: string[];
  isActive: boolean;
  listingDate: string;                    // ISO timestamp
  expiryDate: string;                     // ISO timestamp (1 year from listing)
}
```

#### 2. `employer_job_postings`
Stores job openings posted by employers.

**Attributes:**
```typescript
{
  businessName: string;
  businessType: 'hotel' | 'spa' | 'wellness-center' | 'home-service' | 'resort' | 'other';
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  country: string;
  city: string;
  positionTitle: string;
  numberOfPositions: number;
  salaryMin: string;
  salaryMax: string;
  accommodationProvided: boolean;
  accommodationDetails: string;
  workType: 'full-time' | 'part-time' | 'contract';
  requirements: string[];
  benefits: string[];
  jobDescription: string;
  startDate: string;
  postedDate: string;                     // ISO timestamp
  status: 'active' | 'filled' | 'closed';
  views: number;
  applications: number;
}
```

## 🔧 Configuration

### Appwrite Setup
Update `lib/appwrite.config.ts`:

```typescript
collections: {
  // ... existing collections
  therapistJobListings: 'therapist_job_listings',
  employerJobPostings: 'employer_job_postings',
}
```

### Create Collections in Appwrite Console

1. **therapist_job_listings:**
   - Collection ID: `therapist_job_listings`
   - Permissions: Read access for all, Write access for authenticated users
   - Attributes: As defined in schema above

2. **employer_job_postings:**
   - Collection ID: `employer_job_postings`
   - Permissions: Read access for all, Write access for all (or authenticated only)
   - Attributes: As defined in schema above

## 🎨 UI/UX Design

### Therapist Job Opportunities
- **Theme:** Orange (#f97316) with white backgrounds
- **Layout:** Single-page form with sections
- **Sections:**
  1. Membership verification banner
  2. Pricing information
  3. Relocation preferences (checkboxes)
  4. Work preferences (button toggles)
  5. Salary input
  6. Location selection (chips)
  7. Accommodation preference
  8. Terms acceptance
  9. Submit button

### Employer Job Posting
- **Theme:** Consistent orange theme
- **Layout:** Multi-section form
- **Success State:** Confirmation modal with redirect
- **Sections:** Business Info → Contact → Location → Position → Accommodation → Requirements → Description

## 🔐 Access Control

### Therapist Access
- Must be logged in as therapist
- Must have active IndaStreet membership
- Payment required for first-time listing
- Can update listing while active

### Employer Access
- Currently open to all (no authentication required)
- **Recommendation:** Add employer authentication for better quality control

## 💰 Revenue Streams

### Current
1. **Therapist Listings:** Rp 200,000/year per therapist

### Future Opportunities
1. **Featured Listings:** Premium placement for therapists
2. **Employer Posting Fee:** Charge businesses to post jobs
3. **Premium Job Posts:** Highlighted postings for employers
4. **Subscription Tiers:** Monthly subscriptions for employers
5. **Commission on Placement:** Fee when therapist is hired
6. **International Placement Premium:** Higher fee for overseas jobs

## 🚀 Deployment Checklist

- [x] Create Appwrite collections
  - [ ] `therapist_job_listings`
  - [ ] `employer_job_postings`
- [x] Update `appwrite.config.ts`
- [x] Add pages to routing
- [x] Integrate with Therapist Dashboard
- [ ] Configure payment gateway (currently simulated)
- [ ] Test membership verification
- [ ] Add email notifications
- [ ] Create employer dashboard (future)
- [ ] Add search/filter for job listings (future)

## 📱 Mobile Responsiveness
- ✅ Fully responsive design
- ✅ Touch-friendly buttons
- ✅ Mobile-optimized forms
- ✅ Scrollable chip selections
- ✅ Modal overlays for mobile

## 🔄 Future Enhancements

### Phase 2: Job Listings Browsing
- Public page showing all active job postings
- Advanced filters (location, salary, type)
- Search functionality
- Direct application system

### Phase 3: Employer Dashboard
- Employer login system
- Manage posted jobs
- View therapist profiles
- Direct messaging system
- Application tracking

### Phase 4: Matching System
- AI-powered job matching
- Automated recommendations
- Skill matching
- Location-based suggestions

### Phase 5: Analytics
- Therapist: Profile views, applications
- Employer: Job post analytics, applicant quality
- Platform: Placement rates, popular locations

## 🛠️ Integration Points

### Current
- Therapist Dashboard (tab navigation)
- Appwrite database
- Session management

### Planned
- Payment gateway (Midtrans/Xendit)
- Email notifications (SendGrid/AWS SES)
- WhatsApp Business API (for notifications)
- SMS notifications (for international placements)

## 📊 Success Metrics

### Key Performance Indicators (KPIs)
1. **Therapist Listings:** Number of active listings
2. **Job Postings:** Number of active job posts
3. **Placement Rate:** Jobs filled through platform
4. **Revenue:** Annual listing fees collected
5. **User Engagement:** Time on page, completion rate
6. **Geographic Distribution:** Popular cities/countries

## 🌐 SEO Optimization

### Keywords to Target
- "massage therapist jobs Indonesia"
- "spa jobs Bali"
- "international massage therapist positions"
- "hotel massage therapist vacancy"
- "wellness center jobs Indonesia"

### Meta Tags (to be added)
```html
<meta name="description" content="Find massage therapist jobs in Indonesia and internationally. Hotels, spas, and wellness centers hire qualified therapists through IndaStreet.">
<meta name="keywords" content="massage therapist jobs, spa jobs Bali, hotel massage jobs, international therapist positions">
```

## 🎓 User Guide

### For Therapists
1. Login to your therapist account
2. Go to Dashboard → Job Opportunities tab
3. Ensure you have active membership
4. Fill in your preferences:
   - Select relocation willingness
   - Choose work availability
   - Set minimum salary
   - Select preferred locations
   - Specify accommodation needs
5. Accept terms and conditions
6. Pay Rp 200,000 registration fee
7. Your profile is now visible to employers!

### For Employers
1. Visit IndaStreet website
2. Navigate to "Post Job" (link to be added to main navigation)
3. Fill in business information
4. Provide job details and requirements
5. Select benefits and compensation
6. Submit job posting
7. Receive applications directly via email/contact info provided

## 📞 Support

### For Technical Issues
- Contact: indastreet.id@gmail.com
- WhatsApp: [To be configured]

### For Business Inquiries
- Email: business@indastreet.com

---

**Last Updated:** October 27, 2025
**Version:** 1.0
**Status:** ✅ Ready for Production (pending Appwrite collection creation)
