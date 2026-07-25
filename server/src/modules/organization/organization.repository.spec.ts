import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationRepository } from './organization.repository';
import { PrismaService } from '../../prisma';

describe('OrganizationRepository', () => {
  let repository: OrganizationRepository;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationRepository,
        {
          provide: PrismaService,
          useValue: {
            organization: {
              create: jest.fn(),
              findFirst: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<OrganizationRepository>(OrganizationRepository);
    prisma = module.get(PrismaService) as any;
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create an organization record', async () => {
      const data = {
        name: 'Sprintly',
        slug: 'sprintly',
        email: 'org@sprintly.com',
        createdBy: 'user-1',
      };
      const createdOrg = { id: 'org-1', ...data } as any;

      (prisma.organization.create as jest.Mock).mockResolvedValue(createdOrg);

      const result = await repository.create(data);

      expect(prisma.organization.create).toHaveBeenCalledWith({
        data: {
          name: data.name,
          slug: data.slug,
          email: data.email,
          createdBy: data.createdBy,
        },
      });
      expect(result).toEqual(createdOrg);
    });
  });

  describe('isSlugTaken', () => {
    it('should return true if organization with slug exists', async () => {
      (prisma.organization.findFirst as jest.Mock).mockResolvedValue({ id: 'org-1' });

      const result = await repository.isSlugTaken('sprintly');

      expect(prisma.organization.findFirst).toHaveBeenCalledWith({
        where: { slug: 'sprintly', isDeleted: false },
        select: { id: true },
      });
      expect(result).toBe(true);
    });

    it('should return false if slug is available', async () => {
      (prisma.organization.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await repository.isSlugTaken('available-slug');

      expect(result).toBe(false);
    });
  });
});
