# CLAUDE.md — Web (React Frontend)

## Stack

React 19 · Vite 8 · TypeScript 5 (strict) · Tailwind CSS 4 · shadcn/ui · TanStack Query 5 · Redux · React Hook Form 7 · Zod · React Router 7 · Socket.IO Client · Lucide Icons

---

## Architecture Rules

### Layer Separation

```
Pages → Features (components + hooks) → API layer → Backend
                    ↓
              Stores (Redux) ← for client-only state
              TanStack Query   ← for server state
```

**Hard rules:**

- **Pages**: Route-level components — compose features, handle layout. Minimal logic.
- **Features**: Self-contained domain modules — components, hooks, types. One feature = one domain.
- **API layer**: All HTTP calls live in `src/api/` — components never call `axios` directly.
- **Components**: Pure UI — receive props, render JSX, emit callbacks. No data fetching.
- **Hooks**: Business logic lives here — data fetching, mutations, derived state.
- **Stores**: Client-only state (auth, UI preferences, socket connection) — not server data.

---

## Folder Structure

```
src/
├── api/                          # API client & endpoint definitions
│   ├── client.ts                 # Axios instance + interceptors (auth, error handling)
│   ├── contacts.api.ts           # Contact endpoints
│   ├── campaigns.api.ts          # Campaign endpoints
│   └── types.ts                  # Shared API response types
├── components/
│   ├── ui/                       # shadcn/ui primitives (40+ components)
│   │   └── data-table/           # DataTable, Shell, BulkActions, Pagination, Toolbar, Filters
│   ├── layout/                   # AppLayout, AuthLayout, Sidebar, Header, Footer
│   │   ├── sidebar/              # app-sidebar, nav-main, nav-user, team-switcher
│   │   ├── header/               # header-client
│   │   └── footer/               # app-footer
│   └── shared/                   # SuspenseWrapper, RTLProvider, LanguageSwitcher
├── features/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── hooks/
│   │   │   └── useLogin.ts
│   │   └── types.ts
│   ├── campaigns/
│   │   ├── CampaignList.tsx
│   │   ├── CampaignCreate.tsx
│   │   ├── CampaignDetail.tsx
│   │   ├── hooks/
│   │   │   ├── useCampaigns.ts
│   │   │   ├── useCreateCampaign.ts
│   │   │   └── useCampaignStats.ts
│   │   └── types.ts
│   ├── contacts/
│   ├── inbox/
│   ├── segments/
│   ├── billing/
│   ├── channels/
│   ├── phone-numbers/
│   ├── join-links/
│   ├── polls/
│   ├── dashboard/
│   └── settings/
├── hooks/                        # Global hooks (useAuth, useSocket, useOrg, useDebounce)
├── stores/                       # Redux stores (auth.store, org.store, socket.store)
├── pages/                        # Route-level page components
├── lib/                          # Utilities (cn(), date formatting, currency, phone)
├── router/                       # React Router route definitions
├── App.tsx                       # Root component (providers, router)
├── main.tsx                      # Entry point
└── index.css                     # Tailwind directives + global styles
```

**Rules:**

- One feature folder per domain concept — co-locate components, hooks, types
- Features are independent — no cross-feature imports (extract to `shared/` if needed)
- `ui/` components are shadcn/ui only — don't put custom components here
- `shared/` components are reusable across features but not generic UI primitives
- Path alias: `@/*` maps to `src/*` — always use it instead of relative paths

---

## Component Patterns

### Presentational Components (Pure UI)

```tsx
interface ContactCardProps {
    name: string;
    phone: string;
    status: ContactStatus;
    onEdit: () => void;
    onDelete: () => void;
}

export function ContactCard({ name, phone, status, onEdit, onDelete }: ContactCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{name}</CardTitle>
                <StatusBadge status={status} />
            </CardHeader>
            <CardContent>
                <p>{phone}</p>
            </CardContent>
            <CardFooter>
                <Button variant="outline" onClick={onEdit}>
                    Edit
                </Button>
                <Button variant="destructive" onClick={onDelete}>
                    Delete
                </Button>
            </CardFooter>
        </Card>
    );
}
```

