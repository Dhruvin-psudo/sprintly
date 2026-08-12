import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project.service';
import { ProjectRepository } from './project.repository';
import { DuplicateResourceException, ResourceNotFoundException, ValidationFailedException } from '../../common/errors';
import { IAuthenticatedUser } from '../../common/interfaces';
import { ProjectPhase, ProjectPriority } from '@prisma/client';

describe('ProjectService', () => {
  let service: ProjectService;
  let projectRepository: jest.Mocked<ProjectRepository>;

  const mockUser: IAuthenticatedUser = {
    userId: 'user-123',
    organizationId: 'org-123',
    roleId: 'role-123',
    refreshTokenId: 'token-123',
    hasOrganization: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        {
          provide: ProjectRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            addMembers: jest.fn(),
            removeMember: jest.fn(),
            isNameTakenInOrg: jest.fn(),
            isCodeTakenInOrg: jest.fn(),
            validateOrgMembers: jest.fn(),
            validateProjectLead: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
    projectRepository = module.get(ProjectRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProject', () => {
    it('should create a project successfully', async () => {
      projectRepository.validateProjectLead.mockResolvedValue(true);
      projectRepository.validateOrgMembers.mockResolvedValue(true);
      projectRepository.isNameTakenInOrg.mockResolvedValue(false);
      projectRepository.isCodeTakenInOrg.mockResolvedValue(false);
      const mockCreatedProject = { id: 'proj-1', name: 'Sprintly V1' } as any;
      projectRepository.create.mockResolvedValue(mockCreatedProject);

      const dto = {
        name: 'Sprintly V1',
        description: 'First version',
        leadId: 'user-123',
        phase: ProjectPhase.PLANNING,
        priority: ProjectPriority.HIGH,
      };

      const result = await service.createProject(dto, mockUser);

      expect(projectRepository.validateProjectLead).toHaveBeenCalledWith(mockUser.organizationId, 'user-123');
      expect(projectRepository.isNameTakenInOrg).toHaveBeenCalledWith(mockUser.organizationId, 'Sprintly V1');
      expect(result).toEqual(mockCreatedProject);
    });

    it('should throw ValidationFailedException if lead is not an org member', async () => {
      projectRepository.validateProjectLead.mockResolvedValue(false);

      const dto = {
        name: 'Sprintly V1',
        leadId: 'invalid-user',
      };

      await expect(service.createProject(dto, mockUser)).rejects.toThrow(ValidationFailedException);
    });

    it('should throw DuplicateResourceException if project name is taken in org', async () => {
      projectRepository.validateProjectLead.mockResolvedValue(true);
      projectRepository.validateOrgMembers.mockResolvedValue(true);
      projectRepository.isNameTakenInOrg.mockResolvedValue(true);

      const dto = {
        name: 'Sprintly V1',
        leadId: 'user-123',
      };

      await expect(service.createProject(dto, mockUser)).rejects.toThrow(DuplicateResourceException);
    });
  });

  describe('getProjectById', () => {
    it('should return project if found', async () => {
      const mockProject = { id: 'proj-1', name: 'Sprintly V1' } as any;
      projectRepository.findById.mockResolvedValue(mockProject);

      const result = await service.getProjectById('proj-1', mockUser);
      expect(result).toEqual(mockProject);
    });

    it('should throw ResourceNotFoundException if project not found', async () => {
      projectRepository.findById.mockResolvedValue(null);

      await expect(service.getProjectById('proj-99', mockUser)).rejects.toThrow(ResourceNotFoundException);
    });
  });

  describe('deleteProject', () => {
    it('should soft delete project', async () => {
      projectRepository.findById.mockResolvedValue({ id: 'proj-1' } as any);
      projectRepository.softDelete.mockResolvedValue(undefined);

      await service.deleteProject('proj-1', mockUser);

      expect(projectRepository.softDelete).toHaveBeenCalledWith('proj-1', mockUser.organizationId, mockUser.userId);
    });
  });
});
