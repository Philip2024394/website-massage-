# 🌐 Global Scrolling Standards

## Overview
This document outlines the application's global scrolling strategy, following web standards for consistent, accessible scrolling behavior across all devices and platforms.

## Core Principles

### 1. Single Scroll Authority 
- **Document/Body level scrolling only** - The browser's native scroll is the primary and preferred scrolling mechanism
- **No scroll-jacking** - Never prevent or override the browser's natural scroll behavior
- **Natural page flow** - Content should flow naturally and be accessible via standard scrolling

### 2. Mobile-First Approach
- **Touch-friendly** - All interactions work smoothly on touch devices
- **PWA compatible** - Scrolling works correctly when app is installed as PWA
- **Safe areas respected** - Properly handles iPhone notches, Android navigation, etc.

### 3. Performance Standards
- **No nested scroll containers** unless absolutely necessary for component functionality
- **Hardware acceleration** via `-webkit-overflow-scrolling: touch`
- **Smooth interactions** - No janky or blocked scroll behavior

---

## Implementation Rules

### ✅ ALLOWED Patterns

#### Standard Page Layout
```css
.page-container {
  min-height: 100vh;
  overflow: visible;
}

main {
  padding-top: 60px; /* Account for fixed header */
  padding-bottom: env(safe-area-inset-bottom, 20px);
}
```

#### Fixed Headers/Navigation
```css
.header {
  position: sticky; /* or fixed */
  top: 0;
  z-index: 50;
  background: white;
}
```

#### Component-Level Scrolling
```css
.scrollable-component {
  max-height: 400px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}
```

### ❌ PROHIBITED Patterns

#### Viewport Height Locking
```css
/* DON'T DO THIS */
.bad-container {
  height: 100vh;
  overflow: hidden; /* Breaks scrolling */
}
```

#### Body Scroll Locking
```css
/* DON'T DO THIS */
body.modal-open {
  overflow: hidden; /* Breaks mobile navigation */
  position: fixed; /* Prevents PWA safe areas */
}
```

#### Nested Full-Height Containers
```css
/* DON'T DO THIS */
.outer-container {
  height: 100vh;
  overflow: hidden;
}
.inner-container {
  height: 100%;
  overflow-y: auto; /* Creates nested scroll hell */
}
```

---

## Component Guidelines

### Page Components
- Use `min-height: 100vh` instead of `height: 100vh`
- Never use `overflow: hidden` on page-level containers
- Allow content to grow naturally beyond viewport

### Layout Components
- Fixed headers: Use `position: sticky` or `position: fixed`
- Sidebars: Can be fixed with internal scrolling if needed
- Main content: Always allow natural flow and scrolling

### Modal/Overlay Components
- Never lock body scroll
- Use fixed positioning with internal scrolling
- Include backdrop but don't prevent page scroll

---

## Exceptions & Special Cases

### When Fixed Heights ARE Allowed

Use the `.preserve-height` class for components that genuinely need fixed dimensions:

```css
.chat-window.preserve-height {
  height: 80vh;
  max-height: 500px;
  overflow-y: auto;
}
```

### Components with Exceptions:
1. **Chat Windows** - Need contained scrolling for message history
2. **Data Tables** - Large datasets may need virtual scrolling
3. **Image Galleries** - May need constrained viewport for UX
4. **Video Players** - Fixed aspect ratios required

---

## Testing Checklist

### Mobile Browsers
- [ ] Content scrolls smoothly on iOS Safari
- [ ] Android Chrome handles overscroll correctly  
- [ ] No scroll conflicts in landscape mode
- [ ] Touch interactions work naturally

### PWA Mode
- [ ] Safe areas respected when installed
- [ ] Navigation bars don't interfere with content
- [ ] Back gesture works correctly
- [ ] Status bar integration works

### Desktop
- [ ] Mouse wheel scrolling works
- [ ] Keyboard navigation (Page Up/Down, arrows) works
- [ ] Trackpad gestures work smoothly

### Accessibility
- [ ] Screen readers can navigate content
- [ ] Keyboard-only navigation works
- [ ] No scroll traps that prevent navigation

---

## Migration Guide

### Converting Existing Components

#### Before (Problematic):
```tsx
<div className="h-screen overflow-hidden">
  <main className="h-full overflow-y-auto">
    {content}
  </main>
</div>
```

#### After (Standards Compliant):
```tsx
<div className="min-h-screen">
  <main style={{ paddingTop: '60px', paddingBottom: '20px' }}>
    {content}
  </main>
</div>
```

### Key Changes Made:
1. **TherapistLayout**: Removed `h-screen` and `overflow-hidden`, converted to natural flow
2. **Mobile CSS**: Updated to prevent scroll-jacking while preserving necessary fixed layouts
3. **Global Styles**: Implemented standards-based scrolling with proper safe area handling

---

## Browser Compatibility

### Supported Features:
- **iOS Safari 12+**: Touch scrolling, safe areas, PWA mode
- **Chrome Mobile 70+**: Overscroll behavior, touch interactions
- **Firefox Mobile 68+**: Standard scrolling behaviors
- **Desktop Browsers**: All modern browsers (Chrome 70+, Firefox 68+, Safari 12+, Edge 79+)

### Known Issues:
- **IE11**: Not supported (uses non-standard scrolling)
- **Very old iOS**: May not respect safe areas perfectly

---

## Performance Monitoring

### Metrics to Track:
1. **Scroll Performance**: Frame rate during scrolling should be 60fps
2. **Touch Response**: First input delay should be < 100ms
3. **Layout Stability**: Cumulative Layout Shift (CLS) should be < 0.1
4. **Accessibility**: Navigation should work without mouse/touch

### Tools:
- Chrome DevTools Performance panel
- Lighthouse accessibility audit
- Real device testing on various screen sizes

---

## Support & Maintenance

### When to Review:
- New component additions
- User reports of scrolling issues
- PWA functionality changes
- Major framework updates

### Common Debug Steps:
1. Check browser console for scroll-related errors
2. Test on actual mobile devices (not just DevTools)
3. Verify PWA mode behavior
4. Test with assistive technologies

### Contact:
- Technical issues: Check browser DevTools console
- Design questions: Refer to this document
- Performance problems: Use Lighthouse audit