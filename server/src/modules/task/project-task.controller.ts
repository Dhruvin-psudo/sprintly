import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { IAuthenticatedUser } from '../../common/interfaces';
import { ApiResponse } from '../../common/dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '../../common/constants';

@Controller('project/:projectId/task')
export class ProjectTaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @RequirePermissions(Permission.TASK_CREATE)
  async createTask(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: IAuthenticatedUser,
  ) {
    const task = await this.taskService.createTask(projectId, dto, user);
    return ApiResponse.ok(task, 'Task created successfully');
  }

  @Get()
  @RequirePermissions(Permission.TASK_READ)
  async getProjectTasks(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() query: TaskQueryDto,
    @CurrentUser() user: IAuthenticatedUser,
  ) {
    const { items, total, page, limit, totalPages } = await this.taskService.getProjectTasks(projectId, user, query);
    return ApiResponse.paginated(
      items,
      { page, limit, total, totalPages },
      'Project tasks fetched successfully',
    );
  }

  @Get(':id')
  @RequirePermissions(Permission.TASK_READ)
  async getTaskById(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: IAuthenticatedUser,
  ) {
    const task = await this.taskService.getTaskById(projectId, id, user);
    return ApiResponse.ok(task, 'Task details fetched successfully');
  }

  @Patch(':id')
  @RequirePermissions(Permission.TASK_UPDATE)
  async updateTask(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: IAuthenticatedUser,
  ) {
    const updatedTask = await this.taskService.updateTask(projectId, id, dto, user);
    return ApiResponse.ok(updatedTask, 'Task updated successfully');
  }

  @Delete(':id')
  @RequirePermissions(Permission.TASK_DELETE)
  async deleteTask(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: IAuthenticatedUser,
  ) {
    await this.taskService.deleteTask(projectId, id, user);
    return ApiResponse.ok(null, 'Task deleted successfully');
  }
}
