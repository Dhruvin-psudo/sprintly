import { Injectable, Logger } from "@nestjs/common";
import { TaskRepository } from "./task.repository";
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from "./dto";
import { IAuthenticatedUser } from "../../common/interfaces";
import { TaskStatus } from "@prisma/client";
import {
    ResourceNotFoundException,
    TaskNotFoundException,
    TaskProjectMismatchException,
    TaskAssigneeNotMemberException,
    TaskAlreadyCompletedException,
    InvalidTaskDueDateException,
} from "../../common/errors";

@Injectable()
export class TaskService {
    private readonly logger = new Logger(TaskService.name);

    constructor(private readonly taskRepository: TaskRepository) {}

    private async validateProject(organizationId: string, projectId: string): Promise<void> {
        const isProjectValid = await this.taskRepository.validateProjectInOrg(organizationId, projectId);
        if (!isProjectValid) {
            this.logger.warn({ projectId, organizationId }, 'Project not found in organization');
            throw new ResourceNotFoundException('Project', projectId);
        }
    }

    private async validateAssignee(organizationId: string, assigneeId?: string): Promise<void> {
        if (!assigneeId) return;
        const isAssigneeValid = await this.taskRepository.validateAssigneeInOrg(organizationId, assigneeId);
        if (!isAssigneeValid) {
            this.logger.warn({ assigneeId, organizationId }, 'User is not an active organization member');
            throw new TaskAssigneeNotMemberException(assigneeId);
        }
    }

    async createTask(projectId: string, dto: CreateTaskDto, user: IAuthenticatedUser) {
        await this.validateProject(user.organizationId, projectId);
        await this.validateAssignee(user.organizationId, dto.assigneeId);

        const now = new Date();
        if (new Date(dto.dueDate) < now && dto.status !== TaskStatus.COMPLETED) {
            throw new InvalidTaskDueDateException('Due date cannot be in the past when creating a task.');
        }

        let targetStatus = dto.status ?? TaskStatus.TODO;
        let targetDueDate = dto.dueDate;

        if (targetStatus === TaskStatus.COMPLETED && !targetDueDate) {
            targetDueDate = now;
        }

        if (targetStatus === TaskStatus.DUE && (!targetDueDate || new Date(targetDueDate) >= now)) {
            throw new InvalidTaskDueDateException('Task status cannot be DUE unless the due date is in the past.');
        }

        const createdTask = await this.taskRepository.create({
            organizationId: user.organizationId,
            projectId,
            title: dto.title,
            description: dto.description,
            status: targetStatus,
            priority: dto.priority,
            dueDate: targetDueDate,
            assigneeId: dto.assigneeId,
            createdBy: user.userId,
        });

        this.logger.log(
            { taskId: createdTask.id, projectId, organizationId: user.organizationId, userId: user.userId },
            'Task created successfully',
        );

        return createdTask;
    }

    async getProjectTasks(projectId: string, user: IAuthenticatedUser, query: TaskQueryDto) {
        await this.validateProject(user.organizationId, projectId);

        this.logger.debug(
            { projectId, organizationId: user.organizationId, userId: user.userId, query },
            'Fetching project tasks',
        );

        return this.taskRepository.findMany(user.organizationId, user.userId, {
            ...query,
            projectId,
        });
    }

    async getTaskById(projectId: string, id: string, user: IAuthenticatedUser) {
        await this.validateProject(user.organizationId, projectId);

        const task = await this.taskRepository.findById(id, user.organizationId);
        if (!task) {
            this.logger.warn({ taskId: id, projectId, organizationId: user.organizationId }, 'Task not found');
            throw new TaskNotFoundException(id);
        }

        if (task.projectId !== projectId) {
            this.logger.warn(
                { taskId: id, expectedProjectId: projectId, actualProjectId: task.projectId },
                'Task project mismatch',
            );
            throw new TaskProjectMismatchException(id, projectId);
        }

        this.logger.debug({ taskId: id, projectId, organizationId: user.organizationId }, 'Task details fetched');
        return task;
    }

