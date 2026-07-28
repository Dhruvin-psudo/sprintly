import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationService } from './organization.service';
import { OrganizationRepository } from './organization.repository';
import { UserService } from '../user/user.service';
import { RoleService } from '../role/role.service';
import { TokenService } from '../token/token.service';
import { SystemRole } from '../../common/constants';
import { ConflictException } from '@nestjs/common';

describe('OrganizationService', () => {
  let service: OrganizationService;
  let organizationRepository: jest.Mocked<OrganizationRepository>;
  let userService: jest.Mocked<UserService>;
  let roleService: jest.Mocked<RoleService>;
  let tokenService: jest.Mocked<TokenService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationService,
        {
          provide: OrganizationRepository,
          useValue: {
            create: jest.fn(),
            isSlugTaken: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            updateLastActiveOrg: jest.fn(),
          },
        },
        {
          provide: RoleService,
          useValue: {
            assignRole: jest.fn(),
          },
        },
        {
          provide: TokenService,
          useValue: {
            issueAuthTokens: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrganizationService>(OrganizationService);
    organizationRepository = module.get(OrganizationRepository);
    userService = module.get(UserService);
    roleService = module.get(RoleService);
    tokenService = module.get(TokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should generate a unique slug, create organization, assign owner role, and issue auth tokens', async () => {
      const dto = { name: 'Acme Corp', email: 'info@acme.com' };
      const createdBy = { userId: 'u-100' } as any;
      const createdOrg = { id: 'org-1', name: 'Acme Corp', slug: 'acme-corp' } as any;
      const assignedMember = { roleId: 'role-owner' } as any;
      const tokens = { accessToken: 'acc-token', refreshToken: 'ref-token' };

      organizationRepository.isSlugTaken.mockResolvedValue(false);
      organizationRepository.create.mockResolvedValue(createdOrg);
      roleService.assignRole.mockResolvedValue(assignedMember);
      tokenService.issueAuthTokens.mockResolvedValue(tokens);

      const result = await service.create(dto, createdBy);

      expect(organizationRepository.isSlugTaken).toHaveBeenCalledWith('acme-corp');
      expect(organizationRepository.create).toHaveBeenCalledWith({
        name: 'Acme Corp',
        email: 'info@acme.com',
        slug: 'acme-corp',
        createdBy: 'u-100',
      });
      expect(roleService.assignRole).toHaveBeenCalledWith(
        SystemRole.OWNER,
        'u-100',
        'org-1',
        'u-100'
      );
      expect(userService.updateLastActiveOrg).toHaveBeenCalledWith('u-100', 'org-1');
      expect(tokenService.issueAuthTokens).toHaveBeenCalledWith('u-100', {
        organizationId: 'org-1',
        roleId: 'role-owner',
      });
      expect(result).toEqual({
        organization: createdOrg,
        accessToken: 'acc-token',
        refreshToken: 'ref-token',
      });
    });

    it('should throw ConflictException if unique slug cannot be generated after max attempts', async () => {
      organizationRepository.isSlugTaken.mockResolvedValue(true);

      await expect(
        service.create({ name: 'Taken Org' }, { userId: 'u-1' } as any)
      ).rejects.toThrow(ConflictException);
    });
  });
});
