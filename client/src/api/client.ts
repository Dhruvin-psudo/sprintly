import axios from 'axios';
import { clearAccessToken, getAccessToken, setAccessToken } from './token';
import type { IAccessTokenResponse, IApiResponse } from './types';

declare module 'axios' {
    export interface InternalAxiosRequestConfig {
        _retry?: boolean;
    }
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/reset-password', '/'];

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
});

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: unknown) => Promise.reject(error)
);


// Response interceptor
interface IQueueItem {
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: IQueueItem[] = [];

function processQueue(error: unknown, token: string | null): void {
    for (const item of failedQueue) {
        if (token) {
            item.resolve(token);
        } else {
            item.reject(error);
        }
    }
    failedQueue = [];
}

function isPublicPath(pathname: string): boolean {
    return PUBLIC_PATHS.some((path) => {
        if (path === '/') return pathname === '/';
        return pathname.startsWith(path);
    });
}

apiClient.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
        if (!axios.isAxiosError(error) || !error.config) {
            return Promise.reject(error);
        }

        const originalRequest = error.config;
        const status = error.response?.status;

        // Don't attempt refresh for non-401, already-retried, or auth endpoints
        const isAuthEndpoint = originalRequest.url?.startsWith('/auth/');
        if (status !== 401 || originalRequest._retry || isAuthEndpoint) {
            return Promise.reject(error);
        }

        // Queue this request if a refresh is already in progress
        if (isRefreshing) {
            return new Promise<string>((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return apiClient(originalRequest);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const { data } = await axios.post<IApiResponse<IAccessTokenResponse>>(
                `${API_BASE_URL}/auth/refresh`,
                undefined,
                { withCredentials: true },
            );

            setAccessToken(data.data.accessToken);
            processQueue(null, data.data.accessToken);

            originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
            return apiClient(originalRequest);
        } catch (refreshError: unknown) {
            clearAccessToken();
            processQueue(refreshError, null);

            if (!isPublicPath(window.location.pathname)) {
                window.location.replace('/login');
            }

            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    },
);