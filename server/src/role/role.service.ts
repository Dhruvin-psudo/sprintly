import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { MembershipWithRole, RoleRepository } from './role.repository';
import { SystemRole } from '../common/constants/permissions';
import { OrganizationMember, Role } from '@prisma/client';

@Injectable()
export class RoleService {
    private readonly logger = new Logger(RoleService.name)

    constructor(
        private readonly roleRepository: RoleRepository
    ) {}

    async getSystemRole(roleName: SystemRole) : Promise<Role> {
        this.logger.log({roleName}, "Fetching system role")
        const role = await this.roleRepository.findSystemRoleByName(roleName)
        if (!role) {
            throw new NotFoundException("Role not found")
        }
        this.logger.log({role}, "System role found")
        return role
    }

    async createMember(
        userId: string,
        organizationId: string,
        roleId: string,
        requestedBy?: string
    ) : Promise<OrganizationMember> {
        const member = await this.roleRepository.createMember(
            { userId, organizationId, roleId},
            requestedBy
        )

        return member
    }

    async assignRole(
        roleName: SystemRole,
        userId: string,
        organizationId: string,
        assignedBy: string
    ) : Promise<OrganizationMember> {
        console.log(roleName, userId, organizationId, assignedBy)
        const role = await this.getSystemRole(roleName);
        console.log("Role:", role)
        return this.createMember(userId, organizationId, role.id, assignedBy)
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
}
