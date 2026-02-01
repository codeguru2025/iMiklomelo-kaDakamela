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