const TOKEN_KEY = 'accessToken';

export function getAccessToken(): string | null {
    try {
        return localStorage.getItem(TOKEN_KEY)
    } catch (error) {
        return null
    }
}

export function clearAccessToken(): void {
    try {
        localStorage.removeItem(TOKEN_KEY)
    } catch (error) {
        return;  // localStorage unavailable — token lives in memory only
    }
}

export function setAccessToken(token: string): void {
    try {
        localStorage.setItem(TOKEN_KEY, token)
    } catch (error) {
        return;
    }
}