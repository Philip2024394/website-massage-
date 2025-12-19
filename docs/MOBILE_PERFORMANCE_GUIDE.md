# 📱 Mobile Performance Optimization Guide

## 🎯 Performance Targets (Google Web Vitals)

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s ✅
- **FID (First Input Delay)**: < 100ms ✅
- **CLS (Cumulative Layout Shift)**: < 0.1 ✅

### Mobile Specific
- **FCP (First Contentful Paint)**: < 1.8s
- **TTI (Time to Interactive)**: < 3.9s
- **Speed Index**: < 3.4s
- **Total Bundle Size**: < 200 KB (gzipped)

---

## ⚡ Optimization Techniques

### 1. Code Splitting & Lazy Loading

```tsx
// ✅ GOOD: Route-based code splitting
import React, { lazy, Suspense } from 'react';

const TherapistDashboard = lazy(() => import('./pages/TherapistDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const PlaceDashboard = lazy(() => import('./pages/PlaceDashboard'));

// Loading skeleton
const LoadingSkeleton = () => (
  <div className="animate-pulse p-4">
    <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
  </div>
);

// Usage with Suspense
<Suspense fallback={<LoadingSkeleton />}>
  <TherapistDashboard />
</Suspense>
```

### 2. Image Optimization

```tsx
// ✅ GOOD: Responsive images with lazy loading
<picture>
  <source
    srcSet="/images/hero-mobile.webp 400w, /images/hero-tablet.webp 800w"
    media="(max-width: 768px)"
    type="image/webp"
  />
  <source
    srcSet="/images/hero-desktop.webp 1200w"
    type="image/webp"
  />
  <img
    src="/images/hero-fallback.jpg"
    alt="Hero"
    loading="lazy"
    className="w-full h-auto"
  />
</picture>

// ✅ GOOD: Background images with IntersectionObserver
import { useEffect, useRef, useState } from 'react';

export const LazyBackgroundImage = ({ src, placeholder, children }) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          observer.unobserve(entry.target);
        }
      });
    });

    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [src]);

  return (
    <div
      ref={imgRef}
      style={{ backgroundImage: `url(${imageSrc})` }}
      className="bg-cover bg-center"
    >
      {children}
    </div>
  );
};
```

### 3. Bundle Size Optimization

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true, gzipSize: true, brotliSize: true })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', 'framer-motion'],
          'appwrite-vendor': ['appwrite'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
  },
});
```

### 4. Tree Shaking

```typescript
// ❌ BAD: Imports everything
import * as Icons from 'lucide-react';

// ✅ GOOD: Import only what you need
import { User, Settings, Home } from 'lucide-react';

// ❌ BAD: Imports entire library
import _ from 'lodash';

// ✅ GOOD: Import specific functions
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
```

### 5. Dynamic Imports for Heavy Features

```tsx
// ✅ GOOD: Load heavy features on demand
const ChatWindow = lazy(() => 
  import(/* webpackChunkName: "chat" */ './components/ChatWindow')
);

const VideoCall = lazy(() => 
  import(/* webpackChunkName: "video" */ './components/VideoCall')
);

// Load only when needed
const handleOpenChat = () => {
  setShowChat(true); // Triggers lazy load
};
```

### 6. Debouncing & Throttling

```typescript
import { useState, useCallback } from 'react';
import debounce from 'lodash/debounce';

export const SearchBar = () => {
  const [query, setQuery] = useState('');

  // ✅ GOOD: Debounce search API calls
  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      // API call here
      fetch(`/api/search?q=${searchTerm}`);
    }, 300),
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    debouncedSearch(e.target.value);
  };

  return <input value={query} onChange={handleChange} />;
};
```

### 7. Virtualization for Long Lists

```tsx
import { FixedSizeList as List } from 'react-window';

// ✅ GOOD: Render only visible items
export const TherapistList = ({ therapists }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <TherapistCard therapist={therapists[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={therapists.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

### 8. Service Worker for Offline Support

```typescript
// public/service-worker.js
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `indastreet-${CACHE_VERSION}`;

const STATIC_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

### 9. Critical CSS Inline

```html
<!-- index.html -->
<head>
  <!-- Inline critical CSS for above-the-fold content -->
  <style>
    .hero { min-height: 100vh; background: #ff6b35; }
    .btn-primary { background: #ff6b35; color: white; }
  </style>
  
  <!-- Load full CSS asynchronously -->
  <link rel="preload" href="/styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="/styles.css"></noscript>
</head>
```

### 10. Prefetch/Preload Strategic Resources

```tsx
import { useEffect } from 'react';

export const PrefetchResources = () => {
  useEffect(() => {
    // Prefetch next likely page
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = '/therapist-dashboard';
    document.head.appendChild(link);

    // Preconnect to API domain
    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = 'https://cloud.appwrite.io';
    document.head.appendChild(preconnect);
  }, []);

  return null;
};
```

---

## 📊 Performance Monitoring

### Lighthouse CI Configuration

```json
// lighthouserc.json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "settings": {
        "preset": "desktop",
        "throttlingMethod": "simulate"
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "first-contentful-paint": ["error", {"maxNumericValue": 1800}],
        "interactive": ["error", {"maxNumericValue": 3900}],
        "largest-contentful-paint": ["error", {"maxNumericValue": 2500}]
      }
    }
  }
}
```

### Performance Monitoring Hook

```typescript
export const usePerformanceMonitoring = () => {
  useEffect(() => {
    if ('performance' in window) {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const connectTime = perfData.responseEnd - perfData.requestStart;
      const renderTime = perfData.domComplete - perfData.domLoading;

      console.log('📊 Performance Metrics:', {
        pageLoadTime: `${pageLoadTime}ms`,
        connectTime: `${connectTime}ms`,
        renderTime: `${renderTime}ms`,
      });
    }
  }, []);
};
```

---

## 🎯 Mobile-Specific Optimizations

### Touch Optimization

```css
/* Improve touch responsiveness */
button, a {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

/* Prevent 300ms delay on mobile */
* {
  touch-action: manipulation;
}
```

### Viewport Configuration

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
```

### Font Loading Strategy

```css
/* Font display swap for faster text rendering */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2') format('woff2');
  font-display: swap;
  font-weight: 100 900;
}
```

---

## 📱 Testing Checklist

- [ ] Test on 3G network (Chrome DevTools)
- [ ] Test on low-end Android device
- [ ] Check bundle size: `npm run build && ls -lh dist`
- [ ] Run Lighthouse audit (target score: 90+)
- [ ] Verify lazy loading with Network tab
- [ ] Check for console errors
- [ ] Test offline functionality
- [ ] Verify images use WebP format
- [ ] Ensure critical CSS is inline
- [ ] Check for unused code with Coverage tool

---

## 🚀 Implementation Priority

1. **IMMEDIATE**: Implement code splitting (React.lazy)
2. **IMMEDIATE**: Split large files (> 250 lines)
3. **HIGH**: Optimize images (WebP, lazy loading)
4. **HIGH**: Configure bundle splitting in Vite
5. **MEDIUM**: Add virtualization for long lists
6. **MEDIUM**: Implement service worker
7. **LOW**: Fine-tune with performance monitoring

---

## 📚 Resources

- [Web Vitals](https://web.dev/vitals/)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Vite Performance](https://vitejs.dev/guide/performance.html)
- [Lighthouse Scoring](https://web.dev/performance-scoring/)
