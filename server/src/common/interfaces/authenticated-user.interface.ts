export interface IAuthenticatedUser {
    userId: string | null;
    refreshTokenId?: string;
}