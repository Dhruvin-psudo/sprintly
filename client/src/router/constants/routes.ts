export const PUBLIC_ROUTES = {
    LOGIN: '/login',
    REGISTER: '/register',
    ACCEPT_INVITE: '/invite/accept',
    FEATURES: '/features',
    PRICING: '/pricing',
    ABOUT: '/about',
    CONTACT: '/contact'
} as const;


export const PRIVATE_ROUTES = {
    HOME: '/',
    DASHBOARD: '/dashboard',
    CREATE_ORGANIZATION: '/create-organization',
    WORKSPACES: '/workspaces',
    PROJECTS: '/projects',
    PROJECT_DETAIL: '/projects/:id',
    SPRINTS: '/sprints',
    TASKS: '/tasks',
    MEMBERS: '/members',
    REPORTS: '/reports',
    SETTINGS: '/settings',
} as const;

export const ROUTES = {
    ...PUBLIC_ROUTES,
    ...PRIVATE_ROUTES,
} as const;