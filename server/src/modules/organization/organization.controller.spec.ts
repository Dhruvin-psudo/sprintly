import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
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
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(7),
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
    it('should create an organization and set refresh cookie if returned', async () => {
      const dto = { name: 'Acme Corp', email: 'org@acme.com' };
      const createdBy = { userId: 'u-123', refreshTokenId: 'rf-1', organizationId: null, roleId: null, hasOrganization: false } as any;
      const orgResult = {
        organization: { id: 'org-1', name: 'Acme Corp', slug: 'acme-corp' } as any,
        accessToken: 'access-123',
        refreshToken: 'refresh-123',
      };
      const res = { cookie: jest.fn() } as any;

      organizationService.create.mockResolvedValue(orgResult);

      const response = await controller.create(dto, createdBy, res);

      expect(organizationService.create).toHaveBeenCalledWith(dto, createdBy);
      expect(res.cookie).toHaveBeenCalled();
      expect(response.data).toEqual({
        organization: orgResult.organization,
        accessToken: 'access-123',
      });
    });
  });
});
