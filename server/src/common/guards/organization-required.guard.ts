import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ALLOW_WITHOUT_ORG_KEY } from '../decorators/allow-without-org.decorator';
import { IJwtUser } from '../interfaces';
import { AuthNoMembershipException } from '../errors';

@Injectable()
export class OrganizationRequiredGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const allowWithoutOrg = this.reflector.getAllAndOverride<boolean>(ALLOW_WITHOUT_ORG_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (allowWithoutOrg) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: IJwtUser }>();
    const user = request.user;

    if (!user || !user.organizationId || !user.hasOrganization) {
      throw new AuthNoMembershipException();
    }

    return true;
  }
}
