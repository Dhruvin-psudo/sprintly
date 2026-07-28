import { Body, Controller, Delete, Get, Patch, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ChangePasswordDto } from '../auth/dto/change-password.dto';
import { ApiResponse } from '../../common/dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '../../common/constants';
import { UserQueryDto } from './dto/user-query.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getMe(
    @CurrentUser('userId') userId: string,
    @CurrentUser('organizationId') organizationId: string
  ) {
    const user = await this.userService.getMe(userId, organizationId);
    return ApiResponse.ok(user, 'User fetched successfully');
  }

  @Get('all')
  @RequirePermissions(Permission.MEMBER_READ)
  async getAll(
    @Query() query: UserQueryDto,
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('roleId') callerId: string
  ) {
    const result = await this.userService.getOrganizationUsers(
      organizationId,
      callerId,
      query
    );
    return ApiResponse.paginated(result.data, result.meta, 'Users fetched successfully')
  }

  @Patch('password')
  async changePassword(
    @CurrentUser('userId') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.userService.changePassword(userId, changePasswordDto);

    return ApiResponse.ok(null, 'Password changed successfully');
  }

  @Delete()
  async remove(@CurrentUser('userId') userId: string) {
    await this.userService.remove(userId)
    return ApiResponse.ok(null, 'User deleted successfully')
  }
}
