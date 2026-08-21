import { Injectable, Logger } from '@nestjs/common';
import {
    DashboardRepository,
    UpcomingDeadlineResult,
    ProjectCompletionResult,
} from './dashboard.repository';
import { IAuthenticatedUser } from '../../common/interfaces';

export interface ProductivityDayResponse {
    day: string;
    created: number;
    completed: number;
}

export interface DashboardStatsResponse {
    stats: {
        totalProjects: { value: number; trend: string };
        pendingProjects: { value: number; trend: string };
        completedProjects: { value: number; trend: string };
        projectVelocity: { value: number; trend: string };
    };
    deadlines: UpcomingDeadlineResult[];
    completion: ProjectCompletionResult[];
}

@Injectable()
export class DashboardService {
    private readonly logger = new Logger(DashboardService.name);

    constructor(private readonly dashboardRepository: DashboardRepository) {}

    async getProductivityData(user: IAuthenticatedUser, days: number = 7): Promise<ProductivityDayResponse[]> {
        this.logger.debug(
            { organizationId: user.organizationId, userId: user.userId, days },
            'Fetching productivity data for user organization',
        );

        const rawData = await this.dashboardRepository.getProductivityData(user.organizationId, days);

        return rawData.map((item) => ({
            day: item.dayLabel,
            created: item.createdCount,
            completed: item.completedCount,
        }));
    }

    async getDashboardStats(user: IAuthenticatedUser): Promise<DashboardStatsResponse> {
        this.logger.debug(
            { organizationId: user.organizationId, userId: user.userId },
            'Fetching dashboard stats for user organization',
        );

        const [statsResult, deadlines, completion] = await Promise.all([
            this.dashboardRepository.getProjectStats(user.organizationId),
            this.dashboardRepository.getUpcomingDeadlines(user.organizationId),
            this.dashboardRepository.getCompletionByProject(user.organizationId),
        ]);

        return {
            stats: {
                totalProjects: {
                    value: statsResult.totalProjects,
                    trend: `${statsResult.totalProjects} total in workspace`,
                },
                pendingProjects: {
                    value: statsResult.pendingProjects,
                    trend: `${statsResult.pendingProjects} active / planning`,
                },
                completedProjects: {
                    value: statsResult.completedProjects,
                    trend: `${statsResult.completedProjects} delivered`,
                },
                projectVelocity: {
                    value: statsResult.projectVelocity,
                    trend: '% completed rate',
                },
            },
            deadlines,
            completion,
        };
    }
}

