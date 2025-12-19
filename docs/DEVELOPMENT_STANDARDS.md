# DEVELOPMENT STANDARDS & BEST PRACTICES

## Overview
This document outlines coding standards, development workflows, and troubleshooting procedures for the IndaStreet platform, following enterprise-grade practices from Facebook, Amazon, Google, and Microsoft.

---

## Table of Contents
1. [Code Quality Standards](#code-quality-standards)
2. [Component Development](#component-development)
3. [State Management](#state-management)
4. [Performance Guidelines](#performance-guidelines)
5. [Error Handling](#error-handling)
6. [Testing Strategy](#testing-strategy)
7. [Git Workflow](#git-workflow)
8. [Troubleshooting Guide](#troubleshooting-guide)

---

## Code Quality Standards

### General Principles
- **DRY (Don't Repeat Yourself)**: Extract repeated logic into reusable functions/components
- **KISS (Keep It Simple, Stupid)**: Simple solutions are easier to maintain
- **YAGNI (You Aren't Gonna Need It)**: Don't add functionality until it's needed
- **SOLID Principles**: Especially Single Responsibility and Dependency Inversion

### File Size Limits
```typescript
// Maximum lines per file (warnings in VS Code)
- Components: 300 lines (hard limit: 500)
- Services: 400 lines (hard limit: 600)
- Utilities: 200 lines (hard limit: 300)
- Types: 150 lines (hard limit: 250)

// If exceeding limits, split into:
pages/Dashboard/
├── index.tsx (main component)
├── Header.tsx
├── Sidebar.tsx
├── Content.tsx
└── hooks/
    └── useDashboardState.ts
```

### Naming Conventions
```typescript
// Components: PascalCase
const MembershipTermsModal = () => { ... }

// Functions/Variables: camelCase
const handleSubmit = () => { ... }
const userData = { ... }

// Constants: SCREAMING_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com'
const MAX_RETRIES = 3

// Private functions: _prefix (optional)
const _validateInput = () => { ... }

// Boolean variables: is/has/should prefix
const isLoading = false
const hasAccess = true
const shouldRender = false

// Event handlers: handle prefix
const handleClick = () => { ... }
const handleChange = () => { ... }

// Async functions: clear naming
const fetchUserData = async () => { ... }
const saveToDatabase = async () => { ... }
```

### Comment Standards
```typescript
// ✅ GOOD: Explain WHY, not WHAT
// Calculate commission after 3-hour grace period to prevent account suspension
const calculateCommission = (amount: number, hours: number) => {
  if (hours > 3) return amount * 0.30
  return 0
}

// ❌ BAD: Obvious comments
// This function calculates commission
const calculateCommission = (amount: number) => { ... }

// ✅ GOOD: Document complex logic
/**
 * Processes membership upgrade with prorated billing.
 * 
 * Algorithm:
 * 1. Calculate remaining days in current billing cycle
 * 2. Apply credit for unused days
 * 3. Charge difference for new plan
 * 
 * @param currentPlan - Current membership plan
 * @param newPlan - Desired membership plan
 * @returns Transaction details with prorated amounts
 */
const processMembershipUpgrade = (currentPlan, newPlan) => { ... }
```

---

## Component Development

### Component Structure Template
```typescript
// 1. IMPORTS (grouped)
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import Button from '@/components/Button'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency } from '@/utils/formatters'
import type { MembershipPlan } from '@/types/membership'

// 2. TYPES/INTERFACES
interface MembershipCardProps {
  plan: MembershipPlan
  onSelect: (planId: string) => void
  isSelected?: boolean
}

// 3. CONSTANTS (outside component)
const ANIMATION_DURATION = 300
const MAX_FEATURES_DISPLAY = 5

// 4. HELPER FUNCTIONS (outside component)
const calculateDiscount = (price: number, percentage: number): number => {
  return price * (1 - percentage / 100)
}

// 5. MAIN COMPONENT
const MembershipCard: React.FC<MembershipCardProps> = ({
  plan,
  onSelect,
  isSelected = false
}) => {
  // 5a. STATE
  const [isHovered, setIsHovered] = useState(false)
  
  // 5b. HOOKS
  const { user } = useAuth()
  
  // 5c. MEMOIZED VALUES
  const discountedPrice = useMemo(
    () => calculateDiscount(plan.price, plan.discount),
    [plan.price, plan.discount]
  )
  
  // 5d. CALLBACKS
  const handleSelect = useCallback(() => {
    onSelect(plan.id)
  }, [plan.id, onSelect])
  
  // 5e. EFFECTS
  useEffect(() => {
    // Setup/cleanup logic
  }, [])
  
  // 5f. RENDER HELPERS (if complex)
  const renderFeatures = () => (
    <ul>
      {plan.features.map(feature => (
        <li key={feature}>{feature}</li>
      ))}
    </ul>
  )
  
  // 5g. EARLY RETURNS
  if (!plan) return null
  
  // 5h. MAIN RENDER
  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h3>{plan.name}</h3>
      <p>{formatCurrency(discountedPrice)}</p>
      {renderFeatures()}
      <Button onClick={handleSelect}>
        {isSelected ? 'Selected' : 'Select Plan'}
      </Button>
    </div>
  )
}

// 6. EXPORT
export default MembershipCard
```

### Props Best Practices
```typescript
// ✅ GOOD: Explicit types with defaults
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  className?: string
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = ''
}) => { ... }

// ❌ BAD: Using 'any' or implicit types
const Button = (props: any) => { ... }
```

### Conditional Rendering
```typescript
// ✅ GOOD: Early returns for clarity
if (!user) return <LoginPrompt />
if (isLoading) return <LoadingSpinner />
if (error) return <ErrorMessage error={error} />

return <Dashboard user={user} />

// ✅ GOOD: Ternary for simple conditions
{isLoggedIn ? <UserMenu /> : <LoginButton />}

// ❌ BAD: Nested ternaries (hard to read)
{isLoggedIn ? (hasAccess ? <Dashboard /> : <AccessDenied />) : <Login />}

// ✅ BETTER: Use early returns or variables
if (!isLoggedIn) return <Login />
if (!hasAccess) return <AccessDenied />
return <Dashboard />
```

---

## State Management

### Local State (useState)
```typescript
// ✅ GOOD: Use for component-specific UI state
const [isOpen, setIsOpen] = useState(false)
const [searchTerm, setSearchTerm] = useState('')

// Initialize from props if needed
const [value, setValue] = useState(initialValue)
```

### Complex State (useReducer)
```typescript
// ✅ GOOD: Use for complex state logic
type State = {
  data: UserData[]
  loading: boolean
  error: Error | null
}

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: UserData[] }
  | { type: 'FETCH_ERROR'; error: Error }

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null }
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, data: action.payload }
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.error }
    default:
      return state
  }
}

const [state, dispatch] = useReducer(reducer, initialState)
```

### Global State (Context)
```typescript
// contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null
  login: (credentials: Credentials) => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // ... implementation
  
  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook for consuming context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

---

## Performance Guidelines

### Optimization Checklist
- [ ] Use `React.memo` for expensive components
- [ ] Use `useMemo` for expensive calculations
- [ ] Use `useCallback` for functions passed to children
- [ ] Lazy load routes and heavy components
- [ ] Debounce search/filter inputs
- [ ] Virtualize long lists (react-window)
- [ ] Optimize images (WebP, lazy loading)
- [ ] Code split by route/feature

### React.memo Example
```typescript
// ✅ GOOD: Prevent re-renders when props unchanged
const MembershipCard = React.memo<MembershipCardProps>(({ plan, onSelect }) => {
  return <div>...</div>
}, (prevProps, nextProps) => {
  // Custom comparison (optional)
  return prevProps.plan.id === nextProps.plan.id
})
```

### useMemo Example
```typescript
// ✅ GOOD: Expensive calculations
const sortedAndFilteredData = useMemo(() => {
  return data
    .filter(item => item.status === 'active')
    .sort((a, b) => b.createdAt - a.createdAt)
}, [data]) // Only recalculate when 'data' changes

// ❌ BAD: Unnecessary memoization
const simpleValue = useMemo(() => props.value * 2, [props.value])
// Just use: const simpleValue = props.value * 2
```

### useCallback Example
```typescript
// ✅ GOOD: Prevent child re-renders
const ParentComponent = () => {
  const [count, setCount] = useState(0)
  
  // Without useCallback, creates new function on every render
  const handleClick = useCallback(() => {
    console.log('Clicked!')
  }, []) // Empty deps = never recreated
  
  return <ChildComponent onClick={handleClick} />
}

const ChildComponent = React.memo<{ onClick: () => void }>(({ onClick }) => {
  return <button onClick={onClick}>Click</button>
})
```

### Code Splitting
```typescript
// ✅ GOOD: Lazy load heavy components
const Dashboard = React.lazy(() => import('./pages/Dashboard'))
const AdminPanel = React.lazy(() => import('./pages/AdminPanel'))

const App = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin" element={<AdminPanel />} />
    </Routes>
  </Suspense>
)
```

### Debouncing
```typescript
// hooks/useDebounce.ts
import { useState, useEffect } from 'react'

export const useDebounce = <T,>(value: T, delay: number = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

// Usage:
const SearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 500)
  
  useEffect(() => {
    if (debouncedSearch) {
      performSearch(debouncedSearch)
    }
  }, [debouncedSearch])
  
  return <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
}
```

---

## Error Handling

### Error Boundaries
```typescript
// components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to error reporting service
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
```

### Async Error Handling
```typescript
// ✅ GOOD: Proper async/await with error handling
const fetchUserData = async (userId: string) => {
  try {
    const response = await fetch(`/api/users/${userId}`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    if (error instanceof TypeError) {
      // Network error
      console.error('Network error:', error)
      throw new Error('Unable to connect. Please check your internet.')
    }
    throw error
  }
}

// Usage in component:
const UserProfile = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchUserData(userId)
        setUser(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    
    loadUser()
  }, [userId])
  
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />
  if (!user) return <NotFound />
  
  return <div>{user.name}</div>
}
```

---

## Testing Strategy

### Unit Testing (Vitest)
```typescript
// Button.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Button from './Button'

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
  
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
  
  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>)
    expect(screen.getByText('Click me')).toBeDisabled()
  })
})
```

### Integration Testing
```typescript
// MembershipFlow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MembershipFlow } from './MembershipFlow'

describe('Membership Flow', () => {
  it('completes full membership selection', async () => {
    render(<MembershipFlow />)
    
    // Select Pro plan
    fireEvent.click(screen.getByText('Pro Plan'))
    
    // Accept terms
    const checkbox = screen.getByRole('checkbox', { name: /terms/i })
    fireEvent.click(checkbox)
    
    // Submit
    fireEvent.click(screen.getByText('Continue'))
    
    await waitFor(() => {
      expect(screen.getByText('Payment')).toBeInTheDocument()
    })
  })
})
```

---

## Git Workflow

### Branch Naming
```bash
# Features
feat/membership-terms-modal
feat/payment-integration
feat/admin-dashboard

# Bug fixes
fix/landing-page-crash
fix/payment-validation
fix/user-authentication

# Improvements
improve/performance-optimization
improve/error-handling

# Documentation
docs/api-documentation
docs/setup-guide
```

### Commit Messages
```bash
# Format: <type>(<scope>): <subject>

# Examples:
feat(membership): add terms and conditions modal
fix(auth): resolve token expiration issue
improve(performance): optimize dashboard rendering
docs(readme): update installation instructions
refactor(services): extract Appwrite logic to separate files
test(components): add unit tests for Button component

# Types:
# feat: New feature
# fix: Bug fix
# improve: Code improvement (performance, readability)
# refactor: Code restructuring without behavior change
# docs: Documentation only
# test: Adding or updating tests
# chore: Maintenance tasks (dependencies, config)
```

### Pre-commit Checklist
```bash
# Run before committing:
1. npm run lint           # Check for code style issues
2. npm run type-check     # TypeScript validation
3. npm run test           # Run test suite
4. npm run build          # Ensure production build works

# Commands to add to package.json:
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx --max-warnings 0",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "build": "vite build"
  }
}
```

---

## Troubleshooting Guide

### Issue: Files Going Missing / Import Errors

**Symptoms:**
- Vite errors: "Failed to resolve import"
- TypeScript errors: "Cannot find module"
- Dev server crashes on file save

**Causes:**
1. File deleted/moved without updating imports
2. Case sensitivity mismatch (Windows vs Linux)
3. Incorrect path in import statement
4. Missing file extension in import

**Solutions:**
```bash
# 1. Verify file exists
ls pages/MembershipPage.tsx

