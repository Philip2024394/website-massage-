# IndoStreet Massage Platform 🌟

A modern, modular massage booking platform designed for scalability and mobile-first development.

## 🏗️ Architecture Overview

This platform uses a **modular architecture** with separate applications for each user type, making it perfect for both web and mobile development.

```
🌐 Web Apps                    📱 Mobile Apps
├── Admin Portal              ├── Admin Mobile
├── Agent Portal              ├── Agent Mobile  
├── Client App                ├── Client Mobile
├── Therapist Portal          ├── Therapist Mobile
├── Place Portal              ├── Place Mobile
├── Hotel Portal              ├── Hotel Mobile
└── Villa Portal              └── Villa Mobile
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Installation
```bash
# Clone the repository
git clone https://github.com/Philip2024394/website-massage-.git
cd website-massage-

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development URLs
- **Landing Page**: http://localhost:3000/
- **Admin Portal**: http://localhost:3000/admin
- **Agent Portal**: http://localhost:3000/agent
- **Client App**: http://localhost:3000/client
- **Therapist Portal**: http://localhost:3000/therapist
- **Place Portal**: http://localhost:3000/place
- **Hotel Portal**: http://localhost:3000/hotel
- **Villa Portal**: http://localhost:3000/villa

## 📁 Project Structure

```
src/
├── apps/                     # Separate applications
│   ├── admin/               # Admin portal
│   ├── agent/               # Agent portal
│   ├── client/              # Client application
│   ├── therapist/           # Therapist portal
│   ├── place/               # Massage place portal
│   ├── hotel/               # Hotel portal
│   └── villa/               # Villa portal
├── shared/                  # Shared resources
│   ├── components/          # Reusable UI components
│   ├── types/               # TypeScript type definitions
│   ├── services/            # API services
│   ├── utils/               # Utility functions
│   ├── constants/           # Application constants
│   ├── hooks/               # Shared React hooks
│   └── contexts/            # React contexts
└── AppRouter.tsx            # Main application router
```

## 👥 User Types & Features

### 🔧 Admin Portal
- **Users**: System administrators
- **Features**: 
  - User management
  - System configuration
  - Analytics and reports
  - Service management
  - Platform oversight

### 💼 Agent Portal  
- **Users**: Sales agents and referral partners
- **Features**:
  - Referral management
  - Commission tracking
  - Performance analytics
  - Lead generation tools

### 👤 Client App
- **Users**: End customers seeking massage services
- **Features**:
  - Service browsing
  - Booking management
  - Payment processing
  - Review and rating system
  - Favorite therapists/places

### 💆 Therapist Portal
- **Users**: Individual massage therapists
- **Features**:
  - Profile management
  - Schedule management
  - Booking notifications
  - Earnings tracking
  - Hotel/villa discount management

### 🏢 Place Portal
- **Users**: Massage business owners
- **Features**:
  - Business profile management
  - Staff management
  - Service offerings
  - Booking calendar
  - Revenue analytics
  - Hotel/villa partnerships

### 🏨 Hotel Portal
- **Users**: Hotel management
- **Features**:
  - Guest service menu
  - Provider directory
  - QR code generation
  - Booking management
  - Guest experience tracking

### 🏡 Villa Portal
- **Users**: Villa owners/managers
- **Features**:
  - Personalized guest services
  - Private booking management
  - Exclusive provider networks
  - Custom service menus

## 🔐 Authentication

Each app has its own authentication flow with demo credentials:

- **Admin**: `admin123` / `indostreet2024`
- **Hotel**: `hotel123` / `indostreet2024`
- **Villa**: `villa123` / `indostreet2024`
- **Others**: `user@example.com` / `password123`

## 🎨 Design System

The platform features a **glass frosted effect** design with:
- Semi-transparent containers
- Backdrop blur effects
- **IndoStreet** branding
- Orange accent colors (#f97316)
- Gradient backgrounds
- Mobile-first responsive design

## 🛠️ Technology Stack

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Vite** for build tooling
- **Framer Motion** for animations

### Mobile (Planned)
- **React Native**
- **Expo** (optional)
- Native navigation
- Push notifications

### Backend (API-Ready)
- **Node.js** with Express
- **PostgreSQL/MongoDB**
- **JWT** authentication
- **RESTful API** design

## 📱 Mobile Development

The architecture is designed for easy React Native integration:

```bash
# Start mobile development
npm run mobile:start

# Run on Android
npm run mobile:android

# Run on iOS  
npm run mobile:ios
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with UI
npm test:ui

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📦 Building & Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Deployment Targets
- **Web**: Vercel, Netlify, or any static hosting
- **Mobile**: App Store, Google Play
- **Backend**: AWS, Google Cloud, or any Node.js hosting

## 🔧 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm test            # Run tests
npm run lint        # Lint code
npm run lint:fix    # Fix linting issues
npm run type-check  # TypeScript type checking
```

## 📖 Documentation

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) - Detailed architecture overview
- [`MIGRATION.md`](./MIGRATION.md) - Migration from old structure
- [`mobile/README.md`](./mobile/README.md) - Mobile development guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Features Highlights

### ✨ Modular Architecture
- Separate apps for each user type
- Shared components and utilities
- Easy to scale and maintain

### 📱 Mobile-First Design  
- Responsive layouts
- Touch-friendly interfaces
- Progressive Web App ready

### 🔒 Secure Authentication
- Role-based access control
- JWT token management
- Secure routing

### 🎯 Business Features
- **Hotel/Villa Integration**: QR codes, custom menus, provider directories
- **Discount Management**: Flexible pricing for partnerships
- **Booking System**: Real-time scheduling and notifications
- **Payment Processing**: Secure payment handling
- **Review System**: Rating and feedback management

### 🚀 Performance
- Code splitting by app type
- Optimized bundle sizes
- Fast initial load times
- Efficient caching strategies

## 🔄 Migration from Old Structure

If you're migrating from the previous flat structure:

1. Run the migration script: `node migrate.js`
2. Follow the [`MIGRATION.md`](./MIGRATION.md) guide
3. Update import paths
4. Test each app individually

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation files
- Review the migration guide

---

**Built with ❤️ by the IndoStreet Team**