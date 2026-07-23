import { Organization } from "@prisma/client";

export interface CreateOrganizationData {
    name: string;
    slug: string;
    email?: string;
    createdBy: string
}

export interface CreateOrganizationResult {
    organization: Organization
}