# 🔒 STABILITY & SCROLL LOCK RULES (PRODUCTION SAFE)

**Status:** 🔴 **MANDATORY - NON-NEGOTIABLE**  
**Priority:** **HIGHEST** - Stability > Features > Speed  
**Last Updated:** February 9, 2026

---

## 🚨 ABSOLUTE RULES (DO NOT VIOLATE)

### Rule 1: Global Scroll Must NEVER Be Disabled

**❌ FORBIDDEN:**
```css
/* NEVER apply these to global elements */
body { overflow: hidden; }
html { overflow: hidden; }
#root { overflow: hidden; }
.App { overflow: hidden; }
```

**✅ CORRECT:**
```css
/* Browser controls scroll by default */
body { overflow: auto; } /* or leave unset */
html { overflow: auto; } /* or leave unset */
```

**Why:** Disabling global scroll breaks:
- Dashboard scrolling
- Natural page navigation
- Mobile touch scrolling
- Search functionality (Ctrl+F)
- Accessibility features

---

### Rule 2: Only ONE Scroll Authority Exists

**✅ The Browser (body) Controls Scroll**
- Default behavior
- Natural scrolling
- Accessible
- Mobile-friendly

**❌ Never Override Global Scroll**
- No JS scroll locks on window
- No `document.body.style.overflow = 'hidden'`
- No `position: fixed` on App container

---

### Rule 3: Loading & Landing Locks Are LOCAL ONLY

**✅ ALLOWED (Self-Contained Components):**
```tsx
// LoadingGate.tsx or LandingPage.tsx
<div style={{
  position: 'fixed',     // ✅ Self-contained
  inset: 0,              // ✅ Covers viewport
  overflow: 'hidden',    // ✅ Local lock only
  zIndex: 9999           // ✅ Above content
}}>
  {/* Loading content */}
</div>
```

**❌ FORBIDDEN (Leaking Locks):**
```tsx
// App.tsx - WRONG
<div style={{ overflow: 'hidden', height: '100vh' }}>
  <LoadingScreen />   // ❌ Lock wraps entire app
  <Dashboard />       // ❌ Dashboard cannot scroll
</div>
```

**✅ CORRECT (Isolated Locks):**
```tsx
// App.tsx - RIGHT
<>
  {isLoading && <LoadingScreen />}  // ✅ Self-contained lock
  {!isLoading && <Dashboard />}     // ✅ Natural scroll
</>
```

---

## 🧱 LAYOUT SAFETY RULES

### Rule 4: Never Use `height: 100vh` on App-Level Containers

**❌ FORBIDDEN:**
```css
.App { height: 100vh; overflow: hidden; }
#root { height: 100vh; }
body { height: 100vh; }
```

**✅ CORRECT:**
```css
.App { min-height: 100vh; }  /* Allows growth */
#root { min-height: 100vh; } /* Preserves scroll */
```

**Why `min-height` not `height`:**
- ✅ Prevents white space at bottom
- ✅ Allows content to exceed viewport
- ✅ Enables natural scrolling
- ✅ Works with dynamic content

---

### Rule 5: Dashboards Must Never Use Fixed Positioning

**❌ FORBIDDEN:**
```css
.dashboard {
  position: fixed;     /* ❌ Breaks scroll */
  height: 100vh;       /* ❌ Fixed height */
  overflow: hidden;    /* ❌ Locks content */
}
```

**✅ CORRECT:**
```css
.dashboard {
  min-height: 100vh;   /* ✅ Full viewport minimum */
  overflow: visible;   /* ✅ Natural scroll */
  /* position: relative or static */
}
```

---

### Rule 6: White Space = Layout Bug

**If white space appears at bottom:**

**❌ DON'T (Visual Patch):**
```css
/* Bad: Hiding the symptom */
body { overflow-y: hidden; }
```

**✅ DO (Fix Root Cause):**
```css
/* Good: Fix container hierarchy */
.container { min-height: 100vh; }  /* Not height: 100vh */
```

**Common Causes:**
1. Parent has `height: 100vh`
2. Parent has `overflow: hidden`
3. Fixed positioning on container
4. Incorrect flexbox/grid setup

---

## 🏗️ SAFE ARCHITECTURE PATTERN (MANDATORY)

### Correct Component Hierarchy:

```
App (min-height: 100vh, no overflow control)
 ├─ LoadingScreen (self-contained, fixed, locked)
 │   └─ position: fixed, inset: 0, overflow: hidden
 │
 ├─ LandingPage (self-contained, fixed, locked)
 │   └─ position: fixed, inset: 0, overflow: hidden
 │
 └─ Dashboard / Therapist Panel (natural scroll)
     └─ min-height: 100vh, overflow: visible/auto
```

**Key Principles:**
1. **Locks are self-contained** - Never wrap other components
2. **Locks never touch global CSS** - Only affect themselves
3. **Dashboard scrolls naturally** - No interference from locks

---

## 🔍 PRE-CHANGE CHECKLIST

Before making ANY change, verify:

### ❓ Question 1: Does this touch global elements?
```
Affected elements: body, html, #root, App
If YES → STOP and reconsider
```

### ❓ Question 2: Does this add problematic styles?
```
Styles: overflow: hidden, height: 100vh, position: fixed
On global elements?
If YES → STOP and use local container
```

### ❓ Question 3: Could this affect scroll outside its component?
```
Check: Does it modify parent scroll?
Check: Does it lock sibling components?
If YES → STOP and isolate to component
```

### ❓ Question 4: Does this use body.style or document.documentElement?
```
Any JS that modifies body/html scroll?
If YES → STOP, use CSS class on component instead
```

---

## 🛑 FAILURE BEHAVIOR PROTOCOL

