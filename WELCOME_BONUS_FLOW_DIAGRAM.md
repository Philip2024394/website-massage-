# 🎨 Welcome Coin Bonus - Visual Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER ARRIVES ON SITE                         │
│                                                                 │
│  • Device fingerprint auto-generated (background)               │
│  • IP address detected (background)                            │
│  • No user action required                                     │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                   USER CLICKS "REGISTER"                        │
│                                                                 │
│  • Enters: name, email, password, phone                        │
│  • Submits registration form                                   │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│              APPWRITE ACCOUNT CREATED                           │
│                                                                 │
│  ✅ User account created                                        │
│  ✅ User profile saved                                          │
│  ✅ Auto-login initiated                                        │
│  ✅ isNewUser = true flag set                                   │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│           handleCustomerAuthSuccess(customer, TRUE)             │
│                                                                 │
│  Function: App.tsx line ~410                                   │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│              ELIGIBILITY CHECK STARTS                           │
│                                                                 │
│  Function: isEligibleForWelcomeBonus()                         │
│  File: lib/deviceTracking.ts                                   │
└───────────────────────┬─────────────────────────────────────────┘
                        │
         ┌──────────────┴──────────────┐
         │                             │
         ▼                             ▼
    ┌────────────┐              ┌─────────────┐
    │ Check DB   │              │ Check Local │
    │ for Device │              │ Storage     │
    │ & IP       │              │ Flags       │
    └─────┬──────┘              └──────┬──────┘
          │                            │
          └──────────┬─────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │   Duplicate Found?    │
         └───────┬───────┬───────┘
                 │       │
            YES  │       │  NO
                 │       │
         ┌───────▼───┐   │
         │ Return    │   │
         │ Ineligible│   │
         └───────────┘   │
                         │
                         ▼
         ┌───────────────────────────────┐
         │  USER IS ELIGIBLE! 🎉         │
         │                               │
         │  • New device fingerprint     │
         │  • New IP address             │
         │  • No localStorage record     │
         └───────────┬───────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                   AWARD WELCOME BONUS                           │
│                                                                 │
│  Function: awardWelcomeBonus()                                 │
│  File: lib/deviceTracking.ts                                   │
│                                                                 │
│  Steps:                                                         │
│  1️⃣ Record registration in database                            │
│  2️⃣ Award 100 coins (future: integrate with loyalty system)    │
│  3️⃣ Update record: hasReceivedWelcomeBonus = true             │
│  4️⃣ Save to localStorage                                       │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                DATABASE RECORD CREATED                          │
│                                                                 │
│  Collection: user_registrations                                │
│  {                                                              │
│    userId: "67e3a1b2000f45678901",                            │
│    userType: "customer",                                       │
│    deviceId: "a7f3d2e8c4b1",                                   │
│    ipAddress: "103.255.4.22",                                  │
│    hasReceivedWelcomeBonus: true,                              │
│    welcomeBonusAmount: 100,                                    │
│    registrationDate: "2025-10-29T08:30:00Z",                  │
│    firstLoginDate: "2025-10-29T08:30:15Z"                     │
│  }                                                              │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│              LOCALSTORAGE FLAGS SET                             │
│                                                                 │
│  ✅ indastreet_registered = "true"                             │
│  ✅ indastreet_welcome_bonus_received = "true"                 │
│  ✅ indastreet_welcome_coins = "100"                           │
│  ✅ indastreet_registration_date = "2025-10-29..."             │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│              STATE UPDATED IN APP.TSX                           │
│                                                                 │
│  setWelcomeBonusCoins(100)                                     │
│  setShowWelcomeCoinPopup(true) // After 1s delay               │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│            POPUP ANIMATION STARTS (1 SECOND DELAY)              │
│                                                                 │
│  Component: WelcomeCoinBonusPopup                              │
│  File: components/WelcomeCoinBonusPopup.tsx                    │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                  POPUP PHASES (ANIMATED)                        │
│                                                                 │
│  Phase 0 (0ms):    Popup scales in from 0.5 → 1.0             │
│  Phase 1 (500ms):  Confetti starts falling                     │
│  Phase 2 (1000ms): Coin count animates (100 coins)             │
│  Phase 3 (1500ms): Benefits list fades in                      │
│                                                                 │
│  ┌───────────────────────────────────────────────────┐         │
│  │              🎁 Congratulations!                  │         │
│  │      Welcome to IndaStreet Massage Directory      │         │
│  │                                                   │         │
│  │          🪙  100  🪙                              │         │
│  │      IndaStreet Coins Awarded!                    │         │
│  │                                                   │         │
│  │  💰 Use for Discounts                             │         │
│  │     Redeem coins for discounts on bookings        │         │
│  │                                                   │         │
│  │  🎯 Earn More Coins                               │         │
│  │     Get 5 coins for every completed booking       │         │
│  │                                                   │         │
│  │  👛 Check Your Dashboard                          │         │
│  │     View all coins and rewards                    │         │
│  │                                                   │         │
│  │  ⚠️ Use within 30 days!                           │         │
│  │                                                   │         │
│  │    [ Go to Dashboard → ]                          │         │
│  └───────────────────────────────────────────────────┘         │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│            USER CLICKS "GO TO DASHBOARD"                        │
│                                                                 │
│  Function: handleCloseWelcomeCoinPopup()                       │
│  File: App.tsx                                                 │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│              POPUP MARKED AS SEEN                               │
│                                                                 │
│  Function: markWelcomePopupSeen()                              │
│                                                                 │
│  ✅ indastreet_welcome_popup_seen = "true"                     │
│  ✅ indastreet_welcome_popup_seen_date = "2025-10-29..."       │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│           NAVIGATE TO CUSTOMER DASHBOARD                        │
│                                                                 │
│  • User sees their coin balance (100 coins)                    │
│  • Can view loyalty wallets                                    │
│  • Can book massages and earn more coins                       │
│  • Popup won't show again (marked as seen)                     │
└─────────────────────────────────────────────────────────────────┘
```

## Fraud Prevention Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              EXISTING USER TRIES TO RE-REGISTER                 │
│                                                                 │
│  • Same device (cleared cookies)                               │
│  • Same IP address                                             │
│  • New email address                                           │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ELIGIBILITY CHECK                             │
│                                                                 │
│  Function: isEligibleForWelcomeBonus()                         │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│              DATABASE QUERY (LAYER 1)                           │
│                                                                 │
│  Query: user_registrations                                     │
│  Filter: deviceId OR ipAddress                                 │
│                                                                 │
│  ✅ FOUND: Existing registration record                         │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RETURN INELIGIBLE                            │
│                                                                 │
│  {                                                              │
│    eligible: false,                                            │
│    reason: "Welcome bonus already claimed on this device",     │
│    deviceId: "a7f3d2e8c4b1",                                   │
│    ipAddress: "103.255.4.22"                                   │
│  }                                                              │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                  NO BONUS AWARDED                               │
│                                                                 │
│  • User account created successfully                           │
│  • User can login and use app                                  │
│  • No coins awarded                                            │
│  • No popup shown                                              │
│  • Console log: "User not eligible for welcome bonus"          │
└─────────────────────────────────────────────────────────────────┘
```

