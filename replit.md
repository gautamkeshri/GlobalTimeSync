# TimeSync - Timezone Management Application

## Overview

TimeSync is a full-stack web application that helps users manage and synchronize time across multiple timezones. It features real-time timezone tracking, team collaboration, and shared timezone views. The application is built with a modern tech stack using React, Express.js, and PostgreSQL.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### January 16, 2025
- **Enhanced Timezone Selection**: Implemented country suggestions feature with searchable dropdown
- **Expanded Timezone Database**: Added 70+ cities across all continents with proper GMT offsets
- **Improved Search Interface**: Added Command + Popover components for better timezone discovery
- **UI Format Enhancement**: Country suggestions now display as "Country — City" with GMT offset below
- **Cross-env Dependency**: Fixed missing cross-env package for proper environment variable handling

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for development and build processes
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: React Context API for global state (Auth, Timezone, Theme)
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Time Management**: Luxon library for timezone calculations

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Firebase Auth integration
- **Real-time Features**: WebSocket implementation for live updates
- **Storage**: In-memory storage implementation with interface for database switching

## Key Components

### Database Schema
- **Users**: Firebase UID, email, display name, profile photo
- **Timezones**: User's saved timezones with city, country, and primary flag
- **Teams**: Shared timezone groups with owner and settings
- **Team Members**: User-team relationships with roles
- **Team Timezones**: Timezone configurations for teams

### Authentication System
- Firebase Authentication for user management
- JWT token validation on backend
- Protected routes with authentication guards
- User session management with React Context

### Real-time Features
- WebSocket connections for live time synchronization
- Team member presence tracking
- Real-time timezone updates across team members
- Live time manipulation with synchronized views

### UI Components
- Responsive design with mobile-first approach
- Dark/light theme support with system preference detection
- Timezone cards with visual time indicators
- Modal dialogs for adding timezones and team sharing
- Time slider for interactive time adjustment

## Data Flow

1. **User Authentication**: Firebase handles auth, backend creates/updates user records
2. **Timezone Management**: Users add/remove timezones, stored in database with primary timezone designation
3. **Team Collaboration**: Users create teams, generate share links, invite members
4. **Real-time Updates**: WebSocket connections broadcast time changes and timezone modifications
5. **Time Synchronization**: Client-side time calculations with server coordination for team views

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM, React Query)
- UI/UX libraries (Radix UI, Tailwind CSS, Lucide icons)
- Utility libraries (date-fns, luxon, clsx, class-variance-authority)
- Form handling (React Hook Form, Hookform resolvers)
- Development tools (Vite, PostCSS, Autoprefixer)

### Backend Dependencies
- Express.js with TypeScript support
- Database tools (Drizzle ORM, PostgreSQL driver)
- Authentication (Firebase Admin SDK)
- WebSocket support (ws library)
- Development utilities (tsx, esbuild)

### Database Provider
- Neon Database (PostgreSQL) for production
- Drizzle Kit for schema migrations
- Connection pooling and serverless optimization

## Deployment Strategy

### Development Environment
- Vite dev server for frontend hot reloading
- tsx for TypeScript execution in development
- Development-specific middleware and error handling
- Replit integration for cloud development

### Production Build
- Vite builds optimized frontend bundle
- esbuild compiles backend to ESM format
- Static file serving from Express
- Environment-based configuration

### Database Management
- Drizzle migrations for schema changes
- Push command for development schema updates
- Environment variable configuration for database connections
- Automatic schema generation from TypeScript definitions

The application follows a modular architecture with clear separation of concerns, enabling scalable development and maintenance. The real-time features and team collaboration aspects make it suitable for distributed teams working across different time zones.