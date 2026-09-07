# Sprintly — Client

> Modern React frontend for Sprintly — an agile project management platform built for high-velocity teams.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)
![React Query](https://img.shields.io/badge/React_Query-5-FF4154?logo=reactquery&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?logo=socket.io&logoColor=white)

---

## ✨ Features

- 🔐 **Authentication** — Login, registration with password strength meter, JWT access + HTTP-only refresh token management, auto-refresh on 401
- 🏢 **Multi-Tenant Organizations** — Create, switch, and manage organizations with seamless cache purging on context change
- 📊 **Executive Dashboard** — KPI stat cards, Recharts productivity area chart, project velocity, upcoming deadlines, active projects, and team activity feed
- 📁 **Project Management** — Full CRUD with phase/priority filters, team lead assignment, multi-member selection, tabbed detail view (Overview, Tasks, Calendar, Members, Activity, Settings)
- ✅ **Kanban Board** — Native HTML5 drag-and-drop across 5 columns (Todo, In Progress, Review, Due, Completed) with automatic past-due detection, extend-due-date modal, and irreversible completion lock
- 📅 **Calendar View** — Interactive monthly calendar mapping tasks by due date across all projects with day-click filtering and deadlines panel
- 👥 **Team & Invitations** — Searchable member tables, role hierarchy enforcement (Owner > Admin > Member > Viewer), bulk email invitations, resend/revoke, accept/decline flows
- 🔔 **Real-Time Sync** — Socket.IO WebSocket connection for live membership/invitation events with automatic fallback polling
- 🏠 **Marketing Landing Page** — Hero, features, pricing tiers, testimonials, about, and contact pages
- ⚙️ **User Settings** — Profile editing, password change, organization management
- 🌗 **Theming** — Dark/light mode with OKLCH color system and animated gradient orbs

---

## 🛠 Tech Stack

| Category | Technology |
|---|---|
| **Framework** | React 19 |
| **Language** | TypeScript 6 |
| **Build Tool** | Vite 8 |
| **Styling** | Tailwind CSS v4 |
| **UI Components** | ShadCN/UI (base-nova) + Base UI React |
| **Server State** | TanStack React Query v5 |
| **Routing** | React Router v7 |
| **Forms** | React Hook Form 7 + Zod 4 |
| **HTTP Client** | Axios (with token refresh queue) |
| **Real-Time** | Socket.IO Client v4 |
| **Charts** | Recharts v3 |
| **Icons** | Lucide React |
| **Toasts** | Sonner |
| **Date Utilities** | date-fns v4 + react-day-picker |

---

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) ≥ 18
- [pnpm](https://pnpm.io/) (recommended)
- Running [Sprintly server](../server/) instance

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
cd client
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:3000
```

> The API URL is used for both REST calls (`/api/*`) and WebSocket connections (`/realtime` namespace).

### 3. Start the dev server

```bash
pnpm dev
```

The app will be available at **http://localhost:5173**.

---

## 📂 Project Structure

```
src/
├── main.tsx                          # React 19 entry point
├── App.tsx                           # QueryClient, RouterProvider, Toaster
├── index.css                         # Tailwind v4 theme (OKLCH custom properties)
│
├── api/                              # API client layer
│   ├── client.ts                     # Axios instance with JWT + 401 refresh queue
│   ├── public-client.ts              # Unauthenticated Axios instance
│   ├── token.ts                      # Token storage + auth:token-changed events
│   ├── types.ts                      # API response types
│   ├── constant/endpoints.ts         # Route constants
│   └── services/                     # Domain-specific API functions
│       ├── auth.api.ts
│       ├── dashboard.api.ts
│       ├── invitation.api.ts
│       ├── organization.api.ts
│       ├── project.api.ts
│       ├── role.api.ts
│       ├── task.api.ts
│       └── user.api.ts
│
├── router/                           # Routing
│   ├── routes.tsx                    # Full route tree with lazy loading
│   ├── constants/routes.ts           # Route path constants
│   └── guards/
│       ├── protected-route.tsx       # Auth guard → /login
│       └── public-route.tsx          # Logged-in redirect → /dashboard
│
├── pages/                            # Page-level components
│   ├── auth/                         # Login, Register, Accept Invite
│   ├── dashboard/                    # Dashboard
│   ├── project/                      # Project list + detail
│   ├── task/                         # Kanban task board
│   ├── calendar/                     # Calendar view
│   ├── members/                      # Team members
│   ├── settings/                     # User settings
│   ├── organization/                 # Create organization
│   ├── landing-page/                 # Marketing pages
│   └── not-found/                    # 404
│
├── features/                         # Feature modules (components + hooks + utils)
│   ├── auth/                         # Login/register forms, session sync
│   ├── dashboard/                    # Stats, charts, deadlines, activity
│   ├── project/                      # Project cards, detail tabs, member mgmt
│   ├── task/                         # Kanban board, task dialogs, drag-and-drop
│   ├── calendar/                     # Calendar grid, deadlines panel
│   ├── organization/                 # Org creation, switching, session dialog
│   ├── invitation/                   # Invite flows, accept/decline modals
│   ├── user/                         # Member tables, role management
│   ├── settings/                     # Profile, password, org section
│   ├── landing-page/                 # Hero, features, pricing, testimonials
│   └── not-found/                    # 404 view
│
├── components/
│   ├── layout/
│   │   ├── app-layout.tsx            # Sidebar + header + content shell
│   │   ├── auth-layout.tsx           # Split-screen auth layout
│   │   ├── landing-layout.tsx        # Marketing site layout
│   │   ├── header/                   # App header, workspace switcher, notifications
│   │   ├── sidebar/                  # Navigation sidebar
│   │   ├── footer/                   # App + landing footers
│   │   └── navbar/                   # Landing page navbar
│   ├── shared/
│   │   ├── brand-logo.tsx            # SVG logo with gradient
│   │   └── theme-toggle.tsx          # Dark/light mode toggle
│   └── ui/                           # 18 ShadCN/UI primitives
│
├── store/                            # React Context providers
│   └── pending-invitations-modal-context.tsx
│
├── lib/
│   ├── utils.ts                      # cn() — clsx + tailwind-merge
│   └── mock-data.ts                  # Development mock data
│
└── utils/
    ├── role-style.ts                 # Role badge styling
    └── string.ts                     # String utilities
```

---

## 🗺 Routes

| Path | Page | Access |
|---|---|---|
| `/` | Landing Page | Public |
| `/features` | Features | Public |
| `/pricing` | Pricing | Public |
| `/about` | About | Public |
| `/contact` | Contact | Public |
| `/login` | Login | Public (redirects if auth) |
| `/register` | Register | Public (redirects if auth) |
| `/invite/accept` | Accept Invitation | Public |
| `/dashboard` | Dashboard | Protected |
| `/projects` | Projects | Protected |
| `/projects/:id` | Project Detail | Protected |
| `/tasks` | Kanban Board | Protected |
| `/calendar` | Calendar | Protected |
| `/members` | Team Members | Protected |
| `/settings` | Settings | Protected |
| `/create-organization` | Create Organization | Protected |
| `*` | Not Found | — |

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start Vite dev server with HMR |
| `pnpm build` | Type-check and build for production |
| `pnpm start` | Serve production build on `$PORT` |
| `pnpm lint` | Run ESLint |
| `pnpm preview` | Preview production build locally |

---

## 🔑 Environment Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000` |

---

## 🔌 Real-Time Architecture

The client maintains a persistent Socket.IO connection to the server's `/realtime` namespace. It listens for:

- **`organization.changed`** — Refreshes member and invitation data in active workspace
- **`invitations.changed`** — Refetches pending invitations for the user
- **`membership.changed`** — Handles removal or role change; triggers session reconciliation if the active org is affected

A 4-second fallback polling interval ensures synchronization when WebSocket connectivity is interrupted.

---

## 🚢 Deployment

Configured for **Vercel** with SPA rewrites in `vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Build and output:

```bash
pnpm build        # Output → dist/
```

---

## 🔧 Path Aliases

The `@` alias resolves to `./src`:

```ts
import { Button } from "@/components/ui/button";
```
