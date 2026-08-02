import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { RoleService } from '../role/role.service';
import { TokenService } from '../token/token.service';
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
            generateAuthTokens: jest.fn(),
            revokeToken: jest.fn(),
            verifyAndGetToken: jest.fn(),
            generateAccessToken: jest.fn(),
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
    it('should register a user and return user data without tokens', async () => {
      const dto = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        passwordHash: 'secret123',
      };
      const createdUser = { id: 'u-1', email: 'jane@example.com' } as any;

      userService.create.mockResolvedValue(createdUser);

      const result = await service.register(dto);

      expect(userService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ user: createdUser });
      // No tokens should be generated
      expect(tokenService.generateAuthTokens).not.toHaveBeenCalled();
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

    it('should throw AuthInvalidCredentialsException if user is not found', async () => {
      userService.getByEmail.mockResolvedValue(null);
      await expect(service.login(loginDto)).rejects.toThrow(AuthInvalidCredentialsException);
    });

    it('should throw AuthInvalidCredentialsException if password does not match', async () => {
      userService.getByEmail.mockResolvedValue(mockUser);
      await expect(service.login({ ...loginDto, password: 'wrongpassword' })).rejects.toThrow(
        AuthInvalidCredentialsException
      );
    });

    it('should throw AuthInvalidCredentialsException if account is SUSPENDED', async () => {
      userService.getByEmail.mockResolvedValue({ ...mockUser, status: UserStatus.SUSPENDED });
      await expect(service.login(loginDto)).rejects.toThrow(AuthInvalidCredentialsException);
    });

    it('should throw AuthInvalidCredentialsException if account is INACTIVE', async () => {
      userService.getByEmail.mockResolvedValue({ ...mockUser, status: UserStatus.INACTIVE });
      await expect(service.login(loginDto)).rejects.toThrow(AuthInvalidCredentialsException);
    });

    it('should issue auth tokens with hasOrganization=false when user has no org membership', async () => {
      userService.getByEmail.mockResolvedValue({ ...mockUser, lastActiveOrgId: null });
      roleService.getFirstMembershipWithRole.mockResolvedValue(null);
      tokenService.generateAuthTokens.mockResolvedValue({
        accessToken: 'no-org-access',
        refreshToken: 'no-org-refresh',
      });

      const result = await service.login(loginDto);

      expect(tokenService.revokeAllUserSessions).toHaveBeenCalledWith('u-100');
      expect(tokenService.generateAuthTokens).toHaveBeenCalledWith('u-100');
      expect(result.accessToken).toBe('no-org-access');
      expect(result.refreshToken).toBe('no-org-refresh');
      expect(result.hasOrganization).toBe(false);
    });

    it('should login successfully with org context and hasOrganization=true', async () => {
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
      expect(result.hasOrganization).toBe(true);
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
    it('should verify REFRESH token and generate new access token with org context', async () => {
      tokenService.verifyAndGetToken.mockResolvedValue({
        id: 'token-1',
        userId: 'u-1',
        type: 'REFRESH',
        metadata: { organizationId: 'org-1', roleId: 'role-1' },
      } as any);
      tokenService.generateAccessToken.mockReturnValue('new-access-token');

      const result = await service.refreshAccessToken('valid-jwt');

      expect(tokenService.verifyAndGetToken).toHaveBeenCalledWith('valid-jwt', ['REFRESH']);
      expect(tokenService.generateAccessToken).toHaveBeenCalledWith('u-1', 'token-1', 'org-1', 'role-1');
      expect(result).toEqual({ accessToken: 'new-access-token' });
    });

    it('should verify REFRESH token and generate access token without org context', async () => {
      tokenService.verifyAndGetToken.mockResolvedValue({
        id: 'token-2',
        userId: 'u-1',
        type: 'REFRESH',
        metadata: {},
      } as any);
      tokenService.generateAccessToken.mockReturnValue('no-org-access-token');

      const result = await service.refreshAccessToken('valid-jwt');

      expect(tokenService.generateAccessToken).toHaveBeenCalledWith('u-1', 'token-2', null, null);
      expect(result).toEqual({ accessToken: 'no-org-access-token' });
    });
  });
});
