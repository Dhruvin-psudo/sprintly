import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Permission } from '../constants';
import { RoleRepository } from '../../modules/role/role.repository';
import { IJwtUser } from '../interfaces';
import { formatPermission } from '../constants/permissions';

@Injectable()
export class PermissionsGuard implements CanActivate {
    private readonly logger = new Logger(PermissionsGuard.name);

    constructor(
        private readonly reflector: Reflector,
        private readonly roleRepository: RoleRepository
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest<{ user?: IJwtUser; path?: string}>();
        const user = request.user;

        if (!user || !user.organizationId || !user.roleId) {
            throw new ForbiddenException('User is not authenticated');
        }

        let userPermissions: Set<string>;

        const role = await this.roleRepository.findRoleWithPermissions(
            user.roleId as string, 
            user.organizationId as string
        );

        if(!role) {
            this.logger.warn(
                {roleId: user.roleId, organizationId: user.organizationId},
                'Role was not found during permission check'
            )
            throw new ForbiddenException('Role not found')
        };

        const perms = role.rolePermissions.map((rp) => 
            formatPermission(rp.permission.resource, rp.permission.action)
        );
        userPermissions = new Set(perms);

        const hasPermission = requiredPermissions.every((permission)=>userPermissions.has(permission));
        
        if (!hasPermission) {
            this.logger.warn(
                {
                    userId: user.userId,
                    orgId: user.organizationId,
                    required: requiredPermissions
                },
                'Permission denied'
            )
            throw new ForbiddenException('Insufficient permissions');
        };

        this.logger.debug(
            {
                userId: user.userId,
                organizationId: user.organizationId,
                required: requiredPermissions
            },
            'Permission granted'
        )

        return true;
    }
}