**Rules:**

- Explicit prop interfaces — always typed, always named
- Destructure props in the function signature
- Use function declarations (`function Component()`) not arrow functions for components
- No `React.FC` — use plain function declarations with typed props
- No data fetching, no side effects, no store access
- Accept callbacks via props — don't import actions or dispatch
- Use composition: pass children or render props instead of adding flags/modes

### Container Components (Feature-level)

```tsx
export function CampaignListPage() {
    const { data: campaigns, isLoading, error } = useCampaigns();
    const deleteMutation = useDeleteCampaign();
    const navigate = useNavigate();

    if (isLoading) return <PageSkeleton />;
    if (error) return <ErrorState message="Failed to load campaigns" />;
    if (!campaigns?.length) return <EmptyState title="No campaigns yet" />;

    return (
        <PageWrapper title="Campaigns">
            <CampaignTable
                campaigns={campaigns}
                onEdit={(id) => navigate(`/campaigns/${id}`)}
                onDelete={(id) => deleteMutation.mutate(id)}
            />
        </PageWrapper>
    );
}
```

**Rules:**

- Handle all three states: **loading**, **error**, **empty** — no exceptions
- Use hooks for data fetching and mutations
- Pass data down to presentational components as props
- Keep container components focused — one data concern per component

---

## API Layer

### Axios Client Setup

```ts
// src/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    headers: { 'Content-Type': 'application/json' },
});

// Auth interceptor — attach JWT token
apiClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Error interceptor — handle 401 globally
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    },
);
```

### API Endpoint Files

```ts
// src/api/campaigns.api.ts
import { apiClient } from './client';
import type { Campaign, CreateCampaignInput, PaginatedResponse } from './types';

export const campaignsApi = {
    list: (params?: { page?: number; limit?: number }) =>
        apiClient.get<PaginatedResponse<Campaign>>('/campaigns', { params }).then((r) => r.data),

    getById: (id: string) => apiClient.get<Campaign>(`/campaigns/${id}`).then((r) => r.data),

    create: (data: CreateCampaignInput) =>
        apiClient.post<{ id: string }>('/campaigns', data).then((r) => r.data),

    launch: (id: string) => apiClient.post<void>(`/campaigns/${id}/launch`).then((r) => r.data),

    delete: (id: string) => apiClient.delete<void>(`/campaigns/${id}`).then((r) => r.data),
};
```

**Rules:**

- One file per resource — `contacts.api.ts`, `campaigns.api.ts`, etc.
- Export an object with methods — not individual functions
- Each method returns the unwrapped data (`.then(r => r.data)`)
- Type all responses — never use `any` or untyped axios calls
- All URLs are relative to the base URL configured in client
- Never call `axios` or `apiClient` directly in components — always go through api files

---

## Data Fetching (TanStack Query)

### Query Hooks

```ts
// src/features/campaigns/hooks/useCampaigns.ts
import { useQuery } from '@tanstack/react-query';
import { campaignsApi } from '@/api/campaigns.api';

export function useCampaigns(params?: { page?: number; limit?: number }) {
    return useQuery({
        queryKey: ['campaigns', params],
        queryFn: () => campaignsApi.list(params),
    });
}

export function useCampaign(id: string) {
    return useQuery({
        queryKey: ['campaigns', id],
        queryFn: () => campaignsApi.getById(id),
        enabled: !!id,
    });
}
```

### Mutation Hooks

```ts
// src/features/campaigns/hooks/useCreateCampaign.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignsApi } from '@/api/campaigns.api';
import { toast } from 'sonner';

export function useCreateCampaign() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: campaignsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            toast.success('Campaign created successfully');
        },
        onError: () => {
            toast.error('Failed to create campaign');
        },
    });
}
```

