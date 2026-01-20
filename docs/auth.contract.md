# AUTHENTICATION CONTRACT (LOCKED)

⚠️ **CRITICAL**: This contract defines production authentication architecture.
🚫 **DO NOT MODIFY**: AI tools must not alter auth flows without explicit approval.
📋 **SOURCE OF TRUTH**: Always refer to this file for authentication requirements.

---

## AUTHENTICATION FLOWS

### **Session Management**
- **File**: `lib/authSessionHelper.ts`
- **Purpose**: Anonymous session creation for protected actions
- **Contract**: MUST create session only when needed, never on page load
- **Required States**: `success`, `userId`, `isAnonymous`, `error`

### **Admin Authentication** 
- **File**: `lib/adminGuard.tsx`
- **Contract**: Email-based role validation ONLY
- **Authorized Emails**: 
  - `admin@indastreet.com`
  - `admin@indastreetmassage.com` 
  - `philip@indastreet.com`
- **Guard Behavior**: Block → Redirect to home on unauthorized

### **Multi-Role Authentication**
- **File**: `lib/auth/index.ts`  
- **Supported Roles**: `hotel`, `therapist`, `place`, `admin`, `customer`
- **Contract**: One active role per session, prevent cross-contamination
- **Validation**: Check user exists in respective collection

---

## AUTHENTICATION STATES

### **Required Session Properties**
```typescript
interface AuthSessionResult {
    success: boolean;
    userId: string | null;
    isAnonymous: boolean;
    error?: string;
}
```

### **Admin Session Properties**
```typescript
interface AdminSession {
    isAdmin: boolean;
    isLoading: boolean;
    user: any | null;
    error: string | null;
}
```

---

## AUTHENTICATION GUARDS

### **Revenue Protection Guards**
- **File**: `lib/guards/bookingAuthGuards.ts`
- **Contract**: FAIL-CLOSED authorization (block if ANY check fails)
- **Required Checks**: `status === 'active'`, `bookingEnabled === true`, `scheduleEnabled === true`

### **Dashboard Access Guards**  
- **File**: `utils/dashboardGuards.ts`
- **Contract**: Prevent multiple authentication states
- **Rule**: Maximum ONE active auth state at any time

---

## PROHIBITED MODIFICATIONS

### **Never Change**
- Hard-coded admin email list
- Session creation logic
- Role validation functions  
- Cross-contamination prevention
- Fail-closed security patterns

### **Never Add**
- Additional authentication methods
- Session bypass mechanisms
- Role escalation paths
- Client-side permission checks

---

**Last Updated**: January 20, 2026  
**Contract Version**: Production v1.0  
**Compliance**: Facebook Production Standards