# 2. Check all imports of the file
# In VS Code: Right-click file → "Find All References"

# 3. Update imports to use path aliases
# Before:
import Button from '../../components/Button'
# After:
import Button from '@/components/Button'

# 4. Clear Vite cache
Remove-Item -Recurse -Force "node_modules/.vite", ".vite"

# 5. Restart dev server
npm run dev:app
```

**Prevention:**
- Always use absolute imports with path aliases
- Use VS Code's "Find All References" before moving files
- Run import validation script (see below)

### Issue: VS Code Crashing / Slow Performance

**Symptoms:**
- VS Code becomes unresponsive
- High CPU/memory usage
- IntelliSense not working
- File watching errors

**Causes:**
1. Too many files being watched
2. Large `node_modules` directory
3. Memory leaks from extensions
4. Corrupted workspace state

**Solutions:**
```bash
# 1. Check VS Code resource usage
# Task Manager → Details → Code.exe

# 2. Increase VS Code memory limit
code --max-memory=8192

# 3. Disable unused extensions
# Extensions → Disable (don't uninstall)

# 4. Clear VS Code cache (Windows)
Remove-Item -Recurse -Force "$env:APPDATA\Code\Cache"
Remove-Item -Recurse -Force "$env:APPDATA\Code\CachedData"

