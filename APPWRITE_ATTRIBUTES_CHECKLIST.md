# Appwrite Attributes Checklist for `employer_job_postings`

## 📋 Quick Status Check

Run through this checklist to verify all required attributes exist in your Appwrite collection.

---

## ✅ CORE REQUIRED FIELDS (Must Have)

These fields are **currently being saved** by the job posting form:

| Attribute | Type | Required | Currently Works? | Notes |
|-----------|------|----------|------------------|-------|
| `jobTitle` | String (128) | ✅ Yes | ✅ | Main job title |
| `jobDescription` | String (1000) | ✅ Yes | ✅ | Detailed description |
| `businessName` | String (255) | ✅ Yes | ✅ | Company name |
| `contactEmail` | String (255) | ✅ Yes | ✅ | Contact email |
| `country` | String (100) | ✅ Yes | ✅ | Country location |
| `city` | String (255) | ✅ Yes | ✅ | City location |
| `status` | String (50) | ✅ Yes | ✅ | Job status (pending_payment/active/closed) |
| `postedDate` | DateTime | ✅ Yes | ✅ | Posted timestamp |

**Status**: ✅ These should already exist if job posting works at all

---

## 🔧 OPTIONAL FIELDS (Currently Active)

These fields are **conditionally saved** if the user provides them:

| Attribute | Type | Required | Currently Works? | Notes |
|-----------|------|----------|------------------|-------|
| `businessType` | String (100) | ❌ No | ⚠️ Check | hotel/spa/wellness-center/resort/other |
| `positionTitle` | String (255) | ❌ No | ⚠️ Check | Alternative position title |
| `workType` | String (50) | ❌ No | ⚠️ Check | full-time/part-time/contract |
| `imageurl` | String (2048) | ❌ No | ⚠️ Check | Job image URL (lowercase in code!) |
| `employmentType` | String (64) | ❌ No | ⚠️ Check | Employment type |
| `location` | String (128) | ❌ No | ⚠️ Check | Specific location/address |
| `contactPerson` | String (255) | ❌ No | ⚠️ Check | Contact person name |
| `contactPhone` | String (50) | ❌ No | ⚠️ Check | Phone number |
| `numberOfPositions` | Integer | ❌ No | ⚠️ Check | Number of openings |
| `salaryMin` | Float/Integer | ❌ No | ⚠️ Check | Minimum salary |
| `salaryMax` | Float/Integer | ❌ No | ⚠️ Check | Maximum salary |
| `accommodationProvided` | Boolean | ❌ No | ⚠️ Check | Accommodation offered |
| `accommodationDetails` | String (1000) | ❌ No | ⚠️ Check | Accommodation details |
| `startDate` | String (100) | ❌ No | ⚠️ Check | Expected start date |
| `applicationDeadline` | DateTime | ❌ No | ⚠️ Check | Application deadline |

**Status**: ⚠️ Add these to enable full job posting features

**Note**: The code uses `imageurl` (lowercase) instead of `imageUrl` - verify this matches your Appwrite attribute name!

---

## 📱 WHATSAPP TRACKING FIELDS (Payment Page)

These fields are **critical for tracking** when employers send payment via WhatsApp:

| Attribute | Type | Required | Currently Works? | Notes |
|-----------|------|----------|------------------|-------|
| `whatsappSent` | Boolean | ❌ No | ❌ **ADD THIS** | Tracks if WhatsApp button was clicked |
| `whatsappSentAt` | String/DateTime | ❌ No | ❌ **ADD THIS** | Timestamp when WhatsApp opened |
| `selectedPlan` | String (50) | ❌ No | ❌ **ADD THIS** | Plan selected (standard/premium) |
| `selectedPlanPrice` | Integer | ❌ No | ❌ **ADD THIS** | Price of selected plan (200000/500000) |

**Status**: ❌ **MUST ADD THESE** - Code will fail when WhatsApp button is clicked without these attributes

**Business Value**: 
- Track which employers contacted you via WhatsApp
- Know which payment plan they selected
- See when they initiated payment
- Filter/sort jobs by payment engagement

---

## 🚧 COMMENTED OUT FIELDS (Future Features)

These fields are **in the code but commented out** - add them to enable advanced features:

| Attribute | Type | Required | Currently Works? | Notes |
|-----------|------|----------|------------------|-------|
| `massageTypes` | String[] (Array) | ❌ No | ❌ Commented | Array of massage types offered |
| `requirements` | String[] (Array) | ❌ No | ❌ Commented | Array of job requirements |
| `benefits` | String[] (Array) | ❌ No | ❌ Commented | Array of benefits offered |
| `requiredLanguages` | String[] (Array) | ❌ No | ❌ Commented | Languages required |
| `transportationProvided` | String (100) | ❌ No | ❌ Commented | Transportation details |
| `isActive` | Boolean | ❌ No | ❌ Commented | Manual activation control |
| `flightsPaidByEmployer` | Boolean | ❌ No | ❌ Commented | Flights covered |
| `visaArrangedByEmployer` | Boolean | ❌ No | ❌ Commented | Visa arrangement |
| `cvRequired` | Boolean | ❌ No | ❌ Commented | CV requirement |
| `salaryRangeMin` | Integer | ❌ No | ❌ Commented | Salary range minimum |
| `salaryRangeMax` | Integer | ❌ No | ❌ Commented | Salary range maximum |
| `views` | Integer | ❌ No | ❌ Commented | View counter |
| `applications` | Integer | ❌ No | ❌ Commented | Application counter |

