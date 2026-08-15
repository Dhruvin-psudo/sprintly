import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma";
import { Project, ProjectMember, Prisma, ProjectPhase, ProjectPriority } from "@prisma/client";
import { ProjectQueryDto } from "./dto";
import { SystemRole } from "../../common/constants";

type PrismaLike = PrismaService | Prisma.TransactionClient;

export interface FindProjectsOptions {
    organizationId: string;
    userId: string;
    roleName: string;
    query: ProjectQueryDto;
}

export interface CreateProjectData {
    organizationId: string;
    name: string;
    code: string;
    description?: string;
    phase?: ProjectPhase;
    priority?: ProjectPriority;
    startDate?: Date;
    dueDate?: Date;
    leadId: string;
    createdBy: string;
    memberIds?: string[];
}

export interface UpdateProjectData {
    name?: string;
    code?: string;
    description?: string;
    phase?: ProjectPhase;
    priority?: ProjectPriority;
    startDate?: Date;
    dueDate?: Date;
    leadId?: string;
    updatedBy: string;
}

@Injectable()
export class ProjectRepository {
    constructor(private readonly prisma: PrismaService) {}

    private client(tx?: Prisma.TransactionClient): PrismaLike {
        return tx ?? this.prisma;
    }

    async isNameTakenInOrg(organizationId: string, name: string, excludeProjectId?: string, tx?: Prisma.TransactionClient): Promise<boolean> {
        const db = this.client(tx);
        const project = await db.project.findFirst({
            where: {
                organizationId,
                name: { equals: name, mode: 'insensitive' },
                isDeleted: false,
                ...(excludeProjectId ? { id: { not: excludeProjectId } } : {})
            },
            select: { id: true }
        });
        return project !== null;
    }

    async isCodeTakenInOrg(organizationId: string, code: string, excludeProjectId?: string, tx?: Prisma.TransactionClient): Promise<boolean> {
        if (!code) return false;
        const db = this.client(tx);
        const project = await db.project.findFirst({
            where: {
                organizationId,
                code: { equals: code.toUpperCase(), mode: 'insensitive' },
                isDeleted: false,
                ...(excludeProjectId ? { id: { not: excludeProjectId } } : {})
            },
            select: { id: true }
        });
        return project !== null;
    }

    async validateOrgMembers(organizationId: string, userIds: string[], tx?: Prisma.TransactionClient): Promise<boolean> {
        if (!userIds || userIds.length === 0) return true;
        const db = this.client(tx);
        const count = await db.organizationMember.count({
            where: {
                organizationId,
                userId: { in: userIds }
            }
        });
        return count === new Set(userIds).size;
    }

    async validateProjectLead(organizationId: string, leadId: string, tx?: Prisma.TransactionClient): Promise<boolean> {
        if (!leadId) return false;
        const db = this.client(tx);
        const member = await db.organizationMember.findFirst({
            where: {
                organizationId,
                userId: leadId
            },
            include: {
                role: true
            }
        });
        if (!member || !member.role) return false;
        const roleName = member.role.name.toUpperCase();
        return roleName === 'OWNER' || roleName === 'ADMIN';
    }