**Rules:**

- One hook per query/mutation — co-located in the feature's `hooks/` folder
- Query keys follow convention: `[resource]` for lists, `[resource, id]` for details
- Include filter params in query keys so React Query caches them separately
- Use `enabled` option for conditional fetching (e.g., don't fetch until ID is available)
- Invalidate related queries on mutation success
- Show toast notifications on mutation success/failure
- Never manage loading/error state manually — use React Query's built-in state
- Global hooks (e.g., `useAuth`) go in `src/hooks/`

---

## State Management

### Server State → TanStack Query

All data from the API is managed by TanStack Query. Never duplicate server data in Redux.

### Client State → Redux

```ts
// src/stores/auth.store.ts
import { create } from 'redux';
import { persist } from 'redux/middleware';

interface AuthState {
    token: string | null;
    user: User | null;
    setAuth: (token: string, user: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            setAuth: (token, user) => set({ token, user }),
            logout: () => set({ token: null, user: null }),
        }),
        { name: 'auth-storage' },
    ),
);
```

**Rules:**

- One store file per concern: `auth.store.ts`, `org.store.ts`, `socket.store.ts`
- Keep stores minimal — only truly client-side state belongs here
- Use `persist` middleware for state that survives page refresh (auth tokens, preferences)
- Redux stores can be accessed outside React (e.g., in Axios interceptors via `.getState()`)
- Never put server-fetched data in Redux — that's TanStack Query's job
- Derive computed values with selectors, don't store derived state

---

## Form Handling (React Hook Form + Zod)

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const createCampaignSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255),
    body: z.string().min(1, 'Message body is required'),
    channel: z.enum(['sms', 'email', 'whatsapp']),
    segmentId: z.string().uuid().optional(),
    scheduledAt: z.string().datetime().optional(),
});

type CreateCampaignForm = z.infer<typeof createCampaignSchema>;

