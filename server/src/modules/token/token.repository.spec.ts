import { Test, TestingModule } from '@nestjs/testing';
import { TokenRepository } from './token.repository';
import { PrismaService } from '../../prisma';
import { TokenType } from '@prisma/client';

describe('TokenRepository', () => {
  let repository: TokenRepository;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenRepository,
        {
          provide: PrismaService,
          useValue: {
            token: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<TokenRepository>(TokenRepository);
    prisma = module.get(PrismaService) as any;
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('createToken', () => {
    it('should create token row', async () => {
      const data = {
        userId: 'u-1',
        type: TokenType.REFRESH,
        token: 'token-string',
        expiresAt: new Date(),
      };
      const createdToken = { id: 't-1', ...data } as any;

      (prisma.token.create as jest.Mock).mockResolvedValue(createdToken);

      const result = await repository.createToken(data);

      expect(prisma.token.create).toHaveBeenCalledWith({
        data: {
          userId: data.userId,
          type: data.type,
          token: data.token,
          familyId: undefined,
          metadata: undefined,
          expiresAt: data.expiresAt,
        },
      });
      expect(result).toEqual(createdToken);
    });
  });

  describe('findTokenById', () => {
    it('should query token by id', async () => {
      const mockToken = { id: 't-1' } as any;
      (prisma.token.findUnique as jest.Mock).mockResolvedValue(mockToken);

      const result = await repository.findTokenById('t-1');

      expect(prisma.token.findUnique).toHaveBeenCalledWith({ where: { id: 't-1' } });
      expect(result).toEqual(mockToken);
    });
  });

  describe('findActiveToken', () => {
    it('should query unrevoked unexpired token matching types', async () => {
      const mockToken = { id: 't-1', token: 'jwt-1' } as any;
      (prisma.token.findFirst as jest.Mock).mockResolvedValue(mockToken);

      const result = await repository.findActiveToken([TokenType.REFRESH], 'jwt-1');

      expect(prisma.token.findFirst).toHaveBeenCalledWith({
        where: {
          type: { in: [TokenType.REFRESH] },
          token: 'jwt-1',
          isRevoked: false,
          expiresAt: { gt: expect.any(Date) },
        },
      });
      expect(result).toEqual(mockToken);
    });
  });

  describe('revokeToken', () => {
    it('should set isRevoked to true for token id', async () => {
      await repository.revokeToken('t-1');

      expect(prisma.token.update).toHaveBeenCalledWith({
        where: { id: 't-1' },
        data: { isRevoked: true },
      });
    });
  });

  describe('revokeAllUserTokensByType', () => {
    it('should set isRevoked to true for all active tokens of user by type', async () => {
      await repository.revokeAllUserTokensByType('u-1', TokenType.REFRESH);

      expect(prisma.token.updateMany).toHaveBeenCalledWith({
        where: { userId: 'u-1', type: TokenType.REFRESH, isRevoked: false },
        data: { isRevoked: true },
      });
    });
  });
});
