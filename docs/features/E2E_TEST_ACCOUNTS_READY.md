# ✅ E2E TEST ACCOUNTS - CREATED

**Status:** 🟢 **READY FOR TESTING**  
**Date:** January 22, 2026

---

## 📋 Test Accounts Created

### 1. Customer Account ✅
- **Email:** `user@test.com`
- **Password:** `Test123456!`
- **User ID:** `6971ccc80003bc096c89`
- **Role:** Customer
- **Purpose:** Place bookings, use chat, test user experience

### 2. Therapist Account ✅
- **Email:** `therapist@test.com`
- **Password:** `Test123456!`
- **User ID:** `6971ccc9000f3c39f49c`
- **Role:** Service Provider
- **Purpose:** Receive bookings, accept/reject, test therapist dashboard
- **Note:** Therapist profile needs manual creation in Appwrite Console

### 3. Admin Account ✅
- **Email:** `admin@test.com`
- **Password:** `Test123456!`
- **User ID:** `6971ccca0005b273e7d6`
- **Role:** Platform Admin
- **Purpose:** View audit logs, monitor commissions, test admin dashboard

---

## 🔧 Setup Scripts Created

### 1. Account Creation Script
- **File:** [scripts/setup-e2e-test-accounts.js](scripts/setup-e2e-test-accounts.js)
- **Usage:** `node scripts/setup-e2e-test-accounts.js`
- **Or:** `pnpm run setup:e2e-accounts`

### 2. PowerShell Helper
- **File:** [setup-e2e-accounts.ps1](setup-e2e-accounts.ps1)
- **Usage:** `.\setup-e2e-accounts.ps1`
- **Features:** Colored output, credential summary, next steps

---

## ⚠️ Manual Step Required

**Therapist Profile Creation:**

The therapist profile couldn't be auto-created because it requires additional fields. Please create it manually:

1. Go to Appwrite Console: https://syd.cloud.appwrite.io
2. Navigate to Database → `therapists_collection_id`
3. Create document with User ID: `6971ccc9000f3c39f49c`
4. Required fields:
   ```json
   {
     "name": "Test Therapist",
     "email": "therapist@test.com",
     "phone": "+6281234567890",
     "city": "Jakarta",
     "area": "Central Jakarta",
     "specialization": "Swedish Massage",
     "experience": 5,
     "rating": 4.8,
     "completedSessions": 0,
     "status": "available",
     "verified": true,
     "bankName": "BCA",
     "bankAccountNumber": "1234567890",
     "bankAccountName": "Test Therapist",
     "profileImage": "https://via.placeholder.com/150",
     "bio": "Professional massage therapist with 5 years of experience",
     "pricing": {"60": 150000, "90": 200000, "120": 250000},
     "createdAt": "2026-01-22T00:00:00.000Z"
   }
   ```

**Alternative:** The script has been updated with all required fields. Run again:
```bash
pnpm run setup:e2e-accounts
```

---

## 🚀 Ready to Run Tests

Now that accounts are created, you can run E2E tests:

### Option 1: Quick Start
```powershell
.\run-e2e-tests.ps1
```

### Option 2: Interactive Mode (Recommended)
```bash
pnpm run test:e2e:ui
```

### Option 3: Manual
```bash
# Start dev server (separate terminal)
pnpm run dev

# Run tests
pnpm run test:e2e
```

---

## 🔐 Login Credentials Summary

**Save these for manual testing:**

| Role | Email | Password |
|------|-------|----------|
| Customer | user@test.com | Test123456! |
| Therapist | therapist@test.com | Test123456! |
| Admin | admin@test.com | Test123456! |

---

## ✅ What's Ready

- ✅ 3 test accounts created in Appwrite
- ✅ Accounts accessible via email/password login
- ✅ Setup scripts created for re-creation
- ✅ Credentials documented
- ⚠️ Therapist profile needs manual creation (see above)

---

## 🎯 Next Steps

1. **Create therapist profile manually** (if not already done)
   - See "Manual Step Required" section above

2. **Verify accounts in Appwrite Console**
   - https://syd.cloud.appwrite.io
   - Check Auth → Users
   - Verify all 3 accounts exist

3. **Run E2E tests**
   ```bash
   .\run-e2e-tests.ps1
   ```

4. **Review test results**
   ```bash
   pnpm run test:e2e:report
   ```

---

## 📚 Related Documentation

- **E2E Testing Guide:** [e2e-tests/README.md](e2e-tests/README.md)
- **Implementation Summary:** [E2E_TESTING_IMPLEMENTATION.md](E2E_TESTING_IMPLEMENTATION.md)
- **Test Suite:** [e2e-tests/booking-flow.spec.ts](e2e-tests/booking-flow.spec.ts)

---

**Status:** ✅ Test accounts ready for E2E testing  
**Action Required:** Create therapist profile manually (or re-run setup script)