# 5. Reset VS Code settings (nuclear option)
code --user-data-dir="C:\temp\vscode-temp"

# 6. Check file watcher exclusions
# Should be set in .vscode/settings.json (already configured)
```

**Prevention:**
- Keep `.vscode/settings.json` configured properly ✅ (Done)
- Regularly clean `node_modules` and `dist` folders
- Close unused editor tabs (limit: 10 tabs)
- Use workspace file nesting to reduce visible files

### Issue: Landing Page Not Loading (White Screen)

**Symptoms:**
- Browser shows blank page
- No errors in VS Code terminal
- Dev server running successfully

**Causes:**
1. JavaScript runtime error
2. Missing lazy-loaded component
3. Error in error boundary
4. Suspended component without Suspense

**Solutions:**
```bash
# 1. Check browser console
# Press F12 → Console tab
# Look for red error messages

# 2. Check network tab
# Press F12 → Network tab
# Look for failed requests (red)

# 3. Verify all lazy imports exist
node scripts/validate-imports.js

# 4. Check for circular dependencies
npm install --save-dev madge
npx madge --circular --extensions ts,tsx ./

# 5. Add console.log to LandingPage
# pages/LandingPage.tsx (add to top of component)
console.log('LandingPage rendering')

# 6. Test with simpler component
# App.tsx - temporarily replace LandingPage:
const LandingPage = () => <div>Test Page</div>
```

**Prevention:**
- Use ErrorBoundary components
- Add Suspense fallbacks for lazy components
- Run `npm run build` regularly to catch issues early
- Test in incognito mode to avoid cache issues

### Issue: Vite Asking for 'h' or 'r' (HMR Issues)

**Symptoms:**
- Terminal prompts: "press h + enter to show help"
- Terminal prompts: "press r + enter to restart"
- Changes not reflecting in browser
- HMR connection lost

**Causes:**
1. Build errors preventing HMR
2. Circular dependencies
3. TypeScript errors
4. WebSocket connection failure

**Solutions:**
```bash
# 1. Check for TypeScript errors
npm run type-check

