import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from './role.service';
import { RoleRepository } from './role.repository';
import { SystemRole } from '../../common/constants';
import { NotFoundException } from '@nestjs/common';

describe('RoleService', () => {
  let service: RoleService;
  let roleRepository: jest.Mocked<RoleRepository>;

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
          },
        },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
    roleRepository = module.get(RoleRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSystemRole', () => {
    it('should return role if found', async () => {
      const mockRole = { id: 'r-1', name: SystemRole.OWNER } as any;
      roleRepository.findSystemRoleByName.mockResolvedValue(mockRole);

      const result = await service.getSystemRole(SystemRole.OWNER);

      expect(roleRepository.findSystemRoleByName).toHaveBeenCalledWith(SystemRole.OWNER);
      expect(result).toEqual(mockRole);
    });

    it('should throw NotFoundException if system role is not found', async () => {
      roleRepository.findSystemRoleByName.mockResolvedValue(null);

      await expect(service.getSystemRole(SystemRole.OWNER)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('assignRole', () => {
    it('should fetch system role and create member', async () => {
      const mockRole = { id: 'r-owner', name: SystemRole.OWNER } as any;
      const mockMember = { id: 'm-1', userId: 'u-1', organizationId: 'org-1' } as any;

      roleRepository.findSystemRoleByName.mockResolvedValue(mockRole);
      roleRepository.createMember.mockResolvedValue(mockMember);

      const result = await service.assignRole(SystemRole.OWNER, 'u-1', 'org-1', 'assigned-by');

      expect(roleRepository.createMember).toHaveBeenCalledWith(
        { userId: 'u-1', organizationId: 'org-1', roleId: 'r-owner' },
        'assigned-by'
      );
      expect(result).toEqual(mockMember);
    });
  });

  describe('getMembershipWithRole', () => {
    it('should return membership with role', async () => {
      const mockMembership = { id: 'm-1', userId: 'u-1', organizationId: 'org-1' } as any;
      roleRepository.findMembershipWithRole.mockResolvedValue(mockMembership);

      const result = await service.getMembershipWithRole('u-1', 'org-1');

      expect(roleRepository.findMembershipWithRole).toHaveBeenCalledWith('u-1', 'org-1');
      expect(result).toEqual(mockMembership);
    });
  });

  describe('getFirstMembershipWithRole', () => {
    it('should return first membership with role', async () => {
      const mockMembership = { id: 'm-1', userId: 'u-1' } as any;
      roleRepository.findFirstMembershipWithRole.mockResolvedValue(mockMembership);

      const result = await service.getFirstMembershipWithRole('u-1');

      expect(roleRepository.findFirstMembershipWithRole).toHaveBeenCalledWith('u-1');
      expect(result).toEqual(mockMembership);
    });
  });
});
