import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MembershipContextGuard } from './membership-context.guard';
import { RoleRepository } from '../../modules/role/role.repository';
import { AuthNoMembershipException } from '../errors';

describe('MembershipContextGuard', () => {
  let guard: MembershipContextGuard;
  let reflector: jest.Mocked<Reflector>;
  let roles: jest.Mocked<RoleRepository>;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn().mockReturnValue(false) } as any;
    roles = { findMembershipWithRole: jest.fn() } as any;
    guard = new MembershipContextGuard(reflector, roles);
  });

  function context(user: any): ExecutionContext {
    return {
      getHandler: jest.fn(), getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    } as any;
  }

  it('allows a matching active membership', async () => {
    roles.findMembershipWithRole.mockResolvedValue({ roleId: 'role-1' } as any);
    await expect(guard.canActivate(context({ userId: 'u-1', organizationId: 'org-1', roleId: 'role-1' }))).resolves.toBe(true);
  });

  it('rejects a removed membership', async () => {
    roles.findMembershipWithRole.mockResolvedValue(null);
    await expect(guard.canActivate(context({ userId: 'u-1', organizationId: 'org-1', roleId: 'role-1' }))).rejects.toThrow(AuthNoMembershipException);
  });

  it('allows no-organization recovery endpoints', async () => {
    reflector.getAllAndOverride.mockImplementation((key) => key === 'allowWithoutOrg');
    await expect(guard.canActivate(context({ userId: 'u-1', organizationId: 'org-1', roleId: 'role-1' }))).resolves.toBe(true);
    expect(roles.findMembershipWithRole).not.toHaveBeenCalled();
  });
});
