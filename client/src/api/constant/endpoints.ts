export const API_ENDPOINTS = {
    AUTH: {
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
    },
    ORGANIZATION: {
        CREATE: '/organization',
    },
    PROJECT: {
        CREATE: '/project',
        ALL: '/projects',
        BY_ID : (id: string) => `project/${id}`
    },
    USER: {
        ALL: '/user/all',
    },
} as const