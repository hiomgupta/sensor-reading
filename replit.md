# SensorLab - Web Bluetooth Sensor Monitoring

## Overview

SensorLab is a browser-based Web Bluetooth sensor monitoring web application designed for academic lab use. It connects directly to BLE-enabled ESP32 sensors, streams real-time data, visualizes it live with Chart.js, and allows one-click CSV export. The app prioritizes simplicity and zero-install usage — it runs entirely in Chrome/Edge browsers.

The app includes a **Demo Mode** that activates automatically when Web Bluetooth is unavailable (e.g., in Replit preview environments), simulating BLE device connections and data streams so the full application flow can be demonstrated without real hardware.

Key screens: Landing Page (connect sensor), Dashboard (live chart, current value display, CSV export).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (React + Vite)
- **Location**: `client/src/`
- **Framework**: React with TypeScript, bundled by Vite
- **Routing**: `wouter` (lightweight client-side router)
- **Styling**: Tailwind CSS with CSS variables for theming, shadcn/ui component library (new-york style)
- **Charts**: Chart.js via `react-chartjs-2` for real-time sensor data visualization
- **Animations**: Framer Motion for UI transitions
- **State Management**: React Context for Bluetooth state (`BluetoothContext` in App.tsx), React Query for any server data
- **Path aliases**: `@/` → `client/src/`, `@shared/` → `shared/`, `@assets/` → `attached_assets/`

### BLE / Bluetooth Layer
- **Location**: `client/src/hooks/use-bluetooth.ts`
- **Pattern**: Singleton global state with listener pattern (not React state alone) — ensures BLE connection persists across route changes
- **Real mode**: Uses Web Bluetooth API (`navigator.bluetooth`) with Nordic UART Service UUIDs
- **Demo mode**: Automatically activates when Web Bluetooth is blocked; simulates device connection and generates fake sensor data
- **Data storage**: Client-side memory only (array of `DataPoint` objects); CSV export generates files on-the-fly

### Backend (Express + Node.js)
- **Location**: `server/`
- **Framework**: Express.js with TypeScript, run via `tsx`
- **Purpose**: Minimal — primarily serves the frontend. The app is fundamentally client-side focused.
- **API**: Single health check endpoint (`GET /api/health`)
- **Route definitions**: Shared between client and server in `shared/routes.ts` using Zod schemas
- **Dev server**: Vite dev middleware integrated into Express (`server/vite.ts`)
- **Production**: Static file serving from `dist/public` (`server/static.ts`)
- **Build**: Custom build script (`script/build.ts`) using esbuild for server + Vite for client

### Database
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: `shared/schema.ts` — minimal `sensor_sessions` table (id, deviceName, startTime, endTime, dataPoints as JSONB)
- **Connection**: `server/db.ts` using `pg.Pool` with `DATABASE_URL` environment variable
- **Migration**: `drizzle-kit push` via `npm run db:push`
- **Note**: The database exists for structural completeness but the core app functionality uses client-side memory. The database is not critical to the main user flow.

### Key Design Decisions
1. **Client-side data storage over server storage**: The app targets short academic experiment sessions; data lives in browser memory and is exported as CSV. The database schema exists but is secondary.
2. **Singleton BLE state**: Bluetooth connection state uses a module-level singleton pattern rather than component state, preventing connection drops during React re-renders or route changes.
3. **Automatic demo mode**: Environment detection handles restricted contexts gracefully — no crashes, clear user messaging about limitations.
4. **No authentication**: By design — this is a simple academic tool with no user accounts.

### Scripts
- `npm run dev` — Start development server with HMR
- `npm run build` — Build client (Vite) and server (esbuild) to `dist/`
- `npm run start` — Run production build
- `npm run db:push` — Push Drizzle schema to PostgreSQL
- `npm run check` — TypeScript type checking

## External Dependencies

### Database
- **PostgreSQL** via `DATABASE_URL` environment variable
- **Drizzle ORM** for schema definition and queries
- **connect-pg-simple** for session storage (available but not actively used since there's no auth)

### Browser APIs
- **Web Bluetooth API** — Core feature; requires Chrome, Edge, or Opera. Falls back to demo mode when unavailable.

### UI Libraries
- **shadcn/ui** — Full component library (Radix UI primitives + Tailwind styling)
- **Chart.js / react-chartjs-2** — Real-time line charts for sensor data
- **Framer Motion** — Page and element animations
- **Lucide React** — Icon system

### Fonts
- **Inter** — Primary UI font
- **JetBrains Mono** — Monospace font for data values

### Build Tools
- **Vite** — Frontend bundler with React plugin
- **esbuild** — Server bundler (via build script)
- **tsx** — TypeScript execution for dev server
- **Replit plugins** — `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner` (dev only)