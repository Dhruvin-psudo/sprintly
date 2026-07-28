import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OrganizationRequiredGuard } from './organization-required.guard';
import { AuthNoMembershipException } from '../errors';

describe('OrganizationRequiredGuard', () => {
  let guard: OrganizationRequiredGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as any;
    guard = new OrganizationRequiredGuard(reflector);
  });

  function createMockContext(user?: any): ExecutionContext {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as any;
  }

  it('should allow access if route is public', () => {
    reflector.getAllAndOverride.mockImplementation((key) => {
      if (key === 'isPublic') return true;
      return false;
    });

    const context = createMockContext();
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access if route allows onboarding', () => {
    reflector.getAllAndOverride.mockImplementation((key) => {
      if (key === 'allowOnboarding') return true;
      return false;
    });

    const context = createMockContext({ userId: 'u-1', organizationId: null, isCompletedOnboarding: false });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw AuthNoMembershipException if user has no organizationId', () => {
    reflector.getAllAndOverride.mockReturnValue(false);

    const context = createMockContext({
      userId: 'u-1',
      organizationId: null,
      roleId: null,
      isCompletedOnboarding: false,
    });

    expect(() => guard.canActivate(context)).toThrow(AuthNoMembershipException);
  });

  it('should throw AuthNoMembershipException if user is not completed onboarding', () => {
    reflector.getAllAndOverride.mockReturnValue(false);

    const context = createMockContext({
      userId: 'u-1',
      organizationId: 'org-1',
      roleId: 'role-1',
      isCompletedOnboarding: false,
    });

    expect(() => guard.canActivate(context)).toThrow(AuthNoMembershipException);
  });

  it('should allow access if user has organizationId and isCompletedOnboarding is true', () => {
    reflector.getAllAndOverride.mockReturnValue(false);

    const context = createMockContext({
      userId: 'u-1',
      organizationId: 'org-1',
      roleId: 'role-1',
      isCompletedOnboarding: true,
    });

    expect(guard.canActivate(context)).toBe(true);
  });
});
