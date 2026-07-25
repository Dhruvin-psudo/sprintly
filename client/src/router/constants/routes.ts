export const PUBLIC_ROUTES = {
    LOGIN: '/login',
    REGISTER: '/register',
    CREATE_ORGANIZATION: '/create-organization',
} as const;

export const PRIVATE_ROUTES = {
    HOME: '/',
    DASHBOARD: '/dashboard',
    WORKSPACES: '/workspaces',
    PROJECTS: '/projects',
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