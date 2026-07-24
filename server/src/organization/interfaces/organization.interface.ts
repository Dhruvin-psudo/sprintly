import { Organization, User } from "@prisma/client";

export interface CreateOrganizationData {
    name: string;
    slug: string;
    email?: string;
    createdBy: string
}

export interface CreateOrganizationResult {
    user?: Omit<User, 'passwordHash'>;
    organization: Organization;
    accessToken?: string;
    refreshToken?: string;
}