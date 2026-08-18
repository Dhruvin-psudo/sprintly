import { ForbiddenException, Injectable, Logger, Optional } from '@nestjs/common';
import { MembershipWithRole, RoleRepository } from './role.repository';
import { PRISMA_ERROR, SystemRole } from '../../common/constants';
import { OrganizationMember, Prisma, Role } from '@prisma/client';
import { AuthNoMembershipException, DuplicateResourceException, ResourceNotFoundException, RoleHasMembersException, RoleIsSystemException, RoleNotFoundException } from '../../common/errors';
import { CreateRoleDto } from './dto/create-role.dto';
import { IAuthenticatedUser } from '../../common/interfaces';
import { RoleQueryDto } from './dto/role-query.dto';
import { PaginatedResult } from '../../common/dto';
import { formatPermission, getRoleHierarchyLevel } from '../../common/constants/permissions';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RemoveMemberDto } from './dto/remove-member.dto';
import { RealtimeService } from '../realtime/realtime.service';

@Injectable()
export class RoleService {
    private readonly logger = new Logger(RoleService.name);

    constructor(
        private readonly roleRepository: RoleRepository,
        @Optional() private readonly realtimeService?: RealtimeService,
    ) {}

    async createRole(createRoleDto: CreateRoleDto, createdBy: IAuthenticatedUser): Promise<Role> {
        try {
            const role = await this.roleRepository.createRole({
                name: createRoleDto.name, description: createRoleDto.description, permissionIds : createRoleDto.permissionIds
            }, createdBy)

            this.logger.log(
                { roleId: role.id, name: createRoleDto.name, organizationId: createdBy.organizationId},
                'Role created'
            )
            return role
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PRISMA_ERROR.UNIQUE_CONSTRAINT) {
                    throw new DuplicateResourceException('Role', 'name')
                }
                if (error.code === PRISMA_ERROR.FOREIGN_KEY_CONSTRAINT) {
                    throw new ResourceNotFoundException('Permission', 'provide some IDs')
                }
            }
            throw error
        }
    }
    

    async getSystemRole(roleName: SystemRole): Promise<Role> {
        const role = await this.roleRepository.findSystemRoleByName(roleName);

        if (!role) {
            throw new RoleNotFoundException(roleName);
        }
        return role;
    }

    async createMember(
        userId: string,
        organizationId: string,
        roleId: string,
        requestedBy?: string
    ): Promise<OrganizationMember> {
        return this.roleRepository.createMember(
            { userId, organizationId, roleId },
            requestedBy
        );
    }

    async getMyPermissions(orgId: string, userId: string) : Promise<readonly string[]> {
        const membership = await this.roleRepository.findMembershipWithRole(userId, orgId);

        if(!membership) {
            throw new AuthNoMembershipException()
        }

        const role = await this.roleRepository.findRoleWithPermissions(membership.roleId, orgId);

        if(!role) {
            throw new RoleNotFoundException(membership.roleId);
        }

        const permissionStrings = role.rolePermissions.map((rp) => 
            formatPermission(rp.permission.resource, rp.permission.action)
        )

        return permissionStrings;
        
    }

    async getRoles(
        orgId: string,
        query: RoleQueryDto
    ) : Promise<PaginatedResult<Role & { memberCount?: number, hierarchyLevel: number}>>{
        const {data} = await this.roleRepository.findByOrganization(orgId, query);
        const enriched = data.map((r) =>({...r, hierarchyLevel: getRoleHierarchyLevel(r.name)}))

        return PaginatedResult.create(enriched, enriched.length, query.page, query.limit)
    }

    async getRoleById(
        roleId: string,
        organizationId: string
    ) {
        const role = await this.roleRepository.findRoleWithPermissions(roleId, organizationId)

        if(!role) {
            throw new RoleNotFoundException(roleId);
        }

        const permissionStrings = role.rolePermissions.map((rp) => 
            formatPermission(rp.permission.resource, rp.permission.action)
        )

        return { 
            ...role,
            permissions: permissionStrings,
            hierarchyLevel: getRoleHierarchyLevel(role.name)
        }
    }

    async assignRole(
        roleName: SystemRole,
        userId: string,
        organizationId: string,
        assignedBy: string
    ): Promise<OrganizationMember> {
        const role = await this.getSystemRole(roleName);
        return this.createMember(userId, organizationId, role.id, assignedBy);
    }

    async updateMemberRole(
        userId: string,
        roleId: string,
        assignedBy: IAuthenticatedUser
    ) : Promise<void> {
        const role = await this.roleRepository.findRoleWithPermissions(roleId, assignedBy.organizationId);

        if(!role) {
            throw new RoleNotFoundException(roleId)
        }

        if (role.organizationId && role.organizationId !== assignedBy.organizationId) {
            throw new RoleNotFoundException(roleId)
        }

        if((role.name as SystemRole) === SystemRole.OWNER) {
            throw new ForbiddenException('Can not assign Owner role')
        }

        const targetMembership = await this.roleRepository.findMembershipWithRole(
            userId,
            assignedBy.organizationId
        );
        if(!targetMembership) {
            throw new AuthNoMembershipException()
        }

        const callerMembership = await this.roleRepository.findMembershipWithRole(
            assignedBy.userId,
            assignedBy.organizationId,
        );
        if (!callerMembership) throw new AuthNoMembershipException();
        if (userId === assignedBy.userId || targetMembership.role.name === SystemRole.OWNER) {
            throw new ForbiddenException('You cannot change this member role');
        }
        if (getRoleHierarchyLevel(callerMembership.role.name) <= getRoleHierarchyLevel(targetMembership.role.name)) {
            throw new ForbiddenException('You can only change roles for lower-ranked members');
        }

        try {
            await this.roleRepository.updateMemberRole(userId, roleId, assignedBy)

            this.logger.log(
                { userId, roleId, organizationId: assignedBy.organizationId},
                'Member role updated'
            )
            this.realtimeService?.organizationChanged(assignedBy.organizationId, 'members');
            this.realtimeService?.membershipChanged(userId, assignedBy.organizationId, 'role-changed');
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === PRISMA_ERROR.RECORD_NOT_FOUND
            ) {
                throw new AuthNoMembershipException()
            }
            throw error
        }
    }

    // Update custom role of Organization
    async updateRole (
        roleId: string,
        dto: UpdateRoleDto,
        updatedBy: IAuthenticatedUser
    ) : Promise<Role> {
        const role = await this.roleRepository.findRoleWithPermissions(roleId, updatedBy.organizationId);

        if(!role) {
            throw new RoleNotFoundException(roleId);
        }
        if(role.isSystem) {
            throw new RoleIsSystemException()
        }
        if(role.organizationId && role.organizationId !== updatedBy.organizationId) {
            throw new RoleNotFoundException(roleId);
        }
        if((role.name as SystemRole) === SystemRole.OWNER) {
            throw new ForbiddenException('Can not update Owner role')
        }

        try {
            const update = await this.roleRepository.updateRole(
                roleId,
                {
                    name: dto.name,
                    description: dto.description,
                    permissionIds:
                        dto.permissionIds ? dto.permissionIds : undefined
                },
                updatedBy);

            this.logger.log(
                { roleId, orgId: updatedBy.organizationId}, 'Role updated'
            )    
            return update
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === PRISMA_ERROR.UNIQUE_CONSTRAINT) {
                    throw new DuplicateResourceException('Role', 'name')
                }
                if(error.code === PRISMA_ERROR.FOREIGN_KEY_CONSTRAINT) {
                    throw new ResourceNotFoundException('Permission', 'provide some IDs')
                }
            }
            throw error
        }
    }

    async getMembershipWithRole(
        userId: string,
        organizationId: string
    ): Promise<MembershipWithRole | null> {
        return this.roleRepository.findMembershipWithRole(userId, organizationId);
    }

    /** Get First Organization's Membership with Role */
    async getFirstMembershipWithRole(userId: string): Promise<MembershipWithRole | null> {
        return this.roleRepository.findFirstMembershipWithRole(userId);
    }

    async getActiveMembersOfRole(
        roleId: string,
        organizationId: string
    ) {
        const role = await this.roleRepository.findRoleWithPermissions(roleId, organizationId)

        if(!role) {
            throw new RoleNotFoundException(roleId);
        }

        if(role.organizationId && role.organizationId !== organizationId) {
            throw new RoleNotFoundException(roleId)
        }

        return this.roleRepository.findActiveMembersOfRole(roleId, organizationId);
    }

    // Remove Member from Organization
    async removeMember(userId: string, removedBy: IAuthenticatedUser) : Promise<void> {
        if (userId === removedBy.userId) {
            throw new ForbiddenException('You cannot remove yourself from the organization');
        }

        const [callerMembership, targetMembership] = await Promise.all([
            this.roleRepository.findMembershipWithRole(removedBy.userId, removedBy.organizationId),
            this.roleRepository.findMembershipWithRole(userId, removedBy.organizationId),
        ]);
        if (!callerMembership || !targetMembership) throw new AuthNoMembershipException();
        if (targetMembership.role.name === SystemRole.OWNER) {
            throw new ForbiddenException('Organization owners cannot be removed');
        }
        if (getRoleHierarchyLevel(callerMembership.role.name) <= getRoleHierarchyLevel(targetMembership.role.name)) {
            throw new ForbiddenException('You can only remove lower-ranked members');
        }

        try {
            await this.roleRepository.deleteMember(userId, removedBy)

            this.logger.log({ userId, orgId: removedBy.organizationId}, "Member removed")
            this.realtimeService?.organizationChanged(removedBy.organizationId, 'members');
            this.realtimeService?.membershipChanged(userId, removedBy.organizationId, 'removed');
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === PRISMA_ERROR.RECORD_NOT_FOUND
            ) {
                throw new AuthNoMembershipException()
            };
            throw error
        }
    };

    // Remove custome created Role
    async deleteRole(roleId: string, requestedBy: IAuthenticatedUser) : Promise<void> {
        const role = await this.roleRepository.findRoleWithPermissions(roleId, requestedBy.organizationId);

        if(!role) {
            throw new RoleNotFoundException(roleId);
        }

        if(role.isSystem) {
            throw new RoleIsSystemException()
        }

        if(role.organizationId && role.organizationId !== requestedBy.organizationId) {
            throw new RoleNotFoundException(roleId)
        }

        const memberCount = await this.roleRepository.countMembersByRole(
            roleId,
            requestedBy.organizationId
        );
        if(memberCount > 0) {
            throw new RoleHasMembersException(memberCount)
        }

        await this.roleRepository.softDeleteRole(roleId, requestedBy);

        this.logger.warn(
            { roleId, orgId: requestedBy.organizationId, deletedBy: requestedBy.userId },
            "Role deleted")
    }
        
}
