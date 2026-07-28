import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { RoleService } from '../role/role.service';
import { TokenService } from '../token/token.service';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { AuthInvalidCredentialsException } from '../../common/errors';
import { UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let roleService: jest.Mocked<RoleService>;
  let tokenService: jest.Mocked<TokenService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            getByEmail: jest.fn(),
            updateLastLoginAt: jest.fn().mockResolvedValue(undefined),
            updateLastActiveOrg: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: RoleService,
          useValue: {
            getMembershipWithRole: jest.fn(),
            getFirstMembershipWithRole: jest.fn(),
          },
        },
        {
          provide: TokenService,
          useValue: {
            revokeAllUserSessions: jest.fn(),
            generateOnboardingTokens: jest.fn(),
            generateAuthTokens: jest.fn(),
            revokeToken: jest.fn(),
            verifyAndGetToken: jest.fn(),
            generateAccessToken: jest.fn(),
            generateOnboardingAccessToken: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    roleService = module.get(RoleService);
    tokenService = module.get(TokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a user and generate onboarding tokens', async () => {
      const dto = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        passwordHash: 'secret123',
      };
      const createdUser = { id: 'u-1', email: 'jane@example.com' } as any;

      userService.create.mockResolvedValue(createdUser);
      tokenService.generateOnboardingTokens.mockResolvedValue({
        accessToken: 'onboarding-access',
        refreshToken: 'onboarding-refresh',
      });

      const result = await service.register(dto);

      expect(userService.create).toHaveBeenCalledWith(dto);
      expect(tokenService.revokeAllUserSessions).toHaveBeenCalledWith('u-1');
      expect(result).toEqual({
        user: createdUser,
        accessToken: 'onboarding-access',
        refreshToken: 'onboarding-refresh',
      });
    });
  });

  describe('login', () => {
    const loginDto = { email: 'john@example.com', password: 'password123' };
    const mockUser = {
      id: 'u-100',
      email: 'john@example.com',
      passwordHash: '',
      status: UserStatus.ACTIVE,
      lastActiveOrgId: 'org-1',
    } as any;

    beforeEach(async () => {
      mockUser.passwordHash = await bcrypt.hash('password123', 10);
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      userService.getByEmail.mockResolvedValue(null);
      await expect(service.login(loginDto)).rejects.toThrow(AuthInvalidCredentialsException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      userService.getByEmail.mockResolvedValue(mockUser);
      await expect(service.login({ ...loginDto, password: 'wrongpassword' })).rejects.toThrow(
        AuthInvalidCredentialsException
      );
    });

    it('should throw ForbiddenException if account is SUSPENDED', async () => {
      userService.getByEmail.mockResolvedValue({ ...mockUser, status: UserStatus.SUSPENDED });
      await expect(service.login(loginDto)).rejects.toThrow(AuthInvalidCredentialsException);
    });

    it('should throw ForbiddenException if account is INACTIVE', async () => {
      userService.getByEmail.mockResolvedValue({ ...mockUser, status: UserStatus.INACTIVE });
      await expect(service.login(loginDto)).rejects.toThrow(AuthInvalidCredentialsException);
    });

    it('should login successfully with org context and generate auth tokens', async () => {
      userService.getByEmail.mockResolvedValue(mockUser);
      roleService.getMembershipWithRole.mockResolvedValue({
        organizationId: 'org-1',
        roleId: 'role-1',
      } as any);
      tokenService.generateAuthTokens.mockResolvedValue({
        accessToken: 'auth-access',
        refreshToken: 'auth-refresh',
      });

      const result = await service.login(loginDto);

      expect(tokenService.revokeAllUserSessions).toHaveBeenCalledWith('u-100');
      expect(tokenService.generateAuthTokens).toHaveBeenCalledWith('u-100', {
        organizationId: 'org-1',
        roleId: 'role-1',
      });
      expect(result.accessToken).toBe('auth-access');
    });
  });

  describe('logout', () => {
    it('should revoke token if refreshTokenId is provided', async () => {
      await service.logout('rf-123');
      expect(tokenService.revokeToken).toHaveBeenCalledWith('rf-123');
    });

    it('should revoke all user sessions if userId is provided', async () => {
      await service.logout(undefined, 'u-1');
      expect(tokenService.revokeAllUserSessions).toHaveBeenCalledWith('u-1');
    });
  });

  describe('refreshAccessToken', () => {
    it('should verify REFRESH token and generate new access token', async () => {
      tokenService.verifyAndGetToken.mockResolvedValue({
        id: 'token-1',
        userId: 'u-1',
        type: 'REFRESH',
        metadata: { organizationId: 'org-1', roleId: 'role-1' },
      } as any);
      tokenService.generateAccessToken.mockReturnValue('new-access-token');

      const result = await service.refreshAccessToken('valid-jwt');

      expect(tokenService.verifyAndGetToken).toHaveBeenCalledWith('valid-jwt', [
        'REFRESH',
        'ONBOARDING',
      ]);
      expect(tokenService.generateAccessToken).toHaveBeenCalledWith('u-1', 'token-1', 'org-1', 'role-1');
      expect(result).toEqual({ accessToken: 'new-access-token' });
    });

    it('should verify ONBOARDING token and generate new onboarding access token', async () => {
      tokenService.verifyAndGetToken.mockResolvedValue({
        id: 'token-2',
        userId: 'u-1',
        type: 'ONBOARDING',
      } as any);
      tokenService.generateOnboardingAccessToken.mockReturnValue('new-onboarding-access-token');

      const result = await service.refreshAccessToken('valid-jwt');

      expect(tokenService.generateOnboardingAccessToken).toHaveBeenCalledWith('u-1', 'token-2');
      expect(result).toEqual({ accessToken: 'new-onboarding-access-token' });
    });
  });
});
