import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

describe('OrganizationController', () => {
  let controller: OrganizationController;
  let organizationService: jest.Mocked<OrganizationService>;

  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.cookie = jest.fn().mockReturnValue(res);
    return res as Response;
  };

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
    it('should create an organization and set refresh cookie if provided', async () => {
      const dto = { name: 'Acme Corp', email: 'org@acme.com' };
      const createdBy = { userId: 'u-123' } as any;
      const orgResult = {
        organization: { id: 'org-1', name: 'Acme Corp', slug: 'acme-corp' } as any,
        accessToken: 'access-123',
        refreshToken: 'refresh-123',
      };

      organizationService.create.mockResolvedValue(orgResult);

      const res = mockResponse();
      const response = await controller.create(dto, createdBy, res);

      expect(organizationService.create).toHaveBeenCalledWith(dto, createdBy);
      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh-123',
        expect.objectContaining({ path: '/auth' })
      );
      expect(response.data).toEqual({
        organization: orgResult.organization,
        accessToken: orgResult.accessToken,
      });
    });
  });
});