### If Uncertain:

1. **DO NOT GUESS** - Stability is critical
2. **DO NOT "TRY A FIX"** - Test in isolation first
3. **ASK FOR CLARIFICATION** - Better to ask than break
4. **PRIORITIZE STABILITY** - Features can wait

### Debug Checklist:

```bash
# 1. Check global styles
grep -r "overflow.*hidden" src/ | grep -E "body|html|root|App"

# 2. Check height locks
grep -r "height.*100vh" src/ | grep -E "App|root|body"

# 3. Check fixed positioning on containers
grep -r "position.*fixed" src/ | grep -E "container|wrapper|layout"
```

---

## 🏆 GOLD STANDARD GOALS

Our stability targets:

1. **Landing page always renders** ✅
   - No dependencies on async data
   - Self-contained loading state
   - Fixed positioning with local lock

2. **Dashboard always scrolls** ✅
   - Natural overflow behavior
   - No fixed height constraints
   - No parent scroll locks

3. **No white space** ✅
   - min-height instead of height
   - Proper container hierarchy
   - No overflow issues

4. **No global locks** ✅
   - Body/html always scrollable
   - Locks isolated to components
   - No JS scroll manipulation

5. **No regressions** ✅
   - Pre-change checklist mandatory
   - Test scroll on all pages
   - Verify mobile behavior

---

## 📋 COMPONENT-SPECIFIC RULES

### LoadingGate.tsx
```tsx
✅ MUST: Use position: fixed
✅ MUST: Use inset: 0
✅ MUST: Use overflow: hidden (local only)
❌ NEVER: Modify body/html styles
❌ NEVER: Wrap other components
```

### MainLandingPage.tsx
```tsx
✅ MUST: Use position: fixed (self-contained)
✅ MUST: Use overflow-y: auto (internal scroll)
❌ NEVER: Lock parent scroll
❌ NEVER: Use height: 100vh on App
```

### App.tsx
```tsx
✅ MUST: Use min-height: 100vh
✅ MUST: Leave overflow unset (default)
❌ NEVER: Use overflow: hidden
❌ NEVER: Use height: 100vh
❌ NEVER: Wrap content in fixed container
```

### Dashboard Components
```tsx
✅ MUST: Use natural scrolling
✅ MUST: Use min-height, not height
❌ NEVER: Use position: fixed on container
❌ NEVER: Use overflow: hidden
```

---

## 🚨 COMMON VIOLATIONS TO AVOID

### Violation #1: Modal Scroll Lock
```tsx
// ❌ WRONG - Locks entire app
useEffect(() => {
  document.body.style.overflow = 'hidden';
  return () => {
    document.body.style.overflow = 'auto';
  };
}, [isModalOpen]);

// ✅ CORRECT - Modal handles its own scroll
<div style={{
  position: 'fixed',
  inset: 0,
  overflow: 'hidden',  // Lock is local to modal
  zIndex: 9999
}}>
  <ModalContent />
</div>
```

### Violation #2: Loading Screen Wrapper
```tsx
// ❌ WRONG - Wrapper locks everything
<div style={{ overflow: 'hidden', height: '100vh' }}>
  {isLoading ? <LoadingScreen /> : <App />}
</div>

// ✅ CORRECT - Loading is independent
<>
  {isLoading && <LoadingScreen />}  {/* Self-contained */}
  <App />  {/* Always scrollable */}
</>
```

### Violation #3: Dashboard Fixed Container
```tsx
// ❌ WRONG - Dashboard cannot scroll
<div style={{
  position: 'fixed',
  height: '100vh',
  overflow: 'hidden'
}}>
  <DashboardContent />  {/* Stuck */}
</div>

// ✅ CORRECT - Dashboard scrolls naturally
<div style={{ minHeight: '100vh' }}>
  <DashboardContent />  {/* Scrolls */}
</div>
```

---

## 🧪 TESTING REQUIREMENTS

Before deploying ANY scroll-related change:

### Manual Tests:
- [ ] Landing page loads without scroll lock
- [ ] Dashboard scrolls naturally
- [ ] Mobile touch scroll works
- [ ] No white space at bottom
- [ ] Search (Ctrl+F) works
- [ ] Loading screen doesn't lock app

### Automated Tests:
```javascript
test('body scroll is never locked', () => {
  const bodyStyle = window.getComputedStyle(document.body);
  expect(bodyStyle.overflow).not.toBe('hidden');
});

test('dashboard is scrollable', () => {
  const dashboard = document.querySelector('.dashboard');
  const style = window.getComputedStyle(dashboard);
  expect(style.position).not.toBe('fixed');
  expect(style.overflow).not.toBe('hidden');
});
```

---

## 🔐 ENFORCEMENT

These rules are **NON-NEGOTIABLE** because:

1. **Production Impact:** 120+ active users
2. **UX Critical:** Broken scroll = broken app
3. **Mobile Disaster:** Scroll locks destroy mobile UX
4. **Accessibility:** Screen readers need scroll
5. **SEO Impact:** Broken layout = poor rankings

**Violation Consequences:**
- ❌ PR rejected
- ❌ Deployment blocked
- 🚨 Emergency rollback

---

## 📞 QUESTIONS?

**Before making ANY change that affects:**
- body, html, #root, or App styles
- overflow properties
- height: 100vh usage
- position: fixed on containers
- Global scroll behavior

**Always consult:**
1. This document
2. [core-ui/README.md](./README.md)
3. Senior engineer approval

---

**Priority:** 🔴 **HIGHEST**  
**Status:** 🔴 **MANDATORY**  
**Stability > Features > Speed**

---

Last Updated: February 9, 2026  
Maintained by: @Philip2024394
