# Appwrite Database Attributes - Required Setup

This document outlines the database attributes that need to be added to your Appwrite collections to support the latest features.

## Collection: `employer_job_postings`

Add the following attributes to the `employer_job_postings` collection in your Appwrite console:

### 1. flightsPaidByEmployer
- **Type:** Boolean
- **Key:** `flightsPaidByEmployer`
- **Required:** No
- **Default:** `false`
- **Description:** Indicates whether the employer covers flight costs for international employees

### 2. visaArrangedByEmployer
- **Type:** Boolean
- **Key:** `visaArrangedByEmployer`
- **Required:** No
- **Default:** `false`
- **Description:** Indicates whether the employer handles visa arrangements for international employees

### 3. transportationProvided
- **Type:** String
- **Key:** `transportationProvided`
- **Required:** No
- **Default:** `none`
- **Max Length:** 50
- **Allowed Values:** `none`, `flight`, `local-transport`, `both`
- **Description:** Type of transportation provided for domestic inter-island travel

### 4. isActive
- **Type:** Boolean
- **Key:** `isActive`
- **Required:** No
- **Default:** `false`
- **Description:** Indicates whether the job posting is active and visible to therapists (set to true after payment confirmation)

---

## How to Add These Attributes

### Via Appwrite Console (Recommended):

1. Log in to your Appwrite console
2. Navigate to **Database** → Select your database
3. Find the `employer_job_postings` collection
4. Click on the **Attributes** tab
5. Click **Add Attribute** for each field above
6. Fill in the details as specified
7. Save each attribute

### Via Appwrite CLI (Alternative):

```bash
# flightsPaidByEmployer
appwrite databases createBooleanAttribute \
  --databaseId [YOUR_DATABASE_ID] \
  --collectionId [EMPLOYER_JOB_POSTINGS_COLLECTION_ID] \
  --key flightsPaidByEmployer \
  --required false \
  --default false

# visaArrangedByEmployer
appwrite databases createBooleanAttribute \
  --databaseId [YOUR_DATABASE_ID] \
  --collectionId [EMPLOYER_JOB_POSTINGS_COLLECTION_ID] \
  --key visaArrangedByEmployer \
  --required false \
  --default false

# transportationProvided
appwrite databases createStringAttribute \
  --databaseId [YOUR_DATABASE_ID] \
  --collectionId [EMPLOYER_JOB_POSTINGS_COLLECTION_ID] \
  --key transportationProvided \
  --size 50 \
  --required false \
  --default none

# isActive
appwrite databases createBooleanAttribute \
  --databaseId [YOUR_DATABASE_ID] \
  --collectionId [EMPLOYER_JOB_POSTINGS_COLLECTION_ID] \
  --key isActive \
  --required false \
  --default false
```

---

## Database IDs from .env

Use these values from your `.env` file:

- **Database ID:** `VITE_APPWRITE_DATABASE_ID`
- **Collection ID:** Find the ID for `employer_job_postings` collection in your Appwrite console

---

## Verification

After adding the attributes, verify they appear correctly in:

1. **Appwrite Console** → Database → Collection → Attributes tab
2. Test creating a new job posting through the app
3. Check the Appwrite database to confirm the new fields are saved

---

## Impact on Application

These attributes enable the following features:

- **International Benefits:** Display flight and visa coverage for international positions
- **Transportation Options:** Show transportation provided for domestic inter-island jobs
- **Job Activation:** Control which job postings are visible after payment confirmation
- **Premium Features:** Support for enhanced job listings with better visibility

---

## Notes

- All attributes are **optional** (not required) to maintain backward compatibility
- Default values ensure existing job postings won't break
- The `isActive` field should be set to `true` by admin after payment verification
- Transportation values must match one of: `none`, `flight`, `local-transport`, `both`

---

## Next Steps

1. ✅ Add all 4 attributes to Appwrite
2. ✅ Test job posting creation with new fields
3. ✅ Verify data appears in Appwrite console
4. ✅ Test job listing display with new badges
5. ✅ Build admin approval flow to toggle `isActive`

---

**Last Updated:** January 2025  
**Related Files:** `pages/EmployerJobPostingPage.tsx`, `pages/MassageJobsPage.tsx`, `pages/JobPostingPaymentPage.tsx`
