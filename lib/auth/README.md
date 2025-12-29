# Authentication System

**Bulletproof authentication for IndaStreet Massage Platform**

## 📁 Structure

```
lib/auth/
├── index.ts          - Main auth exports (therapistAuth, placeAuth, hotelAuth)
└── README.md         - This file

pages/auth/
├── TherapistLoginPage.tsx      - Therapist sign-in
├── MassagePlaceLoginPage.tsx   - Massage place sign-in
├── LoginPage.tsx               - Unified login
├── AuthPage.tsx                - Main auth handler
├── CreateAccountPage.tsx       - Account creation
├── SignupPage.tsx              - Signup flow
├── RoleSelectionPage.tsx       - Role chooser
├── CustomerAuthPage.tsx        - Customer auth
└── ProviderAuthPage.tsx        - Provider auth
```

## 🔒 Key Features

- **Separated by Role**: therapistAuth, placeAuth, hotelAuth
- **Bulletproof Error Handling**: Graceful fallbacks for all failures
- **Rate Limiting**: Prevents brute force attacks
- **Session Management**: Automatic cleanup and renewal
- **Collection Validation**: Checks collection existence before queries

## 🚀 Usage

```typescript
import { therapistAuth } from '@/lib/auth';

// Sign up
const result = await therapistAuth.signUp(email, password);

// Sign in
const session = await therapistAuth.signIn(email, password);
```

## 🛡️ Security

- Passwords hashed by Appwrite Auth
- Email normalization (lowercase, trimmed)
- Session invalidation after signup
- API key rotation support
- CORS protection

## 📝 Configuration

Collection IDs configured in:
- `lib/appwrite.ts`
- `lib/appwrite.config.ts`
- `lib/appwrite/config.ts`

**Important**: Use text-based collection IDs (e.g., `therapists_collection_id`), not alphanumeric IDs.

## 🔧 Maintenance

When adding new auth types:
1. Add auth object to `lib/auth/index.ts`
2. Create login page in `pages/auth/`
3. Add route to `router/routes/authRoutes.tsx`
4. Test thoroughly before deploying

## 📊 Status

✅ **Production Ready** - All auth flows tested and working
- Therapist Auth: ✅
- Place Auth: ✅  
- Hotel Auth: ✅
- Customer Auth: ✅
