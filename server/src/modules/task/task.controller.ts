import { Controller, Get, Query } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskQueryDto } from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { IAuthenticatedUser } from '../../common/interfaces';
import { ApiResponse } from '../../common/dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '../../common/constants';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get('assigned-me')
  @RequirePermissions(Permission.TASK_READ)
  async getAssignedTasksForUser(
    @Query() query: TaskQueryDto,
    @CurrentUser() user: IAuthenticatedUser,
  ) {
    const { items, total, page, limit, totalPages } = await this.taskService.getAssignedTasksForUser(user, query);
    return ApiResponse.paginated(
      items,
      { page, limit, total, totalPages },
      'User assigned tasks fetched successfully',
    );
  }

  @Get('my-projects')
  @RequirePermissions(Permission.TASK_READ)
  async getMemberProjectsTasks(
    @Query() query: TaskQueryDto,
    @CurrentUser() user: IAuthenticatedUser,
  ) {
    const { items, total, page, limit, totalPages } = await this.taskService.getMemberProjectsTasks(user, query);
    return ApiResponse.paginated(
      items,
      { page, limit, total, totalPages },
      'User member projects tasks fetched successfully',
    );
  }
}
