import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { IJwtUser } from '../interfaces';

@Injectable()
export class OrganizationRequiredGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: IJwtUser }>();
    const user = request.user;

    if (!user || !user.userId) {
      throw new ForbiddenException('User is not authenticated');
    }

    if (!user.organizationId) {
      throw new ForbiddenException('ORGANIZATION_REQUIRED');
    }

    return true;
  }
}
