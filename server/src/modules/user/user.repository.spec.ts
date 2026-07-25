import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { PrismaService } from '../../prisma';

describe('UserRepository', () => {
  let repository: UserRepository;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    prisma = module.get(PrismaService) as any;
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create user record omitting passwordHash', async () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        passwordHash: 'hashedPass',
      };
      const createdUser = { id: 'u-1', firstName: 'John', email: 'john@example.com' } as any;
      (prisma.user.create as jest.Mock).mockResolvedValue(createdUser);

      const result = await repository.create(data);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          firstName: data.firstName,
          email: data.email,
          passwordHash: data.passwordHash,
          lastName: 'Doe',
        },
        omit: { passwordHash: true },
      });
      expect(result).toEqual(createdUser);
    });
  });

  describe('isEmailTaken', () => {
    it('should return true if non-deleted user with email exists', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: 'u-1' });

      const result = await repository.isEmailTaken('john@example.com');

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'john@example.com', isDeleted: false },
        select: { id: true },
      });
      expect(result).toBe(true);
    });

    it('should return false if email is available', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await repository.isEmailTaken('new@example.com');
      expect(result).toBe(false);
    });
  });

  describe('getWithMembership', () => {
    it('should return user with membership role formatted', async () => {
      const dbResult = {
        id: 'u-1',
        email: 'john@example.com',
        memberships: [{ role: { id: 'r-1', name: 'OWNER' } }],
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(dbResult);

      const result = await repository.getWithMembership('u-1', 'org-1');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'u-1', isDeleted: false },
        omit: { passwordHash: true },
        include: {
          memberships: {
            where: { organizationId: 'org-1' },
            take: 1,
            include: {
              role: { select: { id: true, name: true } },
            },
          },
        },
      });
      expect(result).toEqual({
        id: 'u-1',
        email: 'john@example.com',
        currentRole: { id: 'r-1', name: 'OWNER' },
      });
    });

    it('should return null if user does not exist', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      const result = await repository.getWithMembership('invalid-id', 'org-1');
      expect(result).toBeNull();
    });
  });

  describe('softDelete', () => {
    it('should set isDeleted to true and update deletedAt', async () => {
      await repository.softDelete('u-1');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u-1' },
        data: { isDeleted: true, deletedAt: expect.any(Date) },
      });
    });
  });

  describe('updateLastActiveOrg', () => {
    it('should update lastActiveOrgId and updatedBy', async () => {
      await repository.updateLastActiveOrg('u-1', 'org-1');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u-1' },
        data: { lastActiveOrgId: 'org-1', updatedBy: 'u-1' },
      });
    });
  });

  describe('updateLastLoginAt', () => {
    it('should update lastLoginAt date', async () => {
      const now = new Date();
      await repository.updateLastLoginAt('u-1', now);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u-1' },
        data: { lastLoginAt: now },
      });
    });
  });
});
