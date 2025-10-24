# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TimeSync is a full-stack timezone management application that allows users to track and synchronize time across multiple timezones, with team collaboration features and shareable timezone collections.

**Tech Stack:**
- Frontend: React 18 + TypeScript, Vite, Tailwind CSS, Radix UI, TanStack Query, Wouter (routing), Luxon (timezone handling)
- Backend: Express.js + TypeScript, Drizzle ORM, WebSocket (ws), Firebase Authentication
- Database: PostgreSQL (with in-memory fallback via MemStorage)
- Deployment: Vercel (frontend), Cloudflare Workers (WebSocket server - experimental)

## Development Commands

### Running the Application
```bash
npm run dev          # Start development server with hot reloading (http://localhost:5000)
npm run build        # Build for production (compiles both client and server)
npm start            # Start production server
npm run check        # TypeScript type checking
```

### Database Commands
```bash
npm run db:push      # Push Drizzle schema changes to PostgreSQL database
```

### Cloudflare Deployment Commands
```bash
npm run build:worker # Build Cloudflare Worker (API backend)
npm run build:pages  # Build frontend for Cloudflare Pages
npm run deploy:worker # Deploy Worker to Cloudflare
npm run deploy:pages # Deploy Pages to Cloudflare
npm run dev:worker   # Test Worker locally with Wrangler
bash deploy.sh       # Deploy both Worker and Pages (convenience script)
```

**Note:** The application uses in-memory storage (MemStorage) by default. PostgreSQL is only required if DATABASE_URL is set.

## Architecture & Key Patterns

### Monorepo Structure
The project is organized as a monorepo with client, server, and shared code:

```
├── client/src/           # React frontend
│   ├── components/       # UI components (including shadcn/ui components)
│   ├── contexts/         # React contexts: AuthContext, TimezoneContext, ThemeContext
│   ├── pages/            # Page components: dashboard, auth, shared-team, not-found
│   ├── hooks/            # Custom hooks (use-toast, use-mobile)
│   └── lib/              # Utilities (queryClient, firebase config, utils)
├── server/               # Express backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Storage abstraction (MemStorage implementation)
│   └── websocket.ts      # WebSocket server setup
└── shared/
    └── schema.ts         # Drizzle schemas and Zod validators (shared types)
```

### Import Aliases
- `@/` → `client/src/`
- `@shared/` → `shared/`
- `@assets/` → `attached_assets/`

### Build System
The project uses a dual build process:
1. **Vite** builds the React frontend → `dist/public/`
2. **esbuild** bundles the Express server → `dist/index.js`

Build commands combine both: `vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist`

### Storage Layer Abstraction
The storage layer is abstracted through the `IStorage` interface (server/storage.ts). The current implementation is `MemStorage` (in-memory), but this can be swapped for a PostgreSQL implementation using Drizzle ORM without changing route handlers.

**Key Operations:**
- User management: `createOrUpdateUser()`, `getUserByFirebaseUid()`
- Timezone management: `getUserTimezones()`, `createTimezone()`, `deleteTimezone()`, `setPrimaryTimezone()`
- Team operations: `createTeam()`, `getTeamByShareId()`, `copyUserTimezonesToTeam()`

### Authentication Flow
1. **Guest Mode:** Creates ephemeral users with `guest_${timestamp}` Firebase UID (`POST /api/auth/guest`)
2. **Firebase Auth:** Google sign-in via Firebase, server creates/updates user (`POST /api/auth/login`)
3. **Authorization:** User ID passed in `user-id` header for subsequent API requests

All routes expect the `user-id` header (except auth and shared team endpoints).

### Context Providers
The app uses three main contexts (nested in App.tsx):
- **AuthContext:** Manages user authentication state, Firebase integration, guest mode
- **TimezoneContext:** Manages timezone data, CRUD operations, primary timezone selection
- **ThemeProvider:** Theme switching (light/dark mode) with system preference detection

### WebSocket Integration
WebSocket server setup is in `server/websocket.ts` but currently **disabled** in `server/routes.ts:154-155` to avoid port conflicts. When enabled, it supports:
- Real-time timezone synchronization across team members
- Message types: `join`, `timeUpdate`, `timezoneUpdate`
- Team-based broadcasting (messages only sent to clients in the same team)

### Data Schema
The app uses Drizzle ORM with PostgreSQL schemas defined in `shared/schema.ts`:
- **users:** Firebase auth users with profile data
- **timezones:** User-owned timezones with isPrimary flag
- **teams:** Shareable timezone collections with shareId
- **teamMembers:** Team membership with roles
- **teamTimezones:** Team-owned timezone data

Zod schemas (e.g., `insertUserSchema`, `insertTimezoneSchema`) are auto-generated from Drizzle schemas for validation.

## Deployment Notes

### Cloudflare Workers and Pages (Recommended - DEPLOYED ✅)
The application is **successfully deployed** to Cloudflare infrastructure:
- **Worker (API)**: https://globalsync.gautamkeshri.workers.dev
- **Pages (Frontend)**: https://globalsync-59k.pages.dev

**Architecture:**
- Worker handles all API routes (`/api/*`) and WebSocket connections (`/ws`)
- Pages serves static frontend and routes API calls to Worker via `_worker.js`
- Durable Objects provide WebSocket persistence and team-based broadcasting
- In-memory storage (MemStorage) - data resets on Worker restart

**Key Files:**
- `worker/index.ts` - Worker entry point with native Cloudflare APIs (no Express)
- `worker/storage.ts` - Worker-compatible storage implementation
- `worker/websocket-server.ts` - Durable Object for WebSocket handling
- `client/public/_worker.js` - Pages Function for API routing
- `wrangler.toml` - Cloudflare configuration
- `.github/workflows/deploy-cloudflare.yml` - CI/CD automation

**Deployment Guide**: See `CLOUDFLARE_DEPLOYMENT.md` for detailed instructions.

### Vercel Deployment (Alternative)
See `VERCEL_DEPLOYMENT.md` for deployment strategies:
- **Recommended:** Split deployment (frontend on Vercel, backend on Railway/Render)
- **Alternative:** Vercel Serverless Functions (requires restructuring server/routes.ts)

### Environment Variables
Optional Firebase configuration:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
```

Optional PostgreSQL:
```
DATABASE_URL=postgresql://...
```

Server configuration:
```
PORT=5000
NODE_ENV=development|production
```

## Common Gotchas

1. **TypeScript Paths:** When adding imports, use the defined aliases (@/, @shared/) rather than relative paths
2. **Drizzle Schema Changes:** After modifying `shared/schema.ts`, run `npm run db:push` (only if using PostgreSQL)
3. **Primary Timezone Logic:** Only one timezone per user can be primary; setting a new primary automatically unsets others (handled in storage layer)
4. **Guest Users:** Guest users get 4 default timezones on creation (New York, LA, London, Tokyo)
5. **WebSocket Disabled:** WebSocket functionality exists but is commented out in production to avoid conflicts
6. **Build Output:** Frontend builds to `dist/public/`, server to `dist/index.js` - both are required for production deployment
7. **CORS/Proxy:** In development, Vite proxies API requests to avoid CORS issues; in production, frontend and backend must be on same origin or CORS configured

## UI Component Library

The project uses shadcn/ui (Radix UI primitives with Tailwind styling). All UI components are in `client/src/components/ui/` and follow the shadcn/ui pattern of copy-paste installation rather than npm packages.

To add new shadcn/ui components, copy from https://ui.shadcn.com and place in `client/src/components/ui/`.