**Status**: ⏳ Add these when you need advanced job posting features

**To Enable**: Uncomment the relevant lines in `EmployerJobPostingPage.tsx` (lines 207-220) after adding attributes to Appwrite

---

## 🎯 PRIORITY ACTION ITEMS

### **Priority 1: CRITICAL (Do Now)**
Add WhatsApp tracking fields - **required for payment tracking**:
```
1. whatsappSent (Boolean, default: false)
2. whatsappSentAt (String or DateTime)
3. selectedPlan (String, size: 50)
4. selectedPlanPrice (Integer, min: 0)
```

### **Priority 2: HIGH (Do Soon)**
Add optional fields to enable full job posting form:
```
1. businessType (String, size: 100)
2. positionTitle (String, size: 255)
3. workType (String, size: 50)
4. employmentType (String, size: 64)
5. location (String, size: 128)
6. contactPerson (String, size: 255)
7. contactPhone (String, size: 50)
8. numberOfPositions (Integer, default: 1)
9. salaryMin (Float or Integer)
10. salaryMax (Float or Integer)
11. accommodationProvided (Boolean, default: false)
12. accommodationDetails (String, size: 1000)
13. startDate (String, size: 100)
14. applicationDeadline (DateTime)
15. imageurl (String, size: 2048) ⚠️ Note: lowercase!
```

### **Priority 3: MEDIUM (Future)**
Add advanced features when needed:
```
1. massageTypes (String array, size: 100 each)
2. requirements (String array, size: 500 each)
3. benefits (String array, size: 500 each)
4. requiredLanguages (String array, size: 50 each)
5. transportationProvided (String, size: 100)
6. isActive (Boolean, default: false)
7. flightsPaidByEmployer (Boolean, default: false)
8. visaArrangedByEmployer (Boolean, default: false)
9. cvRequired (Boolean, default: false)
10. views (Integer, default: 0)
11. applications (Integer, default: 0)
```

---

## 🔍 How to Verify

### Check in Appwrite Console:

1. Open your Appwrite Console
2. Navigate to **Databases** → Your database
3. Find collection: `employer_job_postings`
4. Click on **Attributes** tab
5. Compare with this checklist

### Test by Creating a Job Posting:

1. Go to employer job posting page
2. Fill out the form completely
3. Submit the job posting
4. Check browser console for errors:
   - ✅ Success: All fields saved
   - ❌ Error: "Unknown attribute: [field_name]" - Add that attribute to Appwrite

### Test WhatsApp Tracking:

1. Create a job posting (will go to payment page)
2. Click "Send Payment Details via WhatsApp"
3. Check browser console:
   - ✅ Success: "Updated job posting - WhatsApp opened"
   - ❌ Error: "Unknown attribute: whatsappSent" - Add WhatsApp tracking fields

---

## 📝 Quick Add Guide

### In Appwrite Console:

1. **String Attribute**:
   - Type: String
   - Size: (see table above)
   - Required: (see table above)
   - Default: (optional)

2. **Boolean Attribute**:
   - Type: Boolean
   - Required: No (unless specified)
   - Default: false (or true as needed)

3. **Integer/Float Attribute**:
   - Type: Integer or Float
   - Min: 0 (for salary/price fields)
   - Required: No
   - Default: 0 (optional)

4. **DateTime Attribute**:
   - Type: DateTime
   - Required: No
   - Default: (leave empty)

5. **Array Attribute**:
   - Type: String (Array)
   - Size: (see table above)
   - Max Elements: 50-100 (recommended)
   - Required: No

---

## ✅ Verification Checklist

- [ ] All **CORE REQUIRED FIELDS** exist (8 fields)
- [ ] **WhatsApp tracking fields** added (4 fields) - **CRITICAL**
- [ ] **Optional fields** added for full features (15 fields)
- [ ] Tested job posting creation - no errors
- [ ] Tested WhatsApp button - tracking works
- [ ] Checked `imageurl` vs `imageUrl` naming (lowercase in code!)
- [ ] Set proper permissions (Any can create, Owner+Admin can update)
- [ ] Added indexes for frequently queried fields (status, postedDate, country)

---

## 🆘 Troubleshooting

### Error: "Unknown attribute: [field_name]"
**Solution**: Add that attribute to Appwrite collection

### Error: "Invalid document structure"
**Solution**: Check attribute types match (String vs Integer vs Boolean, etc.)

### WhatsApp tracking not working
**Solution**: Add all 4 WhatsApp tracking attributes (whatsappSent, whatsappSentAt, selectedPlan, selectedPlanPrice)

### Image upload not saving
**Solution**: Verify attribute name is `imageurl` (lowercase!) not `imageUrl`

---

**Last Updated**: October 28, 2025  
**Collection**: `employer_job_postings`  
**Code Files**: `EmployerJobPostingPage.tsx`, `JobPostingPaymentPage.tsx`
