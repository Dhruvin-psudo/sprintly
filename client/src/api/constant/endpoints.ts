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
        BY_ID: (id: string) => `/project/${id}`,
    },
    USER: {
        ALL: '/user/all',
        ME: '/user',
    },
    ROLE: {
        ALL: '/role',
        MEMBER: (userId: string) => `/role/member/${userId}`,
    },
    INVITATION: {
        SEND: '/invitation/send',
        ALL: '/invitation',
        VERIFY: (token: string) => `/invitation/verify/${token}`,
        ACCEPT: '/invitation/accept',
        REVOKE: (id: string) => `/invitation/${id}`,
        RESEND: (id: string) => `/invitation/resend/${id}`,
        DECLINE: '/invitation/decline',
        MY_PENDING: '/invitation/my-pending',
    },
} as const