    async updateTask(projectId: string, id: string, dto: UpdateTaskDto, user: IAuthenticatedUser) {
        await this.validateProject(user.organizationId, projectId);

        const existing = await this.taskRepository.findById(id, user.organizationId);
        if (!existing) {
            this.logger.warn({ taskId: id, projectId, organizationId: user.organizationId }, 'Task to update not found');
            throw new TaskNotFoundException(id);
        }

        if (existing.projectId !== projectId) {
            this.logger.warn(
                { taskId: id, expectedProjectId: projectId, actualProjectId: existing.projectId },
                'Task project mismatch during update',
            );
            throw new TaskProjectMismatchException(id, projectId);
        }

        await this.validateAssignee(user.organizationId, dto.assigneeId);

        // 1. Completed status immutability check
        if (existing.status === TaskStatus.COMPLETED && dto.status !== undefined && dto.status !== TaskStatus.COMPLETED) {
            throw new TaskAlreadyCompletedException();
        }

        let targetStatus = dto.status ?? existing.status;
        let targetDueDate = dto.dueDate !== undefined ? dto.dueDate : existing.dueDate;
        const now = new Date();

        // 2. Auto-set due date on completion if status is changing to COMPLETED
        if (dto.status === TaskStatus.COMPLETED && existing.status !== TaskStatus.COMPLETED) {
            targetDueDate = now;
        }

        // 3. Smart Date-Change Validation:
        // Only validate `dueDate >= now` if user explicitly MODIFIED/ALTERED the dueDate field
        const isDueDateExplicitlyAltered = dto.dueDate !== undefined &&
            new Date(dto.dueDate).getTime() !== new Date(existing.dueDate).getTime();

        if (isDueDateExplicitlyAltered && targetStatus !== TaskStatus.COMPLETED) {
            if (new Date(dto.dueDate!) < now) {
                throw new InvalidTaskDueDateException('Due date cannot be set to a past date.');
            }
        }

        // 4. If status is being explicitly changed to TODO, IN_PROGRESS, or REVIEW, targetDueDate must be >= now
        if (dto.status !== undefined && ['TODO', 'IN_PROGRESS', 'REVIEW'].includes(dto.status)) {
            if (targetDueDate && new Date(targetDueDate) < now) {
                throw new InvalidTaskDueDateException('Task due date has passed. Please extend the due date to move task to To Do, In Progress, or Review.');
            }
        }

        // 5. If status is being set to DUE, targetDueDate must be < now
        if (targetStatus === TaskStatus.DUE) {
            if (!targetDueDate || new Date(targetDueDate) >= now) {
                throw new InvalidTaskDueDateException('Task status cannot be set to DUE unless the due date is in the past.');
            }
        }

        const updatedTask = await this.taskRepository.update(id, user.organizationId, {
            title: dto.title,
            description: dto.description,
            status: targetStatus,
            priority: dto.priority,
            dueDate: targetDueDate,
            assigneeId: dto.assigneeId,
            updatedBy: user.userId,
        });

        this.logger.log(
            { taskId: id, projectId, organizationId: user.organizationId, userId: user.userId },
            'Task updated successfully',
        );

        return updatedTask;
    }

    async deleteTask(projectId: string, id: string, user: IAuthenticatedUser) {
        await this.validateProject(user.organizationId, projectId);

        const existing = await this.taskRepository.findById(id, user.organizationId);
        if (!existing) {
            this.logger.warn({ taskId: id, projectId, organizationId: user.organizationId }, 'Task to delete not found');
            throw new TaskNotFoundException(id);
        }

        if (existing.projectId !== projectId) {
            this.logger.warn(
                { taskId: id, expectedProjectId: projectId, actualProjectId: existing.projectId },
                'Task project mismatch during delete',
            );
            throw new TaskProjectMismatchException(id, projectId);
        }

        await this.taskRepository.softDelete(id, user.organizationId, user.userId);

        this.logger.log(
            { taskId: id, projectId, organizationId: user.organizationId, userId: user.userId },
            'Task soft-deleted successfully',
        );
    }

    async getAssignedTasksForUser(user: IAuthenticatedUser, query: TaskQueryDto) {
        this.logger.debug(
            { organizationId: user.organizationId, userId: user.userId, query },
            'Fetching assigned tasks for user',
        );

        return this.taskRepository.findAssignedTasksInOrg(user.organizationId, user.userId, query);
    }

    async getMemberProjectsTasks(user: IAuthenticatedUser, query: TaskQueryDto) {
        this.logger.debug(
            { organizationId: user.organizationId, userId: user.userId, query },
            'Fetching tasks from user member projects',
        );

        return this.taskRepository.findTasksInUserProjects(user.organizationId, user.userId, query);
    }
}