# 2. Fix all ESLint warnings
npm run lint -- --fix

# 3. Clear all caches
Remove-Item -Recurse -Force "node_modules/.vite", ".vite", "dist"
npm install

# 4. Restart with clean state
Get-Process node | Stop-Process -Force
npm run dev:app

# 5. Check firewall/antivirus
# Ensure localhost:3000 is allowed

# 6. Try different port
# Set in .env: VITE_PORT=3001
```

**Prevention:**
- Fix TypeScript errors immediately (don't let them accumulate)
- Avoid circular imports
- Keep dependencies up to date
- Use `vite.config.ts` optimizations ✅ (Done)

### Issue: Slow Build Times

**Symptoms:**
- `npm run dev` takes > 10 seconds to start
- `npm run build` takes > 2 minutes
- HMR updates are slow

**Causes:**
1. Large files not being split
2. Too many dependencies
3. Inefficient code splitting
4. Missing optimization config

**Solutions:**
```bash
# 1. Analyze bundle size
npm install --save-dev rollup-plugin-visualizer
# Add to vite.config.ts:
import { visualizer } from 'rollup-plugin-visualizer'
plugins: [react(), visualizer()]

# 2. Build and view report
npm run build
# Open stats.html in browser

# 3. Split large files
# If file > 300 lines, split into smaller modules

# 4. Check for duplicate dependencies
npm dedupe

# 5. Use faster package manager (pnpm)
npm install -g pnpm
pnpm install

# 6. Enable SWC instead of Babel (faster)
# vite.config.ts:
plugins: [
  react({
    jsxRuntime: 'automatic',
    babel: {
      plugins: []
    }
  })
]
```

**Prevention:**
- Keep files small (<500 lines)
- Use dynamic imports for heavy libraries
- Optimize vendor chunks ✅ (Done in vite.config.ts)
- Regularly audit bundle size

---

## Quick Reference Commands

```bash
# Development
npm run dev:app              # Start main app (port 3000)
npm run dev:admin            # Start admin app (port 3004)

# Build
npm run build                # Production build
npm run preview              # Preview production build

# Code Quality
npm run lint                 # Check code style
npm run lint -- --fix        # Auto-fix code style
npm run type-check           # TypeScript validation
npm run test                 # Run tests

# Maintenance
npm run clean                # Clean all build artifacts
npm install                  # Install dependencies
npm update                   # Update dependencies
npm audit fix                # Fix security vulnerabilities

# Git
git status                   # Check working directory
git add -A                   # Stage all changes
git commit -m "message"      # Commit with message
git push origin main         # Push to remote

# Cache Clearing
Remove-Item -Recurse -Force "node_modules/.vite", ".vite"
Remove-Item -Recurse -Force "node_modules/.cache"
npm install
```

---

## Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Appwrite Documentation](https://appwrite.io/docs)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

**Last Updated**: December 16, 2025  
**Version**: 1.0.0  
**Status**: ✅ Active Standard  
**Next Review**: January 2026
