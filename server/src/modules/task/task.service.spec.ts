import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { TaskRepository } from './task.repository';
import {
  ResourceNotFoundException,
  TaskNotFoundException,
  TaskProjectMismatchException,
  TaskAssigneeNotMemberException,
} from '../../common/errors';
import { IAuthenticatedUser } from '../../common/interfaces';
import { TaskPriority, TaskStatus } from '@prisma/client';

describe('TaskService', () => {
  let service: TaskService;
  let taskRepository: jest.Mocked<TaskRepository>;

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
        TaskService,
        {
          provide: TaskRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findMany: jest.fn(),
            findAssignedTasksInOrg: jest.fn(),
            findTasksInUserProjects: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            validateProjectInOrg: jest.fn(),
            validateAssigneeInOrg: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    taskRepository = module.get(TaskRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      taskRepository.validateProjectInOrg.mockResolvedValue(true);
      taskRepository.validateAssigneeInOrg.mockResolvedValue(true);
      const mockCreatedTask = { id: 'task-1', title: 'Fix bug' } as any;
      taskRepository.create.mockResolvedValue(mockCreatedTask);

      const dto = {
        title: 'Fix bug',
        description: 'Detail bug description',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        dueDate: new Date(Date.now() + 86400000),
        assigneeId: 'user-456',
      };

      const result = await service.createTask('proj-123', dto, mockUser);

      expect(taskRepository.validateProjectInOrg).toHaveBeenCalledWith(mockUser.organizationId, 'proj-123');
      expect(taskRepository.validateAssigneeInOrg).toHaveBeenCalledWith(mockUser.organizationId, 'user-456');
      expect(result).toEqual(mockCreatedTask);
    });

    it('should throw ResourceNotFoundException if project is invalid', async () => {
      taskRepository.validateProjectInOrg.mockResolvedValue(false);

      const dto = { title: 'Fix bug', dueDate: new Date(Date.now() + 86400000) };

      await expect(service.createTask('invalid-proj', dto, mockUser)).rejects.toThrow(ResourceNotFoundException);
    });

    it('should throw TaskAssigneeNotMemberException if assignee is not an org member', async () => {
      taskRepository.validateProjectInOrg.mockResolvedValue(true);
      taskRepository.validateAssigneeInOrg.mockResolvedValue(false);

      const dto = {
        title: 'Fix bug',
        dueDate: new Date(Date.now() + 86400000),
        assigneeId: 'invalid-user',
      };

      await expect(service.createTask('proj-123', dto, mockUser)).rejects.toThrow(TaskAssigneeNotMemberException);
    });
  });

  describe('getProjectTasks', () => {
    it('should return tasks for a specific project', async () => {
      taskRepository.validateProjectInOrg.mockResolvedValue(true);
      const mockList = { items: [], total: 0, page: 1, limit: 10, totalPages: 0 };
      taskRepository.findMany.mockResolvedValue(mockList);

      const query = { page: 1, limit: 10 };
      const result = await service.getProjectTasks('proj-123', mockUser, query);

      expect(taskRepository.findMany).toHaveBeenCalledWith(mockUser.organizationId, mockUser.userId, {
        ...query,
        projectId: 'proj-123',
      });
      expect(result).toEqual(mockList);
    });

    it('should throw ResourceNotFoundException if project is invalid', async () => {
      taskRepository.validateProjectInOrg.mockResolvedValue(false);

      const query = { page: 1, limit: 10 };
      await expect(service.getProjectTasks('invalid-proj', mockUser, query)).rejects.toThrow(ResourceNotFoundException);
    });
  });

  describe('getTaskById', () => {
    it('should return task if found and matches project', async () => {
      taskRepository.validateProjectInOrg.mockResolvedValue(true);
      const mockTask = { id: 'task-1', projectId: 'proj-123', title: 'Fix bug' } as any;
      taskRepository.findById.mockResolvedValue(mockTask);

      const result = await service.getTaskById('proj-123', 'task-1', mockUser);
      expect(result).toEqual(mockTask);
    });

    it('should throw TaskNotFoundException if task not found', async () => {
      taskRepository.validateProjectInOrg.mockResolvedValue(true);
      taskRepository.findById.mockResolvedValue(null);

      await expect(service.getTaskById('proj-123', 'task-999', mockUser)).rejects.toThrow(TaskNotFoundException);
    });

    it('should throw TaskProjectMismatchException if task belongs to a different project', async () => {
      taskRepository.validateProjectInOrg.mockResolvedValue(true);
      const mockTask = { id: 'task-1', projectId: 'other-proj', title: 'Fix bug' } as any;
      taskRepository.findById.mockResolvedValue(mockTask);

      await expect(service.getTaskById('proj-123', 'task-1', mockUser)).rejects.toThrow(TaskProjectMismatchException);
    });
  });

  describe('updateTask', () => {
    it('should update task successfully', async () => {
      taskRepository.validateProjectInOrg.mockResolvedValue(true);
      taskRepository.findById.mockResolvedValue({ id: 'task-1', projectId: 'proj-123' } as any);
      taskRepository.validateAssigneeInOrg.mockResolvedValue(true);
      const mockUpdated = { id: 'task-1', title: 'Updated title' } as any;
      taskRepository.update.mockResolvedValue(mockUpdated);

      const dto = { title: 'Updated title', assigneeId: 'user-456' };
      const result = await service.updateTask('proj-123', 'task-1', dto, mockUser);

      expect(result).toEqual(mockUpdated);
    });

    it('should throw TaskNotFoundException if task to update does not exist', async () => {
      taskRepository.validateProjectInOrg.mockResolvedValue(true);
      taskRepository.findById.mockResolvedValue(null);

      await expect(service.updateTask('proj-123', 'task-99', { title: 'New' }, mockUser)).rejects.toThrow(TaskNotFoundException);
    });
  });

  describe('deleteTask', () => {
    it('should soft delete task', async () => {
      taskRepository.validateProjectInOrg.mockResolvedValue(true);
      taskRepository.findById.mockResolvedValue({ id: 'task-1', projectId: 'proj-123' } as any);
      taskRepository.softDelete.mockResolvedValue(undefined);

      await service.deleteTask('proj-123', 'task-1', mockUser);

      expect(taskRepository.softDelete).toHaveBeenCalledWith('task-1', mockUser.organizationId, mockUser.userId);
    });

    it('should throw TaskNotFoundException if task to delete does not exist', async () => {
      taskRepository.validateProjectInOrg.mockResolvedValue(true);
      taskRepository.findById.mockResolvedValue(null);

      await expect(service.deleteTask('proj-123', 'task-99', mockUser)).rejects.toThrow(TaskNotFoundException);
    });
  });

  describe('getAssignedTasksForUser', () => {
    it('should fetch assigned tasks in org', async () => {
      const mockList = { items: [], total: 0, page: 1, limit: 10, totalPages: 0 };
      taskRepository.findAssignedTasksInOrg.mockResolvedValue(mockList);

      const query = { page: 1, limit: 10 };
      const result = await service.getAssignedTasksForUser(mockUser, query);

      expect(taskRepository.findAssignedTasksInOrg).toHaveBeenCalledWith(mockUser.organizationId, mockUser.userId, query);
      expect(result).toEqual(mockList);
    });
  });

  describe('getMemberProjectsTasks', () => {
    it('should fetch tasks in user projects', async () => {
      const mockList = { items: [], total: 0, page: 1, limit: 10, totalPages: 0 };
      taskRepository.findTasksInUserProjects.mockResolvedValue(mockList);

      const query = { page: 1, limit: 10 };
      const result = await service.getMemberProjectsTasks(mockUser, query);

      expect(taskRepository.findTasksInUserProjects).toHaveBeenCalledWith(mockUser.organizationId, mockUser.userId, query);
      expect(result).toEqual(mockList);
    });
  });
});
