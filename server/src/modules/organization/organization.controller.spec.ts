import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';

describe('OrganizationController', () => {
  let controller: OrganizationController;
  let organizationService: jest.Mocked<OrganizationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationController],
      providers: [
        {
          provide: OrganizationService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OrganizationController>(OrganizationController);
    organizationService = module.get(OrganizationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an organization', async () => {
      const dto = { name: 'Acme Corp', email: 'org@acme.com' };
      const createdBy = { userId: 'u-123', refreshTokenId: 'rf-1', organizationId: null, roleId: null, isCompletedOnboarding: false } as any;
      const orgResult = {
        organization: { id: 'org-1', name: 'Acme Corp', slug: 'acme-corp' } as any,
      };

      organizationService.create.mockResolvedValue(orgResult);

      const response = await controller.create(dto, createdBy);

      expect(organizationService.create).toHaveBeenCalledWith(dto, createdBy);
      expect(response.data).toEqual({
        organization: orgResult.organization,
      });
    });
  });
});
