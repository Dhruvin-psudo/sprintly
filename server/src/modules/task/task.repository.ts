import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma";
import { Prisma, Task, TaskPriority, TaskStatus } from "@prisma/client";
import { TaskQueryDto } from "./dto";

type PrismaLike = PrismaService | Prisma.TransactionClient;

export interface CreateTaskData {
    organizationId: string;
    projectId: string;
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate: Date;
    assigneeId?: string;
    createdBy: string;
}

export interface UpdateTaskData {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: Date;
    assigneeId?: string | null;
    updatedBy: string;
}

const defaultTaskSelect = {
    id: true,
    organizationId: true,
    projectId: true,
    title: true,
    description: true,
    status: true,
    priority: true,
    dueDate: true,
    assigneeId: true,
    createdBy: true,
    updatedBy: true,
    createdAt: true,
    updatedAt: true,
    project: {
        select: {
            id: true,
            name: true,
            code: true,
        },
    },
    assignee: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
        },
    },
    createdByUser: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
        },
    },
};

@Injectable()
export class TaskRepository {
    constructor(private readonly prisma: PrismaService) {}

    private client(tx?: Prisma.TransactionClient): PrismaLike {
        return tx ?? this.prisma;
    }

    async validateProjectInOrg(organizationId: string, projectId: string, tx?: Prisma.TransactionClient): Promise<boolean> {
        const db = this.client(tx);
        const project = await db.project.findFirst({
            where: {
                id: projectId,
                organizationId,
                isDeleted: false,
            },
            select: { id: true },
        });
        return project !== null;
    }

    async validateAssigneeInOrg(organizationId: string, assigneeId: string, tx?: Prisma.TransactionClient): Promise<boolean> {
        if (!assigneeId) return true;
        const db = this.client(tx);
        const member = await db.organizationMember.findFirst({
            where: {
                organizationId,
                userId: assigneeId,
            },
            select: { id: true },
        });
        return member !== null;
    }

    async create(data: CreateTaskData, tx?: Prisma.TransactionClient): Promise<Task> {
        const db = this.client(tx);
        return db.task.create({
            data: {
                organizationId: data.organizationId,
                projectId: data.projectId,
                title: data.title,
                description: data.description,
                status: data.status ?? TaskStatus.TODO,
                priority: data.priority ?? TaskPriority.MEDIUM,
                dueDate: data.dueDate,
                assigneeId: data.assigneeId,
                createdBy: data.createdBy,
            },
            select: defaultTaskSelect,
        }) as unknown as Task;
    }

    async findById(id: string, organizationId: string, projectId?: string, tx?: Prisma.TransactionClient) {
        const db = this.client(tx);
        return db.task.findFirst({
            where: {
                id,
                organizationId,
                ...(projectId ? { projectId } : {}),
                isDeleted: false,
            },
            select: defaultTaskSelect,
        });
    }

    async findMany(organizationId: string, currentUserId: string, query: TaskQueryDto, tx?: Prisma.TransactionClient) {
        const db = this.client(tx);
        const { search, status, priority, projectId, assigneeId, myTasksOnly } = query;
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        const rawOrder = query.sortOrder ?? 'desc';
        const sortDirection: Prisma.SortOrder = rawOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

        const validSortFields = ['title', 'status', 'priority', 'dueDate'];
        const sortField = validSortFields.includes(query.sortBy || '') ? query.sortBy! : 'createdAt';

        const orderBy: Prisma.TaskOrderByWithRelationInput = {
            [sortField]: sortDirection,
        };

        const targetAssigneeId = myTasksOnly ? currentUserId : assigneeId;

        const where: Prisma.TaskWhereInput = {
            organizationId,
            isDeleted: false,
            ...(projectId ? { projectId } : {}),
            ...(targetAssigneeId ? { assigneeId: targetAssigneeId } : {}),
            ...(status ? { status } : {}),
            ...(priority ? { priority } : {}),
            ...(search
                ? {
                      OR: [
                          { title: { contains: search, mode: 'insensitive' } },
                          { description: { contains: search, mode: 'insensitive' } },
                      ],
                  }
                : {}),
        };

        const [items, total] = await Promise.all([
            db.task.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                select: defaultTaskSelect,
            }),
            db.task.count({ where }),
        ]);

        return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async findAssignedTasksInOrg(organizationId: string, userId: string, query: TaskQueryDto, tx?: Prisma.TransactionClient) {
        const db = this.client(tx);
        const { search, status, priority } = query;
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        const rawOrder = query.sortOrder ?? 'desc';
        const sortDirection: Prisma.SortOrder = rawOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

        const validSortFields = ['title', 'status', 'priority', 'dueDate'];
        const sortField = validSortFields.includes(query.sortBy || '') ? query.sortBy! : 'createdAt';

        const orderBy: Prisma.TaskOrderByWithRelationInput = {
            [sortField]: sortDirection,
        };

        const where: Prisma.TaskWhereInput = {
            organizationId,
            assigneeId: userId,
            isDeleted: false,
            ...(status ? { status } : {}),
            ...(priority ? { priority } : {}),
            ...(search
                ? {
                      OR: [
                          { title: { contains: search, mode: 'insensitive' } },
                          { description: { contains: search, mode: 'insensitive' } },
                      ],
                  }
                : {}),
        };

        const [items, total] = await Promise.all([
            db.task.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                select: defaultTaskSelect,
            }),
            db.task.count({ where }),
        ]);

        return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async findTasksInUserProjects(organizationId: string, userId: string, query: TaskQueryDto, tx?: Prisma.TransactionClient) {
        const db = this.client(tx);
        const { search, status, priority } = query;
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        const rawOrder = query.sortOrder ?? 'desc';
        const sortDirection: Prisma.SortOrder = rawOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

        const validSortFields = ['title', 'status', 'priority', 'dueDate'];
        const sortField = validSortFields.includes(query.sortBy || '') ? query.sortBy! : 'createdAt';

        const orderBy: Prisma.TaskOrderByWithRelationInput = {
            [sortField]: sortDirection,
        };

        const where: Prisma.TaskWhereInput = {
            organizationId,
            isDeleted: false,
            project: {
                isDeleted: false,
                members: {
                    some: {
                        userId,
                    },
                },
            },
            ...(status ? { status } : {}),
            ...(priority ? { priority } : {}),
            ...(search
                ? {
                      OR: [
                          { title: { contains: search, mode: 'insensitive' } },
                          { description: { contains: search, mode: 'insensitive' } },
                      ],
                  }
                : {}),
        };

        const [items, total] = await Promise.all([
            db.task.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                select: defaultTaskSelect,
            }),
            db.task.count({ where }),
        ]);

        return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async update(id: string, organizationId: string, data: UpdateTaskData, tx?: Prisma.TransactionClient) {
        const db = this.client(tx);
        return db.task.update({
            where: { id },
            data: {
                ...(data.title !== undefined ? { title: data.title } : {}),
                ...(data.description !== undefined ? { description: data.description } : {}),
                ...(data.status !== undefined ? { status: data.status } : {}),
                ...(data.priority !== undefined ? { priority: data.priority } : {}),
                ...(data.dueDate !== undefined ? { dueDate: data.dueDate } : {}),
                ...(data.assigneeId !== undefined ? { assigneeId: data.assigneeId } : {}),
                updatedBy: data.updatedBy,
            },
            select: defaultTaskSelect,
        });
    }

    async softDelete(id: string, organizationId: string, deletedBy: string, tx?: Prisma.TransactionClient): Promise<void> {
        const db = this.client(tx);
        await db.task.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                deletedBy,
            },
        });
    }
}
