import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleRepository } from '../../modules/role/role.repository';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ALLOW_WITHOUT_ORG_KEY } from '../decorators/allow-without-org.decorator';
import { AuthNoMembershipException } from '../errors';
import { IJwtUser } from '../interfaces';

/**
 * JWTs carry an organization context, but membership is mutable. Verify that
 * context against the database before any organization-scoped handler runs.
 */
@Injectable()
export class MembershipContextGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly roleRepository: RoleRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const allowWithoutOrg = this.reflector.getAllAndOverride<boolean>(ALLOW_WITHOUT_ORG_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic || allowWithoutOrg) return true;

    const request = context.switchToHttp().getRequest<{ user?: IJwtUser }>();
    const user = request.user;
    if (!user?.organizationId) return true;

    const membership = await this.roleRepository.findMembershipWithRole(
      user.userId,
      user.organizationId,
    );

    if (!membership || membership.roleId !== user.roleId) {
      throw new AuthNoMembershipException();
    }

    return true;
  }
}
