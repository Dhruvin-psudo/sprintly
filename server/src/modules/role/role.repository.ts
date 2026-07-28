import { Injectable } from "@nestjs/common";
import { OrganizationMember, Prisma, Role } from "@prisma/client";
import { SystemRole } from "../../common/constants";
import { PrismaService } from "../../prisma";
import { CreateRoleDto } from "./dto/create-role.dto";
import { IPaginatedData, IPaginationQuery, IAuthenticatedUser } from "../../common/interfaces";
import { RoleQueryDto } from "./dto/role-query.dto";

interface CreateMemberData {
    userId: string;
    organizationId: string;
    roleId: string;
}

interface UpdateRoleData {
    name?: string;
    description?: string;
    permissionIds?: string[];
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

export interface RoleMemberSummary {
    id: string;
    userId: string;
    firstName: string;
    lastName?: string;
    email: string;
}

@Injectable()
export class RoleRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findSystemRoleByName(roleName: SystemRole): Promise<Role | null> {
        return this.prisma.role.findFirst({
            where: { name: roleName, isSystem: true, organizationId: null, isDeleted: false }
        });
    }

    async createRole(data: CreateRoleDto, createdBy: IAuthenticatedUser) : Promise<Role> {
        return this.prisma.role.create({
            data: {
                name: data.name,
                description: data.description,
                organizationId: createdBy.organizationId,
                createdBy: createdBy.userId,
                rolePermissions: {
                    create: data.permissionIds.map((permissionId) => ({
                        permissionId,
                        createdBy: createdBy.userId
                    }))
                }
            }
        })
    };

    async updateRole(roleId: string, data: UpdateRoleData, updatedBy: IAuthenticatedUser) : Promise<Role> {
        return this.prisma.$transaction(async (tx) => {
            if (data.permissionIds) {
                await tx.rolePermission.deleteMany({ where: { roleId }});
                await tx.rolePermission.createMany({
                    data: data.permissionIds.map((id) => ({
                        roleId,
                        permissionId: id,
                        createdBy: updatedBy.userId
                    }))
                })
            }
            
            return tx.role.update({
                where : { id: roleId},
                data : {
                    ...(data.name !== undefined && { name: data.name}),
                    ...(data.description !== undefined && { description: data.description}),
                    updatedBy: updatedBy.userId
                }
            })
        })
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

    async findByOrganization(
        organizationId: string,
        query: IPaginationQuery & RoleQueryDto
    ) : Promise<IPaginatedData<Role & { memberCount?: number}>> {
        const baseFilter : Prisma.RoleWhereInput = {
            isDeleted: false,
            OR: [{organizationId}, { organizationId: null, isSystem: true}]
        }

        const [data, total] = await Promise.all([
            this.prisma.role.findMany({
                where: baseFilter,
                skip: (query.page - 1) * query.limit,
                take: query.limit,
                include: {
                    _count: { select: { members: { where: {organizationId}}}}
                },
                orderBy: [{isSystem: 'desc'}, { name: 'asc'}]
            }),
            this.prisma.role.count({where: baseFilter})
        ])

        const enriched = data.map(({ _count, ...row}) => ({
            ...row,
            memberCount: _count?.members ?? 0
        })) 
        
        return {data: enriched, total}
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
    };

    // Count active (non-soft-deleted) memberships for a role within an org.
    async countMembersByRole(roleId: string, organizationId: string): Promise<number> {
        return this.prisma.organizationMember.count({ where: { roleId, organizationId } });
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

    // Update Member's role
    async updateMemberRole(userId: string, roleId: string, assignedBy: IAuthenticatedUser) : Promise<void> {
        await this.prisma.organizationMember.update({
            where: { 
                userId_organizationId: { 
                    userId,
                    organizationId : assignedBy.organizationId
                }
            },
            data: {
                roleId: roleId,
                updatedBy: assignedBy.userId
            }
        })
    }
        
    

    // Find role by roleId and orgId with Permissions 
    async findRoleWithPermissions(roleId: string, organizationId: string) {
        return this.prisma.role.findFirst({
            where: {
                id: roleId,
                isDeleted: false,
                OR: [{organizationId}, {organizationId: null, isSystem: true}]
            },
            include: {
                rolePermissions: {
                    include: {
                        permission: {
                            select: { id: true, resource: true, action: true, description: true}
                        }
                    }
                }
            }
        })
    };

    async findActiveMembersOfRole(
        roleId: string,
        organizationId:string
    ) : Promise<RoleMemberSummary[]> {
        const rows = await this.prisma.organizationMember.findMany({
            where: {
                roleId,
                organizationId,
            },
            select: {
                id:true,
                userId: true,
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'asc'}
        })

        return rows.map((row) => ({
            id: row.id,
            userId: row.userId,
            firstName: row.user.firstName,
            email: row.user.email,
            ...(row.user.lastName && {lastName: row.user.lastName})
        }))
    };

    // Delete member from Organization
    async deleteMember(userId: string, removedBy: IAuthenticatedUser) : Promise<void> {
        await this.prisma.organizationMember.delete({
            where: {
                userId_organizationId: { userId, organizationId: removedBy.organizationId}
            }
        })
    };

    // Soft Delete a Custom Role
    async softDeleteRole(roleId: string, removedBy: IAuthenticatedUser) : Promise<void> {
        await this.prisma.role.update({
            where: { id: roleId },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                deletedBy: removedBy.userId,
                updatedBy: removedBy.userId
            }
        })
    }
}