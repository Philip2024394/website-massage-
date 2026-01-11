# 🚀 END-TO-END BOOKING FLOW TEST
## Complete 3-Way Integration Verification

**Test Date:** January 11, 2026  
**Servers Running:**
- ✅ Main Site: http://127.0.0.1:3000/
- ✅ Therapist Dashboard: http://localhost:3003/

---

## 📋 TEST CHECKLIST

### PHASE 1: USER BOOKING INITIATION ✅

**Test on Main Site:** http://127.0.0.1:3000/

#### Test 1A: Book from TherapistCard
1. ✅ Navigate to homepage
2. ✅ Find therapist card (Budi, Winda, Biman, Ela, Aditia)
3. ✅ Click **"Book Now"** button
4. ✅ Verify persistent chat window opens
5. ✅ Verify booking notification banner appears (red urgency bar)
6. ✅ Verify 5-minute countdown timer starts (5:00)

**Expected Chat Flow:**
```
Assistant: Hi! Please select your preferred duration:
- 60 minutes - Rp X
- 90 minutes - Rp X  
- 120 minutes - Rp X

[User clicks duration]