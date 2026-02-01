# Imiklomelo Ka Dakamela - Event Platform

## Overview

This is the official web platform for **Imiklomelo Ka Dakamela** (Chief Dakamela Achievers Awards & Cultural Gathering). The application serves as a mission-critical, mobile-first booking and reservation system for a high-profile cultural event in South Africa.

Key functions:
- Event information and registration for attendees
- Accommodation and camping booking with optional services
- Exhibitor and sponsor application management
- Heritage archive displaying past events and awardees
- Admin dashboard for managing reservations, companies, and announcements

**Important governance rule**: There are NO public nominations or voting. All awards are privately decided and conferred by the Chief. The platform only displays past and official outcomes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theme (Sunset Baobab color palette with amber/orange tones)
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript (ES modules)
- **API Pattern**: RESTful JSON API with `/api` prefix
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Storage**: connect-pg-simple for PostgreSQL-backed sessions

### Database Schema
The schema (`shared/schema.ts`) includes:
- **users**: Authentication with role-based access (public, attendee, exhibitor, sponsor, admin)
- **attendees**: Event registration with attendance types (standard, vip, delegation)
- **camps**: Accommodation options with capacity and pricing
- **campServices**: Add-on services (tent rental, meals, etc.)
- **reservations**: Booking records with deposit status tracking
- **payments**: Payment transaction records
- **companies**: Exhibitor and sponsor applications with approval workflow
- **pastEvents**: Historical event records
- **awardees**: Past award recipients (Chief-conferred only)
- **announcements**: Public communications
- **auditLogs**: System activity tracking

### Key Design Patterns
- **Shared Types**: Schema definitions in `shared/` are imported by both client and server
- **Storage Interface**: `server/storage.ts` provides a database abstraction layer
- **Path Aliases**: `@/` for client, `@shared/` for shared code, `@assets/` for attached files
- **Theme System**: Light/dark mode with localStorage persistence

### Build Configuration
- Development: Vite dev server with HMR proxied through Express
- Production: Client bundled to `dist/public`, server bundled with esbuild to `dist/index.cjs`
- Database migrations: Drizzle Kit with `db:push` command

## External Dependencies

### Database
- **PostgreSQL**: Primary database (connection via `DATABASE_URL` environment variable)
- **Drizzle ORM**: Type-safe database queries and schema management

### UI Framework
- **Radix UI**: Accessible component primitives (dialogs, dropdowns, forms, etc.)
- **shadcn/ui**: Pre-built component library configured in `components.json`
- **Tailwind CSS**: Utility-first styling with custom design tokens

### Key Libraries
- **TanStack React Query**: Data fetching and caching
- **React Hook Form**: Form state management
- **Zod**: Runtime validation with TypeScript inference
- **date-fns**: Date formatting utilities
- **Embla Carousel**: Touch-friendly carousels

### Fonts
- Plus Jakarta Sans (primary sans-serif)
- Playfair Display (serif headings)
- Inter (UI text)
- Loaded via Google Fonts CDN

## Recent Changes (February 2026)

### Payment Integration
- **Paynow Integration**: Live payment gateway integration with Paynow (Zimbabwe)
  - Environment variables: `PAYNOW_INTEGRATION_ID`, `PAYNOW_INTEGRATION_KEY`
  - Hash verification for callback security
  - Support for mobile money and card payments
- **Pricing**: All prices in USD ($25/day or $60 full camp duration)
- **30% deposit** required within 48 hours to secure reservations

### Enhanced Registration
New demographic fields collected from all attendees:
- Gender (male, female, other, prefer not to say)
- Age range (under 18, 18-24, 25-34, 35-44, 45-54, 55-64, 65+)
- Profession/industry (optional)
- First-time attendee flag
- Needs accommodation flag
- Marketing consent

### Accommodation Features
- **Camp Centre (Isibaya SikaDakamela)**: Thatched house with bar, pool tables, social lounge, charging station
- **Camping Plan Image**: Visual layout of the Premium Cultural Camping Sanctuary
- **Camp Services**: Breakfast, lunch, supper, bathing water, massage spa, ice bath, WiFi, power bank rental

### Admin Dashboard
- **Analytics**: Demographics, revenue tracking, camp occupancy, attendance types
- **CSV Export**: Download attendee data for offline analysis
- **Authentication**: Protected with `ADMIN_SECRET_KEY` header (development mode bypasses)

### PWA Configuration
- **manifest.json**: Mobile app installation support
- **Service worker**: Offline caching for core pages
- **Apple-specific meta tags**: iOS home screen support