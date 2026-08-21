import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma";
import { TaskStatus, ProjectPhase } from "@prisma/client";

export interface RawProductivityDay {
    date: Date;
    dayLabel: string;
    createdCount: number;
    completedCount: number;
}

export interface ProjectStatsResult {
    totalProjects: number;
    pendingProjects: number;
    completedProjects: number;
    projectVelocity: number;
}

export interface UpcomingDeadlineResult {
    title: string;
    project: string;
    date: string;
    priority: string;
}

export interface ProjectCompletionResult {
    name: string;
    done: number;
    remaining: number;
}

@Injectable()
export class DashboardRepository {
    constructor(private readonly prisma: PrismaService) {}

    async getProductivityData(organizationId: string, days: number = 7): Promise<RawProductivityDay[]> {
        const results: RawProductivityDay[] = [];
        const now = new Date();

        // Calculate each day starting from (days - 1) ago up to today
        for (let i = days - 1; i >= 0; i--) {
            const startOfDay = new Date(now);
            startOfDay.setDate(now.getDate() - i);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(now);
            endOfDay.setDate(now.getDate() - i);
            endOfDay.setHours(23, 59, 59, 999);

            const dayLabel = startOfDay.toLocaleDateString('en-US', { weekday: 'short' });

            const [createdCount, completedCount] = await Promise.all([
                this.prisma.task.count({
                    where: {
                        organizationId,
                        isDeleted: false,
                        createdAt: {
                            gte: startOfDay,
                            lte: endOfDay,
                        },
                    },
                }),
                this.prisma.task.count({
                    where: {
                        organizationId,
                        isDeleted: false,
                        status: TaskStatus.COMPLETED,
                        updatedAt: {
                            gte: startOfDay,
                            lte: endOfDay,
                        },
                    },
                }),
            ]);

            results.push({
                date: startOfDay,
                dayLabel,
                createdCount,
                completedCount,
            });
        }

        return results;
    }

    async getProjectStats(organizationId: string): Promise<ProjectStatsResult> {
        const [totalProjects, pendingProjects, completedProjects] = await Promise.all([
            this.prisma.project.count({
                where: { organizationId, isDeleted: false },
            }),
            this.prisma.project.count({
                where: {
                    organizationId,
                    isDeleted: false,
                    phase: { in: [ProjectPhase.PLANNING, ProjectPhase.ACTIVE, ProjectPhase.ON_HOLD] },
                },
            }),
            this.prisma.project.count({
                where: {
                    organizationId,
                    isDeleted: false,
                    phase: ProjectPhase.COMPLETED,
                },
            }),
        ]);

        const projectVelocity = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

        return {
            totalProjects,
            pendingProjects,
            completedProjects,
            projectVelocity,
        };
    }

    async getUpcomingDeadlines(organizationId: string): Promise<UpcomingDeadlineResult[]> {
        const now = new Date();
        const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const tasks = await this.prisma.task.findMany({
            where: {
                organizationId,
                isDeleted: false,
                status: { not: TaskStatus.COMPLETED },
                dueDate: { gte: now, lte: sevenDaysLater },
            },
            include: {
                project: {
                    select: { code: true, name: true },
                },
            },
            orderBy: {
                dueDate: 'asc',
            },
            take: 10,
        });

        // Map tasks or fallback to upcoming tasks if 0 upcoming tasks in 7 days
        let deadlineTasks = tasks;
        if (deadlineTasks.length === 0) {
            deadlineTasks = await this.prisma.task.findMany({
                where: {
                    organizationId,
                    isDeleted: false,
                    status: { not: TaskStatus.COMPLETED },
                },
                include: {
                    project: {
                        select: { code: true, name: true },
                    },
                },
                orderBy: {
                    dueDate: 'asc',
                },
                take: 5,
            });
        }

        return deadlineTasks.map((t) => {
            const formattedDate = t.dueDate
                ? new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
                : 'No date';
            const priorityLabel =
                t.priority.charAt(0).toUpperCase() + t.priority.slice(1).toLowerCase();

            return {
                title: t.title,
                project: t.project?.code || t.project?.name || 'PRJ',
                date: formattedDate,
                priority: priorityLabel,
            };
        });
    }

    async getCompletionByProject(organizationId: string): Promise<ProjectCompletionResult[]> {
        const projects = await this.prisma.project.findMany({
            where: {
                organizationId,
                isDeleted: false,
            },
            select: {
                id: true,
                code: true,
                name: true,
            },
            take: 5,
        });

        const results: ProjectCompletionResult[] = [];

        for (const project of projects) {
            const [done, remaining] = await Promise.all([
                this.prisma.task.count({
                    where: {
                        projectId: project.id,
                        isDeleted: false,
                        status: TaskStatus.COMPLETED,
                    },
                }),
                this.prisma.task.count({
                    where: {
                        projectId: project.id,
                        isDeleted: false,
                        status: { not: TaskStatus.COMPLETED },
                    },
                }),
            ]);

            results.push({
                name: project.code || project.name,
                done,
                remaining,
            });
        }

        return results;
    }
}

