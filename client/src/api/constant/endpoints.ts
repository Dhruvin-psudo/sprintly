export const API_ENDPOINTS = {
    AUTH: {
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
    },
    ORGANIZATION: {
        CREATE: '/organization',
        CURRENT: '/organization',
        UPDATE: '/organization',
        ALL: '/organization/all',
        SWITCH: '/organization/switch',
    },
    PROJECT: {
        CREATE: '/project',
        ALL: '/project',
        BY_ID : (id: string) => `project/${id}`
    },
    USER: {
        ALL: '/user/all',
    },
} as const