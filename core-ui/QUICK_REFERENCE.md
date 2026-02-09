# 🔒 CORE-UI PROTECTION SUMMARY

## Quick Reference: What Can/Cannot Be Modified

### ✅ ALLOWED (Safe Changes)
- **Styling** - Colors, spacing, fonts, animations
- **Text Content** - Labels, messages, translations  
- **Accessibility** - ARIA labels, keyboard nav, screen reader support
- **Debug Logging** - Console.log, logger calls (non-breaking)
- **Optional Features** - New features that can be ignored
- **Performance** - Non-breaking optimizations

### ❌ FORBIDDEN (Require Approval)
- **Boot Sequence** - Order of initialization
- **Required API Calls** - Any blocking network requests
- **State Initialization** - Starting with blocking states
- **Navigation Logic** - Changing routing behavior
- **Provider Wrapping** - Adding/removing context providers
- **Error Boundaries** - Removing or modifying error handling
- **Timeout Values** - Changing LoadingGate timeout
- **Conditional Rendering** - Adding early returns that block render

---

## Protected Files & Their Constraints

### 1. index.html
**What it does:** Initial HTML shell with orange splash  
**Constraints:**
- ✅ Modify splash screen styling
- ❌ Change body background color (must stay orange)
- ❌ Add scripts that block render
- ❌ Remove splash screen elements

### 2. LoadingGate.tsx
**What it does:** Orange transition screen (300ms)  
**Constraints:**
- ✅ Modify brand text and styling
- ❌ Remove 300ms timeout
- ❌ Add context provider dependencies
- ❌ Add async operations
- ❌ Add conditional rendering

### 3. MainLandingPage.tsx
**What it does:** First interactive page users see  
**Constraints:**
- ✅ Add optional features (location, filters)
- ✅ Modify styling and layout
- ❌ Add required API calls before render
- ❌ Add required authentication
- ❌ Add conditional returns that block render
- ❌ Make location/data required

### 4. App.tsx
**What it does:** Root component with provider hierarchy  
**Constraints:**
- ✅ Add new optional providers
- ✅ Add new features
- ❌ Add async blocking in render
- ❌ Add early returns before providers
- ❌ Change provider order without testing
- ❌ Remove error boundaries

### 5. main.tsx
**What it does:** React entry point  
**Constraints:**
- ✅ Add new monitoring/analytics
- ✅ Add development tools
- ❌ Add uncaught errors
- ❌ Add sync blocking operations
- ❌ Remove error boundaries
- ❌ Change React mount logic

### 6. bootGuard.ts
**What it does:** Runtime fallback system  
**Constraints:**
- ✅ Adjust error thresholds
- ✅ Add more error detection
- ❌ Disable fallback mode
- ❌ Remove window error handlers
- ❌ Remove emergency HTML render

### 7. productionMonitor.ts
**What it does:** Performance tracking and alerts  
**Constraints:**
- ✅ Add new metrics
- ✅ Add alerting integrations
- ❌ Disable critical alerts
- ❌ Remove boot monitoring

---

## Emergency Procedures

### If You Need to Modify a Protected File:

1. **Create Branch:**
   ```bash
   git checkout -b hotfix/core-ui-[description]
   ```

2. **Test Locally:**
   - Dev mode: `npm run dev`
   - Production build: `npm run build && npm run preview`
   - Offline mode: Disable network in DevTools
   - Mobile: Test on actual device

3. **Verify Checklist:**
   - [ ] No console errors
   - [ ] Landing page renders
   - [ ] Orange background visible
   - [ ] Boot completes in < 2 seconds
   - [ ] Works offline
   - [ ] No blank screens
   - [ ] No infinite loops

4. **Create Pull Request:**
   - Title: `[CORE-UI] Description`
   - Link to issue/ticket
   - Add screenshots
   - Request 2 reviews
   - Wait for CI to pass

5. **Monitor After Deploy:**
   - Watch error logs for 1 hour
   - Check boot success rate
   - Monitor user reports
   - Have rollback ready

---

## Common Mistakes to Avoid

### ❌ DON'T:
```typescript
// DON'T: Block on API call before render
const data = await fetchData(); // ❌ Blocks
return <LandingPage data={data} />;

// DON'T: Require auth before render
if (!user) return null; // ❌ Blank screen

// DON'T: Remove timeout
// setTimeout(() => navigate('/home'), 300); // ❌ Don't remove!

// DON'T: Add required state
if (!location) return <LocationRequired />; // ❌ Blocks
```

### ✅ DO:
```typescript
// DO: Fetch after render
useEffect(() => {
  fetchData().then(setData);
}, []);
return <LandingPage data={data} />; // ✅ Renders immediately

// DO: Show optional auth
return (
  <LandingPage>
    {user ? <UserProfile /> : <SignInButton />}
  </LandingPage>
); // ✅ Always renders

// DO: Keep timeout
setTimeout(() => navigate('/home'), 300); // ✅ Guaranteed

// DO: Make state optional
return (
  <LandingPage>
    {location ? <NearbyTherapists /> : <AllTherapists />}
  </LandingPage>
); // ✅ Works either way
```

---

## Contact & Escalation

**Questions?** Check [core-ui/README.md](./README.md) first

**Need Approval?** Create PR with `[CORE-UI]` tag

**Emergency?** Contact @Philip2024394

**Incident?** Follow [core-ui/BOOT_SEQUENCE.md](./BOOT_SEQUENCE.md) rollback procedure

---

**Last Updated:** February 9, 2026  
**Status:** 🔴 LOCKED
