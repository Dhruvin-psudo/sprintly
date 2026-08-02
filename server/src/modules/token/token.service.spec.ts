import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';
import { TokenRepository } from './token.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenType } from '@prisma/client';

describe('TokenService', () => {
  let service: TokenService;
  let jwtService: jest.Mocked<JwtService>;
  let tokenRepository: jest.Mocked<TokenRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-string'),
            verify: jest.fn().mockReturnValue({ sub: 'user-1' }),
          },
        },
        {
          provide: TokenRepository,
          useValue: {
            createToken: jest.fn(),
            findTokenById: jest.fn(),
            findActiveToken: jest.fn(),
            revokeToken: jest.fn(),
            revokeAllUserTokensByType: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(7),
          },
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    jwtService = module.get(JwtService);
    tokenRepository = module.get(TokenRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateAccessToken', () => {
    it('should sign jwt with org context payload when org and role provided', () => {
      const token = service.generateAccessToken('u-1', 'rf-1', 'org-1', 'role-1');

      expect(jwtService.sign).toHaveBeenCalledWith({
        userId: 'u-1',
        refreshTokenId: 'rf-1',
        organizationId: 'org-1',
        roleId: 'role-1',
        hasOrganization: true,
      });
      expect(token).toBe('mock-jwt-string');
    });

    it('should sign jwt without org context when org and role are null', () => {
      const token = service.generateAccessToken('u-1', 'rf-1', null, null);

      expect(jwtService.sign).toHaveBeenCalledWith({
        userId: 'u-1',
        refreshTokenId: 'rf-1',
        organizationId: null,
        roleId: null,
        hasOrganization: false,
      });
      expect(token).toBe('mock-jwt-string');
    });
  });

  describe('generateAuthTokens', () => {
    it('should generate auth tokens with org context and create a refresh token in DB', async () => {
      tokenRepository.createToken.mockResolvedValue({
        id: 'token-row-1',
        userId: 'u-1',
      } as any);

      const result = await service.generateAuthTokens('u-1', {
        organizationId: 'org-1',
        roleId: 'role-1',
      });

      expect(tokenRepository.createToken).toHaveBeenCalledWith(
        expect.objectContaining({
          type: TokenType.REFRESH,
          metadata: { organizationId: 'org-1', roleId: 'role-1' },
        })
      );
      expect(result).toEqual({
        accessToken: 'mock-jwt-string',
        refreshToken: 'mock-jwt-string',
      });
    });

    it('should generate auth tokens without org context when orgContext is omitted', async () => {
      tokenRepository.createToken.mockResolvedValue({
        id: 'token-row-2',
        userId: 'u-1',
      } as any);

      const result = await service.generateAuthTokens('u-1');

      expect(tokenRepository.createToken).toHaveBeenCalledWith(
        expect.objectContaining({
          type: TokenType.REFRESH,
          metadata: {},
        })
      );
      expect(result).toEqual({
        accessToken: 'mock-jwt-string',
        refreshToken: 'mock-jwt-string',
      });
    });
  });

  describe('isTokenRevoked', () => {
    it('should return true if token is not found', async () => {
      tokenRepository.findTokenById.mockResolvedValue(null);
      expect(await service.isTokenRevoked('invalid-id')).toBe(true);
    });

    it('should return true if token is marked revoked', async () => {
      tokenRepository.findTokenById.mockResolvedValue({
        id: '1',
        isRevoked: true,
        expiresAt: new Date(Date.now() + 10000),
      } as any);
      expect(await service.isTokenRevoked('1')).toBe(true);
    });

    it('should return false if token is active and unexpired', async () => {
      tokenRepository.findTokenById.mockResolvedValue({
        id: '1',
        isRevoked: false,
        expiresAt: new Date(Date.now() + 100000),
      } as any);
      expect(await service.isTokenRevoked('1')).toBe(false);
    });
  });

  describe('verifyAndGetToken', () => {
    it('should verify jwt and return active token record', async () => {
      const mockRecord = { id: 'token-1', token: 'valid-jwt' } as any;
      tokenRepository.findActiveToken.mockResolvedValue(mockRecord);

      const result = await service.verifyAndGetToken('valid-jwt', [TokenType.REFRESH]);

      expect(jwtService.verify).toHaveBeenCalledWith('valid-jwt');
      expect(tokenRepository.findActiveToken).toHaveBeenCalledWith([TokenType.REFRESH], 'valid-jwt');
      expect(result).toEqual(mockRecord);
    });

    it('should throw error if jwt verification fails', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('invalid signature');
      });

      await expect(
        service.verifyAndGetToken('invalid-jwt', [TokenType.REFRESH])
      ).rejects.toThrow('Password reset token is invalid or expired');
    });
  });

  describe('revokeAllUserSessions', () => {
    it('should revoke REFRESH tokens for user', async () => {
      await service.revokeAllUserSessions('u-1');
      expect(tokenRepository.revokeAllUserTokensByType).toHaveBeenCalledWith(
        'u-1',
        TokenType.REFRESH
      );
      expect(tokenRepository.revokeAllUserTokensByType).toHaveBeenCalledTimes(1);
    });
  });
});
