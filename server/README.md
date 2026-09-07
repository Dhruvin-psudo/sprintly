# Sprintly — Server

> RESTful API backend for Sprintly — a multi-tenant agile project management platform with real-time collaboration.

![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtokens&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?logo=socket.io&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-30-C21325?logo=jest&logoColor=white)

---

## ✨ Features

- 🔐 **JWT Authentication** — Access + HTTP-only refresh token rotation, single active session policy, instant revocation
- 🏢 **Multi-Tenant Organizations** — Create, switch, and manage organizations with slug-based isolation
- 🛡 **RBAC Permissions** — Hierarchical role system (Owner > Admin > Member > Viewer) with 22 granular permissions and custom roles
- 📁 **Project Management** — Full CRUD with phase tracking, priority levels, team lead assignment, and member management
- ✅ **Task Management** — CRUD with status lifecycle, priority, assignee validation, due-date enforcement, and completion locking
- 📊 **Dashboard Analytics** — Productivity trends, project velocity, upcoming deadlines, and completion breakdowns
- 👥 **Invitation System** — Batch email invitations, token verification, accept/decline flows for existing and new users
- 🔔 **Real-Time WebSocket** — Socket.IO gateway with Redis adapter for multi-instance deployments
- 📧 **Email Transport** — Resend, SendGrid, custom SMTP, and Gmail support with branded HTML templates
- 🔒 **Row-Level Security** — PostgreSQL tenant context isolation via `set_config()`
- ✅ **Validation** — class-validator DTOs with global validation pipe, whitelisting, and transformation
- 📝 **Structured Logging** — Pino logger with request context tracking and auth header redaction

---

## 🛠 Tech Stack

| Category | Technology |
|---|---|
| **Framework** | NestJS 11 |
| **Language** | TypeScript 5.7 |
| **Database** | PostgreSQL |
| **ORM** | Prisma 6 |
| **Auth** | Passport + JWT + bcrypt |
| **Real-Time** | Socket.IO + Redis adapter |
| **Email** | Nodemailer (Resend / SendGrid / SMTP) |
| **Validation** | class-validator + class-transformer |
| **Logging** | Pino (nestjs-pino) |
| **Testing** | Jest 30 + Supertest |
| **Linting** | ESLint 9 + Prettier |