## Multi-Layer Detection System

```
┌───────────────────────────────────────────────────────┐
│              LAYER 1: DATABASE CHECK                  │
│                                                       │
│  ✓ Most reliable                                      │
│  ✓ Permanent record                                   │
│  ✓ Survives browser clearing                         │
│  ✓ Tracks device + IP                                │
└───────────────┬───────────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────────┐
│            LAYER 2: IP ADDRESS CHECK                  │
│                                                       │
│  ✓ Network-level tracking                             │
│  ✓ Detects same network                              │
│  ✓ Works across devices                              │
│  ✗ VPN/Proxy bypass (acceptable)                     │
└───────────────┬───────────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────────┐
│         LAYER 3: DEVICE FINGERPRINT                   │
│                                                       │
│  ✓ Browser-level tracking                             │
│  ✓ Unique per device                                  │
│  ✓ Survives IP changes                               │
│  ✗ Private browsing bypass (by design)               │
└───────────────┬───────────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────────┐
│           LAYER 4: LOCALSTORAGE FLAG                  │
│                                                       │
│  ✓ Instant check (no API call)                       │
│  ✓ Browser-specific                                   │
│  ✗ Easy to clear (acceptable)                        │
│  ✗ Backup only                                        │
└───────────────────────────────────────────────────────┘

      ALL LAYERS WORK TOGETHER FOR MAXIMUM PROTECTION
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                       APP.TSX STATE                             │
│                                                                 │
│  const [showWelcomeCoinPopup, setShowWelcomeCoinPopup] = useState(false);
│  const [welcomeBonusCoins, setWelcomeBonusCoins] = useState(0);
│  const [loggedInCustomer, setLoggedInCustomer] = useState(null);
└───────────────────────┬─────────────────────────────────────────┘
                        │
         ┌──────────────┴──────────────┐
         │                             │
         ▼                             ▼
┌──────────────────┐          ┌──────────────────┐
│  REGISTRATION    │          │  EXISTING USER   │
│  (isNewUser)     │          │  LOGIN           │
└────────┬─────────┘          └────────┬─────────┘
         │                             │
         ▼                             ▼
┌──────────────────┐          ┌──────────────────┐
│ Award Bonus      │          │ Check If Popup   │
│ If Eligible      │          │ Already Shown    │
└────────┬─────────┘          └────────┬─────────┘
         │                             │
         ├─────────────┬───────────────┤
         │             │               │
         ▼             ▼               ▼
    Set Coins    Show Popup      Skip Popup
         │             │               │
         └─────────────┴───────────────┘
                       │
                       ▼
              ┌────────────────┐
              │ User Closes    │
              │ Popup          │
              └───────┬────────┘
                      │
                      ▼
              ┌────────────────┐
              │ Mark As Seen   │
              │ in localStorage│
              └───────┬────────┘
                      │
                      ▼
              ┌────────────────┐
              │ Navigate to    │
              │ Dashboard      │
              └────────────────┘
```

## Data Storage Locations

```
┌─────────────────────────────────────────────────────────────────┐
│                   APPWRITE DATABASE                             │
│                                                                 │
│  Collection: user_registrations                                │
│  Purpose: Permanent fraud prevention record                    │
│  Indexed: deviceId, ipAddress, userId                          │
│  Retention: 1-3 years                                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   BROWSER LOCALSTORAGE                          │
│                                                                 │
│  Keys:                                                          │
│  • indastreet_registered                  [backup flag]        │
│  • indastreet_welcome_bonus_received      [bonus status]       │
│  • indastreet_welcome_coins               [coin amount]        │
│  • indastreet_welcome_popup_seen          [UI state]           │
│                                                                 │
│  Purpose: Fast client-side checks                              │
│  Retention: Until user clears browser                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   REACT STATE (MEMORY)                          │
│                                                                 │
│  Variables:                                                     │
│  • showWelcomeCoinPopup    [boolean]                           │
│  • welcomeBonusCoins       [number]                            │
│  • loggedInCustomer        [object]                            │
│                                                                 │
│  Purpose: UI rendering control                                 │
│  Retention: Current session only                               │
└─────────────────────────────────────────────────────────────────┘
```

---

**Legend:**
- ✅ Required step
- ✓ Advantage
- ✗ Limitation (acceptable)
- 🎉 Success state
- ⚠️ Warning/Notice