export function CampaignCreateForm() {
    const { mutate, isPending } = useCreateCampaign();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateCampaignForm>({
        resolver: zodResolver(createCampaignSchema),
    });

    const onSubmit = (data: CreateCampaignForm) => mutate(data);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div>
                <Label htmlFor="name">Campaign Name</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            {/* ... more fields */}
            <Button type="submit" disabled={isPending}>
                {isPending ? 'Creating...' : 'Create Campaign'}
            </Button>
        </form>
    );
}
```

**Rules:**

- Define Zod schemas for all forms — derive TypeScript types with `z.infer<>`
- Use `zodResolver` to connect Zod validation to React Hook Form
- Show field-level error messages from `formState.errors`
- Disable submit button while mutation is pending
- Show loading state on submit button
- Co-locate form schemas with their form components
- Reuse Zod schemas for both client validation and API input types where possible
- Never use uncontrolled inputs without React Hook Form's `register`

---

### Design Philosophy

- **Notion-inspired** — Calm, professional, flat, breathable
- **No box shadows** — Hierarchy through backgrounds, borders, spacing, and typography weight
- **Flat elevation** — Page → Surface → Raised → Inset (background layers, not shadows)
- **4px base unit** — Airy, spacious spacing rhythm
- **Inter font** — H1–H6 headings (48px–18px), Body (14–18px), Caption (12px)
- **Consistent form control sizing** — `sm` = 32px, `default` = 36px, `lg` = 40px across all inputs, selects, comboboxes, and buttons

## UI Components

### Component Catalog

| Category          | Components                                                                                                                                                        |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Form Controls** | `Button`, `Input`, `InputGroup`, `Checkbox`, `Switch`, `Select`, `NativeSelect`, `Combobox`, `Textarea`, `Slider`, `PhoneInput`, `InputOTP`, `Calendar`, `Toggle` |
| **Data Display**  | `Card`, `StatCard`, `Badge`, `Tag`, `Table`, `DataTable` (+ Shell, BulkActions, Pagination, Toolbar, Filters), `Avatar`, `Tooltip`, `HoverCard`                   |
| **Navigation**    | `Sidebar`, `Breadcrumb`, `NavigationMenu`, `Tabs`, `Pagination`, `Stepper` (Line, Circle, Dots)                                                                   |
| **Overlays**      | `Dialog`, `Sheet`, `Drawer`, `DropdownMenu`, `ContextMenu`, `Popover`                                                                                             |
| **Feedback**      | `Alert`, `Sonner` (toast), `Skeleton`, `Spinner`, `Empty`                                                                                                         |
| **Layout**        | `Accordion`, `Collapsible`, `ScrollArea`, `Separator`, `Timeline`, `Item`                                                                                         |
| **Utilities**     | `Label`, `Field`, `Direction` (RTL/LTR), `PhoneView`                                                                                                              |

### Component Patterns

All UI components follow these conventions:

- **`data-slot` attributes** — Every component renders `data-slot="component-name"` for CSS targeting and debugging
- **CVA (Class Variance Authority)** — Variant management for Button, Input, Tag, Stepper, Empty, etc.
- **Composition pattern** — Compound components: `Card` + `CardHeader` + `CardTitle` + `CardContent` + `CardFooter`
- **`cn()` utility** — Always use `cn()` from `@/lib/utils` to merge Tailwind classes conditionally
- **Size variants** — Consistent `sm` | `default` | `lg` across form controls (some add `xs`)
- **Icon integration** — Many components accept optional icon props (`startIcon`, `endIcon`) as ReactNode
- **Controlled/uncontrolled** — Complex components like DataTable support both modes
- **Dark mode** — All components have `dark:` variant classes

**Rules:**

- Use existing UI components — don't reinvent buttons, inputs, cards, etc.
- Customize via Tailwind classes and the variant system — don't override CSS
- Add new shadcn components via CLI: `npx shadcn@latest add [component]`
- Keep `ui/` folder for shadcn/ui and design system components only — feature-specific components go in `features/` or `shared/`
- Follow the composition pattern (e.g., `Card` + `CardHeader` + `CardContent`)

---

## Layout Components

### AppLayout

Main authenticated layout: `SidebarProvider` → `AppSidebar` + `SidebarInset` (Header + Outlet + Footer).

```
┌──────────────────────────────────────────┐
│ AppLayout                                │
│ ┌──────────┬───────────────────────────┐ │
│ │          │ HeaderClient              │ │
│ │ App      ├───────────────────────────┤ │
│ │ Sidebar  │ <Outlet /> (page content) │ │
│ │          ├───────────────────────────┤ │
│ │          │ AppFooter                 │ │
│ └──────────┴───────────────────────────┘ │
└──────────────────────────────────────────┘
```

**Sidebar structure:**

- `TeamSwitcher` — Organization/workspace selector
- `NavMain` — Primary nav items with icons and badge counts
- `NavSubscription` — Plan/billing info
- `NavUser` — User avatar, name, email, dropdown menu

### AuthLayout

Unauthenticated layout for login/register pages — centered content without sidebar.

### Tailwind CSS Rules

- Use Tailwind utility classes — no custom CSS unless absolutely necessary
- Use CSS variables for theme colors (configured in `index.css`)
- Responsive design with Tailwind breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Use `className` prop — never inline `style` objects
- Group related utilities: layout → spacing → typography → colors → effects
- Use `@apply` sparingly — only for truly repeated patterns in `index.css`

---

## Routing (React Router v7)

```tsx
// src/router/routes.tsx
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
    {
        path: '/login',
        element: <AuthLayout />,
        children: [
            { index: true, element: <LoginPage /> },
            { path: 'register', element: <RegisterPage /> },
        ],
    },
    {
        path: '/',
        element: <AppLayout />, // Sidebar + Header + Outlet
        children: [
            { index: true, element: <DashboardPage /> },
            { path: 'campaigns', element: <CampaignsPage /> },
            { path: 'campaigns/new', element: <CampaignCreatePage /> },
            { path: 'campaigns/:id', element: <CampaignDetailPage /> },
            { path: 'contacts', element: <ContactsPage /> },
            { path: 'inbox', element: <InboxPage /> },
            // ... more routes
        ],
    },
]);
```

**Rules:**

- All routes defined in `src/router/` — not scattered across components
- Use layout routes for shared UI (sidebar, header)
- Use `useParams()` for URL params, `useSearchParams()` for query params
- Use `useNavigate()` for programmatic navigation
- Protect authenticated routes with a guard component wrapping the layout
- Lazy-load heavy pages with `React.lazy()` for code splitting

---

## Custom Hook Patterns

```ts
// Global hook example — src/hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}
```

**Rules:**

- Hook names always start with `use`
- Global hooks in `src/hooks/` — feature hooks in `src/features/{feature}/hooks/`
- Hooks do one thing — `useDebounce`, `useAuth`, `useCampaigns` (not `useEverything`)
- Extract logic from components into hooks when: it's reusable, or the component is too long
- Custom hooks can compose other hooks (React Query, Redux, React Router)
- Always handle cleanup in `useEffect` (clear timers, cancel subscriptions, abort requests)
- Memoize expensive computations with `useMemo`, callbacks with `useCallback`
- Don't over-memoize — only when there's a measurable performance issue

---

## Loading, Error, Empty States

Every data-driven view must handle all three states:

```tsx
// Loading
if (isLoading) return <Skeleton className="h-64 w-full" />;

