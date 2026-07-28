import { Controller, Get } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { ApiResponse } from '../../common/dto';

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  async getAll() {
    const permissions = await this.permissionService.getAll()
    return ApiResponse.ok(permissions, 'Permission fetched successfully')
  }
}
