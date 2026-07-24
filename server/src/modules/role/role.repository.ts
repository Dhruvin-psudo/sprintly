import { Injectable } from "@nestjs/common";
import { OrganizationMember, Role } from "@prisma/client";
import { SystemRole } from "../../common/constants";
import { PrismaService } from "../../prisma";

interface CreateMemberData {
    userId: string;
    organizationId: string;
    roleId: string;
}

export interface MembershipWithRole {
    id: string;
    userId: string;
    organizationId: string;
    roleId: string;
    role: {
        id: string;
        name: string;
    };
}

@Injectable()
export class RoleRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findSystemRoleByName(roleName: SystemRole): Promise<Role | null> {
        return this.prisma.role.findFirst({
            where: { name: roleName, isSystem: true, organizationId: null, isDeleted: false }
        });
    }

    async createMember(
        data: CreateMemberData,
        requestedBy?: string
    ): Promise<OrganizationMember> {
        return this.prisma.organizationMember.create({
            data: {
                userId: data.userId,
                organizationId: data.organizationId,
                roleId: data.roleId,
                createdBy: requestedBy
            }
        });
    }

    // Find Membership By UserId and OrganizationId
    async findMembershipWithRole(
        userId: string,
        organizationId: string,
    ): Promise<MembershipWithRole | null> {
        return this.prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: { userId, organizationId },
            },
            include: {
                role: { select: { id: true, name: true } },
            },
        });
    }

    // Find User's First Organization's Membership
    async findFirstMembershipWithRole(userId: string): Promise<MembershipWithRole | null> {
        return this.prisma.organizationMember.findFirst({
            where: { userId },
            orderBy: { createdAt: 'asc' },
            include: {
                role: { select: { id: true, name: true } },
            },
        });
    }
}