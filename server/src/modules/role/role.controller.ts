import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { IAuthenticatedUser } from '../../common/interfaces';
import { ApiResponse } from '../../common/dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '../../common/constants';
import { RoleQueryDto } from './dto/role-query.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RemoveMemberDto } from './dto/remove-member.dto';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @RequirePermissions(Permission.ROLE_CREATE)
  async createRole(
    @Body() dto: CreateRoleDto,
    @CurrentUser() createdby: IAuthenticatedUser,
  ) {
    const role = await this.roleService.createRole(dto, createdby)
    return ApiResponse.ok(role, 'Role created successfully')
  }

  @Get()
  @RequirePermissions(Permission.ROLE_READ)
  async getRoles(@Query() query: RoleQueryDto , @CurrentUser() user: IAuthenticatedUser) {
    const roles = await this.roleService.getRoles(user.organizationId, query);
    return ApiResponse.ok(roles, 'Roles fetched successfully')
  }

  @Get('permissions/me')
  async getMyPermissions(@CurrentUser() user: IAuthenticatedUser) {
    const permissions = await this.roleService.getMyPermissions(
      user.organizationId,
      user.userId
    );
    return ApiResponse.ok({permissions}, 'Permissions fetched successfully')
  }

  @Get(':id')
  @RequirePermissions(Permission.ROLE_READ)
  async getRoleById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('organizationId') orgId: string) {
    const role = await this.roleService.getRoleById(id, orgId);
    return ApiResponse.ok(role, 'Role fetched successfully')
  }

  @Get(':id/members')
  @RequirePermissions(Permission.MEMBER_READ, Permission.ROLE_READ)
  async getRoleMembers(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('organizationId') orgId: string,
  ) {
    const members = await this.roleService.getActiveMembersOfRole(id, orgId);
    return ApiResponse.ok(members, 'Role members fetched successfully')
  }

  @Patch('assign')
  @RequirePermissions(Permission.MEMBER_UPDATE, Permission.ROLE_UPDATE)
  async assign(@Body() dto: AssignRoleDto, @CurrentUser() assignedBy: IAuthenticatedUser) {
    await this.roleService.updateMemberRole(dto.userId, dto.roleId, assignedBy)
    return ApiResponse.ok(null, 'Role assigned successfully')
  }

  @Patch(':id')
  @RequirePermissions(Permission.ROLE_UPDATE)
  async updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() updatedBy: IAuthenticatedUser
  ) {
    const updatedRole = await this.roleService.updateRole(id, dto, updatedBy);
    return ApiResponse.ok(updatedRole, 'Role updated successfully');
  }

  @Delete('member')
  @RequirePermissions(Permission.MEMBER_REMOVE)
  async removeMember(@Body() dto : RemoveMemberDto, @CurrentUser() removedBy: IAuthenticatedUser) {
    await this.roleService.removeMember(dto.userId, removedBy)
    return ApiResponse.ok(null, 'Member removed successfully')
  }

  @Delete(':id')
  @RequirePermissions(Permission.ROLE_DELETE)
  async deleteRole(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() requestedBy: IAuthenticatedUser
  ) {
    await this.roleService.deleteRole(id, requestedBy);
    return ApiResponse.ok(null, 'Role deleted successfully');
  }
}
