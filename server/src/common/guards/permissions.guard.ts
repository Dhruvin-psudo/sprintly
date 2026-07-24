import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Permission } from '../constants';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || (!user.userId && !user.id)) {
            throw new ForbiddenException('User is not authenticated');
        }

        const userId = user.userId || user.id;
        const organizationId = 
            request.params?.organizationId || 
            request.params?.orgId || 
            request.headers['x-organization-id'] || 
            user.organizationId;

        if (!organizationId) {
            // If endpoint requires specific organization-scoped permissions but org context is missing
            throw new ForbiddenException('Organization context missing for permission check');
        }

        // const hasPermission = await this.roleService.hasPermission(userId, organizationId, requiredPermissions);
        
        // if (!hasPermission) {
        //     throw new ForbiddenException('Forbidden: Insufficient permissions');
        // }

        return true;
    }
}
