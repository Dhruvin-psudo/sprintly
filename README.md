<div align="center">

# 🚀 Sprintly

### Modern Agile Project Management for High-Velocity Teams

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?logo=socket.io&logoColor=white)

**Plan sprints · Track tasks · Collaborate in real time**

[Live Demo](https://sprintly-agile.vercel.app) · [Client Docs](./client/README.md) · [Server Docs](./server/README.md)

</div>

---

## 📖 About

Sprintly is a full-stack agile project management platform that helps teams plan, track, and manage their work. Built with a modern tech stack and designed for real-time collaboration, it provides everything from Kanban boards and sprint management to role-based access control and multi-tenant workspaces.

---

## ✨ Features

| | Feature | Description |
|---|---|---|
| 🔐 | **Authentication** | JWT access + HTTP-only refresh tokens, single session policy, auto-refresh, instant revocation |
| 🏢 | **Multi-Tenant Orgs** | Create and switch organizations, org-scoped data isolation, seamless context switching |
| 🛡 | **RBAC Permissions** | Hierarchical roles (Owner > Admin > Member > Viewer), 22 granular permissions, custom roles |
| 📁 | **Projects** | Full CRUD with phase tracking, priority, team lead, member management, and settings |
| ✅ | **Kanban Board** | Drag-and-drop across 5 status columns, automatic past-due detection, completion locking |
| 📅 | **Calendar** | Interactive monthly calendar mapping tasks by due date across all projects |
| 📊 | **Dashboard** | KPI cards, productivity charts, project velocity, upcoming deadlines, team activity |
| 👥 | **Invitations** | Batch email invites, token verification, accept/decline for existing and new users |
| 🔔 | **Real-Time Sync** | Socket.IO WebSocket events for membership, invitation, and session changes |
| 🌗 | **Theming** | Dark and light mode with OKLCH-based design system |

---

## 🏗 Architecture

```
sprintly/
├── client/          → React 19 SPA (Vite + Tailwind CSS v4)
└── server/          → NestJS 11 REST API (Prisma + PostgreSQL)
```

| Layer | Stack |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS v4, ShadCN/UI, TanStack React Query v5, React Router v7, React Hook Form + Zod, Axios, Socket.IO Client, Recharts |
| **Backend** | NestJS 11, TypeScript, Prisma 6, PostgreSQL, Passport + JWT, bcrypt, Socket.IO + Redis, Nodemailer, Pino Logger, class-validator |
| **Database** | PostgreSQL with 12 models, 8 enums, soft deletes, audit trails, and row-level security |
| **Real-Time** | Socket.IO with optional Redis adapter for multi-instance scaling |

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 18
- [pnpm](https://pnpm.io/)
- [PostgreSQL](https://www.postgresql.org/) ≥ 14

### 1. Clone the repository

```bash
git clone https://github.com/your-username/sprintly.git
cd sprintly
```

### 2. Set up the Server

```bash
cd server
pnpm install
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT_SECRET, etc.

pnpm prisma:generate
pnpm prisma:migrate:dev
pnpm prisma:seed
pnpm start:dev
```

The API will be running at **http://localhost:3000/api**.

### 3. Set up the Client

```bash
cd client
pnpm install
cp .env.example .env
# Edit .env — set VITE_API_URL=http://localhost:3000

pnpm dev
```

The app will be running at **http://localhost:5173**.

---

## 🔑 Environment Variables

### Client (`client/.env`)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000` |

### Server (`server/.env`)

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | — |
| `JWT_SECRET` | JWT signing secret | — |
| `JWT_EXPIRATION` | Access token expiry | `15m` |
| `REFRESH_TOKEN_EXPIRATION_DAYS` | Refresh token expiry | `7` |
| `PORT` | Server port | `3000` |
| `PUBLIC_APP_URL` | CORS origins (comma-separated) | `http://localhost:5173` |
| `CLIENT_URL` | Frontend URL (for email links) | `http://localhost:5173` |
| `REDIS_URL` | Redis URL (optional) | — |
| `RESEND_API_KEY` | Resend email API key (optional) | — |

> See [server/.env.example](./server/.env.example) for the complete list.

---

## 📡 API Overview

The server exposes **50+ RESTful endpoints** across these domains:

| Domain | Endpoints | Description |
|---|---|---|
| **Auth** | 6 | Register, login, logout, refresh, session context, reconcile |
| **Organizations** | 4 | Get, list, create, switch |
| **Projects** | 7 | CRUD + member management |
| **Tasks** | 7 | CRUD + filtering + assigned-to-me + my-projects |
| **Roles** | 9 | CRUD + assign + member management |
| **Invitations** | 10 | Send, verify, accept, decline, resend, revoke |
| **Dashboard** | 2 | Productivity trends, project stats |
| **Users** | 4 | Profile, list members, password, delete |
| **Permissions** | 1 | List all permissions |
| **WebSocket** | 3 events | Real-time org/invitation/membership sync |

> See the [Server README](./server/README.md) for the complete API reference with routes, methods, and required permissions.

---

## 🗄 Database

PostgreSQL with **12 models** and **8 enums**, featuring:

- **Multi-tenancy** — Organization-scoped data with row-level security
- **Soft deletes** — `isDeleted`, `deletedAt`, `deletedBy` audit fields
- **RBAC** — Roles → RolePermissions → Permissions mapping
- **Token management** — Refresh token families with instant revocation

Core models: `Organization`, `User`, `OrganizationMember`, `Role`, `Permission`, `Project`, `ProjectMember`, `Task`, `Tag`, `Token`, `Invitation`

---

## 🚢 Deployment

| Component | Platform | Notes |
|---|---|---|
| **Client** | Vercel | SPA rewrites configured in `vercel.json` |
| **Server** | Any Node.js host | Docker, Railway, Render, AWS, etc. |
| **Database** | Any PostgreSQL provider | Supabase, Neon, AWS RDS, etc. |
| **Redis** | Optional | Required for multi-instance WebSocket sync |

**Live demo**: [https://sprintly-agile.vercel.app](https://sprintly-agile.vercel.app)

---

## 📚 Documentation

| Document | Description |
|---|---|
| [Client README](./client/README.md) | Frontend architecture, routes, features, components |
| [Server README](./server/README.md) | API reference, database schema, security, modules |
| [server/.env.example](./server/.env.example) | Complete server environment template |
| [client/.env.example](./client/.env.example) | Client environment template |