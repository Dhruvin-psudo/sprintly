import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { OrganizationRepository } from './organization.repository';
import { UserService } from '../user/user.service';
import { randomBytes } from 'crypto';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { IJwtUser, IRequestBy } from '../../common/interfaces';
import { CreateOrganizationResult } from './interfaces/organization.interface';
import { RoleService } from '../role/role.service';
import { SystemRole } from '../../common/constants';
import { GeneratedTokens, TokenService } from '../token/token.service';
import { AuthNoMembershipException, ResourceNotFoundException } from '../../common/errors';
import { Organization } from '@prisma/client';

@Injectable()
export class OrganizationService {
    private readonly logger = new Logger(OrganizationService.name)

    constructor(
        private readonly organizationRepository: OrganizationRepository,
        private readonly userService: UserService,
        private readonly roleService: RoleService,
        private readonly tokenService: TokenService
    ) { }

    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/[\s]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    private async generateUniqueSlug(name: string): Promise<string> {
        const baseSlug = this.generateSlug(name);
        let slug = baseSlug;
        const MAX_ATTEMPTS = 5;

        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            const isTaken = await this.organizationRepository.isSlugTaken(slug);
            if (!isTaken) return slug;
            slug = `${baseSlug}-${randomBytes(3).toString('hex')}`;
        }

        throw new ConflictException(
            'Unable to generate a unique slug. Please try a different name.',
        );
    };

    // Find Organization By ID
    async findOrgById(orgId: string) : Promise<Organization | null> {
        const org = await this.organizationRepository.findOrgById(orgId);
        if (!org) {
            throw new ResourceNotFoundException('Organization', orgId)
        };
        return org
    }

    // Find All User Organizations
    async getUserOrganizations(userId: string) : Promise<Organization[]> {
        const orgs = await this.organizationRepository.findOrgsByUserId(userId);
        return orgs
    }

    async create(
        dto: CreateOrganizationDto,
        createdBy: IJwtUser
    ): Promise<CreateOrganizationResult> {
        const slug = await this.generateUniqueSlug(dto.name);

        const organization = await this.organizationRepository.create({
            name: dto.name,
            email: dto.email,
            slug,
            createdBy: createdBy.userId
        });

        const member = await this.roleService.assignRole(
            SystemRole.OWNER,
            createdBy.userId,
            organization.id,
            createdBy.userId
        );

        // Update user's last active organization ID
        await this.userService.updateLastActiveOrg(createdBy.userId, organization.id);

        const { accessToken, refreshToken } = await this.tokenService.issueAuthTokens(
            createdBy.userId,
            { organizationId: organization.id, roleId: member.roleId }
        );

        this.logger.log(
            { orgId: organization.id, slug, userId: createdBy.userId },
            'Organization created successfully and full auth tokens issued'
        );

        return { organization, accessToken, refreshToken };
    };

    // switch Organization 
    async switchOrganization(
        targetOrgId: string,
        switchedBy: IRequestBy
    ): Promise<GeneratedTokens> {
        const member = await this.roleService.getMembershipWithRole(switchedBy.userId, targetOrgId)

        if (!member) {
            throw new AuthNoMembershipException()
        }

        const tokens = await this.tokenService.issueAuthTokens(
            switchedBy.userId,
            { organizationId: targetOrgId, roleId: member.roleId }
        )

        await this.userService.updateLastActiveOrg(switchedBy.userId, targetOrgId);

        this.logger.log(
            { userId: switchedBy.userId, orgId: targetOrgId },
            'Organization switched successfully'
        );

        return tokens
    }
}
