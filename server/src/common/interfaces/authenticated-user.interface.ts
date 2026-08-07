export interface IJwtUser {
    userId: string;
    refreshTokenId: string;
    organizationId: string | null;
    roleId: string | null;
    hasOrganization: boolean;
}

export type IAuthenticatedUser = IJwtUser & {
    organizationId: string;
    roleId: string;
    hasOrganization: true;
};