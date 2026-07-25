import { Test, TestingModule } from '@nestjs/testing';
import { RoleRepository } from './role.repository';
import { PrismaService } from '../../prisma';
import { SystemRole } from '../../common/constants';

describe('RoleRepository', () => {
  let repository: RoleRepository;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleRepository,
        {
          provide: PrismaService,
          useValue: {
            role: {
              findFirst: jest.fn(),
            },
            organizationMember: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<RoleRepository>(RoleRepository);
    prisma = module.get(PrismaService) as any;
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findSystemRoleByName', () => {
    it('should query system role by name', async () => {
      const mockRole = { id: 'r-1', name: SystemRole.OWNER } as any;
      (prisma.role.findFirst as jest.Mock).mockResolvedValue(mockRole);

      const result = await repository.findSystemRoleByName(SystemRole.OWNER);

      expect(prisma.role.findFirst).toHaveBeenCalledWith({
        where: { name: SystemRole.OWNER, isSystem: true, organizationId: null, isDeleted: false },
      });
      expect(result).toEqual(mockRole);
    });
  });

  describe('createMember', () => {
    it('should create an organization member', async () => {
      const data = { userId: 'u-1', organizationId: 'org-1', roleId: 'role-1' };
      const createdMember = { id: 'm-1', ...data } as any;
      (prisma.organizationMember.create as jest.Mock).mockResolvedValue(createdMember);

      const result = await repository.createMember(data, 'admin-1');

      expect(prisma.organizationMember.create).toHaveBeenCalledWith({
        data: {
          userId: data.userId,
          organizationId: data.organizationId,
          roleId: data.roleId,
          createdBy: 'admin-1',
        },
      });
      expect(result).toEqual(createdMember);
    });
  });

  describe('findMembershipWithRole', () => {
    it('should find unique organization member with role', async () => {
      const mockMembership = { id: 'm-1', userId: 'u-1', organizationId: 'org-1' } as any;
      (prisma.organizationMember.findUnique as jest.Mock).mockResolvedValue(mockMembership);

      const result = await repository.findMembershipWithRole('u-1', 'org-1');

      expect(prisma.organizationMember.findUnique).toHaveBeenCalledWith({
        where: {
          userId_organizationId: { userId: 'u-1', organizationId: 'org-1' },
        },
        include: {
          role: { select: { id: true, name: true } },
        },
      });
      expect(result).toEqual(mockMembership);
    });
  });

  describe('findFirstMembershipWithRole', () => {
    it('should find first membership ordered by createdAt asc', async () => {
      const mockMembership = { id: 'm-1', userId: 'u-1' } as any;
      (prisma.organizationMember.findFirst as jest.Mock).mockResolvedValue(mockMembership);

      const result = await repository.findFirstMembershipWithRole('u-1');

      expect(prisma.organizationMember.findFirst).toHaveBeenCalledWith({
        where: { userId: 'u-1' },
        orderBy: { createdAt: 'asc' },
        include: {
          role: { select: { id: true, name: true } },
        },
      });
      expect(result).toEqual(mockMembership);
    });
  });
});
