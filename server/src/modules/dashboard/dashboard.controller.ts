import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ProductivityQueryDto } from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { IAuthenticatedUser } from '../../common/interfaces';
import { ApiResponse } from '../../common/dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '../../common/constants';

@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get('productivity')
    @RequirePermissions(Permission.TASK_READ)
    async getProductivityData(
        @Query() query: ProductivityQueryDto,
        @CurrentUser() user: IAuthenticatedUser,
    ) {
        const data = await this.dashboardService.getProductivityData(user, query.days);
        return ApiResponse.ok(data, 'Productivity data fetched successfully');
    }

    @Get('stats')
    @RequirePermissions(Permission.PROJECT_READ)
    async getDashboardStats(
        @CurrentUser() user: IAuthenticatedUser,
    ) {
        const data = await this.dashboardService.getDashboardStats(user);
        return ApiResponse.ok(data, 'Dashboard stats fetched successfully');
    }
}

