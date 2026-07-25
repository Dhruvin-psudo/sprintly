import axios from 'axios';

/**
 * Unauthenticated axios client for public routes (join link form, etc.).
 *
 * Intentionally skips the request/response interceptors used by the main
 * `apiClient` — no bearer token is attached, no refresh loop is triggered on
 * 401, and the client does not share cookies with authenticated sessions.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const publicApiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    // Do NOT send credentials — public form submissions should not carry
    // the authenticated user's refresh cookie.
    withCredentials: false,
});
