# IndoStreet Massage Platform - Modular Architecture

## Project Structure

```
website-massage-/
├── src/
│   ├── apps/                     # Separate applications for each user type
│   │   ├── admin/               # Admin portal
│   │   │   ├── components/      # Admin-specific components
│   │   │   ├── pages/          # Admin pages
│   │   │   ├── hooks/          # Admin-specific hooks
│   │   │   ├── services/       # Admin API services
│   │   │   ├── types/          # Admin type definitions
│   │   │   ├── utils/          # Admin utilities
│   │   │   └── AdminApp.tsx    # Admin app entry point
│   │   │
│   │   ├── agent/              # Agent portal
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   └── AgentApp.tsx
│   │   │
│   │   ├── client/             # Client/Customer app
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   └── ClientApp.tsx
│   │   │
│   │   ├── therapist/          # Therapist portal
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   └── TherapistApp.tsx
│   │   │
│   │   ├── place/              # Massage place portal
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   └── PlaceApp.tsx
│   │   │
│   │   ├── hotel/              # Hotel portal
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   └── HotelApp.tsx
│   │   │
│   │   └── villa/              # Villa portal
│   │       ├── components/
│   │       ├── pages/
│   │       ├── hooks/
│   │       ├── services/
│   │       ├── types/
│   │       ├── utils/
│   │       └── VillaApp.tsx
│   │
│   ├── shared/                 # Shared resources across all apps
│   │   ├── components/         # Reusable UI components
│   │   ├── types/              # Shared TypeScript types
│   │   ├── services/           # Shared API services
│   │   ├── utils/              # Shared utility functions
│   │   ├── constants/          # Application constants
│   │   ├── hooks/              # Shared React hooks
│   │   └── contexts/           # React contexts
│   │
│   ├── AppRouter.tsx           # Main application router
│   └── index.tsx               # Application entry point
│
├── mobile/                     # Mobile app configurations
│   ├── android/                # Android-specific configurations
│   ├── ios/                    # iOS-specific configurations
│   └── expo/                   # Expo configuration (if using Expo)
│
├── backend/                    # Backend API (if included)
│   ├── src/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   └── middleware/
│
├── docs/                       # Project documentation
├── tests/                      # Test files
├── public/                     # Public assets
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Architecture Benefits

### 1. **Separation of Concerns**
- Each user type has its own dedicated application
- Clear boundaries between different user roles
- Easier to maintain and scale individual features

### 2. **Code Reusability**
- Shared components, utilities, and services
- Consistent design system across all apps
- DRY (Don't Repeat Yourself) principle

### 3. **Mobile-First Design**
- Structured for React Native compatibility
- Shared business logic between web and mobile
- API-first approach for cross-platform development

### 4. **Scalability**
- Easy to add new user types or features
- Modular architecture allows for team specialization
- Independent deployment of different app areas

### 5. **Security**
- Role-based access control at the application level
- Isolated permissions per user type
- Secure routing and authentication

## App Areas

### 1. **Admin Portal** (`/admin`)
- User management
- System configuration
- Analytics and reports
- Service management
- Platform oversight

### 2. **Agent Portal** (`/agent`)
- Referral management
- Commission tracking
- Performance analytics
- Lead generation tools

### 3. **Client App** (`/client`)
- Service browsing
- Booking management
- Payment processing
- Review and rating system
- Favorite therapists/places

### 4. **Therapist Portal** (`/therapist`)
- Profile management
- Schedule management
- Booking notifications
- Earnings tracking
- Hotel/villa discount management

### 5. **Place Portal** (`/place`)
- Business profile management
- Staff management
- Service offerings
- Booking calendar
- Revenue analytics
- Hotel/villa partnership

### 6. **Hotel Portal** (`/hotel`)
- Guest service menu
- Provider directory
- QR code generation
- Booking management
- Guest experience tracking

### 7. **Villa Portal** (`/villa`)
- Similar to hotel but villa-specific
- Personalized guest services
- Private booking management
- Exclusive provider networks

## Mobile App Strategy

### React Native Integration
- Shared business logic with web app
- Native UI components for better performance
- Platform-specific optimizations

### API-First Approach
- RESTful API design
- GraphQL for complex queries
- Real-time features with WebSockets

### Cross-Platform Features
- Push notifications
- Location services
- Payment integration
- Offline capabilities

## Development Workflow

### 1. **Feature Development**
- Develop in web app first
- Extract business logic to shared services
- Implement mobile-specific UI

### 2. **Testing Strategy**
- Unit tests for shared utilities
- Integration tests for API services
- E2E tests for critical user flows

### 3. **Deployment**
- Web app: Vercel/Netlify
- Mobile: App Store/Google Play
- Backend: AWS/Google Cloud

## Technology Stack

### Frontend
- React 19 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- React Query for state management

### Mobile
- React Native
- Expo (optional)
- Native navigation
- Push notifications

### Backend
- Node.js with Express
- PostgreSQL/MongoDB
- JWT authentication
- File upload handling

### DevOps
- GitHub Actions for CI/CD
- Docker containers
- Environment management
- Monitoring and logging