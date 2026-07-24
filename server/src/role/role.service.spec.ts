import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from './role.service';
import { RoleRepository } from './role.repository';

describe('RoleService', () => {
  let service: RoleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: RoleRepository,
          useValue: {
            findSystemRoleByName: jest.fn(),
            createMember: jest.fn(),
            findMembershipWithRole: jest.fn(),
            findFirstMembershipWithRole: jest.fn(),
            findUserPermissions: jest.fn(),
            ensureSystemRolesAndPermissionsExist: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