    async create(data: CreateProjectData, tx?: Prisma.TransactionClient): Promise<Project> {
        const db = this.client(tx);
        const memberUserIds = Array.from(new Set([data.leadId, ...(data.memberIds || [])]));

        return db.project.create({
            data: {
                organizationId: data.organizationId,
                name: data.name,
                code: data.code.toUpperCase(),
                description: data.description,
                phase: data.phase ?? ProjectPhase.PLANNING,
                priority: data.priority ?? ProjectPriority.MEDIUM,
                startDate: data.startDate,
                dueDate: data.dueDate,
                leadId: data.leadId,
                createdBy: data.createdBy,
                members: {
                    create: memberUserIds.map((userId) => ({
                        userId,
                        createdBy: data.createdBy
                    }))
                }
            },
            include: {
                leadUser: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                },
                members: {
                    include: {
                        user: { select: { id: true, firstName: true, lastName: true, email: true } }
                    }
                }
            }
        });
    }

    async findById(id: string, organizationId: string, tx?: Prisma.TransactionClient) {
        const db = this.client(tx);
        return db.project.findFirst({
            where: {
                id,
                organizationId,
                isDeleted: false
            },
            include: {
                leadUser: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                },
                members: {
                    include: {
                        user: { select: { id: true, firstName: true, lastName: true, email: true } }
                    }
                },
                _count: {
                    select: { members: true }
                }
            }
        });
    }

    async findMany(options: FindProjectsOptions, tx?: Prisma.TransactionClient) {
        const db = this.client(tx);
        const { organizationId, userId, roleName, query } = options;
        const { search, phase, priority } = query;
        const page = Number(query.page) || 1;
        const limit = 6;
        const skip = (page - 1) * limit;

        const rawOrder = query.sortOrder ?? 'desc';
        const sortDirection: Prisma.SortOrder = rawOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

        const validSortFields = ['phase', 'priority', 'dueDate', 'startDate'];
        const sortField = validSortFields.includes(query.sortBy || '') ? query.sortBy! : 'createdAt';

        const orderBy: Prisma.ProjectOrderByWithRelationInput = {
            [sortField]: sortDirection
        };

        const isElevatedRole = roleName.toUpperCase() === SystemRole.OWNER || roleName.toUpperCase() === SystemRole.ADMIN;

        const AND: Prisma.ProjectWhereInput[] = [
            { organizationId },
            { isDeleted: false }
        ];

        if (!isElevatedRole) {
            AND.push({
                OR: [
                    { leadId: userId },
                    { members: { some: { userId } } }
                ]
            });
        }

        if (phase) {
            AND.push({ phase });
        }

        if (priority) {
            AND.push({ priority });
        }

        if (search) {
            AND.push({
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ]
            });
        }

        const where: Prisma.ProjectWhereInput = { AND };

        const [items, total] = await Promise.all([
            db.project.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    leadUser: {
                        select: { id: true, firstName: true, lastName: true, email: true }
                    },
                    _count: {
                        select: { members: true }
                    }
                }
            }),
            db.project.count({ where })
        ]);

        return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }


    async update(id: string, organizationId: string, data: UpdateProjectData, tx?: Prisma.TransactionClient): Promise<Project> {
        const db = this.client(tx);
        return db.project.update({
            where: { id },
            data: {
                ...(data.name !== undefined ? { name: data.name } : {}),
                ...(data.description !== undefined ? { description: data.description } : {}),
                ...(data.phase !== undefined ? { phase: data.phase } : {}),
                ...(data.priority !== undefined ? { priority: data.priority } : {}),
                ...(data.startDate !== undefined ? { startDate: data.startDate } : {}),
                ...(data.dueDate !== undefined ? { dueDate: data.dueDate } : {}),
                ...(data.leadId !== undefined ? { leadId: data.leadId } : {}),
                updatedBy: data.updatedBy
            },
            include: {
                leadUser: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                },
                members: {
                    include: {
                        user: { select: { id: true, firstName: true, lastName: true, email: true } }
                    }
                }
            }
        });
    }

    async softDelete(id: string, organizationId: string, deletedBy: string, tx?: Prisma.TransactionClient): Promise<void> {
        const db = this.client(tx);
        await db.project.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                deletedBy
            }
        });
    }

    async addMembers(projectId: string, userIds: string[], createdBy: string, tx?: Prisma.TransactionClient): Promise<void> {
        const db = this.client(tx);
        await db.projectMember.createMany({
            data: userIds.map((userId) => ({
                projectId,
                userId,
                createdBy
            })),
            skipDuplicates: true
        });
    }

    async removeMember(projectId: string, userId: string, tx?: Prisma.TransactionClient): Promise<void> {
        const db = this.client(tx);
        await db.projectMember.deleteMany({
            where: {
                projectId,
                userId
            }
        });
    }
}
