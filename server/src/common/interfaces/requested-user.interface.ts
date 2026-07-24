export interface IRequestBy {
    userId: string | null;
    organizationId?: string | null;
    roleId?: string | null;
    refreshTokenId?: string;
    isCompletedOnboarding?: boolean;
}