// Error
if (error) return <ErrorState message="Failed to load contacts" onRetry={refetch} />;

// Empty
if (!data?.length)
    return (
        <EmptyState
            title="No contacts"
            description="Import your first contacts to get started"
            action={<Button>Import CSV</Button>}
        />
    );

// Success
return <ContactTable contacts={data} />;
```

**Rules:**

- Use skeleton loaders for initial loads — not spinners
- Show meaningful error messages — not "Something went wrong"
- Provide retry actions on error states
- Empty states should guide users toward the next action
- Distinguish between "no data" and "no results for filter" — different messages
- Use optimistic updates for common mutations (toggle, delete) for instant feedback

---

## Accessibility

- All images have `alt` text
- All form inputs have associated `<Label>` elements
- Interactive elements are keyboard-navigable (shadcn/ui handles this)
- Use semantic HTML: `<main>`, `<nav>`, `<section>`, `<article>`, `<button>` (not `<div onClick>`)
- Color is not the only indicator — use icons or text alongside color-coded statuses
- Focus management: auto-focus first field in dialogs, return focus when dialog closes

---

## Testing Standards

### Vitest (Planned)

- Test custom hooks with `@testing-library/react-hooks`
- Test components with `@testing-library/react`
- Mock API calls with MSW (Mock Service Worker) — don't mock axios
- Test user interactions, not implementation details
- Query elements by role, label, or text — not by CSS class or test ID
- Each feature has a `__tests__/` folder or co-located `.test.tsx` files

---

## Performance

- Use `React.lazy()` + `Suspense` for route-level code splitting
- Virtualize long lists with `@tanstack/react-virtual`
- Debounce search inputs (300ms default)
- Use `useMemo` / `useCallback` only for measurably expensive operations
- Prefetch data on hover for likely navigation targets (`queryClient.prefetchQuery`)
- Images: use appropriate formats (WebP), lazy load below-the-fold images
- Bundle analysis: run `npx vite-bundle-visualizer` periodically to catch bloat

---

## Environment Variables

- All env vars prefixed with `VITE_` (Vite requirement for client-side access)
- Access via `import.meta.env.VITE_*` — never `process.env`
- Required vars: `VITE_API_URL` — validated at app startup
- Never commit secrets in frontend env vars — everything in the client bundle is public
