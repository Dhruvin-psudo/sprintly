import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { MembershipWithRole, RoleRepository } from './role.repository';
import { SystemRole } from '../common/constants/permissions';
import { OrganizationMember, Role } from '@prisma/client';

@Injectable()
export class RoleService {
    private readonly logger = new Logger(RoleService.name);

    constructor(
        private readonly roleRepository: RoleRepository
    ) {}

    async getSystemRole(roleName: SystemRole): Promise<Role> {
        const role = await this.roleRepository.findSystemRoleByName(roleName);

        if (!role) {
            throw new NotFoundException(`Role '${roleName}' not found in database.`);
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

    async assignRole(
        roleName: SystemRole,
        userId: string,
        organizationId: string,
        assignedBy: string
    ): Promise<OrganizationMember> {
        const role = await this.getSystemRole(roleName);
        return this.createMember(userId, organizationId, role.id, assignedBy);
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
