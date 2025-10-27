# Adding Massage Job Postings to Appwrite

## Overview
This script adds 10 sample job postings to your Appwrite `employerJobPostings` collection.

## Job Postings Included

1. **Ayana Resort & Spa Bali** - Head Massage Therapist (Jimbaran)
   - Full-time, IDR 8-12M/month, Accommodation provided

2. **Karma Wellness Ubud** - Full Body Massage Specialist (Ubud)
   - Full-time, IDR 6-9M/month, Wellness Center

3. **The Mulia Nusa Dua** - In-Room Massage Therapist (Nusa Dua)
   - Part-time, IDR 5-8M/month, 3 positions

4. **Jakarta Sports & Wellness Clinic** - Sports Massage Therapist (Jakarta)
   - Full-time, IDR 7-10M/month, Sports focus

5. **Seminyak Beach Resort** - Poolside & Beach Massage Therapist (Seminyak)
   - Contract, IDR 5.5-7.5M/month, 4 positions

6. **Prana Spa Sanur** - Traditional Balinese Massage Therapist (Sanur)
   - Full-time, IDR 6.5-9.5M/month, International clientele

7. **Mother & Baby Wellness Jakarta** - Prenatal Massage Specialist (Jakarta)
   - Full-time, IDR 7.5-11M/month, Specialty care

8. **Office Relief Indonesia** - Mobile Corporate Massage Therapist (Jakarta)
   - Freelance, IDR 6-10M/month, 5 positions

9. **Canggu Private Villas** - Private Villa Massage Therapist (Canggu)
   - Part-time, IDR 4.5-7M/month, High-end clientele

10. **Surabaya Physio & Rehab Center** - Therapeutic/Rehabilitation Therapist (Surabaya)
    - Full-time, IDR 6.5-9M/month, Medical setting

## Running the Script

### Option 1: Using ts-node (Recommended)

```bash
npx ts-node scripts/addMassageJobs.ts
```

### Option 2: Using Node (after building)

```bash
npm run build
node dist/scripts/addMassageJobs.js
```

### Option 3: Using Vite

```bash
npm run dev
# Then in browser console, you can manually import and run the function
```

## Expected Output

```
Starting to add job postings to Appwrite...

✅ Added: Head Massage Therapist at Ayana Resort & Spa Bali
✅ Added: Full Body Massage Specialist at Karma Wellness Ubud
✅ Added: In-Room Massage Therapist at The Mulia Nusa Dua
...

📊 Summary:
   ✅ Success: 10
   ❌ Errors: 0
   📝 Total: 10

✨ Job postings addition completed!
```

## Verifying the Results

1. Open your app and navigate to the **Massage Jobs** page
2. You should see all 10 job postings displayed
3. Test the filter buttons (All, Hotel, Spa, Wellness Center, Clinic)
4. Try the search functionality
5. Click the WhatsApp buttons to verify contact links

## Troubleshooting

### Error: "Missing environment variables"
- Make sure your `.env` file has all Appwrite configuration
- Check `VITE_APPWRITE_DATABASE_ID` and `VITE_APPWRITE_COLLECTION_EMPLOYER_JOB_POSTINGS`

### Error: "Collection not found"
- Verify the collection exists in your Appwrite console
- Check the collection ID matches your config

### Error: "Permission denied"
- Ensure your Appwrite API key has write permissions
- Check collection permissions allow document creation

## Manual Alternative

If the script doesn't work, you can manually add jobs via Appwrite Console:

1. Go to your Appwrite Console → Databases
2. Select your database → `employerJobPostings` collection
3. Click "Add Document"
4. Copy the job data from `scripts/addMassageJobs.ts`
5. Repeat for all 10 jobs

## Next Steps

After successfully adding the jobs:
- ✅ Jobs will appear on the Massage Jobs page
- ✅ Filter buttons will work correctly
- ✅ Search functionality will be operational
- ✅ WhatsApp contact links will be functional
- 🎯 Consider adding more jobs for other locations/types as needed