---

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) ≥ 18
- [pnpm](https://pnpm.io/) (recommended)
- [PostgreSQL](https://www.postgresql.org/) ≥ 14
- [Redis](https://redis.io/) (optional — required for multi-instance real-time sync)

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
cd server
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values (see [Environment Variables](#-environment-variables) below).

### 3. Set up the database

```bash
# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate:dev

# Seed with system roles & permissions
pnpm prisma:seed
```

### 4. Start the server

```bash
# Development (watch mode)
pnpm start:dev

# Production
pnpm build
pnpm start:prod
```

The API will be available at **http://localhost:3000/api**.

---

## 📂 Project Structure

```
src/
├── main.ts                           # Bootstrap, CORS, validation pipe, Pino logger
├── app.module.ts                     # Root module with global guards
├── app.controller.ts                 # Health check endpoint
│
├── common/                           # Shared infrastructure
│   ├── constants/
│   │   ├── permissions.ts            # RBAC permission catalog & role hierarchy
│   │   ├── prisma-error.ts           # Prisma error codes
│   │   └── query.ts                  # Query constants
│   ├── decorators/
│   │   ├── public.decorator.ts       # @Public() — skip auth
│   │   ├── allow-without-org.decorator.ts  # @AllowWithoutOrg()
│   │   ├── current-user.decorator.ts # @CurrentUser() param decorator
│   │   └── permissions.decorator.ts  # @RequirePermissions()
│   ├── dto/
│   │   ├── api-response.dto.ts       # Standardized { success, data, message, meta }
│   │   ├── paginated-result.dto.ts   # Pagination wrapper
│   │   └── pagination-query.dto.ts   # page, limit, search, sort params
│   ├── errors/
│   │   ├── error-codes.ts            # Numeric error code enum (10xxx–15xxx)
│   │   ├── domain-exceptions.ts      # Typed domain exceptions
│   │   └── error-code-registry.ts    # Error code → HTTP status mapping
│   ├── guards/
│   │   ├── membership-context.guard.ts   # Validates JWT org/role in DB
│   │   ├── organization-required.guard.ts # Requires active org context
│   │   └── permissions.guard.ts          # RBAC permission check
│   └── interceptors/
│       └── rls.interceptor.ts        # Sets PostgreSQL tenant context
│
├── modules/
│   ├── auth/                         # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategy/jwt.strategy.ts  # Passport JWT strategy
│   │   ├── guard/auth.guard.ts       # Global JWT guard
│   │   └── dto/                      # register, login, change-password
│   │
│   ├── organization/                 # Organization management
│   │   ├── organization.controller.ts
│   │   ├── organization.service.ts
│   │   ├── organization.repository.ts
│   │   └── dto/                      # create, switch
│   │
│   ├── project/                      # Project management
│   │   ├── project.controller.ts
│   │   ├── project.service.ts
│   │   ├── project.repository.ts
│   │   └── dto/                      # create, update, query, assign-member
│   │
│   ├── task/                         # Task management
│   │   ├── task.controller.ts        # /tasks endpoints
│   │   ├── project-task.controller.ts # /projects/:id/task endpoints
│   │   ├── task.service.ts
│   │   ├── task.repository.ts
│   │   └── dto/                      # create, update, query
│   │
│   ├── role/                         # Role & member management
│   │   ├── role.controller.ts
│   │   ├── role.service.ts
│   │   ├── role.repository.ts
│   │   └── dto/                      # create, update, assign, remove-member
│   │
│   ├── permission/                   # Permission catalog
│   │   ├── permission.controller.ts
│   │   ├── permission.service.ts
│   │   └── permission.repository.ts
│   │
│   ├── invitation/                   # Email invitation system
│   │   ├── invitation.controller.ts
│   │   ├── invitation.service.ts
│   │   ├── invitation.repository.ts
│   │   └── dto/                      # send, accept, query
│   │
│   ├── dashboard/                    # Analytics & metrics
│   │   ├── dashboard.controller.ts
│   │   ├── dashboard.service.ts
│   │   ├── dashboard.repository.ts
│   │   └── dto/                      # productivity-query
│   │
│   ├── user/                         # User profile management
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── user.repository.ts
│   │   └── dto/                      # create, query, response
│   │
│   ├── token/                        # Token lifecycle management
│   │   ├── token.service.ts
│   │   └── token.repository.ts
│   │
│   ├── realtime/                     # WebSocket gateway
│   │   ├── realtime.gateway.ts       # Socket.IO /realtime namespace
│   │   └── realtime.service.ts       # Room management & event emission
│   │
│   └── mail/                         # Email transport
│       ├── mail.service.ts           # Resend / SendGrid / SMTP / Gmail
│       └── mail.module.ts
│
└── prisma/                           # Database module
    ├── prisma.module.ts              # Global Prisma module
    └── prisma.service.ts             # PrismaClient + RLS tenant context

prisma/
├── schema.prisma                     # Database schema (12 models, 8 enums)
├── seed.ts                           # Permission & role seeder
└── seed/
    ├── permission.seeder.ts          # Seeds 22 system permissions
    └── role.seeder.ts                # Seeds 4 system roles with mappings
```

---

## 🗄 Database Schema

### Enums

| Enum | Values |
|---|---|
| `OrgPlan` | FREE, STARTER, PRO, ENTERPRISE |
| `UserStatus` | ACTIVE, INACTIVE, SUSPENDED |
| `TokenType` | REFRESH, RESET_PASSWORD |
| `ProjectPhase` | PLANNING, ACTIVE, ON_HOLD, COMPLETED, CANCELLED |
| `ProjectPriority` | LOW, MEDIUM, HIGH, URGENT |
| `TaskStatus` | TODO, IN_PROGRESS, REVIEW, COMPLETED, DUE |
| `TaskPriority` | LOW, MEDIUM, HIGH, URGENT |
| `InvitationStatus` | PENDING, ACCEPTED, DECLINED, EXPIRED, REVOKED |

### Models

| Model | Key Fields | Relations |
|---|---|---|
| **Organization** | name, slug, email, plan, settings | roles, tags, members, projects, tasks, invitations |
| **User** | firstName, lastName, email, passwordHash, status | memberships, tokens, projects, tasks, invitations |
| **OrganizationMember** | userId, organizationId, roleId | user, organization, role |
| **Role** | name, description, isSystem, hierarchy | members, rolePermissions |
| **Permission** | name, resource, action | rolePermissions |
| **RolePermission** | roleId, permissionId | role, permission |
| **Token** | userId, type, token, familyId, metadata, expiresAt | user |
| **Project** | name, code, description, phase, priority, leadId | organization, members, tasks |
| **ProjectMember** | projectId, userId | project, user |
| **Task** | title, description, status, priority, dueDate, assigneeId | organization, project, assignee |
| **Tag** | name, color, organizationId | organization |
| **Invitation** | email, roleId, token, status, expiresAt | organization, role, invitedBy |

All models support soft deletion with `isDeleted`, `deletedAt`, `deletedBy` audit fields.

---

## 📡 API Reference

All endpoints are prefixed with `/api`. Authentication uses `Authorization: Bearer <token>` unless marked Public.

### Auth

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | Login, set refresh cookie | Public |
| POST | `/auth/logout` | Revoke session, clear cookie | Yes |
| POST | `/auth/refresh` | Refresh access token from cookie | Public |
| GET | `/auth/session/context` | Get session context & orgs | AllowWithoutOrg |
| POST | `/auth/session/reconcile` | Re-sync session after changes | AllowWithoutOrg |

### Organizations

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/organization` | Get active organization | Yes |
| GET | `/organization/all` | List user's organizations | AllowWithoutOrg |
| POST | `/organization` | Create organization | AllowWithoutOrg |
| POST | `/organization/switch` | Switch active organization | AllowWithoutOrg |

### Projects

| Method | Endpoint | Description | Permission |
|---|---|---|---|
| POST | `/project` | Create project | `project:create` |
| GET | `/project` | List projects (paginated) | `project:read` |
| GET | `/project/:id` | Get project details | `project:read` |
| PATCH | `/project/:id` | Update project | `project:update` |
| DELETE | `/project/:id` | Soft-delete project | `project:delete` |
| POST | `/project/:id/members` | Add members | `project:update` |
| DELETE | `/project/:id/members/:userId` | Remove member | `project:update` |

### Tasks

| Method | Endpoint | Description | Permission |
|---|---|---|---|
| GET | `/task/assigned-me` | Tasks assigned to me | `task:read` |
| GET | `/task/my-projects` | Tasks from my projects | `task:read` |
| POST | `/project/:projectId/task` | Create task | `task:create` |
| GET | `/project/:projectId/task` | List project tasks | `task:read` |
| GET | `/project/:projectId/task/:id` | Get task | `task:read` |
| PATCH | `/project/:projectId/task/:id` | Update task | `task:update` |
| DELETE | `/project/:projectId/task/:id` | Soft-delete task | `task:delete` |

Task list query params: `status`, `priority`, `assigneeId`, `search`, `page`, `limit`

### Roles & Members

| Method | Endpoint | Description | Permission |
|---|---|---|---|
| POST | `/role` | Create custom role | `role:create` |
| GET | `/role` | List roles | `role:read` |
| GET | `/role/permissions/me` | My permissions | Yes |
| GET | `/role/:id` | Get role details | `role:read` |
| GET | `/role/:id/members` | Role members | `member:read`, `role:read` |
| PATCH | `/role/assign` | Assign role to member | `member:update`, `role:update` |
| PATCH | `/role/:id` | Update custom role | `role:update` |
| DELETE | `/role/member` | Remove org member | `member:remove` |
| DELETE | `/role/:id` | Soft-delete role | `role:delete` |

### Invitations

| Method | Endpoint | Description | Permission |
|---|---|---|---|
| POST | `/invitation/send` | Send email invitations | `member:invite` |
| GET | `/invitation` | List org invitations | `member:read` |
| GET | `/invitation/verify/:token` | Verify invite token | AllowWithoutOrg |
| POST | `/invitation/accept` | Accept by token | AllowWithoutOrg |
| POST | `/invitation/decline` | Decline by token | AllowWithoutOrg |
| GET | `/invitation/my-pending` | My pending invitations | AllowWithoutOrg |
| POST | `/invitation/accept/:id` | Accept by ID | AllowWithoutOrg |
| POST | `/invitation/decline/:id` | Decline by ID | AllowWithoutOrg |
| POST | `/invitation/resend/:id` | Resend invitation | `member:invite` |
| DELETE | `/invitation/:id` | Revoke invitation | `member:remove` |

### Dashboard

| Method | Endpoint | Description | Permission |
|---|---|---|---|
| GET | `/dashboard/productivity` | Daily created vs completed | `task:read` |
| GET | `/dashboard/stats` | Project stats & deadlines | `project:read` |

### Users & Permissions

| Method | Endpoint | Description | Permission |
|---|---|---|---|
| GET | `/user` | Current user profile | Yes |
| GET | `/user/all` | Org members (paginated) | `member:read` |
| PATCH | `/user/password` | Change password | Yes |
| DELETE | `/user` | Soft-delete account | Yes |
| GET | `/permission` | List all permissions | Yes |

### WebSocket

| Namespace | Event | Description |
|---|---|---|
| `/realtime` | `organization.changed` | Members or invitations updated |
| `/realtime` | `invitations.changed` | User's pending invites updated |
| `/realtime` | `membership.changed` | User removed or role changed |

---

## 🔑 Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | — |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `LOG_LEVEL` | Pino log level | `debug` |
| `TRUST_PROXY` | Express trust proxy | `1` |
| `REQUEST_BODY_LIMIT` | Max request body size | `100kb` |
| `PUBLIC_APP_URL` | CORS origins (comma-separated) | `http://localhost:5173` |
| `CLIENT_URL` | Frontend URL for email links | `http://localhost:5173` |
| `JWT_SECRET` | JWT signing secret | — |
| `JWT_EXPIRATION` | Access token expiry | `15m` |
| `REFRESH_TOKEN_EXPIRATION_DAYS` | Refresh token expiry in days | `7` |
| `BCRYPT_SALT_ROUNDS` | bcrypt cost factor | `12` |
| `REDIS_URL` | Redis URL (optional, for multi-instance) | — |
| `RESEND_API_KEY` | Resend email API key | — |
| `RESEND_FROM_EMAIL` | Resend sender address | — |
| `SMTP_HOST` | Custom SMTP host | — |
| `SMTP_PORT` | Custom SMTP port | — |
| `SMTP_USER` | SMTP username | — |
| `SMTP_PASS` | SMTP password | — |
| `SMTP_FROM` | SMTP sender address | — |

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `pnpm start:dev` | Start in watch mode |
| `pnpm start:debug` | Start in debug + watch mode |
| `pnpm start:prod` | Run production build |
| `pnpm build` | Build the project |
| `pnpm lint` | Lint and auto-fix |
| `pnpm format` | Format with Prettier |
| `pnpm test` | Run unit tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:cov` | Run tests with coverage |
| `pnpm test:e2e` | Run end-to-end tests |
| `pnpm prisma:generate` | Generate Prisma client |
| `pnpm prisma:migrate:dev` | Run migrations (dev) |
| `pnpm prisma:migrate:deploy` | Run migrations (production) |
| `pnpm prisma:studio` | Open Prisma Studio GUI |
| `pnpm prisma:seed` | Seed permissions & roles |
| `pnpm prisma:reset` | Reset database & re-seed |

---

## 🛡 Security Architecture

### Global Guard Pipeline

Every request passes through these guards in order:

1. **AuthGuard** — Validates JWT Bearer token (skipped with `@Public()`)
2. **MembershipContextGuard** — Verifies the user's org membership matches JWT claims (skipped with `@AllowWithoutOrg()`)
3. **OrganizationRequiredGuard** — Ensures an active organization context exists (skipped with `@AllowWithoutOrg()`)
4. **PermissionsGuard** — Checks RBAC permissions declared with `@RequirePermissions()` against the user's role

### Permission Catalog

Permissions are organized by resource:

| Resource | Actions |
|---|---|
| Organization | `read`, `update`, `delete` |
| Member | `read`, `invite`, `update`, `remove` |
| Role | `read`, `create`, `update`, `delete` |
| Project | `read`, `create`, `update`, `delete` |
| Task | `read`, `create`, `update`, `delete` |
| Tag | `read`, `create`, `update`, `delete` |
| Billing | `manage` |
| API Key | `manage` |

---

## 🔄 Real-Time Architecture

The server runs a Socket.IO gateway on the `/realtime` namespace:

- **Rooms**: `user:{userId}` and `organization:{organizationId}`
- **Redis Adapter**: When `REDIS_URL` is set, Socket.IO events are shared across multiple API instances
- **Fallback**: Without Redis, events are scoped to the single process
