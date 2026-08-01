import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto, UpdateProjectDto, ProjectQueryDto, AssignProjectMemberDto } from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { IAuthenticatedUser } from '../../common/interfaces';
import { ApiResponse } from '../../common/dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '../../common/constants';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @RequirePermissions(Permission.PROJECT_CREATE)
  async createProject(
    @Body() dto: CreateProjectDto,
    @CurrentUser() user: IAuthenticatedUser,
  ) {
    const project = await this.projectService.createProject(dto, user);
    return ApiResponse.ok(project, 'Project created successfully');
  }

  @Get()
  @RequirePermissions(Permission.PROJECT_READ)
  async getProjects(
    @Query() query: ProjectQueryDto,
    @CurrentUser() user: IAuthenticatedUser,
  ) {
    const projects = await this.projectService.getProjects(user, query);
    return ApiResponse.ok(projects, 'Projects fetched successfully');
  }

  @Get(':id')
  @RequirePermissions(Permission.PROJECT_READ)
  async getProjectById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: IAuthenticatedUser,
  ) {
    const project = await this.projectService.getProjectById(id, user);
    return ApiResponse.ok(project, 'Project details fetched successfully');
  }

  @Patch(':id')
  @RequirePermissions(Permission.PROJECT_UPDATE)
  async updateProject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser() user: IAuthenticatedUser,
  ) {
    const updatedProject = await this.projectService.updateProject(id, dto, user);
    return ApiResponse.ok(updatedProject, 'Project updated successfully');
  }

  @Delete(':id')
  @RequirePermissions(Permission.PROJECT_DELETE)
  async deleteProject(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: IAuthenticatedUser,
  ) {
    await this.projectService.deleteProject(id, user);
    return ApiResponse.ok(null, 'Project deleted successfully');
  }

  @Post(':id/members')
  @RequirePermissions(Permission.PROJECT_UPDATE)
  async addMembers(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignProjectMemberDto,
    @CurrentUser() user: IAuthenticatedUser,
  ) {
    const updatedProject = await this.projectService.addMembers(id, dto, user);
    return ApiResponse.ok(updatedProject, 'Project members added successfully');
  }

  @Delete(':id/members/:userId')
  @RequirePermissions(Permission.PROJECT_UPDATE)
  async removeMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) targetUserId: string,
    @CurrentUser() user: IAuthenticatedUser,
  ) {
    const updatedProject = await this.projectService.removeMember(id, targetUserId, user);
    return ApiResponse.ok(updatedProject, 'Project member removed successfully');
  }